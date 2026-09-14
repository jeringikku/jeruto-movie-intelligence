"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type StateRecord = {
  id: number;
  name: string;
  code: string;
};

type StateBoxOfficeRecord = {
  movie_id: number;
  state_id: number;
  gross_jmi: number | null;
  coverage_type: string;
};

type MarketPerformance = {
  key: string;
  name: string;
  description: string;

  stateIds: number[];

  movies: number;

  gross: number;
  allTimeGross: number;

  averageGross: number;
  marketShare: number;
};

type MarketDefinition = {
  key: string;
  name: string;
  description: string;
  stateIds: number[];
};

export default function MarketIntelligenceHomepage() {
  const router = useRouter();

  // --------------------------------------------------
  // Selected Year
  // --------------------------------------------------

  const [selectedYear, setSelectedYear] =
    useState<number | "all">("all");

  const [availableYears, setAvailableYears] =
    useState<number[]>([]);

  // --------------------------------------------------
  // Raw Data
  // --------------------------------------------------

  const [stateBoxOffice, setStateBoxOffice] =
    useState<StateBoxOfficeRecord[]>([]);

  const [movieYearMap, setMovieYearMap] =
    useState<Record<number, number | null>>({});

  const [marketDefinitions, setMarketDefinitions] =
    useState<MarketDefinition[]>([]);

  // --------------------------------------------------
  // UI State
  // --------------------------------------------------

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Load Market Data
  // --------------------------------------------------

  useEffect(() => {
    loadMarketData();
  }, []);

  async function loadMarketData() {
    setLoading(true);
    setError("");

    // --------------------------------------------------
    // 1. Load Required States
    // --------------------------------------------------

    const {
      data: stateData,
      error: stateError,
    } = await supabase
      .from("states")
      .select(`
        id,
        name,
        code
      `)
      .in("code", [
        "KL",
        "KA",
        "TN",
        "AP",
        "TG",
      ]);

    if (stateError) {
      console.error(stateError);
      setError(stateError.message);
      setLoading(false);
      return;
    }

    if (!stateData || stateData.length === 0) {
      
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 2. Build State Map
    // --------------------------------------------------

    const stateMap: Record<
      string,
      StateRecord
    > = {};

    stateData.forEach((state) => {
      stateMap[state.code] = {
        id: Number(state.id),
        name: state.name,
        code: state.code,
      };
    });

    // --------------------------------------------------
    // 3. Validate Required States
    // --------------------------------------------------

    const requiredCodes = [
      "KL",
      "KA",
      "TN",
      "AP",
      "TG",
    ];

    const missingStates =
      requiredCodes.filter(
        (code) => !stateMap[code]
      );

    if (missingStates.length > 0) {
      setError(
        `Required states not found: ${missingStates.join(
          ", "
        )}`
      );

      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 4. State IDs
    // --------------------------------------------------

    const keralaId =
      stateMap["KL"].id;

    const karnatakaId =
      stateMap["KA"].id;

    const tamilNaduId =
      stateMap["TN"].id;

    const andhraPradeshId =
      stateMap["AP"].id;

    const telanganaId =
      stateMap["TG"].id;

    const allStateIds = [
      keralaId,
      karnatakaId,
      tamilNaduId,
      andhraPradeshId,
      telanganaId,
    ];

    // --------------------------------------------------
    // 5. Load State Box Office
    // --------------------------------------------------

    const {
      data: boxOfficeData,
      error: boxOfficeError,
    } = await supabase
      .from("movie_state_box_office")
      .select(`
        movie_id,
        state_id,
        gross_jmi,
        coverage_type
      `)
      .in("state_id", allStateIds)
      .eq("coverage_type", "STATE");

    if (boxOfficeError) {
      console.error(boxOfficeError);
      setError(boxOfficeError.message);
      setLoading(false);
      return;
    }

    const normalizedBoxOffice: StateBoxOfficeRecord[] =
      (boxOfficeData || []).map((row) => ({
        movie_id: Number(row.movie_id),
        state_id: Number(row.state_id),
        gross_jmi:
          row.gross_jmi === null
            ? null
            : Number(row.gross_jmi),
        coverage_type:
          row.coverage_type,
      }));

    // --------------------------------------------------
    // 6. Get Movie IDs
    // --------------------------------------------------

    const movieIds = [
      ...new Set(
        normalizedBoxOffice.map(
          (row) => row.movie_id
        )
      ),
    ];

    // --------------------------------------------------
    // 7. Load Movies
    // --------------------------------------------------

    if (movieIds.length > 0) {
      const {
        data: movieData,
        error: movieError,
      } = await supabase
        .from("movies")
        .select(`
          id,
          release_date,
          release_year
        `)
        .in("id", movieIds);

      if (movieError) {
        console.error(movieError);
        setError(movieError.message);
        setLoading(false);
        return;
      }

      // --------------------------------------------------
      // 8. Build Movie Year Map
      // --------------------------------------------------

      const yearMap: Record<
        number,
        number | null
      > = {};

      movieData?.forEach((movie) => {
        let year: number | null = null;

        if (movie.release_year) {
          year = Number(movie.release_year);
        } else if (movie.release_date) {
          year = Number(
            String(movie.release_date).substring(
              0,
              4
            )
          );
        }

        yearMap[Number(movie.id)] = year;
      });

      setMovieYearMap(yearMap);

      // --------------------------------------------------
      // 9. Generate Available Years
      // --------------------------------------------------

      const years = [
        ...new Set(
          Object.values(yearMap).filter(
            (year): year is number =>
              year !== null
          )
        ),
      ].sort((a, b) => b - a);

      setAvailableYears(years);
    } else {
      setMovieYearMap({});
      setAvailableYears([]);
    }

    // --------------------------------------------------
    // 10. Market Definitions
    // --------------------------------------------------

    const definitions: MarketDefinition[] = [
      {
        key: "kerala",
        name: "Kerala",
        description:
          "Kerala state theatrical market.",
        stateIds: [keralaId],
      },

      {
        key: "karnataka",
        name: "Karnataka",
        description:
          "Karnataka state theatrical market.",
        stateIds: [karnatakaId],
      },

      {
        key: "tamil-nadu",
        name: "Tamil Nadu",
        description:
          "Tamil Nadu state theatrical market.",
        stateIds: [tamilNaduId],
      },

      {
        key: "telugu-states",
        name: "Telugu States",
        description:
          "Combined Andhra Pradesh and Telangana market.",
        stateIds: [
          andhraPradeshId,
          telanganaId,
        ],
      },
    ];

    setMarketDefinitions(definitions);
    setStateBoxOffice(normalizedBoxOffice);

    setLoading(false);
  }

  // --------------------------------------------------
  // Calculate Market Performance
  // --------------------------------------------------

  const markets = useMemo(() => {
    const rawMarkets: MarketPerformance[] =
      marketDefinitions.map((market) => {
        const relevantRows =
          stateBoxOffice.filter((row) =>
            market.stateIds.includes(
              row.state_id
            )
          );

        // --------------------------------------------
        // All-Time Data
        // --------------------------------------------

        const allTimeMovieIds =
          new Set<number>();

        let allTimeGross = 0;

        relevantRows.forEach((row) => {
          allTimeMovieIds.add(row.movie_id);

          allTimeGross +=
            Number(row.gross_jmi || 0);
        });

        // --------------------------------------------
        // Selected-Year Data
        // --------------------------------------------

        const selectedMovieIds =
          new Set<number>();

        let gross = 0;

        relevantRows.forEach((row) => {
          const movieYear =
            movieYearMap[row.movie_id];

          const includeMovie =
            selectedYear === "all" ||
            movieYear === selectedYear;

          if (!includeMovie) {
            return;
          }

          selectedMovieIds.add(
            row.movie_id
          );

          gross +=
            Number(row.gross_jmi || 0);
        });

        const movies =
          selectedMovieIds.size;

        const averageGross =
          movies > 0
            ? gross / movies
            : 0;

        return {
          key: market.key,

          name: market.name,

          description:
            market.description,

          stateIds:
            market.stateIds,

          movies,

          gross,

          allTimeGross,

          averageGross,

          marketShare: 0,
        };
      });

    // --------------------------------------------------
    // Selected-Year Total
    // --------------------------------------------------

    const totalSelectedGross =
      rawMarkets.reduce(
        (total, market) =>
          total + market.gross,
        0
      );

    // --------------------------------------------------
    // Market Share
    // --------------------------------------------------

    return rawMarkets
      .map((market) => ({
        ...market,

        marketShare:
          totalSelectedGross > 0
            ? (market.gross /
                totalSelectedGross) *
              100
            : 0,
      }))
      .sort(
        (a, b) =>
          b.gross - a.gross
      );
  }, [
    marketDefinitions,
    stateBoxOffice,
    movieYearMap,
    selectedYear,
  ]);

  // --------------------------------------------------
  // Gross Formatter
  // --------------------------------------------------

  function formatGross(value: number) {
    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  }

  // --------------------------------------------------
  // Year Label
  // --------------------------------------------------

  const selectedYearLabel =
    selectedYear === "all"
      ? "All Years"
      : String(selectedYear);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="p-8">

        <h1 className="text-2xl font-bold">
          Loading Market Intelligence...
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculating performance across
          South Indian markets.
        </p>

      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="p-8">

        <h1 className="text-2xl font-bold text-red-500">
          Market Intelligence Error
        </h1>

        <p className="mt-2 text-zinc-400">
          {error}
        </p>

      </div>
    );
  }

  // --------------------------------------------------
  // Overall Statistics
  // --------------------------------------------------

  const totalMovies =
    markets.reduce(
      (total, market) =>
        total + market.movies,
      0
    );

  const totalSelectedGross =
    markets.reduce(
      (total, market) =>
        total + market.gross,
      0
    );

  const totalAllTimeGross =
    markets.reduce(
      (total, market) =>
        total + market.allTimeGross,
      0
    );

  const activeMarkets =
    markets.filter(
      (market) =>
        market.movies > 0
    ).length;

  const highestGrossingMarket =
    markets.length > 0 &&
    markets[0].gross > 0
      ? markets[0]
      : null;

  const mostProductiveMarket =
    [...markets].sort(
      (a, b) =>
        b.movies - a.movies
    )[0] || null;

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="p-8">

      {/* ---------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------- */}

      <div className="mb-8">

        <p className="mb-2 text-sm text-zinc-500">
          JMI • Market Intelligence
        </p>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              South Indian Market Intelligence
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              Comprehensive box-office analysis
              across Kerala, Karnataka, Tamil Nadu
              and the Telugu States market.
            </p>

          </div>

          {/* Year Selector */}

          <div className="flex items-center gap-3">

            <label
              htmlFor="market-year"
              className="text-sm font-medium text-zinc-400"
            >
              Year
            </label>

            <select
              id="market-year"
              value={selectedYear}
              onChange={(e) => {
                const value =
                  e.target.value;

                setSelectedYear(
                  value === "all"
                    ? "all"
                    : Number(value)
                );
              }}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white outline-none transition focus:border-yellow-500"
            >

              <option value="all">
                All
              </option>

              {availableYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

      </div>

      {/* ---------------------------------------------- */}
      {/* Overall Market Performance */}
      {/* ---------------------------------------------- */}

      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Overall Market Performance
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Combined theatrical performance across
          the four tracked South Indian markets.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Active Markets */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              Active Markets
            </p>

            <p className="mt-2 text-2xl font-bold">
              {activeMarkets}
            </p>

          </div>

          {/* Movies */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              Movies Tracked
            </p>

            <p className="mt-2 text-2xl font-bold">
              {totalMovies}
            </p>

          </div>

          {/* Selected Year */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              {selectedYearLabel} Gross
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatGross(
                totalSelectedGross
              )}
            </p>

          </div>

          {/* All Time */}

          <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-5">

            <p className="text-sm text-zinc-400">
              Combined All-Time Gross
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {formatGross(
                totalAllTimeGross
              )}
            </p>

          </div>

        </div>

      </div>

      {/* ---------------------------------------------- */}
      {/* Market Highlights */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Market Highlights
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Current leaders for{" "}
          <span className="text-zinc-200">
            {selectedYearLabel}
          </span>{" "}
          across the tracked South Indian markets.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {/* Highest Grossing */}

          <div
            className="cursor-pointer rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-5 transition hover:bg-yellow-500/10"
            onClick={() =>
              highestGrossingMarket &&
              router.push(
                `/admin/market-intelligence/${highestGrossingMarket.key}`
              )
            }
          >

            <p className="text-sm text-zinc-400">
              🏆 Highest-Grossing Market
            </p>

            {highestGrossingMarket ? (
              <>

                <p className="mt-2 text-2xl font-bold text-yellow-400">
                  {
                    highestGrossingMarket.name
                  }
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  {selectedYearLabel} Gross
                </p>

                <p className="text-lg font-semibold">
                  {formatGross(
                    highestGrossingMarket.gross
                  )}
                </p>

              </>
            ) : (
              <p className="mt-3 text-zinc-500">
                No data available for this year.
              </p>
            )}

          </div>

          {/* Most Productive */}

          <div
            className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 p-5 transition hover:bg-zinc-800"
            onClick={() =>
              mostProductiveMarket &&
              router.push(
                `/admin/market-intelligence/${mostProductiveMarket.key}`
              )
            }
          >

            <p className="text-sm text-zinc-400">
              🎬 Most Productive Market
            </p>

            {mostProductiveMarket &&
            mostProductiveMarket.movies > 0 ? (
              <>

                <p className="mt-2 text-2xl font-bold">
                  {
                    mostProductiveMarket.name
                  }
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  Movies Tracked
                </p>

                <p className="text-lg font-semibold">
                  {
                    mostProductiveMarket.movies
                  }
                </p>

              </>
            ) : (
              <p className="mt-3 text-zinc-500">
                No data available for this year.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* ---------------------------------------------- */}
      {/* Market Comparison */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Market Performance Comparison
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          South Indian markets ranked by{" "}
          {selectedYearLabel.toLowerCase()} box-office
          gross.
        </p>

        {markets.length === 0 ? (

          <p className="mt-6 text-zinc-500">
            No market data available.
          </p>

        ) : (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead className="bg-zinc-800">

                <tr>

                  <th className="p-4 text-left">
                    Rank
                  </th>

                  <th className="p-4 text-left">
                    Market
                  </th>

                  <th className="p-4 text-left">
                    Movies
                  </th>

                  <th className="p-4 text-left">
                    {selectedYearLabel} Gross
                  </th>

                  <th className="p-4 text-left">
                    All-Time Gross
                  </th>

                  <th className="p-4 text-left">
                    Avg. Gross / Movie
                  </th>

                  <th className="p-4 text-left">
                    Market Share
                  </th>

                  <th className="p-4 text-left">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {markets.map(
                  (market, index) => (

                    <tr
                      key={market.key}
                      className="border-t border-zinc-700 transition hover:bg-zinc-800/60"
                    >

                      {/* Rank */}

                      <td className="p-4 font-semibold">
                        #{index + 1}
                      </td>

                      {/* Market */}

                      <td className="p-4">

                        <p className="font-semibold">
                          {market.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {market.description}
                        </p>

                      </td>

                      {/* Movies */}

                      <td className="p-4">
                        {market.movies}
                      </td>

                      {/* Selected Year */}

                      <td className="p-4">
                        {formatGross(
                          market.gross
                        )}
                      </td>

                      {/* All Time */}

                      <td className="p-4 font-semibold text-yellow-400">
                        {formatGross(
                          market.allTimeGross
                        )}
                      </td>

                      {/* Average */}

                      <td className="p-4">
                        {formatGross(
                          market.averageGross
                        )}
                      </td>

                      {/* Share */}

                      <td className="p-4">
                        {market.marketShare.toFixed(
                          2
                        )}
                        %
                      </td>

                      {/* Action */}

                      <td className="p-4">

                        <button
                          onClick={() =>
                            router.push(
                              `/admin/market-intelligence/${market.key}`
                            )
                          }
                          className="rounded-lg border border-zinc-600 px-3 py-2 text-sm transition hover:border-yellow-500 hover:text-yellow-400"
                        >
                          View Intelligence
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ---------------------------------------------- */}
      {/* Market Contribution */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Market Contribution
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Contribution of each tracked market to
          the combined {selectedYearLabel.toLowerCase()}
          gross.
        </p>

        <div className="mt-6 space-y-5">

          {markets.map(
            (market, index) => (

              <div
                key={market.key}
              >

                <div className="mb-2 flex items-center justify-between">

                  <div>

                    <span className="font-semibold">
                      #{index + 1}{" "}
                      {market.name}
                    </span>

                  </div>

                  <span className="text-sm text-zinc-400">
                    {market.marketShare.toFixed(
                      1
                    )}
                    %
                  </span>

                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">

                  <div
                    className="h-full bg-yellow-500 transition-all duration-500"
                    style={{
                      width: `${market.marketShare}%`,
                    }}
                  />

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}