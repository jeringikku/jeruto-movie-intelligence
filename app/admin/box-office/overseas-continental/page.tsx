"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ContinentalRecord = {
  continent: string;
  gross_usd: number;
  country_count: number;
};

export default function OverseasContinentalPage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam
    ? Number(movieIdParam)
    : null;

  const [records, setRecords] = useState<
    ContinentalRecord[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [totalUsd, setTotalUsd] =
    useState(0);

  // --------------------------------------------------
  // LOAD CONTINENTAL DATA
  // --------------------------------------------------

  useEffect(() => {
    if (movieId) {
      fetchContinentalData(movieId);
    } else {
      setLoading(false);
    }
  }, [movieId]);

  async function fetchContinentalData(
    currentMovieId: number
  ) {
    setLoading(true);

    // --------------------------------------------------
    // FETCH COUNTRY-WISE COLLECTION
    // --------------------------------------------------

    const { data, error } =
      await supabase
        .from(
          "movie_country_box_office"
        )
        .select(`
          gross_usd,
          countries (
            id,
            name,
            iso_code,
            continent
          )
        `)
        .eq(
          "movie_id",
          currentMovieId
        );

    if (error) {
      console.error(
        "Continental data fetch error:",
        error
      );

      alert(
        "Failed to load continental breakdown: " +
          error.message
      );

      setRecords([]);
      setTotalUsd(0);
      setLoading(false);

      return;
    }

    // --------------------------------------------------
    // GROUP BY CONTINENT
    // --------------------------------------------------

    const grouped: Record<
      string,
      {
        gross_usd: number;
        countries: Set<string>;
      }
    > = {};

    (data || []).forEach(
      (row: any) => {
        const country =
          Array.isArray(row.countries)
            ? row.countries[0]
            : row.countries;

        if (!country) {
          return;
        }

        const continent =
          country.continent;

        if (!continent) {
          return;
        }

        if (!grouped[continent]) {
          grouped[continent] = {
            gross_usd: 0,
            countries:
              new Set<string>(),
          };
        }

        grouped[
          continent
        ].gross_usd += Number(
          row.gross_usd || 0
        );

        grouped[
          continent
        ].countries.add(
          country.iso_code ||
            country.name
        );
      }
    );

    const result =
      Object.entries(
        grouped
      ).map(
        ([
          continent,
          value,
        ]) => ({
          continent,
          gross_usd:
            value.gross_usd,
          country_count:
            value.countries.size,
        })
      );

    // --------------------------------------------------
    // SORT BY USD GROSS
    // --------------------------------------------------

    result.sort(
      (a, b) =>
        b.gross_usd -
        a.gross_usd
    );

    setRecords(result);

    const total =
      result.reduce(
        (sum, record) =>
          sum +
          record.gross_usd,
        0
      );

    setTotalUsd(total);

    setLoading(false);
  }

  // --------------------------------------------------
  // FORMATTING
  // --------------------------------------------------

  function formatUSD(
    value: number
  ) {
    if (!value) {
      return "—";
    }

    return `$${new Intl.NumberFormat(
      "en-US",
      {
        maximumFractionDigits: 2,
      }
    ).format(value)}`;
  }

  // --------------------------------------------------
  // NO MOVIE
  // --------------------------------------------------

  if (!movieId) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">

        <div className="rounded-xl border border-yellow-500/30 bg-zinc-950 p-8 text-center">

          <h2 className="text-xl font-bold text-yellow-400">
            No Movie Selected
          </h2>

          <p className="mt-2 text-zinc-400">
            Please select a movie from the Box Office page first.
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-zinc-400">
        Loading continental breakdown...
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black p-6 text-white">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-yellow-400">
          Continental Breakdown
        </h1>

        <p className="mt-1 text-gray-400">
          Overseas theatrical performance by continent
        </p>

      </div>

      {/* OVERVIEW */}

      <div className="mb-8">

        <h2 className="mb-4 text-xl font-bold">
          Continental Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* TOTAL USD */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Total Country-wise Overseas
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              USD
            </p>

            <h3 className="mt-1 text-3xl font-bold text-yellow-400">
              {formatUSD(
                totalUsd
              )}
            </h3>

          </div>

          {/* CONTINENTS */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Continents Reported
            </p>

            <h3 className="mt-3 text-3xl font-bold text-yellow-400">
              {records.length}
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Based on country-wise collection data
            </p>

          </div>

        </div>

      </div>

      {/* BREAKDOWN */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-800 p-6">

          <h2 className="text-xl font-bold">
            Continental Collection
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Automatically aggregated from country-wise USD collections
          </p>

        </div>

        {records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">

            No continental overseas data available yet.

            <p className="mt-2 text-sm">
              Add country-wise collection data first.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm">
                    Continent
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Countries Reported
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    USD Gross
                  </th>

                </tr>

              </thead>

              <tbody>

                {records.map(
                  (record) => (

                    <tr
                      key={
                        record.continent
                      }
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >

                      <td className="px-5 py-4 font-medium text-yellow-400">

                        {record.continent}

                      </td>

                      <td className="px-5 py-4 text-right">

                        {record.country_count}

                      </td>

                      <td className="px-5 py-4 text-right font-semibold">

                        {formatUSD(
                          record.gross_usd
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

              {/* TOTAL */}

              <tfoot className="border-t border-yellow-500/30 bg-zinc-900">

                <tr>

                  <td className="px-5 py-5 font-bold text-yellow-400">

                    Total

                  </td>

                  <td className="px-5 py-5 text-right font-bold">

                    {records.reduce(
                      (
                        total,
                        record
                      ) =>
                        total +
                        record.country_count,
                      0
                    )}

                  </td>

                  <td className="px-5 py-5 text-right font-bold text-yellow-400">

                    {formatUSD(
                      totalUsd
                    )}

                  </td>

                </tr>

              </tfoot>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}