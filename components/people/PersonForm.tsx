"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
export default function PersonForm() {
    const [fullName, setFullName] = useState("");
const [gender, setGender] = useState("");
const router = useRouter();
async function handleSave() {
  if (!fullName.trim()) {
    alert("Please enter a full name.");
    return;
  }

  const slug = fullName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  const { error } = await supabase
    .from("people")
    .insert({
      full_name: fullName,
      slug: slug,
      gender: gender || null,
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Person added successfully!");

  router.push("/admin/people");
}
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">

      <div className="space-y-5">

        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Full Name *
          </label>

          <input
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
  placeholder="Enter full name"
/>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Gender
          </label>

          <select
  value={gender}
  onChange={(e) => setGender(e.target.value)}
  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <button
  type="button"
  onClick={handleSave}
  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
>
          Save Person
        </button>

      </div>

    </div>
  );
}