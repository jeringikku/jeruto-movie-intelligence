"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  movieId: number;
};

type MovieRecord = {
  id: number;
  movie_id: number;
  record_category: string;
  record_title: string;
  record_description: string | null;
  record_value: number | null;
  record_date: string | null;
  notes: string | null;
};

const emptyForm = {
  record_category: "",
  record_title: "",
  record_description: "",
  record_value: "",
  record_date: "",
  notes: "",
};

export default function RecordsTab({ movieId }: Props) {
  const [records, setRecords] = useState<MovieRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadRecords();
  }, [movieId]);

  async function loadRecords() {
    setLoading(true);

    const { data, error } = await supabase
      .from("movie_records")
      .select(`
        id,
        movie_id,
        record_category,
        record_title,
        record_description,
        record_value,
        record_date,
        notes
      `)
      .eq("movie_id", movieId)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setRecords((data || []) as MovieRecord[]);
    setLoading(false);
  }

  function handleChange(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSave() {
    if (!form.record_category.trim()) {
      alert("Please enter a record category.");
      return;
    }

    if (!form.record_title.trim()) {
      alert("Please enter a record title.");
      return;
    }

    setSaving(true);

    const payload = {
      record_category: form.record_category.trim(),
      record_title: form.record_title.trim(),
      record_description:
        form.record_description.trim() || null,
      record_value:
        form.record_value.trim() !== ""
          ? Number(form.record_value)
          : null,
      record_date:
        form.record_date || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (editingId !== null) {
      const result = await supabase
        .from("movie_records")
        .update(payload)
        .eq("id", editingId)
        .eq("movie_id", movieId);

      error = result.error;
    } else {
      const result = await supabase
        .from("movie_records")
        .insert({
          movie_id: movieId,
          ...payload,
        });

      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      editingId !== null
        ? "Record updated successfully!"
        : "Record added successfully!"
    );

    resetForm();
    loadRecords();
  }

  function handleEdit(record: MovieRecord) {
    setEditingId(record.id);

    setForm({
      record_category: record.record_category || "",
      record_title: record.record_title || "",
      record_description: record.record_description || "",
      record_value:
        record.record_value !== null
          ? String(record.record_value)
          : "",
      record_date: record.record_date || "",
      notes: record.notes || "",
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  async function handleDelete(record: MovieRecord) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${record.record_title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("movie_records")
      .delete()
      .eq("id", record.id)
      .eq("movie_id", movieId);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Record deleted successfully!");

    if (editingId === record.id) {
      resetForm();
    }

    loadRecords();
  }

  return (
    <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">
          Movie Records
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Manually maintain records achieved by this movie.
        </p>
      </div>

      {/* Existing Records */}
      <div className="mb-8">

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200">
            Existing Records
          </h3>

          <span className="text-xs text-zinc-600">
            {records.length} record
            {records.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="rounded-lg border border-zinc-800 bg-black p-6 text-center text-sm text-zinc-500">
            Loading records...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-700 bg-black p-8 text-center">
            <p className="text-sm text-zinc-400">
              No records added yet.
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Use the form below to add the first record.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-700">

            <table className="w-full min-w-[850px]">

              <thead className="bg-zinc-800">

                <tr>
                  <th className="p-4 text-left text-xs">
                    Category
                  </th>

                  <th className="p-4 text-left text-xs">
                    Record
                  </th>

                  <th className="p-4 text-left text-xs">
                    Value
                  </th>

                  <th className="p-4 text-left text-xs">
                    Date
                  </th>

                  <th className="p-4 text-left text-xs">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody>

                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-zinc-700"
                  >

                    <td className="p-4 text-sm text-zinc-300">
                      {record.record_category}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-white">
                        {record.record_title}
                      </p>

                      {record.record_description && (
                        <p className="mt-1 max-w-md text-xs text-zinc-500">
                          {record.record_description}
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-sm text-zinc-300">
                      {record.record_value !== null
                        ? record.record_value.toLocaleString("en-IN")
                        : "—"}
                    </td>

                    <td className="p-4 text-sm text-zinc-400">
                      {record.record_date || "—"}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">

                        <button
                          onClick={() => handleEdit(record)}
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(record)}
                          className="rounded bg-red-600 px-3 py-1 text-sm text-white"
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

      {/* Add / Edit Form */}
      <div className="border-t border-zinc-800 pt-8">

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-200">
            {editingId !== null
              ? "Edit Record"
              : "Add Record"}
          </h3>

          <p className="mt-1 text-xs text-zinc-600">
            Enter a manually verified record achieved by this movie.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Record Category
            </label>

            <input
              value={form.record_category}
              onChange={(e) =>
                handleChange(
                  "record_category",
                  e.target.value
                )
              }
              placeholder="e.g. Opening, Territory, Worldwide"
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Record Title
            </label>

            <input
              value={form.record_title}
              onChange={(e) =>
                handleChange(
                  "record_title",
                  e.target.value
                )
              }
              placeholder="e.g. Highest Opening Day in Kerala"
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Record Description
            </label>

            <textarea
              value={form.record_description}
              onChange={(e) =>
                handleChange(
                  "record_description",
                  e.target.value
                )
              }
              rows={3}
              placeholder="Briefly describe the record..."
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* Value */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Record Value
            </label>

            <input
              type="number"
              step="any"
              value={form.record_value}
              onChange={(e) =>
                handleChange(
                  "record_value",
                  e.target.value
                )
              }
              placeholder="Optional"
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            />

            <p className="mt-2 text-xs text-zinc-600">
              Optional numerical value associated with the record.
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Record Date
            </label>

            <input
              type="date"
              value={form.record_date}
              onChange={(e) =>
                handleChange(
                  "record_date",
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Notes
            </label>

            <textarea
              value={form.notes}
              onChange={(e) =>
                handleChange(
                  "notes",
                  e.target.value
                )
              }
              rows={3}
              placeholder="Optional additional information..."
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            />
          </div>

        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-3">

          {editingId !== null && (
            <button
              onClick={resetForm}
              disabled={saving}
              className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId !== null
              ? "Update Record"
              : "Add Record"}
          </button>

        </div>

      </div>

    </div>
  );
}