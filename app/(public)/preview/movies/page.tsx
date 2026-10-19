import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import { supabase } from "@/lib/supabase";
import MovieSearch from "../../components/MovieSearch";
import MoviesPageBanner from "../../components/MoviesPageBanner";
import MoviesHistoricalRecordsBanner from "../../components/MoviesHistoricalRecordsBanner";

type Props = {
  searchParams: Promise<{
    q?: string;
    filter?: string;
  }>;
};

type MovieLanguage = {
  language_id: number;
  language_type: string | null;
  is_primary: boolean | null;
  languages:
    | {
        name: string;
        native_name: string | null;
      }
    | {
        name: string;
        native_name: string | null;
      }[]
    | null;
};

type MovieGenre = {
  genre_id: number;
  genres:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

type Movie = {
  id: number;
  title: string;
  release_year: number | null;
  release_date: string | null;
  poster_url: string | null;
  is_active: boolean | null;

  movie_languages: MovieLanguage[];
  movie_genres: MovieGenre[];
};

function getPrimaryLanguage(movie: Movie) {
  const item =
    movie.movie_languages?.find(
      (language) => language.is_primary === true
    ) ?? movie.movie_languages?.[0];

  if (!item?.languages) return "—";

  if (Array.isArray(item.languages)) {
    return item.languages[0]?.name ?? "—";
  }

  return item.languages.name ?? "—";
}

function getGenres(movie: Movie) {
  return (
    movie.movie_genres
      ?.map((item) => {
        if (!item.genres) return null;

        if (Array.isArray(item.genres)) {
          return item.genres[0]?.name ?? null;
        }

        return item.genres.name ?? null;
      })
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

function getMovieStatus(
  releaseDate: string | null
) {
  if (!releaseDate) return "Release Date TBA";

  const today = new Date();
  const release = new Date(`${releaseDate}T00:00:00`);

  if (release > today) {
    return "Upcoming";
  }

  return "Released";
}

function getFilterLabel(filter: string) {
  if (filter === "upcoming") return "Upcoming";
  if (filter === "2026") return "2026";
  if (filter === "2025") return "2025";
  if (filter === "malayalam") return "Malayalam";
  if (filter === "telugu") return "Telugu";
  if (filter === "tamil") return "Tamil";
  if (filter === "kannada") return "Kannada";

  return "Latest";
}

export default async function MoviesPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const searchQuery = params.q?.trim() ?? "";
  const activeFilter = params.filter ?? "latest";

  let query = supabase
    .from("movies")
    .select(`
      id,
      title,
      release_year,
      release_date,
      poster_url,
      is_active,
      movie_languages!inner (
  language_id,
  language_type,
  is_primary,
  languages!inner (
    name,
    native_name
  )
),
      movie_genres (
        genre_id,
        genres (
          name
        )
      )
    `)
    .eq("is_active", true)
.eq("movie_languages.is_primary", true);



  /* =========================================================
     SEARCH
  ========================================================= */


  if (searchQuery) {
  const safeSearch = searchQuery
    .replace(/[%_,]/g, " ")
    .trim();

  if (safeSearch) {
    query = query.or(
      `title.ilike.%${safeSearch}%,original_title.ilike.%${safeSearch}%,slug.ilike.%${safeSearch}%`
    );
  }

  
}

  /* =========================================================
     FILTERS
  ========================================================= */

  if (activeFilter === "upcoming") {
    query = query
      .not("release_date", "is", null)
      .gt(
        "release_date",
        new Date().toISOString().split("T")[0]
      );
  }

  if (
    activeFilter === "2026" ||
    activeFilter === "2025"
  ) {
    query = query.eq(
      "release_year",
      Number(activeFilter)
    );
  }

 if (activeFilter === "malayalam") {
  query = query.eq(
    "movie_languages.languages.name",
    "Malayalam"
  );
}

  if (activeFilter === "telugu") {
    query = query.eq(
      "movie_languages.languages.name",
      "Telugu"
    );
  }

  if (activeFilter === "tamil") {
    query = query.eq(
      "movie_languages.languages.name",
      "Tamil"
    );
  }

  if (activeFilter === "kannada") {
    query = query.eq(
      "movie_languages.languages.name",
      "Kannada"
    );
  }

  if (activeFilter === "upcoming") {
    query = query.order(
      "release_date",
      { ascending: true }
    );
  } else {
    query = query.order(
      "release_date",
      { ascending: false }
    );
  }

  const { data: movies, error } = await query;

  if (error) {
    console.error("JMI Movies Error:", error);
  }

  /* =========================================================
     DATABASE SNAPSHOT
  ========================================================= */

  const { count: movieCount } = await supabase
    .from("movies")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("is_active", true);

  const { count: languageCount } = await supabase
    .from("languages")
    .select("id", {
      count: "exact",
      head: true,
    });

  const { count: industryCount } = await supabase
    .from("industries")
    .select("id", {
      count: "exact",
      head: true,
    });

  const resultMovies = (movies ?? []) as Movie[];

  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      

 <main>
<div className="mx-auto max-w-6xl px-5 pt-5 sm:px-6 lg:px-8">
  <Link
    href="/"
    className="inline-flex items-center gap-1 text-[9px] font-medium tracking-[0.16em] text-violet-400 transition hover:text-violet-400"
  >
    <span>←</span>
    <span>Back to Home</span>
  </Link>
</div>
        

        {/* =====================================================
            MOVIES HERO
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="max-w-3xl">

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-yellow-400">
                JMI Movies
              </p>

              <h1 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-3xl">
                The Indian movie database.
              </h1>

              <p className="mt-3 max-w-2xl text-[11px] leading-5 text-zinc-400 sm:text-xs">
                Explore movies across languages, industries, years and
                genres — with the structured intelligence behind every film.
              </p>

            </div>

            {/* =================================================
    MOVIES PAGE BANNER
================================================= */}


<MoviesPageBanner/>

            {/* =================================================
                SEARCH
            ================================================= */}

           <div className="mt-7">
  <MovieSearch initialQuery={searchQuery} />
</div>

            {searchQuery && (
              <div className="mt-3 flex items-center gap-2">

                <p className="text-[9px] text-zinc-600">
                  Search results for
                </p>

                <span className="text-[9px] text-violet-400">
                  “{searchQuery}”
                </span>

                <Link
                  href="/preview/movies"
                  className="text-[9px] text-zinc-700 transition hover:text-zinc-400"
                >
                  Clear
                </Link>

              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            DATABASE SNAPSHOT
        ===================================================== */}

        <section className="border-b border-zinc-600">

          <div className="mx-auto max-w-4xl px-6 py-5 sm:px-6 lg:px-8">

            <div className="overflow-hidden rounded-lg border border-[#765137]/80 bg-gradient-to-br from-[#49301f] via-[#2d1d14] to-[#1b110b] shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(220,180,130,0.12)]">

              <div className="grid grid-cols-3 divide-x divide-zinc-800">

                <MovieStat
                  value={String(movieCount ?? 0).padStart(2, "0")}
                  label="Movies"
                />

                <MovieStat
                  value={String(languageCount ?? 0).padStart(2, "0")}
                  label="Languages"
                />

                <MovieStat
                  value={String(industryCount ?? 0).padStart(2, "0")}
                  label="Industries"
                />

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            DISCOVERY
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="flex items-end justify-between">

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  Discover
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-pink-400">
                  Explore Indian cinema.
                </h2>

                <p className="mt-1 text-[9px] text-zinc-400">
  {resultMovies.length} movie
  {resultMovies.length === 1 ? "" : "s"}
  {searchQuery
    ? ` · Search: ${searchQuery}`
    : ` · ${getFilterLabel(activeFilter)}`}
</p>

              </div>

            </div>

            {/* =================================================
                FILTER CHIPS
            ================================================= */}

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">

              <FilterChip
                label="Latest"
                filter="latest"
                active={activeFilter === "latest"}
                searchQuery={searchQuery}
              />

              <FilterChip
                label="Upcoming"
                filter="upcoming"
                active={activeFilter === "upcoming"}
                searchQuery={searchQuery}
              />

              <FilterChip
                label="2026"
                filter="2026"
                active={activeFilter === "2026"}
                searchQuery={searchQuery}
              />

              <FilterChip
                label="2025"
                filter="2025"
                active={activeFilter === "2025"}
                searchQuery={searchQuery}
              />

              <FilterChip
                label="Malayalam"
                filter="malayalam"
                active={activeFilter === "malayalam"}
                searchQuery={searchQuery}
              />

              <FilterChip
                label="Telugu"
                filter="telugu"
                active={activeFilter === "telugu"}
                searchQuery={searchQuery}
              />

              <FilterChip
                label="Tamil"
                filter="tamil"
                active={activeFilter === "tamil"}
                searchQuery={searchQuery}
              />

              <FilterChip
                label="Kannada"
                filter="kannada"
                active={activeFilter === "kannada"}
                searchQuery={searchQuery}
              />

            </div>

            {/* =================================================
                MOVIE RESULTS
            ================================================= */}

            {resultMovies.length === 0 ? (
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-10 text-center">

                <p className="text-sm text-zinc-400">
                  No movies found.
                </p>

                <p className="mt-2 text-[9px] text-zinc-700">
                  Try another movie title, year or language.
                </p>

                <Link
                  href="/preview/movies"
                  className="mt-4 inline-flex rounded-md border border-zinc-800 px-4 py-2 text-[9px] text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-300"
                >
                  Reset Discovery
                </Link>

              </div>
            ) : (
              <div className="mt-6 grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-9">

                {resultMovies.map((movie) => {

                  const primaryLanguage =
                    getPrimaryLanguage(movie);

                  const movieGenres =
                    getGenres(movie);

                  const status =
                    getMovieStatus(movie.release_date);

                  return (
                    <MovieCard
                      key={movie.id}
                      movieId={movie.id}
                      title={movie.title}
                      year={String(
                        movie.release_year ?? "—"
                      )}
                      language={primaryLanguage}
                      genre={movieGenres}
                      status={status}
                      posterUrl={movie.poster_url}
                    />
                  );
                })}

              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            MOVIE INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-500">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  Movie Intelligence
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  Every movie tells a bigger story.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-400">
                  JMI connects movie information with people, companies,
                  box office performance, markets and historical context
                  to create a deeper understanding of every film.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <IntelligenceTile
                    icon="💰"
                    title="Box Office"
                  />

                  <IntelligenceTile
                    icon="👥"
                    title="People"
                  />

                  <IntelligenceTile
                    icon="🏢"
                    title="Companies"
                  />

                  <IntelligenceTile
                    icon="📈"
                    title="Markets"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>



        {/* =====================================================
            HISTORICAL RECORDS
        ===================================================== */}

        <section
  id="historical-records"
  className="border-b border-zinc-800"
>
    

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-green-400">
              Historical Records
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              The records behind Indian cinema.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-400">
              Explore landmark performances, industry milestones and
              records that have shaped the history of Indian cinema.
            </p>



            {/* =================================================
                HISTORICAL RECORDS BANNER
            ================================================= */}

            <MoviesHistoricalRecordsBanner/>



            {/* =================================================
                HISTORICAL RECORDS
            ================================================= */}

            <div className="mt-6 grid gap-2 sm:grid-cols-3">

              <RecordCard
                number="01"
                title="Highest Grossing Movies"
                description="Explore India's biggest theatrical performances."
                href="/preview/records/highest-grossing"
              />

              <RecordCard
                number="02"
                title="Industry Wise Records"
                description="Historic milestones across individual industries."
                href="/preview/records/industry-wise"
              />

            </div>

          </div>

        </section>

        {/* =====================================================
            FUTURE DATABASE
        ===================================================== */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                JMI Database
              </p>

              <h2 className="mt-2 text-lg font-medium text-green-500">
                A database that keeps growing.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-400">
                JMI is continuously expanding its movie database across
                languages, industries, markets and generations of Indian cinema & a new data is added on each single hour.</p>

              <div className="mt-5 flex items-center gap-3">

                <span className="h-px w-8 bg-violet-400/50" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-violet-500">
                  More intelligence coming
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-zinc-900">

        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <p className="font-serif text-sm text-zinc-300">
              Jeruto{" "}
              <span className="text-yellow-400">
                Movie Intelligence
              </span>
            </p>

            <p className="text-[9px] text-zinc-700">
              JMI · Indian Movie Intelligence
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}


/* ============================================================
   MOVIE STAT — WEATHERED WOOD WALL PLAQUE
============================================================ */

function MovieStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      className="
        group
        relative
        isolate
        overflow-hidden
        border-r
        border-[#21140d]/80
        bg-gradient-to-br
        from-[#765137]
        via-[#49301f]
        to-[#24160e]
        px-3
        py-5
        shadow-[inset_0_1px_0_rgba(220,180,130,0.12),inset_0_-3px_5px_rgba(0,0,0,0.35)]
        transition-all
        duration-300
        hover:brightness-110
        sm:px-5
        sm:py-6
      "
    >
      {/* WEATHERED WOOD GRAIN */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              2deg,
              transparent 0px,
              transparent 8px,
              rgba(207, 158, 106, 0.13) 9px,
              rgba(25, 14, 8, 0.20) 10px,
              transparent 12px,
              transparent 19px
            ),
            repeating-linear-gradient(
              178deg,
              transparent 0px,
              transparent 27px,
              rgba(20, 11, 6, 0.18) 28px,
              transparent 30px,
              transparent 39px
            ),
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.30),
              transparent 20%,
              rgba(208, 156, 100, 0.08) 50%,
              transparent 78%,
              rgba(0, 0, 0, 0.25)
            )
          `,
        }}
      />

      {/* SMALL CRACKS IN THE WOOD */}

      <div className="pointer-events-none absolute left-[15%] top-0 h-4 w-px rotate-[18deg] bg-[#d1a477]/35" />

      <div className="pointer-events-none absolute right-[20%] top-[35%] h-3 w-px -rotate-[25deg] bg-black/40" />

      <div className="pointer-events-none absolute bottom-[12%] left-[45%] h-px w-6 rotate-[-8deg] bg-[#d1a477]/25" />

      {/* WORN WOOD EDGES */}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-b from-[#a98054]/70 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[4px] bg-gradient-to-t from-[#130b06] via-[#2c1a10] to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-[#160d07] to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 right-0 w-[3px] bg-gradient-to-l from-[#160d07] to-transparent" />

      {/* WOODEN NAIL — TOP LEFT */}

      <div className="pointer-events-none absolute left-2 top-2 z-20 flex h-[9px] w-[9px] items-center justify-center rounded-full border border-[#c1a17a]/50 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:left-3 sm:top-3">

        <span className="h-[3px] w-[3px] rounded-full bg-[#160d08] shadow-[0_1px_1px_rgba(255,220,170,0.35)]" />

      </div>

      {/* WOODEN NAIL — TOP RIGHT */}

      <div className="pointer-events-none absolute right-2 top-2 z-20 flex h-[9px] w-[9px] items-center justify-center rounded-full border border-[#c1a17a]/50 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:right-3 sm:top-3">

        <span className="h-[3px] w-[3px] rounded-full bg-[#160d08] shadow-[0_1px_1px_rgba(255,220,170,0.35)]" />

      </div>

      {/* STAT CONTENT */}

      <div className="relative z-10">

        {/* VALUE */}

        <p
          className="
            text-xl
            font-semibold
            tracking-[-0.04em]
            text-[#f0d1a7]
            drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
            transition-colors
            duration-300
            group-hover:text-[#ffe2ba]
            sm:text-2xl
          "
        >
          {value}
        </p>

        {/* LABEL */}

        <p
          className="
            mt-1.5
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-[#d1b394]
            drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]
            sm:text-[9px]
          "
        >
          {label}
        </p>

        {/* WEATHERED ENGRAVED ACCENT */}

        <div className="mt-3 h-[2px] w-7 bg-gradient-to-r from-[#c19a6c]/80 via-[#8b6440]/40 to-transparent shadow-[0_1px_1px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:w-12" />

      </div>

      {/* WORN CORNERS */}

      <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 bg-gradient-to-tr from-[#100904]/80 to-transparent" />

      <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 bg-gradient-to-bl from-[#a47b50]/30 to-transparent" />

    </div>
  );
}

/* ============================================================
   FILTER CHIP
============================================================ */

function FilterChip({
  label,
  filter,
  active = false,
  searchQuery,
}: {
  label: string;
  filter: string;
  active?: boolean;
  searchQuery: string;
}) {
  const params = new URLSearchParams();

  params.set("filter", filter);

  if (searchQuery) {
    params.set("q", searchQuery);
  }

  return (
    <Link
      href={`/preview/movies?${params.toString()}`}
      className={`
        flex-shrink-0
        rounded-md
        border
        px-3
        py-1.5
        text-[10px]
        transition-all
        ${
          active
            ? "border-violet-400/30 bg-violet-400/[0.08] text-violet-300"
            : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-violet-400/20 hover:text-zinc-400"
        }
      `}
    >
      {label}
    </Link>
  );
}

/* ============================================================
   MOVIE CARD — PREMIUM DVD CASE COLLECTION
============================================================ */

function MovieCard({
  movieId,
  title,
  year,
  language,
  genre,
  status,
  posterUrl,
}: {
  movieId: number;
  title: string;
  year: string;
  language: string;
  genre: string;
  status: string;
  posterUrl?: string | null;
}) {
  return (
    <Link
      href={`/preview/movies/${movieId}`}
      className="
  group
  relative
  block
  min-w-0
  max-w-[260px]

  overflow-hidden
  rounded-md
  border
  border-[#765137]
bg-gradient-to-br
from-[#68472f]
via-[#49301f]
to-[#2b1b12]
  shadow-[0_5px_14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(220,180,130,0.15)]
  transition-all
  duration-300
  hover:-translate-y-1
  hover:border-[#a67c52]
  hover:shadow-[0_12px_30px_rgba(0,0,0,0.65),0_0_18px_rgba(139,92,246,0.10)]
  active:scale-[0.99]
"
    >

      {/* REALISTIC WALNUT WOOD TEXTURE */}

<div
  aria-hidden="true"
  className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-md opacity-80 transition-opacity duration-300 group-hover:opacity-100"
>
  {/* Natural wood grain */}
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `
        repeating-linear-gradient(
          3deg,
          transparent 0px,
          transparent 8px,
          rgba(190, 139, 91, 0.16) 9px,
          rgba(30, 17, 10, 0.12) 10px,
          transparent 12px,
          transparent 21px
        ),
        repeating-linear-gradient(
          177deg,
          transparent 0px,
          transparent 27px,
          rgba(215, 169, 118, 0.10) 28px,
          transparent 30px,
          transparent 43px
        ),
        linear-gradient(
          90deg,
          rgba(0, 0, 0, 0.22),
          transparent 15%,
          rgba(210, 158, 105, 0.08) 48%,
          transparent 78%,
          rgba(0, 0, 0, 0.18)
        )
      `,
    }}
  />

  {/* Fine scratches */}
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `
        linear-gradient(
          112deg,
          transparent 0%,
          transparent 23%,
          rgba(230, 194, 153, 0.22) 23.08%,
          transparent 23.18%,
          transparent 100%
        ),
        linear-gradient(
          167deg,
          transparent 0%,
          transparent 57%,
          rgba(235, 204, 167, 0.16) 57.08%,
          transparent 57.18%,
          transparent 100%
        )
      `,
    }}
  />

  {/* Small edge scuffs */}
  <div className="absolute left-[4px] top-[17%] h-4 w-px rotate-[8deg] bg-[#d5b18a]/30" />

  <div className="absolute right-[5px] top-[38%] h-3 w-px -rotate-[12deg] bg-[#d5b18a]/25" />

  <div className="absolute bottom-[13%] left-[15%] h-px w-5 rotate-[-6deg] bg-[#d5b18a]/25" />

  {/* Warm, worn corners */}
  <div className="absolute left-0 top-0 h-7 w-7 bg-gradient-to-br from-[#c39a6c]/15 to-transparent" />

  <div className="absolute bottom-0 right-0 h-8 w-8 bg-gradient-to-tl from-black/25 to-transparent" />
</div>

      {/* PHYSICAL CASE BODY */}

      <div className="relative p-1">

        {/* TOP PLASTIC EDGE */}

        <div className="pointer-events-none absolute inset-x-2 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* POSTER CASE */}

        <div className="relative overflow-hidden rounded-[1px] border border-[#68503a]/50 bg-gradient-to-br from-[#21170f] via-[#100d0a] to-black p-[3px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">

          {/* INNER POSTER FRAME */}

          <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">

            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`${title} poster`}
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-[1.035]
                "
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 via-black to-zinc-950">

                <span className="text-4xl text-zinc-800 transition-colors duration-300 group-hover:text-violet-400/50">
                  ◈
                </span>

                <span className="px-2 text-center text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  Poster unavailable
                </span>

              </div>
            )}

            {/* GLOSSY PLASTIC REFLECTION */}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-80" />

            {/* CASE EDGE SHADING */}

            <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent" />

           

            {/* RELEASE YEAR */}

            <div className="absolute bottom-2 right-2">


            </div>

          </div>

        </div>

        {/* SPINE-LIKE CASE EDGE */}

        <div className="pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-l-sm bg-gradient-to-b from-[#927456]/70 via-[#302318] to-[#100c09]" />

        {/* MOVIE INFORMATION — CASE LABEL */}

        <div className="px-2 pb-2 pt-1 sm:px-2.5">

          {/* COLLECTION LABEL */}

          <div className="mb-1 flex items-center justify-between gap-2">

           

            <span className="h-px w-5 bg-violet-400/40" />

          </div>

          {/* TITLE */}

          <h3
            className="
              line-clamp-2
              min-h-0
              text-[9px]
              font-normal
              leading-4
              tracking-[-0.02em]
              text-zinc-300
              transition-colors
              duration-300
              group-hover:text-white
              sm:text-xs
            "
            title={title}
          >
            {title}
          </h3>

          {/* LANGUAGE AND YEAR */}

          <div className="mt-0 flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-1.5">

           
           

          </div>

          {/* GENRE */}

         
        </div>

      </div>

      {/* BOTTOM CASE EDGE */}

      <div className="pointer-events-none h-[2px] bg-gradient-to-r from-[#3a2417] via-[#98704a] to-[#352116]" />

      {/* SUBTLE HOVER ACCENT */}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    </Link>
  );
}


/* ============================================================
   INTELLIGENCE TILE
============================================================ */

function IntelligenceTile({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-violet-400 bg-black/60 px-3 py-3">

      <span className="text-xlg text-violet-400/70">
        {icon}
      </span>

      <p className="mt-2 text-[10px] font-medium text-pink-400">
        {title}
      </p>

    </div>
  );
}


/* ============================================================
   RECORD CARD
============================================================ */

function RecordCard({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4">

      {/* NUMBER */}

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-400 bg-black text-[8px] font-medium tracking-[0.16em] text-violet-400 transition-colors duration-300 group-hover:border-violet-400/30 group-hover:text-violet-300">
        {number}
      </div>


      {/* CONTENT */}

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <span className="h-1.5 w-1.5 rounded-full bg-violet-400/70 transition-all duration-300 group-hover:bg-violet-300 group-hover:shadow-[0_0_8px_rgba(167,139,250,0.7)]" />

          <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-zinc-400 group-hover:text-violet-400/70">
            JMI Records
          </span>

        </div>

        <h3 className="mt-1.5 truncate text-[12px] font-medium tracking-[-0.015em] text-pink-400 transition-colors duration-300 group-hover:text-white sm:text-[13px]">
          {title}
        </h3>

        <p className="mt-0.5 truncate text-[8px] text-zinc-500 transition-colors duration-300 group-hover:text-zinc-500">
          {description}
        </p>

      </div>


      {/* ARROW */}

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-pink-400 text-[12px] text-pink-400 transition-all duration-300 group-hover:border-violet-400/40 group-hover:bg-violet-400/[0.06] group-hover:text-violet-300 group-hover:translate-x-0.5">
        →
      </div>

    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="
          group
          relative
          block
          overflow-hidden
          rounded-xl
          border
          border-zinc-500
          bg-zinc-950
          px-4
          py-3.5
          transition-all
          duration-300
          hover:border-violet-400/30
          hover:bg-zinc-900/70
          active:scale-[0.99]
          sm:px-5
          sm:py-4
        "
      >

        {/* SUBTLE LIGHT SWEEP */}

        <div className="pointer-events-none absolute inset-y-0 -left-24 w-24 bg-gradient-to-r from-transparent via-violet-400/[0.05] to-transparent skew-x-[-20deg] transition-all duration-700 group-hover:left-[110%]" />

        {/* TOP ACCENT */}

        <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative">
          {content}
        </div>

      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3.5 sm:px-5 sm:py-4">
      {content}
    </div>
  );
}