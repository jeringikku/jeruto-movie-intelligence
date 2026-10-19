import Link from "next/link";
import ActorsRankingsDuck from "./ActorsRankingsDuck";
import ActorsRankingsDuckNew from "./ActorsRankingsDuckNew";

export default function ActorsRankingsBanner() {
  return (
    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div
          className="
            group relative overflow-hidden
            rounded-2xl border border-amber-400/30
            bg-gradient-to-br from-[#17100a] via-zinc-950 to-black
            transition-all duration-300
            hover:border-amber-300/60
            hover:shadow-[0_0_35px_rgba(245,158,11,0.07)]
          "
        >
          {/* Ambient gold light */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/[0.07] blur-3xl transition-all duration-500 group-hover:bg-amber-400/[0.12]" />

          <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-orange-500/[0.04] blur-3xl" />

          {/* Decorative vertical accent */}
          <div className="absolute bottom-6 left-0 top-6 w-[3px] rounded-r-full bg-gradient-to-b from-amber-300 via-yellow-600 to-transparent" />

          <div className="relative p-5 sm:p-7 lg:p-9">
            {/* Eyebrow */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-amber-300">
                JMI Exclusive Actors Rankings
              </p>

              <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-2 py-1 text-[7px] font-medium uppercase tracking-[0.15em] text-amber-200/80">
                Career Rankings
              </span>
            </div>

            {/* Main content */}
            <div className="mt-5 grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_190px] sm:gap-7">
              {/* Text */}
              <div className="max-w-2xl">
                <h2 className="font-serif text-2xl font-medium tracking-tight text-amber-100 sm:text-3xl">
                  Actors Rankings
                  <span className="mt-1 block text-lg font-normal text-amber-400/80 sm:text-xl">
                    Intelligence
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-7">
                  Check out the top actors of Indian cinema ranked by
                  theatrical collections, number of hits and success
                  ratio, with All-India and industry-wise analysis.
                  Discover where your favourite actors stand.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-md border border-pink-400 bg-black/40 px-2.5 py-1.5 text-[8px] text-zinc-300">
                    Top Actors
                  </span>

                  <span className="rounded-md border border-pink-400 bg-black/40 px-2.5 py-1.5 text-[8px] text-zinc-300">
                    All-India
                  </span>

                  <span className="rounded-md border border-pink-400 bg-black/40 px-2.5 py-1.5 text-[8px] text-zinc-300">
                    Industry-wise
                  </span>
                </div>
              </div>

              {/* Duck assistant */}
              <div className="flex flex-col items-center justify-center">
                <ActorsRankingsDuckNew />
                <p className="mt-1 text-center text-[8px] font-medium uppercase tracking-[0.18em] text-amber-300/70">
                  Veronica - JMI AI assistant
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-5 h-px bg-gradient-to-r from-amber-400/30 via-zinc-800/70 to-transparent" />

            {/* Navigation button */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[7px] uppercase tracking-[0.17em] text-green-500">
                Exclusive Rankings of India's Top Actors 
              </p>

              <Link
                href="/preview/actors-rankings"
                className="
                  inline-flex w-full items-center justify-center gap-2
                  rounded-lg border border-amber-300/40
                  bg-gradient-to-r from-amber-400/15 to-orange-400/10
                  px-5 py-3
                  text-[10px] font-semibold tracking-wide text-amber-200
                  shadow-[0_0_18px_rgba(245,158,11,0.04)]
                  transition-all duration-300
                  hover:border-amber-300/70
                  hover:bg-amber-400/20
                  hover:text-white
                  active:scale-[0.98]
                  sm:w-auto
                "
              >
                Click Here to See the Top List
                <span className="text-sm transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}