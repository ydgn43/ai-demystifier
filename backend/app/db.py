import json
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import asyncpg
from fastapi import FastAPI, Request

from app.config import settings


async def _init_connection(conn: asyncpg.Connection) -> None:
    for typename in ("json", "jsonb"):
        await conn.set_type_codec(
            typename,
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
            format="text",
        )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.pool = await asyncpg.create_pool(settings.database_url, init=_init_connection)
    try:
        yield
    finally:
        await app.state.pool.close()


def get_pool(request: Request) -> asyncpg.Pool:
    return request.app.state.pool
