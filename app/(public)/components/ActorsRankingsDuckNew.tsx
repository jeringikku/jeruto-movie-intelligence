"use client";

import { useEffect, useState } from "react";

type DuckMood =
  | "active"
  | "active-with-cap"
  | "eating"
  | "hot"
  | "resting"
  | "sleeping"
  | "rainy";

function getISTMood(): DuckMood {

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

  const [hour, minute] = time.split(":").map(Number);
  const minutes = hour * 60 + minute;

  // RAINY-DAY MODE — original JMI rain schedule (IST).
// 11:50 AM–12:00 PM and 4:50 PM–5:00 PM.
if (
  (minutes >= 11 * 60 + 50 && minutes < 12 * 60) ||
  (minutes >= 16 * 60 + 50 && minutes < 17 * 60)
) {
  return "rainy";
}

  // 7:00 AM–9:00 AM: Morning activity
  if (minutes >= 7 * 60 && minutes < 9 * 60) {
    return "active";
  }

  // 9:00 AM–9:10 AM: Morning snack
  if (minutes >= 9 * 60 && minutes < 9 * 60 + 10) {
    return "eating";
  }

  // 9:10 AM–11:00 AM: Active with a cap
  if (minutes >= 9 * 60 + 10 && minutes < 11 * 60) {
    return "active-with-cap";
  }

  // 11:00 AM–1:30 PM: Hot and sweating
  if (minutes >= 11 * 60 && minutes < 13 * 60 + 30) {
    return "hot";
  }

  // 1:30 PM–1:40 PM: Afternoon snack
  if (minutes >= 13 * 60 + 30 && minutes < 13 * 60 + 40) {
    return "eating";
  }

  // 1:40 PM–4:00 PM: Resting
  if (minutes >= 13 * 60 + 40 && minutes < 16 * 60) {
    return "resting";
  }

  // 4:00 PM–7:00 PM: Evening activity
  if (minutes >= 16 * 60 && minutes < 19 * 60) {
    return "active";
  }

  // 7:00 PM–7:10 PM: Evening snack
  if (minutes >= 19 * 60 && minutes < 19 * 60 + 10) {
    return "eating";
  }

  // 7:10 PM–7:00 AM: Sleeping
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
  const isEating = mood === "eating";
  const isActiveWithCap = mood === "active-with-cap";

  return (
    <div
      className={`actors-duck-scene mood-${mood} ${
        reducedMotion ? "reduced-motion" : ""
      }`}
      role="img"
      aria-label={`A cute JMI duck ${
        mood === "active"
          ? "happily holding"
          : isActiveWithCap
            ? "happily holding while wearing a cute cap"
            : isEating
              ? "eating grains beside"
              : isHot
                ? "sweating in the heat while holding"
                : isResting
                  ? "resting beside"
                  : "sleeping beside"
      } a white placard reading Check out the List Now`}
    >
      <div className="actors-duck">

   {/* RAINY-DAY UMBRELLA */}
{mood === "rainy" && (
  <div className="duck-rainy-umbrella" aria-hidden="true">
    <div className="duck-umbrella-canopy" />
    <div className="duck-umbrella-handle" />
  </div>
)}

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

        {/* GRAINS ON THE GROUND */}
        {isEating && (
          <div className="duck-grains" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        )}

        
        {/* DUCK BODY — ORIGINAL STRUCTURE PRESERVED */}
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

        {/* CUTE CAP — ONLY 9:10 AM TO 11:00 AM */}
        {isActiveWithCap && (
          <div className="duck-cap" aria-hidden="true">
            <div className="duck-cap-crown" />
            <div className="duck-cap-brim" />
            <div className="duck-cap-button" />
          </div>
        )}

        {/* PLACARD — ORIGINAL TEXT AND STRUCTURE PRESERVED */}
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

        /* TEMPORARY RAINY-DAY UMBRELLA */

.duck-rainy-umbrella {
  position: absolute;
  z-index: 7;
  top: -8px;
  left: 37px;
  width: 68px;
  height: 53px;
  pointer-events: none;
  transform: rotate(-8deg);
  transform-origin: center bottom;
}

.duck-umbrella-canopy {
  position: absolute;
  top: -9;
  left: 4;
  width: 108px;
  height: 52px;
  border: 1px solid #2563eb;
  border-radius: 34px 34px 8px 8px;
  background: linear-gradient(
    150deg,
    #93c5fd 0%,
    #3b82f6 55%,
    #1d4ed8 100%
  );
  clip-path: polygon(
    0 0,
    100% 0,
    94% 70%,
    78% 83%,
    65% 70%,
    50% 100%,
    35% 70%,
    22% 83%,
    6% 70%
  );
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.duck-umbrella-handle {
  position: absolute;
  top: 35px;
  left: 53px;
  width: 2px;
  height: 60px;
  border-radius: 2px;
  background: #f8fafc;
}

.duck-umbrella-handle::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: -3px;
  width: 7px;
  height: 7px;
  border-right: 2px solid #f8fafc;
  border-bottom: 2px solid #f8fafc;
  border-radius: 0 0 7px 0;
}

.duck-umbrella-handle::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: -3px;
  width: 7px;
  height: 7px;
  border-right: 2px solid #f8fafc;
  border-bottom: 2px solid #f8fafc;
  border-radius: 0 0 7px 0;
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
            top 1.5s ease,
            left 1.5s ease,
            transform 1.5s ease;
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
            left 1.5s ease,
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
          transition:
            top 0.3s ease,
            height 0.3s ease,
            transform 0.3s ease;
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

        /* PLACARD — ORIGINAL DESIGN */

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

        /* AFTERNOON HEAT — EXISTING MOOD */

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

        /* SLEEPING SYMBOLS */

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

        /* NEW: GRAINS ON THE GROUND */

        .duck-grains {
          position: absolute;
          z-index: 1;
          left: 31px;
          bottom: 0;
          width: 47px;
          height: 9px;
          pointer-events: none;
        }

        .duck-grains span {
          position: absolute;
          bottom: 1px;
          width: 4px;
          height: 3px;
          border-radius: 70% 30% 70% 30%;
          background: #c99443;
          box-shadow: 0 1px 0 rgba(70, 40, 10, 0.25);
        }

        .duck-grains span:nth-child(1) {
          left: 1px;
          bottom: 1px;
        }

        .duck-grains span:nth-child(2) {
          left: 8px;
          bottom: 4px;
        }

        .duck-grains span:nth-child(3) {
          left: 15px;
          bottom: 0;
        }

        .duck-grains span:nth-child(4) {
          left: 22px;
          bottom: 3px;
        }

        .duck-grains span:nth-child(5) {
          left: 29px;
          bottom: 1px;
        }

        .duck-grains span:nth-child(6) {
          left: 36px;
          bottom: 4px;
        }

        .duck-grains span:nth-child(7) {
          left: 43px;
          bottom: 0;
        }

        /* NEW: CUTE MORNING CAP */

        .duck-cap {
          position: absolute;
          z-index: 4;
          top: 5px;
          left: 35px;
          width: 43px;
          height: 17px;
          transform: rotate(-8deg);
          pointer-events: none;
        }

        .duck-cap-crown {
          position: absolute;
          top: 0;
          left: 8px;
          width: 27px;
          height: 13px;
          border: 1px solid #9f1239;
          border-radius: 15px 15px 3px 3px;
          background: linear-gradient(
            145deg,
            #fb7185,
            #e11d48 70%,
            #9f1239
          );
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.25);
        }

        .duck-cap-brim {
          position: absolute;
          left: 3px;
          bottom: 1px;
          width: 39px;
          height: 5px;
          border: 1px solid #9f1239;
          border-radius: 50%;
          background: linear-gradient(
            180deg,
            #fb7185,
            #be123c
          );
        }

        .duck-cap-button {
          position: absolute;
          top: -1px;
          left: 20px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ffe4e6;
        }

        /* HOT MOOD — EXISTING COLORS PRESERVED */

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

        /* TEMPORARY RAINY MOOD */

.mood-rainy .actors-duck {
  animation-duration: 3.8s;
}

.mood-rainy .duck-rainy-umbrella {
  animation: rainy-umbrella-sway 3.5s ease-in-out infinite;
}

@keyframes rainy-umbrella-sway {
  0%,
  100% {
    transform: rotate(-8deg) translateY(0);
  }

  50% {
    transform: rotate(-5deg) translateY(-1px);
  }
}

        /* NEW: EATING GRAINS */

        .mood-eating .actors-duck {
          animation: eating-bob 1.1s ease-in-out infinite;
        }

        .mood-eating .duck-head {
          animation: eating-peck 0.65s ease-in-out infinite;
        }

        .mood-eating .duck-neck {
          top: 53px;
          left: 43px;
          height: 28px;
          transform: rotate(28deg);
        }

        .mood-eating .duck-beak {
          top: 27px;
          transform: translateX(-50%) rotate(8deg);
          transform-origin: center top;
        }

        .mood-eating .duck-wing {
          animation: none;
        }

        .mood-eating .duck-wing-left {
          transform: rotate(25deg);
        }

        .mood-eating .duck-wing-right {
          transform: rotate(-25deg);
        }

        .mood-eating .duck-tail {
          animation: tail-wag 1.2s ease-in-out infinite alternate;
        }

        .mood-eating .placard-arm {
          opacity: 0;
        }

        .mood-eating .duck-placard {
          top: 81px;
          left: -31px;
          animation: placard-rest 2.2s ease-in-out infinite;
        }

        .mood-eating .duck-legs {
          bottom: 1px;
        }

        .mood-eating .duck-grains span {
          animation: grain-twinkle 1s ease-in-out infinite alternate;
        }

        .mood-eating .duck-grains span:nth-child(2n) {
          animation-delay: -0.5s;
        }

        /* RESTING MOOD — EXISTING DESIGN PRESERVED */

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

        /* SLEEPING MOOD — EXISTING DESIGN PRESERVED */

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
          0%, 100% {
            transform: rotate(0deg);
          }

          35% {
            transform: rotate(-3deg);
          }

          65% {
            transform: rotate(2deg);
          }
        }

        @keyframes placard-sway {
          0%, 100% {
            transform: rotate(-2deg);
          }

          50% {
            transform: rotate(2deg);
          }
        }

        @keyframes wing-wave {
          from {
            margin-top: 0;
          }

          to {
            margin-top: -2px;
          }
        }

        @keyframes tail-wag {
          from {
            transform: rotate(-25deg);
          }

          to {
            transform: rotate(-12deg);
          }
        }

        @keyframes gentle-step {
          from {
            transform: rotate(-3deg);
          }

          to {
            transform: rotate(3deg);
          }
        }

        @keyframes sweat-drop {
          0% {
            opacity: 0;
            transform: translateY(-3px) rotate(0);
          }

          20% {
            opacity: 1;
          }

          80% {
            opacity: 0.8;
          }

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
          0%, 100% {
            transform: rotate(7deg);
          }

          50% {
            transform: rotate(12deg);
          }
        }

        @keyframes placard-rest {
          0%, 100% {
            transform: rotate(-1deg);
          }

          50% {
            transform: rotate(1deg);
          }
        }

        /* NEW: EATING ANIMATIONS */

        @keyframes eating-bob {
          0%, 100% {
            transform: translateX(-50%) translateY(0) rotate(0);
          }

          50% {
            transform: translateX(-50%) translateY(1px) rotate(-1deg);
          }
        }

        @keyframes eating-peck {
          0%, 100% {
            transform: rotate(5deg) translateY(0);
          }

          50% {
            transform: rotate(22deg) translateY(5px);
          }
        }

        @keyframes grain-twinkle {
          from {
            opacity: 0.65;
            transform: translateY(0) scale(1);
          }

          to {
            opacity: 1;
            transform: translateY(-1px) scale(1.15);
          }
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
          0%, 100% {
            transform: rotate(-10deg);
          }

          50% {
            transform: rotate(-13deg);
          }
        }

        /* REDUCED MOTION ACCESSIBILITY */

        .reduced-motion .actors-duck,
        .reduced-motion .duck-head,
        .reduced-motion .duck-placard,
        .reduced-motion .duck-wing,
        .reduced-motion .duck-tail,
        .reduced-motion .duck-leg,
        .reduced-motion .sweat,
        .reduced-motion .sleep-symbols span,
        .reduced-motion .duck-grains span {
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
              transform: translateX(-50%) scale(0.9) translateY(0)
                rotate(-1deg);
            }

            50% {
              transform: translateX(-50%) scale(0.9) translateY(-3px)
                rotate(1deg);
            }
          }

          .mood-sleeping .actors-duck,
          .mood-resting .actors-duck,
          .mood-eating .actors-duck {
            transform: translateX(-50%) scale(0.9);
          }

          @keyframes eating-bob {
            0%, 100% {
              transform: translateX(-50%) scale(0.9) translateY(0)
                rotate(0);
            }

            50% {
              transform: translateX(-50%) scale(0.9) translateY(1px)
                rotate(-1deg);
            }
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
          .sleep-symbols span,
          .duck-grains span {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}