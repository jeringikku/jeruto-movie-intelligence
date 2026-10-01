import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type NewsArticle = {
  id: number;
  slug: string;
  article_type: string;
  title: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
};

const ARTICLE_TYPES = [
  "All",
  "Review",
  "Box Office",
  "Advance Booking",
  "Movie Update",
  "Gossips",
  "Exclusive Updates",
  "Film Discussions",
];

function formatDate(value: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function NewsTag({
  type,
  hot = false,
}: {
  type: string;
  hot?: boolean;
}) {
  if (hot) {
    return (
      <span className="rounded-md border border-red-400/40 bg-red-500/20 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-red-300 backdrop-blur-sm">
        HOT
      </span>
    );
  }

  return (
    <span className="rounded-md border border-violet-400/30 bg-violet-500/15 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-violet-300 backdrop-blur-sm">
      {type}
    </span>
  );
}

export default async function JmiExclusiveNewsPage() {
  const { data: articles, error } = await supabase
    .from("jmi_news_articles")
    .select(`
      id,
      slug,
      article_type,
      title,
      excerpt,
      thumbnail_url,
      published_at
    `)
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error("JMI Exclusive News error:", error);
  }

  const news = (articles ?? []) as NewsArticle[];

  const leadArticle = news[0] ?? null;
  const remainingArticles = news.slice(1);

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <PublicHeader />

{/* =====================================================
    BACK TO JMI HOMEPAGE
===================================================== */}

<div className="border-b border-zinc-900">
  <div className="mx-auto max-w-6xl px-5 py-4 sm:px-6 lg:px-8">
    <Link
      href="/preview"
      className="inline-flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.16em] text-violet-400 transition hover:text-violet-300"
    >
      <span className="text-[10px]">←</span>
      Back to JMI Homepage
    </Link>
  </div>
</div>

{/* =====================================================
    HEADER
===================================================== */}

      <section className="border-b border-zinc-900">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

          <div className="max-w-3xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-pink-400">
              JMI Exclusive
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-yellow-400 sm:text-3xl">
              News & Updates
            </h1>

            <p className="mt-3 max-w-2xl text-[10px] leading-5 text-zinc-400 sm:text-[11px]">
              Exclusive movie updates, box-office developments, reviews,
              advance-booking insights and conversations from the world
              of Indian cinema.
            </p>
          </div>

          {/* CATEGORY STRIP */}

          <div className="mt-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-2">
              {ARTICLE_TYPES.map((type, index) => (
                <div
                  key={type}
                  className={`whitespace-nowrap rounded-md border px-3 py-2 text-[8px] font-medium uppercase tracking-[0.12em] ${
                    index === 0
                      ? "border-yellow-400/30 bg-yellow-400/[0.06] text-yellow-300"
                      : "border-zinc-800 bg-zinc-950 text-zinc-500"
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      

      {/* =====================================================
          LEAD STORY
      ===================================================== */}

      {leadArticle && (
        <section className="border-b border-zinc-900">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-red-400">
                  Latest Exclusive
                </p>

                <h2 className="mt-1 text-sm font-semibold text-zinc-200">
                  JMI Flash News
                </h2>
              </div>

              <span className="text-[8px] uppercase tracking-[0.15em] text-zinc-600">
                {formatDate(leadArticle.published_at)}
              </span>
            </div>

            <Link
              href={`/preview/news/${leadArticle.slug}`}
              className="group block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition hover:border-violet-400/40"
            >
              <div className="grid md:grid-cols-[1.35fr_1fr]">

                {/* IMAGE */}

                <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900 md:aspect-auto md:min-h-[330px]">

                  {leadArticle.thumbnail_url ? (
                    <img
                      src={leadArticle.thumbnail_url}
                      alt={leadArticle.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full min-h-[230px] items-center justify-center text-[9px] uppercase tracking-[0.2em] text-zinc-700">
                      JMI Exclusive
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute left-3 top-3">
                    <NewsTag type={leadArticle.article_type} hot />
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <NewsTag type={leadArticle.article_type} />
                  </div>

                </div>

                {/* STORY CONTENT */}

                <div className="flex flex-col justify-center p-5 sm:p-7">

                  <p className="text-[8px] font-medium uppercase tracking-[0.16em] text-pink-400">
                    JMI Exclusive
                  </p>

                  <h2 className="mt-2 text-xl font-semibold leading-7 tracking-[-0.025em] text-zinc-100 transition-colors group-hover:text-yellow-400 sm:text-2xl">
                    {leadArticle.title}
                  </h2>

                  {leadArticle.excerpt && (
                    <p className="mt-3 text-[10px] leading-5 text-zinc-400 sm:text-[11px]">
                      {leadArticle.excerpt}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-[0.15em] text-zinc-600">
                      {formatDate(leadArticle.published_at)}
                    </span>

                    <span className="text-[10px] font-medium text-violet-400 transition-transform group-hover:translate-x-1">
                      Read Story →
                    </span>
                  </div>

                </div>
              </div>
            </Link>

          </div>
        </section>
      )}

      {/* =====================================================
          ALL NEWS
      ===================================================== */}

      <section>
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

          <div className="mb-6">
            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
              Latest Stories
            </p>

            <h2 className="mt-1 text-lg font-semibold text-zinc-100">
              More from JMI Exclusive
            </h2>
          </div>

          {remainingArticles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {remainingArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/preview/news/${article.slug}`}
                  className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition hover:-translate-y-0.5 hover:border-violet-400/40"
                >

                  {/* IMAGE */}

                  <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">

                    {article.thumbnail_url ? (
                      <img
                        src={article.thumbnail_url}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                        JMI Exclusive
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute left-2.5 top-2.5">
                      <NewsTag type={article.article_type} />
                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="p-4">

                    <p className="text-[7px] uppercase tracking-[0.15em] text-pink-400">
                      JMI Exclusive
                    </p>

                    <h3 className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-5 text-zinc-100 transition-colors group-hover:text-yellow-400">
                      {article.title}
                    </h3>

                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 text-[9px] leading-4 text-zinc-500">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[7px] uppercase tracking-[0.15em] text-zinc-700">
                        {formatDate(article.published_at)}
                      </span>

                      <span className="text-[9px] text-violet-400 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                  </div>

                </Link>
              ))}

            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-12 text-center">
              <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                More JMI Exclusive stories coming soon
              </p>
            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-zinc-900">
        <div className="mx-auto max-w-6xl px-5 py-8 text-center sm:px-6 lg:px-8">
          <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
            JMI · Exclusive News & Updates
          </p>
        </div>
      </footer>

    </main>
  );
}