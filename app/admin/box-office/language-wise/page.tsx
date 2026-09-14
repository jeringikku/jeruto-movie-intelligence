"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LanguageRecord = {
  id: number;
  movie_id: number;
  language_name: string;
  gross_jmi: number | null;
  net_jmi: number | null;
  admissions: number | null;
  status_id: number;
  notes: string | null;
};

type Status = {
  id: number;
  name: string;
};

export default function LanguageWisePage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam ? Number(movieIdParam) : null;

  const [records, setRecords] = useState<LanguageRecord[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const [languages, setLanguages] = useState<
  { id: number; name: string }[]
>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [languageName, setLanguageName] = useState("");
  const [gross, setGross] = useState("");
  const [net, setNet] = useState("");
  const [admissions, setAdmissions] = useState("");
  const [statusId, setStatusId] = useState("3");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (movieId) {
  fetchLanguageData(movieId);
  fetchStatuses();
  fetchLanguages();
}
    else {
      setRecords([]);
    }
  }, [movieId]);

  async function fetchLanguageData(currentMovieId: number) {
    setLoading(true);

    const { data, error } = await supabase
      .from("movie_language_box_office")
      .select(
        `
        id,
        movie_id,
        language_name,
        gross_jmi,
        net_jmi,
        admissions,
        status_id,
        notes
        `
      )
      .eq("movie_id", currentMovieId)
      .order("language_name", {
        ascending: true,
      });

    if (error) {
      console.error(error);

      alert(
        "Failed to load language-wise collection: " +
          error.message
      );

      setLoading(false);
      return;
    }

    setRecords((data || []) as LanguageRecord[]);

    setLoading(false);
  }

  async function fetchStatuses() {
  const { data, error } = await supabase
    .from("box_office_statuses")
    .select("id, name")
    .order("id", {
      ascending: true,
    });

  if (error) {
    console.error(
      "STATUS LOAD ERROR:",
      error
    );

    alert(
      "Failed to load box-office statuses: " +
        error.message
    );

    return;
  }

  console.log(
    "BOX OFFICE STATUSES:",
    data
  );

  setStatuses(
    (data || []) as Status[]
  );
}

