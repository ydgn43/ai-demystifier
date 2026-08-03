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

## Phase 2.6 — Switch Demystifier from Gemini to local Ollama — DONE

Gemini's free tier turned out to cap `gemini-2.5-flash` at 20 requests/day
(separate from, and much tighter than, the 5-req/min limit already being
paced for) — discovered when a catch-up run stalled at 9/135 items. Chose
to move to a local model instead of a higher-tier paid API key.

- [x] Installed Ollama locally, pulled `qwen2.5:7b-instruct` (fits the 8GB VRAM RTX 4060 Ti comfortably)
- [x] `demystifier.py` rewritten against Ollama's structured-output chat API (JSON-schema-constrained decoding via the `format` param) — same `DemystifierOutput` shape, same prompt, no API key needed
- [x] Removed the Gemini RPM pacing sleep in `summarize.py` — no external quota to respect locally
- [x] `google-genai` dependency dropped, `ollama` added; `GEMINI_API_KEY` removed from `.env`/`.env.example`, replaced with optional `OLLAMA_HOST` (defaults to `http://localhost:11434`)

## Phase 2.7 — Restructure feed: Today vs Earlier this week, grouped by category — DONE

User feedback: the feed felt "messy" — one flat list of 25 items ranked
across everything with no structure, unlike e.g. an F1 news site where
race-weekend coverage feels current/connected and off-weeks read as clearly
general news. Fixed by giving the feed the same temporal + topical shape.

- [x] `ranking.py`: added `split_and_rank()` — buckets candidates by age (today ≤24h, this week 24h-7d, older dropped from this view) and ranks each bucket **independently** rather than slicing one global ranking, so "this week" has real content instead of leftovers (global recency-decay already biased everything toward "today")
- [x] `GET /feed` now returns `{today: [...], this_week: [...]}` instead of a flat list (`FeedResponse` schema)
- [x] Frontend `Feed.tsx` renders both time sections, each grouped by category with subheadings/counts; shows an explicit "no new items today — here's this week" line when Today is empty (mirrors the off-week framing directly)

## Phase 2.8 — Enrichment: SEO/shareability, search, editorial identity — DONE

User feedback: the site felt like "just an information dump." Presented
four concrete, realistically-scoped options (SEO polish, search, email
digest, editorial identity); user picked three, explicitly skipping the
email digest since it needs new infrastructure (email service + subscriber
storage) that CLAUDE.md says to flag before adding, not just build.

- [x] `GET /search?q=...` (new `backend/app/routes/search.py`) — Postgres full-text search (`to_tsvector`/`plainto_tsquery`, built in, no new infra) over title + both teasers + tags, reuses the existing `FeedItem` schema (its `score` field holds relevance rank instead of recency/popularity here)
- [x] `frontend/src/app/search/page.tsx` — reads `?q=`, renders results via the existing `FeedCard` (no new card component), defaults to casual level with no toggle to keep it simple
- [x] Shared `Header.tsx` (site name, About link, search form) now renders once from the root layout instead of each page duplicating its own branding
- [x] `frontend/src/app/about/page.tsx` — static page explaining what the site is and how it works
- [x] Per-item `generateMetadata()` on `/item/[id]` — shared links now show that item's real title/description instead of the generic site metadata; added `metadataBase` (`SITE_URL` env var) so OG tags resolve correctly
- [x] `sitemap.ts` and `robots.ts` (Next.js file conventions) — sitemap explicitly marked `force-dynamic` (same reasoning as the feed page: a build-time snapshot would miss all new items until the next deploy)
- [x] Replaced the default Next.js starter favicon with a programmatically-generated one (`icon.tsx` via `next/og`)

## Phase 3 — Automation — DONE (pending Phase 4 wiring)

