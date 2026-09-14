"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Entity = {
  id: number;
  title: string;
  subtitle?: string;
  image?: string | null;
};

type PersonProfile = {
  id: number;
  person_id: number;
  role_id: number;
  full_name: string | null;
  profile_image_url: string | null;
  age: number | null;
  short_bio: string | null;
};

type Credit = {
  movie_id: number;
  role_id: number;
  credit_type_id: number | null;
};

type Movie = {
  id: number;
  title: string | null;
  release_year: number | null;
};

type Business = {
  movie_id: number;
  production_budget_trade: number | null;
  theatrical_verdict: string | null;
};

type StateBoxOffice = {
  movie_id: number;
  state_id: number | null;
  gross_jmi: number | null;
  coverage_type: string | null;
};

type OverseasBoxOffice = {
  movie_id: number;
  gross_inr: number | null;
};

type DailyBoxOffice = {
  movie_id: number;
  country_id: number | null;
  day_number: number | null;
  gross_jmi: number | null;
  coverage_type: string | null;
};

type MoviePerformance = {
  movieId: number;
  title: string;
  year: number | null;

  india: number | null;
  overseas: number | null;
  worldwide: number | null;

  kerala: number | null;
  karnataka: number | null;
  tamilNadu: number | null;
  teluguStates: number | null;

  openingDay: number | null;

  budget: number | null;
  verdict: string | null;
};

type PersonStats = {
  profile: PersonProfile | null;

  movieCount: number;
  leadMovieCount: number;

  careerStart: number | null;
  careerEnd: number | null;

  totalIndia: number | null;
  totalOverseas: number | null;
  totalWorldwide: number | null;

  totalKerala: number | null;
  totalKarnataka: number | null;
  totalTamilNadu: number | null;
  totalTeluguStates: number | null;

  biggestOpeningDay: number | null;

  highestKerala: MoviePerformance | null;
  highestKarnataka: MoviePerformance | null;
  highestTamilNadu: MoviePerformance | null;
  highestTeluguStates: MoviePerformance | null;
  highestOverseas: MoviePerformance | null;
  highestIndia: MoviePerformance | null;
  highestWorldwide: MoviePerformance | null;

  totalBudget: number | null;

  hits: number;
  flops: number;
  blockbusters: number;
  disasters: number;

  hitRatio: number | null;
  averageGross: number | null;

  safestRecoverableBudget: MoviePerformance | null;

  movies50: number;
  movies100: number;
  movies250: number;
  movies500: number;
  movies1000: number;
};

type ComparisonMetric = {
  key: string;
  label: string;
  a: number | null;
  b: number | null;
  format?: "money" | "number" | "percent";
  higherIsBetter?: boolean;
};

function formatCrores(value: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not enough data";
  }

  if (value <= 0) return "₹0.00 Cr";

  return `₹${(value / 10000000).toFixed(2)} Cr;`
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not enough data";
  }

  return value.toLocaleString("en-IN");
}

function formatPercent(value: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not enough data";
  }

  return `${value.toFixed(1)}%;`
}

function normalizeVerdict(value: string | null) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function addValues(
  current: number | null,
  value: number | null
): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return current;
  }

  return (current ?? 0) + Number(value);
}

function maxValue(
  current: number | null,
  value: number | null
): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return current;
  }

  if (current === null || current === undefined) {
    return Number(value);
  }

  return Math.max(current, Number(value));
}

async function fetchPaged<T>(
  table: string,
  select: string,
  filters: (query: any) => any,
  pageSize = 500
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from(table)
      .select(select)
      .range(from, from + pageSize - 1);

    query = filters(query);

    const { data, error } = await query;

    if (error) {
  console.error(
    `JMI person comparison: ${table}`,
    JSON.stringify(error, null, 2)
  );
  break;
}

    const page = (data || []) as T[];

    rows.push(...page);

    if (page.length < pageSize) break;

    from += pageSize;
  }

  return rows;
}

async function fetchByMovieIds<T>(
  table: string,
  select: string,
  movieIds: number[],
  pageSize = 100
): Promise<T[]> {
  const rows: T[] = [];

  for (let i = 0; i < movieIds.length; i += pageSize) {
    const chunk = movieIds.slice(i, i + pageSize);

    const chunkRows = await fetchPaged<T>(
      table,
      select,
      (query) => query.in("movie_id", chunk),
      500
    );

    rows.push(...chunkRows);
  }

  return rows;
}

