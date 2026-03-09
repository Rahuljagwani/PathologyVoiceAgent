## Pathology Lab Voice Agent

Backend + minimal frontend for a voice AI assistant (“Priya”) that answers calls for pathology labs and reads data from Supabase via a FastAPI backend.

---

### Deployed app

- **Dashboard (frontend) login**: [`https://pathologysoftware.netlify.app`](https://pathologysoftware.netlify.app)

---

### Project status

- **Status**: In progress  
- **What works today**:
  - Backend API and Supabase schema.
  - Frontend dashboard pages for labs, reports, tests, home‑collections, and call logs.
  - Priya Bolna agent reading lab settings + reports/tests/home‑collections via `GET /api/bolna/caller-context`.
- **Planned next**:
  - Wire more Bolna tools for write‑backs (e.g. creating bookings, updating statuses) directly via backend endpoints.

---

### Backend setup (FastAPI + Supabase)

- **Location**: `backend/`  
- **Entrypoint**: `app/main.py`  
- **Health check**: `GET /api/health`

#### 1. Environment and dependencies

- **Create env file**:

```bash
cp backend/.env.example backend/.env
```

- **Install deps** (inside your virtualenv if you use one):

```bash
pip install -r backend/requirements.txt
```

- **Set Supabase + JWT + Bolna in `backend/.env`**:
  - **`SUPABASE_URL`**, **`SUPABASE_SERVICE_KEY`**
  - **`JWT_SECRET`** (any strong string)
  - **`BOLNA_WEBHOOK_SECRET`** (shared secret for Bolna context calls)

- **Apply DB schema in Supabase**:
  - In Supabase SQL editor, run: `backend/migrations/001_init_schema.sql`.

- **Run API locally**:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### Frontend (dashboard) – optional but recommended

The React/Vite dashboard lets you seed data (reports, tests, home collections) easily.

- **Location**: `frontend/`

#### Steps

- **Create env**:

```bash
cp frontend/.env.example frontend/.env
```

Ensure:

```env
VITE_API_BASE_URL=http://localhost:8000
```

- **Install + run**:

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`), sign up a lab owner via `/login`, and use the dashboard to create:

- **Labs/settings** (lab name, address, escalation phone, timings, payment modes).
- **Reports** (ready/pending).
- **Tests & prices** (names, fasting, prices).
- **Home collections** (optional).

The **latest created lab** in `lab_settings` is what Priya will use on calls.

---

### Bolna agent (Priya) – creation and number

You need a Bolna account and an API key.

- **Create the agent via helper script** (once, from repo root):

```bash
cd backend
export BOLNA_API_KEY="YOUR_REAL_BOLNA_API_KEY"
export BASE_URL="https://YOUR-PUBLIC-BACKEND"  # see next section
python scripts/create_bolna_lab_agent_priya.py
```

This prints a JSON containing:

- **`agent_id`** – use this in Bolna + (optionally) `lab_settings.bolna_agent_id`.
- **`inbound_phone_number`** – this is the number you actually dial from your phone.

In the **Bolna dashboard**, open this agent and in the telephony section you can also see / change the **inbound phone number**. That is the single number to use for all testing (you can forward your lab’s public number to it if you want).

---

### Current server‑side wiring (read‑only)

Right now, what is guaranteed to work is **data retrieval** via Bolna’s context API:

- **`GET /api/bolna/caller-context`**
  - Called by Bolna once at the start of each call.
  - Returns, for the **most recently created lab** in `lab_settings`:
    - **`lab_id`**, **`lab_name`**, **`address`**, **`language_preference`**, **`escalation_phone`**
    - **`reports`**: up to 100 recent rows from `reports` for that `lab_id`
    - **`tests`**: up to 200 rows from `test_price_master` for that `lab_id`
    - **`home_collections`**: up to 100 recent rows from `home_collections` for that `lab_id`
- Priya’s system prompt and welcome message use `{lab_name}`, so she will speak the correct **lab name** as long as this context call succeeds.
- Write‑back via POST tools (e.g. creating bookings) depends on extra Bolna `api_tools` wiring and may not be active in your Bolna environment yet.

---

### How to test on a real phone call (retrieval only)

These steps assume:

- Backend is running locally (`http://localhost:8000`).
- Supabase has data for the **latest** lab (lab settings + some reports/tests/home‑collections).

#### 1. Expose backend to Bolna

- Deploy the backend or run a tunnel, for example:

```bash
ngrok http 8000
```

This gives you a URL like `https://YOUR-PUBLIC-URL`.

- In the **Bolna dashboard** for Priya:
  - **Webhook URL**: `https://YOUR-PUBLIC-URL/api/bolna/webhook`
  - **Context source**:
    - `source_type = "api"`
    - `source_url = "https://YOUR-PUBLIC-URL/api/bolna/caller-context"`
    - `source_auth_token = BOLNA_WEBHOOK_SECRET` from `backend/.env`

Bolna will now call your `/caller-context` endpoint at the start of each call and get all lab data as JSON.

#### 2. Seed data for the latest lab

Using the dashboard (frontend) for the lab you created **most recently**:

- **Settings**: fill `lab_name`, `address`, `escalation_phone`, timings, payment modes.
- **Reports**: add at least one “ready” and one “pending” report.
- **Tests**: add tests like **Lipid Profile** with fasting + price.
- **Home collections**: optional, but you can create a couple of bookings.

This is the data Priya will see in the `reports`, `tests`, and `home_collections` arrays in context.

#### 3. Call Priya’s number

- From your mobile, **dial the inbound number** shown for the Priya agent in the Bolna dashboard (and in `priya.json` under `inbound_phone_number`).

On the call, verify:

- **Lab name greeting**
  - She should say:  
    “Namaste, main Priya bol rahi hoon, \<your lab name\> ki taraf se.”

- **Report retrieval (from context)**
  - Ask: “Mera CBC report Rahul Sharma naam se ready hai kya?”
  - Priya should reason over the `reports` list from context and tell you whether it’s ready, without interpreting values.

- **Test preparation / pricing (from context)**
  - Ask: “Lipid profile test ke liye fasting chahiye kya?”
  - Ask: “Lipid profile ka rate kitna hai?”
  - She should use the `tests` list from context to answer fasting requirements and prices.

- **Lab info (from settings)**
  - Ask: “Aapke lab ke timings kya hain?” or “Address kya hai, landmark ke saath bataiye.”
  - She should respond using `lab_name`, `address`, and timings you configured.

#### 4. (Optional) Inspect the raw context directly

To see exactly what Priya sees during a call, hit the context endpoint yourself:

```bash
curl -H "Authorization: Bearer <BOLNA_WEBHOOK_SECRET>" \
  "https://YOUR-PUBLIC-URL/api/bolna/caller-context?contact_number=TEST&agent_id=<agent_id>&execution_id=TEST"
```

You should see a JSON object containing `lab_id`, `lab_name`, and arrays of `reports`, `tests`, and `home_collections` for the latest lab. If this looks correct and you have configured the Bolna agent URLs as above, Priya’s answers on the phone should line up with what you see here.
