import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function IndustriesPage() {
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

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-red-400">
                JMI Industries
              </p>

              <h1 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-3xl">
                The industries that shape Indian cinema.
              </h1>

              <p className="mt-3 max-w-2xl text-[11px] leading-5 text-zinc-600 sm:text-xs">
                Explore India's film industries through movies,
                people, companies, markets and box-office intelligence.
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
                    placeholder="Search industries..."
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none placeholder:text-zinc-700"
                  />

                </div>

                <button
                  type="button"
                  className="bg-red-400 px-4 text-[10px] font-medium text-black transition hover:bg-red-300"
                >
                  Search
                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            INDUSTRY SNAPSHOT
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              <IndustryStat
                value="12"
                label="Industries"
              />

              <IndustryStat
                value="18"
                label="Languages"
              />

              <IndustryStat
                value="07"
                label="Movies"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            INDIAN FILM INDUSTRIES
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-red-400">
                Indian Film Industries
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100 sm:text-xl">
                Every industry has its own ecosystem.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                Explore individual cinema industries and understand
                how their movies, people, companies and markets connect.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">

              <IndustryCard
                number="01"
                icon="ML"
                title="Malayalam"
                description="Malayalam cinema, talent, companies and market performance."
              />

              <IndustryCard
                number="02"
                icon="TE"
                title="Telugu"
                description="Telugu cinema and its theatrical ecosystem."
              />

              <IndustryCard
                number="03"
                icon="TA"
                title="Tamil"
                description="Tamil cinema, market behaviour and industry performance."
              />

              <IndustryCard
                number="04"
                icon="KN"
                title="Kannada"
                description="Kannada cinema and regional theatrical intelligence."
              />

              <IndustryCard
                number="05"
                icon="HI"
                title="Hindi"
                description="Hindi cinema and its broad national market."
              />

              <IndustryCard
                number="06"
                icon="BN"
                title="Bengali"
                description="Bengali cinema, talent and regional performance."
              />

              <IndustryCard
                number="07"
                icon="MR"
                title="Marathi"
                description="Marathi cinema and its evolving market."
              />

              <IndustryCard
                number="08"
                icon="OT"
                title="Other Industries"
                description="Explore additional Indian cinema industries."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            INDUSTRY INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-red-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-red-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-red-400">
                  Industry Intelligence
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  An industry is more than its movies.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                  JMI connects movies, people, companies, box office
                  and markets to create a deeper picture of each
                  Indian film industry.
                </p>


                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <IndustryTile
                    icon="◈"
                    title="Movies"
                  />

                  <IndustryTile
                    icon="₹"
                    title="Box Office"
                  />

                  <IndustryTile
                    icon="✦"
                    title="People"
                  />

                  <IndustryTile
                    icon="▣"
                    title="Companies"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            INDUSTRY ANALYSIS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="grid gap-3 md:grid-cols-2">

              <IndustryAnalysis
                eyebrow="Performance"
                title="Measure the industry."
                description="Explore theatrical performance, movie output and market activity across individual film industries."
              />

              <IndustryAnalysis
                eyebrow="Ecosystem"
                title="Understand the ecosystem."
                description="Connect the people, companies, movies and markets that collectively shape an industry."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            CROSS-INDUSTRY INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-red-400">
              Cross-Industry Intelligence
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Compare cinema beyond language.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
              JMI's structured data allows Indian film industries
              to eventually be studied together through common
              performance and market dimensions.
            </p>


            <div className="mt-6 grid gap-2 sm:grid-cols-3">

              <CrossIndustryCard
                number="01"
                title="Box Office"
                description="Study theatrical performance across industries."
              />

              <CrossIndustryCard
                number="02"
                title="Market Reach"
                description="Understand where different industries perform."
              />

              <CrossIndustryCard
                number="03"
                title="Industry Trends"
                description="Identify changing patterns across Indian cinema."
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

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-red-400">
                JMI Industry Methodology
              </p>

              <h2 className="mt-2 text-lg font-medium text-zinc-100">
                Every industry, independently understood.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI treats each film industry as its own ecosystem,
                while maintaining a common data structure that allows
                meaningful analysis across Indian cinema.
              </p>

              <div className="mt-5 flex items-center gap-3">

                <span className="h-px w-8 bg-red-400/50" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  Industries · Markets · Cinema
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
   INDUSTRY STAT
============================================================ */

function IndustryStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">

      <p className="text-lg font-medium tracking-[-0.03em] text-red-400 sm:text-xl">
        {value}
      </p>

      <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-700">
        {label}
      </p>

    </div>
  );
}


/* ============================================================
   INDUSTRY CARD
============================================================ */

function IndustryCard({
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
    <Link
      href="#"
      className="
        group
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        p-4
        transition-all
        duration-300
        hover:border-red-400/25
        hover:bg-zinc-900/60
        active:scale-[0.99]
      "
    >

      <div className="flex items-center justify-between">

        <span className="text-[8px] tracking-[0.2em] text-zinc-700">
          {number}
        </span>

        <span
          className="
            flex h-7 w-7
            items-center justify-center
            rounded-md
            border border-red-400/15
            bg-red-400/[0.035]
            text-[8px]
            font-medium
            text-red-400/80
            transition-all
            duration-300
            group-hover:border-red-400/35
            group-hover:text-red-300
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

    </Link>
  );
}


/* ============================================================
   INDUSTRY TILE
============================================================ */

function IndustryTile({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/50 px-3 py-3">

      <span className="text-xs text-red-400/70">
        {icon}
      </span>

      <p className="mt-2 text-[9px] font-medium text-zinc-400">
        {title}
      </p>

    </div>
  );
}


/* ============================================================
   INDUSTRY ANALYSIS
============================================================ */

function IndustryAnalysis({
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

      <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-red-400/70">
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
   CROSS INDUSTRY CARD
============================================================ */

function CrossIndustryCard({
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