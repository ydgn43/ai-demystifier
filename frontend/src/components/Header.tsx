import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          AI News Digest
        </Link>

        <div className="flex items-center gap-4">
          <form action="/search" method="get" className="flex items-center gap-1">
            <input
              type="search"
              name="q"
              placeholder="Search past articles..."
              className="w-40 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:w-56"
            />
            <button
              type="submit"
              className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
            >
              Search
            </button>
          </form>

          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            News
          </Link>

          <Link
            href="/timeline"
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Timeline
          </Link>

          <Link
            href="/learn"
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Learn
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            About
          </Link>
        </div>
      </div>
    </header>
  );
}
