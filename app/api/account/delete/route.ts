import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST() {
  try {
    // 1. Authenticate the person making the request.
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in again before deleting your account." },
        { status: 401 }
      );
    }

    // 2. Create an admin client on the server only.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase server environment variables are missing.");

      return NextResponse.json(
        { error: "Account deletion is temporarily unavailable." },
        { status: 500 }
      );
    }

    const admin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 3. Protect JMI administrator accounts.
    const { data: roleRecords, error: roleError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (roleError) {
      console.error("Could not verify account role:", roleError);

      return NextResponse.json(
        { error: "We could not verify your account permissions. Please try again." },
        { status: 500 }
      );
    }

    const isProtectedAccount = (roleRecords || []).some(
      (record) =>
        ["admin", "owner", "super_admin"].includes(
          String(record.role || "").toLowerCase()
        )
    );

    if (isProtectedAccount) {
      return NextResponse.json(
        { error: "JMI administrator accounts cannot be deleted through this option." },
        { status: 403 }
      );
    }

    // 4. Find posts created by this account.
    const { data: posts, error: postsLookupError } = await admin
      .from("jmi_social_posts")
      .select("id")
      .eq("user_id", user.id);

    if (postsLookupError) throw postsLookupError;

    const postIds = (posts || []).map((post) => post.id);

    // 5. Remove reactions and replies attached to those posts.
    if (postIds.length > 0) {
      const { error: postReactionsError } = await admin
        .from("jmi_social_reactions")
        .delete()
        .in("post_id", postIds);

      if (postReactionsError) throw postReactionsError;

      const { error: postRepliesError } = await admin
        .from("jmi_social_replies")
        .delete()
        .in("post_id", postIds);

      if (postRepliesError) throw postRepliesError;
    }

    // 6. Remove this user's own social activity.
    const socialDeletes = [
      admin
        .from("jmi_social_reactions")
        .delete()
        .eq("user_id", user.id),

      admin
        .from("jmi_social_replies")
        .delete()
        .eq("user_id", user.id),
    ];

    const socialResults = await Promise.all(socialDeletes);

    for (const result of socialResults) {
      if (result.error) throw result.error;
    }

    // 7. Remove the user's posts.
    const { error: postsDeleteError } = await admin
      .from("jmi_social_posts")
      .delete()
      .eq("user_id", user.id);

    if (postsDeleteError) throw postsDeleteError;

    // 8. Remove the user's remaining records.
    // The order removes dependent activity before account records.
    const userDataTables = [
      "jmi_funzone_predictions",
      "jmi_points_transactions",
      "jmi_user_points",
      "movie_user_ratings",
      "user_feature_usage",
      "user_subscriptions",
      "profiles",
      "user_roles",
    ];

    for (const table of userDataTables) {
      const { error } = await admin
        .from(table)
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error(`Account deletion failed in ${table}:`, error);
        throw error;
      }
    }

    // 9. Delete the Supabase Auth account last.
    const { error: authDeleteError } =
      await admin.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error("Auth account deletion failed:", authDeleteError);
      throw authDeleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Your JMI account has been deleted.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);

    return NextResponse.json(
      {
        error:
          "We could not complete account deletion. Please contact JMI support before trying again.",
      },
      { status: 500 }
    );
  }
}