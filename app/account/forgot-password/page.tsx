"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleResetRequest(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage(
        "Please enter your email address."
      );
      return;
    }

    setLoading(true);

    const redirectTo =
      `${window.location.origin}/account/reset-password`;

    const { error } =
      await supabaseBrowser.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo,
        }
      );

    if (error) {
      console.error(
        "Password reset request error:",
        error
      );

      setErrorMessage(
        "Unable to send the password reset email. Please try again."
      );

      setLoading(false);
      return;
    }

    /*
     * Do not reveal whether the email exists.
     * Supabase intentionally supports this behavior
     * to reduce account enumeration.
     */

    setMessage(
      "If an account exists for that email address, a password reset link has been sent. Please check your inbox."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white">

      <PublicHeader />

      <section className="px-4 py-10 sm:py-14">

        <div className="mx-auto max-w-md text-center">

          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-violet-400">
            Jeruto Movie Intelligence
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-[28px]">
            Forgot Password
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-500">
            Enter the email address associated with your JMI
            account and we'll send you a password reset link.
          </p>

        </div>

        <div className="mx-auto mt-7 w-full max-w-[390px] rounded-xl border border-zinc-800/90 bg-zinc-950/95 p-5 shadow-2xl sm:mt-8 sm:p-6">

          {message && (
            <div className="mb-5 rounded-md border border-emerald-900/50 bg-emerald-950/20 px-3 py-2.5 text-xs leading-5 text-emerald-300">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 rounded-md border border-red-900/50 bg-red-950/20 px-3 py-2.5 text-xs leading-5 text-red-300">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleResetRequest}
            className="space-y-4"
          >

            <div>

              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Your JMI account email"
                autoComplete="email"
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-md bg-yellow-500 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

          </form>

          <div className="mt-5 border-t border-zinc-800 pt-5 text-center">

            <Link
              href="/account/login"
              className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
            >
              ← Back to Sign In
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}