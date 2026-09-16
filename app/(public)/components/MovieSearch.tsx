"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Suggestion = {
  id: number;
  title: string;
  original_title: string | null;
  release_year: number | null;
  poster_url: string | null;
};

export default function MovieSearch({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("movies")
        .select(`
          id,
          title,
          original_title,
          release_year,
          poster_url
        `)
        .eq("is_active", true)
        .or(
          `title.ilike.%${trimmed}%,original_title.ilike.%${trimmed}%`
        )
        .order("release_date", {
          ascending: false,
        })
        .limit(8);

      if (error) {
        console.error("Movie autocomplete error:", error);
        setSuggestions([]);
      } else {
        setSuggestions((data || []) as Suggestion[]);
      }

      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node
        )
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function openMovie(movieId: number) {
    setShowSuggestions(false);
    router.push(`/preview/movies/${movieId}`);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) {
      router.push("/preview/movies");
      return;
    }

    setShowSuggestions(false);

    router.push(
      `/preview/movies?q=${encodeURIComponent(trimmed)}`
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="relative max-w-2xl"
    >
      <form
        onSubmit={handleSubmit}
        className="flex h-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
      >
        <div className="flex min-w-0 flex-1 items-center px-3">

          <span className="mr-2 text-xs text-zinc-700">
            ⌕
          </span>

          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search movies..."
            autoComplete="off"
            className="w-full bg-transparent text-[11px] text-zinc-300 outline-none placeholder:text-zinc-700"
          />

          {loading && (
            <span className="mr-2 text-[8px] text-zinc-700">
              ...
            </span>
          )}

        </div>

        <button
          type="submit"
          className="bg-yellow-500 px-4 text-[10px] font-medium text-black transition hover:bg-yellow-300"
        >
          Search
        </button>
      </form>

      {/* =====================================================
          AUTOCOMPLETE
      ===================================================== */}

      {showSuggestions &&
        query.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">

            {loading ? (
              <div className="px-4 py-4 text-[9px] text-zinc-600">
                Searching JMI database...
              </div>
            ) : suggestions.length > 0 ? (
              <div>

                {suggestions.map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() =>
                      openMovie(movie.id)
                    }
                    className="flex w-full items-center gap-3 border-b border-zinc-900 px-3 py-3 text-left transition last:border-b-0 hover:bg-zinc-900"
                  >

                    {/* Poster */}

                    <div className="flex h-12 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-zinc-800 bg-black">

                      {movie.poster_url ? (
                        <img
                          src={movie.poster_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] text-zinc-800">
                          ◈
                        </span>
                      )}

                    </div>

                    {/* Movie information */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center justify-between gap-3">

                        <p className="truncate text-[11px] font-medium text-zinc-200">
                          {movie.title}
                        </p>

                        <span className="shrink-0 text-[8px] text-zinc-700">
                          {movie.release_year ?? "—"}
                        </span>

                      </div>

                      {movie.original_title &&
                        movie.original_title !==
                          movie.title && (
                          <p className="mt-1 truncate text-[8px] text-zinc-700">
                            {movie.original_title}
                          </p>
                        )}

                    </div>

                    <span className="shrink-0 text-[10px] text-zinc-700">
                      ↗️
                    </span>

                  </button>
                ))}

              </div>
            ) : (
              <div className="px-4 py-4">

                <p className="text-[9px] text-zinc-500">
                  No matching movies found.
                </p>

                <p className="mt-1 text-[8px] text-zinc-700">
                  Try another title or spelling.
                </p>

              </div>
            )}

          </div>
        )}
    </div>
  );
}