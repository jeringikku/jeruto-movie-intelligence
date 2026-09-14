"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

import AddIndustryModal from "@/components/industries/AddIndustryModal";
import EditIndustryModal from "@/components/industries/EditIndustryModal";

type Industry = {
  id: number;
  name: string;
  native_name: string | null;
  slug: string;
  short_name: string | null;
  description: string | null;
  country_id: number | null;
  primary_language_id: number | null;
  industry_status: string;
  is_active: boolean;
};

export default function IndustriesPage() {
  const [industries, setIndustry] = useState<Industry[]>([]);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] =
    useState<Industry | null>(null);

  useEffect(() => {
    loadIndustries();
  }, []);

  async function loadIndustries() {
    const { data, error } = await supabase
      .from("industries")
      .select(`
id,
name,
native_name,
slug,
short_name,
description,
country_id,
primary_language_id,
industry_status,
is_active
`)
      .order("name");

    if (!error && data) {
      setIndustry(data);
    }
  }

  return (
    <div className="p-8">

      <div className="mb-8 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Industries 
        </h1>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
        >
          + Add Industry
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
          placeholder="Search Regions..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-4 text-white"
        />

      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-700">

        <table className="w-full">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-4 text-left">ID</th>

              <th className="p-4 text-left">Industry</th>
              <th className="p-4 text-left">Native Name</th>
              <th className="p-4 text-left">Short Name</th>
              <th className="p-4 text-left">Status</th>

              

              <th className="p-4 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>

            {industries
              .filter(Industry =>  
                Industry.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((industry) => (

                <tr
                  key={industry.id}
                  className="border-t border-zinc-700"
                >

                  <td className="p-4">
                    {industry.id}
                  </td>

                  <td className="p-4">
                    {industry.name}
                  </td>

                  <td className="p-4">
  {industry.native_name}
</td>

<td className="p-4">
  {industry.short_name}
</td>

<td className="p-4">
  {industry.industry_status}
</td>

                  <td className="space-x-2 p-4">

                    <button
  onClick={() => {
    setEditingIndustry(industry);
    setEditOpen(true);
  }}
  className="rounded bg-blue-600 px-3 py-1 text-sm"
>
  Edit
</button>

                    <button
  onClick={async () => {

    const confirmDelete = confirm(
      `Delete "${industry.name}"?`
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("industries")
      .delete()
      .eq("id", industry.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Industry deleted successfully!");

    loadIndustries();

  }}
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

      <AddIndustryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditIndustryModal
  open={editOpen}
  industry={editingIndustry}
  onClose={() => {
    setEditOpen(false);
    setEditingIndustry(null);
  }}
  onSaved={() => {
    loadIndustries();
    setEditOpen(false);
    setEditingIndustry(null);
  }}
/>

    </div>
  );
}