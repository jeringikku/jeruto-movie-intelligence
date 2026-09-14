"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TradeRegion = {
  id: number;
  state_id: number;
  name: string;
  code: string | null;
  display_order: number | null;
};

type RegionRecord = {
  id: number;
  movie_id: number;
  trade_region_id: number;
  gross_jmi: number | null;
  notes: string | null;
};

export default function TradeRegionsPage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const stateIdParam = searchParams.get("stateId");

  const movieId = movieIdParam
    ? Number(movieIdParam)
    : null;

  const stateId = stateIdParam
    ? Number(stateIdParam)
    : null;

  const [regions, setRegions] = useState<TradeRegion[]>([]);
  const [records, setRecords] = useState<RegionRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [gross, setGross] = useState("");
  const [notes, setNotes] = useState("");

  // --------------------------------------------------
  // Fetch trade regions and existing movie records
  // --------------------------------------------------

  useEffect(() => {
    if (movieId && stateId) {
      fetchData();
    }
  }, [movieId, stateId]);

  async function fetchData() {
    if (!movieId || !stateId) {
      return;
    }

    setLoading(true);

    // Fetch regions belonging to this state
    const {
      data: regionData,
      error: regionError,
    } = await supabase
      .from("trade_regions")
      .select(
        `
        id,
        state_id,
        name,
        code,
        display_order
        `
      )
      .eq("state_id", stateId)
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      });

    if (regionError) {
      console.error(regionError);

      alert(
        "Failed to load trade regions: " +
          regionError.message
      );

      setLoading(false);
      return;
    }

    setRegions(
      (regionData || []) as TradeRegion[]
    );

    // Fetch existing gross records for this movie
    const {
      data: recordData,
      error: recordError,
    } = await supabase
      .from("movie_trade_region_box_office")
      .select(
        `
        id,
        movie_id,
        trade_region_id,
        gross_jmi,
        notes
        `
      )
      .eq("movie_id", movieId);

    if (recordError) {
      console.error(recordError);

      alert(
        "Failed to load regional collection: " +
          recordError.message
      );

      setLoading(false);
      return;
    }

    setRecords(
      (recordData || []) as RegionRecord[]
    );

    setLoading(false);
  }

  // --------------------------------------------------
  // Save
  // --------------------------------------------------

  async function handleSave(
    tradeRegionId: number
  ) {
    if (!movieId) {
      alert("No movie selected.");
      return;
    }

    if (!gross.trim()) {
      alert("Please enter a gross collection.");
      return;
    }

    if (Number(gross) < 0) {
      alert("Gross collection cannot be negative.");
      return;
    }

    setSaving(true);

    const payload = {
      movie_id: movieId,
      trade_region_id: tradeRegionId,
      gross_jmi: Number(gross),
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("movie_trade_region_box_office")
      .upsert(payload, {
        onConflict:
          "movie_id,trade_region_id",
      });

    if (error) {
      console.error(error);

      alert(
        "Failed to save regional gross: " +
          error.message
      );

      setSaving(false);
      return;
    }

    alert(
      "Trade region gross saved successfully! 🔥"
    );

    setGross("");
    setNotes("");
    setEditingId(null);

    await fetchData();

    setSaving(false);
  }

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------

  function handleEdit(record: RegionRecord) {
    setEditingId(record.trade_region_id);

    setGross(
      record.gross_jmi !== null
        ? String(record.gross_jmi)
        : ""
    );

    setNotes(record.notes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  async function handleDelete(
    recordId: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trade-region gross record?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("movie_trade_region_box_office")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error(error);

      alert(
        "Failed to delete regional record: " +
          error.message
      );

      return;
    }

    alert(
      "Trade-region record deleted successfully."
    );

    await fetchData();
  }

  // --------------------------------------------------
  // Get record for region
  // --------------------------------------------------

  function getRecord(
    regionId: number
  ) {
    return records.find(
      (record) =>
        record.trade_region_id === regionId
    );
  }

  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  function formatCollection(
    value: number | null
  ) {
    if (value === null) {
      return "—";
    }

    return `₹${new Intl.NumberFormat(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    ).format(value)}`;
  }

  // --------------------------------------------------
  // Invalid URL
  // --------------------------------------------------

  if (!movieId || !stateId) {
    return (
      <div className="min-h-screen bg-black text-white p-6">

        <div className="rounded-xl border border-yellow-500/30 bg-zinc-950 p-8 text-center">

          <h2 className="text-xl font-bold text-yellow-400">
            Invalid Selection
          </h2>

          <p className="mt-2 text-zinc-400">
            Please select a state from the State-wise
            Collection page.
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
          Loading territory breakdown...
        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-yellow-400">
          Advanced Territory Breakdown
        </h1>

        <p className="mt-1 text-gray-400">
          Detailed gross collection by trade region
        </p>

      </div>

      {/* Information */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-5">

        <p className="text-sm text-zinc-400">

          <span className="font-semibold text-yellow-400">
            Important:
          </span>{" "}
          Territory figures are maintained independently
          from State-wise Collection and are used only
          for deeper regional analysis.

        </p>

      </div>

      {/* No Regions */}

      {regions.length === 0 ? (

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">

          <p className="text-zinc-400">
            No active trade regions are configured
            for this state yet.
          </p>

        </div>

      ) : (

        <div className="rounded-xl border border-zinc-800 bg-zinc-950">

          {/* Table Header */}

          <div className="border-b border-zinc-800 p-6">

            <h2 className="text-xl font-bold">
              Territory Gross Collection
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Enter figures only when detailed regional
              data is available.
            </p>

          </div>

          {/* Table */}

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Territory
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Code
                  </th>

                  <th className="px-5 py-4 text-right text-sm text-zinc-400">
                    Gross
                  </th>

                  <th className="px-5 py-4 text-center text-sm text-zinc-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {regions.map((region) => {

                  const record =
                    getRecord(region.id);

                  return (

                    <tr
                      key={region.id}
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >

                      {/* Territory */}

                      <td className="px-5 py-4">

                        <div className="font-medium">
                          {region.name}
                        </div>

                      </td>

                      {/* Code */}

                      <td className="px-5 py-4 text-zinc-500">
                        {region.code || "—"}
                      </td>

                      {/* Gross */}

                      <td className="px-5 py-4 text-right font-medium text-yellow-400">

                        {formatCollection(
                          record?.gross_jmi ?? null
                        )}

                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() => {

                              if (record) {
                                handleEdit(record);
                              } else {
                                setEditingId(
                                  region.id
                                );

                                setGross("");
                                setNotes("");

                                window.scrollTo({
                                  top: 0,
                                  behavior: "smooth",
                                });
                              }

                            }}
                            className="rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-black hover:bg-yellow-400"
                          >
                            {record
                              ? "Edit"
                              : "Add"}
                          </button>

                          {record && (

                            <button
                              onClick={() =>
                                handleDelete(
                                  record.id
                                )
                              }
                              className="rounded-lg bg-red-900/60 px-3 py-2 text-xs text-red-200 hover:bg-red-800"
                            >
                              Delete
                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* Entry Form */}

      {editingId !== null && (

        <div className="mt-8 rounded-xl border border-yellow-500/30 bg-black p-6">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-yellow-400">
              {getRecord(editingId)
                ? "Update Territory Gross"
                : "Add Territory Gross"}
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              {regions.find(
                (region) =>
                  region.id === editingId
              )?.name || "Territory"}
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Gross */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Cumulative Gross (₹)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={gross}
                onChange={(e) =>
                  setGross(e.target.value)
                }
                placeholder="Enter gross collection"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />

            </div>

            {/* Notes */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Notes
              </label>

              <input
                type="text"
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="Optional notes"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />

            </div>

          </div>

          {/* Buttons */}

          <div className="mt-6 flex gap-3">

            <button
              onClick={() =>
                handleSave(editingId)
              }
              disabled={saving}
              className="rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : getRecord(editingId)
                ? "Update Gross"
                : "Save Gross"}
            </button>

            <button
              onClick={() => {
                setEditingId(null);
                setGross("");
                setNotes("");
              }}
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