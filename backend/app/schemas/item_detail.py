from datetime import datetime

from pydantic import BaseModel


class ItemDetail(BaseModel):
    id: int
    source: str
    url: str
    title: str
    category: str
    tags: list[str]
    jargon_terms: list[str]
    published_at: datetime | None
    level1: str
    level2: str
    article1: str
    article2: str
