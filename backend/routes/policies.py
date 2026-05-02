from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.sessions import SessionLocal
from schemas.policy import PolicyCreate, PolicyPaymentCreate
from db.models import Client, Policy, PremiumHistory
from core.security import get_current_user
from services.reminder_service import clear_pending_reminders_for_policy
from datetime import date, timedelta

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def calculate_next_due(start_date, frequency):
    if frequency == "monthly":
        return start_date + timedelta(days=30)
    elif frequency == "yearly":
        return start_date + timedelta(days=365)
    return start_date


def next_cycle_due(current_due, frequency):
    if not current_due:
        return None
    if frequency == "monthly":
        return current_due + timedelta(days=30)
    if frequency == "yearly":
        return current_due + timedelta(days=365)
    return current_due


def calculate_status(next_due_date, end_date, today):
    if end_date and today > end_date:
        return "expired"

    if next_due_date and next_due_date < today:
        return "lapsed"

    return "active"


@router.post("/policies")
def create_policy(
    policy: PolicyCreate, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    user_id = user["id"]

    client = (
        db.query(Client)
        .filter(Client.id == policy.client_id, Client.user_id == user_id)
        .first()
    )

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if policy.end_date and policy.end_date < policy.start_date:
        raise HTTPException(
            status_code=400, detail="end_date cannot be before start_date"
        )

    next_due = calculate_next_due(policy.start_date, policy.frequency)
    initial_status = calculate_status(next_due, policy.end_date, date.today())

    new_policy = Policy(
        user_id=user_id,
        client_id=policy.client_id,
        policy_number=policy.policy_number,
        insurer_name=policy.insurer_name,
        policy_type=policy.policy_type,
        premium_amount=policy.premium_amount,
        frequency=policy.frequency,
        start_date=policy.start_date,
        next_due_date=next_due,
        end_date=policy.end_date,
        status=initial_status,
    )

    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)

    return new_policy


@router.get("/policies")
def get_policies(db: Session = Depends(get_db), user=Depends(get_current_user)):
    policies = db.query(Policy).filter(Policy.user_id == user["id"]).all()
    today = date.today()
    updated = False

    for policy in policies:
        computed_status = calculate_status(policy.next_due_date, policy.end_date, today)
        if policy.status != computed_status:
            policy.status = computed_status
            updated = True

    if updated:
        db.commit()

    return policies


@router.post("/policies/{policy_id}/pay")
def mark_policy_paid(
    policy_id: str,
    payment: PolicyPaymentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    policy = (
        db.query(Policy)
        .filter(Policy.id == policy_id, Policy.user_id == user["id"])
        .first()
    )

    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    paid_on = payment.paid_on or date.today()
    amount = (
        payment.amount
        if payment.amount is not None
        else float(policy.premium_amount or 0)
    )

    history = PremiumHistory(
        user_id=user["id"],
        policy_id=policy.id,
        premium_amount=amount,
        effective_date=paid_on,
    )
    db.add(history)

    current_due = policy.next_due_date or policy.start_date
    policy.next_due_date = next_cycle_due(current_due, policy.frequency)
    policy.status = calculate_status(
        policy.next_due_date, policy.end_date, date.today()
    )

    clear_pending_reminders_for_policy(db, user["id"], policy.id)

    db.commit()
    db.refresh(policy)

    return {
        "message": "Payment recorded",
        "policy_id": str(policy.id),
        "next_due_date": policy.next_due_date,
        "status": policy.status,
    }