async function loadPerson(personId: number): Promise<PersonStats> {
  const [profiles, credits] = await Promise.all([
    fetchPaged<PersonProfile>(
      "person_role_intelligence_profiles",
      `
        id,
        person_id,
        role_id,
        full_name,
        profile_image_url,
        age,
        short_bio
      `,
      (query) => query.eq("person_id", personId),
      100
    ),

    fetchPaged<Credit>(
      "movie_people",
      `
        movie_id,
        role_id,
        credit_type_id
      `,
      (query) => query.eq("person_id", personId),
      500
    ),
  ]);

  /*
   * The intelligence profile table can contain multiple rows
   * for different person roles. Prefer the row with the most
   * useful populated personal information.
   */
  const profile =
    profiles
      .sort((a, b) => {
        const score = (p: PersonProfile) =>
          Number(Boolean(p.full_name)) +
          Number(Boolean(p.profile_image_url)) +
          Number(p.age !== null) +
          Number(Boolean(p.short_bio));

        return score(b) - score(a);
      })[0] || null;

  const movieIds = Array.from(
    new Set(
      credits
        .map((credit) => Number(credit.movie_id))
        .filter((id) => Number.isFinite(id))
    )
  );

  if (!movieIds.length) {
    return {
      profile,
      movieCount: 0,
      leadMovieCount: 0,
      careerStart: null,
      careerEnd: null,
      totalIndia: null,
      totalOverseas: null,
      totalWorldwide: null,
      totalKerala: null,
      totalKarnataka: null,
      totalTamilNadu: null,
      totalTeluguStates: null,
      biggestOpeningDay: null,
      highestKerala: null,
      highestKarnataka: null,
      highestTamilNadu: null,
      highestTeluguStates: null,
      highestOverseas: null,
      highestIndia: null,
      highestWorldwide: null,
      totalBudget: null,
      hits: 0,
      flops: 0,
      blockbusters: 0,
      disasters: 0,
      hitRatio: null,
      averageGross: null,
      safestRecoverableBudget: null,
      movies50: 0,
      movies100: 0,
      movies250: 0,
      movies500: 0,
      movies1000: 0,
    };
  }

  const [
  movies,
  business,
  stateBoxOffice,
  overseasBoxOffice,
  dailyBoxOffice,
] = await Promise.all([
  fetchPaged<Movie>(
    "movies",
    `
      id,
      title,
      release_year
    `,
    (query) => query.in("id", movieIds),
    500
  ),

  fetchByMovieIds<Business>(
      "movie_business",
      `
        movie_id,
        production_budget_trade,
        theatrical_verdict
      `,
      movieIds
    ),

    fetchByMovieIds<StateBoxOffice>(
      "movie_state_box_office",
      `
        movie_id,
        state_id,
        gross_jmi,
        coverage_type
      `,
      movieIds
    ),

    fetchByMovieIds<OverseasBoxOffice>(
      "movie_overseas_box_office",
      `
        movie_id,
        gross_inr
      `,
      movieIds
    ),

    fetchByMovieIds<DailyBoxOffice>(
      "movie_daily_box_office",
      `
        movie_id,
        country_id,
        day_number,
        gross_jmi,
        coverage_type
      `,
      movieIds
    ),
  ]);

  const movieMap = new Map<number, Movie>();

  movies.forEach((movie) => {
    movieMap.set(Number(movie.id), movie);
  });

  const businessMap = new Map<number, Business>();

  business.forEach((row) => {
    businessMap.set(Number(row.movie_id), row);
  });

  const overseasMap = new Map<number, number>();

  overseasBoxOffice.forEach((row) => {
    const movieId = Number(row.movie_id);
    const value =
      row.gross_inr !== null && Number.isFinite(Number(row.gross_inr))
        ? Number(row.gross_inr)
        : null;

    if (value === null) return;

    overseasMap.set(
      movieId,
      (overseasMap.get(movieId) || 0) + value
    );
  });

  /*
   * State-wise JMI data is cumulative.
   *
   * State IDs:
   * Karnataka = 11
   * Kerala = 12
   * Tamil Nadu = 23
   * Andhra Pradesh = 1
   * Telangana = 24
   *
   * REST_OF_INDIA rows are represented by state_id = NULL.
   */
  const stateMap = new Map<
    number,
    {
      india: number | null;
      kerala: number | null;
      karnataka: number | null;
      tamilNadu: number | null;
      teluguStates: number | null;
    }
  >();

  stateBoxOffice.forEach((row) => {
    const movieId = Number(row.movie_id);

    if (!stateMap.has(movieId)) {
      stateMap.set(movieId, {
        india: null,
        kerala: null,
        karnataka: null,
        tamilNadu: null,
        teluguStates: null,
      });
    }

    const current = stateMap.get(movieId)!;

    const gross =
      row.gross_jmi !== null && Number.isFinite(Number(row.gross_jmi))
        ? Number(row.gross_jmi)
        : null;

    if (gross === null) return;

    /*
     * India total:
     * sum the cumulative state-wise rows including
     * REST_OF_INDIA. Do not use a separate total table.
     */
    current.india = addValues(current.india, gross);

    if (Number(row.state_id) === 12) {
      current.kerala = addValues(current.kerala, gross);
    }

    if (Number(row.state_id) === 11) {
      current.karnataka = addValues(current.karnataka, gross);
    }

    if (Number(row.state_id) === 23) {
      current.tamilNadu = addValues(current.tamilNadu, gross);
    }

    if (
      Number(row.state_id) === 1 ||
      Number(row.state_id) === 24
    ) {
      current.teluguStates = addValues(
        current.teluguStates,
        gross
      );
    }
  });

  /*
   * Opening day:
   * Prefer the India country-level daily record.
   * This prevents accidentally adding individual state
   * rows to an already-existing India aggregate.
   */
  const openingMap = new Map<number, number>();

  dailyBoxOffice.forEach((row) => {
    if (Number(row.country_id) !== 1) return;
    if (Number(row.day_number) !== 1) return;
    if (
      row.coverage_type &&
      row.coverage_type.toUpperCase() !== "COUNTRY"
    ) {
      return;
    }

    const gross =
      row.gross_jmi !== null && Number.isFinite(Number(row.gross_jmi))
        ? Number(row.gross_jmi)
        : null;

    if (gross === null) return;

    const movieId = Number(row.movie_id);

    /*
     * If duplicate country-level records exist, retain the
     * highest recorded JMI opening-day value rather than
     * double counting them.
     */
    openingMap.set(
      movieId,
      Math.max(openingMap.get(movieId) || 0, gross)
    );
  });

  const performances: MoviePerformance[] = [];

  movieIds.forEach((movieId) => {
    const movie = movieMap.get(movieId);

    if (!movie) return;

    const state = stateMap.get(movieId);

    const india = state?.india ?? null;
    const overseas = overseasMap.get(movieId) ?? null;

    /*
     * Worldwide exists only when the required components
     * are available. Missing data is never converted to zero.
     */
    const worldwide =
      india !== null && overseas !== null
        ? india + overseas
        : null;

    const businessRow = businessMap.get(movieId);

    performances.push({
      movieId,
      title: movie.title || "Untitled Movie",
      year: movie.release_year ?? null,

      india,
      overseas,
      worldwide,

      kerala: state?.kerala ?? null,
      karnataka: state?.karnataka ?? null,
      tamilNadu: state?.tamilNadu ?? null,
      teluguStates: state?.teluguStates ?? null,

      openingDay: openingMap.get(movieId) ?? null,

      budget:
        businessRow?.production_budget_trade !== null &&
        businessRow?.production_budget_trade !== undefined &&
        Number.isFinite(Number(businessRow.production_budget_trade))
          ? Number(businessRow.production_budget_trade)
          : null,

      verdict: businessRow?.theatrical_verdict ?? null,
    });
  });

  const releaseYears = performances
    .map((movie) => movie.year)
    .filter(
      (year): year is number =>
        year !== null && Number.isFinite(year)
    );

  const careerStart =
    releaseYears.length > 0
      ? Math.min(...releaseYears)
      : null;

  const careerEnd =
    releaseYears.length > 0
      ? Math.max(...releaseYears)
      : null;

  const leadMovieIds = new Set(
    credits
      .filter(
        (credit) =>
          Number(credit.credit_type_id) === 1 ||
          Number(credit.credit_type_id) === 2
      )
      .map((credit) => Number(credit.movie_id))
  );

  let totalIndia: number | null = null;
  let totalOverseas: number | null = null;
  let totalWorldwide: number | null = null;

  let totalKerala: number | null = null;
  let totalKarnataka: number | null = null;
  let totalTamilNadu: number | null = null;
  let totalTeluguStates: number | null = null;

  let biggestOpeningDay: number | null = null;

  let totalBudget: number | null = null;

  let hits = 0;
  let flops = 0;
  let blockbusters = 0;
  let disasters = 0;

  const moviesWithWorldwide: number[] = [];

  let safestRecoverableBudget: MoviePerformance | null = null;

  performances.forEach((movie) => {
    totalIndia = addValues(totalIndia, movie.india);
    totalOverseas = addValues(totalOverseas, movie.overseas);
    totalWorldwide = addValues(totalWorldwide, movie.worldwide);

    totalKerala = addValues(totalKerala, movie.kerala);
    totalKarnataka = addValues(totalKarnataka, movie.karnataka);
    totalTamilNadu = addValues(
      totalTamilNadu,
      movie.tamilNadu
    );
    totalTeluguStates = addValues(
      totalTeluguStates,
      movie.teluguStates
    );

    biggestOpeningDay = maxValue(
      biggestOpeningDay,
      movie.openingDay
    );

    if (movie.worldwide !== null) {
      moviesWithWorldwide.push(movie.worldwide);
    }

    if (movie.budget !== null) {
      totalBudget = addValues(totalBudget, movie.budget);
    }

    const verdict = normalizeVerdict(movie.verdict);

    if (verdict === "hit") hits++;
    if (verdict === "super hit") hits++;
    if (verdict === "blockbuster") {
      blockbusters++;
      hits++;
    }

    if (verdict === "flop") flops++;
    if (verdict === "disaster") disasters++;

    /*
     * Locked methodology:
     * Safest recoverable budget =
     * highest-budget movie with exactly Hit or Blockbuster status.
     */
    if (
      movie.budget !== null &&
      (verdict === "hit" || verdict === "blockbuster")
    ) {
      if (
        safestRecoverableBudget === null ||
        movie.budget >
          (safestRecoverableBudget.budget ?? -Infinity)
      ) {
        safestRecoverableBudget = movie;
      }
    }
  });

  const decidedVerdicts =
    hits + flops + disasters;

  const hitRatio =
    decidedVerdicts > 0
      ? (hits / decidedVerdicts) * 100
      : null;

  const averageGross =
    moviesWithWorldwide.length > 0
      ? moviesWithWorldwide.reduce(
          (sum, value) => sum + value,
          0
        ) / moviesWithWorldwide.length
      : null;

  const highestBy = (
    field:
      | "kerala"
      | "karnataka"
      | "tamilNadu"
      | "teluguStates"
      | "overseas"
      | "india"
      | "worldwide"
  ) => {
    const available = performances.filter(
      (movie) =>
        movie[field] !== null &&
        Number.isFinite(Number(movie[field]))
    );

    if (!available.length) return null;

    return available.reduce((best, movie) =>
      Number(movie[field]) > Number(best[field])
        ? movie
        : best
    );
  };

  const movies50 = performances.filter(
    (movie) =>
      movie.worldwide !== null &&
      movie.worldwide >= 500000000
  ).length;

  const movies100 = performances.filter(
    (movie) =>
      movie.worldwide !== null &&
      movie.worldwide >= 1000000000
  ).length;

  const movies250 = performances.filter(
    (movie) =>
      movie.worldwide !== null &&
      movie.worldwide >= 2500000000
  ).length;

  const movies500 = performances.filter(
    (movie) =>
      movie.worldwide !== null &&
      movie.worldwide >= 5000000000
  ).length;

  const movies1000 = performances.filter(
    (movie) =>
      movie.worldwide !== null &&
      movie.worldwide >= 10000000000
  ).length;

  return {
    profile,

    movieCount: movieIds.length,
    leadMovieCount: leadMovieIds.size,

    careerStart,
    careerEnd,

    totalIndia,
    totalOverseas,
    totalWorldwide,

    totalKerala,
    totalKarnataka,
    totalTamilNadu,
    totalTeluguStates,

    biggestOpeningDay,

    highestKerala: highestBy("kerala"),
    highestKarnataka: highestBy("karnataka"),
    highestTamilNadu: highestBy("tamilNadu"),
    highestTeluguStates: highestBy("teluguStates"),
    highestOverseas: highestBy("overseas"),
    highestIndia: highestBy("india"),
    highestWorldwide: highestBy("worldwide"),

    totalBudget,

    hits,
    flops,
    blockbusters,
    disasters,

    hitRatio,
    averageGross,

    safestRecoverableBudget,

    movies50,
    movies100,
    movies250,
    movies500,
    movies1000,
  };
}

