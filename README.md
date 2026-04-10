# Beyond the Wallet

Beyond the Wallet is an AI agent named **Kwame** that analyzes informal digital footprints (Mobile Money transactions) to generate a "Trust Score" for informal vendors in West Africa.

## Features
- **Kwame Persona:** A supportive Financial Growth Partner with a professional yet friendly West African tone.
- **Trust Scoring:** Prioritizes transaction consistency and repayment behavior over raw account balances.
- **Automated Insights:** Generates a rationale and suggested micro-loan limit for each vendor.
- **API Interface:** FastAPI-powered endpoints for vendor management and scoring.

## Tech Stack
- **Environment:** Python 3.13+ managed by `uv`.
- **Database:** SQLAlchemy with PostgreSQL support (SQLite used for local dev).
- **AI Agent:** Powered by OpenAI GPT-4o.

## Setup
1. Install `uv`: `pip install uv`
2. Install dependencies: `uv sync`
3. (Optional) Set `OPENAI_API_KEY` in `.env`.
4. Run the API: `uv run uvicorn app.main:app --reload`

## Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Copy `frontend/.env.example` to `.env` and set `VITE_API_BASE_URL`.
4. Add Firebase Web app values for:
   `VITE_FIREBASE_API_KEY`
   `VITE_FIREBASE_AUTH_DOMAIN`
   `VITE_FIREBASE_PROJECT_ID`
   `VITE_FIREBASE_APP_ID`
5. Enable Firebase phone authentication for the project.
6. Run the frontend: `npm run dev`

## Backend Auth
- Set `FIREBASE_PROJECT_ID` so the API can verify Firebase ID tokens on protected consent endpoints.
- For local non-auth test runs only, you can set `SKIP_FIREBASE_AUTH=1`.

The product journey is now consent-led:
- sign in with Firebase phone auth
- enter a MoMo phone number
- simulate OTP approval for data access
- unlock a trust score, loan signal, and savings guidance after approval
- upload PDF, CSV, or TXT wallet statements to refresh the ledger from the web app

Use one of the seeded demo numbers from `/demo-accounts` to experience the full prototype.

## Spec-Driven Workflow
This repo did not previously include a Spec Kit or SDD structure.

The current baseline is:
- `memory/constitution.md`
- `specs/README.md`
- `specs/001-fix-frontend-cloud-run/spec.md`
- `specs/001-fix-frontend-cloud-run/plan.md`
- `specs/001-fix-frontend-cloud-run/tasks.md`
- `specs/002-product-redesign-consent-flow/spec.md`
- `specs/002-product-redesign-consent-flow/plan.md`
- `specs/002-product-redesign-consent-flow/tasks.md`
- `specs/003-firebase-phone-auth/spec.md`
- `specs/003-firebase-phone-auth/plan.md`
- `specs/003-firebase-phone-auth/tasks.md`
- `specs/004-production-ui-refresh/spec.md`
- `specs/004-production-ui-refresh/plan.md`
- `specs/004-production-ui-refresh/tasks.md`
- `specs/005-statement-upload-sync/spec.md`
- `specs/005-statement-upload-sync/plan.md`
- `specs/005-statement-upload-sync/tasks.md`

Use those files as the working `specify -> plan -> tasks -> implement` trail for future changes.

## Testing the Logic
Run the scoring logic test to see how Kwame evaluates different vendor behaviors:
```bash
python -m tests.test_scoring
```

Run the prototype consent flow test:
```bash
python -m tests.test_consent_flow
```

Run the statement upload test:
```bash
python -m tests.test_statement_upload
```
