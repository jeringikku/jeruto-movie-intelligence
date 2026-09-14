"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Country = {
  id: number;
  name: string;
  iso_code: string | null;
};

type CountryRecord = {
  id: number;
  movie_id: number;
  country_id: number | string;
  currency_id: number | null;
  gross_local: number | string | null;
  gross_usd: number | string | null;
  status_id: number | string | null;
  notes: string | null;

  countries?:
    | {
        id: number;
        name: string;
        iso_code: string | null;
      }
    | {
        id: number;
        name: string;
        iso_code: string | null;
      }[]
    | null;
};

export default function OverseasCountryWisePage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam
    ? Number(movieIdParam)
    : null;

  const [countries, setCountries] = useState<Country[]>(
    []
  );

  const [records, setRecords] = useState<
    CountryRecord[]
  >([]);

  const [selectedCountry, setSelectedCountry] =
    useState("");

  const [grossLocal, setGrossLocal] =
    useState("");

  const [grossUsd, setGrossUsd] =
    useState("");

  const [statusId, setStatusId] =
    useState("3");

  const [notes, setNotes] =
    useState("");

  const [editingRecord, setEditingRecord] =
    useState<CountryRecord | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [totals, setTotals] = useState({
    usd: 0,
    localRecords: 0,
  });

  // --------------------------------------------------
  // LOAD COUNTRIES
  // --------------------------------------------------

  useEffect(() => {
    fetchCountries();
  }, []);

  // --------------------------------------------------
  // LOAD COUNTRY-WISE RECORDS
  // --------------------------------------------------

  useEffect(() => {
    if (movieId) {
      fetchCountryWiseRecords(movieId);
    } else {
      setRecords([]);

      setTotals({
        usd: 0,
        localRecords: 0,
      });
    }
  }, [movieId]);

  // --------------------------------------------------
  // FETCH COUNTRIES
  // --------------------------------------------------

  async function fetchCountries() {
    const { data, error } = await supabase
      .from("countries")
      .select("id, name, iso_code")
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(error);

      alert(
        "Failed to load countries: " +
          error.message
      );

      return;
    }

    // India is excluded because this is
    // specifically the Overseas page.
    const overseasCountries =
      (data || []).filter(
        (country) =>
          country.iso_code !== "IN"
      );

    setCountries(overseasCountries);
  }

  // --------------------------------------------------
  // FETCH RECORDS
  // --------------------------------------------------

  async function fetchCountryWiseRecords(
    currentMovieId: number
  ) {
    const { data, error } = await supabase
      .from("movie_country_box_office")
      .select(`
        id,
        movie_id,
        country_id,
        currency_id,
        gross_local,
        gross_usd,
        status_id,
        notes,
        countries (
          id,
          name,
          iso_code
        )
      `)
      .eq(
        "movie_id",
        currentMovieId
      )
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error(error);

      alert(
        "Failed to load country-wise overseas records: " +
          error.message
      );

      return;
    }

   const rows =
  (data || []) as unknown as CountryRecord[];

    setRecords(rows);

    const usdTotal =
      rows.reduce(
        (total, row) =>
          total +
          Number(
            row.gross_usd || 0
          ),
        0
      );

    const localCount =
      rows.filter(
        (row) =>
          row.gross_local !== null
      ).length;

    setTotals({
      usd: usdTotal,
      localRecords: localCount,
    });
  }

  // --------------------------------------------------
  // SAVE COUNTRY COLLECTION
  // --------------------------------------------------

  async function saveCountryCollection() {
    if (!movieId) {
      alert("No movie selected.");
      return;
    }

    if (!selectedCountry) {
      alert(
        "Please select a country."
      );
      return;
    }

    if (
      !grossLocal &&
      !grossUsd
    ) {
      alert(
        "Please enter Local Gross or USD Gross."
      );
      return;
    }

    setSaving(true);

    // Check whether this country already
    // has a record for this movie.

    const {
      data: existingRecord,
      error: existingError,
    } = await supabase
      .from("movie_country_box_office")
      .select("id")
      .eq(
        "movie_id",
        movieId
      )
      .eq(
        "country_id",
        Number(selectedCountry)
      )
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);

      alert(
        "Failed to check existing country record: " +
          existingError.message
      );

      setSaving(false);
      return;
    }

    const recordData = {
      movie_id: movieId,

      country_id:
        Number(selectedCountry),

      currency_id: null,

      gross_local:
        grossLocal === ""
          ? null
          : Number(grossLocal),

      gross_usd:
        grossUsd === ""
          ? null
          : Number(grossUsd),

      status_id:
        Number(statusId),

      notes:
        notes || null,
    };

    // --------------------------------------------------
    // UPDATE EXISTING
    // --------------------------------------------------

    if (existingRecord) {
      const { error } =
        await supabase
          .from(
            "movie_country_box_office"
          )
          .update(recordData)
          .eq(
            "id",
            existingRecord.id
          );

      if (error) {
        console.error(error);

        alert(
          "Failed to update country collection: " +
            error.message
        );

        setSaving(false);
        return;
      }

      alert(
        "Country collection updated successfully! 🌎🔥"
      );
    }

    // --------------------------------------------------
    // INSERT NEW
    // --------------------------------------------------

    else {
      const { error } =
        await supabase
          .from(
            "movie_country_box_office"
          )
          .insert(recordData);

      if (error) {
        console.error(error);

        alert(
          "Failed to save country collection: " +
            error.message
        );

        setSaving(false);
        return;
      }

      alert(
        "Country collection saved successfully! 🌎🔥"
      );
    }

    await fetchCountryWiseRecords(
      movieId
    );

    // Clear form

    setSelectedCountry("");
    setGrossLocal("");
    setGrossUsd("");
    setNotes("");

    setSaving(false);
  }

  // --------------------------------------------------
  // UPDATE RECORD
  // --------------------------------------------------

  async function updateCountryRecord() {
    if (!editingRecord) {
      return;
    }

    if (
      !editingRecord.country_id
    ) {
      alert(
        "Please select a country."
      );

      return;
    }

    if (
      editingRecord.gross_local ===
        "" &&
      editingRecord.gross_usd ===
        ""
    ) {
      alert(
        "Please enter Local Gross or USD Gross."
      );

      return;
    }

    const { error } =
      await supabase
        .from(
          "movie_country_box_office"
        )
        .update({
          country_id:
            Number(
              editingRecord.country_id
            ),

          currency_id:
            editingRecord.currency_id ??
            null,

          gross_local:
            editingRecord.gross_local ===
            ""
              ? null
              : Number(
                  editingRecord.gross_local
                ),

          gross_usd:
            editingRecord.gross_usd ===
            ""
              ? null
              : Number(
                  editingRecord.gross_usd
                ),

          status_id:
            editingRecord.status_id
              ? Number(
                  editingRecord.status_id
                )
              : null,

          notes:
            editingRecord.notes ||
            null,
        })
        .eq(
          "id",
          editingRecord.id
        );

    if (error) {
      console.error(error);

      alert(
        "Failed to update country record: " +
          error.message
      );

      return;
    }

    setEditingRecord(null);

    if (movieId) {
      await fetchCountryWiseRecords(
        movieId
      );
    }

    alert(
      "Country-wise collection updated successfully."
    );
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async function deleteCountryRecord(
    recordId: number
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this country-wise collection?"
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from(
          "movie_country_box_office"
        )
        .delete()
        .eq(
          "id",
          recordId
        );

    if (error) {
      console.error(error);

      alert(
        "Failed to delete country record: " +
          error.message
      );

      return;
    }

    if (movieId) {
      await fetchCountryWiseRecords(
        movieId
      );
    }

    alert(
      "Country-wise collection deleted successfully."
    );
  }

  // --------------------------------------------------
  // FORMATTING
  // --------------------------------------------------

  function formatUSD(
    value: number
  ) {
    if (!value) {
      return "—";
    }

    return `$${new Intl.NumberFormat(
      "en-US",
      {
        maximumFractionDigits: 2,
      }
    ).format(value)}`;
  }

  function formatLocal(
  value: number | string | null
) {
  const numericValue = Number(value || 0);

  if (!numericValue) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  ).format(numericValue);
}

  function getStatusName(
    id: number | null
  ) {
    switch (id) {
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
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black p-6 text-white">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-yellow-400">
          Country-wise Overseas Collection
        </h1>

        <p className="mt-1 text-gray-400">
          Detailed international theatrical performance by country
        </p>

      </div>

      {/* OVERVIEW */}

      <div className="mb-8">

        <h2 className="mb-4 text-xl font-bold">
          Country-wise Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* USD TOTAL */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Country-wise Overseas Gross
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              USD
            </p>

            <h3 className="mt-1 text-3xl font-bold text-yellow-400">
              {formatUSD(
                totals.usd
              )}
            </h3>

          </div>

          {/* COUNTRY COUNT */}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-400">
              Countries Reported
            </p>

            <h3 className="mt-3 text-3xl font-bold text-yellow-400">
              {records.length}
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              {totals.localRecords} with local-currency figures
            </p>

          </div>

        </div>

      </div>

      {/* ADD COLLECTION */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

        <div className="mb-6">

          <h2 className="text-xl font-bold text-yellow-400">
            Add Country-wise Collection
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Enter manually reported cumulative figures. No currency conversion is performed automatically.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* COUNTRY */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Country
            </label>

            <select
              value={
                selectedCountry
              }
              onChange={(e) =>
                setSelectedCountry(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            >

              <option value="">
                Select Country
              </option>

              {countries.map(
                (country) => (
                  <option
                    key={
                      country.id
                    }
                    value={
                      country.id
                    }
                  >
                    {country.name}
                    {country.iso_code
                      ? ` (${country.iso_code})`
                      : ""}
                  </option>
                )
              )}

            </select>

          </div>

          {/* LOCAL */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Local Gross
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter local-currency gross"
              value={
                grossLocal
              }
              onChange={(e) =>
                setGrossLocal(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* USD */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Gross (USD)
            </label>

            <input
              type="number"
              step="0.01"
              placeholder="Enter gross in USD"
              value={
                grossUsd
              }
              onChange={(e) =>
                setGrossUsd(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* STATUS */}

          <div>

            <label className="mb-2 block text-sm text-gray-400">
              Status
            </label>

            <select
              value={
                statusId
              }
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

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm text-gray-400">
              Notes
            </label>

            <input
              type="text"
              placeholder="Optional notes"
              value={
                notes
              }
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

        </div>

        <button
          onClick={
            saveCountryCollection
          }
          disabled={
            saving
          }
          className="mt-6 rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Country Collection"}
        </button>

      </div>

      {/* EDIT */}

      {editingRecord && (

        <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

          <h2 className="mb-6 text-xl font-bold text-yellow-400">
            Edit Country Collection
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* COUNTRY */}

            <div>

              <label className="mb-2 block text-sm text-gray-400">
                Country
              </label>

              <select
                value={
                  editingRecord.country_id ??
                  ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    country_id:
                      Number(
                        e.target.value
                      ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              >

                <option value="">
                  Select Country
                </option>

                {countries.map(
                  (country) => (
                    <option
                      key={
                        country.id
                      }
                      value={
                        country.id
                      }
                    >
                      {country.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* LOCAL */}

            <div>

              <label className="mb-2 block text-sm text-gray-400">
                Local Gross
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  editingRecord.gross_local ??
                  ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    gross_local:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* USD */}

            <div>

              <label className="mb-2 block text-sm text-gray-400">
                Gross (USD)
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  editingRecord.gross_usd ??
                  ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    gross_usd:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* STATUS */}

            <div>

              <label className="mb-2 block text-sm text-gray-400">
                Status
              </label>

              <select
                value={
                  editingRecord.status_id ??
                  3
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    status_id:
                      Number(
                        e.target.value
                      ),
                  })
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

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm text-gray-400">
                Notes
              </label>

              <input
                type="text"
                value={
                  editingRecord.notes ??
                  ""
                }
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    notes:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

          </div>

          <div className="mt-6 flex gap-3">

            <button
              onClick={
                updateCountryRecord
              }
              className="rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400"
            >
              Update Record
            </button>

            <button
              onClick={() =>
                setEditingRecord(
                  null
                )
              }
              className="rounded-lg bg-zinc-800 px-8 py-3 text-white hover:bg-zinc-700"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

      {/* RECORDS */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-800 p-6">

          <h2 className="text-xl font-bold">
            Country-wise Overseas Collection
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Latest cumulative collection by individual country
          </p>

        </div>

        {records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No country-wise overseas data available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm">
                    Country
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    Local Gross
                  </th>

                  <th className="px-5 py-4 text-right text-sm">
                    USD Gross
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

                {records.map(
                  (record) => (

                    <tr
                      key={
                        record.id
                      }
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >

                      {/* COUNTRY */}

                      <td className="px-5 py-4 font-medium">

{(
  Array.isArray(record.countries)
    ? record.countries[0]?.iso_code
    : record.countries?.iso_code
) && (
  <span className="ml-2 text-xs text-zinc-500">
    {Array.isArray(record.countries)
      ? record.countries[0]?.iso_code
      : record.countries?.iso_code}
  </span>
)}

                      </td>

                      {/* LOCAL */}

                      <td className="px-5 py-4 text-right">

                        {formatLocal(
                          record.gross_local
                        )}

                      </td>

                      {/* USD */}

                      <td className="px-5 py-4 text-right">

                        {formatUSD(
                          Number(
                            record.gross_usd ||
                              0
                          )
                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">

                         {getStatusName(
  record.status_id === null
    ? null
    : Number(record.status_id)
)}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              setEditingRecord(
                                {
                                  ...record,
                                }
                              )
                            }
                            className="rounded-lg bg-zinc-800 px-3 py-1 text-yellow-400 hover:bg-zinc-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteCountryRecord(
                                record.id
                              )
                            }
                            className="rounded-lg bg-red-900/40 px-3 py-1 text-red-400 hover:bg-red-900/60"
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

    </div>
  );
}