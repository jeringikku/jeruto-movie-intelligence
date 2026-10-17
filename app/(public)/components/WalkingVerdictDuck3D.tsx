"use client";

import { useEffect, useState } from "react";

type WalkingVerdictDuck3DProps = {
  verdict: string | null;
  reducedMotion?: boolean;
};

type DuckMood =
  | "celebration"
  | "happy"
  | "normal"
  | "sad"
  | "disaster";

function getDuckMood(verdict: string): DuckMood {
  const normalized = verdict.trim().toUpperCase();

  if (normalized === "BLOCKBUSTER") return "celebration";
  if (normalized === "SUPER HIT") return "happy";
  if (normalized === "HIT") return "normal";
  if (normalized === "FLOP") return "sad";
  if (normalized === "DISASTER") return "disaster";

  return "normal";
}

export default function WalkingVerdictDuck3D({
  verdict,
  reducedMotion: externalReducedMotion,
}: WalkingVerdictDuck3DProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updatePreference
      );
    };
  }, []);

  if (!verdict?.trim()) return null;

  const mood = getDuckMood(verdict);

  const reducedMotion =
    externalReducedMotion ?? prefersReducedMotion;

  const normalizedVerdict = verdict.trim().toUpperCase();

  const isCelebration =
    mood === "celebration" || mood === "happy";

  const isDisaster = mood === "disaster";

  const coinCount =
    mood === "celebration"
      ? 9
      : mood === "happy"
        ? 6
        : mood === "normal"
          ? 2
          : 0;

  const cashNoteCount =
    mood === "celebration"
      ? 5
      : mood === "happy"
        ? 3
        : mood === "normal"
          ? 1
          : 0;

  return (
    <div
      className={[
        "duck-scene",
        `duck-mood-${mood}`,
        reducedMotion ? "reduced-motion" : "",
      ].join(" ")}
      role="img"
      aria-label={`Cartoon duck pulling a toy train displaying the theatrical verdict: ${verdict}`}
    >
      <div className="duck-procession">

        {/* CASH RAIN — BLOCKBUSTER ONLY */}
{mood === "celebration" && (
  <div className="cash-rain" aria-hidden="true">
    {Array.from({ length: 16 }, (_, index) => (
      <span
        key={index}
        className={`rain-note rain-note-${index % 8}`}
        style={{
          left: `${(index * 37) % 100}%`,
          animationDelay: `${(index % 8) * -0.37}s`,
          animationDuration: `${2.2 + (index % 4) * 0.35}s`,
        }}
      >
        ₹
      </span>
    ))}
  </div>
)}
        {/* TOY TRAIN */}
        <div className="toy-train">
          <div className="train-smoke" aria-hidden="true">
            <span />
            <span />
            {isDisaster && <span />}
          </div>

          <div className="train-chimney" />

          <div className="train-carriage">
            <div className="train-roof" />

            <div className="verdict-sign">
              <span className="verdict-heading">
                THEATRICAL VERDICT
              </span>

              <span className="verdict-value">
                {normalizedVerdict}
              </span>
            </div>

            {/* VERDICT-BASED MONEY */}
            <div className="train-money" aria-hidden="true">
              {Array.from(
                { length: coinCount },
                (_, index) => (
                  <span
                    key={`coin-${index}`}
                    className={`gold-coin coin-${index % 3}`}
                    style={{
                      left: `${4 + (index % 9) * 9}px`,
                      bottom: `${1 + (index % 3) * 4}px`,
                    }}
                  />
                )
              )}

              {Array.from(
                { length: cashNoteCount },
                (_, index) => (
                  <span
                    key={`note-${index}`}
                    className={`cash-note cash-note-${index % 3}`}
                  >
                    <span>₹</span>
                  </span>
                )
              )}

              {isCelebration && (
                <>
                  <span className="money-bag money-bag-one" />
                  <span className="money-bag money-bag-two" />
                </>
              )}
            </div>

            <div className="train-window train-window-left" />
            <div className="train-window train-window-right" />

            <div className="train-lamp" />
          </div>

          <div className="train-undercarriage" />

          {/* DISASTER TRAIN DAMAGE */}
          {isDisaster && (
            <div className="train-damage" aria-hidden="true">
              <span className="broken-panel" />
              <span className="bent-roof" />
              <span className="missing-piece" />
              <span className="train-crack" />
            </div>
          )}

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

          {/* CHARCOAL MARKS FOR DISASTER */}
          {isDisaster && (
            <div className="duck-soot" aria-hidden="true">
              <span className="soot soot-one" />
              <span className="soot soot-two" />
              <span className="soot soot-three" />
              <span className="soot soot-four" />
            </div>
          )}

          <div className="duck-neck" />

          {/* DUCK HEAD */}
          <div className="duck-head">
            <div className="duck-cheek" />

            {/* ONE VISIBLE EYE */}
            <div className="duck-eye duck-eye-near">
              <span />
            </div>

            <div className="duck-beak">
              <span />
            </div>
          </div>

          {/* CAP FOR BLOCKBUSTER AND SUPER HIT */}
          {isCelebration && (
            <div className="duck-cap">
              <div className="cap-crown" />
              <div className="cap-brim" />
              <div className="cap-button" />
            </div>
          )}

          {/* LEGS */}
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
          height: 90px;
          margin-top: 12px;
          margin-bottom: 8px;
          overflow: hidden;
          isolation: isolate;
          border-bottom: 1px solid rgba(234, 179, 8, 0.15);
          background: transparent;
        }

        /* PROCESSION */

       .duck-procession {
  position: absolute;
  bottom: 5px;
  left: -155px;
  display: flex;
  align-items: flex-end;
  width: max-content;
  height: 80px;
  transform: scale(0.70);
  transform-origin: left bottom;
  animation: procession-travel 14s linear infinite;
  will-change: left;
}

        /* TRAIN */

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
          z-index: 2;
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
          display: block;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          color: #ffdb55;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.1;
          text-align: center;
          text-overflow: clip;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .duck-mood-celebration .verdict-value {
          font-size: 8px;
          letter-spacing: -0.025em;
        }

        .duck-mood-happy .verdict-value {
          font-size: 9px;
        }

        /* MONEY */

        .train-money {
          position: absolute;
          z-index: 1;
          top: -18px;
          left: 5px;
          width: 82px;
          height: 23px;
          pointer-events: none;
        }

        .gold-coin {
          position: absolute;
          width: 9px;
          height: 9px;
          border: 1px solid #a87313;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 25%,
            #fff3a0,
            #f8c83c 55%,
            #b98218
          );
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }

        .money-bag {
          position: absolute;
          bottom: 2px;
          width: 13px;
          height: 16px;
          border: 1px solid #b58b2f;
          border-radius: 40% 40% 35% 35%;
          background: linear-gradient(135deg, #d9b56a, #8c672a);
        }

        .money-bag::before {
          position: absolute;
          top: -4px;
          left: 3px;
          width: 5px;
          height: 5px;
          border-radius: 2px;
          background: #c9a14c;
          content: "";
        }

        .money-bag-one {
          left: 10px;
        }

        .money-bag-two {
          right: 6px;
          transform: scale(0.85);
        }

        .cash-note {
          position: absolute;
          z-index: 2;
          top: -2px;
          left: 8px;
          display: grid;
          width: 21px;
          height: 11px;
          place-items: center;
          border: 1px solid #6d9857;
          border-radius: 2px;
          background: linear-gradient(
            135deg,
            #b9d99a,
            #76a96d 55%,
            #4f8454
          );
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
          transform: rotate(-8deg);
        }

        .cash-note span {
          color: #234d2c;
          font-size: 7px;
          font-weight: 900;
          line-height: 1;
        }

        .cash-note-0 {
          top: -1px;
          left: 8px;
          transform: rotate(-8deg);
        }

        .cash-note-1 {
          top: -5px;
          left: 28px;
          transform: rotate(7deg);
        }

        .cash-note-2 {
          top: 0;
          left: 48px;
          transform: rotate(-3deg);
        }

        /* TRAIN WINDOWS AND DETAILS */

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
          animation: wheel-roll 0.7s linear infinite;
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

        .train-smoke span:nth-child(2) {
          left: 13px;
          animation-delay: 0.7s;
        }

        .train-smoke span:nth-child(3) {
          left: 20px;
          animation-delay: 0.3s;
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
          background: linear-gradient(
  90deg,
  #a18d61,
  #d0bf91
);
          transform: rotate(-5deg);
        }

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

        /* BETTER-FITTED JACKET */

        .duck-jacket {
          position: absolute;
          z-index: 2;
          right: 4px;
          bottom: 16px;
          width: 39px;
          height: 27px;
          border: 1px solid #343a49;
          border-radius: 42% 42% 32% 32%;
          background: linear-gradient(
            135deg,
            #404655,
            #20232d 70%,
            #11131a
          );
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.1);
        }

        .jacket-zipper {
          position: absolute;
          top: 4px;
          left: 18px;
          width: 2px;
          height: 19px;
          background: #e6c66d;
        }

        .jacket-button {
          position: absolute;
          left: 14px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #e6c66d;
        }

        .jacket-button-one {
          top: 9px;
        }

        .jacket-button-two {
          top: 16px;
        }

        .jacket-collar {
          position: absolute;
          top: 0;
          width: 10px;
          height: 9px;
          background: #596174;
          clip-path: polygon(0 0, 100% 0, 65% 100%);
        }

        .jacket-collar-left {
          left: 7px;
        }

        .jacket-collar-right {
          right: 7px;
          transform: scaleX(-1);
        }

        /* BETTER-FITTED CAP */

        .duck-cap {
          position: absolute;
          z-index: 4;
          top: 1px;
          right: 10px;
          width: 28px;
          height: 13px;
          transform: rotate(-8deg);
          transform-origin: bottom center;
        }

        .cap-crown {
          position: absolute;
          top: 0;
          left: 3px;
          width: 21px;
          height: 11px;
          border: 1px solid #292e3c;
          border-radius: 75% 75% 18% 18%;
          background: linear-gradient(145deg, #464d5f, #191c26);
        }

        .cap-brim {
          position: absolute;
          bottom: 0;
          left: 8px;
          width: 23px;
          height: 4px;
          border: 1px solid #292e3c;
          border-radius: 2px 80% 40% 2px;
          background: #282d3b;
        }

        .cap-button {
          position: absolute;
          top: 2px;
          left: 12px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #e6c66d;
        }

        /* DISASTER: SOOT MARKS */

        .duck-soot {
          position: absolute;
          z-index: 5;
          right: 7px;
          bottom: 23px;
          width: 35px;
          height: 25px;
          pointer-events: none;
        }

        .soot {
          position: absolute;
          border-radius: 50%;
          background: rgba(39, 34, 33, 0.78);
          box-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
        }

        .soot-one {
          top: 3px;
          left: 3px;
          width: 8px;
          height: 6px;
        }

        .soot-two {
          top: 12px;
          left: 17px;
          width: 10px;
          height: 7px;
        }

        .soot-three {
          top: 1px;
          right: 0;
          width: 5px;
          height: 5px;
        }

        .soot-four {
          bottom: 0;
          left: 7px;
          width: 6px;
          height: 5px;
        }

        /* LEGS */

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
          animation: leg-walk 0.42s ease-in-out infinite alternate;
        }

        .duck-leg-one {
          left: 4px;
        }

        .duck-leg-two {
          left: 17px;
          animation-direction: alternate-reverse;
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

        .duck-mood-disaster .duck-head {
  background: linear-gradient(
    145deg,
    #d5c59a,
    #aa986c
  );
  border-color: #82724f;
}

.duck-mood-disaster .duck-wing {
  background: linear-gradient(
    145deg,
    #c7b487,
    #94815b
  );
  border-color: rgba(65, 54, 39, 0.6);
}

        /* DISASTER TRAIN DAMAGE */

        .train-damage {
          position: absolute;
          z-index: 4;
          inset: 0;
          pointer-events: none;
        }

        .broken-panel {
          position: absolute;
          right: 18px;
          bottom: 20px;
          width: 17px;
          height: 12px;
          border: 1px solid #6d4b26;
          background: #51402e;
          clip-path: polygon(0 0, 100% 15%, 70% 55%, 100% 100%, 0 80%);
          transform: rotate(-8deg);
        }

        .bent-roof {
          position: absolute;
          top: -2px;
          right: 7px;
          width: 35px;
          height: 5px;
          border-radius: 2px;
          background: #7e5724;
          transform: rotate(-9deg);
        }

        .missing-piece {
          position: absolute;
          top: 12px;
          right: 0;
          width: 7px;
          height: 10px;
          background: #080808;
          clip-path: polygon(0 0, 100% 15%, 60% 50%, 100% 100%, 0 80%);
        }

        .train-crack {
          position: absolute;
          top: 15px;
          left: 45px;
          width: 13px;
          height: 12px;
          border-left: 2px solid #34291f;
          border-bottom: 2px solid #34291f;
          transform: rotate(-30deg);
        }

        /* BLOCKBUSTER: RAINING CASH */

.cash-rain {
  position: absolute;
  z-index: 5;
  top: -8px;
  left: 0;
  width: 100%;
  height: 100px;
  overflow: hidden;
  pointer-events: none;
}

.rain-note {
  position: absolute;
  top: -18px;
  display: grid;
  width: 13px;
  height: 7px;
  place-items: center;
  border: 1px solid #8caf67;
  border-radius: 1px;
  background: linear-gradient(
    135deg,
    #d2e9a8,
    #83b77a 55%,
    #4d8657
  );
  color: #234d2c;
  font-size: 6px;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  animation-name: money-rain;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.rain-note-0 {
  transform: rotate(-12deg);
}

.rain-note-1 {
  width: 15px;
  height: 8px;
  transform: rotate(18deg);
}

.rain-note-2 {
  transform: rotate(-25deg);
}

.rain-note-3 {
  width: 12px;
  height: 7px;
  transform: rotate(30deg);
}

.rain-note-4 {
  transform: rotate(-8deg);
}

.rain-note-5 {
  width: 15px;
  height: 8px;
  transform: rotate(22deg);
}

.rain-note-6 {
  transform: rotate(-18deg);
}

.rain-note-7 {
  transform: rotate(12deg);
}

@keyframes money-rain {
  0% {
    top: -18px;
    margin-left: 0;
    opacity: 0;
    rotate: 0deg;
  }

  10% {
    opacity: 1;
  }

  50% {
    margin-left: 7px;
  }

  90% {
    opacity: 1;
  }

  100% {
    top: 105px;
    margin-left: -5px;
    opacity: 0;
    rotate: 180deg;
  }
}

        /* MOVEMENT */

        @keyframes procession-travel {
          from {
            left: -195px;
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

        @keyframes wheel-roll {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
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

        /* FLOP */

        .duck-mood-sad .duck-procession {
          animation-duration: 19s;
        }

        .duck-mood-sad .duck {
          animation: sad-walk 0.85s ease-in-out infinite alternate;
        }

        .duck-mood-sad .duck-head {
          transform: rotate(25deg);
          transform-origin: 65% 75%;
        }

        .duck-mood-sad .duck-wing {
          transform: rotate(18deg);
        }

        .duck-mood-sad .duck-leg {
          animation-duration: 0.85s;
        }

        .duck-mood-sad .toy-train {
          animation-duration: 0.85s;
        }

        @keyframes sad-walk {
          from {
            transform: translateY(0) rotate(1deg);
          }

          to {
            transform: translateY(-1px) rotate(-1deg);
          }
        }

        /* DISASTER */

        .duck-mood-disaster .duck-procession {
          animation-duration: 16s;
        }

        .duck-mood-disaster .duck {
          animation: disaster-walk 0.65s ease-in-out infinite alternate;
        }

        .duck-mood-disaster .toy-train {
          animation: damaged-train-bounce 0.38s ease-in-out infinite alternate;
        }

        .duck-mood-disaster .train-wheel {
          border-color: #8d7755;
          border-radius: 42% 55% 48% 45%;
        }

        .duck-mood-disaster .train-carriage {
          background: linear-gradient(
            180deg,
            #9a784b,
            #5a4430 65%,
            #382d24
          );
          border-color: #59412b;
        }

        .duck-mood-disaster .verdict-sign {
          border-color: #6b5740;
        }

        .duck-mood-disaster .verdict-value {
          color: #d6b981;
        }

        .duck-mood-disaster .train-smoke {
          top: -12px;
          left: 5px;
          width: 48px;
          height: 28px;
        }

        .duck-mood-disaster .train-smoke span {
          width: 13px;
          height: 13px;
          background: rgba(75, 75, 75, 0.8);
          animation-duration: 1.1s;
        }

        .duck-mood-disaster .train-smoke span:first-child {
          left: 4px;
        }

        .duck-mood-disaster .train-smoke span:nth-child(2) {
          top: -8px;
          left: 20px;
          animation-delay: 0.4s;
        }

        .duck-mood-disaster .train-smoke span:nth-child(3) {
          top: 1px;
          left: 32px;
          animation-delay: 0.7s;
        }

        @keyframes disaster-walk {
          from {
            transform: translateY(0) rotate(-2deg);
          }

          to {
            transform: translateY(-1px) rotate(2deg);
          }
        }

        @keyframes damaged-train-bounce {
          from {
            transform: translateY(0) rotate(0deg);
          }

          to {
            transform: translateY(-2px) rotate(-1deg);
          }
        }

        /* ACCESSIBILITY */

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

        .reduced-motion .cash-rain .rain-note {
  animation: none;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .cash-rain .rain-note {
    animation: none;
    opacity: 0;
  }
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