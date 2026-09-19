"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type SiteAsset = {
  asset_url: string;
  alt_text: string | null;
};

export default function BookTicketsPage() {
  const [movie, setMovie] = useState("");
  const [city, setCity] = useState("");
  const [day, setDay] = useState("");
  const [platform, setPlatform] = useState("bookmyshow");

  const [banner, setBanner] = useState<SiteAsset | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);

  useEffect(() => {
    async function loadBanner() {
      const { data, error } = await supabase
        .from("jmi_site_assets")
        .select("asset_url, alt_text")
        .eq("asset_key", "ticket_finder_poster")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Ticket Finder banner error:", error);
        setBanner(null);
      } else {
        setBanner(data as SiteAsset | null);
      }

      setBannerLoading(false);
    }

    loadBanner();
  }, []);

  function handleContinue() {
  const currentCity = city.trim();

  if (!currentCity) {
    return;
  }

  const citySlug = currentCity
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!citySlug) {
    return;
  }

  if (platform === "bookmyshow") {
    const bookingUrl =
      `https://in.bookmyshow.com/explore/home/${citySlug}`

    window.location.assign(bookingUrl);
    return;
  }

  window.location.assign("https://www.district.in/movies");
}

  return (
    <main className="min-h-screen bg-black text-zinc-100">

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        <div className="mb-5">
  <Link
    href="/"
    className="inline-flex items-center gap-2 text-[9px] font-medium tracking-[0.16em] text-violet-500 transition hover:text-violet-400"
  >
    <span>←</span>
    <span>Back to Home</span>
  </Link>
</div>

        

        {/* JMI Header */}
        <div className="mb-7 text-center sm:mb-9">

          <p className="text-[9px] font-medium uppercase tracking-[0.32em] text-yellow-400 sm:text-[10px]">
            Jeruto Movie Intelligence
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-pink-400 sm:text-3xl">
            Book Your Tickets🎫
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-[10px] leading-5 text-zinc-400 sm:text-[11px]">
            Choose your favourite Movie, City and the preffered date,
          </p>

        </div>

        {/* Cinematic Banner */}
        <div className="group relative mb-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl sm:mb-10">

          {/* Subtle violet glow */}
          <div className="pointer-events-none absolute -inset-10 bg-violet-500/5 blur-3xl" />

          {bannerLoading ? (
            <div className="relative flex aspect-[16/5] items-center justify-center bg-zinc-950">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                Loading JMI
              </span>
            </div>
          ) : banner ? (
            <img
              src={banner.asset_url}
              alt={banner.alt_text || "JMI Book Your Tickets"}
              className="relative aspect-[16/5] w-full object-cover transition duration-700 group-hover:scale-[1.01]"
            />
          ) : (
            <div className="relative flex aspect-[16/5] items-center justify-center bg-zinc-950">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                JMI Ticket Finder
              </span>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

        </div>

        {/* Ticket Finder */}
        <section className="relative mx-auto max-w-3xl">

          {/* Outer premium glow */}
          <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-violet-500/5 blur-xl" />

          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">

            {/* Top accent */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />

            <div className="p-5 sm:p-7 lg:p-8">

              {/* Section header */}
              <div className="mb-7 flex items-start justify-between gap-4">

                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-400/30 bg-violet-400/10 text-[9px] font-semibold text-violet-300">
                      01
                    </span>

                    <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-violet-400">
                      Ticket Finder
                    </p>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Where would you like to watch?
                  </h2>

                  <p className="mt-2 max-w-md text-[10px] leading-5 text-yellow-400/70 sm:text-[11px]">
                    Select your movie, location and preferred booking platform.
                  </p>
                </div>

                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-black sm:flex">
                  <span className="text-lg text-violet-400">
                    🎟️
                  </span>
                </div>

              </div>

              {/* Movie */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[9px] font-semibold text-violet-400">
                    01
                  </span>

                  <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-300">
                    What movie do you want to watch?
                  </label>
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                    ⌕
                  </span>

                  <input
                    type="text"
                    value={movie}
                    onChange={(event) => setMovie(event.target.value)}
                    placeholder="Enter movie name"
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-black pl-9 pr-4 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 hover:border-zinc-700 focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/10"
                  />
                </div>
              </div>

              {/* City + Day */}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                {/* City */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-violet-400">
                      02
                    </span>

                    <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-300">
                      City / Place
                    </label>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-600">
                      ◉
                    </span>

                    <input
                      type="text"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="Enter city or place"
                      className="h-12 w-full rounded-xl border border-zinc-800 bg-black pl-9 pr-4 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 hover:border-zinc-700 focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/10"
                    />
                  </div>
                </div>

                {/* Day */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-violet-400">
                      03
                    </span>

                    <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-300">
                      Which day?
                    </label>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600">
                      ◷
                    </span>

                   <input
  id="ticket-date"
  type="date"
  value={day}
  onChange={(event) => setDay(event.target.value)}
  min={new Date().toISOString().split("T")[0]}
  onClick={(event) => {
    event.currentTarget.showPicker?.();
  }}
  className="h-12 w-full cursor-pointer rounded-xl border border-zinc-800 bg-black pl-9 pr-12 text-xs text-zinc-300 outline-none transition hover:border-zinc-700 focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/10"
/>
                  </div>
                </div>

              </div>

              {/* Divider */}
              <div className="my-7 h-px bg-zinc-900" />

              {/* Platform */}
              <div>

                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-violet-400">
                      04
                    </span>

                    <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-300">
                      Choose Booking Platform
                    </label>
                  </div>

                  <span className="text-[8px] uppercase tracking-wider text-zinc-600">
                    Select one
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">

                  {/* BookMyShow */}
                  <button
                    type="button"
                    onClick={() => setPlatform("bookmyshow")}
                    className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${
                      platform === "bookmyshow"
                        ? "border-violet-400/70 bg-violet-400/[0.07] shadow-lg shadow-violet-950/20"
                        : "border-zinc-800 bg-black hover:border-zinc-700 hover:bg-zinc-900/40"
                    }`}
                  >
                    {platform === "bookmyshow" && (
                      <div className="absolute inset-x-0 top-0 h-px bg-violet-400" />
                    )}

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <p className="text-sm font-medium text-zinc-100">
                          BookMyShow
                        </p>

                        <p className="mt-1 text-[9px] leading-4 text-zinc-400">
                          Continue to BookMyShow
                        </p>
                      </div>

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] ${
                          platform === "bookmyshow"
                            ? "border-violet-400 bg-violet-400 text-black"
                            : "border-zinc-700 text-transparent"
                        }`}
                      >
                        ✓
                      </span>

                    </div>

                    <div className="mt-4 flex items-center gap-1 text-[8px] uppercase tracking-wider text-zinc-600">
                      <span>Booking Platform</span>
                      <span>•</span>
                      <span>India</span>
                    </div>
                  </button>

                  {/* District */}
                  <button
                    type="button"
                    onClick={() => setPlatform("district")}
                    className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${
                      platform === "district"
                        ? "border-violet-400/70 bg-violet-400/[0.07] shadow-lg shadow-violet-950/20"
                        : "border-zinc-800 bg-black hover:border-zinc-700 hover:bg-zinc-900/40"
                    }`}
                  >
                    {platform === "district" && (
                      <div className="absolute inset-x-0 top-0 h-px bg-violet-400" />
                    )}

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <p className="text-sm font-medium text-zinc-100">
                          District
                        </p>

                        <p className="mt-1 text-[9px] leading-4 text-zinc-400">
                          Continue to District
                        </p>
                      </div>

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] ${
                          platform === "district"
                            ? "border-violet-400 bg-violet-400 text-black"
                            : "border-zinc-700 text-transparent"
                        }`}
                      >
                        ✓
                      </span>

                    </div>

                    <div className="mt-4 flex items-center gap-1 text-[8px] uppercase tracking-wider text-zinc-600">
                      <span>Booking Platform</span>
                      <span>•</span>
                      <span>India</span>
                    </div>
                  </button>

                </div>
              </div>

              {/* Continue */}
              <div className="mt-7">

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!city.trim()}
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-violet-400 text-[11px] font-semibold text-black transition-all duration-200 hover:bg-violet-300 hover:shadow-lg hover:shadow-violet-950/30 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <span className="relative z-10">
                    Continue to Booking
                  </span>

                  <span className="relative z-10 ml-2 transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </button>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="h-px w-8 bg-zinc-900" />

                  <p className="text-center text-[8px] uppercase tracking-[0.16em] text-zinc-500">
                    You will continue to the selected platform
                  </p>

                  <span className="h-px w-8 bg-zinc-900" />
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-7 text-center">
          <p className="text-[8px] uppercase tracking-[0.22em] text-zinc-600">
            Jeruto Movie Intelligence
          </p>
        </div>

      </div>
    </main>
  );
}