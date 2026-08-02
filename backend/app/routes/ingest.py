import asyncpg
from fastapi import APIRouter, Depends

from app.db import get_pool
from app.deps import require_cron_secret
from app.fetchers.arxiv import fetch_arxiv
from app.fetchers.base import upsert_raw_items
from app.fetchers.github import fetch_github
from app.fetchers.huggingface import fetch_huggingface

router = APIRouter()

FETCHERS = {
    "huggingface": fetch_huggingface,
    "github": fetch_github,
    "arxiv": fetch_arxiv,
}


@router.post("/ingest/run", dependencies=[Depends(require_cron_secret)])
async def run_ingest(pool: asyncpg.Pool = Depends(get_pool)) -> dict[str, dict]:
    # A source fetch failing must not take down the others or the feed.
    results = {}
    for source, fetch in FETCHERS.items():
        try:
            items = await fetch()
            count = await upsert_raw_items(pool, items)
            results[source] = {"ok": True, "items": count}
        except Exception as exc:
            results[source] = {"ok": False, "error": str(exc)}
    return results
