from pydantic import BaseModel
from datetime import date


class PolicyCreate(BaseModel):
    client_id: str
    policy_number: str | None = None
    insurer_name: str
    policy_type: str
    premium_amount: float
    frequency: str
    start_date: date
    end_date: date | None = None


class PolicyPaymentCreate(BaseModel):
    paid_on: date | None = None
    amount: float | None = None
