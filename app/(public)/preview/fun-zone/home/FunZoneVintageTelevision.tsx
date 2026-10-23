"use client";

import { useEffect, useState } from "react";

const headlines = [
  "NEW GAME ADDED IN JMI FUN ZONE",
  "CHANCES OF RAIN ARE GOING HIGH",
  "ACCURACY GAME ACHIEVING NEW HEIGHTS WITH RECORD PLAYERS",
  "FLOOD ALERT: FOLLOW OFFICIAL WEATHER ADVISORIES",
  "JMI — WORLD'S FIRST 3D VIRTUAL MOVIE ANALYTICS PLATFORM",
  "WELCOME TO THE JMI ENTERTAINMENT PAVILION",
  "JMI OFFICIAL PUBLIC LAUNCH ON 1ST NOVEMBER 05.00 PM"
];

function VintageBulbs() {
  const bulbs = [
    "#ffd166",
    "#ff6b8a",
    "#75e6ff",
    "#a6ff9b",
    "#d8a6ff",
    "#ffad66",
  ];

  return (
    <div
      aria-hidden="true"
      className="jmi-tv-bulbs pointer-events-none absolute inset-0"
    >
      {Array.from({ length: 26 }, (_, index) => {
        const isTop = index < 10;
        const isRight = index >= 10 && index < 14;
        const isBottom = index >= 14 && index < 24;

        let position: React.CSSProperties = {};

        if (isTop) {
          position = {
            top: "5px",
            left: `${7 + (index / 9) * 86}%`,
          };
        } else if (isRight) {
          position = {
            right: "5px",
            top: `${25 + ((index - 10) / 3) * 50}%`,
          };
        } else if (isBottom) {
          position = {
            bottom: "5px",
            left: `${93 - ((index - 14) / 9) * 86}%`,
          };
        } else {
          position = {
            left: "5px",
            top: `${70 - (index - 24) * 35}%`,
          };
        }

        const color = bulbs[index % bulbs.length];

        return (
          <span
            key={index}
            className="jmi-tv-bulb absolute block h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
            style={{
              ...position,
              backgroundColor: color,
              boxShadow: `0 0 5px ${color}, 0 0 10px ${color}70`,
              animationDelay: `${index * 110}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

function VintageAntenna() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-[51px] left-1/2 z-20 h-[68px] w-[155px] -translate-x-1/2 sm:-top-[62px] sm:h-[80px] sm:w-[190px]"
    >
      {/* Antenna mounting base */}
      <div className="absolute bottom-0 left-1/2 h-4 w-10 -translate-x-1/2 rounded-t-lg border border-[#694326] bg-gradient-to-b from-[#b47b3e] to-[#4a2b17]" />

      {/* Left antenna rod */}
      <div className="absolute bottom-3 left-[31%] h-[56px] w-[3px] origin-bottom rotate-[-35deg] rounded-full bg-gradient-to-r from-[#554d3c] via-[#e4d6b3] to-[#514431] shadow-[1px_1px_2px_rgba(0,0,0,0.6)] sm:h-[68px]" />

      {/* Right antenna rod */}
      <div className="absolute bottom-3 right-[31%] h-[56px] w-[3px] origin-bottom rotate-[35deg] rounded-full bg-gradient-to-r from-[#554d3c] via-[#e4d6b3] to-[#514431] shadow-[1px_1px_2px_rgba(0,0,0,0.6)] sm:h-[68px]" />

      {/* Left electrical spark */}
      <span className="jmi-tv-antenna-spark absolute left-[7%] top-0 h-3 w-3 rounded-full bg-[#fff5c4] sm:h-3.5 sm:w-3.5">
        <span className="jmi-tv-spark-rays absolute inset-[-7px] rounded-full border border-cyan-200/70" />
        <span className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-cyan-100/90" />
        <span className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-amber-100/90" />
      </span>

      {/* Right electrical spark */}
      <span className="jmi-tv-antenna-spark jmi-tv-antenna-spark-delayed absolute right-[7%] top-0 h-3 w-3 rounded-full bg-[#fff5c4] sm:h-3.5 sm:w-3.5">
        <span className="jmi-tv-spark-rays absolute inset-[-7px] rounded-full border border-amber-200/70" />
        <span className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-amber-100/90" />
        <span className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-cyan-100/90" />
      </span>

      {/* Antenna tips */}
      <span className="absolute left-[10%] top-0 h-2.5 w-2.5 rounded-full border border-[#e4cf9e] bg-gradient-to-br from-[#fff0bf] to-[#896039]" />
      <span className="absolute right-[10%] top-0 h-2.5 w-2.5 rounded-full border border-[#e4cf9e] bg-gradient-to-br from-[#fff0bf] to-[#896039]" />
    </div>
  );
}

/*
 * The tuning overlay and its styles live in the same component.
 * This avoids the parent style-jsx scoping problem.
 */
function VintageTvTuningEffect() {
  const [tuning, setTuning] = useState(false);

  useEffect(() => {
    let glitchTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const scheduleGlitch = (delay: number) => {
      nextTimer = setTimeout(() => {
        if (cancelled) return;

        setTuning(true);

        glitchTimer = setTimeout(() => {
          if (cancelled) return;

          setTuning(false);

          // Repeat after another 5–10 seconds.
          scheduleGlitch(5000 + Math.random() * 5000);
        }, 1600);
      }, delay);
    };

    // First interruption after 5 seconds, for easy testing.
    scheduleGlitch(5000);

    return () => {
      cancelled = true;
      clearTimeout(glitchTimer);
      clearTimeout(nextTimer);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className={`jmi-tv-tuning-overlay ${tuning ? "is-tuning" : ""}`}
      >
        <div className="jmi-tv-static" />
        <div className="jmi-tv-interference" />

        <div className="jmi-tv-tuning-message">
          <span className="block text-red-300">NO SIGNAL</span>
          <span className="mt-2 block text-emerald-100">
            RETUNING JMI BROADCAST...
          </span>
        </div>
      </div>

      <style jsx>{`
        .jmi-tv-tuning-overlay {
          position: absolute;
          inset: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: inherit;
          background: #050706;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .jmi-tv-tuning-overlay.is-tuning {
          visibility: visible;
          animation: jmi-tv-tuning-cycle 1600ms steps(1, end) both;
        }

        .jmi-tv-static {
          position: absolute;
          inset: -50%;
          opacity: 0;
          background-image:
            repeating-radial-gradient(
              circle at 20% 30%,
              rgba(255, 255, 255, 0.7) 0 1px,
              transparent 1px 4px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.12) 0 1px,
              transparent 1px 3px
            );
          background-size: 17px 13px, 100% 4px;
        }

        .is-tuning .jmi-tv-static {
          opacity: 0.45;
          animation: jmi-tv-static-jitter 120ms steps(2, end) infinite;
        }

        .jmi-tv-interference {
          position: absolute;
          inset: 0;
          opacity: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0 12px,
            rgba(220, 255, 235, 0.8) 13px 15px,
            transparent 16px 27px
          );
        }

        .is-tuning .jmi-tv-interference {
          opacity: 0.65;
          animation: jmi-tv-interference-sweep 450ms linear infinite;
        }

        .jmi-tv-tuning-message {
          position: relative;
          z-index: 2;
          padding: 12px;
          text-align: center;
          font-family: monospace;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-shadow: 0 0 8px rgba(150, 255, 180, 0.6);
          opacity: 0;
        }

        .is-tuning .jmi-tv-tuning-message {
          animation: jmi-tv-message-flicker 1600ms steps(1, end) both;
        }

        @keyframes jmi-tv-tuning-cycle {
          0%,
          100% {
            opacity: 0;
          }

          8%,
          18%,
          30%,
          46%,
          64%,
          80%,
          92% {
            opacity: 1;
          }

          12%,
          23%,
          37%,
          52%,
          72%,
          86% {
            opacity: 0.7;
          }
        }

        @keyframes jmi-tv-static-jitter {
          0% {
            transform: translate(1%, -1%);
          }

          50% {
            transform: translate(-2%, 1%);
          }

          100% {
            transform: translate(2%, 2%);
          }
        }

        @keyframes jmi-tv-interference-sweep {
          from {
            transform: translateY(-35%);
          }

          to {
            transform: translateY(35%);
          }
        }

        @keyframes jmi-tv-message-flicker {
          0%,
          100% {
            opacity: 0;
          }

          15%,
          35%,
          55%,
          75% {
            opacity: 1;
          }

          25%,
          45%,
          65%,
          85% {
            opacity: 0.35;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-tv-tuning-overlay.is-tuning,
          .jmi-tv-static,
          .jmi-tv-interference,
          .jmi-tv-tuning-message {
            animation: none;
          }

          .jmi-tv-tuning-overlay.is-tuning {
            visibility: visible;
            opacity: 1;
          }

          .jmi-tv-static {
            opacity: 0.35;
          }

          .jmi-tv-interference {
            opacity: 0.5;
          }

          .jmi-tv-tuning-message {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export default function FunZoneVintageTelevision() {
  return (
    <section
      aria-labelledby="jmi-vintage-tv-heading"
      className="my-10 sm:my-14"
    >
      <style jsx>{`
        .jmi-vintage-tv {
          background:
            repeating-linear-gradient(
              3deg,
              transparent 0px,
              transparent 13px,
              rgba(255, 218, 164, 0.045) 14px,
              transparent 16px,
              transparent 28px
            ),
            linear-gradient(
              120deg,
              #70421f 0%,
              #3d2414 20%,
              #80502a 42%,
              #422714 70%,
              #704323 100%
            );
          box-shadow:
            inset 0 2px 3px rgba(255, 225, 174, 0.22),
            inset 0 -5px 8px rgba(0, 0, 0, 0.4),
            0 12px 22px rgba(0, 0, 0, 0.35),
            0 3px 0 #241408;
        }

        .jmi-tv-screen {
          background:
            radial-gradient(
              ellipse at 48% 42%,
              rgba(50, 104, 67, 0.18),
              transparent 75%
            ),
            linear-gradient(
              135deg,
              #07120d 0%,
              #0b2117 48%,
              #06100b 100%
            );
          box-shadow:
            inset 0 0 0 2px #100d08,
            inset 0 0 0 4px #8b653b,
            inset 0 0 30px rgba(0, 0, 0, 0.9),
            0 0 12px rgba(116, 255, 156, 0.05);
        }

        .jmi-tv-glass {
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0.09),
            transparent 24%,
            transparent 75%,
            rgba(255, 255, 255, 0.025)
          );
        }

        .jmi-tv-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.16) 0px,
            rgba(0, 0, 0, 0.16) 1px,
            transparent 1px,
            transparent 4px
          );
        }

        .jmi-tv-news-track {
          animation: jmi-tv-news-scroll 42s linear infinite;
          will-change: transform;
        }

        .jmi-tv-bulb {
          animation: jmi-tv-light-glow 1.8s ease-in-out infinite alternate;
        }

        .jmi-tv-screen-glow {
          animation: jmi-tv-screen-pulse 4s ease-in-out infinite;
        }

        .jmi-tv-antenna-spark {
          z-index: 5;
          animation: jmi-tv-electric-spark 1.2s ease-in-out infinite;
          box-shadow:
            0 0 5px 2px rgba(255, 246, 190, 0.9),
            0 0 13px 5px rgba(255, 194, 91, 0.65),
            0 0 22px 7px rgba(88, 211, 255, 0.3);
        }

        .jmi-tv-antenna-spark-delayed {
          animation-delay: 600ms;
        }

        .jmi-tv-spark-rays {
          animation: jmi-tv-ray-spin 3s linear infinite;
        }

        .jmi-tv-knob {
          background: radial-gradient(
            circle at 30% 25%,
            #e4bd7a,
            #95602e 42%,
            #452713 78%,
            #201208 100%
          );
          box-shadow:
            inset 0 1px 2px rgba(255, 240, 190, 0.35),
            0 2px 2px rgba(0, 0, 0, 0.65);
        }

        @keyframes jmi-tv-news-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @keyframes jmi-tv-light-glow {
          from {
            opacity: 0.6;
            filter: brightness(0.8);
          }

          to {
            opacity: 1;
            filter: brightness(1.3);
          }
        }

        @keyframes jmi-tv-screen-pulse {
          0%,
          100% {
            opacity: 0.88;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes jmi-tv-electric-spark {
          0%,
          100% {
            opacity: 0.65;
            transform: scale(0.8);
            filter: brightness(0.9);
          }

          35% {
            opacity: 1;
            transform: scale(1.2);
            filter: brightness(1.6);
          }

          45% {
            opacity: 0.45;
            transform: scale(0.75);
          }

          60% {
            opacity: 1;
            transform: scale(1.1);
            filter: brightness(1.8);
          }
        }

        @keyframes jmi-tv-ray-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-tv-news-track,
          .jmi-tv-bulb,
          .jmi-tv-screen-glow,
          .jmi-tv-antenna-spark,
          .jmi-tv-spark-rays {
            animation: none;
          }

          .jmi-tv-antenna-spark {
            opacity: 0.95;
          }
        }
      `}</style>

      {/* Section introduction */}
      <div className="mb-5 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-pink-400">
          Live from the JMI Pavilion
        </p>

        <h2
          id="jmi-vintage-tv-heading"
          className="mt-2 font-serif text-xl font-bold text-[#f3e4c8] sm:text-2xl"
        >
          📺 The JMI News Corner
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-[10px] leading-5 text-zinc-500 sm:text-xs">
          Tune in for entertainment updates, game highlights,
          and the latest happenings around JMI.
        </p>
      </div>

      {/* Festival paper decorations */}
      <div
        aria-hidden="true"
        className="mx-auto mb-[-3px] flex max-w-lg items-start justify-around px-5"
      >
        {[
          "#f472b6",
          "#facc15",
          "#38bdf8",
          "#4ade80",
          "#c084fc",
          "#fb923c",
          "#f472b6",
        ].map((color, index) => (
          <span
            key={index}
            className="h-5 w-4 sm:h-7 sm:w-5"
            style={{
              backgroundColor: color,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transform: `rotate(${index % 2 === 0 ? 4 : -4}deg)`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      {/* Television assembly */}
      <div className="relative mx-auto mt-12 max-w-4xl px-2 sm:px-5">
        <VintageAntenna />

        {/* Slimmer wooden cabinet */}
        <div className="jmi-vintage-tv relative rounded-[23px] border-2 border-[#29180c] p-2 sm:rounded-[29px] sm:border-[3px] sm:p-3">
          <div className="pointer-events-none absolute inset-1 rounded-[19px] border border-[#c28a4a]/40 sm:inset-2 sm:rounded-[24px]" />

          <VintageBulbs />

          <div className="relative grid grid-cols-1 gap-2 pt-3 sm:grid-cols-[minmax(0,1fr)_96px] sm:gap-3 sm:pt-2">
            {/* Larger, taller CRT screen */}
            <div className="relative min-w-0 rounded-[18px] border-[4px] border-[#241509] bg-[#100c08] p-1 shadow-[inset_0_0_0_1px_rgba(219,173,109,0.3)] sm:rounded-[22px] sm:border-[5px] sm:p-1.5">
              <div className="jmi-tv-screen jmi-tv-screen-glow relative flex h-[270px] flex-col justify-between overflow-hidden rounded-[40%_40%_15px_15px/12%_12%_15px_15px] sm:h-[330px]">
                {/* Glass reflection */}
                <div
                  aria-hidden="true"
                  className="jmi-tv-glass pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
                />

                {/* CRT scanlines */}
                <div
                  aria-hidden="true"
                  className="jmi-tv-scanlines pointer-events-none absolute inset-0 z-10"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-10 -top-14 z-10 h-28 w-48 rotate-[-28deg] rounded-full bg-white/[0.035] blur-xl"
                />

                {/* Broadcast header */}
                <div className="relative z-0 flex items-center justify-between gap-2 border-b border-emerald-300/15 bg-black/30 px-3 py-3 sm:px-5">
                  <span className="font-mono text-[8px] font-bold tracking-[0.2em] text-emerald-300 sm:text-[10px]">
                    JMI NEWS
                  </span>

                  <span className="flex items-center gap-1.5 text-[7px] font-bold tracking-[0.12em] text-red-300 sm:text-[8px]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                    ON AIR
                  </span>
                </div>

                {/* Scrolling headlines */}
                <div className="relative z-0 flex min-h-0 flex-1 flex-col justify-center overflow-hidden py-4">
                  <div className="mb-4 flex items-center gap-2 px-3 sm:px-5">
                    <span className="shrink-0 border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 font-mono text-[7px] font-bold tracking-[0.14em] text-emerald-200 sm:text-[8px]">
                      HEADLINES
                    </span>

                    <span className="h-px flex-1 bg-emerald-300/20" />
                  </div>

                  <div className="overflow-hidden">
                    <div className="jmi-tv-news-track flex w-max">
                      {[0, 1].map((copy) => (
                        <div
                          key={copy}
                          aria-hidden={copy === 1 ? true : undefined}
                          className="flex shrink-0 items-center"
                        >
                          {headlines.map((headline, index) => (
                            <span
                              key={`${copy}-${index}`}
                              className="mx-5 flex items-center gap-3 whitespace-nowrap font-mono text-[10px] font-bold tracking-[0.08em] text-[#b4ffc2] sm:mx-7 sm:text-xs"
                            >
                              <span className="text-amber-300">◆</span>
                              {headline}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 px-3 sm:px-5">
                    <p className="font-mono text-[7px] leading-4 text-emerald-100/50 sm:text-[8px]">
                      JERUTO MOVIE INTELLIGENCE
                      <span className="ml-2 text-amber-300/80">
                        • ENTERTAINMENT • CINEMA • ANALYTICS
                      </span>
                    </p>
                  </div>
                </div>

                {/* Screen footer */}
                <div className="relative z-0 flex items-center justify-between border-t border-emerald-300/15 bg-black/30 px-3 py-2 sm:px-5">
                  <span className="font-mono text-[7px] tracking-[0.1em] text-emerald-200/50">
                    CHANNEL 01
                  </span>

                  <span className="font-mono text-[7px] tracking-[0.1em] text-emerald-200/50">
                    JMI • TV
                  </span>
                </div>

                {/* Tuning overlay must be inside the CRT screen */}
                <VintageTvTuningEffect />
              </div>
            </div>

            {/* Slimmer side control panel */}
            <div className="flex items-center justify-around gap-3 rounded-xl border border-[#b17c42]/25 bg-black/20 px-2 py-2 sm:flex-col sm:justify-center sm:gap-4 sm:rounded-2xl sm:px-2 sm:py-4">
              <div className="text-center">
                <p className="font-serif text-[11px] font-black tracking-[0.2em] text-[#e4c28d] sm:text-xs">
                  JMI
                </p>

                <div className="mx-auto mt-1 h-px w-8 bg-amber-600/60" />

                <p className="mt-1 text-[6px] font-bold uppercase tracking-[0.1em] text-amber-100/45">
                  Television
                </p>
              </div>

              {/* Speaker grille */}
              <div
                aria-hidden="true"
                className="grid grid-cols-7 gap-[3px] rounded-lg border border-amber-900/40 bg-black/35 p-2"
              >
                {Array.from({ length: 35 }, (_, index) => (
                  <span
                    key={index}
                    className="h-1 w-1 rounded-full bg-[#b98a51]/65 sm:h-1.5 sm:w-1.5"
                  />
                ))}
              </div>

              {/* Control knobs */}
              <div className="flex gap-3 sm:flex-col sm:gap-3">
                {[0, 1].map((knob) => (
                  <div key={knob} className="text-center">
                    <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-[#241509] bg-[#100a05] p-1 sm:h-9 sm:w-9">
                      <div className="jmi-tv-knob relative h-full w-full rounded-full">
                        <span className="absolute left-1/2 top-1 h-2 w-[2px] -translate-x-1/2 rounded-full bg-[#f5d7a1]" />
                      </div>
                    </div>

                    <p className="mt-1 text-[6px] font-bold uppercase tracking-[0.1em] text-amber-100/45">
                      {knob === 0 ? "Tune" : "Volume"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reduced cabinet base */}
          <div className="relative mt-2 flex items-center justify-center gap-3 border-t border-[#d7a466]/20 pt-2 sm:mt-3 sm:pt-3">
            <span className="h-1 w-8 rounded-full bg-[#1c1008] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />

            <span className="font-mono text-[7px] font-bold tracking-[0.25em] text-[#d4ac77]/65">
              JERUTO • EST. FOR CINEMA LOVERS
            </span>

            <span className="h-1 w-8 rounded-full bg-[#1c1008] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          </div>
        </div>

        {/* Television feet */}
        <div
          aria-hidden="true"
          className="mx-auto flex w-[76%] justify-between px-4"
        >
          <span className="h-4 w-7 -skew-x-[18deg] rounded-b-md border-x border-b border-[#38200f] bg-gradient-to-b from-[#704323] to-[#26160b] sm:h-5 sm:w-10" />

          <span className="h-4 w-7 skew-x-[18deg] rounded-b-md border-x border-b border-[#38200f] bg-gradient-to-b from-[#704323] to-[#26160b] sm:h-5 sm:w-10" />
        </div>

        {/* Ground shadow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-5 left-[12%] right-[12%] -z-10 h-8 rounded-full bg-black/40 blur-xl"
        />
      </div>

      <p className="mt-6 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-amber-100/35 sm:text-[9px]">
        ✦ Stay tuned to the JMI Entertainment Network ✦
      </p>
    </section>
  );
}