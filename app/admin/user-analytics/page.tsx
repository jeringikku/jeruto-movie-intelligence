"use client";

import { useEffect, useState } from "react";
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

export default function UserAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    registeredUsers: 0,
    totalProfiles: 0,
    homepageViews: 0,
    moviePageViews: 0,
    moviesWithViews: 0,
  });

  const [popularMovies, setPopularMovies] = useState<PopularMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setErrorMessage("");

    try {
      // ==========================================
      // PROFILES
      // ==========================================

      const { count: profileCount, error: profileError } =
        await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

      if (profileError) throw profileError;

      // ==========================================
      // HOMEPAGE VIEWS
      // ==========================================

      const {
        data: homepageData,
        error: homepageError,
      } = await supabase
        .from("jmi_homepage_views")
        .select("view_count");

      if (homepageError) throw homepageError;

      const homepageViews = (homepageData || []).reduce(
        (total, row) => total + Number(row.view_count || 0),
        0
      );

      // ==========================================
      // MOVIE PAGE VIEWS
      // ==========================================

      const {
        data: movieViewsData,
        error: movieViewsError,
      } = await supabase
        .from("jmi_movie_page_views")
        .select("movie_id, view_count");

      if (movieViewsError) throw movieViewsError;

      const moviePageViews = (movieViewsData || []).reduce(
        (total, row) => total + Number(row.view_count || 0),
        0
      );

      // ==========================================
      // MOVIES WITH VIEW COUNTERS
      // ==========================================

      const movieIds = (movieViewsData || []).map(
        (row) => row.movie_id
      );

      const {
        data: moviesData,
        error: moviesError,
      } = movieIds.length > 0
        ? await supabase
            .from("movies")
            .select("id, title, release_year")
            .in("id", movieIds)
        : { data: [], error: null };

      if (moviesError) throw moviesError;

      const movieMap = new Map(
        (moviesData || []).map((movie) => [
          Number(movie.id),
          movie,
        ])
      );

      const rankedMovies: PopularMovie[] = (
        movieViewsData || []
      )
        .map((row) => {
          const movie = movieMap.get(Number(row.movie_id));

          if (!movie) return null;

          return {
            movie_id: Number(row.movie_id),
            view_count: Number(row.view_count || 0),
            title: movie.title,
            release_year: movie.release_year,
          };
        })
        .filter((movie): movie is PopularMovie => movie !== null)
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10);

      setPopularMovies(rankedMovies);

      // ==========================================
// REGISTERED USERS — SUPABASE AUTH
// ==========================================

const {
  data: { session },
  error: sessionError,
} = await supabase.auth.getSession();

if (sessionError || !session?.access_token) {
  throw new Error("Admin session not available.");
}

const response = await fetch("/api/admin/user-analytics", {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
  cache: "no-store",
});

if (!response.ok) {
  throw new Error("Unable to retrieve registered users.");
}

const accountData = await response.json();

setStats({
  registeredUsers: accountData.registeredUsers,
  totalProfiles: profileCount ?? 0,
  homepageViews,
  moviePageViews,
  moviesWithViews: (movieViewsData || []).length,
});
    } catch (error) {
      console.error("JMI User Analytics Error:", error);

      setErrorMessage(
        "Some analytics data could not be loaded. Please check the console and Supabase permissions."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat("en-IN").format(value);
  }

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
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
            Jeruto Movie Intelligence
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            User Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Monitor JMI registrations, recorded traffic and
            movie-page popularity from one place.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="w-fit rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm transition hover:border-violet-500/50 hover:bg-zinc-800"
        >
          ↻ Refresh Analytics
        </button>
      </div>

      {/* ERROR */}

      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* OVERVIEW */}

      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-300">
            Platform Overview
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Current totals from JMI's available database records.
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
                  <p className="text-xs text-zinc-400">
                    {card.label}
                  </p>

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

      {/* TRAFFIC SUMMARY */}

      <section className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/20 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          JMI Traffic Summary
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500">
              Homepage
            </p>

            <p className="mt-2 text-2xl font-semibold text-yellow-400">
              {formatNumber(stats.homepageViews)}
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Movie Pages
            </p>

            <p className="mt-2 text-2xl font-semibold text-violet-400">
              {formatNumber(stats.moviePageViews)}
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Combined Recorded Views
            </p>

            <p className="mt-2 text-2xl font-semibold text-pink-400">
              {formatNumber(
                stats.homepageViews + stats.moviePageViews
              )}
            </p>
          </div>
        </div>

        <p className="mt-5 border-t border-zinc-800 pt-4 text-xs leading-5 text-zinc-500">
          These are recorded page-view counters, not unique visitors
          or active-user counts.
        </p>
      </section>

      {/* POPULAR MOVIES */}

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Content Performance
          </p>

          <h2 className="mt-2 text-lg font-semibold">
            Most-Viewed Movies
          </h2>

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

      {/* UPCOMING ANALYTICS */}

      <section className="rounded-xl border border-dashed border-zinc-800 bg-black/40 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          Next Analytics Layer
        </p>

        <h2 className="mt-2 text-lg font-semibold">
          Registration & User Activity
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Daily registrations, monthly growth, active users,
          returning visitors and user-activity trends will be added
          after we connect authoritative authentication data and
          implement the activity tracking needed to calculate them.
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

      {/* FOOTER */}

      <div className="flex flex-col gap-3 border-t border-zinc-900 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-600">
          JMI Administrative Analytics
        </p>

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