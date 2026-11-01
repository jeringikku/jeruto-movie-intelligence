"use client";

import { useEffect, useState } from "react";

export default function JmiBetaWelcome() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
  // Check whether this browser tab has already shown the welcome
  try {
    if (sessionStorage.getItem("jmi_beta_welcome_shown") === "true") {
      return;
    }
  } catch {
    // Continue normally if browser storage is unavailable
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  // Exclusively for November 1, 2026 (India time)
  if (
    values.year !== "2026" ||
    values.month !== "11" ||
    values.day !== "01"
  ) {
    return;
  }

  // Mark this browser tab before showing the animation
  try {
    sessionStorage.setItem("jmi_beta_welcome_shown", "true");
  } catch {
    // Animation still works if storage is unavailable
  }

  setVisible(true);

  const timer = window.setTimeout(() => {
    setVisible(false);
  }, 6500);

  return () => window.clearTimeout(timer);
}, []);

  if (!visible) return null;

  return (
    <>
      <div className="jmi-launch-overlay">

        {/* BACKGROUND GLOW */}
        <div className="jmi-launch-glow" />

        {/* MULTICOLOR FIREWORKS */}
        <div className="jmi-launch-burst burst-one" />
        <div className="jmi-launch-burst burst-two" />
        <div className="jmi-launch-burst burst-three" />
        <div className="jmi-launch-burst burst-four" />
        <div className="jmi-launch-burst burst-five" />
        <div className="jmi-launch-burst burst-six" />
        <div className="jmi-launch-burst burst-seven" />
        <div className="jmi-launch-burst burst-eight" />

        {/* WELCOME MESSAGE */}
        <div className="jmi-launch-message">

          <p className="jmi-launch-kicker">
            ✦ A NEW JOURNEY BEGINS ✦
          </p>

          <div className="jmi-launch-monogram text-[15px]">
            JMI
          </div>

          <div className="jmi-launch-divider">
            <span />
            <b>✦</b>
            <span />
          </div>

          <h1>
            Welcome to
            <strong>JMI Beta Version</strong>
          </h1>

          <p className="jmi-launch-subtitle">
            Jeruto Movie Intelligence
          </p>

          <p className="jmi-launch-thanks">
            THANK YOU FOR BEING PART OF OUR JOURNEY
          </p>

        </div>
      </div>

      <style jsx>{`

        /* =========================================
           FULL SCREEN WELCOME OVERLAY
        ========================================= */

        .jmi-launch-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          isolation: isolate;
          pointer-events: none;

          background:
            radial-gradient(
              ellipse at center,
              rgba(24, 13, 38, 0.96),
              rgba(0, 0, 0, 0.97) 75%
            );

          animation: overlay-exit 6.5s ease forwards;
        }

        /* =========================================
           BACKGROUND GLOW
        ========================================= */

        .jmi-launch-glow {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.13);
          filter: blur(65px);

          animation:
            glow-pulse 2s ease-in-out infinite alternate;
        }

        /* =========================================
           WELCOME MESSAGE
        ========================================= */

        .jmi-launch-message {
          position: relative;
          z-index: 5;
          width: 90%;
          max-width: 480px;
          padding: 24px 12px;
          text-align: center;

          animation: message-entry 5.8s ease forwards;
        }

        .jmi-launch-kicker {
          color: #c4a5fd;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.3em;
        }

        .jmi-launch-monogram {
          margin-top: 15px;
          color: #f5c76b;
          font-family: Georgia, serif;
          font-size: clamp(65px, 18vw, 100px);
          font-weight: bold;
          line-height: 1.1;
          letter-spacing: 0.06em;

          text-shadow:
            0 0 12px rgba(255, 190, 70, 0.7),
            0 0 35px rgba(255, 160, 50, 0.35);
        }

        .jmi-launch-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 16px auto 22px;
          color: #d7ad60;
          font-size: 10px;
        }

        .jmi-launch-divider span {
          width: 65px;
          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #d7ad60
            );
        }

        .jmi-launch-divider span:last-child {
          transform: rotate(180deg);
        }

        .jmi-launch-message h1 {
          color: #f4f4f5;
          font-family: Georgia, serif;
          font-size: clamp(25px, 6vw, 36px);
          font-weight: 400;
          line-height: 1.5;
        }

        .jmi-launch-message h1 strong {
          display: block;
          color: #f4c66b;
          font-weight: 600;
        }

        .jmi-launch-subtitle {
          margin-top: 14px;
          color: #c4b5fd;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .jmi-launch-thanks {
          margin-top: 32px;
          color: rgba(255, 255, 255, 0.55);
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        /* =========================================
           PREMIUM MULTICOLOR FIREWORKS
        ========================================= */

        .jmi-launch-burst {
          position: absolute;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          opacity: 0;
          transform: scale(0.1);

          background:
            radial-gradient(circle at 50% 0%, #fff 0 2px, transparent 3px),
            radial-gradient(circle at 85% 15%, #ffd166 0 2px, transparent 3px),
            radial-gradient(circle at 100% 50%, #ff6b6b 0 2px, transparent 3px),
            radial-gradient(circle at 85% 85%, #c084fc 0 2px, transparent 3px),
            radial-gradient(circle at 50% 100%, #fff 0 2px, transparent 3px),
            radial-gradient(circle at 15% 85%, #34d399 0 2px, transparent 3px),
            radial-gradient(circle at 0% 50%, #60a5fa 0 2px, transparent 3px),
            radial-gradient(circle at 15% 15%, #fb7185 0 2px, transparent 3px),
            radial-gradient(circle at 70% 0%, #facc15 0 2px, transparent 3px),
            radial-gradient(circle at 100% 70%, #38bdf8 0 2px, transparent 3px),
            radial-gradient(circle at 30% 100%, #e879f9 0 2px, transparent 3px),
            radial-gradient(circle at 0% 30%, #4ade80 0 2px, transparent 3px),
            radial-gradient(circle at 50% 50%, rgba(255, 205, 100, 0.25), transparent 60%);

          filter:
            drop-shadow(0 0 9px rgba(255, 190, 70, 0.8));

          animation:
            firework-explode 1.8s ease-out forwards;
        }

        /* GOLD */

        .burst-one {
          top: 5%;
          left: 5%;
          animation-delay: 0.1s;

          filter:
            hue-rotate(0deg)
            drop-shadow(0 0 9px #ffd166);
        }

        /* PURPLE */

        .burst-two {
          top: 7%;
          right: 5%;
          animation-delay: 0.45s;

          filter:
            hue-rotate(65deg)
            drop-shadow(0 0 9px #c084fc);
        }

        /* EMERALD */

        .burst-three {
          bottom: 5%;
          left: 18%;
          animation-delay: 0.85s;

          filter:
            hue-rotate(130deg)
            drop-shadow(0 0 9px #34d399);
        }

        /* BLUE */

        .burst-four {
          right: 16%;
          bottom: 6%;
          animation-delay: 1.2s;

          filter:
            hue-rotate(190deg)
            drop-shadow(0 0 9px #60a5fa);
        }

        /* PINK */

        .burst-five {
          top: 36%;
          left: calc(50% - 95px);
          animation-delay: 1.65s;

          filter:
            hue-rotate(280deg)
            drop-shadow(0 0 10px #fb7185);
        }

        /* GOLDEN YELLOW */

        .burst-six {
          top: 25%;
          left: 30%;
          width: 125px;
          height: 125px;
          animation-delay: 2.1s;

          filter:
            hue-rotate(35deg)
            drop-shadow(0 0 10px #facc15);
        }

        /* ELECTRIC BLUE */

        .burst-seven {
          top: 25%;
          right: 30%;
          width: 125px;
          height: 125px;
          animation-delay: 2.35s;

          filter:
            hue-rotate(220deg)
            drop-shadow(0 0 10px #38bdf8);
        }

        /* VIOLET PINK */

        .burst-eight {
          bottom: 18%;
          left: calc(50% - 65px);
          width: 130px;
          height: 130px;
          animation-delay: 2.6s;

          filter:
            hue-rotate(300deg)
            drop-shadow(0 0 10px #e879f9);
        }

        /* =========================================
           FIREWORK ANIMATION
        ========================================= */

        @keyframes firework-explode {
          0% {
            opacity: 0;
            transform: scale(0.08) rotate(0deg);
          }

          18% {
            opacity: 1;
          }

          65% {
            opacity: 0.95;
            transform: scale(1) rotate(35deg);
          }

          100% {
            opacity: 0;
            transform: scale(1.4) rotate(65deg);
          }
        }

        /* =========================================
           MESSAGE ANIMATION
        ========================================= */

        @keyframes message-entry {
          0%, 12% {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }

          30%, 76% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          100% {
            opacity: 0;
            transform: translateY(-8px) scale(1.02);
          }
        }

        /* =========================================
           OVERLAY EXIT
        ========================================= */

        @keyframes overlay-exit {
          0%, 78% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        /* =========================================
           BACKGROUND GLOW ANIMATION
        ========================================= */

        @keyframes glow-pulse {
          from {
            opacity: 0.5;
            transform: scale(0.85);
          }

          to {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        /* =========================================
           ACCESSIBILITY
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .jmi-launch-overlay,
          .jmi-launch-message,
          .jmi-launch-burst,
          .jmi-launch-glow {
            animation: none !important;
          }

          .jmi-launch-overlay {
            animation:
              overlay-exit 6.5s linear forwards !important;
          }

          .jmi-launch-message {
            opacity: 1;
          }

          .jmi-launch-burst {
            display: none;
          }
        }

      `}</style>
    </>
  );
}