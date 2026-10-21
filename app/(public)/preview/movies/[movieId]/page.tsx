import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicHeader from "../../../components/PublicHeader";
import MovieRating from "../../../components/MovieRating";
import WalkingVerdictDuck from "@/app/(public)/components/WalkingVerdictDuck";
import WalkingVerdictDuck3D from "@/app/(public)/components/WalkingVerdictDuck3D";
import MovieVerdictAtmosphere from "@/app/(public)/components/MoviePageAtmosphere";
import MoviePageAtmosphere from "@/app/(public)/components/MoviePageAtmosphere";
import JmiWetMoviePoster from "@/app/(public)/components/JmiWetMoviePoster";
import JmiRain from "@/app/(public)/components/JmiRain";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ movieId: string }>;
}): Promise<Metadata> {
  const { movieId } = await params;

  const { data: movie } = await supabase
  .from("movies")
  .select("id, title, original_title, release_year, synopsis, poster_url, slug")
  .eq("slug", movieId)
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
      slug,
      title,
      original_title,
      release_year,
      release_date,
      runtime_minutes,
      certifications (
        name
      ),
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
// MOVIE BUSINESS VERDICTS
// =====================================================

const {
  data: movieBusiness,
  error: movieBusinessError,
} = await supabase
  .from("movie_business")
  .select(`
    theatrical_verdict,
    business_verdict
  `)
  .eq("movie_id", movie.id)
  .maybeSingle();

if (movieBusinessError) {
  console.error(
    "JMI Movie Verdict Error:",
    movieBusinessError
  );
}

const theatricalVerdict =
  movieBusiness?.theatrical_verdict?.trim() || null;

const overallBusinessVerdict =
  movieBusiness?.business_verdict?.trim() || null;

  // =====================================================
  // MOVIE PAGE VIEWS
  // =====================================================

  const { data: movieViewCount, error: movieViewError } =
    await supabase.rpc(
      "jmi_increment_movie_views",
      {
        p_movie_id: movie.id,
      }
    );

  if (movieViewError) {
    console.error(
      "JMI Movie View Counter Error:",
      movieViewError
    );
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
      gross_inr,
      gross_usd
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

const overseasGrossUsd =
  overseasBoxOffice?.reduce(
    (total, row) => total + Number(row.gross_usd || 0),
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

  function formatUSD(value: number) {
  if (!value || value <= 0) return "—";

  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }

  return `$${value.toFixed(2)}`;
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

      const certificationItem = movie.certifications;

const certification = Array.isArray(certificationItem)
  ? certificationItem[0]?.name ?? null
  : (certificationItem as { name?: string } | null)?.name ?? null;

  return (
  <div className="min-h-screen w-full max-w-full overflow-x-clip bg-black text-white">
      <PublicHeader />

        {/* JMI RAIN — SYNCHRONIZED WITH THE SHARED RAIN SCHEDULE */}
      <JmiRain />


      <main className="w-full min-w-0 max-w-full">


        {/* =====================================================
            MOVIE HERO
        ===================================================== */}


        <section className="border-b border-zinc-900">
          

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">


  {/* Top Navigation + Movie Views */}

  <div className="flex items-start justify-between gap-4">


    {/* Back */}

    <Link
      href="/preview/movies"
      className="pt-2 text-[9px] uppercase tracking-[0.2em] text-violet-500 transition hover:text-violet-400"
    >
      ← All Movies
    </Link>


    {/* Movie Page Views */}

    <div className="flex flex-shrink-0 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1">

  <p className="text-[6px] uppercase tracking-[0.12em] text-zinc-400">
    Total Page Views
  </p>

  <p className="text-[9px] font-medium text-pink-400">
    {Number(movieViewCount || 0).toLocaleString("en-IN")}
  </p>

</div>

  </div>

            {/* Movie Hero */}

            <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">


           {/* MAIN MOVIE POSTER — AUTOMATIC RAIN EFFECT */}

<div className="mx-auto w-full min-w-0 max-w-[210px] flex-shrink-0 sm:mx-0 sm:w-[180px] sm:max-w-[180px]">
  <JmiWetMoviePoster
    posterUrl={movie.poster_url}
    movieTitle={movie.title || movie.original_title || "Movie"}
  />
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

                

{/* =================================================
    PREMIUM MOVIE METADATA
================================================= */}

<div className="mt-4 space-y-3">

  {/* Core metadata */}

  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] sm:text-xs">

    <span className="font-medium text-pink-400">
      {movie.release_year ?? "—"}
    </span>

    <span className="text-violet-500 text-[5px]">💠</span>

    <span className="text-yellow-400">
      {primaryLanguage}
    </span>

    <span className="text-violet-500 text-[5px]">💠</span>

    <span className="text-green-400 text-[10px]">
      {movie.runtime_minutes
        ? `Runtime : ${movie.runtime_minutes} min`
        : "Runtime unavailable"}
    </span>

    {certification && (
      <>
        <span className="text-violet-500 text-[5px]">💠</span>

        <span className="inline-flex items-center rounded border border-yellow-500/35 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-yellow-400">
          {certification}
        </span>
      </>
    )}

  </div>

  {/* Genres */}

  <div className="flex flex-wrap items-center gap-1.5">

    {movie.movie_genres?.length > 0 ? (
      movie.movie_genres.map((item, index) => {
        const genre = item.genres;

        const genreName = Array.isArray(genre)
          ? genre[0]?.name
          : (genre as { name?: string } | null)?.name;

        if (!genreName) return null;

        return (
          <span
            key={`${genreName}-${index}`}
            className="rounded-full border border-pink-400 px-2.5 py-1 text-[9px] text-zinc-300 transition-colors hover:border-violet-500/40 hover:text-violet-400"
          >
            {genreName}
          </span>
        );
      })
    ) : (
      <span className="text-[10px] text-zinc-400">
        Genre unavailable
      </span>
    )}

  </div>

  {/* Release date */}

  <div className="flex items-center gap-2 pt-0.5 text-[10px]">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-3.5 w-3.5 shrink-0 text-yellow-500/80"
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" />
    </svg>

    <span className=" tracking-[0.12em] text-green-500 text-[10px]">
      Release Date
    </span>

    <span className="text-zinc-300">
      {movie.release_date
        ? new Date(
            `${movie.release_date}T00:00:00`
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Not announced"}
    </span>

  </div>

</div>


                {/* Synopsis */}

                {movie.synopsis && (
                  <p className="mt-5 max-w-2xl text-[10px] leading-5 text-zinc-400">
                    {movie.synopsis}
                  </p>
                )}


{/* Automatic night sky background */}
    <MoviePageAtmosphere />

                

                {/* FULL-WIDTH WALKING VERDICT DUCK */}
<div className="relative w-full min-w-0 overflow-hidden">
  <WalkingVerdictDuck3D verdict={theatricalVerdict} />
</div>


                {/* =================================================
    JMI MOVIE VERDICTS
================================================= */}



{(theatricalVerdict || overallBusinessVerdict) && (
  <div className="mt-6 max-w-2xl">

    {/* Section heading */}

    <div className="mb-3 flex items-center gap-2">

      <span className="h-4 w-0.5 rounded-full bg-violet-400" />

      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-pink-400">
        JMI Movie Verdicts
      </p>

    </div>

    {/* Verdict cards */}

    <div className="grid gap-2 sm:grid-cols-2">

      {/* Theatrical Verdict */}

      {theatricalVerdict && (
        <div className="relative overflow-hidden rounded-lg border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.07] to-zinc-950 px-4 py-3.5">

          <div className="flex items-start gap-3">

            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-violet-400/20 bg-violet-500/[0.08]">

              <span className="text-sm text-violet-300">
                🎬
              </span>

            </div>

            <div className="min-w-0">

              <p className="text-[7px] font-medium uppercase leading-4 tracking-[0.14em] text-zinc-400">
                Theatrical Run Verdict
              </p>

              <p className="mt-1 break-words text-sm font-semibold tracking-tight text-violet-300">
                {theatricalVerdict}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* Overall Business Verdict */}

      {overallBusinessVerdict && (
        <div className="relative overflow-hidden rounded-lg border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.06] to-zinc-950 px-4 py-3.5">

          <div className="flex items-start gap-3">

            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-yellow-500/20 bg-yellow-500/[0.07]">

              <span className="text-sm text-yellow-400">
                💰
              </span>

            </div>

            <div className="min-w-0">

              <p className="text-[7px] font-medium uppercase leading-4 tracking-[0.14em] text-zinc-400">
                Overall Verdict After Total Business
              </p>

              <p className="mt-1 break-words text-sm font-semibold tracking-tight text-yellow-500">
                {overallBusinessVerdict}
              </p>

            </div>

          </div>

        </div>
      )}

    </div>

  </div>
)}

              </div>

            </div>

          </div>

          
        </section>

        {/* =====================================================
            JMI AUDIENCE RATING
        ===================================================== */}

        <section className="border-b border-zinc-900">
          <div className="mx-auto max-w-6xl px-5 py-6 sm:px-6 sm:py-8 lg:px-8">
            <MovieRating movieId={movie.id} />
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

        {/* =================================================
    JMI PREMIUM PERFORMANCE REPORT
================================================= */}

<div className="mx-auto mt-5 w-full max-w-6xl px-0">

  <Link
    href={`/preview/movies/${movie.id}/performance-report`}
    className="group relative block w-full overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-r from-violet-500/[0.06] via-zinc-950 to-yellow-500/[0.03] transition-all duration-300 hover:border-violet-400/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.08)]"
  >

    {/* Premium glow */}

    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/[0.06] blur-3xl transition-all duration-500 group-hover:bg-violet-500/[0.10]" />

    <div className="pointer-events-none absolute -bottom-12 -left-8 h-20 w-20 rounded-full bg-yellow-500/[0.03] blur-3xl" />

    <div className="relative flex items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-3.5">

      {/* Left content */}

      <div className="flex min-w-0 items-center gap-3">

        {/* Icon */}

        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/[0.08]">

          <span className="text-base">📄</span>

        </div>

        {/* Text */}

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              JMI Premium
            </p>

            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/[0.05] px-1.5 py-0.5 text-[7px] font-medium uppercase tracking-[0.1em] text-yellow-500">
              Exclusive
            </span>

          </div>

          <h3 className="mt-1 text-xs font-semibold tracking-[-0.01em] text-green-500 sm:text-sm">
            JMI Movie Performance Report
          </h3>

          <p className="mt-1 text-[9px] leading-4 text-zinc-400 sm:text-[10px]">
            AI-powered analysis of box office, markets, business and theatrical performance.
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[7px] uppercase tracking-[0.12em] text-pink-400 sm:gap-x-3">

            <span>AI Analysis</span>
            <span>•</span>
            <span>Trade Data</span>
            <span>•</span>
            <span>Box Office</span>
            <span>•</span>
            <span>PDF Report</span>

          </div>

        </div>

      </div>

      {/* Compact navigation arrow */}

      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/[0.06] text-sm text-violet-400 transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>

    </div>

  </Link>

</div>

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
  value={`${formatCrores(overseasGross)} / ${formatUSD(overseasGrossUsd)}`}
/>

                <BoxOfficeCard
                  label="Worldwide Gross"
                  value={formatCrores(worldwideGross)}
                  highlight
                />

              </div>

            </div>

            {/* =================================================
    HISTORICAL DATA DISCLAIMER
================================================= */}

<div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/[0.035] px-4 py-3.5 sm:px-5">

  <div className="flex items-start gap-3">

    {/* Information icon */}

    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/[0.06]">

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-3.5 w-3.5 text-amber-400"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>

    </div>

    {/* Disclaimer content */}

    <div className="min-w-0">

      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-400">
        Historical Box Office Data Disclaimer
      </p>

      <p className="mt-2 text-[10px] leading-5 text-zinc-400 sm:text-[11px]">
        For movies released before 2015, during the pre-tracking era,
        JMI has used external sources, older databases and research
        notes to establish historical box-office figures. JMI does
        not guarantee 100% accuracy for these figures and accepts no
        liability for discrepancies. These figures should be
        considered as trade figures, not official producer verified collections.
      </p>

    </div>

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

                    <p className="mt-1 text-[9px] text-zinc-400">
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

        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">

          <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div>

              <p className="font-serif text-sm font-medium text-zinc-300">
                Jeruto{" "}
                <span className="text-yellow-400">
                  Movie Intelligence
                </span>
              </p>

              <p className="mt-1 text-[9px] text-zinc-500">
                India's Next Generation Movie Intelligence Platform
              </p>

            </div>

            <p className="text-[9px] text-zinc-500">
              JMI · People Intelligence
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
  secondaryValue,
  highlight = false,
}: {
  label: string;
  value: string;
  secondaryValue?: string;
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

{secondaryValue && (
  <p className="mt-1 text-[14px] font-medium tracking-[-0.01em] text-yellow-400">
    {secondaryValue}
  </p>
)}

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
            ? "cursor-pointer border-violet-500/30 bg-zinc-950 hover:border-violet-400/30 hover:bg-zinc-900/70"
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
                  ? "text-zinc-500"
                  : "text-zinc-600"
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