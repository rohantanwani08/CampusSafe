from fastapi import Header, HTTPException
from .config import settings

def verify_admin_token(x_admin_token: str = Header(..., alias="X-Admin-Token")):
    if x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return x_admin_token

def verify_webhook_secret(x_webhook_secret: str = Header(..., alias="X-Webhook-Secret")):
    if x_webhook_secret != settings.WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
    return x_webhook_secret
