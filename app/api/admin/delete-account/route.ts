import { NextResponse } from "next/server";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROTECTED_ROLES = ["admin", "owner", "super_admin"];

// User-related tables identified during the JMI database audit.
// user_roles is intentionally deleted last in this list.
const USER_TABLES = [
  "jmi_funzone_predictions",
  "jmi_points_transactions",
  "jmi_user_points",
  "movie_user_ratings",
  "user_feature_usage",
  "user_subscriptions",
  "profiles",
  "user_roles",
] as const;

type AdminClient = SupabaseClient<any>;

type DeletionRequest = {
  id: string;
  user_id: string | null;
  email: string;
  status: string;
  reviewed_at: string | null;
  completed_at: string | null;
};

// --------------------------------------------------
// LOCAL DEVELOPMENT PROTECTION
// --------------------------------------------------

function localOnlyResponse() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This deletion service is disabled in production." },
      { status: 404 }
    );
  }

  return null;
}

// --------------------------------------------------
// VERIFY ADMINISTRATOR
// --------------------------------------------------

async function getAdminClient(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    throw new Error(
      "Supabase credentials are not configured."
    );
  }

  // Read the exact authenticated browser session token.
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error(
      "Your login session was not received. Please log in again."
    );
  }

  const accessToken = authorization.slice(7).trim();

  if (!accessToken) {
    throw new Error("Invalid login session.");
  }

  // Verify the browser session using the public client.
  const authClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(accessToken);

  if (authError || !user) {
    throw new Error(
      "Your login session is invalid or expired."
    );
  }

  // Create privileged client only after verifying the user.
  const admin = createClient<any>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Check administrator role.
  const { data: roles, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (roleError) {
    console.error("Administrator role query failed:", roleError);

    throw new Error(
      "Unable to verify administrator permissions."
    );
  }

  const authorised = (roles || []).some((record) =>
    PROTECTED_ROLES.includes(
      String(record.role || "").toLowerCase()
    )
  );

  if (!authorised) {
    console.error(
      "Deletion API administrator verification failed:",
      {
        userId: user.id,
        roles,
      }
    );

    throw new Error("Administrator access required.");
  }

  return {
    admin,
    adminUserId: user.id,
  };
}

// --------------------------------------------------
// GET APPROVED DELETION REQUEST
// --------------------------------------------------

async function getApprovedRequest(
  admin: AdminClient,
  requestId: string
): Promise<DeletionRequest> {
  const { data, error } = await admin
    .from("account_deletion_requests")
    .select(
      "id, user_id, email, status, reviewed_at, completed_at"
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Deletion request not found.");
  }

  if (data.status !== "approved") {
    throw new Error(
      "Only approved deletion requests can be processed."
    );
  }

  if (data.completed_at) {
    throw new Error(
      "This deletion request is already completed."
    );
  }

  if (!data.user_id) {
    throw new Error(
      "This request has no linked account ID. Manual verification is required."
    );
  }

  return data as DeletionRequest;
}

// --------------------------------------------------
// VERIFY TARGET ACCOUNT
// --------------------------------------------------

async function getTargetUser(
  admin: AdminClient,
  userId: string,
  email: string
) {
  const { data, error } =
    await admin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw new Error(
      "The Supabase Auth account was not found."
    );
  }

  const target = data.user;

  // Confirm the request email matches the Auth account.
  if (
    !target.email ||
    target.email.trim().toLowerCase() !==
      email.trim().toLowerCase()
  ) {
    throw new Error(
      "The request email does not match the Supabase Auth account."
    );
  }

  // Never allow deletion of JMI administrator accounts.
  const { data: roles, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (roleError) {
    throw new Error(
      "Unable to verify the target account role."
    );
  }

  const protectedAccount = (roles || []).some((record) =>
    PROTECTED_ROLES.includes(
      String(record.role || "").toLowerCase()
    )
  );

  if (protectedAccount) {
    throw new Error(
      "JMI administrator accounts cannot be deleted through this process."
    );
  }

  return target;
}

// --------------------------------------------------
// COUNT USER RECORDS
// --------------------------------------------------

async function countRecords(
  admin: AdminClient,
  table: string,
  column: string,
  userId: string
) {
  const { count, error } = await admin
    .from(table)
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(column, userId);

  if (error) {
    throw new Error(
      `Unable to inspect ${table}: ${error.message}`
    );
  }

  return count || 0;
}

// --------------------------------------------------
// DELETE USER RECORDS
// --------------------------------------------------

