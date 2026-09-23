import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicHeader from "../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ movieId: string }>;
}): Promise<Metadata> {
  const { movieId } = await params;

  const { data: movie } = await supabase
    .from("movies")
    .select("id, title, original_title, release_year, synopsis, poster_url")
    .eq("id", movieId)
    .maybeSingle();

  if (!movie) {
    return {
      title: "Movie Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const movieTitle = movie.title || movie.original_title || "Movie";

  const description =
    movie.synopsis?.trim() ||
    `${movieTitle}${movie.release_year ? ` (${movie.release_year})` : ""} — box office, cast, crew, business and movie intelligence from Jeruto Movie Intelligence.`;

  const metadata: Metadata = {
    title: `${movieTitle} — Box Office, Cast & Business`,
    description,
    alternates: {
      canonical: `https://jeruto.com/preview/movies/${movie.id}`,
    },
    openGraph: {
      title: `${movieTitle} — Box Office, Cast & Business`,
      description,
      url: `https://jeruto.com/preview/movies/${movie.id}`,
      siteName: "Jeruto Movie Intelligence",
      type: "website",
    },
  };

  if (movie.poster_url) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [
        {
          url: movie.poster_url,
          alt: `${movieTitle} poster`,
        },
      ],
    };
  }

  return metadata;
}

export default async function MovieIntelligencePage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;

  const { data: movie, error } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      original_title,
      release_year,
      release_date,
      runtime_minutes,
      synopsis,
      poster_url,
      backdrop_url,
      trailer_url,
      movie_languages (
        language_id,
        language_type,
        is_primary,
        languages (
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
    .eq("id", movieId)
    .eq("is_active", true)
    .single();

  if (error || !movie) {
    console.error("JMI Movie Intelligence Error:", error);
    notFound();
  }

  // =====================================================
  // BOX OFFICE INTELLIGENCE
  // =====================================================

  const { data: stateBoxOffice, error: stateBoxOfficeError } =
    await supabase
      .from("movie_state_box_office")
      .select(`
        state_id,
        gross_jmi
      `)
      .eq("movie_id", movie.id);

  if (stateBoxOfficeError) {
    console.error(
      "JMI State Box Office Error:",
      stateBoxOfficeError
    );
  }

  const { data: overseasBoxOffice, error: overseasBoxOfficeError } =
    await supabase
      .from("movie_overseas_box_office")
      .select(`
        gross_inr
      `)
      .eq("movie_id", movie.id);

  if (overseasBoxOfficeError) {
    console.error(
      "JMI Overseas Box Office Error:",
      overseasBoxOfficeError
    );
  }

  const { data: dailyBoxOffice, error: dailyBoxOfficeError } =
    await supabase
      .from("movie_daily_box_office")
      .select(`
        day_number,
        gross_jmi
      `)
      .eq("movie_id", movie.id)
      .order("day_number", { ascending: true });

  if (dailyBoxOfficeError) {
    console.error(
      "JMI Daily Box Office Error:",
      dailyBoxOfficeError
    );
  }

  // =====================================================
  // OFFICIAL BOX OFFICE
  // =====================================================

  const {
    data: officialBoxOffice,
    error: officialBoxOfficeError,
  } = await supabase
    .from("movie_official_box_office")
    .select(`
      id,
      territory_name,
      gross_official,
      notes
    `)
    .eq("movie_id", movie.id)
    .order("id", { ascending: true });

  if (officialBoxOfficeError) {
    console.error(
      "JMI Official Box Office Error:",
      officialBoxOfficeError
    );
  }

  // =====================================================
  // BOX OFFICE CALCULATIONS
  // =====================================================

  const indiaGross =
    stateBoxOffice?.reduce(
      (total, row) => total + Number(row.gross_jmi || 0),
      0
    ) ?? 0;

  const overseasGross =
    overseasBoxOffice?.reduce(
      (total, row) => total + Number(row.gross_inr || 0),
      0
    ) ?? 0;

  const worldwideGross =
    indiaGross + overseasGross;

  function formatCrores(value: number) {
    if (!value || value <= 0) return "—";

    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }

    return `₹${(value / 100000).toFixed(2)} L`;
  }

  const primaryLanguageItem =
    movie.movie_languages?.find(
      (item) => item.is_primary === true
    )?.languages ??
    movie.movie_languages?.[0]?.languages ??
    null;

  const primaryLanguage =
    Array.isArray(primaryLanguageItem)
      ? primaryLanguageItem[0]?.name ?? "—"
      : (primaryLanguageItem as { name?: string } | null)?.name ?? "—";

  const movieGenres =
    movie.movie_genres
      ?.map((item) => {
        const genre = item.genres;

        if (Array.isArray(genre)) {
          return genre[0]?.name;
        }

        return (genre as { name?: string } | null)?.name;
      })
      .filter(Boolean)
      .join(" · ") || "—";

  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      <main>

        {/* =====================================================
            MOVIE HERO
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">

            {/* Back */}

            <Link
              href="/preview/movies"
              className="text-[9px] uppercase tracking-[0.2em] text-violet-500 transition hover:text-violet-400"
            >
              ← All Movies
            </Link>

            {/* Movie Hero */}

            <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">

              {/* =================================================
                  POSTER
              ================================================= */}

              <div className="mx-auto h-[210px] w-[140px] flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 sm:mx-0 sm:h-[270px] sm:w-[180px]">

                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={`${movie.title} poster`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-2xl text-zinc-800">
                      ◈
                    </span>
                  </div>
                )}

              </div>

              {/* =================================================
                  MOVIE INFORMATION
              ================================================= */}

              <div className="min-w-0 flex-1">

                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                  JMI Movie Intelligence
                </p>

                <h1 className="mt-3 text-2xl font-medium leading-tight tracking-[-0.035em] text-zinc-100 sm:text-3xl">
                  {movie.title}
                </h1>

                {movie.original_title &&
                  movie.original_title !== movie.title && (
                    <p className="mt-1.5 text-[10px] text-zinc-700">
                      {movie.original_title}
                    </p>
                  )}

                {/* Movie metadata */}

                <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-[10px] text-zinc-400">

                  <span>
                    {movie.release_year ?? "—"}
                  </span>

                  <span className="text-pink-400">
                    •
                  </span>

                  <span className="text-pink-400/80">
                    {primaryLanguage}
                  </span>

                  <span className="text-pink-400">
                    •
                  </span>

                  <span>
                    {movieGenres}
                  </span>

                  {movie.runtime_minutes && (
                    <>
                      <span className="text-pink-400">
                        •
                      </span>

                      <span>
                        Runtime {movie.runtime_minutes} min
                      </span>
                    </>
                  )}

                </div>

                {/* Release date */}

                {movie.release_date && (
                  <div className="mt-5">

                    <p className="text-[8px] uppercase tracking-[0.18em] text-yellow-400">
                      Release Date
                    </p>

                    <p className="mt-1 text-[9px] text-green-500">
                      {movie.release_date}
                    </p>

                  </div>
                )}

                {/* Synopsis */}

                {movie.synopsis && (
                  <p className="mt-5 max-w-2xl text-[10px] leading-5 text-zinc-500">
                    {movie.synopsis}
                  </p>
                )}

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            INTELLIGENCE LAYERS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              Movie Intelligence
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Explore this movie.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-400">
              JMI connects this movie with its box office,
              people, companies, markets and wider industry context.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">

             <AdvancedStatsButton
  icon="💰"
  title="Box Office"
  description="Theatrical performance and collections."
  available={true}
  href="#box-office"
