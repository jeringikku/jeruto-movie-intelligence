import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";

function RecordOption({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-zinc-500 bg-zinc-950/60 p-5 transition hover:border-violet-500/30 hover:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-4">

        <div>
          <div className="mb-4 text-[8px] tracking-[0.25em] text-yellow-500">
            {number}
          </div>

          <h2 className="text-[12px] font-semibold tracking-tight text-green-600">
            {title}
          </h2>

          <p className="mt-2 max-w-md text-[10px] leading-5 text-zinc-400">
            {description}
          </p>
        </div>

        <div className="pt-5 text-[13px] text-zinc-700 transition group-hover:translate-x-1 group-hover:text-violet-400">
          →
        </div>

      </div>
    </Link>
  );
}

export default function HighestGrossingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300">

      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Back */}

        <div className="mb-6">
          <Link
            href="/preview/movies"
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Movies</span>
          </Link>
        </div>

        {/* Header */}

        <section className="border-b border-zinc-900 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-green-400">
            HIGHEST GROSSING
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-pink-400 sm:text-2xl">
            India's Highest Grossing Movies 💰
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-400">
            Explore all-time and year-wise box-office records
            calculated from JMI trade data.
          </p>

        </section>

        {/* Options */}

        <section className="mt-7 space-y-3">

          <RecordOption
            number="01"
            title="ALL - INDIA RECORDS 🌐 "
            description="Top 100 highest-grossing Indian movies across the country, ranked by current JMI box-office data."
            href="/preview/records/highest-grossing/all-india"
          />

          <RecordOption
            number="02"
            title="STATE - WISE RECORDS  📚"
            description="Highest-grossing movies across Kerala, Tamil Nadu, Karnataka and the combined Telugu States."
            href="/preview/records/highest-grossing/state-wise"
          />

        </section>

        {/* Data note */}

        <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">

          <div className="text-[8px] font-medium tracking-[0.2em] text-red-500">
            DATA NOTE
          </div>

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            Rankings are generated dynamically from the current
            JMI box-office database. As movie collections are
            updated, rankings automatically adjust to reflect
            the latest available data.
          </p>

        </section>

      </main>

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · Historical Records
        </div>
      </footer>

    </div>
  );
}