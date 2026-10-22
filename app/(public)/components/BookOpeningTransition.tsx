"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type BookOpeningTransitionProps = {
languageName: string;
destination: string;
children: React.ReactNode;
};

export default function BookOpeningTransition({
languageName,
destination,
children,
}: BookOpeningTransitionProps) {
const router = useRouter();

const [isOpening, setIsOpening] = useState(false);
const navigationStarted = useRef(false);
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
return () => {
if (timerRef.current) {
clearTimeout(timerRef.current);
}
};
}, []);

const handleOpen = () => {
if (isOpening || navigationStarted.current) return;

navigationStarted.current = true;
setIsOpening(true);

timerRef.current = setTimeout(() => {
  router.push(destination);
}, 1100);
};

return (
<>
<button
type="button"
aria-label={"Open ${languageName} movie library"}
aria-busy={isOpening}
onClick={handleOpen}
disabled={isOpening}
className="relative block w-full appearance-none border-0 bg-transparent p-0 text-left disabled:cursor-wait"
>
{children}
</button>

  {isOpening && (
    <div
      className="jmi-book-transition fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
      role="status"
      aria-label={`Opening the ${languageName} movie library`}
    >
      {/* Dark cinematic background */}
      <div className="jmi-transition-background absolute inset-0 bg-[#080503]/90" />

      {/* Cinematic vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.28) 52%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      {/* Book rises into focus */}
      <div className="jmi-book-lift relative z-10 w-[min(72vw,300px)]">
        <div
          className="relative aspect-[3/4] w-full"
          style={{
            perspective: "1400px",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Cream-coloured page block */}
          <div
            className="absolute inset-y-[2px] left-[5px] right-[2px] overflow-hidden rounded-r-[3px] border-y border-r border-[#b9a17b] bg-[#e8d8b7]"
            style={{
              transform: "translateZ(-3px)",
              boxShadow:
                "inset -5px 0 9px rgba(72,43,19,0.2), 4px 5px 10px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    180deg,
                    rgba(112,78,43,0.16) 0px,
                    rgba(112,78,43,0.16) 1px,
                    transparent 1px,
                    transparent 4px
                  ),
                  linear-gradient(
                    90deg,
                    #c8b28c 0%,
                    #f1e5cb 8%,
                    #e9d9b8 88%,
                    #bda17a 100%
                  )
                `,
              }}
            />

            {/* Page edges */}
            {Array.from({ length: 12 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 h-px"
                style={{
                  top: `${8 + index * 7}%`,
                  background:
                    index % 2 === 0
                      ? "rgba(117,80,43,0.32)"
                      : "rgba(255,248,225,0.7)",
                }}
              />
            ))}

            <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-[#806341]/40 to-transparent" />

            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-5"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(109,72,34,0.15))",
              }}
            />
          </div>

          {/* Open pages underneath the cover */}
          <div
            className="absolute inset-y-[4px] left-[4px] right-[5px] overflow-hidden rounded-r-sm border border-[#b9a17b]/80 bg-[#f0e3c7]"
            style={{
              transform: "translateZ(-1px)",
              boxShadow: "inset 0 0 18px rgba(95,63,29,0.12)",
            }}
          >

         {/* Loading message printed on the open book pages */}

<div
  className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
  style={{
    transform: "translateZ(1px)",
  }}
>
  <div className="text-center">
    <p
      className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#765637] sm:text-xs sm:tracking-[0.22em]"
      style={{
        textShadow: "0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      Please Wait....
    </p><p
  className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#765637] sm:text-xs sm:tracking-[0.18em]"
  style={{
    textShadow: "0 1px 0 rgba(255,255,255,0.45)",
  }}
>
  Your Book Is Loading
</p>

<div className="mx-auto mt-3 flex items-center justify-center gap-1.5">
  <span className="h-1 w-1 rounded-full bg-[#9a7953] animate-pulse" />
  <span className="h-1 w-1 rounded-full bg-[#9a7953] animate-pulse [animation-delay:200ms]" />
  <span className="h-1 w-1 rounded-full bg-[#9a7953] animate-pulse [animation-delay:400ms]" />
</div>

  </div>
</div>

            {/* Left page */}
            <div
              className="absolute inset-y-0 left-0 w-1/2 border-r border-[#b7a080]/70"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    180deg,
                    transparent 0px,
                    transparent 9px,
                    rgba(110,78,45,0.18) 10px,
                    transparent 11px,
                    transparent 15px
                  ),
                  linear-gradient(
                    90deg,
                    #d6c19a,
                    #f5e9d0 22%,
                    #eee0c2 100%
                  )
                `,
              }}
            >
              <div className="absolute inset-x-3 top-[22%] space-y-2 opacity-50">
                <div className="h-px w-full bg-[#8c704c]/50" />
                <div className="h-px w-[82%] bg-[#8c704c]/40" />
                <div className="h-px w-[92%] bg-[#8c704c]/40" />
                <div className="h-px w-[74%] bg-[#8c704c]/40" />
                <div className="h-px w-[88%] bg-[#8c704c]/40" />
                <div className="h-px w-[68%] bg-[#8c704c]/40" />
              </div>

              <div className="absolute inset-x-3 top-[48%] space-y-2 opacity-35">
                <div className="h-px w-full bg-[#8c704c]/50" />
                <div className="h-px w-[80%] bg-[#8c704c]/40" />
                <div className="h-px w-[90%] bg-[#8c704c]/40" />
                <div className="h-px w-[65%] bg-[#8c704c]/40" />
              </div>
            </div>

            {/* Right page */}
            <div
              className="absolute inset-y-0 right-0 w-1/2"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    180deg,
                    transparent 0px,
                    transparent 9px,
                    rgba(110,78,45,0.18) 10px,
                    transparent 11px,
                    transparent 15px
                  ),
                  linear-gradient(
                    90deg,
                    #eee0c2,
                    #f5e9d0 75%,
                    #d6c19a
                  )
                `,
              }}
            >
              <div className="absolute inset-x-3 top-[22%] space-y-2 opacity-50">
                <div className="h-px w-full bg-[#8c704c]/50" />
                <div className="h-px w-[82%] bg-[#8c704c]/40" />
                <div className="h-px w-[92%] bg-[#8c704c]/40" />
                <div className="h-px w-[74%] bg-[#8c704c]/40" />
                <div className="h-px w-[88%] bg-[#8c704c]/40" />
                <div className="h-px w-[68%] bg-[#8c704c]/40" />
              </div>

              <div className="absolute inset-x-3 top-[48%] space-y-2 opacity-35">
                <div className="h-px w-full bg-[#8c704c]/50" />
                <div className="h-px w-[80%] bg-[#8c704c]/40" />
                <div className="h-px w-[90%] bg-[#8c704c]/40" />
                <div className="h-px w-[65%] bg-[#8c704c]/40" />
              </div>
            </div>

            {/* Book gutter */}
            <div
              className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(90deg, rgba(76,47,23,0.22), rgba(255,248,224,0.25), rgba(76,47,23,0.2))",
              }}
            />
          </div>

          {/* Leather cover rotates open */}
          <div className="jmi-book-cover absolute inset-0 z-10 overflow-hidden rounded-r-md border border-[#b58a55]/70 bg-gradient-to-br from-[#684629] via-[#352115] to-[#130b06] shadow-[8px_12px_30px_rgba(0,0,0,0.55)]">
            {/* Leather grain */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    2deg,
                    transparent 0px,
                    transparent 8px,
                    rgba(220,170,110,0.12) 9px,
                    rgba(10,5,2,0.25) 11px,
                    transparent 14px,
                    transparent 20px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(0,0,0,0.3),
                    transparent 30%,
                    rgba(220,170,110,0.08) 55%,
                    transparent 80%,
                    rgba(0,0,0,0.2)
                  )
                `,
              }}
            />

            {/* Spine */}
            <div className="absolute inset-y-0 left-0 z-10 w-3 border-r border-black/40 bg-gradient-to-r from-[#170d06] via-[#9a7042]/60 to-[#24150b] shadow-[3px_0_8px_rgba(0,0,0,0.35)]" />

            {/* Embossed title */}
            <div className="relative mx-5 flex h-[78%] flex-col items-center justify-center border border-[#c49a63]/45 text-center shadow-[inset_0_0_25px_rgba(0,0,0,0.3)]">
              <div className="pointer-events-none absolute inset-2 border border-[#c49a63]/20" />

              <span className="px-2 text-[8px] uppercase tracking-[0.3em] text-[#d7b27e]">
                Jeruto Movie Intelligence
              </span>

              <div className="my-5 h-px w-12 bg-[#c49a63]/70" />

              <h2 className="px-2 text-xl font-semibold text-[#f0d3a4] sm:text-2xl">
                {languageName}
              </h2>

              <p className="mt-4 text-[8px] uppercase tracking-[0.3em] text-[#d7b27e]/80">
                Movie Library
              </p>

              <div className="mt-6 h-px w-8 bg-[#c49a63]/40" />
            </div>

            {/* Gold edge highlight */}
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[3px] bg-gradient-to-l from-[#c6a16c]/70 to-transparent" />
          </div>
        </div>

        {/* Ground shadow */}
        <div className="jmi-book-shadow pointer-events-none absolute -bottom-5 left-[12%] right-[12%] h-5 rounded-[50%] bg-black/50" />
      </div>

      {/* CSS-only white flash */}
      <div className="jmi-book-flash pointer-events-none absolute inset-0 z-20 bg-white" />
    </div>
  )}

  <style jsx global>{`
    .jmi-transition-background {
      animation: jmi-transition-fade 250ms ease-out both;
    }

    .jmi-book-lift {
      animation: jmi-book-lift-v2 1600ms cubic-bezier(0.16, 1, 0.3, 1)
        both;
    }

    .jmi-book-cover {
      transform-origin: left center;
      transform-style: preserve-3d;
      backface-visibility: visible;
      animation: jmi-book-open-v2 1400ms cubic-bezier(0.45, 0, 0.2, 1)
        both;
    }

    .jmi-book-shadow {
      animation: jmi-book-shadow-v2 1200ms ease-in-out both;
    }

    .jmi-book-flash {
      opacity: 0;
      animation: jmi-book-flash-v2 100ms ease-out 2050ms both;
    }

    @keyframes jmi-transition-fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes jmi-book-lift-v2 {
      0% {
        opacity: 1;
        transform: translate3d(0, 55px, 0) scale(0.55);
      }
      35% {
        opacity: 1;
        transform: translate3d(0, 25px, 0) scale(0.72);
      }
      70% {
        opacity: 1;
        transform: translate3d(0, -5px, 0) scale(0.92);
      }
      88% {
        opacity: 1;
        transform: translate3d(0, 2px, 0) scale(1.02);
      }
      100% {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }
    }

    @keyframes jmi-book-open-v2 {
      0% {
        transform: rotateY(0deg);
      }
      35% {
        transform: rotateY(-5deg);
      }
      70% {
        transform: rotateY(-65deg);
      }
      100% {
        transform: rotateY(-155deg);
      }
    }

    @keyframes jmi-book-shadow-v2 {
      0% {
        opacity: 0.25;
        transform: scale(0.65);
      }
      50% {
        opacity: 0.65;
        transform: scale(1.1);
      }
      100% {
        opacity: 0.8;
        transform: scale(1);
      }
    }

    @keyframes jmi-book-flash-v2 {
      0% {
        opacity: 0;
      }
      35% {
        opacity: 0.85;
      }
      100% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jmi-transition-background,
      .jmi-book-lift,
      .jmi-book-cover,
      .jmi-book-shadow,
      .jmi-book-flash {
        animation-duration: 1ms !important;
      }
    }
  `}</style>
</>

);
}