import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Load the top members by their universal JMI Points balance.
    const { data: pointsRows, error: pointsError } = await supabase
      .from("jmi_user_points")
      .select("user_id, total_points")
      .gt("total_points", 0)
      .order("total_points", { ascending: false })
      .limit(10);

    if (pointsError) {
      console.error("Public leaderboard points error:", pointsError);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load the public leaderboard.",
        },
        { status: 500 }
      );
    }

    const points = pointsRows ?? [];

    if (points.length === 0) {
      return NextResponse.json({
        success: true,
        leaderboard: [],
      });
    }

    const userIds = points.map((row) => row.user_id);

    // Fetch only public display information.
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", userIds);

    if (profilesError) {
      console.error(
        "Public leaderboard profiles error:",
        profilesError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load leaderboard member profiles.",
        },
        { status: 500 }
      );
    }

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [
        profile.user_id,
        profile,
      ])
    );

    const leaderboard = points.map((row, index) => {
      const profile = profileMap.get(row.user_id);

      return {
        rank: index + 1,
        user_id: row.user_id,
        display_name:
          profile?.full_name?.trim() || "JMI Member",
        avatar_url: profile?.avatar_url ?? null,
        total_points: Number(row.total_points),
      };
    });

    return NextResponse.json(
      {
        success: true,
        leaderboard,
        updated_at: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public leaderboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong loading the leaderboard.",
      },
      { status: 500 }
    );
  }
}