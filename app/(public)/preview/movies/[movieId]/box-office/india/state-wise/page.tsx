export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "../../../../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

export default async function StateWiseBoxOfficePage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;

  // =====================================================
  // MOVIE
  // =====================================================

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
      "JMI State-wise Movie Error:",
      movieError
    );

    notFound();
  }

  // =====================================================
  // STATE-WISE BOX OFFICE
  // =====================================================

  const { data: stateBoxOffice, error: stateError } =
    await supabase
      .from("movie_state_box_office")
      .select(`
        state_id,
        gross_jmi,
        coverage_type,
        states (
          name
        )
      `)
      .eq("movie_id", movie.id);

  if (stateError) {
    console.error(
      "JMI State-wise Box Office Error:",
      stateError
    );
  }

  // =====================================================
  // ADVANCED TERRITORY AVAILABILITY
  // =====================================================

  const {
    data: advancedTerritoryData,
    error: advancedTerritoryError,
  } = await supabase
    .from("movie_trade_region_box_office")
    .select(`
      id,
      movie_id,
      trade_region_id,
      gross_jmi
    `)
    .eq("movie_id", movie.id);

  console.log(
    "JMI ADVANCED TERRITORY CHECK:",
    {
      movieId: movie.id,
      data: advancedTerritoryData,
      error: advancedTerritoryError,
    }
  );

  if (advancedTerritoryError) {
    console.error(
      "JMI Advanced Territory Availability Error:",
      advancedTerritoryError
    );
  }

  const hasAdvancedTerritoryData =
    (advancedTerritoryData?.length ?? 0) > 0;

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  function formatCrores(value: number) {
    if (!value || value <= 0) return "—";

    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }

    return `₹${(value / 100000).toFixed(2)} L`;
  }

  // =====================================================
  // PREPARE DATA
  // =====================================================

  const rows =
    stateBoxOffice?.map((row) => {
      const state = row.states;

      const stateName = Array.isArray(state)
        ? state[0]?.name
        : (state as { name?: string } | null)?.name;

      const isRestOfIndia =
        !row.state_id ||
        row.coverage_type === "REST_OF_INDIA";

      return {
        name: isRestOfIndia
          ? "Rest of India"
          : stateName ?? "Unknown",
        gross: Number(row.gross_jmi || 0),
        isRestOfIndia,
      };
    }) ?? [];

  // =====================================================
  // SORT
  // =====================================================

  const sortedRows = [...rows].sort((a, b) => {
    if (a.isRestOfIndia && !b.isRestOfIndia) return 1;
    if (!a.isRestOfIndia && b.isRestOfIndia) return -1;

    return b.gross - a.gross;
  });

  const indiaTotal = sortedRows.reduce(
    (total, row) => total + row.gross,
    0
  );

  const hasData = sortedRows.length > 0 && indiaTotal > 0;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      <main>

        {/* =================================================
            HEADER
        ================================================= */}

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


        {/* =================================================
            STATE-WISE INTELLIGENCE
        ================================================= */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              State-wise Collection
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Domestic market performance.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
              JMI state-level theatrical collection recorded
              across the Indian domestic market.
            </p>


            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="mt-7 rounded-xl border border-violet-400/20 bg-zinc-950 px-5 py-5">

              <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                India Gross
              </p>

              <p className="mt-2 text-2xl font-medium tracking-[-0.03em] text-violet-400">
                {formatCrores(indiaTotal)}
              </p>

            </div>


            {/* =================================================
                DATA TABLE
            ================================================= */}

            <div className="mt-8">

              <div className="mb-4">

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
                  Market Breakdown
                </p>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Current cumulative collection by state.
                </p>

              </div>


              {hasData ? (

                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

                  {/* Table Header */}

                  <div className="grid grid-cols-[1fr_auto] border-b border-zinc-800 px-4 py-3 sm:px-5">

                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                      State / Market
                    </p>

                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                      Gross
                    </p>

                  </div>


                  {/* Rows */}

                  {sortedRows.map((row, index) => (

                    <div
                      key={`${row.name}-${index}`}
                      className={`
                        grid
                        grid-cols-[1fr_auto]
                        items-center
                        px-4
                        py-3.5
                        sm:px-5
                        ${
                          index !== sortedRows.length - 1
                            ? "border-b border-zinc-900"
                            : ""
                        }
                      `}
                    >

                      <div>

                        <p
                          className={`
                            text-[9px]
                            font-medium
                            ${
                              row.isRestOfIndia
                                ? "text-violet-400"
                                : "text-zinc-300"
                            }
                          `}
                        >
                          {row.name}
                        </p>

                        {row.isRestOfIndia && (
                          <p className="mt-0.5 text-[7px] uppercase tracking-[0.15em] text-zinc-700">
                            Remaining domestic market
                          </p>
                        )}

                      </div>

                      <p className="text-[10px] font-medium text-zinc-200">
                        {formatCrores(row.gross)}
                      </p>

                    </div>

                  ))}


                  {/* Total */}

                  <div className="grid grid-cols-[1fr_auto] items-center border-t border-zinc-800 bg-zinc-900/30 px-4 py-4 sm:px-5">

                    <p className="text-[9px] font-semibold text-zinc-300">
                      India Total
                    </p>

                    <p className="text-[10px] font-semibold text-violet-400">
                      {formatCrores(indiaTotal)}
                    </p>

                  </div>

                </div>

              ) : (

                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-9 text-center">

                  <p className="text-[9px] text-zinc-600">
                    State-wise box office data is not available yet.
                  </p>

                  <p className="mt-2 text-[8px] text-zinc-800">
                    JMI will display this intelligence when
                    verified state-level data becomes available.
                  </p>

                </div>

              )}

            </div>

     

            </div>


            {/* =================================================
                ADVANCED TERRITORY INTELLIGENCE
            ================================================= */}

            {hasAdvancedTerritoryData && (

              <div className="mt-8 rounded-xl border border-violet-400/20 bg-zinc-950 p-5 sm:p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                      Advanced Territory Intelligence
                    </p>

                    <h3 className="mt-2 text-sm font-medium text-zinc-200">
                      Deeper regional breakdown available.
                    </h3>

                    <p className="mt-1 max-w-xl text-[9px] leading-5 text-zinc-600">
                      Explore JMI trade-region level collection
                      where detailed regional data is available.
                    </p>

                  </div>

                  <Link
                    href={`/preview/movies/${movie.id}/box-office/india/state-wise/advanced`}
                    className="inline-flex flex-shrink-0 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-400/5 px-4 py-3 text-[8px] font-semibold uppercase tracking-[0.16em] text-violet-400 transition hover:border-violet-400/50 hover:bg-violet-400/10"
                  >
                    View Advanced Breakdown →
                  </Link>

                </div>

              </div>

            )}


        </section>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <Link
              href={`/preview/movies/${movie.id}`}
              className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-zinc-500 transition hover:border-violet-400/30 hover:text-violet-400"
            >
              ← Return to Movie Intelligence
            </Link>

          </div>

        </section>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

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