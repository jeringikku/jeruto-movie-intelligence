import AddMovieButton from "./AddMovieButton";

export default function MovieHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">🎬 Movies</h1>
        <p className="mt-2 text-zinc-400">
          Manage all movies in Jeruto Movie Intelligence
        </p>
      </div>

      <AddMovieButton />
    </div>
  );
}