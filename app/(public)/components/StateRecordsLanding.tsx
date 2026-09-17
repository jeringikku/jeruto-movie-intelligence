import Link from "next/link";

type StateRecordsLandingProps = {
  marketName: string;
  marketLabel: string;
  marketDescription: string;
  motherLanguage: string;
  slug: string;
};

function RecordOption({
  number,
  label,
  title,
  description,
  href,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-violet-500/60 bg-zinc-950/60 p-5 transition hover:border-violet-500/30 hover:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <div className="mb-5 text-[8px] tracking-[0.25em] text-green-500">
            {number}
          </div>

          <div className="text-[9px] font-medium tracking-[0.2em] text-violet-400">
            {label}
          </div>

          <h2 className="mt-2 text-[13px] font-medium tracking-tight text-yellow-400">
            {title}
          </h2>

          <p className="mt-2 max-w-lg text-[9px] leading-5 text-zinc-300">
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

export default function StateRecordsLanding({
  marketName,
  marketLabel,
  marketDescription,
  motherLanguage,
  slug,
}: StateRecordsLandingProps) {
  return (
    <div className="min-h-screen bg-black text-zinc-300">

      {/* Header is kept outside this component */}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Back */}

        <div className="mb-6">
          <Link
            href="/preview/records/highest-grossing/state-wise"
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to State-wise Records</span>
          </Link>
        </div>

        {/* Header */}

        <section className="border-b border-zinc-500 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-green-400">
            {marketLabel}
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            {marketName} Records
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-500">
            {marketDescription}
          </p>

        </section>

        {/* Record options */}

        <section className="mt-7 space-y-3">

          <RecordOption
            number="01"
            label="ALL MOVIES"
            title={`All-Time Highest Grossing Movies in ${marketName}`}
            description={`The top 100 movies ranked by their current theatrical collection in ${marketName}, regardless of original language.`}
            href={`/preview/records/highest-grossing/state-wise/${slug}/all-movies`}
          />
  
          <RecordOption
            number="02"
            label={`NON-${motherLanguage.toUpperCase()}`}
            title={`All-Time Highest Grossing Non-${motherLanguage} Movies`}
            description={`The top 100 movies in ${marketName}, excluding movies whose original language is ${motherLanguage}.`}
            href={`/preview/records/highest-grossing/state-wise/${slug}/non-${motherLanguage.toLowerCase().replace(/\s+/g, "-")}`}
          />

          <RecordOption
            number="03"
            label="LANGUAGE-WISE RECORDS"
            title={`Highest Grossing Movies by Language`}
            description={`Explore the top 100 ${marketName} performers across Malayalam, Tamil, Telugu, Hindi, Kannada and English-language movies.`}
            href={`/preview/records/highest-grossing/state-wise/${slug}/language-wise`}
          />

        </section>

        {/* Market definition */}

        <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">

          <div className="text-[8px] font-medium tracking-[0.2em] text-red-500">
            MARKET DEFINITION
          </div>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            Rankings use current JMI state-level
            theatrical collection. Year-wise rankings
            will use the movie's release year while
            continuing to use its current cumulative
            collection in this market.
          </p>

        </section>

        {/* Navigation */}

        <div className="mt-7 border-t border-zinc-900 pt-5">

          <Link
            href="/preview/records/highest-grossing/state-wise"
            className="text-[9px] text-violet-400 transition hover:text-violet-400"
          >
            ← All State-wise Records
          </Link>

        </div>

      </main>

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · {marketName} Records
        </div>
      </footer>

    </div>
  );
}