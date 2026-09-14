"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MovieRecord = {
  id: number;
  title: string;
  release_date: string | null;
  release_year: number | null;
};

type BoxOfficeRecord = {
  movie_id: number;
  state_id: number;
  gross_jmi: number | null;
  coverage_type: string;
};

type MarketConfig = {
  key: string;
  name: string;
  description: string;
  stateCodes: string[];
};

type MoviePerformance = {
  movieId: number;
  title: string;
  year: number | null;
  gross: number;
};

type LanguagePerformance = {
  languageId: number;
  languageName: string;
  movies: number;
  gross: number;
  marketShare: number;
  averageGross: number;
};

type MovieLanguageRecord = {
  movie_id: number;
  language_id: number;
  language_type: string;
};

type LanguageRecord = {
  id: number;
  name: string;
};

type MovieGenreRecord = {
  movie_id: number;
  genre_id: number;
};

type GenreRecord = {
  id: number;
  name: string;
};

type GenrePerformance = {
  genreId: number;
  genreName: string;
  movies: number;
  gross: number;
  marketShare: number;
  averageGross: number;
};

type MoviePeopleRecord = {
  movie_id: number;
  person_id: number;
  credit_type_id: number | null;
};

type PersonRecord = {
  id: number;
  full_name: string;
};

type ActorPerformance = {
  personId: number;
  personName: string;
  movies: number;
  gross: number;
  averageGross: number;
};

const MARKET_CONFIGS: MarketConfig[] = [
  {
    key: "kerala",
    name: "Kerala",
    description:
      "Kerala state theatrical market.",
    stateCodes: ["KL"],
  },
  {
    key: "karnataka",
    name: "Karnataka",
    description:
      "Karnataka state theatrical market.",
    stateCodes: ["KA"],
  },
  {
    key: "tamil-nadu",
    name: "Tamil Nadu",
    description:
      "Tamil Nadu state theatrical market.",
    stateCodes: ["TN"],
  },
  {
    key: "telugu-states",
    name: "Telugu States",
    description:
      "Combined Andhra Pradesh and Telangana theatrical market.",
    stateCodes: ["AP", "TG"],
  },
];

