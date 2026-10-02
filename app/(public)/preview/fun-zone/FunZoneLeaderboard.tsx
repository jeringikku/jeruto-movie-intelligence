"use client";

import { useEffect, useState } from "react";

type Period = "daily" | "weekly" | "monthly";

type LeaderboardEntry = {
  user_id: string;
  total_points: number;
  predictions: number;
  average_accuracy: number;
};

type ApiResponse = {
  success: boolean;
  period: Period;
  leaderboard: LeaderboardEntry[];
  error?: string;
};

const PERIODS: {
  key: Period;
  label: string;
  shortLabel: string;
}[] = [
  {
    key: "daily",
    label: "Daily",
    shortLabel: "Today",
  },
  {
    key: "weekly",
    label: "Weekly",
    shortLabel: "This Week",
  },
  {
    key: "monthly",
    label: "Monthly",
    shortLabel: "This Month",
  },
];

function getMemberLabel(userId: string) {
  return `JMI Member • ${userId.slice(0, 6).toUpperCase()}`;
}

function formatAccuracy(value: number) {
  return `${Number(value || 0).toFixed(2)}%`;
}

export default function FunZoneLeaderboard() {
  const [period, setPeriod] =
    useState<Period>("daily");

  const [entries, setEntries] =
    useState<LeaderboardEntry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  async function loadLeaderboard() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/fun-zone/leaderboard?period=${period}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok) {
        setError(
          result?.error ||
            "Unable to load leaderboard."
        );
        setEntries([]);
        return;
      }

      setEntries(result.leaderboard || []);
    } catch (leaderboardError) {
      console.error(
        "Fun Zone leaderboard UI error:",
        leaderboardError
      );

      setError(
        "Unable to load the leaderboard."
      );

      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10">
      {/* SECTION HEADER */}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-yellow-400">
            JMI FUN ZONE LEADERBOARD
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Top 5 Winners
          </h2>

          <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-400">
            Members with the highest scored JMI Points
            during each period.
          </p>
        </div>

        {/* PERIOD SWITCHER */}

        <div className="flex w-full rounded-lg border border-zinc-800 bg-zinc-950 p-1 sm:w-auto">
          {PERIODS.map((item) => {
            const active =
              period === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setPeriod(item.key)
                }
                className={`flex-1 rounded-md px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.1em] transition sm:flex-none ${
                  active
                    ? "bg-yellow-400 text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <span className="sm:hidden">
                  {item.shortLabel}
                </span>

                <span className="hidden sm:inline">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEADERBOARD CARD */}

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        {/* TABLE HEADER */}

        <div className="hidden grid-cols-[48px_minmax(0,1fr)_100px_100px_110px] gap-3 border-b border-zinc-900 bg-black px-5 py-3 sm:grid">
          <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-400">
            Rank
          </p>

          <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-400">
            Member
          </p>

          <p className="text-right text-[8px] uppercase tracking-[0.12em] text-zinc-400">
            Points
          </p>

          <p className="text-right text-[8px] uppercase tracking-[0.12em] text-zinc-400">
            Accuracy
          </p>

          <p className="text-right text-[8px] uppercase tracking-[0.12em] text-zinc-400">
            Predictions
          </p>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-zinc-800 border-t-yellow-400" />

            <p className="mt-4 text-[9px] uppercase tracking-[0.14em] text-zinc-500">
              Loading leaderboard
            </p>
          </div>
        ) : error ? (
          <div className="px-5 py-10 text-center">
            <p className="text-xs text-red-400">
              {error}
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-black text-lg">
              🏆
            </div>

            <p className="mt-4 text-sm font-medium text-zinc-300">
              No scored predictions yet
            </p>

            <p className="mt-1 text-[10px] text-zinc-500">
              The leaderboard will appear after
              predictions are scored.
            </p>
          </div>
        ) : (
          <div>
            {entries.map((entry, index) => {
              const rank = index + 1;

              return (
                <div
                  key={entry.user_id}
                  className="border-b border-zinc-900 last:border-b-0"
                >
                  {/* DESKTOP */}

                  <div className="hidden grid-cols-[48px_minmax(0,1fr)_100px_100px_110px] items-center gap-3 px-5 py-4 sm:grid">
                    <div>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold ${
                          rank === 1
                            ? "border border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
                            : rank === 2
                              ? "border border-zinc-400/30 bg-zinc-400/10 text-zinc-300"
                              : rank === 3
                                ? "border border-orange-400/30 bg-orange-400/10 text-orange-300"
                                : "border border-zinc-800 bg-black text-zinc-600"
                        }`}
                      >
                        {rank}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-zinc-300">
                        {getMemberLabel(
                          entry.user_id
                        )}
                      </p>

                      {rank === 1 && (
                        <p className="mt-1 text-[7px] uppercase tracking-[0.14em] text-yellow-400">
                          Top Performer
                        </p>
                      )}
                    </div>

                    <p className="text-right text-sm font-semibold text-yellow-400">
                      {entry.total_points}
                    </p>

                    <p className="text-right text-[10px] text-zinc-400">
                      {formatAccuracy(
                        entry.average_accuracy
                      )}
                    </p>

                    <p className="text-right text-[10px] text-zinc-500">
                      {entry.predictions}
                    </p>
                  </div>

                  {/* MOBILE */}

                  <div className="flex items-center gap-3 px-4 py-4 sm:hidden">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                        rank === 1
                          ? "border border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
                          : rank === 2
                            ? "border border-zinc-400/30 bg-zinc-400/10 text-zinc-300"
                            : rank === 3
                              ? "border border-orange-400/30 bg-orange-400/10 text-orange-300"
                              : "border border-zinc-800 bg-black text-zinc-600"
                      }`}
                    >
                      {rank}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-zinc-300">
                        {getMemberLabel(
                          entry.user_id
                        )}
                      </p>

                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-[8px] text-zinc-600">
                          {formatAccuracy(
                            entry.average_accuracy
                          )}{" "}
                          accuracy
                        </span>

                        <span className="text-[8px] text-zinc-700">
                          {entry.predictions}{" "}
                          prediction
                          {entry.predictions === 1
                            ? ""
                            : "s"}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-yellow-400">
                        {entry.total_points}
                      </p>

                      <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-700">
                        Points
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-[8px] uppercase tracking-[0.1em] text-red-500">
        Rankings are based only on scored Fun Zone
        predictions.
      </p>
    </section>
  );
}