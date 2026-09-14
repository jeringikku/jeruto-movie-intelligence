import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "../../../../../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

type AdvancedRegion = {
  id: number;
  name: string;
  code: string | null;
  display_order: number | null;
  state_id: number;
  state_name: string;
  gross: number;
};

export default async function AdvancedTerritoryPage({
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
      "JMI Advanced Territory Movie Error:",
      movieError
    );

    notFound();
  }

  // =====================================================
  // TRADE REGION MASTER DATA
  // =====================================================

  const {
    data: regionData,
    error: regionError,
  } = await supabase
    .from("trade_regions")
    .select(`
      id,
      state_id,
      name,
      code,
      display_order,
      states (
        name
      )
    `)
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  if (regionError) {
    console.error(
      "JMI Trade Region Error:",
      regionError
    );
  }

  // =====================================================
  // MOVIE TRADE REGION BOX OFFICE
  // =====================================================

  const {
    data: recordData,
    error: recordError,
  } = await supabase
    .from("movie_trade_region_box_office")
    .select(`
      id,
      trade_region_id,
      gross_jmi
    `)
    .eq("movie_id", movie.id);

  if (recordError) {
    console.error(
      "JMI Trade Region Box Office Error:",
      recordError
    );
  }

  // =====================================================
  // MAP ACTUAL MOVIE RECORDS
  // =====================================================

  const recordMap = new Map<
    number,
    number
  >();

  (recordData || []).forEach((record) => {
    recordMap.set(
      Number(record.trade_region_id),
      Number(record.gross_jmi || 0)
    );
  });

  // =====================================================
  // PREPARE ADVANCED REGIONS
  // =====================================================

  const advancedRegions: AdvancedRegion[] =
    (regionData || [])
      .filter((region) =>
        recordMap.has(Number(region.id))
      )
      .map((region) => {

        const state = region.states;

        const stateName =
          Array.isArray(state)
            ? state[0]?.name
            : (state as {
                name?: string;
              } | null)?.name;

        return {
          id: Number(region.id),
          name: region.name,
          code: region.code,
          display_order:
            region.display_order,
          state_id: Number(region.state_id),
          state_name:
            stateName ?? "Unknown State",
          gross:
            recordMap.get(
              Number(region.id)
            ) ?? 0,
        };
      });

  // =====================================================
  // GROUP BY STATE
  // =====================================================

  const groupedStates = new Map<
    number,
    {
      state_name: string;
      regions: AdvancedRegion[];
    }
  >();

  advancedRegions.forEach((region) => {

    if (!groupedStates.has(region.state_id)) {
      groupedStates.set(region.state_id, {
        state_name: region.state_name,
        regions: [],
      });
    }

    groupedStates
      .get(region.state_id)!
      .regions.push(region);

  });

  const stateGroups = Array.from(
    groupedStates.values()
  );

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  function formatCrores(value: number) {
    if (!value || value <= 0) {
      return "—";
    }

    if (value >= 10000000) {
      return `₹${(
        value / 10000000
      ).toFixed(2)} Cr`;
    }

    return `₹${(
      value / 100000
    ).toFixed(2)} L`;
  }

  // =====================================================
  // TOTAL ADVANCED GROSS
  // =====================================================

  const advancedTotal =
    advancedRegions.reduce(
      (total, region) =>
        total + region.gross,
      0
    );

  const hasAdvancedData =
    advancedRegions.length > 0;

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
              href={`/preview/movies/${movie.id}/box-office/india/state-wise`}
              className="text-[9px] uppercase tracking-[0.2em] text-violet-700 transition hover:text-violet-400"
            >
              ← Back to State-wise
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
                  Advanced Box Office
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
            INTRO
        ================================================= */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              Advanced Territory Intelligence
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Deeper regional market performance.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
              Detailed theatrical collection by JMI trade
              region, shown only where advanced regional
              data has been recorded.
            </p>


            {/* Important note */}

            <div className="mt-7 rounded-xl border border-violet-400/20 bg-zinc-950 px-5 py-5">

              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                JMI Data Note
              </p>

              <p className="mt-2 text-[9px] leading-5 text-zinc-600">
                Advanced territory figures are maintained
                independently from the state-wise collection
                and are intended for deeper regional analysis.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            NO DATA
        ================================================= */}

        {!hasAdvancedData && (

          <section>

            <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-10 text-center">

                <p className="text-[9px] text-zinc-600">
                  Advanced territory data is not available
                  for this movie yet.
                </p>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            ADVANCED DATA
        ================================================= */}

        {hasAdvancedData && (

          <section className="border-b border-zinc-900">

            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

              {/* Total */}

              <div className="rounded-xl border border-violet-400/20 bg-zinc-950 px-5 py-5">

                <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  Recorded Advanced Territory Gross
                </p>

                <p className="mt-2 text-2xl font-medium tracking-[-0.03em] text-violet-400">
                  {formatCrores(
                    advancedTotal
                  )}
                </p>

                <p className="mt-1 text-[8px] text-zinc-700">
                  Sum of available regional records only
                </p>

              </div>


              {/* State Groups */}

              <div className="mt-8 space-y-8">

                {stateGroups.map(
                  (state) => {

                    const stateTotal =
                      state.regions.reduce(
                        (total, region) =>
                          total +
                          region.gross,
                        0
                      );

                    return (

                      <div
                        key={state.state_name}
                        className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                      >

                        {/* State Header */}

                        <div className="border-b border-zinc-800 px-5 py-5">

                          <div className="flex items-center justify-between gap-4">

                            <div>

                              <p className="text-[8px] uppercase tracking-[0.2em] text-violet-400">
                                State Market
                              </p>

                              <h3 className="mt-1 text-sm font-medium text-zinc-200">
                                {state.state_name}
                              </h3>

                            </div>

                            <div className="text-right">

                              <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-700">
                                Recorded Regional Gross
                              </p>

                              <p className="mt-1 text-[10px] font-semibold text-violet-400">
                                {formatCrores(
                                  stateTotal
                                )}
                              </p>

                            </div>

                          </div>

                        </div>


                        {/* Region Header */}

                        <div className="grid grid-cols-[1fr_auto] border-b border-zinc-800 bg-zinc-900/40 px-5 py-3">

                          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                            Territory
                          </p>

                          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                            Gross
                          </p>

                        </div>


                        {/* Regions */}

                        {state.regions.map(
                          (
                            region,
                            index
                          ) => (

                            <div
                              key={region.id}
                              className={`
                                grid
                                grid-cols-[1fr_auto]
                                items-center
                                px-5
                                py-4
                                ${
                                  index !==
                                  state.regions.length - 1
                                    ? "border-b border-zinc-900"
                                    : ""
                                }
                              `}
                            >

                              <div>

                                <p className="text-[9px] font-medium text-zinc-300">
                                  {region.name}
                                </p>

                                {region.code && (
                                  <p className="mt-0.5 text-[7px] uppercase tracking-[0.15em] text-zinc-700">
                                    {region.code}
                                  </p>
                                )}

                              </div>

                              <p className="text-[10px] font-medium text-zinc-200">
                                {formatCrores(
                                  region.gross
                                )}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    );

                  }
                )}

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-3 sm:flex-row">

              <Link
                href={`/preview/movies/${movie.id}/box-office/india/state-wise`}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-zinc-500 transition hover:border-violet-400/30 hover:text-violet-400"
              >
                ← State-wise Collection
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