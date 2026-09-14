import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "../../../../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type DailyRecord = {
  id: number;
  collection_date: string;
  day_number: number | null;
  gross_jmi: number | null;
  net_jmi: number | null;
  admissions: number | null;
  show_count: number | null;
  status_id: number | null;
  notes: string | null;
};

export default async function DayWiseBoxOfficePage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;

  // --------------------------------------------------
  // Movie
  // --------------------------------------------------

  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      release_year,
      poster_url
    `)
    .eq("id", movieId)
    .eq("is_active", true)
    .single();

  if (movieError || !movie) {
    console.error(
      "JMI Day-wise Movie Error:",
      movieError
    );

    notFound();
  }

  // --------------------------------------------------
  // Daily Box Office
  // --------------------------------------------------

  const { data: dailyData, error: dailyError } =
    await supabase
      .from("movie_daily_box_office")
      .select(`
        id,
        collection_date,
        day_number,
        gross_jmi,
        net_jmi,
        admissions,
        show_count,
        status_id,
        notes
      `)
      .eq("movie_id", movie.id)
      .eq("country_id", 1)
      .order("collection_date", {
        ascending: true,
      });

  if (dailyError) {
    console.error(
      "JMI Day-wise Box Office Error:",
      dailyError
    );
  }

  const records: DailyRecord[] = dailyData ?? [];

  // --------------------------------------------------
  // Calculations
  // --------------------------------------------------

  const indiaGross = records.reduce(
    (total, record) =>
      total + Number(record.gross_jmi || 0),
    0
  );

  const indiaNet = records.reduce(
    (total, record) =>
      total + Number(record.net_jmi || 0),
    0
  );

  const indiaAdmissions = records.reduce(
    (total, record) =>
      total + Number(record.admissions || 0),
    0
  );

  const totalShows = records.reduce(
    (total, record) =>
      total + Number(record.show_count || 0),
    0
  );

  const hasData =
    records.length > 0 &&
    (indiaGross > 0 ||
      indiaNet > 0 ||
      indiaAdmissions > 0);

  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  function formatCrores(value: number) {
    if (!value || value <= 0) return "—";

    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }

    return `₹${(value / 100000).toFixed(2)} L`;
  }

  function formatNumber(value: number) {
    if (!value || value <= 0) return "—";

    return new Intl.NumberFormat("en-IN").format(
      value
    );
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getDayLabel(
    dayNumber: number | null,
    index: number
  ) {
    if (dayNumber === 0) {
      return "Premier";
    }

    return `Day ${dayNumber ?? index + 1}`;
  }

  function getStatus(statusId: number | null) {
    switch (statusId) {
      case 1:
        return "Estimated";

      case 2:
        return "Official";

      case 3:
        return "Actual";

      case 4:
        return "Revised";

      case 5:
        return "Projected";

      default:
        return "—";
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />

      <main>

        {/* ================================================= */}
        {/* MOVIE HEADER */}
        {/* ================================================= */}

        <section className="border-b border-zinc-900">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">

            <Link
              href={`/preview/movies/${movie.id}`}
              className="text-[9px] uppercase tracking-[0.2em] text-violet-700 transition hover:text-violet-400"
            >
              ← Back to Movie
            </Link>

            <div className="mt-8 flex items-start gap-4">

              {/* Poster */}

              <div className="h-[105px] w-[70px] flex-shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 sm:h-[135px] sm:w-[90px]">

                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={`${movie.title} poster`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xl text-zinc-800">
                      ◈
                    </span>
                  </div>
                )}

              </div>

              {/* Title */}

              <div className="min-w-0">

                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                  India Box Office
                </p>

                <h1 className="mt-2 text-xl font-medium leading-tight tracking-[-0.03em] text-zinc-100 sm:text-2xl">
                  {movie.title}
                </h1>

                {movie.release_year && (
                  <p className="mt-1 text-[9px] text-zinc-600">
                    {movie.release_year}
                  </p>
                )}

              </div>

            </div>

          </div>
        </section>

        {/* ================================================= */}
        {/* DAY-WISE INTELLIGENCE */}
        {/* ================================================= */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              Day-wise Collection
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Daily theatrical performance.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
              JMI day-level theatrical collection recorded
              across the Indian domestic market.
            </p>

            {/* ================================================= */}
            {/* SUMMARY */}
            {/* ================================================= */}

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

              {/* Gross */}

              <div className="rounded-xl border border-violet-400/20 bg-zinc-950 px-4 py-5">

                <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-700">
                  India Gross
                </p>

                <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-violet-400 sm:text-xl">
                  {formatCrores(indiaGross)}
                </p>

              </div>

              {/* Net */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-5">

                <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-700">
                  India Net
                </p>

                <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-zinc-200 sm:text-xl">
                  {formatCrores(indiaNet)}
                </p>

              </div>

              {/* Footfalls */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-5">

                <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-700">
                  Footfalls
                </p>

                <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-zinc-200 sm:text-xl">
                  {formatNumber(indiaAdmissions)}
                </p>

              </div>

              {/* Shows */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-5">

                <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-700">
                  Total Shows
                </p>

                <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-zinc-200 sm:text-xl">
                  {formatNumber(totalShows)}
                </p>

              </div>

            </div>

            {/* ================================================= */}
            {/* DAILY PERFORMANCE */}
            {/* ================================================= */}

            <div className="mt-10">

              <div className="mb-4">

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
                  Daily Performance
                </p>

                <p className="mt-1 text-[9px] text-zinc-600">
                  India theatrical collection by day.
                </p>

              </div>

              {!hasData ? (

                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-10 text-center">

                  <p className="text-[9px] text-zinc-600">
                    Day-wise box office data is not
                    available yet.
                  </p>

                  <p className="mt-2 text-[8px] text-zinc-800">
                    JMI will display daily theatrical
                    intelligence when verified data
                    becomes available.
                  </p>

                </div>

              ) : (

                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

                  {/* ================================================= */}
                  {/* DESKTOP HEADER */}
                  {/* ================================================= */}

                  <div className="hidden grid-cols-[80px_1fr_110px_110px_110px_90px] border-b border-zinc-800 px-5 py-3 sm:grid">

                    <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Day
                    </p>

                    <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Date
                    </p>

                    <p className="text-right text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Gross
                    </p>

                    <p className="text-right text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Net
                    </p>

                    <p className="text-right text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Footfalls
                    </p>

                    <p className="text-right text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Shows
                    </p>

                  </div>

                  {/* ================================================= */}
                  {/* RECORDS */}
                  {/* ================================================= */}

                  {records.map((record, index) => (

                    <div
                      key={record.id}
                      className="border-b border-zinc-900 last:border-b-0"
                    >

                      {/* ------------------------------ */}
                      {/* MOBILE */}
                      {/* ------------------------------ */}

                      <div className="px-4 py-4 sm:hidden">

                        <div className="flex items-center justify-between">

                          <div>

                            <p
                              className={
                                record.day_number === 0
                                  ? "text-[10px] font-semibold text-violet-400"
                                  : "text-[10px] font-medium text-zinc-200"
                              }
                            >
                              {getDayLabel(
                                record.day_number,
                                index
                              )}
                            </p>

                            <p className="mt-1 text-[8px] text-zinc-600">
                              {formatDate(
                                record.collection_date
                              )}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-[11px] font-medium text-zinc-100">
                              {formatCrores(
                                Number(
                                  record.gross_jmi || 0
                                )
                              )}
                            </p>

                            <p className="mt-0.5 text-[8px] text-zinc-600">
                              Gross
                            </p>

                          </div>

                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-900 pt-3">

                          <div>

                            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                              Net
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-300">
                              {formatCrores(
                                Number(
                                  record.net_jmi || 0
                                )
                              )}
                            </p>

                          </div>

                          <div>

                            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                              Footfalls
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-300">
                              {formatNumber(
                                Number(
                                  record.admissions || 0
                                )
                              )}
                            </p>

                          </div>

                          <div>

                            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                              Shows
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-300">
                              {record.show_count === null
                                ? "—"
                                : formatNumber(
                                    Number(
                                      record.show_count
                                    )
                                  )}
                            </p>

                          </div>

                        </div>

                        {record.status_id && (
                          <div className="mt-3">

                            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[7px] uppercase tracking-[0.12em] text-zinc-600">
                              {getStatus(
                                record.status_id
                              )}
                            </span>

                          </div>
                        )}

                      </div>

                      {/* ------------------------------ */}
                      {/* DESKTOP */}
                      {/* ------------------------------ */}

                      <div className="hidden grid-cols-[80px_1fr_110px_110px_110px_90px] items-center px-5 py-4 sm:grid">

                        <p
                          className={
                            record.day_number === 0
                              ? "text-[9px] font-semibold text-violet-400"
                              : "text-[9px] font-medium text-zinc-300"
                          }
                        >
                          {getDayLabel(
                            record.day_number,
                            index
                          )}
                        </p>

                        <p className="text-[9px] text-zinc-500">
                          {formatDate(
                            record.collection_date
                          )}
                        </p>

                        <p className="text-right text-[9px] font-medium text-zinc-200">
                          {formatCrores(
                            Number(
                              record.gross_jmi || 0
                            )
                          )}
                        </p>

                        <p className="text-right text-[9px] text-zinc-400">
                          {formatCrores(
                            Number(
                              record.net_jmi || 0
                            )
                          )}
                        </p>

                        <p className="text-right text-[9px] text-zinc-400">
                          {formatNumber(
                            Number(
                              record.admissions || 0
                            )
                          )}
                        </p>

                        <p className="text-right text-[9px] text-zinc-500">
                          {record.show_count === null
                            ? "—"
                            : formatNumber(
                                Number(
                                  record.show_count
                                )
                              )}
                        </p>

                      </div>

                    </div>

                  ))}

                  {/* ================================================= */}
                  {/* TOTAL */}
                  {/* ================================================= */}

                  <div className="grid grid-cols-[1fr_auto] items-center border-t border-zinc-800 bg-zinc-900/30 px-4 py-4 sm:px-5">

                    <div>

                      <p className="text-[9px] font-semibold text-zinc-300">
                        India Total
                      </p>

                      <p className="mt-0.5 text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                        Cumulative recorded collection
                      </p>

                    </div>

                    <p className="text-[10px] font-semibold text-violet-400">
                      {formatCrores(indiaGross)}
                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-3 sm:flex-row">

              <Link
                href={`/preview/movies/${movie.id}/box-office/india/state-wise`}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-zinc-500 transition hover:border-violet-400/30 hover:text-violet-400"
              >
                State-wise Collection →
              </Link>

              <Link
                href={`/preview/movies/${movie.id}`}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-zinc-500 transition hover:border-violet-400/30 hover:text-violet-400"
              >
                ← Movie Intelligence
              </Link>

            </div>

          </div>

        </section>

      </main>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="border-t border-zinc-900">

        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <p className="font-serif text-sm text-zinc-300">
              Jeruto{" "}
              <span className="text-yellow-400">
                Movie Intelligence
              </span>
            </p>

            <p className="text-[9px] text-zinc-700">
              JMI · Indian Movie Intelligence
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}