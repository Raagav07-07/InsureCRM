from sqlalchemy.orm import Session
from db.models import Policy, PremiumHistory
from datetime import date


def compute_policy_status(policy, today):
    if policy.end_date and today > policy.end_date:
        return "expired"

    if policy.next_due_date and today > policy.next_due_date:
        return "lapsed"

    return "active"


def _policy_year(start_date, today):
    if not start_date:
        return 1

    years = today.year - start_date.year
    anniversary_not_reached = (today.month, today.day) < (
        start_date.month,
        start_date.day,
    )
    if anniversary_not_reached:
        years -= 1

    return max(1, years + 1)


def _policy_year_at(start_date, at_date):
    if not start_date or not at_date:
        return 1

    years = at_date.year - start_date.year
    anniversary_not_reached = (at_date.month, at_date.day) < (
        start_date.month,
        start_date.day,
    )
    if anniversary_not_reached:
        years -= 1

    return max(1, years + 1)


def _commission_rates(insurer_name, policy_year):
    insurer = (insurer_name or "").lower()

    if "lic" in insurer:
        if policy_year == 1:
            return {
                "base": 0.225,
                "min": 0.20,
                "max": 0.35,
                "note": "LIC first-year with potential bonus uplift",
            }
        if policy_year in [2, 3]:
            return {
                "base": 0.075,
                "min": 0.075,
                "max": 0.075,
                "note": "LIC renewal year 2-3",
            }
        return {"base": 0.05, "min": 0.05, "max": 0.05, "note": "LIC renewal year 4+"}

    if "star" in insurer and "health" in insurer:
        return {
            "base": 0.15,
            "min": 0.15,
            "max": 0.45,
            "note": "Star Health base to incentive range",
        }

    return {
        "base": 0.10,
        "min": 0.10,
        "max": 0.10,
        "note": "Default flat estimate",
    }


def get_overview(db: Session, user_id):
    policies = db.query(Policy).filter(Policy.user_id == user_id).all()
    today = date.today()

    total_premium = 0
    active = 0
    lapsed = 0

    for p in policies:
        total_premium += float(p.premium_amount or 0)
        current_status = compute_policy_status(p, today)

        if current_status == "active":
            active += 1
        elif current_status in ["lapsed", "expired"]:
            lapsed += 1

    return {
        "total_premium": total_premium,
        "active_policies": active,
        "lapsed_policies": lapsed,
    }


def monthly_revenue(db: Session, user_id):
    policies = db.query(Policy).filter(Policy.user_id == user_id).all()

    monthly_data = {}

    for p in policies:
        if not p.start_date:
            continue

        month = p.start_date.strftime("%Y-%m")

        monthly_data[month] = monthly_data.get(month, 0) + float(p.premium_amount or 0)

    return monthly_data


def revenue_by_insurer(db: Session, user_id):
    policies = db.query(Policy).filter(Policy.user_id == user_id).all()

    data = {}

    for p in policies:
        insurer = p.insurer_name or "Unknown"

        data[insurer] = data.get(insurer, 0) + float(p.premium_amount or 0)

    return data


def commission_projection(db: Session, user_id):
    policies = db.query(Policy).filter(Policy.user_id == user_id).all()
    today = date.today()

    base_total = 0.0
    potential_total = 0.0
    active_count = 0
    by_insurer = {}

    for policy in policies:
        status = compute_policy_status(policy, today)
        if status != "active":
            continue

        premium = float(policy.premium_amount or 0)
        year = _policy_year(policy.start_date, today)
        rates = _commission_rates(policy.insurer_name, year)

        base_commission = premium * rates["base"]
        potential_commission = premium * rates["max"]

        base_total += base_commission
        potential_total += potential_commission
        active_count += 1

        insurer_key = policy.insurer_name or "Unknown"
        if insurer_key not in by_insurer:
            by_insurer[insurer_key] = {
                "base_commission": 0.0,
                "potential_commission": 0.0,
                "policies": 0,
            }

        by_insurer[insurer_key]["base_commission"] += base_commission
        by_insurer[insurer_key]["potential_commission"] += potential_commission
        by_insurer[insurer_key]["policies"] += 1

    insurer_rows = []
    for insurer_name, values in by_insurer.items():
        insurer_rows.append(
            {
                "name": insurer_name,
                "base_commission": round(values["base_commission"], 2),
                "potential_commission": round(values["potential_commission"], 2),
                "policies": values["policies"],
            }
        )

    insurer_rows.sort(key=lambda row: row["base_commission"], reverse=True)

    return {
        "base_total": round(base_total, 2),
        "potential_total": round(potential_total, 2),
        "active_policies_count": active_count,
        "by_insurer": insurer_rows,
        "assumptions": {
            "lic": "Year1: 20-35%(incl. bonus potential), Year2-3: 7.5%, Year4+: 5%",
            "star_health": "Base 15%, potential up to 45% with incentives",
            "default": "Flat 10% for other insurers",
            "status_filter": "Only active policies included",
        },
    }


