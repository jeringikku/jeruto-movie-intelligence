"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";

export type ContinentPerformance = {
  continent: string;
  grossUsd: number;
  countryCount: number;
};

type WorldContinentMapProps = {
  data: ContinentPerformance[];
};

type GeoFeature = {
  type: string;
  properties?: {
    continent?: string;
    continent_part?: string;
  };
  geometry?: unknown;
};

type GeoJSONData = {
  type: string;
  features: GeoFeature[];
};

const GEO_URL = "/maps/world_continents.geojson";

const CONTINENT_LABELS: Record<string, string> = {
  asia: "Asia",
  europe: "Europe",
  africa: "Africa",
  north_america: "North America",
  south_america: "South America",
  oceania: "Oceania",
  antarctica: "Antarctica",
};

function normalizeContinent(
  value: string | null | undefined
) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function formatUSD(value: number) {
  if (!value || value <= 0) return "—";

  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function getIntensity(
  value: number,
  maxValue: number
) {
  if (!value || !maxValue) return 0.12;

  const ratio = value / maxValue;

  if (ratio >= 0.75) return 0.95;
  if (ratio >= 0.5) return 0.75;
  if (ratio >= 0.25) return 0.55;
  if (ratio > 0) return 0.35;

  return 0.12;
}

export default function WorldContinentMap({
  data,
}: WorldContinentMapProps) {
  const [geography, setGeography] =
    useState<GeoJSONData | null>(null);

  const [mapError, setMapError] =
    useState(false);

  const [selectedContinent, setSelectedContinent] =
    useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD WORLD GEOJSON
  --------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadGeography() {
      try {
        setMapError(false);

        const response = await fetch(GEO_URL);

        if (!response.ok) {
          throw new Error(
            `GeoJSON request failed: ${response.status}`
          );
        }

        const json =
          (await response.json()) as GeoJSONData;

        if (!json.features) {
          throw new Error(
            "GeoJSON contains no features"
          );
        }

        if (!cancelled) {
          setGeography(json);
        }
      } catch (error) {
        console.error(
          "Failed to load world geography:",
          error
        );

        if (!cancelled) {
          setMapError(true);
        }
      }
    }

    loadGeography();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------------------------------
     DATA MAP
  --------------------------------------------------------- */

  const dataMap = useMemo(() => {
    const map = new Map<
      string,
      ContinentPerformance
    >();

    data.forEach((item) => {
      map.set(
        normalizeContinent(item.continent),
        item
      );
    });

    return map;
  }, [data]);

  const maxGross = useMemo(() => {
    return Math.max(
      0,
      ...data.map((item) =>
        Number(item.grossUsd || 0)
      )
    );
  }, [data]);

  const totalUsd = useMemo(() => {
    return data.reduce(
      (sum, item) =>
        sum + Number(item.grossUsd || 0),
      0
    );
  }, [data]);

  const selectedData = selectedContinent
    ? dataMap.get(selectedContinent) || null
    : null;

  function getShare(value: number) {
    if (!totalUsd || value <= 0) return 0;

    return (value / totalUsd) * 100;
  }

  /* ---------------------------------------------------------
     MAP ERROR
  --------------------------------------------------------- */

  if (mapError) {
    return (
      <div className="space-y-4">

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

          <div className="border-b border-zinc-900 px-4 py-3">
            <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500">
              Global Performance Map
            </p>

            <p className="mt-1 text-[10px] text-zinc-700">
              Reported overseas performance by continent
            </p>
          </div>

          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-[9px] text-zinc-600">
              Failed to load geography data
            </p>
          </div>

        </div>

      </div>
    );
  }

  /* ---------------------------------------------------------
     MAP LOADING
  --------------------------------------------------------- */

  if (!geography) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-900 px-4 py-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            Global Performance Map
          </p>

          <p className="mt-1 text-[10px] text-zinc-700">
            Reported overseas performance by continent
          </p>
        </div>

        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-[9px] text-zinc-700">
            Loading world map…
          </p>
        </div>

      </div>
    );
  }

  /* ---------------------------------------------------------
     MAP
  --------------------------------------------------------- */

  return (
    <div className="space-y-4">

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

        {/* HEADER */}

        <div className="border-b border-zinc-900 px-4 py-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            Global Performance Map
          </p>

          <p className="mt-1 text-[10px] text-zinc-700">
            Reported overseas performance by continent
          </p>
        </div>

        {/* MAP */}

        <div className="px-2 py-3 sm:px-4">

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 125,
              center: createCoordinates(10, 15),
            }}
            width={900}
            height={500}
            style={{
              width: "100%",
              height: "auto",
            }}
          >

            <Geographies geography={geography}>

              {({ geographies }) =>
                geographies.map(
                  (geo: any, index: number) => {

                    const key =
                      normalizeContinent(
                        geo.properties?.continent
                      );

                    const continentData =
                      dataMap.get(key);

                    const gross = Number(
                      continentData?.grossUsd || 0
                    );

                    const intensity =
                      getIntensity(
                        gross,
                        maxGross
                      );

                    const isSelected =
                      selectedContinent === key;

                    return (
                      <Geography
                        key={`${key}-${index}`}
                        geography={geo}
                        onClick={() => {
                          if (!key) return;

                          setSelectedContinent(
                            key
                          );
                        }}
                        style={{
                          default: {
                            fill: continentData
                              ? `rgba(139, 92, 246, ${intensity})`
                              : "rgba(39, 39, 42, 0.55)",

                            stroke: isSelected
                              ? "#a78bfa"
                              : "#27272a",

                            strokeWidth:
                              isSelected
                                ? 1.5
                                : 0.6,

                            outline: "none",

                            cursor: key
                              ? "pointer"
                              : "default",
                          },

                          hover: {
                            fill: continentData
                              ? "rgba(167, 139, 250, 0.95)"
                              : "rgba(63, 63, 70, 0.75)",

                            stroke: "#a78bfa",

                            strokeWidth: 1.2,

                            outline: "none",

                            cursor: key
                              ? "pointer"
                              : "default",
                          },

                          pressed: {
                            fill:
                              "rgba(124, 58, 237, 1)",

                            stroke: "#c4b5fd",

                            strokeWidth: 1.5,

                            outline: "none",
                          },
                        }}
                      />
                    );
                  }
                )
              }

            </Geographies>

          </ComposableMap>

        </div>

        {/* LEGEND */}

        <div className="flex items-center justify-between border-t border-zinc-900 px-4 py-3">

          <div>
            <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
              Intensity
            </p>

            <p className="mt-1 text-[8px] text-zinc-600">
              Based on reported USD gross
            </p>
          </div>

          <div className="flex items-center gap-1">

            <span className="h-2 w-5 rounded-sm bg-zinc-800" />
            <span className="h-2 w-5 rounded-sm bg-violet-950" />
            <span className="h-2 w-5 rounded-sm bg-violet-800" />
            <span className="h-2 w-5 rounded-sm bg-violet-600" />
            <span className="h-2 w-5 rounded-sm bg-violet-400" />

          </div>

        </div>

      </div>

      {/* -----------------------------------------------------
          SELECTED CONTINENT
      ----------------------------------------------------- */}

      {selectedData && selectedContinent && (
        <div className="rounded-xl border border-violet-900/40 bg-zinc-950 p-4">

          <div className="flex items-start justify-between gap-3">

            <div>
              <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
                Selected Continent
              </p>

              <h3 className="mt-1 text-sm font-medium text-zinc-100">
                {CONTINENT_LABELS[
                  selectedContinent
                ] || selectedData.continent}
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedContinent(null)
              }
              className="text-[9px] text-zinc-600 hover:text-zinc-300"
            >
              Clear
            </button>

          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">

            <div>
              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                USD Gross
              </p>

              <p className="mt-1 text-[10px] text-zinc-200">
                {formatUSD(
                  selectedData.grossUsd
                )}
              </p>
            </div>

            <div>
              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Share
              </p>

              <p className="mt-1 text-[10px] text-zinc-200">
                {getShare(
                  selectedData.grossUsd
                ).toFixed(1)}
                %
              </p>
            </div>

            <div>
              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Countries
              </p>

              <p className="mt-1 text-[10px] text-zinc-200">
                {selectedData.countryCount}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}