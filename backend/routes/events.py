from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..security import verify_webhook_secret

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/")
def log_event(db: Session = Depends(get_db), secret: str = Depends(verify_webhook_secret)):
    return {"status": "log event placeholder"}
