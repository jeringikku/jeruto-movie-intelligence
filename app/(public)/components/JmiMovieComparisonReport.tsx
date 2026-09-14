"use client";

import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type Entity = {
  id: number;
  title: string;
  subtitle?: string;
  image?: string | null;
};

type MovieData = {
  id: number;
  title: string;
  releaseYear: number | null;
  language: string | null;
  industry: string | null;
  leadActor: string | null;

  india: number | null;
  overseas: number | null;
  worldwide: number | null;

  kerala: number | null;
  tamilNadu: number | null;
  karnataka: number | null;
  teluguStates: number | null;

  highestState: {
    name: string;
    gross: number;
  } | null;

  openingDayIndia: number | null;

  budget: number | null;
  theatricalVerdict: string | null;
};

type Props = {
  first: Entity;
  second: Entity;
};

type WinnerSide = "A" | "B" | "Tie" | "NA";


/* ============================================================
   HELPERS
============================================================ */

function formatCrores(value: number | null) {
  if (value === null || value <= 0) {
    return "Not enough data";
  }

  return `₹${(value / 10000000).toFixed(2)} Cr`;
}


function winner(
  first: number | null,
  second: number | null
): WinnerSide {
  if (
    first === null ||
    second === null ||
    first <= 0 ||
    second <= 0
  ) {
    return "NA";
  }

  if (first > second) return "A";
  if (second > first) return "B";

  return "Tie";
}


function winnerName(
  side: WinnerSide,
  firstName: string,
  secondName: string
) {
  if (side === "A") return firstName;
  if (side === "B") return secondName;
  if (side === "Tie") return "Tie";
  return "Not enough data";
}


