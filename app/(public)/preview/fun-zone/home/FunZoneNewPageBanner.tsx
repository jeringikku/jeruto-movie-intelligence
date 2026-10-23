"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SiteAsset = {
  asset_url: string;
  alt_text: string | null;
};

export default function FunZoneNewPageBanner() {
  const [banner, setBanner] = useState<SiteAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBanner() {
      try {
        const { data, error } = await supabase
          .from("jmi_site_assets")
          .select("asset_url, alt_text")
          .eq("asset_key", "fun_zone_landing_banner")
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error(
            "JMI Fun Zone landing banner error:",
            error
          );

          setBanner(null);
        } else {
          setBanner(data as SiteAsset | null);
        }
      } catch (error) {
        console.error(
          "Unexpected JMI Fun Zone banner error:",
          error
        );

        if (isMounted) {
          setBanner(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBanner();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section
        aria-label="JMI Fun Zone banner"
        className="mx-auto max-w-7xl px-4 pb-5 pt-5 sm:px-6 sm:pb-7 sm:pt-7 lg:px-8"
      >
        <div className="overflow-hidden rounded-xl border border-amber-900/40 bg-[#100b07]">
          <div className="aspect-[16/6] w-full animate-pulse bg-gradient-to-r from-[#100b07] via-[#21160c] to-[#100b07] sm:aspect-[16/5] lg:aspect-[16/4.5]" />
        </div>
      </section>
    );
  }

  if (!banner?.asset_url) {
    return null;
  }

  return (
    <section
      aria-label="JMI Fun Zone banner"
      className="mx-auto max-w-7xl px-4 pb-5 pt-5 sm:px-6 sm:pb-7 sm:pt-7 lg:px-8"
    >
      <div className="group relative overflow-hidden rounded-xl border border-amber-800/40 bg-[#100b07] shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        {/* Subtle premium lighting */}
        <div className="pointer-events-none absolute -left-16 -top-16 z-10 h-40 w-40 rounded-full bg-amber-400/[0.06] blur-3xl" />

        <img
          src={banner.asset_url}
          alt={banner.alt_text || "JMI Fun Zone — Entertainment Pavilion"}
          className="block h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.005]"
        />

        {/* Restrained cinematic edge shading */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/[0.08] via-transparent to-black/[0.12]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
        />
      </div>
    </section>
  );
}