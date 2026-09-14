"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddCompanyModal from "./AddCompanyModal";
import EditCompanyModal from "./EditCompanyModal";

type Props = {
  movieId: number;
};

type MovieCompany = {
  id: number;
  billing_order: number | null;
  notes: string | null;

  companies: {
    name: string;
  };

  company_roles: {
    name: string;
  };
};

export default function CompaniesTab({
  movieId,
}: Props) {
  
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<MovieCompany | null>(null);
  const [movieCompanies, setMovieCompanies] = useState<MovieCompany[]>([]);

  async function loadCompanies() {
  const { data, error } = await supabase
    .from("movie_companies")
    .select(`
  id,
  company_id,
  role_id,
  billing_order,
  notes,
  companies (
    name
  ),
  company_roles (
    name
  )
`)
    .eq("movie_id", movieId)
    .order("billing_order");

  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    setMovieCompanies(data as unknown as MovieCompany[]);
  }
}

useEffect(() => {
  loadCompanies();
}, [movieId]);

async function handleDelete(id: number) {
  const confirmed = window.confirm(
    "Are you sure you want to remove this company from this movie?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("movie_companies")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Company removed successfully!");

  loadCompanies();
}

  return (
  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">

    <div className="mb-4 flex items-center justify-between">

      <h2 className="text-xl font-bold text-white">
        Companies
      </h2>

     <button
  onClick={() => setAddOpen(true)}
  className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black"
>
  + Add Company
</button>

    </div>

    <table className="w-full border-collapse">

  <thead>

    <tr className="bg-zinc-800">

      <th className="border border-zinc-700 px-4 py-2 text-left text-white">
        Billing
      </th>

      <th className="border border-zinc-700 px-4 py-2 text-left text-white">
        Company
      </th>

      <th className="border border-zinc-700 px-4 py-2 text-left text-white">
        Role
      </th>

      <th className="border border-zinc-700 px-4 py-2 text-left text-white">
        Notes
      </th>

      <th className="border border-zinc-700 px-4 py-2 text-left text-white">
        Actions
      </th>

    </tr>

  </thead>

<tbody>

  {movieCompanies.length === 0 ? (
  <tr>
    <td
      colSpan={5}
      className="border border-zinc-700 py-8 text-center text-zinc-400"
    >
      No companies added yet.
    </td>
  </tr>
) : (
  movieCompanies.map((company) => (
    <tr key={company.id}>

      <td className="border border-zinc-700 px-4 py-2 text-white">
        {company.billing_order}
      </td>

      <td className="border border-zinc-700 px-4 py-2 text-white">
        {company.companies.name}
      </td>

      <td className="border border-zinc-700 px-4 py-2 text-white">
        {company.company_roles.name}
      </td>

      <td className="border border-zinc-700 px-4 py-2 text-white">
        {company.notes || "-"}
      </td>

      <td className="border border-zinc-700 px-4 py-2">
        <button
  onClick={() => {
    setEditingCompany(company);
    setEditOpen(true);
  }}
  className="mr-2 rounded bg-blue-600 px-3 py-1 text-sm text-white"
>
  Edit
</button>

        <button
  onClick={() => handleDelete(company.id)}
  className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
>
  Delete
</button>
      </td>

    </tr>
  ))
)}

</tbody>


</table>

<AddCompanyModal
  movieId={movieId}
  open={addOpen}
  onClose={() => setAddOpen(false)}
  onSaved={() => {
    setAddOpen(false);
  }}
/>

<EditCompanyModal
  movieId={movieId}
  open={editOpen}
  editingCompany={editingCompany}
  onClose={() => setEditOpen(false)}
  onSaved={() => {
    loadCompanies();
    setEditOpen(false);
  }}
/>

  </div>
);

}