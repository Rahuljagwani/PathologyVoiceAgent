## Pathology Lab Voice Agent

FastAPI + React/Tailwind starter for a voice AI agent SaaS for independent pathology labs in India. Commit 1 focuses only on a clean, runnable skeleton with environment wiring; business logic and database schema come in later commits.

### Backend (FastAPI)

- Location: `backend/`
- Entrypoint: `app/main.py`
- Health check: `GET /api/health`
- Placeholder routers are mounted under `/api/*` for:
  - `auth`, `labs`, `reports`, `tests`, `home-collections`, `calls`, `dashboard`, `bolna`

#### Backend setup

1. Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

2. (Optional) Activate your virtualenv, then install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Run the API locally:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite + Tailwind)

- Location: `frontend/`
- Routing is set up with placeholder pages for:
  - `/dashboard/reports` — Report Status Manager
  - `/dashboard/home-collections` — Home Collection Calendar
  - `/dashboard/tests` — Test & Price Manager
  - `/dashboard/call-logs` — Call Logs
  - `/dashboard/settings` — Settings
  - `/login` — Lab owner login (auth wired in a later commit)

#### Frontend setup

1. Create `frontend/.env` from the example:

```bash
cp frontend/.env.example frontend/.env
```

2. Install dependencies (Node 20+ recommended for the Vite toolchain):

```bash
cd frontend
npm install
```

3. Run the dev server:

```bash
npm run dev
```

### External services

Supabase, Bolna, and Twilio configuration are represented only as environment variables in Commit 1. You can leave their values blank for now; later commits will use them when implementing schema, call flows, and telephony.

