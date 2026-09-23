import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

import AdvanceBookingDayTable from "./AdvanceBookingDayTable";

type Props = {
  params: Promise<{
    movieId: string;
  }>;
};

type Movie = {
  id: number;
  title: string;
  release_date: string | null;
  release_year: number | null;
  poster_url: string | null;
};

type State = {
  id: number;
  name: string;
};

type DailyAdvanceBookingRecord = {
  id: number;
  movie_id: number;
  booking_day: number;
  booking_date: string | null;
  coverage_type:
    | "STATE"
    | "REST_OF_INDIA";
  state_id: number | null;
  gross: number | null;
  admissions: number | null;
  show_count: number | null;
  notes: string | null;
  updated_at: string;
};

/* =========================================================
   FORMATTERS
========================================================= */

function formatCollection(
  value: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (value === 0) {
    return "₹0";
  }

  return (
    "₹" +
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value)
  );
}

function formatNumber(
  value: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
}

function formatUpdatedAt(
  value: string
) {
  return new Date(
    value
  ).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatDate(
  value: string
) {
  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function AdvanceBookingPublicPage({
  params,
}: Props) {
  const { movieId } =
    await params;

  const numericMovieId =
    Number(movieId);

  if (
    !Number.isFinite(
      numericMovieId
    )
  ) {
    notFound();
  }

  /* =======================================================
     MOVIE
  ======================================================= */

  const {
    data: movie,
    error: movieError,
  } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      release_date,
      release_year,
      poster_url
    `)
    .eq(
      "id",
      numericMovieId
    )
    .single();

  if (
    movieError ||
    !movie
  ) {
    notFound();
  }

  /* =======================================================
     STATES
  ======================================================= */

  const {
    data: states,
    error: statesError,
  } = await supabase
    .from("states")
    .select(`
      id,
      name
    `)
    .order("name", {
      ascending: true,
    });

  if (statesError) {
    console.error(
      "Advance booking states error:",
      statesError
    );
  }

  const stateList: State[] =
    states || [];

  /* =======================================================
     DAILY LIVE TRACKING DATA

     IMPORTANT:
     We intentionally do NOT read from
     movie_advance_booking.

     Public advance booking is powered entirely by
     movie_advance_booking_daily.
  ======================================================= */

  const {
    data: dailyData,
    error: dailyError,
  } = await supabase
    .from(
      "movie_advance_booking_daily"
    )
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
      notes,
      updated_at
    `)
    .eq(
      "movie_id",
      numericMovieId
    )
    .order(
      "booking_day",
      {
        ascending: true,
      }
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    );

  if (dailyError) {
    console.error(
      "Advance booking daily public page error:",
      dailyError
    );
  }

  const records: DailyAdvanceBookingRecord[] =
    (dailyData ||
      []) as DailyAdvanceBookingRecord[];

  /* =======================================================
     STATE NAME
  ======================================================= */

  function getStateName(
    stateId: number | null
  ) {
    if (
      stateId === null
    ) {
      return "Rest of India";
    }

    const state =
      stateList.find(
        (item) =>
          item.id === stateId
      );

    return (
      state?.name ||
      "Unknown State"
    );
  }

  /* =======================================================
     LATEST UPDATE
  ======================================================= */

  const latestUpdatedAt =
    records.length > 0
      ? records.reduce(
          (
            latest,
            record
          ) => {
            if (
              !latest
            ) {
              return record.updated_at;
            }

            return new Date(
              record.updated_at
            ).getTime() >
              new Date(
                latest
              ).getTime()
              ? record.updated_at
              : latest;
          },
          null as string | null
        )
      : null;

  /* =======================================================
     OVERALL TOTALS
  ======================================================= */

  const totalTrackedGross =
    records.reduce(
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

  const totalAdmissions =
    records.reduce(
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

  const totalShows =
    records.reduce(
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

  const uniqueDays =
    Array.from(
      new Set(
        records.map(
          (record) =>
            record.booking_day
        )
      )
    ).sort(
      (a, b) => a - b
    );

  const daysTracked =
    uniqueDays.length;

  const territoriesTracked =
    records.length;

  const stateRecords =
    records.filter(
      (record) =>
        record.coverage_type ===
        "STATE"
    ).length;

  const restOfIndiaRecords =
    records.filter(
      (record) =>
        record.coverage_type ===
        "REST_OF_INDIA"
    ).length;

  /* =======================================================
     GROUP BY DAY

     booking_date is now included and passed to the
     interactive public table.
  ======================================================= */

  const groupedDays =
    uniqueDays.map(
      (day) => {
        const dayRecords =
          records.filter(
            (record) =>
              record.booking_day ===
              day
          );

        const dayGross =
          dayRecords.reduce(
            (
              total,
              record
            ) =>
              total +
              Number(
                record.gross ||
                  0
              ),
            0
          );

        const dayAdmissions =
          dayRecords.reduce(
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

        const dayShows =
          dayRecords.reduce(
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

        const dayLatestUpdatedAt =
          dayRecords.reduce(
            (
              latest,
              record
            ) => {
              if (
                !latest
              ) {
                return record.updated_at;
              }

              return new Date(
                record.updated_at
              ).getTime() >
                new Date(
                  latest
                ).getTime()
                ? record.updated_at
                : latest;
            },
            null as string | null
          );

        /*
         * All territory records belonging to
         * one booking day should have the same
         * booking_date.
         */
        const bookingDate =
          dayRecords.find(
            (record) =>
              record.booking_date
          )?.booking_date ||
          null;

        return {
          day,
          date:
            bookingDate,
          records:
            dayRecords.map(
              (record) => ({
                id:
                  record.id,
                booking_day:
                  record.booking_day,
                booking_date:
                  record.booking_date,
                coverage_type:
                  record.coverage_type,
                territory_name:
                  record.coverage_type ===
                  "REST_OF_INDIA"
                    ? "Rest of India"
                    : getStateName(
                        record.state_id
                      ),
                gross:
                  record.gross,
                admissions:
                  record.admissions,
                show_count:
                  record.show_count,
                notes:
                  record.notes,
                updated_at:
                  record.updated_at,
              })
            ),
          gross:
            dayGross,
          admissions:
            dayAdmissions,
          shows:
            dayShows,
          latestUpdatedAt:
            dayLatestUpdatedAt,
        };
      }
    );

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            BACK TO MOVIE
        ================================================= */}

        <div className="mb-4">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>
              Back to Movie
            </span>
          </Link>

        </div>


        {/* =================================================
            MOVIE HEADER
        ================================================= */}

        <section className="border-b border-zinc-900 pb-6">

          <div className="flex items-start gap-4">

            {movie.poster_url ? (

              <img
                src={
                  movie.poster_url
                }
                alt={
                  movie.title
                }
                className="h-[115px] w-[77px] shrink-0 rounded-lg border border-zinc-800 object-cover sm:h-[145px] sm:w-[97px]"
              />

            ) : (

              <div className="flex h-[115px] w-[77px] shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-[8px] text-zinc-700 sm:h-[145px] sm:w-[97px]">
                No Poster
              </div>

            )}

            <div className="min-w-0 pt-1">

              <div className="flex items-center gap-2">

                <span className="relative flex h-2 w-2">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/40" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />

                </span>

                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-red-400">
                  Live Advance Booking
                </p>

              </div>

              <h1 className="mt-2 text-base font-medium text-zinc-100 sm:text-xl">
                {movie.title}
              </h1>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-zinc-500">

                {movie.release_year && (
                  <span>
                    {
                      movie.release_year
                    }
                  </span>
                )}

                {movie.release_date && (
                  <span>
                    {formatDate(
                      movie.release_date
                    )}
                  </span>
                )}

              </div>

              <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-400">
                Real-time pre-release theatrical
                advance booking performance tracked
                through JMI's live territory-level
                tracking system.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            CURRENT DATA NOTE
        ================================================= */}

        <section className="mt-5 rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3">

          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            Current Real-time Advance Booking Data
          </p>

          <p className="mt-1 text-[9px] leading-5 text-zinc-500">
            Figures shown on this page are based on
            the day-wise territory-level advance booking
            records manually tracked and updated by JMI.
            Historical days remain preserved when newer
            tracking data is entered.
          </p>

        </section>


        {/* =================================================
            LIVE STATUS
        ================================================= */}

        <section className="mt-6">

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3">

            <div className="flex items-center gap-2">

              <span className="relative flex h-2.5 w-2.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/40" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />

              </span>

              <div>

                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-red-400">
                  Live Tracking
                </p>

                <p className="mt-1 text-[8px] text-zinc-600">
                  JMI advance booking intelligence
                </p>

              </div>

            </div>

            <div className="text-right">

              <p className="text-[7px] uppercase tracking-[0.12em] text-green-400">
                Last Updated
              </p>

              <p className="mt-1 text-[8.5px] font-medium text-zinc-400">
                {latestUpdatedAt
                  ? formatUpdatedAt(
                      latestUpdatedAt
                    )
                  : "No data yet"}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Advance Booking Overview
            </p>

            <h2 className="mt-1 text-sm font-medium text-yellow-500">
              Current Tracking Performance
            </h2>

            <p className="mt-1 text-[9px] text-zinc-500">
              Aggregate figures calculated from all
              day-wise records currently tracked by JMI.
            </p>

          </div>


          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-400">
                Total Tracked Gross
              </p>

              <p className="mt-2 text-sm font-semibold text-yellow-400">
                {formatCollection(
                  totalTrackedGross
                )}
              </p>

              <p className="mt-1 text-[8px] text-zinc-600">
                Across recorded days
              </p>

            </div>


            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-400">
                Admissions
              </p>

              <p className="mt-2 text-sm font-semibold text-zinc-200">
                {formatNumber(
                  totalAdmissions
                )}
              </p>

              <p className="mt-1 text-[8px] text-zinc-500">
                Tracked admissions
              </p>

            </div>


            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-400">
                Shows Tracked
              </p>

              <p className="mt-2 text-sm font-semibold text-zinc-200">
                {formatNumber(
                  totalShows
                )}
              </p>

              <p className="mt-1 text-[8px] text-zinc-600">
                Recorded shows
              </p>

            </div>


            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-400">
                Days Tracked
              </p>

              <p className="mt-2 text-sm font-semibold text-violet-400">
                {formatNumber(
                  daysTracked
                )}
              </p>

              <p className="mt-1 text-[8px] text-zinc-600">
                Day 0 onward
              </p>

            </div>


            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-400">
                Territory Records
              </p>

              <p className="mt-2 text-sm font-semibold text-zinc-200">
                {formatNumber(
                  territoriesTracked
                )}
              </p>

              <p className="mt-1 text-[8px] text-zinc-600">
                State + ROI records
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            TRACKING COVERAGE
        ================================================= */}

        <section className="mt-5">

          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
                  Tracking Coverage
                </p>

                <p className="mt-1 text-[9px] leading-5 text-zinc-500">
                  Territory records currently available
                  within the JMI live tracking database.
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full border border-zinc-800 bg-black px-3 py-1.5 text-[8px] text-zinc-400">
                  {stateRecords} State Records
                </span>

                <span className="rounded-full border border-zinc-800 bg-black px-3 py-1.5 text-[8px] text-zinc-400">
                  {restOfIndiaRecords} ROI Records
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            INTERACTIVE DAY / DATE TABLE
        ================================================= */}

        {groupedDays.length === 0 ? (

          <section className="mt-7">

            <div className="mb-4">

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                Day-wise Intelligence
              </p>

              <h2 className="mt-1 text-sm font-medium text-yellow-500">
                Advance Booking Timeline
              </h2>

            </div>

            <div className="rounded-xl border border-dashed border-zinc-900 bg-zinc-950 p-8 text-center">

              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-zinc-900 bg-black">

                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />

              </div>

              <p className="mt-4 text-[10px] font-medium text-zinc-400">
                No live advance booking data available.
              </p>

              <p className="mt-2 text-[9px] leading-5 text-zinc-700">
                JMI has not yet recorded day-wise
                advance booking data for this movie.
              </p>

            </div>

          </section>

        ) : (

          <AdvanceBookingDayTable
            days={groupedDays}
          />

        )}


        {/* =================================================
            TRACKING SUMMARY
        ================================================= */}

        {groupedDays.length > 0 && (

          <section className="mt-7">

            <div className="mb-4">

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                Tracking Summary
              </p>

              <h2 className="mt-1 text-sm font-medium text-yellow-500">
                JMI Live Booking Record
              </h2>

            </div>


            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              


              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

                <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-400">
                  Days Recorded
                </p>

                <p className="mt-2 text-sm font-semibold text-zinc-200">
                  {
                    uniqueDays.length
                  }
                </p>

              </div>


              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

                <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-400">
                  Last Updated
                </p>

                <p className="mt-2 text-[10px] font-medium text-green-400">
                  {latestUpdatedAt
                    ? formatUpdatedAt(
                        latestUpdatedAt
                      )
                    : "—"}
                </p>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            DATA NOTE
        ================================================= */}

        <section className="mt-7 rounded-xl border border-zinc-900 bg-zinc-950 p-4">

          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            Data Note
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            Advance booking figures shown here are
            based on the online ticket-booking data
           tracked by JMI. The tracking system
            may not cover every screen, show or releasing
            centre across all territories. Therefore,
            these figures represent JMI's tracked
            coverage and should not be interpreted as
            a complete industry-wide census of advance
            ticket sales.
          </p>

        </section>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <section className="mt-6 space-y-2">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="block rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3 text-center text-[9px] text-violet-400 transition hover:border-violet-800 hover:bg-violet-950/20 hover:text-violet-300"
          >
            ← Back to Movie Intelligence
          </Link>

          <Link
            href="/preview"
            className="block rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 text-center text-[9px] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
          >
            Back to JMI Home
          </Link>

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