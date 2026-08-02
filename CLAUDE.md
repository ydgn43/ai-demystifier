# Project: AI News Digest Platform

A web app that ingests AI news from Hugging Face, arXiv, and GitHub, runs it through
an LLM "Demystifier" pipeline, and serves a daily plain-English digest with a
casual/developer explain-level toggle.

Status: see `PROGRESS.md` for current phase.

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
-- Short feed-list teasers. level 1 = casual, level 2 = developer.

articles (
  id, item_id, level, body, model, prompt_version
)
-- Longer (~150-350 word) in-app reads shown on the item detail page.
-- Same level convention as summaries (1 = casual, 2 = developer).

item_metadata (
  id, item_id, category, tags, jargon_terms, prompt_version
)
```

- `level` is `1` (casual) or `2` (developer), in both `summaries` and `articles`.
  The permanent source link (`raw_items.url`) is always shown too — on the feed
  card and the detail page — as a secondary "view original source" link, never
  the only way to read more.
- `prompt_version` exists so the whole corpus can be cheaply re-summarized when the
  prompt changes. Bump it whenever the summarization prompt changes.

## The Demystifier pipeline

- One LLM call per item, not one per level. It should return strict JSON:
  `{level1, level2, article1, article2, category, tags[], jargon_terms[]}`.
  `level1`/`level2` are short feed-list teasers; `article1`/`article2` are the
  longer in-app reads (~150-350 words) shown on the item detail page.
- Hard rule, non-negotiable: summarize only from the supplied abstract/README text.
  Never state a number, benchmark, or claim that isn't in the source text. A
  hallucinated figure in a "plain English" summary is worse than no summary. This
  applies just as much to the longer articles — if the source text is thin, the
  article should be shorter, not padded with invented detail.
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

## Current progress

See `PROGRESS.md` for the phase-by-phase checklist. That file is expected to
change often; this one isn't — don't duplicate the checklist back into here.