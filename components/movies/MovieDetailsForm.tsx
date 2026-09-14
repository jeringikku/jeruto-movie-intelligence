"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
  original_title: string | null;
  slug: string;
  release_date: string | null;
  release_year: number | null;
  runtime_minutes: number | null;
  certification_id: number | null;
  synopsis: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  imdb_id: string | null;
  is_active: boolean | null;
};

type Certification = {
  id: number;
  name: string;
  description: string | null;
};

type Industry = {
  id: number;
  name: string;
  short_name: string | null;
  industry_type: string | null;
};

type MovieIndustry = {
  industry_id: number;
  is_primary: boolean;
};

type Language = {
  id: number;
  name: string;
  native_name: string | null;
  iso_code: string | null;
};

type Genre = {
  id: number;
  name: string;
  slug: string | null;
};

type MovieLanguage = {
  language_id: number;
  language_type: string;
  is_primary: boolean | null;
};

type Props = {
  movie: Movie;
};

export default function MovieDetailsForm({ movie }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(movie.title);

  const [originalTitle, setOriginalTitle] = useState(
    movie.original_title ?? ""
  );

  const [slug, setSlug] = useState(movie.slug ?? "");

  const [releaseDate, setReleaseDate] = useState(
    movie.release_date ?? ""
  );

  const [releaseYear, setReleaseYear] = useState(
    movie.release_year?.toString() ?? ""
  );

  const [runtime, setRuntime] = useState(
    movie.runtime_minutes?.toString() ?? ""
  );

  const [certificationId, setCertificationId] = useState(
    movie.certification_id?.toString() ?? ""
  );

  const [industries, setIndustries] = useState<Industry[]>([]);

  const [synopsis, setSynopsis] = useState(
    movie.synopsis ?? ""
  );

  const [posterUrl, setPosterUrl] = useState(
    movie.poster_url ?? ""
  );

  const [backdropUrl, setBackdropUrl] = useState(
    movie.backdrop_url ?? ""
  );

  const [trailerUrl, setTrailerUrl] = useState(
    movie.trailer_url ?? ""
  );

  const [imdbId, setImdbId] = useState(
    movie.imdb_id ?? ""
  );

  const [isActive, setIsActive] = useState(
    movie.is_active ?? true
  );

  // ==========================================
  // MASTER DATA
  // ==========================================

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<number[]>([]);
const [primaryIndustryId, setPrimaryIndustryId] = useState<number | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  // ==========================================
  // MOVIE LANGUAGE / GENRE SELECTIONS
  // ==========================================

  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);

  const [languageTypes, setLanguageTypes] = useState<
    Record<number, string>
  >({});

  const [primaryLanguage, setPrimaryLanguage] = useState<number | null>(
    null
  );

  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  // ==========================================
  // LOADING
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [loadingCertifications, setLoadingCertifications] = useState(true);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);

  // ==========================================
  // LOAD CERTIFICATIONS
  // ==========================================

  useEffect(() => {
    async function loadCertifications() {
      const { data, error } = await supabase
        .from("certifications")
        .select("id, name, description")
        .eq("is_active", true)
        .order("id");

      if (!error && data) {
        setCertifications(data);
      }

      setLoadingCertifications(false);
    }

    loadCertifications();
  }, []);

  useEffect(() => {
  async function loadIndustries() {
    setLoadingIndustries(true);

    const [
      { data: industryData, error: industryError },
      { data: movieIndustryData, error: movieIndustryError },
    ] = await Promise.all([
      supabase
        .from("industries")
        .select("id, name, short_name, industry_type")
        .eq("is_active", true)
        .order("display_order")
        .order("name"),

      supabase
        .from("movie_industries")
        .select("industry_id, is_primary")
        .eq("movie_id", movie.id),
    ]);

    if (industryError) {
      console.error("Failed to load industries:", industryError);
    } else {
      setIndustries(industryData ?? []);
    }

    if (movieIndustryError) {
      console.error(
        "Failed to load movie industries:",
        movieIndustryError
      );
    } else {
      const assignments = (movieIndustryData ?? []) as MovieIndustry[];

      setSelectedIndustries(
        assignments.map((item) => item.industry_id)
      );

      const primary = assignments.find(
        (item) => item.is_primary
      );

      setPrimaryIndustryId(primary?.industry_id ?? null);
    }

    setLoadingIndustries(false);
  }

  loadIndustries();
}, [movie.id]);

  // ==========================================
  // LOAD LANGUAGES
  // ==========================================

  useEffect(() => {
    async function loadLanguages() {
      setLoadingLanguages(true);

      const { data, error } = await supabase
        .from("languages")
        .select("id, name, native_name, iso_code")
        .order("name");

      if (!error && data) {
        setLanguages(data);
      } else if (error) {
        console.error("Language loading error:", error);
      }

      setLoadingLanguages(false);
    }

    loadLanguages();
  }, []);

  // ==========================================
  // LOAD GENRES
  // ==========================================

  useEffect(() => {
    async function loadGenres() {
      setLoadingGenres(true);

      const { data, error } = await supabase
        .from("genres")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name");

      if (!error && data) {
        setGenres(data);
      } else if (error) {
        console.error("Genre loading error:", error);
      }

      setLoadingGenres(false);
    }

    loadGenres();
  }, []);

  // ==========================================
  // LOAD EXISTING MOVIE LANGUAGES
  // ==========================================

  useEffect(() => {
    async function loadMovieLanguages() {
      const { data, error } = await supabase
        .from("movie_languages")
        .select("language_id, language_type, is_primary")
        .eq("movie_id", movie.id);

      if (error) {
        console.error("Movie language loading error:", error);
        return;
      }

      if (data) {
        const rows = data as MovieLanguage[];

        setSelectedLanguages(rows.map((row) => row.language_id));

        const types: Record<number, string> = {};

        rows.forEach((row) => {
          types[row.language_id] = row.language_type || "Original";
        });

        setLanguageTypes(types);

        const primary = rows.find((row) => row.is_primary);

        if (primary) {
          setPrimaryLanguage(primary.language_id);
        }
      }
    }

    loadMovieLanguages();
  }, [movie.id]);

  // ==========================================
  // LOAD EXISTING MOVIE GENRES
  // ==========================================

  useEffect(() => {
    async function loadMovieGenres() {
      const { data, error } = await supabase
        .from("movie_genres")
        .select("genre_id")
        .eq("movie_id", movie.id);

      if (error) {
        console.error("Movie genre loading error:", error);
        return;
      }

      if (data) {
        setSelectedGenres(
          data.map((row) => row.genre_id)
        );
      }
    }

    loadMovieGenres();
  }, [movie.id]);

  // ==========================================
  // YOUTUBE
  // ==========================================

  function getYouTubeEmbedUrl(url: string) {
    try {
      const parsedUrl = new URL(url);

      // youtu.be/VIDEO_ID
      if (parsedUrl.hostname === "youtu.be") {
        const videoId = parsedUrl.pathname
          .replace("/", "")
          .trim();

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // youtube.com
      if (
        parsedUrl.hostname === "www.youtube.com" ||
        parsedUrl.hostname === "youtube.com" ||
        parsedUrl.hostname === "m.youtube.com"
      ) {
        const videoId = parsedUrl.searchParams.get("v");

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }

        if (parsedUrl.pathname.startsWith("/embed/")) {
          const videoId = parsedUrl.pathname
            .replace("/embed/", "")
            .split("/")[0];

          if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
          }
        }

        if (parsedUrl.pathname.startsWith("/shorts/")) {
          const videoId = parsedUrl.pathname
            .replace("/shorts/", "")
            .split("/")[0];

          if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
          }
        }
      }

      return "";
    } catch {
      return "";
    }
  }

  // ==========================================
  // SLUG
  // ==========================================

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(generateSlug(value));
  }

  // ==========================================
  // LANGUAGE SELECTION
  // ==========================================

  function toggleLanguage(languageId: number) {
    setSelectedLanguages((current) => {
      if (current.includes(languageId)) {
        const updated = current.filter((id) => id !== languageId);

        if (primaryLanguage === languageId) {
          setPrimaryLanguage(
            updated.length > 0 ? updated[0] : null
          );
        }

        return updated;
      }

      setLanguageTypes((currentTypes) => ({
        ...currentTypes,
        [languageId]: currentTypes[languageId] || "Original",
      }));

      return [...current, languageId];
    });
  }

  function handleLanguageTypeChange(
    languageId: number,
    value: string
  ) {
    setLanguageTypes((current) => ({
      ...current,
      [languageId]: value,
    }));
  }

  function handlePrimaryLanguageChange(languageId: number) {
    setPrimaryLanguage(languageId);
  }

  // ==========================================
  // GENRE SELECTION
  // ==========================================

  function toggleGenre(genreId: number) {
    setSelectedGenres((current) => {
      if (current.includes(genreId)) {
        return current.filter((id) => id !== genreId);
      }

      return [...current, genreId];
    });
  }

  // ==========================================
  // SAVE
  // ==========================================

  async function handleSave() {
    if (!title.trim()) {
      alert("Movie title is required.");
      return;
    }

    if (
      primaryLanguage !== null &&
      !selectedLanguages.includes(primaryLanguage)
    ) {
      alert("Primary language must be one of the selected languages.");
      return;
    }

    if (
  primaryIndustryId !== null &&
  !selectedIndustries.includes(primaryIndustryId)
) {
  alert("Primary industry must be one of the selected industries.");
  return;
}

    setLoading(true);

    // ========================================
    // UPDATE MOVIE
    // ========================================

    const { error: movieError } = await supabase
      .from("movies")
      .update({
        title: title.trim(),
        original_title: originalTitle.trim() || null,
        slug: slug.trim() || generateSlug(title),

        release_date: releaseDate || null,

        release_year:
          releaseYear === ""
            ? null
            : Number(releaseYear),

        runtime_minutes:
          runtime === ""
            ? null
            : Number(runtime),

        certification_id:
          certificationId === ""
            ? null
            : Number(certificationId),

        synopsis: synopsis.trim() || null,

        poster_url: posterUrl.trim() || null,
        backdrop_url: backdropUrl.trim() || null,
        trailer_url: trailerUrl.trim() || null,

        imdb_id: imdbId.trim() || null,

        is_active: isActive,
      })
      .eq("id", movie.id);

    if (movieError) {
      setLoading(false);
      alert(movieError.message);
      return;
    }

    // ========================================
    // SAVE MOVIE LANGUAGES
    // ========================================

    const { error: deleteLanguageError } = await supabase
      .from("movie_languages")
      .delete()
      .eq("movie_id", movie.id);

    if (deleteLanguageError) {
      setLoading(false);
      alert(
        `Movie saved, but languages could not be updated.\n\n${deleteLanguageError.message}`
      );
      return;
    }

    if (selectedLanguages.length > 0) {
      const languageRows = selectedLanguages.map((languageId) => ({
        movie_id: movie.id,
        language_id: languageId,
        language_type: languageTypes[languageId] || "Original",
        is_primary: languageId === primaryLanguage,
      }));

      const { error: languageInsertError } = await supabase
        .from("movie_languages")
        .insert(languageRows);

      if (languageInsertError) {
        setLoading(false);
        alert(
          `Movie saved, but languages could not be inserted.\n\n${languageInsertError.message}`
        );
        return;
      }
    }

    // ========================================
    // SAVE MOVIE GENRES
    // ========================================

    const { error: deleteGenreError } = await supabase
      .from("movie_genres")
      .delete()
      .eq("movie_id", movie.id);

    if (deleteGenreError) {
      setLoading(false);
      alert(
        `Movie and languages saved, but genres could not be updated.\n\n${deleteGenreError.message}`
      );
      return;
    }

    if (selectedGenres.length > 0) {
      const genreRows = selectedGenres.map((genreId) => ({
        movie_id: movie.id,
        genre_id: genreId,
      }));

      const { error: genreInsertError } = await supabase
        .from("movie_genres")
        .insert(genreRows);

      if (genreInsertError) {
        setLoading(false);
        alert(
          `Movie saved, but genres could not be inserted.\n\n${genreInsertError.message}`
        );
        return;
      }
    }

    // ========================================
    // SAVE MOVIE INDUSTRIES
    // ========================================

    const { error: deleteIndustryError } = await supabase
      .from("movie_industries")
      .delete()
      .eq("movie_id", movie.id);

    if (deleteIndustryError) {
      setLoading(false);
      alert(
        `Movie, languages & genres saved, but industries could not be updated.\n\n${deleteIndustryError.message}`
      );
      return;
    }

    if (selectedIndustries.length > 0) {
      const industryRows = selectedIndustries.map((industryId) => ({
        movie_id: movie.id,
        industry_id: industryId,
        is_primary: industryId === primaryIndustryId,
      }));

      const { error: industryInsertError } = await supabase
        .from("movie_industries")
        .insert(industryRows);

      if (industryInsertError) {
        setLoading(false);
        alert(
          `Movie, languages & genres saved, but industries could not be inserted.\n\n${industryInsertError.message}`
        );
        return;
      }
    }

    setLoading(false);

    alert("🎉 Movie, languages, genres & industries updated successfully!");

    router.refresh();
  }

  return (
    <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900 p-6">

      {/* ===================================== */}
      {/* PAGE HEADING */}
      {/* ===================================== */}

      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">
          Movie Details
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Manage the core information for this movie.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* ===================================== */}
        {/* BASIC INFORMATION */}
        {/* ===================================== */}

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-white">
            Basic Information
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Core identification information for the movie.
          </p>
        </div>

        {/* Movie Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Movie Title
          </label>

          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="Enter movie title"
          />
        </div>

        {/* Original Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Original Title
          </label>

          <input
            value={originalTitle}
            onChange={(e) => setOriginalTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="Enter original title"
          />
        </div>

        {/* Slug */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Slug
          </label>

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="movie-slug"
          />

          <p className="mt-1 text-xs text-zinc-500">
            Used for the public movie URL.
          </p>
        </div>

        {/* ===================================== */}
        {/* LANGUAGE & GENRE */}
        {/* ===================================== */}

        <div className="mt-4 border-t border-zinc-800 pt-6 md:col-span-2">

          <h3 className="text-lg font-semibold text-white">
            Language & Genre
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Define the movie's languages and genres.
          </p>

        </div>

        {/* ===================================== */}
        {/* LANGUAGES */}
        {/* ===================================== */}

        <div className="md:col-span-2">

          <div className="mb-3 flex items-center justify-between">

            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Movie Languages
              </label>

              <p className="mt-1 text-xs text-zinc-500">
                Select all languages associated with this movie.
              </p>
            </div>

            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
              {selectedLanguages.length} selected
            </span>

          </div>

          {loadingLanguages ? (
            <div className="rounded-lg border border-zinc-700 bg-black p-4 text-sm text-zinc-500">
              Loading languages...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {languages.map((language) => {

                const selected =
                  selectedLanguages.includes(language.id);

                return (
                  <div
                    key={language.id}
                    className={`rounded-lg border p-4 transition ${
                      selected
                        ? "border-yellow-500/50 bg-yellow-500/5"
                        : "border-zinc-700 bg-black"
                    }`}
                  >

                    <label className="flex cursor-pointer items-start gap-3">

                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleLanguage(language.id)
                        }
                        className="mt-1 h-4 w-4 accent-yellow-500"
                      />

                      <div className="min-w-0">

                        <p className="font-medium text-white">
                          {language.name}
                        </p>

                        {language.native_name &&
                          language.native_name !== language.name && (
                            <p className="mt-1 text-xs text-zinc-500">
                              {language.native_name}
                            </p>
                          )}

                        {language.iso_code && (
                          <p className="mt-1 text-xs uppercase text-zinc-600">
                            {language.iso_code}
                          </p>
                        )}

                      </div>

                    </label>

                    {selected && (
                      <div className="mt-4 space-y-3 border-t border-zinc-800 pt-3">

                        {/* Language Type */}

                        <div>

                          <label className="mb-1 block text-xs font-medium text-zinc-400">
                            Language Type
                          </label>

                          <select
                            value={
                              languageTypes[language.id] ||
                              "Original"
                            }
                            onChange={(e) =>
                              handleLanguageTypeChange(
                                language.id,
                                e.target.value
                              )
                            }
                            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                          >

                            <option value="Original">
                              Original
                            </option>

                            <option value="Dubbed">
                              Dubbed
                            </option>

                            <option value="Other">
                              Other
                            </option>

                          </select>

                        </div>

                        {/* Primary Language */}

                        <label className="flex cursor-pointer items-center gap-2">

                          <input
                            type="radio"
                            name="primary-language"
                            checked={
                              primaryLanguage === language.id
                            }
                            onChange={() =>
                              handlePrimaryLanguageChange(
                                language.id
                              )
                            }
                            className="h-4 w-4 accent-yellow-500"
                          />

                          <span className="text-xs text-zinc-400">
                            Primary language
                          </span>

                        </label>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* ===================================== */}
        {/* GENRES */}
        {/* ===================================== */}

        <div className="md:col-span-2">

          <div className="mb-3 flex items-center justify-between">

            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Movie Genres
              </label>

              <p className="mt-1 text-xs text-zinc-500">
                Select all genres that describe this movie.
              </p>
            </div>

            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
              {selectedGenres.length} selected
            </span>

          </div>

          {loadingGenres ? (
            <div className="rounded-lg border border-zinc-700 bg-black p-4 text-sm text-zinc-500">
              Loading genres...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

              {genres.map((genre) => {

                const selected =
                  selectedGenres.includes(genre.id);

                return (
                  <label
                    key={genre.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                      selected
                        ? "border-yellow-500/50 bg-yellow-500/5"
                        : "border-zinc-700 bg-black"
                    }`}
                  >

                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleGenre(genre.id)
                      }
                      className="h-4 w-4 accent-yellow-500"
                    />

                    <span className="text-sm font-medium text-white">
                      {genre.name}
                    </span>

                  </label>
                );
              })}

            </div>
          )}

        </div>

        {/* ===================================== */}
        {/* RELEASE INFORMATION */}
        {/* ===================================== */}

        <div className="mt-4 border-t border-zinc-800 pt-6 md:col-span-2">

          <h3 className="text-lg font-semibold text-white">
            Release Information
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Release date, runtime and certification information.
          </p>

        </div>

        {/* Release Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Release Date
          </label>

          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
          />
        </div>

        {/* Release Year */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Release Year
          </label>

          <input
            type="number"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="2026"
          />
        </div>

        {/* Runtime */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Runtime (minutes)
          </label>

          <input
            type="number"
            min="1"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="152"
          />
        </div>

        {/* Certification */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Certification
          </label>

          <select
            value={certificationId}
            onChange={(e) => setCertificationId(e.target.value)}
            disabled={loadingCertifications}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
          >

            <option value="">
              {loadingCertifications
                ? "Loading certifications..."
                : "Select certification"}
            </option>

            {certifications.map((certification) => (
              <option
                key={certification.id}
                value={certification.id}
              >
                {certification.name}
              </option>
            ))}

          </select>
        </div>


        {/* ===================================== */}
{/* INDUSTRY */}
{/* ===================================== */}

<div className="mt-4 border-t border-zinc-800 pt-6 md:col-span-2">
  <h3 className="text-lg font-semibold text-white">
    Movie Industry
  </h3>

  <p className="mt-1 text-sm text-zinc-500">
    Select the film industry or industries associated with this movie.
  </p>
</div>

<div className="md:col-span-2">

  {loadingIndustries ? (
    <div className="rounded-lg border border-zinc-700 bg-black p-4 text-sm text-zinc-500">
      Loading industries...
    </div>
  ) : industries.length === 0 ? (
    <div className="rounded-lg border border-zinc-700 bg-black p-4 text-sm text-zinc-500">
      No active industries available.
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

      {industries.map((industry) => {
        const isSelected = selectedIndustries.includes(industry.id);
        const isPrimary = primaryIndustryId === industry.id;

        return (
          <div
            key={industry.id}
            className={`rounded-lg border p-4 transition ${
              isSelected
                ? "border-yellow-500 bg-yellow-500/5"
                : "border-zinc-700 bg-black"
            }`}
          >

            {/* Industry Selection */}
            <label className="flex cursor-pointer items-start gap-3">

              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIndustries((current) => [
                      ...current,
                      industry.id,
                    ]);
                  } else {
                    setSelectedIndustries((current) =>
                      current.filter((id) => id !== industry.id)
                    );

                    if (primaryIndustryId === industry.id) {
                      setPrimaryIndustryId(null);
                    }
                  }
                }}
                className="mt-1 h-4 w-4 accent-yellow-500"
              />

              <div>
                <p className="font-medium text-white">
                  {industry.name}
                </p>

                {industry.short_name && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {industry.short_name}
                  </p>
                )}

                {industry.industry_type && (
                  <p className="mt-1 text-xs text-zinc-600">
                    {industry.industry_type}
                  </p>
                )}
              </div>

            </label>

            {/* Primary Industry */}
            {isSelected && (
              <div className="mt-4 border-t border-zinc-800 pt-3">

                <label className="flex cursor-pointer items-center gap-2">

                  <input
                    type="radio"
                    name="primaryIndustry"
                    checked={isPrimary}
                    onChange={() => {
                      setPrimaryIndustryId(industry.id);
                    }}
                    className="h-4 w-4 accent-yellow-500"
                  />

                  <span className="text-xs font-medium text-zinc-400">
                    Primary Industry
                  </span>

                </label>

              </div>
            )}

          </div>
        );
      })}

    </div>
  )}

  {/* Selection Summary */}
  {!loadingIndustries && selectedIndustries.length > 0 && (
    <div className="mt-4 rounded-lg border border-zinc-800 bg-black/50 p-3">

      <p className="text-sm text-zinc-400">
        <span className="font-semibold text-white">
          {selectedIndustries.length}
        </span>{" "}
        {selectedIndustries.length === 1
          ? "industry selected"
          : "industries selected"}
      </p>

      {primaryIndustryId && (
        <p className="mt-1 text-xs text-yellow-500">
          Primary industry selected
        </p>
      )}

    </div>
  )}

</div>

        {/* ===================================== */}
        {/* IDENTIFICATION */}
        {/* ===================================== */}

        <div className="mt-4 border-t border-zinc-800 pt-6 md:col-span-2">

          <h3 className="text-lg font-semibold text-white">
            Identification
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            External identifiers associated with this movie.
          </p>

        </div>

        {/* IMDb ID */}
        <div className="md:col-span-2">

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            IMDb ID
          </label>

          <input
            value={imdbId}
            onChange={(e) => setImdbId(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="tt1234567"
          />

        </div>

        {/* ===================================== */}
        {/* STORY */}
        {/* ===================================== */}

        <div className="mt-4 border-t border-zinc-800 pt-6 md:col-span-2">

          <h3 className="text-lg font-semibold text-white">
            Story
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Editorial synopsis for the movie.
          </p>

        </div>

        {/* Synopsis */}
        <div className="md:col-span-2">

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Synopsis
          </label>

          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="Enter movie synopsis..."
          />

        </div>

        {/* ===================================== */}
        {/* MEDIA */}
        {/* ===================================== */}

        <div className="mt-4 border-t border-zinc-800 pt-6 md:col-span-2">

          <h3 className="text-lg font-semibold text-white">
            Media
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Manage external media assets for this movie.
          </p>

        </div>

        {/* Poster */}
        <div>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Poster URL
          </label>

          <input
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="https://..."
          />

          <p className="mt-1 text-xs text-zinc-500">
            External URL of the movie poster.
          </p>

          {posterUrl.trim() && (
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-700 bg-black">

              <div className="border-b border-zinc-700 px-4 py-2">

                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Poster Preview
                </p>

              </div>

              <div className="flex justify-center p-4">

                <img
                  src={posterUrl}
                  alt={`${title} poster`}
                  className="max-h-80 w-auto rounded-md object-contain"
                  onLoad={() => {
                    console.log(
                      "Poster loaded successfully:",
                      posterUrl
                    );
                  }}
                  onError={(e) => {
                    console.error(
                      "Poster failed to load:",
                      posterUrl
                    );
                    e.currentTarget.style.display = "none";
                  }}
                />

              </div>

            </div>
          )}

        </div>

        {/* Backdrop */}
        <div>

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Backdrop URL
          </label>

          <input
            value={backdropUrl}
            onChange={(e) => setBackdropUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="https://..."
          />

          <p className="mt-1 text-xs text-zinc-500">
            External URL of the movie backdrop.
          </p>

          {backdropUrl.trim() && (
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-700 bg-black">

              <div className="border-b border-zinc-700 px-4 py-2">

                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Backdrop Preview
                </p>

              </div>

              <div className="p-4">

                <img
                  src={backdropUrl}
                  alt={`${title} backdrop`}
                  className="max-h-64 w-full rounded-md object-cover"
                />

              </div>

            </div>
          )}

        </div>

        {/* Trailer */}
        <div className="md:col-span-2">

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Trailer URL
          </label>

          <input
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
            placeholder="https://youtube.com/watch?v=..."
          />

          <p className="mt-1 text-xs text-zinc-500">
            YouTube trailer or teaser URL.
          </p>

          {trailerUrl.trim() &&
            getYouTubeEmbedUrl(trailerUrl) && (

              <div className="mt-4 overflow-hidden rounded-lg border border-zinc-700 bg-black">

                <div className="border-b border-zinc-700 px-4 py-2">

                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Trailer Preview
                  </p>

                </div>

                <div className="aspect-video w-full">

                  <iframe
                    src={getYouTubeEmbedUrl(trailerUrl)}
                    title={`${title} trailer`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />

                </div>

              </div>

            )}

        </div>

      </div>

      {/* ===================================== */}
      {/* STATUS */}
      {/* ===================================== */}

      <div className="mt-10 border-t border-zinc-800 pt-6">

        <h3 className="text-lg font-semibold text-white">
          Status
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Control whether this movie is available in the public database.
        </p>

        <div className="mt-4 rounded-lg border border-zinc-700 bg-black/50 p-4">

          <label className="flex cursor-pointer items-center gap-3">

            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-yellow-500"
            />

            <div>

              <p className="font-medium text-white">
                Active Movie
              </p>

              <p className="text-sm text-zinc-500">
                Inactive movies can be hidden from the public database.
              </p>

            </div>

          </label>

        </div>

      </div>

      {/* ===================================== */}
      {/* SAVE BUTTON */}
      {/* ===================================== */}

      <div className="mt-8 flex justify-end">

        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>
  );
}