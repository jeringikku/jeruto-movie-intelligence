import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

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

type AdvanceBookingRecord = {
  id: number;
  movie_id: number;
  coverage_type: "STATE" | "REST_OF_INDIA";
  state_id: number | null;
  gross: number | null;
  admissions: number | null;
  show_count: number | null;
  notes: string | null;
  updated_at: string;
};

function formatCollection(value: number | null) {
  if (
    value === null ||
    value === undefined ||
    value === 0
  ) {
    return "—";
  }

  return (
    "₹" +
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value)
  );
}

function formatNumber(value: number | null) {
  if (
    value === null ||
    value === undefined ||
    value === 0
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN").format(value);
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdvanceBookingPublicPage({
  params,
}: Props) {
  const { movieId } = await params;

  const numericMovieId = Number(movieId);

  if (!Number.isFinite(numericMovieId)) {
    notFound();
  }

  /* ---------------------------------------------------------
     MOVIE
  --------------------------------------------------------- */

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
    .eq("id", numericMovieId)
    .single();

  if (movieError || !movie) {
    notFound();
  }

  /* ---------------------------------------------------------
     STATES
  --------------------------------------------------------- */

  const {
    data: states,
    error: statesError,
  } = await supabase
    .from("states")
    .select(`
      id,
      name
    `)
    .order("name", { ascending: true });

  if (statesError) {
    console.error(
      "Advance booking states error:",
      statesError
    );
  }

  /* ---------------------------------------------------------
     ADVANCE BOOKING RECORDS
  --------------------------------------------------------- */

  const {
    data: advanceBookingData,
    error: advanceBookingError,
  } = await supabase
    .from("movie_advance_booking")
    .select(`
      id,
      movie_id,
      coverage_type,
      state_id,
      gross,
      admissions,
      show_count,
      notes,
      updated_at
    `)
    .eq("movie_id", numericMovieId)
    .order("updated_at", { ascending: false });

  if (advanceBookingError) {
    console.error(
      "Advance booking public page error:",
      advanceBookingError
    );
  }

  const records: AdvanceBookingRecord[] =
    (advanceBookingData || []) as AdvanceBookingRecord[];

  const stateList: State[] = states || [];

  const latestUpdatedAt =
  records.length > 0
    ? records[0].updated_at
    : null;

  /* ---------------------------------------------------------
     STATE NAME
  --------------------------------------------------------- */

  function getStateName(stateId: number | null) {
    if (!stateId) {
      return "—";
    }

    const state = stateList.find(
      (item) => item.id === stateId
    );

    return state?.name || "Unknown State";
  }

  /* ---------------------------------------------------------
     TOTALS
  --------------------------------------------------------- */

  const totalGross = records.reduce(
    (total, record) =>
      total + Number(record.gross || 0),
    0
  );

  const totalAdmissions = records.reduce(
    (total, record) =>
      total + Number(record.admissions || 0),
    0
  );

  const totalShows = records.reduce(
    (total, record) =>
      total + Number(record.show_count || 0),
    0
  );

  const stateRecords = records.filter(
    (record) =>
      record.coverage_type === "STATE"
  ).length;

  const restOfIndiaRecords = records.filter(
    (record) =>
      record.coverage_type === "REST_OF_INDIA"
  ).length;

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* -------------------------------------------------
            BACK TO MOVIE
        ------------------------------------------------- */}

        <div className="mb-4">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Movie</span>
          </Link>

        </div>

        {/* -------------------------------------------------
            MOVIE HEADER
        ------------------------------------------------- */}

        <section className="border-b border-zinc-900 pb-6">

          <div className="flex items-start gap-4">

            {/* POSTER */}

            {movie.poster_url ? (

              <img
                src={movie.poster_url}
                alt={movie.title}
                className="h-[105px] w-[70px] shrink-0 rounded-lg border border-zinc-800 object-cover sm:h-[135px] sm:w-[90px]"
              />

            ) : (

              <div className="flex h-[105px] w-[70px] shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-[8px] text-zinc-700 sm:h-[135px] sm:w-[90px]">
                No Poster
              </div>

            )}

            <div className="min-w-0 pt-1">

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                Advance Booking Trend
              </p>

              <h1 className="mt-1 text-base font-medium text-zinc-100 sm:text-lg">
                {movie.title}
              </h1>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-zinc-500">

                {movie.release_year && (
                  <span>
                    {movie.release_year}
                  </span>
                )}

                {movie.release_date && (
                  <span>
                    {new Date(
                      movie.release_date
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                )}

              </div>

              <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-400">
                Real-time Pre-release theatrical advance booking
                performance tracked by JMI.
              </p>

            </div>

          </div>

        </section>

        {/* -------------------------------------------------
            CURRENT DATA NOTE
        ------------------------------------------------- */}

        <section className="mt-5 rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3">

          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            Current Real-time Advance Booking Data
          </p>

          <p className="mt-1 text-[9px] leading-5 text-zinc-500">
            Figures are derived from the real-time tracking of ticket sales across Online ticket booking platforms tracked by JMI
          </p>

        </section>

       {/* -------------------------------------------------
            LIVE UPDATE STATUS
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3">

            <div className="flex items-center gap-2">

              {/* LIVE INDICATOR */}

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/40" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />

              </span>

              <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-red-400">
                Live Tracking
              </span>

            </div>


            {/* LAST UPDATED */}

            <div className="flex items-center gap-1.5">

              <span className="text-[7px] uppercase tracking-[0.12em] text-green-400">
                Last updated
              </span>

              <span className="text-[8.5px] font-medium text-zinc-400">
                {latestUpdatedAt
                  ? formatUpdatedAt(latestUpdatedAt)
                  : "—"}
              </span>

            </div>

          </div>

        </section>


        {/* -------------------------------------------------
            OVERVIEW
        ------------------------------------------------- */}

        <section className="mt-5">
          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Advance Booking Overview
            </p>

            <h2 className="mt-1 text-sm font-medium text-yellow-500">
              Current Booking Performance
            </h2>

            <p className="mt-1 text-[9px] text-zinc-500">
              Aggregate advance booking figures currently
              recorded for this movie.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            {/* TOTAL GROSS */}

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-500">
                Current Total Gross
              </p>

              <p className="mt-2 text-sm font-semibold text-green-400">
                {formatCollection(totalGross)}
              </p>

              <p className="mt-1 text-[8px] text-zinc-500">
                Reported advance gross
              </p>

            </div>

            {/* ADMISSIONS */}

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-500">
                Admissions
              </p>

              <p className="mt-2 text-sm font-semibold text-zinc-200">
                {formatNumber(totalAdmissions)}
              </p>

              <p className="mt-1 text-[8px] text-zinc-500">
                Tickets / admissions
              </p>

            </div>

            {/* SHOWS */}

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-500">
                No.of Shows Tracked
              </p>

              <p className="mt-2 text-sm font-semibold text-zinc-200">
                {formatNumber(totalShows)}
              </p>

              <p className="mt-1 text-[8px] text-zinc-500">
                Reported shows
              </p>

            </div>

            {/* COVERAGE */}

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-500">
                Coverage
              </p>

              <p className="mt-2 text-sm font-semibold text-zinc-200">
                {records.length}
              </p>

              <p className="mt-1 text-[8px] text-zinc-700">
                {stateRecords > 0
                  ? `${stateRecords} state`
                  : ""}
                {stateRecords > 0 &&
                restOfIndiaRecords > 0
                  ? " · "
                  : ""}
                {restOfIndiaRecords > 0
                  ? `${restOfIndiaRecords} ROI`
                  : ""}
              </p>

            </div>

          </div>

        </section>

        {/* -------------------------------------------------
            PERFORMANCE TABLE
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Market Performance
            </p>

            <h2 className="mt-1 text-sm font-medium text-yellow-500">
              Advance Booking by Territory
            </h2>

            <p className="mt-1 text-[10px] text-zinc-500">
              State-wise advance booking
              records currently available.
            </p>

          </div>

          {records.length === 0 ? (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6">

              <p className="text-[9px] text-zinc-600">
                No advance booking data is currently
                available for this movie.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">

              <table className="w-full min-w-[680px] text-xs">

                <thead>

                  <tr className="border-b border-zinc-800">

                    <th className="px-4 py-3 text-left text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                      Territory
                    </th>

                    <th className="px-4 py-3 text-right text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                      Gross
                    </th>

                    <th className="px-4 py-3 text-right text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                      Admissions
                    </th>

                    <th className="px-4 py-3 text-right text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                      Shows
                    </th>

                    <th className="px-4 py-3 text-left text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                      Updated
                    </th>

                    <th className="px-4 py-3 text-left text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                      Milestones
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {records.map((record) => (

                    <tr
                      key={record.id}
                      className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40"
                    >

                      {/* TERRITORY */}

                      <td className="px-4 py-3">

                        <div className="font-medium text-zinc-200">

                          {record.coverage_type ===
                          "REST_OF_INDIA"
                            ? "Rest of India"
                            : getStateName(
                                record.state_id
                              )}

                        </div>

                        <div className="mt-1 text-[8px] text-zinc-700">

                          {record.coverage_type ===
                          "REST_OF_INDIA"
                            ? "National coverage"
                            : "State coverage"}

                        </div>

                      </td>

                      {/* GROSS */}

                      <td className="px-4 py-3 text-right font-semibold text-yellow-400">

                        {formatCollection(
                          record.gross
                        )}

                      </td>

                      {/* ADMISSIONS */}

                      <td className="px-4 py-3 text-right text-zinc-300">

                        {formatNumber(
                          record.admissions
                        )}

                      </td>

                      {/* SHOWS */}

                      <td className="px-4 py-3 text-right text-zinc-300">

                        {formatNumber(
                          record.show_count
                        )}

                      </td>

                      {/* UPDATED */}

                      <td className="px-4 py-3 text-[9px] text-zinc-400">

                        {formatUpdatedAt(
                          record.updated_at
                        )}

                      </td>

                      {/* NOTES */}

                      <td className="max-w-[220px] px-4 py-3 text-[10px] leading-4 text-zinc-400">

                        {record.notes || "—"}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* -------------------------------------------------
            DATA NOTE
        ------------------------------------------------- */}

        <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 p-4">

          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            Data Note
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            Advance booking figures shown here are calculated from the aggregated online ticket sales tracked by JMI. Original data can be vary as JMI can not cover entire screens and shows across all releasing centers
          </p>

        </section>

        {/* -------------------------------------------------
            NAVIGATION
        ------------------------------------------------- */}

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

        {/* -------------------------------------------------
            FOOTER
        ------------------------------------------------- */}

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