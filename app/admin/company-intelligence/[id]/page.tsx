"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  gross_jmi: number | null;
  gross_official: number | null;
  is_final: boolean;
};

type PortfolioBreakdown = {
  name: string;
  movie_count: number;
};

export default function CompanyIntelligencePage() {
  const params = useParams();
  const companyId = Number(params?.id);

  const [company, setCompany] = useState<Company | null>(null);
  const [companyMovies, setCompanyMovies] = useState<CompanyMovie[]>([]);

  const [companyBoxOffice, setCompanyBoxOffice] =
  useState<CompanyBoxOffice[]>([]);

  const [languageBreakdown, setLanguageBreakdown] =
  useState<PortfolioBreakdown[]>([]);

const [genreBreakdown, setGenreBreakdown] =
  useState<PortfolioBreakdown[]>([]);

const [breakdownLoading, setBreakdownLoading] =
  useState(false);

const [boxOfficeLoading, setBoxOfficeLoading] =
  useState(true);
const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

 useEffect(() => {
  if (!companyId || Number.isNaN(companyId)) {
    setErrorMessage("Invalid company ID.");
    setLoading(false);
    return;
  }

  loadCompany();
  loadCompanyPortfolio();
}, [companyId]);


/* =========================================================
   LOAD COMPANY PORTFOLIO
========================================================= */

async function loadCompanyPortfolio() {
  setPortfolioLoading(true);

  try {
    const { data, error } = await supabase
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
      .eq("company_id", companyId);

    if (error) {
      console.error("Company portfolio load error:", error);
      throw error;
    }

    const formattedMovies: CompanyMovie[] = (data || []).map(
      (item: any) => ({
        movie_id: item.movie_id,
        role_id: item.role_id,
        movie_title: item.movies?.title || "Unknown Movie",
        release_year: item.movies?.release_year || null,
        role_name: item.company_roles?.name || "Unknown Role",
      })
    );

    setCompanyMovies(formattedMovies);

   const movieIds = Array.from(
  new Set(formattedMovies.map((movie) => movie.movie_id))
);

await Promise.all([
  loadCompanyBoxOffice(movieIds),
  loadCompanyBreakdowns(movieIds),
]);

  } catch (error) {
    console.error("Company portfolio error:", error);
    setCompanyMovies([]);
  } finally {
    setPortfolioLoading(false);
  }
}


/* =========================================================
   LOAD COMPANY BOX OFFICE AFTER PORTFOLIO LOADS
========================================================= */

    async function loadCompanyBoxOffice(movieIds: number[]) {
  setBoxOfficeLoading(true);

  try {
    if (movieIds.length === 0) {
      setCompanyBoxOffice([]);
      return;
    }

    const { data, error } = await supabase
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
  .in("movie_id", movieIds);

    if (error) {
      console.error(
        "Company state box office load error:",
        error
      );

      throw error;
    }

    /*
     * A movie can have multiple state-level records.
     * Therefore, aggregate all records belonging to
     * the same movie into one company-level record.
     */

    const groupedMovies: Record<number, CompanyBoxOffice> = {};

    (data || []).forEach((item: any) => {
      const movieId = Number(item.movie_id);

     if (!groupedMovies[movieId]) {
  groupedMovies[movieId] = {
    movie_id: movieId,

    movie_title:
      item.movies?.title || "Unknown Movie",

    release_year:
      item.movies?.release_year || null,

    gross_jmi: 0,
    gross_official: 0,

    is_final: false,
  };
}

      const movie = groupedMovies[movieId];

      if (item.gross_jmi !== null) {
        movie.gross_jmi =
          (movie.gross_jmi || 0) +
          Number(item.gross_jmi);
      }

      if (item.gross_official !== null) {
        movie.gross_official =
          (movie.gross_official || 0) +
          Number(item.gross_official);
      }

     

     

      if (item.is_final) {
        movie.is_final = true;
      }
    });

    const formattedData: CompanyBoxOffice[] =
      Object.values(groupedMovies);

    setCompanyBoxOffice(formattedData);

  } catch (error) {
    console.error(
      "Company box office error:",
      error
    );

    setCompanyBoxOffice([]);

  } finally {
    setBoxOfficeLoading(false);
  }
}

  
  async function loadCompany() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
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
        .eq("id", companyId)
        .single();

      if (error) {
        console.error("Company load error:", error);
        throw error;
      }

      setCompany(data);
    } catch (error) {
      console.error("Company Intelligence error:", error);
      setErrorMessage("Unable to load company information.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
   LOAD COMPANY LANGUAGE & GENRE BREAKDOWN
========================================================= */

async function loadCompanyBreakdowns(movieIds: number[]) {
  setBreakdownLoading(true);

  try {
    if (movieIds.length === 0) {
      setLanguageBreakdown([]);
      setGenreBreakdown([]);
      return;
    }

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
        .in("movie_id", movieIds),

      supabase
        .from("movie_genres")
        .select(`
          movie_id,
          genre_id,
          genres (
            name
          )
        `)
        .in("movie_id", movieIds),
    ]);

    if (languageError) {
      console.error(
        "Company language breakdown error:",
        languageError
      );

      throw languageError;
    }

    if (genreError) {
      console.error(
        "Company genre breakdown error:",
        genreError
      );

      throw genreError;
    }

    /* =====================================================
       LANGUAGE BREAKDOWN

       Use a Set for each language so that a movie can never
       be counted twice under the same language.
    ===================================================== */

    const languageMovies = new Map<
      number,
      {
        name: string;
        movies: Set<number>;
      }
    >();

    (languageData || []).forEach((item: any) => {
      const languageId = Number(item.language_id);

      const languageName = Array.isArray(item.languages)
        ? item.languages[0]?.name
        : item.languages?.name;

      if (!languageName) return;

      if (!languageMovies.has(languageId)) {
        languageMovies.set(languageId, {
          name: languageName,
          movies: new Set<number>(),
        });
      }

      languageMovies
        .get(languageId)!
        .movies.add(Number(item.movie_id));
    });

    const formattedLanguages: PortfolioBreakdown[] =
      Array.from(languageMovies.values())
        .map((language) => ({
          name: language.name,
          movie_count: language.movies.size,
        }))
        .sort((a, b) => b.movie_count - a.movie_count);

    /* =====================================================
       GENRE BREAKDOWN

       Again, count unique movie IDs per genre.
    ===================================================== */

    const genreMovies = new Map<
      number,
      {
        name: string;
        movies: Set<number>;
      }
    >();

    (genreData || []).forEach((item: any) => {
      const genreId = Number(item.genre_id);

      const genreName = Array.isArray(item.genres)
        ? item.genres[0]?.name
        : item.genres?.name;

      if (!genreName) return;

      if (!genreMovies.has(genreId)) {
        genreMovies.set(genreId, {
          name: genreName,
          movies: new Set<number>(),
        });
      }

      genreMovies
        .get(genreId)!
        .movies.add(Number(item.movie_id));
    });

    const formattedGenres: PortfolioBreakdown[] =
      Array.from(genreMovies.values())
        .map((genre) => ({
          name: genre.name,
          movie_count: genre.movies.size,
        }))
        .sort((a, b) => b.movie_count - a.movie_count);

    setLanguageBreakdown(formattedLanguages);
    setGenreBreakdown(formattedGenres);

  } catch (error) {
    console.error(
      "Company portfolio breakdown error:",
      error
    );

    setLanguageBreakdown([]);
    setGenreBreakdown([]);

  } finally {
    setBreakdownLoading(false);
  }
}

  /* =========================================================
     COMPANY BOX OFFICE CALCULATIONS
  ========================================================= */

  const totalPortfolioMovies = companyMovies.length;

  const moviesWithBoxOfficeData =
    companyBoxOffice.length;

  const totalGrossJmi = companyBoxOffice.reduce(
    (sum, movie) => sum + (movie.gross_jmi || 0),
    0
  );

  const totalGrossOfficial = companyBoxOffice.reduce(
    (sum, movie) => sum + (movie.gross_official || 0),
    0
  );

  const finalMovies = companyBoxOffice.filter(
    (movie) => movie.is_final
  ).length;

  const provisionalMovies =
    companyBoxOffice.length - finalMovies;

  const averageGross =
    companyBoxOffice.length > 0
      ? totalGrossJmi / companyBoxOffice.length
      : 0;

  const sortedByGross = [...companyBoxOffice].sort(
    (a, b) =>
      (b.gross_jmi || b.gross_official || 0) -
      (a.gross_jmi || a.gross_official || 0)
  );

  const highestGrossingMovie =
    sortedByGross[0] || null;

  const lowestGrossingMovie =
    sortedByGross[sortedByGross.length - 1] || null;

  const topFiveHighestGrossers =
    sortedByGross.slice(0, 5);

  const topFiveLowestGrossers =
    [...sortedByGross]
      .reverse()
      .slice(0, 5);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
            <p className="text-zinc-400">
              Loading Company Intelligence...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage || !company) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-red-900/60 bg-zinc-950 p-8">
            <h1 className="text-xl font-semibold text-red-400">
              Company Intelligence
            </h1>

            <p className="mt-2 text-zinc-400">
              {errorMessage || "Company not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">


        

        {/* =========================================================
            PAGE HEADER
        ========================================================= */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-yellow-400">
                Company Intelligence
              </p>

              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {company.name}
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Advanced company performance and business intelligence
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-black px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Company ID
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-400">
                {company.id}
              </p>
            </div>

          </div>

          {/* COMPANY BASIC INFORMATION */}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-zinc-800 bg-black p-4">
              <p className="text-xs text-zinc-500">
                Company Type
              </p>

              <p className="mt-1 font-medium">
                {company.company_type || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">
              <p className="text-xs text-zinc-500">
                Founded
              </p>

              <p className="mt-1 font-medium">
                {company.founded_year || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">
              <p className="text-xs text-zinc-500">
                Headquarters
              </p>

              <p className="mt-1 font-medium">
                {company.headquarters || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">
              <p className="text-xs text-zinc-500">
                Status
              </p>

              <p
                className={`mt-1 font-medium ${
                  company.is_active
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {company.is_active ? "Active" : "Inactive"}
              </p>
            </div>

          </div>

        </section>


        {/* =========================================================
    COMPANY BOX OFFICE INTELLIGENCE
========================================================= */}

<section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

  <div className="mb-6">
    <p className="text-xs uppercase tracking-wider text-yellow-400">
      Box Office Intelligence
    </p>

    <h2 className="mt-1 text-xl font-semibold text-white">
      Company Box Office Performance
    </h2>

    <p className="mt-1 text-sm text-zinc-500">
      Box office performance of movies associated with this company.
    </p>
  </div>

  {boxOfficeLoading ? (
    <div className="rounded-xl border border-zinc-800 bg-black p-6">
      <p className="text-sm text-zinc-500">
        Loading box office intelligence...
      </p>
    </div>
  ) : companyBoxOffice.length === 0 ? (
    <div className="rounded-xl border border-zinc-800 bg-black p-6">
      <p className="text-sm text-zinc-500">
        No box office records found for this company.
      </p>
    </div>
  ) : (
    <>
      {(() => {
        const totalGrossJmi = companyBoxOffice.reduce(
          (sum, movie) => sum + (movie.gross_jmi || 0),
          0
        );

        const totalGrossOfficial = companyBoxOffice.reduce(
          (sum, movie) => sum + (movie.gross_official || 0),
          0
        );

        const finalMovies = companyBoxOffice.filter(
          (movie) => movie.is_final
        ).length;

        const provisionalMovies =
          companyBoxOffice.length - finalMovies;

        const highestGrossingMovie =
          [...companyBoxOffice].sort(
            (a, b) =>
              (b.gross_jmi || b.gross_official || 0) -
              (a.gross_jmi || a.gross_official || 0)
          )[0];

        const averageGross =
          companyBoxOffice.length > 0
            ? totalGrossJmi / companyBoxOffice.length
            : 0;

        return (
          <>
            {/* =====================================================
                PRIMARY BOX OFFICE METRICS
            ===================================================== */}

           <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

  {/* TOTAL PORTFOLIO MOVIES */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">
    <p className="text-xs text-zinc-500">
      Total Movies
    </p>

    <p className="mt-2 text-2xl font-bold text-white">
      {totalPortfolioMovies}
    </p>

    <p className="mt-1 text-xs text-zinc-600">
      Company portfolio
    </p>
  </div>


  {/* MOVIES WITH BOX OFFICE */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">
    <p className="text-xs text-zinc-500">
      Box Office Movies
    </p>

    <p className="mt-2 text-2xl font-bold text-white">
      {moviesWithBoxOfficeData}
    </p>

    <p className="mt-1 text-xs text-zinc-600">
      With box office data
    </p>
  </div>


  {/* GROSS JMI */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">
    <p className="text-xs text-zinc-500">
      Gross JMI
    </p>

    <p className="mt-2 text-2xl font-bold text-white">
      {totalGrossJmi.toLocaleString()}
    </p>

    <p className="mt-1 text-xs text-zinc-600">
      Total gross
    </p>
  </div>


  {/* GROSS OFFICIAL */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">
    <p className="text-xs text-zinc-500">
      Gross Official
    </p>

    <p className="mt-2 text-2xl font-bold text-white">
      {totalGrossOfficial.toLocaleString()}
    </p>

    <p className="mt-1 text-xs text-zinc-600">
      Reported gross
    </p>
  </div>


  {/* FINAL */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">
    <p className="text-xs text-zinc-500">
      Final Records
    </p>

    <p className="mt-2 text-2xl font-bold text-green-400">
      {finalMovies}
    </p>

    <p className="mt-1 text-xs text-zinc-600">
      Finalized movies
    </p>
  </div>


  {/* PROVISIONAL */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">
    <p className="text-xs text-zinc-500">
      Provisional
    </p>

    <p className="mt-2 text-2xl font-bold text-yellow-400">
      {provisionalMovies}
    </p>

    <p className="mt-1 text-xs text-zinc-600">
      Non-final records
    </p>
  </div>

</div>
            {/* =====================================================
                SECONDARY BOX OFFICE METRICS
            ===================================================== */}

           <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">

  {/* AVERAGE GROSS */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">
    <p className="text-xs text-zinc-500">
      Average Gross
    </p>

    <p className="mt-2 text-2xl font-bold text-white">
      {averageGross.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}
    </p>

    <p className="mt-1 text-xs text-zinc-600">
      JMI gross / movie
    </p>
  </div>


  {/* HIGHEST GROSSER */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">
    <p className="text-xs text-zinc-500">
      Highest Grosser
    </p>

    <p className="mt-2 text-lg font-bold text-white truncate">
      {highestGrossingMovie?.movie_title || "—"}
    </p>

    <p className="mt-1 text-xs text-zinc-600">
      {(highestGrossingMovie?.gross_jmi ||
        highestGrossingMovie?.gross_official ||
        0).toLocaleString()} gross
    </p>
  </div>


  {/* LOWEST GROSSER */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">
    <p className="text-xs text-zinc-500">
      Lowest Grosser
    </p>

    <p className="mt-2 text-lg font-bold text-white truncate">
      {lowestGrossingMovie?.movie_title || "—"}
    </p>

    <p className="mt-1 text-xs text-zinc-600">
      {(lowestGrossingMovie?.gross_jmi ||
        lowestGrossingMovie?.gross_official ||
        0).toLocaleString()} gross
    </p>
  </div>

</div>

            {/* =====================================================
                TOP PERFORMER
            ===================================================== */}

            {/* =====================================================
    TOP 5 HIGHEST GROSSERS
===================================================== */}

<div className="mt-6 rounded-xl border border-zinc-800 bg-black p-5">

  <div className="mb-5">
    <p className="text-xs uppercase tracking-wider text-yellow-400">
      Box Office Rankings
    </p>

    <h3 className="mt-1 text-lg font-semibold text-white">
      Top 5 Highest Grossers
    </h3>

    <p className="mt-1 text-sm text-zinc-500">
      Highest-grossing movies associated with this company.
    </p>
  </div>

  {topFiveHighestGrossers.length === 0 ? (
    <p className="text-sm text-zinc-500">
      No box office records available.
    </p>
  ) : (
    <div className="overflow-x-auto">

      <table className="w-full min-w-[600px] text-sm">

        <thead>
          <tr className="border-b border-zinc-800 text-left">

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Rank
            </th>

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Movie
            </th>

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Year
            </th>

            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
              JMI Gross
            </th>

          </tr>
        </thead>

        <tbody>

          {topFiveHighestGrossers.map((movie, index) => {

            const gross =
              movie.gross_jmi ??
              movie.gross_official ??
              0;

            return (
              <tr
                key={`highest-${movie.movie_id}`}
                className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
              >

                <td className="px-4 py-4">

                  <span
                    className={`font-semibold ${
                      index === 0
                        ? "text-yellow-400"
                        : "text-zinc-400"
                    }`}
                  >
                    {index + 1}
                  </span>

                </td>

                <td className="px-4 py-4 font-medium text-white">
                  {movie.movie_title}
                </td>

                <td className="px-4 py-4 text-zinc-400">
                  {movie.release_year || "—"}
                </td>

                <td className="px-4 py-4 text-right font-semibold text-white">
                  {gross.toLocaleString()}
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  )}

</div>


{/* =====================================================
    TOP 5 LOWEST GROSSERS
===================================================== */}

<div className="mt-4 rounded-xl border border-zinc-800 bg-black p-5">

  <div className="mb-5">

    <p className="text-xs uppercase tracking-wider text-zinc-500">
      Box Office Rankings
    </p>

    <h3 className="mt-1 text-lg font-semibold text-white">
      Top 5 Lowest Grossers
    </h3>

    <p className="mt-1 text-sm text-zinc-500">
      Lowest reported-gross movies associated with this company.
    </p>

  </div>

  {topFiveLowestGrossers.length === 0 ? (
    <p className="text-sm text-zinc-500">
      No box office records available.
    </p>
  ) : (
    <div className="overflow-x-auto">

      <table className="w-full min-w-[600px] text-sm">

        <thead>

          <tr className="border-b border-zinc-800 text-left">

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Rank
            </th>

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Movie
            </th>

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Year
            </th>

            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
              JMI Gross
            </th>

          </tr>

        </thead>

        <tbody>

          {topFiveLowestGrossers.map((movie, index) => {

            const gross =
              movie.gross_jmi ??
              movie.gross_official ??
              0;

            return (
              <tr
                key={`lowest-${movie.movie_id}`}
                className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
              >

                <td className="px-4 py-4 text-zinc-400">
                  {index + 1}
                </td>

                <td className="px-4 py-4 font-medium text-white">
                  {movie.movie_title}
                </td>

                <td className="px-4 py-4 text-zinc-400">
                  {movie.release_year || "—"}
                </td>

                <td className="px-4 py-4 text-right font-semibold text-white">
                  {gross.toLocaleString()}
                </td>

              </tr>
            );

          })}

        </tbody>

      </table>

    </div>
  )}

</div>
          </>
        );
      })()}
    </>
  )}

</section>

{/* =========================================================
    COMPANY PORTFOLIO INTELLIGENCE
========================================================= */}

<section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

  <div className="mb-6">
    <p className="text-xs uppercase tracking-wider text-yellow-400">
      Portfolio Intelligence
    </p>

    <h2 className="mt-1 text-xl font-semibold text-white">
      Company Portfolio
    </h2>

    <p className="mt-1 text-sm text-zinc-500">
      Comparison-ready analysis of the company&apos;s movie portfolio,
      business roles and activity footprint.
    </p>
  </div>

  {portfolioLoading ? (
    <div className="rounded-xl border border-zinc-800 bg-black p-6">
      <p className="text-sm text-zinc-500">
        Loading portfolio intelligence...
      </p>
    </div>
  ) : (
    <>
      {(() => {
        /* ---------------------------------------------------------
           CORE PORTFOLIO CALCULATIONS
        --------------------------------------------------------- */

        const uniqueMovieIds = new Set(
          companyMovies.map((movie) => movie.movie_id)
        );

        const uniqueRoles = new Set(
          companyMovies.map((movie) => movie.role_id)
        );

        /* Production titles */
        const productionMovieIds = new Set(
          companyMovies
            .filter((movie) =>
              movie.role_name?.toLowerCase().includes("production")
            )
            .map((movie) => movie.movie_id)
        );

        /* Distribution titles */
        const distributionMovieIds = new Set(
          companyMovies
            .filter((movie) =>
              movie.role_name?.toLowerCase().includes("distribution")
            )
            .map((movie) => movie.movie_id)
        );

        /* Other business-role titles */
        const otherMovieIds = new Set(
          companyMovies
            .filter((movie) => {
              const role = movie.role_name?.toLowerCase() || "";

              return (
                !role.includes("production") &&
                !role.includes("distribution")
              );
            })
            .map((movie) => movie.movie_id)
        );

        /* Release years */
        const years = companyMovies
          .map((movie) => movie.release_year)
          .filter((year): year is number => year !== null);

        const firstYear =
          years.length > 0 ? Math.min(...years) : null;

        const latestYear =
          years.length > 0 ? Math.max(...years) : null;

        const activeYears =
          firstYear !== null && latestYear !== null
            ? latestYear - firstYear + 1
            : null;

        /* Average movie activity per active year */
        const averageMoviesPerYear =
          activeYears && activeYears > 0
            ? uniqueMovieIds.size / activeYears
            : null;

        /* Multi-role movie count */
        const movieRoleCounts = new Map<number, number>();

        companyMovies.forEach((movie) => {
          const current =
            movieRoleCounts.get(movie.movie_id) || 0;

          movieRoleCounts.set(
            movie.movie_id,
            current + 1
          );
        });

        const multiRoleMovies = Array.from(
          movieRoleCounts.values()
        ).filter((count) => count > 1).length;

        return (
          <>
            {/* =====================================================
                PRIMARY PORTFOLIO METRICS
            ===================================================== */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

              {/* TOTAL MOVIES */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  Movies
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {uniqueMovieIds.size}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Unique titles
                </p>
              </div>

              {/* COMPANY ROLES */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  Roles
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {uniqueRoles.size}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Business roles
                </p>
              </div>

              {/* PRODUCTION */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  Production
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {productionMovieIds.size}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Unique titles
                </p>
              </div>

              {/* DISTRIBUTION */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  Distribution
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {distributionMovieIds.size}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Unique titles
                </p>
              </div>

              {/* OTHER ROLES */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  Other Roles
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {otherMovieIds.size}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Unique titles
                </p>
              </div>

              {/* MULTI ROLE */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  Multi-Role
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {multiRoleMovies}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Multiple roles
                </p>
              </div>

            </div>

            {/* =====================================================
                ACTIVITY INTELLIGENCE
            ===================================================== */}

            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">

              {/* FIRST ACTIVITY */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  First Activity
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {firstYear || "—"}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Earliest release
                </p>
              </div>

              {/* LATEST ACTIVITY */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  Latest Activity
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {latestYear || "—"}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Latest release
                </p>
              </div>

              {/* ACTIVE YEARS */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  Activity Span
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {activeYears !== null
                    ? `${activeYears} yrs`
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Portfolio timeline
                </p>
              </div>

              {/* AVERAGE MOVIES / YEAR */}

              <div className="rounded-xl border border-zinc-800 bg-black p-5">
                <p className="text-xs text-zinc-500">
                  Avg / Year
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {averageMoviesPerYear !== null
                    ? averageMoviesPerYear.toFixed(1)
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Movies per active year
                </p>
              </div>

            </div>

            {/* =====================================================
    LANGUAGE & GENRE BREAKDOWN
===================================================== */}

<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

  {/* =====================================================
      MOVIES BY LANGUAGE
  ===================================================== */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">

    <div className="mb-5">
      <p className="text-xs uppercase tracking-wider text-yellow-400">
        Language Intelligence
      </p>

      <h3 className="mt-1 text-base font-semibold text-white">
        Movies by Language
      </h3>

      <p className="mt-1 text-sm text-zinc-500">
        Language distribution across the company&apos;s movie portfolio.
      </p>
    </div>

    {breakdownLoading ? (
      <p className="text-sm text-zinc-500">
        Loading language intelligence...
      </p>
    ) : languageBreakdown.length === 0 ? (
      <p className="text-sm text-zinc-500">
        No language data available.
      </p>
    ) : (
      <div className="space-y-3">

        {languageBreakdown.map((language) => {

          const percentage =
            uniqueMovieIds.size > 0
              ? (language.movie_count /
                  uniqueMovieIds.size) *
                100
              : 0;

          return (
            <div
              key={language.name}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="font-medium text-white">
                    {language.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {percentage.toFixed(1)}% of portfolio
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {language.movie_count}
                  </p>

                  <p className="text-xs text-zinc-600">
                    movies
                  </p>
                </div>

              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
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
        })}

      </div>
    )}

  </div>


  {/* =====================================================
      MOVIES BY GENRE
  ===================================================== */}

  <div className="rounded-xl border border-zinc-800 bg-black p-5">

    <div className="mb-5">
      <p className="text-xs uppercase tracking-wider text-yellow-400">
        Genre Intelligence
      </p>

      <h3 className="mt-1 text-base font-semibold text-white">
        Movies by Genre
      </h3>

      <p className="mt-1 text-sm text-zinc-500">
        Genre distribution across the company&apos;s movie portfolio.
      </p>
    </div>

    {breakdownLoading ? (
      <p className="text-sm text-zinc-500">
        Loading genre intelligence...
      </p>
    ) : genreBreakdown.length === 0 ? (
      <p className="text-sm text-zinc-500">
        No genre data available.
      </p>
    ) : (
      <div className="space-y-3">

        {genreBreakdown.map((genre) => {

          const percentage =
            uniqueMovieIds.size > 0
              ? (genre.movie_count /
                  uniqueMovieIds.size) *
                100
              : 0;

          return (
            <div
              key={genre.name}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="font-medium text-white">
                    {genre.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {percentage.toFixed(1)}% of portfolio
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {genre.movie_count}
                  </p>

                  <p className="text-xs text-zinc-600">
                    movies
                  </p>
                </div>

              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
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
        })}

      </div>
    )}

  </div>

</div>

            {/* =====================================================
                COMPARISON READINESS
            ===================================================== */}

            <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-5">

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-xs uppercase tracking-wider text-yellow-400">
                    Comparison Profile
                  </p>

                  <h3 className="mt-1 text-base font-semibold text-white">
                    Portfolio comparison metrics
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    These metrics are structured so the same calculations
                    can later be compared directly against another company.
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-800 px-4 py-2">
                  <p className="text-xs text-zinc-500">
                    Comparison Ready
                  </p>

                  <p className="mt-1 text-sm font-semibold text-green-400">
                    YES
                  </p>
                </div>

              </div>

            </div>
          </>
        );
      })()}
    </>
  )}

</section>
     



        {/* =========================================================
    MOVIE PORTFOLIO
========================================================= */}

<section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

  <div className="mb-6">
    <p className="text-xs uppercase tracking-wider text-yellow-400">
      Company Portfolio
    </p>

    <h2 className="mt-1 text-xl font-semibold text-white">
      Movie Portfolio
    </h2>

    <p className="mt-1 text-sm text-zinc-500">
      Movies associated with this company and the role performed on each title.
    </p>
  </div>

  {portfolioLoading ? (
    <div className="rounded-xl border border-zinc-800 bg-black p-6">
      <p className="text-sm text-zinc-500">
        Loading movie portfolio...
      </p>
    </div>
  ) : companyMovies.length === 0 ? (
    <div className="rounded-xl border border-zinc-800 bg-black p-6">
      <p className="text-sm text-zinc-500">
        No movie portfolio records found for this company.
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto">

      <table className="w-full min-w-[650px] text-sm">

        <thead>
          <tr className="border-b border-zinc-800 text-left">

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              #
            </th>

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Movie
            </th>

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Year
            </th>

            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Company Role
            </th>

          </tr>
        </thead>

        <tbody>

          {[...companyMovies]
            .sort((a, b) => {
              if (a.release_year === null) return 1;
              if (b.release_year === null) return -1;

              return b.release_year - a.release_year;
            })
            .map((movie, index) => (

              <tr
                key={`${movie.movie_id}-${movie.role_id}`}
                className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
              >

                <td className="px-4 py-4 text-zinc-600">
                  {index + 1}
                </td>

                <td className="px-4 py-4 font-medium text-white">
                  {movie.movie_title}
                </td>

                <td className="px-4 py-4 text-zinc-400">
                  {movie.release_year || "—"}
                </td>

                <td className="px-4 py-4">

                  <span className="inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                    {movie.role_name}
                  </span>

                </td>

              </tr>

            ))}

        </tbody>

      </table>

    </div>
  )}

</section>
      </div>
    </main>
  );
}