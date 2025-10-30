🩺 MediSync — AI Medical Report Analytics & Virtual Care

🚀 Turning raw medical reports into clear, actionable health insights

### Overview
MediSync is an AI-assisted healthcare application that lets users upload medical reports (PDFs or images) and automatically generates easy-to-understand analyses, summaries, and recommendations. It combines OCR for data extraction, LLMs for interpretation, and secure storage with Supabase. Users can track health trends, set medicine and appointment reminders, and receive timely notifications.

### Core Features
- **Report Upload & OCR Extraction**: Import scanned or digital reports; OCR extracts text and key values.
- **AI-Powered Report Analysis**: LLM-based summaries, abnormalities detection, and personalized recommendations.
- **Interactive Dashboard**: Charts, cards, and timelines to visualize key metrics and trends.
- **Smart Reminders**: Schedule medication and appointment reminders with real-time notifications.
- **Secure Auth & Privacy**: Email-based authentication and secure, role-aware data access.
- **Cloud-Backed Storage**: Structured results and files stored in Supabase.

### System Architecture
```
┌──────────────────────────────┐
│        Frontend (React)      │
│  - Upload reports            │
│  - Dashboard & insights      │
│  - Reminders management      │
└──────────────┬───────────────┘
               │ HTTPS / RPC
┌──────────────▼───────────────┐
│   Supabase Edge Functions    │
│  - OCR trigger & validation  │
│  - AI analysis orchestration │
│  - Reminders checks          │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│      OCR Processing          │
│   (e.g., Tesseract.js)       │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│      AI Analysis (LLM)       │
│  - Summaries & anomalies     │
│  - Recommendations           │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│      Database (Supabase)     │
│  - Users, reports, results   │
│  - Realtime & RLS policies   │
└──────────────┬───────────────┘
               │
┌──────────────▼────────────────────┐
│   Notification Layer (FCM/Twilio) │
│  - Medicine & alert reminders     │
└────────────────────────────────────┘
```

### Tech Stack
| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS | UI, upload, dashboard, reminders |
| Backend Logic | Supabase Edge Functions (TypeScript) | OCR/AI orchestration, validation, reminders |
| OCR | Tesseract.js | Text extraction from PDFs/images |
| AI | Gemini or OpenAI GPT APIs | Medical analysis and summarization |
| Database | Supabase (PostgreSQL) | Secure storage, auth, realtime |
| Notifications | Twilio / Firebase Cloud Messaging | Alerts and reminders |
| Auth | Supabase Auth | Email verification & JWT sessions |

### Monorepo Layout (this project)
```
src/                 # React app (UI, hooks, pages, components)
supabase/functions/  # Edge Functions: OCR/analysis/reminders/chat
supabase/migrations/ # SQL migrations & schema
```

### Installation & Setup
#### Prerequisites
- Node.js ≥ 18
- A Supabase project (URL and anon/public key)
- An AI provider key (Gemini or OpenAI)
- Optional: Twilio / Firebase credentials for notifications

#### 1) Install dependencies
```bash
npm install
```

#### 2) Environment variables
Create a `.env` file in the project root for the frontend, and set environment variables for Supabase Functions via the Supabase CLI or dashboard.

Frontend (Vite):
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Choose one AI provider key
VITE_GEMINI_API_KEY=your_gemini_key
# or
VITE_OPENAI_API_KEY=your_openai_key

# Notifications (optional)
VITE_FCM_VAPID_PUBLIC_KEY=your_fcm_web_push_key
```

Supabase Functions (server-side):
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Notifications (optional)
RESEND_API_KEY=your_resend_api_key
```

#### 3) Start the app (frontend)
```bash
npm run dev
```

#### 4) Develop/Run Edge Functions (optional)
Functions live in `supabase/functions/*` and include:
- `analyze-report`: AI-based interpretation of extracted data
- `validate-medical-report`: input validation and pre-processing
- `check-reminders`: periodic reminders/notifications
- `health-chat`: AI chat for health queries

You can deploy and invoke these via Supabase. For local development, use the Supabase CLI to run functions and manage migrations.

### Core Workflow
1. User authenticates (Supabase Auth).
2. User uploads a report; text is extracted via OCR.
3. Parsed values are validated and normalized.
4. AI analysis generates summaries, flags abnormalities, and proposes next steps.
5. Structured results are saved to Supabase.
6. UI displays insights and trends; reminders can be created.
7. Notification service sends alerts for medicines or abnormal findings.

### Sample Analysis Output
```json
{
  "user_id": "123",
  "overall_health_score": 8.5,
  "abnormal_parameters": ["Hemoglobin Low", "Cholesterol High"],
  "summary": "Hemoglobin is slightly low; consider increasing iron-rich foods.",
  "recommendations": ["Increase spinach, lentils, eggs", "Schedule a routine check-up"],
  "risk_prediction": "Mild risk of anemia"
}
```

### Security & Privacy
- Authenticated access with Supabase Auth.
- Row Level Security (RLS) to isolate user data.
- Do not commit secrets; use environment variables for keys and tokens.

### Achievements
- End-to-end AI analysis pipeline with OCR → LLM → storage.
- Modular Edge Functions for analysis, validation, chat, and reminders.
- Interactive React UI with charts, cards, and report summaries.

### Roadmap
- Multilingual report parsing and summaries.
- Virtual care chatbot enhancements (contextual, longitudinal memory).
- Advanced risk prediction models beyond rules-based thresholds.
- Wearable/IoT integrations for continuous monitoring.

### Scripts
```bash
npm run dev       # Start frontend (Vite)
npm run build     # Production build
npm run preview   # Preview production build locally
```

### Contributing
Pull requests are welcome. For major changes, please open an issue to discuss what you would like to change. Include relevant context and screenshots when UI is affected.

