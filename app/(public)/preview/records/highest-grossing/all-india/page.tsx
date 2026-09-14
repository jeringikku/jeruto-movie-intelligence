import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";

function RecordOption({
  number,
  title,
  description,
  metric,
  href,
}: {
  number: string;
  title: string;
  description: string;
  metric: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-zinc-500 bg-zinc-950/60 p-5 transition hover:border-violet-500/30 hover:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <div className="mb-5 text-[8px] tracking-[0.25em] text-yellow-400">
            {number}
          </div>

          <div className="text-[9px] font-medium tracking-[0.2em] text-violet-400">
            {metric}
          </div>

          <h2 className="mt-2 text-[13px] font-medium tracking-tight text-zinc-200">
            {title}
          </h2>

          <p className="mt-2 max-w-lg text-[10px] leading-5 text-zinc-500">
            {description}
          </p>

        </div>

        <div className="pt-8 text-[13px] text-zinc-700 transition group-hover:translate-x-1 group-hover:text-violet-400">
          →
        </div>

      </div>
    </Link>
  );
}

export default function AllIndiaRecordsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300">

      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Back */}

        <div className="mb-6">
          <Link
            href="/preview/records/highest-grossing"
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Highest Grossing</span>
          </Link>
        </div>

        {/* Header */}

        <section className="border-b border-zinc-900 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-pink-400">
            ALL-INDIA RECORDS
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            India's highest-grossing
            records.
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-400">
            Explore India's biggest movie performances
            through worldwide and domestic box-office
            rankings.
          </p>

        </section>

        {/* Selection */}

        <section className="mt-7 space-y-3">

          <RecordOption
            number="01"
            metric="WORLDWIDE COLLECTION"
            title="All-Time Highest Grossing Indian Movies"
            description="The top 100 Indian movies ranked by worldwide theatrical collection, combining India and overseas box-office performance."
            href="/preview/records/highest-grossing/all-india/worldwide"
          />

          <RecordOption
            number="02"
            metric="INDIA DOMESTIC COLLECTION"
            title="All-Time Highest Grossing Movies in India"
            description="The top 100 movies ranked exclusively by their theatrical collection within India, without overseas revenue."
            href="/preview/records/highest-grossing/all-india/domestic"
          />

        </section>

        {/* Comparison note */}

        <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">

          <div className="text-[8px] font-medium tracking-[0.2em] text-green-500">
            RECORD DEFINITIONS
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            <div>
              <div className="text-[10px] font-medium text-yellow-500">
                World wide
              </div>

              <p className="mt-1 text-[9px] leading-5 text-zinc-400">
                India + Overseas theatrical collection.
              </p>
            </div>

            <div>
              <div className="text-[10px] font-medium text-yellow-500">
                India
              </div>

              <p className="mt-1 text-[9px] leading-5 text-zinc-400">
                India domestic theatrical collection only.
              </p>
            </div>

          </div>

        </section>

        {/* Navigation */}

        <div className="mt-7 flex justify-between border-t border-zinc-700 pt-5">

          <Link
            href="/preview/records/highest-grossing"
            className="text-[10px] text-violet-400 transition hover:text-violet-400"
          >
            ← Highest Grossing
          </Link>

          <Link
            href="/preview/records/highest-grossing/state-wise"
            className="text-[10px] text-violet-400 transition hover:text-violet-400"
          >
            State-wise Records →
          </Link>

        </div>

      </main>

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · All-India Records
        </div>
      </footer>

    </div>
  );
}