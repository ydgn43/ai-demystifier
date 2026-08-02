import type { FeedItem } from "./types";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";

export type FeedResult = { ok: true; items: FeedItem[] } | { ok: false; error: string };

export async function getFeed(): Promise<FeedResult> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/feed`);
    if (!res.ok) {
      return { ok: false, error: `backend returned ${res.status}` };
    }
    const items = (await res.json()) as FeedItem[];
    return { ok: true, items };
  } catch {
    return { ok: false, error: "could not reach the backend" };
  }
}
