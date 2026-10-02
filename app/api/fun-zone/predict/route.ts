import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

const IST_TIME_ZONE = "Asia/Kolkata";

function getIndiaDateTime() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());

  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // ---------------------------------------------------------
    // 1. Verify the logged-in JMI user
    // ---------------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to submit a prediction.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // 2. Read request body
    // ---------------------------------------------------------

    const body = await request.json();

    const dailyMovieId = Number(body?.daily_movie_id);
    const predictedCollection = Number(body?.predicted_collection);

    if (!Number.isInteger(dailyMovieId) || dailyMovieId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Fun Zone challenge.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(predictedCollection) ||
      predictedCollection < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid prediction.",
        },
        { status: 400 }
      );
    }

    // PostgreSQL numeric(15,2) maximum.
    if (predictedCollection > 9999999999999.99) {
      return NextResponse.json(
        {
          success: false,
          error: "Prediction amount is too large.",
        },
        { status: 400 }
      );
    }

    // Allow maximum two decimal places.
    const decimalPlaces = (predictedCollection.toString().split(".")[1] || "")
      .length;

    if (decimalPlaces > 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Prediction can contain a maximum of two decimal places.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 3. Check India time
    //
    // Participation:
    // 07:00 AM inclusive
    // 12:00 PM exclusive
    // ---------------------------------------------------------

    const indiaTime = getIndiaDateTime();

    const currentMinutes =
      indiaTime.hour * 60 + indiaTime.minute;

    const startMinutes = 7 * 60;
    const endMinutes = 12 * 60;

    if (
      currentMinutes < startMinutes ||
      currentMinutes >= endMinutes
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Fun Zone predictions are available daily from 07:00 AM to 12:00 PM IST.",
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------------------
    // 4. Check that the challenge exists and is active
    // ---------------------------------------------------------

    const { data: challenge, error: challengeError } = await supabase
      .from("jmi_funzone_daily_movies")
      .select(`
        id,
        movie_id,
        challenge_date,
        is_active
      `)
      .eq("id", dailyMovieId)
      .eq("is_active", true)
      .maybeSingle();

    if (challengeError) {
      console.error(
        "Fun Zone challenge lookup error:",
        challengeError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify the Fun Zone challenge.",
        },
        { status: 500 }
      );
    }

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          error: "This Fun Zone challenge is not active.",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // 5. Make sure the challenge is for today in India
    // ---------------------------------------------------------

    if (challenge.challenge_date !== indiaTime.date) {
      return NextResponse.json(
        {
          success: false,
          error: "This Fun Zone challenge is not available today.",
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------------------
    // 6. Check whether this user has already predicted
    // ---------------------------------------------------------

    const { data: existingPrediction, error: existingError } =
      await supabase
        .from("jmi_funzone_predictions")
        .select("id")
        .eq("user_id", user.id)
        .eq("daily_movie_id", dailyMovieId)
        .maybeSingle();

    if (existingError) {
      console.error(
        "Existing Fun Zone prediction lookup error:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify your existing prediction.",
        },
        { status: 500 }
      );
    }

    if (existingPrediction) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already submitted a prediction for this movie.",
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------------
    // 7. Save prediction
    //
    // IMPORTANT:
    // user_id comes from the authenticated session.
    // It is NEVER accepted from the browser.
    //
    // Points, accuracy and actual collection are NOT accepted
    // from the browser either.
    // ---------------------------------------------------------

    const { data: prediction, error: insertError } = await supabase
      .from("jmi_funzone_predictions")
      .insert({
        user_id: user.id,
        daily_movie_id: dailyMovieId,
        predicted_collection: predictedCollection,
      })
      .select(`
        id,
        daily_movie_id,
        predicted_collection,
        submitted_at
      `)
      .single();

    if (insertError) {
      console.error(
        "Fun Zone prediction insert error:",
        insertError
      );

      // Unique constraint protection.
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: "You have already submitted a prediction for this movie.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Unable to save your prediction.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 8. Success
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Your prediction has been submitted successfully.",
      prediction,
    });
  } catch (error) {
    console.error("Fun Zone prediction API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while submitting your prediction.",
      },
      { status: 500 }
    );
  }
}