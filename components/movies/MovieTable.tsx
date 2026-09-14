"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import EmptyState from "./EmptyState";
import Link from "next/link";

export default function MovieTable() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  async function fetchMovies() {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setMovies(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-zinc-400">
        Loading movies...
      </div>
    );
  }

  if (movies.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700">
      <table className="w-full">
        <thead className="bg-zinc-900">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Year</th>
            <th className="px-4 py-3 text-left">Runtime</th>
          </tr>
        </thead>

        <tbody>
          {movies.map((movie) => (
            <tr
              key={movie.id}
              className="border-t border-zinc-700"
            >
            <td className="px-4 py-3">{movie.id}</td>
            <td className="px-4 py-3">
  <Link
    href={`/admin/movies/${movie.id}`}
    className="text-yellow-400 hover:text-yellow-300 hover:underline"
  >
    {movie.title}
  </Link>
</td>
            <td className="px-4 py-3">{movie.release_year}</td>
            <td className="px-4 py-3">{movie.runtime_minutes} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}