from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..db import get_db, Event
from ..security import verify_webhook_secret

router = APIRouter(prefix="/events", tags=["Events"])

class EventCreate(BaseModel):
    alert_id: int
    contact_id: int
    type: str
    channel: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

@router.post("/")
def log_event(
    payload: EventCreate, 
    db: Session = Depends(get_db), 
    secret: str = Depends(verify_webhook_secret)
):
    event = Event(
        alert_id=payload.alert_id,
        contact_id=payload.contact_id,
        type=payload.type,
        channel=payload.channel,
        payload=payload.payload
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"status": "success", "event_id": event.id}
