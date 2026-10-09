from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, JSON, Float
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from .config import settings

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} # Required for SQLite with FastAPI
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    telegram_chat_id = Column(String, index=True)
    backup_contact_id = Column(Integer, nullable=True) # Points to another contact
    building = Column(String)
    language = Column(String, default="English")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String) # 'drill' or 'real'
    message = Column(String)
    target_group = Column(String) # 'all', 'building:X', 'list'
    created_by = Column(String, default="admin")
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="ACTIVE")

class AlertRecipient(Base):
    __tablename__ = "alert_recipients"
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, index=True)
    contact_id = Column(Integer, index=True)
    status = Column(String, default="PENDING") # PENDING, CONTACTED, SAFE, NEED_ASSISTANCE, UNREACHABLE, UNCLEAR
    step = Column(Integer, default=0) # 0 to 5
    attempts = Column(Integer, default=0)
    last_contacted_at = Column(DateTime, nullable=True)
    response_summary = Column(String, nullable=True)
    location = Column(String, nullable=True)
    people_hurt = Column(Integer, default=0)
    urgency = Column(String, nullable=True) # LOW, MED, HIGH
    confidence = Column(Float, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    resolved_via = Column(String, nullable=True) # call, voice_note, button, backup

class Event(Base):
    """Audit log for the timeline dashboard"""
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, index=True)
    contact_id = Column(Integer, index=True)
    type = Column(String) # SENT, RETRY, CALL_LINK, BACKUP_NOTIFIED, RESPONSE, STATUS_CHANGE, ADMIN_ACTION
    channel = Column(String, nullable=True)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SmsSimLog(Base):
    __tablename__ = "sms_sim_log"
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, index=True)
    contact_id = Column(Integer, index=True)
    step = Column(Integer) # 1-5
    channel = Column(String) # "telegram" | "call_link"
    text = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
