from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db, SmsSimLog
from ..security import verify_webhook_secret
from ..schemas import SmsLogCreate

router = APIRouter(prefix="/sms-log", tags=["SMS Log"])

@router.post("/")
def log_sms(
    payload: SmsLogCreate, 
    db: Session = Depends(get_db), 
    secret: str = Depends(verify_webhook_secret)
):
    existing = db.query(SmsSimLog).filter(
        SmsSimLog.alert_id == payload.alert_id,
        SmsSimLog.contact_id == payload.contact_id,
        SmsSimLog.step == payload.step,
        SmsSimLog.channel == payload.channel
    ).first()

    if existing:
        return {"status": "success", "message": "Already logged"}

    new_log = SmsSimLog(
        alert_id=payload.alert_id,
        contact_id=payload.contact_id,
        step=payload.step,
        channel=payload.channel,
        text=payload.text
    )
    db.add(new_log)
    db.commit()
    return {"status": "success"}
