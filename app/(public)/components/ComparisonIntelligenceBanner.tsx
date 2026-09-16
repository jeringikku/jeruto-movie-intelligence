"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SiteAsset = {
  asset_url: string;
  alt_text: string | null;
};

export default function ComparisonIntelligenceBanner() {
  const [banner, setBanner] = useState<SiteAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBanner() {
      const { data, error } = await supabase
        .from("jmi_site_assets")
        .select("asset_url, alt_text")
        .eq("asset_key", "comparison_intelligence_home_banner")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error(
          "Comparison Intelligence banner error:",
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

      {/* Section Label */}
      <div className="mb-5 flex items-center gap-3">
        <span className="h-px w-8 bg-violet-400/60" />

        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-violet-300">
          JMI Comparison Intelligence
        </p>

        <span className="h-px flex-1 bg-zinc-900" />
      </div>

     {/* Main Banner */}
<div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl">

  {/* Ambient violet glow */}
  <div className="pointer-events-none absolute -inset-20 bg-violet-500/[0.035] blur-3xl" />

  {loading ? (
    <div className="relative flex aspect-video items-center justify-center bg-zinc-950">
      <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-600">
        Loading JMI
      </span>
    </div>
  ) : banner ? (
    <div className="relative flex aspect-video w-full items-center justify-center bg-black">
      <img
        src={banner.asset_url}
        alt={
          banner.alt_text ||
          "JMI Comparison Intelligence"
        }
        className="h-full w-full object-contain transition duration-700 group-hover:scale-[1.005]"
      />
    </div>
  ) : (
    <div className="relative flex aspect-video items-center justify-center bg-gradient-to-r from-zinc-950 via-zinc-900 to-black">
      <div className="px-6 text-center">
        <p className="text-[9px] uppercase tracking-[0.3em] text-violet-400">
          Jeruto Movie Intelligence
        </p>

        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-3xl">
          Comparison Intelligence
        </h2>

        <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
          Compare · Analyze · Discover
        </p>
      </div>
    </div>
  )}

  {/* Cinematic overlay */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/20" />

  {/* Bottom fade */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

</div>

      {/* Premium CTA */}
      <div className="relative z-10 -mt-5 flex justify-center sm:-mt-6">

        <Link
          href="/preview/compare"
          className="group relative inline-flex h-10 min-w-[105px] items-center justify-center gap-3 overflow-hidden rounded-xl border border-violet-300/40 bg-violet-400 px-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-black shadow-xl shadow-violet-950/30 transition-all duration-300 hover:bg-violet-300 hover:shadow-2xl hover:shadow-violet-900/40 sm:h-14 sm:min-w-[300px] sm:px-9 sm:text-[11px]"
        >

          {/* Button shine */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Comparison icon */}
          <span className="relative text-base sm:text-lg">
            ⚔️
          </span>

          <span className="relative text-[9px]">
            Go to Comparison Intelligence
          </span>

          <span className="relative text-base transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>

        </Link>

      </div>

      {/* Supporting line */}
      <div className="mt-5 flex items-center justify-center gap-3">

        <span className="h-px w-8 bg-zinc-900" />

        <p className="text-center text-[8px] uppercase tracking-[0.2em] text-yellow-400/90 sm:text-[9px]">
          Compare movies · People · Companies · Industries
        </p>

        <span className="h-px w-8 bg-zinc-900" />

      </div>

    </section>
  );
}