"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddPersonModal from "./AddPersonModal";
import EditPersonModal from "./EditPersonModal";

type Props = {
  movieId: number;
};

type CastCrew = {
  id: number;
  person_id: number;
  role_id: number;
  credit_type_id: number | null;
  billing_order: number | null;
  character_name: string | null;

  people: {
    full_name: string;
  };

  person_roles: {
  name: string;
  department: string | null;
};

  credit_types: {
    name: string;
  } | null;
};


export default function CastCrewTab({ movieId }: Props) {
  console.log("CastCrewTab movieId:", movieId);
  
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<CastCrew | null>(null);

  const [castCrew, setCastCrew] = useState<CastCrew[]>([]);

  const cast = castCrew.filter(
  (row) =>
    row.person_roles?.department?.trim().toLowerCase() === "cast"
);

const crew = castCrew.filter(
  (row) =>
    row.person_roles?.department?.trim().toLowerCase() !== "cast"
);

 async function loadCastCrew() {
  console.log("🔄 Reloading Cast & Crew...");
  const { data, error } = await supabase
    .from("movie_people")
   .select(`
  id,
  person_id,
  role_id,
  credit_type_id,
  billing_order,
  character_name,
  people (
    full_name
  ),
  person_roles (
  name,
  department
),
  credit_types (
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
  console.log("✅ New Data:", data);
  setCastCrew(data as unknown as CastCrew[]);
}
}

async function deleteCastCrew(id: number) {
  const confirmed = confirm(
    "Are you sure you want to remove this person from the movie?"
  );

  if (!confirmed) return;

  console.log("Deleting row id:", id);

  const { data, error } = await supabase
  .from("movie_people")
  .delete()
  .eq("id", id)
  .select();

console.log("Deleting id:", id);
console.log("Deleted data:", data);
console.log("Delete error:", error);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Person removed successfully!");

  loadCastCrew();
}

useEffect(() => {
  loadCastCrew();
}, [movieId]);

  return (
    <>
      <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-bold text-white">
            Cast & Crew
          </h2>

          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400"
          >
            + Add Person
          </button>

        </div>

    {castCrew.length === 0 ? (
  <div className="mt-10 rounded-lg border border-dashed border-zinc-700 p-10 text-center">
    <h3 className="text-lg font-semibold text-white">
      No Cast & Crew Added
    </h3>

    <p className="mt-2 text-zinc-400">
      Click "Add Person" to attach actors, directors, producers and other crew members.
    </p>
  </div>
) : (
  <div className="mt-8 space-y-10">

    {/* ================= CAST ================= */}

    {cast.length > 0 && (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              🎭 Cast
            </h3>

            <p className="text-sm text-zinc-500">
              Actors and performers appearing in the movie.
            </p>
          </div>

          <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
            {cast.length} {cast.length === 1 ? "Person" : "People"}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-700">
          <table className="min-w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Billing
                </th>

                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Person
                </th>

                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Role
                </th>

                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Credit Type
                </th>

                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Character
                </th>

                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {cast.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-zinc-800/50"
                >
                  <td className="border-b border-zinc-800 px-4 py-3 text-white">
                    {row.billing_order ?? "—"}
                  </td>

                  <td className="border-b border-zinc-800 px-4 py-3 font-semibold text-white">
                    {row.people?.full_name}
                  </td>

                  <td className="border-b border-zinc-800 px-4 py-3 text-zinc-300">
                    {row.person_roles?.name}
                  </td>

                  <td className="border-b border-zinc-800 px-4 py-3">
                    {row.credit_types?.name ? (
                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                        {row.credit_types.name}
                      </span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>

                  <td className="border-b border-zinc-800 px-4 py-3 text-zinc-300">
                    {row.character_name || "—"}
                  </td>

                  <td className="border-b border-zinc-800 px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingRow(row);
                          setEditOpen(true);
                        }}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteCastCrew(row.id)}
                        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* ================= CREW ================= */}

    {crew.length > 0 && (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              🎬 Crew
            </h3>

            <p className="text-sm text-zinc-500">
              Directors, writers, technicians, designers and other crew members.
            </p>
          </div>

          <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
            {crew.length} {crew.length === 1 ? "Person" : "People"}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-700">
          <table className="min-w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Person
                </th>

                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Department
                </th>

                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Role
                </th>

                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
  Credit Type
</th>

                <th className="border-b border-zinc-700 px-4 py-3 text-left text-sm text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {crew.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-zinc-800/50"
                >
                  <td className="border-b border-zinc-800 px-4 py-3 font-semibold text-white">
                    {row.people?.full_name}
                  </td>

                  <td className="border-b border-zinc-800 px-4 py-3">
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                      {row.person_roles?.department || "Other"}
                    </span>
                  </td>

                  <td className="border-b border-zinc-800 px-4 py-3 text-zinc-300">
                    {row.person_roles?.name}
                  </td>

                  <td className="border-b border-zinc-800 px-4 py-3 text-zinc-300">
  {row.person_roles?.name}
</td>

                  <td className="border-b border-zinc-800 px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingRow(row);
                          setEditOpen(true);
                        }}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteCastCrew(row.id)}
                        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

  </div>
)}


      </div>

      <AddPersonModal
  movieId={movieId}
  open={open}
  onClose={() => setOpen(false)}
  onSaved={loadCastCrew}
/>
<EditPersonModal
  movieId={movieId}
  open={editOpen}
  onClose={() => setEditOpen(false)}
  onSaved={loadCastCrew}
  editingRow={editingRow}
/>

    </>
    
  );
}