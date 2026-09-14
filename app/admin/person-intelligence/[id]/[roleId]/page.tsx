"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// =============================================================
// TYPES
// =============================================================

type Person = {
  id: number;
  full_name: string;
  original_name: string | null;
  profile_image_url: string | null;
};

type Role = {
  id: number;
  name: string;
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

type RecordMovie = Credit | null;

// =============================================================
// MANUAL ROLE INTELLIGENCE
// =============================================================

type ManualRoleProfile = {
  id: number;
  section_name: string | null;
  full_name: string | null;
  profile_image_url: string | null;
  age: number | null;
  short_bio: string | null;
};

type RoleRecord = {
  id: number;
  person_id: number;
  role_id: number;
  record_type: "opening" | "final";
  territory:
    | "Kerala"
    | "Tamil Nadu"
    | "Telugu States"
    | "Karnataka"
    | "Worldwide";
  movie_title: string | null;
  gross_amount: number | null;
  notes: string | null;
};

// =============================================================
// FORMATTERS
// =============================================================

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

// =============================================================
// VERDICT HELPERS
// =============================================================

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

// =============================================================
// CAREER CHART
// =============================================================

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
      <div className="rounded-xl bg-zinc-900 p-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>

        <div className="mt-6 flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-zinc-800">
          <p className="text-sm text-zinc-500">
            Not enough career data to draw this graph.
          </p>
        </div>
      </div>
    );
  }

  const width = 900;
  const height = 360;

  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 55;

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
      (index / Math.max(data.length - 1, 1)) * chartWidth;

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
    <div className="rounded-xl bg-zinc-900 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>

      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>

      <div className="mt-5 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[700px] w-full"
        >
          {[0, 1, 2, 3, 4].map((index) => {
            const y = paddingTop + (index / 4) * chartHeight;

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
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.year}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#facc15"
              />

              <text
                x={point.x}
                y={height - paddingBottom + 28}
                textAnchor="middle"
                fill="#a1a1aa"
                fontSize="13"
              >
                {point.year}
              </text>

              <text
                x={point.x}
                y={point.y - 12}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="12"
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

// =============================================================
// MAIN PAGE
// =============================================================

export default function PersonRoleIntelligencePage() {
  const params = useParams();

  const personId = Number(params.id);
  const roleId = Number(params.roleId);

  const [person, setPerson] = useState<Person | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  
  const [roleProfile, setRoleProfile] = useState({
  section_name: "",
  full_name: "",
  profile_image_url: "",
  age: "",
  short_bio: "",
});

const TERRITORIES = [
  "Kerala",
  "Karnataka",
  "Tamil Nadu",
  "Telugu States",
  "Worldwide",
];

const [territoryPerformance, setTerritoryPerformance] = useState<
  Record<
    string,
    {
      opening: string;
      final: string;
    }
  >
>({
  Kerala: {
    opening: "",
    final: "",
  },
  Karnataka: {
    opening: "",
    final: "",
  },
  "Tamil Nadu": {
    opening: "",
    final: "",
  },
  "Telugu States": {
    opening: "",
    final: "",
  },
  Worldwide: {
    opening: "",
    final: "",
  },
});
  

  const [credits, setCredits] = useState<Credit[]>([]);
  const [territoryStats, setTerritoryStats] = useState<TerritoryStat[]>([]);
  const [roleTerritoryRecords, setRoleTerritoryRecords] =
  useState<RoleTerritoryRecord[]>([]);
  const [dailyCollections, setDailyCollections] = useState<DailyCollection[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [manualProfile, setManualProfile] =
  useState<ManualRoleProfile | null>(null);



const [savingProfile, setSavingProfile] =
  useState(false);

const [profileMessage, setProfileMessage] =
  useState("");

const [roleRecords, setRoleRecords] =
  useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!personId || !roleId) return;
    loadRoleIntelligence();
  }, [personId, roleId]);


  async function loadTerritoryPerformance() {
  try {
    const { data, error } = await supabase
      .from("person_role_records")
      .select("territory, record_type, gross_amount")
      .eq("person_id", personId)
      .eq("role_id", roleId);

    if (error) {
      console.error(
        "Territory performance error:",
        error
      );
      return;
    }

    const performance: Record<
      string,
      {
        opening: string;
        final: string;
      }
    > = {
      Kerala: {
        opening: "",
        final: "",
      },
      Karnataka: {
        opening: "",
        final: "",
      },
      "Tamil Nadu": {
        opening: "",
        final: "",
      },
      "Telugu States": {
        opening: "",
        final: "",
      },
      Worldwide: {
        opening: "",
        final: "",
      },
    };

    (data ?? []).forEach((record) => {
      const territory = record.territory;

      if (!TERRITORIES.includes(territory)) {
        return;
      }

      const recordType = String(
        record.record_type ?? ""
      )
        .toLowerCase()
        .trim();

      const amount =
        record.gross_amount !== null &&
        record.gross_amount !== undefined
          ? String(record.gross_amount)
          : "";

      if (recordType.includes("opening")) {
        performance[territory].opening = amount;
      }

      if (recordType.includes("final")) {
        performance[territory].final = amount;
      }
    });

    setTerritoryPerformance(performance);
  } catch (error) {
    console.error(
      "Territory performance error:",
      error
    );
  }
}

const [savingTerritoryPerformance, setSavingTerritoryPerformance] =
  useState(false);

const [territoryPerformanceMessage, setTerritoryPerformanceMessage] =
  useState("");

async function saveTerritoryPerformance() {
  setSavingTerritoryPerformance(true);
  setTerritoryPerformanceMessage("");

  try {
    const records = TERRITORIES.flatMap((territory) => {
      const openingValue = Number(
        territoryPerformance[territory]?.opening || 0
      );

      const finalValue = Number(
        territoryPerformance[territory]?.final || 0
      );

      return [
        {
          person_id: personId,
          role_id: roleId,
          record_type: "opening",
          territory,
          movie_title: null,
          gross_amount: openingValue,
          notes: null,
        },
        {
          person_id: personId,
          role_id: roleId,
          record_type: "final",
          territory,
          movie_title: null,
          gross_amount: finalValue,
          notes: null,
        },
      ];
    });

    const { error } = await supabase
      .from("person_role_records")
      .upsert(records, {
        onConflict: "person_id,role_id,record_type,territory",
      });

    if (error) {
      throw error;
    }

    setTerritoryPerformanceMessage(
      "Territory performance saved successfully."
    );

    await loadTerritoryPerformance();
  } catch (error) {
    console.error("Territory performance save error:", error);

    setTerritoryPerformanceMessage(
      "Something went wrong while saving territory performance."
    );
  } finally {
    setSavingTerritoryPerformance(false);
  }
}

  async function loadRoleIntelligence() {

    
    setLoading(true);
    setErrorMessage(null);

    try {
      // PERSON
      const {
        data: personData,
        error: personError,
      } = await supabase
        .from("people")
        .select(`
          id,
          full_name,
          original_name,
          profile_image_url
        `)
        .eq("id", personId)
        .single();

      if (personError) {
        console.error("Person error:", personError);
        setErrorMessage("Could not load person.");
        return;
      }

      setPerson(personData);

      // ROLE
      const {
        data: roleData,
        error: roleError,
      } = await supabase
        .from("person_roles")
        .select(`
          id,
          name
        `)
        .eq("id", roleId)
        .single();

      if (roleError) {
        console.error("Role error:", roleError);
        setErrorMessage("Could not load role.");
        return;
      }

      setRole(roleData); 
      
 // =======================================================
      // MANUAL ROLE INTELLIGENCE PROFILE
      // =======================================================

      const {
        data: manualProfileData,
        error: manualProfileError,
      } = await supabase
        .from(
          "person_role_intelligence_profiles"
        )
        .select(`
          id,
          section_name,
          full_name,
          profile_image_url,
          age,
          short_bio
        `)
        .eq(
          "person_id",
          personId
        )
        .eq(
          "role_id",
          roleId
        )
        .maybeSingle();

      if (manualProfileError) {
        console.error(
          "Manual role profile error:",
          manualProfileError
        );
      } else {
        setManualProfile(
          manualProfileData
            ? {
                id: Number(
                  manualProfileData.id
                ),

                section_name:
                  manualProfileData.section_name ??
                  null,

                full_name:
                  manualProfileData.full_name ??
                  null,

                profile_image_url:
                  manualProfileData.profile_image_url ??
                  null,

                age:
                  manualProfileData.age !== null
                    ? Number(
                        manualProfileData.age
                      )
                    : null,

                short_bio:
                  manualProfileData.short_bio ??
                  null,
              }
            : null
        );
      }




      // =======================================================
// ROLE INTELLIGENCE PROFILE
// =======================================================

const {
  data: roleProfileData,
  error: roleProfileError,
} = await supabase
  .from("person_role_intelligence_profiles")
  .select(`
    id,
    person_id,
    role_id,
    section_name,
    full_name,
    profile_image_url,
    age,
    short_bio
  `)
  .eq("person_id", personId)
  .eq("role_id", roleId)
  .maybeSingle();

if (roleProfileError) {
  console.error(
    "Role profile error:",
    roleProfileError
  );
} else {
setRoleProfile(
  roleProfileData
    ? {
        section_name: roleProfileData.section_name ?? "",
        full_name: roleProfileData.full_name ?? "",
        profile_image_url: roleProfileData.profile_image_url ?? "",
        age:
          roleProfileData.age !== null &&
          roleProfileData.age !== undefined
            ? String(roleProfileData.age)
            : "",
        short_bio: roleProfileData.short_bio ?? "",
      }
    : {
        section_name: "",
        full_name: "",
        profile_image_url: "",
        age: "",
        short_bio: "",
      }
);
}
      
      

      // =======================================================
      // MANUAL ROLE RECORDS
      // =======================================================

      const {
        data: roleRecordData,
        error: roleRecordError,
      } = await supabase
        .from(
          "person_role_records"
        )
        .select(`
          id,
          record_type,
          territory,
          movie_title,
          gross_amount,
          notes
        `)
        .eq(
          "person_id",
          personId
        )
        .eq(
          "role_id",
          roleId
        )
        .order(
          "record_type",
          {
            ascending: true,
          }
        );

      if (roleRecordError) {
        console.error(
          "Manual role records error:",
          roleRecordError
        );
      } else {
        setRoleRecords(
          (roleRecordData || []).map(
            (row: any) => ({
              id: Number(
                row.id
              ),

              person_id: personId,

role_id: roleId,

              record_type:
                row.record_type,

              territory:
                row.territory,

              movie_title:
                row.movie_title ??
                null,

              gross_amount:
                row.gross_amount !== null
                  ? Number(
                      row.gross_amount
                    )
                  : null,

              notes:
                row.notes ??
                null,
            })
          )
        );
      }

      await loadTerritoryPerformance();

      // ROLE-SPECIFIC CREDITS
      const {
        data: creditData,
        error: creditError,
      } = await supabase
        .from("movie_people")
        .select(`
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
        `)
        .eq("person_id", personId)
        .eq("role_id", roleId)
        .order("id", { ascending: true });

      if (creditError) {
        console.error("Credit error:", creditError);
        setErrorMessage("Could not load role-specific credits.");
        return;
      }

      const movieIds = Array.from(
        new Set(
          (creditData || []).map((row: any) => Number(row.movie_id))
        )
      );

      // STATE BOX OFFICE
      let stateRows: any[] = [];

      if (movieIds.length > 0) {
        const { data, error } = await supabase
          .from("movie_state_box_office")
          .select(`
            movie_id,
            state_id,
            gross_jmi
          `)
          .in("movie_id", movieIds);

        if (error) {
          console.error("State box office error:", error);
        } else {
          stateRows = data || [];
        }
      }

      // OVERSEAS BOX OFFICE
      let overseasRows: any[] = [];

      if (movieIds.length > 0) {
        const { data, error } = await supabase
          .from("movie_overseas_box_office")
          .select(`
            movie_id,
            gross_inr
          `)
          .in("movie_id", movieIds);

        if (error) {
          console.error("Overseas error:", error);
        } else {
          overseasRows = data || [];
        }
      }

      // MOVIE BUSINESS
      let businessRows: any[] = [];

      if (movieIds.length > 0) {
        const { data, error } = await supabase
          .from("movie_business")
          .select(`
            movie_id,
            theatrical_verdict,
            production_budget_official,
            production_budget_trade
          `)
          .in("movie_id", movieIds);

        if (error) {
          console.error("Business error:", error);
        } else {
          businessRows = data || [];
        }
      }

      // FORMAT CREDITS
      const formattedCredits: Credit[] = (creditData || []).map(
        (row: any) => {
          const movieId = Number(row.movie_id);

          const indiaGross = stateRows
            .filter(
              (item) => Number(item.movie_id) === movieId
            )
            .reduce(
              (sum, item) =>
                sum + Number(item.gross_jmi || 0),
              0
            );

          const overseasGross = overseasRows
            .filter(
              (item) => Number(item.movie_id) === movieId
            )
            .reduce(
              (sum, item) =>
                sum + Number(item.gross_inr || 0),
              0
            );

          const business = businessRows.find(
            (item) => Number(item.movie_id) === movieId
          );

          return {
            id: Number(row.id),
            movie_id: movieId,
            movie_title: row.movies?.title || "Unknown Movie",
            release_year: row.movies?.release_year ?? null,
            role_name: row.person_roles?.name || roleData.name,
            credit_type: row.credit_types?.name || null,
            character_name: row.character_name || null,
            billing_order: row.billing_order ?? null,
            india_gross: indiaGross,
            overseas_gross: overseasGross,
            worldwide_gross: indiaGross + overseasGross,
            theatrical_verdict: business?.theatrical_verdict ?? null,
            production_budget_official: Number(
              business?.production_budget_official || 0
            ),
            production_budget_trade: Number(
              business?.production_budget_trade || 0
            ),
          };
        }
      );

      setCredits(formattedCredits);

      // TERRITORY INTELLIGENCE
      if (movieIds.length > 0) {
        const {
          data: territoryData,
          error: territoryError,
        } = await supabase
          .from("movie_state_box_office")
          .select(`
            movie_id,
            state_id,
            gross_jmi,
            states (
              id,
              name
            )
          `)
          .in("movie_id", movieIds);

        if (territoryError) {
          console.error("Territory error:", territoryError);
        } else {
          const territoryMap = new Map<
            number,
            {
              state_id: number;
              state_name: string;
              total_gross: number;
              movie_ids: Set<number>;
            }
          >();

          (territoryData || []).forEach((row: any) => {
            const stateId = Number(row.state_id);
            const movieId = Number(row.movie_id);
            const stateName =
              row.states?.name || "Unknown Territory";
            const gross = Number(row.gross_jmi || 0);

            if (!territoryMap.has(stateId)) {
              territoryMap.set(stateId, {
                state_id: stateId,
                state_name: stateName,
                total_gross: 0,
                movie_ids: new Set<number>(),
              });
            }

            const territory = territoryMap.get(stateId)!;

            territory.total_gross += gross;
            territory.movie_ids.add(movieId);
          });

          const sortedTerritories = Array.from(
            territoryMap.values()
          )
            .map((territory) => {
              const movieCount = territory.movie_ids.size;

              return {
                state_id: territory.state_id,
                state_name: territory.state_name,
                total_gross: territory.total_gross,
                movie_count: movieCount,
                average_market_value:
                  movieCount > 0
                    ? territory.total_gross / movieCount
                    : 0,
              };
            })
            .sort(
              (a, b) => b.total_gross - a.total_gross
            )
            .slice(0, 5);

          setTerritoryStats(sortedTerritories);
        }
      }

      // DAY 1
      if (movieIds.length > 0) {
        const {
          data: dailyData,
          error: dailyError,
        } = await supabase
          .from("movie_daily_box_office")
          .select(`
            movie_id,
            day_number,
            gross_jmi,
            movies (
              title
            )
          `)
          .in("movie_id", movieIds)
          .eq("day_number", 1);

        if (dailyError) {
          console.error("Daily error:", dailyError);
        } else {
          setDailyCollections(
            (dailyData || []).map((row: any) => ({
              movie_id: Number(row.movie_id),
              movie_title:
                row.movies?.title || "Unknown Movie",
              gross_jmi: Number(row.gross_jmi || 0),
              day_number: Number(row.day_number),
            }))
          );
        }
      }

      // AWARDS
      if (movieIds.length > 0) {
        const {
          data: awardData,
          error: awardError,
        } = await supabase
          .from("movie_awards")
          .select(`
            id,
            movie_id,
            award_name,
            awarding_body,
            category,
            award_year,
            recipient,
            result
          `)
          .in("movie_id", movieIds);

        if (awardError) {
          console.error("Awards error:", awardError);
        } else {
          setAwards((awardData || []) as Award[]);
        }
      }
    } 
    
    
    
    catch (error) {
      console.error("Role Intelligence error:", error);
      setErrorMessage(
        "Something went wrong while loading Role Intelligence."
      );
    } finally {
      setLoading(false);
    }

async function saveRoleProfile() {
  if (!roleProfile) return;

  setSavingProfile(true);
  setProfileMessage("");

  try {
    const { error } = await supabase
      .from("person_role_intelligence_profiles")
      .upsert(
        {
          person_id: personId,
          role_id: roleId,

          section_name:
            roleProfile.section_name ||
            null,

          full_name:
            roleProfile.full_name ||
            null,

          profile_image_url:
            roleProfile.profile_image_url ||
            null,

          age:
            roleProfile.age
              ? Number(roleProfile.age)
              : null,

          short_bio:
            roleProfile.short_bio ||
            null,
        },
        {
          onConflict:
            "person_id,role_id",
        }
      );

    if (error) {
      console.error(
        "Save role profile error:",
        error
      );

      setProfileMessage(
        "Could not save role profile."
      );

      return;
    }

    setProfileMessage(
      "Role profile saved successfully."
    );

    await loadRoleIntelligence();

  } catch (error) {
    console.error(
      "Save role profile error:",
      error
    );

    setProfileMessage(
      "Something went wrong while saving."
    );
  } finally {
    setSavingProfile(false);
  }
}

  }

  async function saveRoleProfile() {
  if (!roleProfile) return;

  setSavingProfile(true);
  setProfileMessage("");

  try {
    const { error } = await supabase
      .from("person_role_intelligence_profiles")
      .upsert(
        {
          person_id: personId,
          role_id: roleId,

          section_name:
            roleProfile.section_name || null,

          full_name:
            roleProfile.full_name || null,

          profile_image_url:
            roleProfile.profile_image_url || null,

          age:
            roleProfile.age
              ? Number(roleProfile.age)
              : null,

          short_bio:
            roleProfile.short_bio || null,
        },
        {
          onConflict: "person_id,role_id",
        }
      );

    if (error) {
      console.error(
        "Save role profile error:",
        error
      );

      setProfileMessage(
        "Could not save role profile."
      );

      return;
    }

    setProfileMessage(
      "Role profile saved successfully."
    );

    await loadRoleIntelligence();

  } catch (error) {
    console.error(
      "Save role profile error:",
      error
    );

    setProfileMessage(
      "Something went wrong while saving."
    );

  } finally {
    setSavingProfile(false);
  }
}

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-400">
            Loading Role Intelligence...
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            Analysing role-specific career data
          </p>
        </div>
      </div>
    );
  }

  

  // ERROR
  if (errorMessage) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8">
        <h1 className="text-xl font-semibold text-red-400">
          Role Intelligence Error
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {errorMessage}
        </p>
      </div>
    );
  }

  // NOT FOUND
  if (!person || !role) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <h1 className="text-xl font-semibold text-white">
          Role Intelligence Not Found
        </h1>
      </div>
    );
  }

  

  // ===========================================================
  // CAREER CALCULATIONS
  // ===========================================================

  const totalMovies = new Set(
    credits.map((credit) => credit.movie_id)
  ).size;

  const totalCredits = credits.length;

  const years = credits
    .map((credit) => credit.release_year)
    .filter(
      (year): year is number => year !== null
    );

  const firstYear =
    years.length > 0 ? Math.min(...years) : null;

  const latestYear =
    years.length > 0 ? Math.max(...years) : null;

  const careerSpan =
    firstYear !== null && latestYear !== null
      ? latestYear - firstYear + 1
      : 0;

  // ===========================================================
  // LEAD / SUPPORTING
  // ===========================================================

  const leadCredits = credits.filter((credit) => {
    const type = credit.credit_type?.toLowerCase().trim();

    return (
      type === "lead role" ||
      type === "lead actress" ||
      type === "lead actor" ||
      type === "hero" ||
      type === "heroine"
    );
  });

  const leadMovieIds = new Set(
    leadCredits.map((credit) => credit.movie_id)
  );

  const leadMovies = Array.from(leadMovieIds)
    .map((movieId) =>
      credits.find(
        (credit) => credit.movie_id === movieId
      )
    )
    .filter(
      (credit): credit is Credit => !!credit
    );

  const supportingMovies =
    totalMovies - leadMovies.length;

  // ===========================================================
  // UNIQUE MOVIE DATA
  // Prevents box-office figures from being double-counted
  // when multiple credit rows exist for the same movie.
  // ===========================================================

  const uniqueMovieMap = new Map<number, Credit>();

  credits.forEach((credit) => {
    if (!uniqueMovieMap.has(credit.movie_id)) {
      uniqueMovieMap.set(
        credit.movie_id,
        credit
      );
    }
  });

  const uniqueMovies = Array.from(
    uniqueMovieMap.values()
  );

  // ===========================================================
  // BOX OFFICE
  // ===========================================================

  const totalIndiaGross = uniqueMovies.reduce(
    (sum, movie) => sum + movie.india_gross,
    0
  );

  const totalOverseasGross = uniqueMovies.reduce(
    (sum, movie) => sum + movie.overseas_gross,
    0
  );

  const totalWorldwideGross = uniqueMovies.reduce(
    (sum, movie) => sum + movie.worldwide_gross,
    0
  );

  const averageGross =
    uniqueMovies.length > 0
      ? totalWorldwideGross / uniqueMovies.length
      : 0;

  const averageLeadGross =
    leadMovies.length > 0
      ? leadMovies.reduce(
          (sum, movie) =>
            sum + movie.worldwide_gross,
          0
        ) / leadMovies.length
      : 0;

  // ===========================================================
  // LEAD PERFORMANCE
  // ===========================================================

  const leadHitMovies = leadMovies.filter(
    (movie) => isHit(movie.theatrical_verdict)
  );

  const leadFlopMovies = leadMovies.filter(
    (movie) => isFlop(movie.theatrical_verdict)
  );

  const leadBlockbusterMovies =
    leadMovies.filter((movie) =>
      isBlockbuster(movie.theatrical_verdict)
    );

  const leadHitRate =
    leadMovies.length > 0
      ? (leadHitMovies.length / leadMovies.length) * 100
      : 0;

  // ===========================================================
  // BUDGET INTELLIGENCE
  // ===========================================================

  const moviesWithBudget = uniqueMovies.filter(
    (movie) =>
      movie.production_budget_official > 0 ||
      movie.production_budget_trade > 0
  );

  const getMovieBudget = (movie: Credit) =>
    movie.production_budget_official > 0
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
    moviesWithBudget.filter((movie) =>
      isHit(movie.theatrical_verdict)
    );

  const highestSuccessfullyRecoveredBudgetMovie =
    successfulBudgetMovies.length > 0
      ? [...successfulBudgetMovies].sort(
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
            sum + getMovieBudget(movie),
          0
        ) / moviesWithBudget.length
      : 0;

  const averageSuccessfulBudget =
    successfulBudgetMovies.length > 0
      ? successfulBudgetMovies.reduce(
          (sum, movie) =>
            sum + getMovieBudget(movie),
          0
        ) / successfulBudgetMovies.length
      : 0;

  // ===========================================================
  // PERFORMANCE
  // ===========================================================

  const hitMovies = uniqueMovies.filter((movie) =>
    isHit(movie.theatrical_verdict)
  );

  const flopMovies = uniqueMovies.filter((movie) =>
    isFlop(movie.theatrical_verdict)
  );

  const blockbusterMovies =
    uniqueMovies.filter((movie) =>
      isBlockbuster(movie.theatrical_verdict)
    );

  const hitRate =
    totalMovies > 0
      ? (hitMovies.length / totalMovies) * 100
      : 0;

  const flopRate =
    totalMovies > 0
      ? (flopMovies.length / totalMovies) * 100
      : 0;

  const blockbusterRate =
    totalMovies > 0
      ? (blockbusterMovies.length / totalMovies) * 100
      : 0;

  const verdictAvailableMovies =
    uniqueMovies.filter(
      (movie) => !!movie.theatrical_verdict
    );

  const verdictCoverage =
    totalMovies > 0
      ? (verdictAvailableMovies.length /
          totalMovies) *
        100
      : 0;

  // ===========================================================
  // CAREER HIGHLIGHTS
  // ===========================================================

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

  // ===========================================================
  // DAY 1
  // ===========================================================

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
        ) / dailyCollections.length
      : 0;

  // ===========================================================
  // AWARDS
  // ===========================================================

  const wonAwards = awards.filter((award) => {
    const result =
      award.result?.toLowerCase().trim();

    const recipient =
      award.recipient?.toLowerCase() || "";

    const fullName =
      person.full_name.toLowerCase();

    const originalName =
      person.original_name?.toLowerCase() || "";

    return (
      (result === "won" ||
        result === "winner" ||
        result === "win") &&
      (recipient.includes(fullName) ||
        (originalName &&
          recipient.includes(originalName)))
    );
  });

  // ===========================================================
  // CAREER GRAPH
  // IMPORTANT: No useMemo here. This avoids Hooks-order issues.
  // ===========================================================

  const careerGraphMap =
    new Map<number, YearStats>();

  uniqueMovies.forEach((movie) => {
    if (!movie.release_year) return;

    if (!careerGraphMap.has(movie.release_year)) {
      careerGraphMap.set(movie.release_year, {
        year: movie.release_year,
        gross: 0,
        movies: 0,
        hits: 0,
      });
    }

    const yearData =
      careerGraphMap.get(movie.release_year)!;

    yearData.gross += movie.worldwide_gross;
    yearData.movies += 1;

    if (isHit(movie.theatrical_verdict)) {
      yearData.hits += 1;
    }
  });

  const careerGraphData = Array.from(
    careerGraphMap.values()
  ).sort((a, b) => a.year - b.year);

  // ===========================================================
  // PROFILE IMAGE
  // ===========================================================

  const profileImage =
    person.profile_image_url || null;

  // ===========================================================
  // PAGE
  // ===========================================================

  return (
    <div className="space-y-8 pb-12">

      {/* BACK */}

      <button
        onClick={() =>
          (window.location.href =
            `/admin/person-intelligence/${personId}`)
        }
        className="text-sm text-zinc-400 hover:text-yellow-400"
      >
        ← Back to Person Intelligence
      </button>

      {/* HEADER */}

      <section className="rounded-xl bg-zinc-900 p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">

          {profileImage ? (
            <img
              src={profileImage}
              alt={person.full_name}
              className="h-24 w-24 rounded-full border-2 border-yellow-400/30 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-3xl font-bold text-yellow-400">
              {person.full_name
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
              JMI Role Intelligence
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              {person.full_name}
            </h1>

            <div className="mt-3 inline-flex rounded-full bg-yellow-500/10 px-4 py-2">
              <span className="text-sm font-semibold text-yellow-400">
                {role.name} Career
              </span>
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              Role-specific intelligence calculated
              exclusively from{" "}
              <span className="text-zinc-300">
                {role.name}
              </span>{" "}
              credits.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          ROLE PROFILE / BASIC DETAILS
      ===================================================== */}

      <section className="rounded-xl bg-zinc-900 p-6">

        <div className="mb-5">

          <h2 className="text-xl font-semibold text-white">
            {roleProfile?.section_name ||
              `${role.name} Profile`}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Role-specific profile information
          </p>

        </div>

        <div className="grid gap-5 md:grid-cols-[120px_1fr]">

          {/* PROFILE IMAGE */}

          <div>

            {roleProfile?.profile_image_url ? (

              <img
                src={
                  roleProfile.profile_image_url
                }
                alt={
                  roleProfile.full_name ||
                  person.full_name
                }
                className="h-28 w-28 rounded-xl border border-zinc-800 object-cover"
              />

            ) : (

              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-black text-3xl font-bold text-yellow-400">
                {(roleProfile?.full_name ||
                  person.full_name)
                  .charAt(0)
                  .toUpperCase()}
              </div>

            )}

          </div>

          {/* DETAILS */}

          <div className="space-y-4">

            <div>

              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Full Name
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {roleProfile?.full_name ||
                  person.full_name}
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div>

                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Age
                </p>

                <p className="mt-1 text-sm text-zinc-300">
                  {roleProfile?.age ??
                    "Not available"}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Role
                </p>

                <p className="mt-1 text-sm text-yellow-400">
                  {role.name}
                </p>

              </div>

            </div>

            <div>

              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Short Bio
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {roleProfile?.short_bio ||
                  "No biography has been added yet."}
              </p>

            </div>

          </div>

        </div>

        <div className="mt-6 border-t border-zinc-800 pt-6">

  <h3 className="text-lg font-semibold text-white">
    Edit Role Profile
  </h3>

  <p className="mt-1 text-sm text-zinc-500">
    These details are stored independently for this person and role.
  </p>

  <div className="mt-5 grid gap-4 md:grid-cols-2">

    <div>
      <label className="text-sm text-zinc-400">
        Section Name
      </label>

      <input
        type="text"
        value={roleProfile.section_name}
       onChange={(e) =>
  setRoleProfile({
    ...roleProfile,
    age: e.target.value,
  })
}

        
        placeholder={`${role?.name || "Role"} Profile`}
        className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
      />
    </div>

    <div>
      <label className="text-sm text-zinc-400">
        Full Name
      </label>

      <input
        type="text"
        value={roleProfile.full_name}
        onChange={(e) =>
          setRoleProfile({
            ...roleProfile,
            full_name: e.target.value,
          })
        }
        placeholder="Full name"
        className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
      />
    </div>

    <div>
      <label className="text-sm text-zinc-400">
        Profile Picture URL
      </label>

      <input
        type="text"
        value={roleProfile.profile_image_url}
        onChange={(e) =>
          setRoleProfile({
            ...roleProfile,
            profile_image_url: e.target.value,
          })
        }
        placeholder="https://..."
        className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
      />
    </div>

    <div>
      <label className="text-sm text-zinc-400">
        Age
      </label>

      <input
        type="number"
        value={roleProfile.age}
        onChange={(e) =>
          setRoleProfile({
            ...roleProfile,
            age: e.target.value,
          })
        }
        placeholder="Age"
        className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
      />
    </div>

  </div>

  <div className="mt-4">

    <label className="text-sm text-zinc-400">
      Short Bio
    </label>

    <textarea
      value={roleProfile.short_bio}
      onChange={(e) =>
        setRoleProfile({
          ...roleProfile,
          short_bio: e.target.value,
        })
      }
      rows={4}
      placeholder="Short biography..."
      className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
    />

  </div>

  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">

    <button
      onClick={saveRoleProfile}
      disabled={savingProfile}
      className="rounded-lg bg-yellow-500 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {savingProfile
        ? "Saving..."
        : "Save Role Profile"}
    </button>

    {profileMessage && (
      <p className="text-sm text-zinc-400">
        {profileMessage}
      </p>
    )}

  </div>

</div>

      </section>


      {/* TERRITORY PERFORMANCE */}

<section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">

  <div className="mb-5">
    <h2 className="text-lg font-semibold text-yellow-400">
      Territory Performance
    </h2>

    <p className="mt-1 text-sm text-zinc-500">
      Manually maintained Top Opening and Final performance for this person and role.
    </p>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full min-w-[700px] text-sm">

      <thead>
        <tr className="border-b border-zinc-800 text-left">
          <th className="px-4 py-3 text-zinc-400">
            Territory
          </th>

          <th className="px-4 py-3 text-zinc-400">
            Top Opening (₹ L)
          </th>

          <th className="px-4 py-3 text-zinc-400">
            Final (₹ L)
          </th>
        </tr>
      </thead>

      <tbody>

        {TERRITORIES.map((territory) => (
          <tr
            key={territory}
            className="border-b border-zinc-800/60"
          >

            <td className="px-4 py-4 font-medium text-white">
              {territory}
            </td>

            <td className="px-4 py-4">

              <input
                type="number"
                min="0"
                step="0.01"
                value={territoryPerformance[territory].opening}
                onChange={(e) =>
                  setTerritoryPerformance((prev) => ({
                    ...prev,
                    [territory]: {
                      ...prev[territory],
                      opening: e.target.value,
                    },
                  }))
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
              />

            </td>

            <td className="px-4 py-4">

              <input
                type="number"
                min="0"
                step="0.01"
                value={territoryPerformance[territory].final}
                onChange={(e) =>
                  setTerritoryPerformance((prev) => ({
                    ...prev,
                    [territory]: {
                      ...prev[territory],
                      final: e.target.value,
                    },
                  }))
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
              />

            </td>

          </tr>
        ))}

      </tbody>

    </table>
 </div>

<div className="mt-5 flex items-center gap-3">
  <button
    type="button"
    onClick={saveTerritoryPerformance}
    disabled={savingTerritoryPerformance}
    className="rounded-lg bg-yellow-500 px-5 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-50"
  >
    {savingTerritoryPerformance
      ? "Saving..."
      : "Save Territory Performance"}
  </button>

  {territoryPerformanceMessage && (
    <p className="text-sm text-zinc-400">
      {territoryPerformanceMessage}
    </p>
  )}
</div>

</section>

      {/* =====================================================
          ROLE ISOLATION
      ===================================================== */}

      {/* ROLE ISOLATION */}

      <section className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-yellow-400">
              Role Isolation Active
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              This dashboard includes only credits where:
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-black px-3 py-1 text-xs text-zinc-300">
                Person ID: {personId}
              </span>

              <span className="rounded-full bg-black px-3 py-1 text-xs text-zinc-300">
                Role ID: {roleId}
              </span>

              <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                {role.name}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-black px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-wide text-zinc-600">
              Role Credits
            </p>

            <p className="mt-1 text-2xl font-bold text-yellow-400">
              {totalCredits}
            </p>
          </div>
        </div>
      </section>

      {/* EXECUTIVE DASHBOARD */}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">
            Executive Dashboard
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            High-level intelligence for {person.full_name}'s{" "}
            {role.name.toLowerCase()} career
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Role Movies" value={totalMovies} />
          <StatCard label="Lead Movies" value={leadMovies.length} />

          <StatCard
            label="Worldwide Gross"
            value={formatCrores(totalWorldwideGross)}
          />

          <StatCard
            label="Average / Movie"
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

      {/* ROLE PERFORMANCE BREAKDOWN */}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">
            Role Performance Breakdown
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Comparison between lead and supporting appearances
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <div className="rounded-xl bg-zinc-900 p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Lead Career
                </p>

                <h3 className="mt-2 text-xl font-semibold text-white">
                  {leadMovies.length} Movies
                </h3>
              </div>

              <div className="rounded-full bg-yellow-500/10 px-4 py-2">
                <span className="text-sm font-semibold text-yellow-400">
                  {formatPercentage(leadHitRate)}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat label="Hits" value={leadHitMovies.length} />

              <MiniStat
                label="Blockbusters"
                value={leadBlockbusterMovies.length}
              />

              <MiniStat
                label="Flops"
                value={leadFlopMovies.length}
              />
            </div>

            <div className="mt-5 border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-600">
                Average Lead Movie Gross
              </p>

              <p className="mt-1 text-xl font-bold text-yellow-400">
                {formatCrores(averageLeadGross)}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900 p-6">
            <p className="text-xs uppercase tracking-wide text-zinc-600">
              Supporting / Other
            </p>

            <h3 className="mt-2 text-xl font-semibold text-white">
              {supportingMovies} Movies
            </h3>

            <div className="mt-5">
              <div className="h-3 overflow-hidden rounded-full bg-black">
                <div
                  className="h-full rounded-full bg-yellow-500"
                  style={{
                    width:
                      totalMovies > 0
                        ? `${Math.min(
                            100,
                            (supportingMovies / totalMovies) *
                              100
                          )}%`
                        : "0%",
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between text-xs text-zinc-500">
                <span>Supporting share</span>

                <span>
                  {formatPercentage(
                    totalMovies > 0
                      ? (supportingMovies / totalMovies) * 100
                      : 0
                  )}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* BUDGET INTELLIGENCE */}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">
            Budget Intelligence
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Production-budget benchmarks within this role's filmography
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Movies With Budget Data"
            value={moviesWithBudget.length}
          />

          <StatCard
            label="Average Production Budget"
            value={formatCrores(averageProductionBudget)}
          />

          <StatCard
            label="Average Successful Budget"
            value={formatCrores(averageSuccessfulBudget)}
          />

          <StatCard
            label="Safest Recoverable Budget"
            value={formatCrores(
              highestSuccessfullyRecoveredBudget
            )}
          />
        </div>

        {highestBudgetMovie && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <HighlightCard
              title="Highest Budget Movie"
              movie={highestBudgetMovie}
            />

            {highestSuccessfullyRecoveredBudgetMovie && (
              <HighlightCard
                title="Highest Budget Successfully Recovered"
                movie={highestSuccessfullyRecoveredBudgetMovie}
              />
            )}
          </div>
        )}
      </section>

      {/* CAREER OVERVIEW */}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            {role.name} Career Overview
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Core career statistics calculated only from this role
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={`${role.name} Movies`}
            value={totalMovies}
          />

          <StatCard label="Total Credits" value={totalCredits} />

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

          <StatCard
            label="Role ID"
            value={role.id}
          />
        </div>
      </section>

      {/* BOX OFFICE */}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            {role.name} Box Office Intelligence
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Aggregate box-office performance of this role-specific filmography
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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

      {/* PERFORMANCE INTELLIGENCE */}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            {role.name} Performance Intelligence
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Success profile based on available JMI business verdicts
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Successful Movies"
            value={hitMovies.length}
          />

          <StatCard
            label="Hit Rate"
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

          <StatCard
            label="Awards Won"
            value={wonAwards.length}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Flop Rate"
            value={formatPercentage(flopRate)}
          />

          <StatCard
            label="Blockbuster Rate"
            value={formatPercentage(blockbusterRate)}
          />

          <StatCard
            label="Verdict Coverage"
            value={formatPercentage(verdictCoverage)}
          />
        </div>
      </section>

      {/* TERRITORY INTELLIGENCE */}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Territory Intelligence
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Top territories by cumulative gross across this role's movies
          </p>
        </div>

        {territoryStats.length === 0 ? (
          <div className="rounded-xl bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">
              No territory box-office data available.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {territoryStats.map((territory, index) => (
              <div
                key={territory.state_id}
                className="rounded-xl bg-zinc-900 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 font-bold text-yellow-400">
                      #{index + 1}
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        {territory.state_name}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        {territory.movie_count}{" "}
                        {territory.movie_count === 1
                          ? "movie"
                          : "movies"}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xl font-bold text-yellow-400">
                      {formatCrores(
                        territory.total_gross
                      )}
                    </p>

                    <p className="text-xs text-zinc-600">
                      Cumulative India Gross
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Avg:{" "}
                      <span className="text-zinc-300">
                        {formatCrores(
                          territory.average_market_value
                        )}
                      </span>
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* OPENING INTELLIGENCE */}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Opening Intelligence
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Automatic Day 1 performance from role-specific movies
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Highest Day 1"
            value={
              biggestDay1
                ? formatCrores(biggestDay1.gross_jmi)
                : "—"
            }
          />

          <StatCard
            label="Average Day 1"
            value={formatCrores(averageDay1)}
          />
        </div>

        {biggestDay1 && (
          <div className="mt-4 rounded-xl bg-zinc-900 p-6">
            <p className="text-xs uppercase tracking-wide text-zinc-600">
              Biggest Role-Associated Day 1
            </p>

            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {biggestDay1.movie_title}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Highest recorded Day 1 in this role's filmography
                </p>
              </div>

              <p className="text-2xl font-bold text-yellow-400">
                {formatCrores(biggestDay1.gross_jmi)}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* CAREER HIGHLIGHTS */}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Career Highlights
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Major performance records within this role
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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

      {/* CAREER TRAJECTORY */}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">
            {role.name} Career Trajectory
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Long-term career movement based exclusively on this role
          </p>
        </div>

        <div className="space-y-5">
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

      {/* AWARDS */}

      {wonAwards.length > 0 && (
        <section className="rounded-xl bg-zinc-900 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-semibold text-white">
                Awards Intelligence
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Awards where this person is recorded as the recipient
              </p>
            </div>

            <span className="text-sm text-zinc-500">
              {wonAwards.length} awards
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {wonAwards.map((award) => (
              <div
                key={award.id}
                className="rounded-lg bg-black p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                  <div>
                    <h3 className="font-semibold text-white">
                      {award.award_name || "Award"}
                    </h3>

                    {award.awarding_body && (
                      <p className="mt-1 text-sm text-yellow-400">
                        {award.awarding_body}
                      </p>
                    )}
                  </div>

                  {award.award_year && (
                    <span className="text-sm text-zinc-500">
                      {award.award_year}
                    </span>
                  )}
                </div>

                {award.category && (
                  <p className="mt-3 text-sm text-zinc-400">
                    Category:{" "}
                    <span className="text-zinc-200">
                      {award.category}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ROLE FILMOGRAPHY */}

      <section className="rounded-xl bg-zinc-900 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-xl font-semibold text-white">
              {role.name} Filmography
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Complete movie history for this specific role
            </p>
          </div>

          <span className="text-sm text-zinc-500">
            {totalMovies}{" "}
            {totalMovies === 1 ? "movie" : "movies"}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {credits.length === 0 ? (
            <div className="rounded-lg bg-black p-6 text-center">
              <p className="text-sm text-zinc-500">
                No {role.name.toLowerCase()} credits found.
              </p>
            </div>
          ) : (
            credits.map((credit) => (
              <div
                key={credit.id}
                className="rounded-xl bg-black p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {credit.movie_title}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {credit.release_year ||
                        "Release year unavailable"}
                    </p>

                    {credit.character_name && (
                      <p className="mt-2 text-sm text-zinc-400">
                        Character:{" "}
                        <span className="text-zinc-200">
                          {credit.character_name}
                        </span>
                      </p>
                    )}

                    {credit.billing_order !== null && (
                      <p className="mt-1 text-xs text-zinc-600">
                        Billing Order:{" "}
                        {credit.billing_order}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                      {credit.role_name || role.name}
                    </span>

                    {credit.credit_type && (
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                        {credit.credit_type}
                      </span>
                    )}

                    {credit.theatrical_verdict && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          isHit(credit.theatrical_verdict)
                            ? "bg-yellow-500/10 text-yellow-400"
                            : isFlop(
                                credit.theatrical_verdict
                              )
                            ? "bg-red-500/10 text-red-400"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {credit.theatrical_verdict}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-900 pt-5">

                  <div>
                    <p className="text-xs text-zinc-600">
                      India
                    </p>

                    <p className="mt-1 text-sm text-zinc-300">
                      {formatCrores(
                        credit.india_gross
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">
                      Overseas
                    </p>

                    <p className="mt-1 text-sm text-zinc-300">
                      {formatCrores(
                        credit.overseas_gross
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">
                      Worldwide
                    </p>

                    <p className="mt-1 text-sm font-semibold text-yellow-400">
                      {formatCrores(
                        credit.worldwide_gross
                      )}
                    </p>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// =============================================================
// STAT CARD
// =============================================================

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-yellow-400">
        {value}
      </p>
    </div>
  );
}

// =============================================================
// MINI STAT
// =============================================================

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-black p-3">
      <p className="text-xs text-zinc-600">{label}</p>

      <p className="mt-1 text-lg font-bold text-white">
        {value}
      </p>
    </div>
  );
}

// =============================================================
// HIGHLIGHT CARD
// =============================================================

function HighlightCard({
  title,
  movie,
}: {
  title: string;
  movie: RecordMovie;
}) {
  return (
    <div className="rounded-xl bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">{title}</p>

      {movie ? (
        <>
          <h3 className="mt-3 text-lg font-semibold text-white">
            {movie.movie_title}
          </h3>

          {movie.release_year && (
            <p className="mt-1 text-sm text-zinc-500">
              {movie.release_year}
            </p>
          )}

          <p className="mt-3 text-xl font-bold text-yellow-400">
            {formatCrores(movie.worldwide_gross)}
          </p>

          {movie.theatrical_verdict && (
            <span className="mt-2 inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
              {movie.theatrical_verdict}
            </span>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-zinc-600">
          No data available
        </p>
      )}
    </div>
  );
}
