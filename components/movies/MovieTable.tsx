"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import EmptyState from "./EmptyState";
import Link from "next/link";

type Movie = {
  id: number;
  title: string | null;
  original_title: string | null;
  release_year: number | null;
  runtime_minutes: number | null;
};

const PAGE_SIZE = 100;

export default function MovieTable() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input to avoid querying on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let query = supabase
        .from("movies")
        .select(
          "id, title, original_title, release_year, runtime_minutes",
          { count: "exact" }
        );

      // Search by title or original title.
      if (search) {
        const safeSearch = search.replace(/[,%()]/g, " ").trim();

        if (safeSearch) {
          query = query.or(
            `title.ilike.%${safeSearch}%,original_title.ilike.%${safeSearch}%`
          );
        }
      }

      // Filter by movie ID range.
      if (startId.trim()) {
        const minId = Number(startId);

        if (!Number.isInteger(minId) || minId < 0) {
          setError("Enter a valid starting movie ID.");
          setMovies([]);
          setTotalCount(0);
          setHasMore(false);
          setLoading(false);
          return;
        }

        query = query.gte("id", minId);
      }

      if (endId.trim()) {
        const maxId = Number(endId);

        if (!Number.isInteger(maxId) || maxId < 0) {
          setError("Enter a valid ending movie ID.");
          setMovies([]);
          setTotalCount(0);
          setHasMore(false);
          setLoading(false);
          return;
        }

        query = query.lte("id", maxId);
      }

      // Filter by release year.
      if (selectedYear) {
        query = query.eq("release_year", Number(selectedYear));
      }

      // Prevent an invalid range.
      if (
        startId.trim() &&
        endId.trim() &&
        Number(startId) > Number(endId)
      ) {
        setError("Starting ID cannot be greater than ending ID.");
        setMovies([]);
        setTotalCount(0);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error: fetchError, count } = await query
        .order("id", { ascending: false })
        .range(from, to);

      if (fetchError) {
        throw fetchError;
      }

      const results = (data ?? []) as Movie[];

      setMovies(results);
      setTotalCount(count ?? 0);
      setHasMore(results.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Unable to load movies. Please try again.");
      setMovies([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [search, startId, endId, selectedYear, page]);

  // Fetch when filters or page change.
  useEffect(() => {
    void fetchMovies();
  }, [fetchMovies]);

  // Reset pagination when filters change.
  useEffect(() => {
    setPage(0);
  }, [startId, endId, selectedYear, search]);

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setStartId("");
    setEndId("");
    setSelectedYear("");
    setPage(0);
    setError("");
  }

  // Build year options from the current database.
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    async function fetchYears() {
      const { data, error: yearError } = await supabase
        .from("movies")
        .select("release_year")
        .not("release_year", "is", null)
        .order("release_year", { ascending: false })
        .limit(2000);

      if (yearError) {
        console.error("Error fetching release years:", yearError);
        return;
      }

      const uniqueYears = Array.from(
        new Set(
          (data ?? [])
            .map((row) => Number(row.release_year))
            .filter((year) => Number.isInteger(year) && year > 0)
        )
      ).sort((a, b) => b - a);

      setYears(uniqueYears);
    }

    void fetchYears();
  }, []);

  const firstResult = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const lastResult = Math.min((page + 1) * PAGE_SIZE, totalCount);

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <label
              htmlFor="movie-search"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Search movies
            </label>

            <input
              id="movie-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Enter movie title..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-500"
            />
          </div>

          {/* Starting ID */}
          <div>
            <label
              htmlFor="movie-start-id"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              From Movie ID
            </label>

            <input
              id="movie-start-id"
              type="number"
              min="0"
              step="1"
              value={startId}
              onChange={(event) => {
                setStartId(event.target.value);
                setPage(0);
              }}
              placeholder="e.g. 140"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-500"
            />
          </div>

          {/* Ending ID */}
          <div>
            <label
              htmlFor="movie-end-id"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              To Movie ID
            </label>

            <input
              id="movie-end-id"
              type="number"
              min="0"
              step="1"
              value={endId}
              onChange={(event) => {
                setEndId(event.target.value);
                setPage(0);
              }}
              placeholder="e.g. 200"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-500"
            />
          </div>

          {/* Release year */}
          <div>
            <label
              htmlFor="movie-year"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Release Year
            </label>

            <select
              id="movie-year"
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                setPage(0);
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500"
            >
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-400"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Tip: Enter ID 140 in “From Movie ID” and 200 in “To Movie ID” to
          display movies within that range. You can combine the ID, year, and
          search filters.
        </p>
      </div>

      {/* Results summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-400">
        <span>
          {loading
            ? "Loading results..."
            : `${totalCount.toLocaleString()} matching movie(s)`}
        </span>

        {!loading && totalCount > 0 && (
          <span>
            Showing {firstResult.toLocaleString()}–
            {lastResult.toLocaleString()}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-lg border border-zinc-800 p-6 text-zinc-400">
          Loading movies...
        </div>
      )}

      {/* Empty results */}
      {!loading && !error && movies.length === 0 && <EmptyState />}

      {/* Movie table */}
      {!loading && movies.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-700">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-zinc-900 text-zinc-300">
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
                  className="border-t border-zinc-800 transition hover:bg-zinc-900/70"
                >
                  <td className="px-4 py-3 text-zinc-400">{movie.id}</td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/movies/${movie.id}`}
                      className="font-medium text-yellow-400 hover:text-yellow-300 hover:underline"
                    >
                      {movie.title || movie.original_title || "Untitled movie"}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-zinc-300">
                    {movie.release_year ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-zinc-300">
                    {movie.runtime_minutes != null
                      ? `${movie.runtime_minutes} min`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalCount > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-zinc-400">
            Page {page + 1} of {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
          </span>

          <button
            type="button"
            disabled={!hasMore}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}