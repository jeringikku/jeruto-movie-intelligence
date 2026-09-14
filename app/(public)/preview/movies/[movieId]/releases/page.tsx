import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/app/(public)/components/PublicHeader";

type Props = {
  params: Promise<{ movieId: string }>;
};

function formatReleaseDate(date: string | null) {
  if (!date) return "Not Available";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ReleaseCard({
  label,
  date,
  description,
}: {
  label: string;
  date: string | null;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
      <p className="text-[8px] uppercase tracking-[0.18em] text-red-400">
        {label}
      </p>

      <div className="mt-4">
        <p className="text-sm font-normal text-white sm:text-xl">
          {formatReleaseDate(date)}
        </p>

        <p className="mt-2 text-[9px] leading-4 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default async function MovieReleasesPage({
  params,
}: Props) {
  const { movieId } = await params;

  const movieIdNumber = Number(movieId);

  if (!Number.isFinite(movieIdNumber)) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PublicHeader />

        <main className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm text-red-400">
            Invalid movie ID.
          </p>
        </main>
      </div>
    );
  }

  const { data: movie, error } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      release_year,
      poster_url,
      release_date,
      ott_release_date
    `)
    .eq("id", movieIdNumber)
    .single();

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PublicHeader />

        <main className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm text-red-400">
            Movie not found.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Back to Movie */}
        <div className="mb-4">
          <Link
            href={`/preview/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Movie</span>
          </Link>
        </div>

        {/* Movie Header */}
        <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-4">

            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="h-[105px] w-[70px] shrink-0 rounded-lg border border-zinc-800 object-cover sm:h-[135px] sm:w-[90px]"
              />
            ) : (
              <div className="flex h-[105px] w-[70px] shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-[9px] text-zinc-700 sm:h-[135px] sm:w-[90px]">
                NO POSTER
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.18em] text-violet-400">
                Release Intelligence
              </p>

              <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
                {movie.title}
              </h1>

              <p className="mt-1 text-[10px] text-pink-500">
                {movie.release_year || "—"}
              </p>

              <p className="mt-3 max-w-xl text-[9px] leading-4 text-zinc-500">
                Theatrical and OTT release timeline maintained by JMI.
              </p>
            </div>

          </div>
        </section>

        {/* Release Information */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-violet-400">
              Release Dates
            </h2>

            <p className="mt-1 text-[10px] text-zinc-500">
              Officially recorded release dates available in the JMI movie record.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <ReleaseCard
              label="Theatrical Release"
              date={movie.release_date}
              description="Original theatrical release date of the movie."
            />

            <ReleaseCard
              label="OTT Release"
              date={movie.ott_release_date}
              description="Digital / OTT release date of the movie."
            />

          </div>
        </section>

        {/* Data Note */}
        <section className="mb-8 rounded-xl border border-zinc-900 bg-zinc-950/60 px-4 py-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-green-400">
            Data Note
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            Release dates shown here are based on the release
            information maintained in the JMI movie database.
            If a date has not been recorded, it is shown as
            Not Available.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 border-t border-zinc-900 pt-6">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="rounded-lg border border-zinc-800 px-4 py-2 text-[9px] text-zinc-500 transition hover:border-zinc-600 hover:text-white"
          >
            ← Back to Movie Intelligence
          </Link>

          <Link
            href="/preview"
            className="rounded-lg border border-zinc-800 px-4 py-2 text-[9px] text-zinc-500 transition hover:border-zinc-600 hover:text-white"
          >
            JMI Home
          </Link>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-zinc-900 py-6 text-center">
        <p className="text-[9px] text-zinc-700">
          © {new Date().getFullYear()} Jeruto Movie Intelligence
        </p>
      </footer>
    </div>
  );
}