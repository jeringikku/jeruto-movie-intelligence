import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "../../../../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type LanguageRecord = {
  id: number;
  language_name: string;
  gross_jmi: number | null;
  net_jmi: number | null;
  admissions: number | null;
  status_id: number | null;
};

export default async function LanguageWiseBoxOfficePage({
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
      "JMI Language-wise Movie Error:",
      movieError
    );

    notFound();
  }

  // --------------------------------------------------
  // Language-wise data
  // --------------------------------------------------

  const { data: languageData, error: languageError } =
    await supabase
      .from("movie_language_box_office")
      .select(`
        id,
        language_name,
        gross_jmi,
        net_jmi,
        admissions,
        status_id
      `)
      .eq("movie_id", movie.id)
      .order("language_name", {
        ascending: true,
      });

  if (languageError) {
    console.error(
      "JMI Language-wise Box Office Error:",
      languageError
    );
  }

  const records: LanguageRecord[] =
    (languageData as LanguageRecord[] | null) ?? [];

  // --------------------------------------------------
  // Parallel breakdown base
  // --------------------------------------------------

  /*
   * IMPORTANT:
   *
   * Language-wise figures are parallel breakdowns.
   * They must NOT be added together and presented
   * as the movie's India Gross.
   *
   * grossBase is used only to show the distribution
   * of the recorded language-wise figures.
   */

  const grossBase = records.reduce(
    (total, record) =>
      total + Number(record.gross_jmi || 0),
    0
  );

  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  function formatCrores(value: number) {
    if (!value || value <= 0) {
      return "—";
    }

    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }

    return `₹${(value / 100000).toFixed(2)} L`;
  }

  function formatNumber(value: number) {
    if (!value || value <= 0) {
      return "—";
    }

    return new Intl.NumberFormat("en-IN").format(
      value
    );
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

  function getGrossShare(value: number) {
    if (!grossBase || value <= 0) {
      return 0;
    }

    return (value / grossBase) * 100;
  }

  const hasData = records.length > 0;

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

              {/* Movie information */}

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
        {/* LANGUAGE-WISE INTELLIGENCE */}
        {/* ================================================= */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              Language-wise Collection
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Language market performance.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
              Current cumulative theatrical performance
              recorded across language markets in India.
            </p>

            {/* ================================================= */}
            {/* INFORMATION NOTE */}
            {/* ================================================= */}

            <div className="mt-7 rounded-xl border border-violet-400/15 bg-zinc-950 px-5 py-4">

              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                Current Cumulative Data
              </p>

              <p className="mt-2 text-[9px] leading-5 text-zinc-600">
                Language-wise figures represent the latest
                cumulative performance recorded for each
                language. These are independent breakdowns
                and are not combined into an India total.
              </p>

            </div>

            {/* ================================================= */}
            {/* LANGUAGE PERFORMANCE */}
            {/* ================================================= */}

            <div className="mt-8">

              <div className="mb-4">

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
                  Language Performance
                </p>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Latest cumulative figures by language.
                </p>

              </div>

              {!hasData ? (

                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-10 text-center">

                  <p className="text-[9px] text-zinc-600">
                    Language-wise box office data is not
                    available yet.
                  </p>

                  <p className="mt-2 text-[8px] text-zinc-800">
                    JMI will display language intelligence
                    when verified data becomes available.
                  </p>

                </div>

              ) : (

                <div className="space-y-2">

                  {records.map((record) => {

                    const gross =
                      Number(record.gross_jmi || 0);

                    const net =
                      Number(record.net_jmi || 0);

                    const admissions =
                      Number(record.admissions || 0);

                    const share =
                      getGrossShare(gross);

                    return (
                      <div
                        key={record.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-violet-400/20 sm:p-5"
                      >

                        {/* ================================================= */}
                        {/* LANGUAGE HEADER */}
                        {/* ================================================= */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <p className="text-[10px] font-medium text-zinc-200">
                              {record.language_name}
                            </p>

                            <p className="mt-1 text-[7px] uppercase tracking-[0.16em] text-zinc-700">
                              Current cumulative performance
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-[12px] font-medium text-violet-400">
                              {formatCrores(gross)}
                            </p>

                            <p className="mt-0.5 text-[7px] uppercase tracking-[0.12em] text-zinc-700">
                              Gross
                            </p>

                          </div>

                        </div>

                        {/* ================================================= */}
                        {/* LANGUAGE DISTRIBUTION */}
                        {/* ================================================= */}

                        {grossBase > 0 && gross > 0 && (

                          <div className="mt-4">

                            <div className="flex items-center justify-between">

                              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                                Language distribution
                              </p>

                              <p className="text-[8px] text-zinc-500">
                                {share.toFixed(1)}%
                              </p>

                            </div>

                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-900">

                              <div
                                className="h-full rounded-full bg-violet-400/50"
                                style={{
                                  width: `${Math.min(
                                    share,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        )}

                        {/* ================================================= */}
                        {/* DETAILS */}
                        {/* ================================================= */}

                        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-900 pt-3">

                          <div>

                            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                              Net
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-300">
                              {formatCrores(net)}
                            </p>

                          </div>

                          <div>

                            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                              Footfalls
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-300">
                              {formatNumber(
                                admissions
                              )}
                            </p>

                          </div>

                          <div>

                            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                              Status
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-500">
                              {getStatus(
                                record.status_id
                              )}
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>

              )}

            </div>

            {/* ================================================= */}
            {/* LANGUAGE SNAPSHOT */}
            {/* ================================================= */}

            {hasData && (

              <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-5">

                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  Language Snapshot
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">

                  {/* Languages */}

                  <div>

                    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                      Languages Tracked
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {records.length}
                    </p>

                  </div>

                  {/* Gross records */}

                  <div>

                    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                      Gross Records
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {records.filter(
                        (record) =>
                          Number(
                            record.gross_jmi || 0
                          ) > 0
                      ).length}
                    </p>

                  </div>

                  {/* Footfall records */}

                  <div>

                    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                      Footfall Records
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {records.filter(
                        (record) =>
                          record.admissions !== null
                      ).length}
                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </section>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-3 sm:flex-row">

              <Link
                href={`/preview/movies/${movie.id}/box-office/india/format-wise`}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-zinc-500 transition hover:border-violet-400/30 hover:text-violet-400"
              >
                ← Format-wise Collection
              </Link>

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
                Movie Intelligence
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