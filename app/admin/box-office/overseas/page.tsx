"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type OverseasRecord = {
  id: number;
  movie_id: number;
  gross_usd: number | null;
  gross_inr: number | null;
  gcc_gross_usd: number | null;
  north_america_gross_usd: number | null;
  status_id: number | null;
  notes: string | null;
};

export default function OverseasPage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam
    ? Number(movieIdParam)
    : null;

  const [record, setRecord] =
    useState<OverseasRecord | null>(null);

  const [countryWiseUsdTotal, setCountryWiseUsdTotal] =
    useState<number | null>(null);

  const [totalOverseasUsd, setTotalOverseasUsd] =
    useState<number | null>(null);

  const [grossUsd, setGrossUsd] = useState("");
  const [grossInr, setGrossInr] = useState("");

  // These old fields are kept temporarily
  // so existing database data is not disturbed.
  const [gccGrossUsd, setGccGrossUsd] = useState("");
  const [northAmericaGrossUsd, setNorthAmericaGrossUsd] =
    useState("");

  const [statusId, setStatusId] = useState("3");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    if (movieId) {
      fetchOverseasRecord(movieId);
      fetchCountryWiseUsdTotal(movieId);
    } else {
      setLoading(false);
      setCountryWiseUsdTotal(null);
      setTotalOverseasUsd(null);
    }
  }, [movieId]);

  // --------------------------------------------------
  // LOAD MAIN OVERSEAS RECORD
  // --------------------------------------------------

  async function fetchOverseasRecord(
    currentMovieId: number
  ) {
    setLoading(true);

    const { data, error } = await supabase
      .from("movie_overseas_box_office")
      .select(`
        id,
        movie_id,
        gross_usd,
        gross_inr,
        gcc_gross_usd,
        north_america_gross_usd,
        status_id,
        notes
      `)
      .eq("movie_id", currentMovieId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Overseas fetch error:",
        error
      );

      alert(
        "Failed to load overseas collection: " +
          error.message
      );

      setRecord(null);
    } else {
      setRecord(data);

      if (data) {
        setGrossUsd(
          data.gross_usd !== null
            ? String(data.gross_usd)
            : ""
        );

        setGrossInr(
          data.gross_inr !== null
            ? String(data.gross_inr)
            : ""
        );

        setGccGrossUsd(
          data.gcc_gross_usd !== null
            ? String(data.gcc_gross_usd)
            : ""
        );

        setNorthAmericaGrossUsd(
          data.north_america_gross_usd !== null
            ? String(data.north_america_gross_usd)
            : ""
        );

        setStatusId(
          String(data.status_id ?? 3)
        );

        setNotes(data.notes ?? "");
      }
    }

    setLoading(false);
  }

  // --------------------------------------------------
  // CALCULATE TOTAL FROM COUNTRY-WISE DATA
  // --------------------------------------------------

  async function fetchCountryWiseUsdTotal(
    currentMovieId: number
  ) {
    const { data, error } = await supabase
      .from("movie_country_box_office")
      .select("gross_usd")
      .eq("movie_id", currentMovieId);

    if (error) {
      console.error(
        "Country-wise overseas total fetch error:",
        error
      );

      setCountryWiseUsdTotal(null);
      setTotalOverseasUsd(null);

      return;
    }

    const rows = data || [];

    const hasUsdData = rows.some(
      (row) => row.gross_usd !== null
    );

    if (!hasUsdData) {
      setCountryWiseUsdTotal(null);
      setTotalOverseasUsd(null);

      return;
    }

    const total = rows.reduce(
      (sum, row) =>
        sum + Number(row.gross_usd || 0),
      0
    );

    setCountryWiseUsdTotal(total);

    // Main Overseas homepage total
    // comes directly from country-wise data.
    setTotalOverseasUsd(total);
  }

  // --------------------------------------------------
  // SAVE / UPDATE OVERSEAS RECORD
  // --------------------------------------------------

  async function saveOverseasCollection() {
    if (!movieId) {
      alert("No movie selected.");
      return;
    }

    if (
      !grossUsd &&
      !grossInr &&
      !gccGrossUsd &&
      !northAmericaGrossUsd
    ) {
      alert(
        "Please enter at least one overseas figure."
      );

      return;
    }

    setSaving(true);

    const recordData = {
      movie_id: movieId,

      gross_usd:
        grossUsd === ""
          ? null
          : Number(grossUsd),

      gross_inr:
        grossInr === ""
          ? null
          : Number(grossInr),

      // Kept temporarily for existing data.
      // These are NOT used for the main
      // Overseas total calculation.
      gcc_gross_usd:
        gccGrossUsd === ""
          ? null
          : Number(gccGrossUsd),

      north_america_gross_usd:
        northAmericaGrossUsd === ""
          ? null
          : Number(northAmericaGrossUsd),

      status_id: Number(statusId),

      notes: notes || null,
    };

    // --------------------------------------------------
    // UPDATE EXISTING RECORD
    // --------------------------------------------------

    if (record) {
      const { error } = await supabase
        .from("movie_overseas_box_office")
        .update(recordData)
        .eq("id", record.id);

      if (error) {
        console.error(
          "Overseas update error:",
          error
        );

        alert(
          "Failed to update overseas collection: " +
            error.message
        );

        setSaving(false);
        return;
      }

      alert(
        "Overseas collection updated successfully! 🌎🔥"
      );
    }

    // --------------------------------------------------
    // INSERT NEW RECORD
    // --------------------------------------------------

    else {
      const { data, error } = await supabase
        .from("movie_overseas_box_office")
        .insert(recordData)
        .select(`
          id,
          movie_id,
          gross_usd,
          gross_inr,
          gcc_gross_usd,
          north_america_gross_usd,
          status_id,
          notes
        `)
        .single();

      if (error) {
        console.error(
          "Overseas save error:",
          error
        );

        alert(
          "Failed to save overseas collection: " +
            error.message
        );

        setSaving(false);
        return;
      }

      setRecord(data);

      alert(
        "Overseas collection saved successfully! 🌎🔥"
      );
    }

    // Reload both the main record and
    // country-wise total.
    await fetchOverseasRecord(movieId);
    await fetchCountryWiseUsdTotal(movieId);

    setSaving(false);
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async function deleteOverseasRecord() {
    if (!record) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete the overseas collection record?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("movie_overseas_box_office")
      .delete()
      .eq("id", record.id);

    if (error) {
      console.error(
        "Overseas delete error:",
        error
      );

      alert(
        "Failed to delete overseas collection: " +
          error.message
      );

      return;
    }

    setRecord(null);

    setGrossUsd("");
    setGrossInr("");
    setGccGrossUsd("");
    setNorthAmericaGrossUsd("");
    setNotes("");

    // Recalculate homepage total
    if (movieId) {
      await fetchCountryWiseUsdTotal(movieId);
    }

    alert(
      "Overseas collection deleted successfully."
    );
  }

  // --------------------------------------------------
  // FORMATTING
  // --------------------------------------------------

  function formatUSD(value: number | null) {
    if (
      value === null ||
      value === undefined ||
      value === 0
    ) {
      return "—";
    }

    return `$${new Intl.NumberFormat(
      "en-US",
      {
        maximumFractionDigits: 2,
      }
    ).format(value)}`;
  }

  function formatINR(value: number | null) {
    if (
      value === null ||
      value === undefined ||
      value === 0
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

  function getStatusName(
    statusId: number | null
  ) {
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
            Please select a movie from the Box Office page first.
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
        Loading overseas collection...
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
          Overseas Box Office
        </h1>

        <p className="mt-1 text-gray-400">
          International theatrical performance
        </p>

      </div>

      {/* OVERVIEW */}

      <div className="mb-8">

        <h2 className="mb-4 text-xl font-bold">
          Overseas Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* TOTAL USD */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Total Overseas
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              USD
            </p>

            <h3 className="mt-1 text-3xl font-bold text-yellow-400">
              {formatUSD(
                totalOverseasUsd
              )}
            </h3>

          </div>

          {/* INR */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Total Overseas
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              INR Equivalent
            </p>

            <h3 className="mt-1 text-3xl font-bold text-yellow-400">
              {formatINR(
                record?.gross_inr ?? null
              )}
            </h3>

          </div>

          {/* GCC */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              GCC Aggregate
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              USD
            </p>

            <h3 className="mt-1 text-3xl font-bold text-yellow-400">
              {formatUSD(
                record?.gcc_gross_usd ?? null
              )}
            </h3>

          </div>

          {/* NORTH AMERICA */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              North America Aggregate
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              USD
            </p>

            <h3 className="mt-1 text-3xl font-bold text-yellow-400">
              {formatUSD(
                record?.north_america_gross_usd ?? null
              )}
            </h3>

          </div>

        </div>

      </div>

      {/* ADD / UPDATE */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

        <div className="mb-6">

          <h2 className="text-xl font-bold text-yellow-400">
            {record
              ? "Update Overseas Collection"
              : "Add Overseas Collection"}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Enter the manually reported cumulative overseas collection.
            Currency conversion is not performed automatically.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* USD */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Overseas Gross (USD)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter overseas gross in USD"
              value={grossUsd}
              onChange={(e) =>
                setGrossUsd(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* INR */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Overseas Gross (INR)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter overseas gross in INR"
              value={grossInr}
              onChange={(e) =>
                setGrossInr(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* GCC */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              GCC Gross (USD)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter cumulative GCC gross in USD"
              value={gccGrossUsd}
              onChange={(e) =>
                setGccGrossUsd(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

            <p className="mt-1 text-xs text-zinc-500">
              Use only when a combined GCC figure is available.
            </p>

          </div>

          {/* NORTH AMERICA */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              North America Gross (USD)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter cumulative North America gross in USD"
              value={northAmericaGrossUsd}
              onChange={(e) =>
                setNorthAmericaGrossUsd(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

            <p className="mt-1 text-xs text-zinc-500">
              Use only when a combined North America figure is available.
            </p>

          </div>

          {/* STATUS */}

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

          {/* NOTES */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Notes
            </label>

            <input
              type="text"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

        </div>

        <div className="mt-6 flex flex-wrap gap-3">

          <button
            onClick={
              saveOverseasCollection
            }
            disabled={saving}
            className="rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : record
              ? "Update Overseas Collection"
              : "Save Overseas Collection"}
          </button>

          {record && (
            <button
              onClick={
                deleteOverseasRecord
              }
              className="rounded-lg bg-red-900/50 px-8 py-3 text-red-200 hover:bg-red-800"
            >
              Delete
            </button>
          )}

        </div>

      </div>

      {/* FUTURE FEATURES */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

        <h2 className="text-xl font-bold">
          Overseas Breakdown
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Detailed international box-office analysis
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* COUNTRY-WISE */}

          <Link
            href={`/admin/box-office/overseas-country-wise?movieId=${movieId}`}
            className="rounded-lg border border-zinc-800 bg-black p-5 text-left transition hover:border-yellow-500/50 hover:bg-zinc-900"
          >

            <h3 className="font-bold text-yellow-400">
              Country-wise Collection
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Detailed collection by individual country.
            </p>

            <div className="mt-4 text-sm text-gray-500">
              Open →
            </div>

          </Link>

          {/* CONTINENTAL */}

          <Link
            href={`/admin/box-office/overseas-continental?movieId=${movieId}`}
            className="rounded-lg border border-zinc-800 bg-black p-5 text-left transition hover:border-yellow-500/50 hover:bg-zinc-900"
          >

            <h3 className="font-bold text-yellow-400">
              Continental Breakdown
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Europe, Asia, North America, Oceania and more.
            </p>

            <div className="mt-4 text-sm text-gray-500">
              Open →
            </div>

          </Link>

          {/* MAJOR TERRITORIES */}

          <a
            href={`/admin/box-office/overseas-territories?movieId=${movieId}`}
            className="block w-full rounded-lg border border-zinc-800 bg-black p-5 text-left transition hover:border-yellow-500/50 hover:bg-zinc-900 cursor-pointer"
          >

            <h3 className="font-bold text-yellow-400">
              Major Territories
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              GCC, North America, European Territories and other groups.
            </p>

            <div className="mt-4 text-sm text-gray-500">
              Open →
            </div>

          </a>

        </div>

      </div>

    </div>
  );
}