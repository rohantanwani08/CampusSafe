from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..db import get_db, Alert, Contact, AlertRecipient
from ..security import verify_admin_token
from ..schemas import AlertCreate
from datetime import datetime
import httpx
import os

router = APIRouter(prefix="/alerts", tags=["Alerts"])

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/alert")

def fire_n8n_webhook(alert_id: int, mode: str):
    try:
        with httpx.Client() as client:
            client.post(N8N_WEBHOOK_URL, json={"alert_id": alert_id, "mode": mode})
    except Exception as e:
        print(f"Failed to trigger n8n: {e}")

@router.post("/")
def trigger_alert(
    payload: AlertCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    token: str = Depends(verify_admin_token)
):
    # 1. Create the alert
    new_alert = Alert(
        mode=payload.mode,
        message=payload.message,
        target_group=payload.target_group
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    # 2. Find target contacts
    if payload.target_group == "all":
        contacts = db.query(Contact).all()
    elif payload.target_group.startswith("building:"):
        bldg = payload.target_group.split(":")[1]
        contacts = db.query(Contact).filter(Contact.building == bldg).all()
    else:
        contacts = db.query(Contact).all()
    
    if not contacts:
        raise HTTPException(status_code=400, detail="No contacts found for target group")

    # 3. Create recipients
    for c in contacts:
        recipient = AlertRecipient(
            alert_id=new_alert.id,
            contact_id=c.id,
            status="PENDING"
        )
        db.add(recipient)
    db.commit()

    # 4. Trigger n8n in background
    background_tasks.add_task(fire_n8n_webhook, new_alert.id, new_alert.mode)

    return {"status": "success", "alert_id": new_alert.id, "recipients_count": len(contacts)}

@router.get("/{alert_id}")
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"id": alert.id, "mode": alert.mode, "status": alert.status}

@router.post("/{alert_id}/end")
def end_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.ended_at = datetime.utcnow()
    alert.status = "ENDED"
    db.commit()
    return {"status": "success", "alert_id": alert.id, "ended_at": alert.ended_at}
