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

## Testing the Logic
Run the scoring logic test to see how Kwame evaluates different vendor behaviors:
```bash
uv run python -m tests.test_scoring
```
