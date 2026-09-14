import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "../../../../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type CountryRecord = {
  id: number;
  country_id: number | string;
  
  gross_usd: number | string | null;
  status_id: number | string | null;
  notes: string | null;

  countries?:
    | {
        id: number;
        name: string;
        iso_code: string | null;
      }
    | {
        id: number;
        name: string;
        iso_code: string | null;
      }[]
    | null;
};

export default async function OverseasCountryWisePage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;

  // --------------------------------------------------
  // Movie
  // --------------------------------------------------

  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      release_year,
      poster_url
    `)
    .eq("id", movieId)
    .eq("is_active", true)
    .single();

  if (movieError || !movie) {
    console.error(
      "JMI Overseas Country-wise Movie Error:",
      movieError
    );

    notFound();
  }

  // --------------------------------------------------
  // Country-wise overseas data
  // --------------------------------------------------

  const {
    data: countryData,
    error: countryError,
  } = await supabase
    .from("movie_country_box_office")
    .select(`
      id,
      country_id,
      gross_usd,
      status_id,
      notes,
      countries (
        id,
        name,
        iso_code
      )
    `)
    .eq("movie_id", movie.id)
    .order("gross_usd", {
      ascending: false,
      nullsFirst: false,
    });

  if (countryError) {
    console.error(
      "JMI Overseas Country-wise Box Office Error:",
      countryError
    );
  }

  const records: CountryRecord[] =
    (countryData as unknown as CountryRecord[] | null) ?? [];

  // --------------------------------------------------
  // Calculations
  // --------------------------------------------------

  /*
   * Country figures are individual country records.
   *
   * USD total is shown only as a country-record snapshot.
   * It should NOT be treated as the movie's official
   * overall Overseas Gross because country reporting
   * may be incomplete.
   */

  const usdTotal = records.reduce(
    (total, record) =>
      total + Number(record.gross_usd || 0),
    0
  );

  function getGrossShare(value: number) {
  if (!usdTotal || value <= 0) {
    return 0;
  }

  return (value / usdTotal) * 100;
}

  const countriesReported = records.length;

  
  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  function formatUSD(value: number) {
    if (!value || value <= 0) {
      return "—";
    }

    if (value >= 10000000) {
      return `$${(value / 10000000).toFixed(2)} Cr`;
    }

    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }

    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }

    return `$${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value)}`;
  }

 

  function getCountryName(
    record: CountryRecord
  ) {
    if (Array.isArray(record.countries)) {
      return (
        record.countries[0]?.name ??
        "Unknown"
      );
    }

    return (
      record.countries?.name ??
      "Unknown"
    );
  }

  function getIsoCode(
    record: CountryRecord
  ) {
    if (Array.isArray(record.countries)) {
      return (
        record.countries[0]?.iso_code ??
        null
      );
    }

    return (
      record.countries?.iso_code ??
      null
    );
  }

  function getStatus(
    statusId: number | string | null
  ) {
    const id =
      statusId === null
        ? null
        : Number(statusId);

    switch (id) {
      case 1:
        return "Estimated";

      case 2:
        return "Official";

      case 3:
        return "Actual";

      case 4:
        return "Revised";

      case 5:
        return "Projected";

      default:
        return "—";
    }
  }

  const hasData = records.length > 0;

  return (
    <div className="min-h-screen bg-black text-white">

      <PublicHeader />

      <main>

        {/* ================================================= */}
        {/* MOVIE HEADER */}
        {/* ================================================= */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">

            <Link
              href={`/preview/movies/${movie.id}`}
              className="text-[9px] uppercase tracking-[0.2em] text-violet-700 transition hover:text-violet-400"
            >
              ← Back to Movie
            </Link>

            <div className="mt-8 flex items-start gap-4">

              {/* =================================================
                  POSTER
              ================================================= */}

              <div className="h-[105px] w-[70px] flex-shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 sm:h-[135px] sm:w-[90px]">

                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={`${movie.title} poster`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xl text-zinc-800">
                      ◈
                    </span>
                  </div>
                )}

              </div>

              {/* =================================================
                  MOVIE INFORMATION
              ================================================= */}

              <div className="min-w-0">

                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                  Overseas Box Office
                </p>

                <h1 className="mt-2 text-xl font-medium leading-tight tracking-[-0.03em] text-zinc-100 sm:text-2xl">
                  {movie.title}
                </h1>

                {movie.release_year && (
                  <p className="mt-1 text-[9px] text-zinc-600">
                    {movie.release_year}
                  </p>
                )}

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* COUNTRY-WISE INTELLIGENCE */}
        {/* ================================================= */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              Country-wise Collection
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-100">
              Overseas country performance.
            </h2>

            <p className="mt-2 max-w-2xl text-[10px] leading-5 text-zinc-600">
              Current cumulative theatrical performance
              recorded across individual overseas countries.
            </p>

            {/* ================================================= */}
            {/* INFORMATION NOTE */}
            {/* ================================================= */}

            <div className="mt-7 rounded-xl border border-violet-400/15 bg-zinc-950 px-5 py-4">

              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                Current Cumulative Data
              </p>

              <p className="mt-2 text-[9px] leading-5 text-zinc-600">
                Country-wise figures represent the latest
                cumulative overseas performance recorded
                for each individual country. USD figures are
                manually reported values. Local-currency
                figures are displayed as entered. No automatic
                currency conversion is performed.
              </p>

            </div>

            {/* ================================================= */}
            {/* COUNTRY PERFORMANCE */}
            {/* ================================================= */}

            <div className="mt-8">

              <div className="mb-4">

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
                  Country Performance
                </p>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Latest cumulative figures by country.
                </p>

              </div>

              {!hasData ? (

                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-10 text-center">

                  <p className="text-[9px] text-zinc-600">
                    Country-wise overseas box office data
                    is not available yet.
                  </p>

                  <p className="mt-2 text-[8px] text-zinc-800">
                    JMI will display country intelligence
                    when verified data becomes available.
                  </p>

                </div>

              ) : (

                <div className="space-y-2">

                  {records.map((record) => {

                    const countryName =
                      getCountryName(record);

                    const isoCode =
                      getIsoCode(record);

                    const usd =
                      Number(
                        record.gross_usd || 0
                      );

                    

                    const status =
                      getStatus(
                        record.status_id
                      );

                    return (
                      <div
                        key={record.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-violet-400/20 sm:p-5"
                      >

                        {/* =================================================
                            COUNTRY HEADER
                        ================================================= */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <div className="flex items-center gap-2">

                              <p className="text-[10px] font-medium text-zinc-200">
                                {countryName}
                              </p>

                              {isoCode && (
                                <span className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                                  {isoCode}
                                </span>
                              )}

                            </div>

                            <p className="mt-1 text-[7px] uppercase tracking-[0.16em] text-zinc-700">
                              Current cumulative performance
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-[12px] font-medium text-violet-400">
                              {formatUSD(usd)}
                            </p>

                            <p className="mt-0.5 text-[7px] uppercase tracking-[0.12em] text-zinc-700">
                              USD Gross
                            </p>

                          </div>

                        </div>

                       {/* =================================================
    COUNTRY DETAILS
================================================= */}

<div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-900 pt-3">

  {/* USD */}

  <div>

    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
      USD Gross
    </p>

    <p className="mt-1 text-[9px] text-zinc-300">
      {formatUSD(usd)}
    </p>

  </div>

  {/* SHARE */}

  <div>

    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
      Share
    </p>

    <p className="mt-1 text-[9px] text-zinc-300">
      {getGrossShare(usd).toFixed(1)}%
    </p>

  </div>

  {/* STATUS */}

  <div>

    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
      Status
    </p>

    <p className="mt-1 text-[9px] text-zinc-500">
      {status}
    </p>

  </div>

</div>

                      </div>
                    );
                  })}

                </div>

              )}

            </div>

            {/* ================================================= */}
            {/* COUNTRY SNAPSHOT */}
            {/* ================================================= */}

           <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">

  {/* COUNTRIES */}

  <div>

    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
      Countries Tracked
    </p>

    <p className="mt-1 text-sm font-medium text-zinc-200">
      {countriesReported}
    </p>

  </div>

  {/* USD RECORDS */}

  <div>

    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
      USD Records
    </p>

    <p className="mt-1 text-sm font-medium text-zinc-200">
      {
        records.filter(
          (record) =>
            Number(record.gross_usd || 0) > 0
        ).length
      }
    </p>

  </div>

  {/* REPORTED USD TOTAL */}

  <div>

    <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-700">
      Reported USD Gross
    </p>

    <p className="mt-1 text-sm font-medium text-violet-400">
      {formatUSD(usdTotal)}
    </p>

  </div>

</div>


        

            {/* ================================================= */}
            {/* DATA NOTE */}
            {/* ================================================= */}

            <div className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950/60 px-5 py-4">

              <p className="text-[8px] leading-5 text-zinc-700">
                Country-wise figures are individual country
                records and may represent only the countries
                for which data has been recorded. The reported
                country USD total should therefore not be
                interpreted as the movie's overall overseas
                gross. JMI's overall overseas figure is maintained
                separately.
              </p>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-3 sm:flex-row">

              <Link
                href={`/preview/movies/${movie.id}`}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-zinc-500 transition hover:border-violet-400/30 hover:text-violet-400"
              >
                ← Movie Intelligence
              </Link>

              <Link
                href={`/preview/movies/${movie.id}/box-office`}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-zinc-500 transition hover:border-violet-400/30 hover:text-violet-400"
              >
                Box Office
              </Link>

            </div>

          </div>

        </section>

      </main>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="border-t border-zinc-900">

        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <p className="font-serif text-sm text-zinc-300">
              Jeruto{" "}
              <span className="text-yellow-400">
                Movie Intelligence
              </span>
            </p>

            <p className="text-[9px] text-zinc-700">
              JMI · Indian Movie Intelligence
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}