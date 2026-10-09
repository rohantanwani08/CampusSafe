from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db import get_db, Alert, AlertRecipient, Contact, Event, SmsSimLog

router = APIRouter(prefix="/state", tags=["State"])

@router.get("/")
def get_dashboard_state(db: Session = Depends(get_db)):
    # 1. Get the most recent active alert
    alert = db.query(Alert).order_by(desc(Alert.id)).first()
    if not alert:
        return {"alert": None}

    # 2. Get all recipients for this alert, joined with Contact info
    recipients_query = db.query(AlertRecipient, Contact).join(
        Contact, AlertRecipient.contact_id == Contact.id
    ).filter(AlertRecipient.alert_id == alert.id).all()

    counters = {
        "SAFE": 0,
        "NEED_ASSISTANCE": 0,
        "UNREACHABLE": 0,
        "PENDING": 0,
        "CONTACTED": 0,
        "UNCLEAR": 0
    }
    
    priority_queue = []
    all_recipients = []

    for rec, contact in recipients_query:
        counters[rec.status] = counters.get(rec.status, 0) + 1
        
        recipient_data = {
            "id": rec.id,
            "contact_id": contact.id,
            "name": contact.name,
            "building": contact.building,
            "status": rec.status,
            "urgency": rec.urgency,
            "location": rec.location,
            "people_hurt": rec.people_hurt,
            "summary": rec.response_summary,
            "responded_at": rec.responded_at,
            "resolved_via": rec.resolved_via
        }
        all_recipients.append(recipient_data)

        if rec.status == "NEED_ASSISTANCE":
            priority_queue.append(recipient_data)

    # Sort priority queue: HIGH urgency first
    urgency_map = {"HIGH": 3, "MEDIUM": 2, "LOW": 1, None: 0}
    priority_queue.sort(key=lambda x: urgency_map.get(x["urgency"], 0), reverse=True)

    # 3. Get recent events for the timeline
    events = db.query(Event).filter(Event.alert_id == alert.id).order_by(desc(Event.created_at)).limit(50).all()
    events_data = [{
        "id": e.id,
        "contact_id": e.contact_id,
        "type": e.type,
        "channel": e.channel,
        "payload": e.payload,
        "created_at": e.created_at
    } for e in events]

    # 4. Get recent SMS logs
    sms_logs = db.query(SmsSimLog, Contact).join(
        Contact, SmsSimLog.contact_id == Contact.id
    ).filter(SmsSimLog.alert_id == alert.id).order_by(desc(SmsSimLog.created_at)).limit(50).all()
    
    sms_data = [{
        "id": s.id,
        "contact_id": s.contact_id,
        "name": c.name,
        "step": s.step,
        "channel": s.channel,
        "text": s.text,
        "created_at": s.created_at
    } for s, c in sms_logs]

    return {
        "alert": {
            "id": alert.id,
            "mode": alert.mode,
            "message": alert.message,
            "status": alert.status,
            "created_at": alert.created_at
        },
        "counters": counters,
        "priority_queue": priority_queue,
        "recipients": all_recipients,
        "events": events_data,
        "sms_log": sms_data
    }
