import type { FeedItem, FeedResponse, ItemDetail } from "./types";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";

export type FeedResult = ({ ok: true } & FeedResponse) | { ok: false; error: string };

export async function getFeed(): Promise<FeedResult> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/feed`);
    if (!res.ok) {
      return { ok: false, error: `backend returned ${res.status}` };
    }
    const feed = (await res.json()) as FeedResponse;
    return { ok: true, ...feed };
  } catch {
    return { ok: false, error: "could not reach the backend" };
  }
}

export type ItemResult =
  | { ok: true; item: ItemDetail }
  | { ok: false; status: number | null; error: string };

export async function getItem(id: number): Promise<ItemResult> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/items/${id}`);
    if (!res.ok) {
      return { ok: false, status: res.status, error: `backend returned ${res.status}` };
    }
    const item = (await res.json()) as ItemDetail;
    return { ok: true, item };
  } catch {
    return { ok: false, status: null, error: "could not reach the backend" };
  }
}

export type SearchResult = { ok: true; items: FeedItem[] } | { ok: false; error: string };

export async function searchItems(q: string): Promise<SearchResult> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/search?${new URLSearchParams({ q })}`);
    if (!res.ok) {
      return { ok: false, error: `backend returned ${res.status}` };
    }
    const items = (await res.json()) as FeedItem[];
    return { ok: true, items };
  } catch {
    return { ok: false, error: "could not reach the backend" };
  }
}