/>

<AdvancedStatsButton
  icon="👥"
  title="Cast & Crew"
  description="Actors, directors and film contributors."
  available={true}
  href={`/preview/movies/${movie.id}/cast-crew`}
/>

             <AdvancedStatsButton
  icon="🏢"
  title="Companies"
  description="Production and associated companies."
  available={true}
  href={`/preview/movies/${movie.id}/companies`}
/>

              <AdvancedStatsButton
  icon="📈"
  title="Markets"
  description="State, city and regional performance"
  available={true}
  href={`/preview/movies/${movie.id}/markets`}
/>

             <AdvancedStatsButton
  icon="☎️"
  title="Advance Booking"
  description="Pre-release advance sales intelligence"
  available={true}
  href={`/preview/movies/${movie.id}/advance-booking`}
/>

             <AdvancedStatsButton
  icon="💼"
  title="Movie Business"
  description="Budget, rights and recovery intelligence"
  available={true}
  href={`/preview/movies/${movie.id}/business`}
/>

              

     <AdvancedStatsButton
  icon="▤"
  title="Releases"
  description="elease and theatrical information"
  available={true}
  href={`/preview/movies/${movie.id}/releases`}
/>

              <AdvancedStatsButton
  icon="📕"
  title="Records"
  description="Notable records and achievements"
  available={true}
  href={`/preview/movies/${movie.id}/records`}
/>

            </div>

          </div>

        </section>

        {/* =====================================================
            BOX OFFICE INTELLIGENCE
        ===================================================== */}



        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

             <section
  id="box-office"
  className="mt-8 scroll-mt-20"
