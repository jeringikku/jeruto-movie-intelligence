"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SiteAsset = {
  asset_url: string;
  alt_text: string | null;
};

export default function JmiFunZoneBanner() {
  const [banner, setBanner] = useState<SiteAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBanner() {
      const { data, error } = await supabase
        .from("jmi_site_assets")
        .select("asset_url, alt_text")
        .eq("asset_key", "fun_zone_page_banner")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "JMI Fun Zone homepage banner error:",
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

  if (loading) {
    return (
      <section className="border-b border-zinc-900">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="aspect-[16/9] w-full animate-pulse bg-zinc-900/60" />
          </div>
        </div>
      </section>
    );
  }

  if (!banner?.asset_url) {
    return null;
  }

  return (
    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

        {/* =====================================================
            SECTION LABEL
        ===================================================== */}

        <div className="mb-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-yellow-400">
            JMI Entertainment
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-pink-400 sm:text-2xl">
            Share your Guesses. Play. Have Fun.
          </h2>

          <p className="mt-2 max-w-2xl text-[11px] leading-5 text-zinc-400 sm:text-xs">
            JMI Fun Zone is purely desinged for entertainment and Fun & not any serous game. Test your box-office instincts in the JMI Fun Zone, Mark your projected guesses about tomorrow's numbers and
            see how closely your predictions match the actual JMI
            collection figures.
          </p>
        </div>

        {/* =====================================================
            PREMIUM FUN ZONE CARD
        ===================================================== */}

        <Link
  href="/preview/fun-zone"
  className="group relative block overflow-hidden rounded-2xl border border-yellow-400/20 bg-zinc-950 shadow-2xl transition-all duration-500 hover:-translate-y-0.5 hover:border-yellow-400/40"
>
  {/* =====================================================
      AMBIENT GLOW
  ===================================================== */}

  <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-yellow-400/[0.06] blur-3xl transition-all duration-500 group-hover:bg-yellow-400/[0.1]" />

  <div className="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-violet-500/[0.07] blur-3xl transition-all duration-500 group-hover:bg-violet-500/[0.12]" />

  {/* =====================================================
      BANNER IMAGE
  ===================================================== */}

  <div className="relative overflow-hidden">
    <img
      src={banner.asset_url}
      alt={
        banner.alt_text ||
        "JMI Fun Zone"
      }
      className="block h-auto w-full object-cover transition duration-700 group-hover:scale-[1.008]"
    />

    {/* Subtle image overlay */}

    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10" />
  </div>

  {/* =====================================================
      CTA AREA — BELOW IMAGE
  ===================================================== */}

  <div className="border-t border-yellow-400/10 bg-zinc-950 px-4 py-4 sm:px-6 sm:py-5">

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      {/* Information */}

      <div className="min-w-0">

        <div className="flex flex-wrap items-center gap-2">

          <span className="rounded-full border border-yellow-400/30 bg-yellow-400/[0.06] px-2 py-1 text-[7px] font-bold uppercase tracking-[0.14em] text-yellow-400">
            🎮 Entertainment Only
          </span>

          <span className="rounded-full border border-violet-400/30 bg-violet-400/[0.06] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-violet-300">
            Free to Play
          </span>

        </div>

        <p className="mt-2 text-[9px] leading-4 text-zinc-500 sm:text-[10px]">
          No real money · No betting · No wagering
        </p>

      </div>

      {/* Enter Button */}

      <div className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-yellow-400/30 bg-yellow-400 px-5 py-3 text-[8px] font-bold uppercase tracking-[0.16em] text-black transition-all duration-300 group-hover:bg-yellow-300">
        Enter Fun Zone

        <span className="text-[11px] transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>

    </div>

  </div>
</Link>
      </div>
    </section>
  );
}