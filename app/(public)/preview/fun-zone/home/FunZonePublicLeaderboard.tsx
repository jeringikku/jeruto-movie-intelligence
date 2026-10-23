"use client";

import { useCallback, useEffect, useState } from "react";

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
};

type LeaderboardResponse = {
  success: boolean;
  leaderboard?: LeaderboardEntry[];
  error?: string;
  updated_at?: string;
};

export default function FunZonePublicLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/fun-zone/public-leaderboard",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result =
        (await response.json()) as LeaderboardResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to load the leaderboard."
        );
      }

      setEntries(result.leaderboard ?? []);
      setLastUpdated(result.updated_at ?? null);
      setError(null);
    } catch (err) {
      console.error("Public leaderboard loading error:", err);

      setError(
        "The leaderboard is temporarily unavailable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();

    // Refresh the standings every 60 seconds.
    const interval = window.setInterval(() => {
      void loadLeaderboard();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [loadLeaderboard]);

  return (
    <section
      aria-labelledby="jmi-public-leaderboard-title"
      className="mt-12 overflow-hidden rounded-2xl border border-amber-800/40 bg-[#100b07] shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:mt-16"
    >
      {/* Header */}
      <div className="relative overflow-hidden border-b border-amber-900/40 bg-gradient-to-r from-[#241508] via-[#171006] to-[#241508] px-5 py-7 sm:px-8 sm:py-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-amber-500/[0.08] blur-3xl"
        />

        <div className="relative text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">
            The JMI Hall of Fame
          </p>

          <h2
            id="jmi-public-leaderboard-title"
            className="mt-3 font-serif text-2xl font-bold text-[#f3e4c8] sm:text-3xl"
          >
            🏆 Universal Leaderboard
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-zinc-400 sm:text-sm">
            Celebrating the members who have earned JMI Points
            through eligible JMI activities.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-700/30 bg-black/30 px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-amber-100/70">
              Public Rankings · Top 10 Members
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div
            className="py-12 text-center text-xs text-amber-100/60"
            role="status"
          >
            Loading the JMI Hall of Fame...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-8 text-center">
            <p className="text-xs text-red-200">{error}</p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadLeaderboard();
              }}
              className="mt-4 rounded-lg border border-amber-700/40 px-4 py-2 text-[9px] font-bold uppercase tracking-wider text-amber-200 transition hover:bg-amber-950/40"
            >
              Try Again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-amber-900/30 bg-black/20 px-4 py-10 text-center">
            <span className="text-3xl" aria-hidden="true">
              🎯
            </span>

            <h3 className="mt-4 font-serif text-lg font-semibold text-amber-100">
              The Competition Starts Here
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-zinc-500">
              No members have earned leaderboard points yet.
              Earn points through eligible JMI activities to
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const isChampion = entry.rank === 1;

              return (
                <article
                  key={entry.user_id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition sm:gap-4 sm:p-4 ${
                    isChampion
                      ? "border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-[#171006]"
                      : entry.rank <= 3
                        ? "border-amber-800/30 bg-amber-950/[0.12]"
                        : "border-zinc-800/70 bg-black/20"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-serif text-sm font-bold sm:h-12 sm:w-12 sm:text-base ${
                      entry.rank === 1
                        ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
                        : entry.rank === 2
                          ? "border-zinc-400/40 bg-zinc-400/10 text-zinc-200"
                          : entry.rank === 3
                            ? "border-orange-700/50 bg-orange-900/20 text-orange-300"
                            : "border-zinc-800 bg-black/30 text-zinc-500"
                    }`}
                    aria-label={`Rank ${entry.rank}`}
                  >
                    {entry.rank === 1
                      ? "♛"
                      : entry.rank === 2
                        ? "Ⅱ"
                        : entry.rank === 3
                          ? "Ⅲ"
                          : entry.rank}
                  </div>

                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-800/40 bg-[#24170d] sm:h-11 sm:w-11">
                    {entry.avatar_url ? (
                      // The profile image is decorative; the member's
                      // display name remains available to screen readers.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={entry.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="font-serif text-lg text-amber-300"
                      >
                        {entry.display_name
                          .trim()
                          .charAt(0)
                          .toUpperCase() || "J"}
                      </span>
                    )}
                  </div>

                  {/* Member details */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`truncate text-xs font-semibold sm:text-sm ${
                        isChampion
                          ? "text-amber-100"
                          : "text-zinc-200"
                      }`}
                    >
                      {entry.display_name}
                    </h3>

                    <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                      {isChampion
                        ? "Leaderboard Champion"
                        : `Rank ${entry.rank} · JMI Member`}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="shrink-0 text-right">
                    <p
                      className={`font-serif text-lg font-bold sm:text-xl ${
                        isChampion
                          ? "text-amber-300"
                          : "text-amber-100"
                      }`}
                    >
                      {entry.total_points.toLocaleString("en-IN")}
                    </p>

                    <p className="text-[8px] uppercase tracking-[0.12em] text-amber-700">
                      JMI Points
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex flex-col gap-3 border-t border-amber-900/30 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9px] leading-5 text-zinc-600">
            Rankings reflect recorded JMI Points balances.
          </p>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadLeaderboard();
            }}
            disabled={loading}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-amber-800/40 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-200 transition hover:border-amber-500/50 hover:bg-amber-950/30 disabled:cursor-wait disabled:opacity-50"
          >
            ↻ Refresh Rankings
          </button>
        </div>

        {lastUpdated && (
          <p className="mt-3 text-center text-[8px] text-zinc-700">
            Last updated:{" "}
            {new Date(lastUpdated).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Kolkata",
            })}{" "}
            IST
          </p>
        )}
      </div>
    </section>
  );
}