"use client";

import { useEffect, useState } from "react";
import { useJmiRainState } from "./useJmiRainState";

const rainStreaks = Array.from({ length: 38 }, (_, index) => ({
  id: index,
  left: `${(index * 47 + 7) % 100}%`,
  delay: `${-((index * 19) % 35) / 10}s`,
  duration: `${0.65 + ((index * 13) % 65) / 100}s`,
  height: `${11 + ((index * 17) % 13)}px`,
  opacity: 0.68 + ((index * 11) % 32) / 100,
}));

const runoffDrops = Array.from({ length: 9 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 23) % 84)}%`,
  delay: `${-((index * 17) % 45) / 10}s`,
  duration: `${1.1 + ((index * 13) % 18) / 10}s`,
  length: `${5 + ((index * 7) % 9)}px`,
}));

const runoffStreams = Array.from({ length: 5 }, (_, index) => ({
  id: index,
  left: `${19 + ((index * 19) % 76)}%`,
  delay: `${-((index * 11) % 30) / 10}s`,
  duration: `${0.1 + ((index * 7) % 16) / 10}s`,
  length: `${12 + ((index * 13) % 20)}px`,
}));

export default function JmiMovieLibraryWeather({
  children,
}: {
  children: React.ReactNode;
}) {
  const scheduledRain = useJmiRainState();
  const [isRaining, setIsRaining] = useState(scheduledRain);

  useEffect(() => {
    setIsRaining(scheduledRain);
  }, [scheduledRain]);

  return (
    <div
      className={`jmi-library-weather ${
        isRaining ? "jmi-library-rainy" : ""
      }`}
    >
      {children}

      {isRaining && (
        <div
          key="jmi-library-rain"
          aria-hidden="true"
          className="jmi-library-rain-overlay"
        >
          <div className="jmi-library-rain-streaks">
            {rainStreaks.map((drop) => (
              <span
                key={drop.id}
                className="jmi-library-rain-streak"
                style={{
                  left: drop.left,
                  animationDelay: drop.delay,
                  animationDuration: drop.duration,
                  height: drop.height,
                  opacity: drop.opacity,
                }}
              />
            ))}
          </div>

          <div className="jmi-library-runoff" aria-hidden="true">
            {runoffStreams.map((stream) => (
              <span
                key={`stream-${stream.id}`}
                className="jmi-library-runoff-stream"
                style={{
                  left: stream.left,
                  animationDelay: stream.delay,
                  animationDuration: stream.duration,
                  height: stream.length,
                }}
              />
            ))}

            {runoffDrops.map((drop) => (
              <span
                key={`drop-${drop.id}`}
                className="jmi-library-runoff-drop"
                style={{
                  left: drop.left,
                  animationDelay: drop.delay,
                  animationDuration: drop.duration,
                  height: drop.length,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .jmi-library-weather {
          position: relative;
        }

        .jmi-library-rain-overlay {
          position: absolute;
          inset: 0;
          z-index: 30;
          overflow: hidden;
          pointer-events: none;
        }

        .jmi-library-rain-streaks {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .jmi-library-rain-streak {
          position: absolute;
          top: -20px;
          width: 1px;
          border-radius: 50%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(186, 220, 245, 0.12) 12%,
            rgba(210, 235, 255, 0.68) 75%,
            rgba(255, 255, 255, 0.15)
          );
          filter: blur(0.15px);
          transform: rotate(12deg);
          animation: jmi-library-rain-fall linear infinite;
          will-change: transform;
        }

        .jmi-library-runoff {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .jmi-library-runoff-stream {
          position: absolute;
          bottom: 13%;
          width: 1.5px;
          border-radius: 0 0 50% 50%;
          background: linear-gradient(
            to bottom,
            rgba(186, 230, 253, 0.05),
            rgba(186, 230, 253, 0.3) 45%,
            rgba(224, 242, 254, 0.65)
          );
          box-shadow: 0 0 2px rgba(125, 211, 252, 0.2);
          transform-origin: top;
          animation: jmi-library-runoff-flow ease-in infinite;
        }

        .jmi-library-runoff-drop {
          position: absolute;
          top: 0;
          width: 1.5px;
          border-radius: 50%;
          background: linear-gradient(
            to bottom,
            rgba(224, 242, 254, 0.15),
            rgba(186, 230, 253, 0.75)
          );
          box-shadow: 0 0 2px rgba(125, 211, 252, 0.25);
          animation: jmi-library-runoff-fall linear infinite;
        }

        @keyframes jmi-library-runoff-flow {
          0% {
            opacity: 0;
            transform: scaleY(0.15);
          }

          20% {
            opacity: 0.65;
            transform: scaleY(0.7);
          }

          75% {
            opacity: 0.8;
            transform: scaleY(1);
          }

          100% {
            opacity: 0;
            transform: scaleY(0.4);
          }
        }

        @keyframes jmi-library-runoff-fall {
          0% {
            opacity: 0;
            transform: translateY(0);
          }

          15% {
            opacity: 0.75;
          }

          100% {
            opacity: 0;
            transform: translateY(70px);
          }
        }

        @keyframes jmi-library-rain-fall {
          from {
            transform: translate3d(0, -20px, 0) rotate(12deg);
          }

          to {
            transform: translate3d(-14px, 110vh, 0) rotate(12deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-library-rain-streak,
          .jmi-library-runoff-stream,
          .jmi-library-runoff-drop {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}