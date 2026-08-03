import { NextRequest, NextResponse } from "next/server";
import { getItemsByIds } from "@/lib/api";

// Bookmark ids live in localStorage, so the /bookmarks page (a client
// component) needs a same-origin endpoint to resolve them into real items —
// it can't call the backend directly, since BACKEND_API_URL is server-only
// and the backend has no CORS setup for browser-origin requests.
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isInteger(n));

  const result = await getItemsByIds(ids);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json(result.items);
}
