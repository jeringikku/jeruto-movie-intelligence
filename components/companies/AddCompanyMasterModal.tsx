"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddCompanyMasterModal({
  open,
  onClose,
}: Props) {

    const [name, setName] = useState("");
const [shortName, setShortName] = useState("");
const [country, setCountry] = useState("");
const [website, setWebsite] = useState("");
const [companyType, setCompanyType] = useState("Production");

async function handleSave() {
  if (!name.trim()) {
    alert("Please enter company name.");
    return;
  }

  const slug = name
  .toLowerCase()
  .trim()
  .replace(/\s+/g, "-")
  .replace(/[^\w-]+/g, "");

  const { error } = await supabase
  .from("companies")
  .insert({
    name: name.trim(),

    slug: slug,

    company_type: companyType,

    country_id: null,

    founded_year: null,

    headquarters: null,

    website: website || null,

    is_active: true,
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Company created successfully!");

  setName("");
  setShortName("");
  setCountry("");
  setWebsite("");
  setCompanyType("Production");

  onClose();
}

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold text-white">
          Add Company
        </h2>

        <div className="mt-6 space-y-5">

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Company Name
    </label>

    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
      placeholder="Dream Warrior Pictures"
    />
  </div>

  <div>
  <label className="mb-2 block text-sm text-zinc-300">
    Company Type
  </label>

  <select
    value={companyType}
    onChange={(e) => setCompanyType(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
  >
    <option value="Production">Production</option>
    <option value="Distribution">Distribution</option>
    <option value="Studio">Studio</option>
    <option value="Music">Music</option>
    <option value="VFX">VFX</option>
    <option value="Streaming">Streaming</option>
    <option value="TV">TV</option>
    <option value="Other">Other</option>
  </select>
</div>

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Short Name
    </label>

    <input
      value={shortName}
      onChange={(e) => setShortName(e.target.value)}
      className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
      placeholder="DWP"
    />
  </div>

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Country
    </label>

    <input
      value={country}
      onChange={(e) => setCountry(e.target.value)}
      className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
      placeholder="India"
    />
  </div>

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Website
    </label>

    <input
      value={website}
      onChange={(e) => setWebsite(e.target.value)}
      className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
      placeholder="https://..."
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