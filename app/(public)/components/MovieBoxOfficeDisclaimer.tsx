import MovieBoxOfficeDisclaimerWeather from "./MovieBoxOfficeDisclaimerWeather";


export default function MovieBoxOfficeDisclaimer() {
  return (
  <MovieBoxOfficeDisclaimerWeather>
    <aside
      aria-label="JMI box office disclaimer"
      className="
        relative
        isolate
        mx-auto
        w-full
        overflow-hidden
        border-y
        border-[#1b1009]
        bg-gradient-to-br
        from-[#765137]
        via-[#49301f]
        to-[#24160e]
        px-5
        py-3
        shadow-[inset_0_1px_0_rgba(220,180,130,0.16),inset_0_-3px_5px_rgba(0,0,0,0.45),0_5px_12px_rgba(0,0,0,0.25)]
        sm:rounded-md
        sm:border-x
        sm:px-7
        sm:py-3.5
      "
    >
      {/* Weathered wood grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              2deg,
              transparent 0px,
              transparent 8px,
              rgba(207, 158, 106, 0.12) 9px,
              rgba(25, 14, 8, 0.20) 10px,
              transparent 12px,
              transparent 19px
            ),
            repeating-linear-gradient(
              178deg,
              transparent 0px,
              transparent 27px,
              rgba(20, 11, 6, 0.18) 28px,
              transparent 30px,
              transparent 39px
            ),
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.28),
              transparent 20%,
              rgba(208, 156, 100, 0.08) 50%,
              transparent 78%,
              rgba(0, 0, 0, 0.25)
            )
          `,
        }}
      />

      {/* Aged top and bottom edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-b from-[#a98054]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[4px] bg-gradient-to-t from-[#130b06] via-[#2c1a10] to-transparent" />

      {/* Side edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-[#160d07] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[3px] bg-gradient-to-l from-[#160d07] to-transparent" />

      {/* Wooden nail — top left */}
      <div className="pointer-events-none absolute left-2 top-2 z-20 flex h-[9px] w-[9px] items-center justify-center rounded-full border border-[#c1a17a]/50 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:left-3 sm:top-3">
        <span className="h-[3px] w-[3px] rounded-full bg-[#160d08]" />
      </div>

      {/* Wooden nail — top right */}
      <div className="pointer-events-none absolute right-2 top-2 z-20 flex h-[9px] w-[9px] items-center justify-center rounded-full border border-[#c1a17a]/50 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:right-3 sm:top-3">
        <span className="h-[3px] w-[3px] rounded-full bg-[#160d08]" />
      </div>

      {/* Wooden nail — bottom left */}
<div className="pointer-events-none absolute bottom-2 left-2 z-20 flex h-[9px] w-[9px] items-center justify-center rounded-full border border-[#c1a17a]/50 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:bottom-3 sm:left-3">
  <span className="h-[3px] w-[3px] rounded-full bg-[#160d08] shadow-[0_1px_1px_rgba(255,220,170,0.35)]" />
</div>

{/* Wooden nail — bottom right */}
<div className="pointer-events-none absolute bottom-2 right-2 z-20 flex h-[9px] w-[9px] items-center justify-center rounded-full border border-[#c1a17a]/50 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:bottom-3 sm:right-3">
  <span className="h-[3px] w-[3px] rounded-full bg-[#160d08] shadow-[0_1px_1px_rgba(255,220,170,0.35)]" />
</div>

      {/* Plaque content */}
      <div className="relative z-10 mx-auto max-w-5xl px-1 sm:px-3">
        <div className="flex items-start gap-2.5 sm:gap-3">
        

          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#f0d1a7] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-[9px] sm:tracking-[0.2em]">
              JMI Box Office Disclaimer
            </p>

            <p className="mt-1.5 text-[9px] leading-[1.65] text-[#d1b394] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] sm:text-[10px] sm:leading-[1.7]">
              Box-office collections and budgets are not always publicly disclosed or verifiable.
              JMI uses its own online ticket-tracking methodology, research, and available industry sources to estimate
              box-office performance.  JMI does not claims 100% accuracy for its figures.
            </p>
          </div>
        </div>
      </div>

      {/* Subtle aged lower accent */}
      <div className="pointer-events-none absolute bottom-1 left-1/2 h-px w-12 -translate-x-1/2 bg-[#c19a6c]/25 sm:w-16" />
    </aside>
  </MovieBoxOfficeDisclaimerWeather>
);

}