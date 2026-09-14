"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";
import Link from "next/link";

type Company = {
  id: number;
  name: string;
  company_type: string;
  headquarters: string | null;
  founded_year: number | null;
  logo: string | null;
  is_active: boolean;
};

export default function CompanyIntelligenceHomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    setLoading(true);

    const { data, error } = await supabase
      .from("companies")
      .select(
        "id, name, company_type, headquarters, founded_year, logo, is_active"
      )
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Company Intelligence companies error:", error);
      setCompanies([]);
    } else {
      setCompanies(data || []);
    }

    setLoading(false);
  }

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-xs uppercase tracking-wider text-yellow-400">
                JMI Intelligence
              </p>

              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                Company Intelligence
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Explore advanced business intelligence for production
                companies, distributors and other film-industry
                businesses tracked by JMI.
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-black px-5 py-4">

              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Active Companies
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-400">
                {companies.length}
              </p>

            </div>

          </div>

          {/* =====================================================
              SEARCH
          ===================================================== */}

          <div className="relative mt-8 max-w-xl">

            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />

            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-black py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:outline-none"
            />

          </div>

        </section>

        {/* =====================================================
            COMPANY LIST
        ===================================================== */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-xs uppercase tracking-wider text-yellow-400">
              Intelligence Directory
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Select a Company
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Open a company profile to view its complete JMI
              intelligence analysis.
            </p>

          </div>

          {loading ? (

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
              <p className="text-sm text-zinc-500">
                Loading companies...
              </p>
            </div>

          ) : filteredCompanies.length === 0 ? (

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

              <p className="text-sm text-zinc-500">
                {search
                  ? "No companies found matching your search."
                  : "No active companies found."}
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

              {filteredCompanies.map((company) => (

<Link
  key={company.id}
  href={`/admin/company-intelligence/${company.id}`}
  className="group block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-left transition hover:border-yellow-500/50 hover:bg-zinc-900"
>

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-4">

                      {/* COMPANY LOGO */}

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black">

                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-lg font-bold text-yellow-400">
                            {company.name
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}

                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate font-semibold text-white group-hover:text-yellow-400">
                          {company.name}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          {company.company_type || "Company"}
                        </p>

                      </div>

                    </div>

                    <span className="text-lg text-zinc-600 transition group-hover:text-yellow-400">
                      →
                    </span>

                  </div>

                  {/* COMPANY DETAILS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-lg border border-zinc-800 bg-black p-3">

                      <p className="text-[11px] uppercase tracking-wide text-zinc-600">
                        Founded
                      </p>

                      <p className="mt-1 text-sm font-medium text-zinc-300">
                        {company.founded_year || "—"}
                      </p>

                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-black p-3">

                      <p className="text-[11px] uppercase tracking-wide text-zinc-600">
                        Headquarters
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-zinc-300">
                        {company.headquarters || "—"}
                      </p>

                    </div>

                  </div>

                  {/* INTELLIGENCE CTA */}

                  <div className="mt-4 border-t border-zinc-800 pt-4">

                    <span className="text-xs font-medium text-yellow-400">
                      Open Company Intelligence →
                    </span>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}