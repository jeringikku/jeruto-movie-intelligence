"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

import AddLanguageModal from "@/components/languages/AddLanguageModal";
import EditLanguageModal from "@/components/languages/EditLanguageModal";

type Language = {
  id: number;
  name: string;
  slug: string | null;
  native_name: string | null;
  iso_code: string | null;
};

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
    const [editingLanguage, setEditingLanguage] =
  useState<Language | null>(null);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  

  useEffect(() => {
    loadLanguages();
  }, []);

  async function loadLanguages() {
    const { data, error } = await supabase
      .from("languages")
    .select("id, name, slug, native_name, iso_code")
    .order("name");

    if (!error && data) {
      setLanguages(data);
    }
  }

  return (
    <div className="p-8">

      <div className="mb-8 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Languages
        </h1>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
        >
          + Add Language
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
          placeholder="Search Languages..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-4 text-white"
        />

      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-700">

        <table className="w-full">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Language</th>
              <th className="p-4 text-left">Native Name</th>
              <th className="p-4 text-left">ISO</th>
              <th className="p-4 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>

            {languages
              .filter(language =>
                language.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((language) => (

                <tr
                  key={language.id}
                  className="border-t border-zinc-700"
                >

                  <td className="p-4">
                    {language.id}
                  </td>

                  <td className="p-4">
                    {language.name}
                  </td>

                  <td className="p-4">
                    {language.native_name}
                </td>

                  <td className="p-4">
                    {language.iso_code}
                  </td>

                  <td className="space-x-2 p-4">

                    <button
                      onClick={() => {
                        setEditingLanguage(language);
                        setEditOpen(true);
                      }}
                      className="rounded bg-blue-600 px-3 py-1 text-sm"
                    >
                      Edit
                    </button>

                    <button
  onClick={async () => {

    const confirmDelete = confirm(
      `Delete "${language.name}"?`
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("languages")
      .delete()
      .eq("id", language.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Language deleted successfully!");

    loadLanguages();

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

      <AddLanguageModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditLanguageModal
        open={editOpen}
        language={editingLanguage}
        onClose={() => {
          setEditOpen(false);
          setEditingLanguage(null);
        }}
        onSaved={() => {
          loadLanguages();
          setEditOpen(false);
          setEditingLanguage(null);
        }}
      />

    </div>
  );
}