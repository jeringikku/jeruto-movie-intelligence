"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
  release_year: number | null;
  release_date: string | null;
  poster_url: string | null;
};

type DailyRecord = {
  id: number;
  movie_id: number;
  booking_day: number;
  booking_date: string | null;
  gross: number | null;
  admissions: number | null;
  show_count: number | null;
  updated_at: string;
};

type IntelligenceRecord = {
  id: number;
  movie_id: number;
  is_active: boolean;
  display_order: number;
  tracking_status: "LIVE" | "PAUSED" | "COMPLETED";
  created_at: string;
  updated_at: string;
};

type IntelligenceMovie = {
  intelligence: IntelligenceRecord;
  movie: Movie;
  dailyRecords: DailyRecord[];
};

export default function AdvanceBookingIntelligenceAdminPage() {
  /* =========================================================
     MOVIES
  ========================================================= */

  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");

  const [selectedMovieId, setSelectedMovieId] =
    useState<number | null>(null);

  /* =========================================================
     INTELLIGENCE MOVIES
  ========================================================= */

  const [intelligenceMovies, setIntelligenceMovies] =
    useState<IntelligenceMovie[]>([]);

  /* =========================================================
     UI
  ========================================================= */

  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingIntelligence, setLoadingIntelligence] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] =
    useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadMovies();
    loadIntelligence();
  }, []);

  /* =========================================================
     LOAD MOVIES
  ========================================================= */

  async function loadMovies() {
    setLoadingMovies(true);

    const { data, error } = await supabase
      .from("movies")
      .select(`
        id,
        title,
        release_year,
        release_date,
        poster_url
      `)
      .order("id", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setError("Unable to load movies.");
    } else {
      setMovies((data || []) as Movie[]);
    }

    setLoadingMovies(false);
  }

  /* =========================================================
     LOAD INTELLIGENCE MOVIES
  ========================================================= */

  async function loadIntelligence() {
    setLoadingIntelligence(true);

    setError("");

    const {
      data: intelligenceData,
      error: intelligenceError,
    } = await supabase
      .from("advance_booking_intelligence")
      .select(`
        id,
        movie_id,
        is_active,
        display_order,
        tracking_status,
        created_at,
        updated_at
      `)
      .order("display_order", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (intelligenceError) {
      console.error(intelligenceError);

      setError(
        "Unable to load Advance Booking Intelligence data."
      );

      setLoadingIntelligence(false);
      return;
    }

    const intelligence =
      (intelligenceData || []) as IntelligenceRecord[];

    if (intelligence.length === 0) {
      setIntelligenceMovies([]);
      setLoadingIntelligence(false);
      return;
    }

    const movieIds = intelligence.map(
      (item) => item.movie_id
    );

    const { data: movieData, error: movieError } =
      await supabase
        .from("movies")
        .select(`
          id,
          title,
          release_year,
          release_date,
          poster_url
        `)
        .in("id", movieIds);

    if (movieError) {
      console.error(movieError);

      setError(
        "Unable to load intelligence movie details."
      );

      setLoadingIntelligence(false);
      return;
    }

    const movieMap = new Map<number, Movie>();

    ((movieData || []) as Movie[]).forEach(
      (movie) => {
        movieMap.set(movie.id, movie);
      }
    );

    const { data: dailyData, error: dailyError } =
      await supabase
        .from("movie_advance_booking_daily")
        .select(`
          id,
          movie_id,
          booking_day,
          booking_date,
          gross,
          admissions,
          show_count,
          updated_at
        `)
        .in("movie_id", movieIds)
        .order("booking_day", {
          ascending: true,
        });

    if (dailyError) {
      console.error(dailyError);

      setError(
        "Unable to load advance booking tracking data."
      );

      setLoadingIntelligence(false);
      return;
    }

    const dailyMap =
      new Map<number, DailyRecord[]>();

    ((dailyData || []) as DailyRecord[]).forEach(
      (record) => {
        const existing =
          dailyMap.get(record.movie_id) || [];

        existing.push(record);

        dailyMap.set(
          record.movie_id,
          existing
        );
      }
    );

    const combined: IntelligenceMovie[] =
      intelligence
        .map((item) => {
          const movie =
            movieMap.get(item.movie_id);

          if (!movie) {
            return null;
          }

          return {
            intelligence: item,
            movie,
            dailyRecords:
              dailyMap.get(item.movie_id) || [],
          };
        })
        .filter(
          (
            item
          ): item is IntelligenceMovie =>
            item !== null
        );

    setIntelligenceMovies(combined);

    setLoadingIntelligence(false);
  }

  /* =========================================================
     MOVIES AVAILABLE TO ADD
  ========================================================= */

  const addedMovieIds = useMemo(() => {
    return new Set(
      intelligenceMovies.map(
        (item) => item.movie.id
      )
    );
  }, [intelligenceMovies]);

  const filteredMovies = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return movies
      .filter((movie) => {
        if (addedMovieIds.has(movie.id)) {
          return false;
        }

        if (!query) {
          return true;
        }

        return movie.title
          .toLowerCase()
          .includes(query);
      })
      .slice(0, 20);
  }, [
    movies,
    search,
    addedMovieIds,
  ]);

  /* =========================================================
     FORMATTERS
  ========================================================= */

  function formatMoney(value: number) {
    return (
      "₹" +
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(value)
    );
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat(
      "en-IN"
    ).format(value);
  }

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return "Date not set";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /* =========================================================
     ADD MOVIE
  ========================================================= */

  async function addMovie() {
    if (!selectedMovieId) {
      setError(
        "Please select a movie first."
      );
      return;
    }

    if (addedMovieIds.has(selectedMovieId)) {
      setError(
        "This movie is already in Advance Booking Intelligence."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const nextOrder =
      intelligenceMovies.length > 0
        ? Math.max(
            ...intelligenceMovies.map(
              (item) =>
                item.intelligence
                  .display_order
            )
          ) + 1
        : 1;

    const {
      error: insertError,
    } = await supabase
      .from("advance_booking_intelligence")
      .insert({
        movie_id: selectedMovieId,
        is_active: true,
        display_order: nextOrder,
        tracking_status: "LIVE",
      });

    if (insertError) {
      console.error(insertError);

      setError(
        "Unable to add this movie to Advance Booking Intelligence."
      );

      setSaving(false);
      return;
    }

    const movie = movies.find(
      (item) =>
        item.id === selectedMovieId
    );

    setSelectedMovieId(null);
    setSearch("");

    setSuccess(
      `${movie?.title || "Movie"} added to Advance Booking Intelligence.`
    );

    await loadIntelligence();

    setSaving(false);
  }

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  async function updateStatus(
    intelligenceId: number,
    status:
      | "LIVE"
      | "PAUSED"
      | "COMPLETED"
  ) {
    setError("");
    setSuccess("");

    const {
      error: updateError,
    } = await supabase
      .from("advance_booking_intelligence")
      .update({
        tracking_status: status,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", intelligenceId);

    if (updateError) {
      console.error(updateError);

      setError(
        "Unable to update tracking status."
      );

      return;
    }

    setSuccess(
      `Tracking status changed to ${status}.`
    );

    await loadIntelligence();
  }

  /* =========================================================
     UPDATE ACTIVE STATE
  ========================================================= */

  async function toggleActive(
    item: IntelligenceMovie
  ) {
    setError("");
    setSuccess("");

    const nextValue =
      !item.intelligence.is_active;

    const {
      error: updateError,
    } = await supabase
      .from("advance_booking_intelligence")
      .update({
        is_active: nextValue,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        item.intelligence.id
      );

    if (updateError) {
      console.error(updateError);

      setError(
        "Unable to update movie visibility."
      );

      return;
    }

    setSuccess(
      nextValue
        ? `${item.movie.title} is now active on the intelligence page.`
        : `${item.movie.title} has been hidden from the intelligence page.`
    );

    await loadIntelligence();
  }

  /* =========================================================
     UPDATE DISPLAY ORDER
  ========================================================= */

  async function updateDisplayOrder(
    intelligenceId: number,
    value: string
  ) {
    const order = Number(value);

    if (
      !Number.isInteger(order) ||
      order < 0
    ) {
      return;
    }

    const {
      error: updateError,
    } = await supabase
      .from("advance_booking_intelligence")
      .update({
        display_order: order,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", intelligenceId);

    if (updateError) {
      console.error(updateError);

      setError(
        "Unable to update display order."
      );

      return;
    }

    await loadIntelligence();
  }

  /* =========================================================
     REMOVE MOVIE
  ========================================================= */

  async function removeMovie(
    item: IntelligenceMovie
  ) {
    const confirmed =
      window.confirm(
        `Remove "${item.movie.title}" from Advance Booking Intelligence?\n\nThis will NOT delete its advance booking data.`
      );

    if (!confirmed) {
      return;
    }

    setRemovingId(
      item.intelligence.id
    );

    setError("");
    setSuccess("");

    const {
      error: deleteError,
    } = await supabase
      .from("advance_booking_intelligence")
      .delete()
      .eq(
        "id",
        item.intelligence.id
      );

    if (deleteError) {
      console.error(deleteError);

      setError(
        "Unable to remove this movie from Advance Booking Intelligence."
      );

      setRemovingId(null);
      return;
    }

 setSuccess(
  `${item.movie.title} was removed from Advance Booking Intelligence. Its booking data remains safe.`
);

    await loadIntelligence();

    setRemovingId(null);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-red-400">
            Live Tracking
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white">
            Advance Booking Intelligence
          </h1>

          <p className="mt-2 max-w-2xl text-base leading-6 text-zinc-500">
            Manage the movies displayed on
            the public Advance Booking
            Intelligence page.
          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="relative flex h-2.5 w-2.5">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/40" />

            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />

          </span>

          <span className="text-xs font-medium uppercase tracking-[0.14em] text-red-400">
            Intelligence Control
          </span>

        </div>

      </div>


      {/* =====================================================
          ERROR / SUCCESS
      ===================================================== */}

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3">
          <p className="text-base text-red-400">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-4 py-3">
          <p className="text-base text-emerald-400">
            {success}
          </p>
        </div>
      )}


      {/* =====================================================
          ADD MOVIE
      ===================================================== */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Add Movie
        </p>

        <h2 className="mt-1 text-lg font-semibold text-white">
          Add to Intelligence
        </h2>

        <p className="mt-1 text-base text-zinc-600">
          Select a movie to make it available
          on the public Advance Booking
          Intelligence page.
        </p>


        {/* SEARCH */}

        <div className="mt-4">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search movie..."
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-base text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
          />

        </div>


        {/* MOVIE LIST */}

        <div className="mt-3 max-h-[300px] overflow-y-auto rounded-xl border border-zinc-800 bg-black">

          {loadingMovies ? (

            <div className="px-4 py-6 text-base text-zinc-600">
              Loading movies...
            </div>

          ) : filteredMovies.length === 0 ? (

            <div className="px-4 py-6 text-base text-zinc-600">
              {search
                ? "No available movies found."
                : "All available movies are already added."}
            </div>

          ) : (

            <div className="divide-y divide-zinc-900">

              {filteredMovies.map(
                (movie) => {

                  const selected =
                    movie.id ===
                    selectedMovieId;

                  return (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() =>
                        setSelectedMovieId(
                          movie.id
                        )
                      }
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                        selected
                          ? "bg-red-950/20"
                          : "hover:bg-zinc-950"
                      }`}
                    >

                      {movie.poster_url ? (
                        <img
                          src={
                            movie.poster_url
                          }
                          alt={
                            movie.title
                          }
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
                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-400">
                          Selected
                        </span>
                      )}

                    </button>
                  );
                }
              )}

            </div>

          )}

        </div>


        {/* ADD BUTTON */}

        <button
          type="button"
          disabled={
            !selectedMovieId ||
            saving
          }
          onClick={addMovie}
          className="mt-4 w-full rounded-xl bg-red-600 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving
            ? "Adding..."
            : "+ Add Movie to Intelligence"}
        </button>

      </section>


      {/* =====================================================
          ACTIVE / MANAGED MOVIES
      ===================================================== */}

      <section>

        <div className="mb-4">

          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Intelligence Movies
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            Managed Advance Bookings
          </h2>

          <p className="mt-1 text-base text-zinc-600">
            These movies can appear on the
            public Advance Booking
            Intelligence page.
          </p>

        </div>


        {loadingIntelligence ? (

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-base text-zinc-600">
              Loading intelligence movies...
            </p>
          </div>

        ) : intelligenceMovies.length ===
          0 ? (

          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center">

            <p className="text-base font-medium text-zinc-400">
              No movies added yet.
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Select a movie above to
              start building the public
              intelligence page.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {intelligenceMovies.map(
              (item) => {

                const {
                  intelligence,
                  movie,
                  dailyRecords,
                } = item;

                const latestRecord =
                  [...dailyRecords]
                    .sort(
                      (
                        a,
                        b
                      ) =>
                        new Date(
                          b.updated_at
                        ).getTime() -
                        new Date(
                          a.updated_at
                        ).getTime()
                    )[0] ||
                  null;

                const latestDay =
                  dailyRecords.length >
                  0
                    ? Math.max(
                        ...dailyRecords.map(
                          (record) =>
                            record.booking_day
                        )
                      )
                    : null;

                const latestDate =
                  dailyRecords
                    .filter(
                      (
                        record
                      ) =>
                        record.booking_date
                    )
                    .sort(
                      (
                        a,
                        b
                      ) =>
                        new Date(
                          b.booking_date!
                        ).getTime() -
                        new Date(
                          a.booking_date!
                        ).getTime()
                    )[0]
                    ?.booking_date ||
                  null;

                return (

                  <div
                    key={
                      intelligence.id
                    }
                    className={`overflow-hidden rounded-2xl border ${
                      intelligence.is_active
                        ? "border-red-500/20"
                        : "border-zinc-800"
                    } bg-zinc-900`}
                  >

                    {/* MOVIE HEADER */}

                    <div className="border-b border-zinc-800 bg-black/40 p-4">

                      <div className="flex gap-4">

                        {movie.poster_url ? (
                          <img
                            src={
                              movie.poster_url
                            }
                            alt={
                              movie.title
                            }
                            className="h-28 w-[75px] shrink-0 rounded-lg border border-zinc-800 object-cover"
                          />
                        ) : (
                          <div className="flex h-28 w-[75px] shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-700">
                            No Poster
                          </div>
                        )}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            {intelligence.tracking_status ===
                              "LIVE" && (
                              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-400">

                                <span className="relative flex h-2 w-2">

                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/40" />

                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />

                                </span>

                                Live

                              </span>
                            )}

                            {intelligence.tracking_status !==
                              "LIVE" && (
                              <span
                                className={`rounded-full border px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] ${
                                  intelligence.tracking_status ===
                                  "COMPLETED"
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                                }`}
                              >
                                {
                                  intelligence.tracking_status
                                }
                              </span>
                            )}

                          </div>

                          <h3 className="mt-2 text-lg font-semibold text-white">
                            {movie.title}
                          </h3>

                          <p className="mt-1 text-xs text-zinc-600">
                            {movie.release_year ||
                              "Release year unavailable"}
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">

                            <div>

                              <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                                Tracking Days
                              </p>

                              <p className="mt-1 text-xs font-medium text-zinc-300">
                                {
                                  dailyRecords.length
                                }
                              </p>

                            </div>

                            <div>

                              <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                                Latest Day
                              </p>

                              <p className="mt-1 text-xs font-medium text-zinc-300">
                                {latestDay !==
                                null
                                  ? `Day ${latestDay}`
                                  : "—"}
                              </p>

                            </div>

                            <div>

                              <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                                Latest Date
                              </p>

                              <p className="mt-1 text-xs font-medium text-zinc-300">
                                {latestDate
                                  ? formatDate(
                                      latestDate
                                    )
                                  : "—"}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* STATUS / ORDER */}

                    <div className="grid grid-cols-1 gap-4 border-b border-zinc-800 p-4 sm:grid-cols-3">

                      <div>

                        <label className="mb-2 block text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600">
                          Tracking Status
                        </label>

                        <select
                          value={
                            intelligence.tracking_status
                          }
                          onChange={(
                            event
                          ) =>
                            updateStatus(
                              intelligence.id,
                              event.target
                                .value as
                                | "LIVE"
                                | "PAUSED"
                                | "COMPLETED"
                            )
                          }
                          className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-sm text-zinc-200 outline-none focus:border-red-500"
                        >

                          <option value="LIVE">
                            LIVE
                          </option>

                          <option value="PAUSED">
                            PAUSED
                          </option>

                          <option value="COMPLETED">
                            COMPLETED
                          </option>

                        </select>

                      </div>


                      <div>

                        <label className="mb-2 block text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600">
                          Display Order
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={
                            intelligence.display_order
                          }
                          onBlur={(
                            event
                          ) =>
                            updateDisplayOrder(
                              intelligence.id,
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-sm text-white outline-none focus:border-yellow-500"
                        />

                      </div>


                      <div>

                        <label className="mb-2 block text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600">
                          Public Visibility
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            toggleActive(
                              item
                            )
                          }
                          className={`w-full rounded-xl border px-3 py-3 text-sm font-medium transition ${
                            intelligence.is_active
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border-zinc-700 bg-black text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {intelligence.is_active
                            ? "Visible Publicly"
                            : "Hidden Publicly"}
                        </button>

                      </div>

                    </div>


                    {/* LATEST FIGURE */}

                    {latestRecord && (
                      <div className="border-b border-zinc-800 px-4 py-4">

                        <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                          Latest Recorded Figure
                        </p>

                        <div className="mt-3 grid grid-cols-3 gap-3">

                          <div>

                            <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                              Gross
                            </p>

                            <p className="mt-1 text-xs font-semibold text-yellow-400">
                              {formatMoney(
                                Number(
                                  latestRecord.gross ||
                                    0
                                )
                              )}
                            </p>

                          </div>

                          <div>

                            <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                              Admissions
                            </p>

                            <p className="mt-1 text-xs font-semibold text-zinc-300">
                              {formatNumber(
                                Number(
                                  latestRecord.admissions ||
                                    0
                                )
                              )}
                            </p>

                          </div>

                          <div>

                            <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                              Shows
                            </p>

                            <p className="mt-1 text-xs font-semibold text-zinc-300">
                              {formatNumber(
                                Number(
                                  latestRecord.show_count ||
                                    0
                                )
                              )}
                            </p>

                          </div>

                        </div>

                      </div>
                    )}


                    {/* ACTIONS */}

                    <div className="flex flex-col gap-3 p-4 sm:flex-row">

                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `/preview/movies/${movie.id}/advance-booking`,
                            "_blank"
                          )
                        }
                        className="flex-1 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-400 transition hover:bg-violet-500/20"
                      >
                        View Public Page
                      </button>

                      <button
                        type="button"
                        disabled={
                          removingId ===
                          intelligence.id
                        }
                        onClick={() =>
                          removeMovie(
                            item
                          )
                        }
                        className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {removingId ===
                        intelligence.id
                          ? "Removing..."
                          : "Remove from Intelligence"}
                      </button>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </section>

    </div>
  );
}