import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

const INDIA_COUNTRY_ID = 1;

function calculateAccuracy(
  predicted: number,
  actual: number
): number {
  if (actual <= 0) {
    return predicted <= 0 ? 100 : 0;
  }

  const difference = Math.abs(predicted - actual);

  const accuracy =
    100 - (difference / actual) * 100;

  return Math.max(
    0,
    Math.min(100, Number(accuracy.toFixed(3)))
  );
}

function calculatePoints(
  accuracy: number
): number {
  if (accuracy >= 100) return 10;
  if (accuracy >= 98) return 9;
  if (accuracy >= 97) return 8;
  if (accuracy >= 96) return 7;
  if (accuracy >= 95) return 6;
  if (accuracy >= 94) return 5;
  if (accuracy >= 93) return 4;
  if (accuracy >= 92) return 3;
  if (accuracy >= 91) return 2;
  if (accuracy >= 90) return 1;

  return 0;
}

export async function POST() {
  try {
    const supabase =
      await createSupabaseServerClient();

    // ---------------------------------------------------------
    // 1. Verify logged-in user
    // ---------------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // 2. Verify admin role
    // ---------------------------------------------------------

    const { data: roleData, error: roleError } =
      await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

    if (
      roleError ||
      roleData?.role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------------------
    // 3. Find unscored predictions
    // ---------------------------------------------------------

    const {
      data: predictions,
      error: predictionError,
    } = await supabase
      .from("jmi_funzone_predictions")
      .select(`
        id,
        user_id,
        daily_movie_id,
        predicted_collection,
        submitted_at,
        jmi_funzone_daily_movies (
          id,
          movie_id,
          challenge_date,
          is_active
        )
      `)
      .is("scored_at", null)
      .order("submitted_at", {
        ascending: true,
      });

    if (predictionError) {
      console.error(
        "Fun Zone prediction lookup error:",
        predictionError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load unscored predictions.",
        },
        { status: 500 }
      );
    }

    if (!predictions || predictions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "There are no unscored predictions.",
        scored_count: 0,
      });
    }

    let scoredCount = 0;
    let waitingCount = 0;
    let failedCount = 0;

    // ---------------------------------------------------------
    // 4. Process each prediction
    // ---------------------------------------------------------

    for (const prediction of predictions) {
      const challenge =
        Array.isArray(
          prediction.jmi_funzone_daily_movies
        )
          ? prediction.jmi_funzone_daily_movies[0]
          : prediction.jmi_funzone_daily_movies;

      if (!challenge) {
        failedCount++;
        continue;
      }

      const challengeDate =
        challenge.challenge_date;

      // The user predicts the NEXT day's collection.
      const actualDate = new Date(
        `${challengeDate}T00:00:00Z`
      );

      actualDate.setUTCDate(
        actualDate.getUTCDate() + 1
      );

      const actualDateString =
        actualDate.toISOString().slice(0, 10);

      // -------------------------------------------------------
      // 5. Find India-level actual collection
      //
      // country_id = India
      // state/region/trade territory = NULL
      // collection_date = challenge date + 1
      // -------------------------------------------------------

      const {
        data: actualRows,
        error: actualError,
      } = await supabase
        .from("movie_daily_box_office")
        .select(`
          id,
          gross_jmi,
          collection_date,
          day_number,
          country_id,
          geographic_region_id,
          state_id,
          trade_region_id
        `)
        .eq(
          "movie_id",
          challenge.movie_id
        )
        .eq(
          "country_id",
          INDIA_COUNTRY_ID
        )
        .eq(
          "collection_date",
          actualDateString
        )
        .is(
          "geographic_region_id",
          null
        )
        .is("state_id", null)
        .is("trade_region_id", null)
        .not("gross_jmi", "is", null)
        .limit(1);

      if (actualError) {
        console.error(
          "Fun Zone actual collection error:",
          actualError
        );

        failedCount++;
        continue;
      }

      // -------------------------------------------------------
      // 6. Actual collection not entered yet
      // -------------------------------------------------------

      if (
        !actualRows ||
        actualRows.length === 0
      ) {
        waitingCount++;
        continue;
      }

      const actualCollection =
        Number(actualRows[0].gross_jmi);

      if (
        !Number.isFinite(actualCollection) ||
        actualCollection < 0
      ) {
        failedCount++;
        continue;
      }

      // -------------------------------------------------------
      // 7. Calculate accuracy
      // -------------------------------------------------------

      const predictedCollection =
        Number(
          prediction.predicted_collection
        );

      const accuracy =
        calculateAccuracy(
          predictedCollection,
          actualCollection
        );

      // -------------------------------------------------------
      // 8. Calculate points
      // -------------------------------------------------------

      const points =
        calculatePoints(accuracy);

      // -------------------------------------------------------
      // 9. Save scoring result
      // -------------------------------------------------------

      const {
        error: updateError,
      } = await supabase
        .from("jmi_funzone_predictions")
        .update({
          accuracy_percentage: accuracy,
          points_awarded: points,
          actual_collection: actualCollection,
          scored_at: new Date().toISOString(),
        })
        .eq("id", prediction.id)
        .is("scored_at", null);

      if (updateError) {
        console.error(
          "Fun Zone scoring update error:",
          updateError
        );

        failedCount++;
        continue;
      }

      scoredCount++;
    }

    // ---------------------------------------------------------
    // 10. Response
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Fun Zone scoring process completed.",
      scored_count: scoredCount,
      waiting_for_actual_data: waitingCount,
      failed_count: failedCount,
    });
  } catch (error) {
    console.error(
      "Fun Zone scoring API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while scoring Fun Zone predictions.",
      },
      { status: 500 }
    );
  }
}