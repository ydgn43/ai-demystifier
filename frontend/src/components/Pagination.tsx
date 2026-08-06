import Link from "next/link";

// Windowed page list (first, last, current ± 1, ellipses for gaps) so this
// stays usable once the corpus grows into hundreds of pages, instead of
// rendering every page number.
function pageTokens(page: number, totalPages: number): (number | "ellipsis")[] {
  const tokens: (number | "ellipsis")[] = [];
  const add = (p: number) => tokens.push(p);

  add(1);
  if (page - 1 > 2) tokens.push("ellipsis");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    add(p);
  }
  if (page + 1 < totalPages - 1) tokens.push("ellipsis");
  if (totalPages > 1) add(totalPages);

  return tokens;
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  const href = (p: number) => (p === 1 ? "/" : `/?page=${p}`);

  return (
    <nav
      aria-label="Feed pages"
      className="mt-10 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] tracking-wide"
    >
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-[2px] border border-hairline px-2.5 py-1 uppercase ${
          page === 1 ? "pointer-events-none text-muted opacity-40" : "text-ink hover:border-ink"
        }`}
      >
        &larr; Prev
      </Link>

      {pageTokens(page, totalPages).map((token, i) =>
        token === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted">
            &hellip;
          </span>
        ) : (
          <Link
            key={token}
            href={href(token)}
            className={`rounded-[2px] border px-2.5 py-1 ${
              token === page
                ? "border-ink bg-ink text-bg"
                : "border-hairline text-ink hover:border-ink"
            }`}
          >
            {token}
          </Link>
        ),
      )}

      <Link
        href={href(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`rounded-[2px] border border-hairline px-2.5 py-1 uppercase ${
          page === totalPages ? "pointer-events-none text-muted opacity-40" : "text-ink hover:border-ink"
        }`}
      >
        Next &rarr;
      </Link>
    </nav>
  );
}
