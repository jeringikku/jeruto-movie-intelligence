"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";
import AddCompanyMasterModal from "../../../components/companies/AddCompanyMasterModal";
import EditCompanyMasterModal from "@/components/companies/EditCompanyMasterModal";

type Company = {
  id: number;
  name: string;
  company_type: string;
  website: string | null;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
   const { data, error } = await supabase
  .from("companies")
  .select("id, name, company_type, website")
  .order("name");

    if (!error && data) {
      setCompanies(data);
    }
  }

  return (
    <div className="p-8">

      <div className="mb-8 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Companies
        </h1>

        <button
  onClick={() => setAddOpen(true)}
  className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
>
          + Add Company
        </button>

      </div>

      <div className="mb-6 relative max-w-md">

  <Search
    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
    size={18}
  />

  <input
    type="text"
    placeholder="Search companies..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:outline-none"
  />

</div>

      <div className="rounded-xl border border-zinc-700 overflow-hidden">

        <table className="w-full">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-4 text-left">ID</th>
<th className="p-4 text-left">Company Name</th>
<th className="p-4 text-left">Type</th>
<th className="p-4 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>

            {companies
  .filter((company) =>
    company.name
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .map((company) => (

              <tr
                key={company.id}
                className="border-t border-zinc-700"
              >

                <td className="p-4">
                  {company.id}
                </td>

                <td className="p-4">
  {company.name}
</td>

<td className="p-4">
  {company.company_type}
</td>

<td className="p-4 space-x-2">

  <button
  onClick={() => {
    setEditingCompany(company);
    setEditOpen(true);
  }}
  className="rounded bg-blue-600 px-3 py-1 text-sm"
>
  Edit
</button>

  <button
  onClick={async () => {

  const confirmDelete = confirm(
    `Delete "${company.name}"?`
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", company.id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadCompanies();

  alert("Company deleted successfully!");

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
      
      <AddCompanyMasterModal
  open={addOpen}
  onClose={() => setAddOpen(false)}
/>

<EditCompanyMasterModal
  open={editOpen}
  onClose={() => {
    setEditOpen(false);
    setEditingCompany(null);
  }}
  company={editingCompany}
  onSaved={() => {
    loadCompanies();
    setEditOpen(false);
    setEditingCompany(null);
  }}
/>

    </div>
  );
}