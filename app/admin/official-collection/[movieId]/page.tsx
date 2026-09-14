"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

type OfficialFigure = {
  id: number;
  movie_id: number;
  territory_name: string;
  gross_official: number;
  notes: string | null;
};

type Movie = {
  id: number;
  title: string;
};

function formatCrores(value: number) {
  if (!value || value <= 0) return "—";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

export default function OfficialCollectionPage() {
  const params = useParams();

  const movieId = Number(params.movieId);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [figures, setFigures] = useState<OfficialFigure[]>([]);

  const [territoryName, setTerritoryName] = useState("");
  const [grossOfficial, setGrossOfficial] = useState("");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) return;

    loadData();
  }, [movieId]);

  async function loadData() {
    setLoading(true);
    setErrorMessage(null);

    try {
      // MOVIE
      const { data: movieData, error: movieError } = await supabase
        .from("movies")
        .select("id, title")
        .eq("id", movieId)
        .single();

      if (movieError) {
        console.error("Movie error:", movieError);
        setErrorMessage("Could not load movie.");
        return;
      }

      setMovie(movieData);

      // OFFICIAL FIGURES
      const { data: figureData, error: figureError } = await supabase
        .from("movie_official_box_office")
        .select(`
          id,
          movie_id,
          territory_name,
          gross_official,
          notes
        `)
        .eq("movie_id", movieId)
        .order("id", { ascending: true });

      if (figureError) {
        console.error("Official collection error:", figureError);
        setErrorMessage("Could not load official collection data.");
        return;
      }

      setFigures((figureData || []) as OfficialFigure[]);
    } catch (error) {
      console.error("Official collection error:", error);
      setErrorMessage("Something went wrong while loading the page.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTerritoryName("");
    setGrossOfficial("");
    setNotes("");
    setEditingId(null);
  }

  async function handleSave() {
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanTerritory = territoryName.trim();
    const gross = Number(grossOfficial);

    if (!cleanTerritory) {
      setErrorMessage("Please enter a territory or column name.");
      return;
    }

    if (!grossOfficial || !Number.isFinite(gross) || gross < 0) {
      setErrorMessage("Please enter a valid official gross amount.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("movie_official_box_office")
          .update({
            territory_name: cleanTerritory,
            gross_official: gross,
            notes: notes.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) {
          console.error("Update error:", error);
          setErrorMessage("Could not update the official figure.");
          return;
        }

        setSuccessMessage("Official figure updated successfully.");
      } else {
        const { error } = await supabase
          .from("movie_official_box_office")
          .insert({
            movie_id: movieId,
            territory_name: cleanTerritory,
            gross_official: gross,
            notes: notes.trim() || null,
          });

        if (error) {
          console.error("Insert error:", error);
          setErrorMessage("Could not save the official figure.");
          return;
        }

        setSuccessMessage("Official figure added successfully.");
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error("Save error:", error);
      setErrorMessage("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(figure: OfficialFigure) {
    setEditingId(figure.id);
    setTerritoryName(figure.territory_name);
    setGrossOfficial(String(figure.gross_official));
    setNotes(figure.notes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Delete this official collection figure?"
    );

    if (!confirmed) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase
      .from("movie_official_box_office")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      setErrorMessage("Could not delete the official figure.");
      return;
    }

    setSuccessMessage("Official figure deleted.");

    if (editingId === id) {
      resetForm();
    }

    await loadData();
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-yellow-400">
            Loading Official Collection...
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Loading producer-announced figures
          </p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/30 p-6">
        <p className="text-red-400">
          Movie not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* BACK */}
      <button
        onClick={() => {
          window.location.href = `/admin/movies/${movie.id}`;
        }}
        className="text-sm text-zinc-400 hover:text-yellow-400"
      >
        ← Back to Movie
      </button>

      {/* HEADER */}
      <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-xs uppercase tracking-wide text-yellow-400">
              Official Collection
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white">
              {movie.title}
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Producer / production-house announced box-office figures
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs text-zinc-600">
              Movie ID
            </p>

            <p className="font-semibold text-zinc-300">
              {movie.id}
            </p>
          </div>

        </div>

      </section>

      {/* FORM */}
      <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            {editingId
              ? "Edit Official Figure"
              : "Add Official Figure"}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Manually record an officially announced collection figure.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Territory / Column Name
            </label>

            <input
              type="text"
              value={territoryName}
              onChange={(e) => setTerritoryName(e.target.value)}
              placeholder="Worldwide"
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500"
            />

            <p className="mt-2 text-xs text-zinc-600">
              Enter any label exactly as you want it stored.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Official Gross (₹)
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={grossOfficial}
              onChange={(e) => setGrossOfficial(e.target.value)}
              placeholder="1500000000"
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500"
            />

            <p className="mt-2 text-xs text-zinc-600">
              Enter the actual numeric amount in rupees.
            </p>
          </div>

        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Notes <span className="text-zinc-600">(optional)</span>
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional source or announcement note..."
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500"
          />
        </div>

        {errorMessage && (
          <div className="mt-5 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-red-400">
              {errorMessage}
            </p>
          </div>
        )}

        {successMessage && (
          <div className="mt-5 rounded-lg border border-emerald-900 bg-emerald-950/20 px-4 py-3">
            <p className="text-sm text-emerald-400">
              {successMessage}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-yellow-500 px-5 py-2.5 font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Figure"
              : "Add Figure"}
          </button>

          {(editingId || territoryName || grossOfficial || notes) && (
            <button
              onClick={resetForm}
              className="rounded-lg border border-zinc-700 px-5 py-2.5 font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Clear
            </button>
          )}

        </div>

      </section>

      {/* SAVED FIGURES */}
      <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Saved Official Figures
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Producer-announced figures stored for this movie.
          </p>
        </div>

        {figures.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center">
            <p className="text-sm text-zinc-500">
              No official collection figures have been recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {figures.map((figure) => (
              <div
                key={figure.id}
                className="rounded-lg border border-zinc-800 bg-black/40 p-4"
              >

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-600">
                      Territory / Column
                    </p>

                    <p className="mt-1 text-base font-semibold text-white">
                      {figure.territory_name}
                    </p>

                    {figure.notes && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {figure.notes}
                      </p>
                    )}
                  </div>

                  <div className="md:text-right">
                    <p className="text-xl font-bold text-yellow-400">
                      {formatCrores(Number(figure.gross_official))}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      ₹{Number(figure.gross_official).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() => handleEdit(figure)}
                      className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(figure.id)}
                      className="rounded-lg border border-red-900/60 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}