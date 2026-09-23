"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SiteAsset = {
  asset_url: string;
  alt_text: string | null;
};

export default function AdvanceBookingBanner() {
  const [banner, setBanner] = useState<SiteAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBanner() {
      const { data, error } = await supabase
        .from("jmi_site_assets")
        .select("asset_url, alt_text")
        .eq("asset_key", "advance_booking_home_banner")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error(
          "Advance booking banner error:",
          error
        );

        setBanner(null);
      } else {
        setBanner(data as SiteAsset | null);
      }

      setLoading(false);
    }

    loadBanner();
  }, []);

  return (
    <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-16 sm:px-6">

      {/* =====================================================
          SECTION LABEL
      ===================================================== */}

      <div className="mb-5 flex items-center gap-3">

        <span className="h-px w-8 bg-violet-400/60" />

        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-pink-400">
          🧠 JMI Advance Booking Intelligence
        </p>

        <span className="h-px flex-1 bg-zinc-900" />

      </div>


      {/* =====================================================
          MAIN BANNER
      ===================================================== */}

      <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">

        {/* Ambient glow */}

        <div className="pointer-events-none absolute -inset-20 bg-violet-500/[0.035] blur-3xl" />


        {/* =================================================
            IMAGE / LOADING / FALLBACK
        ================================================= */}

        {loading ? (

          <div className="relative flex aspect-[16/5] items-center justify-center bg-zinc-950">

            <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-600">
              Loading JMI
            </span>

          </div>

        ) : banner ? (

          <img
            src={banner.asset_url}
            alt={
              banner.alt_text ||
              "JMI Advance Booking Intelligence"
            }
            className="
              relative
              aspect-[16/5]
              w-full
              object-cover
              transition
              duration-700
              group-hover:scale-[1.01]
            "
          />

        ) : (

          <div className="relative flex aspect-[16/5] items-center justify-center bg-gradient-to-r from-zinc-950 via-zinc-900 to-black">

            <div className="text-center">

              <p className="text-[9px] uppercase tracking-[0.3em] text-violet-400">
                Jeruto Movie Intelligence
              </p>

              <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-3xl">
                Advance Booking Intelligence
              </h2>

              <p className="mt-2 text-[9px] text-zinc-500 sm:text-[10px]">
                Live day-wise theatrical booking tracking
              </p>

            </div>

          </div>

        )}


        {/* =================================================
            CINEMATIC OVERLAY
        ================================================= */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/60" />


        {/* =================================================
            BOTTOM FADE
        ================================================= */}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

      </div>


      {/* =====================================================
          PREMIUM CTA
      ===================================================== */}

      <div className="relative z-5 -mt-2 flex justify-center sm:-mt-2">

        <Link
          href="/preview/advance-booking"
          className="
            group
            relative
            inline-flex
            h-9
            min-w-[40px]
            items-center
            justify-center
            gap-3
            overflow-hidden
            rounded-xl
            border
            border-violet-300/40
            bg-pink-500
            px-7
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-white
            shadow-xl
            shadow-violet-950/30
            transition-all
            duration-300
            hover:bg-violet-300
            hover:shadow-2xl
            hover:shadow-violet-900/40
            sm:h-14
            sm:min-w-[280px]
            sm:px-9
            sm:text-[11px]
          "
        >

          {/* Button glow */}

          <span
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-white/10
              via-transparent
              to-white/10
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
          />


          {/* Live indicator */}

          <span className="relative flex h-2 w-2">

            <span
              className="
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                bg-red-600
                opacity-90
              "
            />

            <span
              className="
                relative
                inline-flex
                h-1
                w-2
                rounded-full
                bg-green-500
              "
            />

          </span>


          <span className="relative">
            Explore Live Advance Bookings
          </span>


          <span className="relative text-base transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>

        </Link>

      </div>


      {/* =====================================================
          SUPPORTING LINE
      ===================================================== */}

      <div className="mt-5 flex items-center justify-center gap-3">

        <span className="h-px w-8 bg-zinc-900" />

        <p className="text-center text-[8px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[9px]">
          Track advance sales · Follow daily performance · Explore live data
        </p>

        <span className="h-px w-8 bg-zinc-900" />

      </div>

    </section>
  );
}