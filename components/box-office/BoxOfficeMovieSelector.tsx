"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
  release_year: number | null;
};

type Props = {
  onMovieSelect: (movie: Movie) => void;
};

export default function BoxOfficeMovieSelector({
  onMovieSelect,
}: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  async function fetchMovies() {
    const { data, error } = await supabase
      .from("movies")
      .select("id, title, release_year")
      .order("title", { ascending: true });

    if (!error && data) {
      setMovies(data);
    }

    setLoading(false);
  }

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(movie: Movie) {
    setSelectedMovie(movie);
    setSearch(movie.title);
    onMovieSelect(movie);
  }

  return (
    <div className="relative">

      <label className="block text-sm font-semibold mb-2">
        Select Movie
      </label>

      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setSelectedMovie(null);
        }}
        placeholder="Search movies..."
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400"
      />

      {loading && (
        <div className="mt-2 text-sm text-zinc-500">
          Loading movies...
        </div>
      )}

      {!loading &&
        search.length > 0 &&
        !selectedMovie &&
        filteredMovies.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">

            {filteredMovies.map((movie) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => handleSelect(movie)}
                className="w-full text-left px-4 py-3 hover:bg-zinc-900 border-b border-zinc-800 last:border-b-0"
              >
                <div className="font-medium text-white">
                  {movie.title}
                </div>

                <div className="text-sm text-zinc-500">
                  {movie.release_year ?? "Year unavailable"}
                </div>
              </button>
            ))}

          </div>
        )}

      {!loading &&
        search.length > 0 &&
        !selectedMovie &&
        filteredMovies.length === 0 && (
          <div className="mt-2 bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-500">
            No movies found.
          </div>
        )}

      {selectedMovie && (
        <div className="mt-3 flex items-center justify-between bg-zinc-900 border border-yellow-500/30 rounded-lg px-4 py-3">

          <div>
            <div className="font-semibold text-yellow-400">
              {selectedMovie.title}
            </div>

            <div className="text-xs text-zinc-500">
              Movie ID: {selectedMovie.id}
            </div>
          </div>

          <span className="text-green-400 text-sm">
            Selected ✓
          </span>

        </div>
      )}

    </div>
  );
}