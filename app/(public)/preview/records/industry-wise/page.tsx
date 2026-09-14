import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Industry = {
  id: number;
  name: string;
  slug: string;
  short_name: string | null;
  description: string | null;
};

export default async function IndustryWiseRecordsPage() {
  /*
   * =========================================================
   * 1. GET INDUSTRIES
   * =========================================================
   *
   * The existing industries master table is used.
   * No new industry data is created here.
   */

  const {
    data: industries,
    error,
  } = await supabase
    .from("industries")
    .select(`
      id,
      name,
      slug,
      short_name,
      description
    `)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Industry records lookup error:",
      error
    );
  }

  /*
   * =========================================================
   * 2. PAGE
   * =========================================================
   */

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

            <span>
              Back to Records
            </span>
          </Link>

        </div>

        {/* Header */}

        <section className="border-b border-zinc-900 pb-7">

          <div className="text-[9px] font-medium tracking-[0.28em] text-green-400">
            HISTORICAL RECORDS · INDUSTRY-WISE
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            Industry-wise Box Office Records
          </h1>

          <p className="mt-3 max-w-xl text-[10px] leading-5 text-zinc-500">
            Explore the highest-grossing movies
            across India's major film industries,
            with separate worldwide, India and
            overseas records.
          </p>

        </section>

        {/* Industry selection */}

        <section className="mt-7">

          <div className="mb-3 text-[8px] font-medium tracking-[0.2em] text-pink-500">
            SELECT INDUSTRY
          </div>

          {industries && industries.length > 0 ? (

            <div className="grid gap-2 sm:grid-cols-2">

              {industries.map(
                (industry: Industry) => (

                  <Link
                    key={industry.id}
                    href={`/preview/records/industry-wise/${industry.slug}`}
                    className="group rounded-xl border border-violet-300 bg-zinc-950/40 p-4 transition hover:border-violet-500/30 hover:bg-zinc-950/80"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <h2 className="text-[11px] font-medium text-green-500 transition group-hover:text-zinc-100">
                            {industry.name}
                          </h2>

                          {industry.short_name && (
                            <span className="text-[7px] tracking-[0.12em] text-pink-500">
                              {industry.short_name}
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-[8px] leading-4 text-zinc-500">
                          {industry.description ||
                            `Explore ${industry.name} box-office records.}`
                          }</p>

                      </div>

                      <div className="shrink-0 text-[10px] text-zinc-700 transition group-hover:text-violet-400">
                        →
                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>

          ) : (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6">

              <p className="text-[10px] text-zinc-500">
                No industries are currently
                available in the JMI database.
              </p>

            </div>

          )}

        </section>

        {/* Data note */}

        <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">

          <div className="text-[8px] font-medium tracking-[0.2em] text-red-500">
            DATA NOTE
          </div>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            Industry records are generated from
            the industries and movie-industry
            relationships maintained in the JMI
            database. New movies assigned to an
            industry through the JMI admin system
            automatically become eligible for the
            corresponding industry rankings.
          </p>

        </section>

        {/* Navigation */}

        <div className="mt-7 border-t border-zinc-900 pt-5">

          <Link
            href="/preview/records/highest-grossing"
            className="text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            ← Highest Grossing Records
          </Link>

        </div>

      </main>

      {/* Footer */}

      <footer className="border-t border-zinc-900 px-4 py-6 sm:px-6">

        <div className="mx-auto max-w-5xl text-[8px] text-zinc-700">
          Jeruto Movie Intelligence · Industry Records
        </div>

      </footer>

    </div>
  );
}