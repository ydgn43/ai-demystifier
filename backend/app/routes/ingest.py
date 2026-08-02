import asyncpg
from fastapi import APIRouter, Depends, Header, HTTPException

from app.config import settings
from app.db import get_pool
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


def require_cron_secret(x_cron_secret: str = Header(default="")) -> None:
    if x_cron_secret != settings.cron_secret:
        raise HTTPException(status_code=401, detail="invalid or missing X-Cron-Secret header")


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