async function deleteRecords(
  admin: AdminClient,
  table: string,
  userId: string
) {
  const { error } = await admin
    .from(table)
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Deletion failed in ${table}: ${error.message}`
    );
  }
}

// --------------------------------------------------
// GET: PREVIEW ACCOUNT DELETION
// --------------------------------------------------

export async function GET(request: Request) {
  const localResponse = localOnlyResponse();

  if (localResponse) return localResponse;

  try {
    const { admin } = await getAdminClient(request);

    const requestId = new URL(request.url)
      .searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required." },
        { status: 400 }
      );
    }

    const deletionRequest = await getApprovedRequest(
      admin,
      requestId
    );

    const target = await getTargetUser(
      admin,
      deletionRequest.user_id!,
      deletionRequest.email
    );

    const counts: Record<string, number> = {};

    // Original user-related tables.
    for (const table of USER_TABLES) {
      counts[table] = await countRecords(
        admin,
        table,
        "user_id",
        target.id
      );
    }

    // User's social activity.
    counts.jmi_social_posts = await countRecords(
      admin,
      "jmi_social_posts",
      "user_id",
      target.id
    );

    counts.jmi_social_reactions = await countRecords(
      admin,
      "jmi_social_reactions",
      "user_id",
      target.id
    );

    counts.jmi_social_replies = await countRecords(
      admin,
      "jmi_social_replies",
      "user_id",
      target.id
    );

    counts.jmi_social_reports = await countRecords(
      admin,
      "jmi_social_reports",
      "reporter_id",
      target.id
    );

    return NextResponse.json(
      {
        success: true,
        requestId,
        userId: target.id,
        email: target.email,
        counts,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Deletion preview error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to preview account deletion.",
      },
      { status: 400 }
    );
  }
}

// --------------------------------------------------
// POST: PERMANENT ACCOUNT DELETION
// --------------------------------------------------

export async function POST(request: Request) {
  const localResponse = localOnlyResponse();

  if (localResponse) return localResponse;

  try {
    const { admin, adminUserId } =
      await getAdminClient(request);

    let body: {
      requestId?: string;
      confirmation?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const requestId = String(body.requestId || "").trim();
    const confirmation = String(
      body.confirmation || ""
    );

    if (!requestId || confirmation !== "DELETE") {
      return NextResponse.json(
        {
          error:
            'A valid request ID and the confirmation word "DELETE" are required.',
        },
        { status: 400 }
      );
    }

    // Recheck the approved request immediately before deletion.
    const deletionRequest = await getApprovedRequest(
      admin,
      requestId
    );

    // Reverify the target Auth account and email.
    const target = await getTargetUser(
      admin,
      deletionRequest.user_id!,
      deletionRequest.email
    );

    const targetId = target.id;

    // Prevent administrator self-deletion.
    if (targetId === adminUserId) {
      return NextResponse.json(
        {
          error:
            "You cannot delete your own administrator account.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 1. DELETE REPORTS SUBMITTED BY THIS USER
    // --------------------------------------------------

    {
      const { error } = await admin
        .from("jmi_social_reports")
        .delete()
        .eq("reporter_id", targetId);

      if (error) {
        throw new Error(
          `Social report deletion failed: ${error.message}`
        );
      }
    }

    // --------------------------------------------------
    // 2. DELETE USER'S REACTIONS
    // --------------------------------------------------

    {
      const { error } = await admin
        .from("jmi_social_reactions")
        .delete()
        .eq("user_id", targetId);

      if (error) {
        throw new Error(
          `Reaction deletion failed: ${error.message}`
        );
      }
    }

    // --------------------------------------------------
    // 3. DELETE USER'S REPLIES
    // --------------------------------------------------

    {
      const { error } = await admin
        .from("jmi_social_replies")
        .delete()
        .eq("user_id", targetId);

      if (error) {
        throw new Error(
          `Reply deletion failed: ${error.message}`
        );
      }
    }

    // --------------------------------------------------
    // 4. DELETE USER'S POSTS
    // --------------------------------------------------
    // Confirmed CASCADE relationships should remove
    // dependent replies, reactions and attached reports.

    {
      const { error } = await admin
        .from("jmi_social_posts")
        .delete()
        .eq("user_id", targetId);

      if (error) {
        throw new Error(
          `Post deletion failed: ${error.message}`
        );
      }
    }

    // --------------------------------------------------
    // 5. DELETE REMAINING USER RECORDS
    // --------------------------------------------------
    // user_roles is last in USER_TABLES.

    for (const table of USER_TABLES) {
      await deleteRecords(admin, table, targetId);
    }

    // --------------------------------------------------
    // 6. DELETE SUPABASE AUTH USER LAST
    // --------------------------------------------------

    const { error: authDeleteError } =
      await admin.auth.admin.deleteUser(targetId);

    if (authDeleteError) {
      throw new Error(
        `Supabase Auth deletion failed: ${authDeleteError.message}`
      );
    }

    // --------------------------------------------------
    // 7. MARK REQUEST COMPLETED
    // --------------------------------------------------
    // The request history is retained.
    // Its user_id is expected to become NULL through
    // the existing ON DELETE SET NULL foreign key.

    const { error: completionError } = await admin
  .from("account_deletion_requests")
  .update({
  status: "completed",
  user_id: null,
  completed_at: new Date().toISOString(),
  reviewed_at:
    deletionRequest.reviewed_at || new Date().toISOString(),
})
.eq("id", requestId)
.eq("status", "approved");

    if (completionError) {
      console.error(
        "Account deleted but request status update failed:",
        completionError
      );

      return NextResponse.json({
        success: true,
        warning:
          "The account was deleted, but the deletion request status needs manual correction.",
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "The JMI account and associated records were deleted successfully.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Account deletion failed.",
      },
      { status: 500 }
    );
  }
}