function resetForm() {
  setLanguageName("");
  setGross("");
  setNet("");
  setAdmissions("");
  setStatusId("3");
  setNotes("");
  setEditingId(null);
}

  async function fetchLanguages() {
  const { data, error } = await supabase
    .from("languages")
    .select("id, name")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(error);

    alert(
      "Failed to load languages: " +
        error.message
    );

    return;
  }

  setLanguages(data || []);
}

  async function handleSave() {
    if (!movieId) {
      alert("No movie selected.");
      return;
    }

    if (!languageName.trim()) {
      alert("Please enter a language.");
      return;
    }

    if (!gross || Number(gross) < 0) {
      alert("Please enter a valid gross collection.");
      return;
    }

    if (!net || Number(net) < 0) {
      alert("Please enter a valid net collection.");
      return;
    }

    if (!admissions || Number(admissions) < 0) {
      alert("Please enter valid footfalls.");
      return;
    }

    setSaving(true);

    const cleanLanguage = languageName.trim();

    const payload = {
      movie_id: movieId,
      language_name: cleanLanguage,
      gross_jmi: Number(gross),
      net_jmi: Number(net),
      admissions: Number(admissions),
      status_id: Number(statusId),
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("movie_language_box_office")
      .upsert(payload, {
        onConflict: "movie_id,language_name",
      });

    if (error) {
      console.error(error);

      alert(
        "Failed to save language-wise collection: " +
          error.message
      );

      setSaving(false);
      return;
    }

    alert(
      editingId
        ? "Language-wise collection updated successfully."
        : "Language-wise collection saved successfully."
    );

    resetForm();

    await fetchLanguageData(movieId);

    setSaving(false);
  }

  function handleEdit(record: LanguageRecord) {
    setEditingId(record.id);

    setLanguageName(record.language_name);
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

    setStatusId(String(record.status_id));

    setNotes(record.notes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Are you sure you want to delete this language-wise record?"
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("movie_language_box_office")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);

      alert(
        "Failed to delete record: " +
          error.message
      );

      return;
    }

    if (movieId) {
      await fetchLanguageData(movieId);
    }

    if (editingId === id) {
      resetForm();
    }
  }

  function formatCollection(value: number | null) {
    if (!value) {
      return "—";
    }

    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value)}`;
  }

  function formatNumber(value: number | null) {
    if (!value) {
      return "—";
    }

    return new Intl.NumberFormat("en-IN").format(value);
  }

  function getStatusName(statusId: number) {
    const status = statuses.find(
      (item) => item.id === statusId
    );

    return status?.name || "Unknown";
  }

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

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-yellow-400">
          Language-wise Collection
        </h1>

        <p className="text-gray-400 mt-1">
          Current cumulative theatrical performance by language
        </p>
      </div>

      {/* Add / Update Form */}

      <div className="bg-zinc-950 border border-yellow-500/30 rounded-xl p-6 mb-8">

        <div className="mb-6">

          <h2 className="text-xl font-bold">
            {editingId
              ? "Update Language Collection"
              : "Add Language Collection"}
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Enter the latest cumulative theatrical figures.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Language */}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Language
            </label>

            <select
  value={languageName}
  onChange={(e) =>
    setLanguageName(e.target.value)
  }
  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
>
  <option value="">
    Select Language
  </option>

  {languages.map((language) => (
    <option
      key={language.id}
      value={language.name}
    >
      {language.name}
    </option>
  ))}
</select>

          </div>

          {/* Gross */}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Cumulative Gross
            </label>

            <input
              type="number"
              min="0"
              value={gross}
              onChange={(e) =>
                setGross(e.target.value)
              }
              placeholder="Enter cumulative gross"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
            />
          </div>

          {/* Net */}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Cumulative Net
            </label>

            <input
              type="number"
              min="0"
              value={net}
              onChange={(e) =>
                setNet(e.target.value)
              }
              placeholder="Enter cumulative net"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
            />
          </div>

          {/* Footfalls */}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Cumulative Footfalls
            </label>

            <input
              type="number"
              min="0"
              value={admissions}
              onChange={(e) =>
                setAdmissions(e.target.value)
              }
              placeholder="Enter cumulative footfalls"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
            />
          </div>

          {/* Status */}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Status
            </label>

           <select
  value={statusId}
  onChange={(e) =>
    setStatusId(e.target.value)
  }
  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
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
            <label className="block text-sm text-gray-400 mb-2">
              Notes
            </label>

            <input
              type="text"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Optional notes"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
            />
          </div>

        </div>

        {/* Buttons */}

        <div className="flex gap-3 mt-6">

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Language Collection"
              : "Save Language Collection"}
          </button>

          {editingId && (

            <button
              onClick={resetForm}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg transition"
            >
              Cancel Edit
            </button>

          )}

        </div>

      </div>

      {/* Overview */}

      <div className="mb-8">

        <h2 className="text-xl font-bold mb-4">
          Language-wise Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Total Language Gross
            </p>

            <h3 className="text-2xl font-bold mt-2 text-yellow-400">
              {formatCollection(totalGross)}
            </h3>

          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Total Language Net
            </p>

            <h3 className="text-2xl font-bold mt-2 text-yellow-400">
              {formatCollection(totalNet)}
            </h3>

          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Total Language Footfalls
            </p>

            <h3 className="text-2xl font-bold mt-2 text-yellow-400">
              {formatNumber(totalAdmissions)}
            </h3>

          </div>

        </div>

      </div>

      {/* Current Records */}

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl">

        <div className="p-6 border-b border-zinc-800">

          <h2 className="text-xl font-bold">
            Current Language-wise Collection
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Latest cumulative theatrical performance by language
          </p>

        </div>

        {loading ? (

          <div className="p-8 text-center text-zinc-500">
            Loading language-wise data...
          </div>

        ) : records.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No language-wise box-office data available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm">
                    Language
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
                      {record.language_name}
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

                      <span className="inline-block bg-zinc-800 px-3 py-1 rounded-full text-xs">
                        {getStatusName(
                          record.status_id
                        )}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            handleEdit(record)
                          }
                          className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(record.id)
                          }
                          className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
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

          <span className="text-yellow-400 font-semibold">
            How this works:
          </span>{" "}
          Language-wise collection stores only the latest
          cumulative theatrical figure for each language.

        </p>

        <p className="text-sm text-zinc-500 mt-2">
          Updating an existing language replaces its previous
          cumulative figure. Historical language-wise records
          are not maintained.

        </p>

      </div>

    </div>
  );
}