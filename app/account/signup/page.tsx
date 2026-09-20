"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/app/(public)/components/PublicHeader";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
        },
      },
    });

    if (error) {
      console.error("Signup error:", error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage(
      "Account created successfully. Please check your email to verify your account."
    );

    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* COMMON JMI PUBLIC HEADER */}
      <PublicHeader />

      {/* SIGNUP CONTENT */}
      <section className="px-4 py-10 sm:py-14">

        <div className="mx-auto max-w-md text-center">

          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-violet-400">
            Jeruto Movie Intelligence
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-[28px]">
            Create your account
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-500">
            Join JMI and explore deeper movie data, intelligence and insights.
          </p>

        </div>

        {/* SIGNUP CARD */}

        <div className="mx-auto mt-7 w-full max-w-[390px] rounded-xl border border-zinc-800/90 bg-zinc-950/95 p-5 shadow-2xl sm:mt-8 sm:p-6">

          {errorMessage && (
            <div className="mb-5 rounded-md border border-red-900/50 bg-red-950/20 px-3 py-2.5 text-xs leading-5 text-red-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-md border border-emerald-900/50 bg-emerald-950/20 px-3 py-2.5 text-xs leading-5 text-emerald-300">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                autoComplete="email"
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
              />

              <p className="mt-1.5 text-[10px] text-zinc-600">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-10 w-full rounded-md bg-yellow-500 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <div className="mt-5 border-t border-zinc-800 pt-5 text-center">
            <p className="text-xs text-zinc-600">
              Already have a JMI account?
            </p>

            <Link
              href="/account/login"
              className="mt-1.5 inline-block text-xs font-medium text-violet-400 transition hover:text-violet-300"
            >
              Sign in
            </Link>
          </div>

        </div>

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