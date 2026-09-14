import MovieWorkspace from "@/components/movies/MovieWorkspace";

import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MovieDetailsPage({ params }: Props) {
  const { id } = await params;

  const { data: movie } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .single();

  if (!movie) {
    return (
      <div className="text-red-500 text-xl">
        Movie not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h1 className="text-3xl font-bold text-white">
          {movie.title}
        </h1>

        <p className="mt-2 text-zinc-400">
          {movie.original_title}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">

          <div>
            <p className="text-zinc-500 text-sm">Movie ID</p>
            <p className="text-white font-semibold">{movie.id}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Release Year</p>
            <p className="text-white font-semibold">
              {movie.release_year ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Runtime</p>
            <p className="text-white font-semibold">
              {movie.runtime_minutes ?? "-"} min
            </p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Slug</p>
            <p className="text-yellow-400 font-semibold">
              {movie.slug}
            </p>
          </div>

        </div>

      
      </div>
    <MovieWorkspace movie={movie} />
  </div>

 );
}