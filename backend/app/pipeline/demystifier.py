from typing import Literal

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.config import settings

MODEL_NAME = "gemini-2.5-flash"

# Bump whenever the prompt below changes, so the corpus can be re-summarized cheaply.
PROMPT_VERSION = "v1"

CATEGORIES = ["Models", "Research", "Developer Tools", "Industry News"]

SYSTEM_INSTRUCTION = """You are the "Demystifier" for an AI news digest. Given a title and \
raw abstract/README text for one item, produce a plain-English digest of it.

Hard rule, non-negotiable: base your summary ONLY on the supplied text. Never state a \
number, statistic, benchmark result, or claim that is not explicitly present in the \
supplied text. If the text doesn't give you enough to support a claim, leave it out \
rather than inferring or guessing. A hallucinated figure in a "plain English" summary is \
worse than no summary.

Return:
- level1: a casual, jargon-free summary (2-3 sentences) for a general reader.
- level2: a more technical summary (2-4 sentences) for a developer audience, still \
grounded only in the supplied text.
- category: exactly one of Models, Research, Developer Tools, Industry News.
- tags: 2-5 short topical tags (lowercase).
- jargon_terms: technical terms used in level2 that a general reader likely wouldn't know.
"""


class DemystifierOutput(BaseModel):
    level1: str
    level2: str
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
