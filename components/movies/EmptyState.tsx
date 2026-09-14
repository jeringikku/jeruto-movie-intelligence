export default function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">
      <h2 className="text-2xl font-semibold text-white">
        No Movies Found
      </h2>

      <p className="mt-2 text-zinc-400">
        Click "Add Movie" to create your first movie.
      </p>
    </div>
  );
}