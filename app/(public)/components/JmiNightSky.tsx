"use client";

import { useEffect, useState } from "react";

function isNightInIST(): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date())
  );

  return hour >= 19 || hour < 6;
}

export default function MoviePageAtmosphere() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setIsNight(isNightInIST());
    };

    updateTime();

    const interval = window.setInterval(updateTime, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  if (!isNight) {
    return null;
  }

  return (
  <div
    aria-hidden="true"
   
  className="jmi-night-sky pointer-events-none absolute inset-0 z-0 overflow-hidden"

  >
    {/* Deep-space Milky Pink galaxy */}
<div className="jmi-galaxy-glow" />

<div className="jmi-pink-galaxy" aria-hidden="true">
  <div className="jmi-galaxy-core" />
  <div className="jmi-galaxy-dust" />
  <div className="jmi-galaxy-nebula" />
</div>

    {/* Existing starfield */}
    {Array.from({ length: 65 }, (_, index) => {
      const left = (index * 47 + 13) % 100;
      const top = (index * 37 + 7) % 100;
      const size = index % 9 === 0 ? 2 : index % 4 === 0 ? 1.5 : 1;

      return (
        <span
          key={`star-${index}`}
          className="jmi-star"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${(index % 11) * 0.37}s`,
            animationDuration: `${2.5 + (index % 7) * 0.65}s`,
          }}
        />
      );
    })}

    {/* Burning red comets */}
    {Array.from({ length: 4 }, (_, index) => (
      <div
        key={`comet-${index}`}
        className={`jmi-comet jmi-comet-${index + 1}`}
        style={{
          top: `${12 + index * 19}%`,
          animationDelay: `${index * 7 - 12}s`,
        }}
      >
        <span className="jmi-comet-head" />
        <span className="jmi-comet-tail" />
      </div>
    ))}

    {/* Classic flying saucers */}
    {Array.from({ length: 1 }, (_, index) => (
      <div
        key={`ufo-${index}`}
        className={`jmi-ufo jmi-ufo-${index + 1}`}
        style={{
          top: `${28 + index * 34}%`,
          animationDelay: `${index * 11 - 8}s`,
        }}
      >
        <span className="jmi-ufo-dome" />
        <span className="jmi-ufo-body" />
        <span className="jmi-ufo-light light-one" />
        <span className="jmi-ufo-light light-two" />
        <span className="jmi-ufo-light light-three" />
      </div>
    ))}

    

    {/* Existing atmospheric lighting */}
    <div className="jmi-night-atmosphere" />

    <style jsx>{`
      .jmi-night-sky {
        z-index: 0;
        background: transparent;
      }

      .jmi-galaxy-glow {
        position: absolute;
        top: -130px;
        left: 50%;
        width: min(760px, 110vw);
        height: 360px;
        transform: translateX(-50%);
        border-radius: 50%;
        background: radial-gradient(
          ellipse,
          rgba(91, 33, 182, 0.12) 0%,
          rgba(49, 46, 129, 0.07) 35%,
          transparent 72%
        );
        filter: blur(30px);
      }

      

      /* Stars */
      .jmi-star {
        position: absolute;
        display: block;
        border-radius: 50%;
        background: #fff;
        opacity: 0.2;
        box-shadow: 0 0 4px rgba(196, 181, 253, 0.45);
        animation: jmi-twinkle 3s ease-in-out infinite;
      }

      .jmi-star:nth-child(3n) {
        background: #c4b5fd;
        box-shadow: 0 0 5px rgba(167, 139, 250, 0.55);
      }

      .jmi-star:nth-child(4n) {
        background: #bfdbfe;
        box-shadow: 0 0 4px rgba(147, 197, 253, 0.5);
      }

      @keyframes jmi-twinkle {
        0%, 100% {
          opacity: 0.15;
          transform: scale(0.8);
        }
        50% {
          opacity: 0.85;
          transform: scale(1.25);
        }
      }

      /* Red burning comets */
      .jmi-comet {
        position: absolute;
        left: -60px;
        width: 55px;
        height: 2px;
        opacity: 0;
        transform: rotate(-22deg);
        animation: jmi-comet-flight 33s linear infinite;
      }
/* Blue comets */
.jmi-comet-2 {
  animation-duration: 17s;
}

.jmi-comet-4 {
  animation-duration: 19s;
}

/* Red comets */
.jmi-comet-1,
.jmi-comet-3 {
  --comet-color: 248, 68, 68;
}

/* Blue comets */
.jmi-comet-2,
.jmi-comet-4 {
  --comet-color: 59, 130, 246;
}

      .jmi-comet-head {
        position: absolute;
        right: 0;
        top: -1px;
        width: 2px;
        height: 2px;
        border-radius: 50%;
        background: rgb(219, 234, 254);
box-shadow:
  0 0 4px 1px rgba(var(--comet-color, 248, 68, 68), 0.9),
  0 0 8px 2px rgba(var(--comet-color, 248, 68, 68), 0.65);
      }

      .jmi-comet-tail {
        position: absolute;
        right: 2px;
        top: 0;
        width: 26px;
        height: 2px;
        border-radius: 50%;
        background: linear-gradient(
  90deg,
  transparent,
  rgba(var(--comet-color, 248, 68, 68), 0.1),
  rgba(var(--comet-color, 248, 68, 68), 0.85)
);
box-shadow: 0 0 5px rgba(var(--comet-color, 248, 68, 68), 0.4);
      }

      @keyframes jmi-comet-flight {
        0% {
          left: -120px;
          opacity: 0;
          transform: translateY(70px) rotate(-22deg);
        }
        8% {
          opacity: 0.9;
        }
        70% {
          opacity: 0.8;
        }
        100% {
          left: calc(100% + 120px);
          opacity: 0;
          transform: translateY(-100px) rotate(-22deg);
        }
      }

     

     
      /* Sleek futuristic spacecraft */
      .jmi-spaceship {
        position: absolute;
        left: -65px;
        width: 48px;
        height: 20px;
        opacity: 0;
        animation: jmi-ship-flight 28s linear infinite;
      }

      .jmi-spaceship-two {
        animation-duration: 35s;
        animation-delay: -16s;
        transform: scale(0.75);
      }

      .jmi-ship-body {
        position: absolute;
        left: 7px;
        top: 6px;
        width: 34px;
        height: 8px;
        border: 1px solid rgba(103, 232, 249, 0.9);
        clip-path: polygon(0 50%, 22% 0, 78% 0, 100% 50%, 78% 100%, 22% 100%);
        background: linear-gradient(90deg, #164e63, #67e8f9, #164e63);
        box-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
      }

      .jmi-ship-wing {
        position: absolute;
        left: 0;
        top: 5px;
        width: 48px;
        height: 10px;
        clip-path: polygon(0 50%, 32% 0, 70% 0, 100% 50%, 70% 100%, 32% 100%);
        background: rgba(100, 116, 139, 0.85);
        border: 1px solid #94a3b8;
      }

      .jmi-ship-window {
        position: absolute;
        left: 23px;
        top: 8px;
        width: 5px;
        height: 4px;
        border-radius: 50%;
        background: #e0f2fe;
        box-shadow: 0 0 6px #67e8f9;
      }

      .jmi-ship-engine {
        position: absolute;
        left: 0;
        top: 8px;
        width: 12px;
        height: 4px;
        border-radius: 50%;
        background: #22d3ee;
        box-shadow: 0 0 9px 3px rgba(34, 211, 238, 0.6);
      }

      @keyframes jmi-ship-flight {
        0% {
          left: -65px;
          opacity: 0;
          transform: translateY(0) scale(0.8);
        }
        10% { opacity: 0.85; }
        45% { transform: translateY(25px) scale(1); }
        90% { opacity: 0.85; }
        100% {
          left: calc(100% + 65px);
          opacity: 0;
          transform: translateY(-12px) scale(0.9);
        }
      }

      .jmi-night-atmosphere {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(30, 27, 75, 0.035) 0%,
          transparent 40%,
          rgba(49, 46, 129, 0.025) 100%
        );
      }

      @media (prefers-reduced-motion: reduce) {
        .jmi-star,
        .jmi-comet,
        .jmi-ufo,
        .jmi-spaceship {
          animation: none;
        }

        .jmi-star {
          opacity: 0.55;
        }
      }
    `}</style>
  </div>
);}