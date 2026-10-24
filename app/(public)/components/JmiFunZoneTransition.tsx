"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type JmiFunZoneTransitionProps = {
onComplete: () => void;
};

type ParticleStyle = CSSProperties & {
"--x": string;
"--y": string;
"--z": string;
"--spin": string;
"--delay": string;
};

const COLORS = [
"#ffdc45",
"#35c8ff",
"#ff536d",
"#ff72cf",
"#63f59b",
"#ff9b42",
"#ffffff",
"#c7a6ff",
];

const CONFETTI = Array.from({ length: 44 }, (_, index) => ({
left: "${(index * 37 + 11) % 100}%",
delay: "${(index % 11) * 110}ms",
duration: "${1800 + (index % 7) * 230}ms",
color: COLORS[index % COLORS.length],
size: 4 + (index % 5),
rotation: (index * 47) % 360,
}));

const SPARKLES = Array.from({ length: 30 }, (_, index) => ({
left: "${(index * 43 + 7) % 100}%",
top: "${(index * 31 + 13) % 100}%",
delay: "${(index % 8) * 100}ms",
size: 10 + (index % 12),
}));

const BURST_PARTICLES = Array.from({ length: 100 }, (_, index) => {
const angle = (index / 100) * Math.PI * 2;
const ring = index % 5;
const distance = 35 + ring * 15 + (index % 3) * 8;

return {
x: Math.cos(angle) * distance,
y: Math.sin(angle) * distance,
z: 100 + (index % 7) * 65,
color: COLORS[index % COLORS.length],
width: index % 4 === 0 ? 9 : index % 3 === 0 ? 6 : 4,
height: index % 4 === 0 ? 18 : index % 3 === 0 ? 12 : 7,
spin: (index % 2 === 0 ? 1 : -1) * (360 + (index % 5) * 180),
delay: "${(index % 12) * 12}ms",
shape: index % 7 === 0 ? "circle" : "paper",
};
});

