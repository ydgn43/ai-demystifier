import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query

from app.db import get_pool
from app.pipeline.demystifier import PROMPT_VERSION
from app.schemas.feed_item import FeedItem
from app.schemas.item_detail import ItemDetail

router = APIRouter()

# Bookmarks live client-side only (localStorage, no accounts) — this is how
# the browser turns a saved list of ids back into real content to render via
# the same FeedCard used everywhere else.
_SELECT_ITEMS_BY_IDS_SQL = """
    SELECT
        ri.id, ri.source, ri.url, ri.title, ri.published_at,
        ri.metrics_json AS metrics,
        s1.body AS level1, s2.body AS level2,
        im.category, im.tags, im.jargon_terms, im.headline
    FROM raw_items ri
    JOIN summaries s1 ON s1.item_id = ri.id AND s1.level = 1 AND s1.prompt_version = $2
    JOIN summaries s2 ON s2.item_id = ri.id AND s2.level = 2 AND s2.prompt_version = $2
    JOIN item_metadata im ON im.item_id = ri.id AND im.prompt_version = $2
    WHERE ri.id = ANY($1)
"""

_SELECT_ITEM_SQL = """
    SELECT
        ri.id, ri.source, ri.url, ri.title, ri.published_at,
        ri.metrics_json AS metrics,
        s1.body AS level1, s2.body AS level2,
        a1.body AS article1, a2.body AS article2,
        im.category, im.tags, im.jargon_terms, im.headline,
        im.why_it_matters_casual, im.why_it_matters_developer
    FROM raw_items ri
    JOIN summaries s1 ON s1.item_id = ri.id AND s1.level = 1 AND s1.prompt_version = $2
    JOIN summaries s2 ON s2.item_id = ri.id AND s2.level = 2 AND s2.prompt_version = $2
    JOIN articles a1 ON a1.item_id = ri.id AND a1.level = 1 AND a1.prompt_version = $2
    JOIN articles a2 ON a2.item_id = ri.id AND a2.level = 2 AND a2.prompt_version = $2
    JOIN item_metadata im ON im.item_id = ri.id AND im.prompt_version = $2
    WHERE ri.id = $1
"""


@router.get("/items", response_model=list[FeedItem])
async def get_items_by_ids(
    ids: str = Query(..., description="Comma-separated item ids"),
    pool: asyncpg.Pool = Depends(get_pool),
) -> list[FeedItem]:
    try:
        id_list = [int(part) for part in ids.split(",") if part.strip()]
    except ValueError:
        raise HTTPException(status_code=422, detail="ids must be a comma-separated list of integers")
    if not id_list:
        return []
    async with pool.acquire() as conn:
        rows = await conn.fetch(_SELECT_ITEMS_BY_IDS_SQL, id_list, PROMPT_VERSION)
    # score isn't meaningful here (not ranked or relevance-scored) — same
    # treatment as /timeline.
    return [FeedItem(**{**dict(row), "score": 0.0}) for row in rows]


@router.get("/items/{item_id}", response_model=ItemDetail)
async def get_item(item_id: int, pool: asyncpg.Pool = Depends(get_pool)) -> ItemDetail:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(_SELECT_ITEM_SQL, item_id, PROMPT_VERSION)
    if row is None:
        raise HTTPException(status_code=404, detail="item not found")
    return ItemDetail(**dict(row))
