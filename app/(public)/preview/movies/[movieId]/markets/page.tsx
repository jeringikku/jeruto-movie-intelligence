import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    movieId: string;
  }>;
};

type Movie = {
  id: number;
  title: string;
  release_date: string | null;
  release_year: number | null;
  poster_url: string | null;
};

export default async function MovieMarketsPage({
  params,
}: Props) {
  const { movieId } = await params;

  const numericMovieId = Number(movieId);

  if (!Number.isFinite(numericMovieId)) {
    notFound();
  }

  /* ---------------------------------------------------------
     MOVIE
  --------------------------------------------------------- */

  const {
    data: movie,
    error: movieError,
  } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      release_date,
      release_year,
      poster_url
    `)
    .eq("id", numericMovieId)
    .single();

  if (movieError || !movie) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* -------------------------------------------------
            BACK TO MOVIE
        ------------------------------------------------- */}

        <div className="mb-4">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Movie</span>
          </Link>

        </div>

        {/* -------------------------------------------------
            MOVIE HEADER
        ------------------------------------------------- */}

        <section className="border-b border-zinc-900 pb-6">

          <div className="flex items-start gap-4">

            {/* POSTER */}

            {movie.poster_url ? (

              <img
                src={movie.poster_url}
                alt={movie.title}
                className="h-[105px] w-[70px] shrink-0 rounded-lg border border-zinc-800 object-cover sm:h-[135px] sm:w-[90px]"
              />

            ) : (

              <div className="flex h-[105px] w-[70px] shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-[8px] text-zinc-700 sm:h-[135px] sm:w-[90px]">
                No Poster
              </div>

            )}

            <div className="min-w-0 pt-1">

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                Movie Markets
              </p>

              <h1 className="mt-1 text-base font-medium text-zinc-100 sm:text-lg">
                {movie.title}
              </h1>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-zinc-500">

                {movie.release_year && (
                  <span>{movie.release_year}</span>
                )}

                {movie.release_date && (
                  <span>
                    {new Date(
                      movie.release_date
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                )}

              </div>

              <p className="mt-3 max-w-xl text-[9px] leading-5 text-zinc-500">
                Explore the geographic distribution of
                this movie across Indian and overseas
                markets.
              </p>

            </div>

          </div>

        </section>

        {/* -------------------------------------------------
            MARKET PROFILE
        ------------------------------------------------- */}

        <section className="mt-5 rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3">

          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            Market Intelligence
          </p>

          <p className="mt-1 text-[9px] leading-5 text-zinc-500">
            JMI separates domestic and overseas markets
            to provide a clearer view of the movie's
            geographical performance and distribution.
          </p>

        </section>

        {/* -------------------------------------------------
            MARKET OPTIONS
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Market Breakdown
            </p>

            <h2 className="mt-1 text-sm font-medium text-yellow-500">
              Explore Movie Markets
            </h2>

            <p className="mt-1 text-[9px] text-zinc-500">
              Select a market to view its geographical
              performance.
            </p>

          </div>

          <div className="grid gap-3 sm:grid-cols-2">

            {/* -------------------------------------------------
                INDIAN MARKETS
            ------------------------------------------------- */}

            <Link
              href={`/preview/movies/${movie.id}/box-office/india/geographical-wise`}
              className="group rounded-xl border border-zinc-900 bg-zinc-950 p-4 transition hover:border-violet-900/60 hover:bg-zinc-900/50"
            >

              <div className="flex items-start justify-between gap-3">

                <div>

                  <p className="text-[7px] uppercase tracking-[0.16em] text-violet-400">
                    Domestic Market
                  </p>

                  <h3 className="mt-1 text-sm font-medium text-zinc-200 transition group-hover:text-violet-300">
                    Indian Markets
                  </h3>

                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 text-[10px] text-zinc-600 transition group-hover:border-violet-900 group-hover:text-violet-300">
                  →
                </div>

              </div>

              <p className="mt-4 border-t border-zinc-900 pt-3 text-[10px] leading-4 text-zinc-500">
                Explore geographical performance across
                Indian territories and states.
              </p>

              <div className="mt-3">

                <span className="text-[9px] font-medium text-yellow-500 transition group-hover:text-yellow-400">
                  View Indian Market Breakdown →
                </span>

              </div>

            </Link>

            {/* -------------------------------------------------
                OVERSEAS MARKETS
            ------------------------------------------------- */}

            <Link
              href={`/preview/movies/${movie.id}/box-office/overseas/continent-wise`}
              className="group rounded-xl border border-zinc-900 bg-zinc-950 p-4 transition hover:border-violet-900/60 hover:bg-zinc-900/50"
            >

              <div className="flex items-start justify-between gap-3">

                <div>

                  <p className="text-[7px] uppercase tracking-[0.16em] text-violet-400">
                    International Market
                  </p>

                  <h3 className="mt-1 text-sm font-medium text-zinc-200 transition group-hover:text-violet-300">
                    Overseas Markets
                  </h3>

                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 text-[10px] text-zinc-600 transition group-hover:border-violet-900 group-hover:text-violet-300">
                  →
                </div>

              </div>

              <p className="mt-4 border-t border-zinc-900 pt-3 text-[10px] leading-4 text-zinc-500">
                Explore overseas market distribution
                across continents and international
                territories.
              </p>

              <div className="mt-3">

                <span className="text-[9px] font-medium text-yellow-500 transition group-hover:text-yellow-400">
                  View Overseas Market Breakdown →
                </span>

              </div>

            </Link>

          </div>

        </section>

        {/* -------------------------------------------------
            INTELLIGENCE PRINCIPLE
        ------------------------------------------------- */}

        <section className="mt-6 rounded-xl border border-violet-900/30 bg-violet-950/10 p-4">

          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            JMI Market Model
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            JMI separates Indian and overseas markets
            because domestic and international performance
            represent different market structures. This
            allows geographical performance to be analysed
            without combining fundamentally different
            territories.
          </p>

        </section>

        {/* -------------------------------------------------
            NAVIGATION
        ------------------------------------------------- */}

        <section className="mt-6 space-y-2">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="block rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3 text-center text-[9px] text-violet-400 transition hover:border-violet-800 hover:bg-violet-950/20 hover:text-violet-300"
          >
            ← Back to Movie Intelligence
          </Link>

          <Link
            href="/preview"
            className="block rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 text-center text-[9px] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
          >
            Back to JMI Home
          </Link>

        </section>

        {/* -------------------------------------------------
            FOOTER
        ------------------------------------------------- */}

        <footer className="mt-10 border-t border-zinc-900 pt-5 pb-8">

          <p className="text-center text-[8px] text-zinc-800">
            JMI · Jeruto Movie Intelligence
          </p>

          <p className="mt-1 text-center text-[7px] text-zinc-900">
            Indian Film Industry Data & Intelligence
          </p>

        </footer>

      </main>

    </div>
  );
}