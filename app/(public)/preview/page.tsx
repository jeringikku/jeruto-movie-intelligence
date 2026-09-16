import Link from "next/link";
import PublicHeader from "../components/PublicHeader";
import HomepageBannerStrip from "../components/HomepageBannerStrip";
import MovieSearch from "../components/MovieSearch";
import TicketBookingBanner from "../components/TicketBookingBanner";
import ComparisonIntelligenceBanner from "../components/ComparisonIntelligenceBanner";
import { supabase } from "@/lib/supabase";

export default async function PublicPreview() {

  // ============================================================
  // JMI HOMEPAGE BANNERS
  // ============================================================

  const { data: homepageBanners, error: homepageBannersError } =
    await supabase
      .from("jmi_homepage_posters")
      .select(`
        id,
        poster_url,
        sort_order
      `)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

  if (homepageBannersError) {
    console.error(
      "Homepage banners error:",
      homepageBannersError
    );
  }

  // ============================================================
  // JMI LIVE DATABASE STATISTICS
  // ============================================================

  const [
    moviesResult,
    peopleResult,
    companiesResult,
    languagesResult,
    industriesResult,
    citiesResult,
  ] = await Promise.all([
    supabase
      .from("movies")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("people")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("companies")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("languages")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("industries")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("cities")
      .select("id", { count: "exact", head: true }),
  ]);

  const movieCount = moviesResult.count ?? 0;
  const peopleCount = peopleResult.count ?? 0;
  const companyCount = companiesResult.count ?? 0;
  const languageCount = languagesResult.count ?? 0;
  const industryCount = industriesResult.count ?? 0;
  const cityCount = citiesResult.count ?? 0;

  // ============================================================
  // JMI LIVE BOX OFFICE TOTALS
  // ============================================================

  const { data: indiaBoxOffice } = await supabase
    .from("movie_state_box_office")
    .select("gross_jmi");

  const { data: overseasBoxOffice } = await supabase
    .from("movie_overseas_box_office")
    .select("gross_inr");

  const indiaGross =
    indiaBoxOffice?.reduce(
      (total, row) => total + Number(row.gross_jmi || 0),
      0
    ) ?? 0;

  const overseasGross =
    overseasBoxOffice?.reduce(
      (total, row) => total + Number(row.gross_inr || 0),
      0
    ) ?? 0;

  const worldwideGross = indiaGross + overseasGross;

  function formatCrores(value: number) {
    if (!value || value <= 0) return "—";

    return `₹${(value / 10000000).toFixed(2)} Cr;`
  }

  // ============================================================
  // RECENTLY ADDED MOVIES
  // ============================================================

  const { data: recentMovies, error: recentMoviesError } =
    await supabase
      .from("movies")
      .select(`
        id,
        title,
        release_year,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(5);

  if (recentMoviesError) {
    console.error(
      "Recent movies error:",
      recentMoviesError
    );
  }

  // ============================================================
  // PRIMARY LANGUAGES FOR RECENT MOVIES
  // ============================================================

  const recentMovieIds =
    recentMovies?.map((movie) => movie.id) ?? [];

  const { data: recentMovieLanguages } =
    recentMovieIds.length > 0
      ? await supabase
        .from("movie_languages")
        .select(`
            movie_id,
            language_id
          `)
        .in("movie_id", recentMovieIds)
        .eq("is_primary", true)
      : { data: [] };

  const recentLanguageIds =
    recentMovieLanguages?.map(
      (row) => row.language_id
    ) ?? [];

  const { data: recentLanguages } =
    recentLanguageIds.length > 0
      ? await supabase
        .from("languages")
        .select(`
            id,
            name
          `)
        .in("id", recentLanguageIds)
      : { data: [] };

  const languageMap = new Map(
    (recentLanguages ?? []).map((language) => [
      language.id,
      language.name,
    ])
  );

  const movieLanguageMap = new Map(
    (recentMovieLanguages ?? []).map((row) => [
      row.movie_id,
      languageMap.get(row.language_id) ?? "—",
    ])
  );

  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      <main>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden border-b border-zinc-900">

          {/* Subtle ambient light */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-220px] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-yellow-400/[0.035] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

            <div className="mx-auto max-w-3xl text-center">

              {/* Eyebrow */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-yellow-400/[0.035] px-3 py-1.5">

                <span className="h-1 w-1 rounded-full bg-green-400" />

                <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-green-400/90 sm:text-[10px]">
                  India's Movie Intelligence Platform
                </span>

              </div>


              {/* Premium Brand Title */}

              <h1 className="font-serif leading-[0.95] tracking-[-0.045em]">

                <span className="block text-[28px] font-small text-rose-400 sm:text-5xl lg:text-6xl">
                  🍿𝕁𝔼ℝ𝕌𝕋𝕆
                </span>

                <span className="mt-1 block text-[30px] font-medium text-yellow-400 sm:text-[2.9rem] lg:text-5xl">
                  Movie Intelligence
                </span>

              </h1>


              {/* Description */}

              <p className="mx-auto mt-6 max-w-xl text-[12px] leading-6 text-zinc-400 sm:text-sm sm:leading-7">
                Structured intelligence for Indian cinema — bringing
                together movies, people, companies, box office and
                the business of films.
              </p>


              {/* Search */}

              <div className="mx-auto mt-7 max-w-xl">
  <MovieSearch />
</div>


              <p className="mt-2 text-[10px] text-green-400">
                Explore the data behind Indian cinema
              </p>

              

            </div>

          </div>

        </section>

        {/* =====================================================
            JMI HOMEPAGE BANNERS
        ===================================================== */}

        <HomepageBannerStrip
          banners={homepageBanners ?? []}
        />


        {/* =====================================================
            DATABASE INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-pink-400">
                  JMI Database
                </p>

                <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-yellow-400 sm:text-xl">
                  Intelligence built from structured data.
                </h2>

              </div>

              <p className="max-w-sm text-[11px] leading-5 text-zinc-400">
                JMI is a growing knowledge based movie analytics platform covering the movies, people,
                companies, markets and infrastructure of Indian cinema.
              </p>

            </div>


            {/* Intelligence Statistics */}

            <div className="overflow-x-auto rounded-xl border border-pink-400 bg-zinc-950">

              <div className="grid min-w-[700px] grid-cols-7 divide-x divide-zinc-800">

                <DatabaseMetric
                  value={String(movieCount).padStart(2, "0")}
                  label="Movies"
                  description="Films indexed"
                />

                <DatabaseMetric
                  value={peopleCount.toLocaleString("en-IN")}
                  label="People"
                  description="Professionals"
                />

                <DatabaseMetric
                  value={companyCount.toLocaleString("en-IN")}
                  label="Companies"
                  description="Film businesses"
                />

                <DatabaseMetric
                  value={languageCount.toLocaleString("en-IN")}
                  label="Languages"
                  description="Languages covered"
                />

                <DatabaseMetric
                  value={industryCount.toLocaleString("en-IN")}
                  label="Industries"
                  description="Industries covered"
                />

                <DatabaseMetric
                  value="7,822"
                  label="Screens"
                  description="Screens tracked"
                />

                <DatabaseMetric
                  value={cityCount.toLocaleString("en-IN")}
                  label="Cities"
                  description="Cities covered"
                />

              </div>

            </div>


            <p className="mt-3 text-[9px] text-zinc-400 sm:hidden">
              Swipe horizontally to explore all metrics →
            </p>

          </div>

        </section>


        {/* =====================================================
    BOX OFFICE INTELLIGENCE
===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            {/* Section heading */}

            <div className="mb-7">

              <p className="text-[9.5px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                Box Office Intelligence
              </p>

              <h2 className="mt-2 max-w-2xl text-[12px] font-medium tracking-[-0.025em] text-zinc-400 sm:text-2xl">
                We are aiming to build the single largest database in the History of Cinema Analytics. Our database currently contains..
              </h2>


            </div>


            {/* =================================================
        COLLECTION INTELLIGENCE CARDS
    ================================================= */}

            <div className="grid text-zinc-400 grid-cols-3 gap-2 sm:gap-3">

              <BoxOfficeMetric
                label="India Gross"
                value={formatCrores(indiaGross)}
              />
              <BoxOfficeMetric
                label="Overseas Gross"
                value={formatCrores(overseasGross)}
              />

              <BoxOfficeMetric
                label="Worldwide Gross"
                value={formatCrores(worldwideGross)}
                highlight
              />

            </div>


            {/* Coverage line */}

            <div className="mt-3 flex items-center justify-between rounded-lg border border-pink-400 bg-zinc-950 px-3 py-2.5">

              <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-green-400">
                Current database coverage
              </span>

              <span className="text-[9px] text-red-400/90">
                🚨Updating Live
              </span>

            </div>

          </div>

        </section>

        <TicketBookingBanner />

        {/* =====================================================
    WHAT JMI PROVIDES
===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            {/* Premium banner */}

            <div className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-zinc-950">

              {/* Ambient violet glow */}

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/[0.07] blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-violet-500/[0.035] blur-3xl" />


              <div className="relative p-6 sm:p-8 lg:p-10">

                {/* Heading */}

                <div className="max-w-2xl">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                    🌞What JMI Provides
                  </p>

                  <h2 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
                    Intelligence beyond the numbers.
                  </h2>

                  <p className="mt-2 text-[11px] leading-5 text-zinc-400 sm:text-xs">
                    JMI brings together structured data, market intelligence
                    and analytical depth to create a complete view of Indian cinema.
                  </p>

                </div>


                {/* =================================================
            FEATURE LIST
        ================================================= */}

                <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">

                  <JmiFeature
                    number="01"
                    title="Complete Box Office Intelligence"
                    description="From real-time advance sales to detailed theatrical performance and deep collection analysis."
                  />

                  <JmiFeature
                    number="02"
                    title="Movie Business & Recovery Analysis"
                    description="Understand movie economics, business performance, recovery patterns and theatrical outcomes."
                  />

                  <JmiFeature
                    number="03"
                    title="People Intelligence"
                    description="Dedicated intelligence profiles for actors, directors and technicians with role-based career analytics."
                  />

                  <JmiFeature
                    number="04"
                    title="Production Company Intelligence"
                    description="Track production houses through performance, growth, market presence and business trends."
                  />

                  <JmiFeature
                    number="05"
                    title="Industry Intelligence"
                    description="Dedicated intelligence layers for individual Indian film industries covering movies, markets and analytics."
                  />

                  <JmiFeature
                    number="06"
                    title="State Market Intelligence"
                    description="Understand audience behaviour across individual state markets and their response to different types of cinema."
                  />

                </div>


                {/* Bottom statement */}

                <div className="mt-7 border-t border-zinc-900 pt-5">

                  <p className="text-[9px] leading-5 text-green-500 ">
                    One ecosystem. Multiple intelligence layers. Built to understand
                    the business and behaviour behind Indian cinema.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            EXPLORE JMI
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">

            {/* Section heading */}

            <div className="mb-7">

              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-400">
                Explore JMI Intelligence
              </p>

              <h2 className="mt-2 max-w-2xl text-xl font-medium tracking-[-0.025em] text-white sm:text-2xl">
                One platform. Multiple layers of intelligence.
              </h2>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-400">
                Explore the different intelligence layers that connect
                Indian cinema, markets and the business of films.
              </p>

            </div>


            {/* =================================================
                PREMIUM INTELLIGENCE BUTTONS
            ================================================= */}

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">

              <ExploreCard
                number="01"
                icon="movie"
                title="Movies"
                description="Films, releases, languages, genres and detailed movie intelligence."
                href="/preview/movies"
              />

              <ExploreCard
                number="02"
                icon="boxoffice"
                title="Box Office"
                description="Collections, theatrical performance, territories and markets."
                href="/preview/box-office"
              />

              <ExploreCard
                number="03"
                icon="market"
                title="Market Intelligence"
                description="South Indian state markets, regional performance and analytics."
                href="/preview/market-intelligence"
              />

              <ExploreCard
                number="04"
                icon="people"
                title="People"
                description="Actors, directors, producers and film industry professionals."
                href="/preview/people"
              />

              <ExploreCard
                number="05"
                icon="company"
                title="Companies"
                description="Production houses, distributors and businesses behind cinema."
                href="/preview/companies"
              />

              <ExploreCard
                number="06"
                icon="industry"
                title="Industries"
                description="Indian cinema industries, languages, markets and ecosystems."
                href="/preview/industries"
              />

              <ExploreCard
                number="07"
                icon="insights"
                title="Insights"
                description="Data-driven intelligence and deeper perspectives on cinema."
                href="/preview/insights"
              />

            </div>

          </div>

        </section>


{/* =====================================================
    JMI COMPARISON INTELLIGENCE — PREMIUM CTA
===================================================== */}

<ComparisonIntelligenceBanner />

        {/* =====================================================
    RECENT MOVIES
===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            {/* Heading */}

            <div className="mb-7 flex items-end justify-between gap-4">

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-red-400/80">
                  Latest in JMI
                </p>

                <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-zinc-100 sm:text-xl">
                  Recent movies
                </h2>

                <p className="mt-2 max-w-xl text-[11px] leading-5 text-zinc-400">
                  Recently added films and the latest cinema data entering
                  the JMI intelligence network.
                </p>

              </div>

              <Link
                href="/preview/movies"
                className="
          hidden
          text-[9px]
          font-medium
          text-violet-400
          transition
          hover:text-violet-300
          sm:block
        "
              >
                View all →
              </Link>

            </div>


            {/* Movie cards */}

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

              {recentMovies?.map((movie) => (
                <RecentMovie
                  key={movie.id}
                  title={movie.title}
                  language={movieLanguageMap.get(movie.id) ?? "—"}
                  year={
                    movie.release_year
                      ? String(movie.release_year)
                      : "—"
                  }
                  href={`/preview/movies/${movie.id}`}
                />
              ))}
            </div>


            {/* Mobile link */}

            <Link
              href="/preview/movies"
              className="
        mt-4
        block
        text-center
        text-[9px]
        font-medium
        text-violet-400
        sm:hidden
      "
            >
              View all movies →
            </Link>

          </div>

        </section>




        {/* =====================================================
    FOUNDER'S NOTE
===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">

            <div
              className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-violet-400/50
        bg-zinc-950
      "
            >

              {/* Ambient violet glow */}

              <div
                className="
          pointer-events-none
          absolute
          -right-32
          -top-32
          h-64
          w-64
          rounded-full
          bg-violet-500/[0.06]
          blur-3xl
        "
              />


              <div
                className="
          pointer-events-none
          absolute
          -bottom-32
          -left-32
          h-64
          w-64
          rounded-full
          bg-violet-500/[0.035]
          blur-3xl
        "
              />


              <div className="relative p-6 sm:p-8 lg:p-10">

                {/* Label */}

                <div className="flex items-center gap-2">

                  <span className="h-px w-5 bg-violet-400/60" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                    A JMI Principle
                  </p>

                </div>


                {/* Quote */}

                <blockquote
                  className="
            mt-1
            max-w-1xl
            font-Playfair Display
            font-normal
            text-[12px]
            leading-6
            tracking-[-0.005em]
            text-zinc-400/80

            sm:text-sm
            sm:leading-8
          "
                >
                  " Our commitment is simple — to build a transparent,
                  unbiased and structured source of movie intelligence,
                  where every movie, every actor and every part of the
                  film business can be understood by everyone through data."
                </blockquote>


                {/* Founder */}

                <div className="mt-7 flex items-center gap-3">

                  {/* Founder mark */}

                  

                  <div>

                    <p className="text-[8px] font-medium text-yellow-500">
                      — JERIN GEORGEKUTTY - MA | MBA | PGDAS | PDDS
                    </p>

                    <div className="mt-2 h-[85px] w-[85px] overflow-hidden rounded-full border-round border-zinc-500 bg-zinc-950 sm:h-[135px] sm:w-[140px]">
  <img
    src="https://jeringeorgekutty.weebly.com/uploads/1/1/9/9/119991850/img-20250301-102847_orig.jpg"
    alt="Jerin Georgekutty"
    className="h-full w-full object-cover"
  />
</div>

                    <p className="mt-2 text-[8px] uppercase tracking-[0.18em] text-pink-500">
                      Founder & CEO · Jeruto Group
                    </p>

                  </div>

                </div>


              
                

              </div>

            </div>

          </div>

        </section>




        {/* =====================================================
            FUTURE VISION
        ===================================================== */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">

              <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[280px] w-[280px] rounded-full bg-yellow-400/[0.035] blur-3xl" />

              <div className="relative p-6 sm:p-8 lg:p-10">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-yellow-400/80">
                  The JMI Vision
                </p>

                <h2 className="mt-3 max-w-2xl text-xl font-semibold tracking-[-0.025em] text-zinc-100 sm:text-2xl">
                  More than a database.
                </h2>

                <p className="mt-3 max-w-2xl text-[11px] leading-6 text-zinc-500 sm:text-xs sm:leading-6">
                  JMI is evolving into a complete movie intelligence
                  ecosystem where structured data, analytics and
                  intelligent tools come together to help understand
                  Indian cinema.
                </p>


                <div className="mt-7 grid gap-2 md:grid-cols-3">

                  <FutureCard
                    title="Live Tracking 🚨"
                    description="Real-time India and overseas market intelligence."
                  />

                  <FutureCard
                    title="JMI Game Zone 🎮"
                    description="Engage in Cinema oriented Games and entertainments."
                  />

                  <FutureCard
                    title="JMI AI 👨‍🔧"
                    description="Ask questions and explore the intelligence inside JMI."
                  />

                </div>

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

          <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div>

              <p className="font-serif text-sm font-medium text-zinc-300">
                Jeruto{" "}
                <span className="text-yellow-400">
                  Movie Intelligence
                </span>
              </p>

              <p className="mt-1 text-[9px] text-zinc-700">
                India's Next Generation Movie Intelligence Platform
              </p>

            </div>

            <p className="text-[9px] text-zinc-700">
              JMI · Building the future of movie intelligence
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}


/* ============================================================
   DATABASE METRIC
============================================================ */

function DatabaseMetric({
  value,
  label,
  description,
}: {
  value: string;
  label: string;
  description: string;
}) {
  return (
    <div className="min-w-0 px-3 py-5 sm:px-4 sm:py-6">

      <p className="text-xl font-semibold tracking-[-0.035em] text-green-400 sm:text-2xl">
        {value}
      </p>

      <p className="mt-1.5 whitespace-nowrap text-[10px] font-normal text-zinc-300 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 text-[8px] leading-4 text-zinc-400 sm:text-[9px]">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   BOX OFFICE METRIC — PREMIUM STAT CARD
============================================================ */

function BoxOfficeMetric({
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
        group relative overflow-hidden
        rounded-xl
        border
        px-3 py-4
        transition-all duration-300
        
        sm:px-5 sm:py-5

        ${highlight
          ? " text-zinc-400 border-violet-400 bg-violet-400/[0.035] hover:border-violet-400/40 hover:bg-violet-400/[0.055]"
          : "border-violet-400 bg-zinc-950 hover:border-violet-400/20 hover:bg-zinc-900/60"
        }
      `}
    >

      {/* Subtle top accent */}

      <div
        className={`
          absolute left-0 top-0 h-px w-0
          transition-all duration-300
          group-hover:w-full
          ${highlight
            ? "bg-violet-400"
            : "bg-violet-400/50"
          }
        `}
      />


      {/* Label */}

      <p
        className={`
          text-[6px]
          font-small
          uppercase
          tracking-[0.16em]
          sm:text-[6px]
          ${highlight
            ? "text-yellow-300"
            : "text-yellow-300"
          }
        `}
      >
        {label}
      </p>


      {/* Value */}

      <p
        className={`
          mt-2
          whitespace-nowrap
          text-[13px]
          font-medium
          tracking-[-0.035em]
          sm:text-xl
          ${highlight
            ? "text-green-400"
            : "text-green-400"
          }
        `}
      >
        {value}
      </p>


      {/* Tiny indicator */}

      <div
        className={`
          mt-2
          h-px
          w-3
          transition-all
          duration-300
          group-hover:w-6
          ${highlight
            ? "bg-violet-400/50"
            : "bg-zinc-800"
          }
        `}
      />

    </div>

  );
}


