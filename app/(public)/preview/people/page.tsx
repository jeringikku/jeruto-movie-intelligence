import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function PeoplePage() {
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

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-green-400">
                JMI People
              </p>

              <h1 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-3xl">
                The people behind Indian cinema.
              </h1>

              <p className="mt-3 max-w-2xl text-[11px] leading-5 text-zinc-600 sm:text-xs">
                Explore actors, directors, producers and technicians
                through structured career and industry intelligence.
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
                    placeholder="Search people..."
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none placeholder:text-zinc-700"
                  />

                </div>

                <button
                  type="button"
                  className="bg-green-400 px-4 text-[10px] font-medium text-black transition hover:bg-green-300"
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

              <PeopleStat
                value="66"
                label="People"
              />

              <PeopleStat
                value="08+"
                label="Major Roles"
              />

              <PeopleStat
                value="18"
                label="Languages"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            ROLE DISCOVERY
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-green-400">
                Explore People
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100 sm:text-xl">
                Intelligence by role.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                Every role contributes differently to cinema. JMI
                organizes people intelligence around their individual
                roles and careers.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">

              <RoleCard
                number="01"
                icon="✦"
                title="Actors"
                description="Filmography, career performance and box-office association."
              />

              <RoleCard
                number="02"
                icon="◆"
                title="Directors"
                description="Directorial career, film performance and industry journey."
              />

              <RoleCard
                number="03"
                icon="◈"
                title="Producers"
                description="Production history, business performance and film portfolio."
              />

              <RoleCard
                number="04"
                icon="✎"
                title="Writers"
                description="Writing credits, filmography and career progression."
              />

              <RoleCard
                number="05"
                icon="♫"
                title="Music Directors"
                description="Music credits, collaborations and career records."
              />

              <RoleCard
                number="06"
                icon="◎"
                title="Cinematographers"
                description="Visual credits, collaborations and filmography."
              />

              <RoleCard
                number="07"
                icon="◫"
                title="Editors"
                description="Editing credits and professional film history."
              />

              <RoleCard
                number="08"
                icon="＋"
                title="Other Technicians"
                description="Explore additional creative and technical roles."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            PEOPLE INTELLIGENCE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-green-400/15 bg-zinc-950">

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-green-500/[0.06] blur-3xl" />

              <div className="relative p-6 sm:p-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-green-400">
                  People Intelligence
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  A career is more than a filmography.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                  JMI connects a person's work across movies, roles,
                  industries and box-office performance to create a
                  broader picture of their professional journey.
                </p>


                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <PeopleIntelligenceTile
                    icon="◈"
                    title="Filmography"
                  />

                  <PeopleIntelligenceTile
                    icon="₹"
                    title="Box Office"
                  />

                  <PeopleIntelligenceTile
                    icon="↗️"
                    title="Career Trends"
                  />

                  <PeopleIntelligenceTile
                    icon="◆"
                    title="Role Analysis"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            CAREER ANALYSIS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="grid gap-3 md:grid-cols-2">

              <CareerCard
                eyebrow="Career Intelligence"
                title="Understand the journey."
                description="Explore how a person's career evolves across years, roles, industries and film performances."
              />

              <CareerCard
                eyebrow="Role-Based Intelligence"
                title="Every role has its own story."
                description="JMI analyzes people according to their individual roles rather than treating every career the same way."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            FEATURED PEOPLE
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="mb-7 flex items-end justify-between gap-4">

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-green-400">
                  People Database
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
                  Explore people in JMI.
                </h2>

              </div>

              <span className="hidden text-[9px] text-zinc-700 sm:block">
                Growing database
              </span>

            </div>


            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

              <PersonCard
                initials="JG"
                name="Jerin Georgekutty"
                role="Founder / Analyst"
              />

              <PersonCard
                initials="01"
                name="Featured Person"
                role="Actor"
              />

              <PersonCard
                initials="02"
                name="Featured Person"
                role="Director"
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

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-green-400">
                JMI People Methodology
              </p>

              <h2 className="mt-2 text-lg font-medium text-zinc-100">
                People, structured by their work.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
                JMI organizes people intelligence around roles,
                credits and professional work, allowing users to
                explore careers through structured data.
              </p>

              <div className="mt-5 flex items-center gap-3">

                <span className="h-px w-8 bg-green-400/50" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  People · Roles · Careers
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
   PEOPLE STAT
============================================================ */

function PeopleStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">

      <p className="text-lg font-medium tracking-[-0.03em] text-green-400 sm:text-xl">
        {value}
      </p>

      <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-700">
        {label}
      </p>

    </div>
  );
}


/* ============================================================
   ROLE CARD
============================================================ */

function RoleCard({
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
        hover:border-green-400/25
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
            text-green-400/70
            transition-all
            duration-300
            group-hover:border-green-400/30
            group-hover:text-green-300
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
   PEOPLE INTELLIGENCE TILE
============================================================ */

function PeopleIntelligenceTile({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/50 px-3 py-3">

      <span className="text-xs text-green-400/70">
        {icon}
      </span>

      <p className="mt-2 text-[9px] font-medium text-zinc-400">
        {title}
      </p>

    </div>
  );
}


/* ============================================================
   CAREER CARD
============================================================ */

function CareerCard({
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

      <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-green-400/70">
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
   PERSON CARD
============================================================ */

function PersonCard({
  initials,
  name,
  role,
}: {
  initials: string;
  name: string;
  role: string;
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
        hover:border-green-400/25
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
          rounded-full
          border
          border-green-400/20
          bg-green-400/[0.035]
          text-[9px]
          font-medium
          text-green-400/80
          transition-all
          duration-300
          group-hover:border-green-400/40
          group-hover:text-green-300
        "
      >
        {initials}
      </div>


      <div className="min-w-0 flex-1">

        <h3 className="truncate text-[11px] font-medium text-zinc-300 group-hover:text-white">
          {name}
        </h3>

        <p className="mt-1 text-[8px] text-zinc-700">
          {role}
        </p>

      </div>


      <span className="text-[10px] text-zinc-800 transition-colors group-hover:text-green-400">
        ↗️
      </span>

    </Link>
  );
}