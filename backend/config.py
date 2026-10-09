import os

# Base config
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./campussafe.db")

# Escalation timings config (can be used by the backend if we handle timing, 
# though n8n will primarily use these values in its Wait nodes)
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

class Config:
    DATABASE_URL = DATABASE_URL
    ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "hackathon_demo_secret")
    WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "n8n_webhook_secret")
    
settings = Config()
