"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import PublicHeader from "../../components/PublicHeader";
import CompanySearch from "../../components/CompanySearch";
import CompanyLibrary from "../../components/CompanyLibrary";

type Company = {
  id: number;
  name: string;
  company_type: string;
  headquarters: string | null;
  founded_year: number | null;
  logo: string | null;
  is_active: boolean;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
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
      console.error("Public Companies error:", error);
      setCompanies([]);
    } else {
      setCompanies(data || []);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">

        {/* BACK TO HOME */}

        <Link
          href="/"
          className="
            inline-flex
            items-center
            gap-1.5
            text-[9px]
            
            tracking-[0.16em]
            text-violet-400
            transition
            hover:text-yellow-400
          "
        >
          ← Back to Home
        </Link>

        {/* HERO */}

        <section className="mt-7">
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-yellow-400">
            JMI Intelligence
          </p>

          <h1 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-green-400/70 sm:text-3xl">
            Company Intelligence
          </h1>

          <p className="mt-2 max-w-2xl text-[9px] leading-5 text-zinc-500 sm:text-[10px]">
            Explore the business side of Indian cinema through
            production companies, distributors, studios and other
            film-industry businesses tracked by JMI.
          </p>
        </section>

        {/* SEARCH */}

        <CompanySearch companies={companies} />

        {/* COMPANY LIBRARY */}

        {loading ? (
          <section className="mt-8">
            <div className="rounded-xl border border-zinc-500 bg-zinc-950 px-5 py-10 text-center">
              <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-700">
                Loading companies...
              </p>
            </div>
          </section>
        ) : (
          <CompanyLibrary companies={companies} />
        )}

        {/* INTELLIGENCE NOTE */}

        <section className="mt-10">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/[0.04] text-[10px] text-yellow-400">
                J
              </div>

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-red-500">
                  JMI Company Intelligence
                </p>

                <p className="mt-1.5 text-[8px] leading-4 text-zinc-500 sm:text-[9px]">
                  Company profiles connect film-industry businesses
                  with the production, distribution and theatrical
                  intelligence tracked across the JMI database.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}