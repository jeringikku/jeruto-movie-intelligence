import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    movieId: string;
  }>;
};

type Movie = {
  id: number;
  title: string;
  release_date: string | null;
  release_year: number | null;
  poster_url: string | null;
};

type MovieCompany = {
  id: number;
  company_id: number;
  role_id: number | null;
  billing_order: number | null;
  notes: string | null;

  companies: {
    name: string;
    company_type: string | null;
    logo: string | null;
  } | null;

  company_roles: {
    name: string;
  } | null;
};

export default async function MovieCompaniesPage({
  params,
}: Props) {
  const { movieId } = await params;

  const numericMovieId = Number(movieId);

  if (!Number.isFinite(numericMovieId)) {
    notFound();
  }

  /* ---------------------------------------------------------
     MOVIE
  --------------------------------------------------------- */

  const {
    data: movie,
    error: movieError,
  } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      release_date,
      release_year,
      poster_url
    `)
    .eq("id", numericMovieId)
    .single();

  if (movieError || !movie) {
    notFound();
  }

  /* ---------------------------------------------------------
     MOVIE COMPANIES
  --------------------------------------------------------- */

  const {
    data: movieCompanyData,
    error: movieCompanyError,
  } = await supabase
    .from("movie_companies")
    .select(`
      id,
      company_id,
      role_id,
      billing_order,
      notes,
      companies (
        name,
        company_type,
        logo
      ),
      company_roles (
        name
      )
    `)
    .eq("movie_id", numericMovieId)
    .order("billing_order", {
      ascending: true,
      nullsFirst: false,
    });

  if (movieCompanyError) {
    console.error(
      "Movie companies fetch error:",
      movieCompanyError
    );
  }

  const movieCompanies =
    (movieCompanyData || []) as unknown as MovieCompany[];

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* -------------------------------------------------
            BACK TO ORIGINAL MOVIE PAGE
        ------------------------------------------------- */}

        <div className="mb-4">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Movie</span>
          </Link>

        </div>

        {/* -------------------------------------------------
            MOVIE HEADER
        ------------------------------------------------- */}

        <section className="border-b border-zinc-900 pb-6">

          <div className="flex items-start gap-4">

            {/* POSTER */}

            {movie.poster_url ? (

              <img
                src={movie.poster_url}
                alt={movie.title}
                className="h-[105px] w-[70px] shrink-0 rounded-lg border border-zinc-800 object-cover sm:h-[135px] sm:w-[90px]"
              />

            ) : (

              <div className="flex h-[105px] w-[70px] shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-[8px] text-zinc-700 sm:h-[135px] sm:w-[90px]">
                No Poster
              </div>

            )}

            <div className="min-w-0 pt-1">

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                Movie Companies
              </p>

              <h1 className="mt-1 text-base font-medium text-zinc-100 sm:text-lg">
                {movie.title}
              </h1>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-zinc-500">

                {movie.release_year && (
                  <span>{movie.release_year}</span>
                )}

                {movie.release_date && (
                  <span>
                    {new Date(movie.release_date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                )}

              </div>

              <p className="mt-3 max-w-xl text-[9px] leading-5 text-zinc-500">
                Explore the production, distribution and other
                companies associated with this movie.
              </p>

            </div>

          </div>

        </section>

        {/* -------------------------------------------------
            CURRENT ASSOCIATIONS
        ------------------------------------------------- */}

        <section className="mt-5 rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3">

          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            Current Company Associations
          </p>

          <p className="mt-1 text-[9px] leading-5 text-zinc-500">
            Companies shown here are based on the current
            company credits recorded by JMI for this movie.
          </p>

        </section>

        {/* -------------------------------------------------
            COMPANIES
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Business Intelligence
            </p>

            <h2 className="mt-1 text-sm font-medium text-yellow-500">
              Companies Associated With This Movie
            </h2>

            <p className="mt-1 text-[9px] text-zinc-500">
              Select a company to explore its JMI intelligence
              profile.
            </p>

          </div>

          {movieCompanies.length === 0 ? (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">

              <p className="text-[10px] text-zinc-600">
                No company associations are currently
                available for this movie.
              </p>

            </div>

          ) : (

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {movieCompanies.map((company) => {

                const companyName =
                  company.companies?.name ||
                  "Unknown Company";

                const companyType =
                  company.companies?.company_type ||
                  "Company";

                const companyRole =
                  company.company_roles?.name ||
                  "Association";

                return (

                  <Link
                    key={company.id}
                    href={`/preview/companies/${company.company_id}?movieId=${movie.id}`}
                    className="group rounded-lg border border-zinc-900 bg-zinc-950 p-3 transition hover:border-zinc-800 hover:bg-zinc-900/50"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        {/* COMPANY LOGO */}

                        {company.companies?.logo ? (

                          <img
                            src={company.companies.logo}
                            alt={companyName}
                            className="h-10 w-10 shrink-0 rounded-md border border-zinc-800 bg-black object-contain"
                          />

                        ) : (

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-black text-[14px] font-medium text-yellow-500">
                            {companyName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                        )}

                        <div className="min-w-0">

                          <h3 className="truncate text-[12px] font-medium text-zinc-200 transition group-hover:text-violet-300">
                            {companyName}
                          </h3>

                          <p className="mt-1 text-[8px] text-zinc-500">
                            {companyType}
                          </p>

                        </div>

                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-black text-[12px] font-medium text-yellow-500">
                      </div>

                    </div>

                    {/* COMPANY ROLE */}

                    <div className="mt-3 border-t border-zinc-900 pt-2.5">

                      <p className="text-[7px] uppercase tracking-[0.16em] text-zinc-600">
                        Movie Role
                      </p>

                      <p className="mt-1 text-[10px] text-zinc-400">
                        {companyRole}
                      </p>

                    </div>

                    {/* BILLING */}

                    {company.billing_order !== null && (
                      <div className="mt-3">

                        <p className="text-[7px] uppercase tracking-[0.16em] text-zinc-600">
                          Billing
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-500">
                          #{company.billing_order}
                        </p>

                      </div>
                    )}

                    {/* CTA */}

                    <div className="mt-4 border-t border-zinc-900 pt-3">

                      <span className="text-[9px] font-medium text-yellow-500 transition group-hover:text-yellow-400">
                        Open Company Intelligence →
                      </span>

                    </div>

                  </Link>

                );

              })}

            </div>

          )}

        </section>

        {/* -------------------------------------------------
            SUMMARY
        ------------------------------------------------- */}

        <section className="mt-6 grid grid-cols-3 gap-2">

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

            <p className="text-[7px] uppercase tracking-wide text-zinc-600">
              Companies
            </p>

            <p className="mt-1 text-sm font-medium text-zinc-300">
              {movieCompanies.length}
            </p>

          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

            <p className="text-[7px] uppercase tracking-wide text-zinc-600">
              Roles
            </p>

            <p className="mt-1 text-sm font-medium text-zinc-300">
              {
                new Set(
                  movieCompanies
                    .map(
                      (company) =>
                        company.company_roles?.name
                    )
                    .filter(Boolean)
                ).size
              }
            </p>

          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

            <p className="text-[7px] uppercase tracking-wide text-zinc-600">
              Credits
            </p>

            <p className="mt-1 text-sm font-medium text-zinc-300">
              {movieCompanies.length}
            </p>

          </div>

        </section>

        {/* -------------------------------------------------
            DATA NOTE
        ------------------------------------------------- */}

        <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 p-4">

          <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-600">
            Data Note
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            Company associations are presented from JMI's
            current movie-company credit records. Company
            intelligence is maintained separately at the
            company level and is not inferred from this page.
          </p>

        </section>

        {/* -------------------------------------------------
            NAVIGATION
        ------------------------------------------------- */}

        <section className="mt-6 space-y-2">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="block rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3 text-center text-[9px] text-violet-400 transition hover:border-violet-800 hover:bg-violet-950/20 hover:text-violet-300"
          >
            ← Back to Movie Intelligence
          </Link>

          <Link
            href="/preview"
            className="block rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 text-center text-[9px] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
          >
            Back to JMI Home
          </Link>

        </section>

        {/* -------------------------------------------------
            FOOTER
        ------------------------------------------------- */}

        <footer className="mt-10 border-t border-zinc-900 pt-5 pb-8">

          <p className="text-center text-[8px] text-zinc-800">
            JMI · Jeruto Movie Intelligence
          </p>

          <p className="mt-1 text-center text-[7px] text-zinc-900">
            Indian Film Industry Data & Intelligence
          </p>

        </footer>

      </main>

    </div>
  );
}