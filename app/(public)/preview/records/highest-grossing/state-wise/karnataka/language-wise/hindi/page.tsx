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
  original_language: string;
  gross: number;
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
  movieIds: number[],
  stateId: number
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
      .eq("state_id", stateId)
      .in("movie_id", chunk);

    if (error) {
      console.error(
        "Karnataka Hindi box-office query error:",
        error
      );
      continue;
    }

    rows.push(...(data || []));
  }

  return rows;
}

export default async function KarnatakaHindiPage({
  searchParams,
}: Props) {
  const { year } = await searchParams;

  const selectedYear =
    year && /^\d{4}$/.test(year)
      ? Number(year)
      : null;

  /*
   * =========================================================
   * 1. FIND KARNATAKA STATE
   * =========================================================
   */

  const {
    data: karnatakaState,
    error: stateError,
  } = await supabase
    .from("states")
    .select("id, name")
    .eq("name", "Karnataka")
    .single();

  if (stateError || !karnatakaState) {
    console.error(
      "Karnataka state lookup error:",
      stateError
    );

    return (
      <div className="min-h-screen bg-black text-zinc-300">
        <PublicHeader />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6">
            <p className="text-[10px] text-red-400">
              Karnataka market data could not be loaded.
            </p>
          </div>
        </main>
      </div>
    );
  }

  /*
   * =========================================================
   * 2. GET ACTIVE MOVIES
   * =========================================================
   */

  let movieQuery = supabase
    .from("movies")
    .select(`
      id,
      title,
      release_year,
      poster_url
    `)
    .eq("is_active", true);

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
      "Karnataka Hindi movie query error:",
      moviesError
    );
  }

  /*
   * =========================================================
   * 3. GET PRIMARY LANGUAGE
   * =========================================================
   *
   * IMPORTANT:
   * Only is_primary = true is considered.
   * Secondary / dubbed languages are ignored.
   */

  const movieIdsForLanguage =
    (movies || []).map(
      (movie) => Number(movie.id)
    );

  const primaryLanguageMap =
    new Map<number, number>();

  if (movieIdsForLanguage.length > 0) {
    const {
      data: primaryLanguageRows,
      error: primaryLanguageError,
    } = await supabase
      .from("movie_languages")
      .select(`
        movie_id,
        language_id
      `)
      .eq("is_primary", true)
      .in(
        "movie_id",
        movieIdsForLanguage
      );

    if (primaryLanguageError) {
      console.error(
        "Primary language mapping error:",
        primaryLanguageError
      );
    }

    for (const row of primaryLanguageRows || []) {
      primaryLanguageMap.set(
        Number(row.movie_id),
        Number(row.language_id)
      );
    }
  }

  /*
   * =========================================================
   * 4. GET LANGUAGE NAMES
   * =========================================================
   */

  const languageIds = Array.from(
    new Set(
      Array.from(
        primaryLanguageMap.values()
      )
    )
  );

  const languageNameMap =
    new Map<number, string>();

  if (languageIds.length > 0) {
    const {
      data: languageRows,
      error: languageError,
    } = await supabase
      .from("languages")
      .select(`
        id,
        name
      `)
      .in("id", languageIds);

    if (languageError) {
      console.error(
        "Language lookup error:",
        languageError
      );
    }

    for (const row of languageRows || []) {
      languageNameMap.set(
        Number(row.id),
        row.name
      );
    }
  }

  /*
   * =========================================================
   * 5. FILTER PRIMARY HINDI MOVIES
   * =========================================================
   *
   * ONLY movies whose PRIMARY language is Hindi
   * are included.
   */

  const eligibleMovies =
    (movies || [])
      .map((movie) => {
        const languageId =
          primaryLanguageMap.get(
            Number(movie.id)
          );

        const language =
          languageId !== undefined
            ? languageNameMap.get(
                languageId
              ) || null
            : null;

        return {
          ...movie,
          original_language:
            language,
        };
      })
      .filter(
        (movie) =>
          movie.original_language &&
          movie.original_language
            .trim()
            .toLowerCase() ===
            "hindi"
      );

  /*
   * =========================================================
   * 6. GET KARNATAKA BOX OFFICE
   * =========================================================
   */

  const movieIds =
    eligibleMovies.map(
      (movie) => Number(movie.id)
    );

  const stateRows =
    movieIds.length > 0
      ? await fetchStateBoxOfficeInChunks(
          movieIds,
          Number(karnatakaState.id)
        )
      : [];

  /*
   * =========================================================
   * 7. GROUP KARNATAKA COLLECTION
   * =========================================================
   */

  const grossMap = new Map<
    number,
    number
  >();

  for (const row of stateRows) {
    const movieId =
      Number(row.movie_id);

    const gross =
      Number(row.gross_jmi || 0);

    grossMap.set(
      movieId,
      (grossMap.get(movieId) || 0) +
        gross
    );
  }

  /*
   * =========================================================
   * 8. BUILD TOP 100
   * =========================================================
   */

  const rankedMovies: RankedMovie[] =
    eligibleMovies
      .map((movie) => ({
        id: Number(movie.id),
        title: movie.title,
        release_year:
          movie.release_year,
        poster_url:
          movie.poster_url,
        original_language:
          movie.original_language ||
          "Hindi",
        gross:
          grossMap.get(
            Number(movie.id)
          ) || 0,
      }))
      .filter(
        (movie) => movie.gross > 0
      )
      .sort(
        (a, b) =>
          b.gross - a.gross
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
            href="/preview/records/highest-grossing/state-wise/karnataka/language-wise"
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Language-wise</span>
          </Link>
        </div>

        {/* Header */}

        <section className="border-b border-zinc-900 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-green-400">
            KARNATAKA · HINDI
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            All-Time Highest Grossing
            Hindi Movies in Karnataka
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-500">
            The top 100 Hindi movies
            ranked by their current JMI
            theatrical collection in Karnataka.
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

            <div className="mt-1 text-[11px] text-yellow-400">
              {selectedYear
                ? `${selectedYear} releases`
                : "All-time"}
            </div>

          </div>

          <div className="text-right">

            <div className="text-[8px] tracking-[0.2em] text-pink-400">
              RECORDS
            </div>

            <div className="mt-1 text-[11px] text-yellow-400">
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

                      <div className="w-6 shrink-0 text-[9px] font-medium text-green-500 sm:w-8">
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
                          HINDI
                        </div>

                      </div>

                      {/* Collection */}

                      <div className="shrink-0 text-right">

                        <div className="text-[11px] font-medium text-green-500">
                          {formatCrores(
                            movie.gross
                          )}
                        </div>

                        <div className="mt-1 text-[7px] tracking-[0.12em] text-zinc-500">
                          KARNATAKA GROSS
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
                No Hindi Karnataka
                box-office records are
                currently available for the
                selected period.
              </p>

            </div>

          )}

        </section>

        {/* Definition */}

        <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">

          <div className="text-[8px] font-medium tracking-[0.2em] text-red-500">
            RECORD DEFINITION
          </div>

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            This ranking includes only movies
            whose primary language is Hindi.
            Secondary or dubbed languages do not
            affect the classification. Rankings
            are based on current JMI theatrical
            collection reported for Karnataka.
          </p>

        </section>

        {/* Navigation */}

        <div className="mt-7 flex justify-between border-t border-zinc-900 pt-5">

          <Link
            href="/preview/records/highest-grossing/state-wise/karnataka/language-wise"
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            ← Language-wise
          </Link>

          <Link
            href="/preview/records/highest-grossing/state-wise/karnataka/language-wise/english"
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            English →
          </Link>

        </div>

      </main>

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">

        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · Karnataka Language Records
        </div>

      </footer>

    </div>
  );
}