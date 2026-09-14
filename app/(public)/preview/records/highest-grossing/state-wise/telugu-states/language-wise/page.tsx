import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";

const languages = [
  {
    name: "Telugu",
    slug: "telugu",
    description: "Highest-grossing Telugu movies",
  },
  {
    name: "Tamil",
    slug: "tamil",
    description: "Highest-grossing Tamil movies",
  },
  {
    name: "Malayalam",
    slug: "malayalam",
    description: "Highest-grossing Malayalam movies",
  },
  {
    name: "Hindi",
    slug: "hindi",
    description: "Highest-grossing Hindi movies",
  },
  {
    name: "Kannada",
    slug: "kannada",
    description: "Highest-grossing Kannada movies",
  },
  {
    name: "English",
    slug: "english",
    description: "Highest-grossing English-language movies",
  },
];

export default function TeluguStatesLanguageWisePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300">

      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Back */}

        <div className="mb-6">

          <Link
            href="/preview/records/highest-grossing/state-wise/telugu-states"
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>

            <span>
              Back to Telugu States Records
            </span>
          </Link>

        </div>

        {/* Header */}

        <section className="border-b border-zinc-900 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-green-400">
            TELUGU STATES · LANGUAGE-WISE
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            Language-wise Box Office Records
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-400">
            Explore the highest-grossing movies by
            primary language across Andhra Pradesh
            and Telangana.
          </p>

        </section>

        {/* Language selection */}

        <section className="mt-7">

          <div className="mb-3 text-[8px] font-medium tracking-[0.2em] text-pink-500">
            SELECT LANGUAGE
          </div>

          <div className="grid gap-2 sm:grid-cols-2">

            {languages.map((language) => (

              <Link
                key={language.slug}
                href={`/preview/records/highest-grossing/state-wise/telugu-states/language-wise/${language.slug}`}
                className="group rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 transition hover:border-violet-500/30 hover:bg-zinc-950/80"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <h2 className="text-[12px] font-medium text-yellow-500 transition group-hover:text-yellow-400">
                      {language.name}
                    </h2>

                    <p className="mt-1 text-[9px] leading-4 text-zinc-400">
                      {language.description}
                    </p>

                  </div>

                  <div className="shrink-0 text-[10px] text-zinc-700 transition group-hover:text-violet-400">
                    →
                  </div>

                </div>

              </Link>

            ))}

          </div>

        </section>

        {/* Definition */}

        <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">

          <div className="text-[8px] font-medium tracking-[0.2em] text-red-500">
            RECORD DEFINITION
          </div>

          <p className="mt-2 text-[9px] leading-5 text-zinc-400">
            Language-wise rankings classify movies
            using their primary language recorded in
            JMI. Secondary or dubbed language
            associations do not change the
            classification. Collections represent the
            combined current cumulative JMI theatrical
            data from Andhra Pradesh and Telangana.
          </p>

        </section>

        {/* Navigation */}

        <div className="mt-7 flex justify-between border-t border-zinc-900 pt-5">

          <Link
            href="/preview/records/highest-grossing/state-wise/telugu-states"
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            ← Telugu States Records
          </Link>

          <Link
            href="/preview/records/highest-grossing/state-wise/telugu-states/all-movies"
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            All Movies →
          </Link>

        </div>

      </main>

      {/* Footer */}

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">

        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · Telugu States Records
        </div>

      </footer>

    </div>
  );
}