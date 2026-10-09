from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..db import get_db, AlertRecipient
from ..security import verify_webhook_secret
from ..schemas import WebhookResponse

router = APIRouter(prefix="/recipients", tags=["Recipients"])

@router.post("/update")
def update_recipient(
    payload: WebhookResponse, 
    db: Session = Depends(get_db), 
    secret: str = Depends(verify_webhook_secret)
):
    recipient = db.query(AlertRecipient).filter(AlertRecipient.id == payload.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    recipient.status = payload.status
    if payload.location:
        recipient.location = payload.location
    if payload.people_hurt > 0:
        recipient.people_hurt = payload.people_hurt
    if payload.urgency:
        recipient.urgency = payload.urgency
    if payload.summary:
        recipient.response_summary = payload.summary
    if payload.confidence:
        recipient.confidence = payload.confidence
    
    recipient.resolved_via = payload.channel
    recipient.responded_at = datetime.utcnow()
    
    db.commit()
    db.refresh(recipient)
    return {"status": "success", "recipient_id": recipient.id, "new_status": recipient.status}
