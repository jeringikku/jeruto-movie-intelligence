"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Territory = {
  id: number;
  name: string;
  slug: string;
};

type State = {
  id: number;
  name: string;
  code: string;
  territory_id: number;
  geographic_region_id: number | null;
};

export function GeographicalBreakdown() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeographicalData();
  }, []);

  async function fetchGeographicalData() {
    setLoading(true);

    const [territoriesResult, statesResult] =
      await Promise.all([
        supabase
          .from("territories")
          .select("id, name, slug")
          .eq("country_id", 1)
          .eq("territory_type", "REGION")
          .order("id"),

        supabase
          .from("states")
          .select(
            "id, name, code, territory_id, geographic_region_id"
          )
          .eq("country_id", 1)
          .order("name"),
      ]);

    if (territoriesResult.error) {
      console.error(
        "Territories fetch error:",
        territoriesResult.error
      );
    } else {
      setTerritories(
        territoriesResult.data || []
      );
    }

    if (statesResult.error) {
      console.error(
        "States fetch error:",
        statesResult.error
      );
    } else {
      setStates(statesResult.data || []);
    }

    setLoading(false);
  }

  function getStatesForTerritory(
    territoryId: number
  ) {
    return states.filter(
      (state) =>
        state.territory_id === territoryId
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-black p-6">
        <p className="text-zinc-400">
          Loading geographical breakdown...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h2 className="text-xl font-bold text-white">
          Geographical Breakdown
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Indian states organized automatically by
          geographical territory.
        </p>
      </div>

      {/* Territories */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {territories.map((territory) => {
          const territoryStates =
            getStatesForTerritory(
              territory.id
            );

          return (
            <div
              key={territory.id}
              className="rounded-xl border border-zinc-700 bg-black"
            >

              {/* Territory Header */}

              <div className="border-b border-zinc-700 p-5">

                <h3 className="text-lg font-bold text-yellow-400">
                  {territory.name}
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  {territoryStates.length} states /
                  territories
                </p>

              </div>

              {/* States */}

              <div className="divide-y divide-zinc-800">

                {territoryStates.length === 0 ? (

                  <div className="p-5 text-sm text-zinc-500">
                    No states assigned to this
                    territory.
                  </div>

                ) : (

                  territoryStates.map((state) => (

                    <div
                      key={state.id}
                      className="flex items-center justify-between px-5 py-4 hover:bg-zinc-900/50"
                    >

                      <div>
                        <p className="font-medium text-white">
                          {state.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {state.code}
                        </p>
                      </div>

                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                        {territory.name}
                      </span>

                    </div>

                  ))

                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}