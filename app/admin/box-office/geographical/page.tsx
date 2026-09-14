"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Region = {
  id: number;
  name: string;
  code: string | null;
  display_order: number | null;
};

type StateRecord = {
  id: number;
  movie_id: number;
  state_id: number | null;
  coverage_type: string;
  gross_jmi: number | null;
  net_jmi: number | null;
  admissions: number | null;
};

type StateInfo = {
  id: number;
  name: string;
  geographic_region_id: number | null;
};

type RegionTotal = {
  id: number;
  name: string;
  code: string | null;
  display_order: number;
  gross: number;
  net: number;
  admissions: number;
};

export default function GeographicalPage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam ? Number(movieIdParam) : null;

  const [regions, setRegions] = useState<RegionTotal[]>([]);
  const [restOfIndia, setRestOfIndia] = useState({
    gross: 0,
    net: 0,
    admissions: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movieId) {
      fetchGeographicalBreakdown(movieId);
    } else {
      setRegions([]);
      setRestOfIndia({
        gross: 0,
        net: 0,
        admissions: 0,
      });
    }
  }, [movieId]);

  async function fetchGeographicalBreakdown(
    currentMovieId: number
  ) {
    setLoading(true);

    /*
     * STEP 1
     * Load geographic regions.
     */

    const { data: regionData, error: regionError } =
      await supabase
        .from("geographic_regions")
        .select(
          "id, name, code, display_order"
        )
        .eq("country_id", 1)
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

    if (regionError) {
      console.error(regionError);

      alert(
        "Failed to load geographic regions: " +
          regionError.message
      );

      setLoading(false);
      return;
    }

    /*
     * STEP 2
     * Load all Indian states and their
     * geographic region mapping.
     */

    const { data: stateData, error: stateError } =
      await supabase
        .from("states")
        .select(
          "id, name, geographic_region_id"
        )
        .eq("country_id", 1);

    if (stateError) {
      console.error(stateError);

      alert(
        "Failed to load states: " +
          stateError.message
      );

      setLoading(false);
      return;
    }

    /*
     * STEP 3
     * Load current state-wise cumulative
     * collection records for this movie.
     *
     * This table contains ONLY the current
     * state-wise values.
     */

    const {
      data: collectionData,
      error: collectionError,
    } = await supabase
      .from("movie_state_box_office")
      .select(
        `
        id,
        movie_id,
        state_id,
        coverage_type,
        gross_jmi,
        net_jmi,
        admissions
        `
      )
      .eq("movie_id", currentMovieId);

    if (collectionError) {
      console.error(collectionError);

      alert(
        "Failed to load state-wise collection: " +
          collectionError.message
      );

      setLoading(false);
      return;
    }

    /*
     * STEP 4
     * Create quick lookup maps.
     */

    const stateMap = new Map<
      number,
      StateInfo
    >();

    for (const state of (stateData ||
      []) as StateInfo[]) {
      stateMap.set(state.id, state);
    }

    /*
     * STEP 5
     * Create totals for every geographic region.
     */

    const totalsMap = new Map<
      number,
      RegionTotal
    >();

    for (const region of (regionData ||
      []) as Region[]) {
      totalsMap.set(region.id, {
        id: region.id,
        name: region.name,
        code: region.code,
        display_order:
          region.display_order ?? 999,
        gross: 0,
        net: 0,
        admissions: 0,
      });
    }

    /*
     * STEP 6
     * Separate Rest of India.
     */

    let restGross = 0;
    let restNet = 0;
    let restAdmissions = 0;

    /*
     * STEP 7
     * Add each state's current cumulative
     * value to its geographic region.
     */

    for (const row of (collectionData ||
      []) as StateRecord[]) {
      const gross = Number(
        row.gross_jmi || 0
      );

      const net = Number(
        row.net_jmi || 0
      );

      const admissions = Number(
        row.admissions || 0
      );

      /*
       * Rest of India
       */

      if (
        row.coverage_type ===
        "REST_OF_INDIA"
      ) {
        restGross += gross;
        restNet += net;
        restAdmissions += admissions;

        continue;
      }

      /*
       * State
       */

      if (
        row.coverage_type !== "STATE" ||
        row.state_id === null
      ) {
        continue;
      }

      const state = stateMap.get(
        row.state_id
      );

      if (
        !state ||
        state.geographic_region_id ===
          null
      ) {
        continue;
      }

      const region = totalsMap.get(
        state.geographic_region_id
      );

      if (!region) {
        continue;
      }

      region.gross += gross;
      region.net += net;
      region.admissions += admissions;
    }

    /*
     * STEP 8
     * Convert map into array.
     */

    const finalRegions = Array.from(
      totalsMap.values()
    ).sort(
      (a, b) =>
        a.display_order -
        b.display_order
    );

    setRegions(finalRegions);

    setRestOfIndia({
      gross: restGross,
      net: restNet,
      admissions: restAdmissions,
    });

    setLoading(false);
  }

  function formatCollection(
    value: number
  ) {
    if (!value) {
      return "—";
    }

    return `₹${new Intl.NumberFormat(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    ).format(value)}`;
  }

  function formatNumber(
    value: number
  ) {
    if (!value) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-IN"
    ).format(value);
  }

  if (!movieId) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="rounded-xl border border-yellow-500/30 bg-zinc-950 p-8 text-center">
          <h2 className="text-xl font-bold text-yellow-400">
            No Movie Selected
          </h2>

          <p className="mt-2 text-zinc-400">
            Please select a movie from the
            Box Office page first.
          </p>
        </div>
      </div>
    );
  }

  const totalGross =
  regions.reduce(
    (sum, region) =>
      sum + region.gross,
    0
  ) + restOfIndia.gross;

