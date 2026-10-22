"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function JmiHomepageLibraryBook() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function enterLibrary() {
    if (opening) return;

    setOpening(true);

    // Navigate as the door swings open.
    timeoutRef.current = setTimeout(() => {
      router.push("/preview/movies/library");
    }, 2050);
  }

  return (
    <>
      <button
        type="button"
        onClick={enterLibrary}
        disabled={opening}
        aria-label="Enter JMI Movie Library"
        className="group relative mx-auto block w-full max-w-[240px] transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98] disabled:cursor-wait"
      >
        {/* BOOK SHADOW */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 left-[8%] h-5 w-[84%] rounded-[50%] bg-black/70 blur-xl"
        />

        {/* BOOK BACK / PAGE BLOCK */}
        <div
          aria-hidden="true"
          className="absolute inset-y-2 left-[5px] right-[-5px] rounded-r-md border border-[#4a2d17] bg-gradient-to-r from-[#b18a58] via-[#d0b27d] to-[#76512e] shadow-[2px_4px_8px_rgba(0,0,0,0.45)]"
        />

        {/* MAIN BOOK COVER */}
        <div className="relative aspect-[1.25/1] overflow-hidden rounded-md border border-[#684321] bg-gradient-to-br from-[#4a2b16] via-[#2b170b] to-[#160904] shadow-[0_12px_25px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(205,150,85,0.14),inset_0_-3px_0_rgba(0,0,0,0.45)]">
          {/* ANTIQUE LIGHT */}
          <div className="jmi-book-light pointer-events-none absolute inset-y-0 -left-1/2 w-full bg-gradient-to-r from-transparent via-[#c08a4d]/[0.09] to-transparent" />

          {/* LEATHER GRAIN */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-35 bg-[repeating-linear-gradient(168deg,transparent_0px,transparent_9px,rgba(180,120,65,0.035)_10px,transparent_12px,rgba(0,0,0,0.09)_20px)]"
          />

          {/* AGED PATCHES */}
          <div className="pointer-events-none absolute left-[12%] top-[18%] h-[18%] w-[22%] rounded-full bg-black/[0.10] blur-md" />

          <div className="pointer-events-none absolute right-[12%] bottom-[16%] h-[22%] w-[18%] rounded-full bg-[#8b5b30]/[0.07] blur-md" />

          {/* COVER FRAMES */}
          <div className="pointer-events-none absolute inset-[9px] rounded-[4px] border border-[#8b5a2e]/45" />
          <div className="pointer-events-none absolute inset-[13px] rounded-[3px] border border-[#1a0b04]/70" />

          {/* BOOK SPINE */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[13px] border-r border-[#160903] bg-gradient-to-r from-[#160803] via-[#573218] to-[#291408] shadow-[inset_-2px_0_3px_rgba(0,0,0,0.45)]" />

          <div className="pointer-events-none absolute bottom-[10%] left-[4px] top-[10%] w-[2px] bg-[#9a6838]/25" />

          {/* BRASS CORNERS */}
          <div className="pointer-events-none absolute left-3 top-3 h-3 w-3 rounded-sm border border-[#9b6a38]/70 bg-gradient-to-br from-[#b78347] via-[#68411f] to-[#291408]" />
          <div className="pointer-events-none absolute right-3 top-3 h-3 w-3 rounded-sm border border-[#9b6a38]/70 bg-gradient-to-br from-[#b78347] via-[#68411f] to-[#291408]" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 rounded-sm border border-[#9b6a38]/45 bg-gradient-to-br from-[#8a5b31] via-[#543319] to-[#261307]" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 rounded-sm border border-[#9b6a38]/45 bg-gradient-to-br from-[#8a5b31] via-[#543319] to-[#261307]" />

          {/* BOOK TITLE */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sm border border-[#9a6838]/55 bg-[#160904]/60 text-lg text-[#c09258] shadow-[inset_0_1px_2px_rgba(210,160,95,0.12),0_2px_4px_rgba(0,0,0,0.4)] transition-colors duration-300 group-hover:border-[#c09258]/70 group-hover:text-[#dfb77c]">
              📚
            </div>

            <p className="text-[17px] font-semibold tracking-[0.01em] text-[#d7b27b] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] transition-colors duration-300 group-hover:text-[#ebc993] sm:text-lg">
              JMI Movie Library
            </p>

            <div className="mt-3 flex items-center gap-2">
              <div className="h-px w-8 bg-[#9a6838]/45" />
              <div className="h-1 w-1 rotate-45 bg-[#b47a41]/70" />
              <div className="h-px w-8 bg-[#9a6838]/45" />
            </div>

            <p className="mt-2 text-[6px] uppercase tracking-[0.24em] text-[#8e6844]">
              Indian Cinema Archive
            </p>
          </div>

          {/* COVER HIGHLIGHT */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c08a4d]/45 to-transparent" />
        </div>
      </button>

      {/* FULL-SCREEN CINEMATIC TRANSITION */}
      {opening && (
        <div
          role="status"
          aria-label="Opening the JMI Movie Library entrance"
          className="fixed inset-0 z-[99999] overflow-hidden bg-black"
          style={{
            perspective: "1000px",
            isolation: "isolate",
          }}
        >
          {/* STATIONARY BLACK BACKGROUND */}
          <div className="absolute inset-0 bg-black" />

          {/* DOOR STAGE */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative"
              style={{
                width: "min(78vw, 360px)",
                height: "min(82dvh, 620px)",
                minHeight: "280px",
                perspective: "1000px",
              }}
            >
              {/* DARK OPENING BEHIND THE DOOR */}
              <div className="absolute inset-0 bg-black shadow-[0_0_70px_20px_rgba(115,73,28,0.12)]" />

              {/* HINGE SIDE */}
              <div
                className="absolute inset-0"
                style={{
                  transformOrigin: "left center",
                  animation: "jmi-vintage-door-open 1600ms cubic-bezier(0.45,0,0.2,1) forwards",
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                {/* DOOR ARTWORK */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "url('/images/jmi-vintage-door.png')",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100% 100%",
                    backfaceVisibility: "hidden",
                    filter: "drop-shadow(0 0 18px rgba(0,0,0,0.7))",
                  }}
                />
              </div>

              {/* SUBTLE WARM LIGHT AFTER OPENING */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(155,105,45,0.10), transparent 65%)",
                  animation: "jmi-vintage-door-glow 650ms ease-out forwards",
                }}
              />
            </div>
          </div>

          {/* TRANSITION-LOCAL KEYFRAMES */}
          <style>{`
            @keyframes jmi-vintage-door-open {
              0% {
                transform: rotateY(0deg);
              }
              100% {
                transform: rotateY(-100deg);
              }
            }

            @keyframes jmi-vintage-door-glow {
              0%, 35% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              @keyframes jmi-vintage-door-open {
                to {
                  transform: rotateY(-100deg);
                }
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}