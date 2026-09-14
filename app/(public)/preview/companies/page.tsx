import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function CompaniesPage() {
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
                JMI Companies
              </p>

              <h1 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-3xl">
                The businesses behind Indian cinema.
              </h1>

              <p className="mt-3 max-w-2xl text-[11px] leading-5 text-zinc-600 sm:text-xs">
                Explore production houses, distributors and film
                businesses through structured company intelligence.
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
                    placeholder="Search companies..."
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
            DATABASE SNAPSHOT
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              <CompanyStat
                value="17"
                label="Companies"
              />

              <CompanyStat
                value="18"
                label="Languages"
              />

              <CompanyStat
                value="12"
                label="Industries"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            COMPANY TYPES
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                Explore Companies
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100 sm:text-xl">
                Intelligence by business role.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI separates companies according to how they
                participate in the movie business.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

              <CompanyTypeCard
                number="01"
                icon="◈"
                title="Production Houses"
                description="Explore production history, movie portfolios and performance."
              />

              <CompanyTypeCard
                number="02"
                icon="↗️"
                title="Distributors"
                description="Understand distribution activity, markets and theatrical performance."
              />

              <CompanyTypeCard
                number="03"
                icon="▣"
                title="Film Businesses"
                description="Explore companies and businesses connected to the cinema ecosystem."
              />

              <CompanyTypeCard
                number="04"
                icon="₹"
                title="Box Office Association"
                description="Connect company portfolios with theatrical performance."
              />

              <CompanyTypeCard
                number="05"
                icon="⌁"
                title="Market Presence"
                description="Understand where companies operate across industries and markets."
              />

              <CompanyTypeCard
                number="06"
                icon="◆"
                title="Historical Records"
                description="Explore company milestones and long-term performance."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            COMPANY INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  Company Intelligence
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  A company is more than its filmography.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                  JMI connects a company's movies, box-office
                  performance, markets and industries to create a
                  broader view of its journey through Indian cinema.
                </p>


                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <CompanyIntelligenceTile
                    icon="◈"
                    title="Movie Portfolio"
                  />

                  <CompanyIntelligenceTile
                    icon="₹"
                    title="Box Office"
                  />

                  <CompanyIntelligenceTile
                    icon="↗️"
                    title="Growth"
                  />

                  <CompanyIntelligenceTile
                    icon="⌁"
                    title="Market Reach"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            BUSINESS ANALYSIS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="grid gap-3 md:grid-cols-2">

              <BusinessAnalysisCard
                eyebrow="Performance Intelligence"
                title="Understand the track record."
                description="Explore how a company's movies have performed across different periods, industries and theatrical markets."
              />

              <BusinessAnalysisCard
                eyebrow="Growth Intelligence"
                title="Understand the journey."
                description="Track changes in a company's activity, portfolio and market presence over time."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            COMPANY DATABASE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7 flex items-end justify-between gap-4">

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  Company Database
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  Explore companies in JMI.
                </h2>

              </div>

              <span className="hidden text-[9px] text-zinc-700 sm:block">
                Growing database
              </span>

            </div>


            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

              <CompanyCard
                initials="01"
                name="Featured Production House"
                type="Production"
              />

              <CompanyCard
                initials="02"
                name="Featured Distributor"
                type="Distribution"
              />

              <CompanyCard
                initials="03"
                name="Featured Film Business"
                type="Film Business"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            WHY COMPANY INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                Why Company Intelligence?
              </p>

              <h2 className="mt-2 text-lg font-medium text-zinc-100">
                Understand the businesses, not just the movies.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                Movies exist within a larger business ecosystem.
                JMI connects companies with their films, markets and
                theatrical outcomes to provide a broader perspective
                on the businesses shaping Indian cinema.
              </p>

              <div className="mt-5 flex items-center gap-3">

                <span className="h-px w-8 bg-violet-400/50" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  Companies · Movies · Markets
                </span>

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
                JMI Company Methodology
              </p>

              <h2 className="mt-2 text-lg font-medium text-zinc-100">
                Businesses, structured through cinema.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI organizes company intelligence around movies,
                business roles, markets and theatrical performance,
                creating a structured view of the companies operating
                within Indian cinema.
              </p>

              <div className="mt-5 flex items-center gap-3">

                <span className="h-px w-8 bg-violet-400/50" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  Companies · Performance · Growth
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
   COMPANY STAT
============================================================ */

function CompanyStat({
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
   COMPANY TYPE CARD
============================================================ */

function CompanyTypeCard({
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
   COMPANY INTELLIGENCE TILE
============================================================ */

function CompanyIntelligenceTile({
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
   BUSINESS ANALYSIS CARD
============================================================ */

function BusinessAnalysisCard({
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
   COMPANY CARD
============================================================ */

function CompanyCard({
  initials,
  name,
  type,
}: {
  initials: string;
  name: string;
  type: string;
}) {
  return (
    <Link
      href="#"
      className="
        group
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        p-4
        transition-all
        duration-300
        hover:border-violet-400/25
        hover:bg-zinc-900/60
        active:scale-[0.99]
      "
    >

      <div
        className="
          flex
          h-10
          w-10
          flex-shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-violet-400/20
          bg-violet-400/[0.035]
          text-[9px]
          font-medium
          text-violet-400/80
          transition-all
          duration-300
          group-hover:border-violet-400/40
          group-hover:text-violet-300
        "
      >
        {initials}
      </div>


      <div className="min-w-0 flex-1">

        <h3 className="truncate text-[11px] font-medium text-zinc-300 group-hover:text-white">
          {name}
        </h3>

        <p className="mt-1 text-[8px] text-zinc-700">
          {type}
        </p>

      </div>


      <span className="text-[10px] text-zinc-800 transition-colors group-hover:text-violet-400">
        ↗️
      </span>

    </Link>
  );
}