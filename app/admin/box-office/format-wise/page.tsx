"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FormatRecord = {
  id: number;
  movie_id: number;
  format_name: string;
  gross_jmi: number | null;
  net_jmi: number | null;
  admissions: number | null;
  status_id: number | null;
  notes: string | null;
};

type Format = {
  id: number;
  name: string;
};

type Status = {
  id: number;
  name: string;
};

export default function FormatWisePage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam ? Number(movieIdParam) : null;

  const [records, setRecords] = useState<FormatRecord[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formatName, setFormatName] = useState("");
  const [gross, setGross] = useState("");
  const [net, setNet] = useState("");
  const [admissions, setAdmissions] = useState("");
  const [statusId, setStatusId] = useState("3");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------

  useEffect(() => {
    if (!movieId) {
      setRecords([]);
      return;
    }

    fetchFormatData(movieId);
    fetchFormats();
    fetchStatuses();
  }, [movieId]);

  // --------------------------------------------------
  // Fetch current movie format records
  // --------------------------------------------------

  async function fetchFormatData(
    currentMovieId: number
  ) {
    setLoading(true);

    const { data, error } = await supabase
      .from("movie_format_box_office")
      .select(`
        id,
        movie_id,
        format_name,
        gross_jmi,
        net_jmi,
        admissions,
        status_id,
        notes
      `)
      .eq("movie_id", currentMovieId)
      .order("format_name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Format-wise fetch error:",
        error
      );

      alert(
        "Failed to load format-wise collection: " +
          error.message
      );

      setRecords([]);
      setLoading(false);
      return;
    }

    setRecords(
      (data || []) as FormatRecord[]
    );

    setLoading(false);
  }

  // --------------------------------------------------
  // Fetch format master list
  // --------------------------------------------------

  async function fetchFormats() {
    const { data, error } = await supabase
      .from("formats")
      .select("id, name")
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Formats fetch error:",
        error
      );

      alert(
        "Failed to load formats: " +
          error.message
      );

      return;
    }

    setFormats(
      (data || []) as Format[]
    );
  }

  // --------------------------------------------------
  // Fetch box-office statuses
  // --------------------------------------------------

  async function fetchStatuses() {
    const { data, error } = await supabase
      .from("box_office_statuses")
      .select("id, name")
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Status fetch error:",
        error
      );

      alert(
        "Failed to load box-office statuses: " +
          error.message
      );

      return;
    }

    setStatuses(
      (data || []) as Status[]
    );
  }

  // --------------------------------------------------
  // Reset form
  // --------------------------------------------------

  function resetForm() {
    setFormatName("");
    setGross("");
    setNet("");
    setAdmissions("");
    setStatusId("3");
    setNotes("");
    setEditingId(null);
  }

  // --------------------------------------------------
  // Save / Update
  // --------------------------------------------------

  async function handleSave() {
    if (!movieId) {
      alert("No movie selected.");
      return;
    }

    if (!formatName) {
      alert("Please select a format.");
      return;
    }

    if (
      gross === "" ||
      Number(gross) < 0
    ) {
      alert(
        "Please enter a valid gross collection."
      );
      return;
    }

    if (
      net === "" ||
      Number(net) < 0
    ) {
      alert(
        "Please enter a valid net collection."
      );
      return;
    }

    /*
     * Admissions are intentionally optional.
     * NULL is allowed by our database design.
     */

    if (
      admissions !== "" &&
      Number(admissions) < 0
    ) {
      alert(
        "Please enter valid footfalls."
      );
      return;
    }

    setSaving(true);

    const payload = {
      movie_id: movieId,

      format_name: formatName,

      gross_jmi:
        gross === ""
          ? null
          : Number(gross),

      net_jmi:
        net === ""
          ? null
          : Number(net),

      admissions:
        admissions === ""
          ? null
          : Number(admissions),

      status_id:
        statusId === ""
          ? 3
          : Number(statusId),

      notes:
        notes.trim() || null,

      updated_at:
        new Date().toISOString(),
    };

    const { error } = await supabase
      .from("movie_format_box_office")
      .upsert(payload, {
        onConflict:
          "movie_id,format_name",
      });

    if (error) {
      console.error(
        "Format-wise save error:",
        error
      );

      alert(
        "Failed to save format-wise collection: " +
          error.message
      );

      setSaving(false);
      return;
    }

    alert(
      editingId
        ? "Format-wise collection updated successfully! 🔥"
        : "Format-wise collection saved successfully! 🔥"
    );

    resetForm();

    await fetchFormatData(movieId);

    setSaving(false);
  }

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------

  function handleEdit(
    record: FormatRecord
  ) {
    setEditingId(record.id);

    setFormatName(
      record.format_name
    );

    setGross(
      record.gross_jmi !== null
        ? String(record.gross_jmi)
        : ""
    );

    setNet(
      record.net_jmi !== null
        ? String(record.net_jmi)
        : ""
    );

    setAdmissions(
      record.admissions !== null
        ? String(record.admissions)
        : ""
    );

    setStatusId(
      record.status_id !== null
        ? String(record.status_id)
        : "3"
    );

    setNotes(
      record.notes || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  async function handleDelete(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this format-wise record?"
      );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("movie_format_box_office")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Format-wise delete error:",
        error
      );

      alert(
        "Failed to delete record: " +
          error.message
      );

      return;
    }

    alert(
      "Format-wise record deleted successfully."
    );

    if (movieId) {
      await fetchFormatData(movieId);
    }

    if (editingId === id) {
      resetForm();
    }
  }

  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  function formatCollection(
    value: number | null
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    return `₹${new Intl.NumberFormat(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    ).format(value)}`;
  }

  function formatNumber(
    value: number | null
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-IN"
    ).format(value);
  }

  function getStatusName(
    statusId: number | null
  ) {
    if (statusId === null) {
      return "—";
    }

    const status = statuses.find(
      (item) =>
        item.id === statusId
    );

    return (
      status?.name ||
      "Unknown"
    );
  }

  // --------------------------------------------------
  // No movie selected
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
  // Totals
  // --------------------------------------------------

  const totalGross =
    records.reduce(
      (sum, record) =>
        sum +
        Number(
          record.gross_jmi || 0
        ),
      0
    );

  const totalNet =
    records.reduce(
      (sum, record) =>
        sum +
        Number(
          record.net_jmi || 0
        ),
      0
    );

  const totalAdmissions =
    records.reduce(
      (sum, record) =>
        sum +
        Number(
          record.admissions || 0
        ),
      0
    );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-yellow-400">
          Format-wise Collection
        </h1>

        <p className="mt-1 text-gray-400">
          Current cumulative theatrical performance by format
        </p>

      </div>

      {/* Add / Update Form */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

        <div className="mb-6">

          <h2 className="text-xl font-bold">
            {editingId
              ? "Update Format Collection"
              : "Add Format Collection"}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Enter the latest cumulative theatrical figures for the format.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Format */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Format
            </label>

            <select
              value={formatName}
              onChange={(e) =>
                setFormatName(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            >

              <option value="">
                Select Format
              </option>

              {formats.map(
                (format) => (

                  <option
                    key={format.id}
                    value={format.name}
                  >
                    {format.name}
                  </option>

                )
              )}

            </select>

          </div>

          {/* Gross */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Cumulative Gross
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={gross}
              onChange={(e) =>
                setGross(
                  e.target.value
                )
              }
              placeholder="Enter cumulative gross"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />

          </div>

          {/* Net */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Cumulative Net
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={net}
              onChange={(e) =>
                setNet(
                  e.target.value
                )
              }
              placeholder="Enter cumulative net"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />

          </div>

          {/* Footfalls */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Cumulative Footfalls
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={admissions}
              onChange={(e) =>
                setAdmissions(
                  e.target.value
                )
              }
              placeholder="Optional cumulative footfalls"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />

            <p className="mt-1 text-xs text-zinc-500">
              Optional — can be left blank.
            </p>

          </div>

          {/* Status */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Status
            </label>

            <select
              value={statusId}
              onChange={(e) =>
                setStatusId(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            >

              {statuses.length ===
              0 ? (

                <option value="">
                  Loading statuses...
                </option>

              ) : (

                statuses.map(
                  (status) => (

                    <option
                      key={status.id}
                      value={String(
                        status.id
                      )}
                    >
                      {status.name}
                    </option>

                  )
                )

              )}

            </select>

          </div>

          {/* Notes */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Notes
            </label>

            <input
              type="text"
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Optional notes"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />

          </div>

        </div>

        {/* Buttons */}

        <div className="mt-6 flex gap-3">

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Format Collection"
              : "Save Format Collection"}
          </button>

          {editingId && (

            <button
              onClick={resetForm}
              className="rounded-lg bg-zinc-800 px-6 py-3 text-white transition hover:bg-zinc-700"
            >
              Cancel Edit
            </button>

          )}

        </div>

      </div>

      {/* Overview */}

      <div className="mb-8">

        <h2 className="mb-4 text-xl font-bold">
          Format-wise Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Gross */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Total Format Gross
            </p>

            <h3 className="mt-2 text-2xl font-bold text-yellow-400">
              {formatCollection(
                totalGross
              )}
            </h3>

          </div>

          {/* Net */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Total Format Net
            </p>

            <h3 className="mt-2 text-2xl font-bold text-yellow-400">
              {formatCollection(
                totalNet
              )}
            </h3>

          </div>

          {/* Footfalls */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Total Format Footfalls
            </p>

            <h3 className="mt-2 text-2xl font-bold text-yellow-400">
              {formatNumber(
                totalAdmissions
              )}
            </h3>

          </div>

        </div>

      </div>

      {/* Current Records */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-800 p-6">

          <h2 className="text-xl font-bold">
            Current Format-wise Collection
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Latest cumulative theatrical performance by format
          </p>

        </div>

        {loading ? (

          <div className="p-8 text-center text-zinc-500">
            Loading format-wise data...
          </div>

        ) : records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No format-wise box-office data available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm">
                    Format
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Cumulative Gross
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Cumulative Net
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Cumulative Footfalls
                  </th>

                  <th className="px-5 py-4 text-center text-sm">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-sm">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {records.map(
                  (record) => (

                    <tr
                      key={record.id}
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >

                      <td className="px-5 py-4 font-medium">
                        {record.format_name}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatCollection(
                          record.gross_jmi
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatCollection(
                          record.net_jmi
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatNumber(
                          record.admissions
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">

                        <span className="inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs">
                          {getStatusName(
                            record.status_id
                          )}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() =>
                              handleEdit(
                                record
                              )
                            }
                            className="rounded bg-yellow-500 px-3 py-1 text-sm text-black hover:bg-yellow-400"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                record.id
                              )
                            }
                            className="rounded bg-red-700 px-3 py-1 text-sm text-white hover:bg-red-600"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* Information */}

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">

        <p className="text-sm text-zinc-400">

          <span className="font-semibold text-yellow-400">
            How this works:
          </span>{" "}
          Format-wise collection stores only the latest
          cumulative theatrical figure for each format.

        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Updating an existing format replaces its previous
          cumulative value. Historical format-wise records
          are not maintained.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Format-wise collection is completely independent
          and does not calculate or modify figures from any
          other box-office collection page.
        </p>

      </div>

    </div>
  );
}