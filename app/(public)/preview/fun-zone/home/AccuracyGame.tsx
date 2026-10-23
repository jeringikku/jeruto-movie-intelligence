"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const MAX_ARROWS = 5;

type Shot = {
  id: number;
  x: number;
  y: number;
  points: number;
  angle: number;
};

type DragPoint = {
  x: number;
  y: number;
};

const TARGET = { x: 72, y: 34 };

export default function AccuracyGame() {
  const [arrowsLeft, setArrowsLeft] = useState(MAX_ARROWS);
  const [shots, setShots] = useState<Shot[]>([]);
  const [aiming, setAiming] = useState(false);
  const [drag, setDrag] = useState<DragPoint>({ x: 0, y: 0 });
  const [flyingArrow, setFlyingArrow] = useState<Shot | null>(null);
  const [message, setMessage] = useState(
    "Pull back the arrow, aim at the target, and release!"
  );
  const [reducedMotion, setReducedMotion] = useState(false);

  const sceneRef = useRef<HTMLDivElement>(null);
  const shotId = useRef(0);
  const dragStart = useRef<DragPoint>({ x: 0, y: 0 });
  const currentDrag = useRef<DragPoint>({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);
  const shotTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAimingRef = useRef(false);
  const isFlyingRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => setReducedMotion(media.matches);

    updateMotion();
    media.addEventListener("change", updateMotion);

    return () => {
      media.removeEventListener("change", updateMotion);

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }

      if (shotTimeout.current !== null) {
        clearTimeout(shotTimeout.current);
      }
    };
  }, []);

  function startAim(event: React.PointerEvent<HTMLButtonElement>) {
    if (
      arrowsLeft <= 0 ||
      isAimingRef.current ||
      isFlyingRef.current
    ) {
      return;
    }

    event.preventDefault();

    event.currentTarget.setPointerCapture(event.pointerId);

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    currentDrag.current = { x: 0, y: 0 };

    isAimingRef.current = true;
    setAiming(true);
    setDrag({ x: 0, y: 0 });

    setMessage("Pull back, adjust your aim, and release!");
  }

  function moveAim(event: React.PointerEvent<HTMLButtonElement>) {
    if (!isAimingRef.current) return;

    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;

    // Pulling backward increases tension.
    // The maximum draw distance is capped for comfortable control.
    const distance = Math.min(100, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);

    const nextDrag = {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };

    currentDrag.current = nextDrag;
    setDrag(nextDrag);
  }

  function releaseAim() {
    if (!isAimingRef.current) return;

    isAimingRef.current = false;
    setAiming(false);

    if (arrowsLeft <= 0 || !sceneRef.current) return;

    const bounds = sceneRef.current.getBoundingClientRect();
    const pull = currentDrag.current;

    const pullStrength = Math.min(
      1,
      Math.hypot(pull.x, pull.y) / 100
    );

    // Convert the pull direction into a small aiming adjustment.
    // Aiming right or left changes horizontal impact; vertical
    // movement adjusts the arrow's vertical trajectory.
    const aimX = TARGET.x + pull.x * 0.12;
    const aimY = TARGET.y + pull.y * 0.12;

    // Keep the prototype's impact calculations bounded.
    const shotX = Math.max(4, Math.min(96, aimX));
    const shotY = Math.max(5, Math.min(85, aimY));

    const distance = Math.hypot(
      shotX - TARGET.x,
      shotY - TARGET.y
    );

    const hit = distance < 8;
    const bullseye = distance < 2.5;

    const points = bullseye ? 5 : hit ? 2 : 0;

    // The angle is estimated from the flight direction toward
    // the target. The animation starts at the launcher and ends
    // at the calculated impact point.
    const startX = bounds.width * 0.18;
    const startY = bounds.height * 0.68;
    const endX = bounds.width * shotX / 100;
    const endY = bounds.height * shotY / 100;

    const angle =
      Math.atan2(endY - startY, endX - startX) *
      (180 / Math.PI);

    const nextShot: Shot = {
      id: ++shotId.current,
      x: shotX,
      y: shotY,
      points,
      angle,
    };

    setArrowsLeft((previous) => Math.max(0, previous - 1));
    setDrag({ x: 0, y: 0 });
    currentDrag.current = { x: 0, y: 0 };

    isFlyingRef.current = true;
    setFlyingArrow(nextShot);

    // Flight duration responds to pull strength.
    const flightDuration = reducedMotion
      ? 0
      : 450 + pullStrength * 350;

    if (shotTimeout.current !== null) {
      clearTimeout(shotTimeout.current);
    }

    shotTimeout.current = setTimeout(() => {
      setShots((previous) => [...previous, nextShot]);
      setFlyingArrow(null);
      isFlyingRef.current = false;

      if (bullseye) {
        setMessage("🎯 Bullseye! +5 JMI Points!");
      } else if (hit) {
        setMessage("🎯 Target hit! +2 JMI Points!");
      } else {
        setMessage("The arrow missed! Adjust your aim and try again.");
      }

      if (arrowsLeft === 1) {
        window.setTimeout(() => {
          setMessage(
            "All 5 arrows used. Refresh the page to start a new session."
          );
        }, 1600);
      }
    }, flightDuration);
  }

  const totalPoints = shots.reduce(
    (total, shot) => total + shot.points,
    0
  );

  return (
    <section className="my-12 sm:my-16">
      <div className="mb-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-pink-400">
          Test Your Accuracy
        </p>

        <h2 className="mt-2 font-serif text-2xl font-bold text-[#f3e4c8] sm:text-3xl">
          The Bullseye Challenge
        </h2>

        <p className="mt-2 max-w-2xl text-xs leading-6 text-zinc-400 sm:text-sm">
          Pull back the launcher, aim at the target, and release.
          Hit the target to score points!
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-amber-800/50 bg-[#100b07] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/40 bg-black/25 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-amber-500">
              Remaining Arrows
            </p>

            <div
              className="mt-2 flex gap-2"
              aria-label={`${arrowsLeft} arrows remaining`}
            >
              {Array.from({ length: MAX_ARROWS }, (_, index) => (
                <span
                  key={index}
                  className={`text-lg ${
                    index < arrowsLeft
                      ? "text-amber-300"
                      : "text-zinc-700"
                  }`}
                >
                  ➶
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-amber-500">
              Session Score
            </p>

            <p className="mt-1 font-serif text-2xl font-bold text-amber-200">
              {totalPoints}
              <span className="ml-1 text-[10px] font-medium text-amber-500">
                JMI Points
              </span>
            </p>
          </div>
        </div>

        {/* Carnival shooting-gallery scene */}
        <div
          ref={sceneRef}
          className="accuracy-scene relative isolate h-[330px] overflow-hidden sm:h-[410px]"
        >
          {/* Colourful wooden wall */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 72% 28%, rgba(255,240,160,0.2), transparent 35%),
                repeating-linear-gradient(
                  90deg,
                  transparent 0px,
                  transparent 61px,
                  rgba(0,0,0,0.24) 63px,
                  rgba(255,255,255,0.06) 65px
                ),
                repeating-linear-gradient(
                  2deg,
                  #65321e 0px,
                  #874325 20px,
                  #592817 22px,
                  #71351d 43px
                )
              `,
            }}
          />

          {/* Colourful upper carnival trim */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-pink-500 via-amber-300 via-emerald-400 to-sky-400"
          />

          {/* Wall frame */}
          <div className="pointer-events-none absolute inset-2 rounded-lg border border-amber-300/25 sm:inset-4" />

          {/* Tiny twinkling wall lights */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 top-5 flex justify-between sm:inset-x-8"
          >
            {[
              "#ffdf75",
              "#ff7ca7",
              "#79e5ff",
              "#a6ff9b",
              "#ffc1ef",
              "#ffe68b",
              "#8be7ff",
              "#ff9b76",
            ].map((color, index) => (
              <span
                key={index}
                className="carnival-light"
                style={{
                  backgroundColor: color,
                  animationDelay: `${index * 180}ms`,
                }}
              />
            ))}
          </div>

          {/* Small balloon decorations — left */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[5%] top-[17%] flex items-end gap-1 sm:left-[7%] sm:top-[19%]"
          >
            <span className="carnival-balloon balloon-pink" />
            <span className="carnival-balloon balloon-blue balloon-small" />
            <span className="carnival-balloon balloon-yellow" />
          </div>

          {/* Small balloon decorations — right */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[5%] top-[18%] flex items-end gap-1 sm:right-[7%] sm:top-[19%]"
          >
            <span className="carnival-balloon balloon-green balloon-small" />
            <span className="carnival-balloon balloon-red" />
            <span className="carnival-balloon balloon-purple balloon-small" />
          </div>

         {/* Larger teddy bear decoration — left side */}
<div
  aria-hidden="true"
  className="pointer-events-none absolute left-[7%] top-[35%] text-3xl drop-shadow-lg sm:left-[9%] sm:top-[36%] sm:text-4xl"
>
  🧸
</div>

          

          {/* Tiny decorative stars */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-[25%] top-[25%] text-xs text-amber-200/80"
          >
            ✦
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[24%] top-[29%] text-xs text-pink-200/80"
          >
            ✧
          </span>

          {/* Main wall-mounted target */}
          <div
            className="accuracy-target absolute left-[72%] top-[34%]"
            aria-label="Bullseye target"
            role="img"
          >
            <div className="target-rim">
              <div className="target-ring target-ring-one">
                <div className="target-ring target-ring-two">
                  <div className="target-ring target-ring-three">
                    <div className="target-center" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Target mounting shadow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[72%] top-[34%] -z-10 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 blur-xl sm:h-44 sm:w-44"
          />

          {/* Launcher */}
          <div className="absolute bottom-8 left-[15%] h-28 w-16 sm:bottom-10 sm:h-36 sm:w-20">
            <div className="absolute bottom-0 left-1/2 h-20 w-3 -translate-x-1/2 rounded-sm border border-amber-700/50 bg-gradient-to-r from-[#29180d] via-[#8a5429] to-[#3a2112] sm:h-28" />

            <div className="absolute bottom-16 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full border border-amber-500/40 bg-gradient-to-b from-amber-700 to-amber-950 shadow-lg sm:bottom-24 sm:w-20" />

            {/* Rubber band */}
            <div
              className="absolute bottom-[86px] left-1/2 h-1 w-16 origin-left rounded-full bg-pink-300 shadow-[0_0_8px_rgba(249,168,212,0.45)] sm:bottom-[118px] sm:w-20"
              style={{
                transform: `rotate(${
                  Math.atan2(drag.y, drag.x || 1) *
                  (180 / Math.PI)
                }deg) scaleX(${1 + Math.hypot(drag.x, drag.y) / 100})`,
              }}
            />
          </div>

          {/* Animated arrow in flight */}
          {flyingArrow && (
            <div
              key={flyingArrow.id}
              aria-hidden="true"
              className={`arrow-flight absolute z-30 text-2xl text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.25)] ${
  reducedMotion ? "arrow-no-motion" : ""
}`}
              style={
                {
                  "--arrow-end-x": `${flyingArrow.x}%`,
                  "--arrow-end-y": `${flyingArrow.y}%`,
                  "--arrow-angle": `${flyingArrow.angle}deg`,
                  left: "18%",
                  top: "68%",
                } as React.CSSProperties
              }
            >
              ➶
            </div>
          )}

          {/* Arrows already embedded in the target */}
          {shots.map((shot) => (
            <div
              key={shot.id}
              className="absolute z-10 text-xl font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.25)]"
              style={{
                left: `${shot.x}%`,
                top: `${shot.y}%`,
                transform: `translate(-50%, -50%) rotate(${shot.angle}deg)`,
              }}
              aria-hidden="true"
            >
              ➶
            </div>
          ))}

          {/* Draggable arrow */}
          {!flyingArrow && arrowsLeft > 0 && (
            <button
              type="button"
              onPointerDown={startAim}
              onPointerMove={moveAim}
              onPointerUp={releaseAim}
              onPointerCancel={releaseAim}
              aria-label="Drag backwards to aim and release the arrow"
              className="absolute bottom-[112px] left-[17%] z-20 flex h-12 w-28 items-center justify-start touch-none rounded-full bg-transparent text-3xl text-amber-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:bottom-[150px]"
              style={{
                transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.y * 0.15}deg)`,
                transition: aiming || reducedMotion
                  ? "none"
                  : "transform 180ms ease-out",
              }}
            >
             <span
  className="font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.25)]"
  style={{
    WebkitTextStroke: "0.5px #171717",
  }}
>
  ➶
</span>
            </button>
          )}

          {/* Instructions */}
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-amber-400/20 bg-black/60 px-3 py-2 text-[8px] text-amber-100/80 backdrop-blur-sm sm:bottom-5 sm:left-5 sm:text-[9px]">
            DRAG BACK · AIM · RELEASE
          </div>

          <div className="pointer-events-none absolute right-3 top-9 rounded-md border border-amber-400/20 bg-black/50 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.15em] text-amber-100/90">
            🎯 Accuracy Arena
          </div>
        </div>

        {/* Feedback */}
        <div className="border-t border-amber-900/40 px-4 py-5 text-center sm:px-6">
          <p
            aria-live="polite"
            className="text-xs font-semibold text-amber-100 sm:text-sm"
          >
            {message}
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            Target hit: 2 points · Centre bullseye: 5 points
          </p>

          <Link
            href="/account/login"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400 px-5 py-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-black transition hover:bg-amber-300"
          >
            Sign In to Play for JMI Points
            <span aria-hidden="true">→</span>
          </Link>

          <p className="mt-3 text-[9px] leading-5 text-zinc-600">
            Sign in to participate. Official points will be credited
            after secure server-side scoring is connected.
          </p>
        </div>
      </div>

      <style jsx>{`
        .accuracy-target {
          width: 116px;
          height: 116px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          perspective: 600px;
          filter: drop-shadow(0 7px 5px rgba(0, 0, 0, 0.45));
          z-index: 5;
        }

        .target-rim {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          border: 5px solid #b78b4d;
          border-radius: 50%;
          background: linear-gradient(145deg, #f6dfb0, #a87939);
          box-shadow:
            inset 0 2px 5px rgba(255, 255, 255, 0.45),
            inset 0 -5px 8px rgba(0, 0, 0, 0.35),
            0 3px 0 #4d2b16;
        }

        .target-ring {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          border-radius: 50%;
        }

        .target-ring-one {
          width: 88%;
          height: 88%;
          border: 12px solid #f7f3e7;
          background: #c92f37;
        }

        .target-ring-two {
          width: 100%;
          height: 100%;
          border: 10px solid #c92f37;
          background: #f7f3e7;
        }

        .target-ring-three {
          width: 100%;
          height: 100%;
          border: 9px solid #f7f3e7;
          background: #c92f37;
        }

        .target-center {
          width: 44%;
          height: 44%;
          border: 4px solid #f7f3e7;
          border-radius: 50%;
          background: radial-gradient(
            circle at 35% 30%,
            #ff6262,
            #8d111d
          );
          box-shadow:
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            0 0 0 2px rgba(90, 0, 0, 0.3);
        }

        /* Small carnival bulbs */
        .carnival-light {
          width: 6px;
          height: 6px;
          flex: 0 0 auto;
          border-radius: 50%;
          box-shadow: 0 0 5px currentColor;
          animation: carnival-twinkle 1.8s ease-in-out infinite alternate;
        }

        /* Balloon decorations */
        .carnival-balloon {
          position: relative;
          display: inline-block;
          width: 25px;
          height: 25px;
          border-radius: 50% 50% 45% 45%;
          box-shadow:
            inset -3px -3px 4px rgba(0, 0, 0, 0.2),
            inset 3px 2px 4px rgba(255, 255, 255, 0.45),
            0 2px 3px rgba(0, 0, 0, 0.2);
        }

        .carnival-balloon::before {
          content: "";
          position: absolute;
          bottom: -3px;
          left: 50%;
          width: 24px;
          height: 4px;
          transform: translateX(-50%) rotate(45deg);
          background: inherit;
        }

        .carnival-balloon::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          width: 1px;
          height: 17px;
          background: rgba(245, 222, 179, 0.6);
        }

        .balloon-small {
          width: 12px;
          height: 16px;
        }

        .balloon-pink {
          background: linear-gradient(135deg, #ff9cc9, #e52c83);
        }

        .balloon-blue {
          background: linear-gradient(135deg, #9beaff, #268de5);
        }

        .balloon-yellow {
          background: linear-gradient(135deg, #fff0a1, #f1a821);
        }

        .balloon-green {
          background: linear-gradient(135deg, #b9ffb2, #37ad68);
        }

        .balloon-red {
          background: linear-gradient(135deg, #ff9b9b, #e02c40);
        }

        .balloon-purple {
          background: linear-gradient(135deg, #e0b6ff, #9352db);
        }

        /* Smooth flight using CSS only */
        .arrow-flight {
          animation: arrow-launch 650ms cubic-bezier(0.18, 0.68, 0.3, 1)
            forwards;
          transform-origin: center;
          will-change: left, top, transform;
        }

        .arrow-no-motion {
          animation: none;
          left: var(--arrow-end-x);
          top: var(--arrow-end-y);
          transform: translate(-50%, -50%) rotate(var(--arrow-angle));
        }

        @keyframes arrow-launch {
          0% {
            left: 18%;
            top: 68%;
            opacity: 1;
            transform: translate(-50%, -50%) rotate(-5deg) scale(1);
          }

          35% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(-22deg) scale(1.05);
          }

          100% {
            left: var(--arrow-end-x);
            top: var(--arrow-end-y);
            opacity: 1;
            transform: translate(-50%, -50%)
              rotate(var(--arrow-angle)) scale(0.9);
          }
        }

        @keyframes carnival-twinkle {
          from {
            opacity: 0.55;
            filter: brightness(0.9);
          }

          to {
            opacity: 1;
            filter: brightness(1.25);
          }
        }

        @media (min-width: 640px) {
          .accuracy-target {
            width: 150px;
            height: 150px;
          }

          .carnival-balloon {
            width: 18px;
            height: 24px;
          }

          .balloon-small {
            width: 14px;
            height: 19px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .carnival-light {
            animation: none;
          }

          .arrow-flight {
            animation-duration: 0ms;
          }
        }
      `}</style>
    </section>
  );
}