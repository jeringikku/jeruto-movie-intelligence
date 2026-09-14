"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Region = {
  id: number;
  country_id: number | null;
  name: string;
  slug: string | null;
  code: string | null;
  region_type: string | null;
  parent_region_id: number | null;
  display_order: number;
  is_active: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  region : Region | null;
  onSaved: () => void;
};

export default function EditRegionModal({
  open,
  onClose,
  region,
  onSaved,
}: Props) {

  const [name, setName] = useState("");
  const [code, setcode] = useState("");

  useEffect(() => {
    if (!region) return;

    setName(region.name);
    setcode(region.code || "");
  }, [region]);

  async function handleSave() {

    if (!region) return;

    if (!name.trim()) {
      alert("Please enter Region name.");
      return;
    }

    const { error } = await supabase
      .from("geographic_regions")
      .update({
        name: name.trim(),
        code: code.trim() || null,
      })
      .eq("id", region.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Region updated successfully!");

    onSaved();
  }

  if (!open || !region) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          Edit Region
        </h2>

        <div className="mt-6 space-y-5">

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Region Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Code
            </label>

            <input
              value={code}
              onChange={(e) => setcode(e.target.value.toUpperCase())}
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