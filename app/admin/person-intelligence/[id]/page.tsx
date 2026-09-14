"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

export default function PersonRoleSelectionPage() {
  const params = useParams();
  const router = useRouter();

  const personId = Number(params.id);

  const [person, setPerson] = useState<Person | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!personId) return;

    loadPersonAndRoles();
  }, [personId]);

  async function loadPersonAndRoles() {
  setLoading(true);
  setErrorMessage(null);

  try {
    console.log("Loading person:", personId);

    // =====================================================
    // 1. LOAD PERSON
    // =====================================================

    const {
      data: personData,
      error: personError,
    } = await supabase
      .from("people")
      .select(`
        id,
        full_name,
        original_name,
        profile_image_url
      `)
      .eq("id", personId)
      .single();

    console.log("Person result:", personData);
    console.log("Person error:", personError);

    if (personError) {
      console.error(
        "Person loading error:",
        personError
      );

      setErrorMessage(
        `Could not load this person. ${personError.message}`
      );

      return;
    }

    if (!personData) {
      setErrorMessage(
        "This person does not exist."
      );

      return;
    }

    setPerson(personData);


    // =====================================================
    // 2. LOAD THIS PERSON'S ROLE IDs
    // =====================================================

    console.log(
      "Loading role connections for person:",
      personId
    );

    const {
      data: moviePeopleData,
      error: moviePeopleError,
    } = await supabase
      .from("movie_people")
      .select("role_id")
      .eq("person_id", personId);

    console.log(
      "Movie people result:",
      moviePeopleData
    );

    console.log(
      "Movie people error:",
      moviePeopleError
    );

    if (moviePeopleError) {
      console.error(
        "Movie people role error:",
        moviePeopleError
      );

      setErrorMessage(
        `Could not load this person's roles. ${moviePeopleError.message}`
      );

      return;
    }


    // =====================================================
    // 3. GET UNIQUE ROLE IDs
    // =====================================================

    const roleIds = Array.from(
      new Set(
        (moviePeopleData || [])
          .map((row: any) => row.role_id)
          .filter(
            (roleId: any) =>
              roleId !== null &&
              roleId !== undefined
          )
        )
    );

    console.log(
      "Role IDs found:",
      roleIds
    );


    // =====================================================
    // NO ROLES
    // =====================================================

    if (roleIds.length === 0) {
      setRoles([]);

      console.log(
        "No roles found for this person."
      );

      return;
    }


    // =====================================================
    // 4. LOAD ROLE DETAILS
    // =====================================================

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

    console.log(
      "Role data:",
      roleData
    );

    console.log(
      "Role error:",
      roleError
    );

    if (roleError) {
      console.error(
        "Role loading error:",
        roleError
      );

      setErrorMessage(
        `Could not load role information. ${roleError.message}`
      );

      return;
    }


    // =====================================================
    // 5. FORMAT ROLES
    // =====================================================

    const formattedRoles: Role[] = (roleData || [])
      .map((role: any) => ({
        id: Number(role.id),
        name: role.name,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );

    console.log(
      "Final roles:",
      formattedRoles
    );

    setRoles(formattedRoles);

  } catch (error: any) {

    console.error(
      "Person role selection error:",
      error
    );

    setErrorMessage(
      error?.message ||
      "Something went wrong while loading this person."
    );

  } finally {

    console.log(
      "Finished loading person and roles."
    );

    setLoading(false);
  }
}

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="text-lg font-semibold text-yellow-400">
            Loading Person Intelligence...
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Loading available career roles
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (errorMessage) {
    return (
      <div className="space-y-5">

        <Link
          href="/admin/person-intelligence"
          className="text-sm text-zinc-400 hover:text-yellow-400"
        >
          ← Back to Person Intelligence
        </Link>

        <div className="rounded-xl bg-zinc-900 p-8">

          <h1 className="text-xl font-semibold text-red-400">
            Person Intelligence Error
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            {errorMessage}
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // PERSON NOT FOUND
  // =========================================================

  if (!person) {
    return (
      <div className="space-y-5">

        <Link
          href="/admin/person-intelligence"
          className="text-sm text-zinc-400 hover:text-yellow-400"
        >
          ← Back to Person Intelligence
        </Link>

        <div className="rounded-xl bg-zinc-900 p-8 text-center">

          <h1 className="text-xl font-semibold text-white">
            Person Not Found
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            The requested person could not be found.
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="space-y-8 pb-12">

      {/* =====================================================
          BACK
      ===================================================== */}

      <Link
        href="/admin/person-intelligence"
        className="inline-block text-sm text-zinc-400 hover:text-yellow-400"
      >
        ← Back to Person Intelligence
      </Link>


      {/* =====================================================
          PERSON HEADER
      ===================================================== */}

      <section className="rounded-xl bg-zinc-900 p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          {/* PROFILE IMAGE */}

          {person.profile_image_url ? (

            <img
              src={person.profile_image_url}
              alt={person.full_name}
              className="h-24 w-24 rounded-full border-2 border-yellow-400/30 object-cover"
            />

          ) : (

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-black text-3xl font-bold text-yellow-400">
              {person.full_name
                .charAt(0)
                .toUpperCase()}
            </div>

          )}


          {/* PERSON DETAILS */}

          <div>

            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
              JMI Person Intelligence
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              {person.full_name}
            </h1>

            {person.original_name &&
              person.original_name !== person.full_name && (
                <p className="mt-1 text-sm text-zinc-500">
                  {person.original_name}
                </p>
              )}

            <p className="mt-3 text-sm text-zinc-400">
              Select a career role to explore detailed
              box-office and career intelligence.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          ROLE SELECTION
      ===================================================== */}

      <section>

        <div className="mb-5">

          <h2 className="text-xl font-semibold text-white">
            Choose Intelligence
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Select the role you want to analyse for{" "}
            <span className="text-zinc-300">
              {person.full_name}
            </span>
            .
          </p>

        </div>


        {roles.length === 0 ? (

          <div className="rounded-xl bg-zinc-900 p-8 text-center">

            <p className="text-sm text-zinc-500">
              No role-specific credits are available for
              this person.
            </p>

          </div>

        ) : (

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {roles.map((role) => (

              <Link
                key={role.id}
                href={`/admin/person-intelligence/${person.id}/${role.id}`}
                className="group rounded-xl bg-zinc-900 p-6 transition hover:bg-zinc-800"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-xs uppercase tracking-widest text-yellow-400">
                      Role Intelligence
                    </p>

                    <h3 className="mt-2 text-xl font-semibold text-white group-hover:text-yellow-400">
                      {role.name}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Explore {role.name.toLowerCase()} career
                      performance
                    </p>

                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-lg text-yellow-400">
                    →
                  </div>

                </div>

                <div className="mt-5 border-t border-zinc-800 pt-4">

                  <span className="text-sm font-medium text-zinc-400 group-hover:text-yellow-400">
                    View {role.name} Intelligence →
                  </span>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          ROLE FLOW INFORMATION
      ===================================================== */}

      <section className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">

        <h2 className="text-lg font-semibold text-yellow-400">
          Role-Specific Intelligence
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          JMI keeps each professional role separate.
          This means an actor's acting career, directing
          career, writing career and other professional
          contributions can be analysed independently.
        </p>

      </section>

    </div>
  );
}