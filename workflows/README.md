# CampusSafe: n8n Workflow Configuration Guide

Because n8n workflows contain sensitive API keys and rely on visual node configuration, you will need to build these inside your n8n UI. Follow these step-by-step instructions.

## Prerequisites
1. **Telegram Bot Token**: Go to Telegram, search for `@BotFather`, type `/newbot`, name it `CampusSafeBot`, and copy the **HTTP API Token**.
2. **ElevenLabs Agent ID**: Go to ElevenLabs, create a Conversational AI agent, and get the Agent ID.
3. **OpenAI or Gemini API Key**: For the n8n Advanced AI node (for text classification).

---

## Workflow 1: Alert Trigger
**Purpose:** Triggered by your FastAPI backend when the Admin clicks "Broadcast". It starts the escalation process.

1. **Webhook Node**
   - **Method**: POST
   - **Path**: `alert-trigger`
   - **Authentication**: None (we handle secret checking in the backend).
2. **Execute Workflow Node**
   - This node receives the array of `recipients` from the Webhook.
   - Configure it to call **Workflow 2 (Escalation Engine)** for *each item* in the recipients array.

---

## Workflow 2: Escalation Engine
**Purpose:** Runs individually for every person. It messages them on Telegram, waits, checks if they responded, and escalates if they didn't.

1. **Execute Workflow Trigger Node**
   - Receives data from WF1 (`recipient_id`, `name`, `telegram_id`, `backup_telegram_id`).
2. **Telegram Node (Step 1 - Initial Alert)**
   - **Resource**: Message
   - **Operation**: Send Message
   - **Chat ID**: `={{ $json.telegram_id }}`
   - **Text**: `🚨 CAMPUS ALERT: {{ $json.message }} Reply with your status.`
3. **HTTP Request Node (SMS Simulator)**
   - **Method**: POST
   - **URL**: `https://<YOUR-RENDER-URL>/sms-log/`
   - **Headers**: `X-Admin-Token: hackathon_demo_secret`
   - **Body**: `{ "alert_id": {{ $json.alert_id }}, "contact_id": {{ $json.recipient_id }}, "step": 1, "channel": "telegram", "text": "🚨 CAMPUS ALERT..." }`
4. **Wait Node**
   - **Wait Amount**: 2 minutes (For hackathon demo, change to 15 seconds).
5. **HTTP Request Node (Check Status)**
   - **Method**: GET
   - **URL**: `https://<YOUR-RENDER-URL>/alerts/{{ $json.alert_id }}/recipients/{{ $json.recipient_id }}`
6. **Switch Node (If condition)**
   - **Condition**: If `={{ $json.status }}` is `PENDING`, continue. Otherwise, end workflow.
7. **Telegram Node (Step 2 - Escalation 1)**
   - Send follow-up: `⚠️ 2ND NOTICE: Please reply with your status immediately.`
   - *(Followed by another SMS Simulator HTTP Request Node for step 2)*
8. *(Repeat Wait -> Check -> Switch -> Telegram for Step 3)*
9. **Telegram Node (Step 4 - AI Voice Call Link)**
   - Send: `🚨 FINAL NOTICE: Click here to connect to the emergency AI voice agent: https://<YOUR-VERCEL-URL>/call?rid={{ $json.recipient_id }}`
   - *Don't forget the SMS log node here with `"channel": "call_link"`.*
10. *(Wait -> Check)*
11. **Telegram Node (Step 5 - Backup Contact)**
    - **Chat ID**: `={{ $json.backup_telegram_id }}`
    - Send: `URGENT: {{ $json.name }} has not responded to an emergency alert. Please check on them.`

---

## Workflow 3: Response Handler
**Purpose:** Listens for webhook events from Telegram (text replies) or ElevenLabs (post-call transcripts), classifies the urgency using AI, and updates the backend.

1. **Webhook Node (Telegram/ElevenLabs Webhook)**
   - **Method**: POST
   - **Path**: `response-handler`
2. **Advanced AI Node (LLM Classifier)**
   - **Prompt**: 
     ```
     You are an emergency classifier. Analyze this text: "={{ $json.body.message }}"
     Return strict JSON:
     {
       "status": "SAFE" | "NEED_ASSISTANCE" | "UNCLEAR",
       "urgency": "HIGH" | "MEDIUM" | "LOW",
       "people_hurt": <integer>,
       "summary": "<short 1 sentence summary>"
     }
     ```
   - *Rules*: If bleeding/danger, HIGH. If safe, status is SAFE.
3. **HTTP Request Node (Update Backend)**
   - **Method**: POST
   - **URL**: `https://<YOUR-RENDER-URL>/recipients/update`
   - **Headers**: `X-Webhook-Secret: hackathon_demo_secret`
   - **Body**:
     ```json
     {
       "recipient_id": "={{ $json.body.recipient_id }}",
       "status": "={{ $json.llm.status }}",
       "urgency": "={{ $json.llm.urgency }}",
       "response_summary": "={{ $json.llm.summary }}",
       "people_hurt": "={{ $json.llm.people_hurt }}",
       "resolved_via": "telegram" 
     }
     ```
