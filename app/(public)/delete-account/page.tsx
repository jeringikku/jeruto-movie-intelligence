"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PublicHeader from "@/app/(public)/components/PublicHeader";

export default function DeleteAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccess(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage("Please enter your registered email and password.");
      return;
    }

    setSubmitting(true);

    try {
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL;

      const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Authentication is temporarily unavailable.");
      }

      // Temporary client: does not replace the visitor's existing session.
      const verificationClient = createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );

      // 1. Verify account credentials.
      const {
        data: authData,
        error: authError,
      } = await verificationClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError || !authData.user) {
        throw new Error(
          "The email or password is incorrect. Please check your credentials."
        );
      }

      // 2. Verify the authenticated email.
      if (
        authData.user.email?.trim().toLowerCase() !==
        normalizedEmail
      ) {
        throw new Error(
          "The authenticated account does not match the submitted email."
        );
      }

      // 3. Submit the authenticated deletion request.
      const { error: insertError } =
        await verificationClient
          .from("account_deletion_requests")
          .insert({
            user_id: authData.user.id,
            email: normalizedEmail,
            status: "pending",
            request_source: "website",
          });

      if (insertError) {
        console.error(
          "Deletion request submission error:",
          insertError
        );

        throw new Error(
          "We could not submit your request. Please try again later."
        );
      }

      setSuccess(true);
      setEmail("");
      setPassword("");

    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-[#050507] px-4 pb-20 pt-28 text-zinc-100 sm:px-6">

        <div className="mx-auto max-w-2xl">

          {/* HEADER */}

          <div className="mb-8 text-center">

            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              Jeruto Movie Intelligence
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Account Deletion
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-500">
              Request permanent deletion of your JMI account
              and associated personal information.
            </p>

          </div>

          {/* FORM CARD */}

          <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 shadow-2xl sm:p-8">

            {success ? (

              <div className="py-8 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] text-2xl text-emerald-400">
                  ✓
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  Request Submitted
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
                  Your account deletion request has been
                  submitted successfully. A JMI administrator
                  will review it before proceeding.
                </p>

                <p className="mt-4 text-xs text-yellow-400">
                  Your account remains active until deletion
                  is completed.
                </p>

                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-7 rounded-xl border border-white/10 px-6 py-3 text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.05]"
                >
                  Submit Another Request
                </button>

              </div>

            ) : (

              <form onSubmit={handleSubmit}>

                <div className="mb-6">

                  <h2 className="text-base font-semibold text-white">
                    Verify Your JMI Account
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Enter the email address and password
                    associated with your JMI account.
                  </p>

                </div>

                {/* EMAIL */}

                <label className="mb-5 block">

                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.13em] text-violet-300">
                    Registered Email Address
                  </span>

                  <input
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your registered email"
                    className="w-full rounded-xl border border-white/[0.09] bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40"
                  />

                </label>

                {/* PASSWORD */}

                <label className="mb-5 block">

                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.13em] text-violet-300">
                    Account Password
                  </span>

                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your JMI password"
                    className="w-full rounded-xl border border-white/[0.09] bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40"
                  />

                </label>

                {/* INFORMATION */}

                <div className="mb-5 rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.035] p-4">

                  <p className="text-xs font-semibold text-yellow-400">
                    Important Information
                  </p>

                  <ul className="mt-2 space-y-2 text-[11px] leading-5 text-zinc-400">

                    <li>
                      • Your credentials will be verified through
                      Supabase Authentication.
                    </li>

                    <li>
                      • Your password will not be stored in the
                      deletion-request database.
                    </li>

                    <li>
                      • A JMI administrator will review your
                      request before deletion.
                    </li>

                    <li>
                      • Your profile, personal activity and
                      associated account records will be
                      permanently deleted when the request
                      is completed, subject to any disclosed
                      legal retention requirements.
                    </li>

                  </ul>

                </div>

                {/* ERROR */}

                {errorMessage && (

                  <div className="mb-5 rounded-xl border border-red-400/15 bg-red-500/[0.06] px-4 py-3 text-xs leading-5 text-red-300">
                    {errorMessage}
                  </div>

                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl border border-red-400/30 bg-red-500/[0.10] px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-red-300 transition hover:border-red-400/50 hover:bg-red-500/[0.16] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Verifying Account..."
                    : "Verify & Submit Deletion Request"}
                </button>

              </form>

            )}

          </section>

          {/* PROCESS INFORMATION */}

          <section className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">

            <h2 className="text-sm font-semibold text-white">
              What Happens Next?
            </h2>

            <div className="mt-4 space-y-4">

              {[
                ["01", "Identity verification", "Your account credentials are checked securely."],
                ["02", "Administrative review", "Your request is reviewed by the JMI administration team."],
                ["03", "Data deletion", "Your associated personal records and Supabase account are deleted."],
                ["04", "Completion", "The deletion request is marked as completed."],
              ].map(([number, title, description]) => (

                <div key={number} className="flex gap-3">

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/[0.07] text-[10px] font-semibold text-violet-300">
                    {number}
                  </span>

                  <div>
                    <p className="text-xs font-medium text-zinc-200">
                      {title}
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-zinc-500">
                      {description}
                    </p>
                  </div>

                </div>

              ))}

            </div>

          </section>

          {/* FOOTER */}

          <div className="mt-8 text-center">

            <p className="text-[10px] leading-5 text-zinc-600">
              Jeruto Movie Intelligence · Jeruto Group
            </p>

            <p className="mt-1 text-[9px] text-zinc-700">
              Account deletion support
            </p>

          </div>

        </div>

      </main>
    </>
  );
}