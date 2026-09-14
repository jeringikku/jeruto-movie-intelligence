"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  movieId: number;
  releaseDate: string | null;
  ottReleaseDate: string | null;
};

export default function ReleasesTab({
  movieId,
  releaseDate,
  ottReleaseDate,
}: Props) {
  const [theatricalDate, setTheatricalDate] = useState(
    releaseDate ?? ""
  );

  const [ottDate, setOttDate] = useState(
    ottReleaseDate ?? ""
  );

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);

    const { error } = await supabase
      .from("movies")
      .update({
        release_date: theatricalDate || null,
        ott_release_date: ottDate || null,
      })
      .eq("id", movieId);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("🎉 Release information updated successfully!");
  }

  return (
    <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">
          Release Information
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Manage theatrical and OTT release dates for this movie.
        </p>
      </div>

      {/* Release Dates */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Theatrical Release */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Theatrical Release Date
          </label>

          <input
            type="date"
            value={theatricalDate}
            onChange={(e) => setTheatricalDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
          />

          <p className="mt-2 text-xs text-zinc-500">
            Original theatrical release date of the movie.
          </p>
        </div>

        {/* OTT Release */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            OTT Release Date
          </label>

          <input
            type="date"
            value={ottDate}
            onChange={(e) => setOttDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
          />

          <p className="mt-2 text-xs text-zinc-500">
            Digital / OTT release date of the movie.
          </p>
        </div>

      </div>

      {/* Save */}
      <div className="mt-8 flex justify-end">

        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>
  );
}