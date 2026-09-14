"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddIndustryModal({
  open,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [nativeName, setNativeName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");

  
  async function handleSave() {
    if (!name.trim()) {
      alert("Please enter Industry name.");
      return;
    }

   

    const slug = name
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "-")
  .replace(/[^\w-]/g, "");


    const { error } = await supabase
      .from("industries")
      .insert({
  name: name.trim(),
  native_name: nativeName.trim() || null,
  short_name: shortName.trim() || null,
  description: description.trim() || null,
  slug,
})

    if (error) {
      alert(error.message);
      return;
    }

    alert("Industry created successfully!");

    setName("");
    setNativeName("");
    setShortName("");
    setDescription("")
    onClose();

    window.location.reload();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          Add Industry
        </h2>

        <div className="mt-6 space-y-5">

            

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Industry Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
              placeholder="India"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Native Name
            </label>

            <input
              value={nativeName}
              onChange={(e) => setNativeName(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
              placeholder="IN"
            />
          </div>

          <div>
  <label className="mb-2 block text-sm text-zinc-300">
    Short Name
  </label>

  <input
    value={shortName}
    onChange={(e) => setShortName(e.target.value.toUpperCase())}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    placeholder="TFI"
  />
</div>

<div>
  <label className="mb-2 block text-sm text-zinc-300">
    Description
  </label>

  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    rows={4}
  />
</div>

          


        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-5 py-2 text-white"
          >
            Close
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