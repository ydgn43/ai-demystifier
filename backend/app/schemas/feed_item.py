from datetime import datetime

from pydantic import BaseModel


class FeedItem(BaseModel):
    id: int
    source: str
    url: str
    title: str
    headline: str
    level1: str
    level2: str
    category: str
    tags: list[str]
    jargon_terms: list[str]
    published_at: datetime | None
    score: float


class FeedResponse(BaseModel):
    today: list[FeedItem]
    this_week: list[FeedItem]


class TimelineResponse(BaseModel):
    items: list[FeedItem]
    next_cursor: str | None
