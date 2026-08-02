export type Category = "Models" | "Research" | "Developer Tools" | "Industry News";

export type FeedItem = {
  id: number;
  source: string;
  url: string;
  title: string;
  level1: string;
  level2: string;
  category: Category;
  tags: string[];
  jargon_terms: string[];
  published_at: string | null;
  score: number;
};

export type ItemDetail = {
  id: number;
  source: string;
  url: string;
  title: string;
  category: Category;
  tags: string[];
  jargon_terms: string[];
  published_at: string | null;
  level1: string;
  level2: string;
  article1: string;
  article2: string;
};
