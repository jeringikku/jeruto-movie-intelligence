import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import AudienceBehaviorBanner from "../../components/AudienceBehaviorBanner";
import SouthIndianMarketsBanner from "../../components/SouthIndianMarketsBanner";
import { supabase } from "@/lib/supabase";

type Genre = {
  id: number;
  name: string;
};

type MovieGenre = {
  movie_id: number;
  genre_id: number;
};

type StateBoxOffice = {
  movie_id: number;
  state_id: number | null;
  gross_jmi: number | null;
};

type GenrePerformance = {
  id: number;
  name: string;
  gross: number;
};

type Industry = {
  id: number;
  name: string;
};

type MovieIndustry = {
  movie_id: number;
  industry_id: number;
};

type MovieBusiness = {
  movie_id: number;
  theatrical_verdict: string | null;
};

type IndustryGenrePerformance = {
  id: number;
  name: string;
  gross: number;
};

type IndustryAnalysis = {
  id: number;
  name: string;
  topGenres: IndustryGenrePerformance[];
  hitGenre: {
    name: string;
    count: number;
  } | null;
};

type State = {
  id: number;
  name: string;
};

type SouthMarket = {
  key: string;
  name: string;
  stateIds: number[];
};

type SouthMarketGenre = {
  id: number;
  name: string;
  gross: number;
};

type SouthMarketAnalysis = SouthMarket & {
  topGenres: SouthMarketGenre[];
};

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
        `Audience Behavior ${table} error:`,
        error
      );
      break;
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

function formatCrores(value: number) {
  return `₹${(value / 10000000).toFixed(2)} Cr;;`
}

