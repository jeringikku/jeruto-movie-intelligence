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

type State = {
  id: number;
  name: string;
};

type DailyRecord = {
  id: number;
  movie_id: number;
  booking_day: number;
  booking_date: string | null;
  coverage_type: "STATE" | "REST_OF_INDIA";
  state_id: number | null;
  gross: number | null;
  admissions: number | null;
  show_count: number | null;
  notes: string | null;
  updated_at: string;
};

type EntryRow = {
  localId: string;
  id?: number;
  coverage_type: "STATE" | "REST_OF_INDIA";
  state_id: number | null;
  gross: string;
  admissions: string;
  show_count: string;
  notes: string;
};

function createEmptyRow(): EntryRow {
  return {
    localId: `${Date.now()}-${Math.random()}`,
    coverage_type: "STATE",
    state_id: null,
    gross: "",
    admissions: "",
    show_count: "",
    notes: "",
  };
}

export default function LiveAdvanceBookingsPage() {
  /* ---------------------------------------------------------
     MOVIES / STATES
  --------------------------------------------------------- */

  const [movies, setMovies] = useState<Movie[]>([]);
  const [states, setStates] = useState<State[]>([]);

  const [search, setSearch] = useState("");
  const [selectedMovieId, setSelectedMovieId] =
    useState<number | null>(null);

  const [records, setRecords] = useState<DailyRecord[]>([]);

  /* ---------------------------------------------------------
     DAY ENTRY
  --------------------------------------------------------- */

  const [bookingDay, setBookingDay] = useState("0");
  const [bookingDate, setBookingDate] = useState("");

  const [entryRows, setEntryRows] = useState<EntryRow[]>([
    createEmptyRow(),
  ]);

  /* ---------------------------------------------------------
     LOADING / UI
  --------------------------------------------------------- */

  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------------------------------------------------
     INITIAL LOAD
  --------------------------------------------------------- */

  useEffect(() => {
    loadMovies();
    loadStates();
  }, []);

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
      setMovies(data || []);
    }

    setLoadingMovies(false);
  }

  async function loadStates() {
    const { data, error } = await supabase
      .from("states")
      .select(`
        id,
        name
      `)
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      setError("Unable to load states.");
    } else {
      setStates(data || []);
    }
  }

  /* ---------------------------------------------------------
     SELECTED MOVIE
  --------------------------------------------------------- */

  const selectedMovie = useMemo(() => {
    return (
      movies.find(
        (movie) => movie.id === selectedMovieId
      ) || null
    );
  }, [movies, selectedMovieId]);

  /* ---------------------------------------------------------
     MOVIE SEARCH
  --------------------------------------------------------- */

  const filteredMovies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return movies.slice(0, 20);
    }

    return movies
      .filter((movie) =>
        movie.title.toLowerCase().includes(query)
      )
      .slice(0, 20);
  }, [movies, search]);

  /* ---------------------------------------------------------
     SELECT MOVIE
  --------------------------------------------------------- */

  function handleMovieSelect(movieId: number) {
    const movie = movies.find(
      (item) => item.id === movieId
    );

    setSelectedMovieId(movieId);
    setBookingDay("0");

    /*
     * For Day 0, use the movie release date
     * as the initial date when available.
     */
    setBookingDate(
      movie?.release_date || ""
    );

    setEntryRows([
      createEmptyRow(),
    ]);

    setSuccess("");
    setError("");
  }

  /* ---------------------------------------------------------
     LOAD ALL DAILY RECORDS
  --------------------------------------------------------- */

  useEffect(() => {
    if (!selectedMovieId) {
      setRecords([]);
      return;
    }

    loadDailyRecords(selectedMovieId);
  }, [selectedMovieId]);

  async function loadDailyRecords(movieId: number) {
    setLoadingRecords(true);
    setError("");

    const { data, error } = await supabase
      .from("movie_advance_booking_daily")
      .select(`
        id,
        movie_id,
        booking_day,
        booking_date,
        coverage_type,
        state_id,
        gross,
        admissions,
        show_count,
        notes,
        updated_at
      `)
      .eq("movie_id", movieId)
      .order("booking_day", {
        ascending: true,
      })
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);

      setError(
        "Unable to load daily advance booking data."
      );

      setRecords([]);
    } else {
      setRecords(
        (data || []) as DailyRecord[]
      );
    }

    setLoadingRecords(false);
  }

  /* ---------------------------------------------------------
     LOAD SELECTED DAY INTO FORM
  --------------------------------------------------------- */

  useEffect(() => {
    if (!selectedMovieId) {
      return;
    }

    const day = Number(bookingDay);

    if (
      !Number.isInteger(day) ||
      day < 0
    ) {
      return;
    }

    const dayRecords =
      records.filter(
        (record) =>
          record.booking_day === day
      );

    if (dayRecords.length === 0) {
      setEntryRows([
        createEmptyRow(),
      ]);

      /*
       * If this is a new Day 0, use release date
       * as the initial booking date.
       */
      if (day === 0) {
        setBookingDate(
          selectedMovie?.release_date || ""
        );
      } else {
        setBookingDate("");
      }

      return;
    }

    /*
     * All territory records belonging to the
     * same booking day should have the same date.
     *
     * Use the first available saved date.
     */
    const savedDate =
      dayRecords.find(
        (record) =>
          record.booking_date
      )?.booking_date || "";

    setBookingDate(savedDate);

    setEntryRows(
      dayRecords.map(
        (record) => ({
          localId:
            `existing-${record.id}`,
          id: record.id,
          coverage_type:
            record.coverage_type,
          state_id:
            record.state_id,
          gross:
            record.gross !== null
              ? String(record.gross)
              : "",
          admissions:
            record.admissions !== null
              ? String(record.admissions)
              : "",
          show_count:
            record.show_count !== null
              ? String(record.show_count)
              : "",
          notes:
            record.notes || "",
        })
      )
    );
  }, [
    bookingDay,
    records,
    selectedMovieId,
    selectedMovie,
  ]);

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */

  function getStateName(
    stateId: number | null
  ) {
    if (stateId === null) {
      return "Rest of India";
    }

    return (
      states.find(
        (state) =>
          state.id === stateId
      )?.name ||
      "Unknown State"
    );
  }

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

  function formatDate(value: string | null) {
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

  function formatUpdatedAt(value: string) {
    return new Date(value).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function parseNumber(value: string) {
    if (value.trim() === "") {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : null;
  }

  /* ---------------------------------------------------------
     ENTRY ROW UPDATES
  --------------------------------------------------------- */

  function updateRow(
    localId: string,
    field: keyof EntryRow,
    value: string | number | null
  ) {
    setEntryRows((current) =>
      current.map((row) =>
        row.localId === localId
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  }

  function addTerritoryRow() {
    setEntryRows((current) => [
      ...current,
      createEmptyRow(),
    ]);
  }

  function removeNewRow(localId: string) {
    setEntryRows((current) =>
      current.filter(
        (row) =>
          row.localId !== localId
      )
    );
  }

  /* ---------------------------------------------------------
     DUPLICATE TERRITORY CHECK
  --------------------------------------------------------- */

  function territoryKey(row: EntryRow) {
    if (
      row.coverage_type ===
      "REST_OF_INDIA"
    ) {
      return "REST_OF_INDIA";
    }

    return `STATE-${row.state_id}`;
  }

  const duplicateTerritories =
    useMemo(() => {
      const seen = new Set<string>();
      const duplicates = new Set<string>();

      for (const row of entryRows) {
        if (
          row.coverage_type ===
            "STATE" &&
          row.state_id === null
        ) {
          continue;
        }

        const key = territoryKey(row);

        if (seen.has(key)) {
          duplicates.add(key);
        }

        seen.add(key);
      }

      return duplicates;
    }, [entryRows]);

  /* ---------------------------------------------------------
     DAY TOTALS
  --------------------------------------------------------- */

  const entryTotals = useMemo(() => {
    return entryRows.reduce(
      (totals, row) => {
        totals.gross +=
          parseNumber(row.gross) || 0;

        totals.admissions +=
          parseNumber(
            row.admissions
          ) || 0;

        totals.shows +=
          parseNumber(
            row.show_count
          ) || 0;

        return totals;
      },
      {
        gross: 0,
        admissions: 0,
        shows: 0,
      }
    );
  }, [entryRows]);

  /* ---------------------------------------------------------
     SAVE DAY
  --------------------------------------------------------- */

  async function saveDayData() {
    if (!selectedMovieId) {
      setError(
        "Please select a movie first."
      );
      return;
    }

    const day = Number(bookingDay);

    if (
      !Number.isInteger(day) ||
      day < 0
    ) {
      setError(
        "Booking day must be 0 or greater."
      );
      return;
    }

    if (!bookingDate) {
      setError(
        "Please select a booking date."
      );
      return;
    }

    if (
      duplicateTerritories.size > 0
    ) {
      setError(
        "The same territory has been added more than once."
      );
      return;
    }

    for (const row of entryRows) {
      if (
        row.coverage_type ===
          "STATE" &&
        row.state_id === null
      ) {
        setError(
          "Please select a state for every state territory row."
        );
        return;
      }
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      for (const row of entryRows) {
        const payload = {
          movie_id: selectedMovieId,
          booking_day: day,
          booking_date: bookingDate,
          coverage_type:
            row.coverage_type,
          state_id:
            row.coverage_type ===
            "STATE"
              ? row.state_id
              : null,
          gross:
            parseNumber(row.gross),
          admissions:
            parseNumber(
              row.admissions
            ),
          show_count:
            parseNumber(
              row.show_count
            ),
          notes:
            row.notes.trim() ||
            null,
          updated_at:
            new Date().toISOString(),
        };

        /*
         * Existing record:
         * UPDATE it.
         *
         * New record:
         * INSERT it.
         */

        if (row.id) {
          const {
            error: updateError,
          } = await supabase
            .from(
              "movie_advance_booking_daily"
            )
            .update(payload)
            .eq("id", row.id);

          if (updateError) {
            throw updateError;
          }
        } else {
          const {
            error: insertError,
          } = await supabase
            .from(
              "movie_advance_booking_daily"
            )
            .insert(payload);

          if (insertError) {
            throw insertError;
          }
        }
      }

      setSuccess(
        `Day ${day} · ${formatDate(
          bookingDate
        )} data saved successfully.`
      );

      await loadDailyRecords(
        selectedMovieId
      );
    } catch (saveError) {
      console.error(
        "Save day error:",
        saveError
      );

      setError(
        "Unable to save the advance booking data. Please check the values and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------
     GROUP HISTORY
  --------------------------------------------------------- */

  const groupedRecords =
    useMemo(() => {
      const groups =
        new Map<
          number,
          DailyRecord[]
        >();

      for (const record of records) {
        const existing =
          groups.get(
            record.booking_day
          ) || [];

        existing.push(record);

        groups.set(
          record.booking_day,
          existing
        );
      }

      return Array.from(
        groups.entries()
      ).sort(
        ([a], [b]) =>
          a - b
      );
    }, [records]);

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

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
            Advance Bookings
          </h1>

          <p className="mt-2 max-w-2xl text-base leading-6 text-zinc-500">
            Enter and maintain real-time,
            day-wise advance booking data
            with territory-level breakdowns.
          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="relative flex h-2.5 w-2.5">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/40" />

            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />

          </span>

          <span className="text-xs font-medium uppercase tracking-[0.14em] text-red-400">
            Live System
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
          MOVIE SELECTOR
      ===================================================== */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Select Movie
        </p>

        <h2 className="mt-1 text-lg font-semibold text-white">
          Live Tracking Movie
        </h2>

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

        <div className="mt-3 max-h-[300px] overflow-y-auto rounded-xl border border-zinc-800 bg-black">

          {loadingMovies ? (

            <div className="px-4 py-6 text-base text-zinc-600">
              Loading movies...
            </div>

          ) : filteredMovies.length === 0 ? (

            <div className="px-4 py-6 text-base text-zinc-600">
              No movies found.
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
                        handleMovieSelect(
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

      </section>


      {/* =====================================================
          SELECTED MOVIE + ENTRY
      ===================================================== */}

      {selectedMovie && (

        <section className="space-y-6">

          {/* MOVIE HEADER */}

          <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

              {selectedMovie.poster_url ? (
                <img
                  src={
                    selectedMovie.poster_url
                  }
                  alt={
                    selectedMovie.title
                  }
                  className="h-28 w-[75px] rounded-lg border border-zinc-800 object-cover"
                />
              ) : (
                <div className="flex h-28 w-[75px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-700">
                  No Poster
                </div>
              )}

              <div className="flex-1">

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-400">
                    Live Tracking
                  </span>

                </div>

                <h2 className="mt-2 text-xl font-semibold text-white">
                  {selectedMovie.title}
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  {selectedMovie.release_year ||
                    "Release year unavailable"}
                </p>

              </div>

              <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3">

                <p className="text-[9px] uppercase tracking-[0.14em] text-zinc-600">
                  Recorded Days
                </p>

                <p className="mt-1 text-xl font-semibold text-red-400">
                  {groupedRecords.length}
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              DATA ENTRY
          ================================================= */}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

            <div className="flex flex-col gap-4">

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.16em] text-red-400">
                  Data Entry
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Day-wise Advance Booking
                </h2>

                <p className="mt-1 text-base text-zinc-600">
                  Enter the latest figures for each
                  territory.
                </p>

              </div>


              {/* DAY + DATE */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Booking Day
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={bookingDay}
                    onChange={(event) =>
                      setBookingDay(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm font-medium text-white outline-none focus:border-red-500"
                  />

                  <p className="mt-2 text-[10px] text-zinc-600">
                    {Number(
                      bookingDay
                    ) === 0
                      ? "Day 0 · Premiere Day"
                      : `Day ${bookingDay}`}
                  </p>

                </div>


                <div>

                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Booking Date
                  </label>

                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(event) =>
                      setBookingDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm font-medium text-white outline-none focus:border-yellow-500"
                  />

                  <p className="mt-2 text-[10px] text-zinc-600">
                    Actual calendar date for this
                    tracking day.
                  </p>

                </div>

              </div>

            </div>


            {/* TERRITORY ROWS */}

            <div className="mt-6 space-y-4">

              {entryRows.map(
                (row, index) => {

                  const rowKey =
                    territoryKey(
                      row
                    );

                  const isDuplicate =
                    duplicateTerritories.has(
                      rowKey
                    );

                  return (

                    <div
                      key={
                        row.localId
                      }
                      className={`rounded-xl border p-4 ${
                        isDuplicate
                          ? "border-red-500/50 bg-red-950/10"
                          : "border-zinc-800 bg-black/30"
                      }`}
                    >

                      <div className="mb-4 flex items-center justify-between">

                        <p className="text-xs font-medium text-zinc-400">
                          Territory {index + 1}
                        </p>

                        {!row.id && (
                          <button
                            type="button"
                            onClick={() =>
                              removeNewRow(
                                row.localId
                              )
                            }
                            className="text-[10px] text-zinc-600 transition hover:text-red-400"
                          >
                            Remove
                          </button>
                        )}

                      </div>


                      {/* TERRITORY */}

                      <div>

                        <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                          Territory
                        </label>

                        <select
                          value={
                            row.coverage_type ===
                            "REST_OF_INDIA"
                              ? "REST_OF_INDIA"
                              : row.state_id ??
                                ""
                          }
                          disabled={
                            Boolean(
                              row.id
                            )
                          }
                          onChange={(event) => {

                            const value =
                              event.target
                                .value;

                            if (
                              value ===
                              "REST_OF_INDIA"
                            ) {

                              updateRow(
                                row.localId,
                                "coverage_type",
                                "REST_OF_INDIA"
                              );

                              updateRow(
                                row.localId,
                                "state_id",
                                null
                              );

                            } else {

                              updateRow(
                                row.localId,
                                "coverage_type",
                                "STATE"
                              );

                              updateRow(
                                row.localId,
                                "state_id",
                                Number(
                                  value
                                )
                              );

                            }

                          }}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-zinc-200 outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                          <option value="">
                            Select territory
                          </option>

                          <option value="REST_OF_INDIA">
                            Rest of India
                          </option>

                          {states.map(
                            (state) => (
                              <option
                                key={
                                  state.id
                                }
                                value={
                                  state.id
                                }
                              >
                                {
                                  state.name
                                }
                              </option>
                            )
                          )}

                        </select>

                        {row.id && (
                          <p className="mt-1 text-[9px] text-zinc-700">
                            Existing territory
                            cannot be changed.
                            Add a new row if
                            necessary.
                          </p>
                        )}

                        {isDuplicate && (
                          <p className="mt-2 text-[10px] text-red-400">
                            This territory is
                            already entered for
                            this day.
                          </p>
                        )}

                      </div>


                      {/* NUMERIC FIELDS */}

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                        <div>

                          <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                            Gross
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              row.gross
                            }
                            onChange={(event) =>
                              updateRow(
                                row.localId,
                                "gross",
                                event.target
                                  .value
                              )
                            }
                            placeholder="₹ Gross"
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none placeholder:text-zinc-700 focus:border-yellow-500"
                          />

                        </div>


                        <div>

                          <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                            Admissions
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              row.admissions
                            }
                            onChange={(event) =>
                              updateRow(
                                row.localId,
                                "admissions",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Admissions"
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none placeholder:text-zinc-700 focus:border-yellow-500"
                          />

                        </div>


                        <div>

                          <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                            Shows
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              row.show_count
                            }
                            onChange={(event) =>
                              updateRow(
                                row.localId,
                                "show_count",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Shows"
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none placeholder:text-zinc-700 focus:border-yellow-500"
                          />

                        </div>

                      </div>


                      {/* NOTES */}

                      <div className="mt-3">

                        <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                          Notes
                        </label>

                        <textarea
                          value={
                            row.notes
                          }
                          onChange={(event) =>
                            updateRow(
                              row.localId,
                              "notes",
                              event.target
                                .value
                            )
                          }
                          rows={2}
                          placeholder="Optional notes..."
                          className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none placeholder:text-zinc-700 focus:border-yellow-500"
                        />

                      </div>

                    </div>

                  );
                }
              )}

            </div>


            {/* ADD TERRITORY */}

            <button
              type="button"
              onClick={addTerritoryRow}
              className="mt-4 w-full rounded-xl border border-dashed border-zinc-700 bg-black/30 px-4 py-3 text-xs font-medium text-zinc-400 transition hover:border-red-500 hover:text-red-400"
            >
              + Add Territory
            </button>


            {/* DAY TOTAL */}

            <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-4">

              <div className="mb-4">

                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                  Calculated Day Total
                </p>

                <p className="mt-1 text-xs text-zinc-700">
                  Automatically calculated from
                  territory entries.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div>

                  <p className="text-[9px] uppercase tracking-[0.1em] text-zinc-600">
                    Gross
                  </p>

                  <p className="mt-1 text-lg font-semibold text-yellow-400">
                    {formatMoney(
                      entryTotals.gross
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-[9px] uppercase tracking-[0.1em] text-zinc-600">
                    Admissions
                  </p>

                  <p className="mt-1 text-lg font-semibold text-zinc-200">
                    {formatNumber(
                      entryTotals.admissions
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-[9px] uppercase tracking-[0.1em] text-zinc-600">
                    Shows
                  </p>

                  <p className="mt-1 text-lg font-semibold text-zinc-200">
                    {formatNumber(
                      entryTotals.shows
                    )}
                  </p>

                </div>

              </div>

            </div>


            {/* SAVE */}

            <button
              type="button"
              disabled={saving}
              onClick={saveDayData}
              className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : `Save Day ${
                    Number(
                      bookingDay
                    ) || 0
                  } Data`}
            </button>

            <p className="mt-3 text-center text-[10px] leading-5 text-zinc-700">
              Saving an existing territory updates
              its current value and timestamp.
              Previous booking days remain unchanged.
            </p>

          </section>


          {/* =================================================
              HISTORICAL DATA
          ================================================= */}

          <section>

            <div className="mb-4">

              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Historical Tracking
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Saved Day-wise Data
              </h2>

              <p className="mt-1 text-base text-zinc-600">
                Every recorded day remains available
                for historical analysis.
              </p>

            </div>


            {loadingRecords ? (

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-base text-zinc-600">
                  Loading history...
                </p>
              </div>

            ) : groupedRecords.length === 0 ? (

              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center">

                <p className="text-base font-medium text-zinc-400">
                  No day-wise data recorded yet.
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  Start with Day 0 · Premiere Day.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {groupedRecords.map(
                  ([day, dayRecords]) => {

                    const dayGross =
                      dayRecords.reduce(
                        (
                          total,
                          record
                        ) =>
                          total +
                          Number(
                            record.gross ||
                              0
                          ),
                        0
                      );

                    const dayAdmissions =
                      dayRecords.reduce(
                        (
                          total,
                          record
                        ) =>
                          total +
                          Number(
                            record.admissions ||
                              0
                          ),
                        0
                      );

                    const dayShows =
                      dayRecords.reduce(
                        (
                          total,
                          record
                        ) =>
                          total +
                          Number(
                            record.show_count ||
                              0
                          ),
                        0
                      );

                    const dayDate =
                      dayRecords.find(
                        (record) =>
                          record.booking_date
                      )?.booking_date ||
                      null;

                    return (

                      <div
                        key={day}
                        className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                      >

                        <div className="border-b border-zinc-800 bg-black/40 px-4 py-4">

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="text-lg font-semibold text-white">
                                  Day {day}
                                </span>

                                {day === 0 && (
                                  <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-yellow-400">
                                    Premiere Day
                                  </span>
                                )}

                              </div>

                              <p className="mt-2 text-sm font-medium text-zinc-400">
                                {formatDate(
                                  dayDate
                                )}
                              </p>

                              <p className="mt-1 text-xs text-zinc-600">
                                {dayRecords.length}{" "}
                                territory record
                                {dayRecords.length !==
                                1
                                  ? "s"
                                  : ""}
                              </p>

                            </div>


                            <div className="grid grid-cols-3 gap-2">

                              <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">

                                <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                                  Gross
                                </p>

                                <p className="mt-1 text-xs font-semibold text-yellow-400">
                                  {formatMoney(
                                    dayGross
                                  )}
                                </p>

                              </div>

                              <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">

                                <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                                  Admissions
                                </p>

                                <p className="mt-1 text-xs font-semibold text-zinc-300">
                                  {formatNumber(
                                    dayAdmissions
                                  )}
                                </p>

                              </div>

                              <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">

                                <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                                  Shows
                                </p>

                                <p className="mt-1 text-xs font-semibold text-zinc-300">
                                  {formatNumber(
                                    dayShows
                                  )}
                                </p>

                              </div>

                            </div>

                          </div>

                        </div>


                        <div className="divide-y divide-zinc-800">

                          {dayRecords.map(
                            (record) => (

                              <div
                                key={
                                  record.id
                                }
                                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center"
                              >

                                <div className="flex-1">

                                  <p className="text-base font-medium text-zinc-200">
                                    {record.coverage_type ===
                                    "REST_OF_INDIA"
                                      ? "Rest of India"
                                      : getStateName(
                                          record.state_id
                                        )}
                                  </p>

                                  {record.notes && (
                                    <p className="mt-1 text-xs text-zinc-600">
                                      {
                                        record.notes
                                      }
                                    </p>
                                  )}

                                </div>

                                <div className="grid grid-cols-3 gap-4 sm:min-w-[330px]">

                                  <div>

                                    <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                                      Gross
                                    </p>

                                    <p className="mt-1 text-xs font-medium text-yellow-400">
                                      {formatMoney(
                                        Number(
                                          record.gross ||
                                            0
                                        )
                                      )}
                                    </p>

                                  </div>

                                  <div>

                                    <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                                      Admissions
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-300">
                                      {formatNumber(
                                        Number(
                                          record.admissions ||
                                            0
                                        )
                                      )}
                                    </p>

                                  </div>

                                  <div>

                                    <p className="text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                                      Shows
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-300">
                                      {formatNumber(
                                        Number(
                                          record.show_count ||
                                            0
                                        )
                                      )}
                                    </p>

                                  </div>

                                </div>

                                <div className="text-[9px] text-zinc-700 sm:w-[145px] sm:text-right">

                                  Updated{" "}
                                  {formatUpdatedAt(
                                    record.updated_at
                                  )}

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </section>

        </section>

      )}

    </div>
  );
}