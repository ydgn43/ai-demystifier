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