const totalNet =
  regions.reduce(
    (sum, region) =>
      sum + region.net,
    0
  ) + restOfIndia.net;

const totalAdmissions =
  regions.reduce(
    (sum, region) =>
      sum + region.admissions,
    0
  ) + restOfIndia.admissions;
  
    

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-yellow-400">
          Geographical Breakdown
        </h1>

        <p className="text-gray-400 mt-1">
          Current cumulative theatrical
          performance by geographic region
        </p>
      </div>

      {/* Overview */}

      <div className="mb-8">

        <h2 className="text-xl font-bold mb-4">
          Geographic Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Gross */}

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">
              Total Geographic Gross
            </p>

            <h3 className="text-2xl font-bold mt-2 text-yellow-400">
              {formatCollection(
                totalGross
              )}
            </h3>
          </div>

          {/* Net */}

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">
              Total Geographic Net
            </p>

            <h3 className="text-2xl font-bold mt-2 text-yellow-400">
              {formatCollection(
                totalNet
              )}
            </h3>
          </div>

          {/* Footfalls */}

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">
              Total Geographic Footfalls
            </p>

            <h3 className="text-2xl font-bold mt-2 text-yellow-400">
              {formatNumber(
                totalAdmissions
              )}
            </h3>
          </div>

        </div>
      </div>

      {/* Regional Records */}

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl">

        <div className="p-6 border-b border-zinc-800">

          <h2 className="text-xl font-bold">
            Geographic Regional Performance
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Current cumulative collection
            derived from State-wise Collection
          </p>

        </div>

        {loading ? (

          <div className="p-8 text-center text-zinc-500">
            Loading geographical data...
          </div>

        ) : regions.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No state-wise box-office data
            available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm">
                    Geographic Region
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Cumulative Gross
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Cumulative Net
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Cumulative Footfalls
                  </th>

                </tr>

              </thead>

              <tbody>

                {regions.map(
                  (region) => (

                    <tr
                      key={region.id}
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >

                      <td className="px-5 py-4 font-medium">
                        {region.name}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatCollection(
                          region.gross
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatCollection(
                          region.net
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatNumber(
                          region.admissions
                        )}
                      </td>

                    </tr>

                  )
                )}

                {/* Rest of India */}

                <tr className="border-t-2 border-yellow-500/30 bg-zinc-900/40">

                  <td className="px-5 py-4 font-bold text-yellow-400">
                    Rest of India
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-yellow-400">
                    {formatCollection(
                      restOfIndia.gross
                    )}
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-yellow-400">
                    {formatCollection(
                      restOfIndia.net
                    )}
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-yellow-400">
                    {formatNumber(
                      restOfIndia.admissions
                    )}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* Information */}

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">

        <p className="text-sm text-zinc-400">
          <span className="text-yellow-400 font-semibold">
            How this works:
          </span>{" "}
          Geographic totals are automatically
          calculated from the latest cumulative
          State-wise Collection figures. Updating
          a state on the State-wise page will
          automatically update its geographic
          region here.
        </p>

        <p className="text-sm text-zinc-500 mt-2">
          Rest of India is displayed separately
          and is not included in the geographic
          region totals to prevent double-counting.
        </p>

      </div>

    </div>
  );
}