# ai-demystifier
An automated pipeline and Next.js feed converting dense AI research, models, and repos into concise Plain language updates with interactive jargon tooltips and difficulty toggles.

## Development

Backend (FastAPI + Postgres):

```bash
cp .env.example .env          # then edit CRON_SECRET, etc.
docker compose up -d          # starts Postgres on localhost:5432

cd backend
python -m venv .venv && .venv\Scripts\activate   # (or `source .venv/bin/activate` on macOS/Linux)
pip install -r requirements.txt

python -m migrations.run_migrations   # applies backend/migrations/*.sql

uvicorn app.main:app --reload --app-dir .
```

Trigger an ingest run manually:

```bash
curl -X POST http://localhost:8000/ingest/run -H "X-Cron-Secret: <value from .env>"
```
