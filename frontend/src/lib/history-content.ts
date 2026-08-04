import type { Category } from "@/lib/types";

export type Milestone = {
  // Numeric year, used for grouping/sorting on the visual timeline rail.
  year: number;
  // Display string — more precise than `year` where the exact month is
  // well documented (e.g. "Nov 2022"), otherwise just the year.
  date: string;
  title: string;
  category: Category;
  blurb: string;
  // Every entry is independently verifiable — same idea as raw_items.url
  // being shown as the permanent source link everywhere else in this app.
  sourceUrl: string;
  // Spotlight entries within an era render as full cards; the rest render
  // as a compact list. Hand-picked, not derived from any metric.
  landmark?: boolean;
  // Short, retrieval-friendly query for a "Related right now" section,
  // same rationale as LearnArticle.keywords — full-text search works
  // better on a focused term than a full sentence. Only set on landmark
  // entries; the compact-list entries don't get this treatment.
  keywords?: string;
};

export type Era = {
  title: string;
  startYear: number;
  endYear: number;
  blurb: string;
};

// Hand-picked boundaries over the milestones below — every entry's `year`
// must fall inside exactly one range. A short/quiet era (no landmarks) is
// expected and fine (see "The First AI Winter").
export const HISTORY_ERAS: Era[] = [
  {
    title: "Origins",
    startYear: 1943,
    endYear: 1958,
    blurb:
      "The theoretical and philosophical groundwork for machine intelligence, laid decades before computers were powerful enough to properly test it.",
  },
  {
    title: "The First AI Winter",
    startYear: 1969,
    endYear: 1973,
    blurb:
      "Early optimism collided with real mathematical and practical limits, and funding for AI research collapsed for most of a decade.",
  },
  {
    title: "Quiet Progress",
    startYear: 1986,
    endYear: 1998,
    blurb:
      "Outside the spotlight, the tools that would matter later — backpropagation, support-vector machines, LSTMs — were being built and tested.",
  },
  {
    title: "Setting the Stage",
    startYear: 2007,
    endYear: 2011,
    blurb:
      "GPU computing, large labeled datasets, and new research labs quietly assembled the ingredients the next decade would need.",
  },
  {
    title: "The Deep Learning Boom",
    startYear: 2012,
    endYear: 2016,
    blurb:
      "A single competition result kicked off a rapid cascade of breakthroughs in image recognition, word embeddings, and game-playing AI.",
  },
  {
    title: "The Transformer Era",
    startYear: 2017,
    endYear: 2019,
    blurb:
      "A new architecture built around attention mechanisms became the shared foundation for nearly every major language model that followed.",
  },
  {
    title: "The Generative AI Era",
    startYear: 2020,
    endYear: 2023,
    blurb:
      "Massive language and image models moved out of research papers and into products hundreds of millions of people use directly.",
  },
];

