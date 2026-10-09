from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db

router = APIRouter(prefix="/state", tags=["State"])

@router.get("/")
def get_dashboard_state(db: Session = Depends(get_db)):
    # This will be polled by the frontend every 2 seconds
    return {"status": "get state placeholder"}
