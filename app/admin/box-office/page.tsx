"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BoxOfficeMovieSelector from "@/components/box-office/BoxOfficeMovieSelector";
import { supabase } from "@/lib/supabase";

type IndiaTotals = {
  gross: number;
  net: number;
  admissions: number;
};

type OverseasTotals = {
  usd: number;
  inr: number;
};

export default function BoxOfficePage() {
  const router = useRouter();

  const [indiaOpen, setIndiaOpen] = useState(true);
  const [overseasOpen, setOverseasOpen] = useState(true);

  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  const [indiaTotals, setIndiaTotals] =
    useState<IndiaTotals>({
      gross: 0,
      net: 0,
      admissions: 0,
    });

  const [overseasTotals, setOverseasTotals] =
    useState<OverseasTotals>({
      usd: 0,
      inr: 0,
    });

  const [loadingOverseas, setLoadingOverseas] =
    useState(false);

  const indiaOptions = [
    "State-wise Collection",
    "Geographical Breakdown",
    "Language-wise Collection",
    "Day-wise Collection",
    "City-wise Collection",
    "Format-wise Collection",
  ];

  // --------------------------------------------------
  // LOAD ALL TOTALS WHEN MOVIE CHANGES
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedMovie) {
      setIndiaTotals({
        gross: 0,
        net: 0,
        admissions: 0,
      });

      setOverseasTotals({
        usd: 0,
        inr: 0,
      });

      return;
    }

    fetchIndiaTotals(selectedMovie.id);
    fetchOverseasTotals(selectedMovie.id);
  }, [selectedMovie]);

  // --------------------------------------------------
  // INDIA TOTALS
  // --------------------------------------------------

  async function fetchIndiaTotals(movieId: number) {
    const { data, error } = await supabase
      .from("movie_state_box_office")
      .select(
        "gross_jmi, net_jmi, admissions, coverage_type"
      )
      .eq("movie_id", movieId);

    if (error) {
      console.error(
        "India state-wise total fetch error:",
        error
      );

      return;
    }

    const totals = (data || []).reduce(
      (acc, row) => {
        acc.gross += Number(row.gross_jmi || 0);
        acc.net += Number(row.net_jmi || 0);
        acc.admissions += Number(
          row.admissions || 0
        );

        return acc;
      },
      {
        gross: 0,
        net: 0,
        admissions: 0,
      }
    );

    setIndiaTotals(totals);
  }

  // --------------------------------------------------
  // OVERSEAS TOTALS
  // --------------------------------------------------

  async function fetchOverseasTotals(
    movieId: number
  ) {
    setLoadingOverseas(true);

    // -----------------------------------------------
    // COUNTRY-WISE USD TOTAL
    // -----------------------------------------------

    const {
      data: countryData,
      error: countryError,
    } = await supabase
      .from("movie_country_box_office")
      .select("gross_usd")
      .eq("movie_id", movieId);

    if (countryError) {
      console.error(
        "Country-wise overseas total error:",
        countryError
      );
    }

    let countryWiseUsd: number | null = null;

    const rows = countryData || [];

    const hasUsdData = rows.some(
      (row) => row.gross_usd !== null
    );

    if (hasUsdData) {
      countryWiseUsd = rows.reduce(
        (sum, row) =>
          sum + Number(row.gross_usd || 0),
        0
      );
    }

    // -----------------------------------------------
    // OVERSEAS MASTER RECORD
    // -----------------------------------------------

    const {
      data: overseasRecord,
      error: overseasError,
    } = await supabase
      .from("movie_overseas_box_office")
      .select(
        "gross_usd, gross_inr"
      )
      .eq("movie_id", movieId)
      .limit(1)
      .maybeSingle();

    if (overseasError) {
      console.error(
        "Overseas master total error:",
        overseasError
      );
    }

    const finalUsd =
      countryWiseUsd !== null
        ? countryWiseUsd
        : Number(
            overseasRecord?.gross_usd || 0
          );

    const finalInr = Number(
      overseasRecord?.gross_inr || 0
    );

    setOverseasTotals({
      usd: finalUsd,
      inr: finalInr,
    });

    setLoadingOverseas(false);
  }

  // --------------------------------------------------
  // FORMATTING
  // --------------------------------------------------

  function formatNumber(value: number) {
    return new Intl.NumberFormat(
      "en-IN"
    ).format(value);
  }

  function formatCollection(value: number) {
    if (!value) return "—";

    return (
      "₹" +
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(value)
    );
  }

  function formatUSD(value: number) {
    if (!value) return "—";

    return (
      "$" +
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }).format(value)
    );
  }

  // --------------------------------------------------
  // WORLDWIDE TOTAL
  // --------------------------------------------------

  const worldwideGross =
    indiaTotals.gross +
    overseasTotals.inr;

  // --------------------------------------------------
  // INDIA NAVIGATION
  // --------------------------------------------------

  function handleIndiaOption(option: string) {
    if (!selectedMovie) {
      alert("Please select a movie first.");
      return;
    }

    if (option === "Day-wise Collection") {
      router.push(
        `/admin/box-office/day-wise?movieId=${selectedMovie.id}`
      );
      return;
    }

    if (option === "State-wise Collection") {
      router.push(
        `/admin/box-office/state-wise?movieId=${selectedMovie.id}`
      );
      return;
    }

    if (option === "City-wise Collection") {
      router.push(
        `/admin/box-office/city-wise?movieId=${selectedMovie.id}`
      );
      return;
    }

    if (option === "Format-wise Collection") {
      router.push(
        `/admin/box-office/format-wise?movieId=${selectedMovie.id}`
      );
      return;
    }

    if (option === "Geographical Breakdown") {
      router.push(
        `/admin/box-office/geographical?movieId=${selectedMovie.id}`
      );
      return;
    }

    if (option === "Language-wise Collection") {
      router.push(
        `/admin/box-office/language-wise?movieId=${selectedMovie.id}`
      );
      return;
    }
  }

  // --------------------------------------------------
  // OVERSEAS NAVIGATION
  // --------------------------------------------------

  function openOverseas() {
    if (!selectedMovie) {
      alert("Please select a movie first.");
      return;
    }

    router.push(
      `/admin/box-office/overseas?movieId=${selectedMovie.id}`
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black p-6 text-white">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-yellow-400">
          Box Office Overview
        </h1>

        <p className="mt-1 text-gray-400">
          Complete India, Overseas and Worldwide
          theatrical performance
        </p>

      </div>

      {/* MOVIE SELECTOR */}

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6">

        <BoxOfficeMovieSelector
          onMovieSelect={(movie) => {
            setSelectedMovie(movie);
          }}
        />

      </div>

      {/* SELECTED MOVIE */}

      {selectedMovie && (
        <>

          <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

            <h2 className="text-lg font-semibold text-yellow-400">
              Selected Movie
            </h2>

            <p className="mt-2 text-xl font-semibold">
              {selectedMovie.title}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Movie ID: {selectedMovie.id}
            </p>

          </div>

          {/* ==========================================
              MAIN BOX OFFICE OVERVIEW
          ========================================== */}

          <div className="mb-10">

            <h2 className="mb-4 text-xl font-bold">
              Box Office Overview
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* INDIA GROSS */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                <p className="text-sm text-gray-400">
                  India Gross
                </p>

                <h3 className="mt-2 text-3xl font-bold text-yellow-400">
                  {formatCollection(
                    indiaTotals.gross
                  )}
                </h3>

              </div>

              {/* OVERSEAS GROSS */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                <p className="text-sm text-gray-400">
                  Overseas Gross
                </p>

                <h3 className="mt-2 text-3xl font-bold text-yellow-400">
                  {loadingOverseas
                    ? "Loading..."
                    : formatCollection(
                        overseasTotals.inr
                      )}
                </h3>

              </div>

              {/* WORLDWIDE GROSS */}

              <div className="rounded-xl border border-yellow-500/40 bg-zinc-950 p-6">

                <p className="text-sm text-gray-400">
                  Worldwide Gross
                </p>

                <h3 className="mt-2 text-3xl font-bold text-yellow-400">
                  {formatCollection(
                    worldwideGross
                  )}
                </h3>

              </div>

            </div>

          </div>

          {/* ==========================================
              SECONDARY OVERVIEW
          ========================================== */}

          <div className="mb-10">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* INDIA NET */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                <p className="text-sm text-gray-400">
                  India Net
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {formatCollection(
                    indiaTotals.net
                  )}
                </h3>

              </div>

              {/* INDIA FOOTFALLS */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                <p className="text-sm text-gray-400">
                  India Footfalls
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {indiaTotals.admissions
                    ? formatNumber(
                        indiaTotals.admissions
                      )
                    : "—"}
                </h3>

              </div>

              {/* OVERSEAS USD */}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                <p className="text-sm text-gray-400">
                  Overseas Gross (USD)
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {loadingOverseas
                    ? "Loading..."
                    : formatUSD(
                        overseasTotals.usd
                      )}
                </h3>

              </div>

            </div>

          </div>

        </>
      )}

      {/* ==========================================
          INDIA COLLECTION
      ========================================== */}

      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950">

        <button
          onClick={() =>
            setIndiaOpen(!indiaOpen)
          }
          className="flex w-full items-center justify-between p-6 text-left"
        >

          <div>

            <h2 className="text-xl font-bold">
              🇮🇳 India Collection
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Detailed India theatrical performance
            </p>

          </div>

          <span className="text-xl text-yellow-400">
            {indiaOpen ? "−" : "+"}
          </span>

        </button>

        {indiaOpen && (

          <div className="border-t border-zinc-800 p-4">

            {indiaOptions.map(
              (option) => (

                <button
                  key={option}
                  onClick={() =>
                    handleIndiaOption(option)
                  }
                  className="flex w-full items-center justify-between rounded-lg px-5 py-4 text-left transition hover:bg-zinc-900"
                >

                  <span>
                    {option}
                  </span>

                  <span className="text-gray-500">
                    →
                  </span>

                </button>

              )
            )}

          </div>

        )}

      </div>

      {/* ==========================================
          OVERSEAS COLLECTION
      ========================================== */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950">

        <button
          onClick={() =>
            setOverseasOpen(
              !overseasOpen
            )
          }
          className="flex w-full items-center justify-between p-6 text-left"
        >

          <div>

            <h2 className="text-xl font-bold">
              🌎 Overseas Collection
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              International theatrical performance
            </p>

          </div>

          <span className="text-xl text-yellow-400">
            {overseasOpen ? "−" : "+"}
          </span>

        </button>

        {overseasOpen && (

          <div className="border-t border-zinc-800 p-4">

            <button
              onClick={openOverseas}
              className="flex w-full items-center justify-between rounded-lg px-5 py-4 text-left transition hover:bg-zinc-900"
            >

              <div>

                <span>
                  Overseas Collection
                </span>

                <p className="mt-1 text-xs text-zinc-500">
                  Country-wise, continental and
                  territory-level analysis
                </p>

              </div>

              <span className="text-gray-500">
                →
              </span>

            </button>

          </div>

        )}

      </div>

    </div>
  );
}