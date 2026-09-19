import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

import PeopleSearch from "../../components/PeopleSearch";
import PeopleIntelligenceBanner from "../../components/PeopleIntelligenceBanner";
import PeopleLibrary from "../../components/PeopleLibrary";

type Person = {
  id: number;
  full_name: string;
  profile_image_url: string | null;
  roles: string[];
  movieCount: number;
};

export default async function PeoplePage() {
  /*
   * =====================================================
   * DATA
   * =====================================================
   */

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
    console.error("Public People Intelligence error:", error);
  }

  /*
   * =====================================================
   * BUILD PEOPLE MAP
   * =====================================================
   */

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

    if (
      row.movie_id !== null &&
      row.movie_id !== undefined
    ) {
      existing.movies.add(Number(row.movie_id));
    }
  });

  /*
   * =====================================================
   * FINAL PEOPLE LIST
   * =====================================================
   */

  const people: Person[] = Array.from(
    personMap.values()
  )
    .map((person) => ({
      id: person.id,
      full_name: person.full_name,
      profile_image_url:
        person.profile_image_url,
      roles: Array.from(person.roles),
      movieCount: person.movies.size,
    }))
    .sort((a, b) =>
      a.full_name.localeCompare(b.full_name)
    );

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <main className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">

        {/* =================================================
            BACK
        ================================================= */}

        <div className="mb-7">
          <Link
            href="/"
            className="text-[9px] font-medium tracking-[0.18em] text-violet-500 transition hover:text-violet-400"
          >
            ← Back to Home
          </Link>
        </div>


        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950">

          {/* Ambient glow */}

          <div className="pointer-events-none absolute inset-0">

            <div className="absolute left-1/2 top-[-180px] h-[300px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/[0.045] blur-3xl" />

          </div>


          <div className="relative px-5 py-10 sm:px-8 sm:py-14">

            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-pink-400">
              JMI People Intelligence
            </p>

  

            <h1 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white sm:text-3xl">
              People
            </h1>

        

            <p className="mt-3 max-w-2xl text-[10px] leading-5 text-zinc-500 sm:text-[11px]">
              Explore career statistics, box-office performance,
              role-based analysis and film intelligence across
              India's film industry.
            </p>

            <PeopleIntelligenceBanner />

             {/* PEOPLE INTELLIGENCE BANNER */}

    

          </div>

        </section>


        {/* =================================================
            SEARCH
        ================================================= */}

       <PeopleSearch people={people} />

        {/* =================================================
            PEOPLE DIRECTORY
        ================================================= */}

       <PeopleLibrary people={people} />

        {/* =================================================
            INTELLIGENCE NOTE
        ================================================= */}

        <section className="mt-10 border-t border-zinc-900 pt-8">

          <div className="rounded-xl border border-violet-400/10 bg-zinc-950 px-4 py-4 sm:px-5">

            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-violet-400">
              JMI People Intelligence
            </p>

            <p className="mt-2 text-[8px] leading-4 text-zinc-600">
              Select a person to move from the people directory
              into role-specific JMI analysis, including career
              performance, theatrical outcomes and other
              structured intelligence available in the database.
            </p>

          </div>

        </section>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="border-t border-zinc-900">

        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">

          <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div>

              <p className="font-serif text-sm font-medium text-zinc-300">
                Jeruto{" "}
                <span className="text-yellow-400">
                  Movie Intelligence
                </span>
              </p>

              <p className="mt-1 text-[9px] text-zinc-500">
                India's Next Generation Movie Intelligence Platform
              </p>

            </div>

            <p className="text-[9px] text-zinc-500">
              JMI · People Intelligence
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}