/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function JmiMovieComparisonReport({
  first,
  second,
}: Props) {
  const [firstMovie, setFirstMovie] =
    useState<MovieData | null>(null);

  const [secondMovie, setSecondMovie] =
    useState<MovieData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;

    async function loadComparison() {
      setLoading(true);
      setError(null);

      try {
        const [movieA, movieB] = await Promise.all([
          loadMovieData(first.id),
          loadMovieData(second.id),
        ]);

        if (cancelled) return;

        setFirstMovie(movieA);
        setSecondMovie(movieB);
      } catch (err) {
        console.error(
          "JMI movie comparison error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load comparison data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComparison();

    return () => {
      cancelled = true;
    };
  }, [first.id, second.id]);


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <section
        id="jmi-comparison-report"
        className="scroll-mt-24"
      >
        <div className="rounded-2xl border border-violet-400/20 bg-zinc-950 px-5 py-10 text-center">

          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
            JMI Comparison Report
          </p>

          <p className="mt-3 text-[11px] text-zinc-500">
            Analysing JMI database...
          </p>

        </div>
      </section>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (error || !firstMovie || !secondMovie) {
    return (
      <section
        id="jmi-comparison-report"
        className="scroll-mt-24"
      >
        <div className="rounded-2xl border border-red-400/10 bg-zinc-950 px-5 py-10 text-center">

          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-red-400">
            JMI Comparison
          </p>

          <p className="mt-3 text-[10px] text-zinc-500">
            {error ?? "Not enough data"}
          </p>

        </div>
      </section>
    );
  }


  /* ==========================================================
     WINNERS
  ========================================================== */

  const worldwideWinner = winner(
    firstMovie.worldwide,
    secondMovie.worldwide
  );

  const indiaWinner = winner(
    firstMovie.india,
    secondMovie.india
  );

  const overseasWinner = winner(
    firstMovie.overseas,
    secondMovie.overseas
  );

  const openingWinner = winner(
    firstMovie.openingDayIndia,
    secondMovie.openingDayIndia
  );

  const keralaWinner = winner(
    firstMovie.kerala,
    secondMovie.kerala
  );

  const tamilNaduWinner = winner(
    firstMovie.tamilNadu,
    secondMovie.tamilNadu
  );

  const karnatakaWinner = winner(
    firstMovie.karnataka,
    secondMovie.karnataka
  );

  const teluguWinner = winner(
    firstMovie.teluguStates,
    secondMovie.teluguStates
  );

  const highestStateWinner = winner(
    firstMovie.highestState?.gross ?? null,
    secondMovie.highestState?.gross ?? null
  );


  /* ==========================================================
     FINAL JMI SCORING
  ========================================================== */

  const championship = calculateChampionship({
  worldwideWinner,
  indiaWinner,
  overseasWinner,
  openingWinner,
  keralaWinner,
  tamilNaduWinner,
  karnatakaWinner,
  teluguWinner,
  highestStateWinner,
});
  /* ==========================================================
     AUTOMATED JMI REPORT
  ========================================================== */

const automatedReport = generateAutomatedReport(
  firstMovie,
  secondMovie,
  championship
);

  return (
    <section
      id="jmi-comparison-report"
      className="scroll-mt-24 space-y-8"
    >

      {/* ======================================================
          REPORT HEADER
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-violet-400/20 bg-zinc-950">

        <div className="border-b border-zinc-900 px-5 py-4 sm:px-6">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                JMI Movie Comparison
              </p>

              <p className="mt-1 text-[9px] text-zinc-600">
                Data-backed movie intelligence
              </p>

            </div>

            <div className="flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

              <span className="text-[7px] uppercase tracking-[0.18em] text-zinc-600">
                Live database
              </span>

            </div>

          </div>

        </div>


        {/* MOVIE A / B */}

        <div className="grid gap-6 px-5 py-7 md:grid-cols-[1fr_auto_1fr] md:px-8">

          <MovieHeader
            movie={firstMovie}
            entity={first}
            side="A"
          />

          <div className="mx-auto flex h-11 w-11 items-center justify-center self-center rounded-full border border-violet-400/30 bg-violet-500/[0.06]">

            <span className="text-[8px] font-semibold tracking-[0.16em] text-violet-300">
              VS
            </span>

          </div>

          <MovieHeader
            movie={secondMovie}
            entity={second}
            side="B"
          />

        </div>

      </div>


      {/* ======================================================
          BASIC PROFILE
      ====================================================== */}

      <ComparisonSection
        eyebrow="Movie Profile"
        title="Core movie information"
        firstMovieName={firstMovie.title}
        secondMovieName={secondMovie.title}
      >

        <InfoRow
          label="Release Year"
          firstValue={
            firstMovie.releaseYear
              ? String(firstMovie.releaseYear)
              : null
          }
          secondValue={
            secondMovie.releaseYear
              ? String(secondMovie.releaseYear)
              : null
          }
        />

        <InfoRow
          label="Language"
          firstValue={firstMovie.language}
          secondValue={secondMovie.language}
        />

        <InfoRow
          label="Industry"
          firstValue={firstMovie.industry}
          secondValue={secondMovie.industry}
        />

        <InfoRow
          label="Lead Actor"
          firstValue={firstMovie.leadActor}
          secondValue={secondMovie.leadActor}
        />

      </ComparisonSection>


      {/* ======================================================
          WORLDWIDE PERFORMANCE
      ====================================================== */}

      <ComparisonSection
        eyebrow="JMI Performance"
        title="Worldwide collection"
        firstMovieName={firstMovie.title}
        secondMovieName={secondMovie.title}
      >

        <MetricRow
          label="Worldwide Gross"
          firstValue={firstMovie.worldwide}
          secondValue={secondMovie.worldwide}
          format={formatCrores}
          winnerSide={worldwideWinner}
        />

        <MetricRow
          label="India Gross"
          firstValue={firstMovie.india}
          secondValue={secondMovie.india}
          format={formatCrores}
          winnerSide={indiaWinner}
        />

        <MetricRow
          label="Overseas Gross"
          firstValue={firstMovie.overseas}
          secondValue={secondMovie.overseas}
          format={formatCrores}
          winnerSide={overseasWinner}
        />

      </ComparisonSection>


      {/* ======================================================
          INDIA MARKETS
      ====================================================== */}

      <ComparisonSection
        eyebrow="India Markets"
        title="Market performance"
        firstMovieName={firstMovie.title}
        secondMovieName={secondMovie.title}
      >

        <MetricRow
          label="Opening Day — India"
          firstValue={firstMovie.openingDayIndia}
          secondValue={secondMovie.openingDayIndia}
          format={formatCrores}
          winnerSide={openingWinner}
        />

        <MetricRow
          label="Kerala"
          firstValue={firstMovie.kerala}
          secondValue={secondMovie.kerala}
          format={formatCrores}
          winnerSide={keralaWinner}
        />

        <MetricRow
          label="Tamil Nadu"
          firstValue={firstMovie.tamilNadu}
          secondValue={secondMovie.tamilNadu}
          format={formatCrores}
          winnerSide={tamilNaduWinner}
        />

        <MetricRow
          label="Karnataka"
          firstValue={firstMovie.karnataka}
          secondValue={secondMovie.karnataka}
          format={formatCrores}
          winnerSide={karnatakaWinner}
        />

        <MetricRow
          label="Telugu States"
          firstValue={firstMovie.teluguStates}
          secondValue={secondMovie.teluguStates}
          format={formatCrores}
          winnerSide={teluguWinner}
        />

      </ComparisonSection>


      {/* ======================================================
          HIGHEST STATE MARKET
      ====================================================== */}

      <ComparisonSection
        eyebrow="Market Intelligence"
        title="Highest grossing state market"
        firstMovieName={firstMovie.title}
        secondMovieName={secondMovie.title}
      >

        <div className="grid gap-2 p-2 sm:grid-cols-2">

          <StateCard
            label={firstMovie.title}
            value={
              firstMovie.highestState
                ? firstMovie.highestState.name
                : null
            }
            gross={
              firstMovie.highestState
                ? firstMovie.highestState.gross
                : null
            }
          />

          <StateCard
            label={secondMovie.title}
            value={
              secondMovie.highestState
                ? secondMovie.highestState.name
                : null
            }
            gross={
              secondMovie.highestState
                ? secondMovie.highestState.gross
                : null
            }
          />

        </div>

      </ComparisonSection>


      {/* ======================================================
          BUSINESS INTELLIGENCE
      ====================================================== */}

      <ComparisonSection
        eyebrow="Business Intelligence"
        title="Production & theatrical position"
        firstMovieName={firstMovie.title}
        secondMovieName={secondMovie.title}
      >

        <MetricRow
          label="JMI Budget"
          firstValue={firstMovie.budget}
          secondValue={secondMovie.budget}
          format={formatCrores}
          winnerSide="NA"
        />

        <TextComparisonRow
          label="Theatrical Verdict"
          firstValue={firstMovie.theatricalVerdict}
          secondValue={secondMovie.theatricalVerdict}
        />

      </ComparisonSection>


      {/* ======================================================
          VISUAL COMPARISON
      ====================================================== */}

      <section>

        <div className="mb-4">

          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
            Visual Intelligence
          </p>

          <h3 className="mt-2 text-base font-semibold text-zinc-200">
            Performance comparison
          </h3>

          <p className="mt-1.5 text-[9px] leading-5 text-zinc-600">
            Relative JMI trade performance across the major
            comparable markets.
          </p>

        </div>


        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

          <VisualComparisonRow
            label="Worldwide"
            firstName={firstMovie.title}
            secondName={secondMovie.title}
            firstValue={firstMovie.worldwide}
            secondValue={secondMovie.worldwide}
            winnerSide={worldwideWinner}
          />

          <VisualComparisonRow
            label="India"
            firstName={firstMovie.title}
            secondName={secondMovie.title}
            firstValue={firstMovie.india}
            secondValue={secondMovie.india}
            winnerSide={indiaWinner}
          />

          <VisualComparisonRow
            label="Overseas"
            firstName={firstMovie.title}
            secondName={secondMovie.title}
            firstValue={firstMovie.overseas}
            secondValue={secondMovie.overseas}
            winnerSide={overseasWinner}
          />

          <VisualComparisonRow
            label="Opening Day"
            firstName={firstMovie.title}
            secondName={secondMovie.title}
            firstValue={firstMovie.openingDayIndia}
            secondValue={secondMovie.openingDayIndia}
            winnerSide={openingWinner}
          />

          <VisualComparisonRow
            label="Kerala"
            firstName={firstMovie.title}
            secondName={secondMovie.title}
            firstValue={firstMovie.kerala}
            secondValue={secondMovie.kerala}
            winnerSide={keralaWinner}
          />

          <VisualComparisonRow
            label="Tamil Nadu"
            firstName={firstMovie.title}
            secondName={secondMovie.title}
            firstValue={firstMovie.tamilNadu}
            secondValue={secondMovie.tamilNadu}
            winnerSide={tamilNaduWinner}
          />

          <VisualComparisonRow
            label="Karnataka"
            firstName={firstMovie.title}
            secondName={secondMovie.title}
            firstValue={firstMovie.karnataka}
            secondValue={secondMovie.karnataka}
            winnerSide={karnatakaWinner}
          />

          <VisualComparisonRow
            label="Telugu States"
            firstName={firstMovie.title}
            secondName={secondMovie.title}
            firstValue={firstMovie.teluguStates}
            secondValue={secondMovie.teluguStates}
            winnerSide={teluguWinner}
          />

        </div>

      </section>


      {/* ======================================================
          CATEGORY TROPHIES
      ====================================================== */}

      <section>

        <div className="mb-4">

          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-yellow-400/80">
            Category Trophies
          </p>

          <h3 className="mt-2 text-base font-semibold text-zinc-200">
            JMI category champions
          </h3>

          <p className="mt-1.5 text-[9px] leading-5 text-zinc-600">
            Trophies are awarded only where both movies have
            meaningful comparable data.
          </p>

        </div>


        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">

          <TrophyCard
            category="Worldwide"
            side={worldwideWinner}
            firstName={firstMovie.title}
            secondName={secondMovie.title}
          />

          <TrophyCard
            category="India"
            side={indiaWinner}
            firstName={firstMovie.title}
            secondName={secondMovie.title}
          />

          <TrophyCard
            category="Overseas"
            side={overseasWinner}
            firstName={firstMovie.title}
            secondName={secondMovie.title}
          />

          <TrophyCard
            category="Opening Day"
            side={openingWinner}
            firstName={firstMovie.title}
            secondName={secondMovie.title}
          />

          <TrophyCard
            category="Kerala"
            side={keralaWinner}
            firstName={firstMovie.title}
            secondName={secondMovie.title}
          />

          <TrophyCard
            category="Tamil Nadu"
            side={tamilNaduWinner}
            firstName={firstMovie.title}
            secondName={secondMovie.title}
          />

          <TrophyCard
            category="Karnataka"
            side={karnatakaWinner}
            firstName={firstMovie.title}
            secondName={secondMovie.title}
          />

          <TrophyCard
            category="Telugu States"
            side={teluguWinner}
            firstName={firstMovie.title}
            secondName={secondMovie.title}
          />

          <TrophyCard
            category="Highest State Market"
            side={highestStateWinner}
            firstName={firstMovie.title}
            secondName={secondMovie.title}
          />

        </div>

      </section>


      {/* ======================================================
          JMI CHAMPIONSHIP
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-yellow-400/20 bg-zinc-950">

        <div className="border-b border-zinc-900 px-5 py-4 sm:px-6">

          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-yellow-400/80">
            JMI Championship
          </p>

          <p className="mt-1 text-[9px] text-zinc-600">
            Weighted comparison across verified trade metrics
          </p>

        </div>


        <div className="px-5 py-8 sm:px-8">

          {!championship.enoughData ? (

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-black">

                <span className="text-xl">
                  🏆
                </span>

              </div>

              <p className="mt-4 text-[8px] uppercase tracking-[0.25em] text-zinc-500">
                Championship verdict
              </p>

              <h3 className="mt-2 text-lg font-semibold text-zinc-200">
                Not enough data
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-[9px] leading-5 text-zinc-600">
                The available comparable JMI data does not
                reach the minimum threshold required for a
                reliable overall championship decision.
              </p>

            </div>

          ) : (

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-yellow-400/20 bg-yellow-400/[0.04]">

                <span className="text-xl">
                  👑
                </span>

              </div>

              <p className="mt-4 text-[8px] uppercase tracking-[0.25em] text-yellow-400/80">
                JMI Comparison Champion
              </p>


              <h3 className="mt-2 text-xl font-semibold text-zinc-100">

                {championship.winner === "A"
                  ? firstMovie.title
                  : championship.winner === "B"
                    ? secondMovie.title
                    : "Tie"}

              </h3>


              {/* SCORES */}

              <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-2">

                <ChampionshipScore
                  label={firstMovie.title}
                  score={championship.scoreA}
                  winner={
                    championship.winner === "A"
                  }
                />

                <ChampionshipScore
                  label={secondMovie.title}
                  score={championship.scoreB}
                  winner={
                    championship.winner === "B"
                  }
                />

              </div>


              <p className="mt-5 text-[8px] uppercase tracking-[0.15em] text-zinc-600">
                {championship.availableWeight}% of weighted comparison data available
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          AUTOMATED JMI REPORT
      ====================================================== */}

      <section className="rounded-2xl border border-violet-400/15 bg-zinc-950">

        <div className="border-b border-zinc-900 px-5 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/[0.06]">

              <span className="text-sm">
                ✦
              </span>

            </div>

            <div>

              <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                JMI Automated Report
              </p>

              <p className="mt-1 text-[8px] text-zinc-600">
                Machine-generated interpretation of the comparison
              </p>

            </div>

          </div>

        </div>


        <div className="px-5 py-6 sm:px-6">

          <p className="text-[10px] leading-6 text-zinc-400">
            {automatedReport}
          </p>

        </div>

      </section>


      {/* ======================================================
          METHODOLOGY
      ====================================================== */}

      <section className="rounded-xl border border-zinc-900 bg-black px-5 py-5">

        <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
          JMI Methodology
        </p>

        <p className="mt-2 text-[9px] leading-5 text-zinc-700">
          JMI Compare uses structured information available in
          the JMI intelligence database. JMI trade collections
          are used for comparison, while unavailable information
          is kept unavailable. Category trophies are awarded only
          when both movies contain meaningful comparable data.
          The final JMI Championship uses weighted category
          scoring rather than simply counting category wins.
          Budget is displayed for business context but does not
          contribute to the championship score.
        </p>

      </section>

    </section>
  );
}


