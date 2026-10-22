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

  type LibraryLanguage = (typeof libraryLanguages)[number];

  // Divide languages into rows according to the active screen layout.
  const chunkLanguages = (items: LibraryLanguage[], size: number) => {
    const rows: LibraryLanguage[][] = [];

    for (let i = 0; i < items.length; i += size) {
      rows.push(items.slice(i, i + size));
    }

    return rows;
  };

  // Preserve the existing wooden-book design and language navigation.
  const renderBook = (language: LibraryLanguage) => (
    <Link
      key={language.id}
      href={`/preview/movies/library/${language.id}`}
      className="group relative z-10 flex min-h-[170px] flex-col overflow-visible rounded-lg border border-[#4a301b] bg-gradient-to-br from-[#24160d] via-[#160d08] to-[#0b0704] p-3 shadow-[0_5px_12px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:border-yellow-500/40 hover:shadow-[0_14px_35px_rgba(0,0,0,0.65)]"
    >
      {/* BOOK SPINE */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1 rounded-l-lg bg-gradient-to-b from-[#9b7145] via-[#3b2515] to-[#704a26] opacity-80" />

      {/* VERTICAL BOOK GRAIN */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1 w-[2px] opacity-50"
        style={{
          background:
            "linear-gradient(180deg, rgba(190,139,81,0.25), rgba(20,10,4,0.5), rgba(190,139,81,0.12))",
        }}
      />

      {/* DECORATIVE VERTICAL LINES */}
      <div className="pointer-events-none absolute left-3 top-0 h-full w-px bg-[#6a4525]/40" />
      <div className="pointer-events-none absolute right-3 top-0 h-full w-px bg-[#6a4525]/20" />

      {/* BOOK LABEL */}
      <div className="relative flex items-center justify-between">
        <span className="text-[5.5px] uppercase tracking-[0.28em] text-yellow-500/80">
          JMI Volume
        </span>

        <span className="text-[8px] text-yellow-500/40 transition group-hover:text-yellow-400">
          →
        </span>
      </div>

      {/* LANGUAGE TITLE */}
      <div className="relative mt-10 flex-1 text-center">
        <p className="text-[10px] font-semibold leading-5 tracking-[-0.02em] text-zinc-350 transition group-hover:text-yellow-300 sm:text-[15px]">
          {language.name}
        </p>

        <div className="mt-3 h-px w-12 bg-gradient-to-r from-yellow-500/60 to-transparent" />

        <p className="mt-3 text-[6px] uppercase tracking-[0.44em] text-green-500">
          {language.movieCount.toLocaleString("en-IN")}{" "}
          {language.movieCount === 1 ? "Movie" : "Movies"}
        </p>
      </div>
    </Link>
  );

  // Create a separate bookshelf row for each group of books.
  const renderShelfRows = (
    columns: 3 | 4 | 5,
    gridColumnsClass: string
  ) =>
    chunkLanguages(libraryLanguages, columns).map((row, index) => (
      <div
        key={`${columns}-shelf-row-${index}`}
        className="relative pb-12"
      >
        {/* BOOKS ON THIS ROW */}
        <div className={`grid ${gridColumnsClass} items-stretch gap-x-3 sm:gap-x-3 lg:gap-x-4`}>
          {row.map((language) => renderBook(language))}
        </div>

        {/* WOODEN PLANK BENEATH THIS ROW */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-3 z-0 h-5 rounded-sm border border-[#694323] shadow-[0_7px_12px_rgba(0,0,0,0.75)]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                2deg,
                transparent 0px,
                transparent 4px,
                rgba(25,12,5,0.35) 5px,
                rgba(190,137,76,0.14) 6px,
                transparent 8px,
                transparent 13px
              ),
              linear-gradient(
                180deg,
                #9a6b3b 0%,
                #704725 18%,
                #51331c 55%,
                #2a190d 100%
              )
            `,
          }}
        >
          {/* Upper wooden highlight */}
          <div className="absolute inset-x-0 top-[2px] h-px bg-[#d0a06a]/50" />

          {/* Natural wood grain */}
          <div className="absolute inset-x-1 top-[5px] h-px bg-[#b2824d]/25" />

          {/* Dark lower edge */}
          <div className="absolute inset-x-0 bottom-[2px] h-[2px] bg-black/40" />
        </div>
      </div>
    ));

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
            <Link href="/" className="transition hover:text-yellow-300">
              JMI
            </Link>

            <span>/</span>

            <span className="text-pink-400">Movie Library</span>
          </div>

          {/* ============================================================
              MOVIE LIBRARY HERO — WEATHERED WOOD FRAME
          ============================================================ */}

          <div className="relative rounded-[19px] border-[5px] border-[#49301f] bg-gradient-to-br from-[#765137] via-[#49301f] to-[#24160e] p-[5px] shadow-[0_12px_30px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(220,180,130,0.25),inset_0_-3px_5px_rgba(0,0,0,0.45)] sm:border-[7px] sm:p-[7px]">
            {/* WEATHERED WOOD GRAIN */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[14px] opacity-90"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    2deg,
                    transparent 0px,
                    transparent 8px,
                    rgba(207, 158, 106, 0.13) 9px,
                    rgba(25, 14, 8, 0.20) 10px,
                    transparent 12px,
                    transparent 19px
                  ),
                  repeating-linear-gradient(
                    178deg,
                    transparent 0px,
                    transparent 27px,
                    rgba(20, 11, 6, 0.18) 28px,
                    transparent 30px,
                    transparent 39px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(0, 0, 0, 0.30),
                    transparent 20%,
                    rgba(208, 156, 100, 0.08) 50%,
                    transparent 78%,
                    rgba(0, 0, 0, 0.25)
                  )
                `,
              }}
            />

            {/* WOODEN FRAME HIGHLIGHTS */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-gradient-to-b from-[#c19a6c]/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[4px] bg-gradient-to-t from-[#130b06] via-[#2c1a10] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[3px] bg-gradient-to-r from-[#160d07] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[3px] bg-gradient-to-l from-[#160d07] to-transparent" />

            {/* WEATHERED WOOD DETAILS */}
            <div className="pointer-events-none absolute left-[18%] top-[2px] z-20 h-3 w-px rotate-[18deg] bg-[#d1a477]/40" />
            <div className="pointer-events-none absolute right-[22%] bottom-[2px] z-20 h-3 w-px -rotate-[20deg] bg-black/40" />

            {/* WOODEN NAILS */}
            <div className="pointer-events-none absolute left-2 top-2 z-30 flex h-[10px] w-[10px] items-center justify-center rounded-full border border-[#c1a17a]/60 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:left-3 sm:top-3">
              <span className="h-[3px] w-[3px] rounded-full bg-[#160d08] shadow-[0_1px_1px_rgba(255,220,170,0.35)]" />
            </div>

            <div className="pointer-events-none absolute right-2 top-2 z-30 flex h-[10px] w-[10px] items-center justify-center rounded-full border border-[#c1a17a]/60 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:right-3 sm:top-3">
              <span className="h-[3px] w-[3px] rounded-full bg-[#160d08] shadow-[0_1px_1px_rgba(255,220,170,0.35)]" />
            </div>

            <div className="pointer-events-none absolute bottom-2 left-2 z-30 flex h-[10px] w-[10px] items-center justify-center rounded-full border border-[#c1a17a]/50 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:bottom-3 sm:left-3">
              <span className="h-[3px] w-[3px] rounded-full bg-[#160d08]" />
            </div>

            <div className="pointer-events-none absolute bottom-2 right-2 z-30 flex h-[10px] w-[10px] items-center justify-center rounded-full border border-[#c1a17a]/50 bg-gradient-to-br from-[#94714c] via-[#493321] to-[#1c120b] shadow-[1px_2px_3px_rgba(0,0,0,0.8)] sm:bottom-3 sm:right-3">
              <span className="h-[3px] w-[3px] rounded-full bg-[#160d08]" />
            </div>

            {/* ORIGINAL MOVIE LIBRARY BANNER */}
            <div className="relative overflow-hidden rounded-[12px] border border-[#21140d]/90 bg-[#120d08] shadow-[inset_0_1px_0_rgba(220,180,130,0.12),inset_0_-3px_5px_rgba(0,0,0,0.35)]">
              {/* ORIGINAL WOOD-LIKE HORIZONTAL BANDS */}
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute inset-x-0 top-[16%] h-px bg-[#5a3b21]" />
                <div className="absolute inset-x-0 top-[34%] h-px bg-[#2c1d12]" />
                <div className="absolute inset-x-0 top-[53%] h-px bg-[#4b321d]" />
                <div className="absolute inset-x-0 top-[72%] h-px bg-[#291b11]" />
                <div className="absolute inset-x-0 top-[88%] h-px bg-[#4a301b]" />
              </div>

              {/* ORIGINAL INNER GLOW */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.10),transparent_62%)]" />

              {/* ORIGINAL BANNER CONTENT */}
              <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/[0.06] shadow-[0_0_35px_rgba(234,179,8,0.08)]">
                  <span className="text-2xl text-yellow-400">🍿</span>
                </div>

                <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-yellow-500/90">
                  Jeruto Movie Intelligence
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                  Movie Library
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-[11px] leading-6 text-zinc-400 sm:text-xs">
                  Explore the JMI cinematic archive by language. Discover
                  movies from across Indian cinema in one curated library.
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
          </div>

          <MovieLibraryPageBanner />

          {/* ============================================================
              LIBRARY SHELF
          ============================================================ */}

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
                  Click on any Language to view the movies on that language as
                  per JMI database.
                </p>
              </div>

              <p className="hidden text-[8px] uppercase tracking-[0.14em] text-zinc-600 sm:block">
                {libraryLanguages.length} languages
              </p>
            </div>

            {/* WOODEN BOOKSHELF BACKGROUND */}
            <div
              className="relative isolate overflow-hidden rounded-2xl border border-[#5c3c21] p-3 shadow-2xl sm:p-5"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    2deg,
                    transparent 0px,
                    transparent 18px,
                    rgba(30, 15, 6, 0.30) 19px,
                    rgba(196, 143, 82, 0.12) 21px,
                    transparent 24px,
                    transparent 36px
                  ),
                  repeating-linear-gradient(
                    0deg,
                    rgba(10, 5, 2, 0.12) 0px,
                    rgba(10, 5, 2, 0.12) 1px,
                    transparent 2px,
                    transparent 45px
                  ),
                  linear-gradient(
                    90deg,
                    #29180d 0%,
                    #51331d 18%,
                    #392315 48%,
                    #51331d 78%,
                    #24150b 100%
                  )
                `,
                boxShadow:
                  "inset 0 0 25px rgba(0,0,0,0.55), 0 15px 30px rgba(0,0,0,0.35)",
              }}
            >
              {/* TOP SHELF LIGHTING */}
              <div className="mb-7 h-2 rounded-full border border-[#5c3c21] bg-gradient-to-b from-[#6b4525] to-[#291b11] shadow-[0_4px_14px_rgba(0,0,0,0.7)]" />

              {/* MOBILE AND TABLET: 3 BOOKS PER ROW */}
              <div className="lg:hidden">
                {renderShelfRows(3, "grid-cols-3")}
              </div>

              {/* LAPTOP: 4 BOOKS PER ROW */}
              <div className="hidden lg:block xl:hidden">
                {renderShelfRows(4, "grid-cols-4")}
              </div>

              {/* WIDE SCREENS: 5 BOOKS PER ROW */}
              <div className="hidden xl:block">
                {renderShelfRows(5, "grid-cols-5")}
              </div>
            </div>
          </section>

          {/* FOOTER NAVIGATION */}
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