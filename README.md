# CampusSafe

AI-powered emergency broadcast and safety bot for campuses.

An admin triggers one alert. The system reaches everyone by voice and text, escalates
automatically if someone doesn't respond, understands spoken replies, and shows responders
a live dashboard of who is safe, who needs help, and who is unreachable.

Built for **AI Summit Hackathon 2026**, Voice Agents & Automation track (Problem #5),
sponsored by ElevenLabs and n8n.

## The Problem

In campus emergencies, text blasts get missed, nobody knows who is safe, and responders
waste critical time chasing people manually.

## The Solution

1. Admin triggers a **Drill** or **Real** alert (with confirmation to prevent false alarms).
2. Each person gets a Telegram alert with a voice message and an incoming-call link.
3. They answer on a web call page and speak naturally to an ElevenLabs voice agent.
4. An LLM turns the reply into structured data: status, location, people hurt, urgency.
5. If someone doesn't respond, the system escalates automatically.
6. Responders watch everything live on a dashboard.

## Escalation Logic

| Step | Action |
|------|--------|
| 1 | Alert: text + voice note |
| 2 | Retry with urgent message and call link |
| 3 | Incoming-call link (simulated voice call) |
| 4 | Notify backup contact |
| 5 | Mark UNREACHABLE and flag for physical check |

The status is checked before every step. A reply at any point stops further escalation,
and a late reply overrides UNREACHABLE.

## Features

- Drill and Real modes with a confirmation step
- Live voice conversation (ElevenLabs Conversational AI), Hindi and English
- Voice-note replies via Telegram, transcribed with ElevenLabs STT
- LLM classification of free-form replies, for example "I'm fine but my friend is hurt" is
  flagged as Need Assistance
- Automatic multi-step escalation with a backup contact
- Live responder dashboard: counters, priority queue, per-person timeline
- Audit log of every send, response and status change
- Simulated SMS panel and response-time metrics

## Architecture

```
Admin UI -> n8n (trigger) -> Telegram + Call page (ElevenLabs agent)
                                  |
                      post-call / reply webhooks
                                  v
                    n8n (STT -> LLM classify) -> FastAPI + SQLite -> Dashboard
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Orchestration | n8n |
| Voice | ElevenLabs (Conversational AI, TTS, STT) |
| Messaging | Telegram Bot API |
| Backend | FastAPI + SQLite (Render) |
| Frontend | Next.js + React + CSS (Vercel) |

## Project Structure

```
campussafe-voice/
├── backend/      # FastAPI app, SQLite, routes
├── frontend/     # Next.js: admin, call page, dashboard
└── workflows/    # exported n8n workflows (JSON)
```

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env     # fill in values
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

### n8n and ElevenLabs
1. Import the workflows from `/workflows` into n8n.
2. Create a Telegram bot and add its token to n8n credentials.
3. Create an ElevenLabs agent and set its post-call webhook to the n8n response webhook.
4. Set `DEMO_MODE=true` for short escalation timings during demos.

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`. Never commit real keys.

## Demo Note

Telephony is simulated for the hackathon: Telegram stands in for SMS, and a web
incoming-call page with a live ElevenLabs agent stands in for phone calls. The workflow is
channel-agnostic, so real calls and SMS can be added with Twilio or Exotel by swapping
one node.

## Roadmap

- Real telephony and SMS (Twilio / Exotel)
- Campus ID system integration
- Indoor location and geofencing
- Responder mobile app
- More languages

## Team

Add your team name and members here.
