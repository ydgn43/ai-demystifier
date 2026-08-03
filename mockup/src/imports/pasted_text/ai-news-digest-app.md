Build a daily AI news digest web app. The product takes dense technical AI news
(research papers, model releases, code repos) and rewrites it in plain English.
The audience is software developers, product managers, and founders who want to
keep up with AI without a machine learning degree.

The entire product thesis is TRANSLATION: technical source material on one side,
human-readable explanation on the other. The design should feel like a calm,
well-edited reading tool — the opposite of a hype-filled AI newsletter.

## Screens

1. Daily feed (home) — the main screen
2. Item detail page
3. Empty state for when the feed hasn't loaded yet

## Visual direction

Typography is the core idea. Invert the usual roles:
- Use a MONOSPACE face for all technical scaffolding: metadata, source names,
  category labels, metrics, timestamps, the toggle, and buttons. This is the
  vernacular of the subject — paper IDs, model names, commit hashes are all mono.
- Use a clean, highly readable SANS for the actual plain-English headline and
  summary body. The human-readable content should feel typographically different
  from the machine-readable content.
- Suggested pairing: IBM Plex Mono + IBM Plex Sans. If unavailable, JetBrains Mono
  + Public Sans.

Palette — cool paper, not warm cream:
- Background: #F5F6F8
- Card surface: #FFFFFF
- Primary text (ink): #14171C
- Secondary text: #5C6470
- Hairline borders: #E982E6EA — use #E3E6EA
- Accent A (Casual mode): #C2410C
- Accent B (Developer mode): #1F52E0

The two accents are structural, not decorative: the accent color changes depending
on which explain level the reader is in. This is the only place color does work.

Layout: single column, max content width around 700px, centered. This is a reading
product, not a dashboard — do not use a multi-column card grid. Generous vertical
rhythm. Flat surfaces with 1px hairline borders instead of drop shadows. Small
border radius (4px max) or none.

## The global explain-level toggle — the most important element

A two-position toggle pinned to the top of the feed, always visible on scroll:
  [ CASUAL ]  [ DEVELOPER ]

It is GLOBAL, not per card. Switching it re-renders the summary text of every card
at once. Make this toggle feel like the primary gesture of the product — give it
real presence, not a tiny pill switch buried in a corner.

When toggled, the summary body text crossfades quickly (150ms). Nothing else on
the page moves. The accent color shifts from Accent A to Accent B.

## Card anatomy

Each card in the feed, top to bottom:
- Row 1 (mono, small, secondary text): CATEGORY CHIP · source name · metric ·
  relative timestamp
  e.g. "MODELS · Hugging Face · 412 upvotes · 6h ago"
- Row 2: Plain-English headline in the sans face, around 20px, medium weight.
  This is a rewritten headline, not the original paper title.
- Row 3: 2–3 sentence summary in the sans face, around 16px, comfortable
  line-height (1.6). This text swaps when the toggle changes.
- Row 4 (mono, small): "VIEW SOURCE ->" link. This is always present on every
  card in both modes — it never hides.

Category chips use the four categories: MODELS, RESEARCH, DEVELOPER TOOLS,
INDUSTRY NEWS. Differentiate them with a small mono label and a hairline border,
not with four different bright colors.

## Jargon tooltips

Certain technical terms inside the summary text get a dotted underline in the
current accent color. On hover (desktop) or tap (mobile), a small tooltip appears
with a very short plain-English analogy. Keep the tooltip compact — one short line,
dark background, mono text.

Terms to demo and their tooltip text:
- quantization → "Compressing a model like a JPEG"
- VRAM → "Your graphics card's working memory"
- context window → "How much it can read at once"
- KV cache → "The model's short-term scratchpad"
- LoRA → "A small patch on a big model"

## Header and footer

Header: product name in mono, small, left-aligned. Today's date in mono on the
right. A single hairline rule underneath. No nav menu, no hero section, no big
marketing headline — the feed starts immediately.

Footer: one line of quiet copy plus a single-field email capture:
"One email each morning. No hype." with an input and a SUBSCRIBE button in mono.

## Sample content — use this exact copy, do not use lorem ipsum

Write both a Casual and a Developer version for each card so the toggle can be
demonstrated. This is placeholder copy for design purposes.

CARD 1 — MODELS · Hugging Face · 412 upvotes · 6h ago
Headline: A small open model now reads charts and screenshots
Casual: A new free-to-use model can read charts, screenshots, and scanned
documents about as well as the expensive commercial ones. The notable part is
size — it runs on a single consumer graphics card instead of a server rack.
Developer: 8B vision-language model released under Apache 2.0. Reported parity
with larger closed models on document-QA benchmarks. At 4-bit quantization it
needs roughly 10GB of VRAM, so it fits on a 12GB card.

CARD 2 — RESEARCH · arXiv · cs.CL · 9h ago
Headline: A method for remembering much longer conversations
Casual: Researchers describe a way to let a model handle far longer documents
without slowing to a crawl. In practice this means an assistant could read an
entire codebase or a long contract in one go.
Developer: Replaces full attention with sparse retrieval over the KV cache.
Claims near-linear scaling past a 200k context window with minimal quality loss
on long-context evaluation suites.

CARD 3 — DEVELOPER TOOLS · GitHub · +4.2k stars this week · 11h ago
Headline: Turn any Python function into an API in one line
Casual: A tool that takes a normal Python function and turns it into something
other programs can call over the internet, with the documentation written for you
automatically.
Developer: Decorator-based wrapper over FastAPI that generates OpenAPI schemas
directly from type hints. Adds automatic request validation and a hosted docs
page with no extra configuration.

CARD 4 — RESEARCH · Hugging Face · 288 upvotes · 14h ago
Headline: Fine-tuning gets cheaper on consumer hardware
Casual: A new training recipe cuts the memory needed to customize a model on
your own data, bringing it within reach of a normal gaming PC rather than rented
cloud hardware.
Developer: Combines LoRA adapters with gradient checkpointing and 8-bit
optimizers. Reports fine-tuning a 13B model within 16GB of VRAM at roughly 70%
of full fine-tune quality on the reported benchmarks.

CARD 5 — INDUSTRY NEWS · 1d ago
Headline: Inference pricing drops again across major providers
Casual: Running AI models through the big cloud services got noticeably cheaper
this week, continuing a steady year-long slide in prices.
Developer: Per-million-token pricing on mid-tier models fell roughly 30%
quarter over quarter. Batch endpoints remain the cheapest path for non-latency-
sensitive workloads.

## Item detail page

Same header. Shows one item: the full card content, the original technical title
in mono as a secondary line, the tag list, and a prominent VIEW SOURCE button.
Below that, a short "Why this matters" paragraph. Keep the explain-level toggle
present here too.

## Do not

- No purple or blue gradients, no glassmorphism, no glow effects, no sparkle or
  magic-wand icons, no robot or brain imagery
- No hero section with a large number and a tagline
- No three-column dashboard grid
- No drop shadows on cards
- No stock photography or illustration
- Do not put the explain-level toggle on individual cards

Make it responsive down to 380px. Single column throughout, tooltips become tap
targets on mobile, toggle stays pinned to the top.