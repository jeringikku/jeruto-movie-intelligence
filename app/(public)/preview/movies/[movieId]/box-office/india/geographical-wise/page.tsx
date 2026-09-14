import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "../../../../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";
import IndiaGeographicalMap, {
  StatePerformance,
} from "../../../../../../components/IndiaGeographicalMap";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    movieId: string;
  }>;
};

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

export default async function GeographicalWisePage({
  params,
}: PageProps) {
  const { movieId } = await params;

  const movieIdNumber = Number(movieId);

  if (!Number.isFinite(movieIdNumber)) {
    notFound();
  }

  // --------------------------------------------------
  // Movie
  // --------------------------------------------------

  const { data: movie, error: movieError } =
    await supabase
      .from("movies")
      .select(`
        id,
        title,
        release_year,
        poster_url
      `)
      .eq("id", movieIdNumber)
      .eq("is_active", true)
      .single();

  if (movieError || !movie) {
    console.error(
      "JMI Geographical-wise Movie Error:",
      movieError
    );

    notFound();
  }

  // --------------------------------------------------
  // Geographic regions
  // --------------------------------------------------

  const { data: geographicRegions, error: regionError } =
    await supabase
      .from("geographic_regions")
      .select(`
        id,
        name,
        display_order
      `)
      .eq("country_id", 1)
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      });

  if (regionError) {
    console.error(
      "JMI Geographic Region Error:",
      regionError
    );
  }

  // --------------------------------------------------
  // States
  // --------------------------------------------------

  const { data: states, error: stateError } =
    await supabase
      .from("states")
      .select(`
        id,
        name,
        geographic_region_id
      `)
      .eq("country_id", 1);

  if (stateError) {
    console.error(
      "JMI Geographic State Error:",
      stateError
    );
  }

  // --------------------------------------------------
  // Movie state-wise data
  // --------------------------------------------------

  const {
    data: stateRecords,
    error: stateRecordsError,
  } = await supabase
    .from("movie_state_box_office")
    .select(`
      id,
      movie_id,
      state_id,
      coverage_type,
      gross_jmi,
      net_jmi,
      admissions
    `)
    .eq("movie_id", movie.id);

  if (stateRecordsError) {
    console.error(
      "JMI Geographic Box Office Error:",
      stateRecordsError
    );
  }

  // --------------------------------------------------
  // State map
  // --------------------------------------------------

  const stateMap = new Map<
    number,
    {
      name: string;
      regionName: string;
    }
  >();

  for (const state of states ?? []) {
    const region = (
      geographicRegions ?? []
    ).find(
      (item) =>
        item.id === state.geographic_region_id
    );

    stateMap.set(state.id, {
      name: state.name,
      regionName:
        region?.name ?? "Unclassified",
    });
  }

  // --------------------------------------------------
  // State performance
  // --------------------------------------------------

  const statePerformance: StatePerformance[] = [];

  let restOfIndiaGross = 0;
  let restOfIndiaNet = 0;
  let restOfIndiaAdmissions = 0;

  for (const record of stateRecords ?? []) {

    if (
      record.coverage_type ===
      "REST_OF_INDIA"
    ) {
      restOfIndiaGross += Number(
        record.gross_jmi ?? 0
      );

      restOfIndiaNet += Number(
        record.net_jmi ?? 0
      );

      restOfIndiaAdmissions += Number(
        record.admissions ?? 0
      );

      continue;
    }

    if (
      record.coverage_type !== "STATE" ||
      record.state_id === null
    ) {
      continue;
    }

    const state = stateMap.get(
      record.state_id
    );

    if (!state) {
      continue;
    }

    statePerformance.push({
      stateId: record.state_id,
      stateName: state.name,
      regionName: state.regionName,
      gross: Number(
        record.gross_jmi ?? 0
      ),
      net: Number(
        record.net_jmi ?? 0
      ),
      admissions: Number(
        record.admissions ?? 0
      ),
    });
  }

  // --------------------------------------------------
  // Geographic region totals
  // --------------------------------------------------

  const regionTotals = new Map<
    string,
    {
      gross: number;
      net: number;
      admissions: number;
    }
  >();

  for (const region of geographicRegions ?? []) {
    regionTotals.set(region.name, {
      gross: 0,
      net: 0,
      admissions: 0,
    });
  }

  for (const state of statePerformance) {
    const current = regionTotals.get(
      state.regionName
    );

    if (!current) {
      continue;
    }

    current.gross += state.gross;
    current.net += state.net;
    current.admissions += state.admissions;
  }

  const regionPerformance = (
    geographicRegions ?? []
  ).map((region) => {

    const totals = regionTotals.get(
      region.name
    );

    return {
      name: region.name,
      gross: totals?.gross ?? 0,
      net: totals?.net ?? 0,
      admissions:
        totals?.admissions ?? 0,
    };
  });

  // --------------------------------------------------
  // Calculations
  // --------------------------------------------------

  const regionalGrossBase = Math.max(
    0,
    ...regionPerformance.map(
      (region) => region.gross
    )
  );

  const totalStateGross =
    statePerformance.reduce(
      (sum, state) =>
        sum + state.gross,
      0
    );

  const totalStateNet =
    statePerformance.reduce(
      (sum, state) =>
        sum + state.net,
      0
    );

  const totalStateAdmissions =
    statePerformance.reduce(
      (sum, state) =>
        sum + state.admissions,
      0
    );

  const hasStateData =
    statePerformance.length > 0;

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
        {/* GEOGRAPHICAL INTELLIGENCE */}
        {/* ================================================= */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              Geographical Breakdown
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Where is the movie performing?
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
              Visual representation of current cumulative
              performance across Indian states and
              geographic regions.
            </p>

            {/* ================================================= */}
            {/* INFORMATION NOTE */}
            {/* ================================================= */}

            <div className="mt-7 rounded-xl border border-violet-400/15 bg-zinc-950 px-5 py-4">

              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                Current Cumulative Data
              </p>

              <p className="mt-2 text-[9px] leading-5 text-zinc-600">
                State performance is derived from the
                latest cumulative state-wise JMI records.
                Geographic regions are calculated from
                their corresponding states. Rest of India
                is maintained separately.
              </p>

            </div>

            {/* ================================================= */}
            {/* MAP */}
            {/* ================================================= */}

            <div className="mt-8">

              <div className="mb-4">

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
                  India Performance Map
                </p>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Tap a highlighted state to view its
                  performance.
                </p>

              </div>

              <IndiaGeographicalMap
                stateData={statePerformance}
              />

            </div>

            {/* ================================================= */}
            {/* INDIA SNAPSHOT */}
            {/* ================================================= */}

            {hasStateData && (

              <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-5">

                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  India Snapshot
                </p>

                <div className="mt-4 grid grid-cols-3 gap-4">

                  <div>

                    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                      State Gross
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-zinc-200">
                      {formatCrores(
                        totalStateGross
                      )}
                    </p>

                  </div>

                  <div>

                    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                      State Net
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-zinc-200">
                      {formatCrores(
                        totalStateNet
                      )}
                    </p>

                  </div>

                  <div>

                    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                      Footfalls
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-zinc-200">
                      {formatNumber(
                        totalStateAdmissions
                      )}
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* ================================================= */}
            {/* GEOGRAPHIC PERFORMANCE */}
            {/* ================================================= */}

            <div className="mt-8">

              <div className="mb-4">

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
                  Geographic Performance
                </p>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Latest cumulative performance by
                  geographic region.
                </p>

              </div>

              <div className="space-y-2">

                {regionPerformance.map(
                  (region) => {

                    const share =
                      regionalGrossBase >
                      0
                        ? (region.gross /
                            regionalGrossBase) *
                          100
                        : 0;

                    return (
                      <div
                        key={region.name}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-violet-400/20"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <p className="text-[10px] font-medium text-zinc-200">
                              {region.name}
                            </p>

                            <p className="mt-1 text-[7px] uppercase tracking-[0.16em] text-zinc-700">
                              Geographic region
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-[12px] font-medium text-violet-400">
                              {formatCrores(
                                region.gross
                              )}
                            </p>

                            <p className="mt-0.5 text-[7px] uppercase tracking-[0.12em] text-zinc-700">
                              Gross
                            </p>

                          </div>

                        </div>

                        {region.gross > 0 && (
                          <div className="mt-4">

                            <div className="flex items-center justify-between">

                              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                                Regional distribution
                              </p>

                              <p className="text-[8px] text-zinc-500">
                                {share.toFixed(
                                  1
                                )}
                                %
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

                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-900 pt-3">

                          <div>

                            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                              Net
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-300">
                              {formatCrores(
                                region.net
                              )}
                            </p>

                          </div>

                          <div>

                            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                              Footfalls
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-300">
                              {formatNumber(
                                region.admissions
                              )}
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* ================================================= */}
            {/* REST OF INDIA */}
            {/* ================================================= */}

            <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                Additional Coverage
              </p>

              <h3 className="mt-2 text-sm font-medium tracking-[-0.01em] text-zinc-100">
                Rest of India
              </h3>

              <p className="mt-1 text-[9px] leading-5 text-zinc-600">
                Coverage outside the individually
                tracked states.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-zinc-900 pt-4">

                <div>

                  <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                    Gross
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-zinc-200">
                    {formatCrores(
                      restOfIndiaGross
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                    Net
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-zinc-200">
                    {formatCrores(
                      restOfIndiaNet
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                    Footfalls
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-zinc-200">
                    {formatNumber(
                      restOfIndiaAdmissions
                    )}
                  </p>

                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* DATA NOTE */}
            {/* ================================================= */}

            <div className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 px-5 py-4">

              <p className="text-[8px] leading-5 text-zinc-700">
                Geographic totals are derived from
                the latest cumulative State-wise
                Collection records. Rest of India is
                maintained separately to avoid
                double-counting.
              </p>

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
                href={`/preview/movies/${movie.id}/box-office/india/day-wise`}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-zinc-500 transition hover:border-violet-400/30 hover:text-violet-400"
              >
                ← Day-wise Collection
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