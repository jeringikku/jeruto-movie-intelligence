import Link from "next/link";
import PublicHeader from "../../../components/PublicHeader";

import TechnicianRankings, {
  type TechnicianStats,
  type IndustryRankingData,
  type RankingCriterion,
  type RankingPeriod,
  type PeriodRankings,
  type IndustryPeriodRankings,
} from "../../../components/TechnicianRankings";

import { supabase } from "@/lib/supabase";

type Person = {
  id: number;
  full_name: string;
  slug: string | null;
};

type PersonRole = {
  id: number;
  name: string;
};

type MoviePerson = {
  movie_id: number;
  person_id: number;
  role_id: number;
};

type Movie = {
  id: number;
  title: string;
  slug: string | null;
  release_year: number | null;
};

type MovieBusiness = {
  movie_id: number;
  theatrical_verdict: string | null;
};

type MovieIndustry = {
  movie_id: number;
  industry_id: number;
};

type Industry = {
  id: number;
  name: string;
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

const SUCCESSFUL_VERDICTS = new Set([
  "hit",
  "super hit",
  "blockbuster",
]);

const RANKING_PERIODS: RankingPeriod[] = [
  {
    id: "overall",
    label: "Overall Career",
    startYear: null,
    endYear: null,
  },
  {
    id: "1980-1985",
    label: "1980–1985",
    startYear: 1980,
    endYear: 1984,
  },
  {
    id: "1985-1990",
    label: "1985–1990",
    startYear: 1985,
    endYear: 1989,
  },
  {
    id: "1990-1995",
    label: "1990–1995",
    startYear: 1990,
    endYear: 1994,
  },
  {
    id: "1995-2000",
    label: "1995–2000",
    startYear: 1995,
    endYear: 1999,
  },
  {
    id: "2000-2005",
    label: "2000–2005",
    startYear: 2000,
    endYear: 2004,
  },
  {
    id: "2005-2010",
    label: "2005–2010",
    startYear: 2005,
    endYear: 2009,
  },
  {
    id: "2010-2015",
    label: "2010–2015",
    startYear: 2010,
    endYear: 2014,
  },
  {
    id: "2015-2020",
    label: "2015–2020",
    startYear: 2015,
    endYear: 2019,
  },
  {
    id: "2020-2025",
    label: "2020–2025",
    startYear: 2020,
    endYear: 2024,
  },
  {
    id: "2025-2030",
    label: "2025–2030",
    startYear: 2025,
    endYear: 2029,
  },
];

async function fetchAllRows<T>(
  table: string,
  columns: string,
  chunkSize = 500
): Promise<T[]> {
  const allRows: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + chunkSize - 1);

    if (error) {
      console.error(
        `Editors Intelligence ${table}:`,
        error
      );

      throw new Error(`Unable to load ${table}.`);
    }

    if (!data || data.length === 0) {
      break;
    }

    allRows.push(...(data as T[]));

    if (data.length < chunkSize) {
      break;
    }

    from += chunkSize;
  }

  return allRows;
}

function normalizeVerdict(
  verdict: string | null
): string {
  return verdict?.toLowerCase().trim() || "";
}

function isSuccessful(
  verdict: string | null
): boolean {
  return SUCCESSFUL_VERDICTS.has(
    normalizeVerdict(verdict)
  );
}

