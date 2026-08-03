export type Category = 'MODELS' | 'RESEARCH' | 'DEVELOPER TOOLS' | 'INDUSTRY NEWS'
export type Level = 'casual' | 'developer'

export interface Card {
  id: string
  category: Category
  source: string
  metric: string
  timestamp: string
  headline: string
  casual: string
  developer: string
  sourceUrl: string
  technicalTitle: string
  whyItMatters: {
    casual: string
    developer: string
  }
}

export const CARDS: Card[] = [
  {
    id: '1',
    category: 'MODELS',
    source: 'Hugging Face',
    metric: '412 upvotes',
    timestamp: '6h ago',
    headline: 'A small open model now reads charts and screenshots',
    casual:
      'A new free-to-use model can read charts, screenshots, and scanned documents about as well as the expensive commercial ones. The notable part is size — it runs on a single consumer graphics card instead of a server rack.',
    developer:
      'An 8B vision-language model released under Apache 2.0. Reported parity with larger closed models on document-QA benchmarks. At 4-bit <quantization> it needs roughly 10GB of <VRAM>, so it fits on a 12GB card.',
    sourceUrl: '#',
    technicalTitle: 'VLM-8B: Document-QA Parity at 4-bit Quantization',
    whyItMatters: {
      casual:
        'Smaller models that can actually read documents close the gap between what hobbyists can run at home and what big companies use in production.',
      developer:
        'Apache 2.0 licensing with 4-bit quantization targeting 12GB consumer cards means this is production-usable for document pipelines without cloud inference costs.',
    },
  },
  {
    id: '2',
    category: 'RESEARCH',
    source: 'arXiv',
    metric: 'cs.CL',
    timestamp: '9h ago',
    headline: 'A method for remembering much longer conversations',
    casual:
      'Researchers describe a way to let a model handle far longer documents without slowing to a crawl. In practice this means an assistant could read an entire codebase or a long contract in one go.',
    developer:
      'Replaces full attention with sparse retrieval over the <KV cache>. Claims near-linear scaling past a 200k <context window> with minimal quality loss on long-context evaluation suites.',
    sourceUrl: '#',
    technicalTitle: 'SparseRetrieval: Sub-Quadratic Attention via KV Cache Indexing',
    whyItMatters: {
      casual:
        'Models that can hold longer conversations or read bigger files without forgetting earlier parts are much more useful for real work.',
      developer:
        'Near-linear attention scaling past 200k tokens without fine-tuning changes the economics for long-document RAG and multi-turn agent loops.',
    },
  },
  {
    id: '3',
    category: 'DEVELOPER TOOLS',
    source: 'GitHub',
    metric: '+4.2k stars this week',
    timestamp: '11h ago',
    headline: 'Turn any Python function into an API in one line',
    casual:
      'A tool that takes a normal Python function and turns it into something other programs can call over the internet, with the documentation written for you automatically.',
    developer:
      'Decorator-based wrapper over FastAPI that generates OpenAPI schemas directly from type hints. Adds automatic request validation and a hosted docs page with no extra configuration.',
    sourceUrl: '#',
    technicalTitle: 'fn2api: FastAPI Schema Generation from Python Type Hints',
    whyItMatters: {
      casual:
        'Removing the boilerplate between writing a function and exposing it as an API lowers the barrier to building tools that AI agents can call.',
      developer:
        'Automatic OpenAPI generation from type hints removes a common friction point when building tool-use surfaces for LLM agents.',
    },
  },
  {
    id: '4',
    category: 'RESEARCH',
    source: 'Hugging Face',
    metric: '288 upvotes',
    timestamp: '14h ago',
    headline: 'Fine-tuning gets cheaper on consumer hardware',
    casual:
      'A new training recipe cuts the memory needed to customize a model on your own data, bringing it within reach of a normal gaming PC rather than rented cloud hardware.',
    developer:
      'Combines <LoRA> adapters with gradient checkpointing and 8-bit optimizers. Reports fine-tuning a 13B model within 16GB of <VRAM> at roughly 70% of full fine-tune quality on the reported benchmarks.',
    sourceUrl: '#',
    technicalTitle: 'EfficientFT: LoRA + 8-bit Optimizers for 16GB Consumer GPUs',
    whyItMatters: {
      casual:
        'When training your own version of a model costs a few dollars on a gaming PC instead of hundreds on cloud GPUs, it becomes practical for a much wider set of projects.',
      developer:
        '70% quality retention at 16GB VRAM changes the calculus for domain adaptation. Worth benchmarking against QLoRA on your specific task before committing.',
    },
  },
  {
    id: '5',
    category: 'INDUSTRY NEWS',
    source: 'Industry',
    metric: '',
    timestamp: '1d ago',
    headline: 'Inference pricing drops again across major providers',
    casual:
      'Running AI models through the big cloud services got noticeably cheaper this week, continuing a steady year-long slide in prices.',
    developer:
      'Per-million-token pricing on mid-tier models fell roughly 30% quarter over quarter. Batch endpoints remain the cheapest path for non-latency-sensitive workloads.',
    sourceUrl: '#',
    technicalTitle: 'Inference Cost Benchmarks: Q2 2026 Provider Pricing Survey',
    whyItMatters: {
      casual:
        'Cheaper inference means AI features that were too expensive to build six months ago are now worth revisiting.',
      developer:
        'At 30% QoQ decline, batch endpoint economics for offline pipelines are now compelling enough to replace synchronous calls in many architectures.',
    },
  },
]

export const JARGON: Record<string, string> = {
  quantization: 'Compressing a model like a JPEG',
  VRAM: "Your graphics card's working memory",
  'context window': 'How much it can read at once',
  'KV cache': "The model's short-term scratchpad",
  LoRA: 'A small patch on a big model',
}
