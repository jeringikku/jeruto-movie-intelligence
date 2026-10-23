"use client";

import { useEffect, useRef, useState } from "react";

const HORSES = [
  { color: "#f8fafc", saddle: "#ec4899", mane: "#4338ca" },
  { color: "#fde68a", saddle: "#7c3aed", mane: "#92400e" },
  { color: "#bfdbfe", saddle: "#f97316", mane: "#1d4ed8" },
  { color: "#fbcfe8", saddle: "#0d9488", mane: "#9d174d" },
  { color: "#bbf7d0", saddle: "#dc2626", mane: "#166534" },
  { color: "#fed7aa", saddle: "#2563eb", mane: "#9a3412" },
];

export default function FunZoneCarouselRide() {
  const [rotation, setRotation] = useState(0);
const [isDragging, setIsDragging] = useState(false);
const [hasInteracted, setHasInteracted] = useState(false);
const [isSpinning, setIsSpinning] = useState(false);
const [spinSecondsLeft, setSpinSecondsLeft] = useState(0);

  const dragStartX = useRef(0);
  const previousX = useRef(0);
  const rotationStart = useRef(0);
  const rotationRef = useRef(0);
  const pointerId = useRef<number | null>(null);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
  if (isDragging || hasInteracted || isSpinning) return;

  let frame = 0;
  let lastTime = 0;

  const animate = (time: number) => {
    if (lastTime) {
      const delta = Math.min(time - lastTime, 40);
      setRotation((current) => current + delta * 0.004);
    }

    lastTime = time;
    frame = requestAnimationFrame(animate);
  };

  frame = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(frame);
}, [hasInteracted, isDragging, isSpinning]);

