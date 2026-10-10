"use client";

import { useState } from "react";


export type RankingCriterion =
  | "grossing"
  | "hits"
  | "ratio";

export type RankingScope =
  | "india"
  | "industry";

export type TechnicianStats = {
  id: number;
  name: string;
  slug: string | null;
  eligibleMovies: number;
  successfulMovies: number;
  hitMovies: number;
  superHitMovies: number;
  blockbusterMovies: number;
  indiaGross: number;
  overseasGross: number;
  worldwideGross: number;
  successRatio: number;
};

export type DirectorStats = TechnicianStats;

export type Industry = {
  id: number;
  name: string;
};

export type IndustryRankingData = Record<
  RankingCriterion,
  TechnicianStats[]
>;

export type RankingPeriod = {
  id: string;
  label: string;
  startYear: number | null;
  endYear: number | null;
};

export type PeriodRankingData = Record<
  RankingCriterion,
  TechnicianStats[]
>;

export type PeriodRankings = Record<
  string,
  PeriodRankingData
>;

export type IndustryPeriodRankings = Record<
  number,
  PeriodRankings
>;

export type TechnicianRole =
  | "Director"
  | "Writer"
  | "Cinematographer"
  | "Music Director"
  | "Editor";

const CRITERIA: {
  id: RankingCriterion;
  number: string;
  label: string;
  description: string;
}[] = [
  {
    id: "grossing",
    number: "01",
    label: "Highest Grossing",
    description:
      "Technicians ranked by the recorded worldwide gross of their films.",
  },
  {
    id: "hits",
    number: "02",
    label: "Most Hits",
    description:
      "Technicians ranked by the number of successful theatrical films.",
  },
  {
    id: "ratio",
    number: "03",
    label: "Success Ratio",
    description:
      "Technicians ranked by the percentage of eligible films that achieved theatrical success.",
  },
];

function formatCrores(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "₹0.00 Cr";
  }

  return `₹${(value / 10000000).toFixed(2)} Cr`;
}

function pluralizeRole(role: string): string {
  const normalized = role.trim().toLowerCase();

  switch (normalized) {
    case "director":
      return "directors";

    case "writer":
      return "writers";

    case "cinematographer":
      return "cinematographers";

    case "music director":
      return "music directors";

    case "editor":
      return "editors";

    default:
      return `${role.toLowerCase()}s`;
  }
}

/* =====================================================
   REUSABLE PERIOD SELECTOR
   ===================================================== */

