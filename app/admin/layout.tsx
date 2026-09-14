"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Login page must always remain accessible
    if (pathname === "/admin/login") {
      setCheckingAuth(false);
      return;
    }

    checkAuthentication();

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.replace("/admin/login");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  async function checkAuthentication() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    setCheckingAuth(false);
  }

  // --------------------------------------------------
  // LOGIN PAGE
  // --------------------------------------------------

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // --------------------------------------------------
  // AUTH CHECK
  // --------------------------------------------------

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">

          <h1 className="text-2xl font-bold text-yellow-400">
            JMI Admin
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Checking authentication...
          </p>

        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // AUTHENTICATED ADMIN PANEL
  // --------------------------------------------------

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Header />

        <section className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </section>

      </div>

    </main>
  );
}