function startCarouselRide() {
  if (isSpinning) return;

  setHasInteracted(true);
  setIsSpinning(true);
  setSpinSecondsLeft(30);

  const startTime = performance.now();
  let previousTime = startTime;
  let frame = 0;

  const duration = 30_000;
  const speed = 0.45; // degrees per millisecond

  const animateSpin = (time: number) => {
    const elapsed = time - startTime;
    const delta = Math.min(time - previousTime, 50);

    previousTime = time;

    if (elapsed >= duration) {
      setIsSpinning(false);
      setSpinSecondsLeft(0);
      return;
    }

    setRotation((current) => current + delta * speed);
    setSpinSecondsLeft(
      Math.max(1, Math.ceil((duration - elapsed) / 1000))
    );

    frame = requestAnimationFrame(animateSpin);
  };

  frame = requestAnimationFrame(animateSpin);

  window.setTimeout(() => {
    cancelAnimationFrame(frame);
    setIsSpinning(false);
    setSpinSecondsLeft(0);
  }, duration + 100);
}

  function beginDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    pointerId.current = event.pointerId;
    dragStartX.current = event.clientX;
    previousX.current = event.clientX;
    rotationStart.current = rotationRef.current;

    setIsDragging(true);
    setHasInteracted(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || pointerId.current !== event.pointerId) return;

    const delta = event.clientX - previousX.current;
    previousX.current = event.clientX;

    setRotation((current) => current + delta * 0.75);
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== event.pointerId) return;

    pointerId.current = null;
    setIsDragging(false);
  }

  function turnRide(direction: number) {
    setHasInteracted(true);
    setRotation((current) => current + direction * 35);
  }

  return (
    <section
      className="fz-carousel-section"
      aria-label="Interactive JMI carousel ride"
    >
      <style jsx>{`
        .fz-carousel-section {
          position: relative;
          margin: 30px 0 10px;
          overflow: hidden;
          border: 1px solid rgba(180, 121, 48, 0.32);
          border-radius: 20px;
          background:
            radial-gradient(
              ellipse at 50% 60%,
              rgba(124, 58, 237, 0.13),
              transparent 52%
            ),
            radial-gradient(
              ellipse at 50% 100%,
              rgba(180, 83, 9, 0.13),
              transparent 65%
            ),
            linear-gradient(180deg, #100a08, #080605);
          color: #fef3c7;
        }

        .fz-carousel-inner {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          padding: 25px 12px 23px;
        }

        .fz-carousel-heading {
          position: relative;
          z-index: 3;
          text-align: center;
        }

        .fz-carousel-eyebrow {
          color: #fbbf24;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .fz-carousel-title {
          margin-top: 8px;
          color: #f7dfad;
          font-family: Georgia, serif;
          font-size: 23px;
          font-weight: 800;
          text-shadow: 0 3px 12px #000;
        }

        .fz-carousel-description {
          max-width: 460px;
          margin: 8px auto 0;
          color: #a8a29e;
          font-size: 11px;
          line-height: 1.7;
        }

        .fz-carousel-stage {
          position: relative;
          height: 300px;
          margin-top: 8px;
          overflow: hidden;
          perspective: 800px;
          perspective-origin: 50% 43%;
          touch-action: pan-y;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
        }

        .fz-carousel-stage.dragging {
          cursor: grabbing;
        }

        .fz-carousel-world {
          position: absolute;
          top: 12px;
          left: 50%;
          width: 270px;
          height: 245px;
          transform: translateX(-50%);
          transform-style: preserve-3d;
        }

        /* The whole ride's rotating central assembly */

        .fz-carousel-turntable {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transform: rotateY(var(--fz-rotation));
        }

        .fz-carousel-roof {
          position: absolute;
          z-index: 5;
          top: 0;
          left: 50%;
          width: 245px;
          height: 105px;
          transform: translateX(-50%) translateZ(0);
          transform-style: preserve-3d;
        }

        .fz-roof-cone {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: repeating-conic-gradient(
            from -15deg at 50% 100%,
            #fff7ed 0deg 30deg,
            #e11d48 30deg 60deg
          );
          clip-path: polygon(50% 0, 100% 100%, 0 100%);
          filter: drop-shadow(0 4px 5px rgba(0, 0, 0, 0.35));
        }

        .fz-roof-cap {
          position: absolute;
          top: -5px;
          left: 50%;
          width: 17px;
          height: 17px;
          border: 2px solid #fde68a;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 13px rgba(250, 204, 21, 0.6);
          transform: translateX(-50%);
        }

        .fz-roof-rim {
          position: absolute;
          right: -5px;
          bottom: 0;
          left: -5px;
          height: 10px;
          border: 2px solid #fbbf24;
          border-radius: 50%;
          background: repeating-linear-gradient(
            90deg,
            #e11d48 0 18px,
            #fff7ed 18px 36px
          );
          box-shadow: 0 4px 7px rgba(0, 0, 0, 0.4);
        }

        /* Roof support poles */

        .fz-carousel-pole {
          position: absolute;
          z-index: 2;
          top: 78px;
          bottom: 0;
          left: 50%;
          width: 5px;
          border: 1px solid rgba(253, 224, 71, 0.65);
          border-radius: 5px;
          background: linear-gradient(
            90deg,
            #92400e,
            #fbbf24,
            #92400e
          );
          transform-origin: top center;
        }

        .fz-pole-one {
          transform: translateX(-50%) rotate(-27deg);
        }

        .fz-pole-two {
          transform: translateX(-50%);
        }

        .fz-pole-three {
          transform: translateX(-50%) rotate(27deg);
        }

        /* Central pole */

        .fz-carousel-center-pole {
          position: absolute;
          z-index: 3;
          top: 68px;
          bottom: 8px;
          left: 50%;
          width: 12px;
          border: 1px solid #fbbf24;
          border-radius: 5px;
          background: linear-gradient(
            90deg,
            #7c2d12,
            #fcd34d,
            #92400e
          );
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.15);
          transform: translateX(-50%);
        }

        /* Horse positions */

        .fz-carousel-horse {
          position: absolute;
          z-index: 4;
          top: 95px;
          left: 50%;
          width: 70px;
          height: 90px;
          transform-style: preserve-3d;
          transform:
            rotateY(var(--horse-angle))
            translateZ(105px)
            rotateY(calc(0deg - var(--horse-angle)));
        }

        .fz-horse-body {
          position: absolute;
          top: 25px;
          left: 10px;
          width: 50px;
          height: 32px;
          border: 1px solid rgba(120, 53, 15, 0.5);
          border-radius: 45% 48% 40% 45%;
          background: linear-gradient(
            145deg,
            var(--horse-color),
            #ffffff 55%,
            var(--horse-color)
          );
          box-shadow: 0 3px 4px rgba(0, 0, 0, 0.3);
        }

        .fz-horse-neck {
          position: absolute;
          top: 5px;
          left: 40px;
          width: 16px;
          height: 35px;
          border-radius: 65% 45% 20% 30%;
          background: linear-gradient(
            90deg,
            var(--horse-color),
            #fff 50%,
            var(--horse-color)
          );
          transform: rotate(-13deg);
        }

        .fz-horse-head {
          position: absolute;
          top: 0;
          left: 42px;
          width: 22px;
          height: 18px;
          border-radius: 55% 50% 30% 35%;
          background: var(--horse-color);
          transform: rotate(-13deg);
        }

        .fz-horse-ear {
          position: absolute;
          top: -6px;
          left: 4px;
          width: 5px;
          height: 10px;
          border-radius: 70% 70% 20% 20%;
          background: var(--horse-color);
          transform: rotate(-10deg);
        }

        .fz-horse-mane {
          position: absolute;
          top: 1px;
          left: 35px;
          width: 12px;
          height: 28px;
          border-radius: 50%;
          background: var(--horse-mane);
          transform: rotate(-15deg);
        }

        .fz-horse-eye {
          position: absolute;
          top: 5px;
          right: 4px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #292524;
        }

        .fz-horse-muzzle {
          position: absolute;
          top: 10px;
          right: -2px;
          width: 8px;
          height: 6px;
          border-radius: 50%;
          background: #fda4af;
        }

        .fz-horse-saddle {
          position: absolute;
          top: 24px;
          left: 18px;
          width: 30px;
          height: 9px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 6px 6px 3px 3px;
          background: var(--horse-saddle);
        }

        .fz-horse-leg {
          position: absolute;
          top: 51px;
          width: 5px;
          height: 22px;
          border-radius: 4px;
          background: linear-gradient(90deg, #d6a46d, var(--horse-color));
          transform-origin: top center;
        }

        .fz-horse-leg-one {
          left: 18px;
          transform: rotate(5deg);
        }

        .fz-horse-leg-two {
          left: 29px;
          transform: rotate(-4deg);
        }

        .fz-horse-leg-three {
          left: 41px;
          transform: rotate(4deg);
        }

        .fz-horse-leg-four {
          left: 49px;
          transform: rotate(-5deg);
        }

        .fz-horse-pole {
          position: absolute;
          top: 62px;
          left: 34px;
          width: 4px;
          height: 68px;
          border-radius: 4px;
          background: linear-gradient(
            90deg,
            #a16207,
            #fcd34d,
            #92400e
          );
          transform: translateZ(-2px);
        }

        /* Rotating platform */

        .fz-carousel-platform {
          position: absolute;
          z-index: 1;
          top: 205px;
          left: 50%;
          width: 260px;
          height: 36px;
          border: 3px solid #fbbf24;
          border-radius: 50%;
          background: repeating-conic-gradient(
            from 0deg,
            #dc2626 0deg 20deg,
            #fef3c7 20deg 40deg,
            #7c3aed 40deg 60deg
          );
          box-shadow:
            0 8px 0 #7f1d1d,
            0 12px 12px rgba(0, 0, 0, 0.4);
          transform: translateX(-50%) rotateX(8deg);
        }

        .fz-platform-center {
          position: absolute;
          top: 190px;
          left: 50%;
          width: 36px;
          height: 24px;
          border: 2px solid #fcd34d;
          border-radius: 50%;
          background: linear-gradient(90deg, #92400e, #fbbf24, #92400e);
          transform: translateX(-50%);
        }

        .fz-carousel-ground {
          position: absolute;
          right: 8%;
          bottom: 33px;
          left: 8%;
          height: 23px;
          border-radius: 50%;
          background: radial-gradient(
            ellipse,
            rgba(180, 83, 9, 0.16),
            transparent 70%
          );
          filter: blur(4px);
        }

        /* Decorative bulbs */

        .fz-carousel-bulbs {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-top: 2px;
        }

        .fz-carousel-bulbs span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #facc15;
          box-shadow: 0 0 9px rgba(250, 204, 21, 0.65);
          animation: fz-carousel-light 1.5s ease-in-out infinite;
        }

        .fz-carousel-bulbs span:nth-child(3n + 1) {
          background: #f472b6;
          box-shadow: 0 0 9px rgba(244, 114, 182, 0.65);
          animation-delay: -0.5s;
        }

        .fz-carousel-bulbs span:nth-child(3n + 2) {
          background: #38bdf8;
          box-shadow: 0 0 9px rgba(56, 189, 248, 0.65);
          animation-delay: -1s;
        }

        /* Controls */

        .fz-carousel-controls {
          position: relative;
          z-index: 5;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 5px;
        }

        .fz-carousel-button {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(251, 191, 36, 0.4);
          border-radius: 9px;
          background: rgba(120, 53, 15, 0.2);
          padding: 9px 15px;
          color: #fcd34d;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition:
            background 160ms ease,
            border-color 160ms ease;
        }

        .fz-carousel-button:hover {
          border-color: rgba(251, 191, 36, 0.8);
          background: rgba(180, 83, 9, 0.24);
        }

        .fz-carousel-hint {
          margin-top: 12px;
          color: #78716c;
          font-size: 9px;
          line-height: 1.6;
          text-align: center;
        }

        .fz-carousel-start-button {
  min-width: 190px;
  min-height: 44px;
  border-color: rgba(251, 191, 36, 0.7);
  background: linear-gradient(180deg, #fcd34d, #f59e0b);
  color: #211306;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.12);
}

.fz-carousel-start-button:hover:not(:disabled) {
  border-color: #fde68a;
  background: linear-gradient(180deg, #fde68a, #fbbf24);
}

.fz-carousel-start-button:disabled {
  cursor: default;
  opacity: 0.9;
}

.fz-carousel-spinner {
  display: inline-block;
  animation: fz-carousel-button-spin 1s linear infinite;
}

@keyframes fz-carousel-button-spin {
  to {
    transform: rotate(360deg);
  }
}

        @keyframes fz-carousel-light {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        @media (max-width: 420px) {
          .fz-carousel-inner {
            padding-right: 8px;
            padding-left: 8px;
          }

          .fz-carousel-stage {
            height: 275px;
          }

          .fz-carousel-world {
            top: 8px;
            transform: translateX(-50%) scale(0.88);
            transform-origin: top center;
          }

          .fz-carousel-title {
            font-size: 21px;
          }

          .fz-carousel-button {
            padding-right: 11px;
            padding-left: 11px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fz-carousel-bulbs span {
            animation: none !important;
          }
        }
      `}</style>

      <div className="fz-carousel-inner">
        <header className="fz-carousel-heading">
          <p className="fz-carousel-eyebrow">
            ✦ A Little Festival Magic ✦
          </p>

          <h2 className="fz-carousel-title">
            Veronica's Carousel Ride
          </h2>

          <p className="fz-carousel-description">
            Take a spin around our little carnival! Drag the ride or
            use the buttons to turn the carousel.
          </p>
        </header>

        <div
          className={`fz-carousel-stage ${isDragging ? "dragging" : ""}`}
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={() => {
            pointerId.current = null;
            setIsDragging(false);
          }}
          role="group"
          aria-label="Drag left or right to rotate the carousel"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <div className="fz-carousel-ground" />

          <div
            className="fz-carousel-world"
            style={
              {
                "--fz-rotation": `${rotation}deg`,
              } as React.CSSProperties
            }
          >
            <div
              className="fz-carousel-turntable"
              style={
                {
                  "--fz-rotation": `${rotation}deg`,
                } as React.CSSProperties
              }
            >
              <div className="fz-carousel-roof">
                <div className="fz-roof-cone" />
                <div className="fz-roof-cap" />
                <div className="fz-roof-rim" />
              </div>

              <div className="fz-carousel-pole fz-pole-one" />
              <div className="fz-carousel-pole fz-pole-two" />
              <div className="fz-carousel-pole fz-pole-three" />

              <div className="fz-carousel-center-pole" />

              {HORSES.map((horse, index) => {
                const angle = index * (360 / HORSES.length);

                return (
                  <div
                    key={index}
                    className="fz-carousel-horse"
                    style={
                      {
                        "--horse-angle": `${angle}deg`,
                        "--horse-color": horse.color,
                        "--horse-saddle": horse.saddle,
                        "--horse-mane": horse.mane,
                      } as React.CSSProperties
                    }
                  >
                    <div className="fz-horse-pole" />

                    <div className="fz-horse-mane" />

                    <div className="fz-horse-neck" />

                    <div className="fz-horse-head">
                      <span className="fz-horse-ear" />
                      <span className="fz-horse-eye" />
                      <span className="fz-horse-muzzle" />
                    </div>

                    <div className="fz-horse-body" />
                    <div className="fz-horse-saddle" />

                    <div className="fz-horse-leg fz-horse-leg-one" />
                    <div className="fz-horse-leg fz-horse-leg-two" />
                    <div className="fz-horse-leg fz-horse-leg-three" />
                    <div className="fz-horse-leg fz-horse-leg-four" />
                  </div>
                );
              })}

              <div className="fz-carousel-platform" />
              <div className="fz-platform-center" />
            </div>
          </div>
        </div>

        <div className="fz-carousel-bulbs" aria-hidden="true">
          {Array.from({ length: 17 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        <div className="fz-carousel-controls">
  <button
    type="button"
    className="fz-carousel-button fz-carousel-start-button"
    onClick={startCarouselRide}
    disabled={isSpinning}
  >
    {isSpinning ? (
      <>
        <span className="fz-carousel-spinner" aria-hidden="true">
          🎠
        </span>
        Enjoy the Ride · {spinSecondsLeft}s
      </>
    ) : (
      <>
        🎠 Start the Ride
        <span aria-hidden="true">→</span>
      </>
    )}
  </button>
</div>

        <p className="fz-carousel-hint">
          Touch and drag on your phone · Click and drag on your computer
        </p>
      </div>
    </section>
  );
}