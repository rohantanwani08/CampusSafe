import os
from sqlalchemy.orm import Session
from backend.db import SessionLocal, Contact, Alert, AlertRecipient, Event, engine, Base

def seed_db():
    print("Clearing old data...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    print("Seeding contacts...")
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
    print("Database seeded successfully with 5 test contacts!")
    db.close()

if __name__ == "__main__":
    seed_db()
