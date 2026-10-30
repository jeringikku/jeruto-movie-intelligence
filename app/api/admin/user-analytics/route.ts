import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TrafficPoint = {
  date: string;
  views: number;
};

type Row = Record<string, unknown>;

type SnapshotRow = {
  snapshot_date: string;
  homepage_views: number;
  movie_page_views: number;
  combined_views: number;
};

function getEnvironment(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function numberValue(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

// Calculate daily traffic from consecutive cumulative snapshots.
// The first snapshot is a baseline, not a daily traffic figure.
function buildSnapshotSeries(
  rows: SnapshotRow[],
  field: "homepage_views" | "movie_page_views" | "combined_views"
): TrafficPoint[] {
  const sortedRows = [...rows].sort((a, b) =>
    a.snapshot_date.localeCompare(b.snapshot_date)
  );

  const dailySeries: TrafficPoint[] = [];

  for (let i = 1; i < sortedRows.length; i++) {
    const previous = numberValue(sortedRows[i - 1][field]);
    const current = numberValue(sortedRows[i][field]);

    // If a counter was reset, use the current total as the
    // traffic since the previous snapshot.
    const dailyViews =
      current >= previous ? current - previous : current;

    dailySeries.push({
      date: sortedRows[i].snapshot_date,
      views: dailyViews,
    });
  }

  return dailySeries.slice(-90);
}

export async function GET(request: Request) {
  try {
    const supabaseUrl = getEnvironment("NEXT_PUBLIC_SUPABASE_URL");
    const anonKey = getEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const serviceRoleKey = getEnvironment("SUPABASE_SERVICE_ROLE_KEY");

    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    // Keep compatibility with the existing browser implementation.
    const cookieHeader = request.headers.get("cookie");
    let cookieToken: string | null = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";");

      for (const cookie of cookies) {
        const [rawName, ...rawValue] = cookie.trim().split("=");

        if (
          rawName === "sb-access-token" ||
          rawName.endsWith("-auth-token")
        ) {
          const value = rawValue.join("=");

          try {
            const decoded = decodeURIComponent(value);

            if (decoded.startsWith("eyJ")) {
              cookieToken = decoded;
            } else if (decoded.startsWith("{")) {
              const parsed = JSON.parse(decoded);
              cookieToken =
                parsed.access_token ??
                parsed.currentSession?.access_token ??
                null;
            } else {
              const parsed = JSON.parse(decoded);
              cookieToken =
                Array.isArray(parsed) && typeof parsed[0] === "string"
                  ? parsed[0]
                  : null;
            }
          } catch {
            // Bearer token remains supported.
          }

          if (cookieToken) break;
        }
      }
    }

    const accessToken = bearerToken || cookieToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Your admin session is missing. Please sign in again." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Verify the authenticated user.
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Your session is invalid or expired. Please sign in again." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Verify administrator permissions.
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: roleData, error: roleError } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError) {
      console.error("JMI admin role lookup failed:", roleError);

      return NextResponse.json(
        { error: "Unable to verify administrator permissions." },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    if (roleData?.role !== "admin") {
      return NextResponse.json(
        { error: "Administrator access required." },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Server-only Supabase client.
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const [
      profileResult,
      homepageResult,
      movieViewsResult,
      moviesResult,
      snapshotsResult,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", {
        count: "exact",
        head: true,
      }),

      supabaseAdmin.from("jmi_homepage_views").select("*"),

      supabaseAdmin.from("jmi_movie_page_views").select("*"),

      supabaseAdmin.from("movies").select("id, title, release_year"),

      // New daily cumulative snapshot table.
      supabaseAdmin
        .from("jmi_daily_traffic_snapshots")
        .select(
          "snapshot_date, homepage_views, movie_page_views, combined_views"
        )
        .order("snapshot_date", { ascending: true }),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (homepageResult.error) throw homepageResult.error;
    if (movieViewsResult.error) throw movieViewsResult.error;
    if (moviesResult.error) throw moviesResult.error;
    if (snapshotsResult.error) throw snapshotsResult.error;

    const homepageRows = (homepageResult.data ?? []) as Row[];
    const movieViewRows = (movieViewsResult.data ?? []) as Row[];
    const movies = moviesResult.data ?? [];

    const snapshots = (snapshotsResult.data ?? []) as SnapshotRow[];

    // Preserve existing lifetime cumulative totals.
    const homepageViews = homepageRows.reduce(
      (total, row) => total + numberValue(row.view_count),
      0
    );

    const moviePageViews = movieViewRows.reduce(
      (total, row) => total + numberValue(row.view_count),
      0
    );

    // Preserve the existing Most Viewed Movies calculation.
    const movieMap = new Map(
      movies.map((movie) => [Number(movie.id), movie])
    );

    const popularMovies = movieViewRows
      .map((row) => {
        const movieId = Number(row.movie_id);
        const movie = movieMap.get(movieId);

        if (!movie) return null;

        return {
          movie_id: movieId,
          view_count: numberValue(row.view_count),
          title: movie.title,
          release_year: movie.release_year,
        };
      })
      .filter((movie) => movie !== null)
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 10);

    // Get the actual total registered-user count.
    let registeredUsers = 0;
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } =
        await supabaseAdmin.auth.admin.listUsers({ page, perPage });

      if (error) throw error;

      registeredUsers += data.users.length;

      if (data.users.length < perPage) break;

      page += 1;
    }

    // Calculate daily traffic using consecutive snapshots.
    const homepageTraffic = buildSnapshotSeries(
      snapshots,
      "homepage_views"
    );

    const movieTraffic = buildSnapshotSeries(
      snapshots,
      "movie_page_views"
    );

    const combinedTraffic = buildSnapshotSeries(
      snapshots,
      "combined_views"
    );

    return NextResponse.json(
      {
        stats: {
          registeredUsers,
          totalProfiles: profileResult.count ?? 0,
          homepageViews,
          moviePageViews,
          moviesWithViews: new Set(
            movieViewRows.map((row) => Number(row.movie_id))
          ).size,
        },

        popularMovies,

        traffic: {
          homepage: homepageTraffic,
          movies: movieTraffic,
          combined: combinedTraffic,
          hasDatedRecords: combinedTraffic.length > 0,
          hasDailySnapshots: snapshots.length >= 2,
          snapshotCount: snapshots.length,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("JMI User Analytics API Error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to load analytics. Check server environment variables, Supabase permissions and database table names.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}