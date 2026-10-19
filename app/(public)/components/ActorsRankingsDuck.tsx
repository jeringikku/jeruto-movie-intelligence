"use client";

import { useEffect, useState } from "react";

type DuckMood = "active" | "hot" | "resting" | "sleeping";

function getISTMood(): DuckMood {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

  const [hour, minute] = time.split(":").map(Number);
  const minutes = hour * 60 + minute;

  if (minutes >= 6 * 60 && minutes < 11 * 60) {
    return "active";
  }

  if (minutes >= 11 * 60 && minutes < 15 * 60) {
    return "hot";
  }

  if (minutes >= 15 * 60 && minutes < 19 * 60) {
    return "resting";
  }

  return "sleeping";
}

export default function ActorsRankingsDuck() {
  const [mood, setMood] = useState<DuckMood>("active");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const updateMood = () => setMood(getISTMood());

    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => setReducedMotion(media.matches);

    updateMood();
    updateMotion();

    const clock = window.setInterval(updateMood, 15_000);

    media.addEventListener("change", updateMotion);

    return () => {
      window.clearInterval(clock);
      media.removeEventListener("change", updateMotion);
    };
  }, []);

  const isSleeping = mood === "sleeping";
  const isResting = mood === "resting";
  const isHot = mood === "hot";

  return (
    <div
      className={`actors-duck-scene mood-${mood} ${
        reducedMotion ? "reduced-motion" : ""
      }`}
      role="img"
      aria-label={`A cute JMI duck ${mood === "active" ? "happily holding" : mood === "hot" ? "sweating in the heat while holding" : mood === "resting" ? "resting beside" : "sleeping beside"} a white placard reading Check Who is Best`}
    >
      <div className="actors-duck">
        {/* SWEAT DROPLETS */}
        {isHot && (
          <div className="sweat-drops" aria-hidden="true">
            <span className="sweat sweat-one" />
            <span className="sweat sweat-two" />
            <span className="sweat sweat-three" />
          </div>
        )}

        {/* SLEEPING SYMBOLS */}
        {isSleeping && (
          <div className="sleep-symbols" aria-hidden="true">
            <span>Z</span>
            <span>Z</span>
            <span>Z</span>
          </div>
        )}

        {/* DUCK BODY */}
        <div className="duck-tail" />

        <div className="duck-body">
          <div className="duck-wing duck-wing-left" />
          <div className="duck-wing duck-wing-right" />
          <div className="duck-feather" />
        </div>

        <div className="duck-neck" />

        {/* HEAD */}
        <div className="duck-head">
          <div className="duck-cheek duck-cheek-left" />
          <div className="duck-cheek duck-cheek-right" />

          <div className="duck-eye duck-eye-left">
            <span />
            <i />
          </div>

          <div className="duck-eye duck-eye-right">
            <span />
            <i />
          </div>

          <div className="duck-beak">
            <span />
          </div>
        </div>

        {/* PLACARD: REMAINS VISIBLE IN EVERY MOOD */}
        <div className="placard-arm" />

        <div className="duck-placard">
          <span>Check out</span>
          <span>the List Now</span>
        </div>

        {/* FEET */}
        <div className="duck-legs">
          <div className="duck-leg duck-leg-one">
            <span />
          </div>

          <div className="duck-leg duck-leg-two">
            <span />
          </div>
        </div>
      </div>

      <style jsx>{`
        .actors-duck-scene {
          position: relative;
          width: 190px;
          height: 145px;
          flex-shrink: 0;
          overflow: visible;
          isolation: isolate;
        }

        .actors-duck {
          position: absolute;
          bottom: 2px;
          left: 50%;
          width: 110px;
          height: 132px;
          transform: translateX(-50%);
          transform-origin: center bottom;
          animation: happy-bob 2.8s ease-in-out infinite;
        }

        /* BODY */

        .duck-body {
          position: absolute;
          left: 26px;
          bottom: 20px;
          width: 66px;
          height: 51px;
          border: 1px solid #d6a62e;
          border-radius: 48% 48% 45% 45%;
          background: linear-gradient(
            145deg,
            #fff3bd 0%,
            #ffdf72 48%,
            #eab83e 100%
          );
          box-shadow:
            inset -4px -4px 0 rgba(160, 105, 20, 0.1),
            0 2px 2px rgba(0, 0, 0, 0.12);
          transition:
            background 1.5s ease,
            border-radius 1.5s ease,
            bottom 1.5s ease,
            height 1.5s ease;
        }

        .duck-wing {
          position: absolute;
          top: 17px;
          width: 19px;
          height: 27px;
          border: 1px solid rgba(190, 135, 30, 0.4);
          border-radius: 60% 40% 55% 45%;
          background: linear-gradient(
            145deg,
            #fff0a5,
            #efc64e
          );
          transform-origin: center top;
          animation: wing-wave 2.2s ease-in-out infinite alternate;
          transition:
            background 1.5s ease,
            transform 1.5s ease;
        }

        .duck-wing-left {
          left: -7px;
          transform: rotate(18deg);
        }

        .duck-wing-right {
          right: -7px;
          transform: rotate(-18deg);
          animation-delay: -1.1s;
        }

        .duck-feather {
          position: absolute;
          top: 10px;
          left: 30px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(190, 135, 30, 0.25);
        }

        .duck-tail {
          position: absolute;
          left: 20px;
          bottom: 44px;
          width: 15px;
          height: 17px;
          border-radius: 3px 90% 5px 90%;
          background: linear-gradient(
            135deg,
            #ffe995,
            #edbd43
          );
          transform: rotate(-25deg);
          animation: tail-wag 1.8s ease-in-out infinite alternate;
        }

        .duck-neck {
          position: absolute;
          top: 43px;
          left: 39px;
          width: 32px;
          height: 34px;
          border-radius: 45%;
          background: linear-gradient(
            90deg,
            #e9c65d,
            #ffe99b,
            #e9c65d
          );
          transition:
            background 1.5s ease,
            height 1.5s ease,
            top 1.5s ease;
        }

        /* HEAD */

        .duck-head {
          position: absolute;
          z-index: 2;
          top: 12px;
          left: 28px;
          width: 55px;
          height: 43px;
          border: 1px solid #e5b942;
          border-radius: 50% 50% 46% 46%;
          background: linear-gradient(
            145deg,
            #fff8d4 0%,
            #fff0ad 48%,
            #f5d365 100%
          );
          transform-origin: center bottom;
          animation: head-tilt 3.6s ease-in-out infinite;
          transition:
            background 1.5s ease,
            top 1.5s ease,
            transform 1.5s ease;
        }

        .duck-cheek {
          position: absolute;
          bottom: 7px;
          width: 11px;
          height: 7px;
          border-radius: 50%;
          background: rgba(244, 174, 74, 0.32);
        }

        .duck-cheek-left {
          left: 3px;
        }

        .duck-cheek-right {
          right: 3px;
        }

        .duck-eye {
          position: absolute;
          top: 10px;
          width: 12px;
          height: 15px;
          overflow: hidden;
          border-radius: 50%;
          background: #fff;
          box-shadow:
            0 0 0 0.7px rgba(80, 55, 10, 0.35),
            0 1px 2px rgba(0, 0, 0, 0.12);
          transition: height 0.8s ease;
        }

        .duck-eye-left {
          left: 10px;
        }

        .duck-eye-right {
          right: 10px;
        }

        .duck-eye span {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 7px;
          height: 9px;
          border-radius: 50%;
          background: #272016;
        }

        .duck-eye i {
          position: absolute;
          z-index: 1;
          top: 4px;
          left: 4px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #fff;
        }

        /* BEAK */

        .duck-beak {
          position: absolute;
          top: 25px;
          left: 50%;
          width: 25px;
          height: 14px;
          border: 1px solid #d97706;
          border-radius: 30% 30% 55% 55%;
          background: linear-gradient(
            180deg,
            #ffbd59,
            #f97316
          );
          transform: translateX(-50%);
          clip-path: polygon(
            0 0,
            100% 0,
            88% 75%,
            50% 100%,
            12% 75%
          );
        }

        .duck-beak span {
          position: absolute;
          top: 4px;
          left: 5px;
          width: 13px;
          height: 1px;
          border-radius: 50%;
          background: rgba(151, 67, 12, 0.45);
        }

        /* WHITE PLACARD */

        .duck-placard {
          position: absolute;
          z-index: 5;
          top: 30px;
          left: -30px;
          display: flex;
          width: 82px;
          min-height: 48px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: 2px solid #d5a33a;
          border-radius: 5px;
          background: #fff;
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.3),
            inset 0 0 0 2px rgba(120, 75, 12, 0.12);
          color: #38220a;
          font-size: 9px;
          font-weight: 900;
          line-height: 1;
          text-align: center;
          transform-origin: right bottom;
          animation: placard-sway 2.8s ease-in-out infinite;
          transition:
            top 1.5s ease,
            left 1.5s ease,
            transform 1.5s ease;
        }

        .placard-arm {
          position: absolute;
          z-index: 3;
          top: 63px;
          left: 40px;
          width: 31px;
          height: 7px;
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            #f6d56d,
            #e6b63e
          );
          transform: rotate(-12deg);
          transform-origin: right center;
          transition:
            opacity 1s ease,
            transform 1.5s ease;
        }

        /* FEET */

        .duck-legs {
          position: absolute;
          bottom: 2px;
          left: 39px;
          width: 34px;
          height: 20px;
          transition:
            bottom 1.5s ease,
            transform 1.5s ease;
        }

        .duck-leg {
          position: absolute;
          top: 0;
          width: 4px;
          height: 13px;
          border-radius: 3px;
          background: #d97706;
          transform-origin: top center;
          animation: gentle-step 1.1s ease-in-out infinite alternate;
        }

        .duck-leg-one {
          left: 3px;
        }

        .duck-leg-two {
          left: 23px;
          animation-delay: -0.55s;
        }

        .duck-leg span {
          position: absolute;
          bottom: -2px;
          left: -4px;
          width: 13px;
          height: 6px;
          border-radius: 80% 20% 30% 70%;
          background: #f59e0b;
        }

        /* AFTERNOON SWEAT */

        .sweat-drops {
          position: absolute;
          z-index: 4;
          top: 14px;
          right: 15px;
          width: 25px;
          height: 37px;
          pointer-events: none;
        }

        .sweat {
          position: absolute;
          width: 5px;
          height: 9px;
          border-radius: 80% 20% 60% 50%;
          background: linear-gradient(
            135deg,
            #e0f7ff,
            #38bdf8
          );
          box-shadow: 0 0 4px rgba(56, 189, 248, 0.4);
          animation: sweat-drop 1.8s ease-in infinite;
        }

        .sweat-one {
          top: 0;
          right: 2px;
        }

        .sweat-two {
          top: 10px;
          right: 12px;
          animation-delay: -0.6s;
        }

        .sweat-three {
          top: 19px;
          right: 0;
          animation-delay: -1.2s;
        }

        /* NIGHT-TIME SLEEP SYMBOLS */

        .sleep-symbols {
          position: absolute;
          z-index: 6;
          top: 0;
          right: 1px;
          display: flex;
          gap: 2px;
          color: #fcd34d;
          font-size: 12px;
          font-weight: 900;
          pointer-events: none;
        }

        .sleep-symbols span {
          animation: float-z 2.4s ease-in-out infinite;
        }

        .sleep-symbols span:nth-child(2) {
          animation-delay: -0.8s;
          font-size: 15px;
        }

        .sleep-symbols span:nth-child(3) {
          animation-delay: -1.6s;
          font-size: 18px;
        }

        /* HOT MOOD */

        .mood-hot .duck-body {
          background: linear-gradient(
            145deg,
            #fff0a6,
            #ffd166,
            #e9a83a
          );
        }

        .mood-hot .duck-head {
          background: linear-gradient(
            145deg,
            #fff2c0,
            #ffe18a,
            #f4c45c
          );
        }

        .mood-hot .duck-neck {
          background: linear-gradient(
            90deg,
            #e7bd54,
            #ffdf80,
            #e7bd54
          );
        }

        .mood-hot .actors-duck {
          animation-duration: 4.5s;
        }

        .mood-hot .duck-wing {
          animation-duration: 3.5s;
        }

        /* EVENING RESTING POSE */

        .mood-resting .actors-duck {
          animation: tired-bob 4s ease-in-out infinite;
        }

        .mood-resting .duck-body {
          bottom: 12px;
          height: 43px;
          border-radius: 48% 48% 35% 35%;
        }

        .mood-resting .duck-head {
          top: 27px;
          transform: rotate(9deg);
          animation: tired-head 4s ease-in-out infinite;
        }

        .mood-resting .duck-neck {
          top: 48px;
          height: 24px;
        }

        .mood-resting .duck-legs {
          bottom: 1px;
          transform: translateY(2px);
        }

        .mood-resting .duck-leg {
          height: 5px;
          animation: none;
        }

        .mood-resting .duck-leg-one {
          transform: rotate(-65deg);
        }

        .mood-resting .duck-leg-two {
          transform: rotate(65deg);
        }

        .mood-resting .duck-wing {
          top: 23px;
          animation: none;
        }

        .mood-resting .duck-wing-left {
          transform: rotate(35deg);
        }

        .mood-resting .duck-wing-right {
          transform: rotate(-35deg);
        }

        .mood-resting .placard-arm {
          opacity: 0;
        }

        .mood-resting .duck-placard {
          top: 80px;
          left: -31px;
          animation: placard-rest 3s ease-in-out infinite;
        }

        .mood-resting .duck-eye {
          top: 13px;
          height: 3px;
          border-radius: 50%;
        }

        .mood-resting .duck-eye span,
        .mood-resting .duck-eye i {
          display: none;
        }

        .mood-resting .duck-cheek {
          background: rgba(244, 174, 74, 0.4);
        }

        /* NIGHT-TIME SLEEPING POSE */

        .mood-sleeping .actors-duck {
          bottom: 0;
          animation: sleeping-breath 3.2s ease-in-out infinite;
        }

        .mood-sleeping .duck-body {
          bottom: 9px;
          left: 17px;
          width: 77px;
          height: 38px;
          border-radius: 50%;
        }

        .mood-sleeping .duck-neck {
          top: 58px;
          left: 33px;
          width: 25px;
          height: 18px;
          transform: rotate(35deg);
        }

        .mood-sleeping .duck-head {
          top: 53px;
          left: 18px;
          width: 44px;
          height: 33px;
          transform: rotate(-12deg);
          animation: sleeping-head 3.2s ease-in-out infinite;
        }

        .mood-sleeping .duck-eye {
          top: 13px;
          height: 2px;
          border: 0;
          background: #5b4320;
          box-shadow: none;
        }

        .mood-sleeping .duck-eye span,
        .mood-sleeping .duck-eye i {
          display: none;
        }

        .mood-sleeping .duck-cheek {
          bottom: 3px;
        }

        .mood-sleeping .duck-beak {
          top: 22px;
          left: 50%;
          width: 18px;
          height: 8px;
          transform: translateX(-50%) rotate(5deg);
        }

        .mood-sleeping .duck-legs {
          bottom: 0;
          left: 57px;
        }

        .mood-sleeping .duck-leg {
          height: 4px;
          animation: none;
        }

        .mood-sleeping .duck-leg-one {
          transform: rotate(80deg);
        }

        .mood-sleeping .duck-leg-two {
          transform: rotate(90deg);
        }

        .mood-sleeping .duck-wing {
          top: 14px;
          width: 23px;
          height: 19px;
          animation: none;
        }

        .mood-sleeping .duck-wing-left {
          left: 2px;
          transform: rotate(20deg);
        }

        .mood-sleeping .duck-wing-right {
          right: 2px;
          transform: rotate(-15deg);
        }

        .mood-sleeping .duck-tail {
          bottom: 24px;
        }

        .mood-sleeping .placard-arm {
          opacity: 0;
        }

        .mood-sleeping .duck-placard {
          top: 82px;
          left: -31px;
          animation: placard-rest 4s ease-in-out infinite;
        }

        /* ANIMATIONS */

        @keyframes happy-bob {
          0%, 100% {
            transform: translateX(-50%) translateY(0) rotate(-1deg);
          }
          50% {
            transform: translateX(-50%) translateY(-3px) rotate(1deg);
          }
        }

        @keyframes head-tilt {
          0%, 100% { transform: rotate(0deg); }
          35% { transform: rotate(-3deg); }
          65% { transform: rotate(2deg); }
        }

        @keyframes placard-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }

        @keyframes wing-wave {
          from { margin-top: 0; }
          to { margin-top: -2px; }
        }

        @keyframes tail-wag {
          from { transform: rotate(-25deg); }
          to { transform: rotate(-12deg); }
        }

        @keyframes gentle-step {
          from { transform: rotate(-3deg); }
          to { transform: rotate(3deg); }
        }

        @keyframes sweat-drop {
          0% {
            opacity: 0;
            transform: translateY(-3px) rotate(0);
          }
          20% { opacity: 1; }
          80% { opacity: 0.8; }
          100% {
            opacity: 0;
            transform: translateY(13px) rotate(20deg);
          }
        }

        @keyframes float-z {
          0%, 100% {
            opacity: 0.5;
            transform: translateY(4px);
          }
          50% {
            opacity: 1;
            transform: translateY(-5px);
          }
        }

        @keyframes tired-bob {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(1px);
          }
        }

        @keyframes tired-head {
          0%, 100% { transform: rotate(7deg); }
          50% { transform: rotate(12deg); }
        }

        @keyframes placard-rest {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }

        @keyframes sleeping-breath {
          0%, 100% {
            transform: translateX(-50%) translateY(0) scaleY(1);
          }
          50% {
            transform: translateX(-50%) translateY(1px) scaleY(0.97);
          }
        }

        @keyframes sleeping-head {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(-13deg); }
        }

        /* REDUCED MOTION */

        .reduced-motion .actors-duck,
        .reduced-motion .duck-head,
        .reduced-motion .duck-placard,
        .reduced-motion .duck-wing,
        .reduced-motion .duck-tail,
        .reduced-motion .duck-leg,
        .reduced-motion .sweat,
        .reduced-motion .sleep-symbols span {
          animation: none !important;
        }

        @media (max-width: 639px) {
          .actors-duck-scene {
            width: 155px;
            height: 132px;
          }

          .actors-duck {
            transform: translateX(-50%) scale(0.9);
          }

          @keyframes happy-bob {
            0%, 100% {
              transform: translateX(-50%) scale(0.9) translateY(0) rotate(-1deg);
            }
            50% {
              transform: translateX(-50%) scale(0.9) translateY(-3px) rotate(1deg);
            }
          }

          .mood-sleeping .actors-duck,
          .mood-resting .actors-duck {
            transform: translateX(-50%) scale(0.9);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .actors-duck,
          .duck-head,
          .duck-placard,
          .duck-wing,
          .duck-tail,
          .duck-leg,
          .sweat,
          .sleep-symbols span {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}