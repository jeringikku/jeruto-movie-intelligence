import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    industrySlug: string;
  }>;
};

type Industry = {
  id: number;
  name: string;
  slug: string;
  short_name: string | null;
  description: string | null;
};

export default async function IndustryRecordsLandingPage({
  params,
}: Props) {
  const { industrySlug } = await params;

  /*
   * =========================================================
   * 1. FIND INDUSTRY
   * =========================================================
   *
   * The existing industries master table is used.
   */

  const {
    data: industry,
    error: industryError,
  } = await supabase
    .from("industries")
    .select(`
      id,
      name,
      slug,
      short_name,
      description
    `)
    .eq("slug", industrySlug)
    .single();

  /*
   * =========================================================
   * 2. INDUSTRY NOT FOUND
   * =========================================================
   */

  if (industryError || !industry) {
    console.error(
      "Industry lookup error:",
      industryError
    );

    return (
      <div className="min-h-screen bg-black text-zinc-300">

        <PublicHeader />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6">

            <p className="text-[10px] text-red-400">
              Industry could not be found.
            </p>

          </div>

        </main>

      </div>
    );
  }

  /*
   * =========================================================
   * 3. PAGE
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-black text-zinc-300">

      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Back */}

        <div className="mb-6">

          <Link
            href="/preview/records/industry-wise"
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>

            <span>
              Back to Industry Records
            </span>
          </Link>

        </div>

        {/* Header */}

        <section className="border-b border-zinc-900 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-green-400">
            INDUSTRY RECORDS · {industry.name.toUpperCase()}
          </div>

          <div className="mt-3 flex items-center gap-3">

            <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
              {industry.name}
            </h1>

            {industry.short_name && (
              <span className="text-[8px] tracking-[0.16em] text-zinc-700">
                {industry.short_name}
              </span>
            )}

          </div>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-500">
            {industry.description ||
              `Explore the all-time box-office records of ${industry.name}.`}
          </p>

        </section>

        {/* Record categories */}

        <section className="mt-7">

          <div className="mb-3 text-[8px] font-medium tracking-[0.2em] text-pink-500">
            SELECT RECORD CATEGORY
          </div>

          <div className="space-y-2">

            {/* Worldwide */}

            <Link
              href={`/preview/records/industry-wise/${industry.slug}/worldwide`}
              className="group block rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 transition hover:border-violet-500/30 hover:bg-zinc-950/80"
            >

              <div className="flex items-center justify-between gap-4">

                <div className="min-w-0">

                  <div className="text-[8px] font-medium tracking-[0.2em] text-green-500">
                    01 · WORLDWIDE
                  </div>

                  <h2 className="mt-2 text-[12px] font-medium text-zinc-200 transition group-hover:text-zinc-100">
                    All-Time Highest Grossing Movies Worldwide
                  </h2>

                  <p className="mt-1 text-[8px] leading-4 text-zinc-500">
                    Explore the biggest worldwide
                    theatrical performances from{" "}
                    {industry.name}.
                  </p>

                </div>

                <div className="shrink-0 text-[11px] text-zinc-700 transition group-hover:text-violet-400">
                  →
                </div>

              </div>

            </Link>

            {/* India */}

            <Link
              href={`/preview/records/industry-wise/${industry.slug}/india`}
              className="group block rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 transition hover:border-violet-500/30 hover:bg-zinc-950/80"
            >

              <div className="flex items-center justify-between gap-4">

                <div className="min-w-0">

                  <div className="text-[8px] font-medium tracking-[0.2em] text-green-500">
                    02 · INDIA
                  </div>

                  <h2 className="mt-2 text-[12px] font-medium text-zinc-200 transition group-hover:text-zinc-100">
                    All-Time Highest Grossing Movies in India
                  </h2>

                  <p className="mt-1 text-[8px] leading-4 text-zinc-500">
                    Explore the biggest theatrical
                    performances from {industry.name}
                    across India.
                  </p>

                </div>

                <div className="shrink-0 text-[11px] text-zinc-700 transition group-hover:text-violet-400">
                  →
                </div>

              </div>

            </Link>

            {/* Overseas */}

            <Link
              href={`/preview/records/industry-wise/${industry.slug}/overseas`}
              className="group block rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 transition hover:border-violet-500/30 hover:bg-zinc-950/80"
            >

              <div className="flex items-center justify-between gap-4">

                <div className="min-w-0">

                  <div className="text-[8px] font-medium tracking-[0.2em] text-green-500">
                    03 · OVERSEAS
                  </div>

                  <h2 className="mt-2 text-[12px] font-medium text-zinc-200 transition group-hover:text-zinc-100">
                    All-Time Highest Grossing Movies in Overseas
                  </h2>

                  <p className="mt-1 text-[8px] leading-4 text-zinc-500">
                    Explore overseas theatrical
                    performances from {industry.name}.
                  </p>

                </div>

                <div className="shrink-0 text-[11px] text-zinc-700 transition group-hover:text-violet-400">
                  →
                </div>

              </div>

            </Link>

          </div>

        </section>

        {/* Data definition */}

        <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">

          <div className="text-[8px] font-medium tracking-[0.2em] text-red-500">
            RECORD DEFINITION
          </div>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            Industry records are generated using
            the industry classification maintained
            in the JMI database. Movie-industry
            relationships are maintained through
            the existing movie industry records.
            Worldwide, India and overseas rankings
            are calculated from their respective
            theatrical box-office data.
          </p>

        </section>

        {/* Navigation */}

        <div className="mt-7 flex justify-between border-t border-zinc-900 pt-5">

          <Link
            href="/preview/records/industry-wise"
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            ← All Industries
          </Link>

          <Link
            href={`/preview/records/industry-wise/${industry.slug}/worldwide`}
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            Worldwide →
          </Link>

        </div>

      </main>

      {/* Footer */}

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">

        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · {industry.name} Records
        </div>

      </footer>

    </div>
  );
}