></section> 



            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              Box Office Intelligence
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Theatrical performance.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-400">
              JMI tracks the movie's theatrical performance across
              India and overseas markets.
            </p>

            {/* =================================================
                OFFICIAL COLLECTION
            ================================================= */}

            <div className="mt-6">

              <div className="mb-3">

                <p className="text-[9px]  font-semibold uppercase tracking-[0.25em] text-yellow-400">
                  Official Collection
                </p>

                <p className="mt-1 text-[10px] text-zinc-400">
                  Producer / production-house announced figures
                </p>

              </div>

              {officialBoxOffice && officialBoxOffice.length > 0 ? (

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">

                  {officialBoxOffice.map((item) => (

                    <div
                      key={item.id}
                      className="rounded-xl border border-yellow-500/15 bg-zinc-950 px-4 py-4"
                    >

                      <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                        {item.territory_name}
                      </p>

                      <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-yellow-400">
                        {formatCrores(
                          Number(item.gross_official || 0)
                        )}
                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="rounded-xl border border-dashed border-zinc-600 bg-zinc-950 px-5 py-5">

                  <p className="text-[9px] font-medium text-red-400">
                    Official collection not available.
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-zinc-400">
                    No producer-announced box-office figure has been
                    recorded by JMI for this movie.
                  </p>

                </div>

              )}

            </div>

            {/* =================================================
                JMI TRADE NUMBERS
            ================================================= */}

            <div className="mt-10">

              <div className="mb-4">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  JMI Trade Numbers
                </p>

                <p className="mt-1 text-[10px] text-zinc-400">
                  Trade numbers are Independently tracked theatrical performance and estimates, JMI does not claim 100% accuracy for the trade numbers.
                </p>

              </div>

              {/* =================================================
                  CORE BOX OFFICE
              ================================================= */}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

                <BoxOfficeCard
                  label="India Gross"
                  value={formatCrores(indiaGross)}
                />

                <BoxOfficeCard
                  label="Overseas Gross"
                  value={formatCrores(overseasGross)}
                />

                <BoxOfficeCard
                  label="Worldwide Gross"
                  value={formatCrores(worldwideGross)}
                  highlight
                />

              </div>

            </div>

            {/* =================================================
                ADVANCED BOX OFFICE INTELLIGENCE
            ================================================= */}

            <div className="mt-10">

              <div className="mb-5">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  Advanced Box Office Intelligence
                </p>

                <h3 className="mt-2 text-base font-medium tracking-[-0.02em] text-zinc-100">
                  Explore deeper performance.
                </h3>

                <p className="mt-1.5 max-w-2xl text-[9px] leading-5 text-zinc-400">
                  Explore detailed domestic and international
                  box office intelligence for this movie.
                </p>

              </div>

              {/* =================================================
                  INDIA BREAKDOWN
              ================================================= */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                      India Breakdown
                    </p>

                    <p className="mt-1 text-[9px] text-zinc-400">
                      Domestic theatrical performance
                    </p>

                  </div>

                  <span className="text-[9px] text-zinc-800">
                    IN
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">

                  <AdvancedStatsButton
                    icon="📅"
                    title="Day-wise Collection"
                    description="Daily domestic performance"
                    available={Boolean(dailyBoxOffice?.length)}
                    href={`/preview/movies/${movie.id}/box-office/india/day-wise`}
                  />

                  <AdvancedStatsButton
                    icon="🌍"
                    title="State-wise Collection"
                    description="State and regional performance"
                    available={Boolean(stateBoxOffice?.length)}
                    href={`/preview/movies/${movie.id}/box-office/india/state-wise`}
                  />

                  <AdvancedStatsButton
                    icon="🔤"
                    title="Language-wise Collection"
                    description="Performance by language"
                    available={true}
                    href={`/preview/movies/${movie.id}/box-office/india/language-wise`}
                  />

                  <AdvancedStatsButton
                    icon="👓"
                    title="Format-wise Collection"
                    description="Performance by exhibition format"
                    available={true}
                    href={`/preview/movies/${movie.id}/box-office/india/format-wise`}
                  />

                  <AdvancedStatsButton
                    icon="🏙️"
                    title="City-wise Collection"
                    description="Performance by city"
                    available={true}
                    href={`/preview/movies/${movie.id}/box-office/india/city-wise`}
                  />

                  <AdvancedStatsButton
                    icon="🗺️"
                    title="Geographical-wise Collection"
                    description="Performance by different geographical territories"
                    available={true}
                    href={`/preview/movies/${movie.id}/box-office/india/geographical-wise`}
                  />

                </div>

              </div>

              {/* =================================================
                  OVERSEAS BREAKDOWN
              ================================================= */}

              <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                      Overseas Breakdown
                    </p>

                    <p className="mt-1 text-[8px] text-zinc-700">
                      International theatrical performance
                    </p>

                  </div>

                  <span className="text-[9px] text-zinc-800">
                    INTL
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

                 <AdvancedStatsButton
  icon="🌍"
  title="Country-wise Collection"
  description="Performance by country"
  available={Boolean(overseasBoxOffice?.length)}
  href={`/preview/movies/${movie.id}/box-office/overseas/country-wise`}
/>

                 <AdvancedStatsButton
  icon="🔍"
  title="Major Territory-wise Collection"
  description="Performance by various Trade Territories across the globe"
  available={Boolean(overseasBoxOffice?.length)}
  href={`/preview/movies/${movie.id}/box-office/overseas/major-territories`}
/>

                 <AdvancedStatsButton
  icon="🥇"
  title="Continent-wise Collection"
  description="Performance by various continents across the globe"
  available={Boolean(overseasBoxOffice?.length)}
  href={`/preview/movies/${movie.id}/box-office/overseas/continent-wise`}
/>

                </div>

              </div>

            </div>

            {/* =================================================
                DAILY PERFORMANCE
            ================================================= */}

            <div className="mt-8">

              <div className="mb-4">

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-pink-500">
                  Daily Performance
                </p>

                <p className="mt-1 text-[9px] text-zinc-400">
                  JMI daily theatrical collection record.
                </p>

              </div>

              {dailyBoxOffice && dailyBoxOffice.length > 0 ? (

                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

                  {dailyBoxOffice.map((day, index) => (

                    <div
                      key={`${day.day_number}-${index}`}
                      className="flex items-center justify-between border-b border-zinc-900 px-4 py-3 last:border-b-0"
                    >

                      <div>

                        <p className="text-[9px] font-medium text-zinc-300">
                          Day {day.day_number}
                        </p>

                      </div>

                      <p className="text-[10px] font-medium text-violet-400">
                        {formatCrores(
                          Number(day.gross_jmi || 0)
                        )}
                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-7 text-center">

                  <p className="text-[9px] text-zinc-600">
                    Daily box office data is not available yet.
                  </p>

                </div>

              )}

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
   INTELLIGENCE CARD
============================================================ */

function IntelligenceCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-4 transition-all duration-300 hover:border-violet-400/25 hover:bg-zinc-900/70">

      <span className="text-xs text-violet-400/70">
        {icon}
      </span>

      <p className="mt-2 text-[10px] font-medium text-zinc-300">
        {title}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-zinc-500">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   BOX OFFICE CARD
============================================================ */

function BoxOfficeCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        bg-zinc-750
        px-4
        py-5
        ${
          highlight
            ? "border-violet-400/25"
            : "border-zinc-800"
        }
      `}
    >

      <p className="text-[8px] uppercase tracking-[0.18em] text-green-400">
        {label}
      </p>

      <p
        className={`
          mt-2
          text-xl
          font-medium
          tracking-[-0.03em]
          ${
            highlight
              ? "text-violet-400"
              : "text-zinc-200"
          }
        `}
      >
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   ADVANCED STATS BUTTON
============================================================ */

function AdvancedStatsButton({
  icon,
  title,
  description,
  available,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  available: boolean;
  href?: string;
}) {
  const content = (
    <div
      className={`
        group
        rounded-lg
        border
        px-3
        py-3.5
        transition-all
        duration-300
        ${
          available
            ? "cursor-pointer border-zinc-800 bg-zinc-950 hover:border-violet-400/30 hover:bg-zinc-900/70"
            : "border-zinc-400 bg-black/40 opacity-55"
        }
      `}
    >
      <div className="flex items-start gap-3">

        <span
          className={`
            mt-0.5
            text-xs
            ${
              available
                ? "text-violet-400/80"
                : "text-zinc-800"
            }
          `}
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1">

          <div className="flex items-center justify-between gap-2">

            <p
              className={`
                text-[9px]
                font-medium
                ${
                  available
                    ? "text-zinc-300"
                    : "text-zinc-700"
                }
              `}
            >
              {title}
            </p>

            {available && (
              <span className="text-[9px] text-violet-400/60 transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            )}

          </div>

          <p
            className={`
              mt-1
              text-[8px]
              leading-4
              ${
                available
                  ? "text-zinc-600"
                  : "text-zinc-800"
              }
            `}
          >
            {available
              ? description
              : "Advanced data not available"}
          </p>

        </div>

      </div>
    </div>
  );

  if (available && href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}