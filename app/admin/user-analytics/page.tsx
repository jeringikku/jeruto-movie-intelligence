"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AnalyticsStats = {
  registeredUsers: number;
  totalProfiles: number;
  homepageViews: number;
  moviePageViews: number;
  moviesWithViews: number;
};

type PopularMovie = {
  movie_id: number;
  view_count: number;
  title: string;
  release_year: number | null;
};

type TrafficPoint = {
  date: string;
  views: number;
};

type AnalyticsResponse = {
  stats: AnalyticsStats;
  popularMovies: PopularMovie[];
  traffic: {
    homepage: TrafficPoint[];
    movies: TrafficPoint[];
    combined: TrafficPoint[];
    hasDatedRecords: boolean;
  };
};

const emptyStats: AnalyticsStats = {
  registeredUsers: 0,
  totalProfiles: 0,
  homepageViews: 0,
  moviePageViews: 0,
  moviesWithViews: 0,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function TrafficLineChart({
  title,
  description,
  points,
  accent,
}: {
  title: string;
  description: string;
  points: TrafficPoint[];
  accent: string;
}) {
  const width = 760;
  const height = 270;
  const left = 62;
  const right = 20;
  const top = 24;
  const bottom = 55;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const values = points.map((point) => point.views);
  const maximum = Math.max(1, ...values);
  const yMaximum = Math.ceil(maximum / 5) * 5 || 5;

  const coordinates = points.map((point, index) => ({
    ...point,
    x:
      points.length <= 1
        ? left + chartWidth / 2
        : left + (index / (points.length - 1)) * chartWidth,
    y: top + chartHeight - (point.views / yMaximum) * chartHeight,
  }));

  const linePoints = coordinates
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const yTicks = Array.from({ length: 5 }, (_, index) =>
    Math.round((yMaximum * (4 - index)) / 4)
  );

  const dateIndexes = Array.from(
    new Set(
      [0, Math.floor((points.length - 1) / 2), points.length - 1]
        .filter((index) => index >= 0 && index < points.length)
    )
  );

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-zinc-100">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {description}
        </p>
      </div>

      {points.length === 0 ? (
        <div className="flex min-h-[210px] items-center justify-center rounded-lg border border-dashed border-zinc-800 px-4 text-center text-sm text-zinc-500">
          No dated traffic records are available yet. Daily
          history will appear as dated records are collected.
        </div>
      ) : (
        <>
          <div className="w-full">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label={`${title} line graph. Vertical axis: number of views. Horizontal axis: date.`}
              className="block h-auto w-full"
            >
              {yTicks.map((tick, index) => {
                const y = top + (index / 4) * chartHeight;

                return (
                  <g key={`${tick}-${index}`}>
                    <line
                      x1={left}
                      y1={y}
                      x2={width - right}
                      y2={y}
                      stroke="#27272a"
                      strokeDasharray="4 5"
                    />
                    <text
                      x={left - 10}
                      y={y + 4}
                      fill="#a1a1aa"
                      fontSize="11"
                      textAnchor="end"
                    >
                      {formatNumber(tick)}
                    </text>
                  </g>
                );
              })}

              <line
                x1={left}
                y1={top}
                x2={left}
                y2={top + chartHeight}
                stroke="#52525b"
              />

              <line
                x1={left}
                y1={top + chartHeight}
                x2={width - right}
                y2={top + chartHeight}
                stroke="#52525b"
              />

              {coordinates.length > 1 && (
                <polygon
                  points={`${left},${top + chartHeight} ${linePoints} ${coordinates[coordinates.length - 1].x},${top + chartHeight}`}
                  fill={accent}
                  fillOpacity="0.10"
                />
              )}

              {coordinates.length > 1 && (
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke={accent}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {coordinates.map((point, index) => (
                <g key={`${point.date}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={accent}
                    stroke="#09090b"
                    strokeWidth="2"
                  >
                    <title>
                      {formatDate(point.date)}: {formatNumber(point.views)} views
                    </title>
                  </circle>
                </g>
              ))}

              {dateIndexes.map((index) => {
                const point = coordinates[index];
                if (!point) return null;

                return (
                  <text
                    key={`${point.date}-${index}`}
                    x={point.x}
                    y={top + chartHeight + 23}
                    fill="#a1a1aa"
                    fontSize="11"
                    textAnchor={
                      index === 0
                        ? "start"
                        : index === points.length - 1
                          ? "end"
                          : "middle"
                    }
                  >
                    {formatDate(point.date)}
                  </text>
                );
              })}

              <text
                x={16}
                y={top + chartHeight / 2}
                fill="#a1a1aa"
                fontSize="11"
                textAnchor="middle"
                transform={`rotate(-90 16 ${top + chartHeight / 2})`}
              >
                No. of views
              </text>

              <text
                x={left + chartWidth / 2}
                y={height - 7}
                fill="#a1a1aa"
                fontSize="11"
                textAnchor="middle"
              >
                Date
              </text>
            </svg>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3 text-xs">
            <span className="text-zinc-500">
              {points.length} dated data point{points.length === 1 ? "" : "s"}
            </span>
            <span className="font-medium" style={{ color: accent }}>
              {formatNumber(points[points.length - 1]?.views ?? 0)} views
              {points.length > 1 ? " · latest recorded date" : ""}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

export default function UserAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>(emptyStats);
  const [popularMovies, setPopularMovies] = useState<PopularMovie[]>([]);
  const [traffic, setTraffic] = useState<AnalyticsResponse["traffic"]>({
    homepage: [],
    movies: [],
    combined: [],
    hasDatedRecords: false,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      
      const { data: { session }, error: sessionError } =
  await supabase.auth.getSession();

if (sessionError || !session?.access_token) {
  throw new Error("Admin session not available. Please sign in again.");
}

const response = await fetch("/api/admin/user-analytics", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
  cache: "no-store",
});

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || `Analytics request failed (${response.status}).`
        );
      }

      const data = result as AnalyticsResponse;

      setStats(data.stats);
      setPopularMovies(data.popularMovies ?? []);
      setTraffic(
        data.traffic ?? {
          homepage: [],
          movies: [],
          combined: [],
          hasDatedRecords: false,
        }
      );
    } catch (error) {
      console.error("JMI User Analytics Error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load analytics. Check administrator access and Supabase configuration."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const statCards = [
    {
      label: "Registered Users",
      value: stats.registeredUsers,
      description: "Total JMI accounts created",
      icon: "👥",
      accent: "border-violet-500/30",
    },
    {
      label: "User Profiles",
      value: stats.totalProfiles,
      description: "Records in the profiles table",
      icon: "◈",
      accent: "border-zinc-700",
    },
    {
      label: "Homepage Views",
      value: stats.homepageViews,
      description: "Total recorded views",
      icon: "⌂",
      accent: "border-yellow-500/30",
    },
    {
      label: "Movie-Page Views",
      value: stats.moviePageViews,
      description: "Combined recorded views",
      icon: "🎬",
      accent: "border-pink-500/30",
    },
    {
      label: "Movies Tracked",
      value: stats.moviesWithViews,
      description: "Movies with view counters",
      icon: "▤",
      accent: "border-violet-500/30",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-zinc-400">
          Loading JMI User Analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-zinc-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
            Jeruto Movie Intelligence
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            User Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Monitor JMI registrations, recorded traffic and movie-page
            popularity from one place.
          </p>
        </div>

        <button
          onClick={() => void loadAnalytics()}
          disabled={loading}
          className="w-fit rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm transition hover:border-violet-500/50 hover:bg-zinc-800 disabled:opacity-50"
        >
          ↻ Refresh Analytics
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300"
        >
          {errorMessage}
          <p className="mt-1 text-xs text-red-300/70">
            If this occurs only on the public deployment, check the deployed
            environment variables and the admin role assigned to your account.
          </p>
        </div>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold uppercase tracking-[0.16em] text-zinc-300">
            Platform Overview
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Current totals from JMI database records.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border ${card.accent} bg-zinc-950 p-5 transition hover:bg-zinc-900/70`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-400">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    {formatNumber(card.value)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {card.description}
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-black text-lg">
                  {card.icon}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/20 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          JMI Traffic Summary
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-lg text-zinc-500">Homepage Real-time Views</p>
            <p className="mt-2 text-2xl font-semibold text-yellow-400">
              {formatNumber(stats.homepageViews)}
            </p>
          </div>

          <div>
            <p className="text-lg text-zinc-500">Movie-Page Real-time Views</p>
            <p className="mt-2 text-2xl font-semibold text-violet-400">
              {formatNumber(stats.moviePageViews)}
            </p>
          </div>

          <div>
            <p className="text-lg text-zinc-500">Total Real-time Combined Platform Views</p>
            <p className="mt-2 text-3xl font-semibold text-pink-400">
              {formatNumber(stats.homepageViews + stats.moviePageViews)}
            </p>
          </div>
        </div>

        <p className="mt-5 border-t border-zinc-800 pt-4 text-xs leading-5 text-zinc-500">
          These are recorded page views, not unique visitors or active-user
          counts.
        </p>
      </section>

      {/* TRAFFIC GRAPHS: BETWEEN SUMMARY AND MOST-VIEWED MOVIES */}

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Traffic Trends
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Daily Platform Traffic
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Recorded views by date. The combined graph adds homepage and
            movie-page views for each date.
          </p>
        </div>

        {!traffic.hasDatedRecords && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs leading-5 text-yellow-200/80">
            Daily history is not available in the current records. These
            graphs will populate when dated traffic records exist. Existing
            lifetime counters cannot recreate historical daily totals.
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          <TrafficLineChart
            title="Homepage Views"
            description="Daily recorded homepage views."
            points={traffic.homepage}
            accent="#facc15"
          />

          <TrafficLineChart
            title="Movie-Page Views"
            description="Daily recorded views across movie pages."
            points={traffic.movies}
            accent="#a78bfa"
          />

          <div className="xl:col-span-2">
            <TrafficLineChart
              title="Combined Platform Views"
              description="Homepage views plus movie-page views for each date."
              points={traffic.combined}
              accent="#f472b6"
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Content Performance
          </p>
          <h2 className="mt-2 text-lg font-semibold">Most-Viewed Movies</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Ranked by existing cumulative movie-page counters.
          </p>
        </div>

        {popularMovies.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-500">
            No movie-view ranking is available.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {popularMovies.map((movie, index) => (
              <div
                key={movie.movie_id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-900/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-black text-sm font-semibold text-violet-400">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {movie.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {movie.release_year ?? "Year unavailable"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-yellow-400">
                    {formatNumber(movie.view_count)}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
                    Views
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-dashed border-zinc-800 bg-black/40 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          Next Analytics Layer
        </p>
        <h2 className="mt-2 text-lg font-semibold">
          Registration &amp; User Activity
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Daily registrations, monthly growth, active users, returning
          visitors and user-activity trends require authoritative
          authentication data and activity tracking.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Registration Trends",
            "Daily Active Users",
            "Weekly Active Users",
            "Returning Users",
          ].map((label) => (
            <span
              key={label}
              className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-500"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-zinc-900 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-600">JMI Administrative Analytics</p>
        <Link
          href="/admin/dashboard"
          className="text-xs text-violet-400 transition hover:text-violet-300"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}