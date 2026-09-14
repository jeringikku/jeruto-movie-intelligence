"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Poster = {
  id: number;
  poster_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function HomepagePostersPage() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  const [posterUrl, setPosterUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("1");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState("");
  const [editingOrder, setEditingOrder] = useState("1");

  const [saving, setSaving] = useState(false);

  // ============================================================
  // LOAD BANNERS
  // ============================================================

  useEffect(() => {
    loadPosters();
  }, []);

  async function loadPosters() {
    setLoading(true);

    const { data, error } = await supabase
      .from("jmi_homepage_posters")
      .select(`
        id,
        poster_url,
        sort_order,
        is_active,
        created_at,
        updated_at
      `)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Homepage banners error:", error);
      alert("Unable to load homepage banners.");
    } else {
      setPosters(data ?? []);
    }

    setLoading(false);
  }

  // ============================================================
  // ADD BANNER
  // ============================================================

  async function addPoster() {
    const cleanUrl = posterUrl.trim();
    const order = Number(sortOrder);

    if (!cleanUrl) {
      alert("Please enter a banner URL.");
      return;
    }

    if (!Number.isFinite(order) || order < 1) {
      alert("Please enter a valid display order.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("jmi_homepage_posters")
      .insert({
        poster_url: cleanUrl,
        sort_order: order,
        is_active: true,
      });

    if (error) {
      console.error("Add banner error:", error);
      alert("Unable to add banner.");
    } else {
      setPosterUrl("");

      const nextOrder =
        Math.max(
          0,
          ...posters.map((poster) => poster.sort_order)
        ) + 1;

      setSortOrder(String(nextOrder));

      await loadPosters();
    }

    setSaving(false);
  }

  // ============================================================
  // START EDITING
  // ============================================================

  function startEditing(poster: Poster) {
    setEditingId(poster.id);
    setEditingUrl(poster.poster_url);
    setEditingOrder(String(poster.sort_order));
  }

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  function cancelEditing() {
    setEditingId(null);
    setEditingUrl("");
    setEditingOrder("1");
  }

  // ============================================================
  // SAVE EDIT
  // ============================================================

  async function saveEdit(id: number) {
    const cleanUrl = editingUrl.trim();
    const order = Number(editingOrder);

    if (!cleanUrl) {
      alert("Banner URL cannot be empty.");
      return;
    }

    if (!Number.isFinite(order) || order < 1) {
      alert("Please enter a valid display order.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("jmi_homepage_posters")
      .update({
        poster_url: cleanUrl,
        sort_order: order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Update banner error:", error);
      alert("Unable to update banner.");
    } else {
      cancelEditing();
      await loadPosters();
    }

    setSaving(false);
  }

  // ============================================================
  // TOGGLE ACTIVE
  // ============================================================

  async function toggleActive(poster: Poster) {
    const { error } = await supabase
      .from("jmi_homepage_posters")
      .update({
        is_active: !poster.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", poster.id);

    if (error) {
      console.error("Toggle banner error:", error);
      alert("Unable to change banner status.");
    } else {
      await loadPosters();
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  async function deletePoster(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this banner?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("jmi_homepage_posters")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete banner error:", error);
      alert("Unable to delete banner.");
    } else {
      await loadPosters();
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-zinc-500">
          Loading homepage banners...
        </p>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-8">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-yellow-400">
          JMI Homepage
        </p>

        <h1 className="mt-2 text-2xl font-bold text-white">
          Featured Banners
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Manage the promotional banners displayed on the public
          JMI homepage. Banners are manually selected and
          controlled from this section.
        </p>
      </div>


      {/* ======================================================
          ADD NEW BANNER
      ====================================================== */}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Add New Banner
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Add a wide homepage banner using its public image URL.
            Recommended ratio: 16:7.
          </p>
        </div>


        <div className="grid gap-4 md:grid-cols-[1fr_120px_auto]">

          {/* Banner URL */}

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Banner URL
            </label>

            <input
              type="url"
              value={posterUrl}
              onChange={(event) =>
                setPosterUrl(event.target.value)
              }
              placeholder="https://example.com/banner.jpg"
              className="
                h-10
                w-full
                rounded-lg
                border
                border-zinc-700
                bg-black
                px-3
                text-sm
                text-white
                outline-none
                placeholder:text-zinc-700
                focus:border-yellow-500
              "
            />
          </div>


          {/* Display Order */}

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Display Order
            </label>

            <input
              type="number"
              min="1"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value)
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-zinc-700
                bg-black
                px-3
                text-sm
                text-white
                outline-none
                focus:border-yellow-500
              "
            />
          </div>


          {/* Add Button */}

          <div className="flex items-end">

            <button
              type="button"
              onClick={addPoster}
              disabled={saving}
              className="
                h-10
                w-full
                rounded-lg
                bg-yellow-500
                px-5
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-yellow-400
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving ? "Saving..." : "Add Banner"}
            </button>

          </div>

        </div>

      </section>


      {/* ======================================================
          CURRENT BANNERS
      ====================================================== */}

      <section>

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-white">
              Current Banners
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              {posters.length}{" "}
              {posters.length === 1
                ? "banner"
                : "banners"}{" "}
              configured
            </p>

          </div>

        </div>


        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {posters.length === 0 ? (

          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center">

            <p className="text-sm text-zinc-500">
              No homepage banners have been added yet.
            </p>

            <p className="mt-1 text-xs text-zinc-700">
              Add your first banner above.
            </p>

          </div>

        ) : (

          /* ==================================================
             BANNER LIST
          ================================================== */

          <div className="space-y-4">

            {posters.map((poster) => {

              const isEditing =
                editingId === poster.id;

              return (
                <div
                  key={poster.id}
                  className="
                    rounded-xl
                    border
                    border-zinc-800
                    bg-zinc-900
                    p-4
                  "
                >

                  {isEditing ? (

                    /* =================================================
                       EDIT MODE
                    ================================================= */

                    <div className="space-y-5">

                      {/* Banner Preview */}

                      <div>

                        <p className="mb-2 text-xs font-medium text-zinc-400">
                          Banner Preview
                        </p>

                        <div
                          className="
                            aspect-[16/7]
                            w-full
                            max-w-[620px]
                            overflow-hidden
                            rounded-lg
                            border
                            border-zinc-800
                            bg-black
                          "
                        >

                          <img
                            src={editingUrl}
                            alt="Banner preview"
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />

                        </div>

                      </div>


                      {/* Editing Fields */}

                      <div className="grid gap-4 lg:grid-cols-[1fr_120px_auto]">

                        {/* URL */}

                        <div>

                          <label className="mb-2 block text-xs font-medium text-zinc-400">
                            Banner URL
                          </label>

                          <input
                            type="url"
                            value={editingUrl}
                            onChange={(event) =>
                              setEditingUrl(
                                event.target.value
                              )
                            }
                            className="
                              h-10
                              w-full
                              rounded-lg
                              border
                              border-zinc-700
                              bg-black
                              px-3
                              text-sm
                              text-white
                              outline-none
                              focus:border-yellow-500
                            "
                          />

                        </div>


                        {/* Order */}

                        <div>

                          <label className="mb-2 block text-xs font-medium text-zinc-400">
                            Display Order
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={editingOrder}
                            onChange={(event) =>
                              setEditingOrder(
                                event.target.value
                              )
                            }
                            className="
                              h-10
                              w-full
                              rounded-lg
                              border
                              border-zinc-700
                              bg-black
                              px-3
                              text-sm
                              text-white
                              outline-none
                              focus:border-yellow-500
                            "
                          />

                        </div>


                        {/* Actions */}

                        <div className="flex items-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              saveEdit(poster.id)
                            }
                            disabled={saving}
                            className="
                              h-10
                              rounded-lg
                              bg-yellow-500
                              px-4
                              text-xs
                              font-semibold
                              text-black
                              hover:bg-yellow-400
                              disabled:opacity-50
                            "
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="
                              h-10
                              rounded-lg
                              border
                              border-zinc-700
                              px-4
                              text-xs
                              text-zinc-400
                              hover:bg-zinc-800
                              hover:text-white
                            "
                          >
                            Cancel
                          </button>

                        </div>

                      </div>

                    </div>

                  ) : (

                    /* =================================================
                       NORMAL MODE
                    ================================================= */

                    <div className="space-y-4">

                      {/* Banner Preview */}

                      <div
                        className="
                          aspect-[16/7]
                          w-full
                          max-w-[620px]
                          overflow-hidden
                          rounded-lg
                          border
                          border-zinc-800
                          bg-black
                        "
                      >

                        <img
                          src={poster.poster_url}
                          alt="JMI homepage banner"
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                      </div>


                      {/* Banner Information */}

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                        {/* Information */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span
                              className="
                                rounded-full
                                bg-zinc-800
                                px-2.5
                                py-1
                                text-[10px]
                                font-medium
                                text-zinc-400
                              "
                            >
                              Order {poster.sort_order}
                            </span>


                            {poster.is_active ? (

                              <span
                                className="
                                  rounded-full
                                  bg-green-500/10
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-medium
                                  text-green-400
                                "
                              >
                                Active
                              </span>

                            ) : (

                              <span
                                className="
                                  rounded-full
                                  bg-zinc-800
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-medium
                                  text-zinc-600
                                "
                              >
                                Hidden
                              </span>

                            )}

                          </div>


                          <p
                            className="
                              mt-3
                              break-all
                              text-xs
                              text-zinc-500
                            "
                          >
                            {poster.poster_url}
                          </p>

                        </div>


                        {/* Actions */}

                        <div
                          className="
                            flex
                            flex-wrap
                            gap-2
                            lg:justify-end
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              startEditing(poster)
                            }
                            className="
                              rounded-lg
                              border
                              border-zinc-700
                              px-3
                              py-2
                              text-xs
                              text-zinc-400
                              transition
                              hover:border-yellow-500
                              hover:text-yellow-400
                            "
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              toggleActive(poster)
                            }
                            className="
                              rounded-lg
                              border
                              border-zinc-700
                              px-3
                              py-2
                              text-xs
                              text-zinc-400
                              transition
                              hover:border-violet-500
                              hover:text-violet-400
                            "
                          >
                            {poster.is_active
                              ? "Disable"
                              : "Enable"}
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              deletePoster(poster.id)
                            }
                            className="
                              rounded-lg
                              border
                              border-red-500/20
                              px-3
                              py-2
                              text-xs
                              text-red-400
                              transition
                              hover:border-red-500/40
                              hover:bg-red-500/5
                            "
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  )}

                </div>
              );
            })}

          </div>

        )}

      </section>


      {/* ======================================================
          DATA NOTE
      ====================================================== */}

      <section
        className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-950
          p-5
        "
      >

        <p
          className="
            text-xs
            font-medium
            uppercase
            tracking-[0.18em]
            text-yellow-400
          "
        >
          Homepage Content Note
        </p>

        <p className="mt-2 text-xs leading-5 text-zinc-600">
          These banners are independently managed homepage content.
          They are not automatically linked to the JMI movie
          database. Only banners marked as Active will be displayed
          on the public JMI homepage, according to their display
          order.
        </p>

        <p className="mt-2 text-[11px] text-zinc-700">
          Recommended image ratio: 16:7
        </p>

      </section>

    </div>
  );
}