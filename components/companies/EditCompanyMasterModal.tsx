"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Company = {
  id: number;
  name: string;
  company_type: string;
  website: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  company: Company | null;
  onSaved: () => void;
};

export default function EditCompanyMasterModal({
  open,
  onClose,
  company,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (!company) return;

    setName(company.name);
    setCompanyType(company.company_type);
    setWebsite(company.website || "");
  }, [company]);

  async function handleSave() {
    if (!company) return;

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
      .update({
        name: name.trim(),
        slug,
        company_type: companyType,
        website: website || null,
      })
      .eq("id", company.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Company updated successfully!");

    onSaved();
  }

  if (!open || !company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          Edit Company
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
              <option>Production Company</option>
              <option>Distribution</option>
              <option>Production & Distribution</option>
              <option>Studio</option>
              <option>Streaming Platform</option>
              <option>Sales Agent</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Website
            </label>

            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
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