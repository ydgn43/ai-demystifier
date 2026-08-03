import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEARN_ARTICLES, LEVEL_BADGE_CLASS, getLearnArticle } from "@/lib/learn-content";
import { renderWithGlossary } from "@/lib/glossary";
import { readingTimeMinutes } from "@/lib/reading-time";
import { searchItems } from "@/lib/api";
import { FeedCard } from "@/components/FeedCard";
import { MarkReadButton } from "@/components/learn/MarkReadButton";
import { ACCENT_CASUAL } from "@/lib/theme";

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
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-20 sm:px-6">
      <Link
        href="/learn"
        className="mt-8 mb-6 font-mono text-[11px] font-medium tracking-[0.06em] text-muted uppercase hover:text-ink"
      >
        &larr; Back to Learn
      </Link>

      <div className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-wide text-muted">
        <span className={LEVEL_BADGE_CLASS}>{article.level}</span>
        <span>{readingTimeMinutes(article.body)} min read</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-3xl">{article.icon}</span>
        <h1 className="font-sans text-2xl font-semibold text-ink">{article.title}</h1>
      </div>

      <div className="mt-4">
        <MarkReadButton slug={article.slug} />
      </div>

      <div className="mt-6 space-y-4 font-sans leading-relaxed text-ink">
        {article.body.map((paragraph, i) => (
          <p key={i}>{renderWithGlossary(paragraph, ACCENT_CASUAL)}</p>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-10 border-t border-hairline pt-6">
          <h2 className="font-mono text-[11px] font-semibold tracking-[0.05em] text-muted uppercase">
            Related right now
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {related.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                level="casual"
                accentColor={ACCENT_CASUAL}
                animKey={0}
              />
            ))}
          </ul>
        </div>
      )}

      {(prev || next) && (
        <div className="mt-10 grid grid-cols-2 gap-3 border-t border-hairline pt-6">
          {prev ? (
            <Link
              href={`/learn/${prev.slug}`}
              className="border border-hairline p-4 transition-colors hover:border-ink"
            >
              <span className="font-mono text-[10px] tracking-wide text-muted uppercase">
                &larr; Previous
              </span>
              <p className="mt-1 font-sans font-semibold text-ink">{prev.title}</p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/learn/${next.slug}`}
              className="border border-hairline p-4 text-right transition-colors hover:border-ink"
            >
              <span className="font-mono text-[10px] tracking-wide text-muted uppercase">
                Next &rarr;
              </span>
              <p className="mt-1 font-sans font-semibold text-ink">{next.title}</p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
