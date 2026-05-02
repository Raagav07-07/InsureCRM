from sqlalchemy import Column, String, Text, Date, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True))
    name = Column(Text)
    phone = Column(Text)
    email = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Policy(Base):
    __tablename__ = "policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True))
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"))
    policy_number = Column(Text, nullable=True)
    insurer_name = Column(Text)
    policy_type = Column(Text)
    premium_amount = Column(Numeric)
    frequency = Column(Text)
    start_date = Column(Date)
    next_due_date = Column(Date)
    end_date = Column(Date, nullable=True)
    status = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class PremiumHistory(Base):
    __tablename__ = "premium_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True))
    policy_id = Column(UUID(as_uuid=True), ForeignKey("policies.id"))
    premium_amount = Column(Numeric)
    effective_date = Column(Date, default=datetime.utcnow)


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    client_id = Column(UUID(as_uuid=True), nullable=True)
    policy_id = Column(UUID(as_uuid=True), nullable=True)

    type = Column(Text)  # renewal / lapse / manual
    message = Column(Text)

    reminder_date = Column(Date)
    status = Column(Text, default="pending")

    created_at = Column(DateTime, default=datetime.utcnow)
