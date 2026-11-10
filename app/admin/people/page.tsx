import { supabase } from "@/lib/supabase";
import Link from "next/link";
import PeopleTable, { Person } from "./PeopleTable";

export default async function PeoplePage() {
  const { data: people, error } = await supabase
    .from("people")
    .select(
      "id, full_name, slug, gender, profile_image_url"
    )
    .order("full_name", { ascending: true });

  if (error) {
    console.error("People loading error:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="w-fit rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Add Person
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-300">
          Unable to load people: {error.message}
        </div>
      ) : (
        <PeopleTable people={(people ?? []) as Person[]} />
      )}
    </div>
  );
}