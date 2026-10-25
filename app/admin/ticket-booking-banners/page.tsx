"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type TicketBanner = {
  id: number;
  image_url: string;
  image_alt: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type BannerForm = {
  image_url: string;
  image_alt: string;
  display_order: string;
  is_active: boolean;
};

const EMPTY_FORM: BannerForm = {
  image_url: "",
  image_alt: "",
  display_order: "1",
  is_active: true,
};

export default function TicketBookingBannersAdminPage() {
  const [banners, setBanners] = useState<TicketBanner[]>([]);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("jmi_ticket_booking_banners")
      .select(
        "id, image_url, image_alt, display_order, is_active, created_at, updated_at"
      )
      .order("display_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Ticket booking banners load error:", error);

      setBanners([]);
      setErrorMessage(
        "Unable to load ticket booking banners. Check your database permissions and try again."
      );
    } else {
      setBanners((data ?? []) as TicketBanner[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  function updateField<K extends keyof BannerForm>(
    field: K,
    value: BannerForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  function resetForm() {
    setForm({
      ...EMPTY_FORM,
      display_order:
        String(
          Math.max(0, ...banners.map((banner) => banner.display_order)) + 1
        ),
    });

    setEditingId(null);
    clearMessages();
  }

  function startEditing(banner: TicketBanner) {
    setEditingId(banner.id);

    setForm({
      image_url: banner.image_url,
      image_alt: banner.image_alt ?? "",
      display_order: String(banner.display_order),
      is_active: banner.is_active,
    });

    clearMessages();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function validateForm(): boolean {
    const imageUrl = form.image_url.trim();
    const displayOrder = Number(form.display_order);

    if (!imageUrl) {
      setErrorMessage("Please enter a movie poster image URL.");
      return false;
    }

    try {
      const parsedUrl = new URL(imageUrl);

      if (
        parsedUrl.protocol !== "https:" &&
        parsedUrl.protocol !== "http:"
      ) {
        setErrorMessage(
          "Please enter a valid HTTP or HTTPS image URL."
        );
        return false;
      }
    } catch {
      setErrorMessage("Please enter a valid image URL.");
      return false;
    }

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 1
    ) {
      setErrorMessage(
        "Display order must be a positive whole number."
      );
      return false;
    }

    return true;
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    clearMessages();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    const wasEditing = editingId !== null;

    const payload = {
      image_url: form.image_url.trim(),
      image_alt: form.image_alt.trim() || null,
      display_order: Number(form.display_order),
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    const result =
      editingId !== null
        ? await supabase
            .from("jmi_ticket_booking_banners")
            .update(payload)
            .eq("id", editingId)
            .select("id")
        : await supabase
            .from("jmi_ticket_booking_banners")
            .insert(payload)
            .select("id");

    if (result.error) {
      console.error(
        "Ticket booking banner save error:",
        result.error
      );

      setErrorMessage(
        "Unable to save this poster. Check your database permissions and image details."
      );

      setSaving(false);
      return;
    }

    if (!result.data || result.data.length === 0) {
      setErrorMessage(
        "No poster was saved. Check whether your account has permission to modify this table."
      );

      setSaving(false);
      return;
    }

    setForm(EMPTY_FORM);
    setEditingId(null);

    setSuccessMessage(
      wasEditing
        ? "Movie poster updated successfully."
        : "Movie poster added to the ticket-counter TV successfully."
    );

    await loadBanners();
    setSaving(false);
  }

  async function toggleActive(banner: TicketBanner) {
    clearMessages();
    setActionId(banner.id);

    const { error } = await supabase
      .from("jmi_ticket_booking_banners")
      .update({
        is_active: !banner.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", banner.id);

    if (error) {
      console.error(
        "Ticket booking banner status error:",
        error
      );

      setErrorMessage(
        "Unable to change the poster status. Check the database permissions."
      );

      setActionId(null);
      return;
    }

    setSuccessMessage(
      banner.is_active
        ? "Poster disabled. It will no longer appear on the public TV."
        : "Poster enabled. It can now appear on the public TV."
    );

    await loadBanners();
    setActionId(null);
  }

  async function deleteBanner(banner: TicketBanner) {
    const confirmed = window.confirm(
      `Permanently delete this movie poster${
        banner.image_alt ? ` (${banner.image_alt})` : ""
      }? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    clearMessages();
    setActionId(banner.id);

    const { error } = await supabase
      .from("jmi_ticket_booking_banners")
      .delete()
      .eq("id", banner.id);

    if (error) {
      console.error(
        "Ticket booking banner deletion error:",
        error
      );

      setErrorMessage(
        "Unable to delete this poster. Check the database permissions."
      );

      setActionId(null);
      return;
    }

    if (editingId === banner.id) {
      setEditingId(null);
      setForm({
        ...EMPTY_FORM,
        display_order: String(
          Math.max(
            0,
            ...banners
              .filter((item) => item.id !== banner.id)
              .map((item) => item.display_order)
          ) + 1
        ),
      });
    }

    setSuccessMessage("Movie poster deleted successfully.");

    await loadBanners();
    setActionId(null);
  }

  const activeCount = banners.filter(
    (banner) => banner.is_active
  ).length;

  const inactiveCount = banners.length - activeCount;

  const filteredBanners = banners.filter((banner) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      (banner.image_alt ?? "").toLowerCase().includes(query) ||
      banner.image_url.toLowerCase().includes(query) ||
      String(banner.display_order).includes(query) ||
      String(banner.id).includes(query)
    );
  });

  return (
    <main className="min-h-screen w-full bg-black px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="w-full space-y-8">
        {/* PAGE HEADER */}

        <header>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-yellow-400">
            Jeruto Movie Intelligence
          </p>

          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            🎟️ Ticket Booking Banners
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Manage the movie posters displayed on Veronica&apos;s
            ticket-counter television. Only active posters are
            eligible to appear in the public slideshow.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
              {banners.length} total posters
            </span>

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
              {activeCount} active
            </span>

            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-500">
              {inactiveCount} disabled
            </span>
          </div>
        </header>

        {/* FEEDBACK */}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            <p className="font-semibold">
              Something went wrong
            </p>
            <p className="mt-1 break-words">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="mt-2 text-xs underline underline-offset-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
          >
            {successMessage}

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="ml-3 underline underline-offset-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ADD / EDIT FORM */}

        <section
          id="ticket-banner-form"
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6"
        >
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingId !== null
                  ? "Edit Movie Poster"
                  : "Add New Movie Poster"}
              </h2>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Enter a publicly accessible image URL. Changes
                here affect the ticket-counter TV banners, not the
                Library TV or other site banners.
              </p>
            </div>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="self-start rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
              >
                Cancel editing
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* IMAGE URL */}

            <div>
              <label
                htmlFor="ticket-banner-image-url"
                className="mb-2 block text-xs font-medium text-zinc-300"
              >
                Public Image URL{" "}
                <span className="text-red-400">*</span>
              </label>

              <input
                id="ticket-banner-image-url"
                type="url"
                required
                value={form.image_url}
                onChange={(event) =>
                  updateField("image_url", event.target.value)
                }
                placeholder="https://example.com/movie-poster.jpg"
                className="h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-yellow-500"
              />

              <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                Use a direct HTTP or HTTPS image URL that visitors
                can access without signing in. The image host must
                allow the image to be displayed on JMI.
              </p>
            </div>

            {/* DESCRIPTION AND ORDER */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ticket-banner-image-alt"
                  className="mb-2 block text-xs font-medium text-zinc-300"
                >
                  Movie Title / Image Description
                </label>

                <input
                  id="ticket-banner-image-alt"
                  type="text"
                  maxLength={200}
                  value={form.image_alt}
                  onChange={(event) =>
                    updateField("image_alt", event.target.value)
                  }
                  placeholder="Upcoming movie poster"
                  className="h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-yellow-500"
                />
              </div>

              <div>
                <label
                  htmlFor="ticket-banner-display-order"
                  className="mb-2 block text-xs font-medium text-zinc-300"
                >
                  Display Order{" "}
                  <span className="text-red-400">*</span>
                </label>

                <input
                  id="ticket-banner-display-order"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={form.display_order}
                  onChange={(event) =>
                    updateField(
                      "display_order",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-yellow-500"
                />

                <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                  Lower numbers appear first. Posters with the same
                  order are sorted by ID.
                </p>
              </div>
            </div>

            {/* ACTIVE STATUS */}

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-black/50 p-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateField("is_active", event.target.checked)
                }
                className="h-4 w-4 accent-emerald-500"
              />

              <span>
                <span className="block text-sm font-medium text-zinc-200">
                  Active poster
                </span>

                <span className="mt-1 block text-xs text-zinc-500">
                  {form.is_active
                    ? "This poster is eligible to appear in the public TV slideshow."
                    : "This poster remains saved but will be hidden from the public slideshow."}
                </span>
              </span>
            </label>

            {/* LIVE PREVIEW */}

            {form.image_url.trim() && (
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-400">
                  Live Image Preview
                </p>

                <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black p-2 sm:min-h-48">
                  <img
                    key={form.image_url}
                    src={form.image_url}
                    alt={
                      form.image_alt ||
                      "Ticket booking banner preview"
                    }
                    className="max-h-64 w-full rounded-lg object-contain"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.visibility = "visible";
                    }}
                  />
                </div>
              </div>
            )}

            {/* FORM ACTIONS */}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Add Movie Poster"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="min-h-11 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* POSTER LIBRARY */}

        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Current Ticket Booking Posters
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Posters are sorted by display order, then by ID.
                {` ${filteredBanners.length} shown.`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                clearMessages();
                void loadBanners();
              }}
              disabled={loading}
              className="self-start rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>

          {/* SEARCH */}

          <div className="mb-5 flex min-h-11 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-3">
            <span className="text-lg text-zinc-500" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by movie title, image URL, order or ID..."
              aria-label="Search ticket booking posters"
              className="min-h-11 w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="rounded-md px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* LOADING / EMPTY */}

          {loading ? (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
              <p className="text-sm text-zinc-500">
                Loading ticket booking posters...
              </p>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-12 text-center">
              <p className="text-3xl">🎟️</p>

              <p className="mt-4 text-sm font-medium text-zinc-300">
                {search
                  ? "No matching posters"
                  : "No ticket booking posters added yet"}
              </p>

              <p className="mt-2 text-xs text-zinc-600">
                {search
                  ? "Try another search term."
                  : "Add your first poster using the form above."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:text-white"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredBanners.map((banner) => {
                const isBusy = actionId === banner.id;

                return (
                  <article
                    key={banner.id}
                    className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                  >
                    {/* POSTER IMAGE */}

                    <div className="relative flex aspect-video items-center justify-center overflow-hidden border-b border-zinc-800 bg-black">
                      <img
                        src={banner.image_url}
                        alt={
                          banner.image_alt || "Ticket booking poster"
                        }
                        loading="lazy"
                        className="h-full w-full object-contain"
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden";
                        }}
                        onLoad={(event) => {
                          event.currentTarget.style.visibility = "visible";
                        }}
                      />

                      <span
                        className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          banner.is_active
                            ? "bg-emerald-500/90 text-black"
                            : "bg-zinc-800/95 text-zinc-300"
                        }`}
                      >
                        {banner.is_active ? "ACTIVE" : "DISABLED"}
                      </span>
                    </div>

                    {/* POSTER DETAILS */}

                    <div className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-semibold text-zinc-200">
                            {banner.image_alt ||
                              `Ticket Poster #${banner.id}`}
                          </h3>

                          <p className="mt-1 text-xs text-zinc-500">
                            Image ID: {banner.id}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-md border border-zinc-800 bg-black px-2 py-1 text-[10px] text-zinc-400">
                          Order {banner.display_order}
                        </span>
                      </div>

                      <p className="break-all text-[11px] leading-5 text-zinc-600">
                        {banner.image_url}
                      </p>

                      {/* ACTIONS */}

                      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 pt-4">
                        <button
                          type="button"
                          onClick={() => startEditing(banner)}
                          disabled={isBusy || saving}
                          className="min-h-9 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-yellow-500/60 hover:text-yellow-400 disabled:opacity-50"
                        >
                          ✎ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void toggleActive(banner)}
                          disabled={isBusy || saving}
                          className="min-h-9 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-violet-500/60 hover:text-violet-400 disabled:opacity-50"
                        >
                          {isBusy
                            ? "Please wait..."
                            : banner.is_active
                              ? "Disable"
                              : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteBanner(banner)}
                          disabled={isBusy || saving}
                          className="col-span-2 min-h-9 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:border-red-500/50 hover:bg-red-500/5 disabled:opacity-50"
                        >
                          {isBusy ? "Please wait..." : "Delete Poster"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* IMPLEMENTATION NOTES */}

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
            Ticket Booking TV Display Rules
          </p>

          <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-500">
            <li>
              • Only active posters are eligible for the public
              ticket-counter TV slideshow.
            </li>

            <li>
              • Posters are displayed in ascending display order.
              Equal orders are sorted by ID.
            </li>

            <li>
              • Disabling a poster preserves its database record.
            </li>

            <li>
              • These banners are managed separately from Library
              TV images and other JMI site banners.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}