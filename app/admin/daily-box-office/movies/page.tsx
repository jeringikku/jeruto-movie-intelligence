"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
  release_year: number | null;
  poster_url: string | null;
};

type PortalMovie = {
  id: number;
  movie_id: number;
  is_active: boolean;
  display_order: number;
  updated_at: string;
};

type ManagedMovie = {
  portal: PortalMovie;
  movie: Movie;
};

export default function DailyBoxOfficeMoviesAdminPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [managedMovies, setManagedMovies] = useState<ManagedMovie[]>([]);

  const [search, setSearch] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingManaged, setLoadingManaged] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     LOAD MOVIES FOR SEARCH
  ===================================================== */

  const loadMovies = useCallback(async (query: string) => {
    setLoadingMovies(true);

    let request = supabase
      .from("movies")
      .select("id, title, release_year, poster_url")
      .order("id", { ascending: false })
      .limit(20);

    if (query.trim()) {
      const safeQuery = query.trim().replace(/[,%()]/g, " ");
      request = request.ilike("title", `%${safeQuery}%`);
    }

    const { data, error } = await request;

    if (error) {
      console.error("Movie search error:", error);
      setError("Unable to search movies.");
      setMovies([]);
    } else {
      setMovies((data || []) as Movie[]);
    }

    setLoadingMovies(false);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadMovies(search);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search, loadMovies]);

  /* =====================================================
     LOAD MANAGED MOVIES
  ===================================================== */

  const loadManagedMovies = useCallback(async () => {
    setLoadingManaged(true);

    const { data: portalData, error: portalError } =
      await supabase
        .from("jmi_daily_box_office_portal")
        .select("id, movie_id, is_active, display_order, updated_at")
        .eq("row_type", "MOVIE")
        .order("display_order", { ascending: true })
        .order("id", { ascending: true });

    if (portalError) {
      console.error(portalError);
      setError("Unable to load managed movies.");
      setManagedMovies([]);
      setLoadingManaged(false);
      return;
    }

    const portalRecords = (portalData || []) as PortalMovie[];

    if (portalRecords.length === 0) {
      setManagedMovies([]);
      setLoadingManaged(false);
      return;
    }

    const movieIds = portalRecords.map((item) => item.movie_id);

    const { data: movieData, error: movieError } = await supabase
      .from("movies")
      .select("id, title, release_year, poster_url")
      .in("id", movieIds);

    if (movieError) {
      console.error(movieError);
      setError("Unable to load movie details.");
      setManagedMovies([]);
      setLoadingManaged(false);
      return;
    }

    const movieMap = new Map<number, Movie>();

    ((movieData || []) as Movie[]).forEach((movie) => {
      movieMap.set(movie.id, movie);
    });

    const combined = portalRecords
      .map((portal) => {
        const movie = movieMap.get(portal.movie_id);

        return movie ? { portal, movie } : null;
      })
      .filter((item): item is ManagedMovie => item !== null);

    setManagedMovies(combined);
    setLoadingManaged(false);
  }, []);

  useEffect(() => {
    loadManagedMovies();
  }, [loadManagedMovies]);

  /* =====================================================
     AVAILABLE MOVIES
  ===================================================== */

  const addedMovieIds = new Set(
    managedMovies.map((item) => item.movie.id)
  );

  const availableMovies = movies.filter(
    (movie) => !addedMovieIds.has(movie.id)
  );

  /* =====================================================
     ADD MOVIE
  ===================================================== */

  async function addMovie() {
    if (!selectedMovieId) {
      setError("Please select a movie first.");
      return;
    }

    if (addedMovieIds.has(selectedMovieId)) {
      setError("This movie is already managed.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const nextOrder =
      managedMovies.length > 0
        ? Math.max(
            ...managedMovies.map(
              (item) => item.portal.display_order
            )
          ) + 1
        : 1;

    const { error: insertError } = await supabase
      .from("jmi_daily_box_office_portal")
      .insert({
        row_type: "MOVIE",
        movie_id: selectedMovieId,
        is_active: true,
        display_order: nextOrder,
      });

    if (insertError) {
      console.error(insertError);
      setError(
        insertError.code === "23505"
          ? "This movie has already been added."
          : "Unable to add this movie."
      );
      setSaving(false);
      return;
    }

    const selectedMovie = movies.find(
      (movie) => movie.id === selectedMovieId
    );

    setSuccess(
      `${selectedMovie?.title || "Movie"} added successfully.`
    );

    setSelectedMovieId(null);
    setSearch("");

    await loadManagedMovies();

    setSaving(false);
  }

  /* =====================================================
     TOGGLE PUBLIC VISIBILITY
  ===================================================== */

  async function toggleActive(item: ManagedMovie) {
    setUpdatingId(item.portal.id);
    setError("");
    setSuccess("");

    const nextValue = !item.portal.is_active;

    const { error: updateError } = await supabase
      .from("jmi_daily_box_office_portal")
      .update({
        is_active: nextValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.portal.id)
      .eq("row_type", "MOVIE");

    if (updateError) {
      console.error(updateError);
      setError("Unable to update movie visibility.");
    } else {
      setSuccess(
        nextValue
          ? `${item.movie.title} is now visible publicly.`
          : `${item.movie.title} has been hidden publicly.`
      );

      await loadManagedMovies();
    }

    setUpdatingId(null);
  }

  /* =====================================================
     UPDATE DISPLAY ORDER
  ===================================================== */

  async function updateDisplayOrder(
    item: ManagedMovie,
    value: string
  ) {
    const order = Number(value);

    if (!Number.isInteger(order) || order < 0) {
      setError("Display order must be a non-negative integer.");
      return;
    }

    if (order === item.portal.display_order) {
      return;
    }

    setUpdatingId(item.portal.id);
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("jmi_daily_box_office_portal")
      .update({
        display_order: order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.portal.id)
      .eq("row_type", "MOVIE");

    if (updateError) {
      console.error(updateError);
      setError("Unable to update display order.");
    } else {
      setSuccess(`Display order updated for ${item.movie.title}.`);
      await loadManagedMovies();
    }

    setUpdatingId(null);
  }

  /* =====================================================
     REMOVE MOVIE FROM PORTAL
  ===================================================== */

  async function removeMovie(item: ManagedMovie) {
    const confirmed = window.confirm(
      `Remove "${item.movie.title}" from the Daily Box Office Portal?\n\nIts existing daily collection records will NOT be deleted.`
    );

    if (!confirmed) return;

    setRemovingId(item.portal.id);
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("jmi_daily_box_office_portal")
      .delete()
      .eq("id", item.portal.id)
      .eq("row_type", "MOVIE");

    if (deleteError) {
      console.error(deleteError);
      setError("Unable to remove this movie.");
    } else {
      setSuccess(
        `${item.movie.title} removed from the portal. Its collection records remain safe.`
      );

      await loadManagedMovies();
    }

    setRemovingId(null);
  }

  /* =====================================================
     FORMATTERS
  ===================================================== */

  function formatDate(value: string) {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-yellow-400">
            JMI · Daily Box Office
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white">
            Movie Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Select the movies displayed in the public Daily Box Office Portal.
            Manage visibility and landing-page order independently.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
          <p className="text-[9px] uppercase tracking-[0.14em] text-zinc-500">
            Managed Movies
          </p>
          <p className="mt-1 text-xl font-semibold text-yellow-400">
            {managedMovies.length}
          </p>
        </div>
      </div>

      {/* ERROR / SUCCESS */}

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

      {/* ADD MOVIE */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Add Movie
        </p>

        <h2 className="mt-1 text-lg font-semibold text-white">
          Add to Daily Box Office Portal
        </h2>

        <p className="mt-1 text-sm text-zinc-600">
          Search your existing JMI movie database and select a movie.
        </p>

        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelectedMovieId(null);
            }}
            placeholder="Search movie title..."
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500"
          />
        </div>

        <div className="mt-3 max-h-[300px] overflow-y-auto rounded-xl border border-zinc-800 bg-black">
          {loadingMovies ? (
            <div className="px-4 py-6 text-sm text-zinc-600">
              Searching movies...
            </div>
          ) : availableMovies.length === 0 ? (
            <div className="px-4 py-6 text-sm text-zinc-600">
              {search.trim()
                ? "No available movies found."
                : "All recently listed movies are already managed, or search for a movie."}
            </div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {availableMovies.map((movie) => {
                const selected = movie.id === selectedMovieId;

                return (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => setSelectedMovieId(movie.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      selected
                        ? "bg-yellow-500/10"
                        : "hover:bg-zinc-950"
                    }`}
                  >
                    {movie.poster_url ? (
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        loading="lazy"
                        decoding="async"
                        className="h-12 w-8 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-zinc-800 text-[8px] text-zinc-600">
                        —
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {movie.title}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        ID {movie.id}
                        {movie.release_year
                          ? ` · ${movie.release_year}`
                          : ""}
                      </p>
                    </div>

                    {selected && (
                      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-[10px] text-yellow-400">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!selectedMovieId || saving}
          onClick={addMovie}
          className="mt-4 w-full rounded-xl bg-yellow-500 px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Adding Movie..." : "+ Add Movie to Portal"}
        </button>
      </section>

      {/* MANAGED MOVIES */}

      <section>
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Portal Configuration
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            Managed Movies
          </h2>

          <p className="mt-1 text-sm text-zinc-600">
            Control public visibility and the order in which movies appear.
          </p>
        </div>

        {loadingManaged ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-600">
              Loading managed movies...
            </p>
          </div>
        ) : managedMovies.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="text-sm font-medium text-zinc-400">
              No movies added yet.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              Select a movie above to begin building the public portal.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {managedMovies.map((item) => (
              <div
                key={item.portal.id}
                className={`overflow-hidden rounded-2xl border ${
                  item.portal.is_active
                    ? "border-yellow-500/20"
                    : "border-zinc-800"
                } bg-zinc-900`}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  {item.movie.poster_url ? (
                    <img
                      src={item.movie.poster_url}
                      alt={item.movie.title}
                      loading="lazy"
                      decoding="async"
                      className="h-28 w-[75px] shrink-0 rounded-lg border border-zinc-800 object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-[75px] shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-700">
                      No Poster
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                          item.portal.is_active
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-zinc-700 bg-black text-zinc-500"
                        }`}
                      >
                        {item.portal.is_active ? "Active Publicly" : "Hidden"}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {item.movie.title}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-600">
                      Movie ID: {item.movie.id}
                      {item.movie.release_year
                        ? ` · ${item.movie.release_year}`
                        : ""}
                    </p>

                    <p className="mt-2 text-[10px] text-zinc-700">
                      Last updated: {formatDate(item.portal.updated_at)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:w-[220px]">
                    <div>
                      <label className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                        Display Order
                      </label>

                      <input
                        key={`${item.portal.id}-${item.portal.display_order}`}
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={item.portal.display_order}
                        disabled={updatingId === item.portal.id}
                        onBlur={(event) =>
                          updateDisplayOrder(item, event.target.value)
                        }
                        className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-sm text-white outline-none focus:border-yellow-500 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                        Visibility
                      </label>

                      <button
                        type="button"
                        disabled={updatingId === item.portal.id}
                        onClick={() => toggleActive(item)}
                        className={`w-full rounded-xl border px-3 py-3 text-xs font-medium transition disabled:opacity-50 ${
                          item.portal.is_active
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "border-zinc-700 bg-black text-zinc-400 hover:text-white"
                        }`}
                      >
                        {updatingId === item.portal.id
                          ? "Updating..."
                          : item.portal.is_active
                            ? "Active"
                            : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-zinc-800 p-4 sm:flex-row">
                  <button
                    type="button"
                    disabled={removingId === item.portal.id}
                    onClick={() => removeMovie(item)}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {removingId === item.portal.id
                      ? "Removing..."
                      : "Remove from Portal"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}