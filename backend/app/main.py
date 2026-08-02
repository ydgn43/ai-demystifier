from fastapi import FastAPI

from app.db import lifespan
from app.routes import feed, health, ingest, item, summarize

app = FastAPI(title="AI News Digest", lifespan=lifespan)

app.include_router(health.router)
app.include_router(ingest.router)
app.include_router(summarize.router)
app.include_router(feed.router)
app.include_router(item.router)
