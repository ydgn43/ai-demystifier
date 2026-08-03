export type Category = "Models" | "Research" | "Developer Tools" | "Industry News";
export type Level = "casual" | "developer";

export type FeedItem = {
  id: number;
  source: string;
  url: string;
  title: string;
  headline: string;
  level1: string;
  level2: string;
  category: Category;
  tags: string[];
  jargon_terms: string[];
  published_at: string | null;
  score: number;
};

export type FeedResponse = {
  today: FeedItem[];
  this_week: FeedItem[];
};

export type TimelineResponse = {
  items: FeedItem[];
  next_cursor: string | null;
};

export type ItemDetail = {
  id: number;
  source: string;
  url: string;
  title: string;
  headline: string;
  category: Category;
  tags: string[];
  jargon_terms: string[];
  published_at: string | null;
  level1: string;
  level2: string;
  article1: string;
  article2: string;
  why_it_matters_casual: string;
  why_it_matters_developer: string;
};
