import { supabase } from "@/lib/supabase";
import Link from "next/link";
export default async function PeoplePage() {
  const { data: people, error } = await supabase
  .from("people")
  .select("*")
  .order("full_name");

console.log("People:", people);
console.log("Error:", error);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            People
          </h1>

          <p className="text-zinc-400">
            Manage actors, directors, writers and other film personalities.
          </p>
        </div>

       <Link
  href="/admin/people/new"
  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
>
  + Add Person
</Link>
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">

  <table className="w-full">
    <thead className="bg-zinc-800">
      <tr>
        <th className="px-4 py-3 text-left">Name</th>
        <th className="px-4 py-3 text-left">Gender</th>
        <th className="px-4 py-3 text-left">Slug</th>
      </tr>
    </thead>

    <tbody>

      {people?.map((person) => (

        <tr
          key={person.id}
          className="border-t border-zinc-700"
        >

          <td className="px-4 py-3">
            {person.full_name}
          </td>

          <td className="px-4 py-3">
            {person.gender}
          </td>

          <td className="px-4 py-3 text-zinc-400">
            {person.slug}
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>
    </div>
  );
}