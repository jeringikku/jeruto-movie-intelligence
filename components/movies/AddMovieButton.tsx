import Link from "next/link";

export default function AddMovieButton() {
  return (
    <Link href="/admin/movies/new">
      <button className="rounded-lg bg-yellow-500 px-5 py-2.5 font-semibold text-black transition hover:bg-yellow-400">
        + Add Movie
      </button>
    </Link>
  );
}