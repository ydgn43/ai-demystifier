from datetime import datetime

import asyncpg
from fastapi import APIRouter, Depends, Query

from app.db import get_pool
from app.pipeline.demystifier import PROMPT_VERSION
from app.schemas.feed_item import FeedItem, TimelineResponse

router = APIRouter()

# Purely chronological browse of everything digested, not just the
# Today/This-week window /feed shows — for "catch up on what I missed".
_TIMELINE_SQL = """
    SELECT
        ri.id, ri.source, ri.url, ri.title, ri.published_at, ri.fetched_at,
        s1.body AS level1, s2.body AS level2,
        im.category, im.tags, im.jargon_terms, im.headline
    FROM raw_items ri
    JOIN summaries s1 ON s1.item_id = ri.id AND s1.level = 1 AND s1.prompt_version = $1
    JOIN summaries s2 ON s2.item_id = ri.id AND s2.level = 2 AND s2.prompt_version = $1
    JOIN item_metadata im ON im.item_id = ri.id AND im.prompt_version = $1
    WHERE ($2::text IS NULL OR im.category = $2)
      AND ($3::timestamptz IS NULL OR ri.fetched_at < $3)
    ORDER BY ri.fetched_at DESC
    LIMIT $4
"""


@router.get("/timeline", response_model=TimelineResponse)
async def get_timeline(
    category: str | None = None,
    before: datetime | None = None,
    limit: int = Query(default=20, le=50),
    pool: asyncpg.Pool = Depends(get_pool),
) -> TimelineResponse:
    async with pool.acquire() as conn:
        # Fetch one extra row so we know whether there's a next page
        # without a separate count query.
        rows = await conn.fetch(_TIMELINE_SQL, PROMPT_VERSION, category, before, limit + 1)

    has_more = len(rows) > limit
    rows = rows[:limit]
    next_cursor = rows[-1]["fetched_at"].isoformat() if has_more and rows else None

    # score isn't meaningful here — this view is chronological, not ranked.
    items = [FeedItem(**{**dict(row), "score": 0.0}) for row in rows]
    return TimelineResponse(items=items, next_cursor=next_cursor)
