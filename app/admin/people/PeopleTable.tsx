"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export type Person = {
  id: number;
  full_name: string;
  slug: string;
  gender: string | null;
  profile_image_url: string | null;
};

export default function PeopleTable({
  people: initialPeople,
}: {
  people: Person[];
}) {
  const [people, setPeople] = useState(initialPeople);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();

  const filteredPeople = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return people;

    return people.filter(
      (person) =>
        person.full_name.toLowerCase().includes(term) ||
        person.slug.toLowerCase().includes(term)
    );
  }, [people, search]);

  async function handleDelete(person: Person) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${person.full_name}"?\n\nThis action cannot be undone. If this person is linked to movie or other records, the database may prevent deletion.`
    );

    if (!confirmed) return;

    setDeletingId(person.id);

    try {
      const { data, error } = await supabase
        .from("people")
        .delete()
        .eq("id", person.id)
        .select("id");

      if (error) {
        alert(
          `Unable to delete this person.\n\n${error.message}\n\nExisting movie or person relationships may prevent deletion.`
        );
        return;
      }

      if (!data || data.length === 0) {
        alert(
          "The person was not deleted. Please check your Supabase DELETE permissions."
        );
        return;
      }

      setPeople((current) =>
        current.filter((item) => item.id !== person.id)
      );

      router.refresh();
      alert("Person deleted successfully.");
    } catch (error) {
      console.error("Delete person error:", error);
      alert("An unexpected error occurred while deleting this person.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by person name or slug..."
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-blue-500 sm:max-w-md"
        />

        <p className="text-sm text-zinc-400">
          Showing {filteredPeople.length} of {people.length} people
        </p>
      </div>

      {/* People table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900">
        <table className="w-full min-w-[850px]">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm">Person</th>
              <th className="px-4 py-3 text-left text-sm">Gender</th>
              <th className="px-4 py-3 text-left text-sm">Slug</th>
              <th className="px-4 py-3 text-center text-sm">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPeople.map((person) => (
              <tr
                key={person.id}
                className="border-t border-zinc-700 transition hover:bg-zinc-800/60"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {person.profile_image_url ? (
                      <img
                        src={person.profile_image_url}
                        alt={person.full_name}
                        className="h-10 w-10 rounded-full border border-zinc-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-black text-sm text-zinc-500">
                        {person.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span className="font-medium text-white">
                      {person.full_name}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-zinc-300">
                  {person.gender || "—"}
                </td>

                <td className="px-4 py-3 text-sm text-zinc-400">
                  {person.slug}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/people/${person.id}/edit`}
                      className="rounded-lg border border-blue-500/40 bg-blue-600/10 px-3 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-600/20"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(person)}
                      disabled={deletingId === person.id}
                      className="rounded-lg border border-red-500/40 bg-red-600/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === person.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredPeople.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-sm text-zinc-500"
                >
                  {search
                    ? "No matching people found."
                    : "No people have been added yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}