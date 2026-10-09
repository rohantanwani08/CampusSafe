from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

# --- Contacts ---
class ContactBase(BaseModel):
    name: str
    telegram_chat_id: str
    backup_contact_id: Optional[int] = None
    building: str
    language: str = "English"

class ContactOut(ContactBase):
    id: int
    class Config:
        from_attributes = True # updated for Pydantic V2 (formerly orm_mode)

# --- Alerts ---
class AlertCreate(BaseModel):
    mode: str = Field(..., pattern="^(drill|real)$")
    message: str
    target_group: str
    admin_token: str

# --- Webhooks & Events ---
class WebhookResponse(BaseModel):
    """
    Expected payload from the n8n LLM node when it successfully
    classifies a user's voice response.
    """
    recipient_id: int
    status: str # SAFE, NEED_ASSISTANCE, UNCLEAR
    location: Optional[str] = None
    people_hurt: int = 0
    urgency: Optional[str] = None # LOW, MEDIUM, HIGH
    summary: Optional[str] = None
    confidence: Optional[float] = None
    channel: str # call, telegram_voice, telegram_button, backup

class CallEvent(BaseModel):
    """
    When a user clicks "Answer" or "Decline" on the web call page.
    """
    recipient_id: int
    event: str = Field(..., pattern="^(answered|declined)$")

class N8nStatusUpdate(BaseModel):
    """
    When n8n's escalation loop simply updates someone's status 
    (e.g., escalating from CONTACTED to UNREACHABLE).
    """
    recipient_id: int
    status: str
    step: int
    event_type: str
    channel: str