export default async function AudienceBehaviorPage() {
  /*
   * =====================================================
   * DATA
   * =====================================================
   */

  const [
    genres,
    movieGenres,
    stateBoxOffice,
    industries,
    movieIndustries,
    movieBusiness,
    states,
  ] = await Promise.all([
    fetchAllRows<Genre>(
      "genres",
      "id, name"
    ),

    fetchAllRows<MovieGenre>(
      "movie_genres",
      "movie_id, genre_id"
    ),

    fetchAllRows<StateBoxOffice>(
      "movie_state_box_office",
      "movie_id, state_id, gross_jmi"
    ),

    fetchAllRows<Industry>(
      "industries",
      "id, name"
    ),

    fetchAllRows<MovieIndustry>(
      "movie_industries",
      "movie_id, industry_id"
    ),

    fetchAllRows<MovieBusiness>(
      "movie_business",
      "movie_id, theatrical_verdict"
    ),

    fetchAllRows<State>(
      "states",
      "id, name"
    ),
  ]);

  /*
   * =====================================================
   * OVERALL INDIA GENRE PERFORMANCE
   *
   * Each movie contributes its full India domestic
   * gross to every genre assigned to that movie.
   *
   * This is a genre-performance measure, not a
   * partitioning of total box office.
   * =====================================================
   */

  const genreMap = new Map<number, Genre>();

  for (const genre of genres) {
    genreMap.set(genre.id, genre);
  }

  const movieIndiaGross = new Map<number, number>();

  for (const row of stateBoxOffice) {
    const gross = Number(row.gross_jmi || 0);

    if (gross <= 0) continue;

    movieIndiaGross.set(
      row.movie_id,
      (movieIndiaGross.get(row.movie_id) || 0) + gross
    );
  }

  const genreGross = new Map<number, number>();

  for (const movieGenre of movieGenres) {
    const movieGross =
      movieIndiaGross.get(movieGenre.movie_id) || 0;

    if (movieGross <= 0) continue;

    genreGross.set(
      movieGenre.genre_id,
      (genreGross.get(movieGenre.genre_id) || 0) +
        movieGross
    );
  }

  const topGenres: GenrePerformance[] = Array.from(
    genreGross.entries()
  )
    .map(([genreId, gross]) => {
      const genre = genreMap.get(genreId);

      if (!genre) return null;

      return {
        id: genre.id,
        name: genre.name,
        gross,
      };
    })
    .filter(
      (genre): genre is GenrePerformance =>
        genre !== null
    )
    .sort((a, b) => b.gross - a.gross)
    .slice(0, 10);

  /*
   * =====================================================
   * INDUSTRY-WISE AUDIENCE BEHAVIOR
   * =====================================================
   */

  const industryMap = new Map<number, Industry>();

  for (const industry of industries) {
    industryMap.set(industry.id, industry);
  }

  const movieIndustryMap = new Map<number, number[]>();

  for (const row of movieIndustries) {
    const existing =
      movieIndustryMap.get(row.movie_id) || [];

    existing.push(row.industry_id);

    movieIndustryMap.set(
      row.movie_id,
      existing
    );
  }

  const industryGenreGross = new Map<
    number,
    Map<number, number>
  >();

  for (const row of movieGenres) {
    const movieGross =
      movieIndiaGross.get(row.movie_id) || 0;

    if (movieGross <= 0) continue;

    const movieIndustriesForMovie =
      movieIndustryMap.get(row.movie_id) || [];

    for (const industryId of movieIndustriesForMovie) {
      if (!industryGenreGross.has(industryId)) {
        industryGenreGross.set(
          industryId,
          new Map<number, number>()
        );
      }

      const genreMapForIndustry =
        industryGenreGross.get(industryId)!;

      genreMapForIndustry.set(
        row.genre_id,
        (genreMapForIndustry.get(row.genre_id) || 0) +
          movieGross
      );
    }
  }

  /*
   * =====================================================
   * EXISTING JMI HIT LOGIC
   * =====================================================
   */

  function normalizeVerdict(
    verdict: string | null
  ) {
    return verdict?.toLowerCase().trim() || "";
  }

  function isHit(verdict: string | null) {
    const value = normalizeVerdict(verdict);

    return (
      value === "hit" ||
      value === "super hit" ||
      value === "blockbuster" ||
      value === "all time blockbuster" ||
      value === "industry hit" ||
      value.includes("blockbuster")
    );
  }

  /*
   * =====================================================
   * INDUSTRY HIT COUNTS BY GENRE
   * =====================================================
   */

  const industryGenreHitCounts = new Map<
    number,
    Map<number, number>
  >();

  const movieBusinessMap = new Map<
    number,
    string | null
  >();

  for (const row of movieBusiness) {
    movieBusinessMap.set(
      row.movie_id,
      row.theatrical_verdict
    );
  }

  for (const movieIndustry of movieIndustries) {
    const verdict =
      movieBusinessMap.get(
        movieIndustry.movie_id
      ) || null;

    if (!isHit(verdict)) continue;

    const movieGenresForMovie =
      movieGenres.filter(
        (row) =>
          row.movie_id === movieIndustry.movie_id
      );

    if (
      !industryGenreHitCounts.has(
        movieIndustry.industry_id
      )
    ) {
      industryGenreHitCounts.set(
        movieIndustry.industry_id,
        new Map<number, number>()
      );
    }

    const genreHitMap =
      industryGenreHitCounts.get(
        movieIndustry.industry_id
      )!;

    const uniqueGenreIds = new Set(
      movieGenresForMovie.map(
        (row) => row.genre_id
      )
    );

    for (const genreId of uniqueGenreIds) {
      genreHitMap.set(
        genreId,
        (genreHitMap.get(genreId) || 0) + 1
      );
    }
  }

  /*
   * =====================================================
   * FINAL INDUSTRY ANALYSIS
   * =====================================================
   */

  const industryAnalysis: IndustryAnalysis[] =
    industries
      .map((industry) => {
        const genreGrossMap =
          industryGenreGross.get(industry.id) ||
          new Map<number, number>();

        const topGenres: IndustryGenrePerformance[] =
          Array.from(genreGrossMap.entries())
            .map(([genreId, gross]) => {
              const genre =
                genreMap.get(genreId);

              if (!genre) return null;

              return {
                id: genre.id,
                name: genre.name,
                gross,
              };
            })
            .filter(
              (
                genre
              ): genre is IndustryGenrePerformance =>
                genre !== null
            )
            .sort(
              (a, b) => b.gross - a.gross
            )
            .slice(0, 5);

        const hitMap =
          industryGenreHitCounts.get(
            industry.id
          ) ||
          new Map<number, number>();

        const hitGenreEntries =
          Array.from(hitMap.entries())
            .sort(
              ([, a], [, b]) => b - a
            );

        let hitGenre: {
          name: string;
          count: number;
        } | null = null;

        if (hitGenreEntries.length > 0) {
          const [
            genreId,
            count,
          ] = hitGenreEntries[0];

          const genre =
            genreMap.get(genreId);

          if (genre) {
            hitGenre = {
              name: genre.name,
              count,
            };
          }
        }

        return {
          id: industry.id,
          name: industry.name,
          topGenres,
          hitGenre,
        };
      })
      .filter(
        (industry) =>
          industry.topGenres.length > 0 ||
          industry.hitGenre !== null
      );

  /*
   * =====================================================
   * SOUTH INDIAN AUDIENCE BEHAVIOR
   * =====================================================
   *
   * Markets:
   *   Kerala
   *   Tamil Nadu
   *   Karnataka
   *   Telugu States = Andhra Pradesh + Telangana
   *
   * Market gross is calculated directly from
   * movie_state_box_office.
   *
   * Each movie contributes its full market gross
   * to every genre assigned to that movie.
   * =====================================================
   */

  const normalizedStates = states.map((state) => ({
    ...state,
    normalizedName: state.name
      .toLowerCase()
      .trim(),
  }));

  const findStateId = (name: string) => {
    return normalizedStates.find(
      (state) =>
        state.normalizedName ===
        name.toLowerCase().trim()
    )?.id;
  };

  const keralaId = findStateId("Kerala");

  const tamilNaduId =
    findStateId("Tamil Nadu");

  const karnatakaId =
    findStateId("Karnataka");

  const andhraPradeshId =
    findStateId("Andhra Pradesh");

  const telanganaId =
    findStateId("Telangana");

  const southMarkets: SouthMarket[] = [
    {
      key: "kerala",
      name: "Kerala",
      stateIds: keralaId
        ? [keralaId]
        : [],
    },

    {
      key: "tamil-nadu",
      name: "Tamil Nadu",
      stateIds: tamilNaduId
        ? [tamilNaduId]
        : [],
    },

    {
      key: "karnataka",
      name: "Karnataka",
      stateIds: karnatakaId
        ? [karnatakaId]
        : [],
    },

    {
      key: "telugu-states",
      name: "Telugu States",
      stateIds: [
        andhraPradeshId,
        telanganaId,
      ].filter(
        (id): id is number =>
          typeof id === "number"
      ),
    },
  ];

  const southMarketAnalysis: SouthMarketAnalysis[] =
    southMarkets.map((market) => {
      const genreGrossMap =
        new Map<number, number>();

      /*
       * First calculate each movie's total gross
       * within this particular market.
       *
       * This is important for Telugu States because
       * Andhra Pradesh + Telangana must be combined
       * into one market.
       */

      const movieMarketGross =
        new Map<number, number>();

      for (const row of stateBoxOffice) {
        if (
          row.state_id === null ||
          !market.stateIds.includes(row.state_id)
        ) {
          continue;
        }

        const gross =
          Number(row.gross_jmi || 0);

        if (gross <= 0) continue;

        movieMarketGross.set(
          row.movie_id,
          (movieMarketGross.get(row.movie_id) || 0) +
            gross
        );
      }

      /*
       * Attribute each movie's market gross to its
       * assigned genres.
       *
       * Set prevents duplicate genre relationships
       * from double-counting the same movie.
       */

      for (const [
        movieId,
        marketGross,
      ] of movieMarketGross.entries()) {
        if (marketGross <= 0) continue;

        const movieGenresForMovie =
          movieGenres.filter(
            (row) =>
              row.movie_id === movieId
          );

        const uniqueGenreIds = new Set(
          movieGenresForMovie.map(
            (row) => row.genre_id
          )
        );

        for (const genreId of uniqueGenreIds) {
          genreGrossMap.set(
            genreId,
            (genreGrossMap.get(genreId) || 0) +
              marketGross
          );
        }
      }

      const topGenres: SouthMarketGenre[] =
        Array.from(
          genreGrossMap.entries()
        )
          .map(([genreId, gross]) => {
            const genre =
              genreMap.get(genreId);

            if (!genre) return null;

            return {
              id: genre.id,
              name: genre.name,
              gross,
            };
          })
          .filter(
            (
              genre
            ): genre is SouthMarketGenre =>
              genre !== null
          )
          .sort(
            (a, b) =>
              b.gross - a.gross
          )
          .slice(0, 5);

      return {
        ...market,
        topGenres,
      };
    });

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <PublicHeader />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* BACK */}
        <div className="mb-8">
          <Link
            href="/preview"
            className="text-[9px] tracking-[0.16em] text-violet-400 transition hover:text-violet-400"
          >
            ← Back to Home
          </Link>
        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="border-b border-zinc-900 pb-8">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-pink-400">
            JMI Audience Intelligence
          </p>

          <h1 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-green-400/90 sm:text-3xl">
            Audience Behavior Statistics
          </h1>

          <p className="mt-3 max-w-2xl text-[11px] leading-5 text-zinc-400 sm:text-xs">
            A data-driven view of genre performance across
            Indian theatrical markets, industries and
            regional audiences.
          </p>

           <AudienceBehaviorBanner />

        </section>

        {/* =====================================================
            01 — OVERALL INDIAN AUDIENCE
        ===================================================== */}

        <section className="mt-10 border-b border-zinc-900 pb-10">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              01 · Overall Indian Audience
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.025em] text-zinc-100 sm:text-xl">
              India's most commercially demanded genres.
            </h2>

            <p className="mt-2 max-w-2xl text-[9px] leading-4 text-zinc-500">
              Genres ranked by the combined domestic India
              theatrical gross of movies classified under each
              genre.
            </p>
          </div>

          {/* TOP 10 */}
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
            {topGenres.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[9px] uppercase tracking-[0.15em] text-zinc-700">
                  No genre box-office data available
                </p>
              </div>
            ) : (
              <div>
                {topGenres.map((genre, index) => (
                  <div
                    key={genre.id}
                    className="group flex items-center gap-3 border-b border-zinc-900 px-4 py-3 last:border-b-0 sm:px-5"
                  >
                    {/* RANK */}
                    <div className="w-7 shrink-0 text-[8px] font-medium tracking-[0.12em] text-green-500">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* GENRE */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-zinc-300 transition-colors group-hover:text-white sm:text-xs">
                        {genre.name}
                      </p>

                      <div className="mt-1 h-px w-full max-w-[180px] bg-zinc-900">
                        <div
                          className="h-px bg-violet-400/50 transition-all duration-500 group-hover:bg-violet-400"
                          style={{
                            width: `${
                              (genre.gross /
                                topGenres[0].gross) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* GROSS */}
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-medium text-green-500 sm:text-[11px]">
                        {formatCrores(genre.gross)}
                      </p>

                      <p className="mt-0.5 text-[7px] uppercase tracking-[0.12em] text-zinc-500">
                        India Gross
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* METHODOLOGY */}
          <div className="mt-4 rounded-lg border border-zinc-900/80 bg-zinc-950/50 px-4 py-3">
            <p className="text-[7px] uppercase tracking-[0.16em] text-red-500">
              JMI Methodology
            </p>

            <p className="mt-1 text-[8px] leading-4 text-zinc-500">
              A movie's full India domestic gross is attributed
              to each genre assigned to that movie. Genre totals
              therefore represent the theatrical performance of
              movies classified under each genre and are not
              intended to partition India's total box office.
            </p>
          </div>
        </section>

        {/* =====================================================
            02 — INDUSTRY WISE
        ===================================================== */}

        <section className="mt-10 border-b border-zinc-900 pb-10">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400">
            02 · Industry-wise Audience Behavior
          </p>

          <h2 className="mt-2 text-lg font-medium tracking-[-0.025em] text-yellow-400 sm:text-xl">
            Different industries & their favorite Genres.
          </h2>

          <p className="mt-2 text-[9px] leading-4 text-zinc-500">
            Industry-level genre performance and theatrical
            success patterns will appear here.
          </p>

          <div className="mt-6 space-y-3">
            {industryAnalysis.map((industry) => {
              const maxGross =
                industry.topGenres[0]?.gross || 0;

              return (
                <div
                  key={industry.id}
                  className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950"
                >
                  {/* INDUSTRY HEADER */}
                  <div className="border-b border-zinc-900 px-4 py-4 sm:px-5">
                    <p className="text-[7px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                      Industry
                    </p>

                    <h3 className="mt-1 text-sm font-medium text-pink-400 sm:text-base">
                      {industry.name}
                    </h3>
                  </div>

                  {/* TOP 5 GENRES */}
                  <div className="px-4 py-3 sm:px-5">
                    <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-violet-400">
                      Top 5 Genres by India Gross
                    </p>

                    <div className="mt-3">
                      {industry.topGenres.map(
                        (genre, index) => (
                          <div
                            key={genre.id}
                            className="flex items-center gap-3 border-b border-zinc-900 py-2.5 last:border-b-0"
                          >
                            <span className="w-5 shrink-0 text-[7px] text-zinc-700">
                              {String(index + 1).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[9px] font-medium text-zinc-300">
                                {genre.name}
                              </p>

                              <div className="mt-1 h-px max-w-[150px] bg-zinc-900">
                                <div
                                  className="h-px bg-violet-400/45"
                                  style={{
                                    width:
                                      maxGross > 0
                                        ? `${
                                            (genre.gross /
                                              maxGross) *
                                            100
                                          }%`
                                        : "0%",
                                  }}
                                />
                              </div>
                            </div>

                            <span className="shrink-0 text-[9px] text-zinc-400">
                              {formatCrores(
                                genre.gross
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* MOST HIT GENRE */}
                  <div className="border-t border-zinc-900 bg-black/40 px-4 py-4 sm:px-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-violet-400">
                          Most Theatrical Hits
                        </p>

                        <p className="mt-1 text-[11px] font-medium text-zinc-200">
                          {industry.hitGenre?.name ||
                            "—"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-zinc-300">
                          {industry.hitGenre?.count || 0}
                        </p>

                        <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-700">
                          Hit Movies
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            03 — SOUTH INDIAN MARKETS
        ===================================================== */}

        <section className="mt-10 pb-10">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400">
            03 · South Indian Markets
          </p>

          <h2 className="mt-2 text-lg font-medium tracking-[-0.025em] text-yellow-400 sm:text-xl">
            South Indian Audiences and thier favorite Genres
          </h2>

          <p className="mt-2 text-[9px] leading-4 text-zinc-500">
            Genre performance across Kerala, Tamil Nadu,
            Karnataka and Telugu States.
          </p>

          <SouthIndianMarketsBanner />

          <div className="mt-5 space-y-3">
            {southMarketAnalysis.map((market) => {
              const maxGross =
                market.topGenres[0]?.gross || 0;

              return (
                <div
                  key={market.key}
                  className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950"
                >
                  {/* MARKET HEADER */}
                  <div className="border-b border-zinc-900 px-4 py-4 sm:px-5">
                    <p className="text-[7px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                      South Indian Market
                    </p>

                    <h3 className="mt-1 text-sm font-medium text-pink-400 sm:text-base">
                      {market.name}
                    </h3>
                  </div>

                  {/* TOP 5 GENRES */}
                  <div className="px-4 py-3 sm:px-5">
                    <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-violet-400">
                      Top 5 Genres by Market Gross
                    </p>

                    <div className="mt-3">
                      {market.topGenres.length > 0 ? (
                        market.topGenres.map(
                          (genre, index) => (
                            <div
                              key={genre.id}
                              className="flex items-center gap-3 border-b border-zinc-900 py-2.5 last:border-b-0"
                            >
                              {/* RANK */}
                              <span className="w-5 shrink-0 text-[7px] text-zinc-700">
                                {String(index + 1).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              {/* GENRE */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[9px] font-medium text-zinc-300">
                                  {genre.name}
                                </p>

                                <div className="mt-1 h-px max-w-[150px] bg-zinc-900">
                                  <div
                                    className="h-px bg-violet-400/45"
                                    style={{
                                      width:
                                        maxGross > 0
                                          ? `${
                                              (genre.gross /
                                                maxGross) *
                                              100
                                            }%`
                                          : "0%",
                                    }}
                                  />
                                </div>
                              </div>

                              {/* GROSS */}
                              <span className="shrink-0 text-[9px] text-zinc-400">
                                {formatCrores(
                                  genre.gross
                                )}
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        <p className="py-4 text-[8px] text-zinc-700">
                          No market data available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* METHODOLOGY */}
          <div className="mt-4 rounded-lg border border-zinc-900/80 bg-zinc-950/50 px-4 py-3">
            <p className="text-[7px] uppercase tracking-[0.16em] text-red-500">
              JMI Methodology
            </p>

            <p className="mt-1 text-[8px] leading-4 text-zinc-500">
              Market genre performance is calculated from
              state-wise JMI theatrical gross. Kerala, Tamil
              Nadu and Karnataka use their respective state
              markets, while Telugu States combines Andhra
              Pradesh and Telangana. A movie's market gross is
              attributed to each genre assigned to that movie.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}