def commission_trend(db: Session, user_id):
    policies = db.query(Policy).filter(Policy.user_id == user_id).all()
    today = date.today()

    by_month = {}

    for policy in policies:
        status = compute_policy_status(policy, today)
        if status != "active":
            continue

        if not policy.start_date:
            continue

        key = policy.start_date.strftime("%Y-%m")
        year = _policy_year(policy.start_date, today)
        rates = _commission_rates(policy.insurer_name, year)
        premium = float(policy.premium_amount or 0)

        if key not in by_month:
            by_month[key] = {"base": 0.0, "potential": 0.0}

        by_month[key]["base"] += premium * rates["base"]
        by_month[key]["potential"] += premium * rates["max"]

    rows = []
    for month, values in sorted(by_month.items(), key=lambda item: item[0]):
        rows.append(
            {
                "month": month,
                "base": round(values["base"], 2),
                "potential": round(values["potential"], 2),
            }
        )

    return rows


def agent_revenue_trend(db: Session, user_id):
    projected_rows = commission_trend(db, user_id)
    projected_by_month = {
        row["month"]: {
            "projected": float(row["base"]),
            "potential": float(row["potential"]),
            "collected": 0.0,
        }
        for row in projected_rows
    }

    policies = db.query(Policy).filter(Policy.user_id == user_id).all()
    policy_map = {str(policy.id): policy for policy in policies}

    payments = db.query(PremiumHistory).filter(PremiumHistory.user_id == user_id).all()

    valid_payment_dates = [
        payment.effective_date
        for payment in payments
        if payment.effective_date is not None
    ]
    latest_payment_date = max(valid_payment_dates) if valid_payment_dates else None
    latest_month_key = (
        latest_payment_date.strftime("%Y-%m") if latest_payment_date else None
    )

    current_month_key = date.today().strftime("%Y-%m")
    collected_lifetime = 0.0
    collected_current_month = 0.0
    valid_payments_count = 0

    for payment in payments:
        payment_date = payment.effective_date
        if not payment_date:
            continue

        policy = policy_map.get(str(payment.policy_id))
        if not policy:
            continue

        month_key = payment_date.strftime("%Y-%m")
        year = _policy_year_at(policy.start_date, payment_date)
        rates = _commission_rates(policy.insurer_name, year)
        paid_amount = float(payment.premium_amount or 0)
        collected_commission = paid_amount * rates["base"]
        collected_lifetime += collected_commission
        valid_payments_count += 1

        if month_key not in projected_by_month:
            projected_by_month[month_key] = {
                "projected": 0.0,
                "potential": 0.0,
                "collected": 0.0,
            }

        projected_by_month[month_key]["collected"] += collected_commission

        if month_key == current_month_key:
            collected_current_month += collected_commission

    if collected_current_month == 0.0 and latest_month_key:
        collected_current_month = round(
            projected_by_month.get(latest_month_key, {}).get("collected", 0.0), 2
        )

    rows = []
    for month, values in sorted(projected_by_month.items(), key=lambda item: item[0]):
        rows.append(
            {
                "month": month,
                "projected": round(values["projected"], 2),
                "collected": round(values["collected"], 2),
                "potential": round(values["potential"], 2),
            }
        )

    totals = {
        "projected": round(sum(row["projected"] for row in rows), 2),
        "collected": round(sum(row["collected"] for row in rows), 2),
        "collected_current_month": round(collected_current_month, 2),
        "collected_lifetime": round(collected_lifetime, 2),
        "potential": round(sum(row["potential"] for row in rows), 2),
        "payments_count": valid_payments_count,
    }

    return {"trend": rows, "totals": totals}
