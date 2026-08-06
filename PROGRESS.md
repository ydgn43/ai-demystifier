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

**Decision made (2026-08-04), updated same day**, resolving the Phase 2.6
Ollama-hosting blocker: self-host the backend + Ollama **and** Postgres,
all on this PC (zero pipeline code changes, zero GPU cloud cost, no hosted-
DB account needed either) — Postgres stays purely local, never exposed
externally, since only the backend on the same machine ever talks to it
directly. The backend is exposed via Tailscale Funnel for a stable public
HTTPS URL without port-forwarding/a static IP. Frontend still deploys to
Vercel as originally planned. Full step-by-step runbook: `DEPLOY.md`.
Accepted tradeoffs: the live site (`/feed`, `/search`, `/item/[id]`) is only
up while this PC is on and connected — `/learn` and `/timeline` are static
and unaffected; and the database now has no managed backups, just
`docker-compose.yml`'s `restart: unless-stopped` plus an optional manual
`pg_dump` cadence. Revisit either if they stop being fine.

- [ ] Postgres confirmed to survive a real reboot (Docker Desktop start-on-boot) — `DEPLOY.md` step 2
- [ ] Backend exposed via Tailscale Funnel, running persistently (not just an interactive terminal session) — `DEPLOY.md` step 1
- [x] ~~New blocker as of Phase 2.6~~ — resolved above
- [ ] Frontend deployed to Vercel, pointed at the deployed backend — `DEPLOY.md` step 3
- [ ] Production env vars/secrets set (`DATABASE_URL` stays as-is — local Postgres, no change needed; `CRON_SECRET`, `GITHUB_TOKEN`, `SITE_URL` set to the real domain) — `DEPLOY.md` steps 2-4
- [x] GitHub Actions cron workflow ready to point at production — `BACKEND_URL`/`CRON_SECRET` wiring already existed; workflow itself improved 2026-08-04 to surface per-source/per-item failures as annotations instead of failing silently (see Known follow-ups). Setting the actual repo variable/secret values is `DEPLOY.md` step 4, still pending.

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

### Follow-up: bookmark icon (same day)

- [x] `BookmarkButton` swapped its `★`/`☆` glyphs for a small inline SVG bookmark-ribbon icon (outline unsaved, filled saved) — the star read as "favorite/rating," not "save for later," and was the only glyph-based icon on the site instead of a purpose-built one.

### Follow-up: replace Timeline with a curated history of AI/ML (2026-08-04)

User wanted something different from the live catch-up view `/timeline` had been since Phase 6: multiple category timelines plus one general timeline covering AI/ML's actual history, not just recently-ingested items.

