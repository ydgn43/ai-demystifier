from datetime import datetime, timedelta, timezone

import httpx

from app.config import settings
from app.schemas.raw_item import RawItemIn

SEARCH_URL = "https://api.github.com/search/repositories"

# GitHub's Search API has no native "trending" or "stars gained today" sort.
# The common workaround: repos *created* in the last day, sorted by total stars,
# as a proxy for "stars gained today". Good enough for an MVP ranking signal.


async def fetch_github() -> list[RawItemIn]:
    since = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    headers = {"Accept": "application/vnd.github+json"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            SEARCH_URL,
            params={
                "q": f"created:>{since}",
                "sort": "stars",
                "order": "desc",
                "per_page": 25,
            },
            headers=headers,
        )
        response.raise_for_status()
        repos = response.json().get("items", [])

    return [
        RawItemIn(
            source="github",
            external_id=str(repo["id"]),
            url=repo["html_url"],
            title=repo["full_name"],
            raw_text=repo.get("description"),
            published_at=datetime.fromisoformat(repo["created_at"].replace("Z", "+00:00")),
            metrics_json={
                "stars": repo.get("stargazers_count", 0),
                "language": repo.get("language"),
            },
        )
        for repo in repos
    ]
