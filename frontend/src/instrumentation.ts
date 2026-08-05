// Vercel's serverless network can't route the IPv6 addresses that backend
// tunnel hostnames sometimes resolve to alongside their IPv4 ones. Node 18+
// defaults to resolving in DNS-returned ("verbatim") order, so a backend
// fetch could try IPv6 first, hang until that timed out, then fall back to
// IPv4 — see BACKEND_API_URL fetches in src/lib/api.ts.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
