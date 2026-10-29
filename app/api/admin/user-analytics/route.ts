import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TrafficPoint = {
  date: string;
  views: number;
};

type Row = Record<string, unknown>;

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

function getRowDate(row: Row): string | null {
  // Only use actual date/time fields; never infer historical dates
  // from a cumulative counter.
  const possibleFields = [
    "view_date",
    "event_date",
    "recorded_date",
    "created_at",
    "viewed_at",
    "recorded_at",
    "timestamp",
    "date",
  ];

  for (const field of possibleFields) {
    const value = row[field];

    if (typeof value !== "string" || !value.trim()) continue;

    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return null;
}

function buildDailySeries(rows: Row[]): TrafficPoint[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const date = getRowDate(row);

    // Undated cumulative records are not historical daily events.
    if (!date) continue;

    const hasViewCount =
      row.view_count !== null && row.view_count !== undefined;

    // Supports either records carrying a view_count or individual
    // dated event rows. Verify the actual table structure before
    // relying on either format for historical reporting.
    const views = hasViewCount ? numberValue(row.view_count) : 1;

    totals.set(date, (totals.get(date) ?? 0) + views);
  }

  return Array.from(totals.entries())
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-90);
}

function combineSeries(
  homepage: TrafficPoint[],
  movies: TrafficPoint[]
): TrafficPoint[] {
  const totals = new Map<string, number>();

  for (const point of homepage) {
    totals.set(point.date, (totals.get(point.date) ?? 0) + point.views);
  }

  for (const point of movies) {
    totals.set(point.date, (totals.get(point.date) ?? 0) + point.views);
  }

  return Array.from(totals.entries())
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-90);
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

    // Keep compatibility with the existing browser implementation,
    // which sends the current Supabase access token.
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
            // Cookie formats can vary; the bearer token remains supported.
          }

          if (cookieToken) break;
        }
      }
    }

    const accessToken = bearerToken || cookieToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Your admin session is missing. Please sign in again." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

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
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Verify admin status with the authenticated user's permissions.
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
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (roleData?.role !== "admin") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Server-only client: never expose the service-role key to the browser.
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
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", {
        count: "exact",
        head: true,
      }),
      supabaseAdmin.from("jmi_homepage_views").select("*"),
      supabaseAdmin
        .from("jmi_movie_page_views")
        .select("*"),
      supabaseAdmin.from("movies").select("id, title, release_year"),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (homepageResult.error) throw homepageResult.error;
    if (movieViewsResult.error) throw movieViewsResult.error;
    if (moviesResult.error) throw moviesResult.error;

    const homepageRows = (homepageResult.data ?? []) as Row[];
    const movieViewRows = (movieViewsResult.data ?? []) as Row[];
    const movies = moviesResult.data ?? [];

    const homepageViews = homepageRows.reduce(
      (total, row) => total + numberValue(row.view_count),
      0
    );

    const moviePageViews = movieViewRows.reduce(
      (total, row) => total + numberValue(row.view_count),
      0
    );

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

    // Supabase Auth count: the API returns the actual total, not
    // the number of users on the first page only.
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

    const homepageTraffic = buildDailySeries(homepageRows);
    const movieTraffic = buildDailySeries(movieViewRows);

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
          combined: combineSeries(homepageTraffic, movieTraffic),
          hasDatedRecords:
            homepageTraffic.length > 0 || movieTraffic.length > 0,
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
  }}