- [x] GitHub Actions workflow: daily cron at 06:00 UTC hitting protected `/ingest/run` then `/summarize/run` (`.github/workflows/daily-digest.yml`)
- [x] ~~Handle the Gemini free-tier rate limit~~ — moot as of Phase 2.6 (local Ollama has no external RPM/RPD quota); see Phase 2.6 for what replaced it
- [ ] Cron secret stored in GitHub Actions secrets, never committed — blocked on Phase 4: needs `BACKEND_URL` (repo variable) and `CRON_SECRET` (repo secret) set once the backend is deployed

## Phase 4 — Deploy

- [ ] Hosted Postgres (Neon or Supabase) provisioned, migrations applied
- [ ] Backend deployed (host not yet decided — CLAUDE.md only specifies Vercel for the frontend)
- [ ] **New blocker as of Phase 2.6**: the Demystifier now depends on a local Ollama instance. A serverless/typical PaaS host can't run that. Needs a decision before this phase can proceed — options are a GPU-capable VM/host running both the backend and Ollama, or falling back to a hosted API (Gemini paid tier, or another provider) in production while keeping Ollama for local dev.
- [ ] Frontend deployed to Vercel, pointed at the deployed backend
- [ ] Production env vars/secrets set (`DATABASE_URL`, `CRON_SECRET`, `GITHUB_TOKEN`, `SITE_URL` set to the real domain, plus whatever the Ollama-vs-hosted-API decision above requires)
- [ ] GitHub Actions cron pointed at the production endpoint

## Phase 5 — Polish / post-launch

- [ ] Tune ranking weights (`backend/app/ranking.py`) against real traffic/data
- [ ] Re-summarize workflow for when `prompt_version` bumps
- [ ] Basic monitoring/alerting for cron and fetch failures
- [ ] Optional: email digest (summaries are kept as structured data specifically so this stays a formatting change, not a rewrite)

## Phase 6 — Learn: foundational articles + catch-up timeline — DONE

Picked back up 2026-08-03 ("let's start with phase 6"). User chose a tight
~10-article fundamentals set for Learn (not a broad 20-30 article library,
not a mechanical glossary expansion) over the two other scope options
presented.

- [x] `GET /timeline?category=&before=&limit=` (new `backend/app/routes/timeline.py`) — reverse-chronological over the same join `/feed`/`/search` use, cursor-paginated on `fetched_at` (stable, non-null), optional category filter; new `TimelineResponse` schema, `score` unused/`0.0` here since this view is chronological, not ranked
- [x] `frontend/src/app/timeline/page.tsx` — plain server component (no client JS): category filter and "Older →" pagination are just links with query params, consistent with the search page and respecting `BACKEND_API_URL` staying server-only. Results grouped under date headers, reuses `FeedCard`
- [x] `frontend/src/lib/learn-content.ts` — 10 hand-written articles (beginner→advanced: what is an LLM, transformers, training vs inference, fine-tuning, RAG, agents, open weights vs API models, quantization, evaluation/benchmarks, alignment basics). Static data file, no DB/backend involvement — matches "written once, low-frequency updates," avoids new infrastructure for content that doesn't need it
- [x] `/learn` index (grouped by level) + `/learn/[slug]` — reuses `renderWithGlossary()` on article bodies
- [x] Header nav updated (Timeline, Learn), both added to `sitemap.ts`

### Learn redesign (same day) — visual + interactive polish

Initial version read as a plain wiki page. User asked for it to feel more
interactive, mainstream, and visually appealing; picked all 3 proposed
interactive features plus general polish.

