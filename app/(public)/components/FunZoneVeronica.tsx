"use client";

import { useEffect, useState } from "react";

export default function FunZoneVeronica() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => setReducedMotion(media.matches);

    updateMotion();
    media.addEventListener("change", updateMotion);

    return () => media.removeEventListener("change", updateMotion);
  }, []);

  return (
    <section
      className={`fz-veronica-section ${
        reducedMotion ? "fz-veronica-reduced" : ""
      }`}
      aria-label="Meet Veronica, the JMI Fun Zone volunteer"
    >
      <style jsx>{`
        .fz-veronica-section {
          position: relative;
          margin: 30px 0 8px;
          padding: 22px 16px;
          overflow: hidden;
          border: 1px solid rgba(173, 117, 48, 0.32);
          border-radius: 18px;
          background:
            radial-gradient(
              ellipse at 50% 100%,
              rgba(160, 73, 22, 0.17),
              transparent 65%
            ),
            linear-gradient(180deg, #160d08, #0d0907);
        }

        .fz-veronica-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          max-width: 760px;
          margin: 0 auto;
        }

        .fz-veronica-heading {
          color: #e7b85d;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-align: center;
          text-transform: uppercase;
        }

        .fz-veronica-stage {
          position: relative;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 180px;
        }

        .fz-veronica-duck {
          position: relative;
          width: 138px;
          height: 165px;
          flex: 0 0 138px;
          animation: veronica-bounce 2.6s ease-in-out infinite;
          transform-origin: center bottom;
        }

        /* Tall circus hat */

        .fz-hat {
          position: absolute;
          z-index: 8;
          top: -18px;
          left: 47px;
          width: 59px;
          height: 61px;
          transform: rotate(-9deg);
          animation: veronica-hat 2.6s ease-in-out infinite;
        }

        .fz-hat-cone {
          position: absolute;
          left: 5px;
          bottom: 8px;
          width: 42px;
          height: 53px;
          border: 1px solid #e9a7fa;
          background:
            repeating-linear-gradient(
              125deg,
              transparent 0 11px,
              rgba(255, 255, 255, 0.24) 12px 15px,
              transparent 16px 22px
            ),
            linear-gradient(110deg, #7c3aed, #ec4899 55%, #a21caf);
          clip-path: polygon(50% 0, 100% 100%, 0 100%);
          filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.4));
        }

        .fz-hat-band {
          position: absolute;
          bottom: 8px;
          left: 1px;
          z-index: 2;
          width: 50px;
          height: 9px;
          border: 1px solid #facc15;
          border-radius: 4px;
          background: linear-gradient(90deg, #facc15, #fb923c, #facc15);
        }

        .fz-hat-pom {
          position: absolute;
          top: -5px;
          left: 20px;
          width: 13px;
          height: 13px;
          border: 2px solid #fef3c7;
          border-radius: 50%;
          background: #facc15;
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.7);
        }

        /* Duck body */

        .fz-duck-body {
          position: absolute;
          left: 34px;
          bottom: 22px;
          width: 76px;
          height: 75px;
          border: 1px solid #d6a62e;
          border-radius: 48% 48% 42% 42%;
          background: linear-gradient(145deg, #fff6c9, #ffe27b 55%, #eab83e);
          box-shadow: inset -4px -4px 0 rgba(160, 105, 20, 0.1);
        }

        .fz-duck-neck {
          position: absolute;
          top: 50px;
          left: 55px;
          width: 36px;
          height: 38px;
          border-radius: 45%;
          background: linear-gradient(90deg, #e9c65d, #fff0a9, #e9c65d);
        }

        .fz-duck-tail {
          position: absolute;
          left: 25px;
          bottom: 50px;
          width: 25px;
          height: 20px;
          border-radius: 3px 90% 5px 90%;
          background: linear-gradient(135deg, #ffe995, #edbd43);
          transform: rotate(-25deg);
          animation: veronica-tail 1.4s ease-in-out infinite alternate;
        }

        /* Colourful circus vest */

        .fz-costume {
          position: absolute;
          z-index: 3;
          left: 37px;
          bottom: 20px;
          width: 72px;
          height: 54px;
          overflow: hidden;
          border: 2px solid #facc15;
          border-radius: 35% 35% 45% 45%;
          background:
            repeating-linear-gradient(
              115deg,
              transparent 0 10px,
              rgba(255, 255, 255, 0.35) 11px 13px,
              transparent 14px 21px
            ),
            linear-gradient(120deg, #7c3aed, #ec4899 55%, #2563eb);
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.18);
        }

        .fz-costume-star {
          position: absolute;
          top: 8px;
          left: 12px;
          color: #fff3a3;
          font-size: 12px;
        }

        .fz-costume-star-two {
          position: absolute;
          right: 10px;
          bottom: 10px;
          color: #fde68a;
          font-size: 11px;
        }

        .fz-bow {
          position: absolute;
          z-index: 6;
          top: 79px;
          left: 63px;
          width: 26px;
          height: 17px;
        }

        .fz-bow::before,
        .fz-bow::after {
          position: absolute;
          top: 2px;
          width: 13px;
          height: 13px;
          border: 1px solid #fda4af;
          border-radius: 4px 8px 4px 8px;
          background: linear-gradient(135deg, #fb7185, #e11d48);
          content: "";
        }

        .fz-bow::before {
          left: 0;
          transform: rotate(28deg);
        }

        .fz-bow::after {
          right: 0;
          transform: rotate(-28deg);
        }

        .fz-bow-center {
          position: absolute;
          z-index: 2;
          top: 5px;
          left: 10px;
          width: 7px;
          height: 8px;
          border-radius: 3px;
          background: #fef3c7;
        }

        /* Duck head and face */

        .fz-duck-head {
          position: absolute;
          z-index: 4;
          top: 25px;
          left: 39px;
          width: 65px;
          height: 53px;
          border: 1px solid #e5b942;
          border-radius: 50% 50% 46% 46%;
          background: linear-gradient(145deg, #fff8d4, #fff0ad 48%, #f5d365);
          animation: veronica-head 3.5s ease-in-out infinite;
        }

        .fz-eye {
          position: absolute;
          top: 15px;
          width: 13px;
          height: 17px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 0 0.7px rgba(80, 55, 10, 0.35);
        }

        .fz-eye-left {
          left: 12px;
        }

        .fz-eye-right {
          right: 12px;
        }

        .fz-eye::before {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 7px;
          height: 10px;
          border-radius: 50%;
          background: #272016;
          content: "";
        }

        .fz-eye::after {
          position: absolute;
          top: 5px;
          left: 5px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #fff;
          content: "";
        }

        .fz-cheek {
          position: absolute;
          bottom: 7px;
          width: 12px;
          height: 7px;
          border-radius: 50%;
          background: rgba(244, 114, 182, 0.45);
        }

        .fz-cheek-left {
          left: 3px;
        }

        .fz-cheek-right {
          right: 3px;
        }

        .fz-beak {
          position: absolute;
          top: 32px;
          left: 50%;
          width: 29px;
          height: 17px;
          border: 1px solid #d97706;
          border-radius: 30% 30% 55% 55%;
          background: linear-gradient(180deg, #ffbd59, #f97316);
          clip-path: polygon(0 0, 100% 0, 88% 75%, 50% 100%, 12% 75%);
          transform: translateX(-50%);
        }

        /* Wings */

        .fz-wing {
          position: absolute;
          z-index: 1;
          top: 88px;
          width: 20px;
          height: 38px;
          border: 1px solid #d6a62e;
          border-radius: 60% 40% 55% 45%;
          background: linear-gradient(145deg, #fff0a5, #efc64e);
          transform-origin: center top;
          animation: veronica-wave 0.75s ease-in-out infinite alternate;
        }

        .fz-wing-left {
          left: 25px;
          transform: rotate(24deg);
        }

        .fz-wing-right {
          right: 9px;
          animation-delay: -0.75s;
        }

        /* Feet */

        .fz-feet {
          position: absolute;
          bottom: 9px;
          left: 43px;
          display: flex;
          gap: 22px;
        }


/* Visible orange legs between body and feet */
.fz-leg {
  position: absolute;
  bottom: 10px;
  width: 7px;
  height: 25px;
  border: 1px solid #d97706;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #d97706 0%,
    #fbbf24 45%,
    #f59e0b 100%
  );
  transform-origin: top center;
}

        .fz-foot {
          position: relative;
          width: 15px;
          height: 7px;
          border-radius: 80% 20% 30% 70%;
          background: #f59e0b;
        }

        /* Sparkles */

        .fz-sparkle {
          position: absolute;
          color: #facc15;
          font-size: 16px;
          animation: veronica-sparkle 2s ease-in-out infinite;
        }

        .fz-sparkle-one {
          top: 44px;
          left: 6px;
        }

        .fz-sparkle-two {
          top: 72px;
          right: 0;
          color: #f472b6;
          animation-delay: -0.8s;
        }

        .fz-sparkle-three {
          bottom: 30px;
          left: 12px;
          color: #38bdf8;
          animation-delay: -1.3s;
        }

        /* Welcome message */

        .fz-veronica-message {
          position: relative;
          max-width: 340px;
          padding: 17px 18px;
          border: 1px solid rgba(236, 72, 153, 0.5);
          border-radius: 17px 17px 17px 5px;
          background: linear-gradient(145deg, rgba(28, 12, 24, 0.96), rgba(12, 9, 9, 0.98));
          box-shadow: 0 0 24px rgba(236, 72, 153, 0.06);
        }

        .fz-veronica-message::before {
          position: absolute;
          top: 27px;
          left: -8px;
          width: 14px;
          height: 14px;
          border-bottom: 1px solid rgba(236, 72, 153, 0.5);
          border-left: 1px solid rgba(236, 72, 153, 0.5);
          background: #1c0c18;
          content: "";
          transform: rotate(45deg);
        }

        .fz-message-title {
          color: #facc15;
          font-family: Georgia, serif;
          font-size: 17px;
          font-weight: 700;
        }

        .fz-message-subtitle {
          margin-top: 5px;
          color: #f9a8d4;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .fz-message-copy {
          margin-top: 8px;
          color: #d4d4d8;
          font-size: 12px;
          line-height: 1.7;
        }

        .fz-veronica-footnote {
          color: #9ca3af;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-align: center;
          text-transform: uppercase;
        }

        @keyframes veronica-bounce {
          0%, 100% {
            transform: translateY(0) rotate(-1deg);
          }
          50% {
            transform: translateY(-5px) rotate(1deg);
          }
        }

        @keyframes veronica-head {
          0%, 100% { transform: rotate(0); }
          35% { transform: rotate(-4deg); }
          65% { transform: rotate(3deg); }
        }

        @keyframes veronica-wave {
          from { margin-top: 0; }
          to { margin-top: -7px; }
        }

        @keyframes veronica-tail {
          from { transform: rotate(-25deg); }
          to { transform: rotate(-10deg); }
        }

        @keyframes veronica-hat {
          0%, 100% { transform: rotate(-9deg) translateY(0); }
          50% { transform: rotate(-5deg) translateY(-3px); }
        }

        @keyframes veronica-sparkle {
          0%, 100% {
            opacity: 0.35;
            transform: translateY(0) scale(0.8) rotate(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-5px) scale(1.15) rotate(20deg);
          }
        }

        .fz-veronica-reduced *,
        .fz-veronica-reduced *::before,
        .fz-veronica-reduced *::after {
          animation: none !important;
        }

        @media (min-width: 640px) {
          .fz-veronica-section {
            margin-top: 36px;
            padding: 26px 24px;
          }

          .fz-veronica-inner {
            flex-direction: row;
            justify-content: center;
            gap: 24px;
          }

          .fz-veronica-stage {
            width: auto;
            flex: 0 0 170px;
          }

          .fz-veronica-duck {
            transform: scale(1.05);
          }

          .fz-veronica-message {
            flex: 0 1 340px;
          }
        }

        @media (max-width: 380px) {
          .fz-veronica-stage {
            gap: 3px;
          }

          .fz-veronica-duck {
            transform: scale(0.9);
            margin-left: -8px;
            margin-right: -8px;
          }

          .fz-veronica-message {
            padding: 14px 12px;
          }

          .fz-message-title {
            font-size: 15px;
          }

          .fz-message-copy {
            font-size: 11px;
          }
        }
      `}</style>

      <div className="fz-veronica-inner">
        <p className="fz-veronica-heading">
          ✦ Meet Your Fun Zone Volunteer ✦
        </p>

        <div className="fz-veronica-stage" aria-hidden="true">
          <span className="fz-sparkle fz-sparkle-one">✦</span>
          <span className="fz-sparkle fz-sparkle-two">✧</span>
          <span className="fz-sparkle fz-sparkle-three">✦</span>

          <div className="fz-veronica-duck">
            <div className="fz-hat">
              <div className="fz-hat-cone" />
              <div className="fz-hat-band" />
              <div className="fz-hat-pom" />
            </div>

            <div className="fz-duck-tail" />
            <div className="fz-duck-body" />
            <div className="fz-duck-neck" />

            <div className="fz-costume">
              <span className="fz-costume-star">★</span>
              <span className="fz-costume-star-two">✦</span>
            </div>

            <div className="fz-wing fz-wing-left" />
            <div className="fz-wing fz-wing-right" />

            <div className="fz-duck-head">
              <div className="fz-cheek fz-cheek-left" />
              <div className="fz-cheek fz-cheek-right" />
              <div className="fz-eye fz-eye-left" />
              <div className="fz-eye fz-eye-right" />
              <div className="fz-beak" />
            </div>

            <div className="fz-bow">
              <span className="fz-bow-center" />
            </div>

            <div className="fz-feet">
              <span className="fz-foot" />
              <span className="fz-foot" />
            </div>
          </div>
        </div>

        <div className="fz-veronica-message">
          <p className="fz-message-title">
            Hi! I'm Veronica 👋
          </p>

          <p className="fz-message-subtitle">
            Your Fun Zone Volunteer
          </p>

          <p className="fz-message-copy">
            Welcome to JMI Fun Zone! 🎪
            <br />
            Let's explore the games, test your movie knowledge, and
            have some cinema-sized fun together!
          </p>
        </div>
      </div>

      <p className="fz-veronica-footnote">
        🎬 Your guide to the world of JMI entertainment
      </p>
    </section>
  );
}