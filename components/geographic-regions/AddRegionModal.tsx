"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddRegionModal({
  open,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [code, setcode] = useState("");
  const [countries, setCountries] = useState<any[]>([]);
  const [countryId, setCountryId] = useState("");
  const [region_type, setRegionType] = useState("State");
  const [is_active, setIsActive] = useState(true);

  useEffect(() => {
  loadCountries();
}, []);

async function loadCountries() {
  const { data } = await supabase
    .from("countries")
    .select("id, name")
    .order("name");

  if (data) {
    setCountries(data);
  }
}

  async function handleSave() {
    if (!name.trim()) {
      alert("Please enter Region name.");
      return;
    }

    if (!countryId) {
  alert("Please select a country.");
  return;
}

    const slug = name
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "-")
  .replace(/[^\w-]/g, "");


    const { error } = await supabase
      .from("geographic_regions")
      .insert({
  country_id: Number(countryId),
  name: name.trim(),
  slug,
  code: code.trim() || null,
  region_type,
  is_active,
})

    if (error) {
      alert(error.message);
      return;
    }

    alert("Region created successfully!");

    setName("");
    setcode("");
    setCountryId("");
setRegionType("State");
setIsActive(true);

    onClose();

    window.location.reload();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          Add Region
        </h2>

        <div className="mt-6 space-y-5">

            <div>
  <label className="mb-2 block text-sm text-zinc-300">
    Country
  </label>

  <select
    value={countryId}
    onChange={(e) => setCountryId(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
  >
    <option value="">Select Country</option>

    {countries.map((country) => (
      <option key={country.id} value={country.id}>
        {country.name}
      </option>
    ))}
  </select>
</div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Region Name
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
              Region Code
            </label>

            <input
              value={code}
              onChange={(e) => setcode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
              placeholder="IN"
            />
          </div>

          <select
  value={region_type}
  onChange={(e) => setRegionType(e.target.value)}
  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
>
  <option>State</option>
  <option>Union Territory</option>
  <option>District</option>
  <option>City</option>
  <option>Distribution Territory</option>
  <option>Overseas Territory</option>
  <option>Market</option>
  <option>Other</option>
</select>

<input
  type="checkbox"
  checked={is_active}
  onChange={(e) => setIsActive(e.target.checked)}
/>

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