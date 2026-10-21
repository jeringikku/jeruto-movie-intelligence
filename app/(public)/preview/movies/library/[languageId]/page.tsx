import Link from "next/link";
import PublicHeader from "../../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Language = {
  id: number;
  name: string;
};

type MovieLanguageRow = {
  movie_id: number;
};

type Movie = {
  id: number;
  title: string;
  poster_url: string | null;
  release_year: number | null;
};

type MoviePeopleRow = {
  movie_id: number;
  person_id: number;
};

type Person = {
  id: number;
  full_name: string;
};

type PageProps = {
  params: Promise<{
    languageId: string;
  }>;
  searchParams: Promise<{
    year?: string;
    actor?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function LanguageMovieLibraryPage({
  params,
  searchParams,
}: PageProps) {
  const { languageId } = await params;
  const { year, actor } = await searchParams;

  const parsedLanguageId = Number(languageId);

  const selectedYear =
    year && /^\d{4}$/.test(year) ? Number(year) : null;

  const selectedActorId =
    actor && /^\d+$/.test(actor) ? Number(actor) : null;

  if (!parsedLanguageId) {
    return (
      <div className="min-h-screen bg-[#090705] text-white">
        <PublicHeader />

        <main className="mx-auto max-w-5xl px-4 py-20 text-center">
          <p className="text-sm text-zinc-500">
            Invalid movie language.
          </p>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Load language
  // ---------------------------------------------------------

  const { data: language, error: languageError } =
    await supabase
      .from("languages")
      .select("id, name")
      .eq("id", parsedLanguageId)
      .maybeSingle();

  if (languageError) {
    console.error(
      "Language Library language error:",
      languageError
    );
  }

  if (!language) {
    return (
      <div className="min-h-screen bg-[#C4A484] text-white">
        <PublicHeader />

        <main className="mx-auto max-w-5xl px-4 py-20 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-violet-500">
            JMI Movie Library
          </p>

          <h1 className="mt-3 text-2xl font-semibold">
            Language Not Found
          </h1>

          <Link
            href="/preview/movies/library"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-[8px] font-medium uppercase tracking-[0.14em] text-violet-400 transition hover:border-yellow-500/30 hover:text-yellow-400"
          >
            <span className="text-xs">←</span>
            Back to Movie Library
          </Link>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Load movies associated with this language
  // ---------------------------------------------------------

  const { data: movieLanguageRows, error: movieLanguageError } =
    await supabase
      .from("movie_languages")
      .select("movie_id")
      .eq("language_id", parsedLanguageId);

  if (movieLanguageError) {
    console.error(
      "Language Library movie-language error:",
      movieLanguageError
    );
  }

  const movieIds = Array.from(
    new Set(
      ((movieLanguageRows || []) as MovieLanguageRow[])
        .map((row) => Number(row.movie_id))
        .filter(Boolean)
    )
  );

  let movies: Movie[] = [];

  if (movieIds.length > 0) {
    const { data: movieRows, error: moviesError } =
      await supabase
        .from("movies")
        .select("id, title, poster_url, release_year")
        .in("id", movieIds)
        .order("release_year", {
          ascending: false,
          nullsFirst: false,
        })
        .order("title", {
          ascending: true,
        });

    if (moviesError) {
      console.error(
        "Language Library movies error:",
        moviesError
      );
    }

    movies = (movieRows || []) as Movie[];
  }

  // ---------------------------------------------------------
  // Load qualifying lead actors for this language
  //
  // role_id = 1          -> Actor
  // credit_type_id = 1   -> Lead Role
  // ---------------------------------------------------------

  let leadActorRows: MoviePeopleRow[] = [];
  let actors: Person[] = [];

  if (movieIds.length > 0) {
    const {
      data: moviePeopleRows,
      error: moviePeopleError,
    } = await supabase
      .from("movie_people")
      .select("movie_id, person_id")
      .in("movie_id", movieIds)
      .eq("role_id", 1)
      .eq("credit_type_id", 1);

    if (moviePeopleError) {
      console.error(
        "Language Library lead actor error:",
        moviePeopleError
      );
    }

    leadActorRows = (moviePeopleRows || []) as MoviePeopleRow[];

    const personIds = Array.from(
      new Set(
        leadActorRows
          .map((row) => Number(row.person_id))
          .filter(Boolean)
      )
    );

    if (personIds.length > 0) {
      const { data: peopleRows, error: peopleError } =
        await supabase
          .from("people")
          .select("id, full_name")
          .in("id", personIds)
          .order("full_name", {
            ascending: true,
          });

      if (peopleError) {
        console.error(
          "Language Library people error:",
          peopleError
        );
      }

      actors = (peopleRows || []) as Person[];
    }
  }

  // ---------------------------------------------------------
  // Available years for this language
  // ---------------------------------------------------------

  const availableYears = Array.from(
    new Set(
      movies
        .map((movie) => movie.release_year)
        .filter(
          (movieYear): movieYear is number =>
            Number.isInteger(movieYear)
        )
    )
  ).sort((a, b) => b - a);

  // ---------------------------------------------------------
  // Build actor -> movie relationship
  // ---------------------------------------------------------

  const actorMovieMap = new Map<number, Set<number>>();

  leadActorRows.forEach((row) => {
    const personId = Number(row.person_id);
    const movieId = Number(row.movie_id);

    if (!personId || !movieId) return;

    if (!actorMovieMap.has(personId)) {
      actorMovieMap.set(personId, new Set<number>());
    }

    actorMovieMap.get(personId)!.add(movieId);
  });

  // ---------------------------------------------------------
  // Apply year + actor filters
  // ---------------------------------------------------------

  let filteredMovies = movies;

  if (selectedYear) {
    filteredMovies = filteredMovies.filter(
      (movie) => movie.release_year === selectedYear
    );
  }

  if (selectedActorId) {
    const actorMovieIds =
      actorMovieMap.get(selectedActorId) || new Set<number>();

    filteredMovies = filteredMovies.filter((movie) =>
      actorMovieIds.has(movie.id)
    );
  }

  // ---------------------------------------------------------
  // Selected actor name
  // ---------------------------------------------------------

  const selectedActor = selectedActorId
    ? actors.find(
        (person) => Number(person.id) === selectedActorId
      )
    : null;

  return (
    <div className="min-h-screen bg-[#090705] text-white">
      <PublicHeader />

      <main className="relative overflow-hidden">
        {/* Ambient library lighting */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-yellow-500/[0.035] blur-[120px]" />

          <div className="absolute left-[-120px] top-[480px] h-[380px] w-[380px] rounded-full bg-violet-500/[0.035] blur-[110px]" />

          <div className="absolute right-[-120px] top-[850px] h-[380px] w-[380px] rounded-full bg-yellow-500/[0.025] blur-[110px]" />
        </div>

        <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-5 sm:px-6 lg:px-8">
          {/* Top navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-[6px] font-medium uppercase tracking-[0.14em] text-violet-500 transition hover:border-yellow-500/30 hover:text-yellow-400"
            >
              <span className="text-xs">←</span>
              Back to JMI Homepage
            </Link>

            <Link
              href="/preview/movies/library"
              className="inline-flex items-center gap-2 rounded-md border border-[#3b2818] bg-[#120d08] px-3 py-2 text-[6px] font-medium uppercase tracking-[0.14em] text-violet-500 transition hover:border-yellow-500/30 hover:text-yellow-400"
            >
              <span className="text-xs">←</span>
              Movie Library
            </Link>
          </div>

          {/* =========================================================
              LIGHT-BROWN WOODEN MAIN BANNER
          ========================================================= */}

          <div
            className="relative mt-6 overflow-hidden rounded-[17px] border-[2px] border-[#795331] p-[5px] shadow-[0_14px_35px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,225,175,0.45),inset_0_-4px_8px_rgba(0,0,0,0.35)] sm:border-[7px] sm:p-[7px]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
  2deg,
  transparent 0px,
  transparent 8px,
  rgba(225, 190, 140, 0.10) 9px,
  rgba(40, 23, 12, 0.16) 11px,
  transparent 13px,
  transparent 21px
),
repeating-linear-gradient(
  178deg,
  transparent 0px,
  transparent 29px,
  rgba(35, 20, 10, 0.18) 30px,
  transparent 32px,
  transparent 42px
),
                linear-gradient(
  110deg,
  #6e4e30 0%,
  #6e4e30 20%,
  #80603e 48%,
  #6e4e30 76%,
  #6e4e30 100%
)
              `,
            }}
          >
            {/* Wooden frame highlights */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-gradient-to-b from-[#f1d2a2] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[5px] bg-gradient-to-t from-[#392212]/80 via-[#684323]/50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[3px] bg-gradient-to-r from-[#503016]/70 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[3px] bg-gradient-to-l from-[#503016]/70 to-transparent" />

            {/* Corner nail — top left */}
            <div className="pointer-events-none absolute left-2 top-2 z-30 flex h-[11px] w-[11px] items-center justify-center rounded-full border border-[#e2c49a] bg-gradient-to-br from-[#bda17b] via-[#6f5031] to-[#302013] shadow-[1px_2px_4px_rgba(0,0,0,0.7)] sm:left-3 sm:top-3">
              <span className="h-[4px] w-[4px] rounded-full bg-[#24170d] shadow-[0_1px_1px_rgba(255,225,180,0.45)]" />
            </div>

            {/* Corner nail — top right */}
            <div className="pointer-events-none absolute right-2 top-2 z-30 flex h-[11px] w-[11px] items-center justify-center rounded-full border border-[#e2c49a] bg-gradient-to-br from-[#bda17b] via-[#6f5031] to-[#302013] shadow-[1px_2px_4px_rgba(0,0,0,0.7)] sm:right-3 sm:top-3">
              <span className="h-[4px] w-[4px] rounded-full bg-[#24170d] shadow-[0_1px_1px_rgba(255,225,180,0.45)]" />
            </div>

            {/* Corner nail — bottom left */}
            <div className="pointer-events-none absolute bottom-2 left-2 z-30 flex h-[11px] w-[11px] items-center justify-center rounded-full border border-[#e2c49a] bg-gradient-to-br from-[#bda17b] via-[#6f5031] to-[#302013] shadow-[1px_2px_4px_rgba(0,0,0,0.7)] sm:bottom-3 sm:left-3">
              <span className="h-[4px] w-[4px] rounded-full bg-[#24170d]" />
            </div>

            {/* Corner nail — bottom right */}
            <div className="pointer-events-none absolute bottom-2 right-2 z-30 flex h-[11px] w-[11px] items-center justify-center rounded-full border border-[#e2c49a] bg-gradient-to-br from-[#bda17b] via-[#6f5031] to-[#302013] shadow-[1px_2px_4px_rgba(0,0,0,0.7)] sm:bottom-3 sm:right-3">
              <span className="h-[4px] w-[4px] rounded-full bg-[#24170d]" />
            </div>

            {/* Banner inset */}
            <div className="relative overflow-hidden rounded-[10px] border border-[#674322]/80 bg-[#3b2818]/75 shadow-[inset_0_2px_12px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,220,160,0.14),transparent_65%)]" />

              <div className="relative px-5 py-9 text-center sm:px-8 sm:py-12">
                <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#f6d39a]">
                  JMI Movie Library
                </p>

                <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] sm:text-4xl">
                  {language.name} Cinema
                </h1>

                <p className="mx-auto mt-3 max-w-lg text-[10px] leading-5 text-[#f0dfc7] sm:text-[11px]">
                  Explore the JMI collection of movies associated
                  with the {language.name} language.
                </p>

                <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#f0cc91] to-transparent" />

                  <span className="text-[7px] uppercase tracking-[0.2em] text-[#b7e2a2]">
                    Cinema Archive
                  </span>

                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#f0cc91] to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              LIGHT-BROWN WOODEN FILTER PLAQUE
          ========================================================= */}

          <div
            className="relative mt-7 overflow-hidden rounded-[15px] border-[2px] border-[#795331] p-[4px] shadow-[0_12px_28px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,225,175,0.4),inset_0_-3px_6px_rgba(0,0,0,0.3)] sm:border-[5px] sm:p-[5px]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  2deg,
                  transparent 0px,
                  transparent 9px,
                  rgba(255,220,165,0.15) 10px,
                  rgba(65,35,15,0.12) 12px,
                  transparent 14px,
                  transparent 23px
                ),
                repeating-linear-gradient(
                  178deg,
                  transparent 0px,
                  transparent 31px,
                  rgba(45,25,12,0.14) 32px,
                  transparent 34px,
                  transparent 45px
                ),
                linear-gradient(
                  110deg,
                  #6e4e30 0%,
                  #6e4e30 25%,
                  #a97949 55%,
                  #6e4e30 80%,
                  #96683d 100%
                )
              `,
            }}
          >
            {/* Wooden edge highlights */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-gradient-to-b from-[#f1d2a2] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[4px] bg-gradient-to-t from-[#392212]/75 to-transparent" />

            {/* Filter plaque nails */}
            <div className="pointer-events-none absolute left-2 top-2 z-30 flex h-[10px] w-[10px] items-center justify-center rounded-full border border-[#e2c49a] bg-gradient-to-br from-[#bda17b] via-[#6f5031] to-[#302013] shadow-[1px_2px_4px_rgba(0,0,0,0.65)] sm:left-3 sm:top-3">
              <span className="h-[3px] w-[3px] rounded-full bg-[#24170d]" />
            </div>

            <div className="pointer-events-none absolute right-2 top-2 z-30 flex h-[10px] w-[10px] items-center justify-center rounded-full border border-[#e2c49a] bg-gradient-to-br from-[#bda17b] via-[#6f5031] to-[#302013] shadow-[1px_2px_4px_rgba(0,0,0,0.65)] sm:right-3 sm:top-3">
              <span className="h-[3px] w-[3px] rounded-full bg-[#24170d]" />
            </div>

            <div className="pointer-events-none absolute bottom-2 left-2 z-30 flex h-[10px] w-[10px] items-center justify-center rounded-full border border-[#e2c49a] bg-gradient-to-br from-[#bda17b] via-[#6f5031] to-[#302013] shadow-[1px_2px_4px_rgba(0,0,0,0.65)] sm:bottom-3 sm:left-3">
              <span className="h-[3px] w-[3px] rounded-full bg-[#24170d]" />
            </div>

            <div className="pointer-events-none absolute bottom-2 right-2 z-30 flex h-[10px] w-[10px] items-center justify-center rounded-full border border-[#e2c49a] bg-gradient-to-br from-[#bda17b] via-[#6f5031] to-[#302013] shadow-[1px_2px_4px_rgba(0,0,0,0.65)] sm:bottom-3 sm:right-3">
              <span className="h-[3px] w-[3px] rounded-full bg-[#24170d]" />
            </div>

            {/* Filter content */}
            <div className="relative rounded-[9px] border border-[#674322]/70 bg-[#3b2818]/80 p-4 sm:p-5">
              <div className="mb-5">
                <p className="text-[7px] uppercase tracking-[0.2em] text-[#f6d39a]">
                  Library Filters
                </p>

                <h2 className="mt-1 text-base font-semibold text-white">
                  Browse the Collection
                </h2>

                <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-[#c5e6af]">
                  {filteredMovies.length.toLocaleString("en-IN")}{" "}
                  {filteredMovies.length === 1 ? "movie" : "movies"} in
                  this selection
                </p>
              </div>

              <form
                method="GET"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"
              >
                {/* Year */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="year"
                    className="text-[8px] uppercase tracking-[0.14em] text-white"
                  >
                    Year
                  </label>

                  <select
                    id="year"
                    name="year"
                    defaultValue={selectedYear ?? ""}
                    className="w-full rounded-md border border-[#795331] bg-black px-3 py-2.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#fff0da] outline-none transition focus:border-[#f2ce91]"
                  >
                    <option value="">All Years</option>

                    {availableYears.map((availableYear) => (
                      <option key={availableYear} value={availableYear}>
                        {availableYear}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actor */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="actor"
                    className="text-[8px] uppercase tracking-[0.14em] text-white"
                  >
                    Lead Actor
                  </label>

                  <select
                    id="actor"
                    name="actor"
                    defaultValue={selectedActorId ?? ""}
                    className="w-full rounded-md border border-[#795331] bg-black px-3 py-2.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#fff0da] outline-none transition focus:border-[#f2ce91]"
                  >
                    <option value="">All Lead Actors</option>

                    {actors.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Apply */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-md border border-[#f0cc91]/50 bg-zinc-400 px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-black transition hover:border-[#f5d8a4] hover:bg-[#e0b578]/35"
                  >
                    Apply Filters
                  </button>
                </div>

                {/* Reset */}
                {(selectedYear || selectedActorId) && (
                  <div className="flex items-end">
                    <Link
                      href={`/preview/movies/library/${parsedLanguageId}`}
                      className="w-full rounded-md border border-[#a17c53]/70 bg-[#271a10]/60 px-4 py-2.5 text-center text-[8px] font-medium uppercase tracking-[0.12em] text-[#e2c9a8] transition hover:bg-[#271a10]"
                    >
                      Reset
                    </Link>
                  </div>
                )}
              </form>

              {/* Active filter summary */}
              {(selectedYear || selectedActor) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#e3c092]/25 pt-4">
                  <span className="text-[7px] uppercase tracking-[0.16em] text-[#e0c7a6]">
                    Active:
                  </span>

                  {selectedYear && (
                    <span className="rounded-full border border-[#f1ce91]/40 bg-[#3c2818]/60 px-2.5 py-1 text-[7px] uppercase tracking-[0.1em] text-[#ffe1a8]">
                      {selectedYear}
                    </span>
                  )}

                  {selectedActor && (
                    <span className="rounded-full border border-[#d6b0ef]/40 bg-[#3c2818]/60 px-2.5 py-1 text-[7px] uppercase tracking-[0.1em] text-[#e6c8ff]">
                      {selectedActor.full_name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Movie shelf */}
          <section className="mt-7">
            <div className="rounded-2xl border border-[#624326] bg-[#21150c] p-3 shadow-2xl sm:p-5">
              {/* Top shelf */}
              <div className="mb-5 h-2 rounded-full border border-[#795331] bg-gradient-to-b from-[#9b7045] to-[#4a301a] shadow-[0_4px_14px_rgba(0,0,0,0.7)]" />

              {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                  {filteredMovies.map((movie) => (
                    <Link
                      key={movie.id}
                      href={`/preview/movies/${movie.id}`}
                      className="group relative overflow-hidden rounded-lg border border-[#76502e] bg-gradient-to-b from-[#50351f] via-[#382417] to-[#21140c] p-1.5 shadow-[0_5px_12px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:border-[#d6a765] hover:shadow-[0_14px_30px_rgba(0,0,0,0.6)]"
                    >
                      {/* Wooden side spine */}
                      <div className="pointer-events-none absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#c1945c] via-[#704725] to-[#9b6a38] opacity-90" />

                      {/* Poster */}
                      <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-[#b18a5c]/25 bg-[#302014]">
                        {movie.poster_url ? (
                          <img
                            src={movie.poster_url}
                            alt={`${movie.title} poster`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#60452b] to-[#28190f] px-2 text-center">
                            <span className="text-[7px] uppercase tracking-[0.1em] text-[#e0c49c]">
                              JMI
                            </span>
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70" />
                      </div>

                      {/* Movie title */}
                      <div className="px-1 pb-1.5 pt-2">
                        <p className="line-clamp-2 text-[8px] font-medium leading-3 text-[#f0dfc7] transition group-hover:text-[#ffe09b] sm:text-[9px] sm:leading-3.5">
                          {movie.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#624326] bg-[#302014] px-5 py-16 text-center">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#e0c49c]">
                    No Movies Found
                  </p>

                  <p className="mt-2 text-[10px] text-[#c5b39d]">
                    There are no movies available for the selected filters
                    in this language.
                  </p>

                  {(selectedYear || selectedActorId) && (
                    <Link
                      href={`/preview/movies/library/${parsedLanguageId}`}
                      className="mt-5 inline-flex items-center rounded-md border border-[#d6a765]/50 bg-[#50351f] px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#ffe1a8] transition hover:border-[#f5d8a4]"
                    >
                      Show All Movies
                    </Link>
                  )}
                </div>
              )}

              {/* Bottom shelf */}
              <div className="mt-5 h-3 rounded-full border border-[#795331] bg-gradient-to-b from-[#9b7045] via-[#624022] to-[#382315] shadow-[0_7px_18px_rgba(0,0,0,0.8)]" />
            </div>
          </section>

          {/* Bottom navigation */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-6 sm:flex-row">
            <p className="text-center text-[8px] uppercase tracking-[0.14em] text-zinc-400 sm:text-left">
              JMI Movie Library · {language.name} Cinema
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/preview/movies/library"
                className="text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-500 transition hover:text-white"
              >
                All Languages
              </Link>

              <Link
                href="/"
                className="text-[8px] font-medium uppercase tracking-[0.14em] text-yellow-500/80 transition hover:text-yellow-300"
              >
                Back to JMI
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}