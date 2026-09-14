"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Entity = {
  id: number;
  title: string;
  subtitle?: string;
  image?: string | null;
};

type Industry = {
  id: number;
  name: string | null;
  slug?: string | null;
};

type Movie = {
  id: number;
  title: string | null;
  release_year: number | null;
};

type MovieIndustry = {
  movie_id: number;
  industry_id: number;
  is_primary: boolean | null;
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

type MoviePeople = {
  movie_id: number;
  person_id: number;
  role_id: number;
  credit_type_id: number | null;
};

type Person = {
  id: number;
  full_name: string | null;
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
  budget: number | null;
  verdict: string | null;
};

type ActorContribution = {
  personId: number;
  name: string;
  worldwide: number;
  movieCount: number;
};

type ActorHitCount = {
  personId: number;
  name: string;
  count: number;
};

type YearPerformance = {
  year: number;
  movieCount: number;
  worldwide: number | null;
  growth: number | null;
};

type IndustryStats = {
  industry: Industry | null;

  movieCount: number;

  totalWorldwide: number | null;
  totalIndia: number | null;
  totalOverseas: number | null;

  totalHits: number;
  totalBlockbusters: number;
  totalFlops: number;
  totalDisasters: number;

  averageGross: number | null;

  topActors: ActorContribution[];
  topHitActors: ActorHitCount[];

  yearWise: YearPerformance[];

  averageMoviesPerYear: number | null;
  totalYears: number;

  highestWorldwide: MoviePerformance | null;
  highestIndia: MoviePerformance | null;
  highestOverseas: MoviePerformance | null;
  highestTamilNadu: MoviePerformance | null;
  highestKarnataka: MoviePerformance | null;
  highestKerala: MoviePerformance | null;
  highestTeluguStates: MoviePerformance | null;
  highestBudget: MoviePerformance | null;

  movies50: number;
  movies100: number;
  movies250: number;
  movies500: number;
  movies1000: number;
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
    !Number.isFinite(Number(value))
  ) {
    return "Not enough data";
  }

  return `₹${(Number(value) / 10000000).toFixed(2)} Cr;`
}

function formatNumber(value: number | null) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "Not enough data";
  }

  return Number(value).toLocaleString("en-IN");
}

function formatPercent(value: number | null) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "Not enough data";
  }

  return `${Number(value).toFixed(1)}%;`
}

function normalizeVerdict(value: string | null) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function addValue(
  current: number | null,
  value: number | null
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return current;
  }

  return (current ?? 0) + Number(value);
}

