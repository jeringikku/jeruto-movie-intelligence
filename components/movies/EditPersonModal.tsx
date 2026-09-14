"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Role = {
  id: number;
  name: string;
};

type Person = {
  id: number;
  full_name: string;
};

type CreditType = {
  id: number;
  name: string;
};

type Props = {
  movieId: number;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingRow: any;
};

export default function EditPersonModal({
  movieId,
  open,
  onClose,
  onSaved,
  editingRow,
}: Props) {

  console.log("AddPersonModal movieId:", movieId);
  console.log("Editing Row:", editingRow);

    const [roles, setRoles] = useState<Role[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [creditTypes, setCreditTypes] = useState<CreditType[]>([]);
    const [selectedPerson, setSelectedPerson] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedCreditType, setSelectedCreditType] = useState("");
    const [characterName, setCharacterName] = useState("");
    const [billingOrder, setBillingOrder] = useState("");

   useEffect(() => {
  if (!editingRow) return;

  setSelectedPerson(String(editingRow.person_id));
  setSelectedRole(String(editingRow.role_id));

  setSelectedCreditType(
    editingRow.credit_type_id
      ? String(editingRow.credit_type_id)
      : ""
  );

  setCharacterName(editingRow.character_name || "");
  setBillingOrder(String(editingRow.billing_order || ""));
}, [editingRow]);

    useEffect(() => {

  async function loadRoles() {
    const { data, error } = await supabase
      .from("person_roles")
      .select("id, name")
      .order("department")
      .order("name");

    console.log("Roles Data:", data);
    console.log("Roles Error:", error);

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setRoles(data);
    }
  }

  async function loadPeople() {
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name")
    .order("full_name");

  console.log("People:", data);

  if (error) {
    alert(error.message);
    return;
  }

  if (data) {
    setPeople(data);
  }
}

async function loadCreditTypes() {
  const { data, error } = await supabase
    .from("credit_types")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  console.log("Credit Types:", data);

  if (error) {
    alert(error.message);
    return;
  }

  if (data) {
    setCreditTypes(data);
  }
}

  loadRoles();
  loadPeople();
  loadCreditTypes();
}, []);



async function handleSave() {
  if (!selectedPerson) {
    alert("Please select a person.");
    return;
  }

  if (!selectedRole) {
    alert("Please select a role.");
    return;
  }

  const { error } = await supabase
  .from("movie_people")
 .update({
  person_id: Number(selectedPerson),
  role_id: Number(selectedRole),

  credit_type_id: selectedCreditType
    ? Number(selectedCreditType)
    : null,

  character_name: characterName || null,

  billing_order: billingOrder
    ? Number(billingOrder)
    : null,
})
  .eq("id", editingRow.id);

  if (error) {
  console.log("FULL ERROR:", error);
  alert(JSON.stringify(error, null, 2));
  return;
}

  alert("Person updated successfully!");

  onSaved();

  setSelectedPerson("");
  setSelectedRole("");
  setSelectedCreditType("");
  setCharacterName("");
  setBillingOrder("");

  onClose();
}

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-xl rounded-xl bg-zinc-900 border border-zinc-700 p-6">

        <h2 className="text-2xl font-bold text-white">
          Edit Person
        </h2>

        <div className="mt-6 space-y-5">

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Person
            </label>

            <select
  value={selectedPerson}
  onChange={(e) => setSelectedPerson(e.target.value)}
  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
>

  <option value="">
    Select Person
  </option>

  {people.map((person) => (
    <option
      key={person.id}
      value={person.id}
    >
      {person.full_name}
    </option>
  ))}

</select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Role
            </label>

           <select
  value={selectedRole}
  onChange={(e) => setSelectedRole(e.target.value)}
  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
>

  <option value="">
    Select Role
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
    Credit Type
  </label>

  <select
    value={selectedCreditType}
    onChange={(e) => setSelectedCreditType(e.target.value)}
    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
  >
    <option value="">
      Select Credit Type
    </option>

    {creditTypes.map((creditType) => (
      <option
        key={creditType.id}
        value={creditType.id}
      >
        {creditType.name}
      </option>
    ))}
  </select>
</div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Character Name
            </label>

            <input
  value={characterName}
  onChange={(e) => setCharacterName(e.target.value)}
  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
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
  Save Changes
</button>

        </div>

      </div>

    </div>
  );
}