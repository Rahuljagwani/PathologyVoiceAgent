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

#### Bolna agent end‑to‑end testing (high level)

To exercise the full **phone → Bolna → FastAPI → Supabase → dashboard** flow:

1. Apply `backend/migrations/001_init_schema.sql` in your Supabase project.
2. Configure `backend/.env` with Supabase + JWT (and optional `BOLNA_WEBHOOK_SECRET`), then run:
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
3. Configure and run the frontend (`VITE_API_BASE_URL=http://localhost:8000`, then `npm run dev`), sign up a lab owner via `/login`, and seed some reports/tests/home‑collections via the dashboard.
4. Deploy the backend to a public URL, export `BOLNA_API_KEY` and `BASE_URL`, and run:
   - `python backend/scripts/create_bolna_lab_agent_priya.py`
   - Store the returned `agent_id` into `lab_settings.bolna_agent_id` for your lab.
5. In the Bolna dashboard, assign an inbound phone number to that agent (and optionally forward your existing lab number to it).
6. Call the agent’s phone number from your mobile and verify behaviour using the scenarios in `bolnaagenttest.md` (local test guide; not committed).


