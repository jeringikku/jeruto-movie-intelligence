import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

type Period = "daily" | "weekly" | "monthly";

type PredictionRow = {
  user_id: string;
  points_awarded: number;
  accuracy_percentage: number | null;
  scored_at: string;
};

type LeaderboardEntry = {
  user_id: string;
  total_points: number;
  predictions: number;
  average_accuracy: number;
};

function getPeriodStart(period: Period): Date {
  const now = new Date();

  if (period === "daily") {
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );
  }

  if (period === "monthly") {
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1
      )
    );
  }

  // Weekly:
  // Monday 00:00 UTC → current time.
  const day = now.getUTCDay();

  const daysSinceMonday =
    day === 0 ? 6 : day - 1;

  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  start.setUTCDate(
    start.getUTCDate() - daysSinceMonday
  );

  return start;
}

function buildLeaderboard(
  rows: PredictionRow[]
): LeaderboardEntry[] {
  const memberMap = new Map<
    string,
    LeaderboardEntry
  >();

  for (const row of rows) {
    const userId = row.user_id;

    if (!memberMap.has(userId)) {
      memberMap.set(userId, {
        user_id: userId,
        total_points: 0,
        predictions: 0,
        average_accuracy: 0,
      });
    }

    const member = memberMap.get(userId)!;

    member.total_points += Number(
      row.points_awarded || 0
    );

    member.predictions += 1;

    member.average_accuracy += Number(
      row.accuracy_percentage || 0
    );
  }

  const leaderboard = Array.from(
    memberMap.values()
  ).map((member) => ({
    ...member,
    average_accuracy:
      member.predictions > 0
        ? Number(
            (
              member.average_accuracy /
              member.predictions
            ).toFixed(2)
          )
        : 0,
  }));

  leaderboard.sort((a, b) => {
    // 1. More points
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }

    // 2. Higher average accuracy
    if (
      b.average_accuracy !==
      a.average_accuracy
    ) {
      return (
        b.average_accuracy -
        a.average_accuracy
      );
    }

    // 3. More predictions
    if (b.predictions !== a.predictions) {
      return b.predictions - a.predictions;
    }

    // 4. Stable deterministic fallback
    return a.user_id.localeCompare(b.user_id);
  });

  return leaderboard.slice(0, 5);
}

export async function GET(request: Request) {
  try {
    const supabase =
      await createSupabaseServerClient();

    // ---------------------------------------------------------
    // 1. Require logged-in JMI member
    // ---------------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You must be logged in to view the Fun Zone leaderboard.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // 2. Read requested period
    // ---------------------------------------------------------

    const url = new URL(request.url);

    const requestedPeriod =
      url.searchParams.get("period") ||
      "daily";

    const validPeriods: Period[] = [
      "daily",
      "weekly",
      "monthly",
    ];

    const period: Period = validPeriods.includes(
      requestedPeriod as Period
    )
      ? (requestedPeriod as Period)
      : "daily";

    // ---------------------------------------------------------
    // 3. Determine period start
    // ---------------------------------------------------------

    const periodStart =
      getPeriodStart(period);

    // ---------------------------------------------------------
    // 4. Load scored predictions
    //
    // Only scored predictions count.
    // ---------------------------------------------------------

    const {
      data: predictions,
      error: predictionError,
    } = await supabase
      .from("jmi_funzone_predictions")
      .select(`
        user_id,
        points_awarded,
        accuracy_percentage,
        scored_at
      `)
      .not("scored_at", "is", null)
      .gte(
        "scored_at",
        periodStart.toISOString()
      );

    if (predictionError) {
      console.error(
        "Fun Zone leaderboard query error:",
        predictionError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load the Fun Zone leaderboard.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 5. Build Top 5
    // ---------------------------------------------------------

    const leaderboard = buildLeaderboard(
      (predictions || []) as PredictionRow[]
    );

    // ---------------------------------------------------------
    // 6. Return leaderboard
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      period,
      period_start: periodStart.toISOString(),
      leaderboard,
    });
  } catch (error) {
    console.error(
      "Fun Zone leaderboard API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while loading the leaderboard.",
      },
      { status: 500 }
    );
  }
}