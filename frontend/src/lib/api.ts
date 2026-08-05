import type { FeedItem, FeedResponse, ItemDetail } from "./types";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";

// The backend runs on a home PC behind a Tailscale Funnel, not a cloud
// service — occasional ECONNRESET mid-TLS-handshake is expected on that
// path (cross-region routing between Vercel and the funnel relay), so one
// retry absorbs it instead of surfacing a false "backend unreachable".
async function fetchBackend(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    console.error("fetchBackend first attempt failed:", url, err);
    try {
      return await fetch(url, init);
    } catch (err2) {
      console.error("fetchBackend retry also failed:", url, err2);
      throw err2;
    }
  }
}

export type FeedResult = ({ ok: true } & FeedResponse) | { ok: false; error: string };

export async function getFeed(): Promise<FeedResult> {
  try {
    const res = await fetchBackend(`${BACKEND_API_URL}/feed`);
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
    const res = await fetchBackend(`${BACKEND_API_URL}/items/${id}`);
    if (!res.ok) {
      return { ok: false, status: res.status, error: `backend returned ${res.status}` };
    }
    const item = (await res.json()) as ItemDetail;
    return { ok: true, item };
  } catch {
    return { ok: false, status: null, error: "could not reach the backend" };
  }
}

export type ItemsByIdsResult = { ok: true; items: FeedItem[] } | { ok: false; error: string };

// Bookmarked ids live in localStorage (browser-only, no accounts) — this
// turns that id list back into real content. Called from the /api/items
// route handler, never directly from client components, so BACKEND_API_URL
// stays server-only.
export async function getItemsByIds(ids: number[]): Promise<ItemsByIdsResult> {
  if (ids.length === 0) return { ok: true, items: [] };
  try {
    const res = await fetchBackend(`${BACKEND_API_URL}/items?${new URLSearchParams({ ids: ids.join(",") })}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, error: `backend returned ${res.status}` };
    }
    const items = (await res.json()) as FeedItem[];
    return { ok: true, items };
  } catch {
    return { ok: false, error: "could not reach the backend" };
  }
}

export type SearchResult = { ok: true; items: FeedItem[] } | { ok: false; error: string };

export async function searchItems(q: string): Promise<SearchResult> {
  try {
    const res = await fetchBackend(`${BACKEND_API_URL}/search?${new URLSearchParams({ q })}`);
    if (!res.ok) {
      return { ok: false, error: `backend returned ${res.status}` };
    }
    const items = (await res.json()) as FeedItem[];
    return { ok: true, items };
  } catch {
    return { ok: false, error: "could not reach the backend" };
  }
}
