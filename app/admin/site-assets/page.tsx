"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SiteAsset = {
  id: number;
  asset_key: string;
  asset_name: string;
  asset_type: string;
  asset_url: string;
  target_page: string | null;
  alt_text: string | null;
  notes: string | null;
  is_active: boolean;
};

const emptyForm = {
  asset_key: "",
  asset_name: "",
  asset_type: "image",
  asset_url: "",
  target_page: "",
  alt_text: "",
  notes: "",
  is_active: true,
};

export default function SiteAssetsPage() {
  const [assets, setAssets] = useState<SiteAsset[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadAssets() {
    setLoading(true);

    const { data, error } = await supabase
      .from("jmi_site_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Site assets load error:", error);
      setAssets([]);
    } else {
      setAssets((data || []) as SiteAsset[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAssets();
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(asset: SiteAsset) {
    setEditingId(asset.id);

    setForm({
      asset_key: asset.asset_key,
      asset_name: asset.asset_name,
      asset_type: asset.asset_type,
      asset_url: asset.asset_url,
      target_page: asset.target_page || "",
      alt_text: asset.alt_text || "",
      notes: asset.notes || "",
      is_active: asset.is_active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (
      !form.asset_key.trim() ||
      !form.asset_name.trim() ||
      !form.asset_url.trim()
    ) {
      return;
    }

    setSaving(true);

    const payload = {
      asset_key: form.asset_key.trim(),
      asset_name: form.asset_name.trim(),
      asset_type: form.asset_type.trim() || "image",
      asset_url: form.asset_url.trim(),
      target_page: form.target_page.trim() || null,
      alt_text: form.alt_text.trim() || null,
      notes: form.notes.trim() || null,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingId !== null) {
      const { error } = await supabase
        .from("jmi_site_assets")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.error("Site asset update error:", error);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("jmi_site_assets")
        .insert(payload);

      if (error) {
        console.error("Site asset insert error:", error);
        setSaving(false);
        return;
      }
    }

    resetForm();
    await loadAssets();
    setSaving(false);
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Delete this site asset permanently?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("jmi_site_assets")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Site asset delete error:", error);
      return;
    }

    await loadAssets();
  }

  return (
    <main className="min-h-screen bg-black px-1 py-6 text-zinc-100 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-8xl">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-violet-400">
            JMI Administration
          </p>

          <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-xl font-semibold text-white sm:text-3xl">
                Site Assets
              </h1>

              <p className="mt-3 text-[11px] text-zinc-400">
                Manage images and visual assets used across the public JMI website.
              </p>
            </div>

            <div className="text-[9px] text-zinc-600">
              {assets.length} asset{assets.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* Form */}
        <section className="rounded-xxl border border-zinc-400 bg-zinc-950 p-2 sm:p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-zinc-200">
                {editingId !== null ? "Edit Asset" : "Add New Asset"}
              </h2>

              <p className="mt-1 text-[11px] text-zinc-400">
                Store reusable website images and asset URLs.
              </p>
            </div>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[9px] text-zinc-500 transition hover:text-zinc-300"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="grid gap-4 sm:grid-cols-2">

              {/* Asset Key */}
              <div>
                <label className="text-[13px] font-medium uppercase tracking-wider text-yellow-500">
                  Asset Key
                </label>

                <input
                  type="text"
                  value={form.asset_key}
                  onChange={(event) =>
                    updateField("asset_key", event.target.value)
                  }
                  placeholder="ticket_finder_poster"
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-black px-3 text-[15px] text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-400"
                />
              </div>

              {/* Asset Name */}
              <div>
                <label className="text-[13px] font-medium uppercase tracking-wider text-yellow-500">
                  Asset Name
                </label>

                <input
                  type="text"
                  value={form.asset_name}
                  onChange={(event) =>
                    updateField("asset_name", event.target.value)
                  }
                  placeholder="Ticket Finder Poster"
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-black px-3 text-[15px] text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
                />
              </div>

              {/* Asset Type */}
              <div>
                <label className="text-[13px] font-medium uppercase tracking-wider text-yellow-500">
                  Asset Type
                </label>

                <select
                  value={form.asset_type}
                  onChange={(event) =>
                    updateField("asset_type", event.target.value)
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-black px-3 text-[15px] text-zinc-300 outline-none focus:border-violet-400/60"
                >
                  <option value="image">Image</option>
                  <option value="poster">Poster</option>
                  <option value="banner">Banner</option>
                  <option value="background">Background</option>
                </select>
              </div>

              {/* Target Page */}
              <div>
                <label className="text-[13px] font-medium uppercase tracking-wider text-yellow-500">
                  Target Page
                </label>

                <input
                  type="text"
                  value={form.target_page}
                  onChange={(event) =>
                    updateField("target_page", event.target.value)
                  }
                  placeholder="/preview/book-tickets"
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-black px-3 text-[15px] text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
                />
              </div>

              {/* URL */}
              <div className="sm:col-span-2">
                <label className="text-[13px] font-medium uppercase tracking-wider text-yellow-500">
                  Image / Asset URL
                </label>

                <input
                  type="url"
                  value={form.asset_url}
                  onChange={(event) =>
                    updateField("asset_url", event.target.value)
                  }
                  placeholder="https://..."
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-black px-3 text-[15px] text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="text-[13px] font-medium uppercase tracking-wider text-yellow-500">
                  Alt Text
                </label>

                <input
                  type="text"
                  value={form.alt_text}
                  onChange={(event) =>
                    updateField("alt_text", event.target.value)
                  }
                  placeholder="JMI Ticket Finder"
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-black px-3 text-[15px] text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[13px] font-medium uppercase tracking-wider text-yellow-500">
                  Notes
                </label>

                <input
                  type="text"
                  value={form.notes}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  placeholder="Optional notes"
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-800 bg-black px-3 text-[15px] text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-400/60"
                />
              </div>
            </div>

            {/* Active */}
            <label className="mt-5 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateField("is_active", event.target.checked)
                }
                className="h-3.5 w-3.5 accent-violet-400"
              />

              <span className="text-[13px] text-zinc-400">
                Active asset
              </span>
            </label>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="h-9 rounded-lg bg-violet-400 px-5 text-[14px] font-semibold text-black transition hover:bg-violet-300 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Asset"
                    : "Add Asset"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-9 rounded-lg border border-zinc-800 px-5 text-[10px] text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Assets */}
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-sm font-medium text-zinc-200">
              Stored Assets
            </h2>
          </div>

          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-8 text-center text-[10px] text-zinc-600">
              Loading site assets...
            </div>
          ) : assets.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-10 text-center">
              <p className="text-[11px] text-zinc-500">
                No site assets added yet.
              </p>

              <p className="mt-1 text-[9px] text-zinc-700">
                Add your first website asset above.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <article
                  key={asset.id}
                  className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                >
                  <div className="flex h-44 items-center justify-center overflow-hidden border-b border-zinc-900 bg-black">
                    <img
                      src={asset.asset_url}
                      alt={asset.alt_text || asset.asset_name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-[11px] font-medium text-zinc-200">
                          {asset.asset_name}
                        </h3>

                        <p className="mt-1 truncate text-[8px] text-violet-400">
                          {asset.asset_key}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[7px] ${
                          asset.is_active
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-zinc-800 text-zinc-600"
                        }`}
                      >
                        {asset.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-[8px] text-zinc-600">
                      <p>Type: {asset.asset_type}</p>

                      {asset.target_page && (
                        <p className="truncate">
                          Page: {asset.target_page}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(asset)}
                        className="h-8 flex-1 rounded-lg border border-zinc-800 text-[9px] text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(asset.id)}
                        className="h-8 rounded-lg border border-red-950 px-4 text-[9px] text-red-500 transition hover:border-red-900 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
} 