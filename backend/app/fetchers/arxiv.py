from datetime import datetime
from xml.etree import ElementTree

import httpx

from app.schemas.raw_item import RawItemIn

QUERY_URL = "https://export.arxiv.org/api/query"
ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}
CATEGORIES = ["cs.LG", "cs.CL", "cs.AI"]


async def fetch_arxiv() -> list[RawItemIn]:
    search_query = " OR ".join(f"cat:{cat}" for cat in CATEGORIES)
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            QUERY_URL,
            params={
                "search_query": search_query,
                "sortBy": "submittedDate",
                "sortOrder": "descending",
                "max_results": 50,
            },
        )
        response.raise_for_status()
        feed = ElementTree.fromstring(response.text)

    items = []
    for entry in feed.findall("atom:entry", ATOM_NS):
        entry_id = entry.findtext("atom:id", namespaces=ATOM_NS)
        if not entry_id:
            continue
        external_id = entry_id.rstrip("/").rsplit("/", 1)[-1]
        title = (entry.findtext("atom:title", namespaces=ATOM_NS) or "").strip()
        summary = (entry.findtext("atom:summary", namespaces=ATOM_NS) or "").strip()
        published = entry.findtext("atom:published", namespaces=ATOM_NS)
        items.append(
            RawItemIn(
                source="arxiv",
                external_id=external_id,
                url=entry_id.replace("http://", "https://"),
                title=title,
                raw_text=summary,
                published_at=datetime.fromisoformat(published.replace("Z", "+00:00"))
                if published
                else None,
                metrics_json={},
            )
        )
    return items
