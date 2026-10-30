"use client";

import { useEffect, useState } from "react";

type SunState = {
  visible: boolean;
  progress: number;
  stage: "morning" | "noon" | "evening";
  color: string;
  glow: string;
  expression: "sleepy" | "happy" | "relaxed";
};

function getISTMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(
    parts.find((part) => part.type === "hour")?.value ?? 0
  );

  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0
  );

  return hour * 60 + minute;
}

function getSunState(): SunState {
  const now = getISTMinutes();

  const sunriseStart = 7 * 60 + 30;
  const sunriseEnd = 19 * 60;

  if (now < sunriseStart || now >= sunriseEnd) {
    return {
      visible: false,
      progress: 0,
      stage: "morning",
      color: "#FDE9A6",
      glow: "rgba(253, 233, 166, 0.12)",
      expression: "sleepy",
    };
  }

  const progress = (now - sunriseStart) / (sunriseEnd - sunriseStart);

  let color = "#FDE9A6";
  let glow = "rgba(253, 233, 166, 0.12)";
  let stage: SunState["stage"] = "morning";
  let expression: SunState["expression"] = "sleepy";

  if (now < 10 * 60) {
    color = "#FDE9A6";
    glow = "rgba(253, 233, 166, 0.12)";
    stage = "morning";
    expression = "sleepy";
  } else if (now < 13 * 60) {
    color = "#FFE58A";
    glow = "rgba(255, 229, 138, 0.16)";
    stage = "noon";
    expression = "happy";
  } else if (now < 16 * 60) {
    color = "#FFD36B";
    glow = "rgba(255, 190, 92, 0.17)";
    stage = "noon";
    expression = "happy";
  } else {
    color = "#F59E65";
    glow = "rgba(245, 158, 101, 0.14)";
    stage = "evening";
    expression = "relaxed";
  }

  return {
    visible: true,
    progress: Math.max(0, Math.min(1, progress)),
    stage,
    color,
    glow,
    expression,
  };
}

export default function JmiSun() {
  const [sun, setSun] = useState<SunState | null>(null);

  useEffect(() => {
    const updateSun = () => {
      setSun(getSunState());
    };

    updateSun();

    const interval = window.setInterval(updateSun, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  if (!sun?.visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      <div
        className="jmi-sun-traveller"
        style={{
          left: `${sun.progress * 100}%`,
          ["--sun-color" as string]: sun.color,
          ["--sun-glow" as string]: sun.glow,
        } as React.CSSProperties}
      >
        <div
          className={`jmi-sun-character jmi-sun-${sun.expression}`}
        >
          {/* Tiny sun rays */}

          <div className="jmi-sun-rays" />

          {/* Sun body */}

          <div className="jmi-sun-body">
            <div className="jmi-sun-face">
              {sun.expression === "sleepy" ? (
                <>
                  <span className="jmi-sun-eye jmi-sun-eye-sleepy" />
                  <span className="jmi-sun-eye jmi-sun-eye-sleepy" />
                </>
              ) : (
                <>
                  <span className="jmi-sun-eye" />
                  <span className="jmi-sun-eye" />
                </>
              )}

              <span className="jmi-sun-mouth" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .jmi-sun-traveller {
          position: absolute;
          top: 32px;
          transform: translateX(-50%);
          transition: left 2s linear;
        }

        .jmi-sun-character {
          position: relative;
          width: 25px;
          height: 25px;
          animation: jmi-sun-float 5s ease-in-out infinite;
        }

        .jmi-sun-body {
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: var(--sun-color);
          box-shadow: 0 0 8px var(--sun-glow);
          transition:
            background 2s ease,
            box-shadow 2s ease;
        }

        .jmi-sun-rays {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: repeating-conic-gradient(
            from 0deg,
            var(--sun-color) 0deg 10deg,
            transparent 10deg 30deg
          );
          opacity: 0.48;
          transition: background 2s ease;
        }

        .jmi-sun-face {
          position: absolute;
          top: 8px;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 3px;
          transform: translateX(-50%);
        }

       .jmi-sun-eye {
  display: block;
  width: 2px;
  height: 3px;
  border-radius: 50%;
  background: #70452c;
  transform-origin: center;
  animation: jmi-sun-blink 4.5s infinite;
}

.jmi-sun-eye:nth-child(2) {
  animation-delay: 0.08s;
}

@keyframes jmi-sun-blink {
  0%,
  42%,
  46%,
  72%,
  76%,
  100% {
    transform: scaleY(1);
  }

  44%,
  74% {
    transform: scaleY(0.12);
  }
}

        .jmi-sun-eye-sleepy {
          height: 1.5px;
          transform: translateY(1px);
        }

        .jmi-sun-mouth {
          position: absolute;
          top: 5px;
          left: 50%;
          width: 4px;
          height: 2px;
          transform: translateX(-50%);
          border-bottom: 1px solid #70452c;
          border-radius: 0 0 50% 50%;
        }

        .jmi-sun-happy .jmi-sun-mouth {
          top: 4px;
          width: 6px;
          height: 3px;
          border-bottom-width: 1.2px;
        }

        .jmi-sun-relaxed .jmi-sun-mouth {
          width: 3px;
          height: 1px;
        }

        @keyframes jmi-sun-float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-sun-character {
            animation: none;
          }

          .jmi-sun-traveller {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}