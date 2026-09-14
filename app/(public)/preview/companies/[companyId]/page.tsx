import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    companyId: string;
  }>;
  searchParams: Promise<{
    movieId?: string;
  }>;
};

type Company = {
  id: number;
  name: string;
  slug: string;
  company_type: string;
  country_id: number | null;
  founded_year: number | null;
  headquarters: string | null;
  website: string | null;
  logo: string | null;
  is_active: boolean;
};

type CompanyMovie = {
  movie_id: number;
  role_id: number;
  movie_title: string;
  release_year: number | null;
  role_name: string;
};

type CompanyBoxOffice = {
  movie_id: number;
  movie_title: string;
  release_year: number | null;
  gross_jmi: number;
  gross_official: number;
  is_final: boolean;
};

type PortfolioBreakdown = {
  name: string;
  movie_count: number;
};

/* =========================================================
   HELPERS
========================================================= */

function formatCrores(value: number) {
  if (!value || value <= 0) return "—";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  return `₹${(value / 100000).toFixed(2)} L`;
}

/* =========================================================
   PAGE
========================================================= */

export default async function CompanyIntelligencePage({
  params,
  searchParams,
}: Props) {
  const { companyId } = await params;
  const { movieId } = await searchParams;

  const numericCompanyId = Number(companyId);

  if (!Number.isFinite(numericCompanyId)) {
    notFound();
  }

  /* =========================================================
     COMPANY
  ========================================================= */

  const {
    data: company,
    error: companyError,
  } = await supabase
    .from("companies")
    .select(`
      id,
      name,
      slug,
      company_type,
      country_id,
      founded_year,
      headquarters,
      website,
      logo,
      is_active
    `)
    .eq("id", numericCompanyId)
    .single();

  if (companyError || !company) {
    notFound();
  }

  /* =========================================================
     COMPANY PORTFOLIO
  ========================================================= */

  const {
    data: portfolioData,
    error: portfolioError,
  } = await supabase
    .from("movie_companies")
    .select(`
      movie_id,
      role_id,
      movies (
        id,
        title,
        release_year
      ),
      company_roles (
        id,
        name
      )
    `)
    .eq("company_id", numericCompanyId);

  if (portfolioError) {
    console.error(
      "Public company portfolio error:",
      portfolioError
    );
  }

  const companyMovies: CompanyMovie[] =
    (portfolioData || []).map((item: any) => ({
      movie_id: Number(item.movie_id),
      role_id: Number(item.role_id),
      movie_title:
        item.movies?.title || "Unknown Movie",
      release_year:
        item.movies?.release_year || null,
      role_name:
        item.company_roles?.name ||
        "Unknown Role",
    }));

  const uniqueMovieIds = Array.from(
    new Set(
      companyMovies.map(
        (movie) => movie.movie_id
      )
    )
  );

  /* =========================================================
     BOX OFFICE
  ========================================================= */

  let companyBoxOffice: CompanyBoxOffice[] = [];

  if (uniqueMovieIds.length > 0) {
    const {
      data: boxOfficeData,
      error: boxOfficeError,
    } = await supabase
      .from("movie_state_box_office")
      .select(`
        movie_id,
        gross_jmi,
        gross_official,
        is_final,
        movies (
          title,
          release_year
        )
      `)
      .in("movie_id", uniqueMovieIds);

    if (boxOfficeError) {
      console.error(
        "Public company box office error:",
        boxOfficeError
      );
    } else {
      const groupedMovies: Record<
        number,
        CompanyBoxOffice
      > = {};

      (boxOfficeData || []).forEach(
        (item: any) => {
          const movieIdValue =
            Number(item.movie_id);

          if (!groupedMovies[movieIdValue]) {
            groupedMovies[movieIdValue] = {
              movie_id: movieIdValue,

              movie_title:
                item.movies?.title ||
                "Unknown Movie",

              release_year:
                item.movies?.release_year ||
                null,

              gross_jmi: 0,
              gross_official: 0,

              is_final: false,
            };
          }

          const movie =
            groupedMovies[movieIdValue];

          if (item.gross_jmi !== null) {
            movie.gross_jmi += Number(
              item.gross_jmi
            );
          }

          if (
            item.gross_official !== null
          ) {
            movie.gross_official += Number(
              item.gross_official
            );
          }

          if (item.is_final) {
            movie.is_final = true;
          }
        }
      );

      companyBoxOffice =
        Object.values(groupedMovies);
    }
  }

  /* =========================================================
     LANGUAGE BREAKDOWN
  ========================================================= */

  let languageBreakdown: PortfolioBreakdown[] =
    [];

  let genreBreakdown: PortfolioBreakdown[] =
    [];

  if (uniqueMovieIds.length > 0) {
    const [
      { data: languageData, error: languageError },
      { data: genreData, error: genreError },
    ] = await Promise.all([
      supabase
        .from("movie_languages")
        .select(`
          movie_id,
          language_id,
          languages (
            name
          )
        `)
        .in("movie_id", uniqueMovieIds),

      supabase
        .from("movie_genres")
        .select(`
          movie_id,
          genre_id,
          genres (
            name
          )
        `)
        .in("movie_id", uniqueMovieIds),
    ]);

    if (languageError) {
      console.error(
        "Public company language error:",
        languageError
      );
    } else {
      const languageMovies = new Map<
        number,
        {
          name: string;
          movies: Set<number>;
        }
      >();

      (languageData || []).forEach(
        (item: any) => {
          const languageId =
            Number(item.language_id);

          const languageName =
            Array.isArray(item.languages)
              ? item.languages[0]?.name
              : item.languages?.name;

          if (!languageName) return;

          if (!languageMovies.has(languageId)) {
            languageMovies.set(
              languageId,
              {
                name: languageName,
                movies:
                  new Set<number>(),
              }
            );
          }

          languageMovies
            .get(languageId)!
            .movies.add(
              Number(item.movie_id)
            );
        }
      );

      languageBreakdown =
        Array.from(
          languageMovies.values()
        )
          .map((language) => ({
            name: language.name,
            movie_count:
              language.movies.size,
          }))
          .sort(
            (a, b) =>
              b.movie_count -
              a.movie_count
          );
    }

    if (genreError) {
      console.error(
        "Public company genre error:",
        genreError
      );
    } else {
      const genreMovies = new Map<
        number,
        {
          name: string;
          movies: Set<number>;
        }
      >();

      (genreData || []).forEach(
        (item: any) => {
          const genreId =
            Number(item.genre_id);

          const genreName =
            Array.isArray(item.genres)
              ? item.genres[0]?.name
              : item.genres?.name;

          if (!genreName) return;

          if (!genreMovies.has(genreId)) {
            genreMovies.set(
              genreId,
              {
                name: genreName,
                movies:
                  new Set<number>(),
              }
            );
          }

          genreMovies
            .get(genreId)!
            .movies.add(
              Number(item.movie_id)
            );
        }
      );

      genreBreakdown =
        Array.from(
          genreMovies.values()
        )
          .map((genre) => ({
            name: genre.name,
            movie_count:
              genre.movies.size,
          }))
          .sort(
            (a, b) =>
              b.movie_count -
              a.movie_count
          );
    }
  }

  /* =========================================================
     BOX OFFICE CALCULATIONS
  ========================================================= */

  const totalPortfolioMovies =
    uniqueMovieIds.length;

  const moviesWithBoxOfficeData =
    companyBoxOffice.length;

  const totalGrossJmi =
    companyBoxOffice.reduce(
      (sum, movie) =>
        sum + (movie.gross_jmi || 0),
      0
    );

  const totalGrossOfficial =
    companyBoxOffice.reduce(
      (sum, movie) =>
        sum + (movie.gross_official || 0),
      0
    );

  const finalMovies =
    companyBoxOffice.filter(
      (movie) => movie.is_final
    ).length;

  const provisionalMovies =
    companyBoxOffice.length -
    finalMovies;

  const averageGross =
    companyBoxOffice.length > 0
      ? totalGrossJmi /
        companyBoxOffice.length
      : 0;

  const sortedByGross =
    [...companyBoxOffice].sort(
      (a, b) =>
        (b.gross_jmi ||
          b.gross_official ||
          0) -
        (a.gross_jmi ||
          a.gross_official ||
          0)
    );

  const highestGrossingMovie =
    sortedByGross[0] || null;

  const lowestGrossingMovie =
    sortedByGross[
      sortedByGross.length - 1
    ] || null;

  const topFiveHighestGrossers =
    sortedByGross.slice(0, 5);

  const topFiveLowestGrossers =
    [...sortedByGross]
      .reverse()
      .slice(0, 5);

  /* =========================================================
     PORTFOLIO CALCULATIONS
  ========================================================= */

  const uniqueRoles = new Set(
    companyMovies.map(
      (movie) => movie.role_id
    )
  );

  const productionMovieIds =
    new Set(
      companyMovies
        .filter((movie) =>
          movie.role_name
            ?.toLowerCase()
            .includes("production")
        )
        .map(
          (movie) => movie.movie_id
        )
    );

  const distributionMovieIds =
    new Set(
      companyMovies
        .filter((movie) =>
          movie.role_name
            ?.toLowerCase()
            .includes("distribution")
        )
        .map(
          (movie) => movie.movie_id
        )
    );

  const otherMovieIds =
    new Set(
      companyMovies
        .filter((movie) => {
          const role =
            movie.role_name?.toLowerCase() ||
            "";

          return (
            !role.includes(
              "production"
            ) &&
            !role.includes(
              "distribution"
            )
          );
        })
        .map(
          (movie) => movie.movie_id
        )
    );

  const years = companyMovies
    .map(
      (movie) => movie.release_year
    )
    .filter(
      (year): year is number =>
        year !== null
    );

  const firstYear =
    years.length > 0
      ? Math.min(...years)
      : null;

  const latestYear =
    years.length > 0
      ? Math.max(...years)
      : null;

  const activeYears =
    firstYear !== null &&
    latestYear !== null
      ? latestYear -
        firstYear +
        1
      : null;

  const averageMoviesPerYear =
    activeYears &&
    activeYears > 0
      ? uniqueMovieIds.length /
        activeYears
      : null;

  const movieRoleCounts =
    new Map<number, number>();

  companyMovies.forEach((movie) => {
    const current =
      movieRoleCounts.get(
        movie.movie_id
      ) || 0;

    movieRoleCounts.set(
      movie.movie_id,
      current + 1
    );
  });

  const multiRoleMovies =
    Array.from(
      movieRoleCounts.values()
    ).filter(
      (count) => count > 1
    ).length;

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            BACK
        ================================================= */}

        <div className="mb-4">

          <Link
            href={
              movieId
                ? `/preview/movies/${movieId}/companies`
                : "/preview/companies"
            }
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>

            <span>
              {movieId
                ? "Back to Movie Companies"
                : "Back to Companies Intelligence"}
            </span>

          </Link>

        </div>

        {/* =================================================
            COMPANY HEADER
        ================================================= */}

        <section className="border-b border-zinc-900 pb-6">

          <div className="flex items-start gap-4">

            {/* LOGO */}

            {company.logo ? (

              <img
                src={company.logo}
                alt={company.name}
                className="h-[90px] w-[90px] shrink-0 rounded-xl border border-zinc-800 bg-zinc-950 object-contain p-2 sm:h-[110px] sm:w-[110px]"
              />

            ) : (

              <div className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-3xl font-medium text-yellow-500 sm:h-[110px] sm:w-[110px]">
                {company.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

            )}

            <div className="min-w-0 pt-1">

              <p className="text-[8px] uppercase tracking-[0.18em] text-yellow-500">
                JMI Company Intelligence
              </p>

              <h1 className="mt-1 text-base font-medium text-zinc-100 sm:text-lg">
                {company.name}
              </h1>

              <p className="mt-1 text-[10px] text-zinc-400">
                {company.company_type ||
                  "Film Industry Company"}
              </p>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-zinc-500">

                {company.headquarters && (
                  <span>
                    {company.headquarters}
                  </span>
                )}

                {company.founded_year && (
                  <span>
                    Founded{" "}
                    {company.founded_year}
                  </span>
                )}

              </div>

              <p className="mt-3 max-w-xl text-[9px] leading-5 text-zinc-500">
                Explore the company's portfolio,
                business roles and box-office
                performance through JMI intelligence.
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            COMPANY PROFILE
        ================================================= */}

        <section className="mt-5 rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3">

          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            Company Profile
          </p>

          <p className="mt-1 text-[9px] leading-5 text-zinc-500">
            JMI tracks the company's film-industry
            activity, business roles, portfolio and
            associated box-office performance.
          </p>

        </section>

        {/* =================================================
            EXECUTIVE SNAPSHOT
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-yellow-500">
              Executive Snapshot
            </p>

            <h2 className="mt-1 text-sm font-medium text-violet-400">
              Company Activity Overview
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Total Movies
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {totalPortfolioMovies}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Total Roles
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {uniqueRoles.size}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                First Movie
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {firstYear || "—"}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Latest Activity
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {latestYear || "—"}
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            BOX OFFICE INTELLIGENCE
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-yellow-500">
              Box Office Intelligence
            </p>

            <h2 className="mt-1 text-sm font-medium text-violet-400">
              Company Box Office Performance
            </h2>

            <p className="mt-1 text-[9px] text-zinc-500">
              Aggregated JMI box-office performance
              across the company's associated movies.
            </p>

          </div>

          {companyBoxOffice.length === 0 ? (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">

              <p className="text-[10px] text-zinc-600">
                No box office records are currently
                available for this company.
              </p>

            </div>

          ) : (

            <>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

                  <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                    JMI Total Gross
                  </p>

                  <p className="mt-1 text-sm font-medium text-zinc-200">
                    {formatCrores(
                      totalGrossJmi
                    )}
                  </p>

                </div>

                <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

                  <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                    Avg Gross
                  </p>

                  <p className="mt-1 text-sm font-medium text-zinc-200">
                    {formatCrores(
                      averageGross
                    )}
                  </p>

                </div>

                <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

                  <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                    Final
                  </p>

                  <p className="mt-1 text-sm font-medium text-green-400">
                    {finalMovies}
                  </p>

                </div>

                <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

                  <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                    Provisional
                  </p>

                  <p className="mt-1 text-sm font-medium text-yellow-400">
                    {provisionalMovies}
                  </p>

                </div>

              </div>

              {/* HIGHEST / LOWEST */}

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">

                <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

                  <p className="text-[8px] uppercase tracking-wide text-green-500">
                    Highest Grosser
                  </p>

                  <p className="mt-1 truncate text-[11px] font-medium text-zinc-200">
                    {highestGrossingMovie?.movie_title ||
                      "—"}
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-400">
                    {formatCrores(
                      highestGrossingMovie
                        ?.gross_jmi ||
                        highestGrossingMovie
                          ?.gross_official ||
                        0
                    )}
                  </p>

                </div>

                <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

                  <p className="text-[8px] uppercase tracking-wide text-red-500">
                    Lowest Grosser
                  </p>

                  <p className="mt-1 truncate text-[11px] font-medium text-zinc-200">
                    {lowestGrossingMovie?.movie_title ||
                      "—"}
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-400">
                    {formatCrores(
                      lowestGrossingMovie
                        ?.gross_jmi ||
                        lowestGrossingMovie
                          ?.gross_official ||
                        0
                    )}
                  </p>

                </div>

              </div>

              {/* TOP 5 */}

              <div className="mt-4 rounded-xl border border-zinc-900 bg-zinc-950">

                <div className="border-b border-zinc-900 px-4 py-3">

                  <p className="text-[8px] uppercase tracking-[0.16em] text-yellow-500">
                    Box Office Rankings
                  </p>

                  <h3 className="mt-1 text-[11px] font-medium text-zinc-200">
                    Top 5 Highest Grossers
                  </h3>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[520px] text-[9px]">

                    <thead>

                      <tr className="border-b border-zinc-900">

                        <th className="px-3 py-2 text-left text-[8px] uppercase tracking-wide text-zinc-500">
                          Rank
                        </th>

                        <th className="px-3 py-2 text-left text-[8px] uppercase tracking-wide text-zinc-500">
                          Movie
                        </th>

                        <th className="px-3 py-2 text-left text-[8px] uppercase tracking-wide text-zinc-500">
                          Year
                        </th>

                        <th className="px-3 py-2 text-right text-[8px] uppercase tracking-wide text-zinc-500">
                          Gross
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {topFiveHighestGrossers.map(
                        (movie, index) => (

                          <tr
                            key={`highest-${movie.movie_id}`}
                            className="border-b border-zinc-900/70"
                          >

                            <td className="px-3 py-3">

                              <span
                                className={
                                  index === 0
                                    ? "font-medium text-yellow-500"
                                    : "text-zinc-500"
                                }
                              >
                                {index + 1}
                              </span>

                            </td>

                            <td className="px-3 py-3 font-medium text-zinc-300">
                              {movie.movie_title}
                            </td>

                            <td className="px-3 py-3 text-zinc-500">
                              {movie.release_year ||
                                "—"}
                            </td>

                            <td className="px-3 py-3 text-right font-medium text-zinc-300">
                              {formatCrores(
                                movie.gross_jmi ||
                                  movie.gross_official ||
                                  0
                              )}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </>

          )}

        </section>

        {/* =================================================
            PORTFOLIO INTELLIGENCE
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-yellow-500">
              Portfolio Intelligence
            </p>

            <h2 className="mt-1 text-sm font-medium text-violet-400">
              Business Activity
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Production
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {productionMovieIds.size}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Distribution
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {distributionMovieIds.size}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Other Roles
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {otherMovieIds.size}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Multi-Role
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {multiRoleMovies}
              </p>

            </div>

          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Activity Span
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {activeYears !== null
                  ? `${activeYears} yrs`
                  : "—"}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Avg / Year
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {averageMoviesPerYear !== null
                  ? averageMoviesPerYear.toFixed(
                      1
                    )
                  : "—"}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Founded
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-200">
                {company.founded_year ||
                  "—"}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-3">

              <p className="text-[8px] uppercase tracking-wide text-zinc-500">
                Status
              </p>

              <p
                className={`mt-1 text-sm font-medium ${
                  company.is_active
                    ? "text-green-400"
                    : "text-zinc-600"
                }`}
              >
                {company.is_active
                  ? "Active"
                  : "Inactive"}
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            LANGUAGE / GENRE
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-yellow-500">
              Portfolio Composition
            </p>

            <h2 className="mt-1 text-sm font-medium text-violet-400">
              Language & Genre Intelligence
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

            {/* LANGUAGE */}

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
                Language Intelligence
              </p>

              <h3 className="mt-1 text-[11px] font-medium text-zinc-200">
                Movies by Language
              </h3>

              {languageBreakdown.length === 0 ? (

                <p className="mt-4 text-[9px] text-zinc-600">
                  No language data available.
                </p>

              ) : (

                <div className="mt-4 space-y-2">

                  {languageBreakdown.map(
                    (language) => {

                      const percentage =
                        totalPortfolioMovies >
                        0
                          ? (language.movie_count /
                              totalPortfolioMovies) *
                            100
                          : 0;

                      return (

                        <div
                          key={language.name}
                          className="rounded-lg border border-zinc-900 bg-black px-3 py-3"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <div className="min-w-0">

                              <p className="truncate text-[10px] font-medium text-zinc-300">
                                {language.name}
                              </p>

                              <p className="mt-1 text-[8px] text-zinc-600">
                                {percentage.toFixed(
                                  1
                                )}
                                % of portfolio
                              </p>

                            </div>

                            <p className="text-[10px] font-medium text-zinc-300">
                              {language.movie_count}
                            </p>

                          </div>

                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">

                            <div
                              className="h-full rounded-full bg-yellow-400"
                              style={{
                                width: `${Math.min(
                                  percentage,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              )}

            </div>

            {/* GENRE */}

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
                Genre Intelligence
              </p>

              <h3 className="mt-1 text-[11px] font-medium text-zinc-200">
                Movies by Genre
              </h3>

              {genreBreakdown.length === 0 ? (

                <p className="mt-4 text-[9px] text-zinc-600">
                  No genre data available.
                </p>

              ) : (

                <div className="mt-4 space-y-2">

                  {genreBreakdown.map(
                    (genre) => {

                      const percentage =
                        totalPortfolioMovies >
                        0
                          ? (genre.movie_count /
                              totalPortfolioMovies) *
                            100
                          : 0;

                      return (

                        <div
                          key={genre.name}
                          className="rounded-lg border border-zinc-900 bg-black px-3 py-3"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <div className="min-w-0">

                              <p className="truncate text-[10px] font-medium text-zinc-300">
                                {genre.name}
                              </p>

                              <p className="mt-1 text-[8px] text-zinc-600">
                                {percentage.toFixed(
                                  1
                                )}
                                % of portfolio
                              </p>

                            </div>

                            <p className="text-[10px] font-medium text-zinc-300">
                              {genre.movie_count}
                            </p>

                          </div>

                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">

                            <div
                              className="h-full rounded-full bg-yellow-400"
                              style={{
                                width: `${Math.min(
                                  percentage,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </section>

        {/* =================================================
            MOVIE PORTFOLIO
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-yellow-500">
              Company Portfolio
            </p>

            <h2 className="mt-1 text-sm font-medium text-violet-400">
              Associated Movies
            </h2>

            <p className="mt-1 text-[9px] text-zinc-500">
              Movies associated with this company and
              the role performed on each title.
            </p>

          </div>

          {companyMovies.length === 0 ? (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">

              <p className="text-[10px] text-zinc-600">
                No movie portfolio records found.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">

              <table className="w-full min-w-[560px] text-[9px]">

                <thead>

                  <tr className="border-b border-zinc-900">

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-wide text-zinc-600">
                      #
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-wide text-zinc-600">
                      Movie
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-wide text-zinc-600">
                      Year
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] uppercase tracking-wide text-zinc-600">
                      Role
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {[...companyMovies]
                    .sort((a, b) => {

                      if (
                        a.release_year ===
                        null
                      ) {
                        return 1;
                      }

                      if (
                        b.release_year ===
                        null
                      ) {
                        return -1;
                      }

                      return (
                        b.release_year -
                        a.release_year
                      );

                    })
                    .map(
                      (movie, index) => (

                        <tr
                          key={`${movie.movie_id}-${movie.role_id}`}
                          className="border-b border-zinc-900/70"
                        >

                          <td className="px-3 py-3 text-zinc-600">
                            {index + 1}
                          </td>

                          <td className="px-3 py-3 font-medium text-zinc-300">
                            {movie.movie_title}
                          </td>

                          <td className="px-3 py-3 text-zinc-500">
                            {movie.release_year ||
                              "—"}
                          </td>

                          <td className="px-3 py-3">

                            <span className="inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[8px] text-zinc-400">
                              {movie.role_name}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =================================================
            DATA NOTE
        ================================================= */}

        <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 p-4">

          <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-600">
            Data Note
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            Company intelligence is generated from JMI's
            current company, movie-company and box-office
            records. Box-office totals are calculated from
            JMI state-level records and aggregated at movie
            level before company-level analysis.
          </p>

        </section>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <section className="mt-6 space-y-2">

          <Link
            href={
              movieId
                ? `/preview/movies/${movieId}/companies`
                : "/preview/companies"
            }
            className="block rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3 text-center text-[9px] text-violet-400 transition hover:border-violet-800 hover:bg-violet-950/20 hover:text-violet-300"
          >
            ←{" "}
            {movieId
              ? "Back to Movie Companies"
              : "Back to Companies Intelligence"}
          </Link>

          <Link
            href="/preview"
            className="block rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 text-center text-[9px] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
          >
            Back to JMI Home
          </Link>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

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