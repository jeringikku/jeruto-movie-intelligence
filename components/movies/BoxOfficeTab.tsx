"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DailyRecord = {
  id: number;
  collection_date: string;
  day_number: number | null;
  gross_jmi: number | null;
  net_jmi: number | null;
  admissions: number | null;
  show_count: number | null;
  status_id: number | null;
  notes: string | null;
};

type Props = {
  movieId: number;
};

export function BoxOfficeTab({ movieId }: Props) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [collectionDate, setCollectionDate] = useState("");
  const [collectionType, setCollectionType] = useState<
  "day" | "premier"
>("day");
  const [gross, setGross] = useState("");
  const [net, setNet] = useState("");
  const [admissions, setAdmissions] = useState("");
  const [showCount, setShowCount] = useState("");
  const [statusId, setStatusId] = useState("3");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  // Edit
  const [editingRecord, setEditingRecord] =
    useState<DailyRecord | null>(null);

  // --------------------------------------------------
  // Today's date
  // --------------------------------------------------

  useEffect(() => {
    const today = new Date();

    const localDate =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    setCollectionDate(localDate);
  }, []);

  // --------------------------------------------------
  // Fetch records
  // --------------------------------------------------

  useEffect(() => {
    fetchBoxOffice();
  }, [movieId]);

  async function fetchBoxOffice() {
    setLoading(true);

    const { data, error } = await supabase
      .from("movie_daily_box_office")
      .select(`
        id,
        collection_date,
        day_number,
        gross_jmi,
        net_jmi,
        admissions,
        show_count,
        status_id,
        notes
      `)
      .eq("movie_id", movieId)
      .eq("country_id", 1)
      .order("collection_date", { ascending: true });

    if (error) {
      console.error("Box office fetch error:", error);
      setRecords([]);
    } else {
      setRecords(data || []);
    }

    setLoading(false);
  }

  // --------------------------------------------------
  // Add Daily Collection
  // --------------------------------------------------

  async function saveDailyCollection() {
    if (!collectionDate) {
      alert("Please select a collection date.");
      return;
    }

    if (!gross || !net || !admissions) {
      alert("Please enter Gross, Net and Admissions.");
      return;
    }

    if (
  collectionType === "premier" &&
  records.some((record) => record.day_number === 0)
) {
  alert(
    "A Premier / Day 0 collection already exists for this movie."
  );
  return;
}

    setSaving(true);

    // Determine day number
// Premier = Day 0
// Normal daily collection starts from Day 1

const nextDayNumber =
  collectionType === "premier"
    ? 0
    : records.length > 0
    ? Math.max(
        ...records.map((record) => record.day_number || 0)
      ) + 1
    : 1;

    const { error } = await supabase
      .from("movie_daily_box_office")
      .insert({
        movie_id: movieId,
        coverage_type: "COUNTRY",

        // India
        country_id: 1,

        // Date
        collection_date: collectionDate,

        // Automatically assigned
        day_number: nextDayNumber,

        // Manually entered figures
        gross_jmi: Number(gross),
net_jmi: Number(net),
admissions: Number(admissions),

// Optional show count
show_count:
  showCount === ""
    ? null
    : Number(showCount),

// INR

        // INR
        currency_id: 1,

        // Status
        status_id: Number(statusId),

        // Notes
        notes: notes || null,
      });

    if (error) {
      console.error("Save error:", error);
      alert("Failed to save collection: " + error.message);
      setSaving(false);
      return;
    }

    alert("Daily collection saved successfully! 🔥");

    // Refresh table
    await fetchBoxOffice();

    // Clear form
    setGross("");
    setNet("");
    setAdmissions("");
    setShowCount("");
    setNotes("");

    setSaving(false);
  }

  // --------------------------------------------------
  // Delete Daily Record
  // --------------------------------------------------

  async function deleteDailyRecord(recordId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this daily box-office record?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("movie_daily_box_office")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete record: " + error.message);
      return;
    }

    alert("Daily record deleted successfully.");

    await fetchBoxOffice();
  }

  // --------------------------------------------------
  // Update Daily Record
  // --------------------------------------------------

  async function updateDailyRecord() {
    if (!editingRecord) {
      return;
    }

    if (!editingRecord.collection_date) {
      alert("Please select a collection date.");
      return;
    }

    const { error } = await supabase
      .from("movie_daily_box_office")
      .update({
        collection_date: editingRecord.collection_date,
        gross_jmi: Number(editingRecord.gross_jmi || 0),
        net_jmi: Number(editingRecord.net_jmi || 0),
        admissions: Number(editingRecord.admissions || 0),
        show_count:
  editingRecord.show_count === null
    ? null
    : Number(editingRecord.show_count),

        status_id: Number(editingRecord.status_id || 3),
        notes: editingRecord.notes || null,
      })
      .eq("id", editingRecord.id);

    if (error) {
      console.error("Update error:", error);
      alert("Failed to update record: " + error.message);
      return;
    }

    alert("Daily record updated successfully! ✨");

    setEditingRecord(null);

    await fetchBoxOffice();
  }

  // --------------------------------------------------
  // Calculations
  // --------------------------------------------------

  const indiaGross = records.reduce(
    (total, record) =>
      total + Number(record.gross_jmi || 0),
    0
  );

  const indiaNet = records.reduce(
    (total, record) =>
      total + Number(record.net_jmi || 0),
    0
  );

  const indiaAdmissions = records.reduce(
    (total, record) =>
      total + Number(record.admissions || 0),
    0
  );

  const totalShows = records.reduce(
  (total, record) =>
    total + Number(record.show_count || 0),
  0
);

  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  function formatCollection(value: number) {
    if (!value) return "—";

    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value)}`;
  }

  function formatNumber(value: number) {
    if (!value) return "—";

    return new Intl.NumberFormat("en-IN").format(value);
  }

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
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="p-6 text-zinc-400">
        Loading box office data...
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="p-6 space-y-8">

      {/* India Overview */}
      <div>
        <h2 className="text-xl font-bold text-white">
          India Box Office
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          India theatrical performance based on manually entered daily figures
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

        <div className="rounded-xl border border-zinc-700 bg-black p-5">
          <p className="text-sm text-zinc-400">
            India Gross
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-400">
            {formatCollection(indiaGross)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-700 bg-black p-5">
          <p className="text-sm text-zinc-400">
            India Net
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-400">
            {formatCollection(indiaNet)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-700 bg-black p-5">
          <p className="text-sm text-zinc-400">
            India Footfalls
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-400">
            {formatNumber(indiaAdmissions)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-700 bg-black p-5">
  <p className="text-sm text-zinc-400">
    Total Shows
  </p>

  <p className="mt-2 text-2xl font-bold text-yellow-400">
    {formatNumber(totalShows)}
  </p>
</div>

      </div>

      {/* ================================================= */}
      {/* ADD DAILY COLLECTION */}
      {/* ================================================= */}

      <div className="rounded-xl border border-yellow-500/30 bg-black p-6">

        <div className="mb-6">

          <h3 className="text-xl font-bold text-yellow-400">
            Add Daily Collection
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Enter the actual reported figures manually. No automatic
            Gross → Net or Gross → Admissions calculation is used.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Date */}
          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Collection Date
            </label>

            <input
              type="date"
              value={collectionDate}
              onChange={(e) =>
                setCollectionDate(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* Collection Type */}
<div>

  <label className="mb-2 block text-sm text-zinc-400">
    Collection Type
  </label>

  <select
    value={collectionType}
    onChange={(e) =>
      setCollectionType(
        e.target.value as "day" | "premier"
      )
    }
    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
  >

    <option value="day">
      Regular Day
    </option>

    <option value="premier">
      Premier / Day 0
    </option>

  </select>

  <p className="mt-2 text-xs text-zinc-500">
    Select Premier / Day 0 for premiere or pre-release shows before the official Day 1.
  </p>

</div>

          {/* Gross */}
          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Gross (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter gross collection"
              value={gross}
              onChange={(e) =>
                setGross(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* Net */}
          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Net (₹)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter net collection"
              value={net}
              onChange={(e) =>
                setNet(e.target.value)
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

          {/* Show Count */}
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
      setShowCount(e.target.value)
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
          onClick={saveDailyCollection}
          disabled={saving}
          className="mt-6 rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Daily Collection"}
        </button>

      </div>

      {/* ================================================= */}
      {/* DAILY PERFORMANCE */}
      {/* ================================================= */}

      <div className="rounded-xl border border-zinc-700 bg-black">

        <div className="border-b border-zinc-700 p-5">

          <h3 className="text-lg font-bold text-white">
            Daily Performance
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            India day-wise theatrical box office
          </p>

        </div>

        {records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No India box-office data available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Day
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Gross
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Net
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Admissions
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
  Shows
</th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {records.map((record, index) => (

                  <tr
                    key={record.id}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >

                    <td className="px-5 py-4 font-medium">
  {record.day_number === 0
    ? "Premier"
    : `Day ${record.day_number || index + 1}`}
</td>

                    <td className="px-5 py-4 text-zinc-300">
                      {new Date(
                        record.collection_date
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-right">
                      ₹
                      {Number(
                        record.gross_jmi || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-right">
                      ₹
                      {Number(
                        record.net_jmi || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {Number(
                        record.admissions || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-right">
  {record.show_count === null
    ? "—"
    : Number(
        record.show_count
      ).toLocaleString("en-IN")}
</td>

                    <td className="px-5 py-4">

                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                        {getStatus(record.status_id)}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            setEditingRecord(record)
                          }
                          className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-white hover:bg-zinc-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteDailyRecord(record.id)
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
      {/* EDIT DAILY RECORD */}
      {/* ================================================= */}

      {editingRecord && (

        <div className="rounded-xl border border-yellow-500/30 bg-black p-6">

          <div className="mb-6">

            <h3 className="text-xl font-bold text-yellow-400">
              Edit Daily Collection
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              Update the manually reported figures for this day.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Date */}
            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Collection Date
              </label>

              <input
                type="date"
                value={editingRecord.collection_date}
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    collection_date: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* Gross */}
            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Gross (₹)
              </label>

              <input
                type="number"
                step="0.01"
                value={editingRecord.gross_jmi ?? ""}
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    gross_jmi: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* Net */}
            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Net (₹)
              </label>

              <input
                type="number"
                step="0.01"
                value={editingRecord.net_jmi ?? ""}
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    net_jmi: Number(e.target.value),
                  })
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
                value={editingRecord.admissions ?? ""}
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    admissions: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* Show Count */}
<div>

  <label className="mb-2 block text-sm text-zinc-400">
    No. of Shows
  </label>

  <input
    type="number"
    min="0"
    step="1"
    value={editingRecord.show_count ?? ""}
    onChange={(e) =>
      setEditingRecord({
        ...editingRecord,
        show_count:
          e.target.value === ""
            ? null
            : Number(e.target.value),
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
                value={editingRecord.status_id ?? 3}
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    status_id: Number(e.target.value),
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

            {/* Notes */}
            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Notes
              </label>

              <input
                type="text"
                value={editingRecord.notes ?? ""}
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
              onClick={updateDailyRecord}
              className="rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400"
            >
              Update Record
            </button>

            <button
              onClick={() => setEditingRecord(null)}
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