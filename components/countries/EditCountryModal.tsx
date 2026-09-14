"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Country = {
  id: number;
  name: string;
  iso_code: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  country: Country | null;
  onSaved: () => void;
};

export default function EditCountryModal({
  open,
  onClose,
  country,
  onSaved,
}: Props) {

  const [name, setName] = useState("");
  const [isoCode, setIsoCode] = useState("");

  useEffect(() => {
    if (!country) return;

    setName(country.name);
    setIsoCode(country.iso_code || "");
  }, [country]);

  async function handleSave() {

    if (!country) return;

    if (!name.trim()) {
      alert("Please enter country name.");
      return;
    }

    const { error } = await supabase
      .from("countries")
      .update({
        name: name.trim(),
        iso_code: isoCode.trim() || null,
      })
      .eq("id", country.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Country updated successfully!");

    onSaved();
  }

  if (!open || !country) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          Edit Country
        </h2>

        <div className="mt-6 space-y-5">

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Country Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              ISO Code
            </label>

            <input
              value={isoCode}
              onChange={(e) => setIsoCode(e.target.value.toUpperCase())}
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