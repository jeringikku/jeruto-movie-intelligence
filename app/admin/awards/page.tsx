"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Award = {
  id: number;
  movie_id: number;
  award_name: string;
  awarding_body: string | null;
  category: string | null;
  award_year: number | null;
  recipient: string | null;
  result: "Won" | "Nominated" | null;
  notes: string | null;
};

type Movie = {
  id: number;
  title: string;
};

export default function AwardsPage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const selectedMovieId = movieIdParam
    ? Number(movieIdParam)
    : null;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);

  const [movieId, setMovieId] = useState(
    selectedMovieId ? String(selectedMovieId) : ""
  );

  const [awardName, setAwardName] = useState("");
  const [awardingBody, setAwardingBody] = useState("");
  const [category, setCategory] = useState("");
  const [awardYear, setAwardYear] = useState("");
  const [recipient, setRecipient] = useState("");
  const [result, setResult] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingAward, setEditingAward] =
    useState<Award | null>(null);

  // --------------------------------------------------
  // LOAD MOVIES
  // --------------------------------------------------

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    const { data, error } = await supabase
      .from("movies")
      .select("id, title")
      .order("title");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (data) {
      setMovies(data);

      if (
        selectedMovieId &&
        data.some(
          (movie) => movie.id === selectedMovieId
        )
      ) {
        setMovieId(String(selectedMovieId));
      }
    }

    setLoading(false);
  }

  // --------------------------------------------------
  // LOAD AWARDS
  // --------------------------------------------------

  useEffect(() => {
    if (movieId) {
      loadAwards(Number(movieId));
    } else {
      setAwards([]);
    }
  }, [movieId]);

  async function loadAwards(currentMovieId: number) {
    const { data, error } = await supabase
      .from("movie_awards")
      .select(`
        id,
        movie_id,
        award_name,
        awarding_body,
        category,
        award_year,
        recipient,
        result,
        notes
      `)
      .eq("movie_id", currentMovieId)
      .order("award_year", {
        ascending: false,
      })
      .order("id", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setAwards(data || []);
  }

  // --------------------------------------------------
  // SAVE AWARD
  // --------------------------------------------------

  async function saveAward() {
    if (!movieId) {
      alert("Please select a movie.");
      return;
    }

    if (!awardName.trim()) {
      alert("Please enter the award name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("movie_awards")
      .insert({
        movie_id: Number(movieId),

        award_name:
          awardName.trim(),

        awarding_body:
          awardingBody.trim() || null,

        category:
          category.trim() || null,

        award_year:
          awardYear === ""
            ? null
            : Number(awardYear),

        recipient:
          recipient.trim() || null,

        result:
          result || null,

        notes:
          notes.trim() || null,
      });

    if (error) {
      console.error(error);
      alert(
        "Failed to save award: " +
          error.message
      );

      setSaving(false);
      return;
    }

    alert("Award added successfully! 🏆");

    resetForm();

    await loadAwards(Number(movieId));

    setSaving(false);
  }

  // --------------------------------------------------
  // DELETE AWARD
  // --------------------------------------------------

  async function deleteAward(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this award?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("movie_awards")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(
        "Failed to delete award: " +
          error.message
      );
      return;
    }

    alert("Award deleted successfully.");

    if (movieId) {
      await loadAwards(Number(movieId));
    }
  }

  // --------------------------------------------------
  // UPDATE AWARD
  // --------------------------------------------------

  async function updateAward() {
    if (!editingAward) {
      return;
    }

    if (!editingAward.award_name.trim()) {
      alert("Award name cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("movie_awards")
      .update({
        award_name:
          editingAward.award_name.trim(),

        awarding_body:
          editingAward.awarding_body?.trim() ||
          null,

        category:
          editingAward.category?.trim() ||
          null,

        award_year:
          editingAward.award_year,

        recipient:
          editingAward.recipient?.trim() ||
          null,

        result:
          editingAward.result || null,

        notes:
          editingAward.notes?.trim() ||
          null,
      })
      .eq("id", editingAward.id);

    if (error) {
      console.error(error);
      alert(
        "Failed to update award: " +
          error.message
      );
      return;
    }

    alert("Award updated successfully! ✨");

    setEditingAward(null);

    if (movieId) {
      await loadAwards(Number(movieId));
    }
  }

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  function resetForm() {
    setAwardName("");
    setAwardingBody("");
    setCategory("");
    setAwardYear("");
    setRecipient("");
    setResult("");
    setNotes("");
  }

  // --------------------------------------------------
  // MOVIE NAME
  // --------------------------------------------------

  const selectedMovie = movies.find(
    (movie) =>
      movie.id === Number(movieId)
  );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-zinc-400">
        Loading awards...
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black p-6 text-white">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-yellow-400">
          Awards
        </h1>

        <p className="mt-1 text-gray-400">
          Awards and nominations associated with the movie
        </p>

      </div>

      {/* MOVIE SELECTOR */}

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6">

        <label className="mb-2 block text-sm text-zinc-400">
          Movie
        </label>

        <select
          value={movieId}
          onChange={(e) =>
            setMovieId(e.target.value)
          }
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
        >

          <option value="">
            Select Movie
          </option>

          {movies.map((movie) => (
            <option
              key={movie.id}
              value={movie.id}
            >
              {movie.title}
            </option>
          ))}

        </select>

        {selectedMovie && (
          <p className="mt-3 text-sm text-yellow-400">
            Selected Movie: {selectedMovie.title}
          </p>
        )}

      </div>

      {/* ADD AWARD */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

        <h2 className="text-xl font-bold text-yellow-400">
          Add Award
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Add an award or nomination associated with this movie.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* AWARD NAME */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Award Name *
            </label>

            <input
              value={awardName}
              onChange={(e) =>
                setAwardName(e.target.value)
              }
              placeholder="Example: SIIMA Awards"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* AWARDING BODY */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Awarding Body
            </label>

            <input
              value={awardingBody}
              onChange={(e) =>
                setAwardingBody(
                  e.target.value
                )
              }
              placeholder="Example: SIIMA"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* CATEGORY */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Category
            </label>

            <input
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="Example: Best Actor"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* YEAR */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Award Year
            </label>

            <input
              type="number"
              value={awardYear}
              onChange={(e) =>
                setAwardYear(e.target.value)
              }
              placeholder="Example: 2027"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* RECIPIENT */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Recipient
            </label>

            <input
              value={recipient}
              onChange={(e) =>
                setRecipient(
                  e.target.value
                )
              }
              placeholder="Person / Movie / Team"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

          {/* RESULT */}

          <div>

            <label className="mb-2 block text-sm text-zinc-400">
              Result
            </label>

            <select
              value={result}
              onChange={(e) =>
                setResult(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            >

              <option value="">
                Select Result
              </option>

              <option value="Won">
                Won
              </option>

              <option value="Nominated">
                Nominated
              </option>

            </select>

          </div>

          {/* NOTES */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm text-zinc-400">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              rows={4}
              placeholder="Additional award information..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            />

          </div>

        </div>

        <div className="mt-6 flex justify-end">

          <button
            onClick={saveAward}
            disabled={saving}
            className="rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Award"}
          </button>

        </div>

      </div>

      {/* AWARDS LIST */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-800 p-6">

          <h2 className="text-xl font-bold">
            Awards & Nominations
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            {selectedMovie
              ? `Awards associated with ${selectedMovie.title}`
              : "Select a movie to view awards."}
          </p>

        </div>

        {!movieId ? (

          <div className="p-8 text-center text-zinc-500">
            Please select a movie first.
          </div>

        ) : awards.length === 0 ? (

          <div className="p-8 text-center text-zinc-500">
            No awards or nominations added yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Year
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Award
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Body
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Recipient
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Result
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {awards.map((award) => (

                  <tr
                    key={award.id}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >

                    <td className="px-5 py-4">
                      {award.award_year ?? "—"}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {award.award_name}
                    </td>

                    <td className="px-5 py-4 text-zinc-300">
                      {award.awarding_body ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-zinc-300">
                      {award.category ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-zinc-300">
                      {award.recipient ?? "—"}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          award.result === "Won"
                            ? "bg-green-900/50 text-green-300"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {award.result ?? "—"}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            setEditingAward(
                              award
                            )
                          }
                          className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-white hover:bg-zinc-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteAward(
                              award.id
                            )
                          }
                          className="rounded-lg bg-red-900/60 px-3 py-2 text-xs text-red-200 hover:bg-red-800"
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

        )}

      </div>

      {/* EDIT AWARD */}

      {editingAward && (

        <div className="mt-8 rounded-xl border border-yellow-500/30 bg-black p-6">

          <h2 className="text-xl font-bold text-yellow-400">
            Edit Award
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* AWARD */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Award Name
              </label>

              <input
                value={
                  editingAward.award_name
                }
                onChange={(e) =>
                  setEditingAward({
                    ...editingAward,
                    award_name:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* BODY */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Awarding Body
              </label>

              <input
                value={
                  editingAward.awarding_body ??
                  ""
                }
                onChange={(e) =>
                  setEditingAward({
                    ...editingAward,
                    awarding_body:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* CATEGORY */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Category
              </label>

              <input
                value={
                  editingAward.category ??
                  ""
                }
                onChange={(e) =>
                  setEditingAward({
                    ...editingAward,
                    category:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* YEAR */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Award Year
              </label>

              <input
                type="number"
                value={
                  editingAward.award_year ??
                  ""
                }
                onChange={(e) =>
                  setEditingAward({
                    ...editingAward,
                    award_year:
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* RECIPIENT */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Recipient
              </label>

              <input
                value={
                  editingAward.recipient ??
                  ""
                }
                onChange={(e) =>
                  setEditingAward({
                    ...editingAward,
                    recipient:
                      e.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

            {/* RESULT */}

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Result
              </label>

              <select
                value={
                  editingAward.result ??
                  ""
                }
                onChange={(e) =>
                  setEditingAward({
                    ...editingAward,
                    result:
                      e.target.value === ""
                        ? null
                        : (e.target
                            .value as
                            | "Won"
                            | "Nominated"),
                  })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              >

                <option value="">
                  Select Result
                </option>

                <option value="Won">
                  Won
                </option>

                <option value="Nominated">
                  Nominated
                </option>

              </select>

            </div>

            {/* NOTES */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm text-zinc-400">
                Notes
              </label>

              <textarea
                value={
                  editingAward.notes ??
                  ""
                }
                onChange={(e) =>
                  setEditingAward({
                    ...editingAward,
                    notes: e.target.value,
                  })
                }
                rows={4}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
              />

            </div>

          </div>

          <div className="mt-6 flex gap-3">

            <button
              onClick={updateAward}
              className="rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black hover:bg-yellow-400"
            >
              Update Award
            </button>

            <button
              onClick={() =>
                setEditingAward(null)
              }
              className="rounded-lg bg-zinc-800 px-8 py-3 text-white hover:bg-zinc-700"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>
  );
}