export default function JmiFunZoneTransition({
onComplete,
}: JmiFunZoneTransitionProps) {
const [phase, setPhase] = useState<
  "countdown" | "zoom" | "burst"
>("countdown");

const [count, setCount] = useState<number>(3);

const onCompleteRef = useRef(onComplete);

useEffect(() => {
onCompleteRef.current = onComplete;
}, [onComplete]);

useEffect(() => {
let cancelled = false;
let countdown = 3;

const countdownTimer = window.setInterval(() => {
  if (cancelled) return;

  if (countdown > 1) {
    countdown -= 1;
    setCount(countdown);
  } else {
    window.clearInterval(countdownTimer);
    setPhase("zoom");
  }
}, 700);

const zoomTimer = window.setTimeout(() => {
  if (!cancelled) {
    setPhase("burst");
  }
}, 2350);

const navigationTimer = window.setTimeout(() => {
  if (!cancelled) {
    onCompleteRef.current();
  }
}, 4600);

return () => {
  cancelled = true;
  window.clearInterval(countdownTimer);
  window.clearTimeout(zoomTimer);
  window.clearTimeout(navigationTimer);
};

}, []);

return (
<div
role="status"
aria-label="Entering JMI Fun Zone"
aria-live="assertive"
className={`"jmi-cinema fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-black ${ phase === "zoom" ? "jmi-cinema-zoom" : phase === "burst" ? "jmi-cinema-explosion" : "" }"`}
>
{/* Cinematic background */}

  <div className="jmi-cinema-background pointer-events-none absolute inset-0" />

  <div className="jmi-cinema-vignette pointer-events-none absolute inset-0" />

  {/* Colourful illuminated frame */}

  <div className="jmi-cinema-frame pointer-events-none absolute inset-0">
    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-yellow-300 via-pink-400 to-sky-400 shadow-[0_0_25px_rgba(255,90,160,0.8)]" />

    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-sky-400 via-red-400 to-yellow-300 shadow-[0_0_25px_rgba(50,190,255,0.8)]" />

    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300 via-red-400 to-pink-400 shadow-[0_0_25px_rgba(255,220,60,0.8)]" />

    <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-sky-400 via-pink-400 to-yellow-300 shadow-[0_0_25px_rgba(60,180,255,0.8)]" />

    {Array.from({ length: 36 }).map((_, index) => (
      <span
        key={index}
        className="jmi-cinema-bulb absolute h-2 w-2 rounded-full"
        style={{
          left: `${(index * 31) % 100}%`,
          top: `${(index * 47) % 100}%`,
          backgroundColor: COLORS[index % 4],
          animationDelay: `${(index % 7) * 90}ms`,
        }}
      />
    ))}
  </div>

  {/* Background falling confetti */}

  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {CONFETTI.map((piece, index) => (
      <span
        key={index}
        className="jmi-cinema-confetti absolute -top-5 rounded-sm"
        style={{
          left: piece.left,
          width: piece.size,
          height: piece.size * 1.8,
          backgroundColor: piece.color,
          animationDelay: piece.delay,
          animationDuration: piece.duration,
          transform: `rotate(${piece.rotation}deg)`,
        }}
      />
    ))}
  </div>

  {/* Shining stars */}

  <div className="pointer-events-none absolute inset-0">
    {SPARKLES.map((sparkle, index) => (
      <span
        key={index}
        className="jmi-cinema-sparkle absolute"
        style={{
          left: sparkle.left,
          top: sparkle.top,
          fontSize: sparkle.size,
          animationDelay: sparkle.delay,
        }}
      >
        {index % 3 === 0 ? "✧" : "✦"}
      </span>
    ))}
  </div>

  {/* Cinematic centrepiece */}

  <div className="jmi-cinema-stage relative z-10 flex w-full flex-col items-center px-6 text-center">
    <p className="jmi-cinema-eyebrow mb-8 text-[9px] font-bold uppercase tracking-[0.4em] text-pink-200/80 sm:text-xs">
      JMI Entertainment Presents
    </p>

    {/* Balloon and 3D lighting */}

    <div className="jmi-cinema-balloon-scene relative flex h-44 w-40 items-center justify-center sm:h-56 sm:w-52">
      <div className="jmi-cinema-aura absolute h-36 w-36 rounded-full bg-pink-500/20 blur-3xl sm:h-48 sm:w-48" />

      <div className="jmi-cinema-balloon-assembly absolute inset-0">
        {/* Main balloon body */}

        <div className="jmi-cinema-balloon-body absolute left-1/2 top-2 h-32 w-28 -translate-x-1/2 rounded-[48%48%_45%_45%] border border-white/50 bg-[radial-gradient(ellipse_at_28%_18%,#fff7fb_0%,#ffb4e3_8%,#ff5c9a_30%,#ed174f_64%,#8d073b_100%)] shadow-[0_0_45px_rgba(255,65,140,0.55),inset-15px_-18px_28px_rgba(30,0,20,0.45),inset_10px_8px_20px_rgba(255,255,255,0.5)] sm:h-40 sm:w-36" />

        {/* Balloon knot */}

        <div className="jmi-cinema-balloon-knot absolute left-1/2 top-[124px] h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[12px] border-x-transparent border-t-rose-600 sm:top-[156px]" />

        {/* Balloon string */}

        <div className="jmi-cinema-balloon-string absolute left-1/2 top-[135px] h-9 w-px bg-pink-100/80 sm:top-[168px]" />

        {/* Glossy reflections */}

        <div className="jmi-cinema-balloon-highlight pointer-events-none absolute left-[31%] top-[24px] h-12 w-5 rotate-[25deg] rounded-full bg-white/55 blur-[2px] sm:top-[29px] sm:h-16 sm:w-6" />

        <div className="jmi-cinema-balloon-highlight-secondary pointer-events-none absolute right-[27%] top-[48px] h-5 w-2 rotate-[25deg] rounded-full bg-white/35 blur-[1px]" />

        {/* Celebration symbol inside balloon */}

        <div className="jmi-cinema-balloon-symbol absolute inset-0 flex items-center justify-center pt-1 text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.65)] sm:text-5xl">
          🎉
        </div>
      </div>

      {/* Burst flash, visible during explosion */}

      {phase === "burst" && (
        <div className="jmi-cinema-flash pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_50px_30px_rgba(255,255,255,0.9)]" />
      )}
    </div>

    {/* Countdown */}

    {phase === "countdown" && (
      <div key={count} className="jmi-cinema-countdown mt-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">
          Get ready
        </p>

        <p className="mt-2 text-7xl font-black leading-none text-white drop-shadow-[0_0_30px_rgba(255,100,190,0.65)] sm:text-8xl">
          {count}
        </p>
      </div>
    )}

    {/* Zoom phase message */}

    {phase === "zoom" && (
      <p className="jmi-cinema-zoom-message mt-3 text-xs font-bold uppercase tracking-[0.32em] text-pink-100 sm:text-sm">
        Get ready for the fun!
      </p>
    )}

    {/* Burst message */}

    {phase === "burst" && (
      <div className="jmi-cinema-burst-message mt-1">
        <p className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_24px_rgba(255,90,180,0.9)] sm:text-4xl">
          LET&apos;S CELEBRATE!
        </p>

        <p className="mt-2 text-xs tracking-wide text-zinc-200 sm:text-sm">
          Your Fun Zone awaits...
        </p>
      </div>
    )}
  </div>

  {/* Explosion particles flying out from the balloon */}

  {phase === "burst" && (
    <div
      className="jmi-cinema-particle-field pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      {BURST_PARTICLES.map((particle, index) => {
        const style: ParticleStyle = {
          "--x": `${particle.x}vmin`,
          "--y": `${particle.y}vmin`,
          "--z": `${particle.z}px`,
          "--spin": `${particle.spin}deg`,
          "--delay": particle.delay,
          left: "50%",
          top: "44%",
          width: particle.width,
          height: particle.height,
          backgroundColor: particle.color,
          borderRadius: particle.shape === "circle" ? "50%" : "2px",
          animationDelay: particle.delay,
        };

        return (
          <span
            key={index}
            className="jmi-cinema-particle absolute"
            style={style}
          />
        );
      })}
    </div>
  )}

  {/* Cinematic light rays during the burst */}

  {phase === "burst" && (
    <div className="jmi-cinema-rays pointer-events-none absolute inset-0">
      {Array.from({ length: 16 }).map((_, index) => (
        <span
          key={index}
          className="jmi-cinema-ray absolute left-1/2 top-[44%] h-[65vmax] w-1 origin-top"
          style={{
            transform: `rotate(${index * 22.5}deg)`,
            background:
              index % 2 === 0
                ? "linear-gradient(to bottom, rgba(255,255,255,.7), transparent)"
                : "linear-gradient(to bottom, rgba(255,105,190,.65), transparent)",
            animationDelay: `${index * 12}ms`,
          }}
        />
      ))}
    </div>
  )}

  {/* Transition-local animation CSS */}

  <style>{`
    .jmi-cinema {
      perspective: 1000px;
      isolation: isolate;
    }

    .jmi-cinema-background {
      background:
        radial-gradient(ellipse at 50% 42%, rgba(87, 20, 83, .38), transparent 38%),
        radial-gradient(ellipse at 50% 50%, #15101e 0%, #050507 48%, #000 100%);
      animation: jmi-cinema-background-pulse 1.5s ease-in-out infinite alternate;
    }

    .jmi-cinema-vignette {
      z-index: 2;
      background: radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,.55) 100%);
      pointer-events: none;
    }

    .jmi-cinema-frame {
      animation: jmi-cinema-frame-glow 750ms ease-in-out infinite alternate;
    }

    .jmi-cinema-bulb {
      box-shadow: 0 0 12px currentColor, 0 0 22px currentColor;
      animation: jmi-cinema-bulb-flash 450ms ease-in-out infinite alternate;
    }

    .jmi-cinema-confetti {
      animation: jmi-cinema-fall linear infinite;
    }

    .jmi-cinema-sparkle {
      color: #fff5bd;
      text-shadow: 0 0 8px #fff, 0 0 18px #ff70db, 0 0 30px #5ad9ff;
      animation: jmi-cinema-twinkle 650ms ease-in-out infinite alternate;
    }

    .jmi-cinema-stage {
      transform-style: preserve-3d;
      animation: jmi-cinema-stage-float 2s ease-in-out infinite alternate;
    }

    .jmi-cinema-eyebrow {
      transition: opacity 250ms ease;
    }

    .jmi-cinema-balloon-scene {
      perspective: 800px;
      transform-style: preserve-3d;
    }

    .jmi-cinema-aura {
      animation: jmi-cinema-aura-pulse 1s ease-in-out infinite alternate;
    }

    .jmi-cinema-balloon-assembly {
      transform-style: preserve-3d;
      animation: jmi-cinema-balloon-float 1.4s ease-in-out infinite alternate;
    }

    .jmi-cinema-balloon-body {
      transform-origin: center 60%;
      animation: jmi-cinema-balloon-breathe 1s ease-in-out infinite alternate;
      backface-visibility: visible;
    }

    .jmi-cinema-balloon-knot {
      filter: drop-shadow(0 2px 5px rgba(255,50,110,.6));
    }

    .jmi-cinema-balloon-string {
      transform-origin: top center;
      animation: jmi-cinema-string-sway 1.1s ease-in-out infinite alternate;
    }

    .jmi-cinema-balloon-highlight {
      box-shadow: 0 0 15px rgba(255,255,255,.2);
    }

    .jmi-cinema-balloon-symbol {
      animation: jmi-cinema-symbol-glow 900ms ease-in-out infinite alternate;
    }

    .jmi-cinema-countdown {
      animation: jmi-cinema-count-pop 600ms cubic-bezier(.2,.8,.2,1) both;
    }

    .jmi-cinema-zoom .jmi-cinema-stage {
      animation: jmi-cinema-camera-zoom 1.1s cubic-bezier(.16,.8,.2,1) forwards;
    }

    .jmi-cinema-zoom .jmi-cinema-balloon-assembly {
      animation: jmi-cinema-balloon-approach 1.1s cubic-bezier(.16,.8,.2,1) forwards;
    }

    .jmi-cinema-zoom .jmi-cinema-eyebrow,
    .jmi-cinema-zoom .jmi-cinema-zoom-message {
      animation: jmi-cinema-fade-out 650ms ease-in forwards;
    }

    .jmi-cinema-zoom .jmi-cinema-aura {
      animation: jmi-cinema-aura-expand 1.1s ease-in forwards;
    }

    .jmi-cinema-explosion .jmi-cinema-stage {
      animation: jmi-cinema-impact 350ms ease-out both;
    }

    .jmi-cinema-explosion .jmi-cinema-balloon-assembly {
      animation: jmi-cinema-balloon-explode 280ms cubic-bezier(.1,.8,.2,1) both;
    }

    .jmi-cinema-explosion .jmi-cinema-balloon-symbol {
      animation: jmi-cinema-symbol-explode 250ms ease-out both;
    }

    .jmi-cinema-explosion .jmi-cinema-balloon-string {
      animation: jmi-cinema-string-explode 180ms ease-out both;
    }

    .jmi-cinema-flash {
      z-index: 20;
      animation: jmi-cinema-flash-pop 500ms ease-out both;
    }

    .jmi-cinema-particle-field {
      z-index: 30;
      perspective: 700px;
      transform-style: preserve-3d;
    }

    .jmi-cinema-particle {
      opacity: 0;
      box-shadow: 0 0 7px rgba(255,255,255,.35);
      transform-style: preserve-3d;
      backface-visibility: visible;
      animation: jmi-cinema-particle-fly 1.5s cubic-bezier(.12,.72,.18,1) both;
    }

    .jmi-cinema-rays {
      z-index: 25;
      opacity: 0;
      transform-origin: center;
      animation: jmi-cinema-rays-flash 750ms ease-out both;
    }

    .jmi-cinema-ray {
      filter: blur(1px);
      opacity: .65;
    }

    .jmi-cinema-burst-message {
      animation: jmi-cinema-message-in 450ms ease-out both;
    }

    @keyframes jmi-cinema-background-pulse {
      from { filter: brightness(.8); }
      to { filter: brightness(1.25); }
    }

    @keyframes jmi-cinema-frame-glow {
      from { opacity: .65; filter: brightness(.8); }
      to { opacity: 1; filter: brightness(1.45); }
    }

    @keyframes jmi-cinema-bulb-flash {
      from { opacity: .4; transform: scale(.7); }
      to { opacity: 1; transform: scale(1.3); }
    }

    @keyframes jmi-cinema-fall {
      from { transform: translate3d(0,-5vh,0) rotate(0deg); }
      to { transform: translate3d(5vw,110vh,0) rotate(720deg); }
    }

    @keyframes jmi-cinema-twinkle {
      from { opacity: .2; transform: scale(.6) rotate(0deg); }
      to { opacity: 1; transform: scale(1.4) rotate(30deg); }
    }

    @keyframes jmi-cinema-stage-float {
      from { transform: translateY(4px) rotateX(1deg); }
      to { transform: translateY(-6px) rotateX(-1deg); }
    }

    @keyframes jmi-cinema-aura-pulse {
      from { opacity: .4; transform: scale(.8); }
      to { opacity: .95; transform: scale(1.2); }
    }

    @keyframes jmi-cinema-balloon-float {
      from { transform: translateY(5px) rotateY(-7deg) rotateZ(-2deg); }
      to { transform: translateY(-7px) rotateY(7deg) rotateZ(2deg); }
    }

    @keyframes jmi-cinema-balloon-breathe {
      from { filter: brightness(.95) saturate(1); }
      to { filter: brightness(1.12) saturate(1.2); }
    }

    @keyframes jmi-cinema-string-sway {
      from { transform: rotate(-6deg); }
      to { transform: rotate(6deg); }
    }

    @keyframes jmi-cinema-symbol-glow {
      from { filter: brightness(.95); transform: scale(.95); }
      to { filter: brightness(1.25); transform: scale(1.08); }
    }

    @keyframes jmi-cinema-count-pop {
      from { opacity: 0; transform: scale(.55) translateY(12px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes jmi-cinema-camera-zoom {
      0% { transform: scale(1) translateZ(0); }
      100% { transform: scale(1.25) translateZ(220px); }
    }

    @keyframes jmi-cinema-balloon-approach {
      0% { transform: translateZ(0) scale(1) rotateY(0deg); }
      35% { transform: translateZ(160px) scale(1.8) rotateY(-8deg); }
      75% { transform: translateZ(420px) scale(3.8) rotateY(7deg); }
      100% { transform: translateZ(700px) scale(7) rotateY(0deg); }
    }

    @keyframes jmi-cinema-fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes jmi-cinema-aura-expand {
      from { opacity: .5; transform: scale(1); }
      to { opacity: 1; transform: scale(3.5); }
    }

    @keyframes jmi-cinema-impact {
      0% { transform: scale(1.2) translate(0,0); }
      20% { transform: scale(1.3) translate(-5px,2px); }
      45% { transform: scale(1.35) translate(5px,-3px); }
      70% { transform: scale(1.38) translate(-3px,-2px); }
      100% { transform: scale(1.4) translate(0,0); }
    }

    @keyframes jmi-cinema-balloon-explode {
      0% { opacity: 1; transform: scale(1); filter: brightness(1.3); }
      25% { opacity: 1; transform: scale(1.25); filter: brightness(2.2); }
      100% { opacity: 0; transform: scale(1.8) rotate(18deg); filter: brightness(2.8); }
    }

    @keyframes jmi-cinema-symbol-explode {
      0% { opacity: 1; transform: scale(1); }
      35% { opacity: 1; transform: scale(1.8) rotate(15deg); }
      100% { opacity: 0; transform: scale(3.5) rotate(-25deg); }
    }

    @keyframes jmi-cinema-string-explode {
      from { opacity: 1; transform: scaleY(1); }
      to { opacity: 0; transform: scaleY(2); }
    }

    @keyframes jmi-cinema-flash-pop {
      0% { opacity: 0; transform: translate(-50%,-50%) scale(.2); }
      15% { opacity: 1; transform: translate(-50%,-50%) scale(2.5); }
      100% { opacity: 0; transform: translate(-50%,-50%) scale(8); }
    }

    @keyframes jmi-cinema-particle-fly {
      0% {
        opacity: 0;
        transform: translate3d(0,0,0) scale(.1) rotate(0deg);
      }
      12% {
        opacity: 1;
        transform: translate3d(0,0,30px) scale(1.4) rotate(90deg);
      }
      100% {
        opacity: 0;
        transform: translate3d(var(--x),var(--y),var(--z)) scale(.3) rotate(var(--spin));
      }
    }

    @keyframes jmi-cinema-rays-flash {
      0% { opacity: 0; transform: scale(.2); }
      15% { opacity: .85; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.4); }
    }

    @keyframes jmi-cinema-message-in {
      from { opacity: 0; transform: translateY(12px) scale(.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @media (prefers-reduced-motion: reduce) {
      .jmi-cinema *,
      .jmi-cinema::before,
      .jmi-cinema::after {
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
      }
    }
  `}</style>
</div>

);
}