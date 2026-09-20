"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  /* =========================================================
     LOCK BODY SCROLL WHEN MOBILE MENU IS OPEN
  ========================================================= */

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* =========================================================
     CLOSE MENU WITH ESCAPE KEY
  ========================================================= */

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  /* =========================================================
     MOBILE NAVIGATION
  ========================================================= */

  const primaryNavigation = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Movies",
      href: "/preview/movies",
    },
    {
      label: "People",
      href: "/preview/people",
    },
    {
      label: "Companies",
      href: "/preview/companies",
    },
    {
      label: "Industries",
      href: "/preview/industries",
    },
    {
      label: "Markets",
      href: "/preview/market-intelligence",
    },
    {
      label: "Book Tickets With JMI",
      href: "/preview/book-tickets",
    },
  ];

  const intelligenceNavigation = [
    {
      label: "Audience Behavior",
      href: "/preview/audience-behavior",
    },
    {
      label: "JMI Comparison Tool",
      href: "/preview/compare",
    },
    {
      label: "Records",
      href: "/preview/movies#historical-records",
    },
  ];

  /* =========================================================
     LEGAL NAVIGATION
  ========================================================= */

  const legalNavigation = [
    {
      label: "Privacy Policy",
      href: "/preview/privacy",
    },
    {
      label: "Terms & Conditions",
      href: "/preview/terms",
    },
    {
      label: "Copyright",
      href: "/preview/copyright",
    },
    {
      label: "Contact Us",
      href: "/preview/contact",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#050507]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:border-violet-400/30 hover:text-violet-300 md:hidden"
          >
            {menuOpen ? (
              /* CLOSE ICON */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            ) : (
              /* MENU ICON */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              </svg>
            )}
          </button>

          {/* BRAND */}
          <Link
            href="/preview"
            className="flex items-center"
            onClick={() => setMenuOpen(false)}
          >
            <div>
              <p className="font-serif text-lg font-medium text-zinc-300">
                Jeruto{" "}
                <span className="text-yellow-400">
                  Movie Intelligence 🍿
                </span>
              </p>

              <div className="text-[10px] text-right uppercase tracking-[0.2em] text-zinc-400">
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

          {/* DESKTOP SEARCH PLACEHOLDER */}
          <div className="hidden lg:block">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-500">
              Search JMI
            </div>
          </div>

        </div>
      </header>

      {/* =======================================================
          MOBILE NAVIGATION DRAWER
      ======================================================= */}

      {menuOpen && (
        <>
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] md:hidden"
          />

          {/* DRAWER */}
          <aside className="fixed left-0 top-0 z-50 flex h-dvh w-[64%] max-w-sm flex-col border-r border-zinc-800 bg-zinc-950 shadow-2xl md:hidden">

            {/* DRAWER HEADER */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 px-5">

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  JMI Navigation
                </p>

                <p className="mt-1 text-sm font-medium text-zinc-200">
                  Jeruto Movie Intelligence
                </p>
              </div>

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-black text-zinc-500 transition hover:border-violet-400/30 hover:text-violet-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>

            </div>

            {/* DRAWER CONTENT */}
            <div className="flex-1 overflow-y-auto px-4 py-5">

              {/* PRIMARY NAVIGATION */}
              <div>
                <p className="px-2 text-[7px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                  Explore
                </p>

                <nav className="mt-2 space-y-1">
                  {primaryNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-3 text-[11px] font-medium text-zinc-400 transition hover:border-zinc-800 hover:bg-black hover:text-violet-300"
                    >
                      <span>{item.label}</span>

                      <span className="text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-violet-400">
                        →
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* DIVIDER */}
              <div className="my-5 border-t border-zinc-900" />

              {/* INTELLIGENCE NAVIGATION */}
              <div>
                <p className="px-2 text-[7px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                  JMI Intelligence
                </p>

                <nav className="mt-2 space-y-1">
                  {intelligenceNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-3 text-[11px] font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.03] hover:text-violet-300"
                    >
                      <span>{item.label}</span>

                      <span className="text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-violet-400">
                        →
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* DIVIDER */}
              <div className="my-5 border-t border-zinc-900" />

              {/* LEGAL NAVIGATION */}
              <div>
                <p className="px-2 text-[7px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                  Legal
                </p>

                <nav className="mt-2 space-y-1">
                  {legalNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-3 text-[11px] font-medium text-zinc-400 transition hover:border-zinc-800 hover:bg-black hover:text-violet-300"
                    >
                      <span>{item.label}</span>

                      <span className="text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-violet-400">
                        →
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

            </div>

            {/* DRAWER FOOTER */}
            <div className="shrink-0 border-t border-zinc-900 px-5 py-4">

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400/70" />

                <span className="text-[7px] uppercase tracking-[0.16em] text-zinc-600">
                  JMI Intelligence Platform
                </span>
              </div>

            </div>

          </aside>
        </>
      )}
    </>
  );
}