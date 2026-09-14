"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Person = {
  id: number;
  full_name: string;
  profile_image_url: string | null;
  roles: string[];
  movieCount: number;
};

export default function PersonIntelligenceHome() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPeople();
  }, []);

  async function loadPeople() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("movie_people")
        .select(`
          person_id,
          movie_id,
          people (
            id,
            full_name,
            profile_image_url
          ),
          person_roles (
            id,
            name
          )
        `);

      if (error) {
        console.error("People Intelligence error:", error);
        return;
      }

      const personMap = new Map<
        number,
        {
          id: number;
          full_name: string;
          profile_image_url: string | null;
          roles: Set<string>;
          movies: Set<number>;
        }
      >();

      (data || []).forEach((row: any) => {
        const person = row.people;

        if (!person) return;

        if (!personMap.has(person.id)) {
          personMap.set(person.id, {
            id: Number(person.id),
            full_name: person.full_name,
            profile_image_url:
              person.profile_image_url || null,
            roles: new Set<string>(),
            movies: new Set<number>(),
          });
        }

        const existing = personMap.get(person.id)!;

        if (row.person_roles?.name) {
          existing.roles.add(row.person_roles.name);
        }

        if (row.movie_id !== null && row.movie_id !== undefined) {
          existing.movies.add(Number(row.movie_id));
        }
      });

      const result: Person[] = Array.from(
        personMap.values()
      )
        .map((person) => ({
          id: person.id,
          full_name: person.full_name,
          profile_image_url: person.profile_image_url,
          roles: Array.from(person.roles),
          movieCount: person.movies.size,
        }))
        .sort((a, b) =>
          a.full_name.localeCompare(b.full_name)
        );

      setPeople(result);
    } catch (error) {
      console.error(
        "Person Intelligence loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredPeople = people.filter((person) =>
    person.full_name
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-8 pb-12">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="rounded-xl bg-zinc-900 p-6">

        <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
          JMI
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Person Intelligence
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Explore detailed intelligence, career statistics,
          box-office performance and role-specific analysis.
        </p>

      </section>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <section className="rounded-xl bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold text-white">
          Search Person
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Search for an actor, director, producer or other
          film professional.
        </p>

        <div className="mt-5">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search person..."
            className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500"
          />

        </div>

      </section>


      {/* =====================================================
          PEOPLE
      ===================================================== */}

      <section>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-xl font-semibold text-white">
              Person Intelligence
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Select a person to explore their complete
              intelligence.
            </p>

          </div>

          <div className="text-sm text-zinc-500">
            {search
              ? `${filteredPeople.length} result${
                  filteredPeople.length === 1
                    ? ""
                    : "s"
                }`
              :`${people.length} people}`
            }</div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="rounded-xl bg-zinc-900 p-10 text-center">

            <p className="text-sm text-zinc-500">
              Loading people...
            </p>

          </div>

        ) : filteredPeople.length === 0 ? (

          <div className="rounded-xl bg-zinc-900 p-10 text-center">

            <p className="text-sm text-zinc-500">
              {search
                ? "No people found matching your search."
                : "No people with movie credits found."}
            </p>

          </div>

        ) : (

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {filteredPeople.map((person) => (

              <Link
                key={person.id}
                href={`/admin/person-intelligence/${person.id}`}
                className="group rounded-xl bg-zinc-900 p-5 transition hover:bg-zinc-800"
              >

                <div className="flex items-start gap-4">

                  {/* PROFILE IMAGE */}

                  {person.profile_image_url ? (

                    <img
                      src={person.profile_image_url}
                      alt={person.full_name}
                      className="h-16 w-16 shrink-0 rounded-full border border-zinc-800 object-cover"
                    />

                  ) : (

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black text-xl font-bold text-yellow-400">
                      {person.full_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                  )}


                  {/* PERSON DETAILS */}

                  <div className="min-w-0 flex-1">

                    <h3 className="truncate text-lg font-semibold text-white group-hover:text-yellow-400">
                      {person.full_name}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {person.movieCount}{" "}
                      {person.movieCount === 1
                        ? "movie"
                        : "movies"}
                    </p>

                  </div>

                </div>


                {/* ROLES */}

                {person.roles.length > 0 && (

                  <div className="mt-4 flex flex-wrap gap-2">

                    {person.roles.map((role) => (

                      <span
                        key={role}
                        className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-400"
                      >
                        {role}
                      </span>

                    ))}

                  </div>

                )}


                {/* ACTION */}

                <div className="mt-5 border-t border-zinc-800 pt-4">

                  <span className="text-sm font-medium text-zinc-400 group-hover:text-yellow-400">
                    View Person Intelligence →
                  </span>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}