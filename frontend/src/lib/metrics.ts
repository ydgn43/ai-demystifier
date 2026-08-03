// Source-native popularity signal, same raw metrics_json ranking.py already
// scores on — {"stars": N} for github, {"upvotes": N} for huggingface,
// {} for arxiv (no such signal there, so nothing renders for it).
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function formatMetric(source: string, metrics: Record<string, unknown>): string | null {
  if (source === "github" && typeof metrics.stars === "number") {
    return `★ ${formatCount(metrics.stars)}`;
  }
  if (source === "huggingface" && typeof metrics.upvotes === "number") {
    return `▲ ${formatCount(metrics.upvotes)}`;
  }
  return null;
}
