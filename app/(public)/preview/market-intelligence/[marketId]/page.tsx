import PublicHeader from "../../../components/PublicHeader";

export default function MarketIntelligencePage() {
  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      <main>

        {/* =====================================================
            MARKET HEADER
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="rounded-md border border-violet-400/20 bg-violet-400/[0.035] px-2 py-1 text-[8px] font-medium uppercase tracking-[0.15em] text-violet-400">
                    JMI Market Intelligence
                  </span>

                  <span className="text-[8px] text-zinc-700">
                    State Market
                  </span>

                </div>

                <h1 className="mt-4 text-2xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-3xl lg:text-4xl">
                  Kerala Market
                </h1>

                <p className="mt-2 text-[10px] text-zinc-600 sm:text-[11px]">
                  Kerala · South India · Indian Cinema
                </p>

              </div>

              <div className="flex gap-2">

                <span className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-[8px] uppercase tracking-[0.15em] text-zinc-600">
                  JMI Market
                </span>

                <span className="rounded-md border border-violet-400/20 bg-violet-400/[0.035] px-3 py-2 text-[8px] uppercase tracking-[0.15em] text-violet-400">
                  Tracked
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            MARKET SNAPSHOT
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Market Overview"
              title="The market at a glance."
            />

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

              <InfoCard
                label="Cities"
                value="100+"
              />

              <InfoCard
                label="Screens"
                value="—"
              />

              <InfoCard
                label="Movies Tracked"
                value="—"
              />

              <InfoCard
                label="Population Market"
                value="—"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            BOX OFFICE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Market Box Office"
              title="Theatrical value of the market."
              description="JMI aggregates movie-level performance to understand the overall scale of a state market."
            />

            <div className="mt-6 grid gap-2 sm:grid-cols-3">

              <CollectionCard
                label="India Gross Contribution"
                value="₹—"
              />

              <CollectionCard
                label="Market Gross"
                value="₹—"
              />

              <CollectionCard
                label="Market Share"
                value="—%"
                highlight
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            CITY INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="City Intelligence"
              title="How the market behaves city by city."
              description="Future JMI tracking will allow city-level theatrical performance to be studied within the state."
            />

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

              <CityCard
                rank="01"
                city="Kochi"
                value="₹—"
              />

              <CityCard
                rank="02"
                city="Trivandrum"
                value="₹—"
              />

              <CityCard
                rank="03"
                city="Kozhikode"
                value="₹—"
              />

              <CityCard
                rank="04"
                city="Thrissur"
                value="₹—"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            LANGUAGE INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Language Intelligence"
              title="What languages perform in the market."
              description="Understand audience response to different language industries within the state."
            />

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

              <LanguageCard
                code="ML"
                title="Malayalam"
                value="—"
              />

              <LanguageCard
                code="TA"
                title="Tamil"
                value="—"
              />

              <LanguageCard
                code="TE"
                title="Telugu"
                value="—"
              />

              <LanguageCard
                code="HI"
                title="Hindi"
                value="—"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            GENRE BEHAVIOUR
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Audience Behaviour"
              title="What types of movies connect with audiences."
              description="JMI can eventually identify genre-level patterns within the state market."
            />

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

              <GenreCard
                title="Drama"
                value="— Movies"
              />

              <GenreCard
                title="Comedy"
                value="— Movies"
              />

              <GenreCard
                title="Action"
                value="— Movies"
              />

              <GenreCard
                title="Thriller"
                value="— Movies"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            INDUSTRY PERFORMANCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Industry Performance"
              title="Which industries perform here."
            />

            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

              <MarketIndustryRow
                industry="Malayalam Cinema"
                value="—"
              />

              <MarketIndustryRow
                industry="Tamil Cinema"
                value="—"
              />

              <MarketIndustryRow
                industry="Telugu Cinema"
                value="—"
              />

              <MarketIndustryRow
                industry="Hindi Cinema"
                value="—"
              />

              <MarketIndustryRow
                industry="Other Industries"
                value="—"
                last
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            HISTORICAL PERFORMANCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Historical Market Performance"
              title="The market through time."
              description="Historical records can reveal how audience behaviour and theatrical scale have changed over the years."
            />

            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

              <HistoryRow
                year="2026"
                movies="—"
                gross="₹—"
              />

              <HistoryRow
                year="2025"
                movies="—"
                gross="₹—"
              />

              <HistoryRow
                year="2024"
                movies="—"
                gross="₹—"
              />

              <HistoryRow
                year="2023"
                movies="—"
                gross="₹—"
              />

              <HistoryRow
                year="2022"
                movies="—"
                gross="₹—"
                last
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            MARKET TRENDS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Market Trends"
              title="Understanding the direction of the market."
            />

            <div className="mt-6 grid gap-2 sm:grid-cols-3">

              <TrendCard
                icon="↗️"
                title="Market Growth"
                description="Track changes in theatrical performance across years."
              />

              <TrendCard
                icon="◈"
                title="Audience Behaviour"
                description="Identify changing preferences across languages and genres."
              />

              <TrendCard
                icon="▣"
                title="Theatrical Expansion"
                description="Understand changes in screens, cities and market reach."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            LIVE TRACKING
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <div className="flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400/70" />

                  <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                    Future Live Tracking
                  </p>

                </div>

                <h2 className="mt-3 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  Real-time market intelligence.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                  JMI's future live tracking layer will allow users
                  to observe real-time theatrical activity across
                  cities, screens, shows and markets.
                </p>


                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <LiveTile
                    icon="◉"
                    title="Shows"
                  />

                  <LiveTile
                    icon="▣"
                    title="Screens"
                  />

                  <LiveTile
                    icon="₹"
                    title="Collections"
                  />

                  <LiveTile
                    icon="↗️"
                    title="Market Trend"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            JMI MARKET ANALYTICS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  JMI Market Analytics
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  The intelligence layer.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                  JMI will combine box office, screens, cities,
                  languages, genres, industries and historical
                  records to understand how this market behaves.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <AnalyticsTile
                    icon="↗️"
                    title="Market Growth"
                  />

                  <AnalyticsTile
                    icon="₹"
                    title="Box Office"
                  />

                  <AnalyticsTile
                    icon="◈"
                    title="Audience Trends"
                  />

                  <AnalyticsTile
                    icon="◆"
                    title="Historical Context"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FUTURE TOOLS
        ===================================================== */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">

            <div className="grid gap-2 sm:grid-cols-2">

              <FutureTool
                icon="⇄"
                title="Compare markets"
                description="Compare two state markets through the future JMI comparison engine."
              />

              <FutureTool
                icon="✦"
                title="Ask JMI AI"
                description="Ask questions about audience behaviour and market performance through the future JMI AI layer."
              />

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
   SECTION HEADING
============================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>

      <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100 sm:text-xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
          {description}
        </p>
      )}

    </div>
  );
}


