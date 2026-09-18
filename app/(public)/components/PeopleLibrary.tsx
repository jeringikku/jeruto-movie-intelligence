"use client";

import Link from "next/link";

type Person = {
  id: number;
  full_name: string;
  profile_image_url: string | null;
  roles: string[];
  movieCount: number;
};

export default function PeopleLibrary({
  people,
}: {
  people: Person[];
}) {
  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
          People Database
        </p>

        <div className="mt-1.5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium tracking-[-0.025em] text-green-500 sm:text-xl">
              Explore film professionals.
            </h2>

            <p className="mt-1 text-[9px] leading-4 text-zinc-500">
              Explore people across the Indian film industry.
            </p>
          </div>

          <span className="hidden shrink-0 text-[8px] uppercase tracking-[0.14em] text-zinc-700 sm:block">
            {people.length} profiles
          </span>
        </div>
      </div>

      {people.length === 0 ? (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-5 py-10 text-center">
          <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-700">
            No people available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/preview/people/${person.id}`}
              className="
                group
                relative
                overflow-hidden
                rounded-lg
                border
                border-zinc-600
                bg-zinc-950
                px-3
                py-2.5
                transition-all
                duration-200
                hover:border-violet-400/25
                hover:bg-zinc-900/70
                active:scale-[0.995]
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -top-10
                  h-20
                  w-20
                  rounded-full
                  bg-violet-500/[0.025]
                  blur-2xl
                  transition-opacity
                  duration-300
                  group-hover:bg-violet-500/[0.06]
                "
              />

              <div className="relative flex items-center gap-2.5">
                {/* Profile */}
                {person.profile_image_url ? (
                  <img
                    src={person.profile_image_url}
                    alt={person.full_name}
                    className="
                      h-9
                      w-9
                      shrink-0
                      rounded-full
                      border
                      border-zinc-800
                      object-cover
                      transition
                      duration-300
                      group-hover:border-violet-400/30
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-zinc-800
                      bg-black
                      text-[11px]
                      font-medium
                      text-violet-400
                      transition
                      duration-300
                      group-hover:border-violet-400/30
                    "
                  >
                    {person.full_name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {/* Details */}
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
                    {person.full_name}
                  </h3>

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
                          {person.roles.length > 2 && " · +"}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow */}
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
                    border-violet-500/70
                    text-[10px]
                    text-violet-500/70
                    transition-all
                    duration-200
                    group-hover:translate-x-0.5
                    group-hover:border-violet-400/30
                    group-hover:bg-violet-400/[0.05]
                    group-hover:text-violet-300
                  "
                >
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}