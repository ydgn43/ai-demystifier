// Vercel's serverless network can't route the IPv6 addresses that the
// Tailscale Funnel hostname (ts.net) resolves to alongside its IPv4 ones.
// Node 18+ defaults to resolving in DNS-returned ("verbatim") order, so
// every backend fetch tried IPv6 first, hung until that timed out, then
// fell back to IPv4 — see BACKEND_API_URL fetches in src/lib/api.ts.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
