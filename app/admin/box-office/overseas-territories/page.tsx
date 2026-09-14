"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TerritoryRecord = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  gross_usd: number;
  country_count: number;
};

export default function OverseasTerritoriesPage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam
    ? Number(movieIdParam)
    : null;

  const [records, setRecords] = useState<
    TerritoryRecord[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [totalUsd, setTotalUsd] =
    useState(0);

  // --------------------------------------------------
  // LOAD TERRITORY DATA
  // --------------------------------------------------

  useEffect(() => {
    if (movieId) {
      fetchTerritoryData(movieId);
    } else {
      setLoading(false);
    }
  }, [movieId]);

async function fetchTerritoryData(
  currentMovieId: number
) {
  setLoading(true);

  // --------------------------------------------------
  // LOAD TERRITORY GROUPS
  // --------------------------------------------------

  const {
    data: groups,
    error: groupsError,
  } = await supabase
    .from("overseas_territory_groups")
    .select(
      "id, name, slug, description"
    )
    .order("id", {
      ascending: true,
    });

  if (groupsError) {
    console.error(
      "Territory groups fetch error:",
      groupsError
    );

    alert(
      "Failed to load territory groups: " +
        groupsError.message
    );

    setLoading(false);
    return;
  }

  // --------------------------------------------------
  // LOAD COUNTRY-WISE COLLECTION
  // --------------------------------------------------

  const {
    data: countryRecords,
    error: countryError,
  } = await supabase
    .from(
      "movie_country_box_office"
    )
    .select(`
      country_id,
      gross_usd
    `)
    .eq(
      "movie_id",
      currentMovieId
    );

  if (countryError) {
    console.error(
      "Country-wise collection fetch error:",
      countryError
    );

    alert(
      "Failed to load country-wise collection: " +
        countryError.message
    );

    setLoading(false);
    return;
  }

  // --------------------------------------------------
  // LOAD COUNTRIES
  // --------------------------------------------------

  const {
    data: countries,
    error: countriesError,
  } = await supabase
    .from("countries")
    .select(
      "id, name, iso_code, slug"
    );

  if (countriesError) {
    console.error(
      "Countries fetch error:",
      countriesError
    );

    alert(
      "Failed to load countries: " +
        countriesError.message
    );

    setLoading(false);
    return;
  }

  // --------------------------------------------------
  // LOAD TERRITORY MAPPINGS
  // --------------------------------------------------

  const {
    data: mappings,
    error: mappingsError,
  } = await supabase
    .from(
      "overseas_territory_group_countries"
    )
    .select(
      "territory_group_id, country_id"
    );

  if (mappingsError) {
    console.error(
      "Territory mappings fetch error:",
      mappingsError
    );

    alert(
      "Failed to load territory mappings: " +
        mappingsError.message
    );

    setLoading(false);
    return;
  }

  // --------------------------------------------------
  // CREATE COUNTRY USD MAP
  // --------------------------------------------------

  const countryUsdMap =
    new Map<number, number>();

  (countryRecords || []).forEach(
    (record: any) => {
      countryUsdMap.set(
        Number(record.country_id),
        Number(
          record.gross_usd || 0
        )
      );
    }
  );

  // --------------------------------------------------
  // IDENTIFY AGGREGATE ENTRIES
  // --------------------------------------------------

  const gccCountry =
    (countries || []).find(
      (country: any) =>
        country.slug === "gcc"
    );

  const northAmericaCountry =
    (countries || []).find(
      (country: any) =>
        country.slug === "north-america"
    );

  const gccId =
    gccCountry
      ? Number(gccCountry.id)
      : null;

  const northAmericaId =
    northAmericaCountry
      ? Number(
          northAmericaCountry.id
        )
      : null;

  const hasGccAggregate =
    gccId !== null &&
    countryUsdMap.has(gccId);

  const hasNorthAmericaAggregate =
    northAmericaId !== null &&
    countryUsdMap.has(
      northAmericaId
    );

  // --------------------------------------------------
  // CALCULATE TERRITORY TOTALS
  // --------------------------------------------------

  const calculatedRecords =
    (groups || []).map(
      (group: any) => {

        const groupMappings =
          (mappings || []).filter(
            (mapping: any) =>
              Number(
                mapping.territory_group_id
              ) ===
              Number(group.id)
          );

        let grossUsd = 0;

        const countriesWithData =
          new Set<number>();

        // ----------------------------------------------
        // GCC OVERRIDE
        // ----------------------------------------------

        if (
          group.slug === "gcc" &&
          hasGccAggregate &&
          gccId !== null
        ) {
          grossUsd =
            countryUsdMap.get(
              gccId
            ) || 0;

          countriesWithData.add(
            gccId
          );

          return {
            id: Number(group.id),
            name: group.name,
            slug: group.slug,
            description:
              group.description,
            gross_usd:
              grossUsd,
            country_count:
              1,
          };
        }

        // ----------------------------------------------
        // NORTH AMERICA OVERRIDE
        // ----------------------------------------------

        if (
          group.slug ===
            "north-america" &&
          hasNorthAmericaAggregate &&
          northAmericaId !== null
        ) {
          grossUsd =
            countryUsdMap.get(
              northAmericaId
            ) || 0;

          countriesWithData.add(
            northAmericaId
          );

          return {
            id: Number(group.id),
            name: group.name,
            slug: group.slug,
            description:
              group.description,
            gross_usd:
              grossUsd,
            country_count:
              1,
          };
        }

        // ----------------------------------------------
        // NORMAL COUNTRY CALCULATION
        // ----------------------------------------------

        groupMappings.forEach(
          (mapping: any) => {

            const countryId =
              Number(
                mapping.country_id
              );

            // If this territory has an
            // aggregate record, don't
            // calculate it from the
            // underlying countries.
            if (
              group.slug === "gcc" &&
              hasGccAggregate
            ) {
              return;
            }

            if (
              group.slug ===
                "north-america" &&
              hasNorthAmericaAggregate
            ) {
              return;
            }

            const countryGross =
              countryUsdMap.get(
                countryId
              ) || 0;

            grossUsd +=
              countryGross;

            if (
              countryUsdMap.has(
                countryId
              )
            ) {
              countriesWithData.add(
                countryId
              );
            }
          }
        );

        return {
          id: Number(group.id),

          name: group.name,

          slug: group.slug,

          description:
            group.description,

          gross_usd:
            grossUsd,

          country_count:
            countriesWithData.size,
        };
      }
    );

  // --------------------------------------------------
  // SORT BY USD COLLECTION
  // --------------------------------------------------

  calculatedRecords.sort(
    (a, b) =>
      b.gross_usd -
      a.gross_usd
  );

  setRecords(
    calculatedRecords
  );

  // --------------------------------------------------
  // TOTAL
  // --------------------------------------------------

  const territoryTotal =
    calculatedRecords.reduce(
      (sum, record) =>
        sum +
        record.gross_usd,
      0
    );

  setTotalUsd(
    territoryTotal
  );

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
        Loading major territories...
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
          Major Overseas Territories
        </h1>

        <p className="mt-1 text-gray-400">
          Commercial territory analysis based on country-wise overseas collection
        </p>

      </div>

      {/* OVERVIEW */}

      <div className="mb-8">

        <h2 className="mb-4 text-xl font-bold">
          Territory Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* GROUPS */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Territory Groups
            </p>

            <h3 className="mt-3 text-3xl font-bold text-yellow-400">
              {records.length}
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Commercial territory groups configured
            </p>

          </div>

          {/* REFERENCE TOTAL */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Territory Group Sum
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              USD reference only
            </p>

            <h3 className="mt-1 text-3xl font-bold text-yellow-400">
              {formatUSD(
                totalUsd
              )}
            </h3>

          </div>

        </div>

      </div>

      {/* TERRITORY BREAKDOWN */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-800 p-6">

          <h2 className="text-xl font-bold">
            Major Territory Collection
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Automatically aggregated from country-wise USD collections
          </p>

        </div>

        {records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">

            No major territory data configured yet.

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm">
                    Territory
                  </th>

                  <th className="px-5 py-4 text-left text-sm">
                    Description
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
                        record.id
                      }
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >

                      {/* TERRITORY */}

                      <td className="px-5 py-4 font-semibold text-yellow-400">

                        {record.name}

                      </td>

                      {/* DESCRIPTION */}

                      <td className="px-5 py-4 text-sm text-zinc-400">

                        {record.description ||
                          "—"}

                      </td>

                      {/* COUNTRIES */}

                      <td className="px-5 py-4 text-right">

                        {record.country_count}

                      </td>

                      {/* USD */}

                      <td className="px-5 py-4 text-right font-semibold">

                        {formatUSD(
                          record.gross_usd
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* NOTE */}

      <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">

        <p className="text-sm text-zinc-400">

          <span className="font-semibold text-yellow-400">
            Note:
          </span>{" "}
          Territory groups are analytical views generated from country-wise
          collection data. A country can belong to more than one territory
          group, so the territory group sum should not be treated as the
          movie's total overseas collection.

        </p>

      </div>

    </div>
  );
}