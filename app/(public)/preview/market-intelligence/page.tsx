import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function MarketIntelligencePage() {
  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      <main>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="max-w-3xl">

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                JMI Market Intelligence
              </p>

              <h1 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-3xl">
                Understanding the markets behind Indian cinema.
              </h1>

              <p className="mt-3 max-w-2xl text-[11px] leading-5 text-zinc-600 sm:text-xs">
                Explore the theatrical behaviour, performance and
                characteristics of South India's major state markets.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            MARKET SNAPSHOT
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

              <MarketStat
                value="04"
                label="State Markets"
              />

              <MarketStat
                value="100+"
                label="Cities"
              />

              <MarketStat
                value="7,822"
                label="Screens Tracked"
              />

              <MarketStat
                value="18"
                label="Languages"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            SOUTH INDIA MARKETS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                South Indian Markets
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100 sm:text-xl">
                Four markets. Different audiences. Different behaviour.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI studies regional theatrical markets individually to
                understand how audiences respond to movies across states.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

              <StateMarket
                code="KL"
                name="Kerala"
                description="Malayalam cinema & regional audience behaviour."
              />

              <StateMarket
                code="TN"
                name="Tamil Nadu"
                description="Tamil market performance & audience trends."
              />

              <StateMarket
                code="KA"
                name="Karnataka"
                description="Kannada market & multi-language performance."
              />

              <StateMarket
                code="AP/TG"
                name="Andhra Pradesh / Telangana"
                description="Telugu theatrical market intelligence."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            MARKET INTELLIGENCE LAYERS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                Market Intelligence
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                Look beyond the collection figure.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI connects theatrical performance with market-level
                information to provide a deeper understanding of regional cinema.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

              <MarketIntelligenceCard
                number="01"
                icon="₹"
                title="Market Performance"
                description="Understand theatrical performance across individual state markets."
              />

              <MarketIntelligenceCard
                number="02"
                icon="◉"
                title="Audience Behaviour"
                description="Study how different audiences respond to different types of cinema."
              />

              <MarketIntelligenceCard
                number="03"
                icon="◈"
                title="Language Performance"
                description="Compare how languages perform within regional markets."
              />

              <MarketIntelligenceCard
                number="04"
                icon="⌁"
                title="City & Screen"
                description="Understand the role of cities, screens and market reach."
              />

              <MarketIntelligenceCard
                number="05"
                icon="↗️"
                title="Market Trends"
                description="Identify changing patterns across regional theatrical markets."
              />

              <MarketIntelligenceCard
                number="06"
                icon="◆"
                title="Historical Analysis"
                description="Put current performances into their historical market context."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            STATE MARKET EXPLAINER
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="grid gap-3 md:grid-cols-2">

              <MarketExplainer
                eyebrow="Regional Intelligence"
                title="Why markets matter."
                description="A movie's performance is shaped by the market it enters. JMI separates regional markets to reveal differences that a single India-wide number can hide."
              />

              <MarketExplainer
                eyebrow="Audience Intelligence"
                title="Different audiences behave differently."
                description="Genre, language, star power, release strategy and local preferences can influence theatrical performance from one market to another."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            SOUTH INDIA COVERAGE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  South India
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  One region. Four distinct cinema markets.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                  JMI brings state-level market intelligence together
                  to create a broader picture of South Indian theatrical
                  performance.
                </p>


                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <CoverageTile
                    code="KL"
                    title="Kerala"
                  />

                  <CoverageTile
                    code="TN"
                    title="Tamil Nadu"
                  />

                  <CoverageTile
                    code="KA"
                    title="Karnataka"
                  />

                  <CoverageTile
                    code="AP/TG"
                    title="AP / Telangana"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            METHODOLOGY
        ===================================================== */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                JMI Market Methodology
              </p>

              <h2 className="mt-2 text-lg font-medium text-zinc-100">
                Regional data. Structured intelligence.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI separates markets wherever meaningful data is
                available, allowing users to understand regional
                performance rather than relying only on national totals.
              </p>

              <div className="mt-5 flex items-center gap-3">

                <span className="h-px w-8 bg-violet-400/50" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  Markets · Audiences · Performance
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
   MARKET STAT
============================================================ */

function MarketStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">

      <p className="text-lg font-medium tracking-[-0.03em] text-violet-400 sm:text-xl">
        {value}
      </p>

      <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-700">
        {label}
      </p>

    </div>
  );
}


/* ============================================================
   STATE MARKET
============================================================ */

function StateMarket({
  code,
  name,
  description,
}: {
  code: string;
  name: string;
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
        p-4
        transition-all
        duration-300
        hover:border-violet-400/25
        hover:bg-zinc-900/60
      "
    >

      <div className="flex items-center justify-between">

        <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-violet-400/15 bg-violet-400/[0.035] px-1 text-[7px] font-medium text-violet-400/80">
          {code}
        </span>

        <span className="text-[10px] text-zinc-800 transition-colors group-hover:text-violet-400/60">
          ↗️
        </span>

      </div>

      <h3 className="mt-5 text-[11px] font-medium text-zinc-300 group-hover:text-white">
        {name}
      </h3>

      <p className="mt-1.5 text-[9px] leading-5 text-zinc-700">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   MARKET INTELLIGENCE CARD
============================================================ */

function MarketIntelligenceCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: string;
  title: string;
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
        p-4
        transition-all
        duration-300
        hover:border-violet-400/25
        hover:bg-zinc-900/60
      "
    >

      <div className="flex items-center justify-between">

        <span className="text-[8px] tracking-[0.2em] text-zinc-700">
          {number}
        </span>

        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-black text-[10px] text-violet-400/70 transition-all duration-300 group-hover:border-violet-400/30 group-hover:text-violet-300">
          {icon}
        </span>

      </div>

      <h3 className="mt-5 text-[11px] font-medium text-zinc-300 group-hover:text-white">
        {title}
      </h3>

      <p className="mt-1.5 text-[9px] leading-5 text-zinc-700">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   MARKET EXPLAINER
============================================================ */

function MarketExplainer({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

      <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400/70">
        {eyebrow}
      </p>

      <h3 className="mt-3 text-sm font-medium text-zinc-200">
        {title}
      </h3>

      <p className="mt-2 text-[9px] leading-5 text-zinc-600">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   COVERAGE TILE
============================================================ */

function CoverageTile({
  code,
  title,
}: {
  code: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/50 px-3 py-3">

      <p className="text-[8px] font-medium tracking-[0.15em] text-violet-400/70">
        {code}
      </p>

      <p className="mt-2 text-[9px] font-medium text-zinc-400">
        {title}
      </p>

    </div>
  );
}