/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">

      <p className="text-[8px] uppercase tracking-[0.15em] text-zinc-700">
        {label}
      </p>

      <p className="mt-2 text-[11px] font-medium text-zinc-300">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   COLLECTION CARD
============================================================ */

function CollectionCard({
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
      className={`rounded-xl border px-5 py-5 ${
        highlight
          ? "border-violet-400/20 bg-violet-400/[0.035]"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >

      <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
        {label}
      </p>

      <p
        className={`mt-3 text-xl font-medium tracking-[-0.03em] ${
          highlight ? "text-violet-400" : "text-zinc-200"
        }`}
      >
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   CITY CARD
============================================================ */

function CityCard({
  rank,
  city,
  value,
}: {
  rank: string;
  city: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

      <div className="flex items-center justify-between">

        <span className="text-[8px] tracking-[0.2em] text-zinc-700">
          {rank}
        </span>

        <span className="text-[8px] text-zinc-800">
          ↗️
        </span>

      </div>

      <p className="mt-4 text-[10px] font-medium text-zinc-400">
        {city}
      </p>

      <p className="mt-1 text-[9px] text-zinc-700">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   LANGUAGE CARD
============================================================ */

function LanguageCard({
  code,
  title,
  value,
}: {
  code: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

      <span className="flex h-6 w-fit items-center rounded-md border border-violet-400/15 bg-violet-400/[0.035] px-2 text-[7px] font-medium text-violet-400/80">
        {code}
      </span>

      <p className="mt-4 text-[10px] font-medium text-zinc-400">
        {title}
      </p>

      <p className="mt-1 text-[9px] text-zinc-700">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   GENRE CARD
============================================================ */

function GenreCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">

      <p className="text-[10px] font-medium text-zinc-400">
        {title}
      </p>

      <p className="mt-1.5 text-[9px] text-zinc-700">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   MARKET INDUSTRY ROW
============================================================ */

function MarketIndustryRow({
  industry,
  value,
  last = false,
}: {
  industry: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-4 ${
        !last ? "border-b border-zinc-800" : ""
      }`}
    >

      <span className="text-[9px] text-zinc-500">
        {industry}
      </span>

      <span className="text-[10px] font-medium text-zinc-300">
        {value}
      </span>

    </div>
  );
}


/* ============================================================
   HISTORY ROW
============================================================ */

function HistoryRow({
  year,
  movies,
  gross,
  last = false,
}: {
  year: string;
  movies: string;
  gross: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-3 items-center px-4 py-4 ${
        !last ? "border-b border-zinc-800" : ""
      }`}
    >

      <span className="text-[9px] font-medium text-violet-400/70">
        {year}
      </span>

      <span className="text-[9px] text-zinc-500">
        {movies}
      </span>

      <span className="text-right text-[10px] font-medium text-zinc-300">
        {gross}
      </span>

    </div>
  );
}


/* ============================================================
   TREND CARD
============================================================ */

function TrendCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-violet-400/15 bg-violet-400/[0.035] text-xs text-violet-400/80">
        {icon}
      </span>

      <h3 className="mt-4 text-[11px] font-medium text-zinc-300">
        {title}
      </h3>

      <p className="mt-2 text-[9px] leading-5 text-zinc-600">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   LIVE TILE
============================================================ */

function LiveTile({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/50 px-3 py-3">

      <span className="text-xs text-violet-400/70">
        {icon}
      </span>

      <p className="mt-2 text-[9px] font-medium text-zinc-400">
        {title}
      </p>

    </div>
  );
}


/* ============================================================
   ANALYTICS TILE
============================================================ */

function AnalyticsTile({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/50 px-3 py-3">

      <span className="text-xs text-violet-400/70">
        {icon}
      </span>

      <p className="mt-2 text-[9px] font-medium text-zinc-400">
        {title}
      </p>

    </div>
  );
}


/* ============================================================
   FUTURE TOOL
============================================================ */

function FutureTool({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

      <div className="flex items-center gap-3">

        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-violet-400/15 bg-violet-400/[0.035] text-xs text-violet-400/80">
          {icon}
        </span>

        <h3 className="text-[11px] font-medium text-zinc-300">
          {title}
        </h3>

      </div>

      <p className="mt-3 text-[9px] leading-5 text-zinc-600">
        {description}
      </p>

    </div>
  );
}