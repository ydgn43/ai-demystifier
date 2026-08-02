# Progress

Living checklist for the AI News Digest platform. For stack, schema, and
conventions that shouldn't change often, see `CLAUDE.md` — this file is for
what's done and what's next, and is expected to be edited frequently.

## Phase 1 — Backend MVP (ingestion + schema) — DONE

- [x] `raw_items` + `summaries` tables created with the dedupe constraint
- [x] HF / GitHub / arXiv fetchers landing rows in `raw_items`
- [x] Demystifier producing level1/level2 JSON per item
- [x] Ranking function producing a capped, ordered daily feed

## Phase 2 — Frontend

- [ ] Scaffold Next.js app (App Router, TypeScript, Tailwind) in `frontend/`
- [ ] Feed page: fetch `GET /feed`, render the capped/ordered list
- [ ] Casual/developer level toggle (switches between `level1` and `level2` body text)
- [ ] Level 3 = permanent source link (`raw_items.url` via the feed response), always shown alongside the summary
- [ ] Category badges/filter (Models, Research, Developer Tools, Industry News)
- [ ] `glossary.json` (~50 terms) + jargon tooltip matching against rendered text
- [ ] Loading / empty / error states (feed can legitimately be empty early on)
- [ ] Basic responsive styling

## Phase 3 — Automation

- [ ] GitHub Actions workflow: daily cron at 06:00 UTC hitting protected `/ingest/run` then `/summarize/run`
- [ ] Handle the Gemini free-tier rate limit (5 req/min) in `/summarize/run` — pace calls or chunk the cron job, otherwise most of a real batch will fail
- [ ] Cron secret stored in GitHub Actions secrets, never committed

## Phase 4 — Deploy

- [ ] Hosted Postgres (Neon or Supabase) provisioned, migrations applied
- [ ] Backend deployed (host not yet decided — CLAUDE.md only specifies Vercel for the frontend)
- [ ] Frontend deployed to Vercel, pointed at the deployed backend
- [ ] Production env vars/secrets set (`DATABASE_URL`, `CRON_SECRET`, `GEMINI_API_KEY`, `GITHUB_TOKEN`)
- [ ] GitHub Actions cron pointed at the production endpoint

## Phase 5 — Polish / post-launch

- [ ] Tune ranking weights (`backend/app/ranking.py`) against real traffic/data
- [ ] Re-summarize workflow for when `prompt_version` bumps
- [ ] Basic monitoring/alerting for cron and fetch failures
- [ ] Optional: email digest (summaries are kept as structured data specifically so this stays a formatting change, not a rewrite)

## Known follow-ups

- [ ] Gemini free-tier rate limit was hit mid-batch during pipeline testing (2026-08-02) — `/summarize/run` needs request pacing before the cron job can run at scale
