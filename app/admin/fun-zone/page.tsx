"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
};

type FunZoneChallenge = {
  id: number;
  movie_id: number;
  challenge_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function JMIFunZoneAdminPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [challenges, setChallenges] = useState<
    FunZoneChallenge[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [challengeDate, setChallengeDate] =
    useState("");

  const [selectedMovieId, setSelectedMovieId] =
    useState("");

  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {
    const today = new Date();

    const localDate =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    setChallengeDate(localDate);

    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);

    await Promise.all([
      fetchMovies(),
      fetchChallenges(),
    ]);

    setLoading(false);
  }

  // ============================================================
  // FETCH MOVIES
  // ============================================================

  async function fetchMovies() {
    const { data, error } = await supabase
      .from("movies")
      .select("id, title")
      .eq("is_active", true)
      .order("title", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Fun Zone movies fetch error:",
        error
      );

      setMovies([]);
      return;
    }

    setMovies(data || []);
  }

  // ============================================================
  // FETCH CHALLENGES
  // ============================================================

  async function fetchChallenges() {
    const { data, error } = await supabase
      .from("jmi_funzone_daily_movies")
      .select(`
        id,
        movie_id,
        challenge_date,
        is_active,
        created_at,
        updated_at
      `)
      .order("challenge_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Fun Zone challenges fetch error:",
        error
      );

      setChallenges([]);
      return;
    }

    setChallenges(data || []);
  }

  // ============================================================
  // MOVIE TITLE
  // ============================================================

  function getMovieTitle(movieId: number) {
    return (
      movies.find(
        (movie) => movie.id === movieId
      )?.title ?? "Unknown Movie"
    );
  }

  // ============================================================
  // ADD CHALLENGE
  // ============================================================

  async function addChallenge() {
    if (!challengeDate) {
      alert("Please select a challenge date.");
      return;
    }

    if (!selectedMovieId) {
      alert("Please select a movie.");
      return;
    }

    const movieId = Number(selectedMovieId);

    const duplicate = challenges.some(
      (challenge) =>
        challenge.movie_id === movieId &&
        challenge.challenge_date ===
          challengeDate
    );

    if (duplicate) {
      alert(
        "This movie is already configured for this challenge date."
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("jmi_funzone_daily_movies")
      .insert({
        movie_id: movieId,
        challenge_date: challengeDate,
        is_active: true,
        updated_at:
          new Date().toISOString(),
      });

    if (error) {
      console.error(
        "Fun Zone challenge insert error:",
        error
      );

      alert(
        "Failed to add Fun Zone challenge: " +
          error.message
      );

      setSaving(false);
      return;
    }

    alert(
      "Movie added to JMI Fun Zone successfully! 🎯"
    );

    setSelectedMovieId("");

    await fetchChallenges();

    setSaving(false);
  }

  // ============================================================
  // TOGGLE ACTIVE STATUS
  // ============================================================

  async function toggleChallenge(
    challenge: FunZoneChallenge
  ) {
    const nextStatus =
      !challenge.is_active;

    const actionText = nextStatus
      ? "activate"
      : "deactivate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionText} this JMI Fun Zone challenge?`
      );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("jmi_funzone_daily_movies")
      .update({
        is_active: nextStatus,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", challenge.id);

    if (error) {
      console.error(
        "Fun Zone challenge update error:",
        error
      );

      alert(
        "Failed to update challenge: " +
          error.message
      );

      return;
    }

    await fetchChallenges();
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatDate(
    value: string
  ) {
    const date = new Date(
      `${value}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ============================================================
  // STATS
  // ============================================================

  const activeCount = useMemo(
    () =>
      challenges.filter(
        (challenge) =>
          challenge.is_active
      ).length,
    [challenges]
  );

  const inactiveCount = useMemo(
    () =>
      challenges.filter(
        (challenge) =>
          !challenge.is_active
      ).length,
    [challenges]
  );

  const upcomingCount = useMemo(() => {
    if (!challengeDate) {
      return 0;
    }

    return challenges.filter(
      (challenge) =>
        challenge.challenge_date >
        challengeDate
    ).length;
  }, [challenges, challengeDate]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-zinc-300">

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8">

          <p className="text-lg">
            Loading JMI Fun Zone...
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Preparing the daily challenge manager.
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-black p-6 text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
          JMI Entertainment
        </p>

        <h1 className="mt-2 text-3xl font-bold text-yellow-400">
          JMI Fun Zone
        </h1>

        <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-400">
          Manage the movies available for the daily
          JMI Fun Zone collection prediction challenge.
        </p>

      </div>

      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <div className="mb-8">

        <h2 className="mb-4 text-xl font-bold">
          Fun Zone Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-zinc-500">
              Total Challenges
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {challenges.length}
            </p>

          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-zinc-500">
              Active Challenges
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {activeCount}
            </p>

          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-zinc-500">
              Inactive Challenges
            </p>

            <p className="mt-2 text-3xl font-bold text-zinc-400">
              {inactiveCount}
            </p>

          </div>

        </div>

      </div>

      {/* ======================================================
          CREATE DAILY CHALLENGE
      ====================================================== */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-yellow-400">
            Add Fun Zone Challenge
          </h2>

          <p className="mt-2 text-base text-zinc-400">
            Select a movie and challenge date to make
            the movie available for JMI users.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* DATE */}

          <div>

            <label className="mb-2 block text-base text-zinc-400">
              Challenge Date
            </label>

            <input
              type="date"
              value={challengeDate}
              onChange={(e) =>
                setChallengeDate(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
            />

            <p className="mt-2 text-xs text-zinc-600">
              This is the date on which users will
              participate in the prediction challenge.
            </p>

          </div>

          {/* MOVIE */}

          <div>

            <label className="mb-2 block text-base text-zinc-400">
              Movie
            </label>

            <select
              value={selectedMovieId}
              onChange={(e) =>
                setSelectedMovieId(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
            >

              <option value="">
                Select a movie
              </option>

              {movies.map((movie) => (
                <option
                  key={movie.id}
                  value={movie.id}
                >
                  {movie.title}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* ADD BUTTON */}

        <div className="mt-6">

          <button
            type="button"
            onClick={addChallenge}
            disabled={saving}
            className="rounded-lg bg-yellow-500 px-8 py-3.5 text-base font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Adding..."
              : "+ Add Fun Zone Challenge"}
          </button>

        </div>

      </div>

      {/* ======================================================
          CHALLENGE LIST
      ====================================================== */}

      <div className="rounded-xl border border-zinc-700 bg-black">

        <div className="border-b border-zinc-700 p-6">

          <h2 className="text-2xl font-bold">
            Fun Zone Challenges
          </h2>

          <p className="mt-2 text-base text-zinc-400">
            Manage the movies currently configured
            for JMI Fun Zone.
          </p>

        </div>

        {challenges.length === 0 ? (

          <div className="p-10 text-center">

            <p className="text-base text-zinc-500">
              No Fun Zone challenges configured yet.
            </p>

            <p className="mt-2 text-sm text-zinc-700">
              Add your first movie above.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Movie
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Challenge Date
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Updated
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {challenges.map(
                  (challenge) => (

                    <tr
                      key={challenge.id}
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >

                      {/* MOVIE */}

                      <td className="px-5 py-5">

                        <p className="font-semibold text-white">
                          {getMovieTitle(
                            challenge.movie_id
                          )}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          Movie ID:{" "}
                          {challenge.movie_id}
                        </p>

                      </td>

                      {/* DATE */}

                      <td className="px-5 py-5 text-sm text-zinc-300">
                        {formatDate(
                          challenge.challenge_date
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            challenge.is_active
                              ? "bg-green-900/40 text-green-300"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {challenge.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      {/* UPDATED */}

                      <td className="px-5 py-5 text-sm text-zinc-500">

                        {new Date(
                          challenge.updated_at
                        ).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-5">

                        <button
                          type="button"
                          onClick={() =>
                            toggleChallenge(
                              challenge
                            )
                          }
                          className={`rounded-lg px-4 py-2 text-sm font-medium ${
                            challenge.is_active
                              ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                              : "bg-green-900/60 text-green-200 hover:bg-green-800"
                          }`}
                        >
                          {challenge.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ======================================================
          FUN ZONE RULES
      ====================================================== */}

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6">

        <h2 className="text-xl font-bold text-violet-400">
          Current Fun Zone Rules
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-lg border border-zinc-800 bg-black p-4">

            <p className="text-sm font-semibold text-zinc-300">
              Participation Window
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              07:00 AM – 12:00 PM IST
            </p>

          </div>

          <div className="rounded-lg border border-zinc-800 bg-black p-4">

            <p className="text-sm font-semibold text-zinc-300">
              Daily Prediction
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              One prediction per user per challenge.
            </p>

          </div>

          <div className="rounded-lg border border-zinc-800 bg-black p-4">

            <p className="text-sm font-semibold text-zinc-300">
              Maximum Points
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              10 JMI Points for 100% accuracy.
            </p>

          </div>

          <div className="rounded-lg border border-zinc-800 bg-black p-4">

            <p className="text-sm font-semibold text-zinc-300">
              Under 90% Accuracy
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              No JMI Points awarded.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}