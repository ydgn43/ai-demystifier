# Project: AI News Digest Platform

A web app that ingests AI news from Hugging Face, arXiv, and GitHub, runs it through
an LLM "Demystifier" pipeline, and serves a daily plain-English digest with a
casual/developer explain-level toggle.

Status: MVP build, Week 1 (ingestion + schema).

## Goal (read this first)

This is primarily a learning project with a real chance of becoming a public launch.
Prefer simple, well-understood patterns over clever ones. Don't introduce new
infrastructure (queues, caches, extra services) unless the current approach has
actually broken down — flag it and ask first, don't just add it.

## Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI
- Database: PostgreSQL (Neon or Supabase)
- LLM: Google Gemini API (free tier), Gemini 2.5 Flash for the summarization pipeline
- Deploy: Vercel (frontend), same Postgres provider for hosted DB
- Cron: GitHub Actions hitting a protected endpoint, daily at 06:00 UTC

## Data sources (MVP = these three, in this priority order)

1. Hugging Face Daily Papers — free, no auth, community-ranked
2. GitHub Search API — repos sorted by stars gained today
3. arXiv API — cs.LG, cs.CL, cs.AI categories

X/Twitter is explicitly out of scope for the MVP due to API cost. Don't add it
without being asked.

## Schema (do not change without discussion — many things depend on this)

```sql
raw_items (
  id, source, external_id, url, title, raw_text,
  published_at, metrics_json, fetched_at
)
-- UNIQUE constraint on (source, external_id) is the dedupe backbone. Never drop it.

summaries (
  id, item_id, level, body, model, prompt_version
)
```

- `level` is `1` (casual) or `2` (developer). There is no separate "level 3" row —
  level 3 is just the permanent source link (`raw_items.url`), always shown.
- `prompt_version` exists so the whole corpus can be cheaply re-summarized when the
  prompt changes. Bump it whenever the summarization prompt changes.

## The Demystifier pipeline

- One LLM call per item, not one per level. It should return strict JSON:
  `{level1, level2, category, tags[], jargon_terms[]}`.
- Hard rule, non-negotiable: summarize only from the supplied abstract/README text.
  Never state a number, benchmark, or claim that isn't in the source text. A
  hallucinated figure in a "plain English" summary is worse than no summary.
- Categories: Models, Research, Developer Tools, Industry News.
- Jargon tooltips come from a static `glossary.json` (~50 terms) matched against
  rendered text — not detected by an LLM at request time.

## Ranking

Weighted score over source-native signals (HF upvotes, GitHub stars-gained-today,
recency). Feed is capped at 25 items/day. Expect this function to be tuned often —
treat it as a first-class, frequently-edited piece of logic, not a one-off script.

## Conventions

- Python: FastAPI, type hints everywhere, Pydantic models for API responses.
- TypeScript: strict mode on, no `any` unless justified in a comment.
- Commits: small and scoped. Don't bundle schema changes with unrelated feature work.
- No new dependencies without a one-line reason in the commit message.

## What NOT to do

- Don't add Redis, Kafka, or a task queue. Postgres is the queue at this scale.
- Don't build a custom scheduler — GitHub Actions cron is sufficient.
- Don't pre-render summaries as HTML. Keep them as structured data (JSON/text) so
  the email digest and any future API stay a formatting change, not a rewrite.
- Don't touch the `(source, external_id)` unique constraint.
- If a source fetch fails, the pipeline should still ship the feed without it —
  partial failure must be non-fatal.

## Current phase checklist

- [x] `raw_items` + `summaries` tables created with the dedupe constraint
- [x] HF / GitHub / arXiv fetchers landing rows in `raw_items`
- [x] Demystifier producing level1/level2 JSON per item
- [ ] Ranking function producing a capped, ordered daily feed