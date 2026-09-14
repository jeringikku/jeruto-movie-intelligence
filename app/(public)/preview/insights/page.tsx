import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function InsightsPage() {
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
                JMI Insights
              </p>

              <h1 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-3xl">
                Intelligence that connects the data.
              </h1>

              <p className="mt-3 max-w-2xl text-[11px] leading-5 text-zinc-600 sm:text-xs">
                Discover deeper perspectives from the movies, people,
                companies, industries and markets tracked by JMI.
              </p>

            </div>


            {/* Search */}

            <div className="mt-7 max-w-2xl">

              <div className="flex h-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">

                <div className="flex min-w-0 flex-1 items-center px-3">

                  <span className="mr-2 text-xs text-zinc-700">
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Search JMI insights..."
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none placeholder:text-zinc-700"
                  />

                </div>

                <button
                  type="button"
                  className="bg-violet-400 px-4 text-[10px] font-medium text-black transition hover:bg-violet-300"
                >
                  Search
                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            INSIGHT SNAPSHOT
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              <InsightStat
                value="07"
                label="Movies"
              />

              <InsightStat
                value="18"
                label="Languages"
              />

              <InsightStat
                value="12"
                label="Industries"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            EXPLORE INSIGHTS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                Explore Insights
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100 sm:text-xl">
                Find the story behind the numbers.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI insights bring different parts of the database
                together to reveal patterns, trends and perspectives.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

              <InsightCard
                number="01"
                icon="₹"
                title="Box Office Insights"
                description="Explore notable theatrical performances and collection trends."
              />

              <InsightCard
                number="02"
                icon="↗️"
                title="Market Insights"
                description="Discover patterns across states, cities and regional markets."
              />

              <InsightCard
                number="03"
                icon="✦"
                title="People Insights"
                description="Explore career patterns, filmography and professional trends."
              />

              <InsightCard
                number="04"
                icon="▣"
                title="Company Insights"
                description="Understand production and distribution business trends."
              />

              <InsightCard
                number="05"
                icon="◆"
                title="Industry Insights"
                description="Explore changing patterns across Indian film industries."
              />

              <InsightCard
                number="06"
                icon="◈"
                title="Historical Insights"
                description="Put current cinema performance into historical perspective."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            DATA CONNECTION
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  Connected Intelligence
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  The value is in the connections.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                  A movie can connect to its people, companies,
                  industry, markets and box-office performance.
                  JMI brings these relationships together to create
                  deeper intelligence.
                </p>


                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <InsightTile
                    icon="🎬"
                    title="Movies"
                  />

                  <InsightTile
                    icon="◉"
                    title="People"
                  />

                  <InsightTile
                    icon="▣"
                    title="Companies"
                  />

                  <InsightTile
                    icon="₹"
                    title="Markets"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            ANALYTICAL PERSPECTIVES
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="grid gap-3 md:grid-cols-2">

              <PerspectiveCard
                eyebrow="Patterns"
                title="What is changing?"
                description="Identify movements and patterns across movies, markets, industries and careers."
              />

              <PerspectiveCard
                eyebrow="Context"
                title="Why does it matter?"
                description="Move beyond isolated figures and understand performance within its wider cinema ecosystem."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            FUTURE INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                The Next Layer
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                Intelligence will become interactive.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI is being designed to eventually let users
                explore the database in entirely new ways.
              </p>

            </div>


            <div className="grid gap-2 sm:grid-cols-2">

              <FutureIntelligenceCard
                icon="⇄"
                title="JMI Compare"
                description="Compare movies, people, companies, industries and markets through automated intelligence reports."
              />

              <FutureIntelligenceCard
                icon="✦"
                title="JMI AI"
                description="Ask questions about Indian cinema and receive answers built from the intelligence inside JMI."
              />

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
                JMI Insight Methodology
              </p>

              <h2 className="mt-2 text-lg font-medium text-zinc-100">
                Intelligence built from structured data.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI insights are designed around relationships
                between structured movie, people, company, market
                and industry data.
              </p>

              <div className="mt-5 flex items-center gap-3">

                <span className="h-px w-8 bg-violet-400/50" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  Data · Context · Intelligence
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
   INSIGHT STAT
============================================================ */

function InsightStat({
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
   INSIGHT CARD
============================================================ */

function InsightCard({
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

        <span
          className="
            flex h-6 w-6
            items-center justify-center
            rounded-md
            border border-zinc-800
            bg-black
            text-[10px]
            text-violet-400/70
            transition-all
            duration-300
            group-hover:border-violet-400/30
            group-hover:text-violet-300
          "
        >
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
   INSIGHT TILE
============================================================ */

function InsightTile({
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
   PERSPECTIVE CARD
============================================================ */

function PerspectiveCard({
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
   FUTURE INTELLIGENCE CARD
============================================================ */

function FutureIntelligenceCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all duration-300 hover:border-violet-400/25">

      <div className="flex items-center gap-3">

        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-violet-400/15 bg-violet-400/[0.035] text-xs text-violet-400/80">
          {icon}
        </span>

        <h3 className="text-[11px] font-medium text-zinc-300 group-hover:text-white">
          {title}
        </h3>

      </div>

      <p className="mt-3 text-[9px] leading-5 text-zinc-600">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-2">

        <span className="h-px w-5 bg-violet-400/40" />

        <span className="text-[7px] uppercase tracking-[0.2em] text-zinc-700">
          Future layer
        </span>

      </div>

    </div>
  );
}