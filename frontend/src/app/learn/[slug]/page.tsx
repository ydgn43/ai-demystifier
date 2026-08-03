import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEARN_ARTICLES, LEVEL_STYLES, getLearnArticle } from "@/lib/learn-content";
import { renderWithGlossary } from "@/lib/glossary";
import { readingTimeMinutes } from "@/lib/reading-time";
import { searchItems } from "@/lib/api";
import { FeedCard } from "@/components/FeedCard";
import { MarkReadButton } from "@/components/learn/MarkReadButton";

// The article text is static, but "Related right now" pulls live digest
// data — generateStaticParams would bake that in at build time and it
// would never update, so this route stays dynamic despite the content
// being fixed (same reasoning as the feed page and sitemap).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} — AI News Digest`,
    description: article.teaser,
  };
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) {
    notFound();
  }

  const index = LEARN_ARTICLES.findIndex((a) => a.slug === article.slug);
  const prev = index > 0 ? LEARN_ARTICLES[index - 1] : null;
  const next = index < LEARN_ARTICLES.length - 1 ? LEARN_ARTICLES[index + 1] : null;

  // Ties the static Learn content back into the live digest — reuses the
  // same search endpoint/function the search page uses, nothing new.
  const relatedResult = await searchItems(article.keywords);
  const related = relatedResult.ok ? relatedResult.items.slice(0, 3) : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <Link
        href="/learn"
        className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        &larr; Back to Learn
      </Link>

      <div className="flex items-center gap-2 text-xs">
        <span
          className={`rounded-full px-2 py-0.5 font-medium capitalize ${LEVEL_STYLES[article.level]}`}
        >
          {article.level}
        </span>
        <span className="text-slate-400 dark:text-slate-600">
          {readingTimeMinutes(article.body)} min read
        </span>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span className="text-3xl">{article.icon}</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {article.title}
        </h1>
      </div>

      <div className="mt-4">
        <MarkReadButton slug={article.slug} />
      </div>

      <div className="mt-6 space-y-4 leading-relaxed text-slate-700 dark:text-slate-300">
        {article.body.map((paragraph, i) => (
          <p key={i}>{renderWithGlossary(paragraph)}</p>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Related right now
          </h2>
          <ul className="mt-1 divide-y divide-slate-200 dark:divide-slate-800">
            {related.map((item) => (
              <FeedCard key={item.id} item={item} level="casual" />
            ))}
          </ul>
        </div>
      )}

      {(prev || next) && (
        <div className="mt-10 grid grid-cols-2 gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
          {prev ? (
            <Link
              href={`/learn/${prev.slug}`}
              className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600"
            >
              <span className="text-xs text-slate-400 dark:text-slate-500">&larr; Previous</span>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">{prev.title}</p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/learn/${next.slug}`}
              className="rounded-xl border border-slate-200 p-4 text-right transition-colors hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600"
            >
              <span className="text-xs text-slate-400 dark:text-slate-500">Next &rarr;</span>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">{next.title}</p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
