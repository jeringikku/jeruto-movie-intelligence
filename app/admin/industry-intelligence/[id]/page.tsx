"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Industry = {
  id: number;
  name: string;
  native_name: string | null;
  short_name: string | null;
  description: string | null;
};

type Intelligence = {
  totalMovies: number;
  indiaGross: number;
  overseasGross: number;
  worldwideGross: number;
};

type ContributingActor = {
  personId: number;
  name: string;
  movies: number;
  indiaGross: number;
  overseasGross: number;
  worldwideGross: number;
};

type YearlyIntelligence = {
  year: number;
  movies: number;
  indiaGross: number;
  overseasGross: number;
  worldwideGross: number;
};

type MonthlyIntelligence = {
  year: number;
  month: number;
  monthName: string;
  movies: number;
  indiaGross: number;
  overseasGross: number;
  worldwideGross: number;
};

type TopMovie = {
  movieId: number;
  title: string;
  year: number | null;
  indiaGross: number;
  overseasGross: number;
  worldwideGross: number;
};

type YearlyTopMovies = {
  year: number;
  movies: TopMovie[];
};

type YearlyGrowth = {
  year: number;
  worldwideGross: number;
  previousYearGross: number | null;
  growthPercentage: number | null;
};

type IndustryRecords = {
  highestGrossingYear: number | null;
  highestGrossingYearAmount: number;
  mostProductiveYear: number | null;
  mostProductiveYearMovies: number;
};

type MarketContribution = {
  indiaPercentage: number;
  overseasPercentage: number;
};

type MarketIntelligence = {
  id: number;
  name: string;
  gross: number;
  movies: number;
};

type PerformanceMetrics = {
  averageWorldwideGross: number;
  averageIndiaGross: number;
  averageOverseasGross: number;
  highestWorldwideMovie: string | null;
  highestWorldwideGross: number;
  movies100CrPlus: number;
  movies50CrPlus: number;
  movies10CrPlus: number;
};

