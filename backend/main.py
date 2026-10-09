from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.db import init_db

# Initialize database tables
init_db()

app = FastAPI(title="CampusSafe API")

# Add CORS middleware to allow requests from the Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # We will restrict this to the Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.routes import alerts, recipients, events, state, call, health

app.include_router(health.router)
app.include_router(alerts.router)
app.include_router(recipients.router)
app.include_router(events.router)
app.include_router(state.router)
app.include_router(call.router)
