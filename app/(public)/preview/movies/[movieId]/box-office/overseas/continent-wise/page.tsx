import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/app/(public)/components/PublicHeader";
import WorldContinentMap from "@/app/(public)/components/WorldContinentMap";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    movieId: string;
  }>;
};

type CountryRecord = {
  id: number;
  gross_usd: number | string | null;
  countries:
    | {
        id: number;
        name: string;
        iso_code: string | null;
        continent: string | null;
      }
    | {
        id: number;
        name: string;
        iso_code: string | null;
        continent: string | null;
      }[]
    | null;
};

type ContinentPerformance = {
  continent: string;
  grossUsd: number;
  countryCount: number;
};

const CONTINENT_LABELS: Record<string, string> = {
  asia: "Asia",
  europe: "Europe",
  africa: "Africa",
  north_america: "North America",
  south_america: "South America",
  oceania: "Oceania",
  antarctica: "Antarctica",
};

function normalizeContinent(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function formatUSD(value: number) {
  if (!value || value <= 0) return "—";

  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

export default async function ContinentWisePage({
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

  const { data: movie, error: movieError } =
    await supabase
      .from("movies")
      .select(`
        id,
        title,
        release_year,
        poster_url
      `)
      .eq("id", numericMovieId)
      .single();

  if (movieError || !movie) {
    notFound();
  }

  /* ---------------------------------------------------------
     COUNTRY-WISE OVERSEAS DATA
  --------------------------------------------------------- */

  const { data: countryRecords, error } =
    await supabase
      .from("movie_country_box_office")
      .select(`
        id,
        gross_usd,
        countries (
          id,
          name,
          iso_code,
          continent
        )
      `)
      .eq("movie_id", numericMovieId)
      .order("id", { ascending: true });

  if (error) {
    console.error(
      "Error loading continent-wise data:",
      error
    );
  }

  /* ---------------------------------------------------------
     GROUP COUNTRY DATA BY CONTINENT
  --------------------------------------------------------- */

  const grouped: Record<
    string,
    {
      grossUsd: number;
      countries: Set<string>;
    }
  > = {};

  (countryRecords as CountryRecord[] | null)?.forEach(
    (row) => {
      const country = Array.isArray(row.countries)
        ? row.countries[0]
        : row.countries;

      if (!country) return;

      const continent = normalizeContinent(
        country.continent
      );

      if (!continent) return;

      if (!grouped[continent]) {
        grouped[continent] = {
          grossUsd: 0,
          countries: new Set<string>(),
        };
      }

      grouped[continent].grossUsd += Number(
        row.gross_usd || 0
      );

      grouped[continent].countries.add(
        country.iso_code || country.name
      );
    }
  );

  const continentData: ContinentPerformance[] =
    Object.entries(grouped)
      .map(([continent, value]) => ({
        continent,
        grossUsd: value.grossUsd,
        countryCount: value.countries.size,
      }))
      .sort((a, b) => b.grossUsd - a.grossUsd);

  const totalUsd = continentData.reduce(
    (sum, item) => sum + item.grossUsd,
    0
  );

  const countriesTracked =
    continentData.reduce(
      (sum, item) => sum + item.countryCount,
      0
    );

  function getShare(value: number) {
    if (!totalUsd || value <= 0) return 0;

    return (value / totalUsd) * 100;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

      {/* ================================================= */}
        {/* MOVIE HEADER */}
        {/* ================================================= */}

        

            <Link
              href={`/preview/movies/${movie.id}`}
              className="text-[9px] uppercase tracking-[0.2em] text-violet-700 transition hover:text-violet-400"
            >
              ← Back to Movie
            </Link>


          
          <div className="mt-8 flex items-start gap-4"></div>

        {/* -------------------------------------------------
            MOVIE HEADER
        ------------------------------------------------- */}



        <section className="border-b border-zinc-900 pb-5">
          <div className="flex items-start gap-4">

            


            <div className="shrink-0">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="h-[105px] w-[70px] rounded-md object-cover sm:h-[135px] sm:w-[90px]"
                />
              ) : (
                <div className="flex h-[105px] w-[70px] items-center justify-center rounded-md bg-zinc-900 text-[8px] text-zinc-700 sm:h-[135px] sm:w-[90px]">
                  No Poster
                </div>
              )}
            </div>

            <div className="min-w-0 pt-1">

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                Overseas Box Office
              </p>

              <h1 className="mt-1 text-base font-medium text-zinc-100 sm:text-lg">
                {movie.title}
              </h1>

              {movie.release_year && (
                <p className="mt-1 text-[9px] text-zinc-600">
                  {movie.release_year}
                </p>
              )}

              <div className="mt-4">
                <h2 className="text-[11px] font-medium text-zinc-300">
                  Continent-wise Collection
                </h2>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Overseas performance by continent.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* -------------------------------------------------
            DATA NOTE
        ------------------------------------------------- */}

        <section className="mt-5 rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3">
          <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-600">
            Current Cumulative Data
          </p>

          <p className="mt-1 text-[9px] leading-5 text-zinc-700">
            Continental figures are derived from reported
            country-wise overseas data recorded by JMI.
          </p>
        </section>

        {/* -------------------------------------------------
            WORLD MAP
        ------------------------------------------------- */}

        <section className="mt-5">
          <WorldContinentMap data={continentData} />
        </section>

        {/* -------------------------------------------------
            CONTINENT PERFORMANCE
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="mb-3">
            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Continental Performance
            </p>

            <h2 className="mt-1 text-sm font-medium text-zinc-200">
              Reported Overseas Collection
            </h2>
          </div>

          {continentData.length === 0 ? (
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">
              <p className="text-[10px] text-zinc-600">
                No continent-wise overseas data is available.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {continentData.map((item) => {
                const label =
                  CONTINENT_LABELS[
                    normalizeContinent(item.continent)
                  ] || item.continent;

                return (
                  <div
                    key={item.continent}
                    className="rounded-xl border border-zinc-900 bg-zinc-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <p className="text-[7px] uppercase tracking-[0.16em] text-zinc-700">
                          Continent
                        </p>

                        <h3 className="mt-1 text-[12px] font-medium text-zinc-200">
                          {label}
                        </h3>
                      </div>

                      <span className="rounded-full border border-zinc-800 px-2 py-1 text-[7px] uppercase tracking-[0.12em] text-zinc-600">
                        {item.countryCount} Countries
                      </span>

                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-900 pt-3">

                      <div>
                        <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                          USD Gross
                        </p>

                        <p className="mt-1 text-[9px] text-zinc-300">
                          {formatUSD(item.grossUsd)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                          Share
                        </p>

                        <p className="mt-1 text-[9px] text-zinc-300">
                          {getShare(item.grossUsd).toFixed(1)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                          Countries
                        </p>

                        <p className="mt-1 text-[9px] text-zinc-500">
                          {item.countryCount}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </section>

        {/* -------------------------------------------------
            CONTINENTAL SNAPSHOT
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="mb-3">
            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Continental Snapshot
            </p>

            <h2 className="mt-1 text-sm font-medium text-zinc-200">
              Overseas Reporting Coverage
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Continents
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-300">
                {continentData.length}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Countries
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-300">
                {countriesTracked}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Reported USD
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-300">
                {formatUSD(totalUsd)}
              </p>
            </div>

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
            Continental figures are calculated from the
            country-wise USD gross figures currently reported
            in JMI. They represent the aggregate of available
            country records and should not be interpreted as
            an independently reported continental total.
          </p>

        </section>

        {/* -------------------------------------------------
            NAVIGATION
        ------------------------------------------------- */}

        <section className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">

          <Link
            href={`/preview/movies/${movie.id}/box-office/overseas/country-wise`}
            className="rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 text-center text-[9px] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
          >
            Country-wise Collection
          </Link>

          <div className="rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3 text-center text-[9px] text-violet-300">
            Continent-wise Collection
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 text-center text-[9px] text-zinc-700">
            Major Territories
            <span className="ml-1 text-[7px]">
              Coming Soon
            </span>
          </div>

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