import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ movieId: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { movieId } = await params;

    const numericMovieId = Number(movieId);

    if (!Number.isInteger(numericMovieId)) {
      return NextResponse.json(
        {
          error: "Invalid movie ID.",
        },
        { status: 400 }
      );
    }

    /*
     * =========================================================
     * AUTHENTICATION
     * =========================================================
     */

    const serverSupabase =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    

    /*
     * =========================================================
     * MOVIE
     * =========================================================
     */

    const {
      data: movie,
      error: movieError,
    } = await supabase
      .from("movies")
      .select(`
        id,
        title,
        original_title,
        release_year,
        release_date,
        poster_url
      `)
      .eq("id", numericMovieId)
      .eq("is_active", true)
      .single();

    if (movieError || !movie) {
      console.error(
        "JMI Performance Report movie error:",
        movieError
      );

      return NextResponse.json(
        {
          error: "Movie not found.",
        },
        { status: 404 }
      );
    }

    /*
     * =========================================================
     * PRIMARY LANGUAGE
     * =========================================================
     */

    const {
      data: movieLanguages,
      error: languageError,
    } = await supabase
      .from("movie_languages")
      .select(`
        language_id,
        is_primary,
        languages (
          name,
          native_name
        )
      `)
      .eq("movie_id", numericMovieId)
      .order("is_primary", {
        ascending: false,
      });

    if (languageError) {
      console.error(
        "JMI Performance Report language error:",
        languageError
      );
    }

    const primaryLanguageRow =
      movieLanguages?.find(
        (row) => row.is_primary === true
      ) ?? movieLanguages?.[0] ?? null;

    const primaryLanguageValue =
      primaryLanguageRow?.languages;

    const primaryLanguage =
      Array.isArray(primaryLanguageValue)
        ? primaryLanguageValue[0]?.name ?? null
        : (
            primaryLanguageValue as
              | { name?: string }
              | null
              | undefined
          )?.name ?? null;

    /*
     * =========================================================
     * GENRES
     * =========================================================
     */

    const {
      data: movieGenres,
      error: genreError,
    } = await supabase
      .from("movie_genres")
      .select(`
        genre_id,
        genres (
          name
        )
      `)
      .eq("movie_id", numericMovieId);

    if (genreError) {
      console.error(
        "JMI Performance Report genre error:",
        genreError
      );
    }

    const genres =
      movieGenres
        ?.map((row) => {
          const value = row.genres;

          if (Array.isArray(value)) {
            return value[0]?.name ?? null;
          }

          return (
            value as
              | { name?: string }
              | null
              | undefined
          )?.name ?? null;
        })
        .filter(Boolean) ?? [];

    /*
     * =========================================================
     * PRIMARY INDUSTRY
     * =========================================================
     */

    const {
      data: movieIndustries,
      error: industryError,
    } = await supabase
      .from("movie_industries")
      .select(`
        industry_id,
        is_primary,
        industries (
          id,
          name,
          short_name
        )
      `)
      .eq("movie_id", numericMovieId)
      .eq("is_primary", true);

    if (industryError) {
      console.error(
        "JMI Performance Report industry error:",
        industryError
      );
    }

    const primaryIndustryRow =
      movieIndustries?.[0] ?? null;

    const industryValue =
      primaryIndustryRow?.industries;

    const industry = Array.isArray(industryValue)
      ? industryValue[0] ?? null
      : industryValue ?? null;

    /*
     * =========================================================
     * PEOPLE / CAST / CREW
     * =========================================================
     *
     * IMPORTANT:
     *
     * movie_people.person_id references people.id.
     *
     * people.full_name contains the actual person's name.
     *
     * person_roles determines the person's role.
     *
     * credit_types determines the credit classification.
     *
     * We intentionally do NOT use film_persons.
     */

    const {
      data: moviePeople,
      error: peopleError,
    } = await supabase
      .from("movie_people")
      .select(`
        person_id,
        role_id,
        credit_type_id,
        character_name,
        billing_order,
        people (
          id,
          full_name
        ),
        person_roles (
          id,
          name,
          slug
        ),
        credit_types (
          id,
          name
        )
      `)
      .eq("movie_id", numericMovieId)
      .order("billing_order", {
        ascending: true,
        nullsFirst: false,
      });

    if (peopleError) {
      console.error(
        "JMI Performance Report people error:",
        peopleError
      );
    }

    type PersonCredit = {
      person_id: number;
      role_id: number | null;
      credit_type_id: number | null;
      character_name: string | null;
      billing_order: number | null;

      people:
        | {
            id: number;
            full_name: string;
          }
        | {
            id: number;
            full_name: string;
          }[]
        | null;

      person_roles:
        | {
            id: number;
            name: string;
            slug: string;
          }
        | {
            id: number;
            name: string;
            slug: string;
          }[]
        | null;

      credit_types:
        | {
            id: number;
            name: string;
          }
        | {
            id: number;
            name: string;
          }[]
        | null;
    };

    const people =
      (moviePeople as PersonCredit[] | null) ?? [];

    function getPersonName(
      person: PersonCredit
    ): string | null {
      const value = person.people;

      if (Array.isArray(value)) {
        return value[0]?.full_name ?? null;
      }

      return value?.full_name ?? null;
    }

    function getRoleSlug(
      person: PersonCredit
    ): string | null {
      const value = person.person_roles;

      if (Array.isArray(value)) {
        return value[0]?.slug ?? null;
      }

      return value?.slug ?? null;
    }

    function getRoleName(
      person: PersonCredit
    ): string | null {
      const value = person.person_roles;

      if (Array.isArray(value)) {
        return value[0]?.name ?? null;
      }

      return value?.name ?? null;
    }

    function getCreditTypeName(
      person: PersonCredit
    ): string | null {
      const value = person.credit_types;

      if (Array.isArray(value)) {
        return value[0]?.name ?? null;
      }

      return value?.name ?? null;
    }

    /*
     * Normalize text only for matching.
     *
     * This does NOT modify the database values.
     */

    function normalizeText(
      value: string | null | undefined
    ): string {
      return (value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");
    }

    /*
     * =========================================================
     * DIRECTOR
     * =========================================================
     */

    const director =
      people.find((person) => {
        const roleSlug = normalizeText(
          getRoleSlug(person)
        );

        const roleName = normalizeText(
          getRoleName(person)
        );

        return (
          roleSlug === "director" ||
          roleName === "director"
        );
      }) ?? null;

    /*
     * =========================================================
     * LEAD ACTOR
     * =========================================================
     *
     * We rely on the JMI credit type to identify
     * the lead designation.
     */

    const leadActor =
      people.find((person) => {
        const roleSlug = normalizeText(
          getRoleSlug(person)
        );

        const roleName = normalizeText(
          getRoleName(person)
        );

        const creditType = normalizeText(
          getCreditTypeName(person)
        );

        const isActorRole =
          roleSlug === "actor" ||
          roleName === "actor" ||
          roleSlug === "lead actor" ||
          roleName === "lead actor";

        const isLeadActorCredit =
          creditType === "lead role" ||
          creditType === "lead actor" ||
          creditType === "male lead";

        return (
          isActorRole &&
          isLeadActorCredit
        );
      }) ?? null;

    /*
     * =========================================================
     * LEAD ACTRESS
     * =========================================================
     */

    const leadActress =
      people.find((person) => {
        const roleSlug = normalizeText(
          getRoleSlug(person)
        );

        const roleName = normalizeText(
          getRoleName(person)
        );

        const creditType = normalizeText(
          getCreditTypeName(person)
        );

        const isActressRole =
          roleSlug === "actress" ||
          roleName === "actress" ||
          roleSlug === "lead actress" ||
          roleName === "lead actress" ||
          roleSlug === "actor" ||
          roleName === "actor";

        const isLeadActressCredit =
          creditType === "lead actress" ||
          creditType === "female lead" ||
          creditType === "lead role actress";

        return (
          isActressRole &&
          isLeadActressCredit
        );
      }) ?? null;

    /*
     * =========================================================
     * INDIA STATE-WISE BOX OFFICE
     * =========================================================
     */

    const {
      data: stateBoxOffice,
      error: stateBoxOfficeError,
    } = await supabase
      .from("movie_state_box_office")
      .select(`
        state_id,
        gross_jmi
      `)
      .eq("movie_id", numericMovieId);

    if (stateBoxOfficeError) {
      console.error(
        "JMI Performance Report state box office error:",
        stateBoxOfficeError
      );
    }

    /*
     * Only actual state IDs are looked up
     * in the states table.
     *
     * NULL state_id is preserved because
     * JMI uses it for aggregate records such
     * as Rest of India.
     */

    const stateIds =
      stateBoxOffice
        ?.map((row) => row.state_id)
        .filter(
          (id): id is number =>
            typeof id === "number"
        ) ?? [];

    let states: {
      id: number;
      name: string;
    }[] = [];

    if (stateIds.length > 0) {
      const {
        data: stateData,
        error: stateError,
      } = await supabase
        .from("states")
        .select(`
          id,
          name
        `)
        .in("id", stateIds);

      if (stateError) {
        console.error(
          "JMI Performance Report states error:",
          stateError
        );
      }

      states = stateData ?? [];
    }

    const stateNameMap = new Map(
      states.map((state) => [
        state.id,
        state.name,
      ])
    );

    const indiaStatePerformance =
      (stateBoxOffice ?? [])
        .map((row) => ({
          stateId: row.state_id,

          stateName:
            row.state_id === null
              ? "Rest of India"
              : stateNameMap.get(row.state_id) ??
                "Unknown Territory",

          gross: Number(
            row.gross_jmi || 0
          ),
        }))
        .filter(
          (row) => row.gross > 0
        )
        .sort(
          (a, b) =>
            b.gross - a.gross
        );

    const strongestIndianTerritory =
      indiaStatePerformance[0] ?? null;

    /*
     * =========================================================
     * INDIA TOTAL
     * =========================================================
     */

    const indiaGross =
      indiaStatePerformance.reduce(
        (total, territory) =>
          total + territory.gross,
        0
      );

    /*
     * =========================================================
     * OVERSEAS TOTAL
     * =========================================================
     *
     * This is the aggregate overseas figure.
     *
     * Country-wise figures are kept separate
     * to prevent double counting.
     */

    const {
      data: overseasBoxOffice,
      error: overseasError,
    } = await supabase
      .from("movie_overseas_box_office")
      .select(`
        gross_inr,
        gross_usd,
        gcc_gross_usd,
        north_america_gross_usd
      `)
      .eq("movie_id", numericMovieId);

    if (overseasError) {
      console.error(
        "JMI Performance Report overseas error:",
        overseasError
      );
    }

    const overseasGross =
      overseasBoxOffice?.reduce(
        (total, row) =>
          total +
          Number(
            row.gross_inr || 0
          ),
        0
      ) ?? 0;

    /*
     * =========================================================
     * OVERSEAS COUNTRY-WISE DATA
     * =========================================================
     */

    const {
      data: overseasCountryBoxOffice,
      error: overseasCountryError,
    } = await supabase
      .from("movie_country_box_office")
      .select(`
        country_id,
        gross_local,
        gross_usd,
        notes,
        countries (
          id,
          name
        )
      `)
      .eq("movie_id", numericMovieId);

    if (overseasCountryError) {
      console.error(
        "JMI Performance Report overseas country error:",
        overseasCountryError
      );
    }

    const overseasCountryWise =
      (overseasCountryBoxOffice ?? [])
        .map((row) => {
          const countryValue =
            row.countries;

          const country =
            Array.isArray(countryValue)
              ? countryValue[0] ?? null
              : countryValue ?? null;

          return {
            countryId:
              row.country_id,

            countryName:
              country?.name ??
              "Unknown Country",

            grossLocal:
              row.gross_local !== null &&
              row.gross_local !== undefined
                ? Number(
                    row.gross_local
                  )
                : null,

            grossUsd:
              row.gross_usd !== null &&
              row.gross_usd !== undefined
                ? Number(
                    row.gross_usd
                  )
                : null,

            notes:
              row.notes ?? null,
          };
        })
        .filter(
          (row) =>
            row.grossLocal !== null ||
            row.grossUsd !== null
        )
        .sort(
          (a, b) =>
            (b.grossUsd ?? 0) -
            (a.grossUsd ?? 0)
        );

    /*
     * =========================================================
     * WORLDWIDE TOTAL
     * =========================================================
     */

    const worldwideGross =
      indiaGross + overseasGross;

    /*
     * =========================================================
     * OFFICIAL FIGURES
     * =========================================================
     */

    const {
      data: officialBoxOffice,
      error: officialError,
    } = await supabase
      .from("movie_official_box_office")
      .select(`
        id,
        territory_name,
        gross_official,
        notes
      `)
      .eq("movie_id", numericMovieId)
      .order("id", {
        ascending: true,
      });

    if (officialError) {
      console.error(
        "JMI Performance Report official box office error:",
        officialError
      );
    }

    /*
     * =========================================================
     * MOVIE BUSINESS
     * =========================================================
     */

    const {
      data: movieBusiness,
      error: businessError,
    } = await supabase
      .from("movie_business")
      .select(`
        production_budget_trade,
        theatrical_verdict
      `)
      .eq("movie_id", numericMovieId)
      .maybeSingle();

    if (businessError) {
      console.error(
        "JMI Performance Report business error:",
        businessError
      );
    }

    /*
     * =========================================================
     * AUTOMATIC JMI PERFORMANCE SUMMARY
     * =========================================================
     *
     * Zero-cost, rule-based summary.
     *
     * No AI.
     * No external API.
     * No invented figures.
     */

    function formatSummaryCrore(
      value: number
    ): string {
      const crore =
        value / 10000000;

      return `₹${new Intl.NumberFormat(
        "en-IN",
        {
          maximumFractionDigits: 2,
        }
      ).format(crore)} Cr`;
    }

    const summaryParts: string[] = [];

    const movieDisplayName =
      movie.title ||
      movie.original_title ||
      "This movie";

    /*
     * Overall performance
     */

    summaryParts.push(
      `${movieDisplayName} has recorded a JMI worldwide gross of ${formatSummaryCrore(
        worldwideGross
      )}, comprising ${formatSummaryCrore(
        indiaGross
      )} from India and ${formatSummaryCrore(
        overseasGross
      )} from overseas markets.`
    );

    /*
     * Indian market
     */

    if (strongestIndianTerritory) {
      summaryParts.push(
        `${strongestIndianTerritory.stateName} is the strongest-performing Indian territory with ${formatSummaryCrore(
          strongestIndianTerritory.gross
        )}.`
      );

      const otherMajorTerritories =
        indiaStatePerformance
          .slice(1, 4)
          .map(
            (territory) =>
              `${territory.stateName} (${formatSummaryCrore(
                territory.gross
              )})`
          );

      if (
        otherMajorTerritories.length >
        0
      ) {
        summaryParts.push(
          `Other major reported Indian territories include ${otherMajorTerritories.join(
            ", "
          )}.`
        );
      }
    }

    /*
     * Overseas market
     */

    if (
      overseasCountryWise.length >
      0
    ) {
      const countryCount =
        overseasCountryWise.length;

      summaryParts.push(
        `JMI records overseas country-wise data across ${countryCount} reported market${
          countryCount === 1
            ? ""
            : "s"
        }.`
      );
    } else {
      summaryParts.push(
        "Country-wise overseas data is not available in the current JMI records."
      );
    }

    /*
     * Business information
     */

    const tradeBudget =
      movieBusiness?.production_budget_trade !==
        null &&
      movieBusiness?.production_budget_trade !==
        undefined
        ? Number(
            movieBusiness.production_budget_trade
          )
        : null;

    const verdict =
      movieBusiness?.theatrical_verdict ??
      null;

    if (
      tradeBudget !== null &&
      Number.isFinite(
        tradeBudget
      )
    ) {
      summaryParts.push(
        `The estimated JMI trade budget is ${formatSummaryCrore(
          tradeBudget
        )}.`
      );
    }

    if (verdict) {
      summaryParts.push(
        `The current JMI theatrical verdict is ${verdict}.`
      );
    }

    const performanceSummary =
      summaryParts.join(" ");

    /*
     * =========================================================
     * RESPONSE
     * =========================================================
     */

    return NextResponse.json({
      report: {
        movie: {
          id: movie.id,

          title:
            movie.title ||
            movie.original_title ||
            "Movie",

          originalTitle:
            movie.original_title,

          releaseYear:
            movie.release_year,

          releaseDate:
            movie.release_date,

          posterUrl:
            movie.poster_url,
        },

        profile: {
          genre:
            genres.length > 0
              ? genres.join(" · ")
              : null,

          language:
            primaryLanguage,

          industry: industry
            ? {
                id:
                  industry.id,

                name:
                  industry.name,

                shortName:
                  industry.short_name ??
                  null,
              }
            : null,

          director: director
            ? {
                name:
                  getPersonName(
                    director
                  ),
              }
            : null,

          leadActor: leadActor
            ? {
                name:
                  getPersonName(
                    leadActor
                  ),

                character:
                  leadActor.character_name,
              }
            : null,

          leadActress: leadActress
            ? {
                name:
                  getPersonName(
                    leadActress
                  ),

                character:
                  leadActress.character_name,
              }
            : null,
        },

        boxOffice: {
          indiaGross,

          overseasGross,

          worldwideGross,

          strongestIndianTerritory,

          indianTerritories:
            indiaStatePerformance.slice(
              0,
              10
            ),

          overseasCountries:
            overseasCountryWise,
        },

        overseas: {
          totalGross:
            overseasGross,

          countryWise:
            overseasCountryWise,

          countryWiseAvailable:
            overseasCountryWise.length >
            0,
        },

        officialFigures:
          officialBoxOffice ?? [],

        business: {
          productionBudgetTrade:
            movieBusiness?.production_budget_trade !==
              null &&
            movieBusiness?.production_budget_trade !==
              undefined
              ? Number(
                  movieBusiness.production_budget_trade
                )
              : null,

          theatricalVerdict:
            movieBusiness?.theatrical_verdict ??
            null,
        },

        performanceSummary,
      },
    });
  } catch (error) {
    console.error(
      "JMI Performance Report API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate JMI performance report data.",
      },
      { status: 500 }
    );
  }
}