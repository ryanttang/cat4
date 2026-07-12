import { notFound } from "next/navigation";
import Link from "next/link";
import { getEducationArticleBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getEducationArticleBySlug(slug, false);
  return { title: article?.title ?? "Article" };
}

function renderMarkdownBody(body: string) {
  return body.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="mb-4 mt-8 text-2xl font-bold text-cat4-light">
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("- **")) {
      const match = line.match(/- \*\*(.+?)\*\* — (.+)/);
      if (match) {
        return (
          <li key={i} className="mb-2 text-cat4-light/80">
            <strong>{match[1]}</strong> — {match[2]}
          </li>
        );
      }
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="mb-2 text-cat4-light/80">
          {line.replace("- ", "")}
        </li>
      );
    }
    if (line.trim() === "") return null;
    return (
      <p key={i} className="mb-4 text-cat4-light/80">
        {line}
      </p>
    );
  });
}

export default async function EducationArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getEducationArticleBySlug(slug, true);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-6 -ml-2 text-cat4-light hover:bg-cat4-surface hover:text-cat4-light">
        <Link href="/education">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Education
        </Link>
      </Button>

      <header>
        <h1 className="text-4xl font-bold text-cat4-light">{article.title}</h1>
        <p className="mt-2 text-sm text-cat4-light/50">{formatDate(article.publishedAt)}</p>
        {article.excerpt && <p className="mt-4 text-lg text-cat4-light/70">{article.excerpt}</p>}
      </header>

      <div className="mt-10">{renderMarkdownBody(article.body)}</div>
    </article>
  );
}
