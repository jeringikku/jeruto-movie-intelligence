import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{ industrySlug: string }>;
  searchParams: Promise<{ year?: string }>;
};

function formatUSD(value: number) {
  if (!value || value <= 0) return "—";

  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }

  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }

  return `$${value.toFixed(0)}`;
}

function formatINR(value: number) {
  if (!value || value <= 0) return "—";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${value.toFixed(0)}`;
}

export default async function IndustryOverseasRecordsPage({
  params,
  searchParams,
}: Props) {
  const { industrySlug } = await params;
  const { year } = await searchParams;

  const selectedYear =
    year && /^\d{4}$/.test(year) ? Number(year) : null;

  /*
   * =========================================================
   * 1. GET INDUSTRY
   * =========================================================
   */

  const { data: industry, error: industryError } = await supabase
    .from("industries")
    .select(`
      id,
      name,
      slug,
      short_name,
      description
    `)
    .eq("slug", industrySlug)
    .single();

  if (industryError || !industry) {
    return (
      <div className="min-h-screen bg-black text-zinc-300">
        <PublicHeader />

        <main className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-sm text-red-400">
            Industry not found.
          </p>
        </main>
      </div>
    );
  }

  /*
   * =========================================================
   * 2. GET MOVIES ASSIGNED TO THIS INDUSTRY
   * =========================================================
   */

  const { data: industryMovies, error: industryMoviesError } =
    await supabase
      .from("movie_industries")
      .select(`
        movie_id
      `)
      .eq("industry_id", industry.id);

  if (industryMoviesError) {
    return (
      <div className="min-h-screen bg-black text-zinc-300">
        <PublicHeader />

        <main className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-sm text-red-400">
            Unable to load industry records.
          </p>
        </main>
      </div>
    );
  }

  const industryMovieIds = [
    ...new Set(
      (industryMovies || [])
        .map((row) => Number(row.movie_id))
        .filter(Boolean)
    ),
  ];

  /*
   * =========================================================
   * 3. GET ACTIVE MOVIES
   * =========================================================
   */

  let moviesQuery = supabase
    .from("movies")
    .select(`
      id,
      title,
      release_year,
      poster_url
    `)
    .eq("is_active", true)
    .in("id", industryMovieIds);

  if (selectedYear) {
    moviesQuery = moviesQuery.eq("release_year", selectedYear);
  }

  const { data: movies, error: moviesError } = await moviesQuery;

  if (moviesError) {
    return (
      <div className="min-h-screen bg-black text-zinc-300">
        <PublicHeader />

        <main className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-sm text-red-400">
            Unable to load movies.
          </p>
        </main>
      </div>
    );
  }

  const movieIds = (movies || []).map((movie) => Number(movie.id));

  /*
   * =========================================================
   * 4. GET OVERSEAS COLLECTION
   * =========================================================
   *
   * Uses the existing:
   * movie_overseas_box_office
   *
   * gross_usd = USD overseas collection
   * gross_inr = INR overseas collection
   */

  const overseasMap = new Map<
    number,
    {
      usd: number;
      inr: number;
    }
  >();

  const chunkSize = 500;

  for (let i = 0; i < movieIds.length; i += chunkSize) {
    const chunk = movieIds.slice(i, i + chunkSize);

    const { data: overseasRows } = await supabase
      .from("movie_overseas_box_office")
      .select(`
        movie_id,
        gross_usd,
        gross_inr
      `)
      .in("movie_id", chunk);

    for (const row of overseasRows || []) {
      const movieId = Number(row.movie_id);

      const current = overseasMap.get(movieId) || {
        usd: 0,
        inr: 0,
      };

      current.usd += Number(row.gross_usd || 0);
      current.inr += Number(row.gross_inr || 0);

      overseasMap.set(movieId, current);
    }
  }

  /*
   * =========================================================
   * 5. BUILD RANKING
   * =========================================================
   */

  const ranking = (movies || [])
    .map((movie) => {
      const collection = overseasMap.get(Number(movie.id)) || {
        usd: 0,
        inr: 0,
      };

      return {
        id: Number(movie.id),
        title: movie.title,
        release_year: movie.release_year,
        poster_url: movie.poster_url,
        usd: collection.usd,
        inr: collection.inr,
      };
    })
    .filter((movie) => movie.usd > 0 || movie.inr > 0)
    .sort((a, b) => b.usd - a.usd)
    .slice(0, 100);

  /*
   * =========================================================
   * 6. YEAR OPTIONS
   * =========================================================
   */

  const { data: yearMovies } = await supabase
    .from("movies")
    .select("release_year")
    .eq("is_active", true)
    .in("id", industryMovieIds)
    .not("release_year", "is", null);

  const years = [
    ...new Set(
      (yearMovies || [])
        .map((movie) => Number(movie.release_year))
        .filter(Boolean)
    ),
  ].sort((a, b) => b - a);

  /*
   * =========================================================
   * 7. PAGE
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-black text-zinc-300">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* BACK */}
        <div className="mb-4">
          <Link
            href={`/preview/records/industry-wise/${industry.slug}`}
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-violet-300"
          >
            <span>←</span>
            <span>Back to Industry Records</span>
          </Link>
        </div>

        {/* HEADER */}
        <section className="border-b border-zinc-800 pb-5">
          <p className="text-[9px] font-medium tracking-[0.22em] text-green-400">
            INDUSTRY RECORDS · {industry.name.toUpperCase()}
          </p>

          <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            All-time Highest Grossing Movies Overseas
          </h1>

          <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-500 sm:text-xs">
            The highest-grossing movies from the {industry.name} industry
            based on recorded overseas theatrical performance.
          </p>
        </section>

        {/* YEAR FILTER */}
        <section className="border-b border-zinc-900 py-4">
          <form
            method="GET"
            className="flex flex-wrap items-end gap-3"
          >
            <div>
              <label className="mb-1 block text-[8px] font-medium tracking-[0.18em] text-pink-400">
                YEAR
              </label>

              <select
                name="year"
                defaultValue={selectedYear ? String(selectedYear) : ""}
                className="h-8 w-[180px] rounded-md border border-zinc-800 bg-zinc-950 px-2 text-[10px] text-zinc-300 outline-none"
              >
                <option value="">All Time</option>

                {years.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="h-8 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-[9px] font-medium text-zinc-300 transition hover:border-violet-500 hover:text-white"
            >
              Apply
            </button>
          </form>
        </section>

        {/* SUMMARY */}
        <section className="border-b border-zinc-900 py-4">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <p className="text-[8px] tracking-[0.18em] text-pink-400">
                RANKING
              </p>
              <p className="mt-1 text-[11px] font-normal text-yellow-400">
                TOP 100
              </p>
            </div>

            <div>
              <p className="text-[8px] tracking-[0.18em] text-pink-400">
                RECORDS
              </p>
              <p className="mt-1 text-sm font-semibold text-yellow-400">
                {ranking.length}
              </p>
            </div>
          </div>
        </section>

        {/* RANKING */}
        <section className="py-5">
          <div className="space-y-1">

            {ranking.length === 0 ? (
              <div className="border border-zinc-900 bg-zinc-950 px-4 py-8 text-center">
                <p className="text-xs text-zinc-500">
                  No overseas box-office records are available for this
                  selection.
                </p>
              </div>
            ) : (
              ranking.map((movie, index) => (
                <Link
                  key={movie.id}
                  href={`/preview/movies/${movie.id}`}
                  className="group flex items-center gap-3 border-b border-zinc-900 py-2.5 transition hover:bg-zinc-950 sm:gap-4"
                >
                  {/* RANK */}
                  <div className="w-6 shrink-0 text-center text-[10px] font-semibold text-green-400">
                    {index + 1}
                  </div>

                  {/* POSTER */}
                  <div className="h-[62px] w-[41px] shrink-0 overflow-hidden rounded-sm bg-zinc-900 sm:h-[76px] sm:w-[51px]">
                    {movie.poster_url ? (
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[8px] text-zinc-700">
                        JMI
                      </div>
                    )}
                  </div>

                  {/* TITLE */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-zinc-200 transition group-hover:text-white sm:text-xs">
                      {movie.title}
                    </p>

                    <p className="mt-1 text-[9px] text-pink-400">
                      {movie.release_year || "—"}
                    </p>

                    <p className="mt-1 text-[8px] tracking-[0.12em] text-zinc-500">
                      OVERSEAS
                    </p>
                  </div>

                  {/* COLLECTION */}
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-semibold text-green-400 sm:text-xs">
                      {formatUSD(movie.usd)}
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-400 sm:text-[10px]">
                      {formatINR(movie.inr)}
                    </p>
                  </div>

                  {/* ARROW */}
                  <div className="hidden w-4 text-right text-[10px] text-zinc-700 transition group-hover:text-violet-400 sm:block">
                    →
                  </div>
                </Link>
              ))
            )}

          </div>
        </section>

        {/* DEFINITION */}
        <section className="border-t border-zinc-900 pt-5">
          <div className="border border-zinc-900 bg-zinc-950 p-4">
            <p className="text-[8px] font-medium tracking-[0.18em] text-pink-400">
              RECORD DEFINITION
            </p>

            <p className="mt-2 text-[10px] leading-5 text-zinc-500">
              Rankings are based on overseas theatrical collection recorded
              by JMI for movies assigned to the selected industry.
              USD and INR figures are displayed using the existing
              overseas box-office records. Overseas figures are separate
              from India theatrical collection.
            </p>
          </div>
        </section>

        {/* NAVIGATION */}
        <section className="border-t border-zinc-900 py-5">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/preview/records/industry-wise/${industry.slug}/worldwide`}
              className="rounded-md border border-zinc-800 px-3 py-2 text-[9px] text-zinc-500 transition hover:border-violet-500 hover:text-zinc-200"
            >
              Worldwide
            </Link>

            <Link
              href={`/preview/records/industry-wise/${industry.slug}/india`}
              className="rounded-md border border-zinc-800 px-3 py-2 text-[9px] text-zinc-500 transition hover:border-violet-500 hover:text-zinc-200"
            >
              India
            </Link>

            <Link
              href="/preview/records/industry-wise"
              className="rounded-md border border-zinc-800 px-3 py-2 text-[9px] text-zinc-500 transition hover:border-violet-500 hover:text-zinc-200"
            >
              All Industries
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-zinc-900 pt-5 text-[8px] leading-4 text-zinc-700">
          JMI · Jeruto Movie Intelligence
          <br />
          Overseas records are based on available JMI trade data.
        </footer>

      </main>
    </div>
  );
}