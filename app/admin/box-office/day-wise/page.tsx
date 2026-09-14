"use client";

import { useSearchParams } from "next/navigation";
import { BoxOfficeTab } from "@/components/movies/BoxOfficeTab";

export default function DayWisePage() {
  const searchParams = useSearchParams();

  const movieIdParam = searchParams.get("movieId");
  const movieId = movieIdParam
    ? Number(movieIdParam)
    : null;

  if (!movieId) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="rounded-xl border border-yellow-500/30 bg-zinc-950 p-8 text-center">
          <h2 className="text-xl font-bold text-yellow-400">
            No Movie Selected
          </h2>

          <p className="mt-2 text-zinc-400">
            Please select a movie from the Box Office page first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <BoxOfficeTab movieId={movieId} />
    </div>
  );
}