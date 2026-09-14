"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
};

type State = {
  id: number;
  name: string;
};

type AdvanceBookingRecord = {
  id: number;
  movie_id: number;
  coverage_type: "STATE" | "REST_OF_INDIA";
  state_id: number | null;
  gross: number | null;
  admissions: number | null;
  show_count: number | null;
  notes: string | null;
  updated_at: string;
};

export default function AdvanceBookingPage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam ? Number(movieIdParam) : null;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [records, setRecords] = useState<AdvanceBookingRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [coverageType, setCoverageType] =
    useState<"STATE" | "REST_OF_INDIA">("STATE");

  const [stateId, setStateId] = useState("");

  const [gross, setGross] = useState("");
  const [admissions, setAdmissions] = useState("");
  const [showCount, setShowCount] = useState("");
  const [notes, setNotes] = useState("");

  // Editing
  const [editingRecord, setEditingRecord] =
    useState<AdvanceBookingRecord | null>(null);

  // --------------------------------------------------
  // LOAD PAGE
  // --------------------------------------------------

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      return;
    }

    loadPage(movieId);
  }, [movieId]);

  async function loadPage(currentMovieId: number) {
    setLoading(true);

    await Promise.all([
      fetchMovie(currentMovieId),
      fetchStates(),
      fetchRecords(currentMovieId),
    ]);

    setLoading(false);
  }

  // --------------------------------------------------
  // FETCH MOVIE
  // --------------------------------------------------

  async function fetchMovie(currentMovieId: number) {
    const { data, error } = await supabase
      .from("movies")
      .select("id, title")
      .eq("id", currentMovieId)
      .single();

    if (error) {
      console.error("Movie fetch error:", error);
      setMovie(null);
      return;
    }

    setMovie(data);
  }

  // --------------------------------------------------
  // FETCH STATES
  // --------------------------------------------------

  async function fetchStates() {
    const { data, error } = await supabase
      .from("states")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("States fetch error:", error);
      setStates([]);
      return;
    }

    setStates(data || []);
  }

  // --------------------------------------------------
  // FETCH ADVANCE BOOKING
  // --------------------------------------------------

  async function fetchRecords(currentMovieId: number) {
    const { data, error } = await supabase
      .from("movie_advance_booking")
      .select(`
        id,
        movie_id,
        coverage_type,
        state_id,
        gross,
        admissions,
        show_count,
        notes,
        updated_at
      `)
      .eq("movie_id", currentMovieId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(
        "Advance booking fetch error:",
        error
      );

      setRecords([]);
      return;
    }

    setRecords(data || []);
  }

  // --------------------------------------------------
  // SAVE / UPDATE
  // --------------------------------------------------

  async function saveAdvanceBooking() {
    if (!movieId) {
      alert("No movie selected.");
      return;
    }

    if (coverageType === "STATE" && !stateId) {
      alert("Please select a state.");
      return;
    }

    if (!gross && !admissions && !showCount) {
      alert(
        "Please enter at least Gross, Admissions or Show Count."
      );

      return;
    }

    setSaving(true);

    const selectedStateId =
      coverageType === "STATE"
        ? Number(stateId)
        : null;

    // --------------------------------------------------
    // CHECK EXISTING RECORD
    // --------------------------------------------------

    let existingQuery = supabase
      .from("movie_advance_booking")
      .select(`
        id,
        movie_id,
        coverage_type,
        state_id,
        gross,
        admissions,
        show_count,
        notes,
        updated_at
      `)
      .eq("movie_id", movieId)
      .eq("coverage_type", coverageType);

    if (coverageType === "STATE") {
      existingQuery = existingQuery.eq(
        "state_id",
        selectedStateId
      );
    } else {
      existingQuery = existingQuery.is(
        "state_id",
        null
      );
    }

    const {
      data: existingRecord,
      error: existingError,
    } = await existingQuery.maybeSingle();

    if (existingError) {
      console.error(
        "Existing record check error:",
        existingError
      );

      alert(
        "Failed to check existing record: " +
          existingError.message
      );

      setSaving(false);
      return;
    }

    const recordData = {
      movie_id: movieId,
      coverage_type: coverageType,
      state_id: selectedStateId,
      gross:
        gross === ""
          ? null
          : Number(gross),
      admissions:
        admissions === ""
          ? null
          : Number(admissions),
      show_count:
        showCount === ""
          ? null
          : Number(showCount),
      notes: notes || null,
    };

    // --------------------------------------------------
    // UPDATE
    // --------------------------------------------------

    if (existingRecord) {
      const { error } = await supabase
        .from("movie_advance_booking")
        .update(recordData)
        .eq("id", existingRecord.id);

      if (error) {
        console.error(
          "Advance booking update error:",
          error
        );

        alert(
          "Failed to update advance booking: " +
            error.message
        );

        setSaving(false);
        return;
      }

      alert(
        "Advance booking updated successfully! 🔥"
      );
    }

    // --------------------------------------------------
    // INSERT
    // --------------------------------------------------

    else {
      const { error } = await supabase
        .from("movie_advance_booking")
        .insert(recordData);

      if (error) {
        console.error(
          "Advance booking save error:",
          error
        );

        alert(
          "Failed to save advance booking: " +
            error.message
        );

        setSaving(false);
        return;
      }

      alert(
        "Advance booking saved successfully! 🎟️🔥"
      );
    }

    await fetchRecords(movieId);

    clearForm();

    setSaving(false);
  }

  // --------------------------------------------------
  // CLEAR FORM
  // --------------------------------------------------

  function clearForm() {
    setCoverageType("STATE");
    setStateId("");
    setGross("");
    setAdmissions("");
    setShowCount("");
    setNotes("");
    setEditingRecord(null);
  }

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  function editRecord(record: AdvanceBookingRecord) {
    setEditingRecord(record);

    setCoverageType(record.coverage_type);

    setStateId(
      record.state_id
        ? String(record.state_id)
        : ""
    );

    setGross(
      record.gross !== null
        ? String(record.gross)
        : ""
    );

    setAdmissions(
      record.admissions !== null
        ? String(record.admissions)
        : ""
    );

    setShowCount(
      record.show_count !== null
        ? String(record.show_count)
        : ""
    );

    setNotes(record.notes ?? "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async function deleteRecord(recordId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this advance booking record?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("movie_advance_booking")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error(
        "Advance booking delete error:",
        error
      );

      alert(
        "Failed to delete record: " +
          error.message
      );

      return;
    }

    alert(
      "Advance booking record deleted successfully."
    );

    if (movieId) {
      await fetchRecords(movieId);
    }
  }

  // --------------------------------------------------
  // FORMAT
  // --------------------------------------------------

  function formatCollection(
    value: number | null
  ) {
    if (
      value === null ||
      value === undefined ||
      value === 0
    ) {
      return "—";
    }

    return (
      "₹" +
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(value)
    );
  }

  function formatNumber(
    value: number | null
  ) {
    if (
      value === null ||
      value === undefined ||
      value === 0
    ) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-IN"
    ).format(value);
  }

  function getStateName(
    stateId: number | null
  ) {
    if (!stateId) {
      return "—";
    }

    const state = states.find(
      (item) => item.id === stateId
    );

    return state?.name ?? "Unknown State";
  }

  function formatUpdatedAt(
    value: string
  ) {
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

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------

  const totalGross = records.reduce(
    (total, record) =>
      total + Number(record.gross || 0),
    0
  );

  const totalAdmissions = records.reduce(
    (total, record) =>
      total +
      Number(record.admissions || 0),
    0
  );

  const totalShows = records.reduce(
    (total, record) =>
      total +
      Number(record.show_count || 0),
    0
  );

  // --------------------------------------------------
  // NO MOVIE
  // --------------------------------------------------

  if (!movieId) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">

        <div className="rounded-xl border border-yellow-500/30 bg-zinc-950 p-8 text-center">

          <h2 className="text-xl font-bold text-yellow-400">
            No Movie Selected
          </h2>

          <p className="mt-2 text-zinc-400">
            Please open Advance Booking from an
            individual movie page.
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-zinc-400">
        Loading advance booking...
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black p-6 text-white">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-yellow-400">
          Advance Booking
        </h1>

        <p className="mt-1 text-gray-400">
          Pre-release theatrical advance booking
          performance
        </p>

      </div>

      {/* MOVIE */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

        <p className="text-sm text-zinc-500">
          Selected Movie
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          {movie?.title ?? "Loading..."}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Movie ID: {movieId}
        </p>

      </div>

      {/* OVERVIEW */}

      <div className="mb-8">

        <h2 className="mb-4 text-xl font-bold">
          Advance Booking Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-zinc-400">
              Total Gross
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {formatCollection(totalGross)}
            </p>

          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-zinc-400">
              Total Admissions
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {formatNumber(totalAdmissions)}
            </p>

          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-zinc-400">
              Total Shows
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {formatNumber(totalShows)}
            </p>

          </div>

        </div>

      </div>

      {/* ADD / UPDATE */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

        <div className="mb-6">

          <h2 className="text-xl font-bold text-yellow-400">
            {editingRecord
              ? "Update Advance Booking"
              : "Add Advance Booking"}
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Enter manually reported advance
            booking figures.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* COVERAGE */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Coverage
            </label>

            <select
              value={coverageType}
              onChange={(e) => {
                const value =
                  e.target.value as
                    | "STATE"
                    | "REST_OF_INDIA";

                setCoverageType(value);

                if (
                  value ===
                  "REST_OF_INDIA"
                ) {
                  setStateId("");
                }
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            >

              <option value="STATE">
                State
              </option>

              <option value="REST_OF_INDIA">
                Rest of India
              </option>

            </select>

          </div>

          {/* STATE */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              State
            </label>

            <select
              value={stateId}
              disabled={
                coverageType ===
                "REST_OF_INDIA"
              }
              onChange={(e) =>
                setStateId(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white disabled:opacity-40"
            >

              <option value="">
                Select State
              </option>

              {states.map((state) => (
                <option
                  key={state.id}
                  value={state.id}
                >
                  {state.name}
                </option>
              ))}

            </select>

          </div>

          {/* GROSS */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Gross (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter advance gross"
              value={gross}
              onChange={(e) =>
                setGross(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* ADMISSIONS */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Admissions / Tickets
            </label>

            <input
              type="number"
              step="1"
              placeholder="Enter tickets sold"
              value={admissions}
              onChange={(e) =>
                setAdmissions(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* SHOW COUNT */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              No. of Shows
            </label>

            <input
              type="number"
              min="0"
              step="1"
              placeholder="Enter number of shows"
              value={showCount}
              onChange={(e) =>
                setShowCount(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* NOTES */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Notes
            </label>

            <input
              type="text"
              placeholder="Example: Sold 10,000 tickets in 5 minutes"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

        </div>

        {/* BUTTONS */}

        <div className="mt-6 flex gap-3">

          <button
            onClick={saveAdvanceBooking}
            disabled={saving}
            className="rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingRecord
              ? "Update Advance Booking"
              : "Save Advance Booking"}
          </button>

          {editingRecord && (
            <button
              onClick={clearForm}
              className="rounded-lg bg-zinc-800 px-8 py-3 text-white hover:bg-zinc-700"
            >
              Cancel
            </button>
          )}

        </div>

      </div>

      {/* PERFORMANCE TABLE */}

      <div className="rounded-xl border border-zinc-700 bg-black">

        <div className="border-b border-zinc-700 p-5">

          <h2 className="text-xl font-bold">
            Advance Booking Performance
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            State-wise and Rest of India advance
            booking
          </p>

        </div>

        {records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No advance booking data available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Coverage
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Gross
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Admissions
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Shows
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Updated At
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Notes
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {records.map((record) => (

                  <tr
                    key={record.id}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >

                    <td className="px-5 py-4 font-medium">

                      {record.coverage_type ===
                      "REST_OF_INDIA"
                        ? "Rest of India"
                        : getStateName(
                            record.state_id
                          )}

                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatCollection(
                        record.gross
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatNumber(
                        record.admissions
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatNumber(
                        record.show_count
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {formatUpdatedAt(
                        record.updated_at
                      )}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-sm text-zinc-400">
                      {record.notes || "—"}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            editRecord(
                              record
                            )
                          }
                          className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-white hover:bg-zinc-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteRecord(
                              record.id
                            )
                          }
                          className="rounded-lg bg-red-900/60 px-3 py-2 text-xs text-red-200 hover:bg-red-800"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}