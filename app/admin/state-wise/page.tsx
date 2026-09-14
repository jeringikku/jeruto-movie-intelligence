"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function StateWisePage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam ? Number(movieIdParam) : null;

  const [states, setStates] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const [coverageType, setCoverageType] = useState("STATE");
  const [selectedState, setSelectedState] = useState("");

  const [gross, setGross] = useState("");
  const [net, setNet] = useState("");
  const [admissions, setAdmissions] = useState("");
  const [statusId, setStatusId] = useState("3");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  const [totals, setTotals] = useState({
    gross: 0,
    net: 0,
    admissions: 0,
  });

  // --------------------------------------------------
  // LOAD STATES
  // --------------------------------------------------

  useEffect(() => {
    fetchStates();
  }, []);

  // --------------------------------------------------
  // LOAD STATE-WISE DATA
  // --------------------------------------------------

  useEffect(() => {
    if (movieId) {
      fetchStateWiseRecords(movieId);
    } else {
      setRecords([]);

      setTotals({
        gross: 0,
        net: 0,
        admissions: 0,
      });
    }
  }, [movieId]);

  async function fetchStates() {
    const { data, error } = await supabase
      .from("states")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      alert("Failed to load states: " + error.message);
      return;
    }

    setStates(data || []);
  }

  async function fetchStateWiseRecords(currentMovieId: number) {
    const { data, error } = await supabase
      .from("movie_state_box_office")
      .select(`
        id,
        movie_id,
        state_id,
        coverage_type,
        gross_jmi,
        gross_official,
        net_jmi,
        net_official,
        share_jmi,
        share_official,
        admissions,
        currency_id,
        status_id,
        confidence_level_id,
        is_final,
        notes,
        created_at,
        updated_at,
        last_reported_date,
        states (
          id,
          name
        )
      `)
      .eq("movie_id", currentMovieId)
      .order("coverage_type", { ascending: true });

    if (error) {
      console.error(error);

      alert(
        "Failed to load state-wise records: " +
          error.message
      );

      return;
    }

    const rows = data || [];

    setRecords(rows);

    const calculatedTotals = rows.reduce(
      (acc, row) => {
        acc.gross += Number(row.gross_jmi || 0);
        acc.net += Number(row.net_jmi || 0);
        acc.admissions += Number(row.admissions || 0);

        return acc;
      },
      {
        gross: 0,
        net: 0,
        admissions: 0,
      }
    );

    setTotals(calculatedTotals);
  }

  // --------------------------------------------------
  // GET CURRENT DATE FOR DATABASE
  // --------------------------------------------------

  function getCurrentDate() {
    const today = new Date();

    return (
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  }

  // --------------------------------------------------
  // SAVE / REPLACE CUMULATIVE RECORD
  // --------------------------------------------------

  async function saveStateWiseCollection() {
    if (!movieId) {
      alert("No movie selected.");
      return;
    }

    if (
      coverageType === "STATE" &&
      !selectedState
    ) {
      alert("Please select a state.");
      return;
    }

    if (!gross || !net || !admissions) {
      alert(
        "Please enter Gross, Net and Admissions."
      );
      return;
    }

    setSaving(true);

    const stateId =
      coverageType === "STATE"
        ? Number(selectedState)
        : null;

    // --------------------------------------------------
    // FIND EXISTING RECORD
    // --------------------------------------------------

    let existingRecord = null;
    let findError = null;

    if (coverageType === "STATE") {
      const result = await supabase
        .from("movie_state_box_office")
        .select("id")
        .eq("movie_id", movieId)
        .eq("coverage_type", "STATE")
        .eq("state_id", stateId)
        .maybeSingle();

      existingRecord = result.data;
      findError = result.error;
    } else {
      const result = await supabase
        .from("movie_state_box_office")
        .select("id")
        .eq("movie_id", movieId)
        .eq("coverage_type", "REST_OF_INDIA")
        .is("state_id", null)
        .maybeSingle();

      existingRecord = result.data;
      findError = result.error;
    }

    if (findError) {
      console.error(findError);

      alert(
        "Failed to check existing record: " +
          findError.message
      );

      setSaving(false);
      return;
    }

    const recordData = {
      movie_id: movieId,

      coverage_type: coverageType,

      state_id: stateId,

      gross_jmi: Number(gross),

      net_jmi: Number(net),

      admissions: Number(admissions),

      currency_id: 1,

      status_id: Number(statusId),

      is_final:
        Number(statusId) === 2 ||
        Number(statusId) === 3 ||
        Number(statusId) === 4,

      notes: notes || null,

      last_reported_date: getCurrentDate(),
    };

    // --------------------------------------------------
    // UPDATE EXISTING RECORD
    // --------------------------------------------------

    if (existingRecord) {
      const { error } = await supabase
        .from("movie_state_box_office")
        .update(recordData)
        .eq("id", existingRecord.id);

      if (error) {
        console.error(error);

        alert(
          "Failed to update cumulative collection: " +
            error.message
        );

        setSaving(false);
        return;
      }

      alert(
        coverageType === "REST_OF_INDIA"
          ? "Rest of India cumulative collection updated successfully! 🔥"
          : "State cumulative collection updated successfully! 🔥"
      );
    }

    // --------------------------------------------------
    // CREATE NEW RECORD
    // --------------------------------------------------

    else {
      const { error } = await supabase
        .from("movie_state_box_office")
        .insert(recordData);

      if (error) {
        console.error(error);

        alert(
          "Failed to save cumulative collection: " +
            error.message
        );

        setSaving(false);
        return;
      }

      alert(
        coverageType === "REST_OF_INDIA"
          ? "Rest of India cumulative collection saved successfully! 🔥"
          : "State cumulative collection saved successfully! 🔥"
      );
    }

    await fetchStateWiseRecords(movieId);

    // Clear form

    setSelectedState("");
    setGross("");
    setNet("");
    setAdmissions("");
    setNotes("");

    setSaving(false);
  }

  // --------------------------------------------------
  // EDIT RECORD
  // --------------------------------------------------

  async function updateStateWiseRecord() {
    if (!editingRecord) {
      return;
    }

    const recordCoverageType =
      editingRecord.coverage_type || "STATE";

    if (
      recordCoverageType === "STATE" &&
      !editingRecord.state_id
    ) {
      alert("Please select a state.");
      return;
    }

    const stateId =
      recordCoverageType === "STATE"
        ? Number(editingRecord.state_id)
        : null;

    const { error } = await supabase
      .from("movie_state_box_office")
      .update({
        coverage_type:
          recordCoverageType,

        state_id: stateId,

        gross_jmi: Number(
          editingRecord.gross_jmi || 0
        ),

        net_jmi: Number(
          editingRecord.net_jmi || 0
        ),

        admissions: Number(
          editingRecord.admissions || 0
        ),

        status_id: Number(
          editingRecord.status_id || 3
        ),

        is_final:
          Number(editingRecord.status_id) === 2 ||
          Number(editingRecord.status_id) === 3 ||
          Number(editingRecord.status_id) === 4,

        notes:
          editingRecord.notes || null,

        last_reported_date:
          getCurrentDate(),
      })
      .eq("id", editingRecord.id);

    if (error) {
      console.error(error);

      alert(
        "Failed to update record: " +
          error.message
      );

      return;
    }

    setEditingRecord(null);

    if (movieId) {
      await fetchStateWiseRecords(movieId);
    }

    alert(
      "Cumulative state-wise record updated successfully! 🔥"
    );
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async function deleteRecord(recordId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this cumulative state-wise record?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("movie_state_box_office")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error(error);

      alert(
        "Failed to delete record: " +
          error.message
      );

      return;
    }

    if (movieId) {
      await fetchStateWiseRecords(movieId);
    }

    alert(
      "State-wise record deleted successfully."
    );
  }

  // --------------------------------------------------
  // FORMATTING
  // --------------------------------------------------

  function formatCollection(value: number) {
    if (!value) {
      return "—";
    }

    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value)}`;
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat("en-IN").format(
      value
    );
  }

  function getStatusName(statusId: number) {
    if (statusId === 1) return "Estimated";
    if (statusId === 2) return "Official";
    if (statusId === 3) return "Actual";
    if (statusId === 4) return "Revised";
    if (statusId === 5) return "Projected";

    return "Unknown";
  }

  // --------------------------------------------------
  // NO MOVIE
  // --------------------------------------------------

  if (!movieId) {
    return (
      <div className="min-h-screen bg-black text-white p-6">

        <div className="rounded-xl border border-yellow-500/30 bg-zinc-950 p-8 text-center">

          <h2 className="text-xl font-bold text-yellow-400">
            No Movie Selected
          </h2>

          <p className="mt-2 text-zinc-400">
            Please select a movie from the Box Office page first.
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-yellow-400">
          State-wise Collection
        </h1>

        <p className="text-gray-400 mt-1">
          Current cumulative theatrical performance by state
        </p>

      </div>

      {/* OVERVIEW */}

      <div className="mb-8">

        <h2 className="text-xl font-bold mb-4">
          State-wise Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* GROSS */}

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Total Gross
            </p>

            <h3 className="text-2xl font-bold mt-2 text-yellow-400">
              {formatCollection(totals.gross)}
            </h3>

          </div>

          {/* NET */}

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Total Net
            </p>

            <h3 className="text-2xl font-bold mt-2 text-yellow-400">
              {formatCollection(totals.net)}
            </h3>

          </div>

          {/* FOOTFALLS */}

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Total Footfalls
            </p>

            <h3 className="text-2xl font-bold mt-2 text-yellow-400">
              {totals.admissions
                ? formatNumber(totals.admissions)
                : "—"}
            </h3>

          </div>

        </div>

      </div>

      {/* ADD / UPDATE CUMULATIVE COLLECTION */}

      <div className="bg-zinc-950 border border-yellow-500/30 rounded-xl p-6 mb-8">

        <div className="mb-6">

          <h2 className="text-xl font-bold text-yellow-400">
            Add Cumulative Collection
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Enter the latest cumulative theatrical collection for a state
            or Rest of India. Entering a new value for an existing state
            will replace its previous cumulative value.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* COVERAGE TYPE */}

          <div>

            <label className="block text-sm text-gray-400 mb-2">
              Coverage Type
            </label>

            <select
              value={coverageType}
              onChange={(e) => {

                const value = e.target.value;

                setCoverageType(value);

                if (value === "REST_OF_INDIA") {
                  setSelectedState("");
                }

              }}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
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

          {coverageType === "STATE" && (
            <div>

              <label className="block text-sm text-gray-400 mb-2">
                State
              </label>

              <select
                value={selectedState}
                onChange={(e) =>
                  setSelectedState(e.target.value)
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
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
          )}

          {/* GROSS */}

          <div>

            <label className="block text-sm text-gray-400 mb-2">
              Cumulative Gross (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter cumulative gross"
              value={gross}
              onChange={(e) =>
                setGross(e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
            />

          </div>

          {/* NET */}

          <div>

            <label className="block text-sm text-gray-400 mb-2">
              Cumulative Net (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter cumulative net"
              value={net}
              onChange={(e) =>
                setNet(e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
            />

          </div>

          {/* ADMISSIONS */}

          <div>

            <label className="block text-sm text-gray-400 mb-2">
              Cumulative Admissions / Footfalls
            </label>

            <input
              type="number"
              step="1"
              placeholder="Enter cumulative admissions"
              value={admissions}
              onChange={(e) =>
                setAdmissions(e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
            />

          </div>

          {/* STATUS */}

          <div>

            <label className="block text-sm text-gray-400 mb-2">
              Status
            </label>

            <select
              value={statusId}
              onChange={(e) =>
                setStatusId(e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
            >

              <option value="1">
                Estimated
              </option>

              <option value="2">
                Official
              </option>

              <option value="3">
                Actual
              </option>

              <option value="4">
                Revised
              </option>

              <option value="5">
                Projected
              </option>

            </select>

          </div>

          {/* NOTES */}

          <div className="md:col-span-2">

            <label className="block text-sm text-gray-400 mb-2">
              Notes
            </label>

            <input
              type="text"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
            />

          </div>

        </div>

        <button
          onClick={saveStateWiseCollection}
          disabled={saving}
          className="mt-6 w-full md:w-auto px-8 py-3 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400 disabled:opacity-50"
        >

          {saving
            ? "Saving..."
            : coverageType === "REST_OF_INDIA"
            ? "Save / Update Rest of India"
            : "Save / Update State Collection"}

        </button>

      </div>

      {/* EDIT RECORD */}

      {editingRecord && (
        <div className="bg-zinc-950 border border-yellow-500/30 rounded-xl p-6 mb-8">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-yellow-400">
              Edit Cumulative Collection
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              Modify the current cumulative state-wise figure.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* COVERAGE */}

            <div>

              <label className="block text-sm text-gray-400 mb-2">
                Coverage Type
              </label>

              <select
                value={
                  editingRecord.coverage_type ||
                  "STATE"
                }
                onChange={(e) => {

                  const value = e.target.value;

                  setEditingRecord({
                    ...editingRecord,
                    coverage_type: value,
                    state_id:
                      value === "REST_OF_INDIA"
                        ? null
                        : editingRecord.state_id,
                  });

                }}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
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

            {editingRecord.coverage_type !==
              "REST_OF_INDIA" && (
              <div>

                <label className="block text-sm text-gray-400 mb-2">
                  State
                </label>

                <select
                  value={
                    editingRecord.state_id ?? ""
                  }
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      state_id:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
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
            )}

            {/* GROSS */}

            <div>

              <label className="block text-sm text-gray-400 mb-2">
                Cumulative Gross (₹)
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  editingRecord.gross_jmi ?? ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    gross_jmi:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
              />

            </div>

            {/* NET */}

            <div>

              <label className="block text-sm text-gray-400 mb-2">
                Cumulative Net (₹)
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  editingRecord.net_jmi ?? ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    net_jmi:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
              />

            </div>

            {/* ADMISSIONS */}

            <div>

              <label className="block text-sm text-gray-400 mb-2">
                Cumulative Admissions / Footfalls
              </label>

              <input
                type="number"
                step="1"
                value={
                  editingRecord.admissions ?? ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    admissions:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
              />

            </div>

            {/* STATUS */}

            <div>

              <label className="block text-sm text-gray-400 mb-2">
                Status
              </label>

              <select
                value={
                  editingRecord.status_id ?? 3
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    status_id:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
              >

                <option value="1">
                  Estimated
                </option>

                <option value="2">
                  Official
                </option>

                <option value="3">
                  Actual
                </option>

                <option value="4">
                  Revised
                </option>

                <option value="5">
                  Projected
                </option>

              </select>

            </div>

            {/* NOTES */}

            <div className="md:col-span-2">

              <label className="block text-sm text-gray-400 mb-2">
                Notes
              </label>

              <input
                type="text"
                value={
                  editingRecord.notes || ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    notes: e.target.value,
                  })
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
              />

            </div>

          </div>

          <div className="flex gap-3 mt-6">

            <button
              onClick={updateStateWiseRecord}
              className="px-8 py-3 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400"
            >
              Update Record
            </button>

            <button
              onClick={() =>
                setEditingRecord(null)
              }
              className="px-8 py-3 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* CURRENT RECORDS */}

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl">

        <div className="p-6 border-b border-zinc-800">

          <h2 className="text-xl font-bold">
            Current State-wise Collection
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Latest cumulative theatrical performance by state
          </p>

        </div>

        {records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No state-wise box-office data available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm">
                    Coverage
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Cumulative Gross
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Cumulative Net
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Cumulative Admissions
                  </th>

                  <th className="px-5 py-4 text-left text-sm">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm">
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

                    {/* COVERAGE */}

                    <td className="px-5 py-4 font-medium">

                      {record.coverage_type ===
                      "REST_OF_INDIA"
                        ? "Rest of India"
                        : record.states?.name ||
                          "Unknown State"}

                    </td>

                    {/* GROSS */}

                    <td className="px-5 py-4 text-right">

                      ₹
                      {Number(
                        record.gross_jmi || 0
                      ).toLocaleString("en-IN")}

                    </td>

                    {/* NET */}

                    <td className="px-5 py-4 text-right">

                      ₹
                      {Number(
                        record.net_jmi || 0
                      ).toLocaleString("en-IN")}

                    </td>

                    {/* ADMISSIONS */}

                    <td className="px-5 py-4 text-right">

                      {Number(
                        record.admissions || 0
                      ).toLocaleString("en-IN")}

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      <span className="px-3 py-1 rounded-full text-xs bg-zinc-800 text-zinc-300">

                        {getStatusName(
                          Number(record.status_id)
                        )}

                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            setEditingRecord({
                              ...record,
                              coverage_type:
                                record.coverage_type ||
                                "STATE",
                            })
                          }
                          className="px-3 py-1 rounded-lg bg-zinc-800 text-yellow-400 hover:bg-zinc-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteRecord(record.id)
                          }
                          className="px-3 py-1 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60"
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