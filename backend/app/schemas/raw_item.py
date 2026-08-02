from datetime import datetime
from typing import Any

from pydantic import BaseModel


class RawItemIn(BaseModel):
    source: str
    external_id: str
    url: str
    title: str
    raw_text: str | None = None
    published_at: datetime | None = None
    metrics_json: dict[str, Any] = {}


class RawItemOut(RawItemIn):
    id: int
    fetched_at: datetime
