from typing import Literal

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.config import settings

MODEL_NAME = "gemini-2.5-flash"

# Bump whenever the prompt below changes, so the corpus can be re-summarized cheaply.
PROMPT_VERSION = "v2"

CATEGORIES = ["Models", "Research", "Developer Tools", "Industry News"]

SYSTEM_INSTRUCTION = """You are the "Demystifier" for an AI news digest. Given a title and \
raw abstract/README text for one item, produce a plain-English digest of it, at two levels \
of both length and technical depth.

Hard rule, non-negotiable: base everything ONLY on the supplied text. Never state a \
number, statistic, benchmark result, or claim that is not explicitly present in the \
supplied text. If the text doesn't give you enough to support a claim, leave it out \
rather than inferring or guessing. A hallucinated figure in a "plain English" summary is \
worse than no summary. This applies equally to the longer articles below — if the source \
text is thin, write a shorter article rather than padding it with invented detail.

Return:
- level1: a casual, jargon-free teaser (2-3 sentences) for a general reader, used in a
  scannable feed list.
- level2: a more technical teaser (2-4 sentences) for a developer audience, same feed-list
  use, still grounded only in the supplied text.
- article1: a longer casual article (roughly 150-350 words, 2-4 short paragraphs) for
  someone who clicked through wanting the fuller plain-English story — still jargon-free
  and still grounded only in the supplied text.
- article2: a longer developer-facing article (roughly 150-350 words, 2-4 short paragraphs)
  going into more technical depth than level2, still grounded only in the supplied text.
- category: exactly one of Models, Research, Developer Tools, Industry News.
- tags: 2-5 short topical tags (lowercase).
- jargon_terms: technical terms used in level2/article2 that a general reader likely
  wouldn't know.
"""


class DemystifierOutput(BaseModel):
    level1: str
    level2: str
    article1: str
    article2: str
    category: Literal["Models", "Research", "Developer Tools", "Industry News"]
    tags: list[str]
    jargon_terms: list[str]


def _client() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


async def demystify(title: str, raw_text: str | None) -> DemystifierOutput:
    prompt = f"Title: {title}\n\nSource text:\n{raw_text or '(no text supplied)'}"

    response = await _client().aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=DemystifierOutput,
        ),
    )
    return DemystifierOutput.model_validate_json(response.text)