function calculateEditorStats(
  editor: Person,
  editorMovieIds: Set<number>,
  moviesMap: Map<number, Movie>,
  verdictMap: Map<number, string | null>,
  indiaGrossByMovie: Map<number, number>,
  overseasGrossByMovie: Map<number, number>,
  period: RankingPeriod
): TechnicianStats | null {
  let eligibleMovies = 0;
  let successfulMovies = 0;
  let hitMovies = 0;
  let superHitMovies = 0;
  let blockbusterMovies = 0;
  let indiaGross = 0;
  let overseasGross = 0;

  for (const movieId of editorMovieIds) {
    const movie = moviesMap.get(movieId);

    if (!movie) {
      continue;
    }

    // Restrict films to the selected release-year period.
    if (period.startYear !== null) {
      const releaseYear = movie.release_year;

      if (
        releaseYear === null ||
        !Number.isFinite(Number(releaseYear)) ||
        Number(releaseYear) < period.startYear ||
        Number(releaseYear) > period.endYear!
      ) {
        continue;
      }
    }

    const verdict = verdictMap.get(movieId);

    // A movie without a theatrical verdict is not eligible.
    if (!verdict?.trim()) {
      continue;
    }

    eligibleMovies++;

    const normalized = normalizeVerdict(verdict);

    if (isSuccessful(verdict)) {
      successfulMovies++;
    }

    if (normalized === "hit") {
      hitMovies++;
    }

    if (normalized === "super hit") {
      superHitMovies++;
    }

    if (normalized === "blockbuster") {
      blockbusterMovies++;
    }

    indiaGross += indiaGrossByMovie.get(movieId) || 0;
    overseasGross += overseasGrossByMovie.get(movieId) || 0;
  }

  if (eligibleMovies === 0) {
    return null;
  }

  return {
    id: editor.id,
    name: editor.full_name,
    slug: editor.slug,
    eligibleMovies,
    successfulMovies,
    hitMovies,
    superHitMovies,
    blockbusterMovies,
    indiaGross,
    overseasGross,
    worldwideGross: indiaGross + overseasGross,
    successRatio:
      (successfulMovies / eligibleMovies) * 100,
  };
}

