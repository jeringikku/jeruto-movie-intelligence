import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    personId: string;
    roleId: string;
  }>;
};

type Credit = {
  id: number;
  movie_id: number;
  movie_title: string;
  release_year: number | null;
  role_name: string | null;
  credit_type: string | null;
  character_name: string | null;
  billing_order: number | null;
  india_gross: number;
  overseas_gross: number;
  worldwide_gross: number;
  theatrical_verdict: string | null;
  production_budget_official: number;
  production_budget_trade: number;
};

type TerritoryStat = {
  state_id: number;
  state_name: string;
  total_gross: number;
  movie_count: number;
  average_market_value: number;
};

type RoleTerritoryRecord = {
  territory: string;
  record_type: "opening" | "final";
  gross_amount: number | null;
};

type DailyCollection = {
  movie_id: number;
  movie_title: string;
  gross_jmi: number;
  day_number: number;
};

type Award = {
  id: number;
  movie_id: number;
  award_name: string | null;
  awarding_body: string | null;
  category: string | null;
  award_year: number | null;
  recipient: string | null;
  result: string | null;
};

type YearStats = {
  year: number;
  gross: number;
  movies: number;
  hits: number;
};

type RoleProfile = {
  section_name: string | null;
  full_name: string | null;
  profile_image_url: string | null;
  age: number | null;
  short_bio: string | null;
};

function formatCrores(value: number) {
  if (!value || value <= 0) return "—";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  return `₹${(value / 100000).toFixed(2)} L`;
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) return "0.0%";
  return `${value.toFixed(1)}%`;
}

function normalizeVerdict(verdict: string | null) {
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

function isFlop(verdict: string | null) {
  return normalizeVerdict(verdict).includes("flop");
}

function isBlockbuster(verdict: string | null) {
  return normalizeVerdict(verdict).includes("blockbuster");
}

function CareerChart({
  data,
  title,
  subtitle,
  type,
}: {
  data: YearStats[];
  title: string;
  subtitle: string;
  type: "gross" | "hits";
}) {
  if (data.length < 2) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold text-zinc-200">
          {title}
        </h3>

        <p className="mt-1 text-[10px] text-zinc-600">
          {subtitle}
        </p>

        <div className="mt-5 flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-zinc-800">
          <p className="text-[10px] text-zinc-600">
            Not enough career data to draw this graph.
          </p>
        </div>
      </div>
    );
  }

  const width = 900;
  const height = 320;

  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 50;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((item) =>
    type === "gross" ? item.gross : item.hits
  );

  const maxValue = Math.max(...values, 1);

  const points = data.map((item, index) => {
    const value = type === "gross" ? item.gross : item.hits;

    const x =
      paddingLeft +
      (index / Math.max(data.length - 1, 1)) *
        chartWidth;

    const y =
      paddingTop +
      chartHeight -
      (value / maxValue) * chartHeight;

    return {
      x,
      y,
      value,
      year: item.year,
    };
  });

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h3 className="text-sm font-semibold text-zinc-200">
        {title}
      </h3>

      <p className="mt-1 text-[10px] text-zinc-600">
        {subtitle}
      </p>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[650px] w-full"
        >
          {[0, 1, 2, 3, 4].map((index) => {
            const y =
              paddingTop +
              (index / 4) * chartHeight;

            return (
              <line
                key={index}
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y}
                y2={y}
                stroke="#27272a"
              />
            );
          })}

          <line
            x1={paddingLeft}
            x2={paddingLeft}
            y1={paddingTop}
            y2={height - paddingBottom}
            stroke="#52525b"
          />

          <line
            x1={paddingLeft}
            x2={width - paddingRight}
            y1={height - paddingBottom}
            y2={height - paddingBottom}
            stroke="#52525b"
          />

          <path
            d={path}
            fill="none"
            stroke="#facc15"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.year}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#facc15"
              />

              <text
                x={point.x}
                y={height - paddingBottom + 25}
                textAnchor="middle"
                fill="#71717a"
                fontSize="11"
              >
                {point.year}
              </text>

              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
              >
                {type === "gross"
                  ? formatCrores(point.value)
                  : point.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ personId: string; roleId: string }>;
}): Promise<Metadata> {
  const { personId, roleId } = await params;

  const [{ data: person }, { data: role }] = await Promise.all([
    supabase
      .from("people")
      .select("id, full_name, original_name, profile_image_url")
      .eq("id", personId)
      .maybeSingle(),

    supabase
      .from("person_roles")
      .select("id, name")
      .eq("id", roleId)
      .maybeSingle(),
  ]);

  if (!person || !role) {
    return {
      title: "Person Profile Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const personName =
    person.full_name || person.original_name || "Person";

  const roleName = role.name || "Film Industry";

  const title = `${personName} — ${roleName} Career & Box Office Intelligence`;

  const description =
    `${personName} — ${roleName} career, movies, box office performance, ` +
    `regional markets, business and film industry intelligence from ` +
    `Jeruto Movie Intelligence.`;

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: `https://jeruto.com/preview/people/${person.id}/${role.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://jeruto.com/preview/people/${person.id}/${role.id}`,
      siteName: "Jeruto Movie Intelligence",
      type: "website",
    },
  };

  if (person.profile_image_url) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [
        {
          url: person.profile_image_url,
          alt: `${personName} profile,`
        },
      ],
    };
  }

  return metadata;
}

