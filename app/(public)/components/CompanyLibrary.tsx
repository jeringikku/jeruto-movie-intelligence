"use client";

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

export default function CompanyLibrary({
  companies,
}: {
  companies: Company[];
}) {
  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-yellow-400">
          Company Database
        </p>

        <div className="mt-1.5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium tracking-[-0.025em] text-zinc-100 sm:text-xl">
              Explore film-industry companies.
            </h2>

            <p className="mt-1 text-[9px] leading-4 text-zinc-600">
              Explore production, distribution and other businesses
              tracked by JMI.
            </p>
          </div>

          <span className="hidden shrink-0 text-[8px] uppercase tracking-[0.14em] text-zinc-700 sm:block">
            {companies.length} companies
          </span>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-5 py-10 text-center">
          <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-700">
            No companies available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/preview/companies/${company.id}`}
              className="
                group
                relative
                overflow-hidden
                rounded-lg
                border
                border-violet-500/40
                bg-zinc-950
                px-3
                py-2.5
                transition-all
                duration-200
                hover:border-yellow-400/25
                hover:bg-zinc-900/70
                active:scale-[0.995]
              "
            >
              {/* Ambient glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -top-10
                  h-20
                  w-20
                  rounded-full
                  bg-yellow-500/[0.02]
                  blur-2xl
                  transition-opacity
                  duration-300
                  group-hover:bg-yellow-500/[0.05]
                "
              />

              <div className="relative flex items-center gap-2.5">

                {/* COMPANY LOGO */}

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-lg
                    border
                    border-zinc-800
                    bg-black
                    transition
                    duration-300
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
                    <span className="text-[11px] font-semibold text-yellow-400">
                      {company.name
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                {/* COMPANY DETAILS */}

                <div className="min-w-0 flex-1">
                  <h3
                    className="
                      truncate
                      text-[10px]
                      font-medium
                      text-zinc-200
                      transition-colors
                      duration-200
                      group-hover:text-white
                      sm:text-[11px]
                    "
                  >
                    {company.name}
                  </h3>

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

                <div
                  className="
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-violet-500/80
                    text-[10px]
                    text-violet-500/80
                    transition-all
                    duration-200
                    group-hover:translate-x-0.5
                    group-hover:border-yellow-400/30
                    group-hover:bg-yellow-400/[0.05]
                    group-hover:text-yellow-300
                  "
                >
                  →
                </div>
              </div>

              {/* FOOTER META */}

              {(company.founded_year || company.headquarters) && (
                <div className="relative mt-2 border-t border-zinc-900 pt-1.5">
                  <span className="text-[7px] uppercase tracking-[0.08em] text-zinc-500">
                    {company.founded_year
                      ? `Founded ${company.founded_year}`
                      : company.headquarters}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}