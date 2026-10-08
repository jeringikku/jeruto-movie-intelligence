import Link from "next/link";
import PublicHeader from "../../../components/PublicHeader";
import MovieLibraryPageBanner from "../../../components/MovieLibraryPageBanner";
import { supabase } from "@/lib/supabase";

type Language = {
  id: number;
  name: string;
};

type MovieLanguageRow = {
  language_id: number;
  movie_id: number;
};

type MovieRow = {
  id: number;
};

export const dynamic = "force-dynamic";

export default async function MovieLibraryPage() {
  const [
    { data: languages, error: languagesError },
    { data: movieLanguages, error: movieLanguagesError },
  ] = await Promise.all([
    supabase
      .from("languages")
      .select("id, name")
      .order("name", { ascending: true }),

    supabase
      .from("movie_languages")
      .select("language_id, movie_id"),
  ]);

  if (languagesError) {
    console.error("Movie Library languages error:", languagesError);
  }

  if (movieLanguagesError) {
    console.error(
      "Movie Library movie languages error:",
      movieLanguagesError
    );
  }

  const languageRows = (languages || []) as Language[];
  const movieLanguageRows = (movieLanguages || []) as MovieLanguageRow[];

  const movieCountMap = new Map<number, Set<number>>();

  movieLanguageRows.forEach((row) => {
    const languageId = Number(row.language_id);
    const movieId = Number(row.movie_id);

    if (!languageId || !movieId) return;

    if (!movieCountMap.has(languageId)) {
      movieCountMap.set(languageId, new Set<number>());
    }

    movieCountMap.get(languageId)!.add(movieId);
  });

  const libraryLanguages = languageRows.map((language) => ({
    id: Number(language.id),
    name: language.name,
    movieCount: movieCountMap.get(Number(language.id))?.size || 0,
  }));

  return (
    <div className="min-h-screen bg-[#090705] text-white">
      <PublicHeader />

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
  <Link
    href="/"
    className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-[6px] font-medium uppercase tracking-[0.14em] text-violet-400 transition hover:border-yellow-500/30 hover:text-yellow-400"
  >
    <span className="text-xs">←</span>
    Back to JMI Homepage
  </Link>
</div>

      <main className="relative overflow-hidden">
        {/* Ambient library lighting */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-yellow-500/[0.035] blur-[120px]" />
          <div className="absolute left-[-120px] top-[420px] h-[380px] w-[380px] rounded-full bg-violet-500/[0.035] blur-[110px]" />
          <div className="absolute right-[-120px] top-[760px] h-[380px] w-[380px] rounded-full bg-yellow-500/[0.025] blur-[110px]" />
        </div>

        <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-7 sm:px-6 lg:px-8">

          

          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-[8px] uppercase tracking-[0.16em] text-yellow-500">
            <Link
              href="/"
              className="transition hover:text-yellow-300"
            >
              JMI
            </Link>

            <span>/</span>

            <span className="text-pink-400">
              Movie Library
            </span>
          </div>

          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-[#3b2818] bg-[#120d08] shadow-2xl">
            {/* Wood-like horizontal bands */}
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute inset-x-0 top-[16%] h-px bg-[#5a3b21]" />
              <div className="absolute inset-x-0 top-[34%] h-px bg-[#2c1d12]" />
              <div className="absolute inset-x-0 top-[53%] h-px bg-[#4b321d]" />
              <div className="absolute inset-x-0 top-[72%] h-px bg-[#291b11]" />
              <div className="absolute inset-x-0 top-[88%] h-px bg-[#4a301b]" />
            </div>

            {/* Inner glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.10),transparent_62%)]" />

            <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/[0.06] shadow-[0_0_35px_rgba(234,179,8,0.08)]">
                <span className="text-2xl text-yellow-400">
                  🍿
                </span>
              </div>

              <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-yellow-500/90">
                Jeruto Movie Intelligence
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                Movie Library
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-[11px] leading-6 text-zinc-400 sm:text-xs">
                Explore the JMI cinematic archive by language.
                Discover movies from across Indian cinema in
                one curated library.
              </p>

              <div className="mx-auto mt-7 flex max-w-md items-center justify-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#6b4525] to-transparent" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-green-500">
                  Click on Your Favorite Language to Explore the Movies..
                </span>

                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#6b4525] to-transparent" />
              </div>
            </div>
          </div>

          <MovieLibraryPageBanner />

          {/* Library shelf */}
          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[8px] uppercase tracking-[0.2em] text-yellow-500/90">
                  The JMI Collection
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Browse by Language
                </h2>

                <p className="mt-3 text-[8px] uppercase tracking-[0.2em] text-green-500/90">
                  Click on any Language to view the movies on that language as per JMI database.
                </p>
              </div>

              <p className="hidden text-[8px] uppercase tracking-[0.14em] text-zinc-600 sm:block">
                {libraryLanguages.length} languages
              </p>
            </div>

            <div className="rounded-2xl border border-[#3b2818] bg-[#0e0906] p-3 shadow-2xl sm:p-5">
              {/* Top shelf lighting */}
              <div className="mb-5 h-2 rounded-full border border-[#5c3c21] bg-gradient-to-b from-[#6b4525] to-[#291b11] shadow-[0_4px_14px_rgba(0,0,0,0.7)]" />

              <div className="grid grid-cols-3 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-12 xl:grid-cols-5">
                {libraryLanguages.map((language) => (
                  <Link
                    key={language.id}
                    href={`/preview/movies/library/${language.id}`}
                    className="group relative min-h-[150px] overflow-visible rounded-lg border border-[#4a301b] bg-gradient-to-br from-[#24160d] via-[#160d08] to-[#0b0704] p-3 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-yellow-500/40 hover:shadow-[0_14px_35px_rgba(0,0,0,0.55)]"
                  >
                    {/* Book spine */}
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#7b542c] via-[#3b2515] to-[#704a26] opacity-80" />

                    {/* Decorative vertical lines */}
                    <div className="pointer-events-none absolute left-3 top-0 h-full w-px bg-[#6a4525]/40" />
                    <div className="pointer-events-none absolute right-3 top-0 h-full w-px bg-[#6a4525]/20" />

                    {/* Top label */}
                    <div className="relative flex items-center justify-between">
                      <span className="text-[5.5px] uppercase tracking-[0.28em] text-yellow-500/80">
                        JMI Volume
                      </span>

                      <span className="text-[8px] text-yellow-500/40 transition group-hover:text-yellow-400">
                        →
                      </span>
                    </div>

                    {/* Language */}
                    <div className="relative mt-10 text-center">
  <p className="text-[10px] font-semibold leading-5 tracking-[-0.02em] text-zinc-350 transition group-hover:text-yellow-300 sm:text-[15px]">
    {language.name}
  </p>

                      <div className="mt-3 h-px w-12 bg-gradient-to-r from-yellow-500/60 to-transparent" />

                      <p className="mt-3 text-[6px] uppercase tracking-[0.44em] text-green-500">
                        {language.movieCount.toLocaleString("en-IN")}{" "}
                        {language.movieCount === 1
                          ? "Movie"
                          : "Movies"}
                      </p>
                    </div>

                    {/* Bottom decorative mark */}

                    {/* Wooden shelf beneath the book */}
<div className="pointer-events-none absolute -bottom-5 left-[-4px] right-[-4px] h-4 rounded-sm border border-[#5c3c21] bg-gradient-to-b from-[#80552d] via-[#51331c] to-[#2a1a0e] shadow-[0_7px_12px_rgba(0,0,0,0.75)]">
  <div className="absolute inset-x-2 top-[3px] h-px bg-[#a87945]/40" />
  <div className="absolute inset-x-1 bottom-[3px] h-px bg-black/40" />
</div>
                    
                  </Link>
                ))}
              </div>

              {/* Bottom shelf */}
              <div className="mt-5 h-3 rounded-full border border-[#5c3c21] bg-gradient-to-b from-[#704a27] via-[#3c2515] to-[#21140c] shadow-[0_7px_18px_rgba(0,0,0,0.8)]" />
            </div>
          </section>

          {/* Footer navigation */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-6 sm:flex-row">
            <p className="text-center text-[8px] uppercase tracking-[0.14em] text-zinc-700 sm:text-left">
              JMI Movie Library · Explore Indian Cinema
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/preview/movies"
                className="text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-500 transition hover:text-white"
              >
                Classic Movies Page
              </Link>

              <Link
                href="/"
                className="text-[8px] font-medium uppercase tracking-[0.14em] text-yellow-500/80 transition hover:text-yellow-300"
              >
                Back to JMI
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}