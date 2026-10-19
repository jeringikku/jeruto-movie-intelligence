"use client";

import { useState } from "react";

export type RankingCriterion = "grossing" | "hits" | "ratio";

export type ActorStats = {
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

export type Industry = {
  id: number;
  name: string;
};

export type IndustryRankingData = Record<
  RankingCriterion,
  ActorStats[]
>;

export type RankingPeriod = {
  id: string;
  label: string;
  startYear: number | null;
  endYear: number | null;
};

export type PeriodRankingData = Record<
  RankingCriterion,
  ActorStats[]
>;

export type PeriodRankings = Record<
  string,
  PeriodRankingData
>;

export type IndustryPeriodRankings = Record<
  number,
  PeriodRankings
>;

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
      "Actors ranked by the recorded worldwide gross of their lead-role films.",
  },
  {
    id: "hits",
    number: "02",
    label: "Most Hits",
    description:
      "Actors ranked by the number of successful theatrical films in which they played a lead role.",
  },
  {
    id: "ratio",
    number: "03",
    label: "Success Ratio",
    description:
      "Actors ranked by the percentage of eligible lead-role films that achieved theatrical success.",
  },
];

function formatCrores(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "₹0.00 Cr";
  }

  return `₹${(value / 10000000).toFixed(2)} Cr`;
}

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
        className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-green-500"
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
  periods,
  selectedPeriodId,
  onPeriodChange,
}: {
  title: string;
  eyebrow: string;
  subtitle: string;
  criterion: RankingCriterion;
  onCriterionChange: (value: RankingCriterion) => void;
  rows: ActorStats[];
  scopeLabel: string;
  emptyMessage: string;
  emptyDescription: string;
  periods?: RankingPeriod[];
  selectedPeriodId?: string;
  onPeriodChange?: (value: string) => void;
}) {
  const activeCriterion = CRITERIA.find(
    (item) => item.id === criterion
  )!;

  return (
    <section className="mt-10">
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
                  active ? "text-yellow-400" : "text-zinc-400"
                }`}
              >
                {item.number} / RANKING
              </span>

              <span
                className={`mt-2 block text-[10px] font-medium sm:text-[11px] ${
                  active ? "text-yellow-400" : "text-zinc-400"
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

      <div className="mt-4 border-b border-white/[0.08] pb-4">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-yellow-400">
          {activeCriterion.number} · {activeCriterion.label}
        </p>

        <h3 className="mt-2 text-base font-medium text-zinc-100 sm:text-lg">
          {criterion === "grossing"
            ? "The actors behind the biggest box-office performances."
            : criterion === "hits"
              ? "The actors associated with the most successful theatrical films."
              : "The actors with the strongest theatrical success ratios."}
        </h3>

        <p className="mt-2 text-[9px] leading-5 text-zinc-500">
          {activeCriterion.description}
        </p>
      </div>

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
                Actor
              </span>

              <span className="w-[110px] shrink-0 text-right text-[7px] uppercase tracking-[0.12em] text-pink-500 sm:w-[180px]">
                {criterion === "grossing"
                  ? "Worldwide Gross"
                  : criterion === "hits"
                    ? "Successful Films"
                    : "Success Ratio"}
              </span>
            </div>

            {rows.map((actor, index) => (
              <div
                key={actor.id}
                className="group flex items-center gap-3 border-b border-white/[0.055] px-4 py-3.5 last:border-b-0 hover:bg-white/[0.015] sm:px-5"
              >
                <div
                  className={`w-6 shrink-0 text-[9px] font-medium ${
                    index < 3 ? "text-yellow-400" : "text-pink-400"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium text-zinc-200 transition-colors group-hover:text-yellow-400 sm:text-xs">
                    {actor.name}
                  </p>

                  <p className="mt-1 text-[7px] text-zinc-500">
                    {actor.eligibleMovies} eligible lead-role films
                  </p>

                  {criterion === "grossing" && (
                    <p className="mt-1 text-[7px] text-zinc-500">
                      India {formatCrores(actor.indiaGross)}
                      {" · "}Overseas{" "}
                      {formatCrores(actor.overseasGross)}
                    </p>
                  )}

                  {criterion === "hits" && (
                    <p className="mt-1 text-[7px] text-zinc-500">
                      Hit {actor.hitMovies}
                      {" · "}Super Hit {actor.superHitMovies}
                      {" · "}Blockbuster {actor.blockbusterMovies}
                    </p>
                  )}

                  {criterion === "ratio" && (
                    <p className="mt-1 text-[7px] text-zinc-500">
                      {actor.successfulMovies} successful films
                    </p>
                  )}
                </div>

                <div className="w-[110px] shrink-0 text-right sm:w-[180px]">
                  {criterion === "grossing" && (
                    <p className="text-[9px] font-medium text-green-400 sm:text-[11px]">
                      {formatCrores(actor.worldwideGross)}
                    </p>
                  )}

                  {criterion === "hits" && (
                    <p className="text-sm font-medium text-green-400 sm:text-base">
                      {actor.successfulMovies}
                    </p>
                  )}

                  {criterion === "ratio" && (
                    <>
                      <p className="text-sm font-medium text-green-400 sm:text-base">
                        {actor.successRatio.toFixed(1)}%
                      </p>

                      <div className="ml-auto mt-2 h-1 w-full max-w-[100px] overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-violet-400"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, actor.successRatio)
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

export default function ActorsRankings({
  initialRankings,
  industries,
  allIndustryRankings,
  periods,
  allPeriodRankings,
  allIndustryPeriodRankings,
}: {
  initialRankings: Record<RankingCriterion, ActorStats[]>;
  industries: Industry[];
  allIndustryRankings: Record<number, IndustryRankingData>;
  periods?: RankingPeriod[];
  allPeriodRankings?: PeriodRankings;
  allIndustryPeriodRankings?: IndustryPeriodRankings;
}) {
  const [indiaCriterion, setIndiaCriterion] =
    useState<RankingCriterion>("grossing");

  const [indiaPeriodId, setIndiaPeriodId] =
    useState("overall");

  const [industryCriterion, setIndustryCriterion] =
    useState<RankingCriterion>("grossing");

  const [industryPeriodId, setIndustryPeriodId] =
    useState("overall");

  const [industryId, setIndustryId] =
    useState<number | null>(industries[0]?.id ?? null);

  const activeIndustry = industries.find(
    (industry) => industry.id === industryId
  );

  const hasPeriodRankings =
    Boolean(periods?.length) && Boolean(allPeriodRankings);

  const availablePeriods =
    hasPeriodRankings && periods ? periods : undefined;

  const indiaRows =
    hasPeriodRankings && allPeriodRankings
      ? allPeriodRankings[indiaPeriodId]?.[indiaCriterion] ?? []
      : initialRankings[indiaCriterion] ?? [];

  const industryPeriodData =
    industryId !== null
      ? allIndustryPeriodRankings?.[industryId]
      : undefined;

  const hasIndustryPeriodRankings =
    hasPeriodRankings && Boolean(industryPeriodData);

  const industryRows =
    industryId !== null
      ? hasIndustryPeriodRankings && industryPeriodData
        ? industryPeriodData[industryPeriodId]?.[
            industryCriterion
          ] ?? []
        : allIndustryRankings[industryId]?.[industryCriterion] ?? []
      : [];

  return (
    <div>
      <RankingSection
        title="Explore India's leading actors."
        eyebrow="All-India Rankings · Top 25"
        subtitle="Discover India's leading actors through their lead-role filmographies, box-office performance, theatrical successes and career consistency."
        criterion={indiaCriterion}
        onCriterionChange={setIndiaCriterion}
        rows={indiaRows}
        scopeLabel={`All India · ${
          periods?.find((period) => period.id === indiaPeriodId)
            ?.label ?? "Overall Career"
        } · Top 25`}
        emptyMessage="No eligible actors data available"
        emptyDescription="Rankings will appear when matching lead-role credits and theatrical verdicts are available in JMI."
        periods={availablePeriods}
        selectedPeriodId={
          hasPeriodRankings ? indiaPeriodId : undefined
        }
        onPeriodChange={
          hasPeriodRankings ? setIndiaPeriodId : undefined
        }
      />

      <section className="mt-14 border-t border-white/[0.09] pt-8 sm:mt-16 sm:pt-10">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
            Industry-wise Rankings · Top 10
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-[-0.035em] text-zinc-100 sm:text-2xl">
            Every industry. Its own leading actors.
          </h2>

          <p className="mt-2 text-[9px] leading-5 text-zinc-400">
            Explore actors within individual Indian film industries
            using their eligible lead-role films.
          </p>
        </div>

        <div className="mt-5 rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
          <label
            htmlFor="actors-industry"
            className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-green-500"
          >
            Select Film Industry
          </label>

          <select
            id="actors-industry"
            value={industryId ?? ""}
            onChange={(event) => {
              setIndustryId(
                event.target.value ? Number(event.target.value) : null
              );
            }}
            className="mt-3 w-full rounded-md border border-white/[0.1] bg-[#101112] px-3 py-3 text-[10px] text-zinc-200 outline-none transition focus:border-yellow-400/50 sm:max-w-sm"
          >
            <option value="">Choose an industry</option>

            {industries.map((industry) => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>

          {activeIndustry && (
            <p className="mt-3 text-[8px] text-zinc-400">
              Showing rankings for{" "}
              <span className="font-medium text-yellow-400">
                {activeIndustry.name}
              </span>
            </p>
          )}
        </div>

        {hasPeriodRankings && (
          <div className="mt-4">
            <PeriodSelector
              periods={periods!}
              value={industryPeriodId}
              onChange={setIndustryPeriodId}
              label="Select Industry Ranking Period"
              id="actors-industry-period"
            />
          </div>
        )}

        {industryId === null ? (
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-zinc-950 px-5 py-12 text-center">
            <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-500">
              Select an industry
            </p>

            <p className="mt-2 text-[8px] text-zinc-700">
              Choose an industry above to explore its Top 10 actors.
            </p>
          </div>
        ) : (
          <RankingSection
            title={`${activeIndustry?.name ?? "Industry"} Actors`}
            eyebrow="Selected Industry · Top 10"
            subtitle={`Compare actors within ${
              activeIndustry?.name ?? "the selected industry"
            } using the same JMI ranking criteria.`}
            criterion={industryCriterion}
            onCriterionChange={setIndustryCriterion}
            rows={industryRows}
            scopeLabel={`Industry · ${
              activeIndustry?.name ?? "Selected industry"
            } · ${
              periods?.find((period) => period.id === industryPeriodId)
                ?.label ?? "Overall Career"
            } · Top 10`}
            emptyMessage="No eligible actors data available"
            emptyDescription="Rankings will appear when matching lead-role credits and theatrical verdicts are available for this industry."
          />
        )}
      </section>
    </div>
  );
}