- [x] `/timeline` repurposed entirely (same URL/nav label, different content and purpose) into a static, hand-researched history: `frontend/src/lib/history-content.ts`, 39 milestones (1943 McCulloch-Pitts neuron → 2023 GPT-4) researched via WebSearch/WebFetch against Wikipedia and primary sources (arXiv papers, official announcements), each with a real verifiable `sourceUrl` — same "no invented claims" discipline as the Demystifier pipeline, applied to hand-curation instead of LLM generation. Same static-file pattern as `learn-content.ts` — no DB, no pipeline involvement, low-frequency hand edits going forward.
- [x] Old live/read-tracking Timeline removed: backend `GET /timeline` route, `TimelineResponse` schema, and `TimelineResults.tsx` all deleted — grepped first to confirm nothing else referenced them. Read/unread tracking stays on the homepage Feed (`read-progress.ts` untouched).
- [x] **Visual redesign same day**, after initial feedback that 39 uniform cards read "like a news feed, not history": restructured around 7 real historical eras (Origins, The First AI Winter, Quiet Progress, Setting the Stage, The Deep Learning Boom, The Transformer Era, The Generative AI Era — each with a title/year-range/one-line blurb) with 11 hand-picked landmark moments (Dartmouth Workshop, the Perceptron, Backprop, ImageNet, AlexNet, AlphaGo, the Transformer paper, GPT-3, AlphaFold 2, ChatGPT, GPT-4) getting full spotlight cards while the other 28 render as a tight `divide-y` compact list — hierarchy via typographic weight/size only, no new colors (the site's two accent colors stay semantically tied to the casual/developer toggle, not reused here).
- Verified both passes with a real browser (not just `npm run build`) — screenshotted the era headers, the landmark/compact contrast, the zero-landmark "First AI Winter" era rendering as list-only with no empty spotlight gap, and the category-filter edge case.
- Both builds were done via forked background agents (research + implementation, then a second fork for the visual redesign) to keep the research/iteration noise out of the main conversation; verified independently afterward rather than trusting the reports as-is — first fork attempt actually did nothing (0 tool calls, no file changes) and had to be resumed with an explicit "you didn't do the work" prompt before it produced real output.

### Follow-up: engagement features batch (2026-08-04)

Picked from a menu of suggested next steps (deploy, reliability, engagement, pipeline quality) — user chose all four; this covers the engagement-feature portion, built via a forked background agent and independently verified afterward (browser checks, not just the report).

- [x] "On this day in AI history" homepage widget (`HistorySpotlight.tsx`) — since no `Milestone` has day-level precision, an exact "on this day" match is never honestly possible; uses a deterministic day-of-year cycle through all 39 milestones instead, labeled "From AI history" rather than implying a real date match.
- [x] History landmarks cross-linked to live related feed items — same `keywords` → `searchItems()` → top-3 `FeedCard`s pattern Learn already uses for "Related right now." Added optional `keywords` field to `Milestone`, populated on the 11 landmark entries only; renders nothing (no empty section) when there's no live match, which is most of the 11 given the current small corpus.
- [x] RSS feed (`frontend/src/app/feed.xml/route.ts`) — RSS 2.0 chosen over Atom (less boilerplate, no feature this app needs that Atom-only offers), XML-escaped, linked from the footer.
- [x] `/search` extended to also match `LEARN_ARTICLES` and `HISTORY_MILESTONES` (plain substring match, server-side, no new infra) under separate "From Learn"/"From History" sections below the live results.

### Follow-up: Phase 4 went live but `/feed` didn't load — tunnel swap + backlog gaps (2026-08-06)

Site deployed per DEPLOY.md, but `/feed`/`/search`/`/item/[id]` stayed empty/erroring while `/learn`/`/timeline` (static) worked fine.

- [x] Root cause #1: Tailscale Funnel had a deterministic `ECONNRESET` mid-TLS-handshake on every request from Vercel's serverless functions (100% reproducible, unaffected by switching Vercel's function region iad1→fra1) — matches a known class of Tailscale relay-side TLS issues, not a local misconfiguration. Fixed by switching to Cloudflare Tunnel (`cloudflared tunnel --url`); confirmed clean 5/5 and 8/8 request batches after the swap. DEPLOY.md rewritten for Cloudflare Tunnel; currently a no-account "quick tunnel" (free, but URL isn't stable across `cloudflared` restarts — documented tradeoff, no Task Scheduler persistence set up yet since that registration got blocked by the local permission classifier).
- [x] Root cause #2 (separate bug, unmasked once #1 was fixed): `BACKEND_API_URL` picked up a trailing slash when re-set via `vercel env add`, so `${BACKEND_API_URL}/feed` built a double-slash path the backend correctly 404'd on. Fixed by re-setting the env var and verifying its exact byte length before redeploying.
- [x] Root cause #3 (pre-existing, unrelated to deploy): `PROMPT_VERSION` had been bumped `v5`→`v6` (2026-08-04, see the article-length example follow-up above) but the corpus was never re-summarized under `v6` — `/feed`'s exact-version join returned zero rows regardless of connectivity. Backfilled via repeated `POST /summarize/run?limit=50` batches against the local backend directly (~10-15s/item, same Ollama cost as the normal cron path).
- Lesson worth keeping: an empty/erroring feed can stack multiple independent causes (network, a data-plumbing bug, and a stale-data issue) — fixing the first one doesn't mean the others aren't still there. Verify with real data each time, not just "the connection works now."

### Follow-up: replace daily-capped feed with full chronological pagination (2026-08-06)

User wanted nothing to ever become unreachable — e.g. still able to see Aug 5th's items on Aug 19th. Data was already never deleted (`raw_items` etc. have no purge logic), but the old `/feed` (`today`/`this_week` buckets, `ranking.py`'s `split_and_rank`) explicitly dropped anything older than a week from view entirely, with no way to page back to it.

