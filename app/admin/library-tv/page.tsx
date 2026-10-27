"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type LibraryTvImage = {
id: number;
image_url: string;
image_alt: string | null;
language: string | null;
display_order: number;
is_active: boolean;
created_at: string;
updated_at: string;
};

type ImageForm = {
image_url: string;
image_alt: string;
language: string;
display_order: string;
is_active: boolean;
};

const LIBRARY_TV_LANGUAGES = [
"Assamese",
"Bengali",
"Chinese",
"English",
"Gujarati",
"Hindi",
"Kannada",
"Konkani",
"Korean",
"Malayalam",
"Marathi",
"Odia",
"Punjabi",
"Tamil",
"Telugu",
"Tulu",
];

const emptyForm: ImageForm = {
image_url: "",
image_alt: "",
language: "",
display_order: "1",
is_active: true,
};

export default function LibraryTvAdminPage() {
const [images, setImages] = useState<LibraryTvImage[]>([]);
const [form, setForm] = useState<ImageForm>(emptyForm);

const [editingId, setEditingId] = useState<number | null>(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [actionId, setActionId] = useState<number | null>(null);
const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState("");

const loadImages = useCallback(async () => {
setLoading(true);
setErrorMessage("");

const { data, error } = await supabase
  .from("jmi_library_tv_images")
  .select(
    "id, image_url, image_alt, language, display_order, is_active, created_at, updated_at"
  )
  .order("display_order", { ascending: true })
  .order("id", { ascending: true });

if (error) {
  console.error("Library TV images load error:", error);

  setImages([]);
  setErrorMessage(
    "Unable to load Library TV images. Check your database permissions and try again."
  );
} else {
  setImages((data ?? []) as LibraryTvImage[]);
}

setLoading(false);

}, []);

useEffect(() => {
void loadImages();
}, [loadImages]);

function updateField<K extends keyof ImageForm>(
field: K,
value: ImageForm[K]
) {
setForm((current) => ({
...current,
[field]: value,
}));
}

function resetForm() {
setForm({
...emptyForm,
display_order: String(
Math.max(0, ...images.map((image) => image.display_order)) + 1
),
});

setEditingId(null);

}

function startEditing(image: LibraryTvImage) {
setEditingId(image.id);

setForm({
  image_url: image.image_url,
  image_alt: image.image_alt ?? "",
  language: image.language ?? "",
  display_order: String(image.display_order),
  is_active: image.is_active,
});

setSuccessMessage("");
setErrorMessage("");

window.scrollTo({
  top: 0,
  behavior: "smooth",
});

}

function validateForm(): boolean {
const cleanUrl = form.image_url.trim();
const order = Number(form.display_order);

if (!cleanUrl) {
  setErrorMessage("Please enter an image URL.");
  return false;
}

try {
  const parsedUrl = new URL(cleanUrl);

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
  !LIBRARY_TV_LANGUAGES.includes(form.language)
) {
  setErrorMessage("Please select a valid image language.");
  return false;
}

if (!Number.isInteger(order) || order < 1) {
  setErrorMessage(
    "Display order must be a positive whole number."
  );
  return false;
}

return true;

}

async function handleSave(
event: React.FormEvent<HTMLFormElement>
) {
event.preventDefault();

setErrorMessage("");
setSuccessMessage("");

if (!validateForm()) {
  return;
}

setSaving(true);

const payload = {
  image_url: form.image_url.trim(),
  image_alt: form.image_alt.trim() || null,
  language: form.language,
  display_order: Number(form.display_order),
  is_active: form.is_active,
  updated_at: new Date().toISOString(),
};

if (editingId !== null) {
  const { error } = await supabase
    .from("jmi_library_tv_images")
    .update(payload)
    .eq("id", editingId);

  if (error) {
    console.error("Library TV image update error:", error);

    setErrorMessage(
      "Unable to update this image. Check the table permissions and image details."
    );

    setSaving(false);
    return;
  }

  setSuccessMessage(
    "Library TV image updated successfully."
  );
} else {
  const { error } = await supabase
    .from("jmi_library_tv_images")
    .insert(payload);

  if (error) {
    console.error("Library TV image insert error:", error);

    setErrorMessage(
      "Unable to add this image. Check the table permissions and image URL."
    );

    setSaving(false);
    return;
  }

  setSuccessMessage(
    "Image added to the Library TV successfully."
  );
}

setForm(emptyForm);
setEditingId(null);

await loadImages();
setSaving(false);

}

async function toggleActive(image: LibraryTvImage) {
setErrorMessage("");
setSuccessMessage("");
setActionId(image.id);

const { error } = await supabase
  .from("jmi_library_tv_images")
  .update({
    is_active: !image.is_active,
    updated_at: new Date().toISOString(),
  })
  .eq("id", image.id);

if (error) {
  console.error("Library TV image status error:", error);

  setErrorMessage(
    "Unable to change image status. Check the database permissions."
  );
} else {
  setSuccessMessage(
    image.is_active
      ? "Image disabled. It will no longer appear on the TV."
      : "Image enabled. It can now appear on the TV."
  );

  await loadImages();
}

setActionId(null);

}

async function deleteImage(id: number) {
const confirmed = window.confirm(
"Permanently delete this Library TV image? This action cannot be undone."
);

if (!confirmed) {
  return;
}

setErrorMessage("");
setSuccessMessage("");
setActionId(id);

const { error } = await supabase
  .from("jmi_library_tv_images")
  .delete()
  .eq("id", id);

if (error) {
  console.error("Library TV image deletion error:", error);

  setErrorMessage(
    "Unable to delete this image. Check the database permissions."
  );
} else {
  if (editingId === id) {
    resetForm();
  }

  setSuccessMessage(
    "Library TV image deleted successfully."
  );

  await loadImages();
}

setActionId(null);

}

const activeCount = images.filter(
(image) => image.is_active
).length;

return (
<main className="min-h-screen w-full bg-black px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
<div className="w-full space-y-8">
{/* PAGE HEADER */}

    <header>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-yellow-400">
        JMI Movie Library
      </p>

      <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
        📺 Library Television
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
        Manage the images displayed on the vintage wooden
        television inside the JMI Movie Library. Assign a
        language to each image so the appropriate images can
        appear on the matching language library page.
        Only active images are eligible to appear.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
          {images.length} total images
        </span>

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
          {activeCount} active
        </span>

        <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-500">
          {images.length - activeCount} disabled
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
      </div>
    )}

    {successMessage && (
      <div
        role="status"
        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
      >
        {successMessage}
      </div>
    )}

    {/* ADD / EDIT FORM */}

    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {editingId !== null
              ? "Edit TV Image"
              : "Add New TV Image"}
          </h2>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Enter a publicly accessible image URL and select
            the language library where it should appear.
          </p>
        </div>

        {editingId !== null && (
          <button
            type="button"
            onClick={resetForm}
            className="self-start rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-white"
          >
            Cancel editing
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* IMAGE URL */}

        <div>
          <label
            htmlFor="library-tv-image-url"
            className="mb-2 block text-xs font-medium text-zinc-300"
          >
            Public Image URL{" "}
            <span className="text-red-400">*</span>
          </label>

          <input
            id="library-tv-image-url"
            type="url"
            required
            value={form.image_url}
            onChange={(event) =>
              updateField("image_url", event.target.value)
            }
            placeholder="https://example.com/library-image.jpg"
            className="h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-yellow-500"
          />

          <p className="mt-2 text-[11px] leading-5 text-zinc-600">
            Use a direct image URL that visitors can access
            without signing in. The remote server must permit
            the image to be displayed on JMI.
          </p>
        </div>

        {/* LANGUAGE */}

        <div>
          <label
            htmlFor="library-tv-language"
            className="mb-2 block text-xs font-medium text-zinc-300"
          >
            Movie Language{" "}
            <span className="text-red-400">*</span>
          </label>

          <select
            id="library-tv-language"
            required
            value={form.language}
            onChange={(event) =>
              updateField("language", event.target.value)
            }
            className="h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-yellow-500"
          >
            <option value="">Select a language</option>

            {LIBRARY_TV_LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>

          <p className="mt-2 text-[11px] leading-5 text-zinc-600">
            This image will be eligible to appear only on the
            matching language's Movie Library television.
          </p>
        </div>

        {/* ALT TEXT, ORDER */}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="library-tv-image-alt"
              className="mb-2 block text-xs font-medium text-zinc-300"
            >
              Image Description
            </label>

            <input
              id="library-tv-image-alt"
              type="text"
              value={form.image_alt}
              onChange={(event) =>
                updateField("image_alt", event.target.value)
              }
              placeholder="JMI Library announcement"
              className="h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-yellow-500"
            />
          </div>

          <div>
            <label
              htmlFor="library-tv-display-order"
              className="mb-2 block text-xs font-medium text-zinc-300"
            >
              Display Order
            </label>

            <input
              id="library-tv-display-order"
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
          </div>
        </div>

        {/* ACTIVE */}

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
              Active image
            </span>

            <span className="mt-1 block text-xs text-zinc-500">
              Allow this image to appear on its assigned
              language's TV picture channel.
            </span>
          </span>
        </label>

        {/* LIVE PREVIEW */}

        {form.image_url.trim() && (
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Image Preview
            </p>

            <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black p-2 sm:min-h-48">
              <img
                src={form.image_url}
                alt={
                  form.image_alt ||
                  "Library TV image preview"
                }
                className="max-h-64 w-full rounded-lg object-contain"
                onError={(event) => {
                  event.currentTarget.style.visibility =
                    "hidden";
                }}
                onLoad={(event) => {
                  event.currentTarget.style.visibility =
                    "visible";
                }}
              />
            </div>
          </div>
        )}

        {/* SUBMIT */}

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
                : "Add TV Image"}
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

    {/* IMAGE LIST */}

    <section>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Current TV Images
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          Images are sorted by display order, then by their ID.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
          <p className="text-sm text-zinc-500">
            Loading Library TV images...
          </p>
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-12 text-center">
          <p className="text-3xl">📺</p>

          <p className="mt-4 text-sm font-medium text-zinc-300">
            No TV images added yet
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            Add your first public image URL using the form above.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {images.map((image) => {
            const isBusy = actionId === image.id;

            return (
              <article
                key={image.id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
              >
                {/* PREVIEW */}

                <div className="relative flex aspect-video items-center justify-center overflow-hidden border-b border-zinc-800 bg-black">
                  <img
                    src={image.image_url}
                    alt={
                      image.image_alt ||
                      "JMI Library TV image"
                    }
                    loading="lazy"
                    className="h-full w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.style.visibility =
                        "hidden";
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.visibility =
                        "visible";
                    }}
                  />

                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      image.is_active
                        ? "bg-emerald-500/90 text-black"
                        : "bg-zinc-800/95 text-zinc-300"
                    }`}
                  >
                    {image.is_active ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>

                {/* DETAILS */}

                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold text-zinc-200">
                        {image.image_alt ||
                          `TV Image #${image.id}`}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        Image ID: {image.id}
                      </p>

                      <p className="mt-2 inline-flex rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[10px] font-medium text-yellow-300">
                        Language:{" "}
                        {image.language || "Not assigned"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-md border border-zinc-800 bg-black px-2 py-1 text-[10px] text-zinc-400">
                      Order {image.display_order}
                    </span>
                  </div>

                  <p className="break-all text-[11px] leading-5 text-zinc-600">
                    {image.image_url}
                  </p>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                    <button
                      type="button"
                      onClick={() => startEditing(image)}
                      disabled={isBusy}
                      className="min-h-9 flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-yellow-500/60 hover:text-yellow-400 disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void toggleActive(image)}
                      disabled={isBusy}
                      className="min-h-9 flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-violet-500/60 hover:text-violet-400 disabled:opacity-50"
                    >
                      {isBusy
                        ? "Please wait..."
                        : image.is_active
                          ? "Disable"
                          : "Enable"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteImage(image.id)}
                      disabled={isBusy}
                      className="min-h-9 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:border-red-500/50 hover:bg-red-500/5 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>

    {/* IMPLEMENTATION NOTE */}

    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
        Library TV Display Rules
      </p>

      <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-500">
        <li>
          • Only active images assigned to the current
          language will appear on that language's TV picture
          channel once the TV filter is implemented.
        </li>

        <li>
          • Images will be displayed in ascending display
          order, then by ID.
        </li>

        <li>
          • Images without a language assignment must be
          assigned a language before they can appear on a
          language-specific TV.
        </li>

        <li>
          • Image changes here will not modify homepage
          banners or general Site Assets.
        </li>
      </ul>
    </section>
  </div>
</main>

);
}