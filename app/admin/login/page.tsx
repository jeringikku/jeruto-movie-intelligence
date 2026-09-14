"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
  console.error("Login error:", error);

  setErrorMessage(error.message);

  setLoading(false);
  return;
}

    // Successful login
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black px-4 py-8">

      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8">

        {/* LOGO / TITLE */}

        <div className="text-center">

          <h1 className="text-3xl font-bold text-yellow-400">
            JMI Admin
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Jeruto Movie Intelligence
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Admin Control Panel
          </p>

        </div>

        {/* ERROR */}

        {errorMessage && (
          <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {/* LOGIN FORM */}

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          {/* EMAIL */}

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
            />

          </div>

          {/* PASSWORD */}

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
            />

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-500 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        {/* FOOTER */}

        <p className="mt-6 text-center text-xs text-zinc-600">
          Jeruto Movie Intelligence • Admin Panel
        </p>

      </div>

    </main>
  );
}