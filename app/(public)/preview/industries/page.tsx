"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import PublicHeader from "../../components/PublicHeader";

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

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<
    IndustryPerformance[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadIndustryPerformance();
  }, []);

  // --------------------------------------------------
  // Load Industry Intelligence
  // --------------------------------------------------

  async function loadIndustryPerformance() {
    setLoading(true);
    setError("");

    try {
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
        throw industryError;
      }

      if (!industryData || industryData.length === 0) {
        setIndustries([]);
        return;
      }

      // --------------------------------------------------
      // 2. Load Movie ↔️ Industry Relationships
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
        throw movieIndustryError;
      }

      // --------------------------------------------------
      // 3. Collect Movie IDs
      // --------------------------------------------------

      const movieIds = [
        ...new Set(
          (movieIndustryData || []).map((row) =>
            Number(row.movie_id)
          )
        ),
      ];

      // --------------------------------------------------
      // 4. Load India Box Office
      // --------------------------------------------------

      let stateBoxOffice: {
        movie_id: number;
        gross_jmi: number | null;
      }[] = [];

      let overseasBoxOffice: {
        movie_id: number;
        gross_inr: number | null;
      }[] = [];

      if (movieIds.length > 0) {
        const {
          data: stateData,
          error: stateError,
        } = await supabase
          .from("movie_state_box_office")
          .select(`
            movie_id,
            gross_jmi
          `)
          .in("movie_id", movieIds);

        if (stateError) {
          throw stateError;
        }

        stateBoxOffice = stateData || [];

        // --------------------------------------------------
        // 5. Load Overseas Box Office
        // --------------------------------------------------

        const {
          data: overseasData,
          error: overseasError,
        } = await supabase
          .from("movie_overseas_box_office")
          .select(`
            movie_id,
            gross_inr
          `)
          .in("movie_id", movieIds);

        if (overseasError) {
          throw overseasError;
        }

        overseasBoxOffice = overseasData || [];
      }

      // --------------------------------------------------
      // 6. Build Movie Gross Maps
      // --------------------------------------------------

      const movieIndiaGross: Record<number, number> = {};
      const movieOverseasGross: Record<number, number> = {};

      stateBoxOffice.forEach((row) => {
        const movieId = Number(row.movie_id);

        movieIndiaGross[movieId] =
          (movieIndiaGross[movieId] || 0) +
          Number(row.gross_jmi || 0);
      });

      overseasBoxOffice.forEach((row) => {
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

      (movieIndustryData || []).forEach((row) => {
        const movieId = Number(row.movie_id);
        const industryId = Number(row.industry_id);

        if (!industryMap[industryId]) {
          return;
        }

        industryMap[industryId].movieIds.add(movieId);
      });

      // --------------------------------------------------
      // 9. Calculate Industry Gross
      // --------------------------------------------------

      Object.values(industryMap).forEach((data) => {
        data.movieIds.forEach((movieId) => {
          data.indiaGross +=
            movieIndiaGross[movieId] || 0;

          data.overseasGross +=
            movieOverseasGross[movieId] || 0;
        });
      });

      // --------------------------------------------------
      // 10. Build Final Performance
      // --------------------------------------------------

      const performance: IndustryPerformance[] =
        industryData
          .map((industry) => {
            const data = industryMap[industry.id];

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
              nativeName: industry.native_name,
              movies: data.movieIds.size,
              indiaGross: data.indiaGross,
              overseasGross: data.overseasGross,
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
    } catch (err: any) {
      console.error(
        "Public Industry Intelligence error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load industry intelligence."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Format
  // --------------------------------------------------

  function formatGross(value: number) {
    return `₹${value.toLocaleString("en-IN")};`
  }

  // --------------------------------------------------
  // Overall Statistics
  // --------------------------------------------------

  const totalIndustryMovies = useMemo(
    () =>
      industries.reduce(
        (total, industry) =>
          total + industry.movies,
        0
      ),
    [industries]
  );

  const totalIndiaGross = useMemo(
    () =>
      industries.reduce(
        (total, industry) =>
          total + industry.indiaGross,
        0
      ),
    [industries]
  );

  const totalOverseasGross = useMemo(
    () =>
      industries.reduce(
        (total, industry) =>
          total + industry.overseasGross,
        0
      ),
    [industries]
  );

  const totalWorldwideGross =
    totalIndiaGross +
    totalOverseasGross;

  const activeIndustries = industries.filter(
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

  const indiaContribution =
    totalWorldwideGross > 0
      ? (totalIndiaGross /
          totalWorldwideGross) *
        100
      : 0;

  const overseasContribution =
    totalWorldwideGross > 0
      ? (totalOverseasGross /
          totalWorldwideGross) *
        100
      : 0;

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-zinc-100">
        <PublicHeader />

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-5 py-12 text-center">
            <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-700">
              Loading Industry Intelligence...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-black text-zinc-100">
        <PublicHeader />

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
          <div className="rounded-xl border border-red-900/40 bg-zinc-950 px-5 py-8">
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-red-400">
              Industry Intelligence Error
            </p>

            <p className="mt-2 text-[9px] text-zinc-500">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">

        {/* ==================================================
            BACK
        ================================================== */}

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.16em] text-violet-500 transition hover:text-violet-400"
        >
          ← Back to Home
        </Link>

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <section className="mt-7">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-pink-400">
            JMI • Industry Intelligence
          </p>

          <h1 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-green-500/70 sm:text-3xl">
            All Industries Intelligence
          </h1>

          <p className="mt-2 max-w-3xl text-[9px] leading-5 text-zinc-400 sm:text-[10px]">
            Comprehensive box-office comparison across all film
            industries tracked by Jeruto Movie Intelligence.
          </p>
        </section>

        {/* ==================================================
            OVERALL INDUSTRY PERFORMANCE
        ================================================== */}

        <section className="mt-8">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 sm:p-5">

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                Industry Overview
              </p>

              <h2 className="mt-1.5 text-base font-medium text-pink-400 sm:text-lg">
                Overall Industry Performance
              </h2>

              <p className="mt-1 text-[9px] leading-4 text-zinc-400 sm:text-[9px]">
                Combined performance of all movies associated with
                the tracked industries.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">

              {/* Active Industries */}

              <div className="rounded-lg border border-zinc-900 bg-black p-3.5">
                <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-400">
                  Active Industries
                </p>

                <p className="mt-2 text-xl font-medium text-green-500">
                  {activeIndustries}
                </p>
              </div>

              {/* Associations */}

              <div className="rounded-lg border border-zinc-900 bg-black p-3.5">
                <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-500">
                  Total Movies
                </p>

                <p className="mt-2 text-xl font-medium text-green-500">
                  {totalIndustryMovies}
                </p>
              </div>

              {/* India */}

              <div className="rounded-lg border border-zinc-900 bg-black p-3.5">
                <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-400">
                  Combined India Gross
                </p>

                <p className="mt-2 text-base text-[14px] font-small text-green-500">
                  {formatGross(totalIndiaGross)}
                </p>
              </div>

              {/* Worldwide */}

              <div className="rounded-lg border border-violet-400/20 bg-violet-400/[0.035] p-3.5">
                <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-400">
                  Combined Worldwide Gross
                </p>

                <p className="mt-2 text-base text-[14px] font-small text-violet-300">
                  {formatGross(totalWorldwideGross)}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ==================================================
            INDUSTRY HIGHLIGHTS
        ================================================== */}

        <section className="mt-8">
          <div className="mb-4">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Industry Highlights
            </p>

            <h2 className="mt-1.5 text-base font-medium text-yellow-400/90 sm:text-lg">
              Current leaders across the industry ecosystem.
            </h2>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">

            {/* Highest Grossing */}

            <Link
              href={
                highestGrossingIndustry
                  ? `/preview/industries/${highestGrossingIndustry.id}`
                  : "#"
              }
              className="
                group
                rounded-xl
                border
                border-violet-400/50
                bg-violet-400/[0.035]
                p-4
                text-zinc-400
                transition-all
                duration-300
                hover:border-violet-400/35
                hover:bg-violet-400/[0.055]
              "
            >
              <p className="text-[7px] uppercase tracking-[0.16em] text-zinc-400">
                Highest-Grossing Industry
              </p>

              {highestGrossingIndustry ? (
                <>
                  <p className="mt-2 text-lg font-medium text-green-500">
                    {highestGrossingIndustry.name}
                  </p>

                  <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-zinc-400">
                    Worldwide Gross
                  </p>

                  <p className="mt-1 text-sm font-medium text-red-400">
                    {formatGross(
                      highestGrossingIndustry.worldwideGross
                    )}
                  </p>

                  <p className="mt-3 text-[7px] uppercase tracking-[0.12em] text-violet-400/60 transition group-hover:text-violet-300">
                    View Industry Intelligence →
                  </p>
                </>
              ) : (
                <p className="mt-3 text-[8px] text-zinc-600">
                  No data available.
                </p>
              )}
            </Link>

            {/* Most Productive */}

            <Link
              href={
                mostProductiveIndustry
                  ? `/preview/industries/${mostProductiveIndustry.id}`
                  : "#"
              }
              className="
                group
                rounded-xl
                border
                border-violet-400/60
                bg-zinc-950
                p-4
                transition-all
                duration-300
                hover:border-violet-400/25
                hover:bg-zinc-900/70
              "
            >
              <p className="text-[7px] uppercase tracking-[0.16em] text-zinc-400">
                Most Productive Industry
              </p>

              {mostProductiveIndustry ? (
                <>
                  <p className="mt-2 text-lg font-medium text-green-500 transition group-hover:text-white">
                    {mostProductiveIndustry.name}
                  </p>

                  <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-zinc-400">
                    Total Movies Produced
                  </p>

                  <p className="mt-1 text-sm font-medium text-zinc-300">
                    {mostProductiveIndustry.movies}
                  </p>

                  <p className="mt-3 text-[7px] uppercase tracking-[0.12em] text-zinc-400 transition group-hover:text-violet-300">
                    View Industry Intelligence →
                  </p>
                </>
              ) : (
                <p className="mt-3 text-[8px] text-zinc-600">
                  No data available.
                </p>
              )}
            </Link>

          </div>
        </section>

        {/* ==================================================
            INDUSTRY PERFORMANCE COMPARISON
        ================================================== */}

        <section className="mt-10">
          <div className="mb-4">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Industry Comparison
            </p>

            <h2 className="mt-1.5 text-base font-medium text-zinc-200 sm:text-lg">
              Industry Performance Comparison
            </h2>

            <p className="mt-1 text-[9px] leading-4 text-zinc-400 sm:text-[9px]">
              All tracked industries ranked by worldwide box-office
              gross.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[820px]">

                <thead className="border-b border-zinc-900 bg-black">

                  <tr>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-[0.12em] text-green-500">
                      Rank
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-[0.12em] text-yellow-400">
                      Industry
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-[0.12em] text-yellow-400">
                      Movies
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-[0.12em] text-yellow-400">
                      India Gross
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-[0.12em] text-yellow-400">
                      Overseas Gross
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-[0.12em] text-yellow-400">
                      Worldwide Gross
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-[0.12em] text-yellow-400">
                      Overseas Share
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-[0.12em] text-yellow-400">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {industries.map(
                    (industry, index) => (
                      <tr
                        key={industry.id}
                        className="border-b border-zinc-900 last:border-0 transition hover:bg-zinc-900/50"
                      >

                        {/* Rank */}

                        <td className="px-3 py-3 text-[9px] font-medium text-green-500">
                          #{index + 1}
                        </td>

                        {/* Industry */}

                        <td className="px-3 py-3">

                          <Link
                            href={`/preview/industries/${industry.id}`}
                            className="group"
                          >
                            <p className="text-[9px] font-medium text-zinc-200 transition group-hover:text-violet-300">
                              {industry.name}
                            </p>

                            {industry.nativeName && (
                              <p className="mt-0.5 text-[7px] text-zinc-700">
                                {industry.nativeName}
                              </p>
                            )}
                          </Link>

                        </td>

                        {/* Movies */}

                        <td className="px-3 py-3 text-[9px] text-zinc-400">
                          {industry.movies}
                        </td>

                        {/* India */}

                        <td className="px-3 py-3 text-[8px] text-zinc-400">
                          {formatGross(
                            industry.indiaGross
                          )}
                        </td>

                        {/* Overseas */}

                        <td className="px-3 py-3 text-[8px] text-zinc-400">
                          {formatGross(
                            industry.overseasGross
                          )}
                        </td>

                        {/* Worldwide */}

                        <td className="px-3 py-3 text-[8px] font-medium text-violet-300">
                          {formatGross(
                            industry.worldwideGross
                          )}
                        </td>

                        {/* Overseas Share */}

                        <td className="px-3 py-3 text-[8px] text-zinc-400">
                          {industry.overseasPercentage.toFixed(
                            2
                          )}
                          %
                        </td>

                        {/* Action */}

                        <td className="px-3 py-3">

                          <Link
                            href={`/preview/industries/${industry.id}`}
                            className="
                              inline-flex
                              whitespace-nowrap
                              rounded-md
                              border
                              border-zinc-400
                              px-2.5
                              py-1.5
                              text-[7px]
                              uppercase
                              tracking-[0.08em]
                              text-zinc-400
                              transition
                              hover:border-violet-400/30
                              hover:text-violet-300
                            "
                          >
                            View Intelligence
                          </Link>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          </div>
        </section>

        {/* ==================================================
            DOMESTIC VS OVERSEAS
        ================================================== */}

        <section className="mt-10">

          <div className="mb-4">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Market Contribution
            </p>

            <h2 className="mt-1.5 text-base font-medium text-pink-400 sm:text-lg">
              Domestic vs Overseas Contribution
            </h2>

            <p className="mt-1 text-[8px] leading-4 text-zinc-400 sm:text-[9px]">
              Combined contribution of India and overseas markets
              across all industries.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">

            {/* INDIA */}

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-400">
                India Contribution
              </p>

              <p className="mt-2 text-xl font-medium text-green-500">
                {indiaContribution.toFixed(2)}%
              </p>

              <p className="mt-2 text-[7px] uppercase tracking-[0.12em] text-zinc-400">
                India Gross
              </p>

              <p className="mt-1 text-sm font-medium text-red-400">
                {formatGross(totalIndiaGross)}
              </p>

            </div>

            {/* OVERSEAS */}

            <div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.035] p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-400">
                Overseas Contribution
              </p>

              <p className="mt-2 text-xl font-medium text-violet-500">
                {overseasContribution.toFixed(2)}%
              </p>

              <p className="mt-2 text-[7px] uppercase tracking-[0.12em] text-zinc-400">
                Overseas Gross
              </p>

              <p className="mt-1 text-sm font-medium text-red-400">
                {formatGross(totalOverseasGross)}
              </p>

            </div>

          </div>

          {/* CONTRIBUTION BAR */}

          <div className="mt-3 rounded-xl border border-zinc-900 bg-zinc-950 p-4">

            <div className="mb-2 flex justify-between gap-3">

              <span className="text-[7px] uppercase tracking-[0.1em] text-zinc-400">
                India {indiaContribution.toFixed(1)}%
              </span>

              <span className="text-[7px] uppercase tracking-[0.1em] text-zinc-400">
                Overseas {overseasContribution.toFixed(1)}%
              </span>

            </div>

            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">

              <div
                className="bg-green-500"
                style={{
                  width: `${indiaContribution}%,`
                }}
              />

              <div
                className="bg-red-400"
                style={{
                  width: `${overseasContribution}%,`
                }}
              />

            </div>

          </div>

        </section>

        {/* ==================================================
            DATA NOTE
        ================================================== */}

        <section className="mt-10">

          <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-4 sm:px-5">

            <div className="flex items-start gap-3">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/[0.04] text-[10px] text-violet-400">
                J
              </div>

              <div>

                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-yellow-500">
                  JMI Industry Intelligence
                </p>

                <p className="mt-1.5 text-[8px] leading-4 text-zinc-400 sm:text-[9px]">
                  Industry performance is calculated from movie-industry
                  associations and the corresponding India and overseas
                  box-office records tracked by JMI. A movie associated
                  with multiple industries contributes to each applicable
                  industry.
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}