- [x] Card-grid index (`LearnIndexClient.tsx`) — icons, level color-coding (teal/amber/rose, deliberately distinct from the category badge colors), reading-time estimates, grouped by level
- [x] Reading progress tracking, client-side only (`learn-progress.ts`, `localStorage`, no accounts needed) — explicit "Mark as read" toggle rather than auto-marking on view, checkmarks + a "3 of 10 completed" progress bar on the index. Built with `useSyncExternalStore` (React's own recommended pattern for this), not `useEffect` + `setState` — the lint rule `react-hooks/set-state-in-effect` correctly caught the first draft
- [x] Prev/Next navigation between articles, computed from `LEARN_ARTICLES`' fixed order
- [x] "Related right now" section per article — reuses the existing `/search` endpoint/function as-is, ties the static Learn content back into the live digest
- [x] `/learn/[slug]` lost its `generateStaticParams` static prerendering once it started fetching live related items — same staleness bug as the feed page and sitemap, fixed the same way (`force-dynamic`)

### Timeline: read/unread tracking (same day)

Asked to bring the Learn interactivity to Timeline "where useful" — scoped
deliberately rather than porting everything: reading-time estimates, prev/
next, and related-items don't fit Timeline's shape (teaser-only cards,
already has chronological pagination, items are already live respectively).
Read/unread tracking does fit well — it's the core interaction of an inbox
or RSS reader, and Timeline's whole purpose is "catch up on what you
missed."

- [x] `timeline-progress.ts` — same `useSyncExternalStore`/`localStorage` pattern as Learn's progress hook, separate storage key, tracks item IDs instead of slugs
- [x] `FeedCard` gained optional `isRead`/`onToggleRead` props (opt-in — Feed and Search call it with neither and render exactly as before); toggling shows a checkmark and dims the card, the classic read-item treatment
- [x] `TimelineResults.tsx` (new client component) — owns the progress hook, shows "X of Y read on this page", renders the date-grouped list with read-tracking wired in. `timeline/page.tsx` itself stays a server component for fetching/filtering/pagination, same as before

### Follow-up (same day): nav clarity, an actual visual timeline, feed parity

User feedback after using it: the homepage and Timeline looked similar
enough to be mistaken for the same page, and asked for a literal timeline
visual plus the read-tracking feature on the homepage too.

- [x] Added an explicit "News" link to the header pointing at `/` — previously only the site name/logo linked home, with no nav item naming it, which was part of the "looks the same" confusion
- [x] `timeline-progress.ts` → `read-progress.ts`, `useTimelineProgress` → `useReadProgress` — no longer Timeline-specific now that the homepage feed uses it too
- [x] Timeline now has an actual visual timeline: a continuous vertical rail (`border-l-2`) down the page with a circular node per date group, instead of plain stacked date headers — the thing that makes it visually distinct from the homepage feed at a glance
- [x] Read/unread tracking (checkmark, dimming, "X of Y read") brought to the homepage `Feed.tsx` via the same shared `FeedCard` props and `useReadProgress` hook — read state is shared across homepage and Timeline since both use the same storage key/item IDs

### Phase 2.9 — Design system adoption from Figma Make mockup (same day)

User supplied a `mockup/` folder (Figma Make output) with a fully worked
design brief and reference implementation: typography inversion (mono for
machine/technical scaffolding — metadata, categories, timestamps, buttons;
sans for human-readable content — headlines, summaries), a "cool paper"
palette with exactly one structural accent color tied to the casual/
developer toggle, no colorful category badges, hairline borders instead of
shadows. Asked to implement it "where suitable." Four scope questions
resolved before starting: apply site-wide (not just the 3 screens the brief
specs) — yes; extend the pipeline for a real rewritten headline — yes;
extend it for a "why this matters" blurb too — yes; wire up the footer's
email capture to a real backend — no, visual only.

**Pipeline** (`PROMPT_VERSION` bumped to `v4`, full corpus reprocessed):
- [x] `headline` — a genuinely rewritten plain-English headline, distinct from the original paper/repo title (which now shows as a secondary mono line on the detail page). This was a real content-model gap, not just styling — the design's mono/sans split specifically depends on "technical title" and "rewritten headline" being two different things, which nothing in the pipeline produced before.
- [x] `why_it_matters_casual` / `why_it_matters_developer` — one-sentence, level-appropriate significance blurb for the detail page's callout, bundled into the same LLM call (no extra API cost)
- [x] New migration `005_headline_and_why_it_matters.sql` (three columns on `item_metadata`); `FeedItem`/`ItemDetail` schemas and every route's SQL (`/feed`, `/search`, `/timeline`, `/items/{id}`) updated; search's full-text index now includes `headline` too

**Frontend** — fonts swapped to IBM Plex Mono/Sans (`next/font/google`), new theme tokens (`bg`/`card`/`ink`/`muted`/`hairline`/`accent-casual`/`accent-dev`) replacing the old slate/violet/blue/emerald/amber palette, dark mode dropped entirely (the mockup never addressed one — treated as a deliberate, committed light-only "paper" aesthetic rather than inventing an unspecified dark variant). New shared components: `LevelToggle` (sliding-fill accent-colored segmented control, replacing the old pill toggle), `JargonTooltip` (interactive hover/tap tooltip replacing the native `<abbr title>`, with tap-outside-to-dismiss), `EmptyState`, `FeedSkeleton`. `FeedCard` and `ArticleView` fully rebuilt around the new anatomy (category as a plain hairline chip, not a colored badge; headline as the real heading; crossfade animation on toggle via a bumped `animKey`). Applied consistently across every page (Feed, Timeline, Search, Learn, About, item detail), not just the 3 screens the original brief specified. Visual-only footer email capture added.

- [x] Reprocessed the full corpus (135 items) under `v4` in the background while doing the frontend work, so headline/why-it-matters exist everywhere the redesign expects them.

### Follow-up (same day): auto-mark-as-read, English-only output

- [x] Read/unread is no longer a manual toggle — visiting an item's detail page (`ArticleView`) marks it read automatically via a `useEffect` on mount. `useReadProgress()` now exposes `markRead(id)` (one-directional, idempotent) instead of `toggleRead`; the checkbox button and `onToggleRead` prop are gone from `FeedCard` entirely — `isRead` still drives the dimmed styling, just set upstream instead of by a click on the card.
- [x] Some items were rendering in Chinese instead of English — the local model (multilingual) was following the source text's language rather than always translating. Root cause: nothing in the prompt said to always respond in English. Added an explicit hard rule to `SYSTEM_INSTRUCTION`, bumped `PROMPT_VERSION` to `v5`, verified directly against the specific item that had been in Chinese before reprocessing the full corpus.
- [x] Full-corpus `v5` reprocessing completed — the earlier background run had silently stopped after one batch (killed when its session ended, not an error), leaving only 88/135 on `v5`; resumed via the same catch-up loop (`POST /summarize/run?limit=50` until `candidates <= 0`) and confirmed 135/135 in `item_metadata`.
- [x] Even with the `v5` English-only hard rule, 2 of 135 items (both GitHub repos with READMEs entirely in Chinese, no English content at all in the source text — ids 816 `ramoncjj/mini-agent`, 949 `Honglouqaz/self-evolving-quant-agent`) still came back with Chinese headlines/summaries; 3 retries each, same result — a genuine ceiling of the 7B model when the source gives it nothing to anchor English output to, not something a prompt tweak fixes. Per the "translate or omit" instruction, omitted: their `v5` rows were deleted from `summaries`/`articles`/`item_metadata` (raw_items kept, so dedupe still holds), which drops them out of `/feed`, `/timeline`, and `/search` since all three inner-join on an exact `prompt_version` match. They'll keep getting picked up as "unsummarized" candidates by future catch-up/cron runs and keep failing the same way — harmless (one wasted local LLM call each per run) but worth knowing if they're ever noticed recurring in logs. Real fix would need a bigger/different model or a manual translation pass; not worth building special-case infrastructure for 2 items.

### Follow-up (same day): dark mode

Reverses the Phase 2.9 decision to drop dark mode. Since the mockup never
specified one, the dark palette is a bespoke extension of the light "cool
paper" language (cool grays, not warm/black; the two structural accents
brightened for legibility on dark surfaces) rather than anything from the
Figma brief.

