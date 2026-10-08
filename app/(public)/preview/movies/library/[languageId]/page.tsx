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
      <div className="min-h-screen bg-[#090705] text-white">
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

          {/* Header */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-[#3b2818] bg-[#120d08] shadow-2xl">
            {/* Wooden horizontal bands */}
            <div className="pointer-events-none absolute inset-0 opacity-50">
              <div className="absolute inset-x-0 top-[18%] h-px bg-[#5a3b21]" />
              <div className="absolute inset-x-0 top-[38%] h-px bg-[#2c1d12]" />
              <div className="absolute inset-x-0 top-[58%] h-px bg-[#4b321d]" />
              <div className="absolute inset-x-0 top-[78%] h-px bg-[#291b11]" />
              <div className="absolute inset-x-0 top-[90%] h-px bg-[#4a301b]" />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.10),transparent_44%)]" />

            <div className="relative px-5 py-9 text-center sm:px-8 sm:py-12">
              <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-yellow-500/80">
                JMI Movie Library
              </p>

              <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                {language.name} Cinema
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-[10px] leading-5 text-zinc-400 sm:text-[11px]">
                Explore the JMI collection of movies associated
                with the {language.name} language.
              </p>

              <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#6b4525] to-transparent" />

                <span className="text-[7px] uppercase tracking-[0.2em] text-green-500">
                  Cinema Archive
                </span>

                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#6b4525] to-transparent" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-7 rounded-xl border border-[#3b2818] bg-[#0e0906] p-4 shadow-xl sm:p-5">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[7px] uppercase tracking-[0.2em] text-yellow-500/80">
                  Library Filters
                </p>

                <h2 className="mt-1 text-base font-semibold text-white">
                  Browse the Collection
                </h2>

                <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-green-500">
                  {filteredMovies.length.toLocaleString("en-IN")}{" "}
                  {filteredMovies.length === 1
                    ? "movie"
                    : "movies"}{" "}
                  in this selection
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
                    className="text-[8px] uppercase tracking-[0.14em] text-pink-400"
                  >
                    Year
                  </label>

                  <select
                    id="year"
                    name="year"
                    defaultValue={selectedYear ?? ""}
                    className="w-full rounded-md border border-[#4a301b] bg-[#160d08] px-3 py-2.5 text-[9px] font-medium uppercase tracking-[0.08em] text-zinc-300 outline-none transition focus:border-yellow-500/40"
                  >
                    <option value="">
                      All Years
                    </option>

                    {availableYears.map((availableYear) => (
                      <option
                        key={availableYear}
                        value={availableYear}
                      >
                        {availableYear}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actor */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="actor"
                    className="text-[8px] uppercase tracking-[0.14em] text-pink-400"
                  >
                    Lead Actor
                  </label>

                  <select
                    id="actor"
                    name="actor"
                    defaultValue={selectedActorId ?? ""}
                    className="w-full rounded-md border border-[#4a301b] bg-[#160d08] px-3 py-2.5 text-[9px] font-medium uppercase tracking-[0.08em] text-zinc-300 outline-none transition focus:border-yellow-500/40"
                  >
                    <option value="">
                      All Lead Actors
                    </option>

                    {actors.map((person) => (
                      <option
                        key={person.id}
                        value={person.id}
                      >
                        {person.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Apply */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-md border border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-yellow-400 transition hover:border-yellow-500/40 hover:bg-yellow-500/[0.10]"
                  >
                    Apply Filters
                  </button>
                </div>

                {/* Reset */}
                {(selectedYear || selectedActorId) && (
                  <div className="flex items-end">
                    <Link
                      href={`/preview/movies/library/${parsedLanguageId}`}
                      className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-center text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-500 transition hover:text-white"
                    >
                      Reset
                    </Link>
                  </div>
                )}
              </form>

              {/* Active filter summary */}
              {(selectedYear || selectedActor) && (
                <div className="flex flex-wrap items-center gap-2 border-t border-[#2b1c11] pt-4">
                  <span className="text-[7px] uppercase tracking-[0.16em] text-zinc-600">
                    Active:
                  </span>

                  {selectedYear && (
                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/[0.05] px-2.5 py-1 text-[7px] uppercase tracking-[0.1em] text-yellow-400">
                      {selectedYear}
                    </span>
                  )}

                  {selectedActor && (
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/[0.05] px-2.5 py-1 text-[7px] uppercase tracking-[0.1em] text-violet-400">
                      {selectedActor.full_name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Movie shelf */}
          <section className="mt-7">
            <div className="rounded-2xl border border-[#3b2818] bg-[#0e0906] p-3 shadow-2xl sm:p-5">
              {/* Top shelf */}
              <div className="mb-5 h-2 rounded-full border border-[#5c3c21] bg-gradient-to-b from-[#6b4525] to-[#291b11] shadow-[0_4px_14px_rgba(0,0,0,0.7)]" />

              {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                  {filteredMovies.map((movie) => (
                    <Link
                      key={movie.id}
                      href={`/preview/movies/${movie.id}`}
                      className="group relative overflow-hidden rounded-lg border border-[#4a301b] bg-gradient-to-b from-[#24160d] to-[#0b0704] p-1.5 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-yellow-500/40 hover:shadow-[0_14px_30px_rgba(0,0,0,0.6)]"
                    >
                      {/* Wooden side spine */}
                      <div className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-[#7b542c] via-[#3b2515] to-[#704a26] opacity-80" />

                      {/* Poster */}
                      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-black">
                        {movie.poster_url ? (
                          <img
                            src={movie.poster_url}
                            alt={`${movie.title} poster`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#120d08] px-2 text-center">
                            <span className="text-[7px] uppercase tracking-[0.1em] text-zinc-700">
                              JMI
                            </span>
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />
                      </div>

                      {/* Movie title */}
                      <div className="px-1 pb-1.5 pt-2">
                        <p className="line-clamp-2 text-[8px] font-medium leading-3 text-zinc-300 transition group-hover:text-yellow-300 sm:text-[9px] sm:leading-3.5">
                          {movie.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#3b2818] bg-[#120d08] px-5 py-16 text-center">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                    No Movies Found
                  </p>

                  <p className="mt-2 text-[10px] text-zinc-500">
                    There are no movies available for the
                    selected filters in this language.
                  </p>

                  {(selectedYear || selectedActorId) && (
                    <Link
                      href={`/preview/movies/library/${parsedLanguageId}`}
                      className="mt-5 inline-flex items-center rounded-md border border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-yellow-400 transition hover:border-yellow-500/40"
                    >
                      Show All Movies
                    </Link>
                  )}
                </div>
              )}

              {/* Bottom shelf */}
              <div className="mt-5 h-3 rounded-full border border-[#5c3c21] bg-gradient-to-b from-[#704a27] via-[#3c2515] to-[#21140c] shadow-[0_7px_18px_rgba(0,0,0,0.8)]" />
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