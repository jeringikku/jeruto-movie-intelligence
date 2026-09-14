"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

import AddCountryModal from "@/components/countries/AddCountryModal";
import EditCountryModal from "@/components/countries/EditCountryModal";

type Country = {
  id: number;
  name: string;
  slug: string | null;
  iso_code: string | null;
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingCountry, setEditingCountry] =
    useState<Country | null>(null);

  useEffect(() => {
    loadCountries();
  }, []);

  async function loadCountries() {
    const { data, error } = await supabase
      .from("countries")
      .select("id,name,slug,iso_code")
      .order("name");

    if (!error && data) {
      setCountries(data);
    }
  }

  return (
    <div className="p-8">

      <div className="mb-8 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Countries
        </h1>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
        >
          + Add Country
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
          placeholder="Search countries..."
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
              <th className="p-4 text-left">ISO</th>

              

              <th className="p-4 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>

            {countries
              .filter(country =>
                country.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map(country => (

                <tr
                  key={country.id}
                  className="border-t border-zinc-700"
                >

                  <td className="p-4">
                    {country.id}
                  </td>

                  <td className="p-4">
                    {country.name}
                  </td>

                  <td className="p-4">
  {country.slug}
</td>

<td className="p-4">
  {country.iso_code}
</td>

                  <td className="space-x-2 p-4">

                    <button
                      onClick={() => {
                        setEditingCountry(country);
                        setEditOpen(true);
                      }}
                      className="rounded bg-blue-600 px-3 py-1 text-sm"
                    >
                      Edit
                    </button>

                    <button
  onClick={async () => {

    const confirmDelete = confirm(
      `Delete "${country.name}"?`
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("countries")
      .delete()
      .eq("id", country.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Country deleted successfully!");

    loadCountries();

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

      <AddCountryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditCountryModal
        open={editOpen}
        country={editingCountry}
        onClose={() => {
          setEditOpen(false);
          setEditingCountry(null);
        }}
        onSaved={() => {
          loadCountries();
          setEditOpen(false);
          setEditingCountry(null);
        }}
      />

    </div>
  );
}