function MetricValue({
  value,
  format = "money",
}: {
  value: number | null;
  format?: "money" | "number" | "percent";
}) {
  if (value === null) {
    return (
      <span className="text-[10px] text-zinc-600">
        Not enough data
      </span>
    );
  }

  if (format === "number") {
    return (
      <span className="text-sm font-semibold text-zinc-100">
        {formatNumber(value)}
      </span>
    );
  }

  if (format === "percent") {
    return (
      <span className="text-sm font-semibold text-zinc-100">
        {formatPercent(value)}
      </span>
    );
  }

  return (
    <span className="text-sm font-semibold text-zinc-100">
      {formatCrores(value)}
    </span>
  );
}

function Trophy({
  label,
  winner,
}: {
  label: string;
  winner: "A" | "B" | "TIE" | "NONE";
}) {
  if (winner === "NONE") return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-yellow-500/20 bg-yellow-500/5 px-2 py-1">
      <span className="text-[11px]">🏆</span>
      <span className="text-[9px] uppercase tracking-[0.14em] text-yellow-400">
        {label}
      </span>
      {winner !== "TIE" && (
        <span className="text-[9px] font-semibold text-zinc-200">
          {winner === "A" ? "A" : "B"}
        </span>
      )}
      {winner === "TIE" && (
        <span className="text-[9px] font-semibold text-zinc-400">
          Tie
        </span>
      )}
    </div>
  );
}

