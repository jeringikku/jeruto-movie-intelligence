"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

import AddGenreModal from "@/components/genres/AddGenreModal";
import EditGenreModal from "@/components/genres/EditGenreModal";

type Genre = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  is_active: boolean | null;
};

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingGenre, setEditingGenre] =
    useState<Genre | null>(null);

  useEffect(() => {
    loadGenres();
  }, []);

  async function loadGenres() {
    const { data, error } = await supabase
      .from("genres")
      .select("id,name,slug,description,is_active")
      .order("name");

    if (!error && data) {
      setGenres(data);
    }
  }

async function deleteGenre(id: number) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this genre?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("genres")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadGenres();
}

  return (
    <div className="p-8">

      <div className="mb-8 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Genres
        </h1>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
        >
          + Add Genre
        </button>

      </div>

      <div className="relative mb-6 max-w-md">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search genres..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-4 text-white"
        />

      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-700">

        <table className="w-full">

          <thead className="bg-zinc-800">

            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Genre</th>
              <th className="p-4 text-left">Slug</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>

          </thead>

          <tbody>

            {genres
              .filter((genre) =>
                genre.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((genre) => (

                <tr
                  key={genre.id}
                  className="border-t border-zinc-700"
                >

                  <td className="p-4">{genre.id}</td>

                  <td className="p-4">{genre.name}</td>

                  <td className="p-4">{genre.slug}</td>

                  <td className="p-4">
                    {genre.is_active ? "🟢 Active" : "🔴 Inactive"}
                  </td>

                  <td className="space-x-2 p-4">

                    <button
                      onClick={() => {
                        setEditingGenre(genre);
                        setEditOpen(true);
                      }}
                      className="rounded bg-blue-600 px-3 py-1 text-sm"
                    >
                      Edit
                    </button>

                    <button
  onClick={() => deleteGenre(genre.id)}
  className="rounded bg-red-600 px-3 py-1 text-sm"
>
  Delete
</button>

                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

      <AddGenreModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditGenreModal
        open={editOpen}
        genre={editingGenre}
        onClose={() => {
          setEditOpen(false);
          setEditingGenre(null);
        }}
        onSaved={() => {
          loadGenres();
          setEditOpen(false);
          setEditingGenre(null);
        }}
      />

    </div>
  );
}