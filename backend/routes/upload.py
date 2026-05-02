from fastapi import APIRouter, UploadFile, Depends
from sqlalchemy.orm import Session
import pandas as pd
from io import BytesIO

from db.sessions import SessionLocal
from core.security import get_current_user
from db.models import Client, Policy, PremiumHistory

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_file(
    file: UploadFile,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    contents = await file.read()

    # detect file type
    if file.filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(contents))
    else:
        df = pd.read_excel(BytesIO(contents))

    print("COLUMNS:", df.columns)

    return process_dataframe(df, db, user["id"])

from datetime import timedelta

def calculate_next_due(start_date, frequency):
    if frequency == "monthly":
        return start_date + timedelta(days=30)
    return start_date + timedelta(days=365)


def process_dataframe(df, db, user_id):
    created = 0

    for _, row in df.iterrows():

        # 🔹 Step 1: find or create client
        client = db.query(Client).filter(
            Client.phone == str(row["phone"]),
            Client.user_id == user_id
        ).first()

        if not client:
            client = Client(
                user_id=user_id,
                name=row["name"],
                phone=str(row["phone"]),
                email=row.get("email", "")
            )
            db.add(client)
            db.flush()  # get id without commit

        # 🔹 Step 2: create policy
        next_due = calculate_next_due(row["start_date"], row["frequency"])

        policy = Policy(
            user_id=user_id,
            client_id=client.id,
            insurer_name=row["insurer"],
            policy_type=row["type"],
            premium_amount=row["premium"],
            frequency=row["frequency"],
            start_date=row["start_date"],
            next_due_date=next_due,
            status="active"
        )

        db.add(policy)
        db.flush()

        # 🔹 Step 3: premium history
        history = PremiumHistory(
            user_id=user_id,
            policy_id=policy.id,
            premium_amount=row["premium"]
        )

        db.add(history)

        created += 1

    db.commit()

    return {
        "message": "Import successful",
        "records_created": created
    }
