import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import TechnicianRoller from "../../components/TechnicianRoller";

export default function TechniciansIntelligencePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#08090a] text-white">
      <PublicHeader />

      <main>
        {/* BACK NAVIGATION */}
        <div className="mx-auto max-w-6xl px-5 pt-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[9px] font-medium tracking-[0.16em] text-violet-400 transition hover:text-yellow-400"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* CINEMATIC FEATURE BANNER */}
        <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#08090a]">
          <div className="pointer-events-none absolute inset-0">
            <div className="jmi-charcoal-wood absolute inset-0 opacity-70" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#08090a] via-[#08090a]/70 to-[#08090a]/90" />

            <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-yellow-500/[0.07] blur-[100px]" />

            <div className="absolute left-1/3 top-0 h-32 w-64 bg-violet-500/[0.04] blur-[80px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 py-5 sm:px-6 sm:py-7 lg:px-8">
            <div className="relative overflow-hidden rounded-lg border border-white/[0.12] bg-[#101112]/80">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-yellow-400/[0.06] via-violet-500/[0.025] to-transparent" />

                <div className="absolute right-8 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-yellow-400/[0.12] sm:right-16 sm:h-44 sm:w-44">
                  <div className="absolute inset-3 rounded-full border border-white/[0.07]" />

                  <div className="absolute inset-7 rounded-full border border-violet-400/[0.12]" />

                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent" />

                  <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

                  <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/80 shadow-[0_0_18px_rgba(250,204,21,0.5)]" />
                </div>
              </div>

              <div className="relative flex min-h-[132px] items-center px-5 py-6 sm:min-h-[160px] sm:px-9 sm:py-8">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />

                    <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-yellow-400 sm:text-[9px]">
                      The Art Behind The Frame
                    </p>
                  </div>

                  <h2 className="mt-3 max-w-md text-xl font-medium leading-tight tracking-[-0.04em] text-zinc-100 sm:text-3xl">
                    Every Film Has a{" "}
                    <span className="text-yellow-400">Vision.</span>
                  </h2>

                  <p className="mt-2 max-w-md text-[9px] leading-5 text-zinc-400 sm:text-[11px] sm:leading-6">
                    Discover the directors, writers and creative minds shaping
                    Indian cinema through the lens of JMI intelligence.
                  </p>
                </div>

                <div className="pointer-events-none absolute bottom-3 right-4 hidden sm:block">
                  <p className="text-right text-[7px] uppercase tracking-[0.25em] text-zinc-600">
                    JERUTO
                  </p>

                  <p className="mt-1 text-right text-[8px] tracking-[0.18em] text-zinc-500">
                    CINEMA · DATA · INTELLIGENCE
                  </p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-violet-400/30" />
            </div>
          </div>
        </section>

        {/* HERO */}
        <section className="relative border-b border-white/[0.08]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="jmi-charcoal-wood absolute inset-0 opacity-70" />

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#08090a]/70 to-[#08090a]" />

            <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-yellow-500/[0.035] blur-[100px]" />

            <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-violet-500/[0.04] blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-sm border border-[#858585]/25 bg-black/40 px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.45)]" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-zinc-300">
                  Jeruto Movie Intelligence
                </span>
              </div>

              <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Beyond the Spotlight
              </p>

              <h1 className="mt-3 max-w-2xl text-3xl font-medium leading-tight tracking-[-0.045em] text-zinc-100 sm:text-4xl md:text-5xl">
                Behind The{" "}
                <span className="text-zinc-400">Screen.</span>
              </h1>

              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300 sm:text-xs">
                Technicians Intelligence
              </p>

              <p className="mt-5 max-w-2xl text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-7">
                Discover the creative professionals who shape Indian cinema.
                Explore filmographies, worldwide box-office performance,
                theatrical successes and career statistics across India's
                diverse film industries.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="h-px w-8 bg-yellow-400/70" />

                <span className="text-[8px] uppercase tracking-[0.22em] text-zinc-500">
                  The intelligence behind the art
                </span>
              </div>
            </div>

            {/* DECORATIVE ARCHIVE MARK */}
            <div className="pointer-events-none absolute bottom-8 right-8 hidden select-none sm:block lg:right-14">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/[0.08]">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/20">
                  <span className="font-serif text-4xl text-yellow-400/70">
                    J
                  </span>
                </div>
              </div>

              <p className="mt-3 text-center text-[7px] uppercase tracking-[0.25em] text-zinc-600">
                JMI Archive
              </p>
            </div>
          </div>
        </section>

        {/* CINEMATIC TECHNICIAN ROLLER */}
        <TechnicianRoller />
      </main>

      {/* FOOTER */}
      <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#08090a]">
        <div className="jmi-charcoal-wood pointer-events-none absolute inset-0 opacity-20" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-2 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-serif text-sm text-zinc-300">
            Jeruto{" "}
            <span className="text-yellow-400">Movie Intelligence</span>
          </p>

          <p className="text-[9px] text-zinc-600">
            JMI · Behind The Screen · Technicians Intelligence
          </p>
        </div>
      </footer>

      {/* LOCAL CHARCOAL WOOD TEXTURE */}
      <style>{`
        .jmi-charcoal-wood {
          background-color: #111213;
          background-image:
            repeating-linear-gradient(
              2deg,
              transparent 0px,
              transparent 7px,
              rgba(255, 255, 255, 0.018) 8px,
              transparent 10px,
              transparent 17px
            ),
            repeating-linear-gradient(
              91deg,
              transparent 0px,
              transparent 47px,
              rgba(0, 0, 0, 0.19) 49px,
              transparent 53px,
              transparent 87px
            ),
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.025),
              transparent 35%,
              rgba(0, 0, 0, 0.3)
            );
        }
      `}</style>
    </div>
  );
}