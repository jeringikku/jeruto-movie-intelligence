"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { supabase } from "@/lib/supabase";

export default function MovieForm() {
const [title, setTitle] = useState("");
const [originalTitle, setOriginalTitle] = useState("");
const [releaseYear, setReleaseYear] = useState("");
const [runtime, setRuntime] = useState("");

const [loading, setLoading] = useState(false);

const router = useRouter();

const handleSaveMovie = async () => {
  if (!title.trim()) {
    alert("Movie Title is required.");
    return;
  }

  setLoading(true);

  const slug = slugify(title, {
    lower: true,
    strict: true,
  });

  const { error } = await supabase
    .from("movies")
    .insert({
      title,
      original_title: originalTitle || null,
      slug,
      release_year: releaseYear ? Number(releaseYear) : null,
      runtime_minutes: runtime ? Number(runtime) : null,
    });

  setLoading(false);

  if (error) {
  console.error(error);
  alert(error.message);
  return;
  }

  alert("🎉 Movie saved successfully!");
  };

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">
        Add New Movie
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Movie Title *
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Original Title
          </label>

          <input
            type="text"
            value={originalTitle}
            onChange={(e) => setOriginalTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Release Year
          </label>

          <input
            type="number"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Runtime (minutes)
          </label>

          <input
            type="number"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
  onClick={handleSaveMovie}
  disabled={loading}
  className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Saving..." : "Save Movie"}
</button>
      </div>
    </div>
  );
}