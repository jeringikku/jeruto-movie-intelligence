import Link from "next/link";

export default function TechnicianRankingsBanner() {
  return (
    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">

        <Link
          href="/preview/technicians"
          aria-label="Explore JMI Technician Rankings"
          className="
            group relative block overflow-hidden
            rounded-2xl border border-amber-400/30
            bg-[#080807]
            transition-all duration-500
            hover:-translate-y-0.5
            hover:border-amber-300/60
            hover:shadow-[0_18px_60px_rgba(180,120,30,0.08)]
            active:scale-[0.99]
            focus:outline-none
            focus:ring-1 focus:ring-amber-300/60
          "
        >

          {/* =================================================
              CINEMATIC CAMERA BODY BACKGROUND
          ================================================= */}

          <div className="pointer-events-none absolute inset-0">

            {/* Metallic camera-body gradient */}

            <div
              className="
                absolute inset-0
                bg-gradient-to-br
                from-[#18140d]/80
                via-[#080807]
                to-[#100b16]
              "
            />

            {/* Warm lens illumination */}

            <div
              className="
                absolute -right-16 -top-24
                h-72 w-72 rounded-full
                bg-amber-400/[0.07] blur-3xl
                transition-all duration-700
                group-hover:bg-amber-400/[0.13]
              "
            />

            {/* Violet cinematic light */}

            <div
              className="
                absolute -bottom-32 left-[35%]
                h-64 w-64 rounded-full
                bg-violet-500/[0.045] blur-3xl
              "
            />

            {/* Subtle horizontal film grain */}

            <div
              className="
                absolute inset-0 opacity-[0.12]
                bg-[repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent_3px,
                  rgba(255,255,255,0.035)_4px,
                  transparent_5px
                )]
              "
            />

            {/* Cinematic lens rings */}

            <div
              className="
                absolute -right-16 top-1/2
                h-72 w-72 -translate-y-1/2
                rounded-full border border-amber-300/[0.07]
                transition-transform duration-1000
                group-hover:scale-110
              "
            />

            <div
              className="
                absolute -right-8 top-1/2
                h-56 w-56 -translate-y-1/2
                rounded-full border border-amber-300/[0.06]
              "
            />

            <div
              className="
                absolute right-0 top-1/2
                h-40 w-40 -translate-y-1/2
                rounded-full border border-amber-300/[0.045]
              "
            />

          </div>


          {/* =================================================
              TOP FILMSTRIP BORDER
          ================================================= */}

          <div className="relative flex h-5 items-center gap-2 overflow-hidden border-b border-amber-400/15 bg-black/50 px-3">

            {Array.from({ length: 26 }).map((_, index) => (
              <span
                key={index}
                className="
                  h-2 w-3 shrink-0 rounded-[2px]
                  border border-amber-400/20
                  bg-amber-400/[0.035]
                "
              />
            ))}

            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#080807] px-2 text-[7px] uppercase tracking-[0.24em] text-amber-400/60">
              JMI · Cinema Intelligence
            </span>

          </div>


          {/* =================================================
              TOP GOLDEN ACCENT
          ================================================= */}

          <div
            className="
              absolute left-0 top-5 z-10
              h-px w-0
              bg-gradient-to-r
              from-amber-400 via-yellow-200 to-transparent
              transition-all duration-700
              group-hover:w-full
            "
          />


          {/* =================================================
              MAIN CAMERA BANNER CONTENT
          ================================================= */}

          <div
            className="
              relative flex flex-col gap-7
              p-5 sm:p-7
              lg:flex-row lg:items-center
              lg:justify-between lg:gap-10 lg:p-9
            "
          >

            {/* =================================================
                LEFT: CAMERA ICON + CONTENT
            ================================================= */}

            <div className="flex min-w-0 items-start gap-4 sm:gap-5">

              {/* Camera-inspired emblem */}

              <div className="relative shrink-0 pt-1">

                {/* Camera lens glow */}

                <div
                  className="
                    absolute inset-0 scale-150
                    rounded-full bg-amber-400/[0.08]
                    blur-xl
                    transition-all duration-500
                    group-hover:bg-amber-400/[0.16]
                  "
                />

                {/* Camera body */}

                <div
                  className="
                    relative flex h-14 w-[68px]
                    items-center justify-center
                    rounded-lg border border-amber-400/35
                    bg-gradient-to-br
                    from-[#302515] via-[#15120d] to-[#090807]
                    shadow-[inset_0_1px_0_rgba(255,220,150,0.08),0_5px_15px_rgba(0,0,0,0.4)]
                    transition-all duration-500
                    group-hover:border-amber-300/60
                    sm:h-[62px] sm:w-[76px]
                  "
                >

                  {/* Camera top housing */}

                  <div
                    className="
                      absolute -top-[7px] left-3
                      h-[8px] w-5
                      rounded-t-sm border border-amber-400/25
                      bg-[#302515]
                    "
                  />

                  {/* Camera side indicator */}

                  <div className="absolute left-1.5 top-2 h-1 w-1 rounded-full bg-red-400/80" />

                  {/* Lens rings */}

                  <div
                    className="
                      relative flex h-9 w-9
                      items-center justify-center
                      rounded-full border border-amber-300/50
                      bg-[#080807]
                      shadow-[0_0_14px_rgba(245,180,60,0.12)]
                      transition-all duration-500
                      group-hover:shadow-[0_0_22px_rgba(245,180,60,0.24)]
                      sm:h-10 sm:w-10
                    "
                  >

                    <div
                      className="
                        flex h-7 w-7 items-center justify-center
                        rounded-full border border-amber-400/30
                        bg-gradient-to-br
                        from-[#4a371d] via-[#17120b] to-black
                        sm:h-8 sm:w-8
                      "
                    >
                      <div className="h-3 w-3 rounded-full border border-amber-200/60 bg-amber-400/20 shadow-[0_0_8px_rgba(245,180,60,0.35)] sm:h-3.5 sm:w-3.5" />
                    </div>

                  </div>

                  {/* Camera side grip */}

                  <div className="absolute right-1.5 top-3 h-7 w-1 rounded-full bg-amber-400/20" />

                  {/* Camera bottom indicator */}

                  <div className="absolute bottom-1.5 left-3 h-px w-5 bg-amber-300/40" />

                </div>

              </div>


              {/* Text content */}

              <div className="min-w-0 flex-1">

                {/* Eyebrow */}

                <div className="flex flex-wrap items-center gap-2">

                  <span
                    className="
                      text-[8px] font-semibold
                      uppercase tracking-[0.22em]
                      text-amber-300 sm:text-[9px]
                    "
                  >
                    JMI Professional Intelligence
                  </span>

                  <span
                    className="
                      inline-flex items-center gap-1.5
                      rounded-full border border-green-400/20
                      bg-green-400/[0.05]
                      px-2 py-0.5
                      text-[7px] font-medium
                      uppercase tracking-[0.12em]
                      text-green-400
                    "
                  >
                    <span className="h-1 w-1 rounded-full bg-green-400" />
                    Explore Rankings
                  </span>

                </div>


                {/* Heading */}

                <h2
                  className="
                    mt-2 font-serif
                    text-xl font-medium
                    tracking-[-0.035em]
                    text-amber-300
                    transition-colors duration-300
                    group-hover:text-yellow-200
                    sm:text-2xl lg:text-3xl
                  "
                >
                  Technician Rankings
                </h2>


                {/* Subtitle */}

                <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-amber-100/40 sm:text-[9px]">
                  Behind every film, there is a creative force.
                </p>


                {/* Description */}

                <p
                  className="
                    mt-3 max-w-2xl
                    text-[10px] leading-5
                    text-zinc-400
                    sm:text-xs sm:leading-6
                  "
                >
                  Discover the directors, writers, editors,
                  cinematographers and music directors shaping
                  Indian cinema. Explore career achievements,
                  theatrical successes and industry-wise rankings
                  through JMI data.
                </p>


                {/* Profession labels */}

                <div className="mt-4 flex flex-wrap gap-2">

                  {[
                    "Directors",
                    "Writers",
                    "Editors",
                    "Cinematographers",
                    "Music Directors",
                  ].map((item) => (
                    <span
                      key={item}
                      className="
                        rounded-md border border-amber-400/10
                        bg-black/40 px-2.5 py-1
                        text-[8px] text-zinc-400
                        transition-all duration-300
                        group-hover:border-amber-400/25
                        group-hover:text-zinc-300
                        sm:text-[9px]
                      "
                    >
                      {item}
                    </span>
                  ))}

                </div>

                {/* =================================================
    CLICK HERE TO EXPLORE BUTTON
================================================= */}

<div className="mt-5">

  <span
    className="
      inline-flex
      items-center
      justify-center
      gap-2
      rounded-lg
      border border-amber-400/40
      bg-gradient-to-r
      from-amber-400/[0.12]
      to-amber-400/[0.04]
      px-4
      py-2.5
      text-[10px]
      font-semibold
      tracking-wide
      text-amber-200
      transition-all
      duration-300
      group-hover:border-amber-300/70
      group-hover:bg-amber-400/[0.12]
      sm:text-[11px]
    "
  >
    Click Here to Explore

    <span
      className="
        text-amber-300
        transition-transform
        duration-300
        group-hover:translate-x-1
      "
      aria-hidden="true"
    >
      →
    </span>
  </span>

</div>

              </div>

            </div>


            </div>

          {/* =================================================
              BOTTOM FILMSTRIP BORDER
          ================================================= */}

          <div className="relative flex h-5 items-center gap-2 overflow-hidden border-t border-amber-400/15 bg-black/50 px-3">

            {Array.from({ length: 26 }).map((_, index) => (
              <span
                key={index}
                className="
                  h-2 w-3 shrink-0 rounded-[2px]
                  border border-amber-400/20
                  bg-amber-400/[0.035]
                "
              />
            ))}

            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#080807] px-2 text-[7px] uppercase tracking-[0.24em] text-amber-400/50">
              Indian Cinema · JMI
            </span>

          </div>


          {/* Bottom golden accent */}

          <div
            className="
              absolute bottom-5 left-5 h-px w-8
              bg-amber-400/30
              transition-all duration-500
              group-hover:w-20
              group-hover:bg-amber-300/60
              sm:left-7 lg:left-9
            "
          />

        </Link>

      </div>
    </section>
  );
}