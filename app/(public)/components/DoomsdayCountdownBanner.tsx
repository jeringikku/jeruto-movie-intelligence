"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { supabase } from "@/lib/supabase";
import { useJmiRainState } from "@/app/(public)/components/useJmiRainState";
import JmiRain from "@/app/(public)/components/JmiRain";

type SiteAsset = {
  asset_url: string;
  alt_text: string | null;
};

type CountdownTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type EnergyBurst = {
  id: number;
  x: number;
  y: number;
};

const TARGET_DATE = new Date(
  "2026-12-17T00:00:00+05:30"
).getTime();

const BURST_DURATION = 3600;
const MAX_ACTIVE_BURSTS = 3;

/* =========================================================
   RAIN DROPLET CONFIGURATION
========================================================= */

const droplets = [
  { left: 7, delay: -1.2, duration: 4.8, size: 5, travel: 340 },
  { left: 18, delay: -3.5, duration: 6.2, size: 3, travel: 380 },
  { left: 29, delay: -2.1, duration: 5.4, size: 6, travel: 350 },
  { left: 41, delay: -4.3, duration: 7.0, size: 4, travel: 390 },
  { left: 53, delay: -0.7, duration: 4.5, size: 5, travel: 330 },
  { left: 65, delay: -2.8, duration: 5.8, size: 3, travel: 370 },
  { left: 77, delay: -4.8, duration: 6.5, size: 6, travel: 400 },
  { left: 89, delay: -1.9, duration: 4.9, size: 4, travel: 345 },
];

/* =========================================================
   ENERGY PARTICLE CONFIGURATION
========================================================= */

const energyParticles = [
  { angle: 0, distance: 75 },
  { angle: 45, distance: 95 },
  { angle: 90, distance: 70 },
  { angle: 135, distance: 90 },
  { angle: 180, distance: 80 },
  { angle: 225, distance: 100 },
  { angle: 270, distance: 75 },
  { angle: 315, distance: 90 },
];

/* =========================================================
   COUNTDOWN CALCULATION
========================================================= */

function calculateCountdown(): CountdownTime {
  const difference = Math.max(
    0,
    TARGET_DATE - Date.now()
  );

  return {
    days: Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor(
      (difference / 1000) % 60
    ),
  };
}

/* =========================================================
   ROLLING DIGIT
========================================================= */

function RollingNumber({
  value,
}: {
  value: number;
}) {
  const digits = String(value).padStart(2, "0").split("");

  return (
    <div
      className="flex items-center justify-center gap-[2px]"
      aria-label={String(value).padStart(2, "0")}
    >
      {digits.map((digit, index) => (
        <span
          key={`${index}-${digit}`}
          className="doomsday-digit relative inline-flex h-[34px] w-[23px] items-center justify-center overflow-hidden rounded-sm bg-black/70 font-mono text-[25px] font-bold leading-none tabular-nums text-green-400 sm:h-[45px] sm:w-[31px] sm:text-[34px]"
        >
          <span className="doomsday-digit-enter absolute inset-0 flex items-center justify-center">
            {digit}
          </span>
        </span>
      ))}
    </div>
  );
}

/* =========================================================
   COUNTDOWN UNIT
========================================================= */

