import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    industrySlug: string;
  }>;
  searchParams: Promise<{
    year?: string;
  }>;
};

type RankedMovie = {
  id: number;
  title: string;
  release_year: number | null;
  poster_url: string | null;
  grossIndia: number;
  grossOverseas: number;
  grossWorldwide: number;
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

async function fetchStateBoxOfficeInChunks(
  movieIds: number[]
) {
  const chunkSize = 500;

  const rows: {
    movie_id: number;
    gross_jmi: number | null;
  }[] = [];

  for (let i = 0; i < movieIds.length; i += chunkSize) {
    const chunk = movieIds.slice(i, i + chunkSize);

    const { data, error } = await supabase
      .from("movie_state_box_office")
      .select(`
        movie_id,
        gross_jmi
      `)
      .in("movie_id", chunk);

    if (error) {
      console.error(
        "Industry worldwide India box-office query error:",
        error
      );
      continue;
    }

    rows.push(...(data || []));
  }

  return rows;
}

async function fetchOverseasBoxOfficeInChunks(
  movieIds: number[]
) {
  const chunkSize = 500;

  const rows: {
    movie_id: number;
    gross_inr: number | null;
  }[] = [];

  for (let i = 0; i < movieIds.length; i += chunkSize) {
    const chunk = movieIds.slice(i, i + chunkSize);

    const { data, error } = await supabase
      .from("movie_overseas_box_office")
      .select(`
        movie_id,
        gross_inr
      `)
      .in("movie_id", chunk);

    if (error) {
      console.error(
        "Industry worldwide overseas box-office query error:",
        error
      );
      continue;
    }

    rows.push(...(data || []));
  }

  return rows;
}

export default async function IndustryWorldwidePage({
  params,
  searchParams,
}: Props) {
  const { industrySlug } = await params;
  const { year } = await searchParams;

  const selectedYear =
    year && /^\d{4}$/.test(year)
      ? Number(year)
      : null;

  /*
   * =========================================================
   * 1. FIND INDUSTRY
   * =========================================================
   */

  const {
    data: industry,
    error: industryError,
  } = await supabase
    .from("industries")
    .select(`
      id,
      name,
      slug,
      short_name
    `)
    .eq("slug", industrySlug)
    .single();

  if (industryError || !industry) {
    console.error(
      "Industry lookup error:",
      industryError
    );

    return (
      <div className="min-h-screen bg-black text-zinc-300">

        <PublicHeader />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6">

            <p className="text-[10px] text-red-400">
              Industry could not be found.
            </p>

          </div>

        </main>

      </div>
    );
  }

  /*
   * =========================================================
   * 2. GET MOVIES BELONGING TO INDUSTRY
   * =========================================================
   */

  const {
    data: industryMovies,
    error: industryMoviesError,
  } = await supabase
    .from("movie_industries")
    .select(`
      movie_id
    `)
    .eq("industry_id", Number(industry.id));

  if (industryMoviesError) {
    console.error(
      "Industry movie mapping error:",
      industryMoviesError
    );
  }

  const industryMovieIds = Array.from(
    new Set(
      (industryMovies || []).map(
        (row) => Number(row.movie_id)
      )
    )
  );

  /*
   * =========================================================
   * 3. GET MOVIES
   * =========================================================
   */

  let movieRows: {
    id: number;
    title: string;
    release_year: number | null;
    poster_url: string | null;
  }[] = [];

  if (industryMovieIds.length > 0) {

    let movieQuery = supabase
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
      movieQuery = movieQuery.eq(
        "release_year",
        selectedYear
      );
    }

    const {
      data: movies,
      error: moviesError,
    } = await movieQuery;

    if (moviesError) {
      console.error(
        "Industry movie query error:",
        moviesError
      );
    }

    movieRows = (movies || []).map(
      (movie) => ({
        id: Number(movie.id),
        title: movie.title,
        release_year:
          movie.release_year,
        poster_url:
          movie.poster_url,
      })
    );
  }

  /*
   * =========================================================
   * 4. GET INDIA BOX OFFICE
   * =========================================================
   *
   * India = combined current state-wise JMI gross.
   */

  const movieIds = movieRows.map(
    (movie) => movie.id
  );

  const indiaRows =
    movieIds.length > 0
      ? await fetchStateBoxOfficeInChunks(
          movieIds
        )
      : [];

  /*
   * =========================================================
   * 5. GROUP INDIA COLLECTION
   * =========================================================
   */

  const indiaGrossMap =
    new Map<number, number>();

  for (const row of indiaRows) {

    const movieId =
      Number(row.movie_id);

    const gross =
      Number(row.gross_jmi || 0);

    indiaGrossMap.set(
      movieId,
      (indiaGrossMap.get(movieId) || 0) +
        gross
    );
  }

  /*
   * =========================================================
   * 6. GET OVERSEAS BOX OFFICE
   * =========================================================
   */

  const overseasRows =
    movieIds.length > 0
      ? await fetchOverseasBoxOfficeInChunks(
          movieIds
        )
      : [];

  /*
   * =========================================================
   * 7. GROUP OVERSEAS COLLECTION
   * =========================================================
   */

  const overseasGrossMap =
    new Map<number, number>();

  for (const row of overseasRows) {

    const movieId =
      Number(row.movie_id);

    const gross =
      Number(row.gross_inr || 0);

    overseasGrossMap.set(
      movieId,
      (overseasGrossMap.get(movieId) || 0) +
        gross
    );
  }

  /*
   * =========================================================
   * 8. BUILD WORLDWIDE RANKING
   * =========================================================
   */

  const rankedMovies: RankedMovie[] =
    movieRows
      .map((movie) => {

        const grossIndia =
          indiaGrossMap.get(
            movie.id
          ) || 0;

        const grossOverseas =
          overseasGrossMap.get(
            movie.id
          ) || 0;

        const grossWorldwide =
          grossIndia +
          grossOverseas;

        return {
          id: movie.id,
          title: movie.title,
          release_year:
            movie.release_year,
          poster_url:
            movie.poster_url,
          grossIndia,
          grossOverseas,
          grossWorldwide,
        };
      })
      .filter(
        (movie) =>
          movie.grossWorldwide > 0
      )
      .sort(
        (a, b) =>
          b.grossWorldwide -
          a.grossWorldwide
      )
      .slice(0, 100);

  /*
   * =========================================================
   * 9. YEAR OPTIONS
   * =========================================================
   */

  const {
    data: yearData,
    error: yearError,
  } = await supabase
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

  if (yearError) {
    console.error(
      "Year query error:",
      yearError
    );
  }

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
   * 10. PAGE
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-black text-zinc-300">

      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Back */}

        <div className="mb-6">

          <Link
            href={`/preview/records/industry-wise/${industry.slug}`}
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>

            <span>
              Back to {industry.name} Records
            </span>

          </Link>

        </div>

        {/* Header */}

        <section className="border-b border-zinc-900 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-green-400">
            {industry.name.toUpperCase()} · WORLDWIDE
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            All-Time Highest Grossing
            Movies Worldwide
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-500">
            The top 100 {industry.name}
            movies ranked by their current JMI
            worldwide theatrical collection.
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
                className="mb-2 block text-[8px] font-medium tracking-[0.2em] text-pink-400"
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

            <div className="text-[8px] tracking-[0.2em] text-pink-400">
              RANKING
            </div>

            <div className="mt-1 text-[11px] text-yellow-500">
              {selectedYear
                ? `${selectedYear} releases`
                : "All-time"}
            </div>

          </div>

          <div className="text-right">

            <div className="text-[8px] tracking-[0.2em] text-pink-400">
              RECORDS
            </div>

            <div className="mt-1 text-[11px] text-yellow-500">
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

                      <div className="w-6 shrink-0 text-[9px] font-medium text-zinc-700 sm:w-8">
                        {formatRank(rank)}
                      </div>

                      {/* Poster */}

                      <div className="h-[62px] w-[41px] shrink-0 overflow-hidden rounded border border-zinc-900 bg-zinc-950 sm:h-[76px] sm:w-[51px]">

                        {movie.poster_url ? (

                          <img
                            src={movie.poster_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />

                        ) : (

                          <div className="flex h-full items-center justify-center text-[9px] text-zinc-800">
                            ◈
                          </div>

                        )}

                      </div>

                      {/* Movie information */}

                      <div className="min-w-0 flex-1">

                        <h2 className="truncate text-[11px] font-medium text-zinc-300 transition group-hover:text-zinc-100">
                          {movie.title}
                        </h2>

                        <div className="mt-1 text-[8px] text-zinc-500">
                          {movie.release_year ||
                            "—"}
                        </div>

                        <div className="mt-1 text-[7px] tracking-[0.12em] text-zinc-500">
                          {industry.name.toUpperCase()}
                        </div>

                      </div>

                      {/* Collection */}

                      <div className="shrink-0 text-right">

                        <div className="text-[11px] font-medium text-green-500">
                          {formatCrores(
                            movie.grossWorldwide
                          )}
                        </div>

                        <div className="mt-1 text-[7px] tracking-[0.12em] text-zinc-500">
                          WORLDWIDE GROSS
                        </div>

                      </div>

                      {/* Arrow */}

                      <div className="hidden w-4 text-[10px] text-zinc-800 transition group-hover:text-violet-400 sm:block">
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
                No worldwide box-office
                records are currently available
                for the selected period.
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
            This ranking includes movies assigned
            to the selected industry in the JMI
            movie-industry database. Worldwide
            collection is calculated as the combined
            current JMI theatrical collection from
            India and overseas. India is derived
            from state-wise JMI gross, while overseas
            is derived from the existing overseas
            JMI collection data.
          </p>

        </section>

        {/* Navigation */}

        <div className="mt-7 flex justify-between border-t border-zinc-900 pt-5">

          <Link
            href={`/preview/records/industry-wise/${industry.slug}`}
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            ← {industry.name} Records
          </Link>

          <Link
            href={`/preview/records/industry-wise/${industry.slug}/india`}
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            India →
          </Link>

        </div>

      </main>

      {/* Footer */}

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">

        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence ·{" "}
          {industry.name} Worldwide Records
        </div>

      </footer>

    </div>
  );
}