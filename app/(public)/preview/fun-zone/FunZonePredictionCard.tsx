"use client";

import { useState } from "react";

type Challenge = {
  id: number;
  movie_id: number;
  challenge_date: string;
  movie_title: string;
};

type Props = {
  challenge: Challenge;
  isPredictionWindow: boolean;
  alreadyPredicted: boolean;
};

function FunZonePredictionCard({
  challenge,
  isPredictionWindow,
  alreadyPredicted,
}: Props) {
  const [prediction, setPrediction] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyPredicted);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);

    const numericPrediction = Number(prediction);

    if (!prediction.trim()) {
      setError("Enter your predicted collection.");
      return;
    }

    if (!Number.isFinite(numericPrediction) || numericPrediction < 0) {
      setError("Enter a valid collection amount.");
      return;
    }

    if (
      numericPrediction.toString().split(".")[1]?.length > 2
    ) {
      setError("Use a maximum of two decimal places.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/fun-zone/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          daily_movie_id: challenge.id,
          predicted_collection: numericPrediction,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result?.error ||
            "Unable to submit your prediction."
        );
        return;
      }

      setSubmitted(true);
      setPrediction("");
    } catch (submitError) {
      console.error(
        "Fun Zone submission error:",
        submitError
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      {/* CARD HEADER */}

      <div className="border-b border-zinc-900 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-600">
              Movie Challenge
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              {challenge.movie_title}
            </h3>
          </div>

          <div className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1">
            <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-violet-400">
              Daily
            </span>
          </div>
        </div>
      </div>

      {/* CARD BODY */}

      <div className="p-5">
        <p className="text-xs leading-5 text-zinc-500">
          Predict the movie's next-day collection. Your
          prediction will be compared with the actual JMI
          collection after the day is completed.
        </p>

        {submitted ? (
          <div className="mt-5 rounded-lg border border-yellow-500/20 bg-yellow-500/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10 text-sm">
                ✓
              </div>

              <div>
                <p className="text-xs font-semibold text-yellow-400">
                  Prediction Submitted
                </p>

                <p className="mt-1 text-[10px] text-zinc-600">
                  Your prediction is locked for this challenge.
                </p>
              </div>
            </div>
          </div>
        ) : !isPredictionWindow ? (
          <div className="mt-5 rounded-lg border border-zinc-800 bg-black p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Challenge Locked
            </p>

            <p className="mt-1 text-xs text-zinc-700">
              Predictions open at 07:00 AM IST.
            </p>
          </div>
        ) : (
          <>
            {/* INPUT */}

            <div className="mt-5">
              <label
                htmlFor={`prediction-${challenge.id}`}
                className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.15em] text-zinc-500"
              >
                Your Predicted Collection
              </label>

              <div className="flex overflow-hidden rounded-lg border border-zinc-800 bg-black focus-within:border-violet-500/50">
                <span className="flex items-center border-r border-zinc-800 px-3 text-xs text-zinc-600">
                  ₹
                </span>

                <input
                  id={`prediction-${challenge.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={prediction}
                  onChange={(event) =>
                    setPrediction(event.target.value)
                  }
                  placeholder="Enter collection"
                  disabled={submitting}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-700"
                />
              </div>

              <p className="mt-2 text-[8px] text-zinc-700">
                Enter the expected JMI collection figure.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-4 rounded-md border border-red-500/20 bg-red-500/[0.04] px-3 py-2.5">
                <p className="text-[9px] leading-4 text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-5 w-full rounded-lg border border-yellow-400/40 bg-yellow-400 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Prediction"}
            </button>

            <p className="mt-3 text-center text-[8px] text-zinc-700">
              One prediction per movie. Predictions cannot be
              changed after submission.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default FunZonePredictionCard;