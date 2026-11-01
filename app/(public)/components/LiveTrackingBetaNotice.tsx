"use client";

import { useState } from "react";

export default function LiveTrackingBetaNotice() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="jmi-beta-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-violet-500/30 bg-zinc-950 p-6 text-center shadow-2xl shadow-violet-950/30 sm:p-8"
      >
        {/* TOP ACCENT */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        {/* BETA LABEL */}
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
          <span className="font-serif text-xl font-bold text-yellow-400">
            JMI
          </span>
        </div>

        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-violet-400">
          Jeruto Movie Intelligence
        </p>

        <h2
          id="jmi-beta-title"
          className="mt-3 font-serif text-xl font-semibold leading-relaxed text-zinc-100 sm:text-2xl"
        >
          Welcome to JMI Live Tracking
          <span className="block text-yellow-400">
            Beta Version
          </span>
        </h2>

        <div className="mx-auto my-5 h-px w-16 bg-violet-500/50" />

        <p className="text-sm leading-7 text-zinc-300">
          This page will be publicly available from
        </p>

        <p className="mt-2 text-lg font-semibold text-green-400">
          November 5, 2026 Onwards
        </p>

        <p className="mt-4 text-xs leading-6 text-zinc-400">
          We're putting the finishing touches on our
          Live Tracking Intelligence experience.
          Thank you for being part of JMI's beta launch!
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="mt-7 w-full rounded-lg border border-violet-500/40 bg-violet-600/15 px-5 py-3 text-[8px] font-semibold uppercase tracking-[0.15em] text-violet-200 transition hover:border-violet-400 hover:bg-violet-600/25"
        >
          Continue to JMI
        </button>

        <p className="mt-4 text-[8px] tracking-[0.15em] text-pink-400">
          JMI · INDIAN FILM INDUSTRY DATA & INTELLIGENCE
        </p>
      </section>
    </div>
  );
}