"""Scores and orders raw_items into the capped daily feed.

This is expected to be tuned often as source behavior drifts — weights and
scales are top-level constants on purpose, not buried in the function body.
"""

import math
from datetime import datetime, timezone
from typing import Any

FEED_CAP = 25

# An item's recency component halves every N hours since publish (or fetch,
# if publish time is unknown, e.g. some GitHub repos).
RECENCY_HALF_LIFE_HOURS = 24.0

# Per-source weight applied to the final score. arXiv has no popularity
# signal of its own, so it's weighted down relative to sources with one.
SOURCE_WEIGHTS: dict[str, float] = {
    "huggingface": 1.0,
    "github": 1.0,
    "arxiv": 0.6,
}

# (metrics_json key, log-scale cap) per source. The cap is the raw metric
# value that maps to a full 1.0 metric score; log1p keeps a single viral
# outlier from dominating the ranking.
METRIC_SCALE: dict[str, tuple[str, float]] = {
    "huggingface": ("upvotes", 100.0),
    "github": ("stars", 500.0),
}


def _recency_score(published_at: datetime | None, fetched_at: datetime, now: datetime) -> float:
    anchor = published_at or fetched_at
    if anchor.tzinfo is None:
        anchor = anchor.replace(tzinfo=timezone.utc)
    age_hours = max((now - anchor).total_seconds() / 3600.0, 0.0)
    return 0.5 ** (age_hours / RECENCY_HALF_LIFE_HOURS)


def _metric_score(source: str, metrics_json: dict[str, Any]) -> float:
    scale = METRIC_SCALE.get(source)
    if scale is None:
        return 0.0
    key, cap = scale
    value = metrics_json.get(key) or 0
    return min(math.log1p(value) / math.log1p(cap), 1.0)


def score_item(
    *,
    source: str,
    metrics_json: dict[str, Any],
    published_at: datetime | None,
    fetched_at: datetime,
    now: datetime | None = None,
) -> float:
    now = now or datetime.now(timezone.utc)
    weight = SOURCE_WEIGHTS.get(source, 1.0)
    recency = _recency_score(published_at, fetched_at, now)
    metric = _metric_score(source, metrics_json)
    # Averaged rather than multiplied so a stale-but-popular item and a
    # fresh-but-unranked item both have a path onto the feed.
    return weight * ((recency + metric) / 2.0)


def rank_items(
    rows: list[dict[str, Any]], *, cap: int = FEED_CAP, now: datetime | None = None
) -> list[dict[str, Any]]:
    now = now or datetime.now(timezone.utc)
    scored = [
        {
            **row,
            "score": score_item(
                source=row["source"],
                metrics_json=row["metrics_json"] or {},
                published_at=row["published_at"],
                fetched_at=row["fetched_at"],
                now=now,
            ),
        }
        for row in rows
    ]
    scored.sort(key=lambda r: r["score"], reverse=True)
    return scored[:cap]