- [x] `GET /feed` now takes `?page=N` (1-indexed, 25/page) and returns `{items, page, total_pages, total_items}` — a flat, reverse-chronological (`COALESCE(published_at, fetched_at) DESC`) listing over the *entire* corpus instead of a ranked/capped daily view. `ranking.py`'s `score_item`/`rank_items`/`split_and_rank` machinery left untouched (still computed per-item for the `score` field, still available for a future ranked view e.g. an email digest) — just no longer what decides `/feed`'s ordering or day-cap.
- [x] Frontend: `Feed.tsx` renders one flat (category-grouped, as before) list instead of Today/This Week sections; new `Pagination.tsx` (windowed page numbers + Prev/Next, ellipses once the corpus grows past a few pages) at the bottom; `page.tsx` reads `searchParams.page`. `sitemap.ts` updated to walk every page (previously only saw `today`+`this_week`) so all items stay discoverable; `feed.xml` updated for the new response shape.
- Verified: paginated backend directly (page 1 vs page 2 have no overlapping ids, page 2 strictly older), `next build` + `tsc --noEmit` clean, then a real local production server (`next start`) checked in-browser (category grouping, pagination control, page 2 navigation all confirmed visually) before deploying.

### Follow-up: expand Learn content + add citations (2026-08-06)

User wanted the Learn section's content improved and extended. All 10 existing articles were text/LLM-centric despite the site's news sources covering all of AI/ML (no vision/image/multimodal coverage at all), and unlike the sibling curated-history feature (`history-content.ts`, every entry has a `sourceUrl`), Learn had no citations.

- [x] `LearnArticle` gained an optional `furtherReading?: { title: string; url: string }[]` field — same verifiability discipline as History's `sourceUrl`, adapted to a short link list since Learn is explainer-style rather than claim-by-claim. Backfilled onto all 10 existing articles (1 real paper/explainer link each) and added to 7 new ones. All 17 URLs verified resolving (HTTP 200) before merging, not just plausible-sounding.
- [x] 7 new articles added, filling the vision/multimodal gap and several concepts that show up constantly in current AI news: `machine-learning-vs-deep-learning`, `tokens-and-tokenization` (beginner); `vector-embeddings-and-vector-databases`, `multimodal-models-beyond-text` (intermediate); `mixture-of-experts`, `reasoning-models-and-chain-of-thought`, `diffusion-models-how-image-generators-work` (advanced). Inserted within the existing level blocks (not appended) so the beginner→advanced reading order stays coherent; natural cross-references woven in (e.g. mixture-of-experts ↔ quantization, diffusion ↔ multimodal, embeddings ↔ RAG). Library goes from 10 → 17 articles.
- [x] New "Further reading" section added to `learn/[slug]/page.tsx`, reusing the exact visual pattern already established by "Related right now" (same hairline border, mono uppercase label).
- [x] Fixed a stale comment in `search/page.tsx` hardcoding "9 Learn articles, 39 milestones" (already wrong — was 10) — reworded to not hardcode a count that rots again.
- [x] No `glossary.json` changes needed — it already had entries for every new topic's core term.
- Verified: `tsc --noEmit` + `next build` clean, then a real local production server checked in-browser — index page (17 cards, "0 of 17 completed"), a new article page (glossary tooltips, Further Reading link, live "Related right now" match, correct prev/next), a backfilled existing article (citation renders, nothing else shifted), search (`?q=diffusion` surfaces the new article under "From Learn"), and `/sitemap.xml` (all 17 slugs present).
- Note: a forked background agent was tried first for the actual content writing (per the `history-content.ts` precedent of delegating this kind of work) but failed mid-response — the user's network connection changed mid-task — before writing anything. Done directly instead rather than retrying the fork.

