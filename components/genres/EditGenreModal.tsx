"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Genre = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  is_active: boolean | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  genre: Genre | null;
  onSaved: () => void;
};

export default function EditGenreModal({
  open,
  onClose,
  genre,
  onSaved,
}: Props) {

  const [name, setName] = useState("");


  useEffect(() => {
    if (!genre) return;

    setName(genre.name);
    
  }, [genre]);

  async function handleSave() {

    if (!genre) return;

    if (!name.trim()) {
      alert("Please enter Genre name.");
      return;
    }

    const { error } = await supabase
      .from("genres")
      .update({
        name: name.trim(),
        
      })
      .eq("id", genre.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Genre updated successfully!");

    onSaved();
  }

  if (!open || !genre) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          Edit Genre
        </h2>

        <div className="mt-6 space-y-5">

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Genre Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
            />

         

            

            

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-5 py-2 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-yellow-500 px-5 py-2 font-semibold text-black"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
}