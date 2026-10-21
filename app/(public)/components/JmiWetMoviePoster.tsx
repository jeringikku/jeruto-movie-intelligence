"use client";

import { useJmiRainState } from "@/app/(public)/components/useJmiRainState";

type JmiWetMoviePosterProps = {
  posterUrl: string | null;
  movieTitle: string;
};

const droplets = [
  { left: 7, delay: -1.2, duration: 4.8, size: 5, travel: 340 },
  { left: 15, delay: -3.5, duration: 6.2, size: 3, travel: 380 },
  { left: 24, delay: -2.1, duration: 5.4, size: 7, travel: 350 },
  { left: 32, delay: -4.3, duration: 7.0, size: 4, travel: 390 },
  { left: 41, delay: -0.7, duration: 4.5, size: 6, travel: 330 },
  { left: 50, delay: -2.8, duration: 5.8, size: 3, travel: 370 },
  { left: 59, delay: -4.8, duration: 6.5, size: 8, travel: 400 },
  { left: 68, delay: -1.9, duration: 4.9, size: 4, travel: 345 },
  { left: 76, delay: -3.2, duration: 6.8, size: 6, travel: 385 },
  { left: 85, delay: -0.4, duration: 5.2, size: 3, travel: 360 },
  { left: 94, delay: -2.5, duration: 6.0, size: 5, travel: 395 },
];

export default function JmiWetMoviePoster({
  posterUrl,
  movieTitle,
}: JmiWetMoviePosterProps) {
  const isRaining = useJmiRainState();

  return (
    <div
      className={`jmi-wet-poster relative h-[320px] w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 sm:h-[290px] ${
        isRaining ? "jmi-wet-poster-active" : ""
      }`}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={`${movieTitle} poster`}
          className="jmi-wet-poster-image absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-2xl text-zinc-800">◈</span>
        </div>
      )}

      {isRaining && posterUrl && (
        <div
          className="jmi-wet-glass pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {/* Subtle wet-glass sheen */}
          <div className="jmi-wet-sheen absolute inset-0" />

          {/* Individual rolling water droplets */}
          {droplets.map((drop, index) => (
            <span
              key={index}
              className={`jmi-rolling-drop jmi-rolling-drop-${index % 3}`}
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

          {/* A few larger beads of water */}
          <span className="jmi-water-bead jmi-water-bead-one" />
          <span className="jmi-water-bead jmi-water-bead-two" />
          <span className="jmi-water-bead jmi-water-bead-three" />
          <span className="jmi-water-bead jmi-water-bead-four" />

          {/* Fine, irregular water trails */}
          <div className="jmi-water-trails absolute inset-0" />
        </div>
      )}

      <style jsx>{`
        .jmi-wet-poster-image {
          transition: filter 1.2s ease;
        }

        .jmi-wet-poster-active .jmi-wet-poster-image {
          filter: brightness(0.86) saturate(0.94);
        }

        .jmi-wet-glass {
          overflow: hidden;
          background: rgba(165, 195, 220, 0.025);
          isolation: isolate;
        }

        .jmi-wet-sheen {
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

        .jmi-rolling-drop {
          position: absolute;
          top: -24px;
          display: block;
          border-radius: 65% 45% 60% 45%;
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
          animation-name: jmiDropRoll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        .jmi-rolling-drop-0 {
          border-radius: 50%;
        }

        .jmi-rolling-drop-1 {
          border-radius: 60% 45% 55% 45%;
        }

        .jmi-rolling-drop-2 {
          border-radius: 55% 55% 65% 45%;
        }

        .jmi-water-bead {
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
          animation: jmiBeadMove 4.5s ease-in-out infinite alternate;
        }

        .jmi-water-bead-one {
          left: 22%;
          top: 28%;
          transform: scale(0.8);
          animation-delay: -1.4s;
        }

        .jmi-water-bead-two {
          left: 73%;
          top: 44%;
          transform: scale(1.2);
          animation-delay: -3s;
        }

        .jmi-water-bead-three {
          left: 46%;
          top: 70%;
          transform: scale(0.65);
          animation-delay: -2.1s;
        }

        .jmi-water-bead-four {
          left: 88%;
          top: 17%;
          transform: scale(0.9);
          animation-delay: -0.8s;
        }

        .jmi-water-trails {
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
          background-size:
            1px 105px,
            2px 145px;
          background-position:
            28% 0,
            71% 35px;
          background-repeat: repeat-y;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 12%,
            black 85%,
            transparent
          );
        }

       @keyframes jmiDropRoll {
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

        @keyframes jmiBeadMove {
          from {
            margin-top: -2px;
            opacity: 0.65;
          }

          to {
            margin-top: 5px;
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-rolling-drop,
          .jmi-water-bead {
            animation: none;
          }

          .jmi-rolling-drop {
            opacity: 0.75;
            top: 35%;
          }

          .jmi-wet-poster-image {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}