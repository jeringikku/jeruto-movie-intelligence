"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Entity = {
  id: number;
  title: string;
  subtitle?: string;
  image?: string | null;
};

type Company = {
  id: number;
  name: string | null;
  slug: string | null;
  company_type: string | null;
  country_id: number | null;
  founded_year: number | null;
  headquarters: string | null;
  website: string | null;
  logo: string | null;
  description: string | null;
};

type Country = {
  id: number;
  name: string | null;
};

type CompanyMovie = {
  id: number;
  movie_id: number;
  company_id: number;
  role_id: number;
  billing_order: number | null;
  notes: string | null;
};

type CompanyRole = {
  id: number;
  name: string;
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

type MovieLanguage = {
  movie_id: number;
  language_id: number;
  is_primary: boolean | null;
};

type Language = {
  id: number;
  name: string | null;
};

type MovieIndustry = {
  movie_id: number;
  industry_id: number;
  is_primary: boolean | null;
};

type Industry = {
  id: number;
  name: string | null;
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

type RoleStat = {
  roleId: number;
  roleName: string;
  movieCount: number;
};

type NameCount = {
  name: string;
  count: number;
};

type CompanyStats = {
  company: Company | null;
  country: Country | null;

  movieCount: number;
  portfolioStart: number | null;
  portfolioEnd: number | null;

  roleStats: RoleStat[];

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
  biggestOpeningMovie: MoviePerformance | null;

  totalBudget: number | null;

  hits: number;
  superHits: number;
  blockbusters: number;
  flops: number;
  disasters: number;

  hitRatio: number | null;
  averageGross: number | null;

  safestRecoverableBudget: MoviePerformance | null;

  movies50: number;
  movies100: number;
  movies250: number;
  movies500: number;
  movies1000: number;

  industries: NameCount[];
  languages: NameCount[];
};

type Metric = {
  key: string;
  label: string;
  a: number | null;
  b: number | null;
  format?: "money" | "number" | "percent";
  higherIsBetter?: boolean;
};

function formatCrores(value: number | null) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "Not enough data";
  }

  if (value <= 0) return "₹0.00 Cr";

  return `₹${(value / 10000000).toFixed(2)} Cr;`
}

function formatNumber(value: number | null) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "Not enough data";
  }

  return value.toLocaleString("en-IN");
}

function formatPercent(value: number | null) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
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
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return current;
  }

  return (current ?? 0) + Number(value);
}

function maxValue(
  current: number | null,
  value: number | null
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
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
        `JMI company comparison: ${table}`,
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
  movieIds: number[]
): Promise<T[]> {
  const rows: T[] = [];
  const chunkSize = 100;

  for (
    let i = 0;
    i < movieIds.length;
    i += chunkSize
  ) {
    const chunk = movieIds.slice(i, i + chunkSize);

    const result = await fetchPaged<T>(
      table,
      select,
      (query) => query.in("movie_id", chunk),
      500
    );

    rows.push(...result);
  }

  return rows;
}

function highestBy(
  performances: MoviePerformance[],
  field:
    | "kerala"
    | "karnataka"
    | "tamilNadu"
    | "teluguStates"
    | "overseas"
    | "india"
    | "worldwide"
    | "openingDay"
) {
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
}

async function fetchByIds<T>(
  table: string,
  select: string,
  ids: number[]
): Promise<T[]> {
  const rows: T[] = [];
  const chunkSize = 100;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);

    const result = await fetchPaged<T>(
      table,
      select,
      (query) => query.in("id", chunk),
      500
    );

    rows.push(...result);
  }

  return rows;
}

