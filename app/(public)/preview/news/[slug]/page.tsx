import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ArticleImage = {
  id: number;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

type RelatedMovie = {
  id: number;
  title: string;
  original_title: string | null;
  release_year: number | null;
  poster_url: string | null;
  slug: string | null;
};

type NewsArticle = {
  id: number;
  slug: string;
  article_type: string;
  title: string;
  excerpt: string | null;
  article_content: string;
  thumbnail_url: string | null;
  movie_id: number | null;
  published_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function renderArticleContent(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function JmiExclusiveArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ============================================================
  // ARTICLE
  // ============================================================

  const { data: article, error: articleError } = await supabase
    .from("jmi_news_articles")
    .select(`
      id,
      slug,
      article_type,
      title,
      excerpt,
      article_content,
      thumbnail_url,
      movie_id,
      published_at
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .not("published_at", "is", null)
    .single();

  if (articleError || !article) {
    notFound();
  }

  const newsArticle = article as NewsArticle;

  // ============================================================
  // ARTICLE IMAGES
  // ============================================================

  const { data: articleImages, error: imageError } = await supabase
    .from("jmi_news_article_images")
    .select(`
      id,
      image_url,
      caption,
      sort_order
    `)
    .eq("article_id", newsArticle.id)
    .order("sort_order", {
      ascending: true,
    });

  if (imageError) {
    console.error(
      "JMI Exclusive article images error:",
      imageError
    );
  }

  const images = (articleImages ?? []) as ArticleImage[];

  // ============================================================
  // RELATED MOVIE
  // ============================================================

  let relatedMovie: RelatedMovie | null = null;

  if (newsArticle.movie_id) {
    const { data: movie, error: movieError } = await supabase
      .from("movies")
      .select(`
        id,
        title,
        original_title,
        release_year,
        poster_url,
        slug
      `)
      .eq("id", newsArticle.movie_id)
      .eq("is_active", true)
      .maybeSingle();

    if (movieError) {
      console.error(
        "JMI Exclusive related movie error:",
        movieError
      );
    }

    if (movie) {
      relatedMovie = movie as RelatedMovie;
    }
  }

  // ============================================================
  // MORE NEWS
  // ============================================================

  const { data: moreNews, error: moreNewsError } = await supabase
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
    .neq("id", newsArticle.id)
    .order("published_at", {
      ascending: false,
    })
    .limit(4);

  if (moreNewsError) {
    console.error(
      "JMI Exclusive more news error:",
      moreNewsError
    );
  }

  const paragraphs = renderArticleContent(
    newsArticle.article_content
  );

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <PublicHeader />

      {/* =====================================================
          BACK / BREADCRUMB
      ===================================================== */}

      <div className="border-b border-zinc-900">
        <div className="mx-auto max-w-4xl px-5 py-4 sm:px-6 lg:px-8">
          <Link
            href="/preview/news"
            className="text-[8px] font-medium uppercase tracking-[0.16em] text-violet-400 transition hover:text-violet-300"
          >
            ← Back to JMI Exclusive News
          </Link>
        </div>
      </div>

      {/* =====================================================
          ARTICLE HEADER
      ===================================================== */}

      <article>
        <section>
          <div className="mx-auto max-w-4xl px-5 pt-8 sm:px-6 sm:pt-12 lg:px-8">

            {/* TYPE */}

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-pink-400/30 bg-pink-500/[0.08] px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-pink-300">
                JMI Exclusive
              </span>

              <span className="rounded-md border border-violet-400/30 bg-violet-500/[0.08] px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                {newsArticle.article_type}
              </span>

              <span className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                {formatDate(newsArticle.published_at)}
              </span>
            </div>

            {/* TITLE */}

            <h1 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.035em] text-zinc-100 sm:text-3xl sm:leading-10 lg:text-4xl lg:leading-[1.15]">
              {newsArticle.title}
            </h1>

            {/* EXCERPT */}

            {newsArticle.excerpt && (
              <p className="mt-4 max-w-3xl text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                {newsArticle.excerpt}
              </p>
            )}

            {/* META */}

            <div className="mt-5 flex items-center gap-3">
              <span className="text-[7px] uppercase tracking-[0.16em] text-zinc-600">
                Published by JMI
              </span>

              <span className="h-1 w-1 rounded-full bg-zinc-700" />

              <span className="text-[7px] uppercase tracking-[0.16em] text-zinc-600">
                Jeruto Movie Intelligence
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            HERO IMAGE
        ===================================================== */}

        {newsArticle.thumbnail_url && (
          <section className="mt-7 sm:mt-9">
            <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                <img
                  src={newsArticle.thumbnail_url}
                  alt={newsArticle.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            ARTICLE BODY
        ===================================================== */}

        <section className="mt-8 sm:mt-10">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">

            <div className="border-l border-violet-500/30 pl-4 sm:pl-5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                JMI Exclusive Report
              </p>
            </div>

            <div className="mt-7">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-6 text-[12px] leading-7 text-zinc-300 sm:text-[13px] sm:leading-7"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            ARTICLE IMAGES
        ===================================================== */}

        {images.length > 0 && (
          <section className="mt-4">
            <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">

              {images.map((image) => (
                <figure
                  key={image.id}
                  className="mb-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                >
                  <img
                    src={image.image_url}
                    alt={image.caption || newsArticle.title}
                    className="h-auto w-full object-cover"
                  />

                  {image.caption && (
                    <figcaption className="border-t border-zinc-800 px-4 py-3 text-[8px] leading-4 text-zinc-500">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}

            </div>
          </section>
        )}

        {/* =====================================================
            RELATED MOVIE
        ===================================================== */}

        {relatedMovie && (
          <section className="mt-4 border-y border-zinc-900">
            <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 lg:px-8">

              <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-yellow-400">
                Related JMI Intelligence
              </p>

              <Link
                href={`/preview/movies/${relatedMovie.id}`}
                className="group mt-4 flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 transition hover:border-violet-400/40"
              >
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                  {relatedMovie.poster_url ? (
                    <img
                      src={relatedMovie.poster_url}
                      alt={relatedMovie.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[6px] uppercase text-zinc-700">
                      JMI
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[7px] uppercase tracking-[0.16em] text-zinc-600">
                    Related Movie
                  </p>

                  <h3 className="mt-1 truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-yellow-400">
                    {relatedMovie.title}
                  </h3>

                  {relatedMovie.release_year && (
                    <p className="mt-1 text-[8px] text-zinc-600">
                      {relatedMovie.release_year}
                    </p>
                  )}
                </div>

                <span className="ml-auto shrink-0 text-[10px] text-violet-400">
                  →
                </span>
              </Link>

            </div>
          </section>
        )}
      </article>

      {/* =====================================================
          MORE JMI NEWS
      ===================================================== */}

      {moreNews && moreNews.length > 0 && (
        <section className="border-t border-zinc-900">
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-6">
              <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-pink-400">
                Keep Reading
              </p>

              <h2 className="mt-1 text-lg font-semibold text-zinc-100">
                More JMI Exclusive
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {moreNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/preview/news/${item.slug}`}
                  className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition hover:-translate-y-0.5 hover:border-violet-400/40"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">

                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[7px] uppercase tracking-[0.18em] text-zinc-700">
                        JMI Exclusive
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute left-2.5 top-2.5">
                      <span className="rounded-md border border-violet-400/30 bg-violet-500/15 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-violet-300">
                        {item.article_type}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5">
                    <p className="text-[7px] uppercase tracking-[0.15em] text-pink-400">
                      JMI Exclusive
                    </p>

                    <h3 className="mt-1.5 line-clamp-2 text-[10px] font-semibold leading-5 text-zinc-100 transition-colors group-hover:text-yellow-400">
                      {item.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[7px] uppercase tracking-[0.12em] text-zinc-700">
                        {formatDate(item.published_at)}
                      </span>

                      <span className="text-[9px] text-violet-400">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>
      )}

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