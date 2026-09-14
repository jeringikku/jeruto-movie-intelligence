"use client";

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="mb-4 inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
    >
      ← Back
    </button>
  );
}