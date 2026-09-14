import Link from "next/link";
import PublicHeader from "../../../components/PublicHeader";

export default function IndustryIntelligencePage() {
  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      <main>

        {/* =====================================================
            INDUSTRY HEADER
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="rounded-md border border-violet-400/20 bg-violet-400/[0.035] px-2 py-1 text-[8px] font-medium uppercase tracking-[0.15em] text-violet-400">
                    JMI Industry Intelligence
                  </span>

                  <span className="text-[8px] text-zinc-700">
                    Industry Profile
                  </span>

                </div>

                <h1 className="mt-4 text-2xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-3xl lg:text-4xl">
                  Malayalam Cinema
                </h1>

                <p className="mt-2 text-[10px] text-zinc-600 sm:text-[11px]">
                  Malayalam · Kerala · Indian Cinema
                </p>

              </div>

              <div className="flex gap-2">

                <span className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-[8px] uppercase tracking-[0.15em] text-zinc-600">
                  JMI Profile
                </span>

                <span className="rounded-md border border-violet-400/20 bg-violet-400/[0.035] px-3 py-2 text-[8px] uppercase tracking-[0.15em] text-violet-400">
                  Tracked
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            INDUSTRY SNAPSHOT
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Industry Overview"
              title="The industry at a glance."
            />

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

              <InfoCard
                label="Movies"
                value="—"
              />

              <InfoCard
                label="People"
                value="—"
              />

              <InfoCard
                label="Companies"
                value="—"
              />

              <InfoCard
                label="Markets"
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
              eyebrow="Box Office Intelligence"
              title="The industry's theatrical performance."
              description="Aggregate box-office intelligence can reveal the scale and evolution of an entire film industry."
            />

            <div className="mt-6 grid gap-2 sm:grid-cols-3">

              <CollectionCard
                label="India Gross"
                value="₹—"
              />

              <CollectionCard
                label="Overseas Gross"
                value="₹—"
              />

              <CollectionCard
                label="Worldwide Gross"
                value="₹—"
                highlight
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            REGIONAL MARKET
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Market Intelligence"
              title="Where the industry performs."
              description="Understand how audiences across different regions respond to movies from the industry."
            />

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

              <MarketCard
                code="KL"
                title="Kerala"
                value="₹—"
              />

              <MarketCard
                code="TN"
                title="Tamil Nadu"
                value="₹—"
              />

              <MarketCard
                code="KA"
                title="Karnataka"
                value="₹—"
              />

              <MarketCard
                code="AP/TG"
                title="AP / Telangana"
                value="₹—"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            YEARLY PERFORMANCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Historical Performance"
              title="The industry through time."
              description="Historical records will allow JMI to identify long-term changes in production and theatrical performance."
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
            PEOPLE ECOSYSTEM
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="People Ecosystem"
              title="The people powering the industry."
            />

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

              <RoleStat
                icon="✦"
                label="Actors"
                value="—"
              />

              <RoleStat
                icon="◆"
                label="Directors"
                value="—"
              />

              <RoleStat
                icon="◈"
                label="Producers"
                value="—"
              />

              <RoleStat
                icon="✎"
                label="Writers"
                value="—"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            COMPANY ECOSYSTEM
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Business Ecosystem"
              title="Companies behind the industry."
              description="Production houses, distributors and other businesses form the commercial infrastructure of cinema."
            />

            <div className="mt-6 grid gap-2 sm:grid-cols-3">

              <BusinessCard
                icon="▣"
                title="Production Houses"
                value="—"
              />

              <BusinessCard
                icon="◆"
                title="Distributors"
                value="—"
              />

              <BusinessCard
                icon="◎"
                title="Other Businesses"
                value="—"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            GENRE INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Genre Intelligence"
              title="What audiences are watching."
              description="Genre-level analysis can reveal changing audience preferences across the industry."
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
            INDUSTRY TIMELINE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <SectionHeading
              eyebrow="Industry Timeline"
              title="The evolution of the industry."
            />

            <div className="mt-6 space-y-2">

              <TimelineItem
                year="2026"
                title="Current Era"
                description="Latest developments, movies and market activity."
              />

              <TimelineItem
                year="2020"
                title="Digital Expansion"
                description="Changing distribution, audience behaviour and business models."
              />

              <TimelineItem
                year="2010"
                title="Growth Phase"
                description="Expansion of theatrical reach and commercial scale."
              />

              <TimelineItem
                year="2000"
                title="Modern Era"
                description="Beginning of the modern JMI historical record."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            JMI INDUSTRY ANALYTICS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  JMI Industry Analytics
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  The intelligence layer.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                  JMI will eventually combine movies, people, companies,
                  markets, box office and historical records to create
                  a complete intelligence view of the industry.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <AnalyticsTile
                    icon="↗️"
                    title="Industry Growth"
                  />

                  <AnalyticsTile
                    icon="₹"
                    title="Box Office"
                  />

                  <AnalyticsTile
                    icon="◈"
                    title="Market Reach"
                  />

                  <AnalyticsTile
                    icon="◆"
                    title="Historical Trend"
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
                title="Compare industries"
                description="Compare two film industries through the future JMI comparison engine."
              />

              <FutureTool
                icon="✦"
                title="Ask JMI AI"
                description="Ask questions about an industry through the future JMI AI intelligence layer."
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
   MARKET CARD
============================================================ */

function MarketCard({
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
   ROLE STAT
============================================================ */

function RoleStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-violet-400/15 bg-violet-400/[0.035] text-[10px] text-violet-400/70">
        {icon}
      </span>

      <p className="mt-4 text-[10px] font-medium text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-[9px] text-zinc-700">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   BUSINESS CARD
============================================================ */

function BusinessCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-violet-400/15 bg-violet-400/[0.035] text-xs text-violet-400/70">
        {icon}
      </span>

      <h3 className="mt-4 text-[11px] font-medium text-zinc-300">
        {title}
      </h3>

      <p className="mt-1.5 text-[9px] text-zinc-700">
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
   TIMELINE
============================================================ */

function TimelineItem({
  year,
  title,
  description,
}: {
  year: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

      <div className="w-10 flex-shrink-0">

        <span className="text-[9px] font-medium text-violet-400/80">
          {year}
        </span>

      </div>

      <div>

        <h3 className="text-[10px] font-medium text-zinc-300">
          {title}
        </h3>

        <p className="mt-1 text-[9px] leading-5 text-zinc-700">
          {description}
        </p>

      </div>

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