function winnerFor(
  a: number | null,
  b: number | null,
  higherIsBetter = true
): "A" | "B" | "TIE" | "NONE" {
  if (a === null || b === null) return "NONE";

  if (a === b) return "TIE";

  if (higherIsBetter) {
    return a > b ? "A" : "B";
  }

  return a < b ? "A" : "B";
}

function MetricRow({
  metric,
  onWinner,
}: {
  metric: ComparisonMetric;
  onWinner?: (winner: "A" | "B" | "TIE" | "NONE") => void;
}) {
  const winner = winnerFor(
    metric.a,
    metric.b,
    metric.higherIsBetter ?? true
  );

  useEffect(() => {
    onWinner?.(winner);
  }, [winner, onWinner]);

  const display = (value: number | null) => {
    if (metric.format === "number") {
      return formatNumber(value);
    }

    if (metric.format === "percent") {
      return formatPercent(value);
    }

    return formatCrores(value);
  };

  return (
    <div className="grid grid-cols-[1fr_72px_72px] items-center gap-2 border-b border-zinc-900 py-2.5 last:border-b-0">
      <div className="text-[10px] leading-4 text-zinc-400">
        {metric.label}
      </div>

      <div
        className={`text-right text-[11px] font-semibold ${
          winner === "A"
            ? "text-violet-300"
            : "text-zinc-200"
        }`}
      >
        {display(metric.a)}
      </div>

      <div
        className={`text-right text-[11px] font-semibold ${
          winner === "B"
            ? "text-violet-300"
            : "text-zinc-200"
        }`}
      >
        {display(metric.b)}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-3 w-[2px] rounded-full bg-violet-400" />
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function ComparisonHeader({
  first,
  second,
  a,
  b,
}: {
  first: Entity;
  second: Entity;
  a: PersonStats;
  b: PersonStats;
}) {
  const nameA =
    a.profile?.full_name ||
    first.title ||
    "Person A";

  const nameB =
    b.profile?.full_name ||
    second.title ||
    "Person B";

  return (
    <div className="overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/10">
      <div className="grid grid-cols-2 divide-x divide-zinc-800">
        <div className="p-4 text-center">
          <div className="mx-auto mb-3 h-20 w-16 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
            {a.profile?.profile_image_url ? (
              <img
                src={a.profile.profile_image_url}
                alt={nameA}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-lg text-zinc-700">
                ◉
              </div>
            )}
          </div>

          <p className="text-[12px] font-semibold text-zinc-100">
            {nameA}
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-violet-400">
            Person A
          </p>
        </div>

        <div className="p-4 text-center">
          <div className="mx-auto mb-3 h-20 w-16 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
            {b.profile?.profile_image_url ? (
              <img
                src={b.profile.profile_image_url}
                alt={nameB}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-lg text-zinc-700">
                ◉
              </div>
            )}
          </div>

          <p className="text-[12px] font-semibold text-zinc-100">
            {nameB}
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-violet-400">
            Person B
          </p>
        </div>
      </div>
    </div>
  );
}

function CareerSpan({
  stats,
}: {
  stats: PersonStats;
}) {
  if (
    stats.careerStart === null ||
    stats.careerEnd === null
  ) {
    return "Not enough data";
  }

  const years = Math.max(
    0,
    stats.careerEnd - stats.careerStart
  );

  return `${years} years (${stats.careerStart}–${stats.careerEnd});`
}

function RecordCard({
  label,
  movie,
  field,
}: {
  label: string;
  movie: MoviePerformance | null;
  field:
    | "kerala"
    | "karnataka"
    | "tamilNadu"
    | "teluguStates"
    | "overseas"
    | "india"
    | "worldwide"
    | "openingDay";
}) {
  if (!movie || movie[field] === null) {
    return (
      <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
        <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
          {label}
        </p>
        <p className="mt-2 text-[10px] text-zinc-600">
          Not enough data
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
      <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 line-clamp-1 text-[10px] font-medium text-zinc-300">
        {movie.title}
      </p>

      <p className="mt-2 text-sm font-semibold text-violet-300">
        {formatCrores(movie[field])}
      </p>

      {movie.year && (
        <p className="mt-1 text-[9px] text-zinc-600">
          {movie.year}
        </p>
      )}
    </div>
  );
}

export default function JmiPersonComparisonReport({
  first,
  second,
}: {
  first: Entity;
  second: Entity;
}) {
  const [firstStats, setFirstStats] =
    useState<PersonStats | null>(null);

  const [secondStats, setSecondStats] =
    useState<PersonStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const [a, b] = await Promise.all([
          loadPerson(Number(first.id)),
          loadPerson(Number(second.id)),
        ]);

        if (cancelled) return;

        setFirstStats(a);
        setSecondStats(b);
      } catch (err) {
        console.error(
          "JMI Person Comparison error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load person comparison data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [first.id, second.id]);

  const nameA =
    firstStats?.profile?.full_name ||
    first.title ||
    "Person A";

  const nameB =
    secondStats?.profile?.full_name ||
    second.title ||
    "Person B";

  /*
   * Final JMI scoring.
   *
   * Profile information and career duration are informational
   * and do not decide the final winner.
   *
   * Performance metrics receive one point when comparable.
   * Missing data does not count against either person.
   */
  const finalScore = useMemo(() => {
    if (!firstStats || !secondStats) {
      return {
        a: 0,
        b: 0,
        comparable: 0,
      };
    }

    const metrics: ComparisonMetric[] = [
      {
        key: "totalWorldwide",
        label: "Total Worldwide",
        a: firstStats.totalWorldwide,
        b: secondStats.totalWorldwide,
      },
      {
        key: "totalIndia",
        label: "Total India",
        a: firstStats.totalIndia,
        b: secondStats.totalIndia,
      },
      {
        key: "totalOverseas",
        label: "Total Overseas",
        a: firstStats.totalOverseas,
        b: secondStats.totalOverseas,
      },
      {
        key: "kerala",
        label: "Total Kerala",
        a: firstStats.totalKerala,
        b: secondStats.totalKerala,
      },
      {
        key: "karnataka",
        label: "Total Karnataka",
        a: firstStats.totalKarnataka,
        b: secondStats.totalKarnataka,
      },
      {
        key: "tamilNadu",
        label: "Total Tamil Nadu",
        a: firstStats.totalTamilNadu,
        b: secondStats.totalTamilNadu,
      },
      {
        key: "teluguStates",
        label: "Total Telugu States",
        a: firstStats.totalTeluguStates,
        b: secondStats.totalTeluguStates,
      },
      {
        key: "opening",
        label: "Biggest Opening Day",
        a: firstStats.biggestOpeningDay,
        b: secondStats.biggestOpeningDay,
      },
      {
        key: "hitRatio",
        label: "Hit Ratio",
        a: firstStats.hitRatio,
        b: secondStats.hitRatio,
        format: "percent",
      },
      {
        key: "averageGross",
        label: "Average Gross",
        a: firstStats.averageGross,
        b: secondStats.averageGross,
      },
      {
        key: "safestBudget",
        label: "Safest Recoverable Budget",
        a:
          firstStats.safestRecoverableBudget?.budget ??
          null,
        b:
          secondStats.safestRecoverableBudget?.budget ??
          null,
      },
      {
        key: "movies50",
        label: "50 Cr+ Movies",
        a: firstStats.movies50,
        b: secondStats.movies50,
        format: "number",
      },
      {
        key: "movies100",
        label: "100 Cr+ Movies",
        a: firstStats.movies100,
        b: secondStats.movies100,
        format: "number",
      },
      {
        key: "movies250",
        label: "250 Cr+ Movies",
        a: firstStats.movies250,
        b: secondStats.movies250,
        format: "number",
      },
      {
        key: "movies500",
        label: "500 Cr+ Movies",
        a: firstStats.movies500,
        b: secondStats.movies500,
        format: "number",
      },
      {
        key: "movies1000",
        label: "1000 Cr+ Movies",
        a: firstStats.movies1000,
        b: secondStats.movies1000,
        format: "number",
      },
    ];

    let a = 0;
    let b = 0;
    let comparable = 0;

    metrics.forEach((metric) => {
      const winner = winnerFor(
        metric.a,
        metric.b,
        metric.higherIsBetter ?? true
      );

      if (winner === "A") {
        a++;
        comparable++;
      } else if (winner === "B") {
        b++;
        comparable++;
      } else if (winner === "TIE") {
        comparable++;
      }
    });

    /*
     * Career / participation metrics:
     * these are useful comparison categories but are not
     * weighted into the final performance championship.
     */

    return { a, b, comparable };
  }, [firstStats, secondStats]);

  if (loading) {
    return (
      <div className="rounded-xl border border-violet-400/20 bg-zinc-950 p-8 text-center">
        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-400" />

        <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-violet-400">
          JMI Person Intelligence
        </p>

        <p className="mt-2 text-[10px] text-zinc-600">
          Building comparison report...
        </p>
      </div>
    );
  }

  if (error || !firstStats || !secondStats) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-zinc-950 p-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.18em] text-red-400">
          Comparison Error
        </p>

        <p className="mt-2 text-[11px] text-zinc-500">
          {error || "Not enough data"}
        </p>
      </div>
    );
  }

  const finalWinner =
    finalScore.comparable === 0
      ? "NONE"
      : finalScore.a === finalScore.b
      ? "TIE"
      : finalScore.a > finalScore.b
      ? "A"
      : "B";

  const metricsForSection = {
    career: [
      {
        key: "movies",
        label: "Total Movies",
        a: firstStats.movieCount,
        b: secondStats.movieCount,
        format: "number" as const,
      },
      {
        key: "leadMovies",
        label: "Lead-Role Movies",
        a: firstStats.leadMovieCount,
        b: secondStats.leadMovieCount,
        format: "number" as const,
      },
    ],

    collections: [
      {
        key: "worldwide",
        label: "Total Worldwide Collection",
        a: firstStats.totalWorldwide,
        b: secondStats.totalWorldwide,
      },
      {
        key: "india",
        label: "Total India Collection",
        a: firstStats.totalIndia,
        b: secondStats.totalIndia,
      },
      {
        key: "overseas",
        label: "Total Overseas Collection",
        a: firstStats.totalOverseas,
        b: secondStats.totalOverseas,
      },
      {
        key: "opening",
        label: "Biggest Opening Day",
        a: firstStats.biggestOpeningDay,
        b: secondStats.biggestOpeningDay,
      },
    ],

    regions: [
      {
        key: "kerala",
        label: "Total Kerala Collection",
        a: firstStats.totalKerala,
        b: secondStats.totalKerala,
      },
      {
        key: "karnataka",
        label: "Total Karnataka Collection",
        a: firstStats.totalKarnataka,
        b: secondStats.totalKarnataka,
      },
      {
        key: "tamilNadu",
        label: "Total Tamil Nadu Collection",
        a: firstStats.totalTamilNadu,
        b: secondStats.totalTamilNadu,
      },
      {
        key: "telugu",
        label: "Total Telugu States Collection",
        a: firstStats.totalTeluguStates,
        b: secondStats.totalTeluguStates,
      },
    ],

    business: [
      {
        key: "budget",
        label: "Total Budget",
        a: firstStats.totalBudget,
        b: secondStats.totalBudget,
      },
      {
        key: "hits",
        label: "Theatrical Hits",
        a: firstStats.hits,
        b: secondStats.hits,
        format: "number" as const,
      },
      {
        key: "blockbusters",
        label: "Blockbusters",
        a: firstStats.blockbusters,
        b: secondStats.blockbusters,
        format: "number" as const,
      },
      {
        key: "flops",
        label: "Flops",
        a: firstStats.flops,
        b: secondStats.flops,
        format: "number" as const,
        higherIsBetter: false,
      },
      {
        key: "disasters",
        label: "Disasters",
        a: firstStats.disasters,
        b: secondStats.disasters,
        format: "number" as const,
        higherIsBetter: false,
      },
      {
        key: "hitRatio",
        label: "Hit Ratio",
        a: firstStats.hitRatio,
        b: secondStats.hitRatio,
        format: "percent" as const,
      },
      {
        key: "averageGross",
        label: "Average Movie Gross",
        a: firstStats.averageGross,
        b: secondStats.averageGross,
      },
      {
        key: "safeBudget",
        label: "Safest Recoverable Budget",
        a:
          firstStats.safestRecoverableBudget?.budget ??
          null,
        b:
          secondStats.safestRecoverableBudget?.budget ??
          null,
      },
    ],

    milestones: [
      {
        key: "50",
        label: "50 Cr+ Worldwide Movies",
        a: firstStats.movies50,
        b: secondStats.movies50,
        format: "number" as const,
      },
      {
        key: "100",
        label: "100 Cr+ Worldwide Movies",
        a: firstStats.movies100,
        b: secondStats.movies100,
        format: "number" as const,
      },
      {
        key: "250",
        label: "250 Cr+ Worldwide Movies",
        a: firstStats.movies250,
        b: secondStats.movies250,
        format: "number" as const,
      },
      {
        key: "500",
        label: "500 Cr+ Worldwide Movies",
        a: firstStats.movies500,
        b: secondStats.movies500,
        format: "number" as const,
      },
      {
        key: "1000",
        label: "1000 Cr+ Worldwide Movies",
        a: firstStats.movies1000,
        b: secondStats.movies1000,
        format: "number" as const,
      },
    ],
  };

  const careerWinnerCount = metricsForSection.career.filter(
    (metric) =>
      winnerFor(metric.a, metric.b) !== "NONE"
  ).length;

  const collectionWinnerCount =
    metricsForSection.collections.filter(
      (metric) =>
        winnerFor(metric.a, metric.b) !== "NONE"
    ).length;

  const regionWinnerCount =
    metricsForSection.regions.filter(
      (metric) =>
        winnerFor(metric.a, metric.b) !== "NONE"
    ).length;

  const businessWinnerCount =
    metricsForSection.business.filter(
      (metric) =>
        winnerFor(
          metric.a,
          metric.b,
          metric.higherIsBetter ?? true
        ) !== "NONE"
    ).length;

  const milestoneWinnerCount =
    metricsForSection.milestones.filter(
      (metric) =>
        winnerFor(metric.a, metric.b) !== "NONE"
    ).length;

  return (
    <div className="space-y-5">

      {/* REPORT HEADER */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-violet-400">
          JMI Person Intelligence
        </p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">
          Person vs Person
        </h2>

        <p className="mt-1 text-[10px] leading-5 text-zinc-500">
          A data-driven comparison of career, box office,
          regional performance, business strength and
          theatrical milestones.
        </p>
      </div>

      <ComparisonHeader
        first={first}
        second={second}
        a={firstStats}
        b={secondStats}
      />

      {/* COLUMN LABELS */}
      <div className="grid grid-cols-[1fr_72px_72px] gap-2 px-1">
        <div />
        <div className="text-right text-[8px] uppercase tracking-[0.12em] text-violet-400">
          A
        </div>
        <div className="text-right text-[8px] uppercase tracking-[0.12em] text-violet-400">
          B
        </div>
      </div>

      {/* PROFILE */}
      <Section title="Personal Profile">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
              Age
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-200">
              {firstStats.profile?.age !== null &&
              firstStats.profile?.age !== undefined
                ? `${firstStats.profile.age} years`
                : "Not enough data"}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
              Age
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-200">
              {secondStats.profile?.age !== null &&
              secondStats.profile?.age !== undefined
                ? `${secondStats.profile.age} years`
                : "Not enough data"}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
              Career Span
            </p>
            <p className="mt-2 text-[11px] font-medium text-zinc-300">
              {CareerSpan({ stats: firstStats })}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
              Career Span
            </p>
            <p className="mt-2 text-[11px] font-medium text-zinc-300">
              {CareerSpan({ stats: secondStats })}
            </p>
          </div>
        </div>
      </Section>

      {/* CAREER */}
      <Section title="Career">
        {metricsForSection.career.map((metric) => (
          <MetricRow
            key={metric.key}
            metric={metric}
          />
        ))}

        {careerWinnerCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {metricsForSection.career.map((metric) => (
              <Trophy
                key={metric.key}
                label={metric.label}
                winner={winnerFor(
                  metric.a,
                  metric.b
                )}
              />
            ))}
          </div>
        )}
      </Section>

      {/* TOTAL COLLECTIONS */}
      <Section title="JMI Box Office Performance">
        {metricsForSection.collections.map((metric) => (
          <MetricRow
            key={metric.key}
            metric={metric}
          />
        ))}

        {collectionWinnerCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {metricsForSection.collections.map((metric) => (
              <Trophy
                key={metric.key}
                label={metric.label}
                winner={winnerFor(
                  metric.a,
                  metric.b
                )}
              />
            ))}
          </div>
        )}
      </Section>

      {/* REGIONAL */}
      <Section title="Regional Market Reach">
        {metricsForSection.regions.map((metric) => (
          <MetricRow
            key={metric.key}
            metric={metric}
          />
        ))}

        {regionWinnerCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {metricsForSection.regions.map((metric) => (
              <Trophy
                key={metric.key}
                label={metric.label}
                winner={winnerFor(
                  metric.a,
                  metric.b
                )}
              />
            ))}
          </div>
        )}
      </Section>

      {/* PERSONAL RECORDS */}
      <Section title="Individual Box Office Records">
        <div className="grid grid-cols-2 gap-3">
          <RecordCard
            label="Highest Kerala"
            movie={firstStats.highestKerala}
            field="kerala"
          />

          <RecordCard
            label="Highest Kerala"
            movie={secondStats.highestKerala}
            field="kerala"
          />

          <RecordCard
            label="Highest Karnataka"
            movie={firstStats.highestKarnataka}
            field="karnataka"
          />

          <RecordCard
            label="Highest Karnataka"
            movie={secondStats.highestKarnataka}
            field="karnataka"
          />

          <RecordCard
            label="Highest Tamil Nadu"
            movie={firstStats.highestTamilNadu}
            field="tamilNadu"
          />

          <RecordCard
            label="Highest Tamil Nadu"
            movie={secondStats.highestTamilNadu}
            field="tamilNadu"
          />

          <RecordCard
            label="Highest Telugu States"
            movie={firstStats.highestTeluguStates}
            field="teluguStates"
          />

          <RecordCard
            label="Highest Telugu States"
            movie={secondStats.highestTeluguStates}
            field="teluguStates"
          />

          <RecordCard
            label="Highest Overseas"
            movie={firstStats.highestOverseas}
            field="overseas"
          />

          <RecordCard
            label="Highest Overseas"
            movie={secondStats.highestOverseas}
            field="overseas"
          />

          <RecordCard
            label="Highest India"
            movie={firstStats.highestIndia}
            field="india"
          />

          <RecordCard
            label="Highest India"
            movie={secondStats.highestIndia}
            field="india"
          />

          <RecordCard
            label="Highest Worldwide"
            movie={firstStats.highestWorldwide}
            field="worldwide"
          />

          <RecordCard
            label="Highest Worldwide"
            movie={secondStats.highestWorldwide}
            field="worldwide"
          />

          <RecordCard
            label="Biggest Opening Day"
            movie={firstStats.highestIndia}
            field="openingDay"
          />

          <RecordCard
            label="Biggest Opening Day"
            movie={secondStats.highestIndia}
            field="openingDay"
          />
        </div>
      </Section>

      {/* BUSINESS */}
      <Section title="Business & Theatrical Performance">
        {metricsForSection.business.map((metric) => (
          <MetricRow
            key={metric.key}
            metric={metric}
          />
        ))}

        {businessWinnerCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {metricsForSection.business.map((metric) => (
              <Trophy
                key={metric.key}
                label={metric.label}
                winner={winnerFor(
                  metric.a,
                  metric.b,
                  metric.higherIsBetter ?? true
                )}
              />
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
              Safest Recoverable Budget
            </p>

            <p className="mt-2 text-sm font-semibold text-violet-300">
              {formatCrores(
                firstStats.safestRecoverableBudget?.budget ??
                  null
              )}
            </p>

            {firstStats.safestRecoverableBudget && (
              <p className="mt-1 line-clamp-1 text-[9px] text-zinc-600">
                {
                  firstStats.safestRecoverableBudget.title
                }
              </p>
            )}
          </div>

         
        </div>
      </Section>

      {/* MILESTONES */}
      <Section title="Worldwide Milestones">
        {metricsForSection.milestones.map((metric) => (
          <MetricRow
            key={metric.key}
            metric={metric}
          />
        ))}

        {milestoneWinnerCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {metricsForSection.milestones.map(
              (metric) => (
                <Trophy
                  key={metric.key}
                  label={metric.label}
                  winner={winnerFor(
                    metric.a,
                    metric.b
                  )}
                />
              )
            )}
          </div>
        )}
      </Section>

      {/* FINAL CHAMPIONSHIP */}
      <section className="overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-zinc-950 to-violet-500/5">
        <div className="border-b border-yellow-500/10 px-4 py-3">
          <p className="text-[9px] uppercase tracking-[0.22em] text-yellow-400">
            JMI Championship
          </p>

          <h3 className="mt-1 text-sm font-semibold text-zinc-100">
            Final Comparison Result
          </h3>

          <p className="mt-1 text-[9px] leading-4 text-zinc-600">
            Based on comparable JMI performance,
            business and milestone metrics. Missing data
            does not count against either person.
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-zinc-800">
          <div
            className={`p-5 text-center ${
              finalWinner === "A"
                ? "bg-violet-500/5"
                : ""
            }`}
          >
            {finalWinner === "A" && (
              <div className="mb-2 text-2xl">🏆</div>
            )}

            <p className="text-[11px] font-semibold text-zinc-200">
              {nameA}
            </p>

            <p className="mt-2 text-2xl font-bold text-violet-300">
              {finalScore.a}
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-zinc-600">
              JMI points
            </p>
          </div>

          <div
            className={`p-5 text-center ${
              finalWinner === "B"
                ? "bg-violet-500/5"
                : ""
            }`}
          >
            {finalWinner === "B" && (
              <div className="mb-2 text-2xl">🏆</div>
            )}

            <p className="text-[11px] font-semibold text-zinc-200">
              {nameB}
            </p>

            <p className="mt-2 text-2xl font-bold text-violet-300">
              {finalScore.b}
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-zinc-600">
              JMI points
            </p>
          </div>
        </div>

        <div className="border-t border-yellow-500/10 p-4 text-center">
          {finalWinner === "A" && (
            <>
              <p className="text-[9px] uppercase tracking-[0.2em] text-yellow-400">
                JMI Winner
              </p>

              <p className="mt-1 text-base font-semibold text-zinc-100">
                {nameA}
              </p>
            </>
          )}

          {finalWinner === "B" && (
            <>
              <p className="text-[9px] uppercase tracking-[0.2em] text-yellow-400">
                JMI Winner
              </p>

              <p className="mt-1 text-base font-semibold text-zinc-100">
                {nameB}
              </p>
            </>
          )}

          {finalWinner === "TIE" && (
            <>
              <p className="text-[9px] uppercase tracking-[0.2em] text-yellow-400">
                JMI Result
              </p>

              <p className="mt-1 text-base font-semibold text-zinc-100">
                Statistical Tie
              </p>
            </>
          )}

          {finalWinner === "NONE" && (
            <>
              <p className="text-[9px] uppercase tracking-[0.2em] text-yellow-400">
                JMI Result
              </p>

              <p className="mt-1 text-base font-semibold text-zinc-100">
                Not enough data
              </p>
            </>
          )}

          <p className="mt-2 text-[9px] text-zinc-600">
            {finalScore.comparable} comparable performance
            metrics evaluated
          </p>
        </div>
      </section>

      {/* METHODOLOGY */}
      <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
        <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-600">
          JMI Methodology
        </p>

        <p className="mt-2 text-[9px] leading-5 text-zinc-600">
          Collections use JMI trade data. Career span is
          calculated from the earliest to latest recorded
          release year. Lead-role movies are identified from
          lead credit types. Safest recoverable budget is
          based on the highest-budget movie achieving Hit or
          Blockbuster status. Missing values are reported as
          Not enough data rather than being treated as zero.
        </p>
      </div>
    </div>
  );
}