from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.sessions import SessionLocal
from schemas.clients import ClientCreate
from db.models import Client
from core.security import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/clients")
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    new_client = Client(
        user_id=user["id"],
        name=client.name,
        phone=client.phone,
        email=client.email,
        notes=client.notes
    )

    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    return new_client


@router.get("/clients")
def get_clients(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Client).filter(Client.user_id == user["id"]).all()