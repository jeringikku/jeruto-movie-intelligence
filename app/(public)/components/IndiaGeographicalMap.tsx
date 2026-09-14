"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";

const INDIA_GEOJSON = "/maps/india_states.geojson";

type IndiaGeoJSON = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: {
      type: string;
      coordinates: unknown;
    };
  }>;
};

export type StatePerformance = {
  stateId: number;
  stateName: string;
  regionName: string;
  gross: number;
  net: number;
  admissions: number;
};

type IndiaGeographicalMapProps = {
  stateData?: StatePerformance[];
};

function normalizeStateName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCrores(value: number) {
  if (!value || value <= 0) return "—";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  return `₹${(value / 100000).toFixed(2)} L`;
}

function formatNumber(value: number) {
  if (!value || value <= 0) return "—";

  return new Intl.NumberFormat("en-IN").format(value);
}

function getStateAliases(name: string) {
  const normalized = normalizeStateName(name);

  const aliases: Record<string, string[]> = {
    "jammu and kashmir": [
      "jammu and kashmir",
      "jammu & kashmir",
    ],

    "andaman and nicobar islands": [
      "andaman and nicobar islands",
      "andaman and nicobar",
    ],

    "dadra and nagar haveli and daman and diu": [
      "dadra and nagar haveli and daman and diu",
      "dadra and nagar haveli",
      "daman and diu",
    ],

    "nct of delhi": [
      "nct of delhi",
      "delhi",
    ],
  };

  return aliases[normalized] ?? [normalized];
}

function getPerformanceIntensity(
  gross: number,
  maxGross: number
) {
  if (!gross || !maxGross) {
    return 0;
  }

  return Math.min(gross / maxGross, 1);
}

export default function IndiaGeographicalMap({
  stateData = [],
}: IndiaGeographicalMapProps) {
  const [geoData, setGeoData] =
    useState<IndiaGeoJSON | null>(null);

  const [error, setError] = useState(false);

  const [selectedStateName, setSelectedStateName] =
    useState<string | null>(null);

  useEffect(() => {
    fetch(INDIA_GEOJSON)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load GeoJSON");
        }

        return response.json();
      })
      .then((data: IndiaGeoJSON) => {
        setGeoData(data);
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  const maxGross = useMemo(() => {
    return Math.max(
      0,
      ...stateData.map(
        (state) => state.gross || 0
      )
    );
  }, [stateData]);

  const getStateData = (geoName: string) => {
    const geoAliases = getStateAliases(geoName);

    return stateData.find((state) => {
      const stateName = normalizeStateName(
        state.stateName
      );

      return geoAliases.includes(stateName);
    });
  };

  const selectedState = selectedStateName
    ? getStateData(selectedStateName)
    : null;

  if (error) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-10 text-center">
        <p className="text-[9px] text-zinc-600">
          Geographical map data is currently unavailable.
        </p>
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-10 text-center">
        <p className="text-[9px] text-zinc-600">
          Loading geographical intelligence…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* ================================================= */}
      {/* INDIA MAP */}
      {/* ================================================= */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 sm:p-4">

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1050,
            center: createCoordinates(82, 22),
          }}
          width={800}
          height={720}
          className="h-auto w-full"
        >
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => {

                const geoName = String(
                  geo.properties?.ST_NM ?? ""
                );

                const state = getStateData(geoName);

                const intensity = state
                  ? getPerformanceIntensity(
                      state.gross,
                      maxGross
                    )
                  : 0;

                const fill =
                  state && intensity > 0
                    ? `rgba(139, 92, 246, ${
                        0.16 + intensity * 0.70
                      })`
                    : "#18181b";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (state) {
                        setSelectedStateName(
                          geoName
                        );
                      }
                    }}
                    style={{
                      default: {
                        fill,
                        stroke: "#3f3f46",
                        strokeWidth: 0.6,
                        outline: "none",
                      },

                      hover: {
                        fill:
                          state && intensity > 0
                            ? `rgba(167, 139, 250, ${
                                0.32 +
                                intensity * 0.62
                              })`
                            : "#27272a",
                        stroke: "#a78bfa",
                        strokeWidth: 1,
                        outline: "none",
                      },

                      pressed: {
                        fill:
                          state && intensity > 0
                            ? "#8b5cf6"
                            : "#3f3f46",
                        stroke: "#e4e4e7",
                        strokeWidth: 1,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

      </div>

      {/* ================================================= */}
      {/* MAP LEGEND */}
      {/* ================================================= */}

      <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">

        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
              Collection Intensity
            </p>

            <p className="mt-1 text-[8px] leading-4 text-zinc-600">
              Higher intensity indicates stronger
              cumulative performance.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">

            <span className="h-2 w-5 rounded-sm bg-violet-950" />
            <span className="h-2 w-5 rounded-sm bg-violet-800" />
            <span className="h-2 w-5 rounded-sm bg-violet-600" />
            <span className="h-2 w-5 rounded-sm bg-violet-400" />

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* SELECTED STATE */}
      {/* ================================================= */}

      {selectedState && (

        <div className="mt-3 rounded-xl border border-violet-400/20 bg-zinc-950 p-5">

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                State Intelligence
              </p>

              <h3 className="mt-2 text-sm font-medium tracking-[-0.01em] text-zinc-100">
                {selectedState.stateName}
              </h3>

              <p className="mt-1 text-[8px] text-zinc-600">
                {selectedState.regionName}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedStateName(null)
              }
              className="text-[8px] uppercase tracking-[0.15em] text-zinc-700 transition hover:text-violet-400"
            >
              Close
            </button>

          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-900 pt-4">

            <div>

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Gross
              </p>

              <p className="mt-1 text-[10px] font-medium text-zinc-200">
                {formatCrores(
                  selectedState.gross
                )}
              </p>

            </div>

            <div>

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Net
              </p>

              <p className="mt-1 text-[10px] font-medium text-zinc-200">
                {formatCrores(
                  selectedState.net
                )}
              </p>

            </div>

            <div>

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Footfalls
              </p>

              <p className="mt-1 text-[10px] font-medium text-zinc-200">
                {formatNumber(
                  selectedState.admissions
                )}
              </p>

            </div>

          </div>

        </div>

      )}

      {!selectedState &&
        stateData.length > 0 && (
          <p className="mt-3 text-center text-[8px] text-zinc-700">
            Tap a highlighted state to view its
            performance.
          </p>
        )}

    </div>
  );
}