function highestBy(
  movies: MoviePerformance[],
  field:
    | "worldwide"
    | "india"
    | "overseas"
    | "tamilNadu"
    | "karnataka"
    | "kerala"
    | "teluguStates"
) {
  const available = movies.filter(
    (movie) =>
      movie[field] !== null &&
      Number.isFinite(Number(movie[field]))
  );

  if (!available.length) {
    return null;
  }

  return available.reduce((best, movie) =>
    Number(movie[field]) >
    Number(best[field])
      ? movie
      : best
  );
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
      .range(
        from,
        from + pageSize - 1
      );

    query = filters(query);

    const { data, error } =
      await query;

    if (error) {
      console.error(
        `JMI industry comparison: ${table}`,
        JSON.stringify(error, null, 2)
      );
      break;
    }

    const page =
      (data || []) as T[];

    rows.push(...page);

    if (page.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}

async function fetchByIds<T>(
  table: string,
  select: string,
  ids: number[]
): Promise<T[]> {
  const rows: T[] = [];
  const chunkSize = 100;

  for (
    let i = 0;
    i < ids.length;
    i += chunkSize
  ) {
    const chunk = ids.slice(
      i,
      i + chunkSize
    );

    const result =
      await fetchPaged<T>(
        table,
        select,
        (query) =>
          query.in("id", chunk),
        500
      );

    rows.push(...result);
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
    const chunk = movieIds.slice(
      i,
      i + chunkSize
    );

    const result =
      await fetchPaged<T>(
        table,
        select,
        (query) =>
          query.in("movie_id", chunk),
        500
      );

    rows.push(...result);
  }

  return rows;
}

async function loadIndustry(
  industryId: number
): Promise<IndustryStats> {
  const { data: industryData, error } =
    await supabase
      .from("industries")
      .select(`
        id,
        name,
        slug
      `)
      .eq("id", industryId)
      .maybeSingle();

  if (error) {
    console.error(
      "JMI industry comparison: industry",
      JSON.stringify(error, null, 2)
    );
  }

  const industry =
    (industryData ||
      null) as Industry | null;

  /*
   * Industry membership is based on
   * movie_industries membership.
   *
   * is_primary is deliberately NOT used
   * to exclude multi-industry movies.
   */
  const industryMovies =
    await fetchPaged<MovieIndustry>(
      "movie_industries",
      `
        movie_id,
        industry_id,
        is_primary
      `,
      (query) =>
        query.eq(
          "industry_id",
          industryId
        ),
      500
    );

  const movieIds =
    Array.from(
      new Set(
        industryMovies
          .map((row) =>
            Number(row.movie_id)
          )
          .filter((id) =>
            Number.isFinite(id)
          )
      )
    );

  if (!movieIds.length) {
    return {
      industry,
      movieCount: 0,

      totalWorldwide: null,
      totalIndia: null,
      totalOverseas: null,

      totalHits: 0,
      totalBlockbusters: 0,
      totalFlops: 0,
      totalDisasters: 0,

      averageGross: null,

      topActors: [],
      topHitActors: [],

      yearWise: [],

      averageMoviesPerYear: null,
      totalYears: 0,

      highestWorldwide: null,
      highestIndia: null,
      highestOverseas: null,
      highestTamilNadu: null,
      highestKarnataka: null,
      highestKerala: null,
      highestTeluguStates: null,
      highestBudget: null,

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
    moviePeople,
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

    fetchByMovieIds<MoviePeople>(
      "movie_people",
      `
        movie_id,
        person_id,
        role_id,
        credit_type_id
      `,
      movieIds
    ),
  ]);

  /*
   * People are loaded only for actual lead
   * actor relationships:
   *
   * role_id = 1 → Actor
   * credit_type_id = 1 → Lead Role
   * credit_type_id = 2 → Lead Actress
   */
  const leadPersonIds =
    Array.from(
      new Set(
        moviePeople
          .filter(
            (row) =>
              Number(row.role_id) === 1 &&
              (
                Number(
                  row.credit_type_id
                ) === 1 ||
                Number(
                  row.credit_type_id
                ) === 2
              )
          )
          .map((row) =>
            Number(row.person_id)
          )
          .filter((id) =>
            Number.isFinite(id)
          )
      )
    );

  const people =
    leadPersonIds.length
      ? await fetchByIds<Person>(
          "people",
          `
            id,
            full_name
          `,
          leadPersonIds
        )
      : [];

  const movieMap =
    new Map<number, Movie>();

  movies.forEach((movie) => {
    movieMap.set(
      Number(movie.id),
      movie
    );
  });

  const businessMap =
    new Map<number, Business>();

  business.forEach((row) => {
    businessMap.set(
      Number(row.movie_id),
      row
    );
  });

  /*
   * INDIA + REGIONAL BOX OFFICE
   *
   * Kerala = 12
   * Karnataka = 11
   * Tamil Nadu = 23
   * Andhra Pradesh = 1
   * Telangana = 24
   */
  const stateMap =
    new Map<
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
    const movieId =
      Number(row.movie_id);

    if (!stateMap.has(movieId)) {
      stateMap.set(movieId, {
        india: null,
        kerala: null,
        karnataka: null,
        tamilNadu: null,
        teluguStates: null,
      });
    }

    const state =
      stateMap.get(movieId)!;

    const gross =
      row.gross_jmi !== null &&
      Number.isFinite(
        Number(row.gross_jmi)
      )
        ? Number(row.gross_jmi)
        : null;

    if (gross === null) return;

    /*
     * Existing JMI state-wise
     * cumulative methodology.
     */
    state.india = addValue(
      state.india,
      gross
    );

    if (Number(row.state_id) === 12) {
      state.kerala = addValue(
        state.kerala,
        gross
      );
    }

    if (Number(row.state_id) === 11) {
      state.karnataka = addValue(
        state.karnataka,
        gross
      );
    }

    if (Number(row.state_id) === 23) {
      state.tamilNadu = addValue(
        state.tamilNadu,
        gross
      );
    }

    if (
      Number(row.state_id) === 1 ||
      Number(row.state_id) === 24
    ) {
      state.teluguStates =
        addValue(
          state.teluguStates,
          gross
        );
    }
  });

  /*
   * OVERSEAS
   */
  const overseasMap =
    new Map<number, number>();

  overseasBoxOffice.forEach((row) => {
    const gross =
      row.gross_inr !== null &&
      Number.isFinite(
        Number(row.gross_inr)
      )
        ? Number(row.gross_inr)
        : null;

    if (gross === null) return;

    const movieId =
      Number(row.movie_id);

    overseasMap.set(
      movieId,
      (overseasMap.get(movieId) || 0) +
        gross
    );
  });

  /*
   * Build movie-level intelligence.
   */
  const performances: MoviePerformance[] =
    [];

  movieIds.forEach((movieId) => {
    const movie =
      movieMap.get(movieId);

    if (!movie) return;

    const state =
      stateMap.get(movieId);

    const india =
      state?.india ?? null;

    const overseas =
      overseasMap.get(movieId) ??
      null;

    const worldwide =
      india !== null &&
      overseas !== null
        ? india + overseas
        : null;

    const businessRow =
      businessMap.get(movieId);

    const budget =
      businessRow
        ?.production_budget_trade !==
        null &&
      businessRow
        ?.production_budget_trade !==
        undefined &&
      Number.isFinite(
        Number(
          businessRow.production_budget_trade
        )
      )
        ? Number(
            businessRow.production_budget_trade
          )
        : null;

    performances.push({
      movieId,
      title:
        movie.title ||
        "Untitled Movie",
      year:
        movie.release_year ??
        null,

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

      budget,

      verdict:
        businessRow
          ?.theatrical_verdict ??
        null,
    });
  });

  /*
   * Overall collection totals.
   */
  let totalIndia: number | null =
    null;

  let totalOverseas: number | null =
    null;

  let totalWorldwide: number | null =
    null;

  const worldwideValues: number[] =
    [];

  performances.forEach((movie) => {
    totalIndia = addValue(
      totalIndia,
      movie.india
    );

    totalOverseas = addValue(
      totalOverseas,
      movie.overseas
    );

    totalWorldwide = addValue(
      totalWorldwide,
      movie.worldwide
    );

    if (movie.worldwide !== null) {
      worldwideValues.push(
        movie.worldwide
      );
    }
  });

  /*
   * Verdict intelligence.
   */
  let totalHits = 0;
  let totalBlockbusters = 0;
  let totalFlops = 0;
  let totalDisasters = 0;

  performances.forEach((movie) => {
    const verdict =
      normalizeVerdict(
        movie.verdict
      );

    if (verdict === "hit") {
      totalHits++;
    }

    if (verdict === "blockbuster") {
      totalBlockbusters++;
    }

    if (verdict === "flop") {
      totalFlops++;
    }

    if (verdict === "disaster") {
      totalDisasters++;
    }
  });

  const averageGross =
    worldwideValues.length > 0
      ? worldwideValues.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        worldwideValues.length
      : null;

  /*
   * YEAR-WISE INTELLIGENCE
   *
   * We first calculate every represented
   * year, then take the latest five years.
   */
  const yearMap =
    new Map<
      number,
      {
        movieCount: number;
        worldwide: number | null;
      }
    >();

  performances.forEach((movie) => {
    if (movie.year === null) return;

    if (!yearMap.has(movie.year)) {
      yearMap.set(movie.year, {
        movieCount: 0,
        worldwide: null,
      });
    }

    const year =
      yearMap.get(movie.year)!;

    year.movieCount++;

    year.worldwide = addValue(
      year.worldwide,
      movie.worldwide
    );
  });

  const sortedYears =
    Array.from(yearMap.keys())
      .sort((a, b) => b - a);

  const recentYears =
    sortedYears.slice(0, 5)
      .sort((a, b) => a - b);

  const yearWise: YearPerformance[] =
    recentYears.map(
      (year, index) => {
        const current =
          yearMap.get(year)!;

        let growth: number | null =
          null;

        if (index > 0) {
          const previousYear =
            recentYears[index - 1];

          const previous =
            yearMap.get(
              previousYear
            );

          if (
            previous &&
            previous.worldwide !== null &&
            current.worldwide !== null &&
            previous.worldwide !== 0
          ) {
            growth =
              ((current.worldwide -
                previous.worldwide) /
                previous.worldwide) *
              100;
          }
        }

        return {
          year,
          movieCount:
            current.movieCount,
          worldwide:
            current.worldwide,
          growth,
        };
      }
    );

  const totalYears =
    sortedYears.length;

  const averageMoviesPerYear =
    totalYears > 0
      ? movieIds.length /
        totalYears
      : null;

  /*
   * LEAD ACTOR CONTRIBUTION
   *
   * Each actor gets the worldwide
   * collection of every industry movie
   * where they are a lead actor/actress.
   *
   * A movie is counted once per actor.
   */
  const personMap =
    new Map<number, string>();

  people.forEach((person) => {
    personMap.set(
      Number(person.id),
      person.full_name ||
        "Unknown Actor"
    );
  });

  const actorMovieSets =
    new Map<
      number,
      Set<number>
    >();

  moviePeople
    .filter(
      (row) =>
        Number(row.role_id) === 1 &&
        (
          Number(
            row.credit_type_id
          ) === 1 ||
          Number(
            row.credit_type_id
          ) === 2
        )
    )
    .forEach((row) => {
      const personId =
        Number(row.person_id);

      const movieId =
        Number(row.movie_id);

      if (
        !actorMovieSets.has(
          personId
        )
      ) {
        actorMovieSets.set(
          personId,
          new Set()
        );
      }

      actorMovieSets
        .get(personId)!
        .add(movieId);
    });

  const topActors: ActorContribution[] =
    Array.from(
      actorMovieSets.entries()
    )
      .map(
        ([personId, movieSet]) => {
          let worldwide = 0;
          let hasWorldwide = false;

          movieSet.forEach(
            (movieId) => {
              const movie =
                performances.find(
                  (item) =>
                    item.movieId ===
                    movieId
                );

              if (
                movie &&
                movie.worldwide !== null
              ) {
                worldwide +=
                  movie.worldwide;

                hasWorldwide = true;
              }
            }
          );

          return {
            personId,
            name:
              personMap.get(
                personId
              ) ||
              "Unknown Actor",
            worldwide:
              hasWorldwide
                ? worldwide
                : 0,
            movieCount:
              movieSet.size,
          };
        }
      )
      .filter(
        (actor) =>
          actor.worldwide > 0
      )
      .sort(
        (a, b) =>
          b.worldwide -
          a.worldwide
      )
      .slice(0, 5);

  /*
   * TOP ACTORS BY HIT/BLOCKBUSTER COUNT
   */
  const actorHitMovieSets =
    new Map<
      number,
      Set<number>
    >();

  moviePeople
    .filter(
      (row) =>
        Number(row.role_id) === 1 &&
        (
          Number(
            row.credit_type_id
          ) === 1 ||
          Number(
            row.credit_type_id
          ) === 2
        )
    )
    .forEach((row) => {
      const businessRow =
        businessMap.get(
          Number(row.movie_id)
        );

      const verdict =
        normalizeVerdict(
          businessRow
            ?.theatrical_verdict ??
            null
        );

      if (
        verdict !== "hit" &&
        verdict !== "blockbuster"
      ) {
        return;
      }

      const personId =
        Number(row.person_id);

      const movieId =
        Number(row.movie_id);

      if (
        !actorHitMovieSets.has(
          personId
        )
      ) {
        actorHitMovieSets.set(
          personId,
          new Set()
        );
      }

      actorHitMovieSets
        .get(personId)!
        .add(movieId);
    });

  const topHitActors: ActorHitCount[] =
    Array.from(
      actorHitMovieSets.entries()
    )
      .map(
        ([personId, movieSet]) => ({
          personId,
          name:
            personMap.get(
              personId
            ) ||
            "Unknown Actor",
          count:
            movieSet.size,
        })
      )
      .sort(
        (a, b) =>
          b.count - a.count
      )
      .slice(0, 5);

  /*
   * HIGHEST BUDGETED MOVIE
   */
  const budgetMovies =
    performances.filter(
      (movie) =>
        movie.budget !== null &&
        Number.isFinite(
          Number(movie.budget)
        )
    );

  const highestBudget =
    budgetMovies.length > 0
      ? budgetMovies.reduce(
          (best, movie) =>
            Number(movie.budget) >
            Number(
              best.budget
            )
              ? movie
              : best
        )
      : null;

  /*
   * WORLDWIDE MILESTONES
   */
  const milestone = (
    threshold: number
  ) =>
    performances.filter(
      (movie) =>
        movie.worldwide !== null &&
        movie.worldwide >=
          threshold
    ).length;

  return {
    industry,

    movieCount: movieIds.length,

    totalWorldwide,
    totalIndia,
    totalOverseas,

    totalHits,
    totalBlockbusters,
    totalFlops,
    totalDisasters,

    averageGross,

    topActors,
    topHitActors,

    yearWise,

    averageMoviesPerYear,
    totalYears,

    highestWorldwide:
      highestBy(
        performances,
        "worldwide"
      ),

    highestIndia:
      highestBy(
        performances,
        "india"
      ),

    highestOverseas:
      highestBy(
        performances,
        "overseas"
      ),

    highestTamilNadu:
      highestBy(
        performances,
        "tamilNadu"
      ),

    highestKarnataka:
      highestBy(
        performances,
        "karnataka"
      ),

    highestKerala:
      highestBy(
        performances,
        "kerala"
      ),

    highestTeluguStates:
      highestBy(
        performances,
        "teluguStates"
      ),

    highestBudget,

    movies50:
      milestone(
        500000000
      ),

    movies100:
      milestone(
        1000000000
      ),

    movies250:
      milestone(
        2500000000
      ),

    movies500:
      milestone(
        5000000000
      ),

    movies1000:
      milestone(
        10000000000
      ),
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
    !Number.isFinite(Number(a)) ||
    !Number.isFinite(Number(b))
  ) {
    return "NONE";
  }

  if (a === b) {
    return "TIE";
  }

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
  const winner =
    winnerFor(
      metric.a,
      metric.b,
      metric.higherIsBetter ??
        true
    );

  const display = (
    value: number | null
  ) => {
    if (
      metric.format ===
      "number"
    ) {
      return formatNumber(value);
    }

    if (
      metric.format ===
      "percent"
    ) {
      return formatPercent(value);
    }

    return formatCrores(value);
  };

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