## Known follow-ups

- [x] `ranking.py`'s `METRIC_SCALE` github cap recalibrated from an arbitrary 500 to 5 (2026-08-04), grounded in the live corpus rather than guessed: real github stars were 0-1 across the entire sample (p99=1, since the fetcher only pulls repos created in the last 24h — no time for stars to accumulate), so the old cap crushed the metric component to ~0 for every item. huggingface's cap (100) checked out fine against real data (p90=89) and was left as-is.
- [x] `daily-digest.yml` (2026-08-04): fixed a stale comment claiming `/summarize/run` still paces Gemini free-tier calls (moot since the Phase 2.6 Ollama switch); both steps now parse the JSON response and surface per-source ingest failures / per-item summarize failures as GitHub Actions annotations instead of only being visible if someone reads the raw response body by hand.

- [x] ~~`/summarize/run` per-item timing~~ — measured: ~10-15s/item warm (RTX 4060 Ti, qwen2.5:7b-instruct), so a 50-item batch is now ~10-12 min instead of the old Gemini-paced ~11 min — similar wall-clock time, still a long synchronous request. The serverless-execution-time-cap risk for Phase 4 noted below still applies.
- [ ] Article length (`article1`/`article2`): tried a worked few-shot example in `SYSTEM_INSTRUCTION` (2026-08-04, `PROMPT_VERSION` bumped to `v6`) — measured real improvement (casual ~87→~98 words avg, developer ~93→~109 words avg across 4 real items, 7/8 measurements improved) but every sample still lands under the 150-word floor (best case 118 words). Kept the change since it's a genuine, rule-compliant gain, but this confirms rather than fixes the underlying ceiling — a bigger/different model is still the only path to actually hitting 150+.
- [x] ~~GitHub ingestion had no AI/ML topical filter~~ — fixed (2026-08-03): the fetcher previously did `created:>yesterday, sort:stars` with no subject-matter filter at all, so generic high-star repos (a game booster, a checkers game, a movie app) were ranking into the feed. Now runs one search per AI/ML topic (`machine-learning`, `llm`, `nlp`, `computer-vision`, etc.) and merges/dedupes the results. Stale non-AI rows already in the DB were cleared via `backend/migrations/004_clear_stale_github_items.sql`.
- [ ] GitHub API requests per ingest run went from ~26 (1 search + 25 READMEs) to ~35 (10 topic searches + up to 25 READMEs). Unauthenticated GitHub API is capped at 60 req/hr, which is now genuinely tight — `GITHUB_TOKEN` (already an optional env var) is effectively required, not just a nice-to-have.
- [x] ~~Local-Ollama-vs-Phase-4-deploy tension~~ — resolved 2026-08-04, see Phase 4: self-host this PC rather than a cloud GPU host or hosted API. Tunnel choice (Tailscale Funnel → Cloudflare Tunnel) changed 2026-08-06, see follow-up below.
- [ ] `npm run build` hit a JS heap OOM twice in a row during the Phase 2.9 work, resolved by stopping the Next dev server first and retrying — this machine was under genuine memory pressure (4GB free of 31.7GB) from the Ollama reprocessing job plus normal desktop usage, not a code issue. Worth remembering as a real constraint of doing local builds while `/summarize/run` batches are active on this hardware.
