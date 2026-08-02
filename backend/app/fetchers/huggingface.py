from datetime import datetime

import httpx

from app.schemas.raw_item import RawItemIn

DAILY_PAPERS_URL = "https://huggingface.co/api/daily_papers"


def _parse_published_at(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


async def fetch_huggingface() -> list[RawItemIn]:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(DAILY_PAPERS_URL)
        response.raise_for_status()
        entries = response.json()

    items = []
    for entry in entries:
        paper = entry.get("paper", {})
        paper_id = paper.get("id")
        if not paper_id:
            continue
        items.append(
            RawItemIn(
                source="huggingface",
                external_id=paper_id,
                url=f"https://huggingface.co/papers/{paper_id}",
                title=paper.get("title") or entry.get("title") or paper_id,
                raw_text=paper.get("summary"),
                published_at=_parse_published_at(
                    paper.get("publishedAt") or entry.get("publishedAt")
                ),
                metrics_json={"upvotes": entry.get("upvotes") or paper.get("upvotes") or 0},
            )
        )
    return items
