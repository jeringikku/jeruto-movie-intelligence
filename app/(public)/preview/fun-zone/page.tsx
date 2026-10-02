import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import PublicHeader from "../../components/PublicHeader";
import FunZonePredictionCard from "./FunZonePredictionCard";
import FunZoneLeaderboard from "./FunZoneLeaderboard";
import FunZoneStats from "./FunZoneStats";
import FunZonePageBanner from "./FunZonePageBanner";

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
  };
}

export default async function FunZonePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const indiaTime = getIndiaDateTime();

  const currentMinutes =
    indiaTime.hour * 60 + indiaTime.minute;

  const isPredictionWindow =
    currentMinutes >= 7 * 60 &&
    currentMinutes < 12 * 60;

  // ---------------------------------------------------------
  // LOAD TODAY'S ACTIVE FUN ZONE CHALLENGES
  // ---------------------------------------------------------

  const { data: challenges, error: challengeError } =
    await supabase
      .from("jmi_funzone_daily_movies")
      .select(`
        id,
        movie_id,
        challenge_date,
        is_active
      `)
      .eq("challenge_date", indiaTime.date)
      .eq("is_active", true)
      .order("id", { ascending: true });

  if (challengeError) {
    console.error("Fun Zone challenge error:", challengeError);
  }

  const challengeRows = challenges || [];

  // ---------------------------------------------------------
  // LOAD MOVIE INFORMATION
  // ---------------------------------------------------------

  const movieIds = Array.from(
    new Set(
      challengeRows.map((challenge) =>
        Number(challenge.movie_id)
      )
    )
  );

  let movieRows: any[] = [];

  if (movieIds.length > 0) {
    const { data: movies, error: movieError } =
      await supabase
        .from("movies")
        .select(`
          id,
          title
        `)
        .in("id", movieIds);

    if (movieError) {
      console.error("Fun Zone movie error:", movieError);
    } else {
      movieRows = movies || [];
    }
  }

  const movieMap = new Map<number, any>();

  movieRows.forEach((movie) => {
    movieMap.set(Number(movie.id), movie);
  });

  const funZoneChallenges = challengeRows.map((challenge) => ({
    id: Number(challenge.id),
    movie_id: Number(challenge.movie_id),
    challenge_date: challenge.challenge_date,
    movie_title:
      movieMap.get(Number(challenge.movie_id))?.title ||
      "Unknown Movie",
  }));

  // ---------------------------------------------------------
  // LOAD EXISTING USER PREDICTIONS
  // ---------------------------------------------------------

  let existingPredictionIds: number[] = [];

  if (user && funZoneChallenges.length > 0) {
    const challengeIds = funZoneChallenges.map(
      (challenge) => challenge.id
    );

    const { data: predictions, error: predictionError } =
      await supabase
        .from("jmi_funzone_predictions")
        .select("daily_movie_id")
        .eq("user_id", user.id)
        .in("daily_movie_id", challengeIds);

    if (predictionError) {
      console.error(
        "Fun Zone prediction lookup error:",
        predictionError
      );
    } else {
      existingPredictionIds = (predictions || []).map(
        (prediction) => Number(prediction.daily_movie_id)
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <PublicHeader />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <FunZonePageBanner />
       {/* FUN ZONE HERO */}

<div className="relative mb-5 overflow-hidden rounded-2xl border border-zinc-800 bg-violet-900/18">
  {/* subtle background glow */}

  <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-pink-500/30 blur-3xl" />

  <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-yellow-400/5 blur-3xl" />

  <div className="relative px-5 py-7 sm:px-7 sm:py-8">
    <div className="flex flex-col gap-6">
      {/* TITLE */}

      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-sm">
            🎮
          </span>

          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-400">
            JMI FUN ZONE
          </p>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-4xl">
          Predict. Play. Have Fun.
        </h1>

        <p className="mt-2 max-w-2xl text-xs leading-6 text-zinc-500 sm:text-sm">
          Test your box-office instincts by predicting the next-day
          collection of participating movies and see how closely your
          call matches the actual JMI figure.
        </p>
      </div>

      {/* STATUS STRIP */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-lg border border-yellow-400/20 bg-yellow-400/[0.04] px-3 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.7)]" />

          <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-yellow-300">
            Daily Prediction Window
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2.5">
          <span className="text-sm">⏱️</span>

          <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400">
            07:00 AM – 12:00 PM IST
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

{/* ENTERTAINMENT-ONLY DISCLAIMER */}

<div className="relative mb-7 overflow-hidden rounded-xl border border-yellow-400/20 bg-yellow-400/[0.035]">
  <div className="absolute left-0 top-0 h-full w-0.5 bg-yellow-400/70" />

  <div className="flex gap-3 px-4 py-4 sm:px-5">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-base">
      🎬
    </div>

    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-red-400">
        JMI Fun Zone — Entertainment Only
      </p>

      <p className="mt-2 text-[10px] leading-5 text-zinc-400 sm:text-xs sm:leading-6">
        JMI Fun Zone is an entertainment feature created purely for
        fun and to let members test their box-office instincts
        against JMI data.
      </p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-red-400">
          ⚠️ No Real Money
        </span>

        <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-300">
          No Betting
        </span>

        <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-300">
          No Wagering
        </span>

        <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-300">
          No Monetary Transactions
        </span>
      </div>

      <p className="mt-3 text-[9px] leading-5 text-zinc-400">
        JMI does not promote or facilitate online betting or
        real-money prediction games. JMI Points have no monetary
        value and cannot be exchanged for cash or monetary benefits.
      </p>

      <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400">
        Make your prediction. Test your instincts. Have fun! 🎯
      </p>
    </div>
  </div>
</div>

        {/* NOT LOGGED IN */}

        {!user ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-xl">
              🎯
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              Sign in to enter the Fun Zone
            </h2>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
              JMI Fun Zone is available to registered JMI members.
              Sign in to participate in daily movie collection
              challenges and build your JMI Points.
            </p>

            <p className="mt-5 text-[9px] uppercase tracking-[0.16em] text-yellow-400">
              Use the Sign In option in the JMI navigation
            </p>
          </div>
        ) : (
          <>
            {/* LOCKED WINDOW */}

            {!isPredictionWindow && (
              <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-5">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-lg">
                    ⏰
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-yellow-400">
                      Prediction Window Closed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-300">
                      Fun Zone predictions are available every day
                      from <span className="text-green-500">07:00 AM</span>{" "}
                      until <span className="text-green-500">12:00 PM IST</span>.
                    </p>

                    <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-violet-500">
                      Come back tomorrow at 07:00 AM IST
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* RULES */}

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-[8px] uppercase tracking-[0.15em] text-green-400">
                  Accuracy
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  Closer = More Points
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-[8px] uppercase tracking-[0.15em] text-green-400">
                  Maximum
                </p>
                <p className="mt-2 text-sm font-semibold text-yellow-400">
                  10 JMI Points
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-[8px] uppercase tracking-[0.15em] text-green-400">
                  Participation
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  1 Prediction / Movie
                </p>
              </div>
            </div>

            {/* TODAY'S CHALLENGES */}

<div>
  {/* SECTION HEADER */}

  <div className="mb-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-base">
          🎯
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-violet-400">
              Today's Challenges
            </p>

            <span className="rounded-full border border-yellow-400/20 bg-yellow-400/[0.05] px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-yellow-400">
              Live
            </span>
          </div>

          <h2 className="mt-1 text-base font-semibold text-white sm:text-lg">
            Make Your Prediction
          </h2>

          <p className="mt-1 text-[9px] leading-4 text-zinc-400">
            Pick your call and see how close you can get.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-800 bg-black px-3 py-2">
        <span className="text-[9px]">📅</span>

        <div>
          <p className="text-[7px] uppercase tracking-[0.12em] text-green-500">
            Challenge Date
          </p>

          <p className="mt-0.5 text-[9px] font-medium text-zinc-300">
            {indiaTime.date}
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* CHALLENGE LIST */}

  {funZoneChallenges.length === 0 ? (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-black text-lg">
        🎬
      </div>

      <p className="mt-4 text-sm font-medium text-zinc-300">
        No Fun Zone challenge is active today.
      </p>

      <p className="mt-2 text-xs text-zinc-600">
        Please check again when a new challenge is published.
      </p>
    </div>
  ) : (
    <div className="grid gap-4 md:grid-cols-2">
      {funZoneChallenges.map((challenge, index) => (
        <div
          key={challenge.id}
          className="relative overflow-hidden rounded-xl"
        >
          {/* ROUND NUMBER */}

          <div className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-yellow-400/20 bg-black/90 shadow-lg">
            <span className="text-[8px] font-bold tracking-[0.08em] text-yellow-400">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* CHALLENGE CARD */}

          <FunZonePredictionCard
            challenge={challenge}
            isPredictionWindow={isPredictionWindow}
            alreadyPredicted={existingPredictionIds.includes(
              challenge.id
            )}
          />
        </div>
      ))}
    </div>
  )}
</div>

            <FunZoneStats />

            <FunZoneLeaderboard />

            {/* ENTERTAINMENT NOTICE */}

            <div className="mt-8 border-t border-zinc-900 pt-5">
              <p className="text-center text-[8px] uppercase tracking-[0.12em] text-zinc-400">
                JMI Fun Zone is an entertainment feature. No real
                money, prizes or financial rewards are involved.
              </p>
            </div>
          </>
        )}
      

       {/* =====================================================
          FOOTER
      ===================================================== */}

<div className="mt=5"></div>
      <footer className="border-t border-zinc-900">

        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">

          <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div>

              <p className="font-serif text-sm font-medium text-zinc-300">
                Jeruto{" "}
                <span className="text-yellow-400">
                  Movie Intelligence
                </span>
              </p>

              <p className="mt-1 text-[9px] text-zinc-500">
                India's Next Generation Movie Intelligence Platform
              </p>

            </div>

            <p className="text-[9px] text-zinc-500">
              JMI · Intelligence
            </p>

          </div>

        </div>

      </footer>
      </section>
    </main>
  );
}