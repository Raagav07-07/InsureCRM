from datetime import date, timedelta
from db.models import Policy, Reminder, Client


def _cycle_number(policy):
    """Count how many payment cycles have elapsed up to next_due_date."""
    cycle = 0
    current = policy.start_date
    while current and current < policy.next_due_date:
        cycle += 1
        if policy.frequency == "monthly":
            current = current + timedelta(days=30)
        elif policy.frequency == "yearly":
            current = current + timedelta(days=365)
        else:
            break
    return cycle


def _commission_label(policy, cycle):
    insurer = (policy.insurer_name or "").lower()
    if "lic" in insurer:
        if cycle <= 1:
            return "LIC Year 1: 20\u201335%"
        elif cycle <= 3:
            return "LIC Year 2\u20133: 7.5%"
        else:
            return "LIC Year 4+: 5%"
    elif "star" in insurer:
        return "Star Health: ~15% (up to 45%)"
    else:
        return "Estimated: ~10%"


def generate_reminders(db, user_id):
    policies = (
        db.query(Policy, Client)
        .join(Client, Policy.client_id == Client.id)
        .filter(Policy.user_id == user_id)
        .all()
    )

    created = 0
    today = date.today()
    window = 30

    for policy, client in policies:
        if not policy.next_due_date:
            continue
        days_left = (policy.next_due_date - today).days
        cycle = _cycle_number(policy)
        commission = _commission_label(policy, cycle)

        # --- UPCOMING ---
        if 0 <= days_left <= window:
            exists = (
                db.query(Reminder)
                .filter(
                    Reminder.user_id == user_id,
                    Reminder.policy_id == policy.id,
                    Reminder.type == "renewal",
                    Reminder.reminder_date == policy.next_due_date,
                )
                .first()
            )
            if not exists:
                reminder = Reminder(
                    user_id=user_id,
                    policy_id=policy.id,
                    client_id=policy.client_id,
                    type="renewal",
                    message=commission,
                    reminder_date=policy.next_due_date,
                    status="pending",
                )
                db.add(reminder)
                created += 1

        # --- LAPSED ---
        if days_left < 0:
            exists = (
                db.query(Reminder)
                .filter(
                    Reminder.user_id == user_id,
                    Reminder.policy_id == policy.id,
                    Reminder.type == "lapse",
                    Reminder.reminder_date == policy.next_due_date,
                )
                .first()
            )
            if not exists:
                reminder = Reminder(
                    user_id=user_id,
                    policy_id=policy.id,
                    client_id=policy.client_id,
                    type="lapse",
                    message=commission,
                    reminder_date=policy.next_due_date,
                    status="pending",
                )
                db.add(reminder)
                created += 1

    db.commit()
    return created


def clear_pending_reminders_for_policy(db, user_id, policy_id):
    updated = (
        db.query(Reminder)
        .filter(
            Reminder.user_id == user_id,
            Reminder.policy_id == policy_id,
            Reminder.type.in_(["renewal", "lapse"]),
            Reminder.status == "pending",
        )
        .update({"status": "dismissed"}, synchronize_session="fetch")
    )
    db.commit()
    return updated
