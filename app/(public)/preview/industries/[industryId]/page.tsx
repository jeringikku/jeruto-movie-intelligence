"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PublicHeader from "../../../components/PublicHeader";
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
  movies250CrPlus: number;
  movies500CrPlus: number;
  movies1000CrPlus: number;
};

export default function PublicIndustryIntelligencePage() {
  const params = useParams();

  const industryId = Number(params?.industryId);

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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!industryId || Number.isNaN(industryId)) {
      setError("Invalid industry ID.");
      setLoading(false);
      return;
    }

    loadIndustryIntelligence();
  }, [industryId]);

  /* =========================================================
     LOAD INDUSTRY INTELLIGENCE
  ========================================================= */

  async function loadIndustryIntelligence() {
    setLoading(true);
    setError("");

    /* =======================================================
       1. LOAD INDUSTRY INFORMATION
    ======================================================= */

    const {
      data: industryData,
      error: industryError,
    } = await supabase
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
      console.error(
        "Public industry load error:",
        industryError
      );

      setError(industryError.message);
      setLoading(false);
      return;
    }

    setIndustry(industryData);

    /* =======================================================
       2. FIND MOVIES ASSOCIATED WITH INDUSTRY
    ======================================================= */

    const {
      data: industryMovies,
      error: industryMoviesError,
    } = await supabase
      .from("movie_industries")
      .select("movie_id")
      .eq("industry_id", industryId);

    if (industryMoviesError) {
      console.error(
        "Public industry movie relationship error:",
        industryMoviesError
      );

      setError(industryMoviesError.message);
      setLoading(false);
      return;
    }

    const movieIds = [
      ...new Set(
        industryMovies?.map(
          (movie) => Number(movie.movie_id)
        ) || []
      ),
    ];

    /* =======================================================
       NO MOVIES
    ======================================================= */

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
      setYearlyGrowth([]);
      setTopDomesticMarkets([]);
      setTopOverseasMarkets([]);
      setTopContributingActors([]);

      setIndustryRecords({
        highestGrossingYear: null,
        highestGrossingYearAmount: 0,
        mostProductiveYear: null,
        mostProductiveYearMovies: 0,
      });

      setMarketContribution({
        indiaPercentage: 0,
        overseasPercentage: 0,
      });

      setPerformanceMetrics({
        averageWorldwideGross: 0,
        averageIndiaGross: 0,
        averageOverseasGross: 0,
        highestWorldwideMovie: null,
        highestWorldwideGross: 0,
        movies100CrPlus: 0,
        movies250CrPlus: 0,
        movies500CrPlus: 0,
        movies1000CrPlus: 0,
      });

      setLoading(false);
      return;
    }

    /* =======================================================
       3. LOAD MOVIE INFORMATION
    ======================================================= */

    const {
      data: movies,
      error: moviesError,
    } = await supabase
      .from("movies")
      .select(`
        id,
        title,
        release_date
      `)
      .in("id", movieIds);

    if (moviesError) {
      console.error(
        "Public industry movies error:",
        moviesError
      );

      setError(moviesError.message);
      setLoading(false);
      return;
    }

    /* =======================================================
       4. INDIA BOX OFFICE
    ======================================================= */

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
      console.error(
        "Public industry India box office error:",
        stateError
      );

      setError(stateError.message);
      setLoading(false);
      return;
    }

    /* =======================================================
       5. OVERSEAS BOX OFFICE
    ======================================================= */

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
      console.error(
        "Public industry overseas box office error:",
        overseasError
      );

      setError(overseasError.message);
      setLoading(false);
      return;
    }

    /* =======================================================
       5B. COUNTRY-LEVEL OVERSEAS BOX OFFICE
    ======================================================= */

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
      console.error(
        "Public industry country box office error:",
        countryBoxOfficeError
      );

      setError(countryBoxOfficeError.message);
      setLoading(false);
      return;
    }

    /* =======================================================
       6. OVERALL INDIA GROSS
    ======================================================= */

    const indiaGross =
      stateBoxOffice?.reduce(
        (total, row) =>
          total + Number(row.gross_jmi || 0),
        0
      ) || 0;

    /* =======================================================
       7. OVERALL OVERSEAS GROSS
    ======================================================= */

    const overseasGross =
      overseasBoxOffice?.reduce(
        (total, row) =>
          total + Number(row.gross_inr || 0),
        0
      ) || 0;

    /* =======================================================
       8. WORLDWIDE GROSS
    ======================================================= */

    const worldwideGross =
      indiaGross + overseasGross;

    setIntelligence({
      totalMovies: movieIds.length,
      indiaGross,
      overseasGross,
      worldwideGross,
    });

    /* =======================================================
       9. YEAR-WISE INTELLIGENCE
    ======================================================= */

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

      if (!year) return;

      if (!yearlyMap[year]) {
        yearlyMap[year] = {
          movieIds: new Set<number>(),
          indiaGross: 0,
          overseasGross: 0,
        };
      }

      yearlyMap[year].movieIds.add(
        Number(movie.id)
      );
    });

    stateBoxOffice?.forEach((row) => {
      const movie = movies?.find(
        (movie) =>
          Number(movie.id) ===
          Number(row.movie_id)
      );

      if (!movie?.release_date) return;

      const year = Number(
        String(movie.release_date).substring(0, 4)
      );

      if (!yearlyMap[year]) return;

      yearlyMap[year].indiaGross +=
        Number(row.gross_jmi || 0);
    });

    overseasBoxOffice?.forEach((row) => {
      const movie = movies?.find(
        (movie) =>
          Number(movie.id) ===
          Number(row.movie_id)
      );

      if (!movie?.release_date) return;

      const year = Number(
        String(movie.release_date).substring(0, 4)
      );

      if (!yearlyMap[year]) return;

      yearlyMap[year].overseasGross +=
        Number(row.gross_inr || 0);
    });

    const yearlyData: YearlyIntelligence[] =
      Object.entries(yearlyMap)
        .map(([year, data]) => ({
          year: Number(year),
          movies: data.movieIds.size,
          indiaGross: data.indiaGross,
          overseasGross: data.overseasGross,
          worldwideGross:
            data.indiaGross +
            data.overseasGross,
        }))
        .sort(
          (a, b) => b.year - a.year
        );

    setYearlyIntelligence(yearlyData);

    /* =======================================================
       10. YEAR-OVER-YEAR GROWTH
    ======================================================= */

    const growthData: YearlyGrowth[] =
      yearlyData.map((currentYear) => {
        const previousYear =
          yearlyData.find(
            (yearData) =>
              yearData.year ===
              currentYear.year - 1
          );

        if (!previousYear) {
          return {
            year: currentYear.year,
            worldwideGross:
              currentYear.worldwideGross,
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
          worldwideGross:
            currentYear.worldwideGross,
          previousYearGross:
            previousYear.worldwideGross,
          growthPercentage,
        };
      });

    setYearlyGrowth(growthData);

    /* =======================================================
       11. INDUSTRY RECORDS
    ======================================================= */

    const highestGrossingYear =
      yearlyData.length > 0
        ? yearlyData.reduce(
            (highest, current) =>
              current.worldwideGross >
              highest.worldwideGross
                ? current
                : highest
          )
        : null;

    const mostProductiveYear =
      yearlyData.length > 0
        ? yearlyData.reduce(
            (highest, current) =>
              current.movies >
              highest.movies
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

    /* =======================================================
       12. MONTH-WISE INTELLIGENCE
    ======================================================= */

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

      const dateString =
        String(movie.release_date);

      const year = Number(
        dateString.substring(0, 4)
      );

      const month = Number(
        dateString.substring(5, 7)
      );

      if (!year || !month) return;

      const key = `${year}-${String(
        month
      ).padStart(2, "0")}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          year,
          month,
          movieIds: new Set<number>(),
          indiaGross: 0,
          overseasGross: 0,
        };
      }

      monthlyMap[key].movieIds.add(
        Number(movie.id)
      );
    });

    stateBoxOffice?.forEach((row) => {
      const movie = movies?.find(
        (movie) =>
          Number(movie.id) ===
          Number(row.movie_id)
      );

      if (!movie?.release_date) return;

      const dateString =
        String(movie.release_date);

      const year = Number(
        dateString.substring(0, 4)
      );

      const month = Number(
        dateString.substring(5, 7)
      );

      if (!year || !month) return;

      const key = `${year}-${String(
        month
      ).padStart(2, "0")}`;

      if (!monthlyMap[key]) return;

      monthlyMap[key].indiaGross +=
        Number(row.gross_jmi || 0);
    });

    overseasBoxOffice?.forEach((row) => {
      const movie = movies?.find(
        (movie) =>
          Number(movie.id) ===
          Number(row.movie_id)
      );

      if (!movie?.release_date) return;

      const dateString =
        String(movie.release_date);

      const year = Number(
        dateString.substring(0, 4)
      );

      const month = Number(
        dateString.substring(5, 7)
      );

      if (!year || !month) return;

      const key = `${year}-${String(
        month
      ).padStart(2, "0")}`;

      if (!monthlyMap[key]) return;

      monthlyMap[key].overseasGross +=
        Number(row.gross_inr || 0);
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
          monthName:
            monthNames[data.month - 1],
          movies: data.movieIds.size,
          indiaGross: data.indiaGross,
          overseasGross:
            data.overseasGross,
          worldwideGross:
            data.indiaGross +
            data.overseasGross,
        }))
        .sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }

          return b.month - a.month;
        });

    setMonthlyIntelligence(monthlyData);

    /* =======================================================
       13. TOP MOVIE CALCULATIONS
    ======================================================= */

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
            String(
              movie.release_date
            ).substring(0, 4)
          )
        : null;

      movieGrossMap[Number(movie.id)] = {
        title: movie.title,
        year,
        indiaGross: 0,
        overseasGross: 0,
      };
    });

    stateBoxOffice?.forEach((row) => {
      const movieId =
        Number(row.movie_id);

      if (!movieGrossMap[movieId]) return;

      movieGrossMap[movieId].indiaGross +=
        Number(row.gross_jmi || 0);
    });

    overseasBoxOffice?.forEach((row) => {
      const movieId =
        Number(row.movie_id);

      if (!movieGrossMap[movieId]) return;

      movieGrossMap[movieId].overseasGross +=
        Number(row.gross_inr || 0);
    });

    const allTopMovies: TopMovie[] =
      Object.entries(movieGrossMap)
        .map(([movieId, movie]) => ({
          movieId: Number(movieId),
          title: movie.title,
          year: movie.year,
          indiaGross: movie.indiaGross,
          overseasGross:
            movie.overseasGross,
          worldwideGross:
            movie.indiaGross +
            movie.overseasGross,
        }))
        .sort(
          (a, b) =>
            b.worldwideGross -
            a.worldwideGross
        );

    setTopMovies(
      allTopMovies.slice(0, 5)
    );

    /* =======================================================
       14. YEAR-WISE TOP MOVIES
    ======================================================= */

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
        .sort(
          (a, b) => b.year - a.year
        );

    setYearlyTopMovies(
      yearlyTopData
    );

    /* =======================================================
       15. INDUSTRY PERFORMANCE METRICS
    ======================================================= */

    const totalMovieCount =
      allTopMovies.length;

    const totalWorldwideGross =
      allTopMovies.reduce(
        (total, movie) =>
          total + movie.worldwideGross,
        0
      );

    const totalIndiaGross =
      allTopMovies.reduce(
        (total, movie) =>
          total + movie.indiaGross,
        0
      );

    const totalOverseasGross =
      allTopMovies.reduce(
        (total, movie) =>
          total + movie.overseasGross,
        0
      );

    /* =======================================================
       DOMESTIC VS OVERSEAS CONTRIBUTION
    ======================================================= */

    let indiaPercentage = 0;
    let overseasPercentage = 0;

    if (totalWorldwideGross > 0) {
      indiaPercentage =
        (totalIndiaGross /
          totalWorldwideGross) *
        100;

      overseasPercentage =
        (totalOverseasGross /
          totalWorldwideGross) *
        100;
    }

    setMarketContribution({
      indiaPercentage,
      overseasPercentage,
    });

    /* =======================================================
       AVERAGES
    ======================================================= */

    const averageWorldwideGross =
      totalMovieCount > 0
        ? totalWorldwideGross /
          totalMovieCount
        : 0;

    const averageIndiaGross =
      totalMovieCount > 0
        ? totalIndiaGross /
          totalMovieCount
        : 0;

    const averageOverseasGross =
      totalMovieCount > 0
        ? totalOverseasGross /
          totalMovieCount
        : 0;

    const highestWorldwideMovie =
      allTopMovies.length > 0
        ? allTopMovies[0]
        : null;

    /* =======================================================
       SUCCESS MILESTONES
    ======================================================= */

    const movies100CrPlus =
      allTopMovies.filter(
        (movie) =>
          movie.worldwideGross >=
          1000000000
      ).length;

      const movies250CrPlus = allTopMovies.filter(
  (movie) => movie.worldwideGross >= 2500000000
).length;

    const movies500CrPlus =
      allTopMovies.filter(
        (movie) =>
          movie.worldwideGross >=
          5000000000
      ).length;

    const movies1000CrPlus =
      allTopMovies.filter(
        (movie) =>
          movie.worldwideGross >=
          10000000000
      ).length;

    setPerformanceMetrics({
      averageWorldwideGross,
      averageIndiaGross,
      averageOverseasGross,

      highestWorldwideMovie:
        highestWorldwideMovie?.title ||
        null,

      highestWorldwideGross:
        highestWorldwideMovie?.worldwideGross ||
        0,

      movies100CrPlus,
      movies250CrPlus,
      movies500CrPlus,
      movies1000CrPlus,
    });

    /* =======================================================
       16. TOP 5 DOMESTIC MARKETS
    ======================================================= */

    const domesticMap: Record<
      number,
      {
        gross: number;
        movieIds: Set<number>;
      }
    > = {};

    /*
     * IMPORTANT:
     * Only STATE rows are used.
     * REST_OF_INDIA is intentionally excluded.
     */

    stateBoxOffice?.forEach((row) => {
      if (
        row.coverage_type !==
          "STATE" ||
        row.state_id === null
      ) {
        return;
      }

      const stateId =
        Number(row.state_id);

      if (!domesticMap[stateId]) {
        domesticMap[stateId] = {
          gross: 0,
          movieIds:
            new Set<number>(),
        };
      }

      domesticMap[stateId].gross +=
        Number(row.gross_jmi || 0);

      domesticMap[stateId].movieIds.add(
        Number(row.movie_id)
      );
    });

    const domesticStateIds =
      Object.keys(domesticMap)
        .map(Number)
        .filter((id) =>
          Number.isFinite(id)
        );

    let domesticMarkets: MarketIntelligence[] =
      [];

    if (
      domesticStateIds.length > 0
    ) {
      const {
        data: states,
        error: statesError,
      } = await supabase
        .from("states")
        .select("id, name")
        .in(
          "id",
          domesticStateIds
        );

      if (statesError) {
        console.error(
          "Public industry states error:",
          statesError
        );

        setError(
          statesError.message
        );

        setLoading(false);
        return;
      }

      const stateNameMap: Record<
        number,
        string
      > = {};

      states?.forEach((state) => {
        stateNameMap[
          Number(state.id)
        ] = state.name;
      });

      domesticMarkets =
        domesticStateIds
          .map((stateId) => ({
            id: stateId,

            name:
              stateNameMap[stateId] ||
              `State ${stateId}`,

            gross:
              domesticMap[stateId]
                .gross,

            movies:
              domesticMap[stateId]
                .movieIds.size,
          }))
          .sort(
            (a, b) =>
              b.gross - a.gross
          )
          .slice(0, 5);
    }

    setTopDomesticMarkets(
      domesticMarkets
    );

    /* =======================================================
       17. TOP 5 OVERSEAS MARKETS
    ======================================================= */

    const overseasMap: Record<
      number,
      {
        gross: number;
        movieIds: Set<number>;
      }
    > = {};

    countryBoxOffice?.forEach(
      (row) => {
        if (row.country_id === null) {
          return;
        }

        const countryId =
          Number(row.country_id);

        if (!overseasMap[countryId]) {
          overseasMap[countryId] = {
            gross: 0,
            movieIds:
              new Set<number>(),
          };
        }

        overseasMap[countryId].gross +=
          Number(row.gross_usd || 0);

        overseasMap[
          countryId
        ].movieIds.add(
          Number(row.movie_id)
        );
      }
    );

    const overseasCountryIds =
      Object.keys(overseasMap)
        .map(Number)
        .filter((id) =>
          Number.isFinite(id)
        );

    let overseasMarkets: MarketIntelligence[] =
      [];

    if (
      overseasCountryIds.length > 0
    ) {
      const {
        data: countries,
        error: countriesError,
      } = await supabase
        .from("countries")
        .select("id, name")
        .in(
          "id",
          overseasCountryIds
        );

      if (countriesError) {
        console.error(
          "Public industry countries error:",
          countriesError
        );

        setError(
          countriesError.message
        );

        setLoading(false);
        return;
      }

      const countryNameMap: Record<
        number,
        string
      > = {};

      countries?.forEach(
        (country) => {
          countryNameMap[
            Number(country.id)
          ] = country.name;
        }
      );

      overseasMarkets =
        overseasCountryIds
          .map((countryId) => ({
            id: countryId,

            name:
              countryNameMap[
                countryId
              ] ||
              `Country ${countryId}`,

            gross:
              overseasMap[
                countryId
              ].gross,

            movies:
              overseasMap[
                countryId
              ].movieIds.size,
          }))
          .sort(
            (a, b) =>
              b.gross - a.gross
          )
          .slice(0, 5);
    }

    setTopOverseasMarkets(
      overseasMarkets
    );

    /* =======================================================
       18. TOP 10 CONTRIBUTING LEAD ACTORS
    ======================================================= */

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
      .in(
        "movie_id",
        movieIds
      );

    if (moviePeopleError) {
      console.error(
        "Public industry movie people error:",
        moviePeopleError
      );

      setError(
        moviePeopleError.message
      );

      setLoading(false);
      return;
    }

    /*
     * Preserve the admin logic:
     *
     * role_id = 1
     * credit_type_id = 1
     */

    const leadActorRows =
      moviePeople?.filter(
        (row) =>
          Number(row.role_id) === 1 &&
          Number(
            row.credit_type_id
          ) === 1
      ) || [];

    const actorIds = [
      ...new Set(
        leadActorRows.map(
          (row) =>
            Number(row.person_id)
        )
      ),
    ];

    let actorNameMap: Record<
      number,
      string
    > = {};

    if (actorIds.length > 0) {
      const {
        data: actors,
        error: actorsError,
      } = await supabase
        .from("people")
        .select(
          "id, full_name"
        )
        .in(
          "id",
          actorIds
        );

      if (actorsError) {
        console.error(
          "Public industry actors error:",
          actorsError
        );

        setError(
          actorsError.message
        );

        setLoading(false);
        return;
      }

      actors?.forEach(
        (actor) => {
          actorNameMap[
            Number(actor.id)
          ] = actor.full_name;
        }
      );
    }

    /* =======================================================
       AGGREGATE ACTOR BOX OFFICE
    ======================================================= */

    const actorMap: Record<
      number,
      {
        movieIds: Set<number>;
        indiaGross: number;
        overseasGross: number;
      }
    > = {};

    leadActorRows.forEach(
      (row) => {
        const personId =
          Number(row.person_id);

        if (!actorMap[personId]) {
          actorMap[personId] = {
            movieIds:
              new Set<number>(),
            indiaGross: 0,
            overseasGross: 0,
          };
        }

        actorMap[
          personId
        ].movieIds.add(
          Number(row.movie_id)
        );
      }
    );

    /* =======================================================
       ACTOR INDIA GROSS
    ======================================================= */

    stateBoxOffice?.forEach(
      (boxOfficeRow) => {
        const movieId =
          Number(
            boxOfficeRow.movie_id
          );

        leadActorRows.forEach(
          (actorRow) => {
            if (
              Number(
                actorRow.movie_id
              ) !== movieId
            ) {
              return;
            }

            const personId =
              Number(
                actorRow.person_id
              );

            if (!actorMap[personId]) {
              return;
            }

            actorMap[
              personId
            ].indiaGross +=
              Number(
                boxOfficeRow.gross_jmi ||
                  0
              );
          }
        );
      }
    );

    /* =======================================================
       ACTOR OVERSEAS GROSS
    ======================================================= */

    overseasBoxOffice?.forEach(
      (boxOfficeRow) => {
        const movieId =
          Number(
            boxOfficeRow.movie_id
          );

        leadActorRows.forEach(
          (actorRow) => {
            if (
              Number(
                actorRow.movie_id
              ) !== movieId
            ) {
              return;
            }

            const personId =
              Number(
                actorRow.person_id
              );

            if (!actorMap[personId]) {
              return;
            }

            actorMap[
              personId
            ].overseasGross +=
              Number(
                boxOfficeRow.gross_inr ||
                  0
              );
          }
        );
      }
    );

    /* =======================================================
       BUILD TOP 10 ACTORS
    ======================================================= */

    const contributingActors: ContributingActor[] =
      Object.entries(actorMap)
        .map(
          ([personId, data]) => ({
            personId:
              Number(personId),

            name:
              actorNameMap[
                Number(personId)
              ] ||
              `Person ${personId}`,

            movies:
              data.movieIds.size,

            indiaGross:
              data.indiaGross,

            overseasGross:
              data.overseasGross,

            worldwideGross:
              data.indiaGross +
              data.overseasGross,
          })
        )
        .sort(
          (a, b) =>
            b.worldwideGross -
            a.worldwideGross
        )
        .slice(0, 10);

    setTopContributingActors(
      contributingActors
    );

    /* =======================================================
       FINISHED
    ======================================================= */

    setLoading(false);
  }

  /* =========================================================
     FORMATTERS
  ========================================================= */

  function formatGross(value: number) {
    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  }

  function formatCrores(value: number) {
    return `₹${(
      value / 10000000
    ).toFixed(2)} Cr`;
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <PublicHeader />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

            <div className="h-2.5 w-32 animate-pulse rounded bg-zinc-800" />

            <div className="mt-4 h-8 w-64 animate-pulse rounded bg-zinc-900" />

            <div className="mt-3 h-3 w-full max-w-xl animate-pulse rounded bg-zinc-900" />

          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-xl border border-zinc-900 bg-zinc-950"
                />
              )
            )}

          </div>

        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !industry) {
    return (
      <main className="min-h-screen bg-black text-white">
        <PublicHeader />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

          <div className="rounded-2xl border border-red-900/60 bg-zinc-950 p-6">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-red-400">
              Industry Intelligence
            </p>

            <h1 className="mt-2 text-lg font-medium">
              Industry not available
            </h1>

            <p className="mt-2 text-[9px] leading-5 text-zinc-500">
              {error ||
                "The requested industry does not exist."}
            </p>

            <Link
              href="/preview/industries"
              className="mt-5 inline-flex rounded-lg border border-zinc-800 bg-black px-4 py-2 text-violet-500 text-[8px] font-medium tracking-[0.14em]  transition hover:border-violet-400/30 hover:text-violet-300"
            >
              ← Back to Industries
            </Link>

          </div>

        </div>
      </main>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-black text-white">

      <PublicHeader />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

        {/* =====================================================
            BACK
        ===================================================== */}

        <div className="mb-5">

          <Link
            href="/preview/industries"
            className="text-[8px] uppercase tracking-[0.16em] text-zinc-600 transition hover:text-violet-300"
          >
            ← Back to Industries
          </Link>

        </div>

        {/* =====================================================
            INDUSTRY HEADER
        ===================================================== */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div className="min-w-0">

              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                Industry Intelligence
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {industry.name}
              </h1>

              {industry.native_name && (
                <p className="mt-1.5 text-[9px] text-zinc-500">
                  {industry.native_name}
                </p>
              )}

              {industry.short_name && (
                <p className="mt-1 text-[7px] uppercase tracking-[0.14em] text-zinc-700">
                  {industry.short_name}
                </p>
              )}

              {industry.description && (
                <p className="mt-3 max-w-3xl text-[9px] leading-5 text-zinc-500 sm:text-[10px]">
                  {industry.description}
                </p>
              )}

            </div>

            <div className="shrink-0 rounded-xl border border-zinc-800 bg-black px-4 py-3">

              <p className="text-[7px] uppercase tracking-[0.16em] text-zinc-600">
                Industry ID
              </p>

              <p className="mt-1 text-lg font-semibold text-violet-300">
                {industry.id}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            BOX OFFICE INTELLIGENCE
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Box Office Intelligence
            </p>

            <h2 className="mt-1.5 text-base font-medium text-white sm:text-lg">
              Overall Box-Office Performance
            </h2>

            <p className="mt-1 text-[8px] leading-4 text-zinc-600 sm:text-[9px]">
              Overall theatrical performance of movies associated with this industry.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Total Movies
              </p>

              <p className="mt-2 text-xl font-semibold text-white">
                {intelligence?.totalMovies ?? 0}
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                India Gross
              </p>

              <p className="mt-2 text-xl font-semibold text-white">
                {formatCrores(
                  intelligence?.indiaGross ?? 0
                )}
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Overseas Gross
              </p>

              <p className="mt-2 text-xl font-semibold text-white">
                {formatCrores(
                  intelligence?.overseasGross ?? 0
                )}
              </p>

            </div>

            <div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.03] p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Worldwide Gross
              </p>

              <p className="mt-2 text-xl font-semibold text-violet-300">
                {formatCrores(
                  intelligence?.worldwideGross ?? 0
                )}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            TOP 10 LEAD ACTORS
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              People Intelligence
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Top 10 Contributing Lead Actors
            </h2>

            <p className="mt-1 text-[8px] leading-4 text-zinc-600 sm:text-[9px]">
              Lead actors ranked by cumulative worldwide box-office contribution across this industry&apos;s movies.
            </p>

          </div>

          {topContributingActors.length === 0 ? (

            <p className="text-[8px] text-zinc-600">
              No lead actor data available.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>

                  <tr className="border-b border-zinc-800">

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Rank
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Actor
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Lead Movies
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      India
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Overseas
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Worldwide
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {topContributingActors.map(
                    (actor, index) => (

                      <tr
                        key={actor.personId}
                        className="border-b border-zinc-800/70 transition hover:bg-zinc-900/60"
                      >

                        <td className="px-3 py-3.5">

                          <span
                            className={
                              index === 0
                                ? "font-semibold text-violet-300"
                                : "text-zinc-500"
                            }
                          >
                            #{index + 1}
                          </span>

                        </td>

                        <td className="px-3 py-3.5">

                          <Link
                            href={`/preview/people/${actor.personId}`}
                            className="font-medium text-zinc-200 transition hover:text-violet-300"
                          >
                            {actor.name}
                          </Link>

                        </td>

                        <td className="px-3 py-3.5 text-zinc-400">
                          {actor.movies}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {formatCrores(
                            actor.indiaGross
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {formatCrores(
                            actor.overseasGross
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right font-medium text-white">
                          {formatCrores(
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

        </section>

        {/* =====================================================
            YEAR-WISE INTELLIGENCE
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Historical Intelligence
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Year-wise Box-Office Intelligence
            </h2>

            <p className="mt-1 text-[8px] text-zinc-600">
              Annual theatrical performance based on movie release year.
            </p>

          </div>

          {yearlyIntelligence.length === 0 ? (

            <p className="text-[8px] text-zinc-600">
              No year-wise box-office data available.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>

                  <tr className="border-b border-zinc-800">

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Year
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Movies
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      India
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Overseas
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Worldwide
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {yearlyIntelligence.map(
                    (year) => (

                      <tr
                        key={year.year}
                        className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
                      >

                        <td className="px-3 py-3.5 font-medium text-zinc-200">
                          {year.year}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {year.movies}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {formatCrores(
                            year.indiaGross
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {formatCrores(
                            year.overseasGross
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right font-medium text-white">
                          {formatCrores(
                            year.worldwideGross
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =====================================================
            MONTHLY INTELLIGENCE
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Monthly Intelligence
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Monthly Box-Office Intelligence
            </h2>

            <p className="mt-1 text-[8px] text-zinc-600">
              Monthly performance based on the release month of associated movies.
            </p>

          </div>

          {monthlyIntelligence.length === 0 ? (

            <p className="text-[8px] text-zinc-600">
              No monthly box-office data available.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px]">

                <thead>

                  <tr className="border-b border-zinc-800">

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Month
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Movies
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      India
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Overseas
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Worldwide
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {monthlyIntelligence.map(
                    (month) => (

                      <tr
                        key={`${month.year}-${month.month}`}
                        className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
                      >

                        <td className="px-3 py-3.5 font-medium text-zinc-200">
                          {month.monthName}{" "}
                          {month.year}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {month.movies}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {formatCrores(
                            month.indiaGross
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {formatCrores(
                            month.overseasGross
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right font-medium text-white">
                          {formatCrores(
                            month.worldwideGross
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =====================================================
            TOP MOVIES
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Box Office Rankings
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Top 5 Movies
            </h2>

            <p className="mt-1 text-[8px] text-zinc-600">
              Highest-grossing movies associated with this industry by worldwide gross.
            </p>

          </div>

          {topMovies.length === 0 ? (

            <p className="text-[8px] text-zinc-600">
              No top movie data available.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>

                  <tr className="border-b border-zinc-800">

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Rank
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Movie
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Year
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      India
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Overseas
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Worldwide
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {topMovies.map(
                    (movie, index) => (

                      <tr
                        key={movie.movieId}
                        className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
                      >

                        <td className="px-3 py-3.5">

                          <span
                            className={
                              index === 0
                                ? "font-semibold text-violet-300"
                                : "text-zinc-500"
                            }
                          >
                            #{index + 1}
                          </span>

                        </td>

                        <td className="px-3 py-3.5">

                          <Link
                            href={`/preview/movies/${movie.movieId}`}
                            className="font-medium text-zinc-200 transition hover:text-violet-300"
                          >
                            {movie.title}
                          </Link>

                        </td>

                        <td className="px-3 py-3.5 text-zinc-600">
                          {movie.year ?? "—"}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {formatCrores(
                            movie.indiaGross
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {formatCrores(
                            movie.overseasGross
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right font-medium text-white">
                          {formatCrores(
                            movie.worldwideGross
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =====================================================
            YEAR-WISE TOP MOVIES
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Annual Rankings
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Year-wise Top Movies
            </h2>

            <p className="mt-1 text-[8px] text-zinc-600">
              Top five worldwide-grossing movies associated with the industry for each release year.
            </p>

          </div>

          {yearlyTopMovies.length === 0 ? (

            <p className="text-[8px] text-zinc-600">
              No year-wise top movie data available.
            </p>

          ) : (

            <div className="space-y-6">

              {yearlyTopMovies.map(
                (yearData) => (

                  <div key={yearData.year}>

                    <div className="mb-3 flex items-center gap-2">

                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400/70" />

                      <h3 className="text-sm font-medium text-zinc-200">
                        {yearData.year}
                      </h3>

                    </div>

                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[750px]">

                        <thead>

                          <tr className="border-b border-zinc-800">

                            <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                              Rank
                            </th>

                            <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                              Movie
                            </th>

                            <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                              India
                            </th>

                            <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                              Overseas
                            </th>

                            <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                              Worldwide
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {yearData.movies.map(
                            (movie, index) => (

                              <tr
                                key={movie.movieId}
                                className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
                              >

                                <td className="px-3 py-3.5 text-zinc-500">
                                  #{index + 1}
                                </td>

                                <td className="px-3 py-3.5">

                                  <Link
                                    href={`/preview/movies/${movie.movieId}`}
                                    className="font-medium text-zinc-200 transition hover:text-violet-300"
                                  >
                                    {movie.title}
                                  </Link>

                                </td>

                                <td className="px-3 py-3.5 text-right text-zinc-400">
                                  {formatCrores(
                                    movie.indiaGross
                                  )}
                                </td>

                                <td className="px-3 py-3.5 text-right text-zinc-400">
                                  {formatCrores(
                                    movie.overseasGross
                                  )}
                                </td>

                                <td className="px-3 py-3.5 text-right font-medium text-white">
                                  {formatCrores(
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

                )
              )}

            </div>

          )}

        </section>

        {/* =====================================================
            PERFORMANCE METRICS
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Performance Analytics
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Industry Performance Metrics
            </h2>

            <p className="mt-1 text-[8px] text-zinc-600">
              Key performance indicators calculated from all movies associated with this industry.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Avg Worldwide
              </p>

              <p className="mt-2 text-lg font-semibold text-violet-300">
                {formatCrores(
                  performanceMetrics?.averageWorldwideGross ?? 0
                )}
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Avg India
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {formatCrores(
                  performanceMetrics?.averageIndiaGross ?? 0
                )}
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Avg Overseas
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {formatCrores(
                  performanceMetrics?.averageOverseasGross ?? 0
                )}
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Highest Grosser
              </p>

              <p className="mt-2 truncate text-sm font-medium text-white">
                {performanceMetrics?.highestWorldwideMovie ||
                  "—"}
              </p>

              <p className="mt-1 text-[8px] text-violet-300">
                {formatCrores(
                  performanceMetrics?.highestWorldwideGross ?? 0
                )}
              </p>

            </div>

          </div>

          {/* SUCCESS MILESTONES */}

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">

            <div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.03] p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                ₹100 Cr+
              </p>

              <p className="mt-2 text-2xl font-semibold text-violet-300">
                {performanceMetrics?.movies100CrPlus ?? 0}
              </p>

              <p className="mt-1 text-[7px] text-zinc-700">
                Movies
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

  <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
    ₹250 Cr+
  </p>

  <p className="mt-2 text-2xl font-semibold text-white">
    {performanceMetrics?.movies250CrPlus ?? 0}
  </p>

  <p className="mt-1 text-[7px] text-zinc-700">
    Movies
  </p>

</div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                ₹500 Cr+
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {performanceMetrics?.movies500CrPlus ?? 0}
              </p>

              <p className="mt-1 text-[7px] text-zinc-700">
                Movies
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                ₹1000 Cr+
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {performanceMetrics?.movies1000CrPlus ?? 0}
              </p>

              <p className="mt-1 text-[7px] text-zinc-700">
                Movies
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            TOP 5 DOMESTIC MARKETS
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Domestic Market Intelligence
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Top 5 Domestic Markets
            </h2>

            <p className="mt-1 text-[8px] text-zinc-600">
              Highest-grossing Indian states for movies associated with this industry.
            </p>

          </div>

          {topDomesticMarkets.length === 0 ? (

            <p className="text-[8px] text-zinc-600">
              No domestic market data available.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px]">

                <thead>

                  <tr className="border-b border-zinc-800">

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Rank
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Market
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Movies
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Gross
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {topDomesticMarkets.map(
                    (market, index) => (

                      <tr
                        key={market.id}
                        className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
                      >

                        <td className="px-3 py-3.5 text-zinc-500">
                          #{index + 1}
                        </td>

                        <td className="px-3 py-3.5 font-medium text-zinc-200">
                          {market.name}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {market.movies}
                        </td>

                        <td className="px-3 py-3.5 text-right font-medium text-white">
                          {formatCrores(
                            market.gross
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =====================================================
            TOP 5 OVERSEAS MARKETS
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Overseas Market Intelligence
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Top 5 Overseas Markets
            </h2>

            <p className="mt-1 text-[8px] text-zinc-600">
              Highest-grossing overseas countries based on country-level USD data.
            </p>

          </div>

          {topOverseasMarkets.length === 0 ? (

            <p className="text-[8px] text-zinc-600">
              No overseas market data available.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px]">

                <thead>

                  <tr className="border-b border-zinc-800">

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Rank
                    </th>

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Market
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Movies
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Gross USD
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {topOverseasMarkets.map(
                    (market, index) => (

                      <tr
                        key={market.id}
                        className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
                      >

                        <td className="px-3 py-3.5 text-zinc-500">
                          #{index + 1}
                        </td>

                        <td className="px-3 py-3.5 font-medium text-zinc-200">
                          {market.name}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {market.movies}
                        </td>

                        <td className="px-3 py-3.5 text-right font-medium text-white">
                          $
                          {market.gross.toLocaleString(
                            "en-US"
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =====================================================
            YEAR-OVER-YEAR GROWTH
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Growth Intelligence
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Year-over-Year Industry Growth
            </h2>

            <p className="mt-1 text-[8px] leading-4 text-zinc-600 sm:text-[9px]">
              Annual change in worldwide box-office performance compared with the immediately preceding year.
            </p>

          </div>

          {yearlyGrowth.length === 0 ? (

            <p className="text-[8px] text-zinc-600">
              No year-over-year growth data available.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[750px]">

                <thead>

                  <tr className="border-b border-zinc-800">

                    <th className="px-3 py-3 text-left text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Year
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Worldwide Gross
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      Previous Year
                    </th>

                    <th className="px-3 py-3 text-right text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                      YoY Growth
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {yearlyGrowth.map(
                    (growth) => (

                      <tr
                        key={growth.year}
                        className="border-b border-zinc-800/70 hover:bg-zinc-900/60"
                      >

                        <td className="px-3 py-3.5 font-medium text-zinc-200">
                          {growth.year}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-400">
                          {formatCrores(
                            growth.worldwideGross
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right text-zinc-500">
                          {growth.previousYearGross === null
                            ? "—"
                            : formatCrores(
                                growth.previousYearGross
                              )}
                        </td>

                        <td className="px-3 py-3.5 text-right font-semibold">

                          {growth.growthPercentage === null ? (

                            <span className="text-zinc-600">
                              —
                            </span>

                          ) : growth.growthPercentage >= 0 ? (

                            <span className="text-green-400">
                              ↑{" "}
                              {growth.growthPercentage.toFixed(
                                2
                              )}
                              %
                            </span>

                          ) : (

                            <span className="text-red-400">
                              ↓{" "}
                              {Math.abs(
                                growth.growthPercentage
                              ).toFixed(
                                2
                              )}
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

        </section>

        {/* =====================================================
            INDUSTRY RECORDS
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Historical Records
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Industry Records
            </h2>

            <p className="mt-1 text-[8px] text-zinc-600">
              Key historical records derived from yearly industry performance.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.03] p-5">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Highest-Grossing Year
              </p>

              <p className="mt-2 text-2xl font-semibold text-violet-300">
                {industryRecords?.highestGrossingYear ??
                  "—"}
              </p>

              <p className="mt-2 text-[8px] text-zinc-600">
                Worldwide Gross
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {formatCrores(
                  industryRecords?.highestGrossingYearAmount ??
                    0
                )}
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-5">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Most Productive Year
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {industryRecords?.mostProductiveYear ??
                  "—"}
              </p>

              <p className="mt-2 text-[8px] text-zinc-600">
                Movies Released
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {industryRecords?.mostProductiveYearMovies ??
                  0}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            DOMESTIC VS OVERSEAS
        ===================================================== */}

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">

          <div className="mb-5">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Market Contribution
            </p>

            <h2 className="mt-1.5 text-base font-medium sm:text-lg">
              Domestic vs Overseas Contribution
            </h2>

            <p className="mt-1 text-[8px] leading-4 text-zinc-600 sm:text-[9px]">
              Contribution of India and overseas markets to this industry&apos;s total worldwide gross.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <div className="rounded-xl border border-zinc-800 bg-black p-5">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                India Contribution
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {marketContribution
                  ? `${marketContribution.indiaPercentage.toFixed(
                      2
                    )}%`
                  : "—"}
              </p>

              <p className="mt-2 text-[8px] text-zinc-600">
                India Gross
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {formatCrores(
                  intelligence?.indiaGross ?? 0
                )}
              </p>

            </div>

            <div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.03] p-5">

              <p className="text-[7px] uppercase tracking-[0.14em] text-zinc-600">
                Overseas Contribution
              </p>

              <p className="mt-2 text-2xl font-semibold text-violet-300">
                {marketContribution
                  ? `${marketContribution.overseasPercentage.toFixed(
                      2
                    )}%`
                  : "—"}
              </p>

              <p className="mt-2 text-[8px] text-zinc-600">
                Overseas Gross
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {formatCrores(
                  intelligence?.overseasGross ?? 0
                )}
              </p>

            </div>

          </div>

          {marketContribution && (
            <div className="mt-5">

              <div className="mb-2 flex justify-between text-[7px] uppercase tracking-[0.12em] text-zinc-600">

                <span>
                  India{" "}
                  {marketContribution.indiaPercentage.toFixed(
                    1
                  )}
                  %
                </span>

                <span>
                  Overseas{" "}
                  {marketContribution.overseasPercentage.toFixed(
                    1
                  )}
                  %
                </span>

              </div>

              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-900">

                <div
                  className="h-full bg-zinc-500 transition-all"
                  style={{
                    width: `${marketContribution.indiaPercentage}%`,
                  }}
                />

                <div
                  className="h-full bg-violet-400/80 transition-all"
                  style={{
                    width: `${marketContribution.overseasPercentage}%`,
                  }}
                />

              </div>

            </div>
          )}

        </section>

        {/* =====================================================
            INTELLIGENCE NOTE
        ===================================================== */}

        <section className="mt-4 rounded-xl border border-zinc-900 bg-zinc-950/60 px-4 py-4">

          <div className="flex items-start gap-3">

            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/70" />

            <p className="text-[8px] leading-4 text-zinc-700">
              Industry intelligence is generated from JMI&apos;s structured
              industry, movie and box-office records. Worldwide gross combines
              India and overseas gross. Domestic market rankings use STATE-level
              records, while overseas market rankings use country-level USD
              records. Figures reflect the data currently available in JMI.
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}