from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db, Event, AlertRecipient
from ..schemas import CallEvent

router = APIRouter(prefix="/call-event", tags=["Call"])

@router.post("/")
def log_call_event(payload: CallEvent, db: Session = Depends(get_db)):
    # Find the latest recipient record to get the current alert_id
    recipient = db.query(AlertRecipient).filter(AlertRecipient.contact_id == payload.recipient_id).order_by(AlertRecipient.id.desc()).first()
    
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found for active alert")

    # Log the event
    event = Event(
        alert_id=recipient.alert_id,
        contact_id=payload.recipient_id,
        type=f"CALL_{payload.event.upper()}", # CALL_ANSWERED or CALL_DECLINED
        channel="web_call"
    )
    db.add(event)
    db.commit()
    return {"status": "success"}
