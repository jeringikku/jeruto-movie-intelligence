import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
  release_year: number | null;
  release_date: string | null;
  poster_url: string | null;
};

type IntelligenceRecord = {
  id: number;
  movie_id: number;
  is_active: boolean;
  display_order: number;
  tracking_status: "LIVE" | "PAUSED" | "COMPLETED";
};

type DailyRecord = {
  id: number;
  movie_id: number;
  booking_day: number;
  booking_date: string | null;
  gross: number | null;
  admissions: number | null;
  show_count: number | null;
  updated_at: string;
};

type IntelligenceMovie = {
  intelligence: IntelligenceRecord;
  movie: Movie;
  records: DailyRecord[];
};

function formatCompactMoney(value: number) {
  if (!value) {
    return "₹0";
  }

  if (value >= 10000000) {
    const crore = value / 10000000;

    return `₹${Number.isInteger(crore)
      ? crore.toFixed(0)
      : crore.toFixed(2).replace(/\.?0+$/, "")} Cr`;
  }

  if (value >= 100000) {
    const lakh = value / 100000;

    return `₹${Number.isInteger(lakh)
      ? lakh.toFixed(0)
      : lakh.toFixed(2).replace(/\.?0+$/, "")} L`;
  }

  if (value >= 1000) {
    const thousand = value / 1000;

    return `₹${Number.isInteger(thousand)
      ? thousand.toFixed(0)
      : thousand.toFixed(1).replace(/\.?0+$/, "")}K`;
  }

  return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(
    value
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Date not available";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdvanceBookingIntelligencePage() {
  /* =========================================================
     LOAD INTELLIGENCE MOVIES
  ========================================================= */

  const {
    data: intelligenceData,
    error: intelligenceError,
  } = await supabase
    .from("advance_booking_intelligence")
    .select(`
      id,
      movie_id,
      is_active,
      display_order,
      tracking_status
    `)
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    })
    .order("id", {
      ascending: true,
    });

  if (intelligenceError) {
    console.error(
      "Advance booking intelligence error:",
      intelligenceError
    );

    notFound();
  }

  const intelligence =
    (intelligenceData ||
      []) as IntelligenceRecord[];

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (intelligence.length === 0) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">

        <PublicHeader />

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="mb-4">
            <Link
              href="/preview"
              className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
            >
              <span>←</span>
              <span>Back to JMI</span>
            </Link>
          </div>

          <section className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 text-center">

            <p className="text-[8px] uppercase tracking-[0.18em] text-red-400">
              Advance Booking Intelligence
            </p>

            <h1 className="mt-2 text-lg font-semibold text-zinc-200">
              No live tracking available
            </h1>

            <p className="mt-2 text-[9px] leading-5 text-zinc-600">
              Advance booking intelligence will appear
              here when JMI begins tracking a movie.
            </p>

          </section>

          <footer className="mt-10 border-t border-zinc-900 pt-5 pb-8">

            <p className="text-center text-[8px] text-zinc-800">
              JMI · Jeruto Movie Intelligence
            </p>

            <p className="mt-1 text-center text-[7px] text-zinc-900">
              Indian Film Industry Data & Intelligence
            </p>

          </footer>

        </main>

      </div>
    );
  }

  /* =========================================================
     LOAD MOVIES
  ========================================================= */

  const movieIds = intelligence.map(
    (item) => item.movie_id
  );

  const {
    data: movieData,
    error: movieError,
  } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      release_year,
      release_date,
      poster_url
    `)
    .in("id", movieIds);

  if (movieError) {
    console.error(
      "Advance booking movie error:",
      movieError
    );

    notFound();
  }

  const movieMap =
    new Map<number, Movie>();

  ((movieData || []) as Movie[]).forEach(
    (movie) => {
      movieMap.set(movie.id, movie);
    }
  );

  /* =========================================================
     LOAD DAILY DATA
  ========================================================= */

  const {
    data: dailyData,
    error: dailyError,
  } = await supabase
    .from("movie_advance_booking_daily")
    .select(`
      id,
      movie_id,
      booking_day,
      booking_date,
      gross,
      admissions,
      show_count,
      updated_at
    `)
    .in("movie_id", movieIds)
    .order("booking_day", {
      ascending: true,
    });

  if (dailyError) {
    console.error(
      "Advance booking daily error:",
      dailyError
    );

    notFound();
  }

  const dailyMap =
    new Map<number, DailyRecord[]>();

  ((dailyData || []) as DailyRecord[]).forEach(
    (record) => {
      const existing =
        dailyMap.get(record.movie_id) || [];

      existing.push(record);

      dailyMap.set(
        record.movie_id,
        existing
      );
    }
  );

  /* =========================================================
     COMBINE DATA
  ========================================================= */

  const intelligenceMovies =
    intelligence
      .map((item) => {
        const movie =
          movieMap.get(item.movie_id);

        if (!movie) {
          return null;
        }

        return {
          intelligence: item,
          movie,
          records:
            dailyMap.get(
              item.movie_id
            ) || [],
        };
      })
      .filter(
        (
          item
        ): item is IntelligenceMovie =>
          item !== null
      );

  /* =========================================================
     SUMMARY
  ========================================================= */

  const liveCount =
    intelligenceMovies.filter(
      (item) =>
        item.intelligence
          .tracking_status === "LIVE"
    ).length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            BACK
        ================================================= */}

        <div className="mb-4">

          <Link
            href="/preview"
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to JMI</span>
          </Link>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="border-b border-zinc-900 pb-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-[8px] uppercase tracking-[0.18em] text-red-400">
                Live Tracking
              </p>

              <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                Advance Booking Intelligence
              </h1>

              <p className="mt-2 max-w-2xl text-[9px] leading-5 text-zinc-400">
                Live day-wise advance booking intelligence
                across tracked Indian movies and territories.
              </p>

            </div>


           

          </div>

        </section>


        {/* =================================================
            INTRO / METRICS
        ================================================= */}

        <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-400">
             Currently Tracked Movies
            </p>

            <p className="mt-1 text-sm font-semibold text-green-500">
              {formatNumber(
                intelligenceMovies.length
              )}
            </p>

          </div>


          <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

         <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-400">
              Data Source
            </p>

            <p className="mt-1 text-[9px] font-medium text-green-500">
              JMI Live Tracking
            </p>

  

          </div>


        </section>


        {/* =================================================
            MOVIE LIST
        ================================================= */}

        <section className="mt-7">

          <div className="mb-3">

            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Current Trend Analysis
            </p>

            <h2 className="mt-1 text-sm font-semibold text-zinc-200">
              Real-time Advance Booking of Upcoming Movies
            </h2>


            <p className=" mt-2 text-[6px] uppercase tracking-[0.18em] text-zinc-400">
              Currently Tracked Upcoming movies by JMI
            </p>

          </div>


          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">

            {intelligenceMovies.map(
              (item) => {

                const {
                  intelligence,
                  movie,
                  records,
                } = item;

                /* -----------------------------------------
                   LATEST DAY
                ----------------------------------------- */

                const latestDay =
                  records.length > 0
                    ? Math.max(
                        ...records.map(
                          (record) =>
                            record.booking_day
                        )
                      )
                    : null;

                /* -----------------------------------------
                   LATEST DATE
                ----------------------------------------- */

                const latestDate =
                  records
                    .filter(
                      (record) =>
                        record.booking_date
                    )
                    .sort(
                      (
                        a,
                        b
                      ) =>
                        new Date(
                          b.booking_date!
                        ).getTime() -
                        new Date(
                          a.booking_date!
                        ).getTime()
                    )[0]
                    ?.booking_date ||
                  null;

                /* -----------------------------------------
                   LATEST BOOKING DAY RECORDS
                ----------------------------------------- */

                const latestDayRecords =
                  latestDay !== null
                    ? records.filter(
                        (record) =>
                          record.booking_day ===
                          latestDay
                      )
                    : [];

                const latestGross =
                  latestDayRecords.reduce(
                    (
                      total,
                      record
                    ) =>
                      total +
                      Number(
                        record.gross || 0
                      ),
                    0
                  );

                const latestAdmissions =
                  latestDayRecords.reduce(
                    (
                      total,
                      record
                    ) =>
                      total +
                      Number(
                        record.admissions ||
                          0
                      ),
                    0
                  );

                const latestShows =
                  latestDayRecords.reduce(
                    (
                      total,
                      record
                    ) =>
                      total +
                      Number(
                        record.show_count ||
                          0
                      ),
                    0
                  );

                const isLive =
                  intelligence.tracking_status ===
                  "LIVE";

                return (

                  <Link
                    key={
                      intelligence.id
                    }
                    href={`/preview/movies/${movie.id}/advance-booking`}
                    className="group overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 transition hover:border-violet-500/40 hover:bg-zinc-900"
                  >

                    {/* POSTER */}

                    <div className="relative aspect-[16/15] overflow-hidden bg-zinc-900">

                      {movie.poster_url ? (

                        <img
                          src={
                            movie.poster_url
                          }
                          alt={
                            movie.title
                          }
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.14em] text-zinc-700">
                          No Poster
                        </div>

                      )}


                      {/* STATUS */}

                      <div className="absolute left-2 top-2">

                        {isLive ? (

                          <span className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-black/80 px-2 py-1 text-[6px] font-semibold uppercase tracking-[0.12em] text-red-400 backdrop-blur-sm">

                            <span className="relative flex h-1 w-1">

                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/90" />

                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />

                            </span>

                            Live Tracking

                          </span>

                        ) : (

                          <span
                            className={`rounded-full border bg-black/80 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm ${
                              intelligence.tracking_status ===
                              "COMPLETED"
                                ? "border-emerald-500/20 text-emerald-400"
                                : "border-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {
                              intelligence.tracking_status
                            }
                          </span>

                        )}

                      </div>

                    </div>


                    {/* CONTENT */}

                    <div className="p-2">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="truncate text-[9px] font-semibold text-zinc-100 group-hover:text-white">
                            {movie.title}
                          </h3>

                          <p className="mt-1 text-[8px] text-yellow-500">
                            {movie.release_date
                              ? formatDate(
                                  movie.release_date
                                )
                              : movie.release_year ||
                                "Release date unavailable"}
                          </p>

                        </div>


                        <span className="shrink-0 text-[8px] text-violet-400 opacity-80 transition group-hover:opacity-100">
                          View →
                        </span>

                      </div>


                      {/* LATEST DAY */}

                      <div className="mt-3 flex items-center justify-between border-t border-zinc-900 pt-3">

                        <div>

                          <p className="text-[6px] uppercase tracking-[0.12em] text-zinc-400">
                            Latest Tracking
                          </p>

                          <p className="mt-1 text-[9px] font-medium text-green-300">
                            {latestDay !==
                            null
                              ? `Day ${latestDay}`
                              : "No data yet"}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-[6px] uppercase tracking-[0.12em] text-zinc-400">
                            Date
                          </p>

                          <p className="mt-1 text-[9px] text-zinc-400">
                            {latestDate
                              ? formatDate(
                                  latestDate
                                )
                              : "—"}
                          </p>

                        </div>

                      </div>


                      {/* FIGURES */}

                      <div className="mt-3 grid grid-cols-3 gap-2">

                        <div className="rounded-md border border-zinc-900 bg-black px-2 py-2">

                          <p className="text-[5px] uppercase tracking-[0.1em] text-zinc-400">
                            Gross
                          </p>

                          <p className="mt-1 text-[7px] font-normal text-yellow-400">
                            {latestDay !==
                            null
                              ? formatCompactMoney(
                                  latestGross
                                )
                              : "—"}
                          </p>

                        </div>


                        <div className="rounded-md border border-zinc-900 bg-black px-2 py-2">

                          <p className="text-[5px] uppercase tracking-[0.1em] text-zinc-400">
                            Admissions
                          </p>

                          <p className="mt-1 text-[7px] font-semibold text-zinc-300">
                            {latestDay !==
                            null
                              ? formatNumber(
                                  latestAdmissions
                                )
                              : "—"}
                          </p>

                        </div>


                        <div className="rounded-md border border-zinc-900 bg-black px-2 py-2">

                          <p className="text-[5px] uppercase tracking-[0.1em] text-zinc-400">
                            Shows
                          </p>

                          <p className="mt-1 text-[7px] font-semibold text-zinc-300">
                            {latestDay !==
                            null
                              ? formatNumber(
                                  latestShows
                                )
                              : "—"}
                          </p>

                        </div>

                      </div>


                      {/* TRACKING DAYS */}

                      <div className="mt-3 flex items-center justify-between">

                        <span className="text-[7px] text-green-500">
                          {records.length}{" "}
                          tracked day
                          {records.length !==
                          1
                            ? "s"
                            : ""}
                        </span>

                        <span className="text-[7px] text-red-500">
                          JMI Live Data
                        </span>

                      </div>

                    </div>

                  </Link>

                );
              }
            )}

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

       <footer className="border-t border-zinc-900">

        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div>

              <p className="font-serif text-sm font-medium text-zinc-300">
                Jeruto{" "}
                <span className="text-yellow-400">
                  Movie Intelligence
                </span>
              </p>

              <p className="mt-1 text-[9px] text-zinc-500">
                India's Next Generation Movie Intelligence Platform
              </p>

            </div>

            <p className="text-[9px] text-zinc-500">
              JMI · Live Tracking Intelligence
            </p>

          </div>

        </div>

      </footer>
      </main>

    </div>
  );
}