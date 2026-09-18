import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function AboutJmiPage() {
  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      <main>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden border-b border-zinc-900">

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-180px] h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-violet-500/[0.045] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">

            <Link
              href="/preview"
              className="text-[9px] font-medium tracking-[0.18em] text-violet-500 transition hover:text-violet-400"
            >
              ← Back to JMI
            </Link>

            <div className="mt-7 max-w-3xl">

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-pink-400">
                About JMI
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-yellow-400 sm:text-5xl">
                Jeruto Movie Intelligence
              </h1>

              <p className="mt-5 max-w-2xl text-[12px] leading-6 text-zinc-400 sm:text-sm sm:leading-7">
                A structured movie intelligence platform built to
                understand Indian cinema through data, markets,
                box office and the business of films.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            WHAT IS JMI
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <SectionLabel>
              What is JMI?
            </SectionLabel>

            <div className="mt-4 max-w-3xl">

              <h2 className="text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
                Building a structured view of Indian cinema.
              </h2>

              <p className="mt-4 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                Jeruto Movie Intelligence (JMI) is a movie database
                and cinema intelligence platform focused on Indian
                films and their surrounding ecosystem.
              </p>

              <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                JMI brings together structured information about
                movies, people, companies, industries, markets,
                theatrical performance and movie business into a
                connected intelligence system.
              </p>

              <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                The objective is to make complex cinema information
                easier to explore, compare and understand through
                structured data rather than fragmented information.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            WHY JMI
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <SectionLabel>
              Why JMI Exists
            </SectionLabel>

            <div className="mt-5 grid gap-3 md:grid-cols-3">

              <PrincipleCard
                number="01"
                title="Information is fragmented"
                description="Movie information is often distributed across different sources, markets and reporting systems."
              />

              <PrincipleCard
                number="02"
                title="Cinema is more than a collection"
                description="A film's journey involves people, companies, markets, audiences, business structures and theatrical performance."
              />

              <PrincipleCard
                number="03"
                title="Data can connect the picture"
                description="JMI is designed to connect these different layers into a structured movie intelligence ecosystem."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            WHAT JMI COVERS
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <SectionLabel>
              What JMI Covers
            </SectionLabel>

            <h2 className="mt-3 text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
              Multiple layers. One intelligence ecosystem.
            </h2>

            <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">

              <CoverageCard
                number="01"
                title="Movies"
                description="Structured movie information, releases, languages, genres and detailed profiles."
                href="/preview/movies"
              />

              <CoverageCard
                number="02"
                title="Box Office"
                description="India, overseas, state, territory, city, language and other theatrical intelligence."
                href="/preview/movies"
              />

              <CoverageCard
                number="03"
                title="People"
                description="Role-based intelligence covering actors, directors, producers and other professionals."
                href="/preview/people"
              />

              <CoverageCard
                number="04"
                title="Companies"
                description="Production houses, distributors and businesses connected with cinema."
                href="/preview/companies"
              />

              <CoverageCard
                number="05"
                title="Industries"
                description="Individual Indian film industries, their markets, movies and performance."
                href="/preview/industries"
              />

              <CoverageCard
                number="06"
                title="Markets"
                description="Geographic market intelligence covering Indian and overseas theatrical markets."
                href="/preview/audience-behavior"
              />

              <CoverageCard
                number="07"
                title="Audience Behavior"
                description="Genre preferences, market trends and patterns in theatrical audience behaviour."
                href="/preview/audience-behavior"
              />

              <CoverageCard
                number="08"
                title="Historical Records"
                description="Landmark performances and historical records across Indian cinema."
                href="/preview/movies#historical-records"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            OUR APPROACH
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <SectionLabel>
              Our Approach
            </SectionLabel>

            <div className="mt-5 max-w-3xl">

              <h2 className="text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
                Structured data with transparency at the centre.
              </h2>

              <p className="mt-4 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                JMI is built around structured data collection,
                organization and analysis. The platform is designed
                to connect information across movies, people,
                companies, industries and markets.
              </p>

              <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                Where data is estimated, JMI aims to clearly
                distinguish estimates from figures identified as
                official, actual, revised or projected within the
                relevant intelligence system.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            BOX OFFICE TRANSPARENCY
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-green-400/20 bg-zinc-950">

              <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-56 w-56 rounded-full bg-green-500/[0.035] blur-3xl" />

              <div className="relative p-5 sm:p-7 lg:p-8">

                <div className="flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                  <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-green-400">
                    JMI Data Transparency
                  </p>

                </div>

                <h2 className="mt-4 text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
                  Transparency over claims of absolute accuracy.
                </h2>

                <div className="mt-4 max-w-3xl space-y-3">

                  <p className="text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                    The box-office figures presented by Jeruto Movie
                    Intelligence are <span className="text-zinc-200">trade figures</span>.
                    JMI does not claim that these figures represent
                    the final original or official figures reported by
                    producers, distributors, exhibitors or other
                    rights-holders.
                  </p>

                  <p className="text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                    JMI figures are generally estimated through
                    <span className="text-zinc-200">
                      {" "}online ticket-sales tracking, market observation
                      and other available theatrical data.
                    </span>
                  </p>

                  <p className="text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                    Actual collections may differ from JMI figures due
                    to differences in reporting, data availability,
                    timing, territory coverage and other factors.
                  </p>

                  <p className="text-[11px] font-medium leading-6 text-green-400 sm:text-xs sm:leading-6">
                    JMI does not claim 100% accuracy over its
                    box-office figures.
                  </p>

                  <p className="text-[11px] leading-6 text-zinc-500 sm:text-xs sm:leading-6">
                    Our objective is to provide a transparent,
                    consistent and useful source of movie-trade
                    intelligence rather than present estimates as
                    absolute facts.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            JMI PRINCIPLES
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <SectionLabel>
              JMI Principles
            </SectionLabel>

            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">

              <PrincipleSmall
                title="Transparency"
                description="Clearly communicate what our figures represent."
              />

              <PrincipleSmall
                title="Structure"
                description="Organize cinema information into connected data."
              />

              <PrincipleSmall
                title="Consistency"
                description="Apply defined methodologies across markets and records."
              />

              <PrincipleSmall
                title="Continuous Intelligence"
                description="Keep expanding and updating the JMI knowledge base."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            VISION
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <SectionLabel>
              The JMI Vision
            </SectionLabel>

            <div className="mt-4 max-w-3xl">

              <h2 className="text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
                More than a movie database.
              </h2>

              <p className="mt-4 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                JMI is evolving toward a broader movie intelligence
                ecosystem where structured data, analytics and
                intelligent tools work together to provide a deeper
                understanding of Indian cinema.
              </p>

              <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                The long-term vision includes deeper market
                intelligence, advanced comparisons, audience
                analytics, business intelligence and intelligent
                interfaces for exploring the data contained within
                JMI.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOUNDER
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <SectionLabel>
              Founder
            </SectionLabel>

            <div className="mt-6 rounded-2xl border border-violet-400/20 bg-zinc-950 p-5 sm:p-7">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-black sm:h-28 sm:w-28">

                  <img
                    src="https://jeringeorgekutty.weebly.com/uploads/1/1/9/9/119991850/img-20250301-102847_orig.jpg"
                    alt="Jerin Georgekutty"
                    className="h-full w-full object-cover"
                  />

                </div>

                <div>

                  <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                    Founder & CEO
                  </p>

                  <h2 className="mt-2 text-lg font-medium text-zinc-100 sm:text-xl">
                    Jerin Georgekutty
                  </h2>

                  <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-yellow-500">
                    Jeruto Group
                  </p>

                  <p className="mt-3 max-w-2xl text-[10px] leading-5 text-zinc-500 sm:text-[11px] sm:leading-6">
                    JMI was created with the aim of building a
                    structured and transparent intelligence platform
                    for Indian cinema, bringing together the different
                    layers of information that shape the film business.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            CLOSING CTA
        ===================================================== */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-18 lg:px-8">

            <div className="text-center">

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-green-400">
                Explore JMI
              </p>

              <h2 className="mt-3 text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
                Explore the data behind Indian cinema.
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-[10px] leading-5 text-zinc-500 sm:text-[11px] sm:leading-6">
                Discover movies, people, companies, industries,
                markets and the intelligence connecting them.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">

                <Link
                  href="/preview/movies"
                  className="rounded-lg border border-violet-400/30 bg-violet-400/[0.06] px-4 py-2.5 text-[9px] font-medium text-violet-300 transition hover:border-violet-400/60 hover:bg-violet-400/[0.1]"
                >
                  Explore Movies →
                </Link>

                <Link
                  href="/preview/people"
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-[9px] font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
                >
                  Explore People
                </Link>

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
   SECTION LABEL
