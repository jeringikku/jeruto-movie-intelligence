import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import { supabase } from "@/lib/supabase";
import MovieSearch from "../../components/MovieSearch";
import MoviesPageBanner from "../../components/MoviesPageBanner";

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
    href="/preview"
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

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="overflow-hidden rounded-xl border border-violet-500/50 bg-zinc-950">

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

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
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
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

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

        <section className="border-b border-zinc-800">

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

            <div className="mt-6 grid gap-2 sm:grid-cols-3 border=violet-400">

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
                languages, industries, markets and generations of Indian cinema & a new data is added on each single hour. JMI currently process around 2 Terabytes of data on each single second on its intelligence engine.
              </p>

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
   MOVIE STAT
============================================================ */

function MovieStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="px-3 py-4 sm:px-5 sm:py-5">

      <p className="text-lg font-medium tracking-[-0.03em] text-violet-400 sm:text-xl">
        {value}
      </p>

      <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-400">
        {label}
      </p>

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
        text-[9px]
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
   MOVIE CARD
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
        overflow-hidden
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        p-4
        transition-all
        duration-300
        hover:border-violet-400/25
        hover:bg-zinc-900/70
        active:scale-[0.99]
      "
    >

      <div className="flex gap-3">

        <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-black transition-colors group-hover:border-violet-400/20">

          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${title} poster`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[15px] text-zinc-800 transition-colors group-hover:text-violet-400/40">
              ◈
            </span>
          )}

        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-2">

            <h3 className="truncate text-[12px] font-medium text-zinc-200 group-hover:text-white">
              {title}
            </h3>

            <span className="flex-shrink-0 text-[8px] text-yellow-500">
              {year}
            </span>

          </div>

          <p className="mt-1 text-[9px] text-violet-400/70">
            {language}
          </p>

          <p className="mt-1 text-[8px] text-zinc-400">
            {genre}
          </p>

          <div className="mt-3 flex items-center gap-2">

            <span
              className={`h-1 w-1 rounded-full ${
                status === "Upcoming"
                  ? "bg-yellow-400/70"
                  : "bg-violet-400/60"
              }`}
            />

            <span className="text-[8px] text-zinc-400">
              {status}
            </span>

          </div>

        </div>

      </div>

      <span
        className="
          absolute
          bottom-3
          right-3
          text-[10px]
          text-zinc-800
          transition-all
          duration-300
          group-hover:translate-x-0.5
          group-hover:text-violet-400
        "
      >
        ↗️
      </span>

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
    <>
      <div className="text-[8px] tracking-[0.2em] text-green-500">
        {number}
      </div>

      <h3 className="mt-5 text-[12px] font-medium text-yellow-400">
        {title}
      </h3>

      <p className="mt-2 text-[10px] leading-5 text-zinc-500">
        {description}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-green-400/50 bg-zinc-950 p-5 transition hover:border-violet-500/30"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-600 bg-zinc-950 p-5">
      {content}
    </div>
  );
}
 