/* ============================================================
   RECENT MOVIE
============================================================ */

function RecentMovie({
  title,
  language,
  year,
  href,
}: {
  title: string;
  language: string;
  year: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-zinc-600
        bg-zinc-950
        px-3.5
        py-3

        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:border-violet-400/30
        hover:bg-violet-500/[0.025]

        active:scale-[0.98]
        active:border-violet-400/50
      "
    >

      {/* Movie icon */}

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-green-400
          bg-violet-500/[0.04]
          text-violet-400/80

          transition-all
          duration-300

          group-hover:border-violet-400/40
          group-hover:bg-violet-500/[0.08]
          group-hover:text-violet-300
        "
      >

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />

          <path d="M7 5v14" />
          <path d="M17 5v14" />
          <path d="M3 9h4" />
          <path d="M17 9h4" />
          <path d="M3 15h4" />
          <path d="M17 15h4" />
        </svg>

      </div>


      {/* Information */}

      <div className="min-w-0 flex-1">

        <p
          className="
            truncate
            text-[11px]
            font-medium
            text-zinc-200

            transition-colors

            group-hover:text-white
          "
        >
          {title}
        </p>

        <p className="mt-0.5 text-[8px] text-zinc-500">
          {language} · {year}
        </p>

      </div>


      {/* Arrow */}

      <span
        className="
          text-[11px]
          text-zinc-700

          transition-all
          duration-300

          group-hover:translate-x-0.5
          group-hover:text-violet-400
        "
      >
        →
      </span>

    </Link>
  );
}

