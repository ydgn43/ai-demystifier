import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from app.db import get_pool
from app.pipeline.demystifier import PROMPT_VERSION
from app.schemas.item_detail import ItemDetail

router = APIRouter()

_SELECT_ITEM_SQL = """
    SELECT
        ri.id, ri.source, ri.url, ri.title, ri.published_at,
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


@router.get("/items/{item_id}", response_model=ItemDetail)
async def get_item(item_id: int, pool: asyncpg.Pool = Depends(get_pool)) -> ItemDetail:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(_SELECT_ITEM_SQL, item_id, PROMPT_VERSION)
    if row is None:
        raise HTTPException(status_code=404, detail="item not found")
    return ItemDetail(**dict(row))
