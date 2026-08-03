from datetime import datetime, timedelta, timezone

import httpx

from app.config import settings
from app.schemas.raw_item import RawItemIn

SEARCH_URL = "https://api.github.com/search/repositories"

# GitHub's Search API has no native "trending" or "stars gained today" sort.
# The common workaround: repos *created* in the last day, sorted by total stars,
# as a proxy for "stars gained today". Good enough for an MVP ranking signal.

# Cap README length so a huge doc doesn't balloon the Demystifier prompt.
_README_MAX_CHARS = 6000

# GitHub search qualifiers don't reliably support OR between repeated
# qualifiers (topic:a OR topic:b), so instead of gambling on that syntax we
# run one query per topic and merge results ourselves. This is the only
# thing keeping GitHub scoped to AI/ML content — arXiv/HF are inherently
# scoped by their own categories/curation.
_AI_TOPICS = [
    "machine-learning",
    "deep-learning",
    "artificial-intelligence",
    "llm",
    "large-language-models",
    "nlp",
    "computer-vision",
    "generative-ai",
    "neural-network",
    "ai-agents",
]

_RESULTS_PER_TOPIC = 15
_MAX_REPOS = 25


async def _fetch_readme(client: httpx.AsyncClient, full_name: str, headers: dict) -> str | None:
    try:
        response = await client.get(
            f"https://api.github.com/repos/{full_name}/readme",
            headers={**headers, "Accept": "application/vnd.github.raw+json"},
        )
        response.raise_for_status()
    except httpx.HTTPError:
        # No README, private repo, rate limited, etc. — the one-line
        # description is still a usable fallback, so this must not be fatal.
        return None
    return response.text[:_README_MAX_CHARS]


async def _search_topic(client: httpx.AsyncClient, topic: str, since: str, headers: dict) -> list[dict]:
    response = await client.get(
        SEARCH_URL,
        params={
            "q": f"topic:{topic} created:>{since}",
            "sort": "stars",
            "order": "desc",
            "per_page": _RESULTS_PER_TOPIC,
        },
        headers=headers,
    )
    response.raise_for_status()
    return response.json().get("items", [])


async def fetch_github() -> list[RawItemIn]:
    since = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    headers = {"Accept": "application/vnd.github+json"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    async with httpx.AsyncClient(timeout=30) as client:
        seen_ids: set[int] = set()
        repos: list[dict] = []
        for topic in _AI_TOPICS:
            for repo in await _search_topic(client, topic, since, headers):
                if repo["id"] not in seen_ids:
                    seen_ids.add(repo["id"])
                    repos.append(repo)

        repos.sort(key=lambda r: r.get("stargazers_count", 0), reverse=True)
        repos = repos[:_MAX_REPOS]

        items = []
        for repo in repos:
            readme = await _fetch_readme(client, repo["full_name"], headers)
            items.append(
                RawItemIn(
                    source="github",
                    external_id=str(repo["id"]),
                    url=repo["html_url"],
                    title=repo["full_name"],
                    raw_text=readme or repo.get("description"),
                    published_at=datetime.fromisoformat(repo["created_at"].replace("Z", "+00:00")),
                    metrics_json={
                        "stars": repo.get("stargazers_count", 0),
                        "language": repo.get("language"),
                    },
                )
            )
        return items
