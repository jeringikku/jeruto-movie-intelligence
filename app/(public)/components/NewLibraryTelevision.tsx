"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type LibraryTvImage = {
  id: number;
  image_url: string;
  image_alt: string | null;
  language: string | null;
  display_order: number;
  is_active: boolean;
};

type LibraryTelevisionProps = {
  languageName: string;
};

const NEWS_HEADLINES = [
  "JMI public launch on November 1st at 05.00 PM",
  "JMI — World's First 3D Virtual Movie Analytics Platform",
  "High chances of Rain, Stay Alert",
  "New Movies arrived at JMI Library",
  "Welcm to JMI library",
];

function VintageTvTuningEffect() {
  const [tuning, setTuning] = useState(false);

  useEffect(() => {
    let glitchTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function scheduleGlitch(delay: number) {
      nextTimer = setTimeout(() => {
        if (cancelled) return;

        setTuning(true);

        glitchTimer = setTimeout(() => {
          if (cancelled) return;

          setTuning(false);
          scheduleGlitch(5000 + Math.random() * 5000);
        }, 1600);
      }, delay);
    }

    // First interruption occurs after five seconds.
    scheduleGlitch(5000);

    return () => {
      cancelled = true;
      clearTimeout(glitchTimer);
      clearTimeout(nextTimer);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden={!tuning}
        className={`jmi-library-tuning ${
          tuning ? "is-tuning" : ""
        }`}
      >
        <div className="jmi-library-static" />
        <div className="jmi-library-interference" />

        <div className="jmi-library-tuning-message">
          <span className="block text-red-300">NO SIGNAL</span>
          <span className="mt-2 block text-emerald-100">
            RETUNING JMI BROADCAST...
          </span>
        </div>
      </div>

      <style jsx>{`
        .jmi-library-tuning {
          position: absolute;
          inset: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: inherit;
          background: #050706;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .jmi-library-tuning.is-tuning {
          visibility: visible;
          animation: jmi-library-tuning-cycle 1600ms steps(1, end) both;
        }

        .jmi-library-static {
          position: absolute;
          inset: -50%;
          opacity: 0;
          background-image:
            repeating-radial-gradient(
              circle at 20% 30%,
              rgba(255, 255, 255, 0.7) 0 1px,
              transparent 1px 4px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.12) 0 1px,
              transparent 1px 3px
            );
          background-size: 17px 13px, 100% 4px;
        }

        .is-tuning .jmi-library-static {
          opacity: 0.45;
          animation: jmi-library-static-jitter 120ms steps(2, end)
            infinite;
        }

        .jmi-library-interference {
          position: absolute;
          inset: 0;
          opacity: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0 12px,
            rgba(220, 255, 235, 0.8) 13px 15px,
            transparent 16px 27px
          );
        }

        .is-tuning .jmi-library-interference {
          opacity: 0.65;
          animation: jmi-library-interference-sweep 450ms linear infinite;
        }

        .jmi-library-tuning-message {
          position: relative;
          z-index: 2;
          padding: 12px;
          text-align: center;
          font-family: monospace;
          font-size: clamp(8px, 2vw, 11px);
          font-weight: 800;
          letter-spacing: 0.12em;
          text-shadow: 0 0 8px rgba(150, 255, 180, 0.6);
          opacity: 0;
        }

        .is-tuning .jmi-library-tuning-message {
          animation: jmi-library-message-flicker 1600ms steps(1, end)
            both;
        }

        @keyframes jmi-library-tuning-cycle {
          0%,
          100% {
            opacity: 0;
          }

          8%,
          18%,
          30%,
          46%,
          64%,
          80%,
          92% {
            opacity: 1;
          }

          12%,
          23%,
          37%,
          52%,
          72%,
          86% {
            opacity: 0.7;
          }
        }

        @keyframes jmi-library-static-jitter {
          0% {
            transform: translate(1%, -1%);
          }

          50% {
            transform: translate(-2%, 1%);
          }

          100% {
            transform: translate(2%, 2%);
          }
        }

        @keyframes jmi-library-interference-sweep {
          from {
            transform: translateY(-35%);
          }

          to {
            transform: translateY(35%);
          }
        }

        @keyframes jmi-library-message-flicker {
          0%,
          100% {
            opacity: 0;
          }

          15%,
          35%,
          55%,
          75% {
            opacity: 1;
          }

          25%,
          45%,
          65%,
          85% {
            opacity: 0.35;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-library-tuning.is-tuning,
          .jmi-library-static,
          .jmi-library-interference,
          .jmi-library-tuning-message {
            animation: none;
          }

          .jmi-library-tuning.is-tuning {
            visibility: visible;
            opacity: 1;
          }

          .jmi-library-static {
            opacity: 0.35;
          }

          .jmi-library-interference {
            opacity: 0.5;
          }

          .jmi-library-tuning-message {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export default function LibraryTelevision({
  languageName,
}: LibraryTelevisionProps) {
  const [images, setImages] = useState<LibraryTvImage[]>([]);
  const [imageIndex, setImageIndex] = useState(0);

  const [isOn, setIsOn] = useState(true);
  const [channel, setChannel] = useState<1 | 2>(1);

  const [imagesLoading, setImagesLoading] = useState(true);
  const [imagesError, setImagesError] = useState(false);

  // Load only active images assigned to the current library language.
  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      const requestedLanguage = languageName.trim();

      setImages([]);
      setImageIndex(0);
      setImagesLoading(true);
      setImagesError(false);

      console.log("[JMI TV] Requested language:", requestedLanguage);

      const { data, error } = await supabase
        .from("jmi_library_tv_images")
        .select(
          "id, image_url, image_alt, language, display_order, is_active"
        )
        .eq("is_active", true)
        .eq("language", requestedLanguage)
        .order("display_order", { ascending: true })
        .order("id", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("[JMI TV] Supabase error:", error);
        setImages([]);
        setImagesError(true);
      } else {
        const languageImages = (data ?? []).filter(
          (image) =>
            typeof image.language === "string" &&
            image.language.trim().toLowerCase() ===
              requestedLanguage.toLowerCase()
        );

        console.log("[JMI TV] Rows returned by Supabase:", data);
        console.log("[JMI TV] Rows after language verification:", languageImages);

        setImages(languageImages as LibraryTvImage[]);
      }

      setImagesLoading(false);
    }

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [languageName]);

  // Reset the slideshow position when the library language changes.
  useEffect(() => {
    setImageIndex(0);
  }, [languageName]);

  // Automatically rotate through the current language's active images.
  useEffect(() => {
    if (!isOn || channel !== 1 || images.length < 2) {
      return;
    }

    const slideshow = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % images.length);
    }, 6000);

    return () => window.clearInterval(slideshow);
  }, [isOn, channel, images.length]);

  useEffect(() => {
    if (imageIndex >= images.length) {
      setImageIndex(0);
    }
  }, [images.length, imageIndex]);

  function togglePower() {
    setIsOn((current) => !current);
  }

  function changeChannel() {
    setChannel((current) => (current === 1 ? 2 : 1));
  }

  const currentImage = images[imageIndex] ?? null;

  return (
    <section
      aria-label={`JMI vintage television - ${languageName} library`}
      className="relative mx-auto my-8 w-full max-w-5xl px-3 sm:my-10 sm:px-5"
    >
      {/* Section heading */}
      <header className="mb-6 text-center sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-amber-500 sm:text-[10px]">
          JMI Vintage Library
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#f3dfbd] sm:text-3xl">
          The Library Television
        </h2>

        <p className="mx-auto mt-2 max-w-md text-[11px] leading-5 text-zinc-500 sm:mt-3 sm:text-sm sm:leading-6">
          Vintage television showing legendary actors from the{" "}
          {languageName} cinema collection and the latest JMI
          announcements. You can turn off the TV anytime using its remote.
        </p>
      </header>

      {/* TV and compact remote */}
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-4 sm:gap-6 md:grid-cols-[minmax(0,1fr)_150px] md:gap-7">
        {/* Vintage TV cabinet */}
        <div className="relative mx-auto w-full max-w-[500px] min-w-0">
          <div
            className="relative rounded-[23px] border-[5px] border-[#49301b] p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,220,170,0.22)] sm:rounded-[32px] sm:border-[7px] sm:p-4"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  3deg,
                  transparent 0px,
                  transparent 13px,
                  rgba(255,220,165,0.07) 14px,
                  rgba(20,10,4,0.12) 16px,
                  transparent 18px,
                  transparent 28px
                ),
                linear-gradient(
                  115deg,
                  #80542e 0%,
                  #613d22 22%,
                  #98673b 48%,
                  #5b381e 76%,
                  #8b5b30 100%
                )
              `,
            }}
          >
            {/* Cabinet details */}
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-amber-100/30 sm:inset-x-7" />

            <span className="pointer-events-none absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-[#c59a64] bg-[#49301b] sm:left-3 sm:top-3 sm:h-2 sm:w-2" />

            <span className="pointer-events-none absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-[#c59a64] bg-[#49301b] sm:right-3 sm:top-3 sm:h-2 sm:w-2" />

            {/* Inner bezel */}
            <div className="rounded-[20px] border-[4px] border-[#291b10] bg-[#17100b] p-1.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.85)] sm:rounded-[24px] sm:border-[6px] sm:p-2.5">
              {/* CRT screen */}
              <div
                className={`relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[#4c4130] bg-[#050807] shadow-[inset_0_0_25px_rgba(0,0,0,0.9)] sm:rounded-[34px] ${
                  isOn ? "jmi-library-crt-on" : ""
                }`}
              >
                {/* Screen content */}
                {!isOn ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030403]">
                    <div className="h-1 w-8 rounded-full bg-[#152019]" />
                    <p className="mt-3 text-[8px] uppercase tracking-[0.3em] text-zinc-700">
                      Television Off
                    </p>
                  </div>
                ) : channel === 1 ? (
                  /* Channel 1: Language-specific library pictures */
                  <div className="absolute inset-0">
                    {currentImage ? (
                      <img
                        key={currentImage.id}
                        src={currentImage.image_url}
                        alt={
                          currentImage.image_alt ||
                          `${languageName} Movie Library television image`
                        }
                        className="jmi-library-image absolute inset-0 h-full w-full object-contain"
                        onError={(event) => {
                          event.currentTarget.style.opacity = "0";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#131a16] via-[#080c09] to-black px-3 text-center">
                        <span className="text-2xl sm:text-3xl">📺</span>

                        <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#e4c18a] sm:text-xs">
                          {languageName} Cinema
                        </p>

                        <p className="mt-2 max-w-xs text-[8px] leading-4 text-zinc-500 sm:text-[11px] sm:leading-5">
                          {imagesLoading
                            ? "Tuning into the library..."
                            : imagesError
                              ? "Unable to load library images."
                              : `No active ${languageName} TV images are available yet.`}
                        </p>

                        {!imagesLoading &&
                          !imagesError &&
                          images.length === 0 && (
                            <p className="mt-2 text-[7px] text-zinc-600 sm:text-[8px]">
                              Assign active images to {languageName} in
                              the JMI Admin Panel.
                            </p>
                          )}
                      </div>
                    )}

                    <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/65 px-2 py-1 sm:left-4 sm:top-4 sm:gap-2 sm:px-2.5 sm:py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(74,222,128,0.8)]" />

                      <span className="text-[7px] font-medium uppercase tracking-[0.12em] text-white/85 sm:text-[9px] sm:tracking-[0.17em]">
                        CH 1 · {languageName}
                      </span>
                    </div>

                   
                    
                  </div>
                ) : (
                  /* Channel 2: Scrolling JMI news - unchanged */
                  <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#101b16] via-[#07100c] to-[#030504]">
                    <div className="pointer-events-none absolute -left-10 -top-16 h-32 w-32 rounded-full bg-emerald-400/[0.08] blur-3xl sm:h-48 sm:w-48" />

                    <div className="pointer-events-none absolute -bottom-16 right-0 h-32 w-32 rounded-full bg-amber-400/[0.06] blur-3xl sm:h-48 sm:w-48" />

                    <div className="relative flex h-full min-h-0 flex-col">
                      {/* Broadcast header */}
                      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-emerald-300/15 px-2.5 py-2 sm:px-5 sm:py-3">
                        <div>
                          <p className="text-[6px] font-semibold uppercase tracking-[0.2em] text-emerald-300 sm:text-[9px] sm:tracking-[0.3em]">
                            JMI Broadcasting
                          </p>

                          <h3 className="mt-0.5 text-xs font-bold tracking-wide text-white sm:mt-1 sm:text-xl">
                            JMI NEWS
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 rounded-full border border-red-400/20 bg-red-500/10 px-1.5 py-1 sm:gap-1.5 sm:px-2">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />

                          <span className="text-[6px] font-bold uppercase tracking-[0.12em] text-red-300 sm:text-[9px] sm:tracking-[0.15em]">
                            Live
                          </span>
                        </div>
                      </div>

                      {/* Scrolling main headlines */}
                      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden py-2 sm:py-4">
                        <div className="mb-2 flex items-center gap-2 px-2.5 sm:mb-4 sm:px-5">
                          <span className="shrink-0 border border-emerald-300/25 bg-emerald-300/10 px-1.5 py-1 font-mono text-[6px] font-bold tracking-[0.1em] text-emerald-200 sm:px-2 sm:text-[8px] sm:tracking-[0.14em]">
                            HEADLINES
                          </span>

                          <span className="h-px flex-1 bg-emerald-300/20" />
                        </div>

                        <div className="overflow-hidden">
                          <div className="jmi-library-news-track flex w-max">
                            {[0, 1].map((copy) => (
                              <div
                                key={copy}
                                aria-hidden={copy === 1 ? true : undefined}
                                className="flex shrink-0 items-center"
                              >
                                {NEWS_HEADLINES.map((headline, index) => (
                                  <span
                                    key={`${copy}-${index}`}
                                    className="mx-3 flex items-center gap-2 whitespace-nowrap font-mono text-[8px] font-bold tracking-[0.05em] text-[#b4ffc2] sm:mx-6 sm:gap-3 sm:text-xs sm:tracking-[0.08em]"
                                  >
                                    <span className="text-amber-300">◆</span>
                                    {headline}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 px-2.5 sm:mt-5 sm:px-5">
                          <p className="font-mono text-[6px] leading-3 text-emerald-100/50 sm:text-[8px] sm:leading-4">
                            JERUTO MOVIE INTELLIGENCE
                            <span className="ml-1 text-amber-300/80 sm:ml-2">
                              • ENTERTAINMENT • CINEMA • ANALYTICS
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Scrolling news ticker */}
                      <div className="shrink-0 overflow-hidden border-t border-emerald-300/20 bg-black/60 py-1.5 sm:py-2.5">
                        <div className="jmi-library-ticker flex w-max items-center">
                          {[0, 1].map((copy) => (
                            <div
                              key={copy}
                              aria-hidden={copy === 1 ? true : undefined}
                              className="flex shrink-0 items-center"
                            >
                              {NEWS_HEADLINES.map((headline, index) => (
                                <span
                                  key={`${copy}-${index}`}
                                  className="mx-3 inline-flex items-center gap-2 whitespace-nowrap text-[7px] font-medium text-[#f0d59e] sm:mx-5 sm:gap-3 sm:text-[10px]"
                                >
                                  <span className="text-emerald-300">◆</span>
                                  {headline}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="absolute right-2 top-2 z-10 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[6px] font-medium uppercase tracking-[0.1em] text-white/80 sm:right-4 sm:top-4 sm:text-[9px] sm:tracking-[0.15em]">
                      CH 2 · News
                    </div>
                  </div>
                )}

                {/* CRT scanlines and glass reflection */}
                {isOn && (
                  <>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-20 opacity-[0.13]"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.7) 4px)",
                      }}
                    />

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-20"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 45%, transparent 48%, rgba(0,0,0,0.48) 100%)",
                      }}
                    />

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[22%] bg-gradient-to-b from-white/[0.06] to-transparent"
                    />
                  </>
                )}

                {/* Signal interruption belongs inside the CRT screen. */}
                {isOn && <VintageTvTuningEffect />}
              </div>
            </div>

            {/* Smaller cabinet control strip */}
            <div className="flex items-center justify-between gap-2 px-1.5 pb-0.5 pt-3 sm:px-3 sm:pt-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-[3px] rounded-md border border-black/20 bg-black/15 px-2 py-1.5 sm:gap-1 sm:px-3 sm:py-2">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-2.5 w-[2px] rounded-full bg-[#d0a06a]/50 sm:h-4 sm:w-[3px]"
                    />
                  ))}
                </div>

                <span className="hidden text-[8px] font-semibold uppercase tracking-[0.25em] text-[#edc38c]/80 sm:inline">
                  JMI
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="rounded-md border border-[#20170e] bg-[#080b08] px-2 py-1 font-mono text-[8px] text-emerald-300 shadow-inner sm:px-3 sm:py-1.5 sm:text-[11px]">
                  {isOn ? `CH-${channel}` : "OFF"}
                </div>

                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#442b18] bg-gradient-to-br from-[#d6b17d] via-[#80542e] to-[#3e2717] shadow-md sm:h-9 sm:w-9">
                  <span className="h-2.5 w-[2px] rounded-full bg-[#291a0f] sm:h-4" />
                </div>

                <div className="hidden h-9 w-9 items-center justify-center rounded-full border-2 border-[#442b18] bg-gradient-to-br from-[#d6b17d] via-[#80542e] to-[#3e2717] shadow-md sm:flex">
                  <span className="h-4 w-[2px] rounded-full bg-[#291a0f]" />
                </div>
              </div>
            </div>
          </div>

          {/* Television feet */}
          <div className="mx-auto flex w-[65%] justify-between px-2">
            <div className="h-3 w-7 -skew-x-12 rounded-b-md border-x-2 border-[#372316] bg-gradient-to-b from-[#674326] to-[#2a1b11] sm:h-5 sm:w-10" />

            <div className="h-3 w-7 skew-x-12 rounded-b-md border-x-2 border-[#372316] bg-gradient-to-b from-[#674326] to-[#2a1b11] sm:h-5 sm:w-10" />
          </div>
        </div>

        {/* Compact remote control */}
        <aside className="mx-auto w-full max-w-[95px] rounded-2xl border border-zinc-600 bg-gradient-to-br from-zinc-900 to-black p-3 shadow-[0_10px_25px_rgba(0,0,0,0.3)] sm:max-w-[230px] sm:p-4 md:max-w-none md:p-3">
          <div className="mb-3 flex items-center justify-between gap-2 md:mb-3">
            <div>
              <p className="text-[6px] font-semibold uppercase tracking-[0.2em] text-amber-400 sm:text-[9px]">
                Television Remote
              </p>

              <h3 className="mt-1 text-[6px] font-semibold text-zinc-100 sm:text-[12px]">
                Control Panel
              </h3>
            </div>

            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-black text-sm sm:h-8 sm:w-8">
              🎛️
            </div>
          </div>

          <button
            type="button"
            onClick={togglePower}
            aria-pressed={isOn}
            className={`flex min-h-9 w-15 items-center justify-center gap-2 rounded-4xl border px-3 py-2 text-[7px] font-semibold transition active:scale-[0.98] sm:min-h-9 sm:text-[7px] ${
              isOn
                ? "border-red-500/60 bg-red-500/60 text-zinc-300 hover:bg-red-500/15"
                : "border-emerald-500/30 bg-emerald-500/40 text-zinc-300 hover:bg-emerald-500/15"
            }`}
          >
            <span className="text-[8px]">🔘</span>
            {isOn ? "TURN OFF" : "TURN ON"}
          </button>

          <button
            type="button"
            onClick={changeChannel}
            disabled={!isOn}
            aria-label="Next television channel"
            className="mt-4 flex min-h-4 w-15 items-center justify-center gap-1 rounded-xl border border-zinc-700 bg-zinc-700 px-1 py-.5 text-[10px] text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-xs"
          >
            <span className="text-[16px]">⏭️</span>
          </button>

          <button
            type="button"
            onClick={changeChannel}
            disabled={!isOn}
            aria-label="Previous television channel"
            className="mt-2 flex min-h-4 w-15 items-center justify-center gap-1 rounded-xl border border-zinc-700 bg-zinc-700 px-1 py-.5 text-[10px] text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-xs"
          >
            <span className="text-[16px]">⏮️</span>
          </button>

          <div className="mt-3 rounded-lg border border-zinc-800 bg-black/50 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[8px] uppercase tracking-[0.12em] text-zinc-400">
                JMI TV
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer status */}
      <footer className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-zinc-800/70 pt-4 text-[8px] uppercase tracking-[0.12em] text-zinc-500 sm:mt-7 sm:gap-x-5 sm:pt-5 sm:text-[9px] sm:tracking-[0.15em]">
        <span className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOn ? "bg-emerald-400" : "bg-zinc-700"
            }`}
          />
          {isOn ? "Television Online" : "Television Standby"}
        </span>

        <span>2 Channels</span>
        <span>{images.length} Active {languageName} Broadcasts</span>
      </footer>

      {/* Component-scoped TV animations */}
      <style jsx>{`
        .jmi-library-crt-on {
          box-shadow:
            inset 0 0 25px rgba(0, 0, 0, 0.75),
            0 0 14px rgba(111, 178, 133, 0.08);
        }

        .jmi-library-image {
          animation: jmi-library-image-fade 800ms ease both;
        }

        .jmi-library-news-track,
        .jmi-library-ticker {
          width: max-content;
          animation: jmi-library-news-scroll 42s linear infinite;
          will-change: transform;
        }

        @keyframes jmi-library-image-fade {
          from {
            opacity: 0.45;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes jmi-library-news-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-library-image,
          .jmi-library-news-track,
          .jmi-library-ticker {
            animation: none;
          }

          .jmi-library-news-track,
          .jmi-library-ticker {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}