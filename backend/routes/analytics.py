from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.sessions import SessionLocal
from core.security import get_current_user
from services.analytics_service import (
    agent_revenue_trend,
    commission_projection,
    commission_trend,
    get_overview,
    monthly_revenue,
    revenue_by_insurer,
)

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/analytics/overview")
def overview(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_overview(db, user["id"])


@router.get("/analytics/monthly")
def monthly(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return monthly_revenue(db, user["id"])


@router.get("/analytics/insurer")
def insurer(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return revenue_by_insurer(db, user["id"])


@router.get("/analytics/commission")
def commission(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return commission_projection(db, user["id"])


@router.get("/analytics/commission-trend")
def commission_monthly(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return commission_trend(db, user["id"])


@router.get("/analytics/agent-revenue")
def agent_revenue(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return agent_revenue_trend(db, user["id"])
