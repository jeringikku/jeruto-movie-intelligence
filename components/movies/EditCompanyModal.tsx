"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Company = {
  id: number;
  name: string;
};

type CompanyRole = {
  id: number;
  name: string;
};

type Props = {
  movieId: number;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingCompany: any;
};

export default function EditCompanyModal({
  movieId,
  open,
  onClose,
  onSaved,
  editingCompany,
}: Props) {

    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [roles, setRoles] = useState<CompanyRole[]>([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [notes, setNotes] = useState("");
    const [billingOrder, setBillingOrder] = useState("");

useEffect(() => {
  if (!open) return;

  async function loadCompanies() {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name")
      .order("name");

    if (!error && data) {
      setCompanies(data);
    }
  }

  async function loadRoles() {
  const { data, error } = await supabase
    .from("company_roles")
    .select("id, name")
    .order("name");

  if (!error && data) {
    setRoles(data);
  }
}

  loadCompanies();
  loadRoles();

}, [open]);



useEffect(() => {
  if (!editingCompany) return;

  setSelectedCompany(String(editingCompany.company_id));
  setSelectedRole(String(editingCompany.role_id));
  setNotes(editingCompany.notes || "");
  setBillingOrder(String(editingCompany.billing_order || ""));
}, [editingCompany]);

  async function handleSave() {
  const { error } = await supabase
    .from("movie_companies")
    .update({
      company_id: Number(selectedCompany),
      role_id: Number(selectedRole),
      notes,
      billing_order: Number(billingOrder),
    })
    .eq("id", editingCompany.id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Company updated successfully!");

  onSaved();
  onClose();
}

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          Edit Company
        </h2>

        <div className="mt-6 space-y-5">
            </div>

          <div>
  <label className="mb-2 block text-sm text-zinc-300">
    Company
  </label>

  <select
    value={selectedCompany}
    onChange={(e) => setSelectedCompany(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
  >
    <option value="">
      Select Company
    </option>

    {companies.map((company) => (
      <option
        key={company.id}
        value={company.id}
      >
        {company.name}
      </option>
    ))}
  </select>
</div>

          <div>
  <label className="mb-2 block text-sm text-zinc-300">
    Company Role
  </label>

  <select
    value={selectedRole}
    onChange={(e) => setSelectedRole(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
  >
    <option value="">
      Select Company Role
    </option>

    {roles.map((role) => (
      <option key={role.id} value={role.id}>
        {role.name}
      </option>
    ))}
  </select>
  </div>

  <div>
  <label className="mb-2 block text-sm text-zinc-300">
    Notes
  </label>

  <input
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    placeholder="Optional notes"
  />
</div>

<div>
  <label className="mb-2 block text-sm text-zinc-300">
    Billing Order
  </label>

  <input
    type="number"
    value={billingOrder}
    onChange={(e) => setBillingOrder(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    placeholder="1"
  />
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