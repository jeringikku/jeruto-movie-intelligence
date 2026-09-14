"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Language = {
  id: number;
  name: string;
  slug: string | null;
  native_name: string | null;
  iso_code: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  language: Language | null;
  onSaved: () => void;
};

export default function EditLanguageModal({
  open,
  onClose,
  language,
  onSaved,
}: Props) {

  const [name, setName] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [nativeName, setNativeName] = useState("");

  useEffect(() => {
    if (!language) return;

    setName(language.name);
    setIsoCode(language.iso_code || "");
    setNativeName(language.native_name ?? "");
  }, [language]);

  async function handleSave() {

    if (!language) return;

    if (!name.trim()) {
      alert("Please enter Language name.");
      return;
    }

    const slug = name
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "-")
  .replace(/[^\w-]/g, "");

    const { error } = await supabase
      .from("languages")
      .update({
  name: name.trim(),
  slug,
  native_name: nativeName.trim() || null,
  iso_code: isoCode.trim() || null,
})
      .eq("id", language.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Language updated successfully!");

    onSaved();
  }

  if (!open || !language) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          Edit Language
        </h2>

        <div className="mt-6 space-y-5">

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Language Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
            />

          </div>

          <div>
  <label className="mb-2 block text-sm text-zinc-300">
    Native Name
  </label>

  <input
    value={nativeName}
    onChange={(e) => setNativeName(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    placeholder="മലയാളം"
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