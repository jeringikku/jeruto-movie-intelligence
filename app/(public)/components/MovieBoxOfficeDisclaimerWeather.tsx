"use client";

import { useEffect, useMemo, useState } from "react";

function getDisclaimerRainSchedule(): boolean {
const parts = new Intl.DateTimeFormat("en-GB", {
timeZone: "Asia/Kolkata",
hour: "2-digit",
minute: "2-digit",
hourCycle: "h23",
}).formatToParts(new Date());

const getPart = (type: string) =>
Number(parts.find((part) => part.type === type)?.value ?? 0);

const minutes = getPart("hour") * 60 + getPart("minute");

// TEMPORARY TEST: Keep rain active while verifying the animation.
// Restore the scheduled return expression after testing.
return true;

// Scheduled mode:
// return (
//   (minutes >= 11 * 60 + 50 && minutes < 12 * 60) ||
//   (minutes >= 16 * 60 + 50 && minutes < 17 * 60)
// );
}

export default function MovieBoxOfficeDisclaimerWeather({
children,
}: {
children: React.ReactNode;
}) {
const [isRaining, setIsRaining] = useState(false);

useEffect(() => {
const updateRainState = () => {
setIsRaining(getDisclaimerRainSchedule());
};

updateRainState();

const interval = window.setInterval(updateRainState, 1000);

return () => window.clearInterval(interval);

}, []);

const rainStreaks = useMemo(
() =>
Array.from({ length: 16 }, (_, index) => ({
id: index,
left: "${(index * 47 + 7) % 100}%",
delay: "${-((index * 19) % 35) / 10}s",
duration: "${0.8 + ((index * 13) % 50) / 100}s",
height: "${14 + ((index * 17) % 12)}px",
opacity: 0.35 + ((index * 11) % 30) / 100,
})),
[]
);

const runoffDrops = useMemo(
() =>
Array.from({ length: 7 }, (_, index) => ({
id: index,
left: "${8 + ((index * 23) % 84)}%",
delay: "${-((index * 17) % 45) / 10}s",
duration: "${1.3 + ((index * 13) % 18) / 10}s",
length: "${8 + ((index * 7) % 9)}px",
})),
[]
);

const runoffStreams = useMemo(
() =>
Array.from({ length: 4 }, (_, index) => ({
id: index,
left: "${19 + ((index * 19) % 76)}%",
delay: "${-((index * 11) % 30) / 10}s",
duration: "${0.8 + ((index * 7) % 16) / 10}s",
length: "${10 + ((index * 13) % 15)}px",
})),
[]
);

return (
<div className="jmi-disclaimer-weather relative">
{children}

  {isRaining && (
    <div
      key="jmi-disclaimer-rain"
      aria-hidden="true"
      className="jmi-disclaimer-rain pointer-events-none absolute inset-0 z-30 overflow-hidden"
    >
      {/* Falling rain */}
      <div className="absolute inset-0 overflow-hidden">
        {rainStreaks.map((drop) => (
          <span
            key={drop.id}
            className="jmi-disclaimer-rain-streak"
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

      {/* Water streams */}
      {runoffStreams.map((stream) => (
        <span
          key={`stream-${stream.id}`}
          className="jmi-disclaimer-runoff-stream"
          style={{
            left: stream.left,
            animationDelay: stream.delay,
            animationDuration: stream.duration,
            height: stream.length,
          }}
        />
      ))}

      {/* Individual rolling droplets */}
      {runoffDrops.map((drop) => (
        <span
          key={`drop-${drop.id}`}
          className="jmi-disclaimer-runoff-drop"
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
            height: drop.length,
          }}
        />
      ))}
    </div>
  )}

  <style jsx>{`
    .jmi-disclaimer-weather {
      position: relative;
      isolation: isolate;
      border-radius: inherit;
    }

    .jmi-disclaimer-rain {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
    }

    .jmi-disclaimer-rain-streak {
      position: absolute;
      top: -28px;
      width: 1px;
      border-radius: 50%;
      background: linear-gradient(
        to bottom,
        transparent,
        rgba(186, 220, 245, 0.15) 12%,
        rgba(210, 235, 255, 0.65) 75%,
        rgba(255, 255, 255, 0.15)
      );
      transform: rotate(8deg);
      animation: jmi-disclaimer-rain-fall linear infinite;
      will-change: transform;
    }

    .jmi-disclaimer-runoff-stream {
      position: absolute;
      bottom: -11%;
      width: 2px;
      border-radius: 0 0 50% 50%;
      background: linear-gradient(
        to bottom,
        rgba(186, 230, 253, 0.04),
        rgba(186, 230, 253, 0.28) 45%,
        rgba(224, 242, 254, 0.6)
      );
      box-shadow: 0 0 2px rgba(125, 211, 252, 0.18);
      transform-origin: top;
      animation: jmi-disclaimer-runoff-flow ease-in infinite;
    }

    .jmi-disclaimer-runoff-drop {
      position: absolute;
      top: -2px;
      width: 2px;
      border-radius: 50%;
      background: linear-gradient(
        to bottom,
        rgba(224, 242, 254, 0.12),
        rgba(186, 230, 253, 0.72)
      );
      box-shadow: 0 0 2px rgba(125, 211, 252, 0.2);
      animation: jmi-disclaimer-runoff-fall linear infinite;
    }

    @keyframes jmi-disclaimer-runoff-flow {
      0% {
        opacity: 0;
        transform: scaleY(0.15);
      }

      20% {
        opacity: 0.6;
        transform: scaleY(0.7);
      }

      75% {
        opacity: 0.75;
        transform: scaleY(1);
      }

      100% {
        opacity: 0;
        transform: scaleY(0.4);
      }
    }

    @keyframes jmi-disclaimer-runoff-fall {
      0% {
        opacity: 0;
        transform: translateY(0);
      }

      15% {
        opacity: 0.7;
      }

      100% {
        opacity: 0;
        transform: translateY(45px);
      }
    }

    @keyframes jmi-disclaimer-rain-fall {
      from {
        transform: translate3d(0, -18px, 0) rotate(8deg);
      }

      to {
        transform: translate3d(-7px, 100%, 0) rotate(8deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jmi-disclaimer-rain-streak,
      .jmi-disclaimer-runoff-stream,
      .jmi-disclaimer-runoff-drop {
        animation: none;
      }
    }
  `}</style>
</div>

);
}