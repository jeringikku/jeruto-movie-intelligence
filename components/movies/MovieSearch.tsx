export default function MovieSearch() {
  return (
    <div>
      <input
        type="text"
        placeholder="Search movies..."
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-yellow-500"
      />
    </div>
  );
}