function PeriodSelector({
  periods,
  value,
  onChange,
  label,
  id,
}: {
  periods: RankingPeriod[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
      <label
        htmlFor={id}
        className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-md border border-white/[0.1] bg-[#101112] px-3 py-3 text-[10px] text-zinc-200 outline-none transition focus:border-yellow-400/50 sm:max-w-sm"
      >
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =====================================================
   REUSABLE RANKING SECTION
   ===================================================== */

function RankingSection({
  title,
  eyebrow,
  subtitle,
  criterion,
  onCriterionChange,
  rows,
  scopeLabel,
  emptyMessage,
  emptyDescription,
  technicianLabel,
  periods,
  selectedPeriodId,
  onPeriodChange,
}: {
  title: string;
  eyebrow: string;
  subtitle: string;
  criterion: RankingCriterion;
  onCriterionChange: (value: RankingCriterion) => void;
  rows: TechnicianStats[];
  scopeLabel: string;
  emptyMessage: string;
  emptyDescription: string;
  technicianLabel: TechnicianRole;
  periods?: RankingPeriod[];
  selectedPeriodId?: string;
  onPeriodChange?: (value: string) => void;
}) {
  const activeCriterion = CRITERIA.find(
    (item) => item.id === criterion
  )!;

  const pluralRole = pluralizeRole(technicianLabel);

  return (
    <section className="mt-10">
      {/* SECTION HEADING */}

      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-2xl">
          {title}
        </h2>

        <p className="mt-2 text-[9px] leading-5 text-zinc-500">
          {subtitle}
        </p>
      </div>

      {/* INDEPENDENT PERIOD SELECTOR */}

      {periods &&
        selectedPeriodId !== undefined &&
        onPeriodChange && (
          <div className="mt-5">
            <PeriodSelector
              periods={periods}
              value={selectedPeriodId}
              onChange={onPeriodChange}
              label="Select Ranking Period"
              id={`period-${scopeLabel
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`}
            />
          </div>
        )}

      {/* INDEPENDENT CRITERIA SELECTOR */}

      <div
        className="mt-5 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3"
        role="tablist"
        aria-label={`${title} ranking criteria`}
      >
        {CRITERIA.map((item) => {
          const active = criterion === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCriterionChange(item.id)}
              className={`min-w-[145px] shrink-0 snap-start rounded-lg border px-4 py-3 text-left transition sm:min-w-[175px] ${
                active
                  ? "border-yellow-400/50 bg-yellow-400/[0.08]"
                  : "border-white/[0.08] bg-zinc-950 hover:border-white/20"
              }`}
            >
              <span
                className={`text-[7px] tracking-[0.16em] ${
                  active
                    ? "text-yellow-400"
                    : "text-zinc-400"
                }`}
              >
                {item.number} / RANKING
              </span>

              <span
                className={`mt-2 block text-[10px] font-medium sm:text-[11px] ${
                  active
                    ? "text-yellow-400"
                    : "text-zinc-400"
                }`}
              >
                {item.label}
              </span>

              <span className="mt-1 block text-[8px] text-zinc-600">
                {active ? "Selected" : "View ranking"}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE CRITERION */}

      <div className="mt-4 border-b border-white/[0.08] pb-4">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-yellow-400">
          {activeCriterion.number} · {activeCriterion.label}
        </p>

        <h3 className="mt-2 text-base font-medium text-zinc-100 sm:text-lg">
          {criterion === "grossing"
            ? `The ${pluralRole} behind the biggest box-office performances.`
            : criterion === "hits"
              ? `The ${pluralRole} associated with the most successful theatrical films.`
              : `The ${pluralRole} with the strongest success ratios.`}
        </h3>

        <p className="mt-2 text-[9px] leading-5 text-zinc-500">
          {activeCriterion.description}
        </p>
      </div>

      {/* LEADERBOARD */}

      <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950">
        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-500">
              {emptyMessage}
            </p>

            <p className="mt-2 text-[8px] text-zinc-700">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-white/[0.08] bg-black/30 px-4 py-3 sm:px-5">
              <span className="w-6 shrink-0 text-[7px] uppercase tracking-[0.12em] text-pink-500">
                #
              </span>

              <span className="min-w-0 flex-1 text-[7px] uppercase tracking-[0.12em] text-pink-500">
                {technicianLabel}
              </span>

              <span className="w-[110px] shrink-0 text-right text-[7px] uppercase tracking-[0.12em] text-pink-500 sm:w-[180px]">
                {criterion === "grossing"
                  ? "Worldwide Gross"
                  : criterion === "hits"
                    ? "Successful Films"
                    : "Success Ratio"}
              </span>
            </div>

            {rows.map((technician, index) => (
              <div
                key={technician.id}
                className="group flex items-center gap-3 border-b border-white/[0.055] px-4 py-3.5 last:border-b-0 hover:bg-white/[0.015] sm:px-5"
              >
                <div
                  className={`w-6 shrink-0 text-[9px] font-medium ${
                    index < 3
                      ? "text-yellow-400"
                      : "text-pink-400"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium text-zinc-200 transition-colors group-hover:text-yellow-400 sm:text-xs">
                    {technician.name}
                  </p>

                  <p className="mt-1 text-[7px] text-zinc-500">
                    {technician.eligibleMovies} eligible films
                  </p>

                  {criterion === "grossing" && (
                    <p className="mt-1 text-[7px] text-zinc-500">
                      India {formatCrores(technician.indiaGross)}
                      {" · "}Overseas{" "}
                      {formatCrores(technician.overseasGross)}
                    </p>
                  )}

                  {criterion === "hits" && (
                    <p className="mt-1 text-[7px] text-zinc-500">
                      Hit {technician.hitMovies}
                      {" · "}Super Hit {technician.superHitMovies}
                      {" · "}Blockbuster{" "}
                      {technician.blockbusterMovies}
                    </p>
                  )}

                  {criterion === "ratio" && (
                    <p className="mt-1 text-[7px] text-zinc-500">
                      {technician.successfulMovies} successful films
                    </p>
                  )}
                </div>

                <div className="w-[110px] shrink-0 text-right sm:w-[180px]">
                  {criterion === "grossing" && (
                    <p className="text-[9px] font-medium text-green-400 sm:text-[11px]">
                      {formatCrores(technician.worldwideGross)}
                    </p>
                  )}

                  {criterion === "hits" && (
                    <p className="text-sm font-medium text-green-400 sm:text-base">
                      {technician.successfulMovies}
                    </p>
                  )}

                  {criterion === "ratio" && (
                    <>
                      <p className="text-sm font-medium text-green-400 sm:text-base">
                        {technician.successRatio.toFixed(1)}%
                      </p>

                      <div className="ml-auto mt-2 h-1 w-full max-w-[100px] overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-violet-400"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                technician.successRatio
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <p className="mt-3 text-[8px] leading-4 text-zinc-600">
        {scopeLabel} · {activeCriterion.label}
      </p>
    </section>
  );
}

/* =====================================================
   SHARED TECHNICIAN RANKINGS COMPONENT
   ===================================================== */

export default function TechnicianRankings({
  initialRankings,
  industries,
  allIndustryRankings,
  technicianLabel = "Director",
  periods,
  allPeriodRankings,
  allIndustryPeriodRankings,
}: {
  initialRankings: Record<
    RankingCriterion,
    TechnicianStats[]
  >;
  industries: Industry[];
  allIndustryRankings: Record<
    number,
    IndustryRankingData
  >;
  technicianLabel?: TechnicianRole;
  periods?: RankingPeriod[];
  allPeriodRankings?: PeriodRankings;
  allIndustryPeriodRankings?: IndustryPeriodRankings;
}) {
  /* ALL-INDIA STATE */

  const [indiaCriterion, setIndiaCriterion] =
    useState<RankingCriterion>("grossing");

  const [indiaPeriodId, setIndiaPeriodId] =
    useState("overall");

  /* INDUSTRY STATE */

  const [industryCriterion, setIndustryCriterion] =
    useState<RankingCriterion>("grossing");

  const [industryPeriodId, setIndustryPeriodId] =
    useState("overall");

  const [industryId, setIndustryId] =
    useState<number | null>(
      industries[0]?.id ?? null
    );

  const activeIndustry = industries.find(
    (industry) => industry.id === industryId
  );

  /*
   * Use period-specific rankings when supplied.
   * Older technician pages continue using their original
   * rankings until their data calculations are migrated.
   */

  const hasPeriodRankings =
    Boolean(periods?.length) &&
    Boolean(allPeriodRankings);

  const availablePeriods =
    hasPeriodRankings && periods
      ? periods
      : undefined;

  const indiaRows =
    hasPeriodRankings && allPeriodRankings
      ? allPeriodRankings[indiaPeriodId]?.[
          indiaCriterion
        ] ?? []
      : initialRankings[indiaCriterion] ?? [];

  const industryPeriodData =
    industryId !== null
      ? allIndustryPeriodRankings?.[industryId]
      : undefined;

  const hasIndustryPeriodRankings =
    hasPeriodRankings &&
    Boolean(industryPeriodData);

  const industryRows =
    industryId !== null
      ? hasIndustryPeriodRankings &&
        industryPeriodData
        ? industryPeriodData[industryPeriodId]?.[
            industryCriterion
          ] ?? []
        : allIndustryRankings[industryId]?.[
            industryCriterion
          ] ?? []
      : [];

  const pluralRole = pluralizeRole(technicianLabel);

  return (
    <div>
      {/* =================================================
          SECTION 1 — ALL-INDIA TOP 25
          ================================================= */}

      <RankingSection
        title={`Explore India's finest ${pluralRole}.`}
        eyebrow="All-India Rankings · Top 25"
        subtitle={`Discover India's leading ${pluralRole} through their box-office performance, theatrical successes and career consistency.`}
        criterion={indiaCriterion}
        onCriterionChange={setIndiaCriterion}
        rows={indiaRows}
        scopeLabel={`All India · ${
          periods?.find(
            (period) => period.id === indiaPeriodId
          )?.label ?? "Overall Career"
        } · Top 25`}
        emptyMessage={`No eligible ${pluralRole} data available`}
        emptyDescription="Rankings will appear when matching records are available in JMI."
        technicianLabel={technicianLabel}
        periods={availablePeriods}
        selectedPeriodId={
          hasPeriodRankings
            ? indiaPeriodId
            : undefined
        }
        onPeriodChange={
          hasPeriodRankings
            ? setIndiaPeriodId
            : undefined
        }
      />

      {/* =================================================
          SECTION 2 — INDUSTRY-WISE TOP 10
          ================================================= */}

      <section className="mt-14 border-t border-white/[0.09] pt-8 sm:mt-16 sm:pt-10">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
            Industry-wise Rankings · Top 10
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-2xl">
            Every industry. Its own leaders.
          </h2>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            Explore the leading {pluralRole} within an individual
            Indian film industry. Rankings are calculated using
            films associated with the selected industry.
          </p>
        </div>

        {/* INDUSTRY SELECTOR */}

        <div className="mt-5 rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
          <label
            htmlFor={`technician-industry-${technicianLabel.toLowerCase().replace(/\s+/g, "-")}`}
            className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
          >
            Select Film Industry
          </label>

          <select
            id={`technician-industry-${technicianLabel.toLowerCase().replace(/\s+/g, "-")}`}
            value={industryId ?? ""}
            onChange={(event) => {
              setIndustryId(
                event.target.value
                  ? Number(event.target.value)
                  : null
              );
            }}
            className="mt-3 w-full rounded-md border border-white/[0.1] bg-[#101112] px-3 py-3 text-[10px] text-zinc-200 outline-none transition focus:border-yellow-400/50 sm:max-w-sm"
          >
            <option value="">Choose an industry</option>

            {industries.map((industry) => (
              <option
                key={industry.id}
                value={industry.id}
              >
                {industry.name}
              </option>
            ))}
          </select>

          {activeIndustry && (
            <p className="mt-3 text-[8px] text-zinc-500">
              Showing rankings for{" "}
              <span className="font-medium text-yellow-400">
                {activeIndustry.name}
              </span>
            </p>
          )}
        </div>

        {/* INDEPENDENT INDUSTRY PERIOD SELECTOR */}

        {hasPeriodRankings && (
          <div className="mt-4">
            <PeriodSelector
              periods={periods!}
              value={industryPeriodId}
              onChange={setIndustryPeriodId}
              label="Select Industry Ranking Period"
              id={`industry-period-${technicianLabel
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            />
          </div>
        )}

        {/* INDUSTRY LEADERBOARD */}

        {industryId === null ? (
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-zinc-950 px-5 py-12 text-center">
            <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-500">
              Select an industry
            </p>

            <p className="mt-2 text-[8px] text-zinc-700">
              Choose an industry above to explore its Top 10 {pluralRole}.
            </p>
          </div>
        ) : (
          <RankingSection
            title={
              activeIndustry
                ? `${activeIndustry.name} ${pluralRole.charAt(0).toUpperCase()}${pluralRole.slice(1)}`
                : `Industry ${pluralRole}`
            }
            eyebrow="Selected Industry · Top 10"
            subtitle={`Compare ${pluralRole} within the selected industry using the same JMI ranking criteria.`}
            criterion={industryCriterion}
            onCriterionChange={setIndustryCriterion}
            rows={industryRows}
            scopeLabel={`Industry · ${
              activeIndustry?.name ?? "Selected industry"
            } · ${
              periods?.find(
                (period) => period.id === industryPeriodId
              )?.label ?? "Overall Career"
            } · Top 10`}
            emptyMessage={`No eligible ${pluralRole} data available`}
            emptyDescription={`Rankings will appear when matching ${pluralRole} credits and theatrical verdicts are available for this industry.`}
            technicianLabel={technicianLabel}
          />
        )}
      </section>
    </div>
  );
}