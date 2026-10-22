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

// Allow the door animation and loading message to begin.
timeoutRef.current = setTimeout(() => {
  router.push("/preview/movies/library");
}, 2200);

}

return (
<>
<button
type="button"
onClick={enterLibrary}
disabled={opening}
aria-label="Enter JMI Movie Library"
aria-busy={opening}
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

  {/* CSS-ONLY ANCIENT LIBRARY DOOR TRANSITION */}
  {opening && (
    <div
      role="status"
      aria-label="Please wait. Taking you to the JMI Library."
      className="jmi-ancient-entry fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#030201]"
    >
      {/* Darkness surrounding the entrance */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#24170c_0%,#0b0704_44%,#000_100%)]" />

      {/* Warm light beyond the entrance */}
      <div className="jmi-library-light absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a87939]/10 blur-3xl" />

      {/* ANCIENT ARCHED DOOR FRAME */}
      <div className="jmi-door-stage relative z-10 h-[min(76dvh,600px)] w-[min(82vw,370px)] min-h-[300px]">
        {/* Outer stone and timber frame */}
        <div
          aria-hidden="true"
          className="absolute -inset-x-3 -inset-y-2 border-x-[7px] border-t-[9px] border-[#51351d] bg-gradient-to-r from-[#160d07] via-[#80603a] to-[#241408] shadow-[0_0_35px_rgba(0,0,0,0.9)]"
          style={{
            borderTopLeftRadius: "48% 14%",
            borderTopRightRadius: "48% 14%",
          }}
        />

        {/* ANCIENT LIBRARY INTERIOR WITH WOODEN STAIRS */}
<div className="jmi-library-beyond absolute inset-0 overflow-hidden bg-[#080503]">

  {/* Deep interior darkness */}
  {/* Almost completely black interior */}
<div className="absolute inset-0 bg-black" />

  

  {/* Ancient wooden side walls */}
  <div
    aria-hidden="true"
    className="absolute inset-y-0 left-0 w-[24%] border-r border-[#704a28]/40"
    style={{
      backgroundImage: `
        repeating-linear-gradient(
          90deg,
          #1c1008 0px,
          #3a2514 7px,
          #241509 11px,
          #100a05 17px
        )
      `,
      boxShadow: "inset -8px 0 16px rgba(0,0,0,0.9)",
    }}
  />

  <div
    aria-hidden="true"
    className="absolute inset-y-0 right-0 w-[24%] border-l border-[#704a28]/40"
    style={{
      backgroundImage: `
        repeating-linear-gradient(
          90deg,
          #100a05 0px,
          #241509 7px,
          #3a2514 12px,
          #1c1008 18px
        )
      `,
      boxShadow: "inset 8px 0 16px rgba(0,0,0,0.9)",
    }}
  />

  {/* Staircase silhouette */}
  <div
    aria-hidden="true"
    className="absolute inset-x-[17%] bottom-[8%] top-[12%]"
    style={{
      background:
        "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.65))",
      clipPath:
        "polygon(28% 0, 72% 0, 100% 100%, 0 100%)",
    }}
  />

  {/* Individual ascending wooden steps */}
  <div className="absolute inset-x-[17%] bottom-[8%] top-[12%]">
    {Array.from({ length: 8 }, (_, index) => {
      const stepWidth = 34 + index * 8;
      const stepTop = 8 + index * 11;

      return (
        <div
          key={index}
          className="absolute left-1/2 h-[12%] -translate-x-1/2 border-t border-[#c09154]/50"
          style={{
            top: `${stepTop}%`,
            width: `${stepWidth}%`,
           backgroundImage: `
  linear-gradient(
    180deg,
    rgba(135,91,48,0.42),
    rgba(67,42,23,0.98) 18%,
    #24160c 72%,
    #090604
  )
`,
            boxShadow:
              "0 3px 0 #160c06, 0 5px 8px rgba(0,0,0,0.55)",
          }}
        >
          {/* Worn front edge of each step */}
          <div
            className="absolute inset-x-0 top-0 h-[2px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(231,190,128,0.65), transparent)",
            }}
          />

          {/* Subtle aged wood grain */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(2deg, transparent 0px, transparent 7px, rgba(220,170,105,0.14) 8px, transparent 10px)",
            }}
          />
        </div>
      );
    })}
  </div>

  {/* Old wooden handrails */}
  <div
    aria-hidden="true"
    className="absolute left-[19%] top-[22%] h-[48%] w-[5px] origin-bottom -rotate-[17deg] rounded-full"
    style={{
      background:
        "linear-gradient(90deg, #241308, #9a6937 45%, #3a2110)",
      boxShadow: "2px 2px 5px rgba(0,0,0,0.65)",
    }}
  />

  <div
    aria-hidden="true"
    className="absolute right-[19%] top-[22%] h-[48%] w-[5px] origin-bottom rotate-[17deg] rounded-full"
    style={{
      background:
        "linear-gradient(90deg, #241308, #9a6937 45%, #3a2110)",
      boxShadow: "-2px 2px 5px rgba(0,0,0,0.65)",
    }}
  />

  {/* Warm illumination across the staircase */}
  {/* Extremely subtle light on the old wooden steps */}
<div
  aria-hidden="true"
  className="pointer-events-none absolute inset-0"
  style={{
    background:
      "radial-gradient(ellipse at 50% 35%, rgba(126,83,39,0.10), transparent 38%), linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.72))",
  }}
/>

  {/* Dark foreground creates depth beyond the doorway */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-t from-[#030201] to-transparent"
  />
</div>

        {/* ANCIENT ARCHED TIMBER DOOR */}
        <div
          className="jmi-css-door absolute inset-x-1 bottom-1 top-1 z-10 overflow-hidden border-x-[5px] border-b-[5px] border-[#261409] bg-[#422713] shadow-[8px_5px_22px_rgba(0,0,0,0.8)]"
          style={{
            borderTopLeftRadius: "48% 13%",
            borderTopRightRadius: "48% 13%",
          }}
        >
          {/* Outer antique wooden frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              borderTopLeftRadius: "48% 13%",
              borderTopRightRadius: "48% 13%",
              boxShadow:
                "inset 0 0 0 3px #6d4929, inset 0 0 0 6px #291609, inset 0 0 0 8px rgba(180,130,72,0.35)",
            }}
          />

          {/* Shadow beneath the arched top */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[22%]"
            style={{
              borderRadius: "50% 50% 0 0 / 32% 32% 0 0",
              background:
                "linear-gradient(180deg, rgba(12,6,2,0.8), rgba(28,14,5,0.2), transparent)",
            }}
          />

          {/* Individual aged timber planks */}
          <div className="absolute inset-x-[3%] inset-y-[2%] flex overflow-hidden">
            {[
              { width: "13%", color: "#422216" },
              { width: "15%", color: "#704326" },
              { width: "14%", color: "#59331b" },
              { width: "16%", color: "#8a552f" },
              { width: "14%", color: "#694022" },
              { width: "15%", color: "#7a4928" },
              { width: "13%", color: "#492719" },
            ].map((plank, index) => (
              <div
                key={index}
                className="relative h-full shrink-0 border-r-[2px] border-[#1b1008]/90"
                style={{
                  width: plank.width,
                  backgroundColor: plank.color,
                  backgroundImage: `
                    repeating-linear-gradient(
                      ${index % 2 === 0 ? "2deg" : "-2deg"},
                      transparent 0px,
                      rgba(0,0,0,0.12) 7px,
                      transparent 9px,
                      rgba(218,171,105,0.12) 15px,
                      transparent 22px,
                      rgba(0,0,0,0.16) 31px
                    ),
                    linear-gradient(
                      90deg,
                      rgba(0,0,0,0.42),
                      rgba(210,153,84,0.10) 24%,
                      rgba(255,203,133,0.05) 48%,
                      rgba(0,0,0,0.3)
                    )
                  `,
                  boxShadow:
                    "inset 2px 0 3px rgba(0,0,0,0.35), inset -2px 0 2px rgba(0,0,0,0.3)",
                }}
              >
                {/* Irregular timber crack */}
                {index % 2 === 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-[45%] top-[28%] h-[23%] w-px bg-[#170c05]/75"
                    style={{
                      clipPath:
                        "polygon(35% 0, 100% 8%, 25% 24%, 70% 39%, 0 56%, 65% 75%, 20% 100%, 0 100%, 40% 75%, 0 57%, 45% 39%, 0 24%, 50% 8%)",
                      boxShadow: "1px 0 1px rgba(205,153,91,0.25)",
                    }}
                  />
                )}

                {/* Subtle old wood knots */}
                {(index === 1 || index === 5) && (
                  <div
                    aria-hidden="true"
                    className="absolute left-[25%] top-[55%] h-5 w-3 rounded-[50%] border border-[#241307]/60 opacity-40"
                    style={{
                      boxShadow:
                        "inset 0 0 0 2px rgba(24,12,4,0.35)",
                    }}
                  />
                )}

                {/* Antique iron nail heads */}
                {[12, 88].map((position) => (
                  <div
                    key={position}
                    className="absolute z-10 h-[7px] w-[7px] rounded-full border border-[#b18a56]/50 bg-gradient-to-br from-[#c3a16b] via-[#51402b] to-[#17120c] shadow-[1px_2px_2px_rgba(0,0,0,0.8)] sm:h-[9px] sm:w-[9px]"
                    style={{
                      left: "50%",
                      top: `${position}%`,
                      transform: "translateX(-50%)",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Heavy horizontal iron braces */}
          {[24, 76].map((position) => (
            <div
              key={position}
              className="absolute left-[4%] right-[4%] z-10 h-[13px] border-y border-[#c1a078]/50"
              style={{
                top: `${position}%`,
                background:
                  "linear-gradient(180deg, #30271c, #817052 22%, #403426 48%, #21180e 78%, #9a7b4e)",
                boxShadow: "0 3px 5px rgba(0,0,0,0.6)",
              }}
            >
              {[8, 30, 50, 70, 92].map((position) => (
                <span
                  key={position}
                  className="absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full border border-[#b38c54]/70 bg-[#2b2115] shadow-[inset_0_1px_1px_rgba(255,225,164,0.45)] sm:h-[7px] sm:w-[7px]"
                  style={{ left: `${position}%` }}
                />
              ))}
            </div>
          ))}

          {/* Central antique ring handle */}
          <div className="absolute left-1/2 top-[39%] z-20 -translate-x-1/2 -translate-y-1/2">
            {/* Brass backplate */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#3a2512] bg-gradient-to-br from-[#d0a35c] via-[#785021] to-[#241609] shadow-[0_3px_8px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,224,158,0.55)] sm:h-14 sm:w-14">
              <div className="absolute inset-[5px] rounded-full border border-[#e1bd78]/60" />

              {/* Hanging ring */}
              <div className="absolute top-[70%] h-7 w-5 rounded-[50%] border-[3px] border-[#d0a052] bg-transparent shadow-[0_2px_4px_rgba(0,0,0,0.8),inset_0_0_2px_rgba(0,0,0,0.7)] sm:h-9 sm:w-6" />

              {/* Handle pivot */}
              <div className="absolute top-[62%] h-2.5 w-2.5 rounded-full border border-[#f2cf8c]/70 bg-gradient-to-br from-[#f0ce85] to-[#624019]" />
            </div>
          </div>

          {/* Antique hinge plates */}
          {[18, 66].map((position) => (
            <div
              key={position}
              className="absolute left-[2%] z-20 h-[13%] w-[7px] border border-[#a58a5c]/50 bg-gradient-to-r from-[#211a11] via-[#82704e] to-[#302314] shadow-[2px_2px_4px_rgba(0,0,0,0.7)]"
              style={{ top: `${position}%` }}
            >
              <div className="absolute left-1/2 top-[15%] h-1 w-1 -translate-x-1/2 rounded-full bg-[#d0b17a]" />
              <div className="absolute bottom-[15%] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#d0b17a]" />
            </div>
          ))}

          {/* Weathered edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-2 bg-gradient-to-r from-[#170c05] via-[#9b6939]/40 to-transparent" />

          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-2 bg-gradient-to-l from-[#170c05] via-[#a16f3e]/35 to-transparent" />

          {/* Warm highlights */}
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-[#e1b477]/10 via-transparent to-black/35" />
        </div>

        {/* Doorstep */}
        <div className="absolute -bottom-3 -left-[5%] -right-[5%] h-3 border border-[#694625]/60 bg-gradient-to-b from-[#715031] to-[#1a1008] shadow-[0_6px_12px_rgba(0,0,0,0.6)]" />
      </div>

      {/* CENTRED LOADING MESSAGE */}
      <div className="jmi-library-loading pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-5 text-center">
        <div className="rounded-md border border-[#9b7547]/30 bg-[#100a05]/75 px-6 py-5 shadow-[0_5px_25px_rgba(0,0,0,0.45)] backdrop-blur-[2px]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e0c18d] sm:text-sm">
            Please Wait
          </p>

          <p className="mt-2 text-[10px] tracking-[0.12em] text-[#d0b18a] sm:text-xs">
            Taking you to the JMI Library...
          </p>

          <div className="mx-auto mt-4 flex items-center justify-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[#d0ad75] animate-pulse" />
            <span className="h-1 w-1 rounded-full bg-[#d0ad75] animate-pulse [animation-delay:200ms]" />
            <span className="h-1 w-1 rounded-full bg-[#d0ad75] animate-pulse [animation-delay:400ms]" />
          </div>
        </div>
      </div>

      {/* Transition-local, lightweight CSS animation */}
      <style>{`
        .jmi-door-stage {
          perspective: 1200px;
          perspective-origin: 50% 50%;
        }

        .jmi-css-door {
          transform-origin: left center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          animation: jmi-css-vintage-door-open 1900ms cubic-bezier(0.45, 0, 0.2, 1) forwards;
          will-change: transform;
        }

        .jmi-library-beyond {
          animation: jmi-library-reveal 1900ms ease-out both;
        }

        .jmi-library-light {
          animation: jmi-library-glow 1900ms ease-out both;
        }

        .jmi-library-loading {
          animation: jmi-library-message 450ms ease-out 1900ms both;
        }

        @keyframes jmi-css-vintage-door-open {
          0% {
            transform: rotateY(0deg);
            filter: brightness(0.78);
          }

          25% {
            transform: rotateY(-8deg);
            filter: brightness(0.84);
          }

          55% {
            transform: rotateY(-38deg);
            filter: brightness(0.92);
          }

          100% {
            transform: rotateY(-105deg);
            filter: brightness(1);
          }
        }

        @keyframes jmi-library-reveal {
          0%, 20% {
            opacity: 0.1;
          }

          100% {
            opacity: 1;
          }
        }

        @keyframes jmi-library-glow {
          0% {
            opacity: 0.2;
          }

          100% {
            opacity: 1;
          }
        }

        @keyframes jmi-library-message {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-css-door,
          .jmi-library-beyond,
          .jmi-library-light,
          .jmi-library-loading {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  )}
</>

);
}