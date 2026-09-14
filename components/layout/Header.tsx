"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/admin/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5">

      {/* LEFT SIDE */}

      <div>
        <h1 className="text-xl font-bold text-yellow-400 sm:text-2xl md:text-3xl">
          Jeruto Movie Intelligence
        </h1>

        <p className="mt-0.5 text-xs text-zinc-400 sm:mt-1 sm:text-sm">
          Admin Dashboard
        </p>
      </div>

      {/* RIGHT SIDE */}

      <button
        onClick={handleLogout}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 sm:px-4 sm:text-sm"
      >
        Logout
      </button>

    </header>
  );
}