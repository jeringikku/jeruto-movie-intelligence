import Link from "next/link";
import { notFound } from "next/navigation";

import PublicHeader from "@/app/(public)/components/PublicHeader";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    movieId: string;
  }>;
};

type MoviePerson = {
  id: number;
  person_id: number;
  role_id: number;
  credit_type_id: number | null;
  billing_order: number | null;
  character_name: string | null;

  people:
  | {
      full_name: string;
      profile_image_url: string | null;
    }
  | {
      full_name: string;
      profile_image_url: string | null;
    }[]
  | null;

  person_roles:
    | {
        name: string;
        department: string | null;
      }
    | {
        name: string;
        department: string | null;
      }[]
    | null;

  credit_types:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

function getPerson(
  person: MoviePerson["people"]
) {
  return Array.isArray(person)
    ? person[0]
    : person;
}

function getRole(
  role: MoviePerson["person_roles"]
) {
  return Array.isArray(role)
    ? role[0]
    : role;
}

function getCreditType(
  creditType: MoviePerson["credit_types"]
) {
  return Array.isArray(creditType)
    ? creditType[0]
    : creditType;
}

export default async function CastCrewPage({
  params,
}: Props) {
  const { movieId } = await params;

  const numericMovieId = Number(movieId);

  if (!Number.isFinite(numericMovieId)) {
    notFound();
  }

  /* ---------------------------------------------------------
     MOVIE
  --------------------------------------------------------- */

  const { data: movie, error: movieError } =
    await supabase
      .from("movies")
      .select(`
        id,
        title,
        release_year,
        poster_url
      `)
      .eq("id", numericMovieId)
      .single();

  if (movieError || !movie) {
    notFound();
  }

  /* ---------------------------------------------------------
     CAST & CREW
  --------------------------------------------------------- */

  const {
    data: castCrew,
    error: castCrewError,
  } = await supabase
    .from("movie_people")
    .select(`
      id,
      person_id,
      role_id,
      credit_type_id,
      billing_order,
      character_name,

      people (
        full_name,
        profile_image_url
      ),

      person_roles (
        name,
        department
      ),

      credit_types (
        name
      )
    `)
    .eq("movie_id", numericMovieId)
    .order("billing_order", {
      ascending: true,
      nullsFirst: false,
    });

  if (castCrewError) {
    console.error(
      "Cast & Crew fetch error:",
      castCrewError
    );
  }

  const records =
    (castCrew || []) as unknown as MoviePerson[];

  /* ---------------------------------------------------------
     CAST / CREW
  --------------------------------------------------------- */

  const cast = records.filter((row) => {
    const role = getRole(row.person_roles);

    return (
      role?.department
        ?.trim()
        .toLowerCase() === "cast"
    );
  });

  const crew = records.filter((row) => {
    const role = getRole(row.person_roles);

    return (
      role?.department
        ?.trim()
        .toLowerCase() !== "cast"
    );
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* -------------------------------------------------
            BACK TO MOVIE
        ------------------------------------------------- */}

  <Link
              href={`/preview/movies/${movie.id}`}
              className="text-[9px] uppercase tracking-[0.2em] text-violet-700 transition hover:text-violet-400"
            >
              ← Back to Movie
            </Link>
      

                 <div className="mt-8 flex items-start gap-4"></div>
                 
        {/* -------------------------------------------------
            MOVIE HEADER
        ------------------------------------------------- */}

        <section className="border-b border-zinc-900 pb-5">

          <div className="flex items-start gap-4">

            

            <div className="shrink-0">

              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="h-[105px] w-[70px] rounded-md object-cover sm:h-[135px] sm:w-[90px]"
                />
              ) : (
                <div className="flex h-[105px] w-[70px] items-center justify-center rounded-md bg-zinc-900 text-[8px] text-zinc-700 sm:h-[135px] sm:w-[90px]">
                  No Poster
                </div>
              )}

            </div>

            <div className="min-w-0 pt-1">

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                Movie Intelligence
              </p>

              <h1 className="mt-1 text-base font-medium text-zinc-100 sm:text-lg">
                {movie.title}
              </h1>

              {movie.release_year && (
                <p className="mt-1 text-[9px] text-zinc-600">
                  {movie.release_year}
                </p>
              )}

              <div className="mt-4">

                <h2 className="text-[11px] font-medium text-zinc-300">
                  Cast & Crew
                </h2>

                <p className="mt-1 text-[9px] text-zinc-600">
                  People associated with the film and their credited roles.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* -------------------------------------------------
            DATA NOTE
        ------------------------------------------------- */}

        <section className="mt-5 rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3">

          <p className="text-[8px] uppercase tracking-[0.16em] text-yellow-500">
            Current Credits
          </p>

          <p className="mt-1 text-[10px] leading-5 text-zinc-500">
            Cast and crew information reflects the credits currently recorded in JMI.
          </p>

        </section>

        {/* -------------------------------------------------
            CAST
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="mb-3 flex items-end justify-between">

            <div>

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                Cast
              </p>

              <h2 className="mt-1 text-sm font-medium text-zinc-200">
                Principal & Supporting Performers
              </h2>

            </div>

            <span className="text-[8px] text-zinc-700">
              {cast.length}{" "}
              {cast.length === 1
                ? "Person"
                : "People"}
            </span>

          </div>

          {cast.length === 0 ? (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">

              <p className="text-[10px] text-zinc-600">
                No cast information is currently available.
              </p>

            </div>

          ) : (

            <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">

              <div className="divide-y divide-zinc-900">

                {cast.map((row, index) => {

                  const person =
                    getPerson(row.people);

                  const role =
                    getRole(row.person_roles);

                  const creditType =
                    getCreditType(
                      row.credit_types
                    );

                  return (
                    <div
                      key={row.id}
                      className="flex items-start gap-3 px-4 py-3 transition hover:bg-zinc-900/30"
                    >

                      {/* ---------------------------------
                          PROFILE IMAGE
                      --------------------------------- */}

                      {person?.profile_image_url ? (

                        <img
                          src={person.profile_image_url}
                          alt={person.full_name}
                          className="h-10 w-10 shrink-0 rounded-lg border border-zinc-800 object-cover"
                        />

                      ) : (

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-[8px] text-zinc-700">

                          {person?.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}

                        </div>

                      )}

                      {/* ---------------------------------
                          PERSON INFORMATION
                      --------------------------------- */}

                      <div className="min-w-0 flex-1">

                        <Link
                          href={`/preview/people/${row.person_id}?movieId=${movie.id}`}
                          className="block truncate text-[10px] font-medium text-zinc-200 transition hover:text-violet-300"
                        >
                          {person?.full_name ||
                            "Unknown Person"}
                        </Link>

                        <div className="mt-1 flex flex-wrap items-center gap-2">

                          <span className="text-[8px] text-zinc-400">
                            {role?.name ||
                              "Actor"}
                          </span>

                          {row.character_name && (
                            <>
                              <span className="text-zinc-800">
                                ·
                              </span>

                              <span className="text-[9px] text-zinc-400">
                                {row.character_name}
                              </span>
                            </>
                          )}

                        </div>

                        {creditType?.name && (
                          <div className="mt-1">

                            <span className="text-[7px] uppercase tracking-[0.1em] text-pink-400">
                              {creditType.name}
                            </span>

                          </div>
                        )}

                      </div>

                      {/* ---------------------------------
                          BILLING ORDER
                      --------------------------------- */}

                      <span className="shrink-0 text-[8px] text-zinc-800">
                        {String(
                          row.billing_order ??
                            index + 1
                        ).padStart(2, "0")}
                      </span>

                    </div>
                  );
                })}

              </div>

            </div>

          )}

        </section>
        {/* -------------------------------------------------
            CREW
        ------------------------------------------------- */}

        <section className="mt-8">

          <div className="mb-3 flex items-end justify-between">

            <div>

              <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
                Crew
              </p>

              <h2 className="mt-1 text-sm font-medium text-zinc-200">
                Directors, Writers & Technicians
              </h2>

            </div>

            <span className="text-[8px] text-zinc-700">
              {crew.length}{" "}
              {crew.length === 1
                ? "Person"
                : "People"}
            </span>

          </div>

          {crew.length === 0 ? (

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">

              <p className="text-[10px] text-zinc-600">
                No crew information is currently available.
              </p>

            </div>

          ) : (

            <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">

              <div className="divide-y divide-zinc-900">

                {crew.map((row) => {

                  const person =
                    getPerson(row.people);

                  const role =
                    getRole(row.person_roles);

                  const creditType =
                    getCreditType(
                      row.credit_types
                    );

                  return (
                    <div
                      key={row.id}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-zinc-900/30"
                    >

                     {/* PROFILE IMAGE */}

{person?.profile_image_url ? (
  <img
    src={person.profile_image_url}
    alt={person.full_name}
    className="h-10 w-10 shrink-0 rounded-lg border border-zinc-800 object-cover"
  />
) : (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-[8px] text-zinc-700">
    {person?.full_name
      ?.charAt(0)
      ?.toUpperCase() || "?"}
  </div>
)}

                      <div className="min-w-0 flex-1">

                        <Link
                          href={`/preview/people/${row.person_id}`}
                          className="block truncate text-[10px] font-medium text-zinc-200 transition hover:text-violet-300"
                        >
                          {person?.full_name ||
                            "Unknown Person"}
                        </Link>

                        <div className="mt-1 flex flex-wrap items-center gap-2">

                          <span className="text-[8px] text-zinc-600">
                            {role?.name ||
                              "Other"}
                          </span>

                          {role?.department && (
                            <>
                              <span className="text-zinc-800">
                                ·
                              </span>

                              <span className="text-[7px] uppercase tracking-[0.1em] text-zinc-700">
                                {role.department}
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                      {creditType?.name && (
                        <span className="hidden rounded-full border border-zinc-800 px-2 py-1 text-[7px] text-zinc-600 sm:inline-flex">
                          {creditType.name}
                        </span>
                      )}

                    </div>
                  );
                })}

              </div>

            </div>

          )}

        </section>

        {/* -------------------------------------------------
            SUMMARY
        ------------------------------------------------- */}

        <section className="mt-6">

          <div className="grid grid-cols-3 gap-2">

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-500">
                Cast
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-300">
                {cast.length}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-500">
                Crew
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-300">
                {crew.length}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-500">
                Credits
              </p>

              <p className="mt-2 text-sm font-medium text-zinc-300">
                {records.length}
              </p>

            </div>

          </div>

        </section>

        {/* -------------------------------------------------
            DATA NOTE
        ------------------------------------------------- */}

        <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 p-4">

          <p className="text-[8px] uppercase tracking-[0.16em] text-green-500">
            Data Note
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-400">
            Cast and crew presentation is based on the
            movie-person credits currently maintained in JMI.
            Role, department, billing and credit information
            are displayed where available.
          </p>

        </section>

        {/* -------------------------------------------------
            NAVIGATION
        ------------------------------------------------- */}

        <section className="mt-6">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="block rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 text-center text-[9px] text-violet-500 transition hover:border-zinc-700 hover:text-zinc-300"
          >
            Back to Movie Intelligence
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