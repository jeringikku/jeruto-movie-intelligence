"use client";

import { useCallback, useState } from "react";
import JmiComparisonSelector from "./JmiComparisonSelector";
import JmiMovieComparisonReport from "./JmiMovieComparisonReport";
import JmiPersonComparisonReport from "./JmiPersonComparisonReport";
import JmiCompanyComparisonReport from "./JmiCompanyComparisonReport";
import JmiIndustryComparisonReport from "./JmiIndustryComparisonReport";

type EntityType =
  | "movies"
  | "people"
  | "companies"
  | "industries";

type Entity = {
  id: number;
  title: string;
  subtitle?: string;
  image?: string | null;
};

export default function JmiComparisonWorkspace() {
  const [first, setFirst] = useState<Entity | null>(null);
  const [second, setSecond] = useState<Entity | null>(null);

  const [entityType, setEntityType] =
    useState<EntityType>("movies");

  const [comparisonStarted, setComparisonStarted] =
    useState(false);

  const handleSelectionChange = useCallback(
    (
      firstEntity: Entity | null,
      secondEntity: Entity | null,
      type: EntityType
    ) => {
      setFirst(firstEntity);
      setSecond(secondEntity);
      setEntityType(type);

      /*
       * If the user changes either entity,
       * hide the previous report until Compare
       * is pressed again.
       */
      setComparisonStarted(false);
    },
    []
  );

  const handleCompare = useCallback(() => {
    if (!first || !second) {
      return;
    }

    if (first.id === second.id) {
      return;
    }

    setComparisonStarted(true);

    /*
     * Give React a moment to render the report,
     * then bring the user to it.
     */
    setTimeout(() => {
      document
        .getElementById("jmi-comparison-report")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }, [first, second]);

  return (
    <div className="space-y-10">

      {/* =====================================================
          SELECTOR
      ===================================================== */}

      <JmiComparisonSelector
        onSelectionChange={handleSelectionChange}
        onCompare={handleCompare}
      />


      {/* =====================================================
          RESULT
      ===================================================== */}

     {comparisonStarted && first && second && (
  entityType === "movies" ? (
    <JmiMovieComparisonReport
      first={first}
      second={second}
    />
  ) : entityType === "people" ? (
    <JmiPersonComparisonReport
      first={first}
      second={second}
    />
  ) : entityType === "companies" ? (
    <JmiCompanyComparisonReport
      first={first}
      second={second}
    />
  ) : entityType === "industries" ? (
    <JmiIndustryComparisonReport
      first={first}
      second={second}
    />
  ) : (
    <ComparisonReport
      first={first}
      second={second}
      entityType={entityType}
    />
  )
)}

    </div>
  );
}


/* ============================================================
   COMPARISON REPORT
============================================================ */

function ComparisonReport({
  first,
  second,
  entityType,
}: {
  first: Entity;
  second: Entity;
  entityType: EntityType;
}) {
  return (
    <section
      id="jmi-comparison-report"
      className="scroll-mt-24"
    >

      {/* =====================================================
          REPORT HEADER
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-violet-400/20 bg-zinc-950">

        {/* Report identity */}

        <div className="border-b border-zinc-900 px-5 py-4 sm:px-6">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                JMI Comparison Report
              </p>

              <p className="mt-1 text-[9px] text-zinc-600">
                {getEntityLabel(entityType)}
              </p>

            </div>


            <div className="flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

              <span className="text-[7px] uppercase tracking-[0.18em] text-zinc-600">
                Generated
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            ENTITY VS ENTITY
        ================================================= */}

        <div className="grid items-center gap-6 px-5 py-8 sm:px-8 md:grid-cols-[1fr_auto_1fr]">

          {/* FIRST ENTITY */}

          <ReportEntity
            entity={first}
            side="A"
          />


          {/* VS */}

          <div className="mx-auto">

            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/[0.06] shadow-[0_0_30px_rgba(139,92,246,0.08)]">

              <span className="text-[9px] font-semibold tracking-[0.16em] text-violet-300">
                VS
              </span>

            </div>

          </div>


          {/* SECOND ENTITY */}

          <ReportEntity
            entity={second}
            side="B"
          />

        </div>

      </div>


      {/* =====================================================
          JMI SCORECARD
      ===================================================== */}

      <section>

        <div className="mb-5">

          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
            JMI Scorecard
          </p>

          <h3 className="mt-2 text-base font-semibold tracking-[-0.02em] text-zinc-200">
            Comparison intelligence at a glance.
          </h3>

          <p className="mt-1.5 text-[9px] leading-5 text-zinc-600">
            The final scoring system will be based only on
            comparable JMI data available for both entities.
          </p>

        </div>


        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">

          <ScoreCard
            label="Profile"
            firstValue="Available"
            secondValue="Available"
            status="Ready"
          />

          <ScoreCard
            label="Performance"
            firstValue="Pending"
            secondValue="Pending"
            status="Next"
          />

          <ScoreCard
            label="Markets"
            firstValue="Pending"
            secondValue="Pending"
            status="Next"
          />

          <ScoreCard
            label="Business"
            firstValue="Pending"
            secondValue="Pending"
            status="Next"
          />

        </div>

      </section>


      {/* =====================================================
          CATEGORY INTELLIGENCE
      ===================================================== */}

      <section>

        <div className="mb-5">

          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
            Intelligence Matrix
          </p>

          <h3 className="mt-2 text-base font-semibold text-zinc-200">
            Multiple dimensions. One report.
          </h3>

        </div>


        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">

          <ComparisonRow
            label="Profile"
            firstValue={first.title}
            secondValue={second.title}
            result="Comparable"
          />

          <ComparisonRow
            label="Performance"
            firstValue="—"
            secondValue="—"
            result="Awaiting data"
          />

          <ComparisonRow
            label="India Markets"
            firstValue="—"
            secondValue="—"
            result="Awaiting data"
          />

          <ComparisonRow
            label="Overseas"
            firstValue="—"
            secondValue="—"
            result="Awaiting data"
          />

          <ComparisonRow
            label="Business"
            firstValue="—"
            secondValue="—"
            result="Awaiting data"
          />

          <ComparisonRow
            label="Records"
            firstValue="—"
            secondValue="—"
            result="Awaiting data"
          />

        </div>

      </section>


      {/* =====================================================
          CHAMPIONSHIP AREA
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

        <div className="px-5 py-7 text-center sm:px-8">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-yellow-400/20 bg-yellow-400/[0.04]">

            <span className="text-lg">
              🏆
            </span>

          </div>

          <p className="mt-4 text-[8px] font-semibold uppercase tracking-[0.28em] text-yellow-400/80">
            JMI Championship
          </p>

          <h3 className="mt-2 text-lg font-semibold text-zinc-200">
            Winner will be determined from the data.
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-[9px] leading-5 text-zinc-600">
            JMI will not declare a winner when the available
            information is insufficient for a meaningful comparison.
            Category winners will be awarded only where the data
            supports the result.
          </p>

        </div>

      </section>


      {/* =====================================================
          METHODOLOGY
      ===================================================== */}

      <section className="rounded-xl border border-zinc-900 bg-black px-5 py-5">

        <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
          JMI Methodology
        </p>

        <p className="mt-2 text-[9px] leading-5 text-zinc-700">
          JMI Compare uses structured information available in
          the JMI intelligence database. Missing information is
          kept unavailable rather than converted into zero.
          Comparisons are generated only where the underlying
          data supports a meaningful comparison.
        </p>

      </section>

    </section>
  );
}


/* ============================================================
   REPORT ENTITY
============================================================ */

function ReportEntity({
  entity,
  side,
}: {
  entity: Entity;
  side: "A" | "B";
}) {
  return (
    <div className="flex items-center gap-4 md:justify-center">

      {/* Poster / profile image */}

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
          Entity {side}
        </p>

        <p className="mt-1 text-[13px] font-semibold text-zinc-100">
          {entity.title}
        </p>

        {entity.subtitle && (

          <p className="mt-1 text-[8px] text-zinc-600">
            {entity.subtitle}
          </p>

        )}

      </div>

    </div>
  );
}


/* ============================================================
   SCORE CARD
============================================================ */

function ScoreCard({
  label,
  firstValue,
  secondValue,
  status,
}: {
  label: string;
  firstValue: string;
  secondValue: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

      <div className="flex items-center justify-between">

        <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </p>

        <span className="text-[7px] uppercase tracking-[0.12em] text-zinc-700">
          {status}
        </span>

      </div>


      <div className="mt-4 grid grid-cols-2 gap-2">

        <div className="rounded-md bg-black px-2 py-2">

          <p className="text-[7px] text-violet-400/60">
            A
          </p>

          <p className="mt-1 truncate text-[9px] font-medium text-zinc-300">
            {firstValue}
          </p>

        </div>


        <div className="rounded-md bg-black px-2 py-2">

          <p className="text-[7px] text-violet-400/60">
            B
          </p>

          <p className="mt-1 truncate text-[9px] font-medium text-zinc-300">
            {secondValue}
          </p>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   COMPARISON ROW
============================================================ */

function ComparisonRow({
  label,
  firstValue,
  secondValue,
  result,
}: {
  label: string;
  firstValue: string;
  secondValue: string;
  result: string;
}) {
  return (
    <div className="grid grid-cols-[0.8fr_1fr_1fr_0.8fr] items-center gap-2 border-b border-zinc-900 px-3 py-3 last:border-b-0 sm:px-5">

      <p className="text-[8px] font-medium text-zinc-500">
        {label}
      </p>

      <p className="truncate text-[9px] text-zinc-300">
        {firstValue}
      </p>

      <p className="truncate text-[9px] text-zinc-300">
        {secondValue}
      </p>

      <p className="text-right text-[7px] uppercase tracking-[0.1em] text-zinc-700">
        {result}
      </p>

    </div>
  );
}


/* ============================================================
   ENTITY LABEL
============================================================ */

function getEntityLabel(type: EntityType) {
  switch (type) {

    case "movies":
      return "Movie vs movie intelligence";

    case "people":
      return "Person vs person intelligence";

    case "companies":
      return "Company vs company intelligence";

    case "industries":
      return "Industry vs industry intelligence";

    default:
      return "Entity comparison intelligence";
  }
}