/* ============================================================
   JMI FEATURE
============================================================ */

function JmiFeature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative flex gap-3">

      {/* Number */}

      <div className="flex-shrink-0 pt-0.5">

        <span
          className="
            flex h-6 w-6
            items-center justify-center
            rounded-md
            border border-violet-400
            bg-violet-400/[0.035]
            text-[7px]
            font-medium
            tracking-[0.12em]
            text-violet-400
            transition-all
            duration-300
            group-hover:border-violet-400/30
            group-hover:text-violet-400
          "
        >
          {number}
        </span>

      </div>


      {/* Content */}

      <div className="min-w-0">

        <h3
          className="
            text-[11px]
            font-medium
            tracking-[-0.01em]
            text-violet-400
            transition-colors
            duration-300
            group-hover:text-white
            sm:text-xs
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-1
            text-[9px]
            leading-5
            text-zinc-400
            sm:text-[10px]
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   HISTORICAL RECORD
============================================================ */

function HistoricalRecord({
  value,
  label,
  description,
}: {
  value: string;
  label: string;
  description: string;
}) {
  return (
    <div
      className="
        group
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        px-4
        py-4

        transition-all
        duration-300

        hover:border-yellow-400/20
        hover:bg-yellow-400/[0.015]
      "
    >

      <div className="flex items-start justify-between">

        <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-zinc-700">
          Record
        </p>

        <span
          className="
            text-[10px]
            text-yellow-400/40

            transition-colors

            group-hover:text-yellow-400/70
          "
        >
          ◆
        </span>

      </div>


      <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-zinc-100">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-medium text-zinc-300">
        {label}
      </p>

      <p className="mt-1 text-[8px] leading-4 text-zinc-700">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   PRINCIPLE CARD
============================================================ */

function PrincipleCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        rounded-lg
        border
        border-zinc-800
        bg-black/40
        px-4
        py-3.5

        transition-colors
        duration-300

        hover:border-violet-400/20
      "
    >

      <p className="text-[1px] font-medium text-zinc-200">
        {title}
      </p>

      <p className="mt-1 text-[1px] leading-4 text-zinc-700">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   EXPLORE CARD — PREMIUM INTELLIGENCE BUTTON
============================================================ */

function ExploreCard({
  number,
  title,
  description,
  href,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
  icon:
  | "movie"
  | "boxoffice"
  | "market"
  | "people"
  | "company"
  | "industry"
  | "insights";
}) {
  return (
    <Link
      href={href}
      className="
        group relative
        min-h-[132px]
        overflow-hidden
        rounded-xl
        border border-violet-600/25
        bg-zinc-950
        p-3.5

        transition-all duration-300 ease-out

        hover:-translate-y-0.5
        hover:border-violet-400/60
        hover:bg-violet-500/[0.035]

        active:scale-[0.97]
        active:border-violet-400/70
        active:bg-violet-500/[0.07]

        focus:outline-none
        focus:ring-1
        focus:ring-violet-400/60

        sm:min-h-[145px]
        sm:p-4
      "
    >



      {/* =====================================================
          TOP VIOLET ACCENT
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute left-1/2 top-0
          h-px w-0
          -translate-x-1/2
          bg-violet-400
          opacity-0
          transition-all duration-500

          group-hover:w-1/2
          group-hover:opacity-70
        "
      />


      {/* =====================================================
          SUBTLE CORNER LIGHT
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-20
          w-20
          rounded-full
          bg-violet-500/0
          blur-2xl
          transition-all duration-500

          group-hover:bg-violet-500/10
        "
      />


      {/* =====================================================
          TOP ROW
      ===================================================== */}

      <div className="relative flex items-center justify-between">

        {/* Number */}

        <span
          className="
            text-[9px]
            font-medium
            tracking-[0.25em]
            text-pink-400
            transition-colors duration-300

            group-hover:text-violet-500/80
          "
        >
          {number}
        </span>


        {/* Icon */}

        <div
          className="
            flex h-8 w-8
            items-center justify-center
            rounded-lg
            border border-violet-500/20
            bg-violet-500/[0.045]
            text-violet-400/80

            transition-all duration-300

            group-hover:border-violet-400/50
            group-hover:bg-violet-500/10
            group-hover:text-violet-300

            group-active:scale-90
          "
        >
          <IntelligenceIcon type={icon} />
        </div>

      </div>


      {/* =====================================================
          TITLE
      ===================================================== */}

      <h3
        className="
          relative
          mt-4
          text-[12px]
          font-medium
          tracking-[-0.01em]
          text-green-500

          transition-colors duration-300

          group-hover:text-white

          sm:text-sm
        "
      >
        {title}
      </h3>


      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <p
        className="
          relative
          mt-1.5
          line-clamp-2
          text-[9px]
          leading-4
          text-zinc-400

          transition-colors duration-300

          group-hover:text-zinc-500
        "
      >
        {description}
      </p>


      {/* =====================================================
          EXPLORE LINK
      ===================================================== */}

      <div
        className="
          relative
          mt-3
          flex
          items-center
          gap-1
        "
      >

        <span
          className="
            text-[9px]
            font-medium
            tracking-wide
            text-violet-400/80

            transition-colors duration-300

            group-hover:text-violet-300
          "
        >
          Explore
        </span>

        <span
          className="
            text-[10px]
            text-violet-500/60

            transition-all duration-300

            group-hover:translate-x-1
            group-hover:text-violet-300
          "
        >
          →
        </span>

      </div>


      {/* =====================================================
          BOTTOM ACCENT
      ===================================================== */}

      <div
        className="
          absolute
          bottom-0
          left-3.5
          h-px
          w-5
          bg-violet-500/20

          transition-all duration-300

          group-hover:w-10
          group-hover:bg-violet-400/60

          sm:left-4
        "
      />

    </Link>
  );
}


/* ============================================================
   INTELLIGENCE ICONS
============================================================ */

function IntelligenceIcon({
  type,
}: {
  type:
  | "movie"
  | "boxoffice"
  | "market"
  | "people"
  | "company"
  | "industry"
  | "insights";
}) {

  const commonProps = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };


  switch (type) {

    /* ========================================================
       MOVIES
    ======================================================== */

    case "movie":
      return (
        <svg {...commonProps} aria-hidden="true">

          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />

          <path d="M7 5v14" />

          <path d="M17 5v14" />

          <path d="M3 9h4" />

          <path d="M17 9h4" />

          <path d="M3 15h4" />

          <path d="M17 15h4" />

        </svg>
      );


    /* ========================================================
       BOX OFFICE
    ======================================================== */

    case "boxoffice":
      return (
        <svg {...commonProps} aria-hidden="true">

          <path d="M4 19V9" />

          <path d="M10 19V5" />

          <path d="M16 19v-8" />

          <path d="M22 19H2" />

          <path d="M4 9l3-3 3 2 5-5 3 2" />

        </svg>
      );


    /* ========================================================
       MARKET INTELLIGENCE
    ======================================================== */

    case "market":
      return (
        <svg {...commonProps} aria-hidden="true">

          <path d="M4 19V5" />

          <path d="M4 19h16" />

          <path d="M7 15l4-4 3 2 5-6" />

          <path d="M16 7h3v3" />

        </svg>
      );


    /* ========================================================
       PEOPLE
    ======================================================== */

    case "people":
      return (
        <svg {...commonProps} aria-hidden="true">

          <circle
            cx="12"
            cy="8"
            r="3.5"
          />

          <path d="M5 20c.7-3.4 3.1-5 7-5s6.3 1.6 7 5" />

          <path d="M18 5.5c1.5.3 2.5 1.4 2.5 2.8" />

          <path d="M3.5 8.3c0-1.4 1-2.5 2.5-2.8" />

        </svg>
      );


    /* ========================================================
       COMPANIES
    ======================================================== */

    case "company":
      return (
        <svg {...commonProps} aria-hidden="true">

          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="1.5"
          />

          <path d="M8 20V8h8v12" />

          <path d="M10 11h1" />

          <path d="M13 11h1" />

          <path d="M10 14h1" />

          <path d="M13 14h1" />

          <path d="M11 20v-3h2v3" />

        </svg>
      );


    /* ========================================================
       INDUSTRIES
    ======================================================== */

    case "industry":
      return (
        <svg {...commonProps} aria-hidden="true">

          <path d="M3 21h18" />

          <path d="M5 21V9l6-4v16" />

          <path d="M11 21V7l8-4v18" />

          <path d="M8 12h1" />

          <path d="M8 15h1" />

          <path d="M15 10h1" />

          <path d="M15 13h1" />

          <path d="M15 16h1" />

        </svg>
      );


    /* ========================================================
       INSIGHTS
    ======================================================== */

    case "insights":
      return (
        <svg {...commonProps} aria-hidden="true">

          <circle
            cx="12"
            cy="12"
            r="8"
          />

          <path d="M12 8v4l3 2" />

          <path d="M12 2v2" />

          <path d="M12 20v2" />

          <path d="M2 12h2" />

          <path d="M20 12h2" />

        </svg>
      );


    default:
      return null;
  }
}


/* ============================================================
   FUTURE CARD
============================================================ */

function FutureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-violet-500/60 bg-black/60 px-4 py-4">

      <p className="text-[11px] font-medium text-pink-400">
        {title}
      </p>

      <p className="mt-1.5 text-[9px] leading-5 text-zinc-500">
        {description}
      </p>

    </div>
  );

}