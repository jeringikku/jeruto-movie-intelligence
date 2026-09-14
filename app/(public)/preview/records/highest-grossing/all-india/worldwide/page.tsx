import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  searchParams: Promise<{
    year?: string;
  }>;
};

type RankedMovie = {
  id: number;
  title: string;
  release_year: number | null;
  poster_url: string | null;
  india: number;
  overseas: number;
  worldwide: number;
};

function formatCrores(value: number) {
  if (!value || value <= 0) return "—";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  return `₹${(value / 100000).toFixed(2)} L`;
}

function formatRank(rank: number) {
  return rank.toString().padStart(2, "0");
}

async function fetchBoxOfficeInChunks(
  movieIds: number[],
  table:
    | "movie_state_box_office"
    | "movie_overseas_box_office",
  fields: string
) {
  const chunkSize = 500;
  const rows: any[] = [];

  for (
    let i = 0;
    i < movieIds.length;
    i += chunkSize
  ) {
    const chunk = movieIds.slice(
      i,
      i + chunkSize
    );

    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .in("movie_id", chunk);

    if (error) {
      console.error(
        `Error loading ${table}:`,
        error
      );
      continue;
    }

    rows.push(...(data || []));
  }

  return rows;
}

export default async function WorldwideRecordsPage({
  searchParams,
}: Props) {
  const { year } = await searchParams;

  const selectedYear =
    year && /^\d{4}$/.test(year)
      ? Number(year)
      : null;

  /*
   * =========================================================
   * 1. GET INDIAN INDUSTRY IDS
   * =========================================================
   *
   * Hollywood is explicitly excluded.
   *
   * This uses the industries master table rather than
   * hard-coding Indian industry IDs.
   */

  const {
    data: industries,
    error: industriesError,
  } = await supabase
    .from("industries")
    .select("id, name")
    .neq("name", "Hollywood");

  if (industriesError) {
    console.error(
      "Industry query error:",
      industriesError
    );
  }

  const indianIndustryIds =
    (industries || []).map(
      (industry) => industry.id
    );

  /*
   * =========================================================
   * 2. FIND MOVIES WHOSE PRIMARY INDUSTRY IS INDIAN
   * =========================================================
   */

  let movieIndustryQuery = supabase
    .from("movie_industries")
    .select(`
      movie_id,
      industry_id,
      is_primary
    `)
    .eq("is_primary", true);

  if (indianIndustryIds.length > 0) {
    movieIndustryQuery =
      movieIndustryQuery.in(
        "industry_id",
        indianIndustryIds
      );
  }

  const {
    data: movieIndustries,
    error: movieIndustriesError,
  } = await movieIndustryQuery;

  if (movieIndustriesError) {
    console.error(
      "Movie industry query error:",
      movieIndustriesError
    );
  }

  const indianMovieIds = Array.from(
    new Set(
      (movieIndustries || []).map(
        (row) => Number(row.movie_id)
      )
    )
  );

  /*
   * =========================================================
   * 3. FETCH MOVIES
   * =========================================================
   */

  let movies: any[] = [];

  if (indianMovieIds.length > 0) {
    let movieQuery = supabase
      .from("movies")
      .select(`
        id,
        title,
        release_year,
        poster_url
      `)
      .eq("is_active", true)
      .in("id", indianMovieIds);

    if (selectedYear) {
      movieQuery = movieQuery.eq(
        "release_year",
        selectedYear
      );
    }

    const {
      data,
      error,
    } = await movieQuery;

    if (error) {
      console.error(
        "Worldwide movie query error:",
        error
      );
    }

    movies = data || [];
  }

  /*
   * =========================================================
   * 4. MOVIE IDS
   * =========================================================
   */

  const movieIds = movies.map(
    (movie) => movie.id
  );

  /*
   * =========================================================
   * 5. INDIA JMI DATA
   * =========================================================
   */

  const indiaRows =
    movieIds.length > 0
      ? await fetchBoxOfficeInChunks(
          movieIds,
          "movie_state_box_office",
          "movie_id, gross_jmi"
        )
      : [];

  /*
   * =========================================================
   * 6. OVERSEAS JMI DATA
   * =========================================================
   */

  const overseasRows =
    movieIds.length > 0
      ? await fetchBoxOfficeInChunks(
          movieIds,
          "movie_overseas_box_office",
          "movie_id, gross_inr"
        )
      : [];

  /*
   * =========================================================
   * 7. INDIA TOTAL PER MOVIE
   * =========================================================
   */

  const indiaMap = new Map<number, number>();

  for (const row of indiaRows) {
    const movieId = Number(row.movie_id);
    const gross = Number(
      row.gross_jmi || 0
    );

    indiaMap.set(
      movieId,
      (indiaMap.get(movieId) || 0) + gross
    );
  }

  /*
   * =========================================================
   * 8. OVERSEAS TOTAL PER MOVIE
   * =========================================================
   */

  const overseasMap =
    new Map<number, number>();

  for (const row of overseasRows) {
    const movieId = Number(row.movie_id);
    const gross = Number(
      row.gross_inr || 0
    );

    overseasMap.set(
      movieId,
      (overseasMap.get(movieId) || 0) + gross
    );
  }

  /*
   * =========================================================
   * 9. WORLDWIDE RANKING
   * =========================================================
   *
   * Worldwide = India + Overseas
   */

  const rankedMovies: RankedMovie[] =
    movies
      .map((movie) => {
        const india =
          indiaMap.get(movie.id) || 0;

        const overseas =
          overseasMap.get(movie.id) || 0;

        return {
          id: movie.id,
          title: movie.title,
          release_year:
            movie.release_year,
          poster_url:
            movie.poster_url,
          india,
          overseas,
          worldwide:
            india + overseas,
        };
      })
      .filter(
        (movie) => movie.worldwide > 0
      )
      .sort(
        (a, b) =>
          b.worldwide - a.worldwide
      )
      .slice(0, 100);

  /*
   * =========================================================
   * 10. YEAR OPTIONS
   * =========================================================
   */

  const { data: yearData } =
    await supabase
      .from("movies")
      .select("release_year")
      .eq("is_active", true)
      .not(
        "release_year",
        "is",
        null
      )
      .order("release_year", {
        ascending: false,
      });

  const years = Array.from(
    new Set(
      (yearData || [])
        .map(
          (row) => row.release_year
        )
        .filter(Boolean)
    )
  );

  /*
   * =========================================================
   * 11. PAGE
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-black text-zinc-300">

      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Back */}

        <div className="mb-6">
          <Link
            href="/preview/records/highest-grossing/all-india"
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>
              Back to All-India Records
            </span>
          </Link>
        </div>

        {/* Header */}

        <section className="border-b border-zinc-900 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-green-400">
            WORLDWIDE RECORDS
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            All-Time Highest Grossing
            Indian Movies
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-500">
            The top 100 Indian movies ranked
            by worldwide theatrical collection,
            combining India and overseas
            performance.
          </p>

        </section>

        {/* Year selector */}

        <section className="mt-6">

  <form
    method="GET"
    className="flex flex-wrap items-end gap-2"
  >

    <div>

      <label
        htmlFor="year"
        className="mb-2 block text-[8px] font-medium tracking-[0.2em] text-yellow-400"
      >
        YEAR
      </label>

      <select
        id="year"
        name="year"
        defaultValue={
          selectedYear
            ? String(selectedYear)
            : ""
        }
        className="h-9 w-[180px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[10px] text-zinc-300 outline-none transition focus:border-violet-500/40"
      >
        <option value="">
          All Time
        </option>

        {years.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>

    </div>

    <button
      type="submit"
      className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-[9px] text-zinc-400 transition hover:border-violet-500/40 hover:text-zinc-200"
    >
      Apply
    </button>

  </form>

</section>

        {/* Ranking summary */}

        <section className="mt-7 flex items-end justify-between border-b border-zinc-900 pb-4">

          <div>
            <div className="text-[8px] tracking-[0.2em] text-yellow-400">
              RANKING
            </div>

            <div className="mt-1 text-[11px] text-pink-400">
              {selectedYear
                ? `${selectedYear} releases`
                : "All-time"}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[8px] tracking-[0.2em] text-yellow-400">
              RECORDS
            </div>

            <div className="mt-1 text-[11px] text-pink-400">
              Top {rankedMovies.length}
            </div>
          </div>

        </section>

        {/* Ranking list */}

        <section className="mt-3">

          {rankedMovies.length > 0 ? (

            <div className="divide-y divide-zinc-900">

              {rankedMovies.map(
                (movie, index) => {

                  const rank =
                    index + 1;

                  return (
                    <Link
                      key={movie.id}
                      href={`/preview/movies/${movie.id}`}
                      className="group flex items-center gap-3 py-3 transition hover:bg-zinc-950/70 sm:gap-4 sm:px-2"
                    >

                      {/* Rank */}

                      <div className="w-6 shrink-0 text-[9px] font-medium text-green-400 sm:w-8">
                        {formatRank(rank)}
                      </div>

                      {/* Poster */}

                      <div className="h-[62px] w-[41px] shrink-0 overflow-hidden rounded border border-zinc-900 bg-zinc-950 sm:h-[76px] sm:w-[51px]">

                        {movie.poster_url ? (
                          <img
                            src={
                              movie.poster_url
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] text-zinc-800">
                            ◈
                          </div>
                        )}

                      </div>

                      {/* Movie */}

                      <div className="min-w-0 flex-1">

                        <h2 className="truncate text-[11px] font-medium text-zinc-300 transition group-hover:text-zinc-100">
                          {movie.title}
                        </h2>

                        <div className="mt-1 text-[8px] text-zinc-400">
                          {movie.release_year ||
                            "—"}
                        </div>

                        <div className="mt-1 text-[7px] text-zinc-400">
                          India + Overseas
                        </div>

                      </div>

                      {/* Worldwide */}

                      <div className="shrink-0 text-right">

                        <div className="text-[11px] font-medium text-green-400">
                          {formatCrores(
                            movie.worldwide
                          )}
                        </div>

                        <div className="mt-1 text-[7px] tracking-[0.12em] text-zinc-400">
                          WORLDWIDE
                        </div>

                      </div>

                      {/* Arrow */}

                      <div className="hidden w-4 text-[10px] text-zinc-500 transition group-hover:text-violet-400 sm:block">
                        →
                      </div>

                    </Link>
                  );
                }
              )}

            </div>

          ) : (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6">

              <p className="text-[10px] text-zinc-500">
                No qualifying Indian movie
                records are currently
                available.
              </p>

            </div>

          )}

        </section>

        {/* Definition */}

        <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">

          <div className="text-[8px] font-medium tracking-[0.2em] text-red-500">
            RECORD DEFINITION
          </div>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            This ranking includes movies whose
            primary industry classification in
            JMI belongs to an Indian industry.
            Hollywood titles are excluded.
            Worldwide collection is calculated
            as India JMI collection plus
            overseas JMI collection.
          </p>

        </section>

        {/* Navigation */}

        <div className="mt-7 flex justify-between border-t border-zinc-900 pt-5">

          <Link
            href="/preview/records/highest-grossing/all-india"
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            ← All-India Records
          </Link>

          <Link
            href="/preview/records/highest-grossing/all-india/domestic"
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            India Top 100 →
          </Link>

        </div>

      </main>

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · Worldwide Records
        </div>
      </footer>

    </div>
  );
}