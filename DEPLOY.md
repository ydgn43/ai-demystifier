# Deploy runbook (Phase 4)

Decided approach (2026-08-04, updated 2026-08-05): the backend + Ollama +
Postgres **all** keep running on this PC — no pipeline code changes, no GPU
cloud bill, no hosted-DB account needed. A Cloudflare Tunnel exposes the
backend to the internet over HTTPS without port-forwarding or a static IP.
Postgres stays purely local (`localhost:5432`, never exposed externally) —
only the backend on this same machine ever talks to it directly; Vercel and
GitHub Actions only ever talk to the backend's HTTP API, never the
database. The frontend deploys to Vercel as originally planned.

**Why Cloudflare Tunnel and not Tailscale Funnel (tried first)**: Tailscale
Funnel was the original choice and worked from most clients, but Vercel's
`iad1`/`fra1` serverless functions hit a deterministic `ECONNRESET` mid-TLS-
handshake on every request when fetching through it — reproducible 100% of
the time, unaffected by changing Vercel's function region, and matching a
known class of Tailscale Funnel relay-side TLS issues (not anything
misconfigured locally). Cloudflare Tunnel resolved it immediately, same
request pattern, 5/5 clean.

**Current setup is a "quick tunnel"** (`cloudflared tunnel --url
http://127.0.0.1:8000`, no Cloudflare account) — free, no signup, but no
uptime guarantee, and **the public URL changes every time the `cloudflared`
process restarts** (crash, reboot, manual kill). There's no way to pin the
URL without a domain added to Cloudflare and a proper *named* tunnel. If a
restart ever happens, `BACKEND_API_URL` (Vercel) and `BACKEND_URL` (GitHub
Actions variable, see step 4) both need to be updated to the new URL and
the frontend redeployed. Upgrading to a named tunnel with a real domain
(~$3-15/yr) is a worthwhile future improvement, but wasn't required to get
back to a working site.

**Known tradeoffs, accepted on purpose**:
- `/feed`, `/search`, `/item/[id]`, and the live parts of the site all fetch
  from the backend on every request (several routes are `force-dynamic`).
  That means the live site is only up when this PC is on and connected to
  the internet. `/learn` and `/timeline` are static and unaffected.
- The database now only exists on this PC too — no managed backups, no
  automatic failover. `docker-compose.yml` already sets
  `restart: unless-stopped` so the container itself comes back after a
  reboot, but that's not a backup. Worth a periodic `pg_dump` (see step 2)
  until/unless this stops being acceptable.

Steps below are grouped by who does them. Account creation, logins, and
web-console clicks are yours — I can't do those. Code/config changes are
mine, and are already done where marked.

## 1. Expose this backend with Cloudflare Tunnel — **you**

