"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type State = {
  id: number;
  name: string;
};

type ConfidenceLevel = {
  id: number;
  name: string;
};

type StateRecord = {
  id: number;
  movie_id: number;
  state_id: number | null;
  coverage_type: string;
  gross_jmi: number | null;
  gross_official: number | null;
  net_jmi: number | null;
  net_official: number | null;
  share_jmi: number | null;
  share_official: number | null;
  admissions: number | null;
  currency_id: number;
  status_id: number;
  confidence_level_id: number | null;
  is_final: boolean;
  notes: string | null;
};

type Props = {
  movieId: number;
};

export function StateWiseCollection({ movieId }: Props) {
  const [states, setStates] = useState<State[]>([]);
  const [confidenceLevels, setConfidenceLevels] = useState<
    ConfidenceLevel[]
  >([]);

  const [records, setRecords] = useState<StateRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // Add Form
  // --------------------------------------------------

  const [stateId, setStateId] = useState("");
  const [grossJmi, setGrossJmi] = useState("");
  const [grossOfficial, setGrossOfficial] = useState("");
  const [netJmi, setNetJmi] = useState("");
  const [netOfficial, setNetOfficial] = useState("");
  const [shareJmi, setShareJmi] = useState("");
  const [shareOfficial, setShareOfficial] = useState("");
  const [admissions, setAdmissions] = useState("");
  const [statusId, setStatusId] = useState("3");
  const [confidenceLevelId, setConfidenceLevelId] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const [notes, setNotes] = useState("");

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------

  const [editingRecord, setEditingRecord] =
    useState<StateRecord | null>(null);

  // --------------------------------------------------
  // Fetch Master Data
  // --------------------------------------------------

  useEffect(() => {
    fetchMasterData();
  }, []);

  async function fetchMasterData() {
    const [statesResult, confidenceResult] = await Promise.all([
      supabase
        .from("states")
        .select("id, name")
        .eq("country_id", 1)
        .order("name"),

      supabase
        .from("confidence_levels")
        .select("id, name")
        .order("id"),
    ]);

    if (statesResult.error) {
      console.error(
        "States fetch error:",
        statesResult.error
      );
    } else {
      setStates(statesResult.data || []);
    }

    if (confidenceResult.error) {
      console.error(
        "Confidence levels fetch error:",
        confidenceResult.error
      );
    } else {
      setConfidenceLevels(
        confidenceResult.data || []
      );
    }
  }

  // --------------------------------------------------
  // Fetch State-wise Records
  // --------------------------------------------------

  useEffect(() => {
    fetchStateWiseCollection();
  }, [movieId]);

  async function fetchStateWiseCollection() {
    setLoading(true);

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
        notes
      `)
      .eq("movie_id", movieId)
      .eq("coverage_type", "STATE")
      .order("state_id", {
        ascending: true,
      });

    if (error) {
      console.error(
        "State-wise fetch error:",
        error
      );

      setRecords([]);
    } else {
      setRecords(data || []);
    }

    setLoading(false);
  }

  // --------------------------------------------------
  // Get State Name
  // --------------------------------------------------

  function getStateName(stateId: number | null) {
    const state = states.find(
      (item) => item.id === stateId
    );

    return state?.name || "—";
  }

  // --------------------------------------------------
  // Get Status
  // --------------------------------------------------

  function getStatus(statusId: number | null) {
    switch (statusId) {
      case 1:
        return "Estimated";
      case 2:
        return "Official";
      case 3:
        return "Actual";
      case 4:
        return "Revised";
      case 5:
        return "Projected";
      default:
        return "—";
    }
  }

  // --------------------------------------------------
  // Get Confidence
  // --------------------------------------------------

  function getConfidence(
    confidenceId: number | null
  ) {
    const confidence =
      confidenceLevels.find(
        (item) => item.id === confidenceId
      );

    return confidence?.name || "—";
  }

  // --------------------------------------------------
  // Add State Collection
  // --------------------------------------------------

  async function saveStateCollection() {
    if (!stateId) {
      alert("Please select a state.");
      return;
    }

    if (!grossJmi) {
  alert("Please enter the JMI Gross collection.");
  return;
}

    // Prevent duplicate state entry
    const alreadyExists = records.some(
      (record) =>
        record.state_id === Number(stateId)
    );

    if (alreadyExists) {
      alert(
        "This state already has a collection record. Please edit the existing record instead."
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("movie_state_box_office")
      .insert({
        movie_id: movieId,

        state_id: Number(stateId),

        coverage_type: "STATE",

        gross_jmi: grossJmi
          ? Number(grossJmi)
          : null,

        gross_official: grossOfficial
          ? Number(grossOfficial)
          : null,

        net_jmi: netJmi
          ? Number(netJmi)
          : null,

        net_official: netOfficial
          ? Number(netOfficial)
          : null,

        share_jmi: shareJmi
          ? Number(shareJmi)
          : null,

        share_official: shareOfficial
          ? Number(shareOfficial)
          : null,

        admissions: admissions
          ? Number(admissions)
          : null,

        currency_id: 1,

        status_id: Number(statusId),

        confidence_level_id:
          confidenceLevelId
            ? Number(confidenceLevelId)
            : null,

        is_final: isFinal,

        notes: notes || null,
      });

    if (error) {
      console.error(
        "State collection save error:",
        error
      );

      alert(
        "Failed to save state collection: " +
          error.message
      );

      setSaving(false);
      return;
    }

    alert(
      "State-wise collection saved successfully! 🔥"
    );

    await fetchStateWiseCollection();

    // Clear form
    setStateId("");
    setGrossJmi("");
    setGrossOfficial("");
    setNetJmi("");
    setNetOfficial("");
    setShareJmi("");
    setShareOfficial("");
    setAdmissions("");
    setStatusId("3");
    setConfidenceLevelId("");
    setIsFinal(false);
    setNotes("");

    setSaving(false);
  }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  async function deleteStateRecord(recordId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this state-wise box-office record?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("movie_state_box_office")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error(
        "State delete error:",
        error
      );

      alert(
        "Failed to delete record: " +
          error.message
      );

      return;
    }

    alert(
      "State-wise record deleted successfully."
    );

    await fetchStateWiseCollection();
  }

  // --------------------------------------------------
  // Update
  // --------------------------------------------------

  async function updateStateRecord() {
    if (!editingRecord) {
      return;
    }

    if (!editingRecord.state_id) {
      alert("Please select a state.");
      return;
    }

    const { error } = await supabase
      .from("movie_state_box_office")
      .update({
        state_id: editingRecord.state_id,

        gross_jmi:
          editingRecord.gross_jmi !== null
            ? Number(editingRecord.gross_jmi)
            : null,

        gross_official:
          editingRecord.gross_official !== null
            ? Number(
                editingRecord.gross_official
              )
            : null,

        net_jmi:
          editingRecord.net_jmi !== null
            ? Number(editingRecord.net_jmi)
            : null,

        net_official:
          editingRecord.net_official !== null
            ? Number(editingRecord.net_official)
            : null,

        share_jmi:
          editingRecord.share_jmi !== null
            ? Number(editingRecord.share_jmi)
            : null,

        share_official:
          editingRecord.share_official !== null
            ? Number(
                editingRecord.share_official
              )
            : null,

        admissions:
          editingRecord.admissions !== null
            ? Number(editingRecord.admissions)
            : null,

        status_id: Number(
          editingRecord.status_id
        ),

        confidence_level_id:
          editingRecord.confidence_level_id
            ? Number(
                editingRecord.confidence_level_id
              )
            : null,

        is_final: editingRecord.is_final,

        notes: editingRecord.notes || null,
      })
      .eq("id", editingRecord.id);

    if (error) {
      console.error(
        "State update error:",
        error
      );

      alert(
        "Failed to update record: " +
          error.message
      );

      return;
    }

    alert(
      "State-wise record updated successfully! ✨"
    );

    setEditingRecord(null);

    await fetchStateWiseCollection();
  }

  // --------------------------------------------------
  // Calculations
  // --------------------------------------------------

  const totalGrossJmi = records.reduce(
    (total, record) =>
      total + Number(record.gross_jmi || 0),
    0
  );

  const totalGrossOfficial = records.reduce(
    (total, record) =>
      total +
      Number(record.gross_official || 0),
    0
  );

  const totalNetJmi = records.reduce(
    (total, record) =>
      total + Number(record.net_jmi || 0),
    0
  );

  const totalNetOfficial = records.reduce(
    (total, record) =>
      total +
      Number(record.net_official || 0),
    0
  );

  const totalAdmissions = records.reduce(
    (total, record) =>
      total + Number(record.admissions || 0),
    0
  );

  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  function formatCollection(
    value: number
  ) {
    if (!value) return "—";

    return `₹${new Intl.NumberFormat(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    ).format(value)}`;
  }

  function formatNumber(
    value: number
  ) {
    if (!value) return "—";

    return new Intl.NumberFormat(
      "en-IN"
    ).format(value);
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="p-6 text-zinc-400">
        Loading state-wise box office data...
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="p-6 space-y-8">

      {/* Header */}

      <div>
        <h2 className="text-xl font-bold text-white">
          State-wise Collection
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          India theatrical box office performance
          by state
        </p>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-5">

        <div className="rounded-xl border border-zinc-700 bg-black p-5">
          <p className="text-sm text-zinc-400">
            JMI Gross
          </p>

          <p className="mt-2 text-xl font-bold text-yellow-400">
            {formatCollection(totalGrossJmi)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-700 bg-black p-5">
          <p className="text-sm text-zinc-400">
            Official Gross
          </p>

          <p className="mt-2 text-xl font-bold text-yellow-400">
            {formatCollection(
              totalGrossOfficial
            )}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-700 bg-black p-5">
          <p className="text-sm text-zinc-400">
            JMI Net
          </p>

          <p className="mt-2 text-xl font-bold text-yellow-400">
            {formatCollection(totalNetJmi)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-700 bg-black p-5">
          <p className="text-sm text-zinc-400">
            Official Net
          </p>

          <p className="mt-2 text-xl font-bold text-yellow-400">
            {formatCollection(
              totalNetOfficial
            )}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-700 bg-black p-5">
          <p className="text-sm text-zinc-400">
            Admissions
          </p>

          <p className="mt-2 text-xl font-bold text-yellow-400">
            {formatNumber(totalAdmissions)}
          </p>
        </div>

      </div>

      {/* ================================================= */}
      {/* ADD STATE COLLECTION */}
      {/* ================================================= */}

      <div className="rounded-xl border border-yellow-500/30 bg-black p-6">

        <div className="mb-6">

          <h3 className="text-xl font-bold text-yellow-400">
            Add State Collection
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Enter the reported theatrical
            collection figures for an Indian state.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* State */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm text-zinc-400">
              State
            </label>

            <select
              value={stateId}
              onChange={(e) =>
                setStateId(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
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

          {/* JMI Gross */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              JMI Gross (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter JMI gross"
              value={grossJmi}
              onChange={(e) =>
                setGrossJmi(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* Official Gross */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Official Gross (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter official gross"
              value={grossOfficial}
              onChange={(e) =>
                setGrossOfficial(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* JMI Net */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              JMI Net (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter JMI net"
              value={netJmi}
              onChange={(e) =>
                setNetJmi(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* Official Net */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Official Net (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter official net"
              value={netOfficial}
              onChange={(e) =>
                setNetOfficial(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* JMI Share */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              JMI Share (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter JMI share"
              value={shareJmi}
              onChange={(e) =>
                setShareJmi(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* Official Share */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Official Share (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter official share"
              value={shareOfficial}
              onChange={(e) =>
                setShareOfficial(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* Admissions */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Admissions / Footfalls
            </label>

            <input
              type="number"
              step="1"
              placeholder="Enter admissions"
              value={admissions}
              onChange={(e) =>
                setAdmissions(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* Status */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Status
            </label>

            <select
              value={statusId}
              onChange={(e) =>
                setStatusId(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
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

          {/* Confidence */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Confidence Level
            </label>

            <select
              value={confidenceLevelId}
              onChange={(e) =>
                setConfidenceLevelId(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            >

              <option value="">
                Select Confidence
              </option>

              {confidenceLevels.map(
                (level) => (
                  <option
                    key={level.id}
                    value={level.id}
                  >
                    {level.name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* Final */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Record Status
            </label>

            <select
              value={isFinal ? "true" : "false"}
              onChange={(e) =>
                setIsFinal(
                  e.target.value === "true"
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            >

              <option value="false">
                Not Final
              </option>

              <option value="true">
                Final
              </option>

            </select>

          </div>

          {/* Notes */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Notes
            </label>

            <input
              type="text"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

        </div>

        <button
          onClick={saveStateCollection}
          disabled={saving}
          className="mt-6 rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save State Collection"}
        </button>

      </div>

      {/* ================================================= */}
      {/* STATE PERFORMANCE */}
      {/* ================================================= */}

      <div className="rounded-xl border border-zinc-700 bg-black">

        <div className="border-b border-zinc-700 p-5">

          <h3 className="text-lg font-bold text-white">
            State-wise Performance
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            India theatrical box office by state
          </p>

        </div>

        {records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No state-wise box-office data
            available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    State
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    JMI Gross
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Official Gross
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    JMI Net
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Official Net
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Admissions
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Confidence
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Final
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
                      {getStateName(
                        record.state_id
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatCollection(
                        Number(
                          record.gross_jmi || 0
                        )
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatCollection(
                        Number(
                          record.gross_official || 0
                        )
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatCollection(
                        Number(
                          record.net_jmi || 0
                        )
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatCollection(
                        Number(
                          record.net_official || 0
                        )
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatNumber(
                        Number(
                          record.admissions || 0
                        )
                      )}
                    </td>

                    <td className="px-5 py-4">

                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                        {getStatus(
                          record.status_id
                        )}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-zinc-300">
                      {getConfidence(
                        record.confidence_level_id
                      )}
                    </td>

                    <td className="px-5 py-4">

                      {record.is_final ? (
                        <span className="text-green-400">
                          Yes
                        </span>
                      ) : (
                        <span className="text-zinc-500">
                          No
                        </span>
                      )}

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            setEditingRecord(
                              record
                            )
                          }
                          className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-white hover:bg-zinc-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteStateRecord(
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

      {/* ================================================= */}
      {/* EDIT STATE RECORD */}
      {/* ================================================= */}

      {editingRecord && (

        <div className="rounded-xl border border-yellow-500/30 bg-black p-6">

          <div className="mb-6">

            <h3 className="text-xl font-bold text-yellow-400">
              Edit State Collection
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              Update the reported state-wise
              theatrical figures.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* State */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm text-zinc-400">
                State
              </label>

              <select
                value={
                  editingRecord.state_id ?? ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    state_id: Number(
                      e.target.value
                    ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
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

            {/* JMI Gross */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
  JMI Gross (₹) <span className="text-yellow-400">*</span>
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
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* Official Gross */}

            <div>
<label className="mb-2 block text-sm text-zinc-400">
  Official Gross (₹) <span className="text-zinc-600">(Optional)</span>
</label>

              <input
                type="number"
                step="0.01"
                value={
                  editingRecord.gross_official ??
                  ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    gross_official:
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* JMI Net */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
  JMI Net (₹) <span className="text-zinc-600">(Optional)</span>
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
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* Official Net */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
  Official Net (₹) <span className="text-zinc-600">(Optional)</span>
</label>

              <input
                type="number"
                step="0.01"
                value={
                  editingRecord.net_official ??
                  ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    net_official:
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* JMI Share */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                JMI Share (₹)
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  editingRecord.share_jmi ?? ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    share_jmi:
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* Official Share */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Official Share (₹)
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  editingRecord.share_official ??
                  ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    share_official:
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* Admissions */}

            <div>

             <label className="mb-2 block text-sm text-zinc-400">
  Admissions / Footfalls <span className="text-zinc-600">(Optional)</span>
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
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* Status */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Status
              </label>

              <select
                value={
                  editingRecord.status_id ?? 3
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    status_id: Number(
                      e.target.value
                    ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              >

                <option value={1}>
                  Estimated
                </option>

                <option value={2}>
                  Official
                </option>

                <option value={3}>
                  Actual
                </option>

                <option value={4}>
                  Revised
                </option>

                <option value={5}>
                  Projected
                </option>

              </select>

            </div>

            {/* Confidence */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Confidence Level
              </label>

              <select
                value={
                  editingRecord.confidence_level_id ??
                  ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    confidence_level_id:
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              >

                <option value="">
                  Select Confidence
                </option>

                {confidenceLevels.map(
                  (level) => (
                    <option
                      key={level.id}
                      value={level.id}
                    >
                      {level.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* Final */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Record Status
              </label>

              <select
                value={
                  editingRecord.is_final
                    ? "true"
                    : "false"
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    is_final:
                      e.target.value ===
                      "true",
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              >

                <option value="false">
                  Not Final
                </option>

                <option value="true">
                  Final
                </option>

              </select>

            </div>

            {/* Notes */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Notes
              </label>

              <input
                type="text"
                value={
                  editingRecord.notes ?? ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    notes: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

          </div>

          <div className="mt-6 flex gap-3">

            <button
              onClick={updateStateRecord}
              className="rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400"
            >
              Update Record
            </button>

            <button
              onClick={() =>
                setEditingRecord(null)
              }
              className="rounded-lg bg-zinc-800 px-8 py-3 text-white hover:bg-zinc-700"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>
  );
}