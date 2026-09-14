"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Industry = {
  id: number;
  name: string;
  native_name: string | null;
  short_name: string | null;
  description: string | null;
};

type IndustryPerformance = {
  id: number;
  name: string;
  nativeName: string | null;

  movies: number;

  indiaGross: number;
  overseasGross: number;
  worldwideGross: number;

  indiaPercentage: number;
  overseasPercentage: number;
};

export default function IndustryIntelligenceHomepage() {
  const router = useRouter();

  const [industries, setIndustries] =
    useState<IndustryPerformance[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadIndustryPerformance();
  }, []);

  // --------------------------------------------------
  // Load Industry Intelligence
  // --------------------------------------------------

  async function loadIndustryPerformance() {
    setLoading(true);
    setError("");

    // --------------------------------------------------
    // 1. Load Industries
    // --------------------------------------------------

    const {
      data: industryData,
      error: industryError,
    } = await supabase
      .from("industries")
      .select(`
        id,
        name,
        native_name,
        short_name,
        description
      `)
      .order("name");

    if (industryError) {
      console.error(industryError);
      setError(industryError.message);
      setLoading(false);
      return;
    }

    if (!industryData || industryData.length === 0) {
      setIndustries([]);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 2. Load Movie ↔️ Industry relationships
    // --------------------------------------------------

    const {
      data: movieIndustryData,
      error: movieIndustryError,
    } = await supabase
      .from("movie_industries")
      .select(`
        movie_id,
        industry_id
      `);

    if (movieIndustryError) {
      console.error(movieIndustryError);
      setError(movieIndustryError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 3. Load Movies
    // --------------------------------------------------

    const movieIds = [
      ...new Set(
        movieIndustryData?.map(
          (row) => Number(row.movie_id)
        ) || []
      ),
    ];

    if (movieIds.length === 0) {
      setIndustries(
        industryData.map((industry) => ({
          id: industry.id,
          name: industry.name,
          nativeName: industry.native_name,
          movies: 0,
          indiaGross: 0,
          overseasGross: 0,
          worldwideGross: 0,
          indiaPercentage: 0,
          overseasPercentage: 0,
        }))
      );

      setLoading(false);
      return;
    }

    const {
      data: movies,
      error: moviesError,
    } = await supabase
      .from("movies")
      .select("id")
      .in("id", movieIds);

    if (moviesError) {
      console.error(moviesError);
      setError(moviesError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 4. Load India Box Office
    // --------------------------------------------------

    const {
      data: stateBoxOffice,
      error: stateError,
    } = await supabase
      .from("movie_state_box_office")
      .select(`
        movie_id,
        gross_jmi
      `)
      .in("movie_id", movieIds);

    if (stateError) {
      console.error(stateError);
      setError(stateError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 5. Load Overseas Box Office
    // --------------------------------------------------

    const {
      data: overseasBoxOffice,
      error: overseasError,
    } = await supabase
      .from("movie_overseas_box_office")
      .select(`
        movie_id,
        gross_inr
      `)
      .in("movie_id", movieIds);

    if (overseasError) {
      console.error(overseasError);
      setError(overseasError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 6. Build Movie Gross Maps
    // --------------------------------------------------

    const movieIndiaGross: Record<
      number,
      number
    > = {};

    const movieOverseasGross: Record<
      number,
      number
    > = {};

    stateBoxOffice?.forEach((row) => {
      const movieId = Number(row.movie_id);

      movieIndiaGross[movieId] =
        (movieIndiaGross[movieId] || 0) +
        Number(row.gross_jmi || 0);
    });

    overseasBoxOffice?.forEach((row) => {
      const movieId = Number(row.movie_id);

      movieOverseasGross[movieId] =
        (movieOverseasGross[movieId] || 0) +
        Number(row.gross_inr || 0);
    });

    // --------------------------------------------------
    // 7. Create Industry Performance Map
    // --------------------------------------------------

    const industryMap: Record<
      number,
      {
        movieIds: Set<number>;
        indiaGross: number;
        overseasGross: number;
      }
    > = {};

    industryData.forEach((industry) => {
      industryMap[industry.id] = {
        movieIds: new Set<number>(),
        indiaGross: 0,
        overseasGross: 0,
      };
    });

    // --------------------------------------------------
    // 8. Assign Movies to Industries
    // --------------------------------------------------

    movieIndustryData?.forEach((row) => {
      const movieId = Number(row.movie_id);
      const industryId = Number(row.industry_id);

      if (!industryMap[industryId]) {
        return;
      }

      industryMap[industryId].movieIds.add(
        movieId
      );
    });

    // --------------------------------------------------
    // 9. Calculate Industry Gross
    // --------------------------------------------------

    Object.entries(industryMap).forEach(
      ([industryIdString, data]) => {
        const industryId =
          Number(industryIdString);

        data.movieIds.forEach((movieId) => {
          data.indiaGross +=
            movieIndiaGross[movieId] || 0;

          data.overseasGross +=
            movieOverseasGross[movieId] || 0;
        });
      }
    );

    // --------------------------------------------------
    // 10. Build Final Industry Performance
    // --------------------------------------------------

    const performance: IndustryPerformance[] =
      industryData
        .map((industry) => {
          const data =
            industryMap[industry.id];

          const worldwideGross =
            data.indiaGross +
            data.overseasGross;

          const indiaPercentage =
            worldwideGross > 0
              ? (data.indiaGross /
                  worldwideGross) *
                100
              : 0;

          const overseasPercentage =
            worldwideGross > 0
              ? (data.overseasGross /
                  worldwideGross) *
                100
              : 0;

          return {
            id: industry.id,

            name: industry.name,

            nativeName:
              industry.native_name,

            movies:
              data.movieIds.size,

            indiaGross:
              data.indiaGross,

            overseasGross:
              data.overseasGross,

            worldwideGross,

            indiaPercentage,

            overseasPercentage,
          };
        })
        .sort(
          (a, b) =>
            b.worldwideGross -
            a.worldwideGross
        );

    setIndustries(performance);

    setLoading(false);
  }

  // --------------------------------------------------
  // Gross Formatter
  // --------------------------------------------------

  function formatGross(value: number) {
    return `₹${value.toLocaleString("en-IN")}`;
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="p-8">

        <h1 className="text-2xl font-bold">
          Loading Industry Intelligence...
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculating performance across all
          industries.
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
          Industry Intelligence Error
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


  const totalIndustryMovies =
    industries.reduce(
      (total, industry) =>
        total + industry.movies,
      0
    );

  const totalIndiaGross =
    industries.reduce(
      (total, industry) =>
        total + industry.indiaGross,
      0
    );

  const totalOverseasGross =
    industries.reduce(
      (total, industry) =>
        total + industry.overseasGross,
      0
    );

  const totalWorldwideGross =
    totalIndiaGross +
    totalOverseasGross;

  const activeIndustries =
    industries.filter(
      (industry) => industry.movies > 0
    ).length;

  const highestGrossingIndustry =
    industries.length > 0
      ? industries[0]
      : null;

  const mostProductiveIndustry =
    [...industries].sort(
      (a, b) => b.movies - a.movies
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
          JMI • Industry Intelligence
        </p>

        <h1 className="text-3xl font-bold">
          All Industries Intelligence
        </h1>

        <p className="mt-3 max-w-3xl text-zinc-400">
          Comprehensive box-office comparison
          across all film industries tracked by
          Jeruto Movie Intelligence.
        </p>

      </div>

      {/* ---------------------------------------------- */}
      {/* Overall Statistics */}
      {/* ---------------------------------------------- */}

      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Overall Industry Performance
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Combined performance of all movies
          associated with the tracked industries.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Industries */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              Active Industries
            </p>

            <p className="mt-2 text-2xl font-bold">
              {activeIndustries}
            </p>

          </div>

          {/* Movies */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              Industry-Movie Associations
            </p>

            <p className="mt-2 text-2xl font-bold">
              {totalIndustryMovies}
            </p>

          </div>

          {/* India */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              Combined India Gross
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatGross(totalIndiaGross)}
            </p>

          </div>

          {/* Worldwide */}

          <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-5">

            <p className="text-sm text-zinc-400">
              Combined Worldwide Gross
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {formatGross(
                totalWorldwideGross
              )}
            </p>

          </div>

        </div>

      </div>

      {/* ---------------------------------------------- */}
      {/* Industry Highlights */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Industry Highlights
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Current leaders across the tracked
          industry ecosystem.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {/* Highest Grossing */}

          <div
            className="cursor-pointer rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-5 transition hover:bg-yellow-500/10"
            onClick={() =>
              highestGrossingIndustry &&
              router.push(
                `/admin/industry-intelligence/${highestGrossingIndustry.id}`
              )
            }
          >

            <p className="text-sm text-zinc-400">
              🏆 Highest-Grossing Industry
            </p>

            {highestGrossingIndustry ? (
              <>
                <p className="mt-2 text-2xl font-bold text-yellow-400">
                  {highestGrossingIndustry.name}
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  Worldwide Gross
                </p>

                <p className="text-lg font-semibold">
                  {formatGross(
                    highestGrossingIndustry.worldwideGross
                  )}
                </p>
              </>
            ) : (
              <p className="mt-3 text-zinc-500">
                No data available.
              </p>
            )}

          </div>

          {/* Most Productive */}

          <div
            className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 p-5 transition hover:bg-zinc-800"
            onClick={() =>
              mostProductiveIndustry &&
              router.push(
                `/admin/industry-intelligence/${mostProductiveIndustry.id}`
              )
            }
          >

            <p className="text-sm text-zinc-400">
              🎬 Most Productive Industry
            </p>

            {mostProductiveIndustry ? (
              <>
                <p className="mt-2 text-2xl font-bold">
                  {mostProductiveIndustry.name}
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  Industry-Movie Associations
                </p>

                <p className="text-lg font-semibold">
                  {mostProductiveIndustry.movies}
                </p>
              </>
            ) : (
              <p className="mt-3 text-zinc-500">
                No data available.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* ---------------------------------------------- */}
      {/* Industry Comparison */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Industry Performance Comparison
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          All tracked industries ranked by
          worldwide box-office gross.
        </p>

        {industries.length === 0 ? (

          <p className="mt-6 text-zinc-500">
            No industry data available.
          </p>

        ) : (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead className="bg-zinc-800">

                <tr>

                  <th className="p-4 text-left">
                    Rank
                  </th>

                  <th className="p-4 text-left">
                    Industry
                  </th>

                  <th className="p-4 text-left">
                    Movies
                  </th>

                  <th className="p-4 text-left">
                    India Gross
                  </th>

                  <th className="p-4 text-left">
                    Overseas Gross
                  </th>

                  <th className="p-4 text-left">
                    Worldwide Gross
                  </th>

                  <th className="p-4 text-left">
                    Overseas Share
                  </th>

                  <th className="p-4 text-left">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {industries.map(
                  (industry, index) => (

                    <tr
                      key={industry.id}
                      className="border-t border-zinc-700 transition hover:bg-zinc-800/60"
                    >

                      {/* Rank */}

                      <td className="p-4 font-semibold">
                        #{index + 1}
                      </td>

                      {/* Industry */}

                      <td className="p-4">

                        <p className="font-semibold">
                          {industry.name}
                        </p>

                        {industry.nativeName && (
                          <p className="mt-1 text-xs text-zinc-500">
                            {industry.nativeName}
                          </p>
                        )}

                      </td>

                      {/* Movies */}

                      <td className="p-4">
                        {industry.movies}
                      </td>

                      {/* India */}

                      <td className="p-4">
                        {formatGross(
                          industry.indiaGross
                        )}
                      </td>

                      {/* Overseas */}

                      <td className="p-4">
                        {formatGross(
                          industry.overseasGross
                        )}
                      </td>

                      {/* Worldwide */}

                      <td className="p-4 font-semibold text-yellow-400">
                        {formatGross(
                          industry.worldwideGross
                        )}
                      </td>

                      {/* Overseas Share */}

                      <td className="p-4">

                        {industry.overseasPercentage.toFixed(
                          2
                        )}
                        %

                      </td>

                      {/* Action */}

                      <td className="p-4">

                        <button
                          onClick={() =>
                            router.push(
                              `/admin/industry-intelligence/${industry.id}`
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
      {/* Domestic vs Overseas */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Domestic vs Overseas Contribution
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Combined contribution of India and
          overseas markets across all industries.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {/* India */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              🇮🇳 India Contribution
            </p>

            <p className="mt-2 text-2xl font-bold">
              {totalWorldwideGross > 0
                ? (
                    (totalIndiaGross /
                      totalWorldwideGross) *
                    100
                  ).toFixed(2)
                : "0.00"}
              %
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              India Gross
            </p>

            <p className="font-semibold">
              {formatGross(totalIndiaGross)}
            </p>

          </div>

          {/* Overseas */}

          <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-5">

            <p className="text-sm text-zinc-400">
              🌍 Overseas Contribution
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {totalWorldwideGross > 0
                ? (
                    (totalOverseasGross /
                      totalWorldwideGross) *
                    100
                  ).toFixed(2)
                : "0.00"}
              %
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Overseas Gross
            </p>

            <p className="font-semibold">
              {formatGross(
                totalOverseasGross
              )}
            </p>

          </div>

        </div>

        {/* Contribution Bar */}

        <div className="mt-6">

          <div className="mb-2 flex justify-between text-xs text-zinc-500">

            <span>
              India{" "}
              {totalWorldwideGross > 0
                ? (
                    (totalIndiaGross /
                      totalWorldwideGross) *
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </span>

            <span>
              Overseas{" "}
              {totalWorldwideGross > 0
                ? (
                    (totalOverseasGross /
                      totalWorldwideGross) *
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </span>

          </div>

          <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-800">

            <div
              className="bg-zinc-400"
              style={{
                width: `${
                  totalWorldwideGross > 0
                    ? (totalIndiaGross /
                        totalWorldwideGross) *
                      100
                    : 0
                }%`,
              }}
            />

            <div
              className="bg-yellow-500"
              style={{
                width: `${
                  totalWorldwideGross > 0
                    ? (totalOverseasGross /
                        totalWorldwideGross) *
                      100
                    : 0
                }%`,
              }}
            />

          </div>

        </div>

      </div>

    </div>
  );
}