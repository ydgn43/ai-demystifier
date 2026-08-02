from fastapi import FastAPI

from app.db import lifespan
from app.routes import health, ingest, summarize

app = FastAPI(title="AI News Digest", lifespan=lifespan)

app.include_router(health.router)
app.include_router(ingest.router)
app.include_router(summarize.router)
