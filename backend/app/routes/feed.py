from datetime import datetime, timezone

import asyncpg
from fastapi import APIRouter, Depends, Query

from app.db import get_pool
from app.pipeline.demystifier import PROMPT_VERSION
from app.ranking import score_item
from app.schemas.feed_item import FeedItem, FeedResponse

router = APIRouter()

# Full history, browsable page by page (oldest never drop off) rather than a
# ranked/capped daily view — see PROGRESS.md for why this replaced the old
# today/this_week split.
PAGE_SIZE = 25

_COUNT_SQL = """
    SELECT count(*)
    FROM raw_items ri
    JOIN summaries s1 ON s1.item_id = ri.id AND s1.level = 1 AND s1.prompt_version = $1
    JOIN summaries s2 ON s2.item_id = ri.id AND s2.level = 2 AND s2.prompt_version = $1
    JOIN item_metadata im ON im.item_id = ri.id AND im.prompt_version = $1
"""

_SELECT_PAGE_SQL = """
    SELECT
        ri.id, ri.source, ri.url, ri.title, ri.published_at, ri.metrics_json, ri.fetched_at,
        ri.metrics_json AS metrics,
        s1.body AS level1, s2.body AS level2,
        im.category, im.tags, im.jargon_terms, im.headline
    FROM raw_items ri
    JOIN summaries s1 ON s1.item_id = ri.id AND s1.level = 1 AND s1.prompt_version = $1
    JOIN summaries s2 ON s2.item_id = ri.id AND s2.level = 2 AND s2.prompt_version = $1
    JOIN item_metadata im ON im.item_id = ri.id AND im.prompt_version = $1
    ORDER BY COALESCE(ri.published_at, ri.fetched_at) DESC, ri.id DESC
    LIMIT $2 OFFSET $3
"""


@router.get("/feed", response_model=FeedResponse)
async def get_feed(
    page: int = Query(default=1, ge=1),
    pool: asyncpg.Pool = Depends(get_pool),
) -> FeedResponse:
    offset = (page - 1) * PAGE_SIZE
    async with pool.acquire() as conn:
        total_items = await conn.fetchval(_COUNT_SQL, PROMPT_VERSION)
        rows = await conn.fetch(_SELECT_PAGE_SQL, PROMPT_VERSION, PAGE_SIZE, offset)

    now = datetime.now(timezone.utc)
    items = [
        FeedItem(
            **row,
            score=score_item(
                source=row["source"],
                metrics_json=row["metrics_json"] or {},
                published_at=row["published_at"],
                fetched_at=row["fetched_at"],
                now=now,
            ),
        )
        for row in rows
    ]
    total_pages = max((total_items + PAGE_SIZE - 1) // PAGE_SIZE, 1)
    return FeedResponse(items=items, page=page, total_pages=total_pages, total_items=total_items)
