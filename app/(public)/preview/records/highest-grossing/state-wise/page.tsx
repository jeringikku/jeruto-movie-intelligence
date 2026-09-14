import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";

function MarketOption({
  number,
  title,
  subtitle,
  description,
  href,
}: {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-zinc-900 bg-zinc-950/60 p-5 transition hover:border-violet-500/30 hover:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <div className="mb-5 text-[8px] tracking-[0.25em] text-green-500">
            {number}
          </div>

          <div className="text-[10px] font-medium tracking-[0.2em] text-violet-400">
            {subtitle}
          </div>

          <h2 className="mt-2 text-[15px] font-medium tracking-tight text-yellow-400">
            {title}
          </h2>

          <p className="mt-2 max-w-lg text-[9px] leading-5 text-zinc-500">
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

export default function StateWiseRecordsPage() {
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
            STATE-WISE RECORDS
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            Highest-grossing movies
            by market.
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-500">
            Explore all-time and year-wise
            theatrical records across JMI's
            four principal Indian markets.
          </p>

        </section>

        {/* Markets */}

        <section className="mt-7 space-y-3">

          <MarketOption
            number="01"
            subtitle="KERALA"
            title="Kerala Records"
            description="Explore the highest-grossing movies in Kerala, including overall, non-Malayalam and language-wise records."
            href="/preview/records/highest-grossing/state-wise/kerala"
          />

          <MarketOption
            number="02"
            subtitle="TAMIL NADU"
            title="Tamil Nadu Records"
            description="Explore the highest-grossing movies in Tamil Nadu, including overall, non-Tamil and language-wise records."
            href="/preview/records/highest-grossing/state-wise/tamil-nadu"
          />

          <MarketOption
            number="03"
            subtitle="KARNATAKA"
            title="Karnataka Records"
            description="Explore the highest-grossing movies in Karnataka, including overall, non-Kannada and language-wise records."
            href="/preview/records/highest-grossing/state-wise/karnataka"
          />

          <MarketOption
            number="04"
            subtitle="TELUGU STATES"
            title="Telugu States Records"
            description="Explore combined Andhra Pradesh and Telangana records, including overall, non-Telugu and language-wise performances."
            href="/preview/records/highest-grossing/state-wise/telugu-states"
          />

        </section>

        {/* Market definition */}

        <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">

          <div className="text-[8px] font-medium tracking-[0.2em] text-green-500">
            MARKET DEFINITION
          </div>

          <div className="mt-3 space-y-2 text-[9px] leading-5 text-zinc-500">

            <p>
              Kerala records use the Kerala
              state-level collection recorded
              in JMI.
            </p>

            <p>
              Tamil Nadu records use the Tamil
              Nadu state-level collection.
            </p>

            <p>
              Karnataka records use the Karnataka
              state-level collection.
            </p>

            <p>
              Telugu States records combine
              Andhra Pradesh and Telangana
              collections.
            </p>

          </div>

        </section>

      </main>

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · State-wise Records
        </div>
      </footer>

    </div>
  );
}