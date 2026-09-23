"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type TickerItem = {
  id: string;
  type: "movie" | "booking" | "daily" | "verdict";
  title: string;
  value: string;
  change?: number | null;
  href?: string;
};

export default function JmiLiveTicker() {
  const [updates, setUpdates] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    setLoading(true);

    try {
      /* ============================================================
         RECENTLY ADDED MOVIES
      ============================================================ */

      const { data: recentMovies, error: moviesError } =
        await supabase
          .from("movies")
          .select(`
            id,
            title,
            created_at
          `)
          .order("created_at", { ascending: false })
          .limit(8);

      if (moviesError) {
        console.error(
          "JMI Live Ticker movies error:",
          moviesError
        );
      }

      const movieUpdates: TickerItem[] =
        (recentMovies ?? []).map((movie) => ({
          id: `movie-${movie.id}`,
          type: "movie" as const,
          title: movie.title,
          value: "New movie added to JMI",
          href: `/preview/movies/${movie.id}`,
        }));


      /* ============================================================
         DAILY COLLECTION MOVEMENT
      ============================================================ */

      const { data: dailyRecords, error: dailyError } =
        await supabase
          .from("movie_daily_box_office")
          .select(`
            movie_id,
            day_number,
            gross_jmi,
            movies (
              title
            )
          `)
          .order("day_number", { ascending: false })
          .limit(200);

      if (dailyError) {
        console.error(
          "JMI Live Ticker daily collection error:",
          dailyError
        );
      }


      /*
        Keep the latest two available days for each movie.
      */

      const dailyMovieMap = new Map<
        number,
        {
          title: string;
          records: {
            day_number: number;
            gross_jmi: number;
          }[];
        }
      >();


      (dailyRecords ?? []).forEach((record: any) => {
        const movieId = Number(record.movie_id);

        if (!movieId) return;

        const title =
          record.movies?.title || "Unknown Movie";

        const dayNumber =
          Number(record.day_number || 0);

        const gross =
          Number(record.gross_jmi || 0);

        if (!dailyMovieMap.has(movieId)) {
          dailyMovieMap.set(movieId, {
            title,
            records: [],
          });
        }

        const movie = dailyMovieMap.get(movieId)!;

        if (
          !movie.records.some(
            (item) =>
              item.day_number === dayNumber
          )
        ) {
          movie.records.push({
            day_number: dayNumber,
            gross_jmi: gross,
          });
        }
      });


      function formatCrores(value: number | null) {
        if (!value || value <= 0) {
          return "—";
        }

        return `₹${(
          value / 10000000
        ).toFixed(2)} Cr`;
      }


      const dailyUpdates: TickerItem[] = [];


      dailyMovieMap.forEach(
        (movie, movieId) => {

          const sortedRecords =
            [...movie.records].sort(
              (a, b) =>
                b.day_number -
                a.day_number
            );

          /*
            We need at least two days to
            calculate a movement percentage.
          */

          if (sortedRecords.length < 2) {
            return;
          }

          const latest =
            sortedRecords[0];

          const previous =
            sortedRecords[1];

          if (
            latest.gross_jmi <= 0 ||
            previous.gross_jmi <= 0
          ) {
            return;
          }

          const percentageChange =
            ((latest.gross_jmi -
              previous.gross_jmi) /
              previous.gross_jmi) *
            100;


          /*
            Ignore extremely tiny numerical
            differences.
          */

          if (
            Math.abs(percentageChange) <
            0.1
          ) {
            return;
          }


          const direction =
            percentageChange >= 0
              ? "up"
              : "down";


          const sign =
            percentageChange >= 0
              ? "+"
              : "";


          dailyUpdates.push({
            id: `daily-${movieId}-${latest.day_number}`,
            type: "daily",
            title: movie.title,
            value: `Day ${latest.day_number} ${formatCrores(
              latest.gross_jmi
            )} ${direction === "up" ? "↑" : "↓"} ${sign}${percentageChange.toFixed(
              1
            )}%`,
            change: percentageChange,
            href: `/preview/movies/${movieId}/box-office/india/day-wise`,
          });
        }
      );


      /*
        Largest movements first.
      */

      dailyUpdates.sort(
        (a, b) =>
          Math.abs(b.change ?? 0) -
          Math.abs(a.change ?? 0)
      );


      /* ============================================================
         THEATRICAL VERDICT UPDATES
      ============================================================ */

      const {
        data: verdictRecords,
        error: verdictError,
      } = await supabase
        .from("movie_business")
        .select(`
          movie_id,
          business_verdict,
          updated_at
        `)
        .not("business_verdict", "is", null)
        .order("updated_at", {
          ascending: false,
        })
        .limit(8);

      if (verdictError) {
        console.error(
          "JMI Live Ticker verdict error:",
          verdictError
        );
      }


      const verdictMovieIds =
        Array.from(
          new Set(
            (verdictRecords ?? [])
              .map(
                (record) =>
                  record.movie_id
              )
              .filter(
                (id) =>
                  id !== null &&
                  id !== undefined
              )
          )
        );


      const { data: verdictMovies } =
        verdictMovieIds.length > 0
          ? await supabase
              .from("movies")
              .select(`
                id,
                title
              `)
              .in(
                "id",
                verdictMovieIds
              )
          : { data: [] };


      const verdictMovieMap =
        new Map(
          (verdictMovies ?? []).map(
            (movie) => [
              movie.id,
              movie.title,
            ]
          )
        );


      const verdictUpdates: TickerItem[] =
        (verdictRecords ?? [])
          .map((record) => {

            const movieTitle =
              verdictMovieMap.get(
                record.movie_id
              );

            if (!movieTitle) {
              return null;
            }

            const verdict =
              String(
                record.business_verdict || ""
              ).trim();

            if (!verdict) {
              return null;
            }

            return {
              id: `verdict-${record.movie_id}-${record.updated_at}`,
              type: "verdict" as const,
              title: movieTitle,
              value: `Theatrical verdict updated to ${verdict}`,
              href: `/preview/movies/${record.movie_id}/business`,
            };
          })
          .filter((item) => item !== null) as TickerItem[];


      /* ============================================================
         LIVE ADVANCE BOOKING INTELLIGENCE
         
         NEW SYSTEM:
         - advance_booking_intelligence
         - movie_advance_booking_daily

         OLD SYSTEM:
         - movie_advance_booking

         The old table is no longer used here.
      ============================================================ */

      /*
        First get the movies that are currently enabled
        for the public Advance Booking Intelligence page.
      */

      const {
        data: activeBookingMovies,
        error: activeBookingError,
      } = await supabase
        .from("advance_booking_intelligence")
        .select(`
          movie_id,
          tracking_status
        `)
        .eq("is_active", true)
        .in("tracking_status", [
          "LIVE",
          "PAUSED",
          "COMPLETED",
        ]);

      if (activeBookingError) {
        console.error(
          "JMI Live Ticker advance booking intelligence error:",
          activeBookingError
        );
      }


      const activeBookingMovieIds =
        Array.from(
          new Set(
            (activeBookingMovies ?? [])
              .map(
                (record) =>
                  Number(record.movie_id)
              )
              .filter(
                (id) => id > 0
              )
          )
        );


      let bookingRecords: any[] = [];


      /*
        Only load daily booking data when
        there are active intelligence movies.
      */

      if (activeBookingMovieIds.length > 0) {

        const {
          data,
          error,
        } = await supabase
          .from("movie_advance_booking_daily")
          .select(`
            id,
            movie_id,
            booking_day,
            booking_date,
            coverage_type,
            state_id,
            gross,
            admissions,
            show_count,
            updated_at
          `)
          .in(
            "movie_id",
            activeBookingMovieIds
          )
          .order("updated_at", {
            ascending: false,
          })
          .limit(200);

        if (error) {
          console.error(
            "JMI Live Ticker new advance booking error:",
            error
          );
        }

        bookingRecords = data ?? [];
      }


      /* ============================================================
         MOVIE TITLES FOR ADVANCE BOOKINGS
      ============================================================ */

      const bookingMovieIds =
        Array.from(
          new Set(
            bookingRecords
              .map(
                (record) =>
                  Number(record.movie_id)
              )
              .filter(
                (id) => id > 0
              )
          )
        );


      const { data: bookingMovies } =
        bookingMovieIds.length > 0
          ? await supabase
              .from("movies")
              .select(`
                id,
                title
              `)
              .in(
                "id",
                bookingMovieIds
              )
          : { data: [] };


      const bookingMovieMap =
        new Map(
          (bookingMovies ?? []).map(
            (movie) => [
              Number(movie.id),
              movie.title,
            ]
          )
        );


      /* ============================================================
         AGGREGATE DAILY ADVANCE BOOKING DATA
         
         Multiple territory rows for the same movie/day
         are combined into ONE live ticker update.
      ============================================================ */

      const bookingDayMap = new Map<
        string,
        {
          movieId: number;
          title: string;
          bookingDay: number;
          bookingDate: string | null;
          gross: number;
          admissions: number;
          shows: number;
          updatedAt: string;
        }
      >();


      bookingRecords.forEach((record) => {

        const movieId =
          Number(record.movie_id);

        if (!movieId) {
          return;
        }

        const title =
          bookingMovieMap.get(movieId);

        if (!title) {
          return;
        }

        const bookingDay =
          Number(record.booking_day || 0);

        const bookingDate =
          record.booking_date || null;

        /*
          Use movie + booking day as the
          aggregation key.
        */

        const key =
          `${movieId}-${bookingDay}`;


        if (!bookingDayMap.has(key)) {

          bookingDayMap.set(key, {
            movieId,
            title,
            bookingDay,
            bookingDate,
            gross: 0,
            admissions: 0,
            shows: 0,
            updatedAt:
              record.updated_at ||
              "",
          });

        }


        const item =
          bookingDayMap.get(key)!;


        item.gross +=
          Number(record.gross || 0);

        item.admissions +=
          Number(record.admissions || 0);

        item.shows +=
          Number(record.show_count || 0);


        /*
          Keep the most recent update time.
        */

        if (
          String(record.updated_at || "") >
          String(item.updatedAt || "")
        ) {
          item.updatedAt =
            record.updated_at || "";
        }

      });


      /* ============================================================
         CREATE ADVANCE BOOKING TICKER UPDATES
      ============================================================ */

      const bookingUpdates: TickerItem[] =
        Array.from(
          bookingDayMap.values()
        )
          .sort(
            (a, b) =>
              new Date(
                b.updatedAt || 0
              ).getTime() -
              new Date(
                a.updatedAt || 0
              ).getTime()
          )
          .map((record) => {

            const parts: string[] = [];


            /*
              Day label
            */

            if (
              record.bookingDay === 0
            ) {

              parts.push(
                "Premiere Day"
              );

            } else {

              parts.push(
                `Day ${record.bookingDay}`
              );

            }


            /*
              Gross
            */

            if (record.gross > 0) {

              parts.push(
                formatCrores(
                  record.gross
                )
              );

            }


            /*
              Admissions
            */

            if (
              record.admissions > 0
            ) {

              parts.push(
                `${record.admissions.toLocaleString(
                  "en-IN"
                )} admissions`
              );

            }


            /*
              Shows
            */

            if (record.shows > 0) {

              parts.push(
                `${record.shows.toLocaleString(
                  "en-IN"
                )} shows`
              );

            }


            /*
              Fallback
            */

            if (parts.length === 1) {

              parts.push(
                "Advance booking updated"
              );

            }


            return {
              id: `booking-${record.movieId}-${record.bookingDay}-${record.updatedAt}`,
              type: "booking" as const,
              title: record.title,
              value: parts.join(" · "),
              href: `/preview/movies/${record.movieId}/advance-booking`,
            };

          });


      /* ============================================================
         COMBINE ALL LIVE INTELLIGENCE
      ============================================================ */

      const combinedUpdates = [
        ...dailyUpdates.slice(0, 6),
        ...verdictUpdates.slice(0, 5),

        /*
          New live advance booking intelligence.
        */

        ...bookingUpdates.slice(0, 5),

        ...movieUpdates.slice(0, 4),
      ];


      /*
        Final safety limit.
      */

      setUpdates(
        combinedUpdates.slice(0, 20)
      );

    } catch (error) {

      console.error(
        "JMI Live Ticker loading error:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


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

              const isDaily =
                update.type === "daily";

              const isPositive =
                isDaily &&
                (update.change ?? 0) > 0;

              const isNegative =
                isDaily &&
                (update.change ?? 0) < 0;

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

                      <span
                        className={
                          isPositive
                            ? "text-green-400"
                            : isNegative
                            ? "text-red-400"
                            : "text-zinc-400"
                        }
                      >
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