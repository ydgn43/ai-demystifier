from typing import Literal

import ollama
from pydantic import BaseModel

from app.config import settings

# Local model via Ollama — no external API quota, so no per-item rate limiting
# needed (see summarize.py). Swap this constant to try a different model.
MODEL_NAME = "qwen2.5:7b-instruct"

# Bump whenever the prompt below changes, so the corpus can be re-summarized cheaply.
PROMPT_VERSION = "v3"

CATEGORIES = ["Models", "Research", "Developer Tools", "Industry News"]

SYSTEM_INSTRUCTION = """You are the "Demystifier" for an AI news digest. Given a title and \
raw abstract/README text for one item, produce a plain-English digest of it, at two levels \
of both length and technical depth.

Hard rule, non-negotiable: base everything ONLY on the supplied text. Never state a \
number, statistic, benchmark result, or claim that is not explicitly present in the \
supplied text. If the text doesn't give you enough to support a claim, leave it out \
rather than inferring or guessing. A hallucinated figure in a "plain English" summary is \
worse than no summary. This applies equally to the longer articles below — if the source \
text is thin, write a shorter article rather than padding it with invented detail (but \
still aim for the word counts below wherever the source text supports it).

Return:
- level1: a casual, jargon-free teaser (2-3 sentences) for a general reader, used in a
  scannable feed list.
- level2: a more technical teaser (2-4 sentences) for a developer audience, same feed-list
  use, still grounded only in the supplied text.
- article1: a longer casual article. MUST be at least 150 words (aim for 200-350) across
  2-4 short paragraphs. This must read differently from article2, not just be a shorter
  copy of it: explain the idea the way you'd explain it to a curious friend with no ML
  background. Do not use ANY of the terms you list in jargon_terms here — if a technical
  concept is essential, describe what it does in plain words instead of naming it.
- article2: a longer developer-facing article. MUST be at least 150 words (aim for
  200-350) across 2-4 short paragraphs. Assume the reader already knows standard ML/AI
  terminology (use it precisely and don't re-explain basics) and go into more technical
  depth than level2 — more mechanism, more of what's actually novel here.
- category: exactly one of Models, Research, Developer Tools, Industry News.
- tags: 2-5 short topical tags (lowercase).
- jargon_terms: technical terms used in level2/article2 that a general reader likely
  wouldn't know. article1 must avoid every term listed here.
"""


class DemystifierOutput(BaseModel):
    level1: str
    level2: str
    article1: str
    article2: str
    category: Literal["Models", "Research", "Developer Tools", "Industry News"]
    tags: list[str]
    jargon_terms: list[str]


def _client() -> ollama.AsyncClient:
    return ollama.AsyncClient(host=settings.ollama_host)


async def demystify(title: str, raw_text: str | None) -> DemystifierOutput:
    prompt = f"Title: {title}\n\nSource text:\n{raw_text or '(no text supplied)'}"

    response = await _client().chat(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": prompt},
        ],
        format=DemystifierOutput.model_json_schema(),
        # num_predict: Ollama's chat default can be low enough to truncate a
        # response this size (4 text fields + metadata in one JSON object).
        options={"temperature": 0.3, "num_predict": 2048},
    )
    return DemystifierOutput.model_validate_json(response.message.content)
