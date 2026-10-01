import Link from "next/link";

type NewsArticle = {
  id: number;
  slug: string;
  article_type: string;
  title: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
};

export default function JmiExclusiveNewsBanner({
  articles,
}: {
  articles: NewsArticle[];
}) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-zinc-900">

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-5 flex items-end justify-between gap-4">

          <div>

            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-pink-400">
              JMI Exclusive
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-yellow-400 sm:text-2xl">
              News & Updates
            </h2>

            <p className="mt-1.5 max-w-xl text-[10px] leading-5 text-zinc-400 sm:text-[11px]">
              Hot news, exclusive updates, box-office developments
              and conversations from the world of Indian cinema.
            </p>

          </div>

          <Link
            href="/preview/news"
            className="hidden shrink-0 text-[9px] font-medium text-violet-400 transition hover:text-violet-300 sm:block"
          >
            Check Now →
          </Link>

        </div>


        {/* =====================================================
            HORIZONTAL NEWS SCROLLER
        ===================================================== */}

        <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          <div className="flex w-max gap-3">

            {articles.map((article, index) => (

              <Link
                key={article.id}
                href={`/preview/news/${article.slug}`}
                className="
                  group
                  relative
                  w-[230px]
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  border
                  border-zinc-800
                  bg-zinc-950

                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:border-violet-400/40
                  hover:bg-zinc-900

                  active:scale-[0.98]

                  sm:w-[270px]
                "
              >

                {/* =================================================
                    THUMBNAIL
                ================================================= */}

                <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">

                  {article.thumbnail_url ? (

                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-[1.04]
                      "
                    />

                  ) : (

                    <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                      JMI Exclusive
                    </div>

                  )}


                  {/* Dark gradient */}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />


                  {/* =================================================
                      NEWS TAG
                  ================================================= */}

                  <div className="absolute left-2.5 top-2.5">

                    <span
                      className={`
                        rounded-md
                        border
                        px-2
                        py-1
                        text-[7px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        backdrop-blur-sm

                        ${
                          index === 0
                            ? "border-red-400/40 bg-red-500/20 text-red-300"
                            : "border-violet-400/30 bg-violet-500/15 text-violet-300"
                        }
                      `}
                    >
                      {index === 0
                        ? "HOT"
                        : "EXCLUSIVE"}
                    </span>

                  </div>


                  {/* Article type */}

                  <div className="absolute bottom-2.5 left-2.5">

                    <span className="rounded-md border border-yellow-400/30 bg-black/60 px-2 py-1 text-[7px] font-medium uppercase tracking-[0.12em] text-yellow-300 backdrop-blur-sm">
                      {article.article_type}
                    </span>

                  </div>

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="p-3.5">

                  <h3 className="line-clamp-2 text-[11px] font-semibold leading-5 text-zinc-100 transition-colors group-hover:text-yellow-400 sm:text-xs">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-zinc-500">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">

                    <span className="text-[7px] uppercase tracking-[0.15em] text-zinc-600">
                      JMI Exclusive
                    </span>

                    <span className="text-[9px] text-violet-400 transition-transform group-hover:translate-x-1">
                      →
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        </div>


        {/* =====================================================
            MOBILE CHECK NOW
        ===================================================== */}

        <div className="mt-5 sm:hidden">

          <Link
            href="/preview/news"
            className="
              block
              rounded-lg
              border
              border-violet-400/30
              bg-violet-500/[0.04]
              px-4
              py-3
              text-center
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-violet-300

              transition

              hover:border-violet-400/50
              hover:bg-violet-500/[0.08]
            "
          >
            Check Now — View All JMI News →
          </Link>

        </div>

      </div>

    </section>
  );
}