export default async function EditorsIntelligencePage() {
  const [
    people,
    roles,
    moviePeople,
    movies,
    movieBusiness,
    movieIndustries,
    industries,
    stateBoxOffice,
    overseasBoxOffice,
  ] = await Promise.all([
    fetchAllRows<Person>(
      "people",
      "id, full_name, slug"
    ),

    fetchAllRows<PersonRole>(
      "person_roles",
      "id, name"
    ),

    fetchAllRows<MoviePerson>(
      "movie_people",
      "movie_id, person_id, role_id"
    ),

    fetchAllRows<Movie>(
      "movies",
      "id, title, slug, release_year"
    ),

    fetchAllRows<MovieBusiness>(
      "movie_business",
      "movie_id, theatrical_verdict"
    ),

    fetchAllRows<MovieIndustry>(
      "movie_industries",
      "movie_id, industry_id"
    ),

    fetchAllRows<Industry>(
      "industries",
      "id, name"
    ),

    fetchAllRows<StateBoxOffice>(
      "movie_state_box_office",
      "movie_id, state_id, gross_jmi"
    ),

    fetchAllRows<OverseasBoxOffice>(
      "movie_overseas_box_office",
      "movie_id, gross_inr"
    ),
  ]);

  /*
   * ROLE AND ENTITY LOOKUPS
   */

  const editorRoleIds = new Set(
    roles
      .filter(
        (role) =>
          role.name.toLowerCase().trim() === "editor"
      )
      .map((role) => role.id)
  );

  const peopleMap = new Map(
    people.map((person) => [person.id, person])
  );

  const moviesMap = new Map(
    movies.map((movie) => [movie.id, movie])
  );

  const movieIds = new Set(
    movies.map((movie) => movie.id)
  );

  /*
   * THEATRICAL VERDICTS
   */

  const verdictMap = new Map<number, string | null>();

  for (const row of movieBusiness) {
    verdictMap.set(
      row.movie_id,
      row.theatrical_verdict
    );
  }

  /*
   * BOX-OFFICE AGGREGATION
   */

  const indiaGrossByMovie = new Map<number, number>();
  const overseasGrossByMovie = new Map<number, number>();

  for (const row of stateBoxOffice) {
    const gross = Number(row.gross_jmi || 0);

    if (!Number.isFinite(gross) || gross <= 0) {
      continue;
    }

    indiaGrossByMovie.set(
      row.movie_id,
      (indiaGrossByMovie.get(row.movie_id) || 0) + gross
    );
  }

  for (const row of overseasBoxOffice) {
    const gross = Number(row.gross_inr || 0);

    if (!Number.isFinite(gross) || gross <= 0) {
      continue;
    }

    overseasGrossByMovie.set(
      row.movie_id,
      (overseasGrossByMovie.get(row.movie_id) || 0) + gross
    );
  }

  /*
   * EDITOR FILMOGRAPHIES
   */

  const moviesByEditor = new Map<
    number,
    Set<number>
  >();

  for (const credit of moviePeople) {
    if (!editorRoleIds.has(credit.role_id)) {
      continue;
    }

    if (!peopleMap.has(credit.person_id)) {
      continue;
    }

    if (!movieIds.has(credit.movie_id)) {
      continue;
    }

    if (!moviesByEditor.has(credit.person_id)) {
      moviesByEditor.set(
        credit.person_id,
        new Set<number>()
      );
    }

    moviesByEditor
      .get(credit.person_id)!
      .add(credit.movie_id);
  }

  /*
   * MOVIE-INDUSTRY RELATIONSHIPS
   */

  const industriesByMovie = new Map<
    number,
    Set<number>
  >();

  for (const row of movieIndustries) {
    if (!industriesByMovie.has(row.movie_id)) {
      industriesByMovie.set(
        row.movie_id,
        new Set<number>()
      );
    }

    industriesByMovie
      .get(row.movie_id)!
      .add(row.industry_id);
  }

  /*
   * PERIOD-AWARE RANKING CALCULATION
   */

  function getRanking(
    criterion: RankingCriterion,
    industryId: number | null,
    period: RankingPeriod
  ): TechnicianStats[] {
    const results: TechnicianStats[] = [];

    for (const [editorId, allEditorMovies] of moviesByEditor) {
      const editor = peopleMap.get(editorId);

      if (!editor) {
        continue;
      }

      let eligibleMovieIds = allEditorMovies;

      if (industryId !== null) {
        eligibleMovieIds = new Set(
          Array.from(allEditorMovies).filter(
            (movieId) =>
              industriesByMovie
                .get(movieId)
                ?.has(industryId) || false
          )
        );
      }

      const stats = calculateEditorStats(
        editor,
        eligibleMovieIds,
        moviesMap,
        verdictMap,
        indiaGrossByMovie,
        overseasGrossByMovie,
        period
      );

      if (stats) {
        results.push(stats);
      }
    }

    // Success Ratio requires at least five eligible films
    // within the selected period and industry.
    const filteredResults =
      criterion === "ratio"
        ? results.filter(
            (editor) => editor.eligibleMovies >= 5
          )
        : results;

    filteredResults.sort((a, b) => {
      if (criterion === "grossing") {
        return (
          b.worldwideGross - a.worldwideGross ||
          a.name.localeCompare(b.name)
        );
      }

      if (criterion === "hits") {
        return (
          b.successfulMovies - a.successfulMovies ||
          b.successRatio - a.successRatio ||
          a.name.localeCompare(b.name)
        );
      }

      return (
        b.successRatio - a.successRatio ||
        b.successfulMovies - a.successfulMovies ||
        a.name.localeCompare(b.name)
      );
    });

    return filteredResults;
  }

  /*
   * OVERALL CAREER RANKINGS
   */

  const overallPeriod = RANKING_PERIODS[0];

  const initialRankings: Record<
    RankingCriterion,
    TechnicianStats[]
  > = {
    grossing: getRanking(
      "grossing",
      null,
      overallPeriod
    ).slice(0, 25),

    hits: getRanking(
      "hits",
      null,
      overallPeriod
    ).slice(0, 25),

    ratio: getRanking(
      "ratio",
      null,
      overallPeriod
    ).slice(0, 25),
  };

  /*
   * OVERALL INDUSTRY-WISE TOP 10
   */

  const allIndustryRankings: Record<
    number,
    IndustryRankingData
  > = {};

  for (const industry of industries) {
    allIndustryRankings[industry.id] = {
      grossing: getRanking(
        "grossing",
        industry.id,
        overallPeriod
      ).slice(0, 10),

      hits: getRanking(
        "hits",
        industry.id,
        overallPeriod
      ).slice(0, 10),

      ratio: getRanking(
        "ratio",
        industry.id,
        overallPeriod
      ).slice(0, 10),
    };
  }

  /*
   * ALL-INDIA RANKINGS BY PERIOD
   */

  const allPeriodRankings: PeriodRankings = {};

  for (const period of RANKING_PERIODS) {
    allPeriodRankings[period.id] = {
      grossing: getRanking(
        "grossing",
        null,
        period
      ).slice(0, 25),

      hits: getRanking(
        "hits",
        null,
        period
      ).slice(0, 25),

      ratio: getRanking(
        "ratio",
        null,
        period
      ).slice(0, 25),
    };
  }

  /*
   * INDUSTRY RANKINGS BY PERIOD
   */

  const allIndustryPeriodRankings: IndustryPeriodRankings =
    {};

  for (const industry of industries) {
    const industryPeriods: PeriodRankings = {};

    for (const period of RANKING_PERIODS) {
      industryPeriods[period.id] = {
        grossing: getRanking(
          "grossing",
          industry.id,
          period
        ).slice(0, 10),

        hits: getRanking(
          "hits",
          industry.id,
          period
        ).slice(0, 10),

        ratio: getRanking(
          "ratio",
          industry.id,
          period
        ).slice(0, 10),
      };
    }

    allIndustryPeriodRankings[industry.id] =
      industryPeriods;
  }

  const editorCount = moviesByEditor.size;

  /*
   * PAGE
   */

  return (
    <main className="min-h-screen bg-[#08090a] text-zinc-100">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* BACK NAVIGATION */}

        <Link
          href="/preview/technicians"
          className="inline-flex items-center gap-2 text-[9px] tracking-[0.16em] text-violet-400 transition hover:text-yellow-400"
        >
          <span>←</span>
          <span>Back to Technicians Intelligence</span>
        </Link>

        {/* CINEMATIC HERO */}

        <section className="relative mt-6 overflow-hidden rounded-xl border border-white/[0.09] bg-[#101112]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/[0.06] via-transparent to-violet-500/[0.06]" />

            <div className="absolute -right-12 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border border-yellow-400/[0.12] sm:right-12 sm:h-60 sm:w-60">
              <div className="absolute inset-5 rounded-full border border-white/[0.07]" />

              <div className="absolute inset-12 rounded-full border border-violet-400/[0.15]" />

              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-yellow-400/10" />

              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-yellow-400/10" />
            </div>
          </div>

          <div className="relative px-5 py-8 sm:px-8 sm:py-10">
            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-yellow-400">
              JMI · Behind The Screen
            </p>

            <h1 className="mt-4 max-w-2xl text-3xl font-medium tracking-[-0.045em] text-zinc-100 sm:text-4xl md:text-5xl">
              Editors{" "}
              <span className="text-zinc-400">
                Intelligence.
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-[10px] leading-6 text-zinc-400 sm:text-xs">
              Discover the editors behind Indian cinema through
              their filmographies, worldwide box-office performance,
              theatrical successes and career consistency.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-lg border border-white/[0.08] bg-black/30 px-4 py-3">
                <p className="text-[7px] uppercase tracking-[0.15em] text-zinc-500">
                  Editors in database
                </p>

                <p className="mt-1 text-lg font-medium text-yellow-400">
                  {editorCount.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-black/30 px-4 py-3">
                <p className="text-[7px] uppercase tracking-[0.15em] text-zinc-500">
                  Success criteria
                </p>

                <p className="mt-1 text-[10px] font-medium text-zinc-200">
                  Hit · Super Hit · Blockbuster
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-violet-400/30" />
        </section>

        {/* INTERACTIVE RANKINGS */}

        <TechnicianRankings
          initialRankings={initialRankings}
          industries={industries}
          allIndustryRankings={allIndustryRankings}
          technicianLabel="Editor"
          periods={RANKING_PERIODS}
          allPeriodRankings={allPeriodRankings}
          allIndustryPeriodRankings={
            allIndustryPeriodRankings
          }
        />

        {/* METHODOLOGY */}

        <section className="mt-8 rounded-xl border border-white/[0.07] bg-zinc-950/70 p-4 sm:p-5">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-red-400">
            JMI Methodology
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            Successful films are those with a theatrical verdict
            of Hit, Super Hit or Blockbuster. Success ratio is
            calculated using movies with a recorded theatrical
            verdict, and the ratio ranking requires at least five
            eligible films within the selected period. Collection
            totals use the recorded domestic and overseas figures
            attributed to each editor's eligible films. Five-year
            periods use non-overlapping release-year intervals.
            Rankings reflect JMI's currently available data and
            may change as the database expands.
          </p>
        </section>
      </div>

      {/* FOOTER */}

      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-serif text-sm text-zinc-300">
            Jeruto{" "}
            <span className="text-yellow-400">
              Movie Intelligence
            </span>
          </p>

          <p className="text-[8px] text-zinc-600">
            JMI · Editors Intelligence
          </p>
        </div>
      </footer>
    </main>
  );
}