import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "News" },
  { href: "/timeline", label: "Timeline" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-bg">
      <div className="mx-auto flex w-full max-w-[700px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" className="font-mono text-[13px] font-semibold tracking-[0.04em] text-ink">
          AI DIGEST
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <nav className="flex items-center gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-[11px] font-medium tracking-[0.05em] text-muted uppercase hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form action="/search" method="get" className="flex items-center">
            <input
              type="search"
              name="q"
              placeholder="Search…"
              className="w-28 border border-hairline bg-card px-2.5 py-1.5 font-mono text-[11px] text-ink placeholder:text-muted focus:outline-none sm:w-40"
            />
          </form>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
