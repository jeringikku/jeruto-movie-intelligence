"use client";

import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

 const menuItems = [
  { href: "/admin/dashboard", label: "📊 Dashboard" },
  { href: "/admin/movies", label: "🎬 Movies" },
  { href: "/admin/people", label: "👥 People" },
  { href: "/admin/companies", label: "🏢 Companies" },
  { href: "/admin/countries", label: "🌐 Countries" },
  { href: "/admin/languages", label: "🈯 Languages" },
  { href: "/admin/genres", label: "🎥 Genres" },
  { href: "/admin/industries", label: "🍿 Industries" },
  { href: "/admin/movie-business", label: "💵 Movie Business" },
  { href: "/admin/box-office", label: "💰 Box Office" },
  { href: "#", label: "🌍 Geography" },
];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-50 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xl text-white shadow-lg md:hidden"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64
          transform
          bg-zinc-900
          border-r border-zinc-800
          p-5
          transition-transform duration-200
          md:static
          md:translate-x-0
          md:min-h-screen
          md:transform-none
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* Header */}
        <div className="flex items-start justify-between">

          <div>
            <h1 className="text-xl font-bold text-yellow-400">
              JMI
            </h1>

            <p className="mt-1 text-xs text-zinc-500">
              Admin Panel
            </p>
          </div>

          {/* Mobile Close */}
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-lg text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
          >
            ✕
          </button>

        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-1.5">

          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              {item.label}
            </a>
          ))}

        </nav>

      </aside>
    </>
  );
}