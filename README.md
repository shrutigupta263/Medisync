# MediSync - Health Management System

> **A comprehensive health tracking application with AI-powered medical report analysis**

MediSync is a modern, full-stack web application designed to help users manage their health records, medication schedules, and medical appointments. It features intelligent AI analysis of medical reports, medicine tracking, reminders, and an interactive health chatbot.

## 🎯 Project Overview

MediSync is a complete health management solution that enables users to:
- Upload and store medical reports securely
- Get AI-powered analysis of lab reports and health data
- Track medication schedules and adherence
- Set up health reminders and appointment notifications
- Interact with an AI health assistant for medical queries
- View comprehensive health analytics and predictions

## 🚀 Live Demo

Visit the deployed application at: [MediSync Demo](https://medisync0.netlify.app/dashboard)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Running the Project](#-running-the-project)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [AI Features](#-ai-features)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features

#### 1. **Dashboard**
- Personalized health overview
- Quick access to medicine status, active reminders, and recent reports
- Medicine schedule for the day
- Calendar view of upcoming reminders
- Statistics and adherence tracking

#### 2. **Reports Management**
- Upload medical reports (PDF, images)
- Secure cloud storage via Supabase Storage
- Automatic validation of medical documents
- Search and filter reports by type
- Download reports anytime
- View analysis history

#### 3. **AI-Powered Analysis**
- Comprehensive health score (0-10 scale)
- Detailed parameters table with status indicators
- Abnormal findings detection
- Personalized recommendations
- Diet plan suggestions
- Future health predictions with confidence levels
- Evidence-based citations
- Export analysis as CSV

#### 4. **Medicine Tracker**
- Add multiple medications with dosage and frequency
- Track medication adherence
- View taken/missed doses statistics
- Timeline view of medication schedule
- Set start and end dates
- Add notes for each medicine

#### 5. **Reminders & Appointments**
- Create medicine reminders and appointment alerts
- Support for recurring reminders (daily, weekly, monthly)
- Calendar integration
- Email notifications for reminders
- Mark reminders as completed
- Filter by type (medicine/appointment)

#### 6. **Health Chatbot**
- AI-powered medical assistant
- Ask questions about health reports
- Get explanations of medical terms
- Receive health-related recommendations
- Context-aware responses based on uploaded reports

#### 7. **Profile & Settings**
- Update personal information
- Configure notification preferences
- Set quiet hours (Do Not Disturb)
- Dark mode toggle
- Font size customization
- Theme preferences

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 5.4.19 | Build tool & dev server |
| **React Router** | 6.30.1 | Client-side routing |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Pre-built accessible components |
| **Radix UI** | Various | Primitive components |
| **Lucide React** | 0.462.0 | Icon library |
| **TanStack Query** | 5.83.0 | Data fetching & caching |
| **React Hook Form** | 7.61.1 | Form management |
| **Zod** | 3.25.76 | Schema validation |
| **date-fns** | 3.6.0 | Date manipulation |
| **Sonner** | 1.7.4 | Toast notifications |
| **Recharts** | 2.15.4 | Data visualization |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.58.0 | Backend-as-a-Service |
| **PostgreSQL** | 13+ | Database (via Supabase) |
| **Supabase Storage** | - | File storage |
| **Deno** | Latest | Edge functions runtime |
| **Resend** | 2.0.0 | Email service |

### AI Integration

| Service | Model | Purpose |
|---------|-------|---------|
| ** AI Gateway** | Gemini 2.5 Flash | Medical report analysis |
| ** AI Gateway** | Gemini 2.5 Flash | Health chatbot |

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **SWC** - Fast compilation

## 📁 Project Structure

```
Medisync-1/
├── public/                          # Static assets
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/                  # React components
│   │   ├── ui/                      # Reusable UI components (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (40+ components)
│   │   ├── AppShell.tsx             # Main layout component
│   │   ├── HealthChatbot.tsx        # AI health assistant
│   │   ├── ProtectedRoute.tsx       # Auth guard
│   │   ├── ReminderCalendar.tsx     # Calendar view
│   │   ├── ReportsList.tsx          # Reports display
│   │   └── ReportUploadDialog.tsx   # Upload modal
│   ├── contexts/                    # React contexts
│   │   └── AuthContext.tsx          # Authentication state
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useMedicines.ts          # Medicine management
│   │   ├── useMedicineTracking.ts   # Medicine tracking
│   │   ├── useReminders.ts          # Reminders management
│   │   └── useReports.ts            # Reports management
│   ├── integrations/                # External integrations
│   │   └── supabase/
│   │       ├── client.ts            # Supabase client setup
│   │       └── types.ts             # TypeScript types
│   ├── lib/
│   │   └── utils.ts                 # Utility functions
│   ├── pages/                       # Page components
│   │   ├── SignIn.tsx               # Login page
│   │   ├── SignUp.tsx               # Registration
│   │   ├── ForgotPassword.tsx       # Password reset request
│   │   ├── ResetPassword.tsx        # Password reset
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── Reports.tsx              # Reports page
│   │   ├── Analysis.tsx             # AI analysis view
│   │   ├── Medicine.tsx             # Medicine tracker
│   │   ├── Reminders.tsx            # Reminders page
│   │   ├── Profile.tsx              # User profile
│   │   └── NotFound.tsx             # 404 page
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # App entry point
│   └── index.css                    # Global styles
├── supabase/
│   ├── functions/                   # Edge functions
│   │   ├── analyze-report/          # AI report analysis
│   │   ├── health-chat/             # Health chatbot
│   │   ├── check-reminders/         # Reminder notifications
│   │   └── validate-medical-report/ # Report validation
│   ├── migrations/                  # Database migrations
│   │   └── *.sql
│   └── config.toml                  # Supabase configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite configuration
├── tailwind.config.ts               # Tailwind config
└── README.md                        # This file
```

## 🚀 Getting Started

This section will guide you through setting up MediSync on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **bun**
- **Git**
- A **Supabase account** (free tier works)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/shrutigupta263/Medisync-1.git
cd Medisync-1
```

2. **Install dependencies**

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

Using bun:
```bash
bun install
```

## 🔧 Environment Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys (for production)
LOVABLE_API_KEY=your_lovable_api_key
RESEND_API_KEY=your_resend_api_key
```

Or for development, the values are already configured in `src/integrations/supabase/client.ts`.

### 3. Database Setup

Run the Supabase migrations to set up the database:

```bash
# Using Supabase CLI
supabase db reset

# Or manually run migrations in Supabase Dashboard:
# SQL Editor -> New Query -> Copy-paste migration files
```

### 4. Storage Bucket Setup

Create a storage bucket in Supabase:

1. Go to Storage in Supabase Dashboard
2. Create bucket: `health-reports`
3. Set it to **Private**
4. Enable RLS policies

### 5. Edge Functions Setup

Deploy edge functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy analyze-report
supabase functions deploy health-chat
supabase functions deploy check-reminders
supabase functions deploy validate-medical-report
```

Set environment secrets for edge functions:

```bash
supabase secrets set LOVABLE_API_KEY=your_key
supabase secrets set RESEND_API_KEY=your_key
```

## ▶️ Running the Project

### Development Mode

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

Create an optimized production build:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## 🗄 Database Schema

### Tables

#### `profiles`
User profile information linked to auth.users

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | References auth.users |
| full_name | TEXT | User's full name |
| email | TEXT | User's email |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `health_reports`
Medical reports uploaded by users

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| user_id | UUID (FK) | References auth.users |
| title | TEXT | Report title |
| file_url | TEXT | Storage path |
| file_type | TEXT | MIME type |
| file_size | INTEGER | File size in bytes |
| ai_analysis | TEXT | Legacy analysis text |
| analysis_status | TEXT | pending/completed |
| analyzed_at | TIMESTAMPTZ | Analysis timestamp |
| upload_date | DATE | Upload date |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `report_analysis`
AI analysis results for reports

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| report_id | UUID (FK) | References health_reports |
| analysis_json | JSONB | Complete analysis data |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `medicines`
User's medication list

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| user_id | UUID (FK) | References auth.users |
| medicine_name | TEXT | Medicine name |
| dosage | TEXT | Dosage amount |
| frequency | TEXT | How often to take |
| start_date | DATE | Treatment start date |
| end_date | DATE | Treatment end date |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `medicine_tracking`
Daily medicine adherence tracking

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| user_id | UUID (FK) | References auth.users |
| medicine_id | UUID (FK) | References medicines |
| date | DATE | Tracking date |
| status | TEXT | taken/missed/pending |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `health_reminders`
Medicine and appointment reminders

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| user_id | UUID (FK) | References auth.users |
| title | TEXT | Reminder title |
| description | TEXT | Additional details |
| reminder_type | TEXT | medicine/appointment |
| reminder_time | TIMESTAMPTZ | When to remind |
| is_recurring | BOOLEAN | Recurring flag |
| recurrence_pattern | TEXT | daily/weekly/monthly |
| is_completed | BOOLEAN | Completion status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `family_members`
Family health tracking

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| user_id | UUID (FK) | References auth.users |
| name | TEXT | Member name |
| relationship | TEXT | Relationship to user |
| date_of_birth | DATE | Birth date |
| blood_group | TEXT | Blood group |
| medical_conditions | TEXT[] | Conditions array |
| allergies | TEXT[] | Allergies array |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `user_settings`
User preferences and settings

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| user_id | UUID (FK) | References auth.users |
| theme | TEXT | light/dark |
| notifications_enabled | BOOLEAN | Notification preference |
| email_notifications | BOOLEAN | Email preference |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only:
- View their own data
- Insert records for themselves
- Update their own records
- Delete their own records

## 🔐 Authentication

MediSync uses Supabase Auth for secure authentication:

### Features

- Email/password authentication
- Email verification
- Password reset flow
- Secure session management
- Protected routes

### Flow

1. **Sign Up**: User creates account with email/password
2. **Verification**: Email verification sent automatically
3. **Sign In**: User logs in with credentials
4. **Session**: JWT token stored securely
5. **Protected Routes**: Middleware checks authentication
6. **Sign Out**: Clears session and redirects

### Auth Context

The `AuthContext` provides:

```typescript
{
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email, password, name) => Promise<{error}>
  signIn: (email, password) => Promise<{error}>
  signOut: () => Promise<void>
  resetPassword: (email) => Promise<{error}>
  updatePassword: (newPassword) => Promise<{error}>
}
```

## 🤖 AI Features

### 1. Report Analysis

**Function**: `analyze-report`

Uses Google Gemini 2.5 Flash to analyze medical reports and provides:

- **Health Score**: 0-10 rating with reasoning
- **Parameters Table**: All test values with normal ranges and status
- **Abnormal Findings**: Highlighted issues
- **Recommendations**: Lifestyle and diet suggestions
- **Diet Plan**: Daily meal recommendations
- **Future Predictions**: Risk assessment with citations
- **Final Summary**: Plain-language overview

### 2. Health Chatbot

**Function**: `health-chat`

AI assistant that:

- Answers medical and health questions
- Explains medical terminology
- Provides context-aware responses
- Refuses non-medical queries
- Keeps responses concise (2-3 sentences)

### 3. Reminder Notifications

**Function**: `check-reminders`

Automated email reminders for:

- Medicine schedules
- Upcoming appointments
- Uses Resend for email delivery
- Sends 5 minutes before scheduled time

### Model Configuration

- **Model**: Google Gemini 2.5 Flash
- **Gateway**: Lovable AI Gateway
- **API Key**: Required in environment variables
- **Temperature**: 0.3 (for consistency)
- **Max Tokens**: 300-1000 depending on use case

## 📡 API Reference

### Edge Functions

#### `analyze-report`

Analyzes a medical report using AI.

**Endpoint**: `/functions/v1/analyze-report`

**Method**: POST

**Request Body**:
```json
{
  "reportId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "health_score": {...},
    "parameters_table": [...],
    "abnormal_findings": [...],
    "recommendations": [...],
    "diet_plan": {...},
    "future_predictions": [...],
    "final_summary": "..."
  }
}
```

#### `health-chat`

Chat with AI health assistant.

**Endpoint**: `/functions/v1/health-chat`

**Method**: POST

**Request Body**:
```json
{
  "message": "What is hemoglobin?",
  "reportContext": "Optional report context"
}
```

**Response**:
```json
{
  "reply": "AI response text"
}
```

#### `check-reminders`

Check and send pending reminders.

**Endpoint**: `/functions/v1/check-reminders`

**Method**: GET (called by cron)

**Response**:
```json
{
  "message": "Reminder check complete",
  "total": 5,
  "results": [...]
}
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

### Supabase Hosting

Supabase provides hosting for edge functions automatically.

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm test -- --coverage
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 🙏 Acknowledgments

- Supabase for the amazing backend infrastructure
- shadcn for beautiful UI components
- Radix UI for accessible primitives
- Lovable for AI integration
- The open-source community


## 🗺 Roadmap

Future features planned:

- [ ] Mobile app (React Native)
- [ ] Wearable device integration
- [ ] Doctor portal
- [ ] Telemedicine integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Lab integration APIs
- [ ] Medication interaction checker
- [ ] Family health sharing
- [ ] Export to PDF functionality

---

Made with ❤️ for better health management