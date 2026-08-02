# Progress

Living checklist for the AI News Digest platform. For stack, schema, and
conventions that shouldn't change often, see `CLAUDE.md` — this file is for
what's done and what's next, and is expected to be edited frequently.

## Phase 1 — Backend MVP (ingestion + schema) — DONE

- [x] `raw_items` + `summaries` tables created with the dedupe constraint
- [x] HF / GitHub / arXiv fetchers landing rows in `raw_items`
- [x] Demystifier producing level1/level2 JSON per item
- [x] Ranking function producing a capped, ordered daily feed

## Phase 2 — Frontend — DONE

- [x] Scaffold Next.js app (App Router, TypeScript, Tailwind) in `frontend/`
- [x] Feed page: fetch `GET /feed`, render the capped/ordered list (forced dynamic — see note below)
- [x] Casual/developer level toggle (switches between `level1` and `level2` body text)
- [x] Level 3 = permanent source link (`raw_items.url` via the feed response), always shown alongside the summary
- [x] Category badges/filter (Models, Research, Developer Tools, Industry News)
- [x] `glossary.json` (~50 terms) + jargon tooltip matching against rendered text
- [x] Loading / empty / error states (feed can legitimately be empty early on)
- [x] Basic responsive styling

Note: `app/page.tsx` sets `export const dynamic = "force-dynamic"`. Next 16
statically prerenders by default, which would have baked in a single
build-time snapshot of `/feed` — wrong for a page meant to change with every
ingest run, not every deploy.

## Phase 2.5 — In-app article detail page — DONE

Clicking a digest card used to jump straight to the external source with
nothing readable in between. Added a real in-app article (~150-350 words,
casual/developer toggle) between the feed teaser and the external link.

- [x] GitHub fetcher now pulls the README (not just the one-line description) so there's real material to write a longer article from
- [x] `raw_items` upsert now refreshes `raw_text` on conflict (previously only `metrics_json` refreshed, so existing GitHub rows would've kept their thin description forever)
- [x] Demystifier extended to return `article1`/`article2` in the same single call (`PROMPT_VERSION` bumped to `v2`, which naturally triggers reprocessing of the whole corpus)
- [x] New `articles` table (`backend/migrations/003_articles.sql`), same shape/versioning as `summaries`
- [x] `GET /items/{id}` endpoint joining summaries + articles + metadata
- [x] `/item/[id]` detail page + `ArticleView` component (casual/developer toggle, glossary tooltips, permanent source link)
- [x] Feed card title links in-app to the detail page; external link relabeled "View original source" and kept as a secondary link

## Phase 3 — Automation — DONE (pending Phase 4 wiring)

- [x] GitHub Actions workflow: daily cron at 06:00 UTC hitting protected `/ingest/run` then `/summarize/run` (`.github/workflows/daily-digest.yml`)
- [x] Handle the Gemini free-tier rate limit (5 req/min) in `/summarize/run` — calls are now paced ~12.5s apart
- [ ] Cron secret stored in GitHub Actions secrets, never committed — blocked on Phase 4: needs `BACKEND_URL` (repo variable) and `CRON_SECRET` (repo secret) set once the backend is deployed

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

## Phase 6 — Learn: foundational articles + catch-up timeline

Deferred by choice (2026-08-02) — the user wants both a foundational,
progressive-difficulty reference (e.g. "what is RLHF", beginner to advanced,
organized by topic) and an auto-generated timeline that aggregates already-
digested items by category so someone can catch up on recent developments.
Plan this as its own phase once Phase 2.5 has shipped and been used a bit.

- [ ] Decide topic taxonomy for foundational articles (the existing 4 feed categories don't map well onto "beginner to advanced ML concepts")
- [ ] Foundational reference articles (static content, written once, low-frequency updates)
- [ ] Timeline view: category-filterable, chronological, built from existing `raw_items`/`summaries`/`articles` data (no new content authoring needed for this half)

## Known follow-ups

- [ ] `/summarize/run` now takes ~12.5s per item (Gemini free-tier pacing), and as of Phase 2.5 does 2x the writes per item (summary + article) though still only 1 LLM call — a 50-item batch still takes ~10-11 minutes. Whatever host is picked for the backend in Phase 4 needs to support a synchronous request that long (watch out for serverless platforms with short execution-time caps); otherwise this needs to become async/chunked.
- [ ] GitHub README fetch adds ~25 extra GitHub API requests per ingest run (1 search + 25 READMEs). Unauthenticated GitHub API is capped at 60 req/hr, which is tight — `GITHUB_TOKEN` (already an optional env var) is effectively required now, not just a nice-to-have for search rate limits.