function Section({
  title,
  firstName,
  secondName,
  children,
}: {
  title: string;
  firstName: string;
  secondName: string;
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

      <div className="mb-3 grid grid-cols-[1fr_82px_82px] gap-2 border-b border-zinc-900 pb-2">
        <div />

        <div className="text-right">
          <p className="line-clamp-1 text-[8px] font-semibold text-violet-300">
            {firstName}
          </p>

          <p className="mt-0.5 text-[7px] uppercase tracking-[0.12em] text-zinc-700">
            Industry A
          </p>
        </div>

        <div className="text-right">
          <p className="line-clamp-1 text-[8px] font-semibold text-violet-300">
            {secondName}
          </p>

          <p className="mt-0.5 text-[7px] uppercase tracking-[0.12em] text-zinc-700">
            Industry B
          </p>
        </div>
      </div>

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
    | "worldwide"
    | "india"
    | "overseas"
    | "tamilNadu"
    | "karnataka"
    | "kerala"
    | "teluguStates";
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

      <p className="mt-1 line-clamp-2 text-[10px] font-medium text-zinc-300">
        {movie.title}
      </p>

      <p className="mt-2 text-sm font-semibold text-violet-300">
        {formatCrores(
          movie[field]
        )}
      </p>

      {movie.year !== null && (
        <p className="mt-1 text-[9px] text-zinc-600">
          {movie.year}
        </p>
      )}
    </div>
  );
}

