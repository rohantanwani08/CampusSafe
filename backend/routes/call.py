from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db

router = APIRouter(prefix="/call-event", tags=["Call"])

@router.post("/")
def log_call_event(db: Session = Depends(get_db)):
    return {"status": "call event placeholder"}
