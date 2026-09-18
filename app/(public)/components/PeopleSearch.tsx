"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Person = {
  id: number;
  full_name: string;
  profile_image_url: string | null;
  roles: string[];
  movieCount: number;
};

export default function PeopleSearch({
  people,
}: {
  people: Person[];
}) {
  const [search, setSearch] = useState("");

  const recommendations = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return [];
    }

    return people
      .filter((person) =>
        person.full_name.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [people, search]);

  return (
    <section className="mt-6">
      <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 sm:p-5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
            Find a Person
          </p>

          <h2 className="mt-1.5 text-sm font-medium text-zinc-200 sm:text-base">
            Search your favorite Person on JMI database.
          </h2>

          <p className="mt-1 text-[9px] leading-4 text-zinc-500 sm:text-[9px]">
            Search by actor, director, producer or other film
            professional.
          </p>
        </div>

        <div className="relative mt-5">
          <label
            htmlFor="person-search"
            className="sr-only"
          >
            Search person
          </label>

          <input
            id="person-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search person..."
            autoComplete="off"
            className="
              w-full
              rounded-lg
              border
              border-violet-500
              bg-black
              px-4
              py-3
              pr-10
              text-[10px]
              text-zinc-200
              outline-none
              placeholder:text-zinc-700
              transition
              focus:border-violet-400/40
              focus:ring-1
              focus:ring-violet-400/10
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

        {/* Search Recommendations */}
        {search.trim() && (
          <div className="mt-2 overflow-hidden rounded-lg border border-zinc-900 bg-black">
            {recommendations.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-700">
                  No people found
                </p>
              </div>
            ) : (
              <div>
                {recommendations.map((person) => (
                  <Link
                    key={person.id}
                    href={`/preview/people/${person.id}`}
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
                    {person.profile_image_url ? (
                      <img
                        src={person.profile_image_url}
                        alt={person.full_name}
                        className="
                          h-8
                          w-8
                          shrink-0
                          rounded-full
                          border
                          border-zinc-800
                          object-cover
                          transition
                          group-hover:border-violet-400/30
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-zinc-800
                          bg-zinc-950
                          text-[10px]
                          font-medium
                          text-violet-400
                        "
                      >
                        {person.full_name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-zinc-200 group-hover:text-white">
                        {person.full_name}
                      </p>

                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[7px] text-zinc-600">
                          {person.movieCount}{" "}
                          {person.movieCount === 1
                            ? "movie"
                            : "movies"}
                        </span>

                        {person.roles.length > 0 && (
                          <>
                            <span className="text-[7px] text-zinc-800">
                              •
                            </span>

                            <span className="truncate text-[7px] uppercase tracking-[0.04em] text-zinc-600">
                              {person.roles
                                .slice(0, 2)
                                .join(" · ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span
                      className="
                        shrink-0
                        text-[11px]
                        text-zinc-700
                        transition-all
                        group-hover:translate-x-0.5
                        group-hover:text-violet-300
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