export default function IndustryIntelligencePage() {
  const params = useParams();
  const industryId = Number(params.id);

  const [industry, setIndustry] =
    useState<Industry | null>(null);

  const [intelligence, setIntelligence] =
    useState<Intelligence | null>(null);

    const [topContributingActors, setTopContributingActors] =
  useState<ContributingActor[]>([]);

  const [yearlyIntelligence, setYearlyIntelligence] =
    useState<YearlyIntelligence[]>([]);

  const [monthlyIntelligence, setMonthlyIntelligence] =
    useState<MonthlyIntelligence[]>([]);

  const [topMovies, setTopMovies] =
    useState<TopMovie[]>([]);

  const [yearlyTopMovies, setYearlyTopMovies] =
    useState<YearlyTopMovies[]>([]);

    const [yearlyGrowth, setYearlyGrowth] =
  useState<YearlyGrowth[]>([]);

  const [industryRecords, setIndustryRecords] =
  useState<IndustryRecords | null>(null);

  const [marketContribution, setMarketContribution] =
  useState<MarketContribution | null>(null);

  const [topDomesticMarkets, setTopDomesticMarkets] =
    useState<MarketIntelligence[]>([]);

  const [topOverseasMarkets, setTopOverseasMarkets] =
    useState<MarketIntelligence[]>([]);

    const [performanceMetrics, setPerformanceMetrics] =
  useState<PerformanceMetrics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!industryId) return;

    loadIndustryIntelligence();
  }, [industryId]);

  async function loadIndustryIntelligence() {
    setLoading(true);
    setError("");

    // --------------------------------------------------
    // 1. Load industry information
    // --------------------------------------------------

    const { data: industryData, error: industryError } =
      await supabase
        .from("industries")
        .select(`
          id,
          name,
          native_name,
          short_name,
          description
        `)
        .eq("id", industryId)
        .single();

    if (industryError) {
      console.error(industryError);
      setError(industryError.message);
      setLoading(false);
      return;
    }

    setIndustry(industryData);

    // --------------------------------------------------
    // 2. Find all movies associated with this industry
    // --------------------------------------------------

    const {
      data: industryMovies,
      error: industryMoviesError,
    } = await supabase
      .from("movie_industries")
      .select("movie_id")
      .eq("industry_id", industryId);

    if (industryMoviesError) {
      console.error(industryMoviesError);
      setError(industryMoviesError.message);
      setLoading(false);
      return;
    }

    const movieIds =
      industryMovies?.map((movie) => movie.movie_id) || [];

    // --------------------------------------------------
    // No movies
    // --------------------------------------------------

    if (movieIds.length === 0) {
      setIntelligence({
        totalMovies: 0,
        indiaGross: 0,
        overseasGross: 0,
        worldwideGross: 0,
      });

      setYearlyIntelligence([]);
      setMonthlyIntelligence([]);
      setTopMovies([]);
      setYearlyTopMovies([]);
      setTopDomesticMarkets([]);
      setTopOverseasMarkets([]);

      setPerformanceMetrics({
  averageWorldwideGross: 0,
  averageIndiaGross: 0,
  averageOverseasGross: 0,
  highestWorldwideMovie: null,
  highestWorldwideGross: 0,
  movies100CrPlus: 0,
  movies50CrPlus: 0,
  movies10CrPlus: 0,
});

      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 3. Load movie information
    // --------------------------------------------------

    const { data: movies, error: moviesError } =
      await supabase
        .from("movies")
        .select(`
          id,
          title,
          release_date
        `)
        .in("id", movieIds);

    if (moviesError) {
      console.error(moviesError);
      setError(moviesError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 4. India Box Office
    // --------------------------------------------------

    const {
      data: stateBoxOffice,
      error: stateError,
    } = await supabase
      .from("movie_state_box_office")
      .select(`
        movie_id,
        state_id,
        coverage_type,
        gross_jmi
      `)
      .in("movie_id", movieIds);

    if (stateError) {
      console.error(stateError);
      setError(stateError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 5. Overseas Box Office
    // --------------------------------------------------

    const {
  data: overseasBoxOffice,
  error: overseasError,
} = await supabase
  .from("movie_overseas_box_office")
  .select(`
    movie_id,
    gross_inr
  `)
  .in("movie_id", movieIds);

    if (overseasError) {
      console.error(overseasError);
      setError(overseasError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
// 5B. Country-level Overseas Box Office
// --------------------------------------------------

const {
  data: countryBoxOffice,
  error: countryBoxOfficeError,
} = await supabase
  .from("movie_country_box_office")
  .select(`
    movie_id,
    country_id,
    gross_usd
  `)
  .in("movie_id", movieIds);

if (countryBoxOfficeError) {
  console.error(countryBoxOfficeError);
  setError(countryBoxOfficeError.message);
  setLoading(false);
  return;
}

    // --------------------------------------------------
    // 6. Overall India Gross
    // --------------------------------------------------

    const indiaGross =
      stateBoxOffice?.reduce((total, row) => {
        return total + Number(row.gross_jmi || 0);
      }, 0) || 0;

    // --------------------------------------------------
    // 7. Overall Overseas Gross
    // --------------------------------------------------

    const overseasGross =
      overseasBoxOffice?.reduce((total, row) => {
        return total + Number(row.gross_inr || 0);
      }, 0) || 0;

    // --------------------------------------------------
    // 8. Overall Worldwide Gross
    // --------------------------------------------------

    const worldwideGross = indiaGross + overseasGross;

    setIntelligence({
      totalMovies: movieIds.length,
      indiaGross,
      overseasGross,
      worldwideGross,
    });

    // --------------------------------------------------
    // 9. Year-wise calculations
    // --------------------------------------------------

    const yearlyMap: Record<
      number,
      {
        movieIds: Set<number>;
        indiaGross: number;
        overseasGross: number;
      }
    > = {};

    movies?.forEach((movie) => {
      if (!movie.release_date) return;

      const year = Number(
        String(movie.release_date).substring(0, 4)
      );

      if (!yearlyMap[year]) {
        yearlyMap[year] = {
          movieIds: new Set<number>(),
          indiaGross: 0,
          overseasGross: 0,
        };
      }

      yearlyMap[year].movieIds.add(movie.id);
    });

    stateBoxOffice?.forEach((row) => {
      const movie = movies?.find(
        (movie) => movie.id === row.movie_id
      );

      if (!movie?.release_date) return;

      const year = Number(
        String(movie.release_date).substring(0, 4)
      );

      if (!yearlyMap[year]) return;

      yearlyMap[year].indiaGross += Number(
        row.gross_jmi || 0
      );
    });

    overseasBoxOffice?.forEach((row) => {
      const movie = movies?.find(
        (movie) => movie.id === row.movie_id
      );

      if (!movie?.release_date) return;

      const year = Number(
        String(movie.release_date).substring(0, 4)
      );

      if (!yearlyMap[year]) return;

      yearlyMap[year].overseasGross += Number(
        row.gross_inr || 0
      );
    });

    const yearlyData: YearlyIntelligence[] =
      Object.entries(yearlyMap)
        .map(([year, data]) => ({
          year: Number(year),
          movies: data.movieIds.size,
          indiaGross: data.indiaGross,
          overseasGross: data.overseasGross,
          worldwideGross:
            data.indiaGross + data.overseasGross,
        }))
        .sort((a, b) => b.year - a.year);

    setYearlyIntelligence(yearlyData);

    // --------------------------------------------------
// Year-over-Year Industry Growth
// --------------------------------------------------

const growthData: YearlyGrowth[] = yearlyData.map(
  (currentYear, index) => {

    const previousYear =
      yearlyData.find(
        (yearData) =>
          yearData.year === currentYear.year - 1
      );

    if (!previousYear) {
      return {
        year: currentYear.year,
        worldwideGross: currentYear.worldwideGross,
        previousYearGross: null,
        growthPercentage: null,
      };
    }

    const growthPercentage =
      previousYear.worldwideGross === 0
        ? null
        : (
            ((currentYear.worldwideGross -
              previousYear.worldwideGross) /
              previousYear.worldwideGross) *
            100
          );

    return {
      year: currentYear.year,
      worldwideGross: currentYear.worldwideGross,
      previousYearGross:
        previousYear.worldwideGross,
      growthPercentage,
    };
  }
);

setYearlyGrowth(growthData);

// --------------------------------------------------
// Industry Records
// --------------------------------------------------

const highestGrossingYear =
  yearlyData.length > 0
    ? yearlyData.reduce((highest, current) =>
        current.worldwideGross > highest.worldwideGross
          ? current
          : highest
      )
    : null;

const mostProductiveYear =
  yearlyData.length > 0
    ? yearlyData.reduce((highest, current) =>
        current.movies > highest.movies
          ? current
          : highest
      )
    : null;

setIndustryRecords({
  highestGrossingYear:
    highestGrossingYear?.year ?? null,

  highestGrossingYearAmount:
    highestGrossingYear?.worldwideGross ?? 0,

  mostProductiveYear:
    mostProductiveYear?.year ?? null,

  mostProductiveYearMovies:
    mostProductiveYear?.movies ?? 0,
});



    // --------------------------------------------------
    // 10. Month-wise calculations
    // --------------------------------------------------

    const monthlyMap: Record<
      string,
      {
        year: number;
        month: number;
        movieIds: Set<number>;
        indiaGross: number;
        overseasGross: number;
      }
    > = {};

    movies?.forEach((movie) => {
      if (!movie.release_date) return;

      const dateString = String(movie.release_date);

      const year = Number(dateString.substring(0, 4));
      const month = Number(dateString.substring(5, 7));

      if (!year || !month) return;

      const key = `${year}-${String(month).padStart(2, "0")}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          year,
          month,
          movieIds: new Set<number>(),
          indiaGross: 0,
          overseasGross: 0,
        };
      }

      monthlyMap[key].movieIds.add(movie.id);
    });

    stateBoxOffice?.forEach((row) => {
      const movie = movies?.find(
        (movie) => movie.id === row.movie_id
      );

      if (!movie?.release_date) return;

      const dateString = String(movie.release_date);

      const year = Number(dateString.substring(0, 4));
      const month = Number(dateString.substring(5, 7));

      if (!year || !month) return;

      const key = `${year}-${String(month).padStart(2, "0")}`;

      if (!monthlyMap[key]) return;

      monthlyMap[key].indiaGross += Number(
        row.gross_jmi || 0
      );
    });

    overseasBoxOffice?.forEach((row) => {
      const movie = movies?.find(
        (movie) => movie.id === row.movie_id
      );

      if (!movie?.release_date) return;

      const dateString = String(movie.release_date);

      const year = Number(dateString.substring(0, 4));
      const month = Number(dateString.substring(5, 7));

      if (!year || !month) return;

      const key = `${year}-${String(month).padStart(2, "0")}`;

      if (!monthlyMap[key]) return;

      monthlyMap[key].overseasGross += Number(
        row.gross_inr || 0
      );
    });

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyData: MonthlyIntelligence[] =
      Object.values(monthlyMap)
        .map((data) => ({
          year: data.year,
          month: data.month,
          monthName: monthNames[data.month - 1],
          movies: data.movieIds.size,
          indiaGross: data.indiaGross,
          overseasGross: data.overseasGross,
          worldwideGross:
            data.indiaGross + data.overseasGross,
        }))
        .sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }

          return b.month - a.month;
        });

    setMonthlyIntelligence(monthlyData);

    // --------------------------------------------------
    // 11. Top Movie calculations
    // --------------------------------------------------

    const movieGrossMap: Record<
      number,
      {
        title: string;
        year: number | null;
        indiaGross: number;
        overseasGross: number;
      }
    > = {};

    movies?.forEach((movie) => {
      const year = movie.release_date
        ? Number(
            String(movie.release_date).substring(0, 4)
          )
        : null;

      movieGrossMap[movie.id] = {
        title: movie.title,
        year,
        indiaGross: 0,
        overseasGross: 0,
      };
    });

    stateBoxOffice?.forEach((row) => {
      if (!movieGrossMap[row.movie_id]) return;

      movieGrossMap[row.movie_id].indiaGross += Number(
        row.gross_jmi || 0
      );
    });

    overseasBoxOffice?.forEach((row) => {
      if (!movieGrossMap[row.movie_id]) return;

      movieGrossMap[row.movie_id].overseasGross += Number(
        row.gross_inr || 0
      );
    });

    const allTopMovies: TopMovie[] = Object.entries(
      movieGrossMap
    )
      .map(([movieId, movie]) => ({
        movieId: Number(movieId),
        title: movie.title,
        year: movie.year,
        indiaGross: movie.indiaGross,
        overseasGross: movie.overseasGross,
        worldwideGross:
          movie.indiaGross + movie.overseasGross,
      }))
      .sort(
        (a, b) =>
          b.worldwideGross - a.worldwideGross
      );

    setTopMovies(allTopMovies.slice(0, 5));

    // --------------------------------------------------
    // 12. Year-wise Top Movies
    // --------------------------------------------------

    const yearlyTopMap: Record<
      number,
      TopMovie[]
    > = {};

    allTopMovies.forEach((movie) => {
      if (!movie.year) return;

      if (!yearlyTopMap[movie.year]) {
        yearlyTopMap[movie.year] = [];
      }

      yearlyTopMap[movie.year].push(movie);
    });

    const yearlyTopData: YearlyTopMovies[] =
      Object.entries(yearlyTopMap)
        .map(([year, movies]) => ({
          year: Number(year),
          movies: movies.slice(0, 5),
        }))
        .sort((a, b) => b.year - a.year);

    setYearlyTopMovies(yearlyTopData);


    // --------------------------------------------------
// 12B. Industry Performance Metrics
// --------------------------------------------------

const totalMovieCount = allTopMovies.length;

const totalWorldwideGross = allTopMovies.reduce(
  (total, movie) => total + movie.worldwideGross,
  0
);

const totalIndiaGross = allTopMovies.reduce(
  (total, movie) => total + movie.indiaGross,
  0
);

const totalOverseasGross = allTopMovies.reduce(
  (total, movie) => total + movie.overseasGross,
  0
);

// --------------------------------------------------
// Domestic vs Overseas Contribution
// --------------------------------------------------

let indiaPercentage = 0;
let overseasPercentage = 0;

if (totalWorldwideGross > 0) {
  indiaPercentage =
    (totalIndiaGross / totalWorldwideGross) * 100;

  overseasPercentage =
    (totalOverseasGross / totalWorldwideGross) * 100;
}

setMarketContribution({
  indiaPercentage,
  overseasPercentage,
});

const averageWorldwideGross =
  totalMovieCount > 0
    ? totalWorldwideGross / totalMovieCount
    : 0;

const averageIndiaGross =
  totalMovieCount > 0
    ? totalIndiaGross / totalMovieCount
    : 0;

const averageOverseasGross =
  totalMovieCount > 0
    ? totalOverseasGross / totalMovieCount
    : 0;

const highestWorldwideMovie =
  allTopMovies.length > 0
    ? allTopMovies[0]
    : null;

const movies100CrPlus = allTopMovies.filter(
  (movie) => movie.worldwideGross >= 10000000000
).length;

const movies50CrPlus = allTopMovies.filter(
  (movie) => movie.worldwideGross >= 5000000000
).length;

const movies10CrPlus = allTopMovies.filter(
  (movie) => movie.worldwideGross >= 1000000000
).length;

setPerformanceMetrics({
  averageWorldwideGross,
  averageIndiaGross,
  averageOverseasGross,
  highestWorldwideMovie:
    highestWorldwideMovie?.title || null,
  highestWorldwideGross:
    highestWorldwideMovie?.worldwideGross || 0,
  movies100CrPlus,
  movies50CrPlus,
  movies10CrPlus,
});

    // --------------------------------------------------
    // 13. Top 5 Domestic Markets
    // --------------------------------------------------

    const domesticMap: Record<
      number,
      {
        gross: number;
        movieIds: Set<number>;
      }
    > = {};

    // IMPORTANT:
    // Only STATE rows are used here.
    // REST_OF_INDIA is intentionally excluded
    // to avoid treating it as a separate state/market.

    stateBoxOffice?.forEach((row) => {
      if (
        row.coverage_type !== "STATE" ||
        row.state_id === null
      ) {
        return;
      }

      const stateId = Number(row.state_id);

      if (!domesticMap[stateId]) {
        domesticMap[stateId] = {
          gross: 0,
          movieIds: new Set<number>(),
        };
      }

      domesticMap[stateId].gross += Number(
        row.gross_jmi || 0
      );

      domesticMap[stateId].movieIds.add(row.movie_id);
    });

    const domesticStateIds = Object.keys(domesticMap)
      .map(Number)
      .filter((id) => Number.isFinite(id));

    let domesticMarkets: MarketIntelligence[] = [];

    if (domesticStateIds.length > 0) {
      const {
        data: states,
        error: statesError,
      } = await supabase
        .from("states")
        .select("id, name")
        .in("id", domesticStateIds);

      if (statesError) {
        console.error(statesError);
        setError(statesError.message);
        setLoading(false);
        return;
      }

      const stateNameMap: Record<number, string> = {};

      states?.forEach((state) => {
        stateNameMap[Number(state.id)] = state.name;
      });

      domesticMarkets = domesticStateIds
        .map((stateId) => ({
          id: stateId,
          name:
            stateNameMap[stateId] ||
            `State ${stateId}`,
          gross: domesticMap[stateId].gross,
          movies:
            domesticMap[stateId].movieIds.size,
        }))
        .sort((a, b) => b.gross - a.gross)
        .slice(0, 5);
    }

    setTopDomesticMarkets(domesticMarkets);

    // --------------------------------------------------
// 14. Top 5 Overseas Markets
// --------------------------------------------------

const overseasMap: Record<
  number,
  {
    gross: number;
    movieIds: Set<number>;
  }
> = {};

countryBoxOffice?.forEach((row) => {
  if (row.country_id === null) return;

  const countryId = Number(row.country_id);

  if (!overseasMap[countryId]) {
    overseasMap[countryId] = {
      gross: 0,
      movieIds: new Set<number>(),
    };
  }

  overseasMap[countryId].gross += Number(
    row.gross_usd || 0
  );

  overseasMap[countryId].movieIds.add(row.movie_id);
});

const overseasCountryIds = Object.keys(overseasMap)
  .map(Number)
  .filter((id) => Number.isFinite(id));

let overseasMarkets: MarketIntelligence[] = [];

if (overseasCountryIds.length > 0) {
  const {
    data: countries,
    error: countriesError,
  } = await supabase
    .from("countries")
    .select("id, name")
    .in("id", overseasCountryIds);

  if (countriesError) {
    console.error(countriesError);
    setError(countriesError.message);
    setLoading(false);
    return;
  }

  const countryNameMap: Record<number, string> = {};

  countries?.forEach((country) => {
    countryNameMap[Number(country.id)] =
      country.name;
  });

  overseasMarkets = overseasCountryIds
    .map((countryId) => ({
      id: countryId,
      name:
        countryNameMap[countryId] ||
        `Country ${countryId}`,
      gross: overseasMap[countryId].gross,
      movies:
        overseasMap[countryId].movieIds.size,
    }))
    .sort((a, b) => b.gross - a.gross)
    .slice(0, 5);
}

setTopOverseasMarkets(overseasMarkets);

// --------------------------------------------------
// 15. Top 10 Contributing Lead Actors
// --------------------------------------------------

const {
  data: moviePeople,
  error: moviePeopleError,
} = await supabase
  .from("movie_people")
  .select(`
    movie_id,
    person_id,
    role_id,
    credit_type_id
  `)
  .in("movie_id", movieIds);

if (moviePeopleError) {
  console.error(moviePeopleError);
  setError(moviePeopleError.message);
  setLoading(false);
  return;
}

// Actor role = 1
// Lead Role = 1
// Lead Actress = 2

const leadActorRows =
  moviePeople?.filter(
    (row) =>
      Number(row.role_id) === 1 &&
      [1].includes(Number(row.credit_type_id))
  ) || [];

const actorIds = [
  ...new Set(
    leadActorRows.map((row) => Number(row.person_id))
  ),
];

let actorNameMap: Record<number, string> = {};

if (actorIds.length > 0) {
  const {
    data: actors,
    error: actorsError,
  } = await supabase
    .from("people")
    .select("id, full_name")
    .in("id", actorIds);

  if (actorsError) {
    console.error(actorsError);
    setError(actorsError.message);
    setLoading(false);
    return;
  }

  actors?.forEach((actor) => {
    actorNameMap[Number(actor.id)] = actor.full_name;
  });
}

// --------------------------------------------------
// Aggregate box office contribution by actor
// --------------------------------------------------

const actorMap: Record<
  number,
  {
    movieIds: Set<number>;
    indiaGross: number;
    overseasGross: number;
  }
> = {};

leadActorRows.forEach((row) => {
  const personId = Number(row.person_id);

  if (!actorMap[personId]) {
    actorMap[personId] = {
      movieIds: new Set<number>(),
      indiaGross: 0,
      overseasGross: 0,
    };
  }

  actorMap[personId].movieIds.add(
    Number(row.movie_id)
  );
});

// --------------------------------------------------
// Add India Gross
// --------------------------------------------------

stateBoxOffice?.forEach((boxOfficeRow) => {
  const movieId = Number(boxOfficeRow.movie_id);

  leadActorRows.forEach((actorRow) => {
    if (
      Number(actorRow.movie_id) !== movieId
    ) {
      return;
    }

    const personId = Number(
      actorRow.person_id
    );

    if (!actorMap[personId]) return;

    actorMap[personId].indiaGross += Number(
      boxOfficeRow.gross_jmi || 0
    );
  });
});

// --------------------------------------------------
// Add Overseas Gross
// --------------------------------------------------

overseasBoxOffice?.forEach((boxOfficeRow) => {
  const movieId = Number(boxOfficeRow.movie_id);

  leadActorRows.forEach((actorRow) => {
    if (
      Number(actorRow.movie_id) !== movieId
    ) {
      return;
    }

    const personId = Number(
      actorRow.person_id
    );

    if (!actorMap[personId]) return;

    actorMap[personId].overseasGross += Number(
      boxOfficeRow.gross_inr || 0
    );
  });
});

// --------------------------------------------------
// Build Top 10 Actors
// --------------------------------------------------

const contributingActors: ContributingActor[] =
  Object.entries(actorMap)
    .map(([personId, data]) => ({
      personId: Number(personId),

      name:
        actorNameMap[Number(personId)] ||
        `Person ${personId}`,

      movies: data.movieIds.size,

      indiaGross: data.indiaGross,

      overseasGross:
        data.overseasGross,

      worldwideGross:
        data.indiaGross +
        data.overseasGross,
    }))
    .sort(
      (a, b) =>
        b.worldwideGross -
        a.worldwideGross
    )
    .slice(0, 10);

setTopContributingActors(
  contributingActors
);

    // --------------------------------------------------
    // Finished
    // --------------------------------------------------

    setLoading(false);
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">
          Loading Industry Intelligence...
        </h1>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error || !industry) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">
          Industry not found
        </h1>

        <p className="mt-2 text-zinc-400">
          {error ||
            "The requested industry does not exist."}
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // Gross formatter
  // --------------------------------------------------

  function formatGross(value: number) {
    return `₹${value.toLocaleString("en-IN")}`;
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="p-8">

      {/* ---------------------------------------------- */}
      {/* Industry Header */}
      {/* ---------------------------------------------- */}

      <div className="mb-8">

        <p className="mb-2 text-sm text-zinc-500">
          Industry Intelligence
        </p>

        <h1 className="text-3xl font-bold">
          {industry.name}
        </h1>

        {industry.native_name && (
          <p className="mt-1 text-zinc-400">
            {industry.native_name}
          </p>
        )}

        {industry.description && (
          <p className="mt-3 max-w-3xl text-zinc-400">
            {industry.description}
          </p>
        )}

      </div>

      {/* ---------------------------------------------- */}
      {/* Overall Box Office Intelligence */}
      {/* ---------------------------------------------- */}

      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Box-Office Intelligence
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Overall box-office performance of movies
          associated with this industry.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              Total Movies
            </p>

            <p className="mt-2 text-2xl font-bold">
              {intelligence?.totalMovies ?? 0}
            </p>

          </div>

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              India Gross
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatGross(
                intelligence?.indiaGross ?? 0
              )}
            </p>

          </div>

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

            <p className="text-sm text-zinc-400">
              Overseas Gross
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatGross(
                intelligence?.overseasGross ?? 0
              )}
            </p>

          </div>

          <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-5">

            <p className="text-sm text-zinc-400">
              Worldwide Gross
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {formatGross(
                intelligence?.worldwideGross ?? 0
              )}
            </p>

          </div>

        </div>

      </div>

      {/* ---------------------------------------------- */}
      {/* Top 10 Contributing Lead Actors */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Top 10 Contributing Lead Actors
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Lead actors ranked by their cumulative
          worldwide box-office contribution across
          movies associated with this industry.
        </p>

        {topContributingActors.length === 0 ? (

          <p className="mt-6 text-zinc-500">
            No lead actor data available.
          </p>

        ) : (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[950px]">

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
                    India Gross
                  </th>

                  <th className="p-4 text-left">
                    Overseas Gross
                  </th>

                  <th className="p-4 text-left">
                    Worldwide Gross
                  </th>

                </tr>

              </thead>

              <tbody>

                {topContributingActors.map(
                  (actor, index) => (

                    <tr
                      key={actor.personId}
                      className="border-t border-zinc-700"
                    >

                      <td className="p-4 font-semibold">
                        #{index + 1}
                      </td>

                      <td className="p-4 font-semibold">
                        {actor.name}
                      </td>

                      <td className="p-4">
                        {actor.movies}
                      </td>

                      <td className="p-4">
                        {formatGross(
                          actor.indiaGross
                        )}
                      </td>

                      <td className="p-4">
                        {formatGross(
                          actor.overseasGross
                        )}
                      </td>

                      <td className="p-4 font-semibold text-yellow-400">
                        {formatGross(
                          actor.worldwideGross
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
      {/* Year-wise Intelligence */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Year-wise Box-Office Intelligence
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Box-office performance of this industry by
          movie release year.
        </p>

        {yearlyIntelligence.length === 0 ? (

          <p className="mt-6 text-zinc-500">
            No year-wise box-office data available.
          </p>

        ) : (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead className="bg-zinc-800">

                <tr>

                  <th className="p-4 text-left">
                    Year
                  </th>

                  <th className="p-4 text-left">
                    Movies
                  </th>

                  <th className="p-4 text-left">
                    India Gross
                  </th>

                  <th className="p-4 text-left">
                    Overseas Gross
                  </th>

                  <th className="p-4 text-left">
                    Worldwide Gross
                  </th>

                </tr>

              </thead>

              <tbody>

                {yearlyIntelligence.map((year) => (

                  <tr
                    key={year.year}
                    className="border-t border-zinc-700"
                  >

                    <td className="p-4 font-semibold">
                      {year.year}
                    </td>

                    <td className="p-4">
                      {year.movies}
                    </td>

                    <td className="p-4">
                      {formatGross(year.indiaGross)}
                    </td>

                    <td className="p-4">
                      {formatGross(year.overseasGross)}
                    </td>

                    <td className="p-4 font-semibold text-yellow-400">
                      {formatGross(
                        year.worldwideGross
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ---------------------------------------------- */}
      {/* Monthly Intelligence */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Monthly Box-Office Intelligence
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Monthly box-office performance based on the
          release date of movies associated with this
          industry.
        </p>

        {monthlyIntelligence.length === 0 ? (

          <p className="mt-6 text-zinc-500">
            No monthly box-office data available.
          </p>

        ) : (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="bg-zinc-800">

                <tr>

                  <th className="p-4 text-left">
                    Month
                  </th>

                  <th className="p-4 text-left">
                    Movies
                  </th>

                  <th className="p-4 text-left">
                    India Gross
                  </th>

                  <th className="p-4 text-left">
                    Overseas Gross
                  </th>

                  <th className="p-4 text-left">
                    Worldwide Gross
                  </th>

                </tr>

              </thead>

              <tbody>

                {monthlyIntelligence.map((month) => (

                  <tr
                    key={`${month.year}-${month.month}`}
                    className="border-t border-zinc-700"
                  >

                    <td className="p-4 font-semibold">
                      {month.monthName} {month.year}
                    </td>

                    <td className="p-4">
                      {month.movies}
                    </td>

                    <td className="p-4">
                      {formatGross(month.indiaGross)}
                    </td>

                    <td className="p-4">
                      {formatGross(month.overseasGross)}
                    </td>

                    <td className="p-4 font-semibold text-yellow-400">
                      {formatGross(
                        month.worldwideGross
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ---------------------------------------------- */}
      {/* Overall Top Movies */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Top Movies
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Highest-grossing movies associated with this
          industry, ranked by worldwide gross.
        </p>

        {topMovies.length === 0 ? (

          <p className="mt-6 text-zinc-500">
            No top movie data available.
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
                    India Gross
                  </th>

                  <th className="p-4 text-left">
                    Overseas Gross
                  </th>

                  <th className="p-4 text-left">
                    Worldwide Gross
                  </th>

                </tr>

              </thead>

              <tbody>

                {topMovies.map((movie, index) => (

                  <tr
                    key={movie.movieId}
                    className="border-t border-zinc-700"
                  >

                    <td className="p-4 font-semibold">
                      #{index + 1}
                    </td>

                    <td className="p-4 font-semibold">
                      {movie.title}
                    </td>

                    <td className="p-4">
                      {movie.year ?? "—"}
                    </td>

                    <td className="p-4">
                      {formatGross(movie.indiaGross)}
                    </td>

                    <td className="p-4">
                      {formatGross(movie.overseasGross)}
                    </td>

                    <td className="p-4 font-semibold text-yellow-400">
                      {formatGross(movie.worldwideGross)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ---------------------------------------------- */}
      {/* Year-wise Top Movies */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Year-wise Top Movies
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Top-grossing movies of this industry for each
          release year.
        </p>

        {yearlyTopMovies.length === 0 ? (

          <p className="mt-6 text-zinc-500">
            No year-wise top movie data available.
          </p>

        ) : (

          <div className="mt-6 space-y-8">

            {yearlyTopMovies.map((yearData) => (

              <div key={yearData.year}>

                <h3 className="mb-3 text-lg font-semibold">
                  {yearData.year}
                </h3>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[750px]">

                    <thead className="bg-zinc-800">

                      <tr>

                        <th className="p-4 text-left">
                          Rank
                        </th>

                        <th className="p-4 text-left">
                          Movie
                        </th>

                        <th className="p-4 text-left">
                          India Gross
                        </th>

                        <th className="p-4 text-left">
                          Overseas Gross
                        </th>

                        <th className="p-4 text-left">
                          Worldwide Gross
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {yearData.movies.map(
                        (movie, index) => (

                          <tr
                            key={movie.movieId}
                            className="border-t border-zinc-700"
                          >

                            <td className="p-4 font-semibold">
                              #{index + 1}
                            </td>

                            <td className="p-4 font-semibold">
                              {movie.title}
                            </td>

                            <td className="p-4">
                              {formatGross(
                                movie.indiaGross
                              )}
                            </td>

                            <td className="p-4">
                              {formatGross(
                                movie.overseasGross
                              )}
                            </td>

                            <td className="p-4 font-semibold text-yellow-400">
                              {formatGross(
                                movie.worldwideGross
                              )}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ---------------------------------------------- */}
{/* Industry Performance Metrics */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <h2 className="text-xl font-semibold">
    Industry Performance Metrics
  </h2>

  <p className="mt-2 text-sm text-zinc-400">
    Key performance indicators calculated from all
    movies associated with this industry.
  </p>

  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

    {/* Average Worldwide Gross */}

    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

      <p className="text-sm text-zinc-400">
        Average Worldwide Gross
      </p>

      <p className="mt-2 text-2xl font-bold text-yellow-400">
        {formatGross(
          performanceMetrics?.averageWorldwideGross ?? 0
        )}
      </p>

    </div>

    {/* Average India Gross */}

    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

      <p className="text-sm text-zinc-400">
        Average India Gross
      </p>

      <p className="mt-2 text-2xl font-bold">
        {formatGross(
          performanceMetrics?.averageIndiaGross ?? 0
        )}
      </p>

    </div>

    {/* Average Overseas Gross */}

    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

      <p className="text-sm text-zinc-400">
        Average Overseas Gross
      </p>

      <p className="mt-2 text-2xl font-bold">
        {formatGross(
          performanceMetrics?.averageOverseasGross ?? 0
        )}
      </p>

    </div>

    {/* Highest Grosser */}

    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

      <p className="text-sm text-zinc-400">
        Highest Worldwide Grosser
      </p>

      <p className="mt-2 text-lg font-bold">
        {performanceMetrics?.highestWorldwideMovie || "—"}
      </p>

      <p className="mt-1 text-sm text-yellow-400">
        {formatGross(
          performanceMetrics?.highestWorldwideGross ?? 0
        )}
      </p>

    </div>

  </div>

  {/* ---------------------------------------------- */}
  {/* Success Milestones */}
  {/* ---------------------------------------------- */}

  <div className="mt-6 grid gap-4 sm:grid-cols-3">

    {/* ₹100 Cr+ */}

    <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-5">

      <p className="text-sm text-zinc-400">
        ₹100 Cr+ Movies
      </p>

      <p className="mt-2 text-3xl font-bold text-yellow-400">
        {performanceMetrics?.movies100CrPlus ?? 0}
      </p>

    </div>

    {/* ₹50 Cr+ */}

    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

      <p className="text-sm text-zinc-400">
        ₹50 Cr+ Movies
      </p>

      <p className="mt-2 text-3xl font-bold">
        {performanceMetrics?.movies50CrPlus ?? 0}
      </p>

    </div>

    {/* ₹10 Cr+ */}

    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">

      <p className="text-sm text-zinc-400">
        ₹10 Cr+ Movies
      </p>

      <p className="mt-2 text-3xl font-bold">
        {performanceMetrics?.movies10CrPlus ?? 0}
      </p>

    </div>

  </div>

</div>

      {/* ---------------------------------------------- */}
      {/* Top 5 Domestic Markets */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Top 5 Domestic Markets
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Highest-grossing Indian states for movies
          associated with this industry.
        </p>

        {topDomesticMarkets.length === 0 ? (

          <p className="mt-6 text-zinc-500">
            No domestic market data available.
          </p>

        ) : (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead className="bg-zinc-800">

                <tr>

                  <th className="p-4 text-left">
                    Rank
                  </th>

                  <th className="p-4 text-left">
                    Market
                  </th>

                  <th className="p-4 text-left">
                    Movies
                  </th>

                  <th className="p-4 text-left">
                    Gross
                  </th>

                </tr>

              </thead>

              <tbody>

                {topDomesticMarkets.map(
                  (market, index) => (

                    <tr
                      key={market.id}
                      className="border-t border-zinc-700"
                    >

                      <td className="p-4 font-semibold">
                        #{index + 1}
                      </td>

                      <td className="p-4 font-semibold">
                        {market.name}
                      </td>

                      <td className="p-4">
                        {market.movies}
                      </td>

                     <td className="p-4 font-semibold text-yellow-400">
  {formatGross(market.gross)}
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
      {/* Top 5 Overseas Markets */}
      {/* ---------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-xl font-semibold">
          Top 5 Overseas Markets
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Highest-grossing overseas countries for movies
          associated with this industry.
        </p>

        {topOverseasMarkets.length === 0 ? (

          <p className="mt-6 text-zinc-500">
            No overseas market data available.
          </p>

        ) : (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead className="bg-zinc-800">

                <tr>

                  <th className="p-4 text-left">
                    Rank
                  </th>

                  <th className="p-4 text-left">
                    Market
                  </th>

                  <th className="p-4 text-left">
                    Movies
                  </th>

                  <th className="p-4 text-left">
                    Gross
                  </th>

                </tr>

              </thead>

              <tbody>

                {topOverseasMarkets.map(
                  (market, index) => (

                    <tr
                      key={market.id}
                      className="border-t border-zinc-700"
                    >

                      <td className="p-4 font-semibold">
                        #{index + 1}
                      </td>

                      <td className="p-4 font-semibold">
                        {market.name}
                      </td>

                      <td className="p-4">
                        {market.movies}
                      </td>

                     <td className="p-4 font-semibold text-yellow-400">
  ${market.gross.toLocaleString("en-US")}
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
{/* Year-over-Year Industry Growth */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <h2 className="text-xl font-semibold">
    Year-over-Year Industry Growth
  </h2>

  <p className="mt-2 text-sm text-zinc-400">
    Annual growth or decline in worldwide box-office
    performance compared with the previous year.
  </p>

  {yearlyGrowth.length === 0 ? (

    <p className="mt-6 text-zinc-500">
      No year-over-year growth data available.
    </p>

  ) : (

    <div className="mt-6 overflow-x-auto">

      <table className="w-full min-w-[750px]">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Year
            </th>

            <th className="p-4 text-left">
              Worldwide Gross
            </th>

            <th className="p-4 text-left">
              Previous Year
            </th>

            <th className="p-4 text-left">
              Growth
            </th>

          </tr>

        </thead>

        <tbody>

          {yearlyGrowth.map((growth) => (

            <tr
              key={growth.year}
              className="border-t border-zinc-700"
            >

              <td className="p-4 font-semibold">
                {growth.year}
              </td>

              <td className="p-4">
                {formatGross(
                  growth.worldwideGross
                )}
              </td>

              <td className="p-4">
                {growth.previousYearGross === null
                  ? "—"
                  : formatGross(
                      growth.previousYearGross
                    )}
              </td>

              <td className="p-4 font-semibold">

                {growth.growthPercentage === null ? (

                  <span className="text-zinc-500">
                    —
                  </span>

                ) : growth.growthPercentage >= 0 ? (

                  <span className="text-green-400">
                    ↑{" "}
                    {growth.growthPercentage.toFixed(2)}%
                  </span>

                ) : (

                  <span className="text-red-400">
                    ↓{" "}
                    {Math.abs(
                      growth.growthPercentage
                    ).toFixed(2)}%
                  </span>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )}

</div>

{/* ---------------------------------------------- */}
{/* Industry Records */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <h2 className="text-xl font-semibold">
    Industry Records
  </h2>

  <p className="mt-2 text-sm text-zinc-400">
    Key historical records based on yearly industry
    performance.
  </p>

  <div className="mt-6 grid gap-4 sm:grid-cols-2">

    {/* Highest Grossing Year */}

    <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-6">

      <p className="text-sm text-zinc-400">
        🏆 Highest-Grossing Year
      </p>

      <p className="mt-2 text-3xl font-bold text-yellow-400">
        {industryRecords?.highestGrossingYear ?? "—"}
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        Worldwide Gross
      </p>

      <p className="mt-1 text-lg font-semibold">
        {formatGross(
          industryRecords?.highestGrossingYearAmount ?? 0
        )}
      </p>

    </div>

    {/* Most Productive Year */}

    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-6">

      <p className="text-sm text-zinc-400">
        🎬 Most Productive Year
      </p>

      <p className="mt-2 text-3xl font-bold">
        {industryRecords?.mostProductiveYear ?? "—"}
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        Movies Released
      </p>

      <p className="mt-1 text-lg font-semibold">
        {industryRecords?.mostProductiveYearMovies ?? 0}
      </p>

    </div>

  </div>

</div>

{/* ---------------------------------------------- */}
{/* Domestic vs Overseas Contribution */}
{/* ---------------------------------------------- */}

<div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

  <h2 className="text-xl font-semibold">
    Domestic vs Overseas Contribution
  </h2>

  <p className="mt-2 text-sm text-zinc-400">
    Contribution of India and overseas markets to the
    industry's total worldwide gross.
  </p>

  <div className="mt-6 grid gap-4 sm:grid-cols-2">

    {/* India Contribution */}

    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-6">

      <p className="text-sm text-zinc-400">
        🇮🇳 India Contribution
      </p>

      <p className="mt-2 text-3xl font-bold">
        {marketContribution
          ? `${marketContribution.indiaPercentage.toFixed(2)}%`
          : "—"}
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        India Gross
      </p>

      <p className="mt-1 text-lg font-semibold">
        formatGross(totalIndiaGross)
      </p>

    </div>

    {/* Overseas Contribution */}

    <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/5 p-6">

      <p className="text-sm text-zinc-400">
        🌍 Overseas Contribution
      </p>

      <p className="mt-2 text-3xl font-bold text-yellow-400">
        {marketContribution
          ? `${marketContribution.overseasPercentage.toFixed(2)}%`
          : "—"}
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        Overseas Gross
      </p>

      <p className="mt-1 text-lg font-semibold">
        formatGross(totaloverseasGross)
      </p>

    </div>

  </div>

  {/* Contribution Bar */}

  {marketContribution && (
    <div className="mt-6">

      <div className="mb-2 flex justify-between text-xs text-zinc-400">

        <span>
          India {marketContribution.indiaPercentage.toFixed(1)}%
        </span>

        <span>
          Overseas {marketContribution.overseasPercentage.toFixed(1)}%
        </span>

      </div>

      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-800">

        <div
          className="h-full bg-zinc-500"
          style={{
            width: `${marketContribution.indiaPercentage}%`,
          }}
        />

        <div
          className="h-full bg-yellow-500"
          style={{
            width: `${marketContribution.overseasPercentage}%`,
          }}
        />

      </div>

    </div>
  )}

</div>

    </div>
  );
}