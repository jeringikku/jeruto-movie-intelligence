import type { Metadata } from "next";
import Link from "next/link";

import PublicHeader from "../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "JMI Daily Box-Office Portal | Daily Indian Movie Collections",
  description:
    "Follow daily box-office collections of currently tracked Indian movies. Explore day-wise territory collections and daily theatrical performance through the JMI Daily Box-Office Portal.",
  alternates: {
    canonical: "https://jeruto.com/preview/daily-box-office",
  },
  openGraph: {
    title: "JMI Daily Box-Office Portal",
    description:
      "Daily box-office reports, territory-wise collections and theatrical tracking of Indian movies.",
    url: "https://jeruto.com/preview/daily-box-office",
    siteName: "Jeruto Movie Intelligence",
    type: "website",
  },
};

type PortalMovieRecord = {
  id: number;
  movie_id: number;
  is_active: boolean;
  display_order: number;
};

type Movie = {
  id: number;
  title: string;
  slug: string;
  release_year: number | null;
  release_date: string | null;
  poster_url: string | null;
};

function formatDate(value: string | null) {
  if (!value) return null;

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

function getPublicationDate() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default async function DailyBoxOfficePortalPage() {
  /* =========================================================
     PUBLICATION DATE
  ========================================================= */

  const publicationDate = getPublicationDate();

  /* =========================================================
     LOAD ACTIVE PORTAL MOVIES
  ========================================================= */

  const {
    data: portalData,
    error: portalError,
  } = await supabase
    .from("jmi_daily_box_office_portal")
    .select(`
      id,
      movie_id,
      is_active,
      display_order
    `)
    .eq("row_type", "MOVIE")
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    })
    .order("id", {
      ascending: true,
    });

  if (portalError) {
    console.error(
      "Daily Box-Office Portal error:",
      portalError
    );
  }

  const portalMovies =
    (portalData || []) as PortalMovieRecord[];

  /* =========================================================
     LOAD BASIC MOVIE DETAILS
  ========================================================= */

  let movies: Movie[] = [];

  if (portalMovies.length > 0) {
    const movieIds = portalMovies.map(
      (item) => item.movie_id
    );

    const {
      data: movieData,
      error: movieError,
    } = await supabase
      .from("movies")
      .select(`
        id,
        title,
        slug,
        release_year,
        release_date,
        poster_url
      `)
      .in("id", movieIds);

    if (movieError) {
      console.error(
        "Daily Box-Office movie details error:",
        movieError
      );
    } else {
      const movieMap = new Map<number, Movie>();

      ((movieData || []) as Movie[]).forEach(
        (movie) => {
          movieMap.set(movie.id, movie);
        }
      );

      // Preserve the display order configured in admin.
      movies = portalMovies
        .map((item) => movieMap.get(item.movie_id))
        .filter(
          (movie): movie is Movie =>
            Boolean(movie?.slug)
        );
    }
  }

  /* =========================================================
     STRUCTURED DATA
  ========================================================= */

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "JMI Daily Box-Office Portal",
    description:
      "Daily box-office collection reports of currently tracked Indian movies.",
    url: "https://jeruto.com/preview/daily-box-office",
    publisher: {
      "@type": "Organization",
      name: "Jeruto Movie Intelligence",
      url: "https://jeruto.com",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: movies.length,
      itemListElement: movies.map((movie, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: movie.title,
        url: `https://jeruto.com/preview/daily-box-office/${movie.slug}`,
      })),
    },
  }).replace(/</g, "\\u003c");

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#171717]">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredData,
        }}
      />

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-5 sm:px-6 lg:px-8">

        {/* BACK NAVIGATION */}

        <div className="mb-4">
          <Link
            href="/"
            className="text-[8px] font-medium uppercase tracking-[0.15em] text-zinc-500 transition hover:text-black"
          >
            ← Back to Home
          </Link>
        </div>

        {/* NEWSPAPER MASTHEAD */}

        <header className="border-y-[3px] border-black py-5 sm:py-7">

          <div className="flex flex-col items-center text-center">

            <p className="text-[10px] font-serif uppercase tracking-[0.35em] text-pink-500 sm:text-[9px]">
             ________ THE JMI TIMES ________
            </p>

            <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.05em] text-black sm:text-5xl">
              Daily Box-Office
              <span className="block">Portal</span>
            </h1>

            <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-600 sm:text-xs">
              Daily theatrical collection reports and
              territory-wise box-office 
            </p>

            {/* NEWSPAPER PUBLICATION DETAILS */}

            <div className="mt-5 flex w-full items-start justify-between border-t border-black pt-3 text-left">

              {/* LEFT: PUBLICATION + DATE */}

              <div>
                <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-[9px]">
                  JMI · Cinema · Trade · Data
                </p>

                <p className="mt-1 font-serif text-[9px] font-semibold text-black sm:text-[11px]">
                  {publicationDate}
                </p>
              </div>

              {/* RIGHT: REPORT CATEGORY + LOCATION */}

              <div className="text-right">
                <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-[9px]">
                  Daily Collection Reports
                </p>

                <p className="mt-1 font-serif text-[9px] font-semibold text-black sm:text-[11px]">
                  India
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* SECTION HEADING */}

        <section className="mt-6">

          <div className="flex items-end justify-between gap-3 border-b border-black pb-3">

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                The Latest Edition
              </p>

              <h2 className="mt-1 font-serif text-lg font-bold text-black sm:text-2xl">
                Currently Running Movies
              </h2>
            </div>

            <p className="text-[9px] text-zinc-500">
              {movies.length}{" "}
              {movies.length === 1 ? "Movie" : "Movies"}
            </p>

          </div>

          <p className="mt-3 max-w-2xl text-[10px] leading-5 text-zinc-600 sm:text-xs">
            Select a movie to explore its day-wise box-office
            performance, including individual territory
            collections and daily reported totals.
          </p>

        </section>

        {/* MOVIE NEWSPAPER GRID */}

        {movies.length === 0 ? (

          <section className="mt-8 border-y border-zinc-300 py-14 text-center">

            <p className="font-serif text-xl font-semibold text-zinc-800">
              No active reports available
            </p>

            <p className="mt-2 text-[10px] leading-5 text-zinc-500">
              Movie reports will appear here when they
              are added to the JMI Daily Box-Office Portal.
            </p>

          </section>

        ) : (

          <section className="mt-5 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">

            {movies.map((movie, index) => (

              <Link
                key={movie.id}
                href={`/preview/daily-box-office/${movie.slug}`}
                className="group block border-b border-zinc-300 bg-[#f3f1eb] px-3 py-5 transition-colors hover:bg-white sm:mx-1 sm:px-3"
              >

                <article>

                  {/* EDITION NUMBER */}

                  <div className="mb-3 flex items-center justify-between">

                    <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Report No. {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.13em] text-green-700">

                      <span className="relative flex h-1.5 w-1.5">

                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />

                        <span className="relative h-1.5 w-1.5 rounded-full bg-green-600" />

                      </span>

                      Active

                    </span>

                  </div>

                  {/* POSTER */}

                  <div className="relative overflow-hidden border border-zinc-200 bg-zinc-100">

                    {movie.poster_url ? (

                      <img
                        src={movie.poster_url}
                        alt={`${movie.title} movie poster`}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/10] w-full object-contain transition duration-300 group-hover:scale-[1.015]"
                      />

                    ) : (

                      <div className="flex aspect-[16/10] w-full items-center justify-center">
                        <span className="font-serif text-sm text-zinc-400">
                          Poster unavailable
                        </span>
                      </div>

                    )}

                  </div>

                  {/* MOVIE HEADLINE */}

                  <div className="pt-4">

                    <h3 className="font-serif text-lg font-bold leading-tight text-black transition group-hover:text-zinc-600 sm:text-xl">
                      {movie.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-zinc-500">

                      {movie.release_date ? (
                        <span>
                          Released {formatDate(movie.release_date)}
                        </span>
                      ) : movie.release_year ? (
                        <span>
                          Released {movie.release_year}
                        </span>
                      ) : null}

                      <span className="text-zinc-300">|</span>

                      <span>JMI Daily Collection Report</span>

                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">

                      <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-800">
                        Read Collection Report
                      </span>

                      <span className="font-serif text-sm text-black transition-transform group-hover:translate-x-1">
                        →
                      </span>

                    </div>

                  </div>

                </article>

              </Link>

            ))}

          </section>

        )}

        {/* EDITORIAL FOOTNOTE */}

        <section className="mt-10 border-y border-zinc-300 py-5">

          <p className="font-serif text-sm font-semibold text-zinc-800">
            About JMI Daily Box-Office Reports
          </p>

          <p className="mt-2 max-w-3xl text-[9px] leading-5 text-zinc-500 sm:text-[10px]">
            This portal presents day-wise theatrical collection
            figures entered and maintained by Jeruto Movie
            Intelligence. Figures are reported on a territory
            basis and should be read in accordance with the
            reporting scope and available data for each movie.
          </p>

        </section>

      </main>

      {/* NEWSPAPER FOOTER */}

      <footer className="border-t-[3px] border-black bg-[#f3f2ee]">

        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">

          <div>
            <p className="font-serif text-sm font-bold text-black">
              Jeruto Movie Intelligence
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-500">
              Cinema · Data · Intelligence
            </p>
          </div>

          <p className="text-[9px] text-zinc-500">
            JMI · Daily Box-Office Portal
          </p>

        </div>

      </footer>

    </div>
  );
}