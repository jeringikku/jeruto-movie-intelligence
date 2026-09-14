"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

import AddRegionModal from "@/components/geographic-regions/AddRegionModal";
import EditRegionModal from "@/components/geographic-regions/EditRegionModal";

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

export default function GeographicRegionsPage() {
  const [geographic_regions, setRegion] = useState<Region[]>([]);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingRegion, setEditingRegion] =
    useState<Region | null>(null);

  useEffect(() => {
    loadGeographicRegions();
  }, []);

  async function loadGeographicRegions() {
    const { data, error } = await supabase
      .from("geographic_regions")
      .select(`
id,
country_id,
name,
slug,
code,
region_type,
parent_region_id,
display_order,
is_active
`)
      .order("name");

    if (!error && data) {
      setRegion(data);
    }
  }

  return (
    <div className="p-8">

      <div className="mb-8 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Geographic Regions
        </h1>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
        >
          + Add Region
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

              <th className="p-4 text-left">Country</th>
              <th className="p-4 text-left">Slug</th>
              <th className="p-4 text-left">Code</th>

              

              <th className="p-4 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>

            {geographic_regions
              .filter(Region =>
                Region.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map(Region => (

                <tr
                  key={Region.id}
                  className="border-t border-zinc-700"
                >

                  <td className="p-4">
                    {Region.id}
                  </td>

                  <td className="p-4">
                    {Region.name}
                  </td>

                  <td className="p-4">
  {Region.slug}
</td>

<td className="p-4">
  {Region.code}
</td>

                  <td className="space-x-2 p-4">

                    <button
                      onClick={() => {
                        setEditingRegion(Region);
                        setEditOpen(true);
                      }}
                      className="rounded bg-blue-600 px-3 py-1 text-sm"
                    >
                      Edit
                    </button>

                    <button
  onClick={async () => {

    const confirmDelete = confirm(
      `Delete "${Region.name}"?`
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("geographic_regions")
      .delete()
      .eq("id", Region.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Region deleted successfully!");

    loadGeographicRegions();

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

      <AddRegionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditRegionModal
        open={editOpen}
        region={editingRegion}
        onClose={() => {
          setEditOpen(false);
          setEditingRegion(null);
        }}
        onSaved={() => {
          loadGeographicRegions();
          setEditOpen(false);
          setEditingRegion(null);
        }}
      />

    </div>
  );
}