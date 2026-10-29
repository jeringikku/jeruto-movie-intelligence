"use client";

import Link from "next/link";
import Image from "next/image";

type ExclusiveNewsArticle = {
  id: number | string;
  slug: string;
  article_type: string | null;
  title: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
};

type Props = {
  articles: ExclusiveNewsArticle[];
};

export default function ExclusiveNewsCarousel({
  articles,
}: Props) {
  if (!articles?.length) return null;

  // Duplicate the list to create a seamless scrolling loop.
  const scrollingArticles = [...articles, ...articles];

  return (
    <section className="w-full overflow-hidden py-6">
      <div className="mx-auto mb-4 flex items-center justify-between px-4">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          JMI Exclusive News
        </h2>

        <Link
          href="/news"
          className="text-sm font-semibold text-primary hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="exclusive-news-viewport">
        <div className="exclusive-news-track">
          {scrollingArticles.map((article, index) => (
            <Link
              key={`${article.id}-${index}`}
              href={`/news/${article.slug}`}
              className="exclusive-news-card group"
              aria-label={article.title}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
                {article.thumbnail_url ? (
                  <Image
                    src={article.thumbnail_url}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 75vw, (max-width: 1024px) 40vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    JMI Exclusive
                  </div>
                )}

                <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
                  {article.article_type || "Exclusive"}
                </span>
              </div>

              <div className="pt-3">
                <h3 className="line-clamp-2 text-base font-semibold leading-snug">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-500">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .exclusive-news-viewport {
          overflow: hidden;
          width: 100%;
        }

        .exclusive-news-track {
          display: flex;
          width: max-content;
          gap: 20px;
          padding: 4px 16px 12px;
          animation: exclusive-news-scroll 45s linear infinite;
          will-change: transform;
        }

        .exclusive-news-card {
          display: block;
          flex: 0 0 280px;
          width: 280px;
          color: inherit;
          text-decoration: none;
        }

        .exclusive-news-viewport:hover
          .exclusive-news-track,
        .exclusive-news-viewport:focus-within
          .exclusive-news-track {
          animation-play-state: paused;
        }

        @keyframes exclusive-news-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .exclusive-news-track {
            gap: 14px;
            animation-duration: 35s;
          }

          .exclusive-news-card {
            flex-basis: 250px;
            width: 250px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .exclusive-news-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}