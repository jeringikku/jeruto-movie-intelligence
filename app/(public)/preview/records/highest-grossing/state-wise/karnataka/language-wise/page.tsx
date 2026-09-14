import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";

const languages = [
    {
    name: "Kannada",
    slug: "kannada",
    description: "Highest grossing Kannada movies in Karnataka",
  },
  {
    name: "Malayalam",
    slug: "malayalam",
    description: "Highest grossing Malayalam movies in Karnataka",
  },
  {
    name: "Tamil",
    slug: "tamil",
    description: "Highest grossing Tamil movies in Karnataka",
  },
  {
    name: "Telugu",
    slug: "telugu",
    description: "Highest grossing Telugu movies in Karnataka",
  },
  {
    name: "Hindi",
    slug: "hindi",
    description: "Highest grossing Hindi movies in Karnataka",
  },
  
  {
    name: "English",
    slug: "english",
    description: "Highest grossing English / Hollywood movies in Karnataka",
  },
];

export default function KarnatakaLanguageWisePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300">

      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Back */}

        <div className="mb-6">
          <Link
            href="/preview/records/highest-grossing/state-wise/karnataka"
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Karnataka Records</span>
          </Link>
        </div>

        {/* Header */}

        <section className="border-b border-zinc-900 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-green-500">
            KARNATAKA · LANGUAGE-WISE
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            Highest Grossing by Language
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-400">
            Explore Karnataka's highest-grossing movies
            across major original languages.
          </p>

        </section>

        {/* Language Selection */}

        <section className="mt-7">

          <div className="mb-3 text-[8px] font-medium tracking-[0.2em] text-pink-500">
            SELECT LANGUAGE
          </div>

          <div className="grid gap-2 sm:grid-cols-2">

            {languages.map((language) => (
              <Link
                key={language.slug}
                href={`/preview/records/highest-grossing/state-wise/karnataka/language-wise/${language.slug}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 transition hover:border-violet-500/30 hover:bg-zinc-950"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <h2 className="text-[12px] font-medium text-yellow-400 transition group-hover:text-zinc-100">
                      {language.name}
                    </h2>

                    <p className="mt-1 text-[9px] leading-4 text-zinc-500">
                      {language.description}
                    </p>

                  </div>

                  <div className="shrink-0 text-[11px] text-zinc-800 transition group-hover:text-violet-400">
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

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            Language classification is based exclusively
            on the primary language recorded for each
            movie in JMI. Secondary or dubbed languages
            do not affect the classification.
          </p>

        </section>

        {/* Navigation */}

        <div className="mt-7 border-t border-zinc-900 pt-5">

          <Link
            href="/preview/records/highest-grossing/state-wise/karnataka"
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            ← Karnataka Records
          </Link>

        </div>

      </main>

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">

        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · Karnataka Language Records
        </div>

      </footer>

    </div>
  );
}