// Fixed, hand-researched set (not tied to any digest item, unlike raw_items
// which only goes back to when ingestion started). Static on purpose, same
// reasoning as learn-content.ts: this doesn't change often, so it doesn't
// need a database table or an endpoint. Researched against Wikipedia and
// primary sources (arXiv papers, official announcements) rather than
// written from memory — every entry's blurb is grounded in what the
// linked source actually says, no invented figures or claims.
export const HISTORY_MILESTONES: Milestone[] = [
  {
    year: 1943,
    date: "1943",
    title: "The McCulloch-Pitts artificial neuron",
    category: "Research",
    blurb:
      "Warren McCulloch and Walter Pitts published a mathematical model of a neuron that could perform logical functions, laying the theoretical groundwork that later neural network research built on.",
    sourceUrl: "https://en.wikipedia.org/wiki/Artificial_neuron",
  },
  {
    year: 1950,
    date: "1950",
    title: "Turing's \"Computing Machinery and Intelligence\"",
    category: "Research",
    blurb:
      "Alan Turing's paper proposed what became known as the Turing test — asking whether a machine's conversation could be distinguished from a human's — as a way to sidestep the question \"can machines think?\"",
    sourceUrl: "https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence",
  },
  {
    year: 1956,
    date: "1956",
    title: "The Dartmouth Workshop",
    category: "Research",
    blurb:
      "A summer workshop organized by John McCarthy, Marvin Minsky, and others at Dartmouth College is generally credited with coining the term \"artificial intelligence\" and establishing it as a field of study.",
    sourceUrl: "https://en.wikipedia.org/wiki/Dartmouth_workshop",
    landmark: true,
    keywords: "artificial intelligence research",
  },
  {
    year: 1958,
    date: "1958",
    title: "The Perceptron",
    category: "Research",
    blurb:
      "Frank Rosenblatt introduced the perceptron, an early single-layer neural network designed for pattern recognition, generating significant early optimism about machine learning.",
    sourceUrl: "https://en.wikipedia.org/wiki/Perceptron",
    landmark: true,
    keywords: "perceptron neural network",
  },
  {
    year: 1969,
    date: "1969",
    title: "\"Perceptrons\" and the first AI winter",
    category: "Research",
    blurb:
      "Marvin Minsky and Seymour Papert's book detailed serious mathematical limitations of single-layer perceptrons, which contributed to a sharp drop in funding and interest in neural network research for over a decade.",
    sourceUrl: "https://en.wikipedia.org/wiki/Perceptrons_(book)",
  },
  {
    year: 1973,
    date: "1973",
    title: "The Lighthill Report",
    category: "Industry News",
    blurb:
      "A critical UK government report on the state of AI research led to the dismantling of most British AI programs, part of what's remembered as the first AI winter.",
    sourceUrl: "https://en.wikipedia.org/wiki/Lighthill_report",
  },
  {
    year: 1986,
    date: "1986",
    title: "Backpropagation popularized for neural networks",
    category: "Research",
    blurb:
      "David Rumelhart, Geoffrey Hinton, and Ronald Williams showed how backpropagation could effectively train multi-layer neural networks, reviving interest in connectionist approaches after the first AI winter.",
    sourceUrl: "https://en.wikipedia.org/wiki/Backpropagation",
    landmark: true,
    keywords: "backpropagation neural network",
  },
  {
    year: 1995,
    date: "1995",
    title: "Support-vector machines",
    category: "Research",
    blurb:
      "Corinna Cortes and Vladimir Vapnik published their work on support-vector machines, which became one of the most widely used classification algorithms in the years before deep learning's resurgence.",
    sourceUrl: "https://en.wikipedia.org/wiki/Support_vector_machine",
  },
  {
    year: 1997,
    date: "May 1997",
    title: "Deep Blue defeats Garry Kasparov",
    category: "Models",
    blurb:
      "IBM's Deep Blue became the first computer system to defeat a reigning world chess champion in a full match under standard tournament conditions.",
    sourceUrl: "https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer)",
  },
  {
    year: 1997,
    date: "1997",
    title: "Long short-term memory (LSTM)",
    category: "Research",
    blurb:
      "Sepp Hochreiter and Jürgen Schmidhuber introduced LSTM, a recurrent neural network design that could learn long-range dependencies far better than earlier recurrent architectures — it became the standard for sequence modeling for the next two decades.",
    sourceUrl: "https://en.wikipedia.org/wiki/Long_short-term_memory",
  },
  {
    year: 1998,
    date: "1998",
    title: "The MNIST database",
    category: "Research",
    blurb:
      "Yann LeCun and collaborators released the MNIST handwritten-digit dataset, which became one of the most widely used benchmarks for testing new machine learning and neural network techniques.",
    sourceUrl: "https://en.wikipedia.org/wiki/MNIST_database",
  },
  {
    year: 2007,
    date: "Feb 2007",
    title: "CUDA is released",
    category: "Developer Tools",
    blurb:
      "NVIDIA released CUDA, letting developers run general-purpose computation on GPUs rather than just graphics rendering — the hardware/software foundation that later made large-scale neural network training practical.",
    sourceUrl: "https://en.wikipedia.org/wiki/CUDA",
  },
  {
    year: 2009,
    date: "2009",
    title: "ImageNet",
    category: "Research",
    blurb:
      "Fei-Fei Li and collaborators at Stanford built ImageNet, a large labeled image dataset, and launched an annual competition on it — the benchmark that AlexNet would later break open in 2012.",
    sourceUrl: "https://en.wikipedia.org/wiki/ImageNet",
    landmark: true,
    keywords: "ImageNet dataset",
  },
  {
    year: 2010,
    date: "Sep 2010",
    title: "DeepMind is founded",
    category: "Industry News",
    blurb:
      "DeepMind was founded in London as an AI research company, later becoming known for AlphaGo and AlphaFold after being acquired by Google.",
    sourceUrl: "https://en.wikipedia.org/wiki/Google_DeepMind",
  },
  {
    year: 2011,
    date: "2011",
    title: "IBM Watson wins Jeopardy!",
    category: "Models",
    blurb:
      "IBM's Watson system defeated the show's two most successful human champions, demonstrating strong performance on open-domain natural-language question answering in front of a mass television audience.",
    sourceUrl: "https://en.wikipedia.org/wiki/Watson_(computer)",
  },
  {
    year: 2012,
    date: "2012",
    title: "AlexNet wins ImageNet",
    category: "Models",
    blurb:
      "A deep convolutional neural network built by Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton dramatically outperformed prior methods on the ImageNet competition, a result widely credited with triggering the modern deep learning boom.",
    sourceUrl: "https://en.wikipedia.org/wiki/AlexNet",
    landmark: true,
    keywords: "convolutional neural network image classification",
  },
  {
    year: 2013,
    date: "2013",
    title: "Word2Vec",
    category: "Research",
    blurb:
      "Tomas Mikolov and colleagues at Google published Word2Vec, showing that word meanings could be captured as vectors learned from raw text — a technique that became foundational to modern NLP's use of embeddings.",
    sourceUrl: "https://arxiv.org/abs/1310.4546",
  },
  {
    year: 2014,
    date: "Jan 2014",
    title: "Google acquires DeepMind",
    category: "Industry News",
    blurb:
      "Google acquired DeepMind, giving the London AI lab access to Google-scale computing resources ahead of projects like AlphaGo and AlphaFold.",
    sourceUrl: "https://en.wikipedia.org/wiki/Google_DeepMind",
  },
  {
    year: 2014,
    date: "Jun 2014",
    title: "Generative Adversarial Networks",
    category: "Research",
    blurb:
      "Ian Goodfellow and coauthors introduced GANs, a framework where two neural networks are trained against each other — one generating fake data, one detecting it — that became a dominant approach to image generation for years.",
    sourceUrl: "https://arxiv.org/abs/1406.2661",
  },
  {
    year: 2014,
    date: "Sep 2014",
    title: "Sequence to Sequence Learning",
    category: "Research",
    blurb:
      "Ilya Sutskever, Oriol Vinyals, and Quoc Le showed that an encoder-decoder neural network could map an input sequence directly to an output sequence, a design that became central to machine translation and later text generation.",
    sourceUrl: "https://arxiv.org/abs/1409.3215",
  },
  {
    year: 2015,
    date: "Nov 2015",
    title: "TensorFlow is released",
    category: "Developer Tools",
    blurb:
      "Google open-sourced TensorFlow, its internal machine learning framework, making it one of the first widely adopted tools for building and training neural networks outside a research lab.",
    sourceUrl: "https://en.wikipedia.org/wiki/TensorFlow",
  },
  {
    year: 2015,
    date: "Dec 2015",
    title: "OpenAI is founded",
    category: "Industry News",
    blurb:
      "OpenAI was founded as a research lab, with a stated mission of ensuring artificial general intelligence benefits humanity — it would later release GPT-2, GPT-3, DALL-E, and ChatGPT.",
    sourceUrl: "https://en.wikipedia.org/wiki/OpenAI",
  },
  {
    year: 2015,
    date: "Dec 2015",
    title: "Deep residual learning (ResNet)",
    category: "Research",
    blurb:
      "Kaiming He and coauthors introduced residual connections, letting neural networks be trained with far more layers than before without degrading — ResNet went on to win that year's ImageNet competition.",
    sourceUrl: "https://arxiv.org/abs/1512.03385",
  },
  {
    year: 2016,
    date: "Mar 2016",
    title: "AlphaGo defeats Lee Sedol",
    category: "Models",
    blurb:
      "DeepMind's AlphaGo defeated Lee Sedol, one of the world's top Go players, in a five-game match — a result many researchers had expected to still be years away given Go's enormous search space.",
    sourceUrl: "https://en.wikipedia.org/wiki/AlphaGo",
    landmark: true,
    keywords: "reinforcement learning AlphaGo",
  },
  {
    year: 2017,
    date: "Jan 2017",
    title: "PyTorch is released",
    category: "Developer Tools",
    blurb:
      "Facebook's AI Research lab released PyTorch, a machine learning framework that emphasized a more flexible, Python-native way of building models — it went on to become the dominant framework in AI research.",
    sourceUrl: "https://en.wikipedia.org/wiki/PyTorch",
  },
  {
    year: 2017,
    date: "Jun 2017",
    title: "\"Attention Is All You Need\" — the Transformer",
    category: "Research",
    blurb:
      "A Google Brain team introduced the Transformer architecture, built entirely around attention mechanisms rather than recurrence — it became the architecture behind essentially every major language model that followed, including GPT and BERT.",
    sourceUrl: "https://arxiv.org/abs/1706.03762",
    landmark: true,
    keywords: "transformer attention",
  },
  {
    year: 2018,
    date: "Jun 2018",
    title: "GPT-1",
    category: "Models",
    blurb:
      "OpenAI released GPT (later called GPT-1), showing that a Transformer-based language model pretrained on unlabeled text, then fine-tuned, could perform well across a range of language tasks.",
    sourceUrl: "https://en.wikipedia.org/wiki/GPT-1",
  },
  {
    year: 2018,
    date: "Oct 2018",
    title: "BERT",
    category: "Models",
    blurb:
      "Google introduced BERT, a Transformer-based model trained to read text bidirectionally rather than left-to-right, which set new results across a wide range of NLP benchmarks and was soon adopted widely in industry.",
    sourceUrl: "https://arxiv.org/abs/1810.04805",
  },
  {
    year: 2018,
    date: "Dec 2018",
    title: "AlphaFold places first at CASP13",
    category: "Models",
    blurb:
      "DeepMind's AlphaFold placed first in the CASP13 protein structure prediction competition, an early sign of deep learning's potential on the long-standing protein folding problem.",
    sourceUrl: "https://en.wikipedia.org/wiki/AlphaFold",
  },
  {
    year: 2019,
    date: "2019",
    title: "Hugging Face Transformers library",
    category: "Developer Tools",
    blurb:
      "Hugging Face open-sourced its Transformers library, giving developers a shared, easy-to-use interface to pretrained Transformer models like BERT and GPT-2 — it became a central piece of infrastructure for the NLP community.",
    sourceUrl: "https://arxiv.org/abs/1910.03771",
  },
  {
    year: 2019,
    date: "Feb 2019",
    title: "GPT-2",
    category: "Models",
    blurb:
      "OpenAI announced GPT-2, a larger language model whose text generation was fluent enough that OpenAI initially withheld the full model, citing misuse concerns — an unusual move that drew wide attention to the pace of progress in language models.",
    sourceUrl: "https://en.wikipedia.org/wiki/GPT-2",
  },
  {
    year: 2019,
    date: "Jul 2019",
    title: "Microsoft invests $1 billion in OpenAI",
    category: "Industry News",
    blurb:
      "Microsoft and OpenAI announced a multiyear partnership including a $1 billion investment, with Microsoft becoming OpenAI's exclusive cloud provider — the start of the relationship that later brought GPT models into Microsoft's own products.",
    sourceUrl:
      "https://news.microsoft.com/source/2019/07/22/openai-forms-exclusive-computing-partnership-with-microsoft-to-build-new-azure-ai-supercomputing-technologies/",
  },
  {
    year: 2020,
    date: "Jun 2020",
    title: "GPT-3",
    category: "Models",
    blurb:
      "OpenAI released GPT-3, a 175-billion-parameter language model whose scale enabled strong few-shot performance across many tasks without task-specific fine-tuning, and which powered the first wave of GPT-based products.",
    sourceUrl: "https://en.wikipedia.org/wiki/GPT-3",
    landmark: true,
    keywords: "GPT-3 language model",
  },
  {
    year: 2021,
    date: "Jul 2021",
    title: "AlphaFold 2",
    category: "Models",
    blurb:
      "DeepMind published AlphaFold 2 in Nature and open-sourced its code, after the system's markedly improved accuracy at CASP14 was described by the competition's organizers as effectively solving the decades-old protein structure prediction problem.",
    sourceUrl: "https://en.wikipedia.org/wiki/AlphaFold",
    landmark: true,
    keywords: "AlphaFold protein",
  },
  {
    year: 2022,
    date: "Apr 2022",
    title: "DALL-E 2",
    category: "Models",
    blurb:
      "OpenAI announced DALL-E 2, a successor to its original text-to-image model capable of generating more realistic and higher-resolution images from text prompts, and combining unrelated concepts in a single image.",
    sourceUrl: "https://en.wikipedia.org/wiki/DALL-E",
  },
  {
    year: 2022,
    date: "Aug 2022",
    title: "Stable Diffusion",
    category: "Models",
    blurb:
      "Stability AI, in collaboration with researchers from LMU Munich and Runway, released Stable Diffusion, a text-to-image model whose weights were made publicly available — putting high-quality image generation within reach of anyone with consumer hardware.",
    sourceUrl: "https://en.wikipedia.org/wiki/Stable_Diffusion",
  },
  {
    year: 2022,
    date: "Nov 2022",
    title: "ChatGPT",
    category: "Models",
    blurb:
      "OpenAI released ChatGPT, a conversational interface built on GPT-3.5, which reached an unprecedented pace of mainstream adoption and brought large language models into daily use for a broad public audience for the first time.",
    sourceUrl: "https://en.wikipedia.org/wiki/ChatGPT",
    landmark: true,
    keywords: "ChatGPT",
  },
  {
    year: 2023,
    date: "Feb 2023",
    title: "LLaMA",
    category: "Models",
    blurb:
      "Meta released LLaMA, a family of openly available language models ranging from 7 to 65 billion parameters, which became a foundation for a wide wave of open-weight model research and fine-tunes.",
    sourceUrl: "https://en.wikipedia.org/wiki/Llama_(language_model)",
  },
  {
    year: 2023,
    date: "Mar 2023",
    title: "GPT-4",
    category: "Models",
    blurb:
      "OpenAI released GPT-4, its first multimodal flagship model, able to accept both text and images as input — and the model that powered a new wave of AI products built on top of the GPT API.",
    sourceUrl: "https://en.wikipedia.org/wiki/GPT-4",
    landmark: true,
    keywords: "GPT-4",
  },
];
