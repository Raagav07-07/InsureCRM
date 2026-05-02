from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.sessions import SessionLocal
from core.security import get_current_user
from services.reminder_service import (
    generate_reminders,
    clear_pending_reminders_for_policy,
)
from db.models import Reminder, Policy, Client
from datetime import date

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/reminders")
def create_reminder(
    reminder_data: dict, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    reminder = Reminder(
        user_id=user["id"],
        message=reminder_data.get("message"),
        type="manual",
        reminder_date=reminder_data.get("date"),
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return reminder


@router.post("/reminders/generate")
def generate(db: Session = Depends(get_db), user=Depends(get_current_user)):
    count = generate_reminders(db, user["id"])
    return {"created": count}


@router.get("/reminders")
def get_reminders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    generate_reminders(db, user["id"])

    rows = (
        db.query(Reminder, Client, Policy)
        .join(Client, Reminder.client_id == Client.id, isouter=True)
        .join(Policy, Reminder.policy_id == Policy.id, isouter=True)
        .filter(
            Reminder.user_id == user["id"],
            Reminder.status == "pending",
        )
        .order_by(Reminder.reminder_date.asc())
        .all()
    )

    today = date.today()
    result = []
    for reminder, client, policy in rows:
        days = (reminder.reminder_date - today).days if reminder.reminder_date else None
        result.append(
            {
                "id": reminder.id,
                "type": reminder.type,
                "commission_info": reminder.message,
                "reminder_date": reminder.reminder_date,
                "days_left": days,
                "client_name": client.name if client else "Unknown",
                "client_phone": client.phone if client else "-",
                "client_email": client.email if client else "-",
                "policy_number": policy.policy_number if policy else "-",
                "insurer_name": policy.insurer_name if policy else "-",
                "policy_type": policy.policy_type if policy else "-",
                "premium_amount": float(policy.premium_amount)
                if policy and policy.premium_amount
                else 0,
                "frequency": policy.frequency if policy else "-",
                "next_due_date": policy.next_due_date if policy else None,
                "status": policy.status if policy else "-",
            }
        )

    return result


@router.post("/reminders/{reminder_id}/dismiss")
def dismiss_reminder(
    reminder_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user["id"])
        .first()
    )
    if not reminder:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Reminder not found")

    reminder.status = "dismissed"
    db.commit()
    return {"message": "Reminder dismissed"}
