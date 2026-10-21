"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [showLight, setShowLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigationStarted = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Coordinate the book opening, brief white flash, and navigation.
  useEffect(() => {
    if (!isOpening) return;

    const openingTimer = window.setTimeout(() => {
      setShowLight(true);
    }, 2550);

    const navigationTimer = window.setTimeout(() => {
      if (navigationStarted.current) return;

      navigationStarted.current = true;
      router.push(destination);
    }, 2850);

    return () => {
      window.clearTimeout(openingTimer);
      window.clearTimeout(navigationTimer);
    };
  }, [isOpening, destination, router]);

  return (
    <>
      {/* Clickable language book */}
      <button
        type="button"
        aria-label={`Open ${languageName} movie library`}
        aria-busy={isOpening}
        onClick={() => {
          if (isOpening) return;

          navigationStarted.current = false;
          setShowLight(false);
          setIsOpening(true);
        }}
        className="relative block w-full appearance-none border-0 bg-transparent p-0 text-left"
      >
        {children}
      </button>

      {/* Full-screen cinematic transition */}
      {mounted &&
        isOpening &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
            aria-live="polite"
            aria-label={`Opening the ${languageName} movie library`}
          >
            {/* Darken and blur the library in the background */}
            <div
              className="absolute inset-0 bg-[#080503]/80"
              style={{
                animation:
                  "jmi-library-background 900ms ease-in-out both",
              }}
            />

            {/* Cinematic vignette */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.25) 48%, rgba(0,0,0,0.78) 100%)",
                animation:
                  "jmi-library-vignette 1200ms ease-out both",
              }}
            />

            {/* Selected book moves slowly into focus */}
            <div
              className="relative z-10 w-[min(72vw,300px)]"
              style={{
                perspective: "1800px",
                filter:
                  "drop-shadow(0 25px 45px rgba(0,0,0,0.65))",
                animation:
                  "jmi-book-lift 2800ms cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              {/* Keep the book's pages and cover in a shared 3D space */}
              <div
                className="relative aspect-[3/4] w-full"
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* =========================================
                    BOOK BLOCK — VISIBLE INNER PAGES
                ========================================= */}

                <div
                  className="absolute inset-y-[2px] left-[5px] right-[2px] overflow-hidden rounded-r-[3px] border-y border-r border-[#b9a17b] bg-[#e8d8b7]"
                  style={{
                    transform: "translateZ(-3px)",
                    boxShadow:
                      "inset -5px 0 9px rgba(72,43,19,0.2), 4px 5px 10px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Cream-coloured page surface */}
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

                  {/* Individual page edges along the fore edge */}
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div
                      key={index}
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

                  {/* Page block inner shadow */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-[#806341]/40 to-transparent" />

                  {/* Subtle page curvature */}
                  <div
                    className="pointer-events-none absolute inset-y-0 right-0 w-5"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(109,72,34,0.15))",
                    }}
                  />
                </div>

                {/* =========================================
                    INNER PAGES — OPEN BOOK SPREAD
                ========================================= */}

                <div
                  className="absolute inset-y-[4px] left-[4px] right-[5px] overflow-hidden rounded-r-sm border border-[#b9a17b]/80 bg-[#f0e3c7]"
                  style={{
                    transform: "translateZ(-1px)",
                    boxShadow:
                      "inset 0 0 18px rgba(95,63,29,0.12)",
                  }}
                >
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
                    {/* Printed lines on the left page */}
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

                {/* =========================================
                    FRONT COVER — ROTATES OPEN
                ========================================= */}

                <div
                  className="absolute inset-0 z-10 overflow-hidden rounded-r-md border border-[#b58a55]/70 bg-gradient-to-br from-[#684629] via-[#352115] to-[#130b06] shadow-[8px_12px_30px_rgba(0,0,0,0.55)]"
                  style={{
                    transformOrigin: "left center",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "visible",
                    animation:
                      "jmi-book-open 2800ms cubic-bezier(0.45,0,0.2,1) both",
                  }}
                >
                  {/* Weathered leather grain */}
                  <div
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

                  {/* Book spine */}
                  <div className="absolute inset-y-0 left-0 z-10 w-3 border-r border-black/40 bg-gradient-to-r from-[#170d06] via-[#9a7042]/60 to-[#24150b] shadow-[3px_0_8px_rgba(0,0,0,0.35)]" />

                  {/* Embossed title panel */}
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

                  {/* Gold page-edge highlight */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[3px] bg-gradient-to-l from-[#c6a16c]/70 to-transparent" />
                </div>
              </div>

              {/* Moving ground shadow */}
              <div
                className="pointer-events-none absolute -bottom-5 left-[12%] right-[12%] h-5 rounded-[50%] bg-black/50 blur-lg"
                style={{
                  animation:
                    "jmi-book-shadow 2800ms ease-in-out both",
                }}
              />
            </div>

            {/* Brief, full-screen white flash */}
            <div
              className={`pointer-events-none absolute inset-0 z-20 ${
                showLight
                  ? "jmi-library-white-flash"
                  : "opacity-0"
              }`}
              style={{
                background: "#ffffff",
              }}
            />
          </div>,
          document.body
        )}

      {/* Cinematic animation definitions */}
      <style jsx global>{`
        @keyframes jmi-library-background {
          0% {
            opacity: 0;
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
          }

          100% {
            opacity: 1;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
          }
        }

        @keyframes jmi-library-vignette {
          0% {
            opacity: 0;
          }

          100% {
            opacity: 1;
          }
        }

        /* Slow, cinematic movement toward the viewer */
        @keyframes jmi-book-lift {
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

        /* Cover opens to reveal the pages underneath */
        @keyframes jmi-book-open {
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

        @keyframes jmi-book-shadow {
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

        /* A quick white flash rather than a lingering glow */
        .jmi-library-white-flash {
          animation: jmi-library-flash 70ms ease-out forwards;
        }

        @keyframes jmi-library-flash {
          0% {
            opacity: 0;
          }

          35% {
            opacity: 1;
          }

          100% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes jmi-library-background {
            from,
            to {
              opacity: 1;
              backdrop-filter: none;
              -webkit-backdrop-filter: none;
            }
          }

          @keyframes jmi-library-vignette {
            from,
            to {
              opacity: 1;
            }
          }

          @keyframes jmi-book-lift {
            from,
            to {
              opacity: 1;
              transform: none;
            }
          }

          @keyframes jmi-book-open {
            from,
            to {
              transform: none;
            }
          }

          @keyframes jmi-book-shadow {
            from,
            to {
              opacity: 0.5;
              transform: none;
            }
          }

          .jmi-library-white-flash {
            animation-duration: 150ms;
          }
        }
      `}</style>
    </>
  );
}