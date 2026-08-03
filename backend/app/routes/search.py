import asyncpg
from fastapi import APIRouter, Depends, Query

from app.db import get_pool
from app.pipeline.demystifier import PROMPT_VERSION
from app.schemas.feed_item import FeedItem

router = APIRouter()

_MAX_RESULTS = 25

# Postgres full-text search (built in, no new infra) over title + both
# teasers + tags. ts_rank stands in for FeedItem.score here — same shape,
# different meaning (relevance instead of recency/popularity).
_SEARCH_SQL = """
    SELECT
        ri.id, ri.source, ri.url, ri.title, ri.published_at,
        s1.body AS level1, s2.body AS level2,
        im.category, im.tags, im.jargon_terms,
        ts_rank(
            to_tsvector('english', ri.title || ' ' || s1.body || ' ' || s2.body || ' ' || im.tags::text),
            plainto_tsquery('english', $2)
        ) AS score
    FROM raw_items ri
    JOIN summaries s1 ON s1.item_id = ri.id AND s1.level = 1 AND s1.prompt_version = $1
    JOIN summaries s2 ON s2.item_id = ri.id AND s2.level = 2 AND s2.prompt_version = $1
    JOIN item_metadata im ON im.item_id = ri.id AND im.prompt_version = $1
    WHERE to_tsvector('english', ri.title || ' ' || s1.body || ' ' || s2.body || ' ' || im.tags::text)
          @@ plainto_tsquery('english', $2)
    ORDER BY score DESC
    LIMIT $3
"""


@router.get("/search", response_model=list[FeedItem])
async def search(
    q: str = Query(..., min_length=1),
    pool: asyncpg.Pool = Depends(get_pool),
) -> list[FeedItem]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(_SEARCH_SQL, PROMPT_VERSION, q, _MAX_RESULTS)
    return [FeedItem(**dict(row)) for row in rows]
