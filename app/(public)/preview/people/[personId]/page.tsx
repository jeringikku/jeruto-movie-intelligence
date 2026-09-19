import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    personId: string;
  }>;
  searchParams: Promise<{
    movieId?: string;
  }>;
};

type Person = {
  id: number;
  full_name: string;
  original_name: string | null;
  profile_image_url: string | null;
};

type Role = {
  id: number;
  name: string;
};

export default async function PersonIntelligencePage({
  params,
  searchParams,
}: Props) {
  const { personId } = await params;
  const { movieId } = await searchParams;

  const numericPersonId = Number(personId);

  if (!Number.isFinite(numericPersonId)) {
    notFound();
  }

  /* ---------------------------------------------------------
     PERSON
  --------------------------------------------------------- */

  const {
    data: person,
    error: personError,
  } = await supabase
    .from("people")
    .select(`
      id,
      full_name,
      original_name,
      profile_image_url
    `)
    .eq("id", numericPersonId)
    .single();

  if (personError || !person) {
    notFound();
  }

  /* ---------------------------------------------------------
     PERSON'S ROLE IDs
  --------------------------------------------------------- */

  const {
    data: moviePeople,
    error: moviePeopleError,
  } = await supabase
    .from("movie_people")
    .select("role_id")
    .eq("person_id", numericPersonId);

  if (moviePeopleError) {
    console.error(
      "Person roles fetch error:",
      moviePeopleError
    );
  }

  const roleIds = Array.from(
    new Set(
      (moviePeople || [])
        .map((row: any) => row.role_id)
        .filter(
          (roleId: any) =>
            roleId !== null &&
            roleId !== undefined
        )
        .map(Number)
    )
  );

  /* ---------------------------------------------------------
     ROLE DETAILS
  --------------------------------------------------------- */

  let roles: Role[] = [];

  if (roleIds.length > 0) {
    const {
      data: roleData,
      error: roleError,
    } = await supabase
      .from("person_roles")
      .select(`
        id,
        name
      `)
      .in("id", roleIds);

    if (roleError) {
      console.error(
        "Role details fetch error:",
        roleError
      );
    }

    roles = (roleData || [])
      .map((role: any) => ({
        id: Number(role.id),
        name: role.name,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* -------------------------------------------------
            BACK
        ------------------------------------------------- */}

        <div className="mb-4">
  <Link
    href={
      movieId
        ? `/preview/movies/${movieId}/cast-crew`
        : "/preview/movies"
    }
    className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
  >
    <span>←</span>
    <span>
      {movieId
        ? "Back to Cast & Crew"
        : "Back to Movies"}
    </span>
  </Link>
</div>
        {/* -------------------------------------------------
            PERSON HEADER
        ------------------------------------------------- */}

        <section className="border-b border-zinc-900 pb-6">

          <div className="flex items-start gap-4">

            {/* PROFILE IMAGE */}

            {person.profile_image_url ? (

              <img
                src={person.profile_image_url}
                alt={person.full_name}
                className="h-[105px] w-[105px] shrink-0 rounded-xl border border-zinc-800 object-cover sm:h-[135px] sm:w-[135px]"
              />

            ) : (

              <div className="flex h-[105px] w-[105px] shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-3xl font-medium text-violet-400 sm:h-[135px] sm:w-[135px]">
                {person.full_name
                  .charAt(0)
                  .toUpperCase()}
              </div>

            )}

            <div className="min-w-0 pt-1">

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                JMI Person Intelligence
              </p>

              <h1 className="mt-1 text-base font-medium text-zinc-100 sm:text-lg">
                {person.full_name}
              </h1>

              {person.original_name &&
                person.original_name !==
                  person.full_name && (
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {person.original_name}
                  </p>
                )}

              <p className="mt-3 max-w-xl text-[9px] leading-5 text-zinc-500">
                Explore role-specific career performance,
                filmography and industry intelligence.
              </p>

            </div>

          </div>

        </section>

        {/* -------------------------------------------------
            CURRENT PROFILE
        --------------------------------------------------------- */}

        <section className="mt-5 rounded-lg border border-pink-900 bg-zinc-550 px-4 py-3">

          <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-400">
            Person Profile
          </p>

          <p className="mt-1 text-[9px] leading-5 text-zinc-500">
            JMI separates professional roles so that each
            career can be analysed independently.
          </p>

        </section>

        {/* -------------------------------------------------
            CHOOSE INTELLIGENCE
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="mb-4">

            <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
              Career Intelligence
            </p>

            <h2 className="mt-1 text-sm font-medium text-yellow-500">
              Choose The Role for Complete Analysis
            </h2>

            <p className="mt-1 text-[9px] text-zinc-500">
              Select a professional role to explore detailed
              career analysis for {person.full_name}.
            </p>

          </div>

          {roles.length === 0 ? (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">

              <p className="text-[10px] text-zinc-600">
                No role-specific credits are currently
                available for this person.
              </p>

            </div>

          ) : (

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {roles.map((role) => (

                <Link
                  key={role.id}
                  href={
                    movieId
                      ? `/preview/people/${person.id}/${role.id}?movieId=${movieId}`
                      : `/preview/people/${person.id}/${role.id}`
                  }
                  className="group rounded-xl border border-zinc-900 bg-zinc-950 p-4 transition hover:border-zinc-800 hover:bg-zinc-900/50"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-[7px] uppercase tracking-[0.16em] text-zinc-400">
                        Role Intelligence
                      </p>

                      <h3 className="mt-1 text-[12px] font-medium text-zinc-200 transition group-hover:text-violet-300">
                        {role.name}
                      </h3>

                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 text-[10px] text-zinc-600 transition group-hover:border-violet-900 group-hover:text-violet-300">
                      →
                    </div>

                  </div>

                  <p className="mt-4 border-t border-zinc-900 pt-3 text-[10px] leading-4 text-zinc-600">
                    Explore {role.name.toLowerCase()} career
                    performance and intelligence.
                  </p>

                </Link>

              ))}

            </div>

          )}

        </section>

        {/* -------------------------------------------------
            INTELLIGENCE PRINCIPLE
        ------------------------------------------------- */}

        <section className="mt-6 rounded-xl border border-violet-900/30 bg-violet-950/10 p-4">

          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            JMI Intelligence Model
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            A person's different professional roles are
            analysed independently. This allows JMI to
            distinguish acting, directing, writing, production
            and other career contributions rather than
            combining unrelated career data.
          </p>

        </section>

       {/* -------------------------------------------------
    NAVIGATION
------------------------------------------------- */}

<section className="mt-6 space-y-2">

  <Link
    href="/"
    className="block rounded-lg border border-violet-900/40 bg-violet-950/10 px-4 py-3 text-center text-[9px] text-violet-400 transition hover:border-violet-800 hover:bg-violet-950/20 hover:text-violet-300"
  >
    ← Back to JMI Home
  </Link>

  <Link
    href="/preview/people"
    className="block rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 text-center text-[9px] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
  >
    Explore People Intelligence
  </Link>

</section>

        {/* -------------------------------------------------
            FOOTER
        ------------------------------------------------- */}

        <footer className="mt-10 border-t border-zinc-900 pt-5 pb-8">

          <p className="text-center text-[8px] text-zinc-800">
            JMI · Jeruto Movie Intelligence
          </p>

          <p className="mt-1 text-center text-[7px] text-zinc-900">
            Indian Film Industry Data & Intelligence
          </p>

        </footer>

      </main>

    </div>
  );
}