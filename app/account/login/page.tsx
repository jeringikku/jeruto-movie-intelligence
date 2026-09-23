"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import PublicHeader from "@/app/(public)/components/PublicHeader";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setErrorMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage(
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    const { error } =
      await supabaseBrowser.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

    if (error) {
      console.error("Login error:", error);

      if (
        error.message
          .toLowerCase()
          .includes("email not confirmed")
      ) {
        setErrorMessage(
          "Please verify your email address before signing in."
        );
      } else {
        setErrorMessage(error.message);
      }

      setLoading(false);
      return;
    }

    window.location.href = "/account";
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
            Welcome back
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-500">
            Sign in to access your JMI account and personalized
            intelligence features.
          </p>

        </div>

        <div className="mx-auto mt-7 w-full max-w-[390px] rounded-xl border border-zinc-800/90 bg-zinc-950/95 p-5 shadow-2xl sm:mt-8 sm:p-6">

          {errorMessage && (
            <div className="mb-5 rounded-md border border-red-900/50 bg-red-950/20 px-3 py-2.5 text-xs leading-5 text-red-300">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >

            {/* EMAIL */}

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
                placeholder="Your email address"
                autoComplete="email"
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <div className="mb-1.5 flex items-center justify-between">

                <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                  Password
                </label>

                <Link
                  href="/account/forgot-password"
                  className="text-[10px] font-medium text-violet-400 transition hover:text-violet-300"
                >
                  Forgot password?
                </Link>

              </div>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Your password"
                autoComplete="current-password"
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
              />

            </div>

            {/* SIGN IN */}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-10 w-full rounded-md bg-yellow-500 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          {/* CREATE ACCOUNT */}

          <div className="mt-5 border-t border-zinc-800 pt-5 text-center">

            <p className="text-xs text-zinc-600">
              Don't have a JMI account?
            </p>

            <Link
              href="/account/signup"
              className="mt-1.5 inline-block text-xs font-medium text-violet-400 transition hover:text-violet-300"
            >
              Create an account
            </Link>

          </div>

        </div>

        {/* FOOTER */}

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
                JMI · People Intelligence
              </p>

            </div>

          </div>

        </footer>

      </section>

    </main>
  );
}