"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
  release_year: number | null;
  poster_url: string | null;
};

type State = {
  id: number;
  name: string;
};

type CollectionRecord = {
  id: number;
  movie_id: number;
  day_number: number;
  territory: string;
  gross: number;
  updated_at: string;
};

const OVERSEAS = "Overseas";

export default function DailyBoxOfficeDataAdminPage() {
  /* =====================================================
     MASTER DATA
  ===================================================== */

  const [movies, setMovies] = useState<Movie[]>([]);
  const [states, setStates] = useState<State[]>([]);

  const [selectedMovieId, setSelectedMovieId] =
    useState<number | null>(null);

  /* =====================================================
     COLLECTION RECORDS
  ===================================================== */

  const [records, setRecords] = useState<CollectionRecord[]>([]);

  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  /* =====================================================
     FORM
  ===================================================== */

  const [dayNumber, setDayNumber] = useState("1");
  const [territory, setTerritory] = useState("");
  const [gross, setGross] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* =====================================================
     FEEDBACK
  ===================================================== */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    async function loadMasterData() {
      setLoadingMovies(true);
      setError("");

      const [
        { data: portalData, error: portalError },
        { data: stateData, error: stateError },
      ] = await Promise.all([
        supabase
          .from("jmi_daily_box_office_portal")
          .select("movie_id")
          .eq("row_type", "MOVIE"),

        supabase
          .from("states")
          .select("id, name")
          .order("name", { ascending: true }),
      ]);

      if (portalError) {
        console.error(portalError);
        setError("Unable to load portal movies.");
        setLoadingMovies(false);
        return;
      }

      if (stateError) {
        console.error(stateError);
        setError("Unable to load states.");
        setLoadingMovies(false);
        return;
      }

      setStates((stateData || []) as State[]);

      const movieIds = [
        ...new Set(
          (portalData || []).map((item) => item.movie_id)
        ),
      ];

      if (movieIds.length === 0) {
        setMovies([]);
        setLoadingMovies(false);
        return;
      }

      const { data: movieData, error: movieError } =
        await supabase
          .from("movies")
          .select("id, title, release_year, poster_url")
          .in("id", movieIds)
          .order("title", { ascending: true });

      if (movieError) {
        console.error(movieError);
        setError("Unable to load movie details.");
      } else {
        setMovies((movieData || []) as Movie[]);
      }

      setLoadingMovies(false);
    }

    loadMasterData();
  }, []);

  /* =====================================================
     SELECTED MOVIE
  ===================================================== */

  const selectedMovie = useMemo(() => {
    return (
      movies.find((movie) => movie.id === selectedMovieId) ||
      null
    );
  }, [movies, selectedMovieId]);

  /* =====================================================
     LOAD MOVIE COLLECTION RECORDS
  ===================================================== */

  const loadRecords = useCallback(async (movieId: number) => {
    setLoadingRecords(true);
    setError("");

    const { data, error } = await supabase
      .from("jmi_daily_box_office_portal")
      .select(`
        id,
        movie_id,
        day_number,
        territory,
        gross,
        updated_at
      `)
      .eq("row_type", "COLLECTION")
      .eq("movie_id", movieId)
      .order("day_number", { ascending: true })
      .order("territory", { ascending: true });

    if (error) {
      console.error(error);
      setError("Unable to load collection records.");
      setRecords([]);
    } else {
      setRecords((data || []) as CollectionRecord[]);
    }

    setLoadingRecords(false);
  }, []);

  useEffect(() => {
    if (!selectedMovieId) {
      setRecords([]);
      return;
    }

    loadRecords(selectedMovieId);
  }, [selectedMovieId, loadRecords]);

  /* =====================================================
     RESET FORM
  ===================================================== */

  function resetForm() {
    setDayNumber("1");
    setTerritory("");
    setGross("");
    setEditingId(null);
  }

  /* =====================================================
     SELECT MOVIE
  ===================================================== */

  function handleMovieSelect(value: string) {
    const movieId = value ? Number(value) : null;

    setSelectedMovieId(movieId);
    resetForm();

    setError("");
    setSuccess("");
  }

  /* =====================================================
     FORMATTERS
  ===================================================== */

  function formatMoney(value: number) {
    return (
      "₹" +
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(value)
    );
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat("en-IN").format(value);
  }

  function formatUpdatedAt(value: string) {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* =====================================================
     EDIT RECORD
  ===================================================== */

  function editRecord(record: CollectionRecord) {
    setEditingId(record.id);
    setDayNumber(String(record.day_number));
    setTerritory(record.territory);
    setGross(String(record.gross));

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     SAVE RECORD
  ===================================================== */

  async function saveRecord() {
    if (!selectedMovieId) {
      setError("Please select a movie.");
      return;
    }

    const day = Number(dayNumber);
    const amount = Number(gross);

    if (
      !Number.isInteger(day) ||
      day < 1
    ) {
      setError("Please enter a valid reporting day (1 or greater).");
      return;
    }

    if (!territory) {
      setError("Please select a territory.");
      return;
    }

    if (
      gross.trim() === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      setError("Please enter a valid non-negative collection amount.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      row_type: "COLLECTION",
      movie_id: selectedMovieId,
      day_number: day,
      territory,
      gross: amount,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase
          .from("jmi_daily_box_office_portal")
          .update(payload)
          .eq("id", editingId)
          .eq("row_type", "COLLECTION")
      : await supabase
          .from("jmi_daily_box_office_portal")
          .insert(payload);

    if (result.error) {
      console.error(result.error);

      setError(
        result.error.code === "23505"
          ? "This territory already has an entry for this movie and reporting day. Edit the existing entry instead."
          : "Unable to save this collection record."
      );

      setSaving(false);
      return;
    }

    setSuccess(
      editingId
        ? `Day ${day} · ${territory} updated successfully.`
        : `Day ${day} · ${territory} added successfully.`
    );

    resetForm();

    await loadRecords(selectedMovieId);

    setSaving(false);
  }

  /* =====================================================
     DELETE RECORD
  ===================================================== */

  async function deleteRecord(record: CollectionRecord) {
    const confirmed = window.confirm(
      `Delete the ${record.territory} collection entry for Day ${record.day_number}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(record.id);
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("jmi_daily_box_office_portal")
      .delete()
      .eq("id", record.id)
      .eq("row_type", "COLLECTION");

    if (deleteError) {
      console.error(deleteError);
      setError("Unable to delete this collection record.");
      setDeletingId(null);
      return;
    }

    if (editingId === record.id) {
      resetForm();
    }

    setSuccess(
      `Day ${record.day_number} · ${record.territory} entry deleted.`
    );

    await loadRecords(record.movie_id);

    setDeletingId(null);
  }

  /* =====================================================
     GROUP RECORDS BY DAY
  ===================================================== */

  const groupedRecords = useMemo(() => {
    const groups = new Map<number, CollectionRecord[]>();

    records.forEach((record) => {
      const existing = groups.get(record.day_number) || [];
      existing.push(record);
      groups.set(record.day_number, existing);
    });

    return Array.from(groups.entries()).sort(
      ([a], [b]) => a - b
    );
  }, [records]);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
            JMI · Daily Box Office
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white">
            Daily Collection Data
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Enter, edit and maintain day-wise territory collections
            for movies in the Daily Box Office Portal.
          </p>
        </div>

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
          Data Entry Control
        </span>
      </div>

      {/* FEEDBACK */}

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-4 py-3">
          <p className="text-sm text-emerald-400">{success}</p>
        </div>
      )}

      {/* MOVIE SELECTOR */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Select Movie
        </p>

        <h2 className="mt-1 text-lg font-semibold text-white">
          Portal Movie
        </h2>

        <select
          value={selectedMovieId ?? ""}
          onChange={(event) => handleMovieSelect(event.target.value)}
          disabled={loadingMovies}
          className="mt-4 w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-50"
        >
          <option value="">
            {loadingMovies
              ? "Loading movies..."
              : "Select a movie"}
          </option>

          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
              {movie.release_year ? ` (${movie.release_year})` : ""}
            </option>
          ))}
        </select>

        {!loadingMovies && movies.length === 0 && (
          <p className="mt-3 text-xs text-zinc-600">
            No movies have been registered in Movie Management yet.
          </p>
        )}

      </section>

      {/* SELECTED MOVIE */}

      {selectedMovie && (
        <section className="space-y-6">

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4">
            <div className="flex items-center gap-4">

              {selectedMovie.poster_url ? (
                <img
                  src={selectedMovie.poster_url}
                  alt={selectedMovie.title}
                  loading="lazy"
                  className="h-24 w-16 shrink-0 rounded-lg border border-zinc-800 object-cover"
                />
              ) : (
                <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs text-zinc-600">
                  No Poster
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-400">
                  Selected Movie
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  {selectedMovie.title}
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  {selectedMovie.release_year || "Release year unavailable"}
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  {records.length} collection entries · {groupedRecords.length} reporting days
                </p>
              </div>

            </div>
          </div>

          {/* DATA ENTRY FORM */}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-400">
                {editingId ? "Edit Collection" : "New Collection"}
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                {editingId ? "Update Territory Figure" : "Add Daily Collection"}
              </h2>

              <p className="mt-1 text-sm text-zinc-600">
                Each territory is saved as an independent collection entry.
              </p>
            </div>

            <div className="space-y-4">

              {/* DAY */}

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                  Reporting Day
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={dayNumber}
                  onChange={(event) => setDayNumber(event.target.value)}
                  placeholder="Example: 1"
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                />

                <p className="mt-2 text-[10px] text-zinc-600">
                  Enter Day 1, Day 2, Day 3 and so on.
                </p>
              </div>

              {/* TERRITORY */}

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                  Territory
                </label>

                <select
                  value={territory}
                  onChange={(event) => setTerritory(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                >
                  <option value="">Select territory</option>

                  <optgroup label="Indian States and Territories">
                    {states.map((state) => (
                      <option key={state.id} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="International">
                    <option value={OVERSEAS}>Overseas</option>
                  </optgroup>
                </select>

                <p className="mt-2 text-[10px] text-zinc-600">
                  Overseas is recorded as one combined figure, without country-wise breakdown.
                </p>
              </div>

              {/* GROSS */}

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                  Gross Collection (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gross}
                  onChange={(event) => setGross(event.target.value)}
                  placeholder="Enter gross collection"
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-emerald-500"
                />
              </div>

            </div>

            {/* FORM ACTIONS */}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <button
                type="button"
                disabled={saving}
                onClick={saveRecord}
                className="rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Collection"
                    : "Save Collection"}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setError("");
                  setSuccess("");
                }}
                className="rounded-xl border border-zinc-700 bg-black px-5 py-3.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-white"
              >
                {editingId ? "Cancel Editing" : "Clear Form"}
              </button>

            </div>

          </section>

          {/* SAVED COLLECTION RECORDS */}

          <section>

            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Collection History
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Saved Day-wise Figures
              </h2>

              <p className="mt-1 text-sm text-zinc-600">
                Review, edit or delete existing territory entries.
              </p>
            </div>

            {loadingRecords ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-600">
                  Loading collection records...
                </p>
              </div>
            ) : groupedRecords.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center">
                <p className="text-sm font-medium text-zinc-400">
                  No collection figures recorded yet.
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  Start by adding the first territory entry above.
                </p>
              </div>
            ) : (
              <div className="space-y-5">

                {groupedRecords.map(([day, dayRecords]) => {
                  const dayTotal = dayRecords.reduce(
                    (total, record) => total + Number(record.gross || 0),
                    0
                  );

                  return (
                    <div
                      key={day}
                      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                    >

                      {/* DAY HEADER */}

                      <div className="border-b border-zinc-800 bg-black/40 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                          <div>
                            <h3 className="text-base font-semibold text-white">
                              Day {day}
                            </h3>

                            <p className="mt-1 text-xs text-zinc-600">
                              {dayRecords.length} territory record
                              {dayRecords.length !== 1 ? "s" : ""}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                              Combined Day Collection
                            </p>

                            <p className="mt-1 text-lg font-semibold text-emerald-400">
                              {formatMoney(dayTotal)}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* TERRITORY RECORDS */}

                      <div className="divide-y divide-zinc-800">

                        {dayRecords.map((record) => (
                          <div
                            key={record.id}
                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                          >

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-zinc-200">
                                {record.territory}
                              </p>

                              <p className="mt-1 text-xs text-zinc-600">
                                Updated {formatUpdatedAt(record.updated_at)}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-4 sm:min-w-[260px]">

                              <p className="text-sm font-semibold text-yellow-400">
                                {formatMoney(Number(record.gross))}
                              </p>

                              <div className="flex gap-2">

                                <button
                                  type="button"
                                  onClick={() => editRecord(record)}
                                  className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-500/20"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  disabled={deletingId === record.id}
                                  onClick={() => deleteRecord(record)}
                                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                                >
                                  {deletingId === record.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>

                              </div>

                            </div>

                          </div>
                        ))}

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </section>

        </section>
      )}

    </div>
  );
}