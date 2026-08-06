export type LearnLevel = "beginner" | "intermediate" | "advanced";

export const LEVELS: LearnLevel[] = ["beginner", "intermediate", "advanced"];

export const LEVEL_LABELS: Record<LearnLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// Plain hairline chip, no color differentiation by level — color is
// reserved for the casual/developer accent elsewhere in the design.
export const LEVEL_BADGE_CLASS =
  "rounded-[2px] border border-hairline px-1.5 py-0.5 text-[10px] tracking-[0.08em] text-ink";

export type LearnArticle = {
  slug: string;
  title: string;
  teaser: string;
  level: LearnLevel;
  icon: string;
  // Short, retrieval-friendly query for the "related right now" section —
  // full-text search works better on a focused term than a full question.
  keywords: string;
  body: string[];
  // Mirrors history-content.ts's `sourceUrl` verifiability discipline, adapted
  // to Learn's explainer format: a short list rather than one claim-per-entry
  // link.
  furtherReading?: { title: string; url: string }[];
};

// Fixed, hand-written set (not tied to any digest item) — a beginner-to-
// advanced path through the concepts that actually show up in the daily
// digest. Static on purpose: this content changes rarely, so it doesn't
// need a database table or an endpoint, just a page per slug.
export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: "what-is-an-llm",
    title: "What is an LLM?",
    teaser: "The basics of what a large language model actually is, in plain terms.",
    level: "beginner",
    icon: "🤖",
    keywords: "language model",
    body: [
      `An LLM — large language model — is a type of AI trained on huge amounts of text to predict and generate language. "Large" refers to its parameter count: the number of internal values the model adjusts during training, often in the billions.`,
      `At a high level, an LLM is trained to predict the next word (or word-piece, called a token) given everything before it. Doing that well, across enough text, forces the model to pick up patterns of grammar, facts, reasoning, and style along the way — not because it was explicitly taught grammar or facts, but because predicting text accurately requires implicitly learning them.`,
      `It's worth being clear about what an LLM is not. It doesn't "look things up" the way a search engine does — its knowledge is baked into its parameters from training, frozen at whatever point its training data was collected, unless it's explicitly given more information (see retrieval-augmented generation). It also doesn't have real understanding or awareness in any human sense — it's pattern completion at a very large scale.`,
      `That pattern-completion ability turns out to be extremely useful: writing, summarizing, translating, answering questions, writing code, and holding a conversation are all things an LLM can do by producing plausible continuations of text based on what it learned.`,
      `The main limitation to keep in mind is that an LLM can state incorrect things with exactly the same confidence as correct things — a behavior often called hallucination. It also can't know about anything after its training cutoff on its own, and how well it performs on a given task depends heavily on how the task is described to it.`,
    ],
    furtherReading: [
      { title: "Wikipedia: Large language model", url: "https://en.wikipedia.org/wiki/Large_language_model" },
    ],
  },
  {
    slug: "machine-learning-vs-deep-learning",
    title: "Machine learning vs. deep learning",
    teaser: "Two terms that get used almost interchangeably, and how they actually relate.",
    level: "beginner",
    icon: "🌳",
    keywords: "machine learning deep learning",
    body: [
      `Machine learning is the broader idea: instead of a programmer writing explicit rules for a task, a system learns patterns directly from data. That single idea covers a huge range of techniques, from simple statistical methods that fit a line to a set of points, to the large neural networks behind today's LLMs.`,
      `Deep learning is one specific approach within machine learning: it uses neural networks with many stacked layers — "deep" refers to that layer count — to learn increasingly abstract representations of data. An early layer in an image model might learn to detect edges; a later layer might learn to recognize whole objects, built up from those simpler patterns.`,
      `Before deep learning became practical, many machine learning systems relied on "feature engineering" — a person manually deciding which properties of the data the model should look at. Deep learning largely automates that step, letting the network discover useful features on its own directly from raw data, given enough examples and compute.`,
      `That shift is a large part of why deep learning came to dominate fields like vision and language over the last decade: for messy, high-dimensional data like images, audio, or text, deciding which features matter by hand turned out to be far harder than just letting a deep network find them itself.`,
      `In practice, "machine learning" is still the correct umbrella term for the field, and plenty of production systems still use non-deep methods where they work well and are cheaper to run. But almost every model discussed as "AI" in the current wave of interest — including the LLMs this site covers — is a deep learning model specifically, not just machine learning in the older, shallower sense.`,
    ],
    furtherReading: [{ title: "Wikipedia: Deep learning", url: "https://en.wikipedia.org/wiki/Deep_learning" }],
  },
  {
    slug: "how-transformers-work",
    title: "How transformers work",
    teaser: "The architecture behind almost every modern language model, explained without the math.",
    level: "beginner",
    icon: "🧩",
    keywords: "transformer architecture attention",
    body: [
      `Transformers are the neural network architecture underlying essentially all modern LLMs — GPT, Claude, Llama, Gemini, and the rest. They were introduced in a 2017 paper, and they replaced older architectures that processed text strictly one word at a time.`,
      `The core idea is the attention mechanism: it lets the model weigh how relevant every other part of the input is when processing or generating each word, instead of only looking at nearby words. That means a pronoun near the end of a paragraph can directly "attend to" the noun it refers to at the start, no matter how much text sits in between.`,
      `This matters for two reasons: it lets the model capture long-range relationships in text that older architectures struggled with, and it lets the whole input be processed in parallel rather than one word at a time. That parallelism is a big part of why transformers scale so well as you throw more data and compute at them.`,
      `Before any of that happens, text is broken into tokens — pieces of words — and each token is converted into a vector of numbers called an embedding, which represents its meaning in a form the model can do math with. The model then passes these vectors through many stacked layers of attention and simple transformations, refining its representation of meaning at each layer, until it can predict what token comes next.`,
      `A transformer is, roughly, many of these attention layers stacked on top of each other. More layers and larger internal representations generally let a model capture more complex patterns — which is a large part of why bigger models tend to be more capable, up to the limits of the data and compute used to train them.`,
    ],
    furtherReading: [{ title: "Attention Is All You Need (2017)", url: "https://arxiv.org/abs/1706.03762" }],
  },
  {
    slug: "tokens-and-tokenization",
    title: "Tokens and tokenization",
    teaser: "The actual unit of text a model reads and writes, and why it's not quite \"words.\"",
    level: "beginner",
    icon: "🔤",
    keywords: "tokens tokenization",
    body: [
      `A model doesn't read text as letters or whole words — it reads a sequence of tokens, and tokenization is the process of converting raw text into that sequence before anything else happens. A token is often a whole common word, but just as often a fragment of a word, a single character, or a piece of punctuation.`,
      `Splitting on whole words alone would be impractical: it would require a separate token for every possible word, including ones never seen during training, in every language the model needs to handle. Subword tokenization solves this by learning a fixed vocabulary of frequently-occurring pieces, so that any input text — including made-up words or typos — can still be broken down into some combination of known pieces.`,
      `This has a very practical consequence readers of AI news run into constantly: a model's context window and its usage cost are both measured in tokens, not words or characters, and a rough rule of thumb is that one token is a bit less than one English word on average. That's why the same sentence can consume a noticeably different number of tokens depending on language, spelling, or how much punctuation and formatting it contains.`,
      `Tokenization also shapes some odd model behaviors that otherwise look like mysteries. A model can struggle at tasks like counting letters within a word, or precise character-level manipulation, because it never actually "sees" the individual letters as separate units — it sees whatever token pieces the tokenizer happened to split that word into.`,
      `Different model families generally use their own tokenizer, trained on their own mix of training text, which is part of why token counts for the exact same sentence can differ from one model to another — and why a prompt or document that fits comfortably in one model's context window might need trimming for a different one.`,
    ],
    furtherReading: [
      {
        title: "Neural Machine Translation of Rare Words with Subword Units",
        url: "https://arxiv.org/abs/1508.07909",
      },
    ],
  },
  {
    slug: "training-vs-inference",
    title: "Training vs inference",
    teaser: "Two very different phases of a model's life, and why the difference matters.",
    level: "beginner",
    icon: "⚙️",
    keywords: "training inference",
    body: [
      `Training is the process of teaching a model from scratch: feeding it huge amounts of text and repeatedly adjusting its internal parameters so its predictions get better. For a large model, this can take weeks on clusters of specialized hardware, and cost anywhere from thousands to tens of millions of dollars depending on the model's size.`,
      `Inference is what happens every time the trained model is actually used: you give it a prompt, it runs a single pass through its now-fixed parameters, and produces an output. Inference is comparatively cheap and fast — which is why a service can handle millions of requests a day using a model that took months to train.`,
      `A rough analogy: training is like years of schooling, and inference is like the model taking a single exam question, using everything it learned, without learning anything new from that particular question in a typical setup.`,
      `This distinction has a practical consequence that trips people up: a model doesn't remember your conversation between separate requests unless the previous conversation is explicitly included again as part of the prompt each time. Its knowledge is also frozen as of whenever its training data was collected, unless it's connected to some live source of information.`,
      `Fine-tuning and similar techniques sit in between the two: they continue training an already-trained model, at far lower cost than training from scratch, to specialize its behavior. See the fine-tuning article for more on that.`,
    ],
    furtherReading: [
      { title: "Backblaze: AI 101 — Training vs. Inference", url: "https://www.backblaze.com/blog/ai-101-training-vs-inference/" },
    ],
  },
  {
    slug: "what-is-fine-tuning",
    title: "What is fine-tuning?",
    teaser: "Taking a general-purpose model and specializing it, without starting from scratch.",
    level: "intermediate",
    icon: "🎯",
    keywords: "fine-tuning",
    body: [
      `Fine-tuning takes a model that's already been trained broadly — a "pretrained" or "base" model — and continues training it on a smaller, more specific dataset, to specialize its behavior for a particular task, domain, or style.`,
      `The reason this works, and is worth doing instead of training from scratch, is that the model already has a broad understanding of language, facts, and reasoning from its initial training. Fine-tuning only needs to nudge that existing capability toward a narrower use case, which takes far less data and compute than starting from zero.`,
      `Common uses include teaching a model a particular tone of voice, making it stronger in a specific domain like legal or medical text, teaching it to follow instructions more reliably (often called instruction tuning), or shaping it to match human preferences more closely (see the alignment article).`,
      `Full fine-tuning updates every parameter in the model, which is still expensive for large models. Lightweight techniques like LoRA (Low-Rank Adaptation) instead train a small set of additional parameters while leaving the original model frozen, capturing much of the benefit at a fraction of the cost — which is a big part of why fine-tuning has become accessible outside large labs.`,
      `Fine-tuning isn't always the answer, though. Often the same specialization can be achieved just by writing a better prompt or including examples directly in the prompt (few-shot prompting), with no change to the model's weights at all. Fine-tuning becomes worthwhile when you need consistent behavior across many uses, or want to bake in style or knowledge that would be awkward to repeat in every single prompt.`,
    ],
    furtherReading: [
      { title: "LoRA: Low-Rank Adaptation of Large Language Models", url: "https://arxiv.org/abs/2106.09685" },
    ],
  },
  {
    slug: "vector-embeddings-and-vector-databases",
    title: "Vector embeddings and vector databases",
    teaser: "How a model turns meaning into numbers, and how that gets searched at scale.",
    level: "intermediate",
    icon: "🧭",
    keywords: "vector embeddings database",
    body: [
      `An embedding is a list of numbers — a vector — that represents the meaning of a piece of text (or an image, audio clip, and so on) in a form a computer can do math with. Texts with similar meaning end up with embeddings that are numerically close together, even if they don't share any of the same words.`,
      `These representations are learned, not hand-designed: a model is trained so that examples it's told are similar end up close together in this numerical space, and examples that are different end up far apart. The transformer architecture used in modern LLMs already produces representations like this internally as part of processing text — see how transformers work for more on that.`,
      `A vector database is a system built specifically to store large numbers of these embeddings and efficiently find the ones closest to a given query embedding, out of millions or billions of candidates — a task that would be far too slow to do by comparing every single one directly at query time using naive methods.`,
      `This combination — turn text into an embedding, then search a vector database for the closest matches — is the standard way to implement semantic search: finding results that mean the same thing as a query rather than only ones sharing exact keywords. It's also the retrieval mechanism behind retrieval-augmented generation, where the retrieved passages get inserted into a model's prompt.`,
      `Embeddings aren't limited to text. Images, audio, and other data types can be embedded into the same kind of numerical space, and in multimodal models, text and image embeddings can even be trained to land close together when they describe the same thing — which is part of what lets a single model reason about both at once.`,
    ],
    furtherReading: [
      {
        title: "Efficient Estimation of Word Representations in Vector Space",
        url: "https://arxiv.org/abs/1301.3781",
      },
    ],
  },
  {
    slug: "retrieval-augmented-generation",
    title: "Retrieval-Augmented Generation (RAG)",
    teaser: "How to get a model to answer using information it wasn't trained on.",
    level: "intermediate",
    icon: "📚",
    keywords: "retrieval augmented generation RAG",
    body: [
      `RAG addresses two LLM limitations at once: models don't know anything after their training cutoff, and they sometimes state incorrect things with total confidence. RAG has the model look up relevant information from an external source before answering, rather than relying purely on what it memorized during training.`,
      `Roughly, it works like this: a user's question is used to search a knowledge base — documents, a database, the web — for relevant passages; those passages are inserted into the model's prompt alongside the question; the model then generates an answer grounded in that retrieved text instead of purely from memory.`,
      `The "retrieval" step typically uses embeddings — the same numerical representations of meaning used inside transformers — stored in a vector database, so the system can find passages that are semantically relevant to a question rather than only ones that share exact keywords.`,
      `RAG is useful for keeping answers current without retraining a model, letting a model answer questions about private documents it was never trained on, and reducing — though not eliminating — hallucination by giving the model real source text to work from.`,
      `Its main limitation is that it's only as good as the retrieval step: if the wrong passages get retrieved, the model will confidently answer based on the wrong information. RAG also doesn't teach the model anything new about how to reason — it just gives it better material to reason over for that one request.`,
    ],
    furtherReading: [
      {
        title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        url: "https://arxiv.org/abs/2005.11401",
      },
    ],
  },
  {
    slug: "what-are-ai-agents",
    title: "What are AI agents?",
    teaser: "The difference between a model that talks and a model that acts.",
    level: "intermediate",
    icon: "🕹️",
    keywords: "agent",
    body: [
      `A plain LLM, on its own, just takes text in and produces text out. An "agent" wraps a model with the ability to take actions — calling external tools, running code, browsing the web, reading and writing files — and to decide which actions to take, in what order, toward some goal.`,
      `The basic loop looks like this: the model is given a goal and a description of the tools available to it; it decides what to do next (say, "search the web for X"); that action is actually carried out by the surrounding system; the result is fed back to the model; and it decides the next step, repeating until it judges the goal complete.`,
      `This turns a model from something that can only describe an answer into something that can actually go find information, check its own work, or make changes in the world — within whatever boundaries it's been given.`,
      `Common building blocks include function calling or tool use (the model's ability to invoke external functions in a structured, machine-readable way), some form of memory or scratchpad to track progress across steps, and often a way for the model to reflect on and correct its own mistakes mid-task.`,
      `The risks scale with the capability granted. An agent that can only answer questions can only be wrong. An agent that can execute code, spend money, or send messages can actually cause harm if it misjudges a situation — which is why agent systems are usually given guardrails, such as permission checks, human approval steps, or sandboxing, proportional to what they're allowed to do.`,
    ],
    furtherReading: [
      { title: "ReAct: Synergizing Reasoning and Acting in Language Models", url: "https://arxiv.org/abs/2210.03629" },
    ],
  },
  {
    slug: "open-weights-vs-api-models",
    title: "Open weights vs API models",
    teaser: "Two very different ways to actually get and use a model.",
    level: "intermediate",
    icon: "🔓",
    keywords: "open weights open source model",
    body: [
      `An API model — the way most of the largest, most capable models are offered — is accessed only by sending requests to a company's servers over the internet. You never get the model file itself, just its outputs, and the company controls how it's run, updated, priced, or discontinued.`,
      `An open-weights model is one where the trained parameters themselves are published for anyone to download and run, on their own hardware or any cloud provider of their choosing. That gives full control over deployment, at the cost of being responsible for the infrastructure to actually run it.`,
      `Open weights is not the same thing as open source in the traditional software sense. Having the weights doesn't necessarily mean you also have the training code, the training data, or a license that permits anything you'd like — licenses on open-weight models vary widely in what they actually allow.`,
      `The practical trade-off: API models are typically the most capable available at any given time and need no infrastructure to use, but cost per request, depend on a third party staying available, and mean your data passes through someone else's servers. Open-weight models offer privacy, control, and no per-request cost, but usually lag behind the best API models in raw capability and need real hardware — or a rented GPU — to run at reasonable speed.`,
      `A lot of real products end up using both: prototyping against an API model for speed, then moving to a self-hosted open-weight model for cost, privacy, or reliability reasons once requirements are clear. This site's own summarization pipeline made exactly that switch, for exactly those reasons.`,
    ],
    furtherReading: [
      { title: "Llama 2: Open Foundation and Fine-Tuned Chat Models", url: "https://arxiv.org/abs/2307.09288" },
    ],
  },
  {
    slug: "multimodal-models-beyond-text",
    title: "Multimodal models: beyond text",
    teaser: "How a single model ends up handling images, audio, or video alongside language.",
    level: "intermediate",
    icon: "🖼️",
    keywords: "multimodal vision language model",
    body: [
      `A multimodal model is one that can take in, and sometimes generate, more than one type — or "modality" — of data: text and images together are the most common pairing today, but audio and video are increasingly included too. Ordinary LLMs are unimodal: text in, text out.`,
      `The core challenge is getting genuinely different kinds of data into a shared representation the same underlying network can reason over. A common approach converts an image into a sequence of numerical embeddings — conceptually similar to how text is tokenized and embedded — so that the model's attention mechanism can relate a described object in text directly to the corresponding region of an image.`,
      `Some multimodal models are built for understanding: given an image and a question about it, they respond in text, useful for tasks like describing a photo, reading a chart, or explaining a screenshot. Others are built for generation, producing an image, audio clip, or video from a text description — see the diffusion models article for the most common technique behind image generation specifically.`,
      `Training a multimodal model typically involves large paired datasets — images with captions, video with transcripts — so the model can learn which text descriptions correspond to which visual or audio content, rather than being told explicit rules connecting the two.`,
      `This matters for reading AI news because "model" coverage isn't only about text anymore: a growing share of new releases are multimodal from the start, and treating every model announcement as if it's purely about chat-style text generation increasingly misses what a given release actually does.`,
    ],
    furtherReading: [
      {
        title: "Learning Transferable Visual Models From Natural Language Supervision (CLIP)",
        url: "https://arxiv.org/abs/2103.00020",
      },
    ],
  },
  {
    slug: "quantization",
    title: "Quantization: making models smaller",
    teaser: "How a huge model gets small enough to run on ordinary hardware.",
    level: "advanced",
    icon: "📦",
    keywords: "quantization",
    body: [
      `A model's parameters — its weights — are just numbers, normally stored with fairly high precision, such as 16 or 32 bits per number. Quantization reduces that precision, commonly down to 8 or 4 bits per number, which shrinks the model's memory footprint and speeds up inference, at some cost to accuracy.`,
      `This matters because a large model at full precision can need far more memory than an ordinary GPU has available. Quantizing it can be the difference between needing a data-center-grade GPU and running comfortably on a decent gaming GPU, or even a laptop.`,
      `It works reasonably well because neural networks turn out to be fairly tolerant of reduced numerical precision. Small rounding differences in individual weights tend to average out across the millions or billions of parameters in a model, so overall output quality degrades only modestly even at fairly aggressive quantization levels.`,
      `It isn't free, though. Push the precision too low, or quantize sensitive parts of a model too aggressively, and quality drops noticeably — the model can become less coherent, worse at precise tasks like arithmetic, or more repetitive. Different quantization methods make different trade-offs between size, speed, and how much quality is preserved.`,
      `Most tools for running open-weight models locally, such as Ollama, default to a quantized version of a model rather than the original full-precision release, specifically so it fits on consumer hardware. That's quietly a big part of why running AI models on an ordinary computer is practical at all.`,
    ],
    furtherReading: [
      { title: "LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale", url: "https://arxiv.org/abs/2208.07339" },
    ],
  },
  {
    slug: "mixture-of-experts",
    title: "Mixture of experts",
    teaser: "Why some of the largest models don't actually use their full size on every request.",
    level: "advanced",
    icon: "🧠",
    keywords: "mixture of experts",
    body: [
      `In an ordinary ("dense") model, every parameter is used to process every input. A mixture-of-experts (MoE) model instead splits parts of the network into many separate "expert" sub-networks, and a small router component decides, for each piece of input, which handful of experts should actually process it.`,
      `The practical effect is that a MoE model can have a very large total parameter count — since all those experts exist and were trained — while only "activating," and paying the compute cost for, a much smaller subset of them on any given request. That's often summarized as having a big total size but a much smaller effective size at inference.`,
      `This matters because compute cost during inference tracks the active parameters used, not the total ones stored. A well-designed MoE model can approach the capability of a much larger dense model while costing noticeably less to actually run, which is a big part of why several of the largest publicly discussed models in recent years have used this architecture.`,
      `It isn't free of trade-offs. Routing decisions can be imperfect — sending an input to experts that aren't actually the best fit for it — and MoE models still need enough memory to hold every expert, even the ones sitting idle for a given request, which keeps total hardware requirements high even when compute cost is lower.`,
      `Quantization, discussed elsewhere, addresses a related but different problem — shrinking each individual weight's precision — so the two techniques are often used together: a mixture-of-experts model can also be quantized, compounding the efficiency gains from routing with the efficiency gains from reduced numerical precision.`,
    ],
    furtherReading: [
      {
        title: "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer",
        url: "https://arxiv.org/abs/1701.06538",
      },
    ],
  },
  {
    slug: "reasoning-models-and-chain-of-thought",
    title: "Reasoning models and chain-of-thought",
    teaser: "Why some models pause and \"think\" before answering, and what that's actually doing.",
    level: "advanced",
    icon: "🧗",
    keywords: "reasoning model chain of thought",
    body: [
      `Chain-of-thought refers to a model producing intermediate reasoning steps — working through a problem out loud, in effect — before giving a final answer, rather than jumping straight to a response. Even a general-purpose model can be prompted to do this ("think step by step"), and it often improves accuracy on tasks that require multiple steps of logic or arithmetic.`,
      `A "reasoning model" takes this further by being specifically trained to generate long, deliberate reasoning traces as a core part of how it operates, rather than only when a user happens to prompt for it. These extended reasoning traces are generated before the final answer and can be substantially longer than the answer itself.`,
      `This is often trained using reinforcement learning: the model is rewarded when its reasoning leads to a correct final answer on checkable tasks like math or code, which encourages it to develop and reuse reasoning strategies that actually work, rather than just imitating reasoning-shaped text seen during pretraining.`,
      `The trade-off is speed and cost: generating a long reasoning trace before answering takes meaningfully more time and compute than answering directly, so reasoning models tend to be slower and more expensive per response than a comparably-sized non-reasoning model, even when the final answer is short.`,
      `This approach has produced real gains on benchmarks involving multi-step math, logic, and coding specifically — the kinds of checkable tasks discussed in the evaluation and benchmarks article — but a longer reasoning trace doesn't guarantee a correct answer, and reasoning models can still confidently reach the wrong conclusion after a long, plausible-looking chain of steps.`,
    ],
    furtherReading: [
      {
        title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
        url: "https://arxiv.org/abs/2501.12948",
      },
    ],
  },
  {
    slug: "diffusion-models-how-image-generators-work",
    title: "Diffusion models: how image generators work",
    teaser: "The technique behind most modern AI image generators, explained without the math.",
    level: "advanced",
    icon: "🎨",
    keywords: "diffusion model image generation",
    body: [
      `Most modern AI image generators are diffusion models. The core idea is trained in reverse: take real images, gradually add random noise to them over many steps until they become pure static, and train a model to predict and undo that noise, one step at a time.`,
      `Once trained, generation runs that process backward from scratch: start from pure random noise and repeatedly apply the model's learned "denoising" step, gradually turning static into a coherent image over many iterations, rather than producing the final image in one shot.`,
      `A text-to-image diffusion model adds a text description into this process, typically via a text embedding (see vector embeddings and vector databases) that guides each denoising step toward an image matching the description, rather than denoising toward an arbitrary image.`,
      `This step-by-step refinement is a major reason diffusion models can produce highly detailed, coherent images: each step only has to make a small, more manageable correction, rather than generating all the fine detail in one pass. It also means generation is inherently slower than a single forward pass through a model — more steps generally means higher quality at the cost of more compute.`,
      `Diffusion isn't the only way to generate images with AI — earlier approaches like GANs (generative adversarial networks) work quite differently — but diffusion's combination of image quality and training stability is a large part of why it became the dominant approach behind today's most widely used image generators.`,
    ],
    furtherReading: [
      { title: "Denoising Diffusion Probabilistic Models", url: "https://arxiv.org/abs/2006.11239" },
    ],
  },
  {
    slug: "evaluation-and-benchmarks",
    title: "Evaluation & benchmarks",
    teaser: "How anyone claims a model is \"better\" than another one, and why to be skeptical.",
    level: "advanced",
    icon: "📊",
    keywords: "benchmark evaluation",
    body: [
      `A benchmark is a standardized test — a fixed set of questions or tasks with known correct answers — used to measure and compare model performance. When an announcement says a model "scores X% on benchmark Y," this is what it means.`,
      `Benchmarks exist because, without them, comparing models would be purely subjective. A shared, fixed test lets different labs' models be compared on the same footing, and lets a single lab track whether a change actually improved their model rather than just feeling like an improvement.`,
      `They're good at measuring well-defined, checkable skills: solving math problems, answering multiple-choice questions across subjects, writing code that passes given tests, following instructions correctly — areas where "correct" can be checked automatically or close to it.`,
      `They're worse at capturing things like helpfulness in an open-ended conversation, good judgment in ambiguous situations, or whether a model is pleasant to actually work with. There's also a real risk of "teaching to the test": a model can be tuned specifically to do well on popular benchmarks without genuinely improving in the ways those benchmarks were meant to measure, and benchmark questions can leak into training data, inflating scores without reflecting real capability.`,
      `A reasonable way to read benchmark claims: treat any single high score with some skepticism, look for consistent performance across several benchmarks that measure different skills, and remember that a model's usefulness for your specific task is something benchmarks can only approximate, not guarantee.`,
    ],
    furtherReading: [
      { title: "Measuring Massive Multitask Language Understanding (MMLU)", url: "https://arxiv.org/abs/2009.03300" },
    ],
  },
  {
    slug: "alignment-and-safety-basics",
    title: "Alignment & safety basics",
    teaser: "What people mean when they talk about making AI behave the way we actually want.",
    level: "advanced",
    icon: "🛡️",
    keywords: "alignment safety",
    body: [
      `Alignment refers to the set of techniques and goals aimed at making a model's behavior match what its developers — and ideally its users and society more broadly — actually want, as opposed to whatever behavior falls out of its training process by default.`,
      `That gap isn't automatic to close. A model trained purely to predict plausible next words from internet text will happily reproduce biases, misinformation, or harmful content that appeared in that text, because "plausible continuation" and "helpful, honest, harmless response" are not the same target. Alignment work exists specifically to close that gap.`,
      `One widely-used technique is Reinforcement Learning from Human Feedback, or RLHF: humans rate or rank different model outputs for the same prompt, and those ratings are used to train the model to produce more of what raters preferred and less of what they didn't. This is a large part of why a raw base model and the polished assistant built on top of it can behave quite differently.`,
      `"Safety" covers a mix of concerns at different scales — from near-term issues like a model giving harmful instructions, generating false information persuasively, or being tricked into ignoring its own guidelines, to longer-term and more speculative concerns about whether much more capable future systems could pursue goals in ways their developers didn't intend or couldn't correct. Different people and organizations weigh these concerns very differently.`,
      `It's worth reading alignment and safety research as attempts to solve a real, fairly unglamorous engineering and social problem — making systems already being used by millions of people behave more predictably and beneficially — rather than only as a philosophical debate.`,
    ],
    furtherReading: [
      {
        title: "Training language models to follow instructions with human feedback (InstructGPT)",
        url: "https://arxiv.org/abs/2203.02155",
      },
    ],
  },
];

export function getLearnArticle(slug: string): LearnArticle | undefined {
  return LEARN_ARTICLES.find((article) => article.slug === slug);
}