function CountdownUnit({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center border-r border-green-800/30 px-1 last:border-r-0 sm:px-3">
      <RollingNumber value={value} />

      <span className="mt-2 text-[6px] font-semibold uppercase tracking-[0.16em] text-zinc-400 sm:text-[8px] sm:tracking-[0.22em]">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   MAIN DOOMSDAY COUNTDOWN BANNER
========================================================= */

export default function DoomsdayCountdownBanner() {
  const [poster, setPoster] = useState<SiteAsset | null>(null);
  const [loading, setLoading] = useState(true);

  const [countdown, setCountdown] =
    useState<CountdownTime | null>(null);

  const [energyBursts, setEnergyBursts] =
    useState<EnergyBurst[]>([]);

  const burstId = useRef(0);
  const burstTimers = useRef<number[]>([]);

  // Uses the same shared JMI rain schedule.
  const isRaining = useJmiRainState();

  /* =====================================================
     LOAD POSTER FROM SITE ASSETS
  ===================================================== */

  useEffect(() => {
    let active = true;

    async function loadPoster() {
      const { data, error } = await supabase
        .from("jmi_site_assets")
        .select("asset_url, alt_text")
        .eq("asset_key", "doomsday_countdown_home_poster")
        .eq("is_active", true)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error(
          "Doomsday countdown poster error:",
          error
        );

        setPoster(null);
      } else {
        setPoster(data as SiteAsset | null);
      }

      setLoading(false);
    }

    loadPoster();

    return () => {
      active = false;
    };
  }, []);

  /* =====================================================
     LIVE COUNTDOWN
  ===================================================== */

  useEffect(() => {
    function updateCountdown() {
      setCountdown(calculateCountdown());
    }

    updateCountdown();

    const interval = window.setInterval(
      updateCountdown,
      1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =====================================================
     DOOMSDAY ENERGY TOUCH EFFECT
  ===================================================== */

  function handlePosterPointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    // Ignore secondary mouse buttons.
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const bounds =
      event.currentTarget.getBoundingClientRect();

    if (!bounds.width || !bounds.height) return;

    const x =
      ((event.clientX - bounds.left) / bounds.width) * 100;

    const y =
      ((event.clientY - bounds.top) / bounds.height) * 100;

    const id = ++burstId.current;

    const newBurst: EnergyBurst = {
      id,
      x,
      y,
    };

    // Keep a maximum of three active energy effects.
    setEnergyBursts((previous) => [
      ...previous.slice(-(MAX_ACTIVE_BURSTS - 1)),
      newBurst,
    ]);

    // Automatically remove the effect after 3.6 seconds.
    const timer = window.setTimeout(() => {
      setEnergyBursts((previous) =>
        previous.filter((burst) => burst.id !== id)
      );

      burstTimers.current = burstTimers.current.filter(
        (timerId) => timerId !== timer
      );
    }, BURST_DURATION);

    burstTimers.current.push(timer);
  }

  /* =====================================================
     CLEAN UP ENERGY EFFECT TIMERS
  ===================================================== */

  useEffect(() => {
    return () => {
      burstTimers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      burstTimers.current = [];
    };
  }, []);

  const countdownFinished =
    countdown !== null &&
    countdown.days === 0 &&
    countdown.hours === 0 &&
    countdown.minutes === 0 &&
    countdown.seconds === 0;

  return (
    <section className="relative isolate overflow-hidden border-y border-green-950/70 bg-black py-10 sm:py-14">

      {/* =====================================================
          CINEMATIC CSS ANIMATIONS
      ===================================================== */}

      <style jsx>{`
        @keyframes doomsday-page-drop {
          0% {
            transform: translate3d(0, -105%, 0) rotateX(-65deg);
            opacity: 0;
          }

          65% {
            transform: translate3d(0, 5%, 0) rotateX(5deg);
            opacity: 1;
          }

          100% {
            transform: translate3d(0, 0, 0) rotateX(0deg);
            opacity: 1;
          }
        }

        .doomsday-digit-enter {
          transform-origin: top center;
          animation: doomsday-page-drop 420ms
            cubic-bezier(0.2, 0.75, 0.25, 1) both;
          backface-visibility: hidden;
        }

        /* =================================================
           WET POSTER
        ================================================= */

        .doomsday-poster-image {
          transition: filter 1.2s ease;
        }

        .doomsday-poster-raining .doomsday-poster-image {
          filter: brightness(0.86) saturate(0.94);
        }

        .doomsday-wet-glass {
          overflow: hidden;
          background: rgba(165, 195, 220, 0.025);
          isolation: isolate;
        }

        .doomsday-wet-sheen {
          background:
            linear-gradient(
              112deg,
              transparent 15%,
              rgba(255, 255, 255, 0.09) 28%,
              transparent 38%
            ),
            linear-gradient(
              180deg,
              rgba(205, 225, 245, 0.07),
              transparent 30%,
              transparent 72%,
              rgba(15, 30, 45, 0.07)
            );
        }

        .doomsday-rolling-drop {
          position: absolute;
          top: -24px;
          display: block;
          border-radius: 60% 45% 60% 45%;
          background: radial-gradient(
            ellipse at 28% 20%,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(245, 250, 255, 0.78) 10%,
            rgba(210, 232, 250, 0.32) 30%,
            rgba(145, 180, 210, 0.12) 58%,
            transparent 78%
          );
          box-shadow:
            1px 2px 3px rgba(0, 0, 0, 0.2),
            inset -1px -1px 2px rgba(120, 155, 185, 0.25),
            inset 1px 1px 1px rgba(255, 255, 255, 0.45);
          opacity: 0;
          animation: doomsday-drop-roll linear infinite;
          will-change: transform, opacity;
        }

        @keyframes doomsday-drop-roll {
          0% {
            transform: translate3d(0, -20px, 0) scale(0.85);
            opacity: 0;
          }

          5% {
            opacity: 0.85;
          }

          25% {
            transform: translate3d(2px, 75px, 0) scale(1);
            opacity: 0.95;
          }

          48% {
            transform: translate3d(-1px, 165px, 0) scale(1.05);
            opacity: 0.88;
          }

          70% {
            transform: translate3d(3px, 255px, 0) scale(1.1);
            opacity: 0.9;
          }

          90% {
            transform: translate3d(1px, var(--drop-travel), 0) scale(1.15);
            opacity: 0.75;
          }

          100% {
            transform: translate3d(-2px, calc(var(--drop-travel) + 30px), 0) scale(1.2);
            opacity: 0;
          }
        }

        .doomsday-water-bead {
          position: absolute;
          width: 9px;
          height: 13px;
          border-radius: 60% 45% 60% 45%;
          background: radial-gradient(
            ellipse at 28% 20%,
            rgba(255, 255, 255, 0.98),
            rgba(225, 240, 255, 0.62) 12%,
            rgba(190, 220, 245, 0.2) 38%,
            rgba(120, 160, 195, 0.12) 63%,
            transparent 78%
          );
          border-top: 1px solid rgba(255, 255, 255, 0.8);
          border-left: 1px solid rgba(235, 247, 255, 0.55);
          box-shadow:
            1px 1px 2px rgba(0, 0, 0, 0.2),
            inset -1px -1px 1px rgba(90, 125, 155, 0.2);
          animation: doomsday-bead-move 4.5s ease-in-out infinite alternate;
        }

        .doomsday-water-bead-one {
          left: 22%;
          top: 28%;
          transform: scale(0.8);
          animation-delay: -1.4s;
        }

        .doomsday-water-bead-two {
          left: 73%;
          top: 44%;
          transform: scale(1.2);
          animation-delay: -3s;
        }

        .doomsday-water-bead-three {
          left: 46%;
          top: 70%;
          transform: scale(0.65);
          animation-delay: -2.1s;
        }

        .doomsday-water-bead-four {
          left: 88%;
          top: 17%;
          transform: scale(0.9);
          animation-delay: -0.8s;
        }

        @keyframes doomsday-bead-move {
          from {
            margin-top: -2px;
            opacity: 0.65;
          }

          to {
            margin-top: 5px;
            opacity: 1;
          }
        }

        .doomsday-water-trails {
          opacity: 0.32;
          background-image:
            linear-gradient(
              178deg,
              transparent 0%,
              rgba(255, 255, 255, 0.28) 18%,
              rgba(255, 255, 255, 0.04) 42%,
              transparent 66%
            ),
            linear-gradient(
              179deg,
              transparent 0%,
              rgba(210, 232, 250, 0.2) 23%,
              transparent 57%
            );
          background-size: 1px 105px, 2px 145px;
          background-position: 28% 0, 71% 35px;
          background-repeat: repeat-y;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 12%,
            black 85%,
            transparent
          );
        }

        /* =================================================
           DOOMSDAY ENERGY TOUCH EFFECT
        ================================================= */

        .doomsday-energy-burst {
          position: absolute;
          width: 1px;
          height: 1px;
          pointer-events: none;
          z-index: 30;
        }

        .doomsday-energy-smoke {
          position: absolute;
          left: 0;
          top: 0;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0.15);
          background: radial-gradient(
            circle,
            rgba(74, 222, 128, 0.36) 0%,
            rgba(34, 197, 94, 0.24) 25%,
            rgba(22, 163, 74, 0.13) 48%,
            rgba(20, 83, 45, 0.06) 65%,
            transparent 75%
          );
          filter: blur(12px);
          animation: doomsday-smoke-expand 3.5s ease-out forwards;
        }

        .doomsday-energy-flash {
          position: absolute;
          left: 0;
          top: 0;
          width: 145px;
          height: 145px;
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0.1);
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(187, 247, 208, 0.85) 4%,
            rgba(74, 222, 128, 0.65) 12%,
            rgba(34, 197, 94, 0.22) 35%,
            transparent 70%
          );
          filter: blur(3px);
          animation: doomsday-energy-flash 650ms ease-out forwards;
        }

        .doomsday-energy-ring {
          position: absolute;
          left: 0;
          top: 0;
          width: 48px;
          height: 48px;
          border: 2px solid rgba(134, 239, 172, 0.9);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0.2);
          box-shadow:
            0 0 8px rgba(74, 222, 128, 0.9),
            inset 0 0 8px rgba(74, 222, 128, 0.4);
          animation: doomsday-energy-ring 900ms ease-out forwards;
        }

        .doomsday-energy-particle {
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #bbf7d0;
          box-shadow:
            0 0 5px #4ade80,
            0 0 10px rgba(74, 222, 128, 0.8);
          animation: doomsday-particle-spread 950ms ease-out forwards;
          animation-delay: var(--particle-delay, 0ms);
        }

        @keyframes doomsday-smoke-expand {
          0% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(0.15);
          }

          35% {
            opacity: 0.75;
            transform: translate(-50%, -50%) scale(1.15);
          }

          75% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(1.55);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.8);
          }
        }

        @keyframes doomsday-energy-flash {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.1);
          }

          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.75);
          }

          35% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.65);
          }
        }

        @keyframes doomsday-energy-ring {
          0% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(0.2);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(3.5);
          }
        }

        @keyframes doomsday-particle-spread {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }

          100% {
            opacity: 0;
            transform:
              translate(
                calc(-50% + var(--particle-x)),
                calc(-50% + var(--particle-y))
              )
              scale(0.2);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .doomsday-digit-enter,
          .doomsday-rolling-drop,
          .doomsday-water-bead,
          .doomsday-energy-smoke,
          .doomsday-energy-flash,
          .doomsday-energy-ring,
          .doomsday-energy-particle {
            animation: none;
          }

          .doomsday-rolling-drop {
            opacity: 0.75;
            top: 35%;
          }

          .doomsday-energy-smoke {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1);
          }

          .doomsday-energy-flash,
          .doomsday-energy-ring,
          .doomsday-energy-particle {
            display: none;
          }

          .doomsday-poster-image {
            transition: none;
          }
        }
      `}</style>

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <JmiRain />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-900/[0.10] blur-[100px]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,83,45,0.09),transparent_65%)]" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-800/50 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-800/50 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* SECTION LABEL */}

        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-green-800/70" />

          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-green-500 sm:text-[10px]">
            A Cinematic Countdown · JMI Special
          </p>

          <span className="h-px w-8 bg-green-800/70" />
        </div>

        {/* POSTER */}

        <div className="mx-auto w-full max-w-[340px] sm:max-w-[420px]">

          <div
            onPointerDown={handlePosterPointerDown}
            className={`group relative isolate overflow-hidden rounded-xl border border-green-900/50 bg-zinc-950 shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_35px_rgba(34,197,94,0.08)] ${
              isRaining ? "doomsday-poster-raining" : ""
            }`}
          >

            {/* POSTER IMAGE */}

            {loading ? (
              <div className="flex aspect-[2/3] items-center justify-center bg-zinc-950">
                <p className="text-[9px] uppercase tracking-[0.25em] text-green-700">
                  Loading Doomsday
                </p>
              </div>
            ) : poster ? (
              <img
                src={poster.asset_url}
                alt={
                  poster.alt_text ||
                  "Avengers Doomsday JMI countdown poster"
                }
                loading="eager"
                draggable={false}
                className="doomsday-poster-image relative z-0 block aspect-[2/3] w-full select-none object-contain"
              />
            ) : (
              <div className="relative z-0 flex aspect-[2/3] items-center justify-center bg-gradient-to-br from-zinc-950 via-green-950/30 to-black px-6 text-center">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-green-500">
                    JMI Special
                  </p>

                  <h2 className="mt-4 font-serif text-3xl font-bold text-white">
                    DOOMSDAY
                  </h2>

                  <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                    The Countdown Begins
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                JMI WET POSTER EFFECT
            ================================================= */}

            {isRaining && poster && (
              <div
                className="doomsday-wet-glass pointer-events-none absolute inset-0 z-[3]"
                aria-hidden="true"
              >

                <div className="doomsday-wet-sheen absolute inset-0" />

                {droplets.map((drop, index) => (
                  <span
                    key={index}
                    className="doomsday-rolling-drop"
                    style={
                      {
                        left: `${drop.left}%`,
                        width: `${drop.size}px`,
                        height: `${drop.size * 1.65}px`,
                        animationDelay: `${drop.delay}s`,
                        animationDuration: `${drop.duration}s`,
                        "--drop-travel": `${drop.travel}px`,
                      } as React.CSSProperties
                    }
                  />
                ))}

                <span className="doomsday-water-bead doomsday-water-bead-one" />
                <span className="doomsday-water-bead doomsday-water-bead-two" />
                <span className="doomsday-water-bead doomsday-water-bead-three" />
                <span className="doomsday-water-bead doomsday-water-bead-four" />

                <div className="doomsday-water-trails absolute inset-0" />

              </div>
            )}

            {/* =================================================
                DOOMSDAY ENERGY TOUCH EFFECT
            ================================================= */}

            {energyBursts.map((burst) => (
              <div
                key={burst.id}
                className="doomsday-energy-burst"
                style={{
                  left: `${burst.x}%`,
                  top: `${burst.y}%`,
                }}
                aria-hidden="true"
              >
                {/* Expanding green smoke */}

                <span className="doomsday-energy-smoke" />

                {/* Initial electric flash */}

                <span className="doomsday-energy-flash" />

                {/* Expanding energy ring */}

                <span className="doomsday-energy-ring" />

                {/* Outward energy particles */}

                {energyParticles.map((particle, index) => {
                  const radians =
                    (particle.angle * Math.PI) / 180;

                  const particleX =
                    Math.cos(radians) * particle.distance;

                  const particleY =
                    Math.sin(radians) * particle.distance;

                  return (
                    <span
                      key={index}
                      className="doomsday-energy-particle"
                      style={
                        {
                          "--particle-x": `${particleX}px`,
                          "--particle-y": `${particleY}px`,
                          "--particle-delay": `${index * 15}ms`,
                        } as React.CSSProperties
                      }
                    />
                  );
                })}
              </div>
            ))}

            {/* =================================================
                POSTER BOTTOM FADE
            ================================================= */}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[35%] bg-gradient-to-t from-black via-black/90 to-transparent" />

            {/* =================================================
                EMBEDDED COUNTDOWN
            ================================================= */}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[10] px-3 pb-4 pt-8 sm:px-6 sm:pb-6 sm:pt-12">

              <div className="text-center">

                <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-green-400 sm:text-[9px]">
                  The Countdown to Doomsday
                </p>

                <div className="mx-auto mt-3 flex max-w-[310px] items-center justify-center rounded-lg border border-green-700/40 bg-black/75 px-2 py-3 shadow-[0_0_25px_rgba(34,197,94,0.08)] backdrop-blur-sm sm:mt-4 sm:px-4 sm:py-4">

                  {countdownFinished ? (
                    <p className="py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-green-400 sm:text-sm">
                      The Day Has Arrived
                    </p>
                  ) : (
                    <>
                      <CountdownUnit
                        value={countdown?.days ?? 0}
                        label="Days"
                      />

                      <CountdownUnit
                        value={countdown?.hours ?? 0}
                        label="Hours"
                      />

                      <CountdownUnit
                        value={countdown?.minutes ?? 0}
                        label="Minutes"
                      />

                      <CountdownUnit
                        value={countdown?.seconds ?? 0}
                        label="Seconds"
                      />
                    </>
                  )}

                </div>

                <p className="mt-3 text-[6px] font-medium uppercase tracking-[0.18em] text-zinc-300/80 sm:text-[8px] sm:tracking-[0.24em]">
                  17 December 2026 · 12:00 AM IST
                </p>

              </div>

            </div>

            {/* JMI WATERMARK */}

            <div className="pointer-events-none absolute right-2 top-2 z-[10] rounded border border-white/10 bg-black/40 px-2 py-1 backdrop-blur-sm">
              <p className="text-[6px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-[7px]">
                JMI Special
              </p>
            </div>

          </div>

        </div>

        {/* SUPPORTING LINE */}

        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="h-px w-7 bg-green-900/60" />

          <p className="text-center text-[7px] uppercase tracking-[0.16em] text-zinc-500 sm:text-[8px] sm:tracking-[0.2em]">
            One cinematic event · One global countdown
          </p>

          <span className="h-px w-7 bg-green-900/60" />
        </div>

      </div>
    </section>
  );
}