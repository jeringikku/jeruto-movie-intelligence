"use client";

import Link from "next/link";

export default function DailyBoxOfficeBanner() {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-16 sm:px-6">

      {/* SECTION LABEL */}

      <div className="mb-5 flex items-center gap-3">
        <span className="h-px w-8 bg-amber-500/60" />

        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-amber-400">
          📰 JMI Daily Box Office Intelligence
        </p>

        <span className="h-px flex-1 bg-zinc-900" />
      </div>

      {/* DESCRIPTION */}

      <div className="mx-auto max-w-6xl px-2 pb-4 sm:px-3">
        <p className="max-w-2xl text-[11px] leading-5 text-zinc-500/95">
          Explore the day-wise theatrical collections of Indian movies
          through JMI's dedicated box office portal. Follow daily earnings,
          territory performance and cumulative theatrical progress with
          regularly updated figures.
        </p>
      </div>

      {/* NEWSPAPER BANNER */}

      <div className="group relative overflow-hidden rounded-xl border border-[#C8B58E] bg-[#F4EBD8] shadow-2xl">

        {/* Paper texture and subtle editorial lines */}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 4px, #8B7355 5px)",
          }}
        />

        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative px-5 py-8 sm:px-10 sm:py-11 lg:px-14">

          {/* Masthead */}

          <div className="flex items-center justify-between border-b-2 border-[#29251F] pb-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#655744] sm:text-[10px]">
              Jeruto Movie Intelligence
            </p>

            <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-[#81745E] sm:text-[9px]">
              The Box Office Edition
            </p>
          </div>

          {/* Main editorial content */}

          <div className="grid items-center gap-6 py-7 sm:py-9 md:grid-cols-[1.5fr_0.7fr]">

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#9A6927] sm:text-[10px]">
                Day-wise Theatrical Intelligence
              </p>

              <h2
                className="mt-3 font-serif text-[27px] font-black leading-[0.98] tracking-[-0.045em] text-[#211D18] sm:text-6xl lg:text-7xl"
              >
                Daily Box
                
                Office
              </h2>

              <div className="mt-5 flex h-1 w-40 overflow-hidden">
                <span className="w-1/2 bg-[#A52D22]" />
                <span className="w-1/2 bg-[#B78332]" />
              </div>

              <p className="mt-5 max-w-lg text-[10px] font-medium leading-5 text-[#554A3B] sm:text-sm">
                Day-wise collections <span className="px-1">·</span>
                Daily Reports <span className="px-1">·</span>
                Regular updates
              </p>
            </div>

            {/* CSS box-office graphic */}

            <div className="hidden items-end justify-center gap-2 pb-1 md:flex">

              {[
                "h-16",
                "h-20",
                "h-24",
                "h-32",
                "h-36",
                "h-44",
              ].map((height, index) => (
                <div
                  key={index}
                  className={`${height} w-7 rounded-t-sm border border-[#9D692F]/20 ${
                    index < 2
                      ? "bg-[#D9BC8B]"
                      : index < 4
                        ? "bg-[#C99543]"
                        : index === 4
                          ? "bg-[#B77B32]"
                          : "bg-[#A83B2C]"
                  } shadow-sm`}
                />
              ))}

            </div>
          </div>

         

          {/* Bottom newspaper edge */}

          <div className="mt-0 border-t-2 border-[#29251F] pt-2">
            <div className="flex items-center justify-between">
              <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#75664F] sm:text-[8px]">
                Jeruto Movie Intelligence
              </p>

              <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#75664F] sm:text-[8px]">
                Box Office Reports
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* CTA */}

      <div className="relative z-10 -mt-3 flex justify-center">

        <Link
          href="/preview/daily-box-office"
          className="
            group
            relative
            inline-flex
            h-11
            items-center
            justify-center
            gap-3
            overflow-hidden
            rounded-lg
            border
            border-[#E8C17C]
            bg-gradient-to-r
            from-[#B87522]
            to-[#865018]
            px-7
            text-[9px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-white
            shadow-xl
            shadow-black/30
            transition-all
            duration-300
            hover:from-[#D08C32]
            hover:to-[#A56A22]
            hover:shadow-2xl
            sm:h-14
            sm:min-w-[280px]
            sm:px-9
            sm:text-[11px]
          "
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ▶️
          </span>

          Explore Daily Box Office

          <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>

      </div>

      {/* SUPPORTING LINE */}

      <div className="mt-5 flex items-center justify-center gap-3">

        <span className="h-px w-8 bg-zinc-800" />

        <p className="text-center text-[7px] uppercase tracking-[0.15em] text-zinc-500 sm:text-[9px] sm:tracking-[0.2em]">
          Day-wise Collections · Overall Performance · Complete Box Office Tracking
        </p>

        <span className="h-px w-8 bg-zinc-800" />

      </div>

    </section>
  );
}