import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEARN_ARTICLES, getLearnArticle } from "@/lib/learn-content";
import { renderWithGlossary } from "@/lib/glossary";

export function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({ slug: article.slug }));
}

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <Link
        href="/learn"
        className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        &larr; Back to Learn
      </Link>

      <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {article.level}
      </span>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {article.title}
      </h1>

      <div className="mt-6 space-y-4 leading-relaxed text-slate-700 dark:text-slate-300">
        {article.body.map((paragraph, i) => (
          <p key={i}>{renderWithGlossary(paragraph)}</p>
        ))}
      </div>
    </div>
  );
}
