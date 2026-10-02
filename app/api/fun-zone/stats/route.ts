import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export async function GET() {
  try {
    const supabase =
      await createSupabaseServerClient();

    // ---------------------------------------------------------
    // 1. Verify logged-in JMI member
    // ---------------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to view your Fun Zone stats.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // 2. Load this member's predictions
    // ---------------------------------------------------------

    const {
      data: predictions,
      error: predictionError,
    } = await supabase
      .from("jmi_funzone_predictions")
      .select(`
        id,
        predicted_collection,
        actual_collection,
        accuracy_percentage,
        points_awarded,
        submitted_at,
        scored_at
      `)
      .eq("user_id", user.id)
      .order("submitted_at", {
        ascending: false,
      });

    if (predictionError) {
      console.error(
        "Fun Zone stats query error:",
        predictionError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load your Fun Zone statistics.",
        },
        { status: 500 }
      );
    }

    const rows = predictions || [];

    // ---------------------------------------------------------
    // 3. Separate scored predictions
    // ---------------------------------------------------------

    const scoredPredictions = rows.filter(
      (prediction) =>
        prediction.scored_at !== null
    );

    // ---------------------------------------------------------
    // 4. Calculate statistics
    // ---------------------------------------------------------

    const totalPredictions = rows.length;

    const scoredCount =
      scoredPredictions.length;

    const totalPoints =
      scoredPredictions.reduce(
        (sum, prediction) =>
          sum +
          Number(
            prediction.points_awarded || 0
          ),
        0
      );

    const accuratePredictions =
      scoredPredictions.filter(
        (prediction) =>
          Number(
            prediction.accuracy_percentage || 0
          ) >= 90
      ).length;

    const totalAccuracy =
      scoredPredictions.reduce(
        (sum, prediction) =>
          sum +
          Number(
            prediction.accuracy_percentage || 0
          ),
        0
      );

    const averageAccuracy =
      scoredCount > 0
        ? Number(
            (
              totalAccuracy /
              scoredCount
            ).toFixed(2)
          )
        : 0;

    const bestAccuracy =
      scoredCount > 0
        ? Number(
            Math.max(
              ...scoredPredictions.map(
                (prediction) =>
                  Number(
                    prediction.accuracy_percentage ||
                      0
                  )
              )
            ).toFixed(2)
          )
        : 0;

    const bestPoints =
      scoredCount > 0
        ? Math.max(
            ...scoredPredictions.map(
              (prediction) =>
                Number(
                  prediction.points_awarded || 0
                )
            )
          )
        : 0;

    // ---------------------------------------------------------
    // 5. Return member statistics
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,

      stats: {
        total_points: totalPoints,
        total_predictions: totalPredictions,
        scored_predictions: scoredCount,
        accurate_predictions:
          accuratePredictions,
        average_accuracy: averageAccuracy,
        best_accuracy: bestAccuracy,
        best_points: bestPoints,
      },
    });
  } catch (error) {
    console.error(
      "Fun Zone stats API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while loading your Fun Zone statistics.",
      },
      { status: 500 }
    );
  }
}