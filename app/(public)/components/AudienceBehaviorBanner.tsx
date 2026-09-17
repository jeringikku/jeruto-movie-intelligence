"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SiteAsset = {
  asset_url: string;
  alt_text: string | null;
};

export default function AudienceBehaviorBanner() {
  const [banner, setBanner] = useState<SiteAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBanner() {
      const { data, error } = await supabase
        .from("jmi_site_assets")
        .select("asset_url, alt_text")
        .eq("asset_key", "audience_behavior_banner")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Audience behavior banner error:",
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
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="aspect-[16/9] w-full animate-pulse bg-zinc-900/60" />
      </div>
    );
  }

  if (!banner?.asset_url) {
    return null;
  }

  return (
    <div className="group relative mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl">
      <div className="pointer-events-none absolute -inset-20 bg-violet-500/[0.035] blur-3xl" />

      <div className="relative aspect-[16/9] w-full">
        <img
          src={banner.asset_url}
          alt={
            banner.alt_text ||
            "JMI Audience Behavior"
          }
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.005]"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/20" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}