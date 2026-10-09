from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..security import verify_webhook_secret

router = APIRouter(prefix="/recipients", tags=["Recipients"])

@router.post("/update")
def update_recipient(db: Session = Depends(get_db), secret: str = Depends(verify_webhook_secret)):
    return {"status": "update recipient placeholder"}