function ActorContributionList({
  actors,
}: {
  actors: ActorContribution[];
}) {
  if (!actors.length) {
    return (
      <p className="text-[10px] text-zinc-600">
        Not enough data
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {actors.map(
        (actor, index) => (
          <div
            key={actor.personId}
            className="flex items-center gap-2"
          >
            <span className="w-4 text-[9px] text-zinc-700">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[9px] font-medium text-zinc-300">
                {actor.name}
              </p>

              <p className="text-[8px] text-zinc-600">
                {actor.movieCount} lead{" "}
                {actor.movieCount === 1
                  ? "movie"
                  : "movies"}
              </p>
            </div>

            <span className="text-[10px] font-semibold text-violet-300">
              {formatCrores(
                actor.worldwide
              )}
            </span>
          </div>
        )
      )}
    </div>
  );
}

function ActorHitList({
  actors,
}: {
  actors: ActorHitCount[];
}) {
  if (!actors.length) {
    return (
      <p className="text-[10px] text-zinc-600">
        Not enough data
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {actors.map(
        (actor, index) => (
          <div
            key={actor.personId}
            className="flex items-center gap-2"
          >
            <span className="w-4 text-[9px] text-zinc-700">
              {index + 1}
            </span>

            <p className="min-w-0 flex-1 line-clamp-1 text-[9px] font-medium text-zinc-300">
              {actor.name}
            </p>

            <span className="text-[10px] font-semibold text-violet-300">
              {actor.count}
            </span>
          </div>
        )
      )}
    </div>
  );
}

function YearBars({
  yearsA,
  yearsB,
}: {
  yearsA: YearPerformance[];
  yearsB: YearPerformance[];
}) {
  const allValues = [
    ...yearsA.map(
      (item) =>
        item.worldwide ?? 0
    ),
    ...yearsB.map(
      (item) =>
        item.worldwide ?? 0
    ),
  ];

  const max =
    Math.max(...allValues, 1);

  const years = Array.from(
    new Set([
      ...yearsA.map(
        (item) => item.year
      ),
      ...yearsB.map(
        (item) => item.year
      ),
    ])
  ).sort((a, b) => a - b);

  function valueFor(
    data: YearPerformance[],
    year: number
  ) {
    return (
      data.find(
        (item) =>
          item.year === year
      ) || null
    );
  }

  return (
    <div className="space-y-4">
      {years.map((year) => {
        const a = valueFor(
          yearsA,
          year
        );

        const b = valueFor(
          yearsB,
          year
        );

        const valueA =
          a?.worldwide ?? null;

        const valueB =
          b?.worldwide ?? null;

        const widthA =
          valueA !== null
            ? Math.max(
                3,
                (valueA / max) *
                  100
              )
            : 0;

        const widthB =
          valueB !== null
            ? Math.max(
                3,
                (valueB / max) *
                  100
              )
            : 0;

        return (
          <div
            key={year}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-zinc-400">
                {year}
              </span>

              <span className="text-[7px] uppercase tracking-[0.1em] text-zinc-700">
                Worldwide
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 text-[7px] text-violet-400">
                A
              </span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className="h-full rounded-full bg-violet-500/70 transition-all"
                  style={{
                    width: `${widthA}%,`
                  }}
                />
              </div>

              <span className="w-[58px] text-right text-[8px] text-zinc-500">
                {formatCrores(
                  valueA
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 text-[7px] text-yellow-400">
                B
              </span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className="h-full rounded-full bg-yellow-500/60 transition-all"
                  style={{
                    width: `${widthB}%,`
                  }}
                />
              </div>

              <span className="w-[58px] text-right text-[8px] text-zinc-500">
                {formatCrores(
                  valueB
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GrowthTable({
  yearsA,
  yearsB,
}: {
  yearsA: YearPerformance[];
  yearsB: YearPerformance[];
}) {
  const years = Array.from(
    new Set([
      ...yearsA.map(
        (item) => item.year
      ),
      ...yearsB.map(
        (item) => item.year
      ),
    ])
  ).sort((a, b) => a - b);

  function get(
    list: YearPerformance[],
    year: number
  ) {
    return (
      list.find(
        (item) =>
          item.year === year
      ) || null
    );
  }

  return (
    <div className="space-y-1">
      {years.map((year) => {
        const a = get(
          yearsA,
          year
        );

        const b = get(
          yearsB,
          year
        );

        const growthA =
          a?.growth ?? null;

        const growthB =
          b?.growth ?? null;

        return (
          <div
            key={year}
            className="grid grid-cols-[1fr_82px_82px] items-center gap-2 border-b border-zinc-900 py-2 last:border-b-0"
          >
            <div>
              <p className="text-[9px] font-medium text-zinc-400">
                {year}
              </p>

              <p className="text-[7px] text-zinc-700">
                Year-to-year growth
              </p>
            </div>

            <div
              className={`text-right text-[10px] font-semibold ${
                growthA !== null &&
                growthA > 0
                  ? "text-green-400"
                  : growthA !== null &&
                    growthA < 0
                  ? "text-red-400"
                  : "text-zinc-400"
              }`}
            >
              {formatPercent(
                growthA
              )}
            </div>

            <div
              className={`text-right text-[10px] font-semibold ${
                growthB !== null &&
                growthB > 0
                  ? "text-green-400"
                  : growthB !== null &&
                    growthB < 0
                  ? "text-red-400"
                  : "text-zinc-400"
              }`}
            >
              {formatPercent(
                growthB
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Trophy({
  label,
  winner,
}: {
  label: string;
  winner:
    | "A"
    | "B"
    | "TIE"
    | "NONE";
}) {
  if (winner === "NONE") {
    return null;
  }

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

export default function JmiIndustryComparisonReport({
  first,
  second,
}: {
  first: Entity;
  second: Entity;
}) {
  const [
    firstStats,
    setFirstStats,
  ] = useState<IndustryStats | null>(
    null
  );

  const [
    secondStats,
    setSecondStats,
  ] = useState<IndustryStats | null>(
    null
  );

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
            loadIndustry(
              Number(first.id)
            ),
            loadIndustry(
              Number(second.id)
            ),
          ]);

        if (cancelled) return;

        setFirstStats(a);
        setSecondStats(b);
      } catch (err) {
        console.error(
          "JMI Industry Comparison error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load industry comparison data."
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
    if (
      !firstStats ||
      !secondStats
    ) {
      return {
        a: 0,
        b: 0,
        comparable: 0,
      };
    }

    /*
     * Only meaningful comparable
     * performance categories contribute
     * to the final championship.
     */
    const metrics: Metric[] = [
      {
        key: "movies",
        label: "Total Movies",
        a: firstStats.movieCount,
        b: secondStats.movieCount,
        format: "number",
      },
      {
        key: "worldwide",
        label: "Worldwide",
        a: firstStats.totalWorldwide,
        b: secondStats.totalWorldwide,
      },
      {
        key: "india",
        label: "India",
        a: firstStats.totalIndia,
        b: secondStats.totalIndia,
      },
      {
        key: "overseas",
        label: "Overseas",
        a: firstStats.totalOverseas,
        b: secondStats.totalOverseas,
      },
      {
        key: "hits",
        label: "Hits",
        a: firstStats.totalHits,
        b: secondStats.totalHits,
        format: "number",
      },
      {
        key: "blockbusters",
        label: "Blockbusters",
        a:
          firstStats.totalBlockbusters,
        b:
          secondStats.totalBlockbusters,
        format: "number",
      },
      {
        key: "average",
        label: "Average Gross",
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

    metrics.forEach(
      (metric) => {
        const winner =
          winnerFor(
            metric.a,
            metric.b,
            metric.higherIsBetter ??
              true
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
      }
    );

    return {
      a,
      b,
      comparable,
    };
  }, [
    firstStats,
    secondStats,
  ]);

  if (loading) {
    return (
      <div className="rounded-xl border border-violet-400/20 bg-zinc-950 p-8 text-center">
        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-400" />

        <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-violet-400">
          JMI Industry Intelligence
        </p>

        <p className="mt-2 text-[10px] text-zinc-600">
          Building industry comparison report...
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
          {error ||
            "Not enough data"}
        </p>
      </div>
    );
  }

  const nameA =
    firstStats.industry?.name ||
    first.title ||
    "Industry A";

  const nameB =
    secondStats.industry?.name ||
    second.title ||
    "Industry B";

  const finalWinner =
    score.comparable === 0
      ? "NONE"
      : score.a === score.b
      ? "TIE"
      : score.a > score.b
      ? "A"
      : "B";

  return (
    <div className="space-y-5">

      {/* HEADER */}

      <div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-violet-400">
          JMI Industry Intelligence
        </p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">
          Industry vs Industry
        </h2>

        <p className="mt-1 text-[10px] leading-5 text-zinc-500">
          A market-level comparison of
          industry scale, box office,
          yearly performance, growth,
          actor contribution, records
          and long-term commercial strength.
        </p>
      </div>

      {/* INDUSTRY IDENTITIES */}

      <section className="overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/10">
        <div className="grid grid-cols-2 divide-x divide-zinc-800">

          <div className="p-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/5 text-xl text-violet-300">
              ◈
            </div>

            <p className="text-[12px] font-semibold text-zinc-100">
              {nameA}
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-violet-400">
              Industry A
            </p>
          </div>

          <div className="p-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-xl text-yellow-300">
              ◈
            </div>

            <p className="text-[12px] font-semibold text-zinc-100">
              {nameB}
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-yellow-400">
              Industry B
            </p>
          </div>

        </div>
      </section>

      {/* OVERVIEW */}

      <Section
        title="Industry Overview"
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
            key: "worldwide",
            label: "Total Worldwide Collection",
            a: firstStats.totalWorldwide,
            b: secondStats.totalWorldwide,
          }}
        />

        <MetricRow
          metric={{
            key: "india",
            label: "Total India Collection",
            a: firstStats.totalIndia,
            b: secondStats.totalIndia,
          }}
        />

        <MetricRow
          metric={{
            key: "overseas",
            label: "Total Overseas Collection",
            a: firstStats.totalOverseas,
            b: secondStats.totalOverseas,
          }}
        />

        <MetricRow
          metric={{
            key: "average",
            label: "Average Gross Per Movie",
            a: firstStats.averageGross,
            b: secondStats.averageGross,
          }}
        />
      </Section>

      {/* VERDICTS */}

      <Section
        title="Theatrical Performance"
        firstName={nameA}
        secondName={nameB}
      >
        <MetricRow
          metric={{
            key: "hits",
            label: "Total Hits",
            a: firstStats.totalHits,
            b: secondStats.totalHits,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "blockbusters",
            label: "Total Blockbusters",
            a:
              firstStats.totalBlockbusters,
            b:
              secondStats.totalBlockbusters,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "flops",
            label: "Total Flops",
            a: firstStats.totalFlops,
            b: secondStats.totalFlops,
            format: "number",
            higherIsBetter: false,
          }}
        />

        <MetricRow
          metric={{
            key: "disasters",
            label: "Total Disasters",
            a:
              firstStats.totalDisasters,
            b:
              secondStats.totalDisasters,
            format: "number",
            higherIsBetter: false,
          }}
        />
      </Section>

      {/* LEAD ACTORS */}

      <Section
        title="Top 5 Highest Contributing Lead Actors"
        firstName={nameA}
        secondName={nameB}
      >
        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className="mb-3 text-[8px] uppercase tracking-[0.14em] text-violet-400">
              {nameA}
            </p>

            <ActorContributionList
              actors={
                firstStats.topActors
              }
            />
          </div>

          <div>
            <p className="mb-3 text-[8px] uppercase tracking-[0.14em] text-yellow-400">
              {nameB}
            </p>

            <ActorContributionList
              actors={
                secondStats.topActors
              }
            />
          </div>

        </div>

        <p className="mt-4 border-t border-zinc-900 pt-3 text-[8px] leading-4 text-zinc-700">
          Ranked by the combined worldwide
          JMI collection of industry movies
          in which the actor is credited in a
          lead role.
        </p>
      </Section>

      {/* HIT ACTORS */}

      <Section
        title="Top 5 Actors With Most Hits / Blockbusters"
        firstName={nameA}
        secondName={nameB}
      >
        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className="mb-3 text-[8px] uppercase tracking-[0.14em] text-violet-400">
              {nameA}
            </p>

            <ActorHitList
              actors={
                firstStats.topHitActors
              }
            />
          </div>

          <div>
            <p className="mb-3 text-[8px] uppercase tracking-[0.14em] text-yellow-400">
              {nameB}
            </p>

            <ActorHitList
              actors={
                secondStats.topHitActors
              }
            />
          </div>

        </div>

        <p className="mt-4 border-t border-zinc-900 pt-3 text-[8px] leading-4 text-zinc-700">
          Count is based on distinct industry
          movies where the actor is credited as
          a lead and the movie verdict is Hit or
          Blockbuster.
        </p>
      </Section>

      {/* YEAR WISE */}

      <Section
        title="Recent 5 Years — Worldwide Collection"
        firstName={nameA}
        secondName={nameB}
      >
        {firstStats.yearWise.length ===
          0 &&
        secondStats.yearWise.length ===
          0 ? (
          <p className="text-[10px] text-zinc-600">
            Not enough data
          </p>
        ) : (
          <YearBars
            yearsA={
              firstStats.yearWise
            }
            yearsB={
              secondStats.yearWise
            }
          />
        )}

        <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-900 pt-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-500/70" />
            <span className="text-[8px] text-zinc-600">
              {nameA}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500/60" />
            <span className="text-[8px] text-zinc-600">
              {nameB}
            </span>
          </div>
        </div>
      </Section>

      {/* GROWTH */}

      <Section
        title="Year-to-Year Growth Intelligence"
        firstName={nameA}
        secondName={nameB}
      >
        <GrowthTable
          yearsA={
            firstStats.yearWise
          }
          yearsB={
            secondStats.yearWise
          }
        />

        <p className="mt-3 border-t border-zinc-900 pt-3 text-[8px] leading-4 text-zinc-700">
          Growth compares each represented
          year's total worldwide JMI collection
          with the immediately preceding year
          represented in the five-year window.
          The first year has no prior comparison.
        </p>
      </Section>

      {/* ANNUAL OUTPUT */}

      <Section
        title="Annual Industry Output"
        firstName={nameA}
        secondName={nameB}
      >
        <MetricRow
          metric={{
            key: "avgMovies",
            label: "Average Movies Per Year",
            a:
              firstStats.averageMoviesPerYear,
            b:
              secondStats.averageMoviesPerYear,
          }}
        />

        <div className="mt-3 grid grid-cols-2 gap-3">

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Years Represented
            </p>

            <p className="mt-2 text-sm font-semibold text-violet-300">
              {formatNumber(
                firstStats.totalYears
              )}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Years Represented
            </p>

            <p className="mt-2 text-sm font-semibold text-yellow-300">
              {formatNumber(
                secondStats.totalYears
              )}
            </p>
          </div>

        </div>
      </Section>

      {/* HIGHEST GROSSING */}

      <Section
        title="Highest Grossing Intelligence"
        firstName={nameA}
        secondName={nameB}
      >
        <div className="grid grid-cols-2 gap-3">

          <RecordCard
            label="Highest Worldwide"
            movie={
              firstStats.highestWorldwide
            }
            field="worldwide"
          />

          <RecordCard
            label="Highest Worldwide"
            movie={
              secondStats.highestWorldwide
            }
            field="worldwide"
          />

          <RecordCard
            label="Highest India"
            movie={
              firstStats.highestIndia
            }
            field="india"
          />

          <RecordCard
            label="Highest India"
            movie={
              secondStats.highestIndia
            }
            field="india"
          />

          <RecordCard
            label="Highest Overseas"
            movie={
              firstStats.highestOverseas
            }
            field="overseas"
          />

          <RecordCard
            label="Highest Overseas"
            movie={
              secondStats.highestOverseas
            }
            field="overseas"
          />

          <RecordCard
            label="Highest Tamil Nadu"
            movie={
              firstStats.highestTamilNadu
            }
            field="tamilNadu"
          />

          <RecordCard
            label="Highest Tamil Nadu"
            movie={
              secondStats.highestTamilNadu
            }
            field="tamilNadu"
          />

          <RecordCard
            label="Highest Karnataka"
            movie={
              firstStats.highestKarnataka
            }
            field="karnataka"
          />

          <RecordCard
            label="Highest Karnataka"
            movie={
              secondStats.highestKarnataka
            }
            field="karnataka"
          />

          <RecordCard
            label="Highest Kerala"
            movie={
              firstStats.highestKerala
            }
            field="kerala"
          />

          <RecordCard
            label="Highest Kerala"
            movie={
              secondStats.highestKerala
            }
            field="kerala"
          />

          <RecordCard
            label="Highest Telugu States"
            movie={
              firstStats.highestTeluguStates
            }
            field="teluguStates"
          />

          <RecordCard
            label="Highest Telugu States"
            movie={
              secondStats.highestTeluguStates
            }
            field="teluguStates"
          />

        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Highest Budgeted Movie
            </p>

            {firstStats.highestBudget ? (
              <>
                <p className="mt-1 line-clamp-2 text-[10px] font-medium text-zinc-300">
                  {
                    firstStats
                      .highestBudget
                      .title
                  }
                </p>

                <p className="mt-2 text-sm font-semibold text-violet-300">
                  {formatCrores(
                    firstStats
                      .highestBudget
                      .budget
                  )}
                </p>
              </>
            ) : (
              <p className="mt-2 text-[10px] text-zinc-600">
                Not enough data
              </p>
            )}
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
            <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
              Highest Budgeted Movie
            </p>

            {secondStats.highestBudget ? (
              <>
                <p className="mt-1 line-clamp-2 text-[10px] font-medium text-zinc-300">
                  {
                    secondStats
                      .highestBudget
                      .title
                  }
                </p>

                <p className="mt-2 text-sm font-semibold text-yellow-300">
                  {formatCrores(
                    secondStats
                      .highestBudget
                      .budget
                  )}
                </p>
              </>
            ) : (
              <p className="mt-2 text-[10px] text-zinc-600">
                Not enough data
              </p>
            )}
          </div>

        </div>
      </Section>

      {/* RECORDS */}

      <Section
        title="Worldwide Records"
        firstName={nameA}
        secondName={nameB}
      >
        <MetricRow
          metric={{
            key: "50",
            label: "Total 50 Cr+ Movies",
            a: firstStats.movies50,
            b: secondStats.movies50,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "100",
            label: "Total 100 Cr+ Movies",
            a: firstStats.movies100,
            b: secondStats.movies100,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "250",
            label: "Total 250 Cr+ Movies",
            a: firstStats.movies250,
            b: secondStats.movies250,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "500",
            label: "Total 500 Cr+ Movies",
            a: firstStats.movies500,
            b: secondStats.movies500,
            format: "number",
          }}
        />

        <MetricRow
          metric={{
            key: "1000",
            label: "Total 1000 Cr+ Movies",
            a: firstStats.movies1000,
            b: secondStats.movies1000,
            format: "number",
          }}
        />
      </Section>

      {/* CATEGORY CHAMPIONS */}

      <Section
        title="JMI Category Champions"
        firstName={nameA}
        secondName={nameB}
      >
        <div className="flex flex-wrap gap-2">

          <Trophy
            label="Movie Scale"
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
            label="Hits"
            winner={winnerFor(
              firstStats.totalHits,
              secondStats.totalHits
            )}
          />

          <Trophy
            label="Blockbusters"
            winner={winnerFor(
              firstStats.totalBlockbusters,
              secondStats.totalBlockbusters
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
            label="50 Cr+"
            winner={winnerFor(
              firstStats.movies50,
              secondStats.movies50
            )}
          />

          <Trophy
            label="100 Cr+"
            winner={winnerFor(
              firstStats.movies100,
              secondStats.movies100
            )}
          />

          <Trophy
            label="250 Cr+"
            winner={winnerFor(
              firstStats.movies250,
              secondStats.movies250
            )}
          />

          <Trophy
            label="500 Cr+"
            winner={winnerFor(
              firstStats.movies500,
              secondStats.movies500
            )}
          />

          <Trophy
            label="1000 Cr+"
            winner={winnerFor(
              firstStats.movies1000,
              secondStats.movies1000
            )}
          />

        </div>
      </Section>

      {/* FINAL WINNER */}

      <section className="overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-zinc-950 to-violet-500/5">

        <div className="border-b border-yellow-500/10 px-4 py-3">
          <p className="text-[9px] uppercase tracking-[0.22em] text-yellow-400">
            JMI Championship
          </p>

          <h3 className="mt-1 text-sm font-semibold text-zinc-100">
            Final Industry Comparison
          </h3>

          <p className="mt-1 text-[9px] leading-4 text-zinc-600">
            The final result evaluates meaningful
            comparable JMI performance categories.
            Missing data does not count against
            either industry.
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
                ? "bg-yellow-500/5"
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

            <p className="mt-2 text-2xl font-bold text-yellow-300">
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
                JMI Industry Winner
              </p>

              <p className="mt-1 text-base font-semibold text-zinc-100">
                {nameA}
              </p>
            </>
          )}

          {finalWinner === "B" && (
            <>
              <p className="text-[9px] uppercase tracking-[0.2em] text-yellow-400">
                JMI Industry Winner
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
          JMI Industry Methodology
        </p>

        <p className="mt-2 text-[9px] leading-5 text-zinc-600">
          Industry membership is determined from
          the existing movie-industry relationships.
          Multi-industry movies may contribute to
          more than one industry. Worldwide
          collection is derived from JMI India plus
          JMI overseas collection. Regional figures
          use the existing cumulative state-wise
          methodology. Lead actor analysis uses
          actor relationships with Lead Role or Lead
          Actress credit types. Year-wise analysis
          uses release year. Worldwide milestone
          records use JMI worldwide collection.
          Budget intelligence uses the JMI trade
          budget. Missing information remains
          Not enough data.
        </p>
      </div>

    </div>
  );
}