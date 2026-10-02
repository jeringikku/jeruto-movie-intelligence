"use client";

import { useEffect, useState } from "react";

type FunZoneStatsData = {
  total_points: number;
  total_predictions: number;
  scored_predictions: number;
  accurate_predictions: number;
  average_accuracy: number;
  best_accuracy: number;
  best_points: number;
};

export default function FunZoneStats() {
  const [stats, setStats] = useState<FunZoneStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/fun-zone/stats", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load your Fun Zone statistics."
        );
      }

      setStats(data.stats);
    } catch (err) {
      console.error("Fun Zone stats load error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your Fun Zone statistics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-400">
            My Fun Zone
          </p>
          <h2 className="mt-1 text-sm font-semibold text-pink-400">
            My Statistics
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-lg border border-zinc-900 bg-zinc-900/40"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-400">
          My Fun Zone
        </p>

        <h2 className="mt-1 text-sm font-semibold text-pink-400">
          My Statistics
        </h2>

        <p className="mt-3 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2 text-[10px] text-red-300">
          {error}
        </p>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      label: "JMI Points",
      value: stats.total_points.toLocaleString("en-IN"),
      accent: "text-yellow-400",
    },
    {
      label: "Predictions",
      value: stats.total_predictions.toLocaleString("en-IN"),
      accent: "text-white",
    },
    {
      label: "Avg. Accuracy",
      value: `${stats.average_accuracy.toFixed(2)}%`,
      accent: "text-violet-400",
    },
    {
      label: "Best Accuracy",
      value: `${stats.best_accuracy.toFixed(2)}%`,
      accent: "text-yellow-400",
    },
    {
      label: "90%+ Accuracy",
      value: stats.accurate_predictions.toLocaleString("en-IN"),
      accent: "text-emerald-400",
    },
    {
      label: "Best Points",
      value: stats.best_points.toLocaleString("en-IN"),
      accent: "text-violet-400",
    },
  ];

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-400">
            My Fun Zone
          </p>

          <h2 className="mt-1 text-sm font-semibold text-pink-400">
            My Statistics
          </h2>

          <p className="mt-1 text-[9px] leading-4 text-zinc-500">
            Your personal JMI Fun Zone performance summary.
          </p>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-600">
            Scored Predictions
          </p>
          <p className="mt-0.5 text-xs font-semibold text-zinc-300">
            {stats.scored_predictions.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-zinc-800 bg-black/40 px-3 py-3"
          >
            <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-300">
              {card.label}
            </p>

            <p
              className={`mt-2 text-base font-semibold tracking-tight ${card.accent}`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}