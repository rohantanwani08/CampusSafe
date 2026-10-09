from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from ..db import get_db, Contact, Alert, AlertRecipient, Event, SmsSimLog, engine, Base
import random
import time

router = APIRouter(prefix="/demo", tags=["Demo Tools"])

@router.post("/reset")
def reset_demo(db: Session = Depends(get_db)):
    """Wipes all alerts, events, and logs. Reseeds exactly 5 contacts."""
    # Delete all transactional data
    db.query(Alert).delete()
    db.query(AlertRecipient).delete()
    db.query(Event).delete()
    db.query(SmsSimLog).delete()
    
    # Reset contacts to baseline 5
    db.query(Contact).delete()
    contacts = [
        Contact(id=1, name="John Doe", telegram_chat_id="111111111", building="Library"),
        Contact(id=2, name="Jane Smith", telegram_chat_id="222222222", building="Science Block", backup_contact_id=1),
        Contact(id=3, name="Michael Chen", telegram_chat_id="333333333", building="Dorms"),
        Contact(id=4, name="Sarah Jones", telegram_chat_id="444444444", building="Library"),
        Contact(id=5, name="David Kim", telegram_chat_id="555555555", building="Arts Center", backup_contact_id=3),
    ]
    for c in contacts:
        db.add(c)
        
    db.commit()
    return {"status": "success", "message": "Demo reset to clean state."}

def simulate_crowd_task(alert_id: int, db: Session):
    """Background task to simulate 40 people responding over 30 seconds"""
    # 1. Insert 40 dummy contacts and attach them to the alert
    buildings = ["Library", "Science Block", "Dorms", "Arts Center", "Student Union"]
    first_names = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Quinn"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
    
    new_recipients = []
    for i in range(100, 140): # IDs 100-139
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        building = random.choice(buildings)
        
        c = Contact(id=i, name=name, telegram_chat_id=f"fake_{i}", building=building)
        db.add(c)
        db.commit()
        
        r = AlertRecipient(
            alert_id=alert_id,
            contact_id=i,
            status="PENDING",
            urgency="LOW"
        )
        db.add(r)
        db.commit()
        new_recipients.append(r)
        
    # 2. Randomly resolve them over 30 seconds to make the dashboard look alive
    for r in new_recipients:
        time.sleep(random.uniform(0.1, 1.5)) # staggered delays
        
        # 70% Safe, 10% Need Assistance, 20% Unreachable
        outcome = random.random()
        if outcome < 0.70:
            r.status = "SAFE"
            r.urgency = "LOW"
            r.response_summary = "Responded via SMS: I am safe."
            r.resolved_via = "telegram"
        elif outcome < 0.80:
            r.status = "NEED_ASSISTANCE"
            r.urgency = "HIGH"
            r.people_hurt = random.choice([0, 1, 2])
            r.response_summary = "AI Voice Analysis: Trapped, needs help."
            r.resolved_via = "call"
            r.location = f"{random.choice(buildings)}, 2nd Floor"
        else:
            r.status = "UNREACHABLE"
            r.urgency = "HIGH"
            r.step = 5
            
        # Log event
        db.add(Event(
            alert_id=alert_id,
            contact_id=r.contact_id,
            type="SIMULATED_RESPONSE",
            payload={"status": r.status}
        ))
        db.commit()

@router.post("/simulate")
def simulate_crowd(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Creates a simulated alert and triggers 40 rapid dummy responses."""
    # Create dummy alert
    alert = Alert(
        mode="drill",
        message="[SIMULATED CROWD] This is a load test.",
        target_group="all"
    )
    db.add(alert)
    db.commit()
    
    # Run simulation in background
    background_tasks.add_task(simulate_crowd_task, alert.id, db)
    
    return {"status": "success", "message": "Simulation started. Watch the dashboard!"}
