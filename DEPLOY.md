# Deploy runbook (Phase 4)

Decided approach (2026-08-04, updated 2026-08-04): the backend + Ollama +
Postgres **all** keep running on this PC — no pipeline code changes, no GPU
cloud bill, no hosted-DB account needed. Tailscale Funnel exposes the
backend to the internet over a stable HTTPS URL without port-forwarding or
a static IP. Postgres stays purely local (`localhost:5432`, never exposed
externally) — only the backend on this same machine ever talks to it
directly; Vercel and GitHub Actions only ever talk to the backend's HTTP
API, never the database. The frontend deploys to Vercel as originally
planned.

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

## 1. Expose this backend with Tailscale Funnel — **you**

1. Install Tailscale on this PC: https://tailscale.com/download/windows
2. `tailscale up` and log in (browser flow).
3. Start the backend normally first (`uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000` — note `--host 0.0.0.0`, not `--reload`'s default `127.0.0.1`, so Tailscale can reach it).
4. `tailscale funnel 8000` — this prints a stable public HTTPS URL (something like `https://<machine-name>.<tailnet>.ts.net`). If it errors about Funnel being disabled, enable it for your tailnet in the Tailscale admin console (Settings → Funnel) — it's off by default on some account types.
5. Confirm from *outside* this network (phone on cellular data, or ask someone else) that `https://<that-url>/health` responds. Testing from the same LAN can succeed even if Funnel isn't actually working.
6. Keep the backend running persistently, not just in an interactive terminal you might close:
   - Simplest: Task Scheduler → create a task that runs at log-on, action = your `uvicorn` command above, "run whether user is logged on or not" if you want it to survive logout.
   - More robust alternative if you want real service semantics (auto-restart on crash, logs): [NSSM](https://nssm.cc/) wrapping the same uvicorn command as a Windows service. Not required to start — Task Scheduler is enough for now.
   - Either way, `tailscale funnel 8000` needs to be (re-)running too — `tailscale funnel` config persists across reboots once set, but confirm after a real reboot rather than assuming.

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
   - `BACKEND_API_URL` = the Tailscale Funnel URL from step 1.4 (e.g. `https://your-machine.your-tailnet.ts.net`) — **not** `localhost`.
   - `SITE_URL` = whatever domain Vercel assigns (or your custom domain if you attach one) — this feeds `metadataBase`/OG tags/the sitemap, currently defaults to `http://localhost:3000`.
3. Deploy. Load the live URL and confirm the homepage actually shows real feed data (not just that it builds) — that's the real test that `BACKEND_API_URL` is reaching this PC correctly.

## 4. Point the cron at production — **you** set repo config, workflow already updated

The workflow (`.github/workflows/daily-digest.yml`) already reads these and
already surfaces per-source/per-item failures as annotations instead of
failing silently (done 2026-08-04) — nothing left to change in the file
itself.

1. Repo Settings → Secrets and variables → Actions → **Variables**: add `BACKEND_URL` = the same Tailscale Funnel URL from step 1.4.
2. Repo Settings → Secrets and variables → Actions → **Secrets**: add `CRON_SECRET` = the exact same value as `CRON_SECRET` in this PC's `.env`.
3. Trigger it manually once to verify end-to-end before trusting the 06:00 UTC schedule: Actions tab → Daily Digest → Run workflow. This is the same `workflow_dispatch` trigger already in the workflow, no code change needed to test it on demand.

## Verification checklist

- [ ] `https://<funnel-url>/health` reachable from outside your LAN
- [ ] Backend *and* Postgres both survive a real reboot of this PC (Task Scheduler entry, Docker Desktop start-on-boot, and `tailscale funnel` all come back up on their own)
- [ ] Vercel deployment shows real feed data, not an empty/error state
- [ ] Manual `workflow_dispatch` run of Daily Digest succeeds against the real `BACKEND_URL`
- [ ] `GITHUB_TOKEN` set given the rate-limit margin is thin
- [ ] Decided whether/how often to run a `pg_dump` backup, given this PC is now the only copy of the data
