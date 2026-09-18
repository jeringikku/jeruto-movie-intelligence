"use client";

import { useMemo, useState } from "react";
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

export default function CompanySearch({
  companies,
}: {
  companies: Company[];
}) {
  const [search, setSearch] = useState("");

  const recommendations = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return [];
    }

    return companies
      .filter((company) =>
        company.name.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [companies, search]);

  return (
    <section className="mt-6">
      <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 sm:p-5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-yellow-400">
            Find a Company
          </p>

          <h2 className="mt-1.5 text-sm font-medium text-zinc-200 sm:text-base">
            Search the JMI company database.
          </h2>

          <p className="mt-1 text-[8px] leading-4 text-zinc-600 sm:text-[9px]">
            Search production companies, distributors, studios
            and other film-industry businesses.
          </p>
        </div>

        <div className="relative mt-5">
          <label
            htmlFor="company-search"
            className="sr-only"
          >
            Search company
          </label>

          <input
            id="company-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            autoComplete="off"
            className="
              w-full
              rounded-lg
              border
              border-zinc-800
              bg-black
              px-4
              py-3
              pr-10
              text-[10px]
              text-zinc-200
              outline-none
              placeholder:text-zinc-700
              transition
              focus:border-yellow-400/40
              focus:ring-1
              focus:ring-yellow-400/10
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[12px]
                text-zinc-700
                transition
                hover:text-zinc-300
              "
            >
              ×
            </button>
          )}
        </div>

        {/* SEARCH RECOMMENDATIONS */}

        {search.trim() && (
          <div className="mt-2 overflow-hidden rounded-lg border border-zinc-900 bg-black">
            {recommendations.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-700">
                  No companies found
                </p>
              </div>
            ) : (
              <div>
                {recommendations.map((company) => (
                  <Link
                    key={company.id}
                    href={`/preview/companies/${company.id}`}
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      border-b
                      border-zinc-900
                      px-3
                      py-2.5
                      last:border-b-0
                      transition-colors
                      hover:bg-zinc-900/70
                    "
                  >
                    {/* COMPANY LOGO */}

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-lg
                        border
                        border-zinc-800
                        bg-zinc-950
                        transition
                        group-hover:border-yellow-400/30
                      "
                    >
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-yellow-400">
                          {company.name
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* COMPANY DETAILS */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-zinc-200 transition-colors group-hover:text-white">
                        {company.name}
                      </p>

                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="truncate text-[7px] uppercase tracking-[0.04em] text-zinc-600">
                          {company.company_type || "Company"}
                        </span>

                        {company.headquarters && (
                          <>
                            <span className="text-[7px] text-zinc-800">
                              •
                            </span>

                            <span className="truncate text-[7px] text-zinc-600">
                              {company.headquarters}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ARROW */}

                    <span
                      className="
                        shrink-0
                        text-[11px]
                        text-zinc-700
                        transition-all
                        group-hover:translate-x-0.5
                        group-hover:text-yellow-300
                      "
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}