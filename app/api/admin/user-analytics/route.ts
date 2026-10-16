import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    // 1. Read the access token sent by the browser
    const authHeader = request.headers.get("authorization");

    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Create a Supabase client using the user's access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 3. Verify the user's access token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 4. Verify that the user is an administrator
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError || roleData?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 5. Create a server-only Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 6. Count all registered accounts in Supabase Auth
    let registeredUsers = 0;
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } =
        await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });

      if (error) {
        throw error;
      }

      registeredUsers += data.users.length;

      // Stop when the final page has been reached
      if (data.users.length < perPage) {
        break;
      }

      page++;
    }

    // 7. Return only the total account count
    return NextResponse.json(
      { registeredUsers },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("JMI User Count API Error:", error);

    return NextResponse.json(
      { error: "Unable to fetch registered user count" },
      { status: 500 }
    );
  }
}