import asyncpg

from app.schemas.raw_item import RawItemIn

_UPSERT_SQL = """
    INSERT INTO raw_items (source, external_id, url, title, raw_text, published_at, metrics_json)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (source, external_id) DO UPDATE
        SET metrics_json = EXCLUDED.metrics_json,
            fetched_at = now()
"""


async def upsert_raw_items(pool: asyncpg.Pool, items: list[RawItemIn]) -> int:
    if not items:
        return 0
    async with pool.acquire() as conn:
        await conn.executemany(
            _UPSERT_SQL,
            [
                (
                    item.source,
                    item.external_id,
                    item.url,
                    item.title,
                    item.raw_text,
                    item.published_at,
                    item.metrics_json,
                )
                for item in items
            ],
        )
    return len(items)
