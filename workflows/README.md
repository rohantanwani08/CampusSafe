# CampusSafe: n8n Workflows & Orchestration Guide

This folder is the home for the orchestration logic. Because n8n workflows are highly visual and require your specific API credentials (Telegram, ElevenLabs, etc.), you will build them in the n8n UI using this guide.

## Prerequisites
1. **Telegram Bot Token**: Go to Telegram, search for `@BotFather`, send `/newbot`, name it `CampusSafeBot`, and copy the HTTP API Token.
2. **ElevenLabs Agent ID**: Create an agent in ElevenLabs, copy its Agent ID.
3. **Admin Secret**: `hackathon_demo_secret` (used to authenticate your backend calls).

---

## Workflow 1: Alert Trigger (The Webhook)
**Goal:** Receive the POST request from the FastAPI Admin panel and trigger the escalation loops.

1. **Webhook Node**: 
   - Method: POST
   - Path: `/n8n-trigger`
2. **HTTP Request Node (Fetch Contacts)**:
   - Method: GET to `https://<YOUR_RENDER_URL>/state`
3. **Split in Batches Node**:
   - Loop over the recipients.
4. **Execute Workflow Node**:
   - For each recipient, trigger **Workflow 2: Escalation Engine**, passing the `contact_id`, `message`, and `alert_id`.

---

## Workflow 2: Escalation Engine
**Goal:** Send SMS (Telegram), wait, escalate if no reply.

1. **Webhook / Execute Trigger**: Receives `contact_id`.
2. **Telegram Node (Step 1)**: Send Initial Alert.
3. **HTTP Request Node (Simulate SMS)**: POST to `https://<YOUR_RENDER_URL>/sms-log` (Step 1).
4. **Wait Node**: Wait 5 minutes (or 10 seconds for demo mode).
5. **HTTP Request Node (Check Status)**: GET to `https://<YOUR_RENDER_URL>/state` to check if `status != PENDING`.
6. **IF Node**: If `status == PENDING`, proceed to Step 2.
7. **Telegram Node (Step 2)**: Send Reminder.
8. **HTTP Request Node (Simulate SMS)**: POST to `https://<YOUR_RENDER_URL>/sms-log` (Step 2).
9. **Wait Node**: Wait 5 minutes.
10. **IF Node**: Check status again. If still `PENDING`:
11. **Telegram Node (Step 3 - Call Link)**: Send ElevenLabs Call link (`https://<YOUR_VERCEL_URL>/call?rid=<contact_id>`).
12. **HTTP Request Node (Simulate SMS)**: POST to `/sms-log` with `channel: call_link`.
13. **Wait Node**: Wait 5 minutes.
14. **IF Node**: Check status again. If still `PENDING`:
15. **Telegram Node (Backup Contact)**: Send message to backup contact.

---

## Workflow 3: Response Handler
**Goal:** Process replies from Telegram and ElevenLabs transcripts via LLM, and update the backend.

1. **Telegram Trigger Node** OR **ElevenLabs Webhook Node**: Triggers when a reply is received.
2. **Basic LLM Chain Node (Gemini/GPT-mini)**:
   - Prompt: "You are a crisis classifier. Read this message: '{{ $json.message }}'. Return STRICT JSON with two keys: `status` (SAFE, NEED_ASSISTANCE, UNCLEAR) and `urgency` (HIGH, MEDIUM, LOW)."
3. **HTTP Request Node (Update Backend)**:
   - Method: POST
   - URL: `https://<YOUR_RENDER_URL>/recipients/update`
   - Headers: `X-Admin-Token: hackathon_demo_secret`
   - Body: 
     ```json
     {
       "recipient_id": "{{ $json.contact_id }}",
       "status": "{{ $json.llm.status }}",
       "urgency": "{{ $json.llm.urgency }}",
       "response_summary": "{{ $json.message }}",
       "resolved_via": "telegram" 
     }
     ```
