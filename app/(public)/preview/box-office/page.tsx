import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

export default async function BoxOfficePage() {
  /* ============================================================
     LIVE BOX OFFICE COVERAGE
  ============================================================ */

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

  const formatCrores = (value: number) =>
    `₹${(value / 10000000).toFixed(2)} Cr;`

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

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-pink-400">
                JMI Box Office
              </p>

              <h1 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-3xl">
                The business of cinema, measured.
              </h1>

              <p className="mt-3 max-w-2xl text-[11px] leading-5 text-zinc-600 sm:text-xs">
                Explore theatrical performance across India and overseas
                markets through structured box-office intelligence.
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
                    placeholder="Search a movie..."
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none placeholder:text-zinc-700"
                  />

                </div>

                <button
                  type="button"
                  className="bg-pink-400 px-4 text-[10px] font-medium text-black transition hover:bg-pink-300"
                >
                  Search
                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            BOX OFFICE SNAPSHOT
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              <BoxOfficeStat
                label="India"
                value={formatCrores(indiaGross)}
              />

              <BoxOfficeStat
                label="Overseas"
                value={formatCrores(overseasGross)}
              />

              <BoxOfficeStat
                label="Worldwide"
                value={formatCrores(worldwideGross)}
                highlight
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            INTELLIGENCE LAYERS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-pink-400">
                Explore Box Office
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100 sm:text-xl">
                Multiple layers. One box-office intelligence system.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                Move beyond a single collection figure and understand
                how movies perform across markets, territories and time.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

              <IntelligenceCard
                number="01"
                icon="₹"
                title="India Box Office"
                description="State, territory and market-level theatrical performance."
              />

              <IntelligenceCard
                number="02"
                icon="$"
                title="Overseas"
                description="Country, region and major overseas territory performance."
              />

              <IntelligenceCard
                number="03"
                icon="◷"
                title="Advance Sales"
                description="Track advance bookings and pre-release demand."
              />

              <IntelligenceCard
                number="04"
                icon="◈"
                title="Business Analysis"
                description="Movie economics, recovery and business performance."
              />

              <IntelligenceCard
                number="05"
                icon="⌁"
                title="Territories"
                description="Understand performance across individual markets."
              />

              <IntelligenceCard
                number="06"
                icon="◆"
                title="Historical Records"
                description="Records, milestones and historic box-office performances."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            INDIA + OVERSEAS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="grid gap-3 md:grid-cols-2">

              {/* India */}

              <MarketCard
                icon="₹"
                eyebrow="India"
                title="India theatrical intelligence"
                description="Explore movie performance across states, territories, cities, screens and regional markets."
                items={[
                  "Territory performance",
                  "State market analysis",
                  "City & screen tracking",
                  "Day-wise collections",
                ]}
              />


              {/* Overseas */}

              <MarketCard
                icon="$"
                eyebrow="Overseas"
                title="International theatrical intelligence"
                description="Understand how Indian cinema performs across international markets."
                items={[
                  "Country-wise performance",
                  "GCC analysis",
                  "North America",
                  "Continental & territory data",
                ]}
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            BUSINESS & RECOVERY
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-pink-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-pink-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-pink-400">
                  Business Intelligence
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  Box office is only part of the story.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                  JMI connects theatrical collections with movie business,
                  recovery and market performance to provide a broader
                  understanding of a film's commercial journey.
                </p>


                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <BusinessTile
                    icon="₹"
                    title="Gross"
                  />

                  <BusinessTile
                    icon="↗️"
                    title="Recovery"
                  />

                  <BusinessTile
                    icon="◈"
                    title="Business"
                  />

                  <BusinessTile
                    icon="◆"
                    title="Performance"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            HISTORICAL INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-pink-400">
              Historical Intelligence
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Understand where today's records came from.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
              JMI preserves historical box-office information so today's
              performances can be understood in their wider context.
            </p>


            <div className="mt-6 grid gap-2 sm:grid-cols-3">

              <HistoryCard
                number="01"
                title="Top Performances"
                description="Explore landmark theatrical performances."
              />

              <HistoryCard
                number="02"
                title="Industry Records"
                description="Track milestones across Indian film industries."
              />

              <HistoryCard
                number="03"
                title="Market Records"
                description="Discover exceptional regional market performances."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            JMI PHILOSOPHY
        ===================================================== */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-pink-400">
                JMI Methodology
              </p>

              <h2 className="mt-2 text-lg font-medium text-zinc-100">
                Numbers with context.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI is designed to present theatrical data in a structured
                way, helping users understand not just how much a movie
                collected, but where, how and within what market context.
              </p>

              <div className="mt-5 flex items-center gap-3">

                <span className="h-px w-8 bg-pink-400/50" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  Data · Markets · Intelligence
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
   BOX OFFICE STAT
============================================================ */

function BoxOfficeStat({
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

        ${
          highlight
            ? "border-pink-400/25 bg-pink-400/[0.035] hover:border-pink-400/40"
            : "border-zinc-800 bg-zinc-950 hover:border-pink-400/20"
        }
      `}
    >

      <div
        className={`
          absolute left-0 top-0 h-px w-0
          transition-all duration-300
          group-hover:w-full
          ${
            highlight
              ? "bg-pink-400"
              : "bg-pink-400/50"
          }
        `}
      />

      <p
        className={`
          text-[7px]
          font-medium
          uppercase
          tracking-[0.16em]
          sm:text-[8px]
          ${
            highlight
              ? "text-pink-400/70"
              : "text-zinc-700"
          }
        `}
      >
        {label}
      </p>

      <p
        className={`
          mt-2
          whitespace-nowrap
          text-[15px]
          font-medium
          tracking-[-0.035em]
          sm:text-xl
          ${
            highlight
              ? "text-pink-400"
              : "text-zinc-200"
          }
        `}
      >
        {value}
      </p>

      <div
        className={`
          mt-2
          h-px
          w-3
          transition-all
          duration-300
          group-hover:w-6
          ${
            highlight
              ? "bg-pink-400/50"
              : "bg-zinc-800"
          }
        `}
      />

    </div>
  );
}


/* ============================================================
   INTELLIGENCE CARD
============================================================ */

function IntelligenceCard({
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
        hover:border-pink-400/25
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
            text-pink-400/70
            transition-all
            duration-300
            group-hover:border-pink-400/30
            group-hover:text-pink-300
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
   MARKET CARD
============================================================ */

function MarketCard({
  icon,
  eyebrow,
  title,
  description,
  items,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

      <div className="flex items-center gap-2">

        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-pink-400/20 bg-pink-400/[0.04] text-[10px] text-pink-400">
          {icon}
        </span>

        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-pink-400/70">
          {eyebrow}
        </p>

      </div>

      <h3 className="mt-4 text-sm font-medium text-zinc-200">
        {title}
      </h3>

      <p className="mt-2 text-[9px] leading-5 text-zinc-600">
        {description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">

        {items.map((item) => (
          <div
            key={item}
            className="rounded-md border border-zinc-800/80 bg-black/50 px-2.5 py-2"
          >
            <p className="text-[8px] text-zinc-600">
              {item}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}


/* ============================================================
   BUSINESS TILE
============================================================ */

function BusinessTile({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/50 px-3 py-3">

      <span className="text-xs text-pink-400/70">
        {icon}
      </span>

      <p className="mt-2 text-[9px] font-medium text-zinc-400">
        {title}
      </p>

    </div>
  );
}


/* ============================================================
   HISTORY CARD
============================================================ */

function HistoryCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">

      <span className="text-[8px] tracking-[0.2em] text-zinc-700">
        {number}
      </span>

      <h3 className="mt-4 text-[11px] font-medium text-zinc-300">
        {title}
      </h3>

      <p className="mt-1.5 text-[9px] leading-5 text-zinc-700">
        {description}
      </p>

    </div>
  );
}