"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ============================================================
   JMI LIVE TICKER TYPES
============================================================ */

type TickerItem = {
  id: string;
  type: "movie" | "booking" | "verdict";
  title: string;
  value: string;
  href?: string;
};

type TickerCache = {
  movies?: TickerItem[];
  verdicts?: TickerItem[];
  bookings?: TickerItem[];
};

/* ============================================================
   CACHE REFRESH CHECK INTERVAL

   The database itself refreshes at:
   12:00 PM IST
   06:00 PM IST

   This browser check only reads the prepared cache.
============================================================ */

const CACHE_CHECK_INTERVAL = 30 * 60 * 1000;

/* ============================================================
   JMI LIVE TICKER
============================================================ */

export default function JmiLiveTicker() {
  const [updates, setUpdates] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    /* ========================================================
       LOAD PREPARED TICKER CACHE
    ======================================================== */

    async function loadCachedUpdates() {
      if (isFetching) return;

      isFetching = true;

      try {
        const { data, error } = await supabase
          .from("jmi_live_ticker_cache")
          .select("ticker_data")
          .eq("id", 1)
          .maybeSingle();

        if (error) {
          console.error(
            "JMI Live Ticker cache error:",
            error
          );

          return;
        }

        if (!isMounted) return;

        if (!data?.ticker_data) {
          setUpdates([]);
          return;
        }

        const tickerData =
          data.ticker_data as TickerCache;

        /* ====================================================
           COMBINE CACHED TICKER ENTRIES

           1. Recently added movies
           2. Theatrical verdict updates
           3. Advance booking updates
        ==================================================== */

        const movieUpdates =
          Array.isArray(tickerData.movies)
            ? tickerData.movies
            : [];

        const verdictUpdates =
          Array.isArray(tickerData.verdicts)
            ? tickerData.verdicts
            : [];

        const bookingUpdates =
          Array.isArray(tickerData.bookings)
            ? tickerData.bookings
            : [];

        const combinedUpdates: TickerItem[] = [
          ...movieUpdates,
          ...verdictUpdates,
          ...bookingUpdates,
        ];

        setUpdates(combinedUpdates);

      } catch (error) {
        console.error(
          "JMI Live Ticker loading error:",
          error
        );

      } finally {
        isFetching = false;

        if (isMounted) {
          setLoading(false);
        }
      }
    }

    /* ========================================================
       INITIAL CACHE LOAD
    ======================================================== */

    loadCachedUpdates();

    /* ========================================================
       CHECK FOR UPDATED CACHE EVERY 30 MINUTES

       This only reads one prepared database row.
       No calculations or source-table queries occur here.
    ======================================================== */

    const interval = window.setInterval(
      loadCachedUpdates,
      CACHE_CHECK_INTERVAL
    );

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };

  }, []);


  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (loading) {
    return (
      <div className="border-b border-zinc-800 bg-zinc-950">

        <div className="mx-auto flex h-8 max-w-7xl items-center px-4 sm:px-6 lg:px-8">

          <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-red-400">
            JMI LIVE
          </span>

          <span className="ml-3 h-2 w-40 animate-pulse rounded-full bg-zinc-800" />

        </div>

      </div>
    );
  }


  /* ============================================================
     EMPTY STATE
  ============================================================ */

  if (updates.length === 0) {
    return null;
  }


  /* ============================================================
     TICKER
  ============================================================ */

  return (
    <div className="relative overflow-hidden border-b border-zinc-900 bg-black">

      {/* ========================================================
          LEFT LIVE LABEL
      ======================================================== */}

      <div className="absolute left-0 top-0 z-20 flex h-8 items-center border-r border-zinc-900 bg-black px-3 sm:px-4">

        <div className="flex items-center gap-1.5">

          <span className="relative flex h-1.5 w-1.5">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400" />

            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />

          </span>

          <span className="whitespace-nowrap text-[7px] font-semibold uppercase tracking-[0.2em] text-red-400">
            JMI LIVE
          </span>

        </div>

      </div>


      {/* ========================================================
          MOVING TRACK
      ======================================================== */}

      <div className="relative flex h-8 items-center overflow-hidden pl-[82px] sm:pl-[92px]">

        <div className="jmi-ticker-track flex min-w-max items-center">

          {[...updates, ...updates].map(
            (update, index) => {

              return (
                <div
                  key={`${update.id}-${index}`}
                  className="flex items-center"
                >

                  {update.href ? (
                    <Link
                      href={update.href}
                      className="
                        flex
                        items-center
                        gap-2
                        whitespace-nowrap
                        px-4
                        text-[9px]
                        text-green-500
                        transition-colors
                        hover:text-zinc-200
                      "
                    >

                      <span className="text-zinc-700">
                        /
                      </span>

                      <span className="font-medium text-zinc-300">
                        {update.title}
                      </span>

                      <span className="text-zinc-400">
                        {update.value}
                      </span>

                    </Link>
                  ) : (

                    <div className="flex items-center gap-2 px-4">

                      <span className="text-zinc-700">
                        /
                      </span>

                      <span className="font-medium text-zinc-300">
                        {update.title}
                      </span>

                      <span className="text-zinc-400">
                        {update.value}
                      </span>

                    </div>

                  )}

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* ========================================================
          TICKER ANIMATION
      ======================================================== */}

      <style jsx>{`
        .jmi-ticker-track {
          animation: jmiTickerScroll 60s linear infinite;
        }

        .jmi-ticker-track:hover {
          animation-play-state: paused;
        }

        @keyframes jmiTickerScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-ticker-track {
            animation: none;
          }
        }
      `}</style>

    </div>
  );
}