export default async function PersonRoleIntelligencePage({
  params,
}: Props) {
  const { personId: personIdParam, roleId: roleIdParam } =
    await params;

  const personId = Number(personIdParam);
  const roleId = Number(roleIdParam);

  if (!Number.isFinite(personId) || !Number.isFinite(roleId)) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm text-red-400">
            Invalid person or role.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PERSON
  // ============================================================

  const { data: person, error: personError } =
    await supabase
      .from("people")
      .select(
        `
        id,
        full_name,
        original_name,
        profile_image_url
      `
      )
      .eq("id", personId)
      .single();

  if (personError || !person) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm text-zinc-500">
            Person not found.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ROLE
  // ============================================================

  const { data: role, error: roleError } =
    await supabase
      .from("person_roles")
      .select(
        `
        id,
        name
      `
      )
      .eq("id", roleId)
      .single();

  if (roleError || !role) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm text-zinc-500">
            Role not found.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ROLE PROFILE
  // ============================================================

  const { data: roleProfileData } =
    await supabase
      .from("person_role_intelligence_profiles")
      .select(
        `
        section_name,
        full_name,
        profile_image_url,
        age,
        short_bio
      `
      )
      .eq("person_id", personId)
      .eq("role_id", roleId)
      .maybeSingle();

  const roleProfile: RoleProfile = {
    section_name:
      roleProfileData?.section_name ?? null,
    full_name:
      roleProfileData?.full_name ?? null,
    profile_image_url:
      roleProfileData?.profile_image_url ?? null,
    age:
      roleProfileData?.age !== null &&
      roleProfileData?.age !== undefined
        ? Number(roleProfileData.age)
        : null,
    short_bio:
      roleProfileData?.short_bio ?? null,
  };

  // ============================================================
  // ROLE-SPECIFIC CREDITS
  // ============================================================

  const { data: creditData, error: creditError } =
    await supabase
      .from("movie_people")
      .select(
        `
        id,
        movie_id,
        character_name,
        billing_order,
        movies (
          id,
          title,
          release_year
        ),
        person_roles (
          id,
          name
        ),
        credit_types (
          name
        )
      `
      )
      .eq("person_id", personId)
      .eq("role_id", roleId)
      .order("id", { ascending: true });

  if (creditError) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm text-red-400">
            Could not load role-specific credits.
          </p>
        </div>
      </div>
    );
  }

  const movieIds = Array.from(
    new Set(
      (creditData || []).map((row: any) =>
        Number(row.movie_id)
      )
    )
  );

  // ============================================================
  // STATE BOX OFFICE
  // ============================================================

  let stateRows: any[] = [];

  if (movieIds.length > 0) {
    const { data } = await supabase
      .from("movie_state_box_office")
      .select(
        `
        movie_id,
        state_id,
        gross_jmi
      `
      )
      .in("movie_id", movieIds);

    stateRows = data || [];
  }

  // ============================================================
  // OVERSEAS
  // ============================================================

  let overseasRows: any[] = [];

  if (movieIds.length > 0) {
    const { data } = await supabase
      .from("movie_overseas_box_office")
      .select(
        `
        movie_id,
        gross_inr
      `
      )
      .in("movie_id", movieIds);

    overseasRows = data || [];
  }

  // ============================================================
  // MOVIE BUSINESS
  // ============================================================

  let businessRows: any[] = [];

  if (movieIds.length > 0) {
    const { data } = await supabase
      .from("movie_business")
      .select(
        `
        movie_id,
        theatrical_verdict,
        production_budget_official,
        production_budget_trade
      `
      )
      .in("movie_id", movieIds);

    businessRows = data || [];
  }

  // ============================================================
  // FORMAT CREDITS
  // ============================================================

  const credits: Credit[] = (creditData || []).map(
    (row: any) => {
      const movieId = Number(row.movie_id);

      const indiaGross = stateRows
        .filter(
          (item) =>
            Number(item.movie_id) === movieId
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.gross_jmi || 0),
          0
        );

      const overseasGross = overseasRows
        .filter(
          (item) =>
            Number(item.movie_id) === movieId
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.gross_inr || 0),
          0
        );

      const business = businessRows.find(
        (item) =>
          Number(item.movie_id) === movieId
      );

      return {
        id: Number(row.id),
        movie_id: movieId,
        movie_title:
          row.movies?.title || "Unknown Movie",
        release_year:
          row.movies?.release_year ?? null,
        role_name:
          row.person_roles?.name ||
          role.name,
        credit_type:
          row.credit_types?.name || null,
        character_name:
          row.character_name || null,
        billing_order:
          row.billing_order ?? null,
        india_gross: indiaGross,
        overseas_gross: overseasGross,
        worldwide_gross:
          indiaGross + overseasGross,
        theatrical_verdict:
          business?.theatrical_verdict ?? null,
        production_budget_official: Number(
          business?.production_budget_official || 0
        ),
        production_budget_trade: Number(
          business?.production_budget_trade || 0
        ),
      };
    }
  );

  // ============================================================
  // TERRITORY INTELLIGENCE
  // ============================================================

  let territoryStats: TerritoryStat[] = [];

  if (movieIds.length > 0) {
    const { data: territoryData } =
      await supabase
        .from("movie_state_box_office")
        .select(
          `
          movie_id,
          state_id,
          gross_jmi,
          states (
            id,
            name
          )
        `
        )
        .in("movie_id", movieIds);

    const territoryMap = new Map<
      number,
      {
        state_id: number;
        state_name: string;
        total_gross: number;
        movie_ids: Set<number>;
      }
    >();

    (territoryData || []).forEach(
      (row: any) => {
        if (row.state_id === null) return;

        const stateId = Number(row.state_id);
        const movieId = Number(row.movie_id);

        const stateName =
          row.states?.name ||
          "Unknown Territory";

        const gross = Number(
          row.gross_jmi || 0
        );

        if (!territoryMap.has(stateId)) {
          territoryMap.set(stateId, {
            state_id: stateId,
            state_name: stateName,
            total_gross: 0,
            movie_ids:
              new Set<number>(),
          });
        }

        const territory =
          territoryMap.get(stateId)!;

        territory.total_gross += gross;
        territory.movie_ids.add(movieId);
      }
    );

    territoryStats = Array.from(
      territoryMap.values()
    )
      .map((territory) => {
        const movieCount =
          territory.movie_ids.size;

        return {
          state_id:
            territory.state_id,
          state_name:
            territory.state_name,
          total_gross:
            territory.total_gross,
          movie_count:
            movieCount,
          average_market_value:
            movieCount > 0
              ? territory.total_gross /
                movieCount
              : 0,
        };
      })
      .sort(
        (a, b) =>
          b.total_gross -
          a.total_gross
      )
      .slice(0, 5);
  }

  // ============================================================
  // MANUAL TERRITORY OPENING / FINAL RECORDS
  // ============================================================

  let roleTerritoryRecords: RoleTerritoryRecord[] = [];

  {
    const {
      data: manualTerritoryData,
      error: manualTerritoryError,
    } = await supabase
      .from("person_role_records")
      .select(
        `
        territory,
        record_type,
        gross_amount
      `
      )
      .eq("person_id", personId)
      .eq("role_id", roleId);

    if (manualTerritoryError) {
      console.error(
        "Manual territory records error:",
        manualTerritoryError
      );
    } else {
      roleTerritoryRecords =
  (manualTerritoryData || [])
    .filter(
      (row: any) =>
        String(row.record_type)
          .toLowerCase()
          .includes("opening") ||
        String(row.record_type)
          .toLowerCase()
          .includes("final")
    )
    .map((row: any) => ({
      territory: row.territory,
      record_type:
        String(row.record_type)
          .toLowerCase()
          .includes("opening")
          ? "opening"
          : "final",
      gross_amount:
        row.gross_amount !== null
          ? Number(row.gross_amount)
          : null,
    }));
    }
  }

  // ============================================================
  // DAY 1
  // ============================================================

  let dailyCollections: DailyCollection[] =
    [];

  if (movieIds.length > 0) {
    const { data: dailyData } =
      await supabase
        .from("movie_daily_box_office")
        .select(
          `
          movie_id,
          day_number,
          gross_jmi,
          movies (
            title
          )
        `
        )
        .in("movie_id", movieIds)
        .eq("day_number", 1);

    dailyCollections =
      (dailyData || []).map(
        (row: any) => ({
          movie_id:
            Number(row.movie_id),
          movie_title:
            row.movies?.title ||
            "Unknown Movie",
          gross_jmi:
            Number(row.gross_jmi || 0),
          day_number:
            Number(row.day_number),
        })
      );
  }

  // ============================================================
  // AWARDS
  // ============================================================

  let awards: Award[] = [];

  if (movieIds.length > 0) {
    const { data: awardData } =
      await supabase
        .from("movie_awards")
        .select(
          `
          id,
          movie_id,
          award_name,
          awarding_body,
          category,
          award_year,
          recipient,
          result
        `
        )
        .in("movie_id", movieIds);

    awards = (awardData ||
      []) as Award[];
  }

  // ============================================================
  // UNIQUE MOVIES
  // ============================================================

  const uniqueMovieMap =
    new Map<number, Credit>();

  credits.forEach((credit) => {
    if (
      !uniqueMovieMap.has(
        credit.movie_id
      )
    ) {
      uniqueMovieMap.set(
        credit.movie_id,
        credit
      );
    }
  });

  const uniqueMovies =
    Array.from(
      uniqueMovieMap.values()
    );

  // ============================================================
  // CAREER
  // ============================================================

  const totalMovies =
    uniqueMovies.length;

  const totalCredits =
    credits.length;

  const years = credits
    .map(
      (credit) =>
        credit.release_year
    )
    .filter(
      (year): year is number =>
        year !== null
    );

  const firstYear =
    years.length > 0
      ? Math.min(...years)
      : null;

  const latestYear =
    years.length > 0
      ? Math.max(...years)
      : null;

  const careerSpan =
    firstYear !== null &&
    latestYear !== null
      ? latestYear -
        firstYear +
        1
      : 0;

  // ============================================================
  // LEAD / SUPPORTING
  // ============================================================

  const leadCredits =
    credits.filter(
      (credit) => {
        const type =
          credit.credit_type
            ?.toLowerCase()
            .trim();

        return (
          type === "lead role" ||
          type === "lead actress" ||
          type === "lead actor" ||
          type === "hero" ||
          type === "heroine"
        );
      }
    );

  const leadMovieIds =
    new Set(
      leadCredits.map(
        (credit) =>
          credit.movie_id
      )
    );

  const leadMovies =
    Array.from(
      leadMovieIds
    )
      .map((movieId) =>
        credits.find(
          (credit) =>
            credit.movie_id ===
            movieId
        )
      )
      .filter(
        (
          credit
        ): credit is Credit =>
          !!credit
      );

  const supportingMovies =
    totalMovies -
    leadMovies.length;

  // ============================================================
  // BOX OFFICE
  // ============================================================

  const totalIndiaGross =
    uniqueMovies.reduce(
      (sum, movie) =>
        sum + movie.india_gross,
      0
    );

  const totalOverseasGross =
    uniqueMovies.reduce(
      (sum, movie) =>
        sum +
        movie.overseas_gross,
      0
    );

  const totalWorldwideGross =
    uniqueMovies.reduce(
      (sum, movie) =>
        sum +
        movie.worldwide_gross,
      0
    );

  const averageGross =
    uniqueMovies.length > 0
      ? totalWorldwideGross /
        uniqueMovies.length
      : 0;

  const averageLeadGross =
    leadMovies.length > 0
      ? leadMovies.reduce(
          (sum, movie) =>
            sum +
            movie.worldwide_gross,
          0
        ) /
        leadMovies.length
      : 0;

  // ============================================================
  // PERFORMANCE
  // ============================================================

  const hitMovies =
    uniqueMovies.filter(
      (movie) =>
        isHit(
          movie.theatrical_verdict
        )
    );

  const flopMovies =
    uniqueMovies.filter(
      (movie) =>
        isFlop(
          movie.theatrical_verdict
        )
    );

  const blockbusterMovies =
    uniqueMovies.filter(
      (movie) =>
        isBlockbuster(
          movie.theatrical_verdict
        )
    );

  const hitRate =
    totalMovies > 0
      ? (hitMovies.length /
          totalMovies) *
        100
      : 0;

  const flopRate =
    totalMovies > 0
      ? (flopMovies.length /
          totalMovies) *
        100
      : 0;

  const blockbusterRate =
    totalMovies > 0
      ? (blockbusterMovies.length /
          totalMovies) *
        100
      : 0;

  const verdictAvailableMovies =
    uniqueMovies.filter(
      (movie) =>
        !!movie.theatrical_verdict
    );

  const verdictCoverage =
    totalMovies > 0
      ? (verdictAvailableMovies.length /
          totalMovies) *
        100
      : 0;

  // ============================================================
  // LEAD PERFORMANCE
  // ============================================================

  const leadHitMovies =
    leadMovies.filter(
      (movie) =>
        isHit(
          movie.theatrical_verdict
        )
    );

  const leadFlopMovies =
    leadMovies.filter(
      (movie) =>
        isFlop(
          movie.theatrical_verdict
        )
    );

  const leadBlockbusterMovies =
    leadMovies.filter(
      (movie) =>
        isBlockbuster(
          movie.theatrical_verdict
        )
    );

  const leadHitRate =
    leadMovies.length > 0
      ? (leadHitMovies.length /
          leadMovies.length) *
        100
      : 0;

  // ============================================================
  // BUDGET
  // ============================================================

  const moviesWithBudget =
    uniqueMovies.filter(
      (movie) =>
        movie.production_budget_official >
          0 ||
        movie.production_budget_trade >
          0
    );

  const getMovieBudget = (
    movie: Credit
  ) =>
    movie.production_budget_official >
    0
      ? movie.production_budget_official
      : movie.production_budget_trade;

      const highestBudgetMovie =
    moviesWithBudget.length > 0
      ? [...moviesWithBudget].sort(
          (a, b) =>
            getMovieBudget(b) -
            getMovieBudget(a)
        )[0]
      : null;

  const successfulBudgetMovies =
    moviesWithBudget.filter(
      (movie) =>
        isHit(
          movie.theatrical_verdict
        )
    );

  

  const highestSuccessfullyRecoveredBudgetMovie =
    successfulBudgetMovies.length >
    0
      ? [
          ...successfulBudgetMovies,
        ].sort(
          (a, b) =>
            getMovieBudget(b) -
            getMovieBudget(a)
        )[0]
      : null;

  const highestSuccessfullyRecoveredBudget =
    highestSuccessfullyRecoveredBudgetMovie
      ? getMovieBudget(
          highestSuccessfullyRecoveredBudgetMovie
        )
      : 0;

  const averageProductionBudget =
    moviesWithBudget.length > 0
      ? moviesWithBudget.reduce(
          (sum, movie) =>
            sum +
            getMovieBudget(movie),
          0
        ) /
        moviesWithBudget.length
      : 0;

  const averageSuccessfulBudget =
    successfulBudgetMovies.length >
    0
      ? successfulBudgetMovies.reduce(
          (sum, movie) =>
            sum +
            getMovieBudget(movie),
          0
        ) /
        successfulBudgetMovies.length
      : 0;

  // ============================================================
  // HIGHLIGHTS
  // ============================================================

  const highestGrossingMovie =
    uniqueMovies.length > 0
      ? [...uniqueMovies].sort(
          (a, b) =>
            b.worldwide_gross -
            a.worldwide_gross
        )[0]
      : null;

  const highestGrossingLeadMovie =
    leadMovies.length > 0
      ? [...leadMovies].sort(
          (a, b) =>
            b.worldwide_gross -
            a.worldwide_gross
        )[0]
      : null;

  const lowestGrossingMovie =
    uniqueMovies.length > 0
      ? [...uniqueMovies].sort(
          (a, b) =>
            a.worldwide_gross -
            b.worldwide_gross
        )[0]
      : null;

  const biggestHit =
    hitMovies.length > 0
      ? [...hitMovies].sort(
          (a, b) =>
            b.worldwide_gross -
            a.worldwide_gross
        )[0]
      : null;

  const biggestFlop =
    flopMovies.length > 0
      ? [...flopMovies].sort(
          (a, b) =>
            a.worldwide_gross -
            b.worldwide_gross
        )[0]
      : null;

  // ============================================================
  // DAY 1
  // ============================================================

  const biggestDay1 =
    dailyCollections.length > 0
      ? [...dailyCollections].sort(
          (a, b) =>
            b.gross_jmi -
            a.gross_jmi
        )[0]
      : null;

  const averageDay1 =
    dailyCollections.length > 0
      ? dailyCollections.reduce(
          (sum, item) =>
            sum + item.gross_jmi,
          0
        ) /
        dailyCollections.length
      : 0;

  // ============================================================
  // AWARDS WON
  // ============================================================

  const wonAwards =
    awards.filter((award) => {
      const result =
        award.result
          ?.toLowerCase()
          .trim();

      const recipient =
        award.recipient
          ?.toLowerCase() || "";

      const fullName =
        person.full_name
          .toLowerCase();

      const originalName =
        person.original_name
          ?.toLowerCase() || "";

      return (
        (result === "won" ||
          result === "winner" ||
          result === "win") &&
        (recipient.includes(
          fullName
        ) ||
          (originalName &&
            recipient.includes(
              originalName
            )))
      );
    });

  // ============================================================
  // CAREER GRAPH
  // ============================================================

  const careerGraphMap =
    new Map<number, YearStats>();

  uniqueMovies.forEach(
    (movie) => {
      if (!movie.release_year)
        return;

      if (
        !careerGraphMap.has(
          movie.release_year
        )
      ) {
        careerGraphMap.set(
          movie.release_year,
          {
            year:
              movie.release_year,
            gross: 0,
            movies: 0,
            hits: 0,
          }
        );
      }

      const yearData =
        careerGraphMap.get(
          movie.release_year
        )!;

      yearData.gross +=
        movie.worldwide_gross;

      yearData.movies += 1;

      if (
        isHit(
          movie.theatrical_verdict
        )
      ) {
        yearData.hits += 1;
      }
    }
  );

  const careerGraphData =
    Array.from(
      careerGraphMap.values()
    ).sort(
      (a, b) =>
        a.year - b.year
    );

  const profileImage =
    roleProfile.profile_image_url ||
    person.profile_image_url ||
    null;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-black text-zinc-200">

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6">

        {/* BACK */}

        <div className="mb-4">
          <Link
            href={`/preview/people/${person.id}`}
            className="inline-flex items-center gap-2 text-[10px] text-violet-500 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Person Intelligence</span>
          </Link>
        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">

          <div className="flex items-center gap-4">

            {profileImage ? (
              <img
                src={profileImage}
                alt={person.full_name}
                className="h-20 w-20 shrink-0 rounded-full border border-zinc-800 object-cover sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-2xl font-semibold text-yellow-400 sm:h-24 sm:w-24">
                {person.full_name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0">

              <p className="text-[9px] uppercase tracking-[0.22em] text-yellow-500">
                JMI Role Intelligence
              </p>

              <h1 className="mt-1 truncate text-lg font-semibold text-white sm:text-xl">
                {person.full_name}
              </h1>

              <div className="mt-2 inline-flex rounded-full bg-yellow-500/10 px-2.5 py-1">
                <span className="text-[9px] font-medium text-yellow-400">
                  {role.name} Career
                </span>
              </div>

              <p className="mt-2 text-[9px] leading-4 text-zinc-500">
                Role-specific intelligence calculated
                exclusively from {role.name.toLowerCase()} credits.
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            ROLE PROFILE
        ===================================================== */}

        <section className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">

          <div className="mb-4">

            <h2 className="text-sm font-semibold text-white">
              {roleProfile.section_name ||
                `${role.name} Profile`
              }</h2>

            <p className="mt-1 text-[9px] text-zinc-500">
              Role-specific profile information
            </p>

          </div>

          <div className="flex gap-4">

            {profileImage ? (
              <img
                src={profileImage}
                alt={roleProfile.full_name || person.full_name}
                className="h-16 w-16 shrink-0 rounded-lg border border-zinc-800 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xl font-semibold text-yellow-400">
                {person.full_name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">

              <p className="text-[7px] uppercase tracking-wide text-yellow-400">
                Full Name
              </p>

              <p className="mt-1 text-sm font-smallbold text-white">
                {roleProfile.full_name ||
                  person.full_name}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-4">

                <div>
                  <p className="text-[8px] uppercase tracking-wide text-yellow-400">
                    Age
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-400">
                    {roleProfile.age ?? "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-[8px] uppercase tracking-wide text-yellow-400">
                    Role
                  </p>

                  <p className="mt-1 text-[10px] text-pink-400">
                    {role.name}
                  </p>
                </div>

              </div>

            </div>

          </div>

          <div className="mt-4 border-t border-zinc-900 pt-4">

            <p className="text-[8px] uppercase tracking-wide text-zinc-400">
              Short Bio
            </p>

            <p className="mt-1 text-[10px] leading-5 text-zinc-400">
              {roleProfile.short_bio ||
                "No biography has been added yet."}
            </p>

          </div>

        </section>

        {/* =====================================================
            EXECUTIVE DASHBOARD
        ===================================================== */}

        <section className="mt-7">

          <div className="mb-4">
            <h2 className="text-sm font-semibold text-violet-400">
              Executive Dashboard
            </h2>

            <p className="mt-2 text-[10px] text-zinc-400">
              High-level intelligence for {person.full_name}'s{" "}
              {role.name.toLowerCase()} career
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 ">

            <StatCard label="Total Movies Acted" value={totalMovies} />

            <StatCard label=" Movies In Lead Role " value={leadMovies.length} />

            <StatCard
              label="Total Worldwide Gross"
              value={formatCrores(totalWorldwideGross)}
            />

            <StatCard
              label="Average Gross / Movie"
              value={formatCrores(averageGross)}
            />

            <StatCard
              label="Successful Movies"
              value={hitMovies.length}
            />

            <StatCard
              label="Success Rate"
              value={formatPercentage(hitRate)}
            />

            <StatCard
              label="Blockbusters"
              value={blockbusterMovies.length}
            />

            <StatCard
              label="Flops"
              value={flopMovies.length}
            />

          </div>

        </section>

        {/* =====================================================
            ROLE PERFORMANCE
        ===================================================== */}

        <section className="mt-7">

          <SectionHeading
            title="Role Performance Breakdown"
            subtitle="Comparison between lead and supporting appearances"
          />

          <div className="grid gap-3 md:grid-cols-2">

            <div className="rounded-xl border border-zinc-800 bg-violet-550 p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[9px] uppercase tracking-wide text-pink-400">
                    Lead Career
                  </p>

                  <h3 className="mt-1 text-sm font-semibold text-white">
                    {leadMovies.length} Movies
                  </h3>
                </div>

                <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-[9px] text-yellow-400">
                  {formatPercentage(leadHitRate)}
                </span>

              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">

                <MiniStat
                  label="Hits"
                  value={leadHitMovies.length}
                />

                <MiniStat
                  label="Blockbusters"
                  value={leadBlockbusterMovies.length}
                />

                <MiniStat
                  label="Flops"
                  value={leadFlopMovies.length}
                />

              </div>

              <div className="mt-4 border-t border-zinc-900 pt-3">

                <p className="text-[9px] text-zinc-400">
                  Average Lead Movie Gross
                </p>

                <p className="mt-1 text-sm font-semibold text-yellow-400">
                  {formatCrores(averageLeadGross)}
                </p>

              </div>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

              <p className="text-[9px] uppercase tracking-wide text-pink-400">
                Supporting / Other
              </p>

              <h3 className="mt-1 text-sm font-semibold text-white">
                {supportingMovies} Movies
              </h3>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-400">

                <div
                  className="h-full rounded-full bg-yellow-500"
                  style={{
                    width:
                      totalMovies > 0
                        ? `${Math.min(
                            100,
                            (supportingMovies /
                              totalMovies) *
                              100
                          )}%`
                        : "0%",
                  }}
                />

              </div>

              <div className="mt-2 flex justify-between text-[8px] text-zinc-700">

                <span>Supporting share</span>

                <span>
                  {formatPercentage(
                    totalMovies > 0
                      ? (supportingMovies /
                          totalMovies) *
                          100
                      : 0
                  )}
                </span>

              </div>

            </div>

          </div>

        </section>

       

        {/* =====================================================
            CAREER OVERVIEW
        ===================================================== */}

        <section className="mt-7">

          <SectionHeading
            title={`${role.name} Career Overview`}
            subtitle="Core career statistics calculated only from this role"
          />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

            <StatCard
              label={`${role.name} Movies`}
              value={totalMovies}
            />

            <StatCard
              label="Lead Movies"
              value={leadMovies.length}
            />

            <StatCard
              label="Supporting / Other"
              value={supportingMovies}
            />

            <StatCard
              label="Career Span"
              value={
                careerSpan > 0
                  ? `${careerSpan} Years`
                  : "—"
              }
            />

            <StatCard
              label="First Year"
              value={firstYear ?? "—"}
            />

            <StatCard
              label="Latest Year"
              value={latestYear ?? "—"}
            />

          </div>

        </section>

        {/* =====================================================
            BOX OFFICE
        ===================================================== */}

        <section className="mt-7">

          <SectionHeading
            title={`${role.name} Box Office Intelligence`}
            subtitle="Aggregate box-office performance of this role-specific filmography"
          />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

            <StatCard
              label="India Gross"
              value={formatCrores(totalIndiaGross)}
            />

            <StatCard
              label="Overseas Gross"
              value={formatCrores(totalOverseasGross)}
            />

            <StatCard
              label="Worldwide Gross"
              value={formatCrores(totalWorldwideGross)}
            />

            <StatCard
              label="Average / Movie"
              value={formatCrores(averageGross)}
            />

            <StatCard
              label="Average Lead Movie Gross"
              value={formatCrores(averageLeadGross)}
            />

            <StatCard
              label="Average Day 1"
              value={formatCrores(averageDay1)}
            />

          </div>

        </section>

        {/* =====================================================
            PERFORMANCE
        ===================================================== */}

        <section className="mt-7">

          <SectionHeading
            title={`${role.name} Performance Intelligence`}
            subtitle="Success profile based on available JMI business verdicts"
          />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">

            <StatCard
              label="Successful Movies"
              value={hitMovies.length}
            />

            <StatCard
              label="Flops"
              value={flopMovies.length}
            />

            <StatCard
              label="Blockbusters"
              value={blockbusterMovies.length}
            />

            <StatCard
              label="Blockbuster Rate"
              value={formatPercentage(blockbusterRate)}
            />

            <StatCard
              label="Hit Rate"
              value={formatPercentage(hitRate)}
            />

            <StatCard
              label="Flop Rate"
              value={formatPercentage(flopRate)}
            />

            <StatCard
              label="Awards Won"
              value={wonAwards.length}
            />

            <StatCard
              label="Verdict Coverage"
              value={formatPercentage(
                verdictCoverage
              )}
            />

          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">

          </div>

        </section>

        {/* =====================================================
            TERRITORY
        ===================================================== */}

        <section className="mt-7">

          <SectionHeading
            title="Territory Intelligence"
            subtitle="Top 5 Highest Perfoming Territories & Average Market Value of this Person "
          />

          {territoryStats.length === 0 ? (

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-[10px] text-zinc-600">
                No territory box-office data available.
              </p>
            </div>

          ) : (

            <div className="space-y-2">

              {territoryStats.map(
                (territory, index) => (
                  <div
                    key={territory.state_id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-[9px] font-semibold text-yellow-400">
                          #{index + 1}
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-xs font-semibold text-white">
                            {territory.state_name}
                          </h3>

                          <p className="mt-1 text-[9px] text-zinc-500">
                            {territory.movie_count}{" "}
                            {territory.movie_count === 1
                              ? "movie"
                              : "movies"}
                          </p>

                        </div>

                      </div>

                      <div className="shrink-0 text-right">

                        <p className="text-sm font-semibold text-yellow-400">
                          {formatCrores(
                            territory.total_gross
                          )}
                        </p>

                        <p className="mt-1 text-[9px] text-zinc-400">
                          Avg Market Value {" "}
                          {formatCrores(
                            territory.average_market_value
                          )}
                        </p>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          )}

          {/* =====================================================
              MANUAL TERRITORY OPENING / FINAL BENCHMARKS
          ===================================================== */}

          {roleTerritoryRecords.length > 0 && (
            <div className="mt-6">

              <div className="mb-4">

                <h3 className="text-sm font-semibold text-violet-400">
                  Territory Opening & Final Benchmarks
                </h3>

                <p className="mt-1 text-[9px] text-zinc-400">
                  The Biggest Opening and Final figures of this person on this role at Each territory
                
                </p>

              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">

                <table className="w-full min-w-[600px] text-xs">

                  <thead>

                    <tr className="border-b border-zinc-800">

                      <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-wide text-pink-400">
                        Territory
                      </th>

                      <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-wide text-pink-400">
                        Top Opening
                      </th>

                      <th className="px-4 py-3 text-left text-[9px] font-medium uppercase tracking-wide text-zinc-600">
                       Top Final
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {[
                      "Kerala",
                      "Karnataka",
                      "Tamil Nadu",
                      "Telugu States",
                      "Worldwide",
                    ].map((territory) => {

                      const openingRecord =
                        roleTerritoryRecords.find(
                          (record) =>
                            record.territory === territory &&
                            record.record_type === "opening"
                        );

                      const finalRecord =
                        roleTerritoryRecords.find(
                          (record) =>
                            record.territory === territory &&
                            record.record_type === "final"
                        );

                      const hasOpening =
                        openingRecord?.gross_amount !== null &&
                        openingRecord?.gross_amount !== undefined &&
                        openingRecord.gross_amount > 0;

                      const hasFinal =
                        finalRecord?.gross_amount !== null &&
                        finalRecord?.gross_amount !== undefined &&
                        finalRecord.gross_amount > 0;

                      if (!hasOpening && !hasFinal) {
                        return null;
                      }

                      return (
                        <tr
                          key={territory}
                          className="border-b border-zinc-800/60 last:border-0"
                        >

                          <td className="px-4 py-3 font-medium text-zinc-200">
                            {territory}
                          </td>

                          <td className="px-4 py-3">

                            {hasOpening ? (
                              <span className="font-semibold text-yellow-400">
                                {formatCrores(
                                  openingRecord!.gross_amount!
                                )}
                              </span>
                            ) : (
                              <span className="text-zinc-700">
                                —
                              </span>
                            )}

                          </td>

                          <td className="px-4 py-3">

                            {hasFinal ? (
                              <span className="font-semibold text-zinc-200">
                                {formatCrores(
                                  finalRecord!.gross_amount!
                                )}
                              </span>
                            ) : (
                              <span className="text-zinc-700">
                                —
                              </span>
                            )}

                          </td>

                        </tr>
                      );

                    })}

                  </tbody>

                </table>

              </div>

             
            </div>
          )}

        </section>

        {/* =====================================================
            OPENING
        ===================================================== */}

        <section className="mt-7">

          <SectionHeading
            title="Opening Intelligence"
            subtitle="Automatic Day 1 performance from role-specific movies"
          />

          <div className="grid grid-cols-2 gap-2">

            <StatCard
              label="Highest Day 1 ( Domestic ) "
              value={
                biggestDay1
                  ? formatCrores(
                      biggestDay1.gross_jmi
                    )
                  : "—"
              }
            />

            <StatCard
              label="Average Day 1"
              value={formatCrores(
                averageDay1
              )}
            />

          </div>

          {biggestDay1 && (
            <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

              <p className="text-[8px] uppercase tracking-wide text-zinc-400">
                Biggest Role-Associated Day 1
              </p>

              <div className="mt-2 flex items-center justify-between gap-4">

                <div className="min-w-0">

                  <h3 className="truncate text-sm font-semibold text-white">
                    {biggestDay1.movie_title}
                  </h3>

                  <p className="mt-1 text-[9px] text-zinc-400">
                    Highest recorded Day 1 in this role's filmography
                  </p>

                </div>

                <p className="shrink-0 text-sm font-semibold text-yellow-400">
                  {formatCrores(
                    biggestDay1.gross_jmi
                  )}
                </p>

              </div>

            </div>
          )}

        </section>

         {/* =====================================================
            BUDGET
        ===================================================== */}

        <section className="mt-7">

          <SectionHeading
            title="Budget Intelligence"
            subtitle="Production-budget benchmarks within this role's filmography"
          />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

            <StatCard
              label="Movies With Budget Data"
              value={moviesWithBudget.length}
            />

            <StatCard
              label="Average Production Budget"
              value={formatCrores(
                averageProductionBudget
              )}
            />

            <StatCard
              label="Average Successful Budget"
              value={formatCrores(
                averageSuccessfulBudget
              )}
            />

            <StatCard
              label="Safest Recoverable Budget"
              value={formatCrores(
                highestSuccessfullyRecoveredBudget
              )}
            />

          </div>

          {highestBudgetMovie && (
            <div className="mt-3 grid gap-2 md:grid-cols-2">

              <HighlightCard
  title="Highest Budget Movie"
  movie={highestBudgetMovie}
  displayValue={
    highestBudgetMovie
      ? getMovieBudget(highestBudgetMovie)
      : 0
  }
/>

              {highestSuccessfullyRecoveredBudgetMovie && (

               <HighlightCard
  title="Highest Budget Successfully Recovered"
  movie={
    highestSuccessfullyRecoveredBudgetMovie
  }
  displayValue={
    highestSuccessfullyRecoveredBudgetMovie
      ? getMovieBudget(
          highestSuccessfullyRecoveredBudgetMovie
        )
      : 0
  }
/>
              )}

            </div>
          )}

        </section>

        {/* =====================================================
            CAREER HIGHLIGHTS
        ===================================================== */}

        <section className="mt-7">

          <SectionHeading
            title="Career Highlights"
            subtitle="Major performance records within this role"
          />

          <div className="grid gap-2 md:grid-cols-2">

            <HighlightCard
              title="Highest Grossing Movie — Overall"
              movie={highestGrossingMovie}
            />

            <HighlightCard
              title="Highest Grossing Movie — Lead"
              movie={highestGrossingLeadMovie}
            />

            <HighlightCard
              title="Biggest Hit"
              movie={biggestHit}
            />

            <HighlightCard
              title="Biggest Flop"
              movie={biggestFlop}
            />

            <HighlightCard
              title="Lowest Grossing Movie"
              movie={lowestGrossingMovie}
            />

          </div>

        </section>

        {/* =====================================================
            CAREER TRAJECTORY
        ===================================================== */}

        <section className="mt-7">

          <SectionHeading
            title={`${role.name} Career Trajectory`}
            subtitle="Long-term career movement based exclusively on this role"
          />

          <div className="space-y-3">

            <CareerChart
              data={careerGraphData}
              title={`${role.name} Box-Office Trajectory`}
              subtitle="Worldwide gross generated by year"
              type="gross"
            />

            <CareerChart
              data={careerGraphData}
              title={`${role.name} Success Trajectory`}
              subtitle="Number of successful movies by year"
              type="hits"
            />

          </div>

        </section>

        {/* =====================================================
            AWARDS
        ===================================================== */}

        {wonAwards.length > 0 && (
          <section className="mt-7 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

            <div className="flex items-center justify-between gap-3">

              <div>

                <h2 className="text-sm font-semibold text-white">
                  Awards Intelligence
                </h2>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Awards where this person is recorded as the recipient
                </p>

              </div>

              <span className="text-[9px] text-zinc-600">
                {wonAwards.length} awards
              </span>

            </div>

            <div className="mt-4 space-y-2">

              {wonAwards.map((award) => (
                <div
                  key={award.id}
                  className="rounded-lg border border-zinc-900 bg-black p-3"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <h3 className="truncate text-xs font-semibold text-white">
                        {award.award_name ||
                          "Award"}
                      </h3>

                      {award.awarding_body && (
                        <p className="mt-1 text-[9px] text-yellow-400">
                          {award.awarding_body}
                        </p>
                      )}

                    </div>

                    {award.award_year && (
                      <span className="shrink-0 text-[9px] text-zinc-600">
                        {award.award_year}
                      </span>
                    )}

                  </div>

                  {award.category && (
                    <p className="mt-2 text-[9px] text-zinc-500">
                      Category:{" "}
                      <span className="text-zinc-300">
                        {award.category}
                      </span>
                    </p>
                  )}

                </div>
              ))}

            </div>

          </section>
        )}

        {/* =====================================================
            FILMOGRAPHY
        ===================================================== */}

        <section className="mt-7 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

          <div className="flex items-center justify-between gap-3">

            <div>

              <h2 className="text-sm font-semibold text-white">
                {role.name} Filmography
              </h2>

              <p className="mt-1 text-[9px] text-zinc-600">
                Complete movie history for this specific role
              </p>

            </div>

            <span className="shrink-0 text-[9px] text-zinc-600">
              {totalMovies}{" "}
              {totalMovies === 1
                ? "movie"
                : "movies"}
            </span>

          </div>

          <div className="mt-4 space-y-2">

            {credits.length === 0 ? (

              <div className="rounded-lg bg-black p-5 text-center">
                <p className="text-[10px] text-zinc-600">
                  No {role.name.toLowerCase()} credits found.
                </p>
              </div>

            ) : (

              credits.map(
                (credit) => (
                  <Link
                    key={credit.id}
                    href={`/preview/movies/${credit.movie_id}`}
                    className="block rounded-xl border border-zinc-900 bg-black p-4 transition hover:border-zinc-700"
                  >

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <h3 className="text-xs font-semibold text-white">
                          {credit.movie_title}
                        </h3>

                        <p className="mt-1 text-[8px] text-zinc-700">
                          {credit.release_year ||
                            "Release year unavailable"}
                        </p>

                        {credit.character_name && (
                          <p className="mt-2 text-[9px] text-zinc-500">
                            Character:{" "}
                            <span className="text-zinc-300">
                              {credit.character_name}
                            </span>
                          </p>
                        )}

                        {credit.billing_order !== null && (
                          <p className="mt-1 text-[8px] text-zinc-700">
                            Billing Order:{" "}
                            {credit.billing_order}
                          </p>
                        )}

                      </div>

                      <div className="flex flex-wrap gap-1.5">

                        <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-[8px] text-yellow-400">
                          {credit.role_name ||
                            role.name}
                        </span>

                        {credit.credit_type && (
                          <span className="rounded-full bg-zinc-900 px-2 py-1 text-[8px] text-zinc-500">
                            {credit.credit_type}
                          </span>
                        )}

                        {credit.theatrical_verdict && (
                          <span
                            className={`rounded-full px-2 py-1 text-[8px] ${
                              isHit(
                                credit.theatrical_verdict
                              )
                                ? "bg-yellow-500/10 text-yellow-400"
                                : isFlop(
                                    credit.theatrical_verdict
                                  )
                                ? "bg-red-500/10 text-red-400"
                                : "bg-zinc-900 text-zinc-500"
                            }`}
                          >
                            {credit.theatrical_verdict}
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-900 pt-3">

                      <div>
                        <p className="text-[8px] text-zinc-700">
                          India
                        </p>

                        <p className="mt-1 text-[9px] text-zinc-400">
                          {formatCrores(
                            credit.india_gross
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] text-zinc-700">
                          Overseas
                        </p>

                        <p className="mt-1 text-[9px] text-zinc-400">
                          {formatCrores(
                            credit.overseas_gross
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] text-zinc-700">
                          Worldwide
                        </p>

                        <p className="mt-1 text-[9px] font-semibold text-yellow-400">
                          {formatCrores(
                            credit.worldwide_gross
                          )}
                        </p>
                      </div>

                    </div>

                  </Link>
                )
              )

            )}

          </div>

        </section>

        {/* =====================================================
            DATA NOTE
        ===================================================== */}

        <section className="mt-7 rounded-xl border border-zinc-900 bg-zinc-950 p-4">

          <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-700">
            JMI Intelligence Model
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            This analysis is restricted to the selected person and
            role. Box-office figures are aggregated from available
            JMI movie-level trade data. Where source data is
            unavailable, the corresponding metric is left blank.
          </p>

        </section>

      </main>

    </div>
  );
}

// ============================================================
// SECTION HEADING
// ============================================================

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">

      <h2 className="text-sm font-semibold text-violet-400">
        {title}
      </h2>

      <p className="mt-1 text-[10px] text-zinc-400">
        {subtitle}
      </p>

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5">

      <p className="text-[9px] leading-3 text-zinc-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold text-yellow-400">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// MINI STAT
// ============================================================

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-black p-2.5">

      <p className="text-[9px] text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// HIGHLIGHT CARD
// ============================================================

function HighlightCard({
  title,
  movie,
  displayValue,
}: {
  title: string;
  movie: Credit | null;
  displayValue?: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-450 p-4">

      <p className="text-[10px] text-zinc-400">
        {title}
      </p>

      {movie ? (
        <>
          <h3 className="mt-2 text-xs font-semibold text-white">
            {movie.movie_title}
          </h3>

          {movie.release_year && (
            <p className="mt-1 text-[9px] text-zinc-400">
              {movie.release_year}
            </p>
          )}

        <p className="mt-2 text-sm font-semibold text-yellow-400">
  {formatCrores(
    displayValue !== undefined
      ? displayValue
      : movie.worldwide_gross
  )}
</p>
          {movie.theatrical_verdict && (
            <span className="mt-2 inline-block rounded-full bg-zinc-900 px-2 py-1 text-[8px] text-zinc-500">
              {movie.theatrical_verdict}
            </span>
          )}
        </>
      ) : (
        <p className="mt-3 text-[9px] text-zinc-700">
          No data available
        </p>
      )}

    </div>
  );
}