export default function MarketIntelligencePage() {
  const params = useParams();
  const router = useRouter();

  const marketKey =
    typeof params.market === "string"
      ? params.market
      : "";

  // --------------------------------------------------
  // Market
  // --------------------------------------------------

  const market =
    MARKET_CONFIGS.find(
      (item) =>
        item.key === marketKey
    ) || null;

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [stateIds, setStateIds] =
    useState<number[]>([]);

    

// --------------------------------------------------
// Raw Data
// --------------------------------------------------

const [movies, setMovies] =
  useState<MovieRecord[]>([]);

const [boxOffice, setBoxOffice] =
  useState<BoxOfficeRecord[]>([]);

const [movieLanguages, setMovieLanguages] =
  useState<MovieLanguageRecord[]>([]);

const [languages, setLanguages] =
  useState<LanguageRecord[]>([]);

  const [movieGenres, setMovieGenres] =
  useState<MovieGenreRecord[]>([]);

const [genres, setGenres] =
  useState<GenreRecord[]>([]);
    
  const [moviePeople, setMoviePeople] =
  useState<MoviePeopleRecord[]>([]);

const [people, setPeople] =
  useState<PersonRecord[]>([]);

  

  // --------------------------------------------------
  // Year
  // --------------------------------------------------

  const [selectedYear, setSelectedYear] =
    useState<number | "all">("all");

  const [availableYears, setAvailableYears] =
    useState<number[]>([]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Load Data
  // --------------------------------------------------

  useEffect(() => {
    if (!market) {
      setLoading(false);
      setError(
        "Market not found."
      );
      return;
    }

    loadMarketData();
  }, [marketKey]);

  async function loadMarketData() {
    if (!market) {
      return;
    }

    setLoading(true);
    setError("");

    // --------------------------------------------------
    // 1. Load States
    // --------------------------------------------------

    const {
      data: stateData,
      error: stateError,
    } = await supabase
      .from("states")
      .select(`
        id,
        name,
        code
      `)
      .in(
        "code",
        market.stateCodes
      );

    if (stateError) {
      console.error(stateError);
      setError(stateError.message);
      setLoading(false);
      return;
    }

    if (
      !stateData ||
      stateData.length === 0
    ) {
      setError(
        "Required market states were not found."
      );
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 2. State IDs
    // --------------------------------------------------

    const ids = stateData.map(
      (state) => Number(state.id)
    );

    setStateIds(ids);

    // --------------------------------------------------
    // 3. Load State Box Office
    // --------------------------------------------------

    const {
      data: boxOfficeData,
      error: boxOfficeError,
    } = await supabase
      .from("movie_state_box_office")
      .select(`
        movie_id,
        state_id,
        gross_jmi,
        coverage_type
      `)
      .in("state_id", ids)
      .eq(
        "coverage_type",
        "STATE"
      );

    if (boxOfficeError) {
      console.error(boxOfficeError);
      setError(
        boxOfficeError.message
      );
      setLoading(false);
      return;
    }

    const normalizedBoxOffice =
      (boxOfficeData || []).map(
        (row) => ({
          movie_id:
            Number(row.movie_id),

          state_id:
            Number(row.state_id),

          gross_jmi:
            row.gross_jmi === null
              ? null
              : Number(
                  row.gross_jmi
                ),

          coverage_type:
            row.coverage_type,
        })
      );

    setBoxOffice(
      normalizedBoxOffice
    );

    // --------------------------------------------------
    // 4. Movie IDs
    // --------------------------------------------------

    const movieIds = [
      ...new Set(
        normalizedBoxOffice.map(
          (row) => row.movie_id
        )
      ),
    ];

    if (movieIds.length === 0) {
      setMovies([]);
      setAvailableYears([]);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 5. Load Movies
    // --------------------------------------------------

    const {
      data: movieData,
      error: movieError,
    } = await supabase
      .from("movies")
      .select(`
        id,
        title,
        release_date,
        release_year
      `)
      .in(
        "id",
        movieIds
      );

    if (movieError) {
      console.error(movieError);
      setError(
        movieError.message
      );
      setLoading(false);
      return;
    }

    const normalizedMovies =
      (movieData || []).map(
        (movie) => ({
          id: Number(movie.id),

          title: movie.title,

          release_date:
            movie.release_date,

          release_year:
            movie.release_year ===
            null
              ? null
              : Number(
                  movie.release_year
                ),
        })
      );

    setMovies(
      normalizedMovies
    );

    // --------------------------------------------------
// 5B. Load Languages
// --------------------------------------------------

const {
  data: languageData,
  error: languageError,
} = await supabase
  .from("languages")
  .select(`
    id,
    name
  `);

if (languageError) {
  console.error(languageError);
  setError(languageError.message);
  setLoading(false);
  return;
}

const normalizedLanguages =
  (languageData || []).map(
    (language) => ({
      id: Number(language.id),
      name: language.name,
    })
  );

setLanguages(
  normalizedLanguages
);

// --------------------------------------------------
// 5C. Load Movie Languages
// --------------------------------------------------

const {
  data: movieLanguageData,
  error: movieLanguageError,
} = await supabase
  .from("movie_languages")
  .select(`
    movie_id,
    language_id,
    language_type
  `)
  .in(
    "movie_id",
    movieIds
  );

if (movieLanguageError) {
  console.error(
    movieLanguageError
  );

  setError(
    movieLanguageError.message
  );

  setLoading(false);
  return;
}

const normalizedMovieLanguages =
  (movieLanguageData || []).map(
    (row) => ({
      movie_id:
        Number(row.movie_id),

      language_id:
        Number(row.language_id),

      language_type:
        row.language_type,
    })
  );

setMovieLanguages(
  normalizedMovieLanguages
);

  

// --------------------------------------------------
// 5D. Load Genres
// --------------------------------------------------

const {
  data: genreData,
  error: genreError,
} = await supabase
  .from("genres")
  .select(`
    id,
    name
  `);

if (genreError) {
  console.error(genreError);

  setError(
    genreError.message
  );

  setLoading(false);
  return;
}

setGenres(
  (genreData || []).map(
    (genre) => ({
      id: Number(genre.id),
      name: genre.name,
    })
  )
);

// --------------------------------------------------
// 5E. Load Movie Genres
// --------------------------------------------------

const {
  data: movieGenreData,
  error: movieGenreError,
} = await supabase
  .from("movie_genres")
  .select(`
    movie_id,
    genre_id
  `)
  .in(
    "movie_id",
    movieIds
  );

if (movieGenreError) {
  console.error(
    movieGenreError
  );

  setError(
    movieGenreError.message
  );

  setLoading(false);
  return;
}

setMovieGenres(
  (movieGenreData || []).map(
    (row) => ({
      movie_id:
        Number(row.movie_id),

      genre_id:
        Number(row.genre_id),
    })
  )
);

// --------------------------------------------------
// 5F. Load Movie People
// --------------------------------------------------

const {
  data: moviePeopleData,
  error: moviePeopleError,
} = await supabase
  .from("movie_people")
  .select(`
    movie_id,
    person_id,
    credit_type_id
  `)
  .in(
    "movie_id",
    movieIds
  );

if (moviePeopleError) {
  console.error(
    moviePeopleError
  );

  setError(
    moviePeopleError.message
  );

  setLoading(false);
  return;
}

const normalizedMoviePeople =
  (moviePeopleData || []).map(
    (row) => ({
      movie_id:
        Number(row.movie_id),

      person_id:
        Number(row.person_id),

      credit_type_id:
        row.credit_type_id === null
          ? null
          : Number(
              row.credit_type_id
            ),
    })
  );

setMoviePeople(
  normalizedMoviePeople
);

// --------------------------------------------------
// 5G. Load People
// --------------------------------------------------

const personIds = [
  ...new Set(
    normalizedMoviePeople.map(
      (row) => row.person_id
    )
  ),
];

if (personIds.length > 0) {

  const {
    data: peopleData,
    error: peopleError,
  } = await supabase
    .from("people")
    .select(`
      id,
      full_name
    `)
    .in(
      "id",
      personIds
    );

  if (peopleError) {
    console.error(
      peopleError
    );

    setError(
      peopleError.message
    );

    setLoading(false);
    return;
  }

  setPeople(
    (peopleData || []).map(
      (person) => ({
        id: Number(person.id),
        full_name:
          person.full_name,
      })
    )
  );

} else {

  setPeople([]);

}

// --------------------------------------------------
// 7. Load Languages
// --------------------------------------------------

const languageIds = [
  ...new Set(
    normalizedMovieLanguages.map(
      (row) => row.language_id
    )
  ),
];

if (languageIds.length > 0) {

  const {
    data: languageData,
    error: languageError,
  } = await supabase
    .from("languages")
    .select(`
      id,
      name
    `)
    .in("id", languageIds);

  if (languageError) {
    console.error(languageError);
    setError(
      languageError.message
    );
    setLoading(false);
    return;
  }

  setLanguages(
    (languageData || []).map(
      (language) => ({
        id: Number(language.id),
        name: language.name,
      })
    )
  );

} else {

  setLanguages([]);

}

    // --------------------------------------------------
    // 6. Available Years
    // --------------------------------------------------

    const years = [
      ...new Set(
        normalizedMovies
          .map((movie) => {
            if (
              movie.release_year
            ) {
              return Number(
                movie.release_year
              );
            }

            if (
              movie.release_date
            ) {
              return Number(
                String(
                  movie.release_date
                ).substring(0, 4)
              );
            }

            return null;
          })
          .filter(
            (
              year
            ): year is number =>
              year !== null
          )
      ),
    ].sort(
      (a, b) => b - a
    );

    setAvailableYears(years);

    setLoading(false);
  }

  // --------------------------------------------------
  // Movie Year Map
  // --------------------------------------------------

  const movieYearMap =
    useMemo(() => {
      const map: Record<
        number,
        number | null
      > = {};

      movies.forEach(
        (movie) => {
          if (
            movie.release_year
          ) {
            map[movie.id] =
              Number(
                movie.release_year
              );
          } else if (
            movie.release_date
          ) {
            map[movie.id] =
              Number(
                String(
                  movie.release_date
                ).substring(0, 4)
              );
          } else {
            map[movie.id] =
              null;
          }
        }
      );

      return map;
    }, [movies]);

    // --------------------------------------------------
// Movie Language Map
// --------------------------------------------------

const movieLanguageMap =
  useMemo(() => {

    const map: Record<
      number,
      string
    > = {};

    movieLanguages.forEach(
      (movieLanguage) => {

        const language =
          languages.find(
            (item) =>
              item.id ===
              movieLanguage.language_id
          );

        if (!language) {
          return;
        }

        const movieId =
          movieLanguage.movie_id;

        // Prefer Original language
        if (
          movieLanguage.language_type ===
          "Original"
        ) {
          map[movieId] =
            language.name;

          return;
        }

        if (!map[movieId]) {
          map[movieId] =
            language.name;
        }

      }
    );

    return map;

  }, [
    movieLanguages,
    languages,
  ]);

  // --------------------------------------------------
  // All-Time Movie Performance
  // --------------------------------------------------

  const allTimeMoviePerformance =
    useMemo(() => {
      const movieMap: Record<
        number,
        MoviePerformance
      > = {};

      boxOffice.forEach(
        (row) => {
          const movieId =
            Number(row.movie_id);

          const movie =
            movies.find(
              (item) =>
                item.id === movieId
            );

          if (!movie) {
            return;
          }

          if (!movieMap[movieId]) {
            movieMap[movieId] = {
              movieId,

              title:
                movie.title,

              year:
                movieYearMap[
                  movieId
                ] ?? null,

              gross: 0,
            };
          }

          movieMap[movieId].gross +=
            Number(
              row.gross_jmi || 0
            );
        }
      );

      return Object.values(
        movieMap
      ).sort(
        (a, b) =>
          b.gross - a.gross
      );
    }, [
      boxOffice,
      movies,
      movieYearMap,
    ]);

  // --------------------------------------------------
  // Selected Movie Performance
  // --------------------------------------------------

  const selectedMoviePerformance =
    useMemo(() => {
      if (
        selectedYear ===
        "all"
      ) {
        return allTimeMoviePerformance;
      }

      return allTimeMoviePerformance.filter(
        (movie) =>
          movie.year ===
          selectedYear
      );
    }, [
      allTimeMoviePerformance,
      selectedYear,
    ]);

  // --------------------------------------------------
  // Selected Gross
  // --------------------------------------------------

  const selectedGross =
    selectedMoviePerformance.reduce(
      (total, movie) =>
        total + movie.gross,
      0
    );

    // --------------------------------------------------
// Language Performance
// --------------------------------------------------

const languagePerformance =
  useMemo(() => {

    const languageMap: Record<
      number,
      {
        languageName: string;
        movieIds: Set<number>;
        gross: number;
      }
    > = {};

    

    // --------------------------------------------------
    // Build Original Language Map
    // --------------------------------------------------

    const originalLanguageMap: Record<
      number,
      number
    > = {};

    movieLanguages.forEach(
      (movieLanguage) => {

        if (
  String(
    movieLanguage.language_type
  ).toLowerCase() ===
  "original"
) {
          originalLanguageMap[
            movieLanguage.movie_id
          ] =
            movieLanguage.language_id;
        }

      }
    );

    // --------------------------------------------------
    // Calculate language gross
    // --------------------------------------------------

    boxOffice.forEach(
      (row) => {

        const movieId =
          Number(row.movie_id);

        // Apply selected year
        if (
          selectedYear !== "all" &&
          movieYearMap[movieId] !==
            selectedYear
        ) {
          return;
        }

        const languageId =
          originalLanguageMap[
            movieId
          ];

        if (!languageId) {
          return;
        }

        const language =
          languages.find(
            (item) =>
              item.id ===
              languageId
          );

        if (!language) {
          return;
        }

        if (
          !languageMap[languageId]
        ) {
          languageMap[languageId] = {
            languageName:
              language.name,

            movieIds:
              new Set<number>(),

            gross: 0,
          };
        }

        languageMap[
          languageId
        ].movieIds.add(
          movieId
        );

        languageMap[
          languageId
        ].gross +=
          Number(
            row.gross_jmi || 0
          );

      }
    );


    // --------------------------------------------------
    // Total selected market gross
    // --------------------------------------------------

    const totalLanguageGross =
      Object.values(
        languageMap
      ).reduce(
        (total, language) =>
          total + language.gross,
        0
      );

    // --------------------------------------------------
    // Final performance
    // --------------------------------------------------

    return Object.entries(
      languageMap
    )
      .map(
        ([languageId, data]) => {

          const movies =
            data.movieIds.size;

          const averageGross =
            movies > 0
              ? data.gross /
                movies
              : 0;

          return {
            languageId:
              Number(languageId),

            languageName:
              data.languageName,

            movies,

            gross:
              data.gross,

            marketShare:
              totalLanguageGross >
              0
                ? (
                    data.gross /
                    totalLanguageGross
                  ) *
                  100
                : 0,

            averageGross,
          };

        }
      )
      .sort(
        (a, b) =>
          b.gross -
          a.gross
      );

  }, [
    boxOffice,
    movieLanguages,
    languages,
    movieYearMap,
    selectedYear,
  ]);

  // --------------------------------------------------
// Lead Actor Performance
// --------------------------------------------------

const actorPerformance =
  useMemo(() => {

    const actorMap: Record<
      number,
      {
        personName: string;
        movieIds: Set<number>;
        gross: number;
      }
    > = {};

    // Lead Role + Lead Actress
    const leadCreditTypes = new Set([
      1,
      
    ]);

    // --------------------------------------------------
    // Build movie -> lead people map
    // --------------------------------------------------

    const movieLeadPeopleMap: Record<
      number,
      Set<number>
    > = {};

    moviePeople.forEach(
      (moviePerson) => {

        if (
          moviePerson.credit_type_id ===
            null ||
          !leadCreditTypes.has(
            moviePerson.credit_type_id
          )
        ) {
          return;
        }

        if (
          !movieLeadPeopleMap[
            moviePerson.movie_id
          ]
        ) {
          movieLeadPeopleMap[
            moviePerson.movie_id
          ] = new Set<number>();
        }

        movieLeadPeopleMap[
          moviePerson.movie_id
        ].add(
          moviePerson.person_id
        );

      }
    );

    // --------------------------------------------------
    // Calculate actor performance
    // --------------------------------------------------

    boxOffice.forEach(
      (row) => {

        const movieId =
          Number(row.movie_id);

        // Apply selected year
        if (
          selectedYear !== "all" &&
          movieYearMap[movieId] !==
            selectedYear
        ) {
          return;
        }

        const leadPeople =
          movieLeadPeopleMap[
            movieId
          ];

        if (
          !leadPeople ||
          leadPeople.size === 0
        ) {
          return;
        }

        const movieGross =
          Number(
            row.gross_jmi || 0
          );

        leadPeople.forEach(
          (personId) => {

            const person =
              people.find(
                (item) =>
                  item.id ===
                  personId
              );

            if (!person) {
              return;
            }

            if (
              !actorMap[personId]
            ) {
              actorMap[personId] = {
                personName:
                  person.full_name,

                movieIds:
                  new Set<number>(),

                gross: 0,
              };
            }

            // Prevent duplicate movie
            // counting for the same actor
            if (
              actorMap[
                personId
              ].movieIds.has(
                movieId
              )
            ) {
              return;
            }

            actorMap[
              personId
            ].movieIds.add(
              movieId
            );

            actorMap[
              personId
            ].gross +=
              movieGross;

          }
        );

      }
    );

    // --------------------------------------------------
    // Final actor performance
    // --------------------------------------------------

    return Object.entries(
      actorMap
    )
      .map(
        ([personId, data]) => {

          const movies =
            data.movieIds.size;

          return {
            personId:
              Number(personId),

            personName:
              data.personName,

            movies,

            gross:
              data.gross,

            averageGross:
              movies > 0
                ? data.gross /
                  movies
                : 0,
          };

        }
      )
      .sort(
        (a, b) =>
          b.gross -
          a.gross
      );

  }, [
    boxOffice,
    moviePeople,
    people,
    movieYearMap,
    selectedYear,
  ]);

  // --------------------------------------------------
// Language-wise Top 10 Highest Grossers
// --------------------------------------------------

const languageWiseTopMovies =
  useMemo(() => {

    const languageMap: Record<
      string,
      MoviePerformance[]
    > = {};

    selectedMoviePerformance.forEach(
      (movie) => {

        const language =
          movieLanguageMap[
            movie.movieId
          ] || "Unknown";

        if (
          !languageMap[language]
        ) {
          languageMap[language] = [];
        }

        languageMap[language].push(
          movie
        );

      }
    );

    // Sort every language by gross
    Object.keys(
      languageMap
    ).forEach(
      (language) => {

        languageMap[language] =
          languageMap[
            language
          ]
            .sort(
              (a, b) =>
                b.gross -
                a.gross
            )
            .slice(0, 10);

      }
    );

    // Sort languages by the gross
    // of their highest-grossing movie
    return Object.entries(
      languageMap
    )
      .sort(
        ([, moviesA], [, moviesB]) =>
          (moviesB[0]?.gross || 0) -
          (moviesA[0]?.gross || 0)
      );

  }, [
    selectedMoviePerformance,
    movieLanguageMap,
  ]);

  


// --------------------------------------------------
// Genre Performance
// --------------------------------------------------

const genrePerformance =
  useMemo(() => {

    const genreMap: Record<
      number,
      {
        genreName: string;
        movieIds: Set<number>;
        gross: number;
      }
    > = {};

    // --------------------------------------------------
    // Build movie -> genres map
    // --------------------------------------------------

    const movieGenreMap: Record<
      number,
      number[]
    > = {};

    movieGenres.forEach(
      (movieGenre) => {

        if (
          !movieGenreMap[
            movieGenre.movie_id
          ]
        ) {
          movieGenreMap[
            movieGenre.movie_id
          ] = [];
        }

        movieGenreMap[
          movieGenre.movie_id
        ].push(
          movieGenre.genre_id
        );

      }
    );

    // --------------------------------------------------
    // Calculate genre performance
    // --------------------------------------------------

    boxOffice.forEach(
      (row) => {

        const movieId =
          Number(row.movie_id);

        // Apply selected year
        if (
          selectedYear !== "all" &&
          movieYearMap[movieId] !==
            selectedYear
        ) {
          return;
        }

        const movieGenreIds =
          movieGenreMap[movieId];

        if (
          !movieGenreIds ||
          movieGenreIds.length === 0
        ) {
          return;
        }

        const movieGross =
          Number(
            row.gross_jmi || 0
          );

        // Divide gross equally between
        // multiple genres
        const genreGross =
          movieGross /
          movieGenreIds.length;

        movieGenreIds.forEach(
          (genreId) => {

            const genre =
              genres.find(
                (item) =>
                  item.id ===
                  genreId
              );

            if (!genre) {
              return;
            }

            if (
              !genreMap[genreId]
            ) {
              genreMap[genreId] = {
                genreName:
                  genre.name,

                movieIds:
                  new Set<number>(),

                gross: 0,
              };
            }

            genreMap[
              genreId
            ].movieIds.add(
              movieId
            );

            genreMap[
              genreId
            ].gross +=
              genreGross;

          }
        );

      }
    );

    // --------------------------------------------------
    // Total genre gross
    // --------------------------------------------------

    const totalGenreGross =
      Object.values(
        genreMap
      ).reduce(
        (total, genre) =>
          total + genre.gross,
        0
      );

    // --------------------------------------------------
    // Final performance
    // --------------------------------------------------

    return Object.entries(
      genreMap
    )
      .map(
        ([genreId, data]) => {

          const movies =
            data.movieIds.size;

          const averageGross =
            movies > 0
              ? data.gross /
                movies
              : 0;

          return {
            genreId:
              Number(genreId),

            genreName:
              data.genreName,

            movies,

            gross:
              data.gross,

            marketShare:
              totalGenreGross > 0
                ? (
                    data.gross /
                    totalGenreGross
                  ) *
                  100
                : 0,

            averageGross,
          };

        }
      )
      .sort(
        (a, b) =>
          b.gross -
          a.gross
      );

  }, [
    boxOffice,
    movieGenres,
    genres,
    movieYearMap,
    selectedYear,
  ]);


  // --------------------------------------------------
  // All-Time Gross
  // --------------------------------------------------

  const allTimeGross =
    allTimeMoviePerformance.reduce(
      (total, movie) =>
        total + movie.gross,
      0
    );

  // --------------------------------------------------
  // Movies Tracked
  // --------------------------------------------------

  const moviesTracked =
    selectedMoviePerformance.length;

  // --------------------------------------------------
  // Average Gross
  // --------------------------------------------------

  const averageGross =
    moviesTracked > 0
      ? selectedGross /
        moviesTracked
      : 0;

  // --------------------------------------------------
  // Highest-Grossing Movie
  // --------------------------------------------------

  const highestGrossingMovie =
    selectedMoviePerformance
      .length > 0
      ? selectedMoviePerformance[0]
      : null;

  // --------------------------------------------------
  // Highest-Grossing Year
  // --------------------------------------------------

  const yearlyGross = useMemo(() => {
    const map: Record<
      number,
      number
    > = {};

    allTimeMoviePerformance.forEach(
      (movie) => {
        if (movie.year === null) {
          return;
        }

        map[movie.year] =
          (map[movie.year] || 0) +
          movie.gross;
      }
    );

    return map;
  }, [
    allTimeMoviePerformance,
  ]);

  // --------------------------------------------------
// Yearly Market Performance
// --------------------------------------------------

// --------------------------------------------------
// Yearly Market Performance + YoY Growth
// --------------------------------------------------

const yearlyMarketPerformance = useMemo(() => {
  const yearlyMap: Record<
    number,
    {
      year: number;
      movies: number;
      gross: number;
    }
  > = {};

  allTimeMoviePerformance.forEach((movie) => {
    if (movie.year === null) {
      return;
    }

    if (!yearlyMap[movie.year]) {
      yearlyMap[movie.year] = {
        year: movie.year,
        movies: 0,
        gross: 0,
      };
    }

    yearlyMap[movie.year].movies += 1;
    yearlyMap[movie.year].gross += movie.gross;
  });

  // Sort chronologically for YoY calculation
  const chronologicalYears =
    Object.values(yearlyMap).sort(
      (a, b) => a.year - b.year
    );

  let previousGross: number | null = null;

  const calculatedYears =
    chronologicalYears.map((item) => {
      let growth: number | null = null;

      if (
        previousGross !== null &&
        previousGross > 0
      ) {
        growth =
          ((item.gross - previousGross) /
            previousGross) *
          100;
      }

      previousGross = item.gross;

      return {
        ...item,
        averageGross:
          item.movies > 0
            ? item.gross / item.movies
            : 0,
        growth,
      };
    });

  // Display highest-grossing years first
  return calculatedYears.sort(
    (a, b) => b.gross - a.gross
  );
}, [allTimeMoviePerformance]);

// --------------------------------------------------
// JMI Automated Insights
// --------------------------------------------------

type JMIInsight = {
  type:
    | "market"
    | "movie"
    | "language"
    | "genre"
    | "year"
    | "trend";
  title: string;
  description: string;
  value?: string;
};

const jmiInsights = useMemo<JMIInsight[]>(() => {

  const insights: JMIInsight[] = [];

  // --------------------------------------------------
  // Safety check
  // --------------------------------------------------

  if (!market) {
    return insights;
  }

  // --------------------------------------------------
  // 1. Market Performance
  // --------------------------------------------------

  if (selectedGross > 0) {

    insights.push({
      type: "market",

      title: "Market Performance",

      description:
        selectedYear === "all"
          ? `The ${market.name} theatrical market has recorded ${formatGross(
              selectedGross
            )} in total tracked gross across ${moviesTracked} movies.`
          : `The ${market.name} theatrical market recorded ${formatGross(
              selectedGross
            )} during ${selectedYear} across ${moviesTracked} tracked movies.`,

      value: formatGross(selectedGross),
    });

  }

  // --------------------------------------------------
  // 2. Highest-Grossing Movie
  // --------------------------------------------------

  if (highestGrossingMovie) {

    insights.push({
      type: "movie",

      title: "Top Movie",

      description:
        `${highestGrossingMovie.title} is the highest-grossing movie ` +
        `in the ${market.name} market${
          selectedYear === "all"
            ? ""
            : ` during ${selectedYear}`
        }, with a recorded market gross of ${formatGross(
          highestGrossingMovie.gross
        )}.`,

      value:
        highestGrossingMovie.title,
    });

  }

  // --------------------------------------------------
  // 3. Language Leader
  // --------------------------------------------------

  if (
    languagePerformance.length > 0
  ) {

    const topLanguage =
      languagePerformance[0];

    insights.push({
      type: "language",

      title: "Language Leader",

      description:
        `${topLanguage.languageName} is currently the leading language ` +
        `in the ${market.name} market, contributing ${formatGross(
          topLanguage.gross
        )} with a ${topLanguage.marketShare.toFixed(
          2
        )}% market share.`,

      value:
        topLanguage.languageName,
    });

  }

  // --------------------------------------------------
  // 4. Genre Leader
  // --------------------------------------------------

  if (
    genrePerformance.length > 0
  ) {

    const topGenre =
      genrePerformance[0];

    insights.push({
      type: "genre",

      title: "Genre Leader",

      description:
        `${topGenre.genreName} is the highest-grossing genre ` +
        `in the ${market.name} market, generating ${formatGross(
          topGenre.gross
        )} from ${topGenre.movies} tracked movies.`,

      value:
        topGenre.genreName,
    });

  }

  // --------------------------------------------------
  // 5. Peak Market Year
  // --------------------------------------------------

  if (
    yearlyMarketPerformance.length > 0
  ) {

    const topYear =
      [...yearlyMarketPerformance].sort(
        (a, b) =>
          b.gross - a.gross
      )[0];

    if (topYear) {

      insights.push({
        type: "year",

        title: "Peak Market Year",

        description:
          `${topYear.year} is currently the strongest year in the ` +
          `${market.name} market based on recorded gross, with ` +
          `${formatGross(topYear.gross)} generated across ` +
          `${topYear.movies} movies.,`

        ,value:
          String(topYear.year),
      });

    }

  }

  // --------------------------------------------------
  // 6. Latest Market Trend
  // --------------------------------------------------

  if (
    yearlyMarketPerformance.length > 1
  ) {

    const chronologicalYears =
      [...yearlyMarketPerformance].sort(
        (a, b) =>
          a.year - b.year
      );

    const latestYear =
      chronologicalYears[
        chronologicalYears.length - 1
      ];

    if (
      latestYear &&
      latestYear.growth !== null
    ) {

      const growth =
        latestYear.growth;

      const growthText =
        growth >= 0
          ? `grew by ${growth.toFixed(2)}%`
          : `declined by ${Math.abs(
              growth
            ).toFixed(2)}%`;

      insights.push({
        type: "trend",

        title: "Latest Market Trend",

        description:
          `The ${market.name} market ${growthText} in ` +
          `${latestYear.year} compared with the previous recorded year.,`

        ,value:
          `${
            growth >= 0
              ? "+"
              : ""
          }${growth.toFixed(2)}%`,
      });

    }

  }

  // --------------------------------------------------
  // 7. Average Movie Performance
  // --------------------------------------------------

  if (
    moviesTracked > 0 &&
    averageGross > 0
  ) {

    insights.push({
      type: "movie",

      title: "Average Movie Performance",

      description:
        `The average tracked movie generated ${formatGross(
          averageGross
        )} in the ${market.name} theatrical market${
          selectedYear === "all"
            ? ""
            : ` during ${selectedYear}`
        }.`,

      value:
        formatGross(averageGross),
    });

  }

  return insights;

}, [
  market,
  selectedYear,
  selectedGross,
  moviesTracked,
  highestGrossingMovie,
  languagePerformance,
  genrePerformance,
  yearlyMarketPerformance,
  averageGross,
]);
 

  const highestGrossingYear =
    Object.entries(
      yearlyGross
    ).sort(
      (a, b) =>
        Number(b[1]) -
        Number(a[1])
    )[0] || null;

  // --------------------------------------------------
  // Format Gross
  // --------------------------------------------------

  function formatGross(
    value: number
  ) {
    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  }

  // --------------------------------------------------
  // Invalid Market
  // --------------------------------------------------

  if (!market) {
    return (
      <div className="p-8">

        <h1 className="text-2xl font-bold text-red-500">
          Market Not Found
        </h1>

        <p className="mt-2 text-zinc-400">
          The requested market does not
          exist.
        </p>

        <button
          onClick={() =>
            router.push(
              "/admin/market-intelligence"
            )
          }
          className="mt-6 rounded-lg border border-zinc-600 px-4 py-2 text-sm transition hover:border-yellow-500 hover:text-yellow-400"
        >
          Back to Market Intelligence
        </button>

      </div>
    );
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="p-8">

        <p className="mb-2 text-sm text-zinc-500">
          JMI • Market Intelligence
        </p>

        <h1 className="text-3xl font-bold">
          Loading {market.name} Market Intelligence...
        </h1>

        <p className="mt-3 text-zinc-400">
          Analysing theatrical performance
          across the {market.name} market.
        </p>

      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="p-8">

        <h1 className="text-2xl font-bold text-red-500">
          Market Intelligence Error
        </h1>

        <p className="mt-2 text-zinc-400">
          {error}
        </p>

      </div>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="p-8">

      {/* ---------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------- */}

      <div className="mb-8">

        <button
          onClick={() =>
            router.push(
              "/admin/market-intelligence"
            )
          }
          className="mb-5 text-sm text-zinc-500 transition hover:text-yellow-400"
        >
          ← Back to Market Intelligence
        </button>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="mb-2 text-sm text-zinc-500">
              JMI • Market Intelligence •{" "}
              {market.name}
            </p>

            <h1 className="text-3xl font-bold">
              {market.name} Market Intelligence
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              {market.description}
            </p>

          </div>

          {/* Year Selector */}

          <div className="flex items-center gap-3">

            <label
              htmlFor="market-year"
              className="text-sm font-medium text-zinc-400"
            >
              Year
            </label>

            <select
              id="market-year"
              value={selectedYear}
              onChange={(e) => {
                const value =
                  e.target.value;

                setSelectedYear(
                  value === "all"
                    ? "all"
                    : Number(value)
                );
              }}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white outline-none transition focus:border-yellow-500"
            >

              <option value="all">
                All
              </option>

              {availableYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

      </div>

      {/* ---------------------------------------------- */}
      {/* Market Overview */}
      {/* ---------------------------------------------- */}

      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Market Overview
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          {selectedYear === "all"
            ? "Complete historical theatrical performance."
            : `Theatrical performance during ${selectedYear}.`}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Movies */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              Movies Tracked
            </p>

            <p className="mt-2 text-2xl font-bold">
              {moviesTracked}
            </p>

          </div>

          {/* Selected Gross */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              {selectedYear === "all"
                ? "All-Time Gross"
                : `${selectedYear} Gross`
              }</p>

            <p className="mt-2 text-2xl font-bold">
              {formatGross(
                selectedGross
              )}
            </p>

          </div>

          {/* Average */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              Average Gross / Movie
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatGross(
                averageGross
              )}
            </p>

          </div>

          {/* All Time */}

          <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-5">

            <p className="text-sm text-zinc-400">
              Combined All-Time Gross
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {formatGross(
                allTimeGross
              )}
            </p>

          </div>

        </div>

      </div>

      {/* ---------------------------------------------- */}
      {/* Market Highlights */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Market Highlights
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Key performance indicators for{" "}
          {selectedYear === "all"
            ? "the complete historical period"
            : selectedYear}.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {/* Highest Movie */}

          <div
            className="cursor-pointer rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-5 transition hover:bg-yellow-500/10"
            onClick={() => {
              if (
                highestGrossingMovie
              ) {
                router.push(
                  `/admin/movies/${highestGrossingMovie.movieId}`
                );
              }
            }}
          >

            <p className="text-sm text-zinc-400">
              🏆 Highest-Grossing Movie
            </p>

            {highestGrossingMovie ? (
              <>

                <p className="mt-2 text-2xl font-bold text-yellow-400">
                  {
                    highestGrossingMovie.title
                  }
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  {highestGrossingMovie.year ||
                    "Year unavailable"}
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {formatGross(
                    highestGrossingMovie.gross
                  )}
                </p>

              </>
            ) : (
              <p className="mt-3 text-zinc-500">
                No movie data available.
              </p>
            )}

          </div>

          {/* Highest Year */}

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              📈 Highest-Grossing Year
            </p>

            {highestGrossingYear ? (
              <>

                <p className="mt-2 text-2xl font-bold">
                  {highestGrossingYear[0]}
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  Market Gross
                </p>

                <p className="text-lg font-semibold">
                  {formatGross(
                    Number(
                      highestGrossingYear[1]
                    )
                  )}
                </p>

              </>
            ) : (
              <p className="mt-3 text-zinc-500">
                No yearly data available.
              </p>
            )}

          </div>

        </div>

      </div>

     {/* ---------------------------------------------- */}
{/* Top 20 Movies of All Time */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <div>

    <h2 className="text-xl font-semibold">
      Top 20 Movies of All Time
    </h2>

    <p className="mt-2 text-sm text-zinc-400">
      Highest-grossing movies ever recorded in
      the {market.name} theatrical market.
    </p>

  </div>

  {allTimeMoviePerformance.length === 0 ? (

    <p className="mt-6 text-zinc-500">
      No movie data available for this market.
    </p>

  ) : (

    <div className="mt-6 overflow-x-auto">

      <table className="w-full min-w-[850px]">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Rank
            </th>

            <th className="p-4 text-left">
              Movie
            </th>

            <th className="p-4 text-left">
              Year
            </th>

            <th className="p-4 text-left">
              Language
            </th>

            <th className="p-4 text-left">
              Market Gross
            </th>

          </tr>

        </thead>

        <tbody>

          {allTimeMoviePerformance
            .slice(0, 20)
            .map(
              (
                movie,
                index
              ) => (

                <tr
                  key={
                    movie.movieId
                  }
                  className="cursor-pointer border-t border-zinc-700 transition hover:bg-zinc-800/60"
                  onClick={() =>
                    router.push(
                      `/admin/movies/${movie.movieId}`
                    )
                  }
                >

                  {/* Rank */}

                  <td className="p-4 font-semibold">

                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : `#${index + 1}`

                    }</td>

                  {/* Movie */}

                  <td className="p-4">

                    <p className="font-semibold">
                      {movie.title}
                    </p>

                  </td>

                  {/* Year */}

                  <td className="p-4 text-zinc-400">

                    {movie.year ||
                      "—"}

                  </td>

                  {/* Language */}

                  <td className="p-4">

                    {movieLanguageMap[
                      movie.movieId
                    ] || "Unknown"}

                  </td>

                  {/* Gross */}

                  <td className="p-4 font-semibold text-yellow-400">

                    {formatGross(
                      movie.gross
                    )}

                  </td>

                </tr>

              )
            )}

        </tbody>

      </table>

    </div>

  )}

</div>

{/* ---------------------------------------------- */}
{/* Language Performance */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <div>

    <h2 className="text-xl font-semibold">
      Language Performance
    </h2>

    <p className="mt-2 text-sm text-zinc-400">
      Performance of movie languages in the{" "}
      {market.name} theatrical market.
      {selectedYear === "all"
        ? " Showing all-time performance."
        : ` Showing performance for ${selectedYear}.`}
    </p>

  </div>

  {languagePerformance.length === 0 ? (

    <p className="mt-6 text-zinc-500">
      No language performance data available.
    </p>

  ) : (

    <div className="mt-6 overflow-x-auto">

      <table className="w-full min-w-[850px]">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Rank
            </th>

            <th className="p-4 text-left">
              Language
            </th>

            <th className="p-4 text-left">
              Movies
            </th>

            <th className="p-4 text-left">
              Market Gross
            </th>

            <th className="p-4 text-left">
              Market Share
            </th>

            <th className="p-4 text-left">
              Avg. Gross / Movie
            </th>

            <th className="p-4 text-left">
  YoY Growth
</th>

          </tr>

        </thead>

        <tbody>

          {languagePerformance.map(
            (
              language,
              index
            ) => (

              <tr
                key={
                  language.languageId
                }
                className="border-t border-zinc-700"
              >

                {/* Rank */}

                <td className="p-4 font-semibold">

                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `#${index + 1}}`

                  } </td>

                {/* Language */}

                <td className="p-4 font-semibold">

                  {
                    language.languageName
                  }

                </td>

                {/* Movies */}

                <td className="p-4">

                  {language.movies}

                </td>

                {/* Gross */}

                <td className="p-4 font-semibold text-yellow-400">

                  {formatGross(
                    language.gross
                  )}

                </td>

                {/* Share */}

                <td className="p-4">

                  {language.marketShare.toFixed(
                    2
                  )}
                  %

                </td>

                {/* Average */}

                <td className="p-4">

                  {formatGross(
                    language.averageGross
                  )}

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  )}

</div>

{/* ---------------------------------------------- */}
{/* Yearly Market Performance */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <h2 className="text-xl font-semibold">
    Yearly Market Performance
  </h2>

  <p className="mt-2 text-sm text-zinc-400">
    Historical year-wise performance of the{" "}
    {market.name} theatrical market.
  </p>

  {yearlyMarketPerformance.length === 0 ? (

    <p className="mt-6 text-zinc-500">
      No yearly market data available.
    </p>

  ) : (

    <div className="mt-6 overflow-x-auto">

      <table className="w-full min-w-[700px]">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Rank
            </th>

            <th className="p-4 text-left">
              Year
            </th>

            <th className="p-4 text-left">
              Movies
            </th>

            <th className="p-4 text-left">
              Market Gross
            </th>

            <th className="p-4 text-left">
              Avg. Gross / Movie
            </th>

          </tr>

        </thead>

        <tbody>

          {yearlyMarketPerformance.map(
            (yearData, index) => (

              <tr
                key={yearData.year}
                className={`border-t border-zinc-700 transition hover:bg-zinc-800/60 ${
                  selectedYear === yearData.year
                    ? "bg-yellow-500/5"
                    : ""
                }`}
              >

                {/* Rank */}

                <td className="p-4 font-semibold">
                  #{index + 1}
                </td>

                {/* Year */}

                <td className="p-4">

                  <span className="font-semibold">
                    {yearData.year}
                  </span>

                  {selectedYear ===
                    yearData.year && (
                    <span className="ml-2 rounded-full border border-yellow-600/40 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
                      Selected
                    </span>
                  )}

                </td>

                {/* Movies */}

                <td className="p-4">
                  {yearData.movies}
                </td>

                {/* Gross */}

                <td className="p-4 font-semibold text-yellow-400">
                  {formatGross(
                    yearData.gross
                  )}
                </td>

                {/* Average */}

                <td className="p-4">
                  {formatGross(
                    yearData.averageGross
                  )}
                </td>

                <td className="p-4 font-semibold">
  {yearData.growth === null ? (
    <span className="text-zinc-500">
      —
    </span>
  ) : (
    <span
      className={
        yearData.growth >= 0
          ? "text-green-400"
          : "text-red-400"
      }
    >
      {yearData.growth >= 0
        ? "+"
        : ""}
      {yearData.growth.toFixed(2)}
      %
    </span>
  )}
</td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  )}

</div>

{/* ---------------------------------------------- */}
{/* Top 10 Genres */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <div>

    <h2 className="text-xl font-semibold">
      Top 10 Genres
    </h2>

    <p className="mt-2 text-sm text-zinc-400">
      Highest-performing movie genres in the{" "}
      {market.name} theatrical market.
      {selectedYear === "all"
        ? " Showing all-time performance."
        : ` Showing performance for ${selectedYear}.`}
    </p>

  </div>

  {genrePerformance.length === 0 ? (

    <p className="mt-6 text-zinc-500">
      No genre performance data available.
    </p>

  ) : (

    <div className="mt-6 overflow-x-auto">

      <table className="w-full min-w-[850px]">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Rank
            </th>

            <th className="p-4 text-left">
              Genre
            </th>

            <th className="p-4 text-left">
              Movies
            </th>

            <th className="p-4 text-left">
              Market Gross
            </th>

            <th className="p-4 text-left">
              Market Share
            </th>

            <th className="p-4 text-left">
              Avg. Gross / Movie
            </th>

          </tr>

        </thead>

        <tbody>

          {genrePerformance
            .slice(0, 10)
            .map(
              (
                genre,
                index
              ) => (

                <tr
                  key={
                    genre.genreId
                  }
                  className="border-t border-zinc-700 transition hover:bg-zinc-800/60"
                >

                  {/* Rank */}

                  <td className="p-4 font-semibold">

                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : `#${index + 1}}`

                     } </td>

                  {/* Genre */}

                  <td className="p-4 font-semibold">

                    {genre.genreName}

                  </td>

                  {/* Movies */}

                  <td className="p-4">

                    {genre.movies}

                  </td>

                  {/* Gross */}

                  <td className="p-4 font-semibold text-yellow-400">

                    {formatGross(
                      genre.gross
                    )}

                  </td>

                  {/* Share */}

                  <td className="p-4">

                    {genre.marketShare.toFixed(
                      2
                    )}
                    %

                  </td>

                  {/* Average */}

                  <td className="p-4">

                    {formatGross(
                      genre.averageGross
                    )}

                  </td>

                </tr>

              )
            )}

        </tbody>

      </table>

    </div>

  )}

</div>

{/* ---------------------------------------------- */}
{/* Top 10 Lead Actors */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <div>

    <h2 className="text-xl font-semibold">
      Top 10 Lead Actors
    </h2>

    <p className="mt-2 text-sm text-zinc-400">
      Highest-performing lead actors based on
      theatrical market gross in the{" "}
      {market.name} market.
      {selectedYear === "all"
        ? " Showing all-time performance."
        : ` Showing performance for ${selectedYear}.`}
    </p>

  </div>

  {actorPerformance.length === 0 ? (

    <p className="mt-6 text-zinc-500">
      No lead actor performance data available.
    </p>

  ) : (

    <div className="mt-6 overflow-x-auto">

      <table className="w-full min-w-[750px]">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Rank
            </th>

            <th className="p-4 text-left">
              Actor
            </th>

            <th className="p-4 text-left">
              Lead Movies
            </th>

            <th className="p-4 text-left">
              Market Gross
            </th>

            <th className="p-4 text-left">
              Avg. Gross / Movie
            </th>

          </tr>

        </thead>

        <tbody>

          {actorPerformance
            .slice(0, 10)
            .map(
              (
                actor,
                index
              ) => (

                <tr
                  key={
                    actor.personId
                  }
                  className="border-t border-zinc-700 transition hover:bg-zinc-800/60"
                >

                  {/* Rank */}

                  <td className="p-4 font-semibold">

                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : `#${index + 1}`

                    }</td>

                  {/* Actor */}

                  <td className="p-4 font-semibold">

                    {actor.personName}

                  </td>

                  {/* Movies */}

                  <td className="p-4">

                    {actor.movies}

                  </td>

                  {/* Gross */}

                  <td className="p-4 font-semibold text-yellow-400">

                    {formatGross(
                      actor.gross
                    )}

                  </td>

                  {/* Average */}

                  <td className="p-4">

                    {formatGross(
                      actor.averageGross
                    )}

                  </td>

                </tr>

              )
            )}

        </tbody>

      </table>

    </div>

  )}

</div>

{/* ---------------------------------------------- */}
{/* Language-wise Top 10 Highest Grossers */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <div>

    <h2 className="text-xl font-semibold">
      Language-wise Top 10 Highest Grossers
    </h2>

    <p className="mt-2 text-sm text-zinc-400">
      Highest-grossing movies from each language
      in the {market.name} theatrical market.
      {selectedYear === "all"
        ? " Showing all-time performance."
        : ` Showing performance for ${selectedYear}.`}
    </p>

  </div>

  {languageWiseTopMovies.length === 0 ? (

    <p className="mt-6 text-zinc-500">
      No language-wise movie performance data available.
    </p>

  ) : (

    <div className="mt-6 space-y-8">

      {languageWiseTopMovies.map(
        (
          [language, movies],
          languageIndex
        ) => (

          <div
            key={language}
          >

            {/* Language Header */}

            <div className="mb-3 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold">

                  {language}

                </h3>

                <p className="mt-1 text-xs text-zinc-500">

                  Top {movies.length}{" "}
                  highest-grossing movies

                </p>

              </div>

              {movies.length > 0 && (

                <p className="text-sm font-semibold text-yellow-400">

                  {formatGross(
                    movies[0].gross
                  )}

                </p>

              )}

            </div>

            {/* Movies Table */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead className="bg-zinc-800">

                  <tr>

                    <th className="p-4 text-left">
                      Rank
                    </th>

                    <th className="p-4 text-left">
                      Movie
                    </th>

                    <th className="p-4 text-left">
                      Year
                    </th>

                    <th className="p-4 text-left">
                      Market Gross
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {movies.map(
                    (
                      movie,
                      index
                    ) => (

                      <tr
                        key={
                          movie.movieId
                        }
                        className="cursor-pointer border-t border-zinc-700 transition hover:bg-zinc-800/60"
                        onClick={() =>
                          router.push(
                            `/admin/movies/${movie.movieId}`
                          )
                        }
                      >

                        {/* Rank */}

                        <td className="p-4 font-semibold">

                          {index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : `#${index + 1}`

                          }</td>

                        {/* Movie */}

                        <td className="p-4">

                          <p className="font-semibold">

                            {movie.title}

                          </p>

                        </td>

                        {/* Year */}

                        <td className="p-4 text-zinc-400">

                          {movie.year ||
                            "—"}

                        </td>

                        {/* Gross */}

                        <td className="p-4 font-semibold text-yellow-400">

                          {formatGross(
                            movie.gross
                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )
      )}

    </div>

  )}

</div>

{/* ---------------------------------------------- */}
{/* JMI Automated Insights */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-yellow-600/40 bg-yellow-500/[0.03] p-6">

  {/* Header */}

  <div className="flex items-start gap-4">

    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-600/40 bg-yellow-500/10 text-xl">
      🧠
    </div>

    <div>

      <h2 className="text-xl font-semibold">
        JMI Automated Insights
      </h2>

      <p className="mt-1 text-sm text-zinc-400">
        Automated market intelligence generated from
        JMI's recorded theatrical performance data.
      </p>

    </div>

  </div>

  {/* Insights */}

  {jmiInsights.length === 0 ? (

    <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-950 p-5">

      <p className="text-sm text-zinc-500">
        Not enough market data available to generate
        automated insights.
      </p>

    </div>

  ) : (

    <div className="mt-6 grid gap-4 md:grid-cols-2">

      {jmiInsights.map(
        (insight, index) => (

          <div
            key={`${insight.title}-${index}`}
            className="rounded-xl border border-zinc-700 bg-zinc-950 p-5 transition hover:border-yellow-600/40"
          >

            {/* Insight title */}

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-2">

                <span className="text-lg">

                  {insight.type === "market"
                    ? "📊"
                    : insight.type === "movie"
                    ? "🎬"
                    : insight.type === "language"
                    ? "🌐"
                    : insight.type === "genre"
                    ? "🎭"
                    : insight.type === "year"
                    ? "📅"
                    : "📈"}

                </span>

                <p className="text-sm font-semibold text-zinc-200">

                  {insight.title}

                </p>

              </div>

              {insight.value && (

                <span className="shrink-0 rounded-full border border-yellow-600/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">

                  {insight.value}

                </span>

              )}

            </div>

            {/* Insight description */}

            <p className="mt-4 text-sm leading-6 text-zinc-300">

              {insight.description}

            </p>

          </div>

        )
      )}

    </div>

  )}

</div>

    </div>
  );
}