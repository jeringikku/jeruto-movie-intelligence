"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type MovieRatingProps = {
  movieId: number;
};

type RatingSummary = {
  average_rating: number | null;
  total_ratings: number;
};

const STARS = [1, 2, 3, 4, 5];

export default function MovieRating({ movieId }: MovieRatingProps) {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    const { data, error: summaryError } = await supabaseBrowser.rpc(
      "get_movie_rating_summary",
      { p_movie_id: movieId }
    );

    if (summaryError) {
      console.error("JMI rating summary error:", summaryError);
      setError("Ratings are temporarily unavailable.");
      return;
    }

    const result = (data as RatingSummary[] | null)?.[0];

    setAverageRating(
      result?.average_rating == null
        ? null
        : Number(result.average_rating)
    );

    setTotalRatings(Number(result?.total_ratings ?? 0));
  }, [movieId]);

  const loadUserRating = useCallback(
    async (currentUserId: string | null) => {
      if (!currentUserId) {
        setUserRating(null);
        setSelectedRating(null);
        return;
      }

      const { data, error: ratingError } = await supabaseBrowser
        .from("movie_user_ratings")
        .select("rating")
        .eq("movie_id", movieId)
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (ratingError) {
        console.error("JMI user rating error:", ratingError);
        return;
      }

      const rating = data?.rating ? Number(data.rating) : null;

      setUserRating(rating);
      setSelectedRating(rating);
    },
    [movieId]
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      setError("");

      const { data } = await supabaseBrowser.auth.getSession();

      if (!active) return;

      const currentUserId = data.session?.user.id ?? null;

      setUserId(currentUserId);

      await Promise.all([
        loadSummary(),
        loadUserRating(currentUserId),
      ]);

      if (active) setLoading(false);
    }

    void initialize();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      const currentUserId = session?.user.id ?? null;

      setUserId(currentUserId);
      void loadUserRating(currentUserId);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadSummary, loadUserRating]);

  async function submitRating() {
    if (!userId) {
      setShowSignIn(true);
      return;
    }

    if (!selectedRating) return;

    setSubmitting(true);
    setMessage("");
    setError("");

    const { error: saveError } = await supabaseBrowser
      .from("movie_user_ratings")
      .upsert(
        {
          movie_id: movieId,
          user_id: userId,
          rating: selectedRating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "movie_id,user_id" }
      );

    if (saveError) {
      console.error("JMI rating save error:", saveError);
      setError("Couldn't save your rating. Please try again.");
      setSubmitting(false);
      return;
    }

    setUserRating(selectedRating);
    setMessage("Your rating has been saved.");

    await loadSummary();

    setSubmitting(false);
  }

  const displayedRating = hoveredRating ?? selectedRating;

  return (
    <div className="border-b border-zinc-800/80 py-5 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Average rating and votes */}

        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
            JMI Audience Rating
          </p>

          <div className="mt-1.5 flex items-center gap-2.5">
            <span className="text-2xl font-semibold tracking-tight text-white">
              {loading
                ? "—"
                : averageRating !== null
                  ? averageRating.toFixed(1)
                  : "—"}
            </span>

            <div>
              <div className="flex items-center gap-0.5 text-sm text-amber-400">
                {STARS.map((star) => (
                  <span key={star}>
                    {averageRating !== null && averageRating >= star
                      ? "★"
                      : averageRating !== null &&
                          averageRating >= star - 0.5
                        ? "◐"
                        : "☆"}
                  </span>
                ))}
              </div>

              <p className="text-[10px] text-zinc-500">
                {loading
                  ? "Loading votes..."
                  : `${totalRatings.toLocaleString("en-IN")} ${
                      totalRatings === 1 ? "vote" : "votes"
                    }`}
              </p>
            </div>
          </div>
        </div>

        {/* User rating */}

        <div>
          <p className="mb-1.5 text-[8px] font-medium uppercase tracking-[0.16em] text-pink-400">
            Mark Your Rating
          </p>

          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Mark your movie rating"
            onMouseLeave={() => setHoveredRating(null)}
          >
            {STARS.map((star) => {
              const active =
                displayedRating !== null && star <= displayedRating;

              return (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={selectedRating === star}
                  aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                  disabled={loading || submitting}
                  onMouseEnter={() => setHoveredRating(star)}
                  onFocus={() => setHoveredRating(star)}
                  onBlur={() => setHoveredRating(null)}
                  onClick={() => {
                    setSelectedRating(star);
                    setMessage("");
                    setError("");

                    if (!userId) {
                      setShowSignIn(true);
                    } else {
                      setShowSignIn(false);
                    }
                  }}
                  className={`text-2xl leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-wait ${
                    active
                      ? "text-amber-400"
                      : "text-zinc-600 hover:text-amber-300"
                  }`}
                >
                  {active ? "★" : "☆"}
                </button>
              );
            })}
          </div>

          {userId && userRating !== null && (
            <p className="mt-1 text-[10px] text-zinc-500">
              Your rating: {userRating}/5
            </p>
          )}
        </div>
      </div>

      {/* Sign-in notification */}

      {showSignIn && !userId && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-violet-500/20 bg-violet-500/[0.06] px-2 py-2">
          <p className="text-[9px] text-zinc-300">
            Sign in to submit your rating.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/account/login"
              className="text-[9px] font-semibold text-violet-300 transition hover:text-violet-200"
            >
              Sign In →
            </Link>

            <button
              type="button"
              onClick={() => setShowSignIn(false)}
              aria-label="Dismiss sign-in message"
              className="text-sm text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {userId && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submitRating}
            disabled={!selectedRating || submitting || loading}
            className="text-xs font-semibold text-violet-300 transition hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? "Saving..."
              : userRating !== null
                ? "Update Rating →"
                : "Submit Rating →"}
          </button>

          {message && (
            <span role="status" className="text-xs text-emerald-400">
              {message}
            </span>
          )}

          {error && (
            <span role="alert" className="text-xs text-red-400">
              {error}
            </span>
          )}
        </div>
      )}

      {!userId && error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}