1. Install cloudflared on this PC: `winget install --id Cloudflare.cloudflared -e`.
2. Start the backend normally first (`uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000` — note `--host 0.0.0.0`, not `--reload`'s default `127.0.0.1`).
3. `cloudflared tunnel --url http://127.0.0.1:8000` — this prints a public HTTPS URL like `https://<random-words>.trycloudflare.com`. No Cloudflare account needed for this quick-tunnel mode.
4. Confirm from *outside* this network (phone on cellular data, or ask someone else) that `https://<that-url>/health` responds.
5. Keep both processes running persistently, not just in interactive terminals you might close:
   - Simplest: Task Scheduler → create a task that runs at log-on for each of the `uvicorn` command (step 2) and the `cloudflared tunnel` command (step 3), "run whether user is logged on or not" if you want it to survive logout.
   - More robust alternative if you want real service semantics (auto-restart on crash, logs): [NSSM](https://nssm.cc/) wrapping the same commands as Windows services. Not required to start.
   - **Remember**: unlike Tailscale Funnel, a quick tunnel's URL is not stable across restarts of the `cloudflared` process — see the "why Cloudflare Tunnel" note above. After any restart, re-check the printed URL and update `BACKEND_API_URL` / `BACKEND_URL` (steps 3 and 4 below) if it changed.

No CORS changes were needed — the frontend only calls the backend from the
Next.js *server* (Vercel), never from the browser, so cross-origin rules
don't apply here.

## 2. Postgres stays local — nothing new to set up

`docker compose up -d` (already how dev runs it, per `README.md`) is the
whole story — `DATABASE_URL` in the root `.env` stays exactly as it is now
(`postgresql://ai_demystifier:ai_demystifier@localhost:5432/ai_demystifier`).
No account, no connection string to copy, no `.env` edit here.

1. Make sure Docker itself starts on boot (Docker Desktop → Settings →
   General → "Start Docker Desktop when you sign in to your computer") so
   the `postgres` container's `restart: unless-stopped` actually has
   something to restart *into* after a real reboot, not just a Docker
   Desktop crash while the machine stays on.
2. Recommended, not required to start: a periodic backup, since this is now
   the only copy of the data. Simplest option — a scheduled task (same
   mechanism as step 1.6) running
   `docker compose exec -T postgres pg_dump -U ai_demystifier ai_demystifier > backup-%date%.sql`
   on whatever cadence feels right. Skip for now if you're fine with "this
   PC's disk is the only copy" while the project is at this stage.
3. Migrations only need running once, and probably already have been in
   dev: `cd backend && python -m migrations.run_migrations` — idempotent,
   tracks what's applied in a `schema_migrations` table, safe to re-run if
   you're ever unsure.
4. `GITHUB_TOKEN` (root `.env`) — currently optional, but PROGRESS.md's
   "Known follow-ups" flags the unauthenticated GitHub Search API rate
   limit (60/hr) as genuinely tight against the ~35 requests/run the
   fetcher now makes since the AI/ML topic filter landed. Worth setting
   before this runs unattended daily. No scopes needed for public repos:
   https://github.com/settings/tokens

## 3. Frontend on Vercel — **you**

1. Import the GitHub repo into Vercel, set the project root to `frontend/`.
2. Environment variables (Vercel project settings):
   - `BACKEND_API_URL` = the Cloudflare Tunnel URL from step 1.3 (e.g. `https://random-words.trycloudflare.com`) — **not** `localhost`.
   - `SITE_URL` = whatever domain Vercel assigns (or your custom domain if you attach one) — this feeds `metadataBase`/OG tags/the sitemap, currently defaults to `http://localhost:3000`.
3. Deploy. Load the live URL and confirm the homepage actually shows real feed data (not just that it builds) — that's the real test that `BACKEND_API_URL` is reaching this PC correctly.

## 4. Point the cron at production — **you** set repo config, workflow already updated

The workflow (`.github/workflows/daily-digest.yml`) already reads these and
already surfaces per-source/per-item failures as annotations instead of
failing silently (done 2026-08-04) — nothing left to change in the file
itself.

1. Repo Settings → Secrets and variables → Actions → **Variables**: add `BACKEND_URL` = the same Cloudflare Tunnel URL from step 1.3.
2. Repo Settings → Secrets and variables → Actions → **Secrets**: add `CRON_SECRET` = the exact same value as `CRON_SECRET` in this PC's `.env`.
3. Trigger it manually once to verify end-to-end before trusting the 06:00 UTC schedule: Actions tab → Daily Digest → Run workflow. This is the same `workflow_dispatch` trigger already in the workflow, no code change needed to test it on demand.

## Verification checklist

- [ ] `https://<tunnel-url>/health` reachable from outside your LAN
- [ ] Backend *and* Postgres both survive a real reboot of this PC (Task Scheduler entries for `uvicorn` and `cloudflared`, plus Docker Desktop start-on-boot, all come back up on their own)
- [ ] If the quick-tunnel URL ever changes after a restart, `BACKEND_API_URL` (Vercel) and `BACKEND_URL` (GitHub Actions) are updated to match
- [ ] Vercel deployment shows real feed data, not an empty/error state
- [ ] Manual `workflow_dispatch` run of Daily Digest succeeds against the real `BACKEND_URL`
- [ ] `GITHUB_TOKEN` set given the rate-limit margin is thin
- [ ] Decided whether/how often to run a `pg_dump` backup, given this PC is now the only copy of the data
