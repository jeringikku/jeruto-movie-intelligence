"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CityRecord = {
  id: number;
  movie_id: number;
  city_name: string;
  gross_jmi: number | null;
  net_jmi: number | null;
  admissions: number | null;
  status_id: number | null;
  notes: string | null;
};

type City = {
  id: number;
  name: string;
};

type Status = {
  id: number;
  name: string;
};

export default function CityWisePage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam ? Number(movieIdParam) : null;

  const [records, setRecords] = useState<CityRecord[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [cityName, setCityName] = useState("");
  const [gross, setGross] = useState("");
  const [net, setNet] = useState("");
  const [admissions, setAdmissions] = useState("");
  const [statusId, setStatusId] = useState("3");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------

  useEffect(() => {
    if (!movieId) {
      setRecords([]);
      return;
    }

    fetchCityData(movieId);
    fetchCities();
    fetchStatuses();
  }, [movieId]);

  // --------------------------------------------------
  // Fetch current movie city records
  // --------------------------------------------------

  async function fetchCityData(currentMovieId: number) {
    setLoading(true);

    const { data, error } = await supabase
      .from("movie_city_box_office")
      .select(`
        id,
        movie_id,
        city_name,
        gross_jmi,
        net_jmi,
        admissions,
        status_id,
        notes
      `)
      .eq("movie_id", currentMovieId)
      .order("city_name", {
        ascending: true,
      });

    if (error) {
      console.error("City-wise fetch error:", error);

      alert(
        "Failed to load city-wise collection: " +
          error.message
      );

      setRecords([]);
      setLoading(false);
      return;
    }

    setRecords((data || []) as CityRecord[]);

    setLoading(false);
  }

  // --------------------------------------------------
  // Fetch city master list
  // --------------------------------------------------

  async function fetchCities() {
    const { data, error } = await supabase
      .from("cities")
      .select("id, name")
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error("Cities fetch error:", error);

      alert(
        "Failed to load cities: " +
          error.message
      );

      return;
    }

    setCities((data || []) as City[]);
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
      console.error("Status fetch error:", error);

      alert(
        "Failed to load box-office statuses: " +
          error.message
      );

      return;
    }

    setStatuses((data || []) as Status[]);
  }

  // --------------------------------------------------
  // Reset form
  // --------------------------------------------------

  function resetForm() {
    setCityName("");
    setGross("");
    setNet("");
    setAdmissions("");
    setStatusId("3");
    setNotes("");
    setEditingId(null);
  }

  // --------------------------------------------------
  // Save / Update city collection
  // --------------------------------------------------

  async function handleSave() {
    if (!movieId) {
      alert("No movie selected.");
      return;
    }

    if (!cityName) {
      alert("Please select a city.");
      return;
    }

    if (gross === "" || Number(gross) < 0) {
      alert("Please enter a valid gross collection.");
      return;
    }

    if (net === "" || Number(net) < 0) {
      alert("Please enter a valid net collection.");
      return;
    }

    if (admissions === "" || Number(admissions) < 0) {
      alert("Please enter valid footfalls.");
      return;
    }

    setSaving(true);

    const payload = {
      movie_id: movieId,
      city_name: cityName,
      gross_jmi: Number(gross),
      net_jmi: Number(net),
      admissions: Number(admissions),
      status_id: Number(statusId),
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("movie_city_box_office")
      .upsert(payload, {
        onConflict: "movie_id,city_name",
      });

    if (error) {
      console.error("City-wise save error:", error);

      alert(
        "Failed to save city-wise collection: " +
          error.message
      );

      setSaving(false);
      return;
    }

    alert(
      editingId
        ? "City-wise collection updated successfully! 🔥"
        : "City-wise collection saved successfully! 🔥"
    );

    resetForm();

    await fetchCityData(movieId);

    setSaving(false);
  }

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------

  function handleEdit(record: CityRecord) {
    setEditingId(record.id);

    setCityName(record.city_name);

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

    setNotes(record.notes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this city-wise record?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("movie_city_box_office")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("City-wise delete error:", error);

      alert(
        "Failed to delete record: " +
          error.message
      );

      return;
    }

    alert("City-wise record deleted successfully.");

    if (movieId) {
      await fetchCityData(movieId);
    }

    if (editingId === id) {
      resetForm();
    }
  }

  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  function formatCollection(value: number | null) {
    if (value === null || value === undefined) {
      return "—";
    }

    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value)}`;
  }

  function formatNumber(value: number | null) {
    if (value === null || value === undefined) {
      return "—";
    }

    return new Intl.NumberFormat("en-IN").format(value);
  }

  function getStatusName(statusId: number | null) {
    if (statusId === null) {
      return "—";
    }

    const status = statuses.find(
      (item) => item.id === statusId
    );

    return status?.name || "Unknown";
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

  const totalGross = records.reduce(
    (sum, record) =>
      sum + Number(record.gross_jmi || 0),
    0
  );

  const totalNet = records.reduce(
    (sum, record) =>
      sum + Number(record.net_jmi || 0),
    0
  );

  const totalAdmissions = records.reduce(
    (sum, record) =>
      sum + Number(record.admissions || 0),
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
          City-wise Collection
        </h1>

        <p className="mt-1 text-gray-400">
          Current cumulative theatrical performance by city
        </p>

      </div>

      {/* Add / Update Form */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

        <div className="mb-6">

          <h2 className="text-xl font-bold">
            {editingId
              ? "Update City Collection"
              : "Add City Collection"}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Enter the latest cumulative theatrical figures for the city.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* City */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              City
            </label>

            <select
              value={cityName}
              onChange={(e) =>
                setCityName(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            >

              <option value="">
                Select City
              </option>

              {cities.map((city) => (

                <option
                  key={city.id}
                  value={city.name}
                >
                  {city.name}
                </option>

              ))}

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
                setGross(e.target.value)
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
                setNet(e.target.value)
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
                setAdmissions(e.target.value)
              }
              placeholder="Enter cumulative footfalls"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />

          </div>

          {/* Status */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Status
            </label>

            <select
              value={statusId}
              onChange={(e) =>
                setStatusId(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            >

              {statuses.length === 0 ? (

                <option value="">
                  Loading statuses...
                </option>

              ) : (

                statuses.map((status) => (

                  <option
                    key={status.id}
                    value={String(status.id)}
                  >
                    {status.name}
                  </option>

                ))

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
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update City Collection"
              : "Save City Collection"}
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
          City-wise Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Gross */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Total City Gross
            </p>

            <h3 className="mt-2 text-2xl font-bold text-yellow-400">
              {formatCollection(totalGross)}
            </h3>

          </div>

          {/* Net */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Total City Net
            </p>

            <h3 className="mt-2 text-2xl font-bold text-yellow-400">
              {formatCollection(totalNet)}
            </h3>

          </div>

          {/* Footfalls */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Total City Footfalls
            </p>

            <h3 className="mt-2 text-2xl font-bold text-yellow-400">
              {formatNumber(totalAdmissions)}
            </h3>

          </div>

        </div>

      </div>

      {/* Current Records */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-800 p-6">

          <h2 className="text-xl font-bold">
            Current City-wise Collection
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Latest cumulative theatrical performance by city
          </p>

        </div>

        {loading ? (

          <div className="p-8 text-center text-zinc-500">
            Loading city-wise data...
          </div>

        ) : records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No city-wise box-office data available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm">
                    City
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

                {records.map((record) => (

                  <tr
                    key={record.id}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >

                    <td className="px-5 py-4 font-medium">
                      {record.city_name}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatCollection(record.gross_jmi)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatCollection(record.net_jmi)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatNumber(record.admissions)}
                    </td>

                    <td className="px-5 py-4 text-center">

                      <span className="inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs">
                        {getStatusName(record.status_id)}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            handleEdit(record)
                          }
                          className="rounded bg-yellow-500 px-3 py-1 text-sm text-black hover:bg-yellow-400"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(record.id)
                          }
                          className="rounded bg-red-700 px-3 py-1 text-sm text-white hover:bg-red-600"
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

      {/* Information */}

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">

        <p className="text-sm text-zinc-400">

          <span className="font-semibold text-yellow-400">
            How this works:
          </span>{" "}
          City-wise collection stores only the latest cumulative
          theatrical figure for each city.

        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Updating an existing city replaces its previous
          cumulative value. Historical city-wise records are
          not maintained.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          City-wise collection is maintained independently
          and does not calculate or modify figures from any
          other box-office collection page.
        </p>

      </div>

    </div>
  );
}