- [x] Class-based (`.dark` on `<html>`), not just `prefers-color-scheme` — a manual toggle in the header overrides system preference, persisted to `localStorage` (`theme-mode.ts`, mirrors the `useSyncExternalStore` pattern already used by `read-progress.ts`/`learn-progress.ts`). Defaults to system preference on first visit.
- [x] All theme tokens (`bg`/`card`/`ink`/`muted`/`hairline`/`accent-casual`/`accent-dev`) restructured as CSS custom properties with a `.dark` override block in `globals.css`, fed into Tailwind's `@theme inline` — every existing `bg-*`/`text-*`/`border-*` utility class picks up dark values automatically, no per-component `dark:` variants needed. `Tailwind v4` needs an explicit `@custom-variant dark (&:where(.dark, .dark *));` for class-based (rather than media-query) dark mode.
- [x] `theme.ts`'s `ACCENT_CASUAL`/`ACCENT_DEV` now resolve to `var(--accent-casual)`/`var(--accent-dev)` instead of literal hex, so every inline-style consumer (`LevelToggle`, `FeedCard`, `ArticleView`, `JargonTooltip`, etc.) stays correct in both themes with zero component changes.
- [x] `ThemeScript` (inline `next/script` with `strategy="beforeInteractive"` in the root layout) applies the class before hydration to avoid a flash of the wrong theme on load.
- [x] Fixed five spots that hardcoded `text-white` on a `bg-ink` surface (category-filter pills, the Learn "mark as read" button/checkmark badge, the footer subscribe button) — `ink` itself flips between near-black and near-white across themes, so these needed `text-bg` instead to stay legible in both. Left `text-white`-on-accent-color spots (the toggle's active pill, "View source" button) alone since both accent colors were chosen to keep working with white text in either theme.
- Not visually screenshot-tested — no browser tool available in this session. Verified via a clean `npm run build`, and by inspecting the compiled dev CSS output directly to confirm the `.dark { ... }` override block and the inlined `beforeInteractive` script are both present as expected.

### Follow-up: bookmarking

Client-side only, same as read/learn progress and theme — no accounts exist,
so "save for later" lives in `localStorage`, not a new table.

- [x] `GET /items?ids=1,2,3` (new, in `item.py` alongside the existing `GET /items/{id}`) — batch-fetches the `FeedItem` shape for a list of ids, silently skips ids that don't resolve (deleted/never existed). `score` is unset here (`0.0`), same treatment as `/timeline` — this view isn't ranked either.
- [x] `bookmarks.ts` — `useBookmarks()` hook, the same `useSyncExternalStore`/`localStorage` pattern as `read-progress.ts`/`learn-progress.ts`/`theme-mode.ts`. Unlike read-tracking, bookmarking stays an explicit action (never automatic).
- [x] `BookmarkButton.tsx` — self-contained client component (reads `useBookmarks()` itself rather than taking `isBookmarked`/`onToggle` props), so it drops straight into `FeedCard` and works everywhere `FeedCard` is rendered — including from server components like `/search` and the Learn "related right now" section — without those pages needing to become client components or thread bookmark state through props.
- [x] `/bookmarks` page — the one page in this app that can't be a server component: the id list only exists in this browser's `localStorage`, so there's nothing to fetch server-side. It's a client component that resolves ids via a new same-origin route handler (`app/api/items/route.ts`), which is the thin proxy to the backend — `BACKEND_API_URL` stays server-only this way, consistent with every other page, and it sidesteps the backend having no CORS setup for direct browser calls. Sorts results back into save-order (most recent first) client-side, since the backend has no reason to know it.
- [x] Header nav gained a "Bookmarks" link. Not added to `sitemap.ts`, same reasoning as `/search`: no canonical server-renderable content, purely per-browser.
- Not visually tested in a browser (no browser tool available this session) — verified via a clean `npm run build` and curling the full chain (`backend /items?ids=` → frontend `/api/items` proxy → expected JSON) directly.

### Follow-up: surface source popularity metrics (stars / upvotes)

The data already existed — `raw_items.metrics_json` (`{"stars": N, "language": ...}`
for github, `{"upvotes": N}` for huggingface, `{}` for arxiv) has been captured
by the fetchers and used by `ranking.py`'s scoring since Phase 1. It just
wasn't exposed past the ranking step. This is purely a surfacing change, no
new data collection.

- [x] `FeedItem`/`ItemDetail` gained a `metrics: dict[str, Any] = {}` field; every SQL query building either shape (`/feed`, `/search`, `/timeline`, `/items`, `/items/{id}`) now selects `ri.metrics_json AS metrics` — same raw dict ranking.py already reads, just aliased into the response shape.
- [x] `frontend/src/lib/metrics.ts` — `formatMetric(source, metrics)`, source-aware (★ stars for github, ▲ upvotes for huggingface, nothing for arxiv), compact-formats large counts (`1.2k`). Rendered in `FeedCard` and `ArticleView`'s existing meta line (`source · date · metric`), no new UI element needed.
- Verified end-to-end: curled all five affected backend endpoints directly, then confirmed real star/upvote values render in the actual homepage HTML through the Next dev server.

**Gotcha hit while testing** (worth remembering, not a code bug): `uvicorn --reload` on Windows leaves orphaned worker subprocesses behind when you kill the reloader PID directly (`Stop-Process` on the parent doesn't take the multiprocessing-spawned child with it) — one of those zombies kept answering on port 8000 with pre-edit code for a while, which looked exactly like "the backend isn't picking up schema changes." Confirmed via `/openapi.json` (shows the live process's actual Pydantic schema) and `Get-CimInstance Win32_Process` to find the orphan's command line. Fix: enumerate every `python.exe` process and kill all of them before starting one clean instance, rather than trusting a single `Stop-Process` on the PID `Get-NetTCPConnection` reports (that can be stale immediately after a kill).

## Known follow-ups

- [x] ~~`/summarize/run` per-item timing~~ — measured: ~10-15s/item warm (RTX 4060 Ti, qwen2.5:7b-instruct), so a 50-item batch is now ~10-12 min instead of the old Gemini-paced ~11 min — similar wall-clock time, still a long synchronous request. The serverless-execution-time-cap risk for Phase 4 noted below still applies.
- [ ] Article length (`article1`/`article2`) caps around 100-110 words with qwen2.5:7b-instruct even with explicit "150+ words" prompting and `num_predict` raised — a real instruction-following ceiling for this model size, not a bug. Accepted as-is (2026-08-03); revisit if it feels too thin in practice (options: few-shot prompting, a bigger model).
- [x] ~~GitHub ingestion had no AI/ML topical filter~~ — fixed (2026-08-03): the fetcher previously did `created:>yesterday, sort:stars` with no subject-matter filter at all, so generic high-star repos (a game booster, a checkers game, a movie app) were ranking into the feed. Now runs one search per AI/ML topic (`machine-learning`, `llm`, `nlp`, `computer-vision`, etc.) and merges/dedupes the results. Stale non-AI rows already in the DB were cleared via `backend/migrations/004_clear_stale_github_items.sql`.
- [ ] GitHub API requests per ingest run went from ~26 (1 search + 25 READMEs) to ~35 (10 topic searches + up to 25 READMEs). Unauthenticated GitHub API is capped at 60 req/hr, which is now genuinely tight — `GITHUB_TOKEN` (already an optional env var) is effectively required, not just a nice-to-have.
- [ ] Local-Ollama-vs-Phase-4-deploy tension (see Phase 4) is unresolved — needs a decision before deploy can proceed.
- [ ] `npm run build` hit a JS heap OOM twice in a row during the Phase 2.9 work, resolved by stopping the Next dev server first and retrying — this machine was under genuine memory pressure (4GB free of 31.7GB) from the Ollama reprocessing job plus normal desktop usage, not a code issue. Worth remembering as a real constraint of doing local builds while `/summarize/run` batches are active on this hardware.
