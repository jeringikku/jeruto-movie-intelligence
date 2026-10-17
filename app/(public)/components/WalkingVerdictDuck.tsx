"use client";

import { useEffect, useState } from "react";

type WalkingVerdictDuckProps = {
  verdict: string | null;
};

export default function WalkingVerdictDuck({
  verdict,
}: WalkingVerdictDuckProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotionPreference
      );
    };
  }, []);

  if (!verdict?.trim()) {
    return null;
  }

  return (
    <div
      className={`duck-scene ${reducedMotion ? "reduced-motion" : ""}`}
      role="img"
      aria-label={`A cartoon duck pulling a toy train displaying the theatrical verdict: ${verdict}`}
    >
      <div className="duck-procession">
        {/* TOY TRAIN */}
        <div className="toy-train">
          <div className="train-smoke" aria-hidden="true">
            <span />
            <span />
          </div>

          <div className="train-chimney" />

          <div className="train-carriage">
            <div className="train-roof" />

            <div className="verdict-sign">
              <span className="verdict-heading">
                THEATRICAL VERDICT
              </span>

              <span className="verdict-value">
                {verdict}
              </span>
            </div>

            <div className="train-window train-window-left" />
            <div className="train-window train-window-right" />

            <div className="train-lamp" />
          </div>

          <div className="train-undercarriage" />

          <div className="train-wheels">
            <div className="train-wheel">
              <span />
            </div>

            <div className="train-wheel">
              <span />
            </div>

            <div className="train-wheel">
              <span />
            </div>
          </div>

          <div className="train-coupling">
            <span />
          </div>
        </div>

        {/* DUCK */}
        <div className="duck">
          <div className="duck-tail" />

          <div className="duck-body">
            <div className="duck-wing" />
            <div className="duck-feather" />
          </div>

          <div className="duck-neck" />

          {/* The head turns toward the viewer at the centre. */}
          <div className="duck-head">
            <div className="duck-cheek" />

            <div className="duck-eye duck-eye-far">
              <span />
            </div>

            <div className="duck-eye duck-eye-near">
              <span />
            </div>

            <div className="duck-beak">
              <span />
            </div>
          </div>

          <div className="duck-legs">
            <div className="duck-leg duck-leg-one">
              <span />
            </div>

            <div className="duck-leg duck-leg-two">
              <span />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .duck-scene {
          position: relative;
          width: 100%;
          max-width: 100%;
          height: 112px;
          margin-top: 12px;
          margin-bottom: 8px;
          overflow: hidden;
          isolation: isolate;
          border-bottom: 1px solid rgba(234, 179, 8, 0.15);
          background: linear-gradient(
            180deg,
            transparent,
            rgba(234, 179, 8, 0.025)
          );
        }

        /* One procession: train first, duck pulling it in front. */
        .duck-procession {
          position: absolute;
          bottom: 8px;
          left: -205px;
          display: flex;
          align-items: flex-end;
          width: max-content;
          height: 88px;
          animation: procession-travel 14s linear infinite;
          will-change: left;
        }

        /* TOY TRAIN */

        .toy-train {
          position: relative;
          width: 104px;
          height: 64px;
          flex-shrink: 0;
          margin-right: 13px;
          animation: train-bounce 0.55s ease-in-out infinite alternate;
        }

        .train-carriage {
          position: absolute;
          right: 3px;
          bottom: 14px;
          width: 94px;
          height: 43px;
          overflow: visible;
          border: 1px solid #c49a36;
          border-radius: 7px 7px 4px 4px;
          background: linear-gradient(
            180deg,
            #f8d76a 0%,
            #d8a52c 55%,
            #a87519 100%
          );
          box-shadow:
            inset 0 3px 0 rgba(255, 244, 180, 0.4),
            0 3px 0 #704b12;
        }

        .train-roof {
          position: absolute;
          top: -5px;
          left: -4px;
          width: calc(100% + 8px);
          height: 7px;
          border: 1px solid #e8bd50;
          border-radius: 4px;
          background: linear-gradient(#ffe99b, #d9a52e);
        }

        .verdict-sign {
          position: absolute;
          top: 5px;
          left: 5px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          width: 82px;
          min-height: 31px;
          padding: 4px 3px;
          border: 1px solid #75602a;
          border-radius: 4px;
          background: linear-gradient(145deg, #181818, #050505);
          box-shadow:
            inset 0 0 0 1px rgba(255, 220, 100, 0.06),
            0 1px 3px rgba(0, 0, 0, 0.35);
        }

        .verdict-heading {
          color: #d4bd78;
          font-size: 5px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0.09em;
          white-space: nowrap;
        }

        .verdict-value {
          max-width: 100%;
          overflow-wrap: anywhere;
          color: #ffdb55;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.05;
          text-align: center;
          text-transform: uppercase;
        }

        .train-window {
          position: absolute;
          bottom: -9px;
          width: 9px;
          height: 5px;
          border: 1px solid #b17d22;
          border-radius: 2px;
          background: #f5d56c;
        }

        .train-window-left {
          left: 13px;
        }

        .train-window-right {
          right: 13px;
        }

        .train-lamp {
          position: absolute;
          top: 12px;
          right: -4px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #fff1a8;
          box-shadow: 0 0 5px rgba(255, 219, 85, 0.5);
        }

        .train-undercarriage {
          position: absolute;
          right: 8px;
          bottom: 10px;
          width: 83px;
          height: 5px;
          border-radius: 3px;
          background: #4a3020;
        }

        .train-wheels {
          position: absolute;
          right: 12px;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          width: 73px;
        }

        .train-wheel {
          position: relative;
          display: grid;
          width: 14px;
          height: 14px;
          place-items: center;
          border: 2px solid #c5a45a;
          border-radius: 50%;
          background: #24201a;
          box-shadow: 0 1px 0 #080808;
        }

        .train-wheel span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #e5c66e;
        }

        .train-chimney {
          position: absolute;
          top: 7px;
          left: 5px;
          width: 11px;
          height: 13px;
          border: 1px solid #b77c20;
          border-radius: 3px 3px 0 0;
          background: linear-gradient(90deg, #f59e0b, #ffdf75);
        }

        .train-smoke {
          position: absolute;
          top: -2px;
          left: 5px;
          width: 25px;
          height: 15px;
        }

        .train-smoke span {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(220, 220, 220, 0.4);
          animation: smoke-rise 1.4s ease-out infinite;
        }

        .train-smoke span:first-child {
          left: 4px;
        }

        .train-smoke span:last-child {
          left: 13px;
          animation-delay: 0.7s;
        }

        .train-coupling {
          position: absolute;
          right: -1px;
          bottom: 18px;
          z-index: 2;
          width: 14px;
          height: 5px;
          border-radius: 3px;
          background: #c5a45a;
        }

        .train-coupling span {
          position: absolute;
          right: -3px;
          top: -2px;
          width: 6px;
          height: 8px;
          border: 2px solid #c5a45a;
          border-left-color: transparent;
          border-radius: 50%;
        }

        /* DUCK BODY */

        .duck {
          position: relative;
          width: 65px;
          height: 78px;
          flex-shrink: 0;
          transform-origin: center bottom;
          animation: duck-bob 0.42s ease-in-out infinite alternate;
        }

        .duck-body {
          position: absolute;
          right: 2px;
          bottom: 12px;
          width: 46px;
          height: 36px;
          border: 1px solid #d6a62e;
          border-radius: 52% 48% 45% 45%;
          background: linear-gradient(
            145deg,
            #fff3bd 0%,
            #ffdf72 48%,
            #eab83e 100%
          );
          box-shadow:
            inset -4px -4px 0 rgba(160, 105, 20, 0.1),
            0 2px 2px rgba(0, 0, 0, 0.12);
        }

        .duck-wing {
          position: absolute;
          top: 8px;
          left: 9px;
          width: 25px;
          height: 18px;
          border: 1px solid rgba(190, 135, 30, 0.4);
          border-radius: 60% 40% 55% 45%;
          background: linear-gradient(145deg, #fff0a5, #efc64e);
          transform: rotate(-15deg);
          animation: wing-flutter 1.2s ease-in-out infinite alternate;
        }

        .duck-feather {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(190, 135, 30, 0.25);
        }

        .duck-tail {
          position: absolute;
          right: 41px;
          bottom: 30px;
          width: 15px;
          height: 15px;
          border-radius: 3px 90% 5px 90%;
          background: linear-gradient(135deg, #ffe995, #edbd43);
          transform: rotate(-20deg);
          animation: tail-wag 0.7s ease-in-out infinite alternate;
        }

        .duck-neck {
          position: absolute;
          top: 21px;
          right: 22px;
          width: 19px;
          height: 25px;
          border-radius: 45%;
          background: linear-gradient(90deg, #e7b83d, #fff0a5);
          transform: rotate(-5deg);
        }

        /* Head turns toward the viewer around the middle of the journey. */

        .duck-head {
          position: absolute;
          top: 3px;
          right: 13px;
          width: 34px;
          height: 29px;
          border: 1px solid #e5b942;
          border-radius: 52% 48% 45% 50%;
          background: linear-gradient(145deg, #fff5c7, #f5d365);
          transform-origin: 65% 75%;
          animation: duck-look-around 14s linear infinite;
        }

        .duck-cheek {
          position: absolute;
          right: 5px;
          bottom: 3px;
          width: 10px;
          height: 6px;
          border-radius: 50%;
          background: rgba(244, 174, 74, 0.25);
        }

        .duck-eye {
          position: absolute;
          top: 7px;
          width: 8px;
          height: 10px;
          overflow: hidden;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 0 0.5px rgba(80, 55, 10, 0.3);
        }

        .duck-eye-near {
          right: 7px;
        }

        .duck-eye-far {
          right: 19px;
          width: 5px;
          height: 7px;
          top: 8px;
        }

        .duck-eye span {
          position: absolute;
          top: 2px;
          right: 1px;
          width: 4px;
          height: 5px;
          border-radius: 50%;
          background: #272016;
        }

        .duck-beak {
          position: absolute;
          top: 16px;
          right: -10px;
          width: 15px;
          height: 9px;
          border: 1px solid #d97706;
          border-radius: 3px 80% 80% 3px;
          background: linear-gradient(180deg, #ffbd59, #f97316);
          clip-path: polygon(0 0, 100% 25%, 100% 70%, 0 100%);
        }

        .duck-beak span {
          position: absolute;
          top: 4px;
          left: 3px;
          width: 8px;
          height: 1px;
          background: rgba(151, 67, 12, 0.45);
        }

        /* WALKING LEGS */

        .duck-legs {
          position: absolute;
          bottom: 0;
          left: 26px;
          width: 26px;
          height: 18px;
        }

        .duck-leg {
          position: absolute;
          top: 0;
          width: 3px;
          height: 12px;
          border-radius: 3px;
          background: #d97706;
          transform-origin: top center;
        }

        .duck-leg-one {
          left: 4px;
          animation: leg-walk 0.42s ease-in-out infinite alternate;
        }

        .duck-leg-two {
          left: 17px;
          animation: leg-walk 0.42s ease-in-out infinite alternate-reverse;
        }

        .duck-leg span {
          position: absolute;
          bottom: -2px;
          left: -4px;
          width: 12px;
          height: 5px;
          border-radius: 80% 20% 30% 70%;
          background: #f59e0b;
        }

        /* PROCESSION MOVEMENT */

        @keyframes procession-travel {
          from {
            left: -205px;
          }

          to {
            left: calc(100% + 1px);
          }
        }

        @keyframes duck-bob {
          from {
            transform: translateY(0) rotate(-1deg);
          }

          to {
            transform: translateY(-2px) rotate(1deg);
          }
        }

        @keyframes train-bounce {
          from {
            transform: translateY(0);
          }

          to {
            transform: translateY(-1px);
          }
        }

        @keyframes leg-walk {
          from {
            transform: rotate(-24deg);
          }

          to {
            transform: rotate(24deg);
          }
        }

        @keyframes wing-flutter {
          from {
            transform: rotate(-15deg);
          }

          to {
            transform: rotate(-9deg);
          }
        }

        @keyframes tail-wag {
          from {
            transform: rotate(-24deg);
          }

          to {
            transform: rotate(-12deg);
          }
        }

        /* A quick glance toward us, then straight ahead again. */
        @keyframes duck-look-around {
          0%,
          43% {
            transform: rotate(0deg) scaleX(1);
          }

          46% {
            transform: rotate(-8deg) scaleX(0.94);
          }

          49%,
          53% {
            transform: rotate(7deg) scaleX(-0.92);
          }

          56% {
            transform: rotate(-4deg) scaleX(1);
          }

          60%,
          100% {
            transform: rotate(0deg) scaleX(1);
          }
        }

        @keyframes smoke-rise {
          0% {
            opacity: 0.55;
            transform: translateY(0) scale(0.7);
          }

          100% {
            opacity: 0;
            transform: translateY(-12px) scale(1.5);
          }
        }

        /* Accessibility: provide a calm, stationary version. */
        .reduced-motion .duck-procession {
          animation: none;
          left: 50%;
          transform: translateX(-50%);
        }

        .reduced-motion .duck,
        .reduced-motion .duck-head,
        .reduced-motion .duck-wing,
        .reduced-motion .duck-tail,
        .reduced-motion .duck-leg,
        .reduced-motion .toy-train,
        .reduced-motion .train-wheel,
        .reduced-motion .train-smoke span {
          animation: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .duck-procession {
            animation: none;
            left: 50%;
            transform: translateX(-50%);
          }

          .duck,
          .duck-head,
          .duck-wing,
          .duck-tail,
          .duck-leg,
          .toy-train,
          .train-wheel,
          .train-smoke span {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}