async function loadCompany(
  companyId: number
): Promise<CompanyStats> {
  const { data: companyData, error: companyError } =
    await supabase
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
        description
      `)
      .eq("id", companyId)
      .single();

  if (companyError) {
    console.error(
      "JMI company comparison: company",
      JSON.stringify(companyError, null, 2)
    );
  }

  const company = (companyData || null) as Company | null;

  let country: Country | null = null;

  if (company?.country_id !== null && company?.country_id !== undefined) {
    const { data: countryData } = await supabase
      .from("countries")
      .select("id, name")
      .eq("id", company.country_id)
      .maybeSingle();

    country = (countryData || null) as Country | null;
  }

  const companyMovies =
    await fetchPaged<CompanyMovie>(
      "movie_companies",
      `
        id,
        movie_id,
        company_id,
        role_id,
        billing_order,
        notes
      `,
      (query) => query.eq("company_id", companyId),
      500
    );

  const movieIds = Array.from(
    new Set(
      companyMovies
        .map((row) => Number(row.movie_id))
        .filter((id) => Number.isFinite(id))
    )
  );

  if (!movieIds.length) {
    return {
      company,
      country,

      movieCount: 0,
      portfolioStart: null,
      portfolioEnd: null,

      roleStats: [],

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
      biggestOpeningMovie: null,

      totalBudget: null,

      hits: 0,
      superHits: 0,
      blockbusters: 0,
      flops: 0,
      disasters: 0,

      hitRatio: null,
      averageGross: null,

      safestRecoverableBudget: null,

      movies50: 0,
      movies100: 0,
      movies250: 0,
      movies500: 0,
      movies1000: 0,

      industries: [],
      languages: [],
    };
  }

  const [
    movies,
    roles,
    business,
    stateBoxOffice,
    overseasBoxOffice,
    dailyBoxOffice,
    movieLanguages,
    movieIndustries,
  ] = await Promise.all([
    fetchByIds<Movie>(
      "movies",
      `
        id,
        title,
        release_year
      `,
      movieIds
    ),

    fetchPaged<CompanyRole>(
      "company_roles",
      `
        id,
        name
      `,
      () => true,
      100
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
        gross_jmi
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

    fetchByMovieIds<MovieLanguage>(
      "movie_languages",
      `
        movie_id,
        language_id,
        is_primary
      `,
      movieIds
    ),

    fetchByMovieIds<MovieIndustry>(
      "movie_industries",
      `
        movie_id,
        industry_id,
        is_primary
      `,
      movieIds
    ),
  ]);

  const languageIds = Array.from(
    new Set(
      movieLanguages
        .map((row) => Number(row.language_id))
        .filter((id) => Number.isFinite(id))
    )
  );

  const industryIds = Array.from(
    new Set(
      movieIndustries
        .map((row) => Number(row.industry_id))
        .filter((id) => Number.isFinite(id))
    )
  );

  const [languages, industries] = await Promise.all([
    languageIds.length
      ? fetchPaged<Language>(
          "languages",
          "id, name",
          (query) => query.in("id", languageIds),
          500
        )
      : Promise.resolve([]),

    industryIds.length
      ? fetchPaged<Industry>(
          "industries",
          "id, name",
          (query) => query.in("id", industryIds),
          500
        )
      : Promise.resolve([]),
  ]);

  const roleMap = new Map<number, string>();

  roles.forEach((role) => {
    roleMap.set(Number(role.id), role.name);
  });

  const movieMap = new Map<number, Movie>();

  movies.forEach((movie) => {
    movieMap.set(Number(movie.id), movie);
  });

  const businessMap = new Map<number, Business>();

  business.forEach((row) => {
    businessMap.set(Number(row.movie_id), row);
  });

  /*
   * Role-wise company portfolio.
   */
  const roleMovieSets = new Map<number, Set<number>>();

  companyMovies.forEach((row) => {
    const roleId = Number(row.role_id);

    if (!roleMovieSets.has(roleId)) {
      roleMovieSets.set(roleId, new Set());
    }

    roleMovieSets.get(roleId)!.add(
      Number(row.movie_id)
    );
  });

  const roleStats: RoleStat[] = Array.from(
    roleMovieSets.entries()
  )
    .map(([roleId, movieSet]) => ({
      roleId,
      roleName:
        roleMap.get(roleId) || `Role ${roleId}`,
      movieCount: movieSet.size,
    }))
    .sort((a, b) => b.movieCount - a.movieCount);

  /*
   * Overseas totals.
   */
  const overseasMap = new Map<number, number>();

  overseasBoxOffice.forEach((row) => {
    const movieId = Number(row.movie_id);

    const gross =
      row.gross_inr !== null &&
      Number.isFinite(Number(row.gross_inr))
        ? Number(row.gross_inr)
        : null;

    if (gross === null) return;

    overseasMap.set(
      movieId,
      (overseasMap.get(movieId) || 0) + gross
    );
  });

  /*
   * Cumulative state-wise India data.
   *
   * Kerala = 12
   * Karnataka = 11
   * Tamil Nadu = 23
   * Andhra Pradesh = 1
   * Telangana = 24
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
      row.gross_jmi !== null &&
      Number.isFinite(Number(row.gross_jmi))
        ? Number(row.gross_jmi)
        : null;

    if (gross === null) return;

    current.india = addValues(
      current.india,
      gross
    );

    if (Number(row.state_id) === 12) {
      current.kerala = addValues(
        current.kerala,
        gross
      );
    }

    if (Number(row.state_id) === 11) {
      current.karnataka = addValues(
        current.karnataka,
        gross
      );
    }

    if (Number(row.state_id) === 23) {
      current.tamilNadu = addValues(
        current.tamilNadu,
        gross
      );
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
   * India opening day.
   * Use India country aggregate only.
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
      row.gross_jmi !== null &&
      Number.isFinite(Number(row.gross_jmi))
        ? Number(row.gross_jmi)
        : null;

    if (gross === null) return;

    const movieId = Number(row.movie_id);

    openingMap.set(
      movieId,
      Math.max(
        openingMap.get(movieId) || 0,
        gross
      )
    );
  });

  const performances: MoviePerformance[] = [];

  movieIds.forEach((movieId) => {
    const movie = movieMap.get(movieId);

    if (!movie) return;

    const state = stateMap.get(movieId);

    const india = state?.india ?? null;
    const overseas =
      overseasMap.get(movieId) ?? null;

    const worldwide =
      india !== null && overseas !== null
        ? india + overseas
        : null;

    const businessRow =
      businessMap.get(movieId);

    performances.push({
      movieId,
      title:
        movie.title || "Untitled Movie",
      year: movie.release_year ?? null,

      india,
      overseas,
      worldwide,

      kerala:
        state?.kerala ?? null,
      karnataka:
        state?.karnataka ?? null,
      tamilNadu:
        state?.tamilNadu ?? null,
      teluguStates:
        state?.teluguStates ?? null,

      openingDay:
        openingMap.get(movieId) ?? null,

      budget:
        businessRow?.production_budget_trade !==
          null &&
        businessRow?.production_budget_trade !==
          undefined &&
        Number.isFinite(
          Number(
            businessRow.production_budget_trade
          )
        )
          ? Number(
              businessRow.production_budget_trade
            )
          : null,

      verdict:
        businessRow?.theatrical_verdict ??
        null,
    });
  });

  const years = performances
    .map((movie) => movie.year)
    .filter(
      (year): year is number =>
        year !== null &&
        Number.isFinite(year)
    );

  const portfolioStart =
    years.length > 0
      ? Math.min(...years)
      : null;

  const portfolioEnd =
    years.length > 0
      ? Math.max(...years)
      : null;

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
  let superHits = 0;
  let blockbusters = 0;
  let flops = 0;
  let disasters = 0;

  const worldwideValues: number[] = [];

  let safestRecoverableBudget:
    | MoviePerformance
    | null = null;

  performances.forEach((movie) => {
    totalIndia = addValues(
      totalIndia,
      movie.india
    );

    totalOverseas = addValues(
      totalOverseas,
      movie.overseas
    );

    totalWorldwide = addValues(
      totalWorldwide,
      movie.worldwide
    );

    totalKerala = addValues(
      totalKerala,
      movie.kerala
    );

    totalKarnataka = addValues(
      totalKarnataka,
      movie.karnataka
    );

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
      worldwideValues.push(
        movie.worldwide
      );
    }

    if (movie.budget !== null) {
      totalBudget = addValues(
        totalBudget,
        movie.budget
      );
    }

    const verdict = normalizeVerdict(
      movie.verdict
    );

    if (verdict === "hit") hits++;
    if (verdict === "super hit") superHits++;

    if (verdict === "blockbuster") {
      blockbusters++;
    }

    if (verdict === "flop") flops++;
    if (verdict === "disaster") disasters++;

    /*
     * Same JMI safest-budget principle used
     * in the Person intelligence engine:
     * highest budget among Hit/Blockbuster movies.
     */
    if (
      movie.budget !== null &&
      (verdict === "hit" ||
        verdict === "blockbuster")
    ) {
      if (
        safestRecoverableBudget === null ||
        movie.budget >
          (safestRecoverableBudget.budget ??
            -Infinity)
      ) {
        safestRecoverableBudget = movie;
      }
    }
  });

  const decidedVerdicts =
    hits +
    superHits +
    blockbusters +
    flops +
    disasters;

  const theatricalHits =
    hits +
    superHits +
    blockbusters;

  const hitRatio =
    decidedVerdicts > 0
      ? (theatricalHits /
          decidedVerdicts) *
        100
      : null;

  const averageGross =
    worldwideValues.length > 0
      ? worldwideValues.reduce(
          (sum, value) => sum + value,
          0
        ) / worldwideValues.length
      : null;

  /*
   * Industry distribution.
   */
  const industryMap = new Map<
    number,
    number
  >();

  movieIndustries.forEach((row) => {
    const id = Number(row.industry_id);

    industryMap.set(
      id,
      (industryMap.get(id) || 0) + 1
    );
  });

  const industryNameMap = new Map<
    number,
    string
  >();

  industries.forEach((industry) => {
    industryNameMap.set(
      Number(industry.id),
      industry.name || `Industry ${industry.id}`
    );
  });

  const industryCounts: NameCount[] =
    Array.from(industryMap.entries())
      .map(([id, count]) => ({
        name:
          industryNameMap.get(id) ||
          `Industry ${id}`,
        count,
      }))
      .sort(
        (a, b) => b.count - a.count
      );

  /*
   * Primary language distribution.
   */
  const languageMap = new Map<
    number,
    number
  >();

  movieLanguages
    .filter(
      (row) => row.is_primary === true
    )
    .forEach((row) => {
      const id = Number(row.language_id);

      languageMap.set(
        id,
        (languageMap.get(id) || 0) + 1
      );
    });

  const languageNameMap = new Map<
    number,
    string
  >();

  languages.forEach((language) => {
    languageNameMap.set(
      Number(language.id),
      language.name || `Language ${language.id}`
    );
  });

  const languageCounts: NameCount[] =
    Array.from(languageMap.entries())
      .map(([id, count]) => ({
        name:
          languageNameMap.get(id) ||
          `Language ${id}`,
        count,
      }))
      .sort(
        (a, b) => b.count - a.count
      );

  const milestone = (
    threshold: number
  ) =>
    performances.filter(
      (movie) =>
        movie.worldwide !== null &&
        movie.worldwide >= threshold
    ).length;

  return {
    company,
    country,

    movieCount: movieIds.length,

    portfolioStart,
    portfolioEnd,

    roleStats,

    totalIndia,
    totalOverseas,
    totalWorldwide,

    totalKerala,
    totalKarnataka,
    totalTamilNadu,
    totalTeluguStates,

    biggestOpeningDay,

    highestKerala: highestBy(
      performances,
      "kerala"
    ),

    highestKarnataka: highestBy(
      performances,
      "karnataka"
    ),

    highestTamilNadu: highestBy(
      performances,
      "tamilNadu"
    ),

    highestTeluguStates: highestBy(
      performances,
      "teluguStates"
    ),

    highestOverseas: highestBy(
      performances,
      "overseas"
    ),

    highestIndia: highestBy(
      performances,
      "india"
    ),

    highestWorldwide: highestBy(
      performances,
      "worldwide"
    ),

    biggestOpeningMovie: highestBy(
      performances,
      "openingDay"
    ),

    totalBudget,

    hits,
    superHits,
    blockbusters,
    flops,
    disasters,

    hitRatio,
    averageGross,

    safestRecoverableBudget,

    movies50: milestone(
      500000000
    ),
    movies100: milestone(
      1000000000
    ),
    movies250: milestone(
      2500000000
    ),
    movies500: milestone(
      5000000000
    ),
    movies1000: milestone(
      10000000000
    ),

    industries: industryCounts,
    languages: languageCounts,
  };
}

function winnerFor(
  a: number | null,
  b: number | null,
  higherIsBetter = true
): "A" | "B" | "TIE" | "NONE" {
  if (
    a === null ||
    b === null ||
    !Number.isFinite(a) ||
    !Number.isFinite(b)
  ) {
    return "NONE";
  }

  if (a === b) return "TIE";

  if (higherIsBetter) {
    return a > b ? "A" : "B";
  }

  return a < b ? "A" : "B";
}

function MetricRow({
  metric,
}: {
  metric: Metric;
}) {
  const winner = winnerFor(
    metric.a,
    metric.b,
    metric.higherIsBetter ?? true
  );

  function display(value: number | null) {
    if (metric.format === "number") {
      return formatNumber(value);
    }

    if (metric.format === "percent") {
      return formatPercent(value);
    }

    return formatCrores(value);
  }

  return (
    <div className="grid grid-cols-[1fr_82px_82px] items-center gap-2 border-b border-zinc-900 py-2.5 last:border-b-0">
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
      <span className="text-[10px]">
        🏆
      </span>

      <span className="text-[8px] uppercase tracking-[0.12em] text-yellow-400">
        {label}
      </span>

      <span className="text-[8px] font-semibold text-zinc-300">
        {winner === "A"
          ? "A"
          : winner === "B"
          ? "B"
          : "Tie"}
      </span>
    </div>
  );
}

function Section({
  title,
  firstName,
  secondName,
  children,
}: {
  title: string;
  firstName?: string;
  secondName?: string;
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

      {firstName && secondName && (
        <div className="mb-2 grid grid-cols-[1fr_82px_82px] gap-2 border-b border-zinc-900 pb-2">
          <div />

          <div className="text-right">
            <p className="line-clamp-1 text-[8px] font-semibold text-violet-300">
              {firstName}
            </p>
            <p className="mt-0.5 text-[7px] uppercase tracking-[0.12em] text-zinc-700">
              Entity A
            </p>
          </div>

          <div className="text-right">
            <p className="line-clamp-1 text-[8px] font-semibold text-violet-300">
              {secondName}
            </p>
            <p className="mt-0.5 text-[7px] uppercase tracking-[0.12em] text-zinc-700">
              Entity B
            </p>
          </div>
        </div>
      )}

      {children}
    </section>
  );
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
  if (
    !movie ||
    movie[field] === null
  ) {
    return (
      <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
        <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
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
      <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 line-clamp-1 text-[10px] font-medium text-zinc-300">
        {movie.title}
      </p>

      <p className="mt-2 text-sm font-semibold text-violet-300">
        {formatCrores(movie[field])}
      </p>

      {movie.year !== null && (
        <p className="mt-1 text-[9px] text-zinc-600">
          {movie.year}
        </p>
      )}
    </div>
  );
}

function ProfileColumn({
  stats,
}: {
  stats: CompanyStats;
}) {
  const company = stats.company;

  return (
    <div className="p-4 text-center">
      <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        {company?.logo ? (
          <img
            src={company.logo}
            alt={company.name || "Company"}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xl text-zinc-700">
            ◉
          </div>
        )}
      </div>

      <p className="text-[12px] font-semibold text-zinc-100">
        {company?.name ||
          "Not enough data"}
      </p>

      {company?.company_type && (
        <p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-violet-400">
          {company.company_type}
        </p>
      )}
    </div>
  );
}

function PortfolioList({
  items,
}: {
  items: NameCount[];
}) {
  if (!items.length) {
    return (
      <p className="text-[10px] text-zinc-600">
        Not enough data
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 8).map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-3"
        >
          <span className="line-clamp-1 text-[9px] text-zinc-400">
            {item.name}
          </span>

          <span className="text-[9px] font-semibold text-zinc-200">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function JmiCompanyComparisonReport({
  first,
  second,
}: {
  first: Entity;
  second: Entity;
}) {
  const [firstStats, setFirstStats] =
    useState<CompanyStats | null>(null);

  const [secondStats, setSecondStats] =
    useState<CompanyStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const [a, b] =
          await Promise.all([
            loadCompany(Number(first.id)),
            loadCompany(Number(second.id)),
          ]);

        if (cancelled) return;

        setFirstStats(a);
        setSecondStats(b);
      } catch (err) {
        console.error(
          "JMI Company Comparison error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load company comparison data."
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

  const score = useMemo(() => {
    if (!firstStats || !secondStats) {
      return {
        a: 0,
        b: 0,
        comparable: 0,
      };
    }

    const metrics: Metric[] = [
      {
        key: "movies",
        label: "Portfolio Size",
        a: firstStats.movieCount,
        b: secondStats.movieCount,
        format: "number",
      },
      {
        key: "worldwide",
        label: "Total Worldwide",
        a: firstStats.totalWorldwide,
        b: secondStats.totalWorldwide,
      },
      {
        key: "india",
        label: "Total India",
        a: firstStats.totalIndia,
        b: secondStats.totalIndia,
      },
      {
        key: "overseas",
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
        key: "telugu",
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
        key: "average",
        label: "Average Movie Gross",
        a: firstStats.averageGross,
        b: secondStats.averageGross,
      },
      {
        key: "50",
        label: "50 Cr+ Movies",
        a: firstStats.movies50,
        b: secondStats.movies50,
        format: "number",
      },
      {
        key: "100",
        label: "100 Cr+ Movies",
        a: firstStats.movies100,
        b: secondStats.movies100,
        format: "number",
      },
      {
        key: "250",
        label: "250 Cr+ Movies",
        a: firstStats.movies250,
        b: secondStats.movies250,
        format: "number",
      },
      {
        key: "500",
        label: "500 Cr+ Movies",
        a: firstStats.movies500,
        b: secondStats.movies500,
        format: "number",
      },
      {
        key: "1000",
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
      }

      if (winner === "B") {
        b++;
        comparable++;
      }

      if (winner === "TIE") {
        comparable++;
      }
    });

    return {
      a,
      b,
      comparable,
    };
  }, [firstStats, secondStats]);

  if (loading) {
    return (
      <div className="rounded-xl border border-violet-400/20 bg-zinc-950 p-8 text-center">
        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-400" />

        <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-violet-400">
          JMI Company Intelligence
        </p>

        <p className="mt-2 text-[10px] text-zinc-600">
          Building company comparison report...
        </p>
      </div>
    );
  }

  if (
    error ||
    !firstStats ||
    !secondStats
  ) {
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

  const nameA =
    firstStats.company?.name ||
    first.title ||
    "Company A";

  const nameB =
    secondStats.company?.name ||
    second.title ||
    "Company B";

  const finalWinner =
    score.comparable === 0
      ? "NONE"
      : score.a === score.b
      ? "TIE"
      : score.a > score.b
      ? "A"
      : "B";

  const careerSpan = (
    stats: CompanyStats
  ) => {
    if (
      stats.portfolioStart === null ||
      stats.portfolioEnd === null
    ) {
      return "Not enough data";
    }

    return `${Math.max(
      0,
      stats.portfolioEnd -
        stats.portfolioStart
    )} years (${stats.portfolioStart}–${stats.portfolioEnd})`;
  };

  const roleMetrics = [
    {
      label: "Production Company",
      id: 1,
    },
    {
      label: "Studio",
      id: 2,
    },
    {
      label: "Presenter",
      id: 3,
    },
    {
      label: "Distributor",
      id: 4,
    },
    {
      label: "Worldwide Distributor",
      id: 5,
    },
    {
      label: "India Distributor",
      id: 6,
    },
    {
      label: "Overseas Distributor",
      id: 7,
    },
    {
      label: "Streaming Platform",
      id: 8,
    },
    {
      label: "Satellite Partner",
      id: 9,
    },
    {
      label: "Music Label",
      id: 10,
    },
    {
      label: "VFX Company",
      id: 11,
    },
    {
      label: "Animation Studio",
      id: 12,
    },
    {
      label: "DI Studio",
      id: 13,
    },
    {
      label: "Sound Studio",
      id: 14,
    },
    {
      label: "Marketing Agency",
      id: 15,
    },
    {
      label: "PR Agency",
      id: 16,
    },
    {
      label: "Financier",
      id: 17,
    },
    {
      label: "Line Producer",
      id: 18,
    },
    {
      label: "Production Services",
      id: 19,
    },
    {
      label: "Digital Partner",
      id: 20,
    },
  ];

  function roleCount(
    stats: CompanyStats,
    roleId: number
  ) {
    return (
      stats.roleStats.find(
        (role) =>
          role.roleId === roleId
      )?.movieCount ?? 0
    );
  }

  const roleCountsA =
    roleMetrics.filter(
      (role) =>
        roleCount(firstStats, role.id) > 0
    );

  const roleCountsB =
    roleMetrics.filter(
      (role) =>
        roleCount(secondStats, role.id) > 0
    );

  const allRoles = Array.from(
    new Map(
      [...roleCountsA, ...roleCountsB].map(
        (role) => [role.id, role]
      )
    ).values()
  );

  const businessMetrics: Metric[] = [
    {
      key: "budget",
      label: "Total Portfolio Budget",
      a: firstStats.totalBudget,
      b: secondStats.totalBudget,
    },
    {
      key: "hits",
      label: "Theatrical Hits",
      a:
        firstStats.hits +
        firstStats.superHits +
        firstStats.blockbusters,
      b:
        secondStats.hits +
        secondStats.superHits +
        secondStats.blockbusters,
      format: "number",
    },
    {
      key: "superHits",
      label: "Super Hits",
      a: firstStats.superHits,
      b: secondStats.superHits,
      format: "number",
    },
    {
      key: "blockbusters",
      label: "Blockbusters",
      a: firstStats.blockbusters,
      b: secondStats.blockbusters,
      format: "number",
    },
    {
      key: "flops",
      label: "Flops",
      a: firstStats.flops,
      b: secondStats.flops,
      format: "number",
      higherIsBetter: false,
    },
    {
      key: "disasters",
      label: "Disasters",
      a: firstStats.disasters,
      b: secondStats.disasters,
      format: "number",
      higherIsBetter: false,
    },
    {
      key: "hitRatio",
      label: "Hit Ratio",
      a: firstStats.hitRatio,
      b: secondStats.hitRatio,
      format: "percent",
    },
    {
      key: "average",
      label: "Average Movie Gross",
      a: firstStats.averageGross,
      b: secondStats.averageGross,
    },
    {
      key: "safeBudget",
      label: "Safest Recoverable Budget",
      a:
        firstStats
          .safestRecoverableBudget
          ?.budget ?? null,
      b:
        secondStats
          .safestRecoverableBudget
          ?.budget ?? null,
    },
  ];

  return (
    <div className="space-y-5">

      {/* HEADER */}

      <div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-violet-400">
          JMI Company Intelligence
        </p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">
          Company vs Company
        </h2>

        <p className="mt-1 text-[10px] leading-5 text-zinc-500">
          A data-driven comparison of company
          profile, portfolio reach, roles,
          box office performance, markets,
          business strength and milestones.
        </p>
      </div>

      {/* COMPANY PROFILE */}

      <section className="overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/10">
        <div className="grid grid-cols-2 divide-x divide-zinc-800">
          <ProfileColumn stats={firstStats} />
          <ProfileColumn stats={secondStats} />
        </div>

        <div className="border-t border-zinc-900">
          <div className="grid grid-cols-[1fr_1fr] divide-x divide-zinc-900">

            <div className="p-3 text-center">
              <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                Company Type
              </p>

              <p className="mt-1 text-[10px] text-zinc-300">
                {firstStats.company?.company_type ||
                  "Not enough data"}
              </p>
            </div>

            <div className="p-3 text-center">
              <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                Company Type
              </p>

              <p className="mt-1 text-[10px] text-zinc-300">
                {secondStats.company?.company_type ||
                  "Not enough data"}
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 divide-x divide-zinc-900 border-t border-zinc-900">

            <div className="p-3 text-center">
              <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                Founded
              </p>

              <p className="mt-1 text-[10px] text-zinc-300">
                {firstStats.company?.founded_year ??
                  "Not enough data"}
              </p>
            </div>

            <div className="p-3 text-center">
              <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                Founded
              </p>

              <p className="mt-1 text-[10px] text-zinc-300">
                {secondStats.company?.founded_year ??
                  "Not enough data"}
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 divide-x divide-zinc-900 border-t border-zinc-900">

            <div className="p-3 text-center">
              <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                Country
              </p>

              <p className="mt-1 text-[10px] text-zinc-300">
                {firstStats.country?.name ||
                  "Not enough data"}
              </p>
            </div>

            <div className="p-3 text-center">
              <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                Country
              </p>

              <p className="mt-1 text-[10px] text-zinc-300">
                {secondStats.country?.name ||
                  "Not enough data"}
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 divide-x divide-zinc-900 border-t border-zinc-900">

            <div className="p-3 text-center">
              <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                Headquarters
              </p>

              <p className="mt-1 text-[10px] text-zinc-300">
                {firstStats.company?.headquarters ||
                  "Not enough data"}
              </p>
            </div>

            <div className="p-3 text-center">
              <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                Headquarters
              </p>

              <p className="mt-1 text-[10px] text-zinc-300">
                {secondStats.company?.headquarters ||
                  "Not enough data"}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* COLUMN LABEL */}

      

      {/* PORTFOLIO */}

      <Section
  title="Portfolio Intelligence"
  firstName={nameA}
  secondName={nameB}
>

        <MetricRow
          metric={{
            key: "movies",
            label: "Total Movies",
            a: firstStats.movieCount,
            b: secondStats.movieCount,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "span",
            label: "Portfolio Span",
            a:
              firstStats.portfolioStart !== null &&
              firstStats.portfolioEnd !== null
                ? firstStats.portfolioEnd -
                  firstStats.portfolioStart
                : null,
            b:
              secondStats.portfolioStart !== null &&
              secondStats.portfolioEnd !== null
                ? secondStats.portfolioEnd -
                  secondStats.portfolioStart
                : null,
            format: "number",
          }}
        />

        <div className="mt-3 grid grid-cols-2 gap-3">

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Active Portfolio Span
            </p>

            <p className="mt-2 text-[10px] text-zinc-300">
              {careerSpan(firstStats)}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Active Portfolio Span
            </p>

            <p className="mt-2 text-[10px] text-zinc-300">
              {careerSpan(secondStats)}
            </p>
          </div>

        </div>
      </Section>

      {/* COMPANY ROLES */}

      <Section
  title="Company Role Reach"
  firstName={nameA}
  secondName={nameB}
>

        {allRoles.length === 0 ? (
          <p className="text-[10px] text-zinc-600">
            Not enough data
          </p>
        ) : (
          <div className="space-y-1">
            {allRoles.map((role) => (
              <MetricRow
                key={role.id}
                metric={{
                  key: `role-${role.id}`,
                  label: role.label,
                  a: roleCount(
                    firstStats,
                    role.id
                  ),
                  b: roleCount(
                    secondStats,
                    role.id
                  ),
                  format: "number",
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {firstStats.roleStats
            .slice(0, 5)
            .map((role) => (
              <div
                key={`a-${role.roleId}`}
                className="rounded-md border border-violet-500/10 bg-violet-500/5 px-2 py-1"
              >
                <span className="text-[8px] text-violet-300">
                  {role.roleName} ·{" "}
                  {role.movieCount}
                </span>
              </div>
            ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {secondStats.roleStats
            .slice(0, 5)
            .map((role) => (
              <div
                key={`b-${role.roleId}`}
                className="rounded-md border border-violet-500/10 bg-violet-500/5 px-2 py-1"
              >
                <span className="text-[8px] text-violet-300">
                  {role.roleName} ·{" "}
                  {role.movieCount}
                </span>
              </div>
            ))}
        </div>
      </Section>

      {/* BOX OFFICE */}

      <Section
  title="JMI Box Office Performance"
  firstName={nameA}
  secondName={nameB}
>

        <MetricRow
          metric={{
            key: "worldwide",
            label: "Total Worldwide",
            a: firstStats.totalWorldwide,
            b: secondStats.totalWorldwide,
          }}
        />

        <MetricRow
          metric={{
            key: "india",
            label: "Total India",
            a: firstStats.totalIndia,
            b: secondStats.totalIndia,
          }}
        />

        <MetricRow
          metric={{
            key: "overseas",
            label: "Total Overseas",
            a: firstStats.totalOverseas,
            b: secondStats.totalOverseas,
          }}
        />

        <MetricRow
          metric={{
            key: "opening",
            label: "Biggest Opening Day",
            a: firstStats.biggestOpeningDay,
            b: secondStats.biggestOpeningDay,
          }}
        />
      </Section>

      {/* REGIONAL */}

      <Section
  title="Regional Market Reach"
  firstName={nameA}
  secondName={nameB}
>

        <MetricRow
          metric={{
            key: "kerala",
            label: "Total Kerala",
            a: firstStats.totalKerala,
            b: secondStats.totalKerala,
          }}
        />

        <MetricRow
          metric={{
            key: "karnataka",
            label: "Total Karnataka",
            a: firstStats.totalKarnataka,
            b: secondStats.totalKarnataka,
          }}
        />

        <MetricRow
          metric={{
            key: "tamilnadu",
            label: "Total Tamil Nadu",
            a: firstStats.totalTamilNadu,
            b: secondStats.totalTamilNadu,
          }}
        />

        <MetricRow
          metric={{
            key: "telugu",
            label: "Total Telugu States",
            a: firstStats.totalTeluguStates,
            b: secondStats.totalTeluguStates,
          }}
        />
      </Section>

      {/* RECORDS */}

      <Section
  title="Company Box Office Records"
  firstName={nameA}
  secondName={nameB}
>

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
            movie={firstStats.biggestOpeningMovie}
            field="openingDay"
          />

          <RecordCard
            label="Biggest Opening Day"
            movie={secondStats.biggestOpeningMovie}
            field="openingDay"
          />

        </div>
      </Section>

      {/* BUSINESS */}

      <Section
  title="Business & Theatrical Performance"
  firstName={nameA}
  secondName={nameB}
>

        {businessMetrics.map(
          (metric) => (
            <MetricRow
              key={metric.key}
              metric={metric}
            />
          )
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Safest Recoverable Budget
            </p>

            <p className="mt-2 text-sm font-semibold text-violet-300">
              {formatCrores(
                firstStats
                  .safestRecoverableBudget
                  ?.budget ?? null
              )}
            </p>

            {firstStats.safestRecoverableBudget && (
              <p className="mt-1 line-clamp-1 text-[9px] text-zinc-600">
                {
                  firstStats
                    .safestRecoverableBudget
                    .title
                }
              </p>
            )}
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Safest Recoverable Budget
            </p>

            <p className="mt-2 text-sm font-semibold text-violet-300">
              {formatCrores(
                secondStats
                  .safestRecoverableBudget
                  ?.budget ?? null
              )}
            </p>

            {secondStats.safestRecoverableBudget && (
              <p className="mt-1 line-clamp-1 text-[9px] text-zinc-600">
                {
                  secondStats
                    .safestRecoverableBudget
                    .title
                }
              </p>
            )}
          </div>

        </div>
      </Section>

      {/* INDUSTRY & LANGUAGE */}

      <Section
  title="Industry & Language Reach"
  firstName={nameA}
  secondName={nameB}
>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className="mb-3 text-[8px] uppercase tracking-[0.14em] text-violet-400">
              {nameA}
            </p>

            <p className="mb-2 text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Industries
            </p>

            <PortfolioList
              items={firstStats.industries}
            />

            <p className="mb-2 mt-4 text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Primary Languages
            </p>

            <PortfolioList
              items={firstStats.languages}
            />
          </div>

          <div>
            <p className="mb-3 text-[8px] uppercase tracking-[0.14em] text-violet-400">
              {nameB}
            </p>

            <p className="mb-2 text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Industries
            </p>

            <PortfolioList
              items={secondStats.industries}
            />

            <p className="mb-2 mt-4 text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Primary Languages
            </p>

            <PortfolioList
              items={secondStats.languages}
            />
          </div>

        </div>
      </Section>

      {/* MILESTONES */}

      <Section
  title="Worldwide Portfolio Milestones"
  firstName={nameA}
  secondName={nameB}
>

        <MetricRow
          metric={{
            key: "50",
            label: "50 Cr+ Worldwide Movies",
            a: firstStats.movies50,
            b: secondStats.movies50,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "100",
            label: "100 Cr+ Worldwide Movies",
            a: firstStats.movies100,
            b: secondStats.movies100,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "250",
            label: "250 Cr+ Worldwide Movies",
            a: firstStats.movies250,
            b: secondStats.movies250,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "500",
            label: "500 Cr+ Worldwide Movies",
            a: firstStats.movies500,
            b: secondStats.movies500,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "1000",
            label: "1000 Cr+ Worldwide Movies",
            a: firstStats.movies1000,
            b: secondStats.movies1000,
            format: "number",
          }}
        />
      </Section>

      {/* CATEGORY TROPHIES */}

      <Section
  title="JMI Category Champions"
  firstName={nameA}
  secondName={nameB}
>

        <div className="flex flex-wrap gap-2">

          <Trophy
            label="Portfolio"
            winner={winnerFor(
              firstStats.movieCount,
              secondStats.movieCount
            )}
          />

          <Trophy
            label="Worldwide"
            winner={winnerFor(
              firstStats.totalWorldwide,
              secondStats.totalWorldwide
            )}
          />

          <Trophy
            label="India"
            winner={winnerFor(
              firstStats.totalIndia,
              secondStats.totalIndia
            )}
          />

          <Trophy
            label="Overseas"
            winner={winnerFor(
              firstStats.totalOverseas,
              secondStats.totalOverseas
            )}
          />

          <Trophy
            label="Opening Day"
            winner={winnerFor(
              firstStats.biggestOpeningDay,
              secondStats.biggestOpeningDay
            )}
          />

          <Trophy
            label="Kerala"
            winner={winnerFor(
              firstStats.totalKerala,
              secondStats.totalKerala
            )}
          />

          <Trophy
            label="Karnataka"
            winner={winnerFor(
              firstStats.totalKarnataka,
              secondStats.totalKarnataka
            )}
          />

          <Trophy
            label="Tamil Nadu"
            winner={winnerFor(
              firstStats.totalTamilNadu,
              secondStats.totalTamilNadu
            )}
          />

          <Trophy
            label="Telugu States"
            winner={winnerFor(
              firstStats.totalTeluguStates,
              secondStats.totalTeluguStates
            )}
          />

          <Trophy
            label="Hit Ratio"
            winner={winnerFor(
              firstStats.hitRatio,
              secondStats.hitRatio
            )}
          />

          <Trophy
            label="Average Gross"
            winner={winnerFor(
              firstStats.averageGross,
              secondStats.averageGross
            )}
          />

          <Trophy
            label="50 Cr+ Portfolio"
            winner={winnerFor(
              firstStats.movies50,
              secondStats.movies50
            )}
          />

          <Trophy
            label="100 Cr+ Portfolio"
            winner={winnerFor(
              firstStats.movies100,
              secondStats.movies100
            )}
          />

          <Trophy
            label="250 Cr+ Portfolio"
            winner={winnerFor(
              firstStats.movies250,
              secondStats.movies250
            )}
          />

          <Trophy
            label="500 Cr+ Portfolio"
            winner={winnerFor(
              firstStats.movies500,
              secondStats.movies500
            )}
          />

          <Trophy
            label="1000 Cr+ Portfolio"
            winner={winnerFor(
              firstStats.movies1000,
              secondStats.movies1000
            )}
          />

        </div>
      </Section>

      {/* FINAL CHAMPIONSHIP */}

      <section className="overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-zinc-950 to-violet-500/5">

        <div className="border-b border-yellow-500/10 px-4 py-3">

          <p className="text-[9px] uppercase tracking-[0.22em] text-yellow-400">
            JMI Championship
          </p>

          <h3 className="mt-1 text-sm font-semibold text-zinc-100">
            Final Company Comparison
          </h3>

          <p className="mt-1 text-[9px] leading-4 text-zinc-600">
            Performance points are awarded only
            where both companies have comparable
            JMI data. Missing data does not count
            against either company.
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
              <div className="mb-2 text-2xl">
                🏆
              </div>
            )}

            <p className="text-[11px] font-semibold text-zinc-200">
              {nameA}
            </p>

            <p className="mt-2 text-2xl font-bold text-violet-300">
              {score.a}
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
              <div className="mb-2 text-2xl">
                🏆
              </div>
            )}

            <p className="text-[11px] font-semibold text-zinc-200">
              {nameB}
            </p>

            <p className="mt-2 text-2xl font-bold text-violet-300">
              {score.b}
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
                JMI Company Winner
              </p>

              <p className="mt-1 text-base font-semibold text-zinc-100">
                {nameA}
              </p>
            </>
          )}

          {finalWinner === "B" && (
            <>
              <p className="text-[9px] uppercase tracking-[0.2em] text-yellow-400">
                JMI Company Winner
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
            {score.comparable} comparable
            performance metrics evaluated
          </p>

        </div>
      </section>

      {/* METHODOLOGY */}

      <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">

        <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-600">
          JMI Methodology
        </p>

        <p className="mt-2 text-[9px] leading-5 text-zinc-600">
          Company portfolio metrics are derived
          from the existing movie-company
          relationships. Box office figures use
          JMI trade data. Company roles are based
          on the existing company role master.
          India totals use cumulative state-wise
          JMI data, while opening-day performance
          uses the India country-level daily record
          where available. Primary-language reach
          uses the primary movie language. Missing
          information is displayed as Not enough
          data rather than being converted to zero.
        </p>

      </div>
    </div>
  );
}