/* ============================================================
   JMI CHAMPIONSHIP CALCULATOR
============================================================ */

function calculateChampionship({
  worldwideWinner,
  indiaWinner,
  overseasWinner,
  openingWinner,
  keralaWinner,
  tamilNaduWinner,
  karnatakaWinner,
  teluguWinner,
  highestStateWinner,
}: {
  worldwideWinner: WinnerSide;
  indiaWinner: WinnerSide;
  overseasWinner: WinnerSide;
  openingWinner: WinnerSide;
  keralaWinner: WinnerSide;
  tamilNaduWinner: WinnerSide;
  karnatakaWinner: WinnerSide;
  teluguWinner: WinnerSide;
  highestStateWinner: WinnerSide;
}) {
  const categories = [
    {
      label: "Worldwide",
      weight: 30,
      winner: worldwideWinner,
    },
    {
      label: "India",
      weight: 20,
      winner: indiaWinner,
    },
    {
      label: "Overseas",
      weight: 15,
      winner: overseasWinner,
    },
    {
      label: "Opening Day",
      weight: 10,
      winner: openingWinner,
    },
    {
      label: "Kerala",
      weight: 5,
      winner: keralaWinner,
    },
    {
      label: "Tamil Nadu",
      weight: 5,
      winner: tamilNaduWinner,
    },
    {
      label: "Karnataka",
      weight: 5,
      winner: karnatakaWinner,
    },
    {
      label: "Telugu States",
      weight: 5,
      winner: teluguWinner,
    },
    {
      label: "Highest State Market",
      weight: 5,
      winner: highestStateWinner,
    },
  ];

  let availableWeight = 0;

  let scoreA = 0;
  let scoreB = 0;

  let winsA = 0;
  let winsB = 0;
  let ties = 0;

  for (const category of categories) {
    if (category.winner === "NA") {
      continue;
    }

    availableWeight += category.weight;

    if (category.winner === "A") {
      scoreA += category.weight;
      winsA++;
    }

    if (category.winner === "B") {
      scoreB += category.weight;
      winsB++;
    }

    if (category.winner === "Tie") {
      scoreA += category.weight / 2;
      scoreB += category.weight / 2;
      ties++;
    }
  }

  /*
   * Require at least 50% of the weighted comparison
   * to be available before declaring a championship.
   */

  const enoughData = availableWeight >= 50;

  if (!enoughData) {
    return {
      enoughData: false,
      scoreA: null,
      scoreB: null,
      winsA,
      winsB,
      ties,
      availableWeight,
      winner: "NA" as WinnerSide,
    };
  }

  const normalizedA =
    (scoreA / availableWeight) * 100;

  const normalizedB =
    (scoreB / availableWeight) * 100;

  let finalWinner: WinnerSide = "Tie";

  if (normalizedA > normalizedB) {
    finalWinner = "A";
  } else if (normalizedB > normalizedA) {
    finalWinner = "B";
  }

  return {
    enoughData: true,
    scoreA: normalizedA,
    scoreB: normalizedB,
    winsA,
    winsB,
    ties,
    availableWeight,
    winner: finalWinner,
  };
}


