"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const [recoveryReady, setRecoveryReady] =
    useState(false);

  /* =========================================================
     CHECK PASSWORD RECOVERY SESSION
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!mounted) return;

      if (session) {
        setRecoveryReady(true);
      } else {
        setErrorMessage(
          "This password reset link is invalid or has expired. Please request a new reset link."
        );
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } =
      supabaseBrowser.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;

          if (
            event === "PASSWORD_RECOVERY" &&
            session
          ) {
            setRecoveryReady(true);
            setErrorMessage("");
            setCheckingSession(false);
          }
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     UPDATE PASSWORD
  ========================================================= */

  async function handlePasswordUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage(
        "Please enter and confirm your new password."
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        "Your password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "The passwords do not match."
      );
      return;
    }

    setLoading(true);

    const { error } =
      await supabaseBrowser.auth.updateUser({
        password,
      });

    if (error) {
      console.error(
        "Password update error:",
        error
      );

      setErrorMessage(
        "Unable to update your password. Please request a new reset link and try again."
      );

      setLoading(false);
      return;
    }

    setMessage(
      "Your password has been updated successfully. Redirecting to Sign In..."
    );

    await supabaseBrowser.auth.signOut();

    setTimeout(() => {
      router.replace(
        "/account/login"
      );
    }, 1500);
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
            Reset Password
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-500">
            Create a new password for your JMI account.
          </p>

        </div>

        <div className="mx-auto mt-7 w-full max-w-[390px] rounded-xl border border-zinc-800/90 bg-zinc-950/95 p-5 shadow-2xl sm:mt-8 sm:p-6">

          {checkingSession ? (
            <div className="py-8 text-center">

              <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />

              <p className="text-xs text-zinc-500">
                Verifying your reset link...
              </p>

            </div>
          ) : !recoveryReady ? (
            <div className="text-center">

              {errorMessage && (
                <div className="rounded-md border border-red-900/50 bg-red-950/20 px-3 py-3 text-xs leading-5 text-red-300">
                  {errorMessage}
                </div>
              )}

              <Link
                href="/account/forgot-password"
                className="mt-5 inline-block text-xs font-medium text-violet-400 transition hover:text-violet-300"
              >
                Request a new reset link
              </Link>

            </div>
          ) : (
            <>

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
                onSubmit={handlePasswordUpdate}
                className="space-y-4"
              >

                <div>

                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                  />

                </div>

                <div>

                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                  />

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-md bg-yellow-500 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Updating..."
                    : "Update Password"}
                </button>

              </form>

            </>
          )}

        </div>

      </section>

    </main>
  );
}