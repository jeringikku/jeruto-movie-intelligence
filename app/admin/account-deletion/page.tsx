"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DeletionRequest = {
  id: string;
  user_id: string | null;
  email: string;
  status: "pending" | "approved" | "rejected" | "completed";
  request_source: "website" | "app";
  requested_at: string;
  reviewed_at: string | null;
  completed_at: string | null;
  admin_notes: string | null;
};

type RequestFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

type DeletionPreview = {
  success: boolean;
  requestId: string;
  userId: string;
  email: string;
  counts: Record<string, number>;
};

export default function AccountDeletionPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [filter, setFilter] = useState<RequestFilter>("pending");
  const [adminVerified, setAdminVerified] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // PREVIEW STATE
  const [preview, setPreview] = useState<DeletionPreview | null>(null);
  const [previewError, setPreviewError] = useState("");

  // --------------------------------------------------
  // VERIFY ADMIN
  // --------------------------------------------------

  const verifyAdmin = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setAccessDenied(true);
      setLoading(false);
      return false;
    }

    const { data: roleRecord, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Admin role verification error:", error);
      setAccessDenied(true);
      setLoading(false);
      return false;
    }

    const role = String(roleRecord?.role || "").toLowerCase();

    if (!["admin", "owner", "super_admin"].includes(role)) {
      setAccessDenied(true);
      setLoading(false);
      return false;
    }

    setAdminVerified(true);
    setAccessDenied(false);

    return true;
  }, []);

  // --------------------------------------------------
  // FETCH REQUESTS
  // --------------------------------------------------

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const isAdmin = await verifyAdmin();

    if (!isAdmin) return;

    const { data, error } = await supabase
      .from("account_deletion_requests")
      .select(`
        id,
        user_id,
        email,
        status,
        request_source,
        requested_at,
        reviewed_at,
        completed_at,
        admin_notes
      `)
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Deletion requests fetch error:", error);

      setErrorMessage(
        "Unable to load deletion requests: " + error.message
      );

      setRequests([]);
      setLoading(false);
      return;
    }

    setRequests((data || []) as DeletionRequest[]);
    setLoading(false);
  }, [verifyAdmin]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // --------------------------------------------------
  // UPDATE REQUEST STATUS
  // --------------------------------------------------

  async function updateRequestStatus(
    request: DeletionRequest,
    newStatus: "approved" | "rejected"
  ) {
    const action = newStatus === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} the deletion request from ${request.email}?`
    );

    if (!confirmed) return;

    setUpdatingId(request.id);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("account_deletion_requests")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id)
      .eq("status", "pending")
      .select("id");

    if (error) {
      console.error("Request status update error:", error);

      setErrorMessage(
        "Unable to update request: " + error.message
      );

      setUpdatingId(null);
      return;
    }

    if (!data || data.length === 0) {
      setErrorMessage(
        "The request was not updated. It may already have been reviewed."
      );

      setUpdatingId(null);
      await fetchRequests();
      return;
    }

    alert(
      newStatus === "approved"
        ? "Deletion request approved. The account has NOT been deleted."
        : "Deletion request rejected."
    );

    await fetchRequests();
    setUpdatingId(null);
  }

  // --------------------------------------------------
  // GET ADMIN SESSION TOKEN
  // --------------------------------------------------

  async function getAdminAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      throw new Error(
        "Your administrator session is unavailable. Please log in again."
      );
    }

    return session.access_token;
  }

  // --------------------------------------------------
  // PREVIEW ACCOUNT DELETION
  // --------------------------------------------------

  async function previewAccountDeletion(request: DeletionRequest) {
    if (request.status !== "approved") {
      setPreviewError(
        "Only approved requests can be previewed."
      );
      return;
    }

    setPreviewingId(request.id);
    setPreview(null);
    setPreviewError("");
    setErrorMessage("");

    try {
      const accessToken = await getAdminAccessToken();

      const response = await fetch(
        `/api/admin/delete-account?requestId=${encodeURIComponent(
          request.id
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to generate deletion preview."
        );
      }

      setPreview(result as DeletionPreview);
    } catch (error) {
      console.error("Deletion preview error:", error);

      setPreviewError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the preview."
      );
    } finally {
      setPreviewingId(null);
    }
  }

  // --------------------------------------------------
  // PERMANENTLY DELETE ACCOUNT
  // --------------------------------------------------

  async function permanentlyDeleteAccount() {
    if (!preview || deletingAccount) return;

    const confirmation = window.prompt(
      `PERMANENT ACCOUNT DELETION\n\n` +
        `Account: ${preview.email}\n\n` +
        `User ID: ${preview.userId}\n\n` +
        `This action permanently deletes the account and its associated records.\n\n` +
        `This action cannot be undone.\n\n` +
        `Type DELETE to confirm:`
    );

    if (confirmation !== "DELETE") {
      return;
    }

    setDeletingAccount(true);
    setPreviewError("");
    setErrorMessage("");

    try {
      // Recheck the current administrator session.
      const accessToken = await getAdminAccessToken();

      const response = await fetch(
        "/api/admin/delete-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            requestId: preview.requestId,
            confirmation: "DELETE",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Account deletion failed."
        );
      }

      // Close preview after successful Auth deletion.
      setPreview(null);

      if (result.warning) {
        setErrorMessage(
          "The account was deleted, but the request status needs manual correction: " +
            result.warning
        );
      } else {
        alert(
          `Account successfully deleted.\n\n${preview.email}\n\nThe deletion request has been marked as completed.`
        );
      }

      // Refresh the request list.
      await fetchRequests();
    } catch (error) {
      console.error("Permanent account deletion error:", error);

      setPreviewError(
        error instanceof Error
          ? error.message
          : "Unable to delete this account."
      );
    } finally {
      setDeletingAccount(false);
    }
  }

  // --------------------------------------------------
  // CLOSE PREVIEW
  // --------------------------------------------------

  function closePreview() {
    if (deletingAccount) return;

    setPreview(null);
    setPreviewError("");
  }

  // --------------------------------------------------
  // FORMAT TABLE NAMES
  // --------------------------------------------------

  function formatTableName(name: string) {
    return name
      .replace(/^jmi_/, "JMI ")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  function formatDate(value: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------

  function getStatusStyle(status: string) {
    switch (status) {
      case "pending":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      case "approved":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";

      case "rejected":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "completed":
        return "border-green-500/30 bg-green-500/10 text-green-400";

      default:
        return "border-zinc-700 bg-zinc-900 text-zinc-400";
    }
  }

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((request) => request.status === filter);

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "rejected"
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "completed"
  ).length;

  // --------------------------------------------------
  // ACCESS DENIED
  // --------------------------------------------------

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-500/30 bg-zinc-950 p-8 text-center">
          <h2 className="text-xl font-bold text-red-400">
            Access Denied
          </h2>

          <p className="mt-3 text-sm text-zinc-400">
            This page is restricted to authorised JMI administrators.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading || !adminVerified) {
    return (
      <div className="min-h-screen bg-black p-6 text-zinc-400">
        Verifying administrator access...
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-6">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400 sm:text-3xl">
            Account Deletion Manager
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Review and manage JMI member account deletion requests.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          ↻ Refresh Requests
        </button>
      </div>

      {/* SUMMARY */}

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">
          Request Overview
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-xl border border-yellow-500/20 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Pending</p>
            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Approved</p>
            <p className="mt-2 text-2xl font-bold text-blue-400">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Rejected</p>
            <p className="mt-2 text-2xl font-bold text-red-400">
              {rejectedCount}
            </p>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Completed</p>
            <p className="mt-2 text-2xl font-bold text-green-400">
              {completedCount}
            </p>
          </div>

        </div>
      </div>

      {/* ERROR */}

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* PREVIEW ERROR */}

      {previewError && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <p>{previewError}</p>

          <button
            type="button"
            onClick={() => setPreviewError("")}
            className="text-red-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* REQUEST TABLE */}

      <div className="overflow-hidden rounded-xl border border-zinc-700 bg-black">

        <div className="flex flex-col gap-4 border-b border-zinc-700 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-xl font-bold">
              Account Deletion Requests
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Review incoming member requests.
            </p>
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as RequestFilter)
            }
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="pending">Pending Requests</option>
            <option value="approved">Approved Requests</option>
            <option value="rejected">Rejected Requests</option>
            <option value="completed">Completed Requests</option>
            <option value="all">All Requests</option>
          </select>

        </div>

        {filteredRequests.length === 0 ? (

          <div className="p-10 text-center">
            <p className="text-lg font-semibold text-zinc-300">
              No requests found
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              There are no requests under this category.
            </p>
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead className="bg-zinc-900">
                <tr>
                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Member
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    User ID
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Source
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Requested At
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredRequests.map((request) => (

                  <tr
                    key={request.id}
                    className="border-t border-zinc-800 transition hover:bg-zinc-900/50"
                  >

                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {request.email}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Request: {request.id.slice(0, 8)}...
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs text-zinc-400">
                      {request.user_id
                        ? `${request.user_id.slice(0, 12)}...`
                        : "External request"}
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {request.request_source}
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {formatDate(request.requested_at)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">

                      {request.status === "pending" ? (

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              updateRequestStatus(request, "approved")
                            }
                            disabled={updatingId === request.id}
                            className="rounded-lg bg-green-900/60 px-3 py-2 text-xs font-semibold text-green-300 transition hover:bg-green-800 disabled:opacity-50"
                          >
                            {updatingId === request.id
                              ? "Please wait..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateRequestStatus(request, "rejected")
                            }
                            disabled={updatingId === request.id}
                            className="rounded-lg bg-red-900/60 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-800 disabled:opacity-50"
                          >
                            Reject
                          </button>

                        </div>

                      ) : request.status === "approved" ? (

                        <button
                          type="button"
                          onClick={() =>
                            previewAccountDeletion(request)
                          }
                          disabled={
                            previewingId === request.id ||
                            deletingAccount
                          }
                          className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
                        >
                          {previewingId === request.id
                            ? "Loading Preview..."
                            : "Preview"}
                        </button>

                      ) : (

                        <span className="text-xs text-zinc-600">
                          Reviewed {formatDate(request.reviewed_at)}
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* DELETION PREVIEW MODAL */}

      {preview && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">

          <div className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-zinc-800 p-5">

              <div>
                <h2 className="text-xl font-bold text-blue-400">
                  Account Deletion Preview
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Review the records associated with this account.
                </p>
              </div>

              <button
                type="button"
                onClick={closePreview}
                disabled={deletingAccount}
                className="rounded-lg px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-40"
              >
                ✕
              </button>

            </div>

            {/* ACCOUNT DETAILS */}

            <div className="space-y-3 p-5">

              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-xs text-zinc-500">
                  Account Email
                </p>

                <p className="mt-1 break-all font-semibold text-white">
                  {preview.email}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-xs text-zinc-500">
                  Supabase User ID
                </p>

                <p className="mt-1 break-all font-mono text-xs text-zinc-300">
                  {preview.userId}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-xs text-zinc-500">
                  Deletion Request ID
                </p>

                <p className="mt-1 break-all font-mono text-xs text-zinc-300">
                  {preview.requestId}
                </p>
              </div>

            </div>

            {/* RECORD COUNTS */}

            <div className="px-5 pb-5">

              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-white">
                  Associated Database Records
                </h3>

                <span className="text-xs text-zinc-500">
                  {Object.keys(preview.counts).length} tables
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-800">

                {Object.entries(preview.counts).map(
                  ([table, count]) => (

                    <div
                      key={table}
                      className="flex items-center justify-between gap-4 border-b border-zinc-800 px-4 py-3 last:border-b-0"
                    >

                      <span className="text-sm text-zinc-300">
                        {formatTableName(table)}
                      </span>

                      <span
                        className={`min-w-10 rounded-md px-3 py-1 text-center text-sm font-bold ${
                          count > 0
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {count}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* SAFETY NOTICE */}

            <div className="mx-5 mb-5 rounded-xl border border-yellow-500/30 bg-yellow-500/[0.06] p-4">

              <p className="font-semibold text-yellow-400">
                Preview Only — No Data Deleted
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                This preview only reads database records. It has
                not deleted or modified the member's account,
                personal information, social activity or Auth
                credentials.
              </p>

            </div>

            {/* DELETION ERROR */}

            {previewError && (

              <div className="mx-5 mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {previewError}
              </div>

            )}

            {/* MODAL FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 p-5 sm:flex-row sm:justify-between">

              <button
                type="button"
                onClick={closePreview}
                disabled={deletingAccount}
                className="rounded-lg bg-zinc-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={permanentlyDeleteAccount}
                disabled={deletingAccount}
                className="rounded-lg border border-red-500/40 bg-red-600/20 px-6 py-3 text-sm font-bold text-red-400 transition hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingAccount
                  ? "Deleting Account..."
                  : "Permanently Delete Account"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* SAFETY NOTICE */}

      <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-5">

        <h3 className="font-semibold text-yellow-400">
          Account Deletion Safety
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Approving a request only changes its status to Approved.
          Previewing a request only displays associated database
          records. Permanent deletion removes the member's associated
          records and Supabase Auth account after explicit administrator
          confirmation. The deletion request history is retained.
        </p>

      </div>

    </div>
  );
}
