"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StatCard from "@/components/layout/StatCard";

type DashboardStats = {
  movies: number;
  people: number;
  companies: number;
  indiaGross: number;
  overseasGross: number;
  worldwideGross: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    movies: 0,
    people: 0,
    companies: 0,
    indiaGross: 0,
    overseasGross: 0,
    worldwideGross: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentMovies, setRecentMovies] = useState<
  {
    id: number;
    title: string;
    release_year: number | null;
  }[]
>([]);

const [recentPeople, setRecentPeople] = useState<
  {
    id: number;
    full_name: string;
  }[]
>([]);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    setLoading(true);

    try {
      // ============================================
      // BASIC COUNTS
      // ============================================

      const [
        moviesResult,
        peopleResult,
        companiesResult,
      ] = await Promise.all([
        supabase
          .from("movies")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("people")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("companies")
          .select("*", { count: "exact", head: true }),
      ]);

      if (moviesResult.error) {
        console.error(
          "Movies count error:",
          moviesResult.error
        );
      }

      if (peopleResult.error) {
        console.error(
          "People count error:",
          peopleResult.error
        );
      }

      if (companiesResult.error) {
        console.error(
          "Companies count error:",
          companiesResult.error
        );
      }

      // ============================================
      // INDIA GROSS
      //
      // Primary source:
      // movie_state_box_office
      //
      // STATE + REST_OF_INDIA together represent
      // the complete India figure.
      // ============================================

      const { data: indiaData, error: indiaError } =
        await supabase
          .from("movie_state_box_office")
          .select("gross_jmi, coverage_type")
          .in("coverage_type", [
            "STATE",
            "REST_OF_INDIA",
          ]);

      if (indiaError) {
        console.error(
          "India gross error:",
          indiaError
        );
      }

      const indiaGross = (indiaData || []).reduce(
        (total, row) =>
          total + Number(row.gross_jmi || 0),
        0
      );

      // ============================================
      // OVERSEAS GROSS
      //
      // Primary source:
      // movie_overseas_box_office
      //
      // We use gross_inr because the dashboard needs
      // one common currency for Worldwide calculation.
      // ============================================

      const {
        data: overseasData,
        error: overseasError,
      } = await supabase
        .from("movie_overseas_box_office")
        .select("gross_inr");

      if (overseasError) {
        console.error(
          "Overseas gross error:",
          overseasError
        );
      }

      const overseasGross = (
        overseasData || []
      ).reduce(
        (total, row) =>
          total + Number(row.gross_inr || 0),
        0
      );

      // ============================================
      // WORLDWIDE
      // ============================================

      const worldwideGross =
  indiaGross + overseasGross;

// ============================================
// RECENT MOVIES
// ============================================

const {
  data: recentMoviesData,
  error: recentMoviesError,
} = await supabase
  .from("movies")
  .select("id, title, release_year")
  .order("id", { ascending: false })
  .limit(5);

if (recentMoviesError) {
  console.error(
    "Recent movies error:",
    recentMoviesError
  );
} else {
  setRecentMovies(recentMoviesData ?? []);
}

// ============================================
// RECENT PEOPLE
// ============================================

const { data: peopleData, error: peopleDataError } =
  await supabase
    .from("people")
    .select("id, full_name")
    .order("id", { ascending: false })
    .limit(5);

if (peopleDataError) {
  console.error(
    "Recent people error:",
    peopleDataError
  );
}

setRecentPeople(peopleData || []);

// ============================================
// UPDATE DASHBOARD
// ============================================

setStats({
        movies: moviesResult.count ?? 0,
        people: peopleResult.count ?? 0,
        companies: companiesResult.count ?? 0,
        indiaGross,
        overseasGross,
        worldwideGross,
      });
    } catch (error) {
      console.error(
        "Dashboard statistics error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // FORMATTING
  // ============================================

  function formatNumber(value: number) {
    return new Intl.NumberFormat("en-IN").format(
      value
    );
  }

  function formatMoney(value: number) {
    if (!value) {
      return "₹0";
    }

    return (
      "₹" +
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(value)
    );
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-zinc-400">
          Loading JMI statistics...
        </div>
      </div>
    );
  }

  // ============================================
  // DASHBOARD
  // ============================================

  return (
    <div>

      {/* ======================================== */}
      {/* DATABASE STATISTICS */}
      {/* ======================================== */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        <StatCard
          title="Movies"
          value={formatNumber(stats.movies)}
        />

        <StatCard
          title="People"
          value={formatNumber(stats.people)}
        />

        <StatCard
          title="Companies"
          value={formatNumber(stats.companies)}
        />

        <StatCard
          title="India Gross"
          value={formatMoney(stats.indiaGross)}
        />

        <StatCard
          title="Overseas Gross"
          value={formatMoney(stats.overseasGross)}
        />

        <StatCard
          title="Worldwide Gross"
          value={formatMoney(stats.worldwideGross)}
        />

      </div>

      {/* ======================================== */}
      {/* JMI INTELLIGENCE CENTRE */}
      {/* ======================================== */}

      <div className="mt-8">

        <div className="mb-5">
          <h2 className="text-2xl font-bold">
            🧠 JMI Intelligence Centre
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Explore JMI's advanced movie, people, company, industry and
            market intelligence systems.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* Box Office Intelligence */}

          <button
            onClick={() => {
              window.location.href = "/admin/box-office";
            }}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left transition hover:border-yellow-500 hover:bg-zinc-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🎬</span>

              <span className="text-xs text-zinc-500 group-hover:text-yellow-400">
                Explore →
              </span>
            </div>

            <h3 className="mt-4 font-semibold">
              Box-Office Intelligence
            </h3>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Advanced theatrical performance, collections and
              box-office intelligence.
            </p>
          </button>


          {/* Person Intelligence */}

          <button
            onClick={() => {
              window.location.href = "/admin/person-intelligence";
            }}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left transition hover:border-yellow-500 hover:bg-zinc-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">👤</span>

              <span className="text-xs text-zinc-500 group-hover:text-yellow-400">
                Explore →
              </span>
            </div>

            <h3 className="mt-4 font-semibold">
              Person Intelligence
            </h3>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Role-based performance intelligence for actors,
              directors and other film personalities.
            </p>
          </button>


          {/* Company Intelligence */}

          <button
            onClick={() => {
              window.location.href = "/admin/company-intelligence";
            }}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left transition hover:border-yellow-500 hover:bg-zinc-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏢</span>

              <span className="text-xs text-zinc-500 group-hover:text-yellow-400">
                Explore →
              </span>
            </div>

            <h3 className="mt-4 font-semibold">
              Company Intelligence
            </h3>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Production, distribution and company-level movie
              business intelligence.
            </p>
          </button>


          {/* Industry Intelligence */}

          <button
            onClick={() => {
              window.location.href = "/admin/industry-intelligence";
            }}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left transition hover:border-yellow-500 hover:bg-zinc-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🎞️</span>

              <span className="text-xs text-zinc-500 group-hover:text-yellow-400">
                Explore →
              </span>
            </div>

            <h3 className="mt-4 font-semibold">
              Industry Intelligence
            </h3>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Industry-wide trends, performance patterns and
              strategic movie business intelligence.
            </p>
          </button>


          {/* Market Intelligence */}

          <button
            onClick={() => {
              window.location.href = "/admin/market-intelligence";
            }}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left transition hover:border-yellow-500 hover:bg-zinc-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🌍</span>

              <span className="text-xs text-zinc-500 group-hover:text-yellow-400">
                Explore →
              </span>
            </div>

            <h3 className="mt-4 font-semibold">
              Market Intelligence
            </h3>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              State and territory-level market performance,
              language, genre and market intelligence.
            </p>
          </button>

          {/* Homepage Posters */}

<button
  onClick={() => {
    window.location.href = "/admin/homepage-posters";
  }}
  className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left transition hover:border-yellow-500 hover:bg-zinc-800"
>
  <div className="flex items-center justify-between">
    <span className="text-2xl">🎞️</span>

    <span className="text-xs text-zinc-500 group-hover:text-yellow-400">
      Manage →
    </span>
  </div>

  <h3 className="mt-4 font-semibold">
    Homepage Posters
  </h3>

  <p className="mt-2 text-xs leading-5 text-zinc-500">
    Manage the posters displayed on the public JMI homepage.
  </p>
</button>

        </div>
      </div>


      {/* ======================================== */}
      {/* JMI AUTOMATED INSIGHTS */}
      {/* ======================================== */}

      <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-xl">
            🤖
          </div>

          <div>
            <h2 className="text-xl font-bold">
              JMI Automated Insights
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Automated intelligence generated from JMI's recorded
              movie and box-office data.
            </p>
          </div>

        </div>


        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">


          {/* Database Insight */}

          <div className="rounded-xl border border-zinc-800 bg-black/40 p-5">

            <div className="flex items-center justify-between">

              <span className="text-sm font-medium text-zinc-300">
                📊 Database Scale
              </span>

              <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
                LIVE
              </span>

            </div>

            <p className="mt-4 text-lg font-semibold">
              {formatNumber(stats.movies)} Movies
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              JMI currently contains{" "}
              <span className="text-zinc-300">
                {formatNumber(stats.movies)}
              </span>{" "}
              movies,{" "}
              <span className="text-zinc-300">
                {formatNumber(stats.people)}
              </span>{" "}
              people and{" "}
              <span className="text-zinc-300">
                {formatNumber(stats.companies)}
              </span>{" "}
              companies.
            </p>

          </div>


          {/* Box Office Insight */}

          <div className="rounded-xl border border-zinc-800 bg-black/40 p-5">

            <div className="flex items-center justify-between">

              <span className="text-sm font-medium text-zinc-300">
                💰 Box Office Intelligence
              </span>

              <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
                LIVE
              </span>

            </div>

            <p className="mt-4 text-lg font-semibold text-yellow-400">
              {formatMoney(stats.worldwideGross)}
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Combined recorded India and overseas gross currently
              tracked by JMI.
            </p>

          </div>


          {/* India Insight */}

          <div className="rounded-xl border border-zinc-800 bg-black/40 p-5">

            <div className="flex items-center justify-between">

              <span className="text-sm font-medium text-zinc-300">
                🇮🇳 India Market
              </span>

              <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
                LIVE
              </span>

            </div>

            <p className="mt-4 text-lg font-semibold text-yellow-400">
              {formatMoney(stats.indiaGross)}
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Recorded India theatrical gross currently available
              across JMI's tracked state and India-level data.
            </p>

          </div>


          {/* Overseas Insight */}

          <div className="rounded-xl border border-zinc-800 bg-black/40 p-5">

            <div className="flex items-center justify-between">

              <span className="text-sm font-medium text-zinc-300">
                🌎 Overseas Market
              </span>

              <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
                LIVE
              </span>

            </div>

            <p className="mt-4 text-lg font-semibold text-yellow-400">
              {formatMoney(stats.overseasGross)}
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Recorded overseas theatrical gross converted into
              JMI's common INR reporting value.
            </p>

          </div>

        </div>


        {/* Intelligence Status */}

        <div className="mt-5 rounded-xl border border-zinc-800 bg-black/30 px-5 py-4">

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold">
                🧠 JMI Intelligence Network
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Box-office, people, company, industry and market
                intelligence modules are connected to the JMI dashboard.
              </p>

            </div>

            <span className="w-fit rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
              ● Intelligence Systems Online
            </span>

          </div>

        </div>

      </div>

      {/* ======================================== */}
      {/* RECENT MOVIES + QUICK ACTIONS */}
      {/* ======================================== */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        

        {/* Recent Movies */}

<div className="rounded-xl bg-zinc-900 p-6">

  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold">
      Recent Movies
    </h2>

    <button
      onClick={() => {
        window.location.href = "/admin/movies";
      }}
      className="text-sm text-yellow-400 hover:text-yellow-300"
    >
      View All →
    </button>
  </div>

  <div className="mt-4 space-y-2">

    {recentMovies.length === 0 ? (
      <p className="text-sm text-zinc-500">
        No movies added yet.
      </p>
    ) : (
      recentMovies.map((movie) => (
        <div
          key={movie.id}
          className="flex items-center justify-between rounded-lg bg-black px-4 py-3"
        >

          <div>
            <p className="font-medium">
              {movie.title}
            </p>

            <p className="text-xs text-zinc-500">
              Movie ID: {movie.id}
            </p>
          </div>

          <span className="text-sm text-yellow-400">
            {movie.release_year ?? "—"}
          </span>

        </div>
      ))
    )}

  </div>

</div>

<div className="rounded-xl bg-zinc-900 p-6">

  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold">
      Recent People
    </h2>

    <button
      onClick={() => {
        window.location.href = "/admin/people";
      }}
      className="text-sm text-yellow-400 hover:text-yellow-300"
    >
      View All →
    </button>
  </div>

  <div className="mt-4 space-y-2">

    {recentPeople.length === 0 ? (
      <p className="text-sm text-zinc-500">
        No people added yet.
      </p>
    ) : (
      recentPeople.map((person) => (
        <div
          key={person.id}
          className="flex items-center justify-between rounded-lg bg-black px-4 py-3"
        >

          <div>
            <p className="font-medium">
              {person.full_name}
            </p>

            <p className="text-xs text-zinc-500">
              Person ID: {person.id}
            </p>
          </div>

          <span className="text-xs text-zinc-500">
            Added
          </span>

        </div>
      ))
    )}

  </div>

</div>

<div className="mt-6 rounded-xl bg-zinc-900 p-6">

  <h2 className="text-xl font-semibold">
    Database Overview
  </h2>

  <p className="mt-4 leading-7 text-zinc-400">
    JMI currently contains{" "}
    <span className="font-semibold text-yellow-400">
      {formatNumber(stats.movies)}
    </span>{" "}
    movies,{" "}
    <span className="font-semibold text-yellow-400">
      {formatNumber(stats.people)}
    </span>{" "}
    people and{" "}
    <span className="font-semibold text-yellow-400">
      {formatNumber(stats.companies)}
    </span>{" "}
    companies in its database.
  </p>

  <p className="mt-2 leading-7 text-zinc-400">
    The database currently tracks{" "}
    <span className="font-semibold text-yellow-400">
      {formatMoney(stats.indiaGross)}
    </span>{" "}
    in India gross collections and{" "}
    <span className="font-semibold text-yellow-400">
      {formatMoney(stats.overseasGross)}
    </span>{" "}
    from overseas markets, giving a combined worldwide
    collection of{" "}
    <span className="font-semibold text-yellow-400">
      {formatMoney(stats.worldwideGross)}
    </span>.
  </p>

</div>
        </div>

        {/* Quick Actions */}

        <div className="rounded-xl bg-zinc-900 p-6">

          <h2 className="text-xl font-semibold">
            Quick Actions
          </h2>

          <div className="mt-4 space-y-3">

            <button
              onClick={() => {
                window.location.href =
                  "/admin/movies";
              }}
              className="w-full rounded-lg bg-yellow-500 py-3 font-semibold text-black hover:bg-yellow-400"
            >
              ➕ Add / Manage Movie
            </button>

            <button
              onClick={() => {
                window.location.href =
                  "/admin/people";
              }}
              className="w-full rounded-lg bg-zinc-800 py-3 hover:bg-zinc-700"
            >
              👤 Manage People
            </button>

            <button
              onClick={() => {
                window.location.href =
                  "/admin/companies";
              }}
              className="w-full rounded-lg bg-zinc-800 py-3 hover:bg-zinc-700"
            >
              🏢 Manage Companies
            </button>

          </div>

        </div>

      </div>

    
  );
}