/* ============================================================
   JMI AUTOMATED REPORT
============================================================ */

function generateAutomatedReport(
  firstMovie: MovieData,
  secondMovie: MovieData,
  championship: ReturnType<typeof calculateChampionship>
) {
  const movieA = firstMovie.title;
  const movieB = secondMovie.title;

  if (!championship.enoughData) {
    return `JMI was able to compare ${movieA} and ${movieB} across the available trade data, but the available comparable information is not sufficient to declare a reliable overall winner. JMI therefore withholds the Championship verdict rather than forcing a result from incomplete data.;`
  }

  const finalWinnerName =
    championship.winner === "A"
      ? movieA
      : championship.winner === "B"
        ? movieB
        : "Both movies";

  const winnerCategories =
    championship.winner === "A"
      ? championship.winsA
      : championship.winner === "B"
        ? championship.winsB
        : championship.winsA +
          championship.winsB;

  const leadSentence =
    championship.winner === "Tie"
      ? `${movieA} and ${movieB} finish level in the weighted JMI Championship comparison.`
      : `${finalWinnerName} emerges as the JMI Comparison Champion based on the weighted comparable trade categories.;`

  const categorySentence =
    championship.winner === "Tie"
      ? `The comparison produced ${championship.winsA} category wins for ${movieA}, ${championship.winsB} for ${movieB}, with ${championship.ties} tied category${championship.ties === 1 ? "" : "ies"}.`
      : `${finalWinnerName} leads ${winnerCategories} of the comparable scoring categories, while the remaining categories were won by the other movie or ended in a tie.;`

  const strongestComparison = [
    {
      label: "worldwide collection",
      first: firstMovie.worldwide,
      second: secondMovie.worldwide,
    },
    {
      label: "India collection",
      first: firstMovie.india,
      second: secondMovie.india,
    },
    {
      label: "overseas collection",
      first: firstMovie.overseas,
      second: secondMovie.overseas,
    },
  ]
    .filter(
      (item) =>
        item.first !== null &&
        item.second !== null &&
        item.first > 0 &&
        item.second > 0
    )
    .sort((a, b) => {
      const ratioA =
        Math.max(a.first!, a.second!) /
        Math.min(a.first!, a.second!);

      const ratioB =
        Math.max(b.first!, b.second!) /
        Math.min(b.first!, b.second!);

      return ratioB - ratioA;
    })[0];

  const strongestSentence =
    strongestComparison
      ? `The widest measurable difference among the core worldwide markets appears in ${strongestComparison.label}.`
      : "";

  return `${leadSentence} ${categorySentence} ${strongestSentence};`
}


/* ============================================================
   LOAD MOVIE DATA
============================================================ */

async function loadMovieData(
  movieId: number
): Promise<MovieData> {

  /* ----------------------------------------------------------
     MOVIE
  ---------------------------------------------------------- */

  const { data: movie, error: movieError } =
    await supabase
      .from("movies")
      .select(`
        id,
        title,
        release_year
      `)
      .eq("id", movieId)
      .single();

  if (movieError || !movie) {
    throw movieError ?? new Error("Movie not found");
  }


  /* ----------------------------------------------------------
     PRIMARY LANGUAGE
  ---------------------------------------------------------- */

  const { data: movieLanguages } =
    await supabase
      .from("movie_languages")
      .select(`
        language_id,
        is_primary
      `)
      .eq("movie_id", movieId)
      .eq("is_primary", true)
      .limit(1);

  let language: string | null = null;

  const languageId =
    movieLanguages?.[0]?.language_id;

  if (languageId) {

    const { data } =
      await supabase
        .from("languages")
        .select("name")
        .eq("id", languageId)
        .single();

    language = data?.name ?? null;
  }


  /* ----------------------------------------------------------
     INDUSTRY
  ---------------------------------------------------------- */

  const { data: movieIndustries } =
    await supabase
      .from("movie_industries")
      .select(`
        industry_id,
        is_primary
      `)
      .eq("movie_id", movieId)
      .order("is_primary", {
        ascending: false,
      })
      .limit(1);

  let industry: string | null = null;

  const industryId =
    movieIndustries?.[0]?.industry_id;

  if (industryId) {

    const { data } =
      await supabase
        .from("industries")
        .select("name")
        .eq("id", industryId)
        .single();

    industry = data?.name ?? null;
  }


  /* ----------------------------------------------------------
     LEAD ACTOR
  ---------------------------------------------------------- */

  let leadActor: string | null = null;

  const { data: leadCredits } =
    await supabase
      .from("movie_people")
      .select(`
        person_id,
        billing_order,
        credit_type_id
      `)
      .eq("movie_id", movieId)
      .eq("credit_type_id", 1)
      .order("billing_order", {
        ascending: true,
        nullsFirst: false,
      })
      .limit(1);

  const leadPersonId =
    leadCredits?.[0]?.person_id;

  if (leadPersonId) {

    const { data } =
      await supabase
        .from("people")
        .select("full_name")
        .eq("id", leadPersonId)
        .single();

    leadActor = data?.full_name ?? null;
  }


  /* ----------------------------------------------------------
     INDIA / STATE BOX OFFICE
  ---------------------------------------------------------- */

  const { data: stateCollections } =
    await supabase
      .from("movie_state_box_office")
      .select(`
        state_id,
        gross_jmi
      `)
      .eq("movie_id", movieId);

  let india: number | null = null;
  let kerala: number | null = null;
  let tamilNadu: number | null = null;
  let karnataka: number | null = null;
  let teluguStates: number | null = null;

  const stateTotals: {
    stateId: number;
    gross: number;
  }[] = [];

  for (const row of stateCollections ?? []) {

    if (row.gross_jmi === null) continue;

    const gross = Number(row.gross_jmi);

    if (!Number.isFinite(gross)) continue;

    if (row.state_id === null) {
      continue;
    }

    stateTotals.push({
      stateId: Number(row.state_id),
      gross,
    });
  }


  /* ----------------------------------------------------------
     STATE MASTER
  ---------------------------------------------------------- */

  const stateIds = stateTotals.map(
    (row) => row.stateId
  );

  const { data: states } =
    stateIds.length > 0
      ? await supabase
          .from("states")
          .select(`
            id,
            name
          `)
          .in("id", stateIds)
      : { data: [] };


  const stateNameMap =
    new Map<number, string>();

  for (const state of states ?? []) {

    stateNameMap.set(
      Number(state.id),
      state.name
    );
  }


  /* ----------------------------------------------------------
     STATE TOTALS
  ---------------------------------------------------------- */

  let stateGrossTotal = 0;
  let hasStateGross = false;

  let highestState:
    MovieData["highestState"] = null;

  for (const row of stateTotals) {

    stateGrossTotal += row.gross;
    hasStateGross = true;

    const stateName =
      stateNameMap.get(row.stateId);

    if (
      stateName &&
      (!highestState ||
        row.gross > highestState.gross)
    ) {
      highestState = {
        name: stateName,
        gross: row.gross,
      };
    }


    switch (row.stateId) {

      case 11:
        karnataka =
          (karnataka ?? 0) + row.gross;
        break;

      case 12:
        kerala =
          (kerala ?? 0) + row.gross;
        break;

      case 23:
        tamilNadu =
          (tamilNadu ?? 0) + row.gross;
        break;

      case 1:
      case 24:
        teluguStates =
          (teluguStates ?? 0) + row.gross;
        break;

      default:
        break;
    }
  }


  /* ----------------------------------------------------------
     REST OF INDIA
  ---------------------------------------------------------- */

  const { data: restOfIndiaRows } =
    await supabase
      .from("movie_state_box_office")
      .select("gross_jmi")
      .eq("movie_id", movieId)
      .is("state_id", null);


  let restOfIndia: number | null = null;

  if (
    restOfIndiaRows &&
    restOfIndiaRows.length > 0
  ) {

    let total = 0;
    let found = false;

    for (const row of restOfIndiaRows) {

      if (row.gross_jmi === null) continue;

      const value =
        Number(row.gross_jmi);

      if (!Number.isFinite(value)) continue;

      total += value;
      found = true;
    }

    if (found) {
      restOfIndia = total;
    }
  }


  /* ----------------------------------------------------------
     INDIA TOTAL
  ---------------------------------------------------------- */

  if (hasStateGross) {

    india =
      stateGrossTotal +
      (restOfIndia ?? 0);

  } else if (restOfIndia !== null) {

    india = restOfIndia;
  }


  /* ----------------------------------------------------------
     OVERSEAS
  ---------------------------------------------------------- */

  const { data: overseas } =
    await supabase
      .from("movie_overseas_box_office")
      .select("gross_inr")
      .eq("movie_id", movieId)
      .maybeSingle();

  const overseasGross =
    overseas?.gross_inr !== null &&
    overseas?.gross_inr !== undefined
      ? Number(overseas.gross_inr)
      : null;


  /* ----------------------------------------------------------
     WORLDWIDE
  ---------------------------------------------------------- */

  let worldwide: number | null = null;

  if (
    india !== null &&
    Number.isFinite(india) &&
    overseasGross !== null &&
    Number.isFinite(overseasGross)
  ) {

    worldwide =
      india + overseasGross;
  }


  /* ----------------------------------------------------------
     OPENING DAY — INDIA
  ---------------------------------------------------------- */

  let openingDayIndia: number | null = null;

  const { data: countryOpening } =
    await supabase
      .from("movie_daily_box_office")
      .select("gross_jmi")
      .eq("movie_id", movieId)
      .eq("country_id", 1)
      .eq("coverage_type", "COUNTRY")
      .eq("day_number", 1)
      .not("gross_jmi", "is", null)
      .order("collection_date", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

  if (
    countryOpening?.gross_jmi !== null &&
    countryOpening?.gross_jmi !== undefined
  ) {

    const value =
      Number(countryOpening.gross_jmi);

    if (Number.isFinite(value)) {
      openingDayIndia = value;
    }
  }


  /* ----------------------------------------------------------
     BUSINESS INTELLIGENCE
  ---------------------------------------------------------- */

  const { data: business } =
    await supabase
      .from("movie_business")
      .select(`
        production_budget_trade,
        theatrical_verdict
      `)
      .eq("movie_id", movieId)
      .maybeSingle();


  let budget: number | null = null;

  if (
    business?.production_budget_trade !== null &&
    business?.production_budget_trade !== undefined
  ) {

    const value =
      Number(
        business.production_budget_trade
      );

    if (
      Number.isFinite(value) &&
      value > 0
    ) {
      budget = value;
    }
  }


  const theatricalVerdict =
    business?.theatrical_verdict
      ? String(
          business.theatrical_verdict
        )
      : null;


  /* ----------------------------------------------------------
     RETURN
  ---------------------------------------------------------- */

  return {

    id: Number(movie.id),

    title: movie.title,

    releaseYear:
      movie.release_year !== null
        ? Number(movie.release_year)
        : null,

    language,
    industry,
    leadActor,

    india,

    overseas:
      overseasGross !== null &&
      Number.isFinite(overseasGross)
        ? overseasGross
        : null,

    worldwide,

    kerala,
    tamilNadu,
    karnataka,
    teluguStates,

    highestState,

    openingDayIndia,

    budget,

    theatricalVerdict,
  };
}


/* ============================================================
   MOVIE HEADER
============================================================ */

function MovieHeader({
  movie,
  entity,
  side,
}: {
  movie: MovieData;
  entity: Entity;
  side: "A" | "B";
}) {
  return (
    <div className="flex items-center gap-4">

      {entity.image ? (

        <img
          src={entity.image}
          alt=""
          className="h-24 w-16 shrink-0 rounded-lg border border-zinc-800 object-cover"
        />

      ) : (

        <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-black">

          <span className="text-[8px] tracking-[0.15em] text-zinc-600">
            JMI
          </span>

        </div>

      )}

      <div className="min-w-0">

        <p className="text-[7px] font-medium uppercase tracking-[0.22em] text-violet-400/60">
          Movie {side}
        </p>

        <h3 className="mt-1 text-[13px] font-semibold text-zinc-100">
          {movie.title}
        </h3>

        <p className="mt-1 text-[8px] text-zinc-600">
          {movie.releaseYear ?? "Year unavailable"}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   SECTION
============================================================ */

function ComparisonSection({
  eyebrow,
  title,
  firstMovieName,
  secondMovieName,
  children,
}: {
  eyebrow: string;
  title: string;
  firstMovieName: string;
  secondMovieName: string;
  children: ReactNode;
}) {
  return (
    <section>

      <div className="mb-4">

        <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
          {eyebrow}
        </p>

        <h3 className="mt-2 text-base font-semibold text-zinc-200">
          {title}
        </h3>

      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

        {/* MOVIE IDENTIFICATION */}

        <div className="grid grid-cols-[0.9fr_1fr_1fr] items-center gap-2 border-b border-zinc-900 bg-black/60 px-3 py-3 sm:px-5">

          <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Movie
          </p>

          <p className="truncate text-[9px] font-semibold text-violet-300">
            {firstMovieName}
          </p>

          <p className="truncate text-[9px] font-semibold text-violet-300">
            {secondMovieName}
          </p>

        </div>

        {children}

      </div>

    </section>
  );
}


/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  firstValue,
  secondValue,
}: {
  label: string;
  firstValue: string | null;
  secondValue: string | null;
}) {
  return (
    <div className="grid grid-cols-[0.8fr_1fr_1fr] items-center gap-2 border-b border-zinc-900 px-3 py-3 last:border-b-0 sm:px-5">

      <p className="text-[8px] font-medium text-zinc-500">
        {label}
      </p>

      <p className="truncate text-[9px] text-zinc-300">
        {firstValue ?? "Not enough data"}
      </p>

      <p className="truncate text-[9px] text-zinc-300">
        {secondValue ?? "Not enough data"}
      </p>

    </div>
  );
}


/* ============================================================
   METRIC ROW
============================================================ */

function MetricRow({
  label,
  firstValue,
  secondValue,
  format,
  winnerSide,
}: {
  label: string;
  firstValue: number | null;
  secondValue: number | null;
  format: (value: number | null) => string;
  winnerSide: WinnerSide;
}) {
  return (
    <div className="grid grid-cols-[0.9fr_1fr_1fr] items-center gap-2 border-b border-zinc-900 px-3 py-3 last:border-b-0 sm:px-5">

      <p className="text-[8px] font-medium text-zinc-500">
        {label}
      </p>

      <MetricValue
        value={firstValue}
        format={format}
        highlighted={winnerSide === "A"}
      />

      <MetricValue
        value={secondValue}
        format={format}
        highlighted={winnerSide === "B"}
      />

    </div>
  );
}


function MetricValue({
  value,
  format,
  highlighted,
}: {
  value: number | null;
  format: (value: number | null) => string;
  highlighted: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">

      {highlighted && (
        <span className="shrink-0 text-[7px] text-yellow-400">
          ★
        </span>
      )}

      <p
        className={
          highlighted
            ? "truncate text-[9px] font-semibold text-violet-300"
            : "truncate text-[9px] text-zinc-300"
        }
      >
        {format(value)}
      </p>

    </div>
  );
}


/* ============================================================
   TEXT COMPARISON ROW
============================================================ */

function TextComparisonRow({
  label,
  firstValue,
  secondValue,
}: {
  label: string;
  firstValue: string | null;
  secondValue: string | null;
}) {
  return (
    <div className="grid grid-cols-[0.9fr_1fr_1fr] items-center gap-2 border-b border-zinc-900 px-3 py-3 last:border-b-0 sm:px-5">

      <p className="text-[8px] font-medium text-zinc-500">
        {label}
      </p>

      <p className="truncate text-[9px] text-zinc-300">
        {firstValue ?? "Not enough data"}
      </p>

      <p className="truncate text-[9px] text-zinc-300">
        {secondValue ?? "Not enough data"}
      </p>

    </div>
  );
}


/* ============================================================
   STATE CARD
============================================================ */

function StateCard({
  label,
  value,
  gross,
}: {
  label: string;
  value: string | null;
  gross: number | null;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black p-4">

      <p className="text-[7px] uppercase tracking-[0.18em] text-violet-400/60">
        {label}
      </p>

      <p className="mt-2 text-[11px] font-semibold text-zinc-200">
        {value ?? "Not enough data"}
      </p>

      <p className="mt-1 text-[8px] text-zinc-500">
        {formatCrores(gross)}
      </p>

    </div>
  );
}


/* ============================================================
   VISUAL COMPARISON ROW
============================================================ */

function VisualComparisonRow({
  label,
  firstName,
  secondName,
  firstValue,
  secondValue,
  winnerSide,
}: {
  label: string;
  firstName: string;
  secondName: string;
  firstValue: number | null;
  secondValue: number | null;
  winnerSide: WinnerSide;
}) {
  const max =
    Math.max(
      firstValue ?? 0,
      secondValue ?? 0
    );

  const firstWidth =
    firstValue !== null &&
    firstValue > 0 &&
    max > 0
      ? (firstValue / max) * 100
      : 0;

  const secondWidth =
    secondValue !== null &&
    secondValue > 0 &&
    max > 0
      ? (secondValue / max) * 100
      : 0;

  return (
    <div className="border-b border-zinc-900 px-4 py-4 last:border-b-0 sm:px-5">

      <div className="mb-3 flex items-center justify-between gap-3">

        <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-500">
          {label}
        </p>

        <span className="text-[7px] uppercase tracking-[0.12em] text-zinc-700">
          {winnerSide === "A"
            ? `${firstName} leads`
            : winnerSide === "B"
              ? `${secondName} leads`
              : winnerSide === "Tie"
                ? "Tie"
                : "Insufficient data"}
        </span>

      </div>


      {/* MOVIE A */}

      <div className="mb-3">

        <div className="mb-1.5 flex items-center justify-between gap-2">

          <span
            className={
              winnerSide === "A"
                ? "max-w-[55%] truncate text-[8px] font-semibold text-violet-300"
                : "max-w-[55%] truncate text-[8px] text-zinc-500"
            }
          >
            {firstName}
          </span>

          <span className="text-[8px] text-zinc-400">
            {formatCrores(firstValue)}
          </span>

        </div>


        <div className="h-2 overflow-hidden rounded-full bg-zinc-900">

          <div
            className={
              winnerSide === "A"
                ? "h-full rounded-full bg-violet-400"
                : "h-full rounded-full bg-zinc-600"
            }
            style={{
              width: `${firstWidth}%,`
            }}
          />

        </div>

      </div>


      {/* MOVIE B */}

      <div>

        <div className="mb-1.5 flex items-center justify-between gap-2">

          <span
            className={
              winnerSide === "B"
                ? "max-w-[55%] truncate text-[8px] font-semibold text-violet-300"
                : "max-w-[55%] truncate text-[8px] text-zinc-500"
            }
          >
            {secondName}
          </span>

          <span className="text-[8px] text-zinc-400">
            {formatCrores(secondValue)}
          </span>

        </div>


        <div className="h-2 overflow-hidden rounded-full bg-zinc-900">

          <div
            className={
              winnerSide === "B"
                ? "h-full rounded-full bg-violet-400"
                : "h-full rounded-full bg-zinc-600"
            }
            style={{
              width: `${secondWidth}%,`
            }}
          />

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   TROPHY CARD
============================================================ */

function TrophyCard({
  category,
  side,
  firstName,
  secondName,
}: {
  category: string;
  side: WinnerSide;
  firstName: string;
  secondName: string;
}) {
  const champion =
    winnerName(
      side,
      firstName,
      secondName
    );

  return (
    <div
      className={
        side === "NA"
          ? "rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          : "rounded-xl border border-yellow-400/10 bg-zinc-950 p-4"
      }
    >

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-[7px] uppercase tracking-[0.18em] text-zinc-600">
            Category
          </p>

          <p className="mt-1.5 text-[9px] font-medium text-zinc-300">
            {category}
          </p>

        </div>

        <span className="text-base">
          {side === "NA"
            ? "—"
            : side === "Tie"
              ? "≡"
              : "🏆"}
        </span>

      </div>


      <p
        className={
          side === "NA"
            ? "mt-4 text-[9px] text-zinc-600"
            : "mt-4 truncate text-[10px] font-semibold text-yellow-400/90"
        }
      >
        {champion}
      </p>


      <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-zinc-700">
        {side === "Tie"
          ? "Category tie"
          : side === "NA"
            ? "Not enough data"
            : "JMI category champion"}
      </p>

    </div>
  );
}


/* ============================================================
   CHAMPIONSHIP SCORE
============================================================ */

function ChampionshipScore({
  label,
  score,
  winner,
}: {
  label: string;
  score: number | null;
  winner: boolean;
}) {
  return (
    <div
      className={
        winner
          ? "rounded-xl border border-yellow-400/20 bg-yellow-400/[0.04] p-4"
          : "rounded-xl border border-zinc-800 bg-black p-4"
      }
    >

      <p
        className={
          winner
            ? "truncate text-[8px] font-semibold text-yellow-400/90"
            : "truncate text-[8px] text-zinc-500"
        }
      >
        {label}
      </p>

      <p
        className={
          winner
            ? "mt-2 text-lg font-semibold text-yellow-400"
            : "mt-2 text-lg font-semibold text-zinc-300"
        }
      >
        {score !== null
          ? `${score.toFixed(1)}%`
          : "—"}
      </p>

    </div>
  );
}