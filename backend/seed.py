import json
import os
from sqlalchemy.orm import Session
from db import SessionLocal, Contact, init_db

def seed_data():
    # Ensure tables exist
    init_db()
    
    db = SessionLocal()
    try:
        # Check if we already have contacts
        if db.query(Contact).first():
            print("Database already seeded. Skipping.")
            return

        # Path to contacts.json
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(base_dir, "data", "contacts.json")

        with open(data_path, "r", encoding="utf-8") as f:
            contacts = json.load(f)

        for c_data in contacts:
            contact = Contact(
                id=c_data["id"],
                name=c_data["name"],
                telegram_chat_id=c_data["telegram_chat_id"],
                backup_contact_id=c_data["backup_contact_id"],
                building=c_data["building"],
                language=c_data.get("language", "English")
            )
            db.add(contact)
        
        db.commit()
        print(f"Successfully seeded {len(contacts)} contacts!")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
