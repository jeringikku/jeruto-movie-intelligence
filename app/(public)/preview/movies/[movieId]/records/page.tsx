import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/app/(public)/components/PublicHeader";

type Props = {
  params: Promise<{ movieId: string }>;
};

type MovieRecord = {
  id: number;
  movie_id: number;
  record_category: string;
  record_title: string;
  record_description: string | null;
  record_value: number | null;
  record_date: string | null;
  notes: string | null;
};

function formatRecordDate(date: string | null) {
  if (!date) return "—";

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

function RecordCard({
  record,
}: {
  record: MovieRecord;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-700">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div className="min-w-0">
          <span className="inline-flex rounded-md border border-violet-900/50 bg-violet-950/20 px-2 py-1 text-[8px] uppercase tracking-[0.14em] text-violet-400">
            {record.record_category}
          </span>

          <h3 className="mt-3 text-sm font-semibold leading-5 text-white">
            {record.record_title}
          </h3>
        </div>

        {record.record_value !== null && (
          <div className="shrink-0 text-right">
            <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-600">
              Value
            </p>

            <p className="mt-1 text-sm font-semibold text-zinc-200">
              {Number(record.record_value).toLocaleString("en-IN")}
            </p>
          </div>
        )}

      </div>

      {record.record_description && (
        <p className="mt-4 text-[10px] leading-5 text-zinc-500">
          {record.record_description}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-900 pt-3">

        {record.record_date && (
          <div>
            <span className="text-[8px] uppercase tracking-[0.14em] text-zinc-500">
              Recorded
            </span>

            <p className="mt-1 text-[9px] text-zinc-500">
              {formatRecordDate(record.record_date)}
            </p>
          </div>
        )}

        {record.notes && (
          <div className="min-w-0">
            <span className="text-[8px] uppercase tracking-[0.14em] text-zinc-700">
              Notes
            </span>

            <p className="mt-1 text-[9px] text-zinc-500">
              {record.notes}
            </p>
          </div>
        )}

      </div>

    </article>
  );
}

export default async function MovieRecordsPage({
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

  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      release_year,
      poster_url
    `)
    .eq("id", movieIdNumber)
    .single();

  if (movieError || !movie) {
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

  const { data: records, error: recordsError } = await supabase
    .from("movie_records")
    .select(`
      id,
      movie_id,
      record_category,
      record_title,
      record_description,
      record_value,
      record_date,
      notes
    `)
    .eq("movie_id", movie.id)
    .order("id", { ascending: false });

  if (recordsError) {
    console.error("Movie records error:", recordsError);
  }

  const movieRecords = (records || []) as MovieRecord[];

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
                Movie Records
              </p>

              <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
                {movie.title}
              </h1>

              <p className="mt-1 text-[10px] text-pink-500">
                {movie.release_year || "—"}
              </p>

              <p className="mt-3 max-w-xl text-[9px] leading-4 text-zinc-500">
                Records & Milestones achieved by this movie maintained by Jeruto Movie Intelligence.
              </p>

            </div>

          </div>
        </section>

        {/* Records Status */}
        <section className="mb-6 rounded-xl border border-zinc-900 bg-zinc-950/60 px-4 py-3">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-green-600">
                Recorded Achievements
              </p>

              <p className="mt-1 text-[10px] text-zinc-400">
                {movieRecords.length > 0
                  ? `${movieRecords.length} recorded achievement${
                      movieRecords.length === 1 ? "" : "s"
                    }`
                  : "No records have been recorded for this movie."}
              </p>
            </div>

            {movieRecords.length > 0 && (
              <div className="rounded-md border border-zinc-800 px-3 py-2">
                <span className="text-[9px] font-medium text-zinc-400">
                  JMI Records
                </span>
              </div>
            )}

          </div>

        </section>

        {/* Records */}
        <section className="mb-8">

          <div className="mb-4">
            <h2 className="text-sm font-semibold text-violet-400">
              Records Achieved
            </h2>

            <p className="mt-1 text-[9px] text-zinc-500">
              Records associated with this movie.
            </p>
          </div>

          {movieRecords.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">

              <p className="text-sm font-medium text-zinc-300">
                No records available
              </p>

              <p className="mt-2 text-[10px] text-zinc-600">
                No maintained record has been recorded
                by JMI for this movie.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

              {movieRecords.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                />
              ))}

            </div>
          )}

        </section>

        {/* Data Note */}
        <section className="mb-8 rounded-xl border border-zinc-900 bg-zinc-950/60 px-4 py-4">

          <p className="text-[9px] uppercase tracking-[0.16em] text-red-600">
            Data Note
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            Records displayed on this page are manually maintained
            by JMI. This section does not automatically calculate
            or infer records from box-office data.
          </p>

        </section>

        {/* JMI Records Model */}
        <section className="mb-8 rounded-xl border border-violet-950/50 bg-zinc-950 p-5">

          <p className="text-[9px] uppercase tracking-[0.18em] text-violet-400">
            JMI Records Model
          </p>

          <p className="mt-2 text-xs font-medium text-white">
            Manually Verified Movie Achievements
          </p>

          <p className="mt-2 max-w-3xl text-[9px] leading-5 text-zinc-600">
            JMI Records presents notable achievements associated
            with individual movies using manually maintained records.
            Only records entered into the JMI records system are
            displayed here.
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