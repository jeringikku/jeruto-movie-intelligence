import Link from "next/link";
import PublicHeader from "@/app/(public)/components/PublicHeader";

export default function CompanyIntelligencePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300">

      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        <div className="mb-6">
          <Link
            href="/preview/companies"
            className="inline-flex items-center gap-2 text-[9px] text-zinc-600 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Companies</span>
          </Link>
        </div>

        <section className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6">

          <div className="text-[9px] font-medium tracking-[0.28em] text-violet-400">
            COMPANY INTELLIGENCE
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100">
            Company Intelligence
          </h1>

          <p className="mt-3 text-[10px] leading-5 text-zinc-600">
            Detailed company intelligence will be available here.
          </p>

        </section>

      </main>

    </div>
  );}