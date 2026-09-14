import JmiComparisonWorkspace from "../../components/JmiComparisonWorkspace";

import PublicHeader from "../../components/PublicHeader";


export default function ComparePage() {
  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      <main>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden border-b border-zinc-900">

          {/* Ambient glow */}

          <div className="pointer-events-none absolute inset-0">

            <div className="absolute left-1/2 top-[-180px] h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-violet-500/[0.045] blur-3xl" />

          </div>


          <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">

            <div className="mx-auto max-w-3xl text-center">

              {/* Eyebrow */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.035] px-3 py-1.5">

                <span className="h-1 w-1 rounded-full bg-violet-400" />

                <span className="text-[9px] font-medium uppercase tracking-[0.28em] text-violet-300">
                  JMI Intelligence Tool
                </span>

              </div>


              {/* Title */}

              <h1 className="font-serif leading-[0.95] tracking-[-0.045em]">

                <span className="block text-[2.35rem] font-medium text-zinc-100 sm:text-5xl lg:text-6xl">
                  JMI
                </span>

                <span className="mt-1 block text-[2.1rem] font-medium text-violet-400 sm:text-[2.9rem] lg:text-5xl">
                  Compare
                </span>

              </h1>


              {/* Description */}

              <p className="mx-auto mt-6 max-w-xl text-[12px] leading-6 text-zinc-400 sm:text-sm sm:leading-7">
                Compare the data behind Indian cinema.
                Explore performance, business, markets and
                intelligence side by side.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            COMPARISON SELECTOR
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="mb-7 text-center">

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                Select entities
              </p>

              <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-zinc-100 sm:text-xl">
                Choose what you want to compare.
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-[10px] leading-5 text-zinc-600 sm:text-[11px]">
                JMI Compare will analyse structured information
                already available inside the JMI intelligence database.
              </p>

           


            {/* =================================================
                UNIVERSAL COMPARISON WORKSPACE
            ================================================= */}

            <JmiComparisonWorkspace/>

          </div>
     </div>

        </section>


        {/* =====================================================
            WHAT CAN BE COMPARED
        ===================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="mb-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                Comparison Intelligence
              </p>

              <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-zinc-100 sm:text-xl">
                One comparison. Multiple intelligence layers.
              </h2>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600 sm:text-[11px]">
                JMI Compare is designed to bring different parts of
                the database together instead of comparing a single
                headline number.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">

              <CompareLayer
                number="01"
                title="Performance"
                description="Box office and theatrical performance."
              />

              <CompareLayer
                number="02"
                title="Markets"
                description="State, regional and overseas performance."
              />

              <CompareLayer
                number="03"
                title="Business"
                description="Business, recovery and financial intelligence."
              />

              <CompareLayer
                number="04"
                title="Records"
                description="Milestones and historical achievements."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            SUPPORTED ENTITIES
        ===================================================== */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="rounded-2xl border border-violet-400/15 bg-zinc-950">

              <div className="p-6 sm:p-8 lg:p-10">

                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                  JMI Compare
                </p>

                <h2 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
                  Built to compare the ecosystem.
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600 sm:text-[11px]">
                  The comparison engine will progressively support
                  movies, people, production companies, industries
                  and selected market intelligence.
                </p>


                <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">

                  <EntityCard
                    title="Movies"
                    description="Movie vs movie"
                  />

                  <EntityCard
                    title="People"
                    description="Person vs person"
                  />

                  <EntityCard
                    title="Companies"
                    description="Company vs company"
                  />

                  <EntityCard
                    title="Industries"
                    description="Industry vs industry"
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
              JMI · Comparison Intelligence
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}


/* ============================================================
   COMPARISON LAYER
============================================================ */

function CompareLayer({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">

      <div className="flex items-center justify-between">

        <span className="text-[8px] tracking-[0.2em] text-violet-400/50">
          {number}
        </span>

        <span className="h-px w-4 bg-violet-400/20" />

      </div>

      <p className="mt-4 text-[11px] font-medium text-zinc-300">
        {title}
      </p>

      <p className="mt-1.5 text-[9px] leading-4 text-zinc-600">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   ENTITY CARD
============================================================ */

function EntityCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/40 px-4 py-3">

      <p className="text-[11px] font-medium text-zinc-300">
        {title}
      </p>

      <p className="mt-1 text-[8px] text-zinc-600">
        {description}
      </p>

    </div>
  );
}