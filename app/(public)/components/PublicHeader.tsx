"use client";

import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-charcoal-black/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* BRAND */}
        <Link href="/preview" className="flex items-center">
          <div>
            <div className="text-lg font-bold tracking-tight text-yellow-400">
              Jeruto Movie Intelligence
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              JMI
            </div>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-6 md:flex">

          <Link
            href="/preview"
            className="text-sm text-zinc-300 transition hover:text-yellow-400"
          >
            Home
          </Link>

          <Link
            href="/preview/movies"
            className="text-sm text-zinc-300 transition hover:text-yellow-400"
          >
            Movies
          </Link>

          <Link
            href="/preview/box-office"
            className="text-sm text-zinc-300 transition hover:text-yellow-400"
          >
            Box Office
          </Link>

          <Link
            href="/preview/people"
            className="text-sm text-zinc-300 transition hover:text-yellow-400"
          >
            People
          </Link>

          <Link
            href="/preview/companies"
            className="text-sm text-zinc-300 transition hover:text-yellow-400"
          >
            Companies
          </Link>

          <Link
            href="/preview/industries"
            className="text-sm text-zinc-300 transition hover:text-yellow-400"
          >
            Industries
          </Link>

        </nav>

        {/* SEARCH PLACEHOLDER */}
        <div className="hidden lg:block">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-500">
            Search JMI
          </div>
        </div>

      </div>
    </header>
  );
}