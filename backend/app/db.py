from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import asyncpg
from fastapi import FastAPI, Request

from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.pool = await asyncpg.create_pool(settings.database_url)
    try:
        yield
    finally:
        await app.state.pool.close()


def get_pool(request: Request) -> asyncpg.Pool:
    return request.app.state.pool
