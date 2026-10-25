"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type LibraryTvImage = {
id: number;
image_url: string;
image_alt: string | null;
display_order: number;
is_active: boolean;
};

const NEWS_HEADLINES = [
"JMI public launch on November 1st at 05.00 PM",
"JMI — World's First 3D Virtual Movie Analytics Platform",
"High chances of Rain, Stay Alert",
"New Movies arrived at JMI Library",
"Welcm to JMI library",
];

function getLocalTime() {
return new Intl.DateTimeFormat("en-IN", {
hour: "2-digit",
minute: "2-digit",
second: "2-digit",
hour12: true,
}).format(new Date());
}

function getLocalDate() {
return new Intl.DateTimeFormat("en-IN", {
weekday: "short",
day: "2-digit",
month: "short",
year: "numeric",
}).format(new Date());
}

export default function LibraryTelevision() {
const [images, setImages] = useState<LibraryTvImage[]>([]);
const [imageIndex, setImageIndex] = useState(0);

const [isOn, setIsOn] = useState(true);
const [channel, setChannel] = useState<1 | 2>(1);

const [time, setTime] = useState("");
const [date, setDate] = useState("");

const [imagesLoading, setImagesLoading] = useState(true);
const [imagesError, setImagesError] = useState(false);

// ---------------------------------------------------------
// LIVE CLOCK
// ---------------------------------------------------------

useEffect(() => {
function updateClock() {
setTime(getLocalTime());
setDate(getLocalDate());
}

updateClock();

const timer = window.setInterval(updateClock, 1000);

return () => window.clearInterval(timer);

}, []);

// ---------------------------------------------------------
// LOAD ONLY THE IMAGES MANAGED THROUGH LIBRARY TV ADMIN
// ---------------------------------------------------------

useEffect(() => {
let cancelled = false;

async function loadImages() {
  setImagesLoading(true);
  setImagesError(false);

  const { data, error } = await supabase
    .from("jmi_library_tv_images")
    .select(
      "id, image_url, image_alt, display_order, is_active"
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (cancelled) return;

  if (error) {
    console.error("Library TV image loading error:", error);

    setImages([]);
    setImagesError(true);
  } else {
    setImages((data ?? []) as LibraryTvImage[]);
  }

  setImagesLoading(false);
}

void loadImages();

return () => {
  cancelled = true;
};

}, []);

// ---------------------------------------------------------
// AUTOMATIC IMAGE SLIDESHOW
// ---------------------------------------------------------

useEffect(() => {
if (!isOn || channel !== 1 || images.length < 2) {
return;
}

const slideshow = window.setInterval(() => {
  setImageIndex((current) => (current + 1) % images.length);
}, 6000);

return () => window.clearInterval(slideshow);

}, [isOn, channel, images.length]);

// Keep the selected index valid if the image list changes.
useEffect(() => {
if (imageIndex >= images.length) {
setImageIndex(0);
}
}, [images.length, imageIndex]);

// ---------------------------------------------------------
// REMOTE CONTROL
// ---------------------------------------------------------

function togglePower() {
setIsOn((current) => !current);
}

function nextChannel() {
setChannel((current) => (current === 1 ? 2 : 1));
}

function previousChannel() {
setChannel((current) => (current === 1 ? 2 : 1));
}

// ---------------------------------------------------------
// CURRENT IMAGE
// ---------------------------------------------------------

const currentImage = images[imageIndex] ?? null;

return (
<section
aria-label="JMI vintage television and clock"
className="relative mx-auto my-12 w-full max-w-6xl px-3 sm:px-6"
>
{/* =====================================================
SECTION HEADER
===================================================== */}

  <div className="mb-8 text-center">
    <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-amber-500 sm:text-[10px]">
      JMI Movie Library
    </p>

    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#f3dfbd] sm:text-3xl">
      The Library Television
    </h2>

    <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-zinc-500 sm:text-sm">
      Take a moment, explore the library, and stay tuned
      to the latest announcements from JMI.
    </p>
  </div>

  {/* =====================================================
      TV + CLOCK LAYOUT
  ===================================================== */}

  <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">

    {/* ===================================================
        VINTAGE WOODEN TELEVISION
    =================================================== */}

    <div className="relative mx-auto w-full max-w-3xl">

      {/* Wooden cabinet */}
      <div
        className="
          relative
          rounded-[28px]
          border-[5px]
          border-[#49301b]
          p-3
          shadow-[0_25px_65px_rgba(0,0,0,0.55),inset_0_2px_2px_rgba(255,220,170,0.22)]
          sm:rounded-[38px]
          sm:border-[8px]
          sm:p-5
        "
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
        {/* Cabinet top highlight */}
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-amber-100/30 sm:inset-x-8" />

        {/* Decorative screws */}
        <span className="pointer-events-none absolute left-2 top-2 h-2 w-2 rounded-full border border-[#c59a64] bg-[#49301b] shadow-inner sm:left-4 sm:top-4" />

        <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 rounded-full border border-[#c59a64] bg-[#49301b] shadow-inner sm:right-4 sm:top-4" />

        <span className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 rounded-full border border-[#c59a64] bg-[#49301b] shadow-inner sm:bottom-4 sm:left-4" />

        <span className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 rounded-full border border-[#c59a64] bg-[#49301b] shadow-inner sm:bottom-4 sm:right-4" />

        {/* Inner television bezel */}
        <div className="rounded-[22px] border-[5px] border-[#291b10] bg-[#17100b] p-2 shadow-[inset_0_4px_12px_rgba(0,0,0,0.85)] sm:rounded-[28px] sm:border-[7px] sm:p-3">

          {/* CRT screen */}
          <div
            className={`
              relative
              aspect-[4/3]
              overflow-hidden
              rounded-[30px]
              border
              border-[#4c4130]
              bg-[#050807]
              shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]
              sm:rounded-[42px]
              ${isOn ? "jmi-crt-on" : ""}
            `}
          >

            {/* SCREEN CONTENT */}
            {!isOn ? (

              /* POWER OFF */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030403]">
                <div className="h-1 w-10 rounded-full bg-[#152019] shadow-[0_0_8px_rgba(74,222,128,0.05)]" />

                <p className="mt-5 text-[8px] uppercase tracking-[0.35em] text-zinc-800">
                  Television Off
                </p>
              </div>

            ) : channel === 1 ? (

              /* =========================================
                 CHANNEL 1 — LIBRARY IMAGES
              ========================================= */

              <div className="absolute inset-0">

                {currentImage ? (
                  <img
                    key={currentImage.id}
                    src={currentImage.image_url}
                    alt={
                      currentImage.image_alt ||
                      "JMI Movie Library television image"
                    }
                    className="jmi-tv-image absolute inset-0 h-full w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0";
                    }}
                  />
                ) : (

                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#131a16] via-[#080c09] to-black px-4 text-center">

                    <span className="text-3xl">📺</span>

                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e4c18a] sm:text-xs">
                      JMI Movie Library
                    </p>

                    <p className="mt-2 max-w-xs text-[9px] leading-5 text-zinc-500 sm:text-[11px]">
                      {imagesLoading
                        ? "Tuning into the library..."
                        : imagesError
                          ? "Unable to load library images."
                          : "Library pictures will appear here."}
                    </p>

                    {!imagesLoading &&
                      !imagesError &&
                      images.length === 0 && (
                        <p className="mt-2 text-[8px] text-zinc-700">
                          Add active images through Library Television
                          in the JMI Admin Panel.
                        </p>
                      )}
                  </div>

                )}

                {/* Image channel indicator */}
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/65 px-2.5 py-1.5 backdrop-blur-sm sm:left-5 sm:top-5">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(74,222,128,0.8)]" />

                  <span className="text-[7px] font-medium uppercase tracking-[0.17em] text-white/85 sm:text-[9px]">
                    CH 1 · Library
                  </span>

                </div>

                {/* Slideshow counter */}
                {images.length > 0 && (
                  <div className="absolute bottom-3 right-3 rounded-md border border-white/10 bg-black/65 px-2 py-1 text-[8px] text-white/80 backdrop-blur-sm sm:bottom-5 sm:right-5 sm:text-[9px]">
                    {imageIndex + 1} / {images.length}
                  </div>
                )}

              </div>

            ) : (

              /* =========================================
                 CHANNEL 2 — JMI NEWS
              ========================================= */

              <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#101b16] via-[#07100c] to-[#030504]">

                {/* Subtle broadcast lighting */}
                <div className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-emerald-400/[0.08] blur-3xl" />

                <div className="pointer-events-none absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-amber-400/[0.06] blur-3xl" />

                <div className="relative flex h-full flex-col">

                  {/* Broadcast header */}
                  <div className="flex items-center justify-between border-b border-emerald-300/15 px-3 py-3 sm:px-6 sm:py-5">

                    <div>
                      <p className="text-[7px] font-semibold uppercase tracking-[0.3em] text-emerald-300 sm:text-[9px]">
                        JMI Broadcasting
                      </p>

                      <h3 className="mt-1 text-sm font-bold tracking-wide text-white sm:text-xl">
                        JMI NEWS
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-2 py-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />

                      <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-red-300 sm:text-[9px]">
                        Live
                      </span>
                    </div>

                  </div>

                  {/* News display */}
                  <div className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 py-4 sm:px-7 sm:py-6">

                    <p className="text-[7px] font-medium uppercase tracking-[0.25em] text-emerald-300/70 sm:text-[9px]">
                      Latest Announcements
                    </p>

                    <div className="mt-3 space-y-3 sm:mt-5 sm:space-y-4">

                      {NEWS_HEADLINES.map((headline, index) => (
                        <div
                          key={headline}
                          className="flex items-start gap-2 border-b border-white/[0.07] pb-2 last:border-b-0 sm:gap-3 sm:pb-3"
                        >

                          <span className="mt-0.5 shrink-0 font-mono text-[8px] text-emerald-300/70 sm:text-[10px]">
                            0{index + 1}
                          </span>

                          <p className="text-[9px] font-medium leading-4 text-[#f0f3e9] sm:text-[12px] sm:leading-5">
                            {headline}
                          </p>

                        </div>
                      ))}

                    </div>

                  </div>

                  {/* Scrolling ticker */}
                  <div className="relative overflow-hidden border-t border-emerald-300/20 bg-black/60 py-2 sm:py-3">

                    <div className="jmi-news-ticker flex w-max items-center gap-6 whitespace-nowrap">

                      {[...NEWS_HEADLINES, ...NEWS_HEADLINES].map(
                        (headline, index) => (
                          <span
                            key={`${index}-${headline}`}
                            className="inline-flex items-center gap-3 text-[8px] font-medium text-[#f0d59e] sm:text-[10px]"
                          >
                            <span className="text-emerald-300">◆</span>
                            {headline}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                </div>

                {/* News channel indicator */}
                <div className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-black/60 px-2.5 py-1.5 text-[7px] font-medium uppercase tracking-[0.15em] text-white/80 sm:right-5 sm:top-5 sm:text-[9px]">
                  CH 2 · News
                </div>

              </div>

            )}

            {/* =========================================
                CRT SCANLINES AND GLASS REFLECTION
            ========================================= */}

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

          </div>

        </div>

        {/* =================================================
            LOWER CABINET CONTROL STRIP
        ================================================= */}

        <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4 sm:px-4 sm:pt-5">

          <div className="flex items-center gap-2">

            {/* Speaker grille */}
            <div className="flex items-center gap-[3px] rounded-lg border border-black/20 bg-black/15 px-2 py-2 sm:px-3">

              {Array.from({ length: 7 }).map((_, index) => (
                <span
                  key={index}
                  className="h-3 w-[2px] rounded-full bg-[#d0a06a]/50 sm:h-4 sm:w-[3px]"
                />
              ))}

            </div>

            <span className="hidden text-[8px] font-semibold uppercase tracking-[0.25em] text-[#edc38c]/80 sm:inline">
              JMI
            </span>

          </div>

          <div className="flex items-center gap-2">

            {/* Channel display */}
            <div className="rounded-md border border-[#20170e] bg-[#080b08] px-2.5 py-1.5 font-mono text-[9px] text-emerald-300 shadow-inner sm:px-3 sm:text-[11px]">
              {isOn ? `CH-${channel}` : "OFF"}
            </div>

            {/* Decorative knobs */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#442b18] bg-gradient-to-br from-[#d6b17d] via-[#80542e] to-[#3e2717] shadow-md sm:h-9 sm:w-9">
              <span className="h-3 w-[2px] rounded-full bg-[#291a0f] sm:h-4" />
            </div>

            <div className="hidden h-9 w-9 items-center justify-center rounded-full border-2 border-[#442b18] bg-gradient-to-br from-[#d6b17d] via-[#80542e] to-[#3e2717] shadow-md sm:flex">
              <span className="h-4 w-[2px] rounded-full bg-[#291a0f]" />
            </div>

          </div>

        </div>

      </div>

      {/* Television feet */}
      <div className="mx-auto flex w-[65%] justify-between px-2">

        <div className="h-4 w-8 -skew-x-12 rounded-b-md border-x-2 border-[#372316] bg-gradient-to-b from-[#674326] to-[#2a1b11] sm:h-6 sm:w-12" />

        <div className="h-4 w-8 skew-x-12 rounded-b-md border-x-2 border-[#372316] bg-gradient-to-b from-[#674326] to-[#2a1b11] sm:h-6 sm:w-12" />

      </div>

    </div>

    {/* ===================================================
        CLOCK + REMOTE CONTROL
    =================================================== */}

    <aside className="mx-auto flex w-full max-w-sm flex-col gap-5 lg:max-w-none">

      {/* LIVE CLOCK */}
      <div className="rounded-2xl border border-[#6b4b2c]/60 bg-gradient-to-br from-[#21170e] via-[#100c08] to-black p-5 shadow-[0_15px_35px_rgba(0,0,0,0.35)] sm:p-6">

        <div className="flex items-center justify-between">

          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-400">
            Library Clock
          </p>

          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />

        </div>

        <p
          className="mt-4 whitespace-nowrap font-mono text-3xl font-semibold tracking-tight text-[#f5d7a3] sm:text-4xl"
          aria-label={`Current time ${time}`}
        >
          {time || "--:--:--"}
        </p>

        <p className="mt-2 text-xs text-zinc-400">
          {date || "Loading date..."}
        </p>

        <div className="mt-5 h-px bg-gradient-to-r from-amber-500/50 via-amber-500/10 to-transparent" />

        <p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-zinc-600">
          JMI · Cinema Time
        </p>

      </div>

      {/* REMOTE CONTROL */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] sm:p-6">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-400">
              Television Remote
            </p>

            <h3 className="mt-2 text-sm font-semibold text-zinc-100">
              Control Panel
            </h3>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-black text-lg">
            🎛️
          </div>

        </div>

        {/* POWER BUTTON */}
        <button
          type="button"
          onClick={togglePower}
          aria-pressed={isOn}
          className={`
            flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold transition duration-200 active:scale-[0.98]
            ${
              isOn
                ? "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
            }
          `}
        >
          <span className="text-base">
            ⏻
          </span>

          {isOn ? "TURN OFF" : "TURN ON"}
        </button>

        {/* CHANNEL BUTTONS */}
        <div className="mt-3 grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={nextChannel}
            disabled={!isOn}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-300 transition hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span className="text-lg leading-none">＋</span>

            <span className="text-[9px] font-semibold uppercase tracking-[0.12em]">
              Channel +
            </span>
          </button>

          <button
            type="button"
            onClick={previousChannel}
            disabled={!isOn}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-300 transition hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span className="text-lg leading-none">−</span>

            <span className="text-[9px] font-semibold uppercase tracking-[0.12em]">
              Channel −
            </span>
          </button>

        </div>

        {/* CURRENT CHANNEL */}
        <div className="mt-5 rounded-xl border border-zinc-800 bg-black/50 p-3">

          <div className="flex items-center justify-between gap-3">

            <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-500">
              Current Channel
            </span>

            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[9px] font-semibold text-zinc-300">
              {isOn
                ? channel === 1
                  ? "CH 1"
                  : "CH 2"
                : "POWER OFF"}
            </span>

          </div>

          <p className="mt-2 text-xs font-medium text-amber-200">
            {!isOn
              ? "Television is off"
              : channel === 1
                ? "JMI Library Pictures"
                : "JMI Scrolling News"}
          </p>

          <p className="mt-2 text-[10px] leading-5 text-zinc-600">
            {!isOn
              ? "Press the power button to resume."
              : channel === 1
                ? "Automatically displays active images configured in the admin panel."
                : "Stay tuned to JMI announcements and library updates."}
          </p>

        </div>

      </div>

    </aside>

  </div>

  {/* =====================================================
      FOOTER STATUS
  ===================================================== */}

  <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-zinc-800/70 pt-5 text-[9px] uppercase tracking-[0.15em] text-zinc-600">

    <span className="flex items-center gap-2">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOn ? "bg-emerald-400" : "bg-zinc-700"
        }`}
      />

      {isOn ? "Television Online" : "Television Standby"}
    </span>

    <span>2 Channels</span>

    <span>{images.length} Active Images</span>

  </div>

  {/* =====================================================
      LIGHTWEIGHT ANIMATIONS
  ===================================================== */}

  <style jsx>{`
    .jmi-crt-on {
      box-shadow:
        inset 0 0 25px rgba(0, 0, 0, 0.75),
        0 0 14px rgba(111, 178, 133, 0.08);
    }

    .jmi-tv-image {
      animation: jmiTvFade 0.8s ease both;
    }

    .jmi-news-ticker {
      animation: jmiNewsScroll 42s linear infinite;
      will-change: transform;
    }

    .jmi-news-ticker:hover {
      animation-play-state: paused;
    }

    @keyframes jmiTvFade {
      from {
        opacity: 0.45;
      }

      to {
        opacity: 1;
      }
    }

    @keyframes jmiNewsScroll {
      from {
        transform: translateX(0);
      }

      to {
        transform: translateX(-50%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jmi-tv-image {
        animation: none;
      }

      .jmi-news-ticker {
        animation: none;
        transform: none;
        flex-wrap: wrap;
        width: 100%;
        padding: 0 12px;
        white-space: normal;
      }
    }
  `}</style>

</section>

);
}