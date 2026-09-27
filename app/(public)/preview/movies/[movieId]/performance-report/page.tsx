import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "../../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import PerformanceReportClient from "./PerformanceReportClient";

export default async function MoviePerformanceReportPage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;

  /*
   * =========================================================
   * MOVIE
   * =========================================================
   */

  const { data: movie, error } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      original_title,
      release_year,
      poster_url
    `)
    .eq("id", movieId)
    .eq("is_active", true)
    .single();

  if (error || !movie) {
    console.error(
      "JMI Movie Performance Report movie error:",
      error
    );

    notFound();
  }

  /*
   * =========================================================
   * PREMIUM ENTITLEMENT
   * =========================================================
   *
   * The landing page itself remains accessible.
   *
   * Only the actual report generation capability is
   * controlled by the subscription entitlement.
   */

  const serverSupabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  let allowed = false;

  if (user) {
    const { data, error: entitlementError } =
      await serverSupabase.rpc(
        "jmi_user_has_feature",
        {
          requested_feature_slug:
            "movie_summary_report",
        }
      );

    if (entitlementError) {
      console.error(
        "JMI Movie Performance Report entitlement check failed:",
        entitlementError
      );

      allowed = false;
    } else {
      allowed = data === true;
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =====================================================
            BACK
        ===================================================== */}

        <div className="mb-8">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Movie</span>
          </Link>

        </div>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="border-b border-zinc-900 pb-8">

          <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-violet-400">
            JMI Premium Intelligence
          </p>

          <h1 className="mt-2 text-xl font-medium tracking-[-0.03em] text-zinc-100 sm:text-2xl">
            JMI Performance Report
          </h1>

          <p className="mt-2 max-w-xl text-[9px] leading-5 text-zinc-500">
            Generate a JMI performance analysis report
            based on the movie's tracked theatrical,
            business and market data.
          </p>

        </section>

        {/* =====================================================
            REPORT LANDING
        ===================================================== */}

        <section className="flex min-h-[55vh] items-center justify-center py-10">

          <PerformanceReportClient
            movieId={movie.id}
            movieTitle={
              movie.title ||
              movie.original_title ||
              "Movie"
            }
            releaseYear={movie.release_year}
            posterUrl={movie.poster_url}
            allowed={allowed}
            authenticated={Boolean(user)}
          />

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-4 border-t border-zinc-900 pt-5 pb-8">

        <p className="text-center text-[8px] text-zinc-800">
          JMI · Jeruto Movie Intelligence
        </p>

        <p className="mt-1 text-center text-[7px] text-zinc-900">
          Indian Film Industry Data & Intelligence
        </p>

      </footer>

    </div>
  );
}