import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    movieId: string;
  }>;
};

type TerritoryRecord = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  grossUsd: number;
  countryCount: number;
};

function formatUSD(value: number) {
  if (!value || value <= 0) return "—";

  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function getShare(value: number, total: number) {
  if (!total || value <= 0) return 0;

  return (value / total) * 100;
}

export default async function MajorTerritoriesPage({
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
     TERRITORY GROUPS
  --------------------------------------------------------- */

  const {
    data: groups,
    error: groupsError,
  } = await supabase
    .from("overseas_territory_groups")
    .select(`
      id,
      name,
      slug,
      description
    `)
    .order("id", {
      ascending: true,
    });

  if (groupsError) {
    console.error(
      "Territory groups fetch error:",
      groupsError
    );
  }

  /* ---------------------------------------------------------
     MOVIE COUNTRY-WISE COLLECTION
  --------------------------------------------------------- */

  const {
    data: countryRecords,
    error: countryError,
  } = await supabase
    .from("movie_country_box_office")
    .select(`
      country_id,
      gross_usd
    `)
    .eq("movie_id", numericMovieId);

  if (countryError) {
    console.error(
      "Country-wise collection fetch error:",
      countryError
    );
  }

  /* ---------------------------------------------------------
     COUNTRIES
  --------------------------------------------------------- */

  const {
    data: countries,
    error: countriesError,
  } = await supabase
    .from("countries")
    .select(`
      id,
      name,
      iso_code,
      slug
    `);

  if (countriesError) {
    console.error(
      "Countries fetch error:",
      countriesError
    );
  }

  /* ---------------------------------------------------------
     TERRITORY MAPPINGS
  --------------------------------------------------------- */

  const {
    data: mappings,
    error: mappingsError,
  } = await supabase
    .from("overseas_territory_group_countries")
    .select(`
      territory_group_id,
      country_id
    `);

  if (mappingsError) {
    console.error(
      "Territory mappings fetch error:",
      mappingsError
    );
  }

  /* ---------------------------------------------------------
     COUNTRY USD MAP
  --------------------------------------------------------- */

  const countryUsdMap =
    new Map<number, number>();

  (countryRecords || []).forEach(
    (record: any) => {
      countryUsdMap.set(
        Number(record.country_id),
        Number(record.gross_usd || 0)
      );
    }
  );

  /* ---------------------------------------------------------
     AGGREGATE ENTRIES
  --------------------------------------------------------- */

  const gccCountry =
    (countries || []).find(
      (country: any) =>
        country.slug === "gcc"
    );

  const northAmericaCountry =
    (countries || []).find(
      (country: any) =>
        country.slug === "north-america"
    );

  const gccId = gccCountry
    ? Number(gccCountry.id)
    : null;

  const northAmericaId =
    northAmericaCountry
      ? Number(northAmericaCountry.id)
      : null;

  const hasGccAggregate =
    gccId !== null &&
    countryUsdMap.has(gccId);

  const hasNorthAmericaAggregate =
    northAmericaId !== null &&
    countryUsdMap.has(
      northAmericaId
    );

  /* ---------------------------------------------------------
     CALCULATE TERRITORY TOTALS
  --------------------------------------------------------- */

  const calculatedRecords: TerritoryRecord[] =
    (groups || []).map((group: any) => {
      const groupMappings =
        (mappings || []).filter(
          (mapping: any) =>
            Number(
              mapping.territory_group_id
            ) === Number(group.id)
        );

      let grossUsd = 0;

      const countriesWithData =
        new Set<number>();

      /* -----------------------------------------------
         GCC AGGREGATE OVERRIDE
      ------------------------------------------------ */

      if (
        group.slug === "gcc" &&
        hasGccAggregate &&
        gccId !== null
      ) {
        grossUsd =
          countryUsdMap.get(gccId) || 0;

        countriesWithData.add(gccId);

        return {
          id: Number(group.id),
          name: group.name,
          slug: group.slug,
          description:
            group.description,
          grossUsd,
          countryCount:
            countriesWithData.size,
        };
      }

      /* -----------------------------------------------
         NORTH AMERICA AGGREGATE OVERRIDE
      ------------------------------------------------ */

      if (
        group.slug === "north-america" &&
        hasNorthAmericaAggregate &&
        northAmericaId !== null
      ) {
        grossUsd =
          countryUsdMap.get(
            northAmericaId
          ) || 0;

        countriesWithData.add(
          northAmericaId
        );

        return {
          id: Number(group.id),
          name: group.name,
          slug: group.slug,
          description:
            group.description,
          grossUsd,
          countryCount:
            countriesWithData.size,
        };
      }

      /* -----------------------------------------------
         NORMAL COUNTRY CALCULATION
      ------------------------------------------------ */

      groupMappings.forEach(
        (mapping: any) => {
          const countryId =
            Number(mapping.country_id);

          if (
            group.slug === "gcc" &&
            hasGccAggregate
          ) {
            return;
          }

          if (
            group.slug === "north-america" &&
            hasNorthAmericaAggregate
          ) {
            return;
          }

          const countryGross =
            countryUsdMap.get(
              countryId
            ) || 0;

          grossUsd += countryGross;

          if (
            countryUsdMap.has(
              countryId
            )
          ) {
            countriesWithData.add(
              countryId
            );
          }
        }
      );

      return {
        id: Number(group.id),
        name: group.name,
        slug: group.slug,
        description:
          group.description,
        grossUsd,
        countryCount:
          countriesWithData.size,
      };
    });

  /* ---------------------------------------------------------
     SORT BY COLLECTION
  --------------------------------------------------------- */

  calculatedRecords.sort(
    (a, b) =>
      b.grossUsd - a.grossUsd
  );

  const totalUsd =
    calculatedRecords.reduce(
      (sum, record) =>
        sum + record.grossUsd,
      0
    );

  const countriesReported =
    calculatedRecords.reduce(
      (sum, record) =>
        sum + record.countryCount,
      0
    );

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* -------------------------------------------------
            BACK TO MOVIE
        ------------------------------------------------- */}

       
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
                  Major Territories
                </h2>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Commercial territory performance across overseas markets.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* -------------------------------------------------
            CURRENT CUMULATIVE DATA
        ------------------------------------------------- */}

        <section className="mt-5 rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3">

          <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-600">
            Current Cumulative Data
          </p>

          <p className="mt-1 text-[9px] leading-5 text-zinc-700">
            Major territory figures are derived from the
            country-wise overseas collection recorded by JMI.
          </p>

        </section>

        {/* -------------------------------------------------
            MAJOR TERRITORY PERFORMANCE
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="mb-3">

            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Major Territory Performance
            </p>

            <h2 className="mt-1 text-sm font-medium text-zinc-200">
              Reported Overseas Collection
            </h2>

          </div>

          {calculatedRecords.length === 0 ? (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">

              <p className="text-[10px] text-zinc-600">
                No major territory data is available.
              </p>

            </div>

          ) : (

            <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[620px]">

                  <thead className="border-b border-zinc-900">

                    <tr>

                      <th className="px-4 py-3 text-left text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                        Territory
                      </th>

                      <th className="px-4 py-3 text-left text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                        Description
                      </th>

                      <th className="px-4 py-3 text-right text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                        Countries
                      </th>

                      <th className="px-4 py-3 text-right text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                        USD Gross
                      </th>

                      <th className="px-4 py-3 text-right text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                        Share
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {calculatedRecords.map(
                      (record, index) => (
                        <tr
                          key={record.id}
                          className="border-b border-zinc-900 last:border-b-0 hover:bg-zinc-900/30"
                        >

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-3">

                              <span className="text-[8px] text-zinc-700">
                                {String(
                                  index + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <div>

                                <p className="text-[10px] font-medium text-zinc-200">
                                  {record.name}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="max-w-[240px] px-4 py-4 text-[9px] leading-4 text-zinc-600">

                            {record.description ||
                              "—"}

                          </td>

                          <td className="px-4 py-4 text-right text-[9px] text-zinc-500">

                            {record.countryCount}

                          </td>

                          <td className="px-4 py-4 text-right text-[10px] font-medium text-zinc-200">

                            {formatUSD(
                              record.grossUsd
                            )}

                          </td>

                          <td className="px-4 py-4 text-right text-[9px] text-zinc-500">

                            {getShare(
                              record.grossUsd,
                              totalUsd
                            ).toFixed(1)}
                            %

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                  <tfoot>

                    <tr className="border-t border-zinc-800">

                      <td
                        colSpan={3}
                        className="px-4 py-4 text-[8px] uppercase tracking-[0.14em] text-zinc-700"
                      >
                        Territory Group Sum
                      </td>

                      <td className="px-4 py-4 text-right text-[10px] font-medium text-violet-300">
                        {formatUSD(
                          totalUsd
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-[9px] text-zinc-600">
                        100.0%
                      </td>

                    </tr>

                  </tfoot>

                </table>

              </div>

            </div>

          )}

        </section>

        {/* -------------------------------------------------
            TERRITORY SNAPSHOT
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="mb-3">

            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Territory Snapshot
            </p>

            <h2 className="mt-1 text-sm font-medium text-zinc-200">
              Overseas Reporting Coverage
            </h2>

          </div>

          <div className="grid grid-cols-3 gap-2">

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Territories
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-300">
                {calculatedRecords.length}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                Countries
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-300">
                {countriesReported}
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
            Major territory figures are analytical views
            generated from the country-wise overseas records
            available in JMI. Territory groups may contain
            multiple countries or aggregate market entries.
            Therefore, the territory group sum should not be
            treated as the movie&apos;s overall overseas collection.
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

          <Link
            href={`/preview/movies/${movie.id}/box-office/overseas/continent-wise`}
            className="rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 text-center text-[9px] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
          >
            Continent-wise Collection
          </Link>

          <div className="rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3 text-center text-[9px] text-violet-300">
            Major Territories
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