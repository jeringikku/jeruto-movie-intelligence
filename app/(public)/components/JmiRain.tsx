"use client";

import { useEffect, useState } from "react";
import { useJmiRainState } from "./useJmiRainState";

type RainState = {
  active: boolean;
  period: "midday" | "evening" | null;
};

function getISTMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const getPart = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return (
    getPart("hour") * 60 +
    getPart("minute") +
    getPart("second") / 60
  );
}

function getRainState(): RainState {
  const now = getISTMinutes();

  // Midday rain: 11:50 AM–12:00 PM IST.
  if (now >= 11 * 60 + 50 && now < 12 * 60) {
    return { active: true, period: "midday" };
  }

  // Evening rain: 4:50 PM–5:00 PM IST.
  if (now >= 16 * 60 + 50 && now < 17 * 60) {
    return { active: true, period: "evening" };
  }

  return { active: false, period: null };
}

const rainDrops = Array.from({ length: 100 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 11) % 100}%`,
  delay: `${((index * 17) % 70) / 10}s`,
  duration: `${1.6 + ((index * 13) % 80) / 100}s`,
  height: `${14 + ((index * 7) % 12)}px`,
  opacity: 0.2 + ((index * 11) % 25) / 100,
}));

export default function JmiRain() {
  // Shared state controls rain visibility across JMI.
  const isRaining = useJmiRainState();

  // This state determines which rain-period CSS class is applied.
  const [rain, setRain] = useState<RainState>({
    active: false,
    period: null,
  });

  useEffect(() => {
    const updateRain = () => {
      setRain(getRainState());
    };

    updateRain();

    const interval = window.setInterval(updateRain, 10_000);

    return () => window.clearInterval(interval);
  }, []);

  // Do not render any rain overlay outside the scheduled periods.
  if (!isRaining) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`jmi-rain-overlay jmi-rain-${rain.period}`}
    >
      <div className="jmi-rain-drops">
        {rainDrops.map((drop) => (
          <span
            key={drop.id}
            className="jmi-rain-drop"
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

      <div className="jmi-rain-lightning" />

      <style jsx>{`
        .jmi-rain-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: hidden;
          pointer-events: none;
        }

        .jmi-rain-drops {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .jmi-rain-drop {
          position: absolute;
          top: -24px;
          width: 1.5px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(210, 220, 255, 0.7)
          );
          border-radius: 50%;
          box-shadow: 0 0 2px rgba(180, 215, 255, 0.35);
          animation-name: jmi-rain-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        @keyframes jmi-rain-fall {
          from {
            transform: translate3d(0, -24px, 0);
          }

          to {
            transform: translate3d(-18px, 110vh, 0);
          }
        }

        @keyframes jmi-rain-flash {
          0%,
          96%,
          97.5%,
          100% {
            background: rgba(190, 205, 255, 0);
          }

          96.5% {
            background: rgba(190, 205, 255, 0.09);
          }

          97% {
            background: rgba(190, 205, 255, 0.035);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-rain-drop,
          .jmi-rain-lightning {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}