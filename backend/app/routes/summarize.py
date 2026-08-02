import json

import asyncpg
from fastapi import APIRouter, Depends, Query

from app.db import get_pool
from app.deps import require_cron_secret
from app.pipeline.demystifier import MODEL_NAME, PROMPT_VERSION, demystify

router = APIRouter()

_SELECT_UNSUMMARIZED_SQL = """
    SELECT id, title, raw_text
    FROM raw_items ri
    WHERE NOT EXISTS (
        SELECT 1 FROM summaries s
        WHERE s.item_id = ri.id AND s.level = 1 AND s.prompt_version = $1
    )
    ORDER BY ri.fetched_at DESC
    LIMIT $2
"""

_UPSERT_SUMMARY_SQL = """
    INSERT INTO summaries (item_id, level, body, model, prompt_version)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (item_id, level, prompt_version) DO UPDATE
        SET body = EXCLUDED.body, model = EXCLUDED.model
"""

_UPSERT_METADATA_SQL = """
    INSERT INTO item_metadata (item_id, category, tags, jargon_terms, prompt_version)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (item_id, prompt_version) DO UPDATE
        SET category = EXCLUDED.category,
            tags = EXCLUDED.tags,
            jargon_terms = EXCLUDED.jargon_terms
"""


@router.post("/summarize/run", dependencies=[Depends(require_cron_secret)])
async def run_summarize(
    limit: int = Query(default=10, le=50),
    pool: asyncpg.Pool = Depends(get_pool),
) -> dict:
    async with pool.acquire() as conn:
        rows = await conn.fetch(_SELECT_UNSUMMARIZED_SQL, PROMPT_VERSION, limit)

    processed = 0
    errors = []
    # One item's LLM call failing must not stop the rest of the batch.
    for row in rows:
        try:
            output = await demystify(row["title"], row["raw_text"])
        except Exception as exc:
            errors.append({"item_id": row["id"], "error": str(exc)})
            continue

        async with pool.acquire() as conn, conn.transaction():
            await conn.execute(
                _UPSERT_SUMMARY_SQL, row["id"], 1, output.level1, MODEL_NAME, PROMPT_VERSION
            )
            await conn.execute(
                _UPSERT_SUMMARY_SQL, row["id"], 2, output.level2, MODEL_NAME, PROMPT_VERSION
            )
            await conn.execute(
                _UPSERT_METADATA_SQL,
                row["id"],
                output.category,
                json.dumps(output.tags),
                json.dumps(output.jargon_terms),
                PROMPT_VERSION,
            )
        processed += 1

    return {
        "candidates": len(rows),
        "processed": processed,
        "failed": len(errors),
        "errors": errors,
    }
