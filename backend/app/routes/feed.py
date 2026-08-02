import asyncpg
from fastapi import APIRouter, Depends

from app.db import get_pool
from app.pipeline.demystifier import PROMPT_VERSION
from app.ranking import rank_items
from app.schemas.feed_item import FeedItem

router = APIRouter()

# How many recent, summarized candidates to pull before ranking narrows them
# down to the feed cap. Wide enough that ranking (not this limit) decides.
_CANDIDATE_POOL = 300

_SELECT_CANDIDATES_SQL = """
    SELECT
        ri.id, ri.source, ri.url, ri.title, ri.published_at, ri.metrics_json, ri.fetched_at,
        s1.body AS level1, s2.body AS level2,
        im.category, im.tags, im.jargon_terms
    FROM raw_items ri
    JOIN summaries s1 ON s1.item_id = ri.id AND s1.level = 1 AND s1.prompt_version = $1
    JOIN summaries s2 ON s2.item_id = ri.id AND s2.level = 2 AND s2.prompt_version = $1
    JOIN item_metadata im ON im.item_id = ri.id AND im.prompt_version = $1
    ORDER BY ri.fetched_at DESC
    LIMIT $2
"""


@router.get("/feed", response_model=list[FeedItem])
async def get_feed(pool: asyncpg.Pool = Depends(get_pool)) -> list[FeedItem]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(_SELECT_CANDIDATES_SQL, PROMPT_VERSION, _CANDIDATE_POOL)
    ranked = rank_items([dict(row) for row in rows])
    return [FeedItem(**row) for row in ranked]