============================================================ */

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
      {children}
    </p>
  );
}


/* ============================================================
   PRINCIPLE CARD
============================================================ */

function PrincipleCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

      <span className="text-[8px] font-medium tracking-[0.18em] text-violet-400">
        {number}
      </span>

      <h3 className="mt-3 text-[11px] font-medium text-zinc-200">
        {title}
      </h3>

      <p className="mt-1.5 text-[9px] leading-5 text-zinc-500">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   COVERAGE CARD
============================================================ */

function CoverageCard({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-violet-500/[0.025]"
    >

      <div className="flex items-center justify-between">

        <span className="text-[8px] tracking-[0.18em] text-pink-400">
          {number}
        </span>

        <span className="text-[10px] text-zinc-700 transition group-hover:text-violet-400">
          →
        </span>

      </div>

      <h3 className="mt-4 text-[11px] font-medium text-zinc-200 transition group-hover:text-white">
        {title}
      </h3>

      <p className="mt-1.5 text-[9px] leading-5 text-zinc-500">
        {description}
      </p>

    </Link>
  );
}


/* ============================================================
   SMALL PRINCIPLE
============================================================ */

function PrincipleSmall({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3.5">

      <p className="text-[10px] font-medium text-zinc-200">
        {title}
      </p>

      <p className="mt-1 text-[8px] leading-4 text-zinc-600">
        {description}
      </p>

    </div>
  );
}