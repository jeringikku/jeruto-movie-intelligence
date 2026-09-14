"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CompaniesTab from "./CompaniesTab";
import MovieDetailsForm from "./MovieDetailsForm";
import ReleasesTab from "./ReleaseTab";
import CastCrewTab from "./CastCrewTab";
import RecordsTab from "./RecordsTab";

type Movie = {
  id: number;
  title: string;
  original_title: string | null;
  slug: string;
  release_date: string | null;
  ott_release_date: string | null;
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

type Props = {
  movie: Movie;
};

export default function MovieWorkspace({ movie }: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900">

      <div className="flex flex-wrap gap-2 border-b border-zinc-700 p-4">

        <button
          onClick={() => setActiveTab("details")}
          className={`rounded-lg px-4 py-2 font-semibold ${
            activeTab === "details"
              ? "bg-yellow-500 text-black"
              : "text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          Movie Details
        </button>

        <button
          onClick={() => setActiveTab("cast")}
          className={`rounded-lg px-4 py-2 font-semibold ${
            activeTab === "cast"
              ? "bg-yellow-500 text-black"
              : "text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          Cast & Crew
        </button>

        <button
          onClick={() => setActiveTab("companies")}
          className={`rounded-lg px-4 py-2 font-semibold ${
            activeTab === "companies"
              ? "bg-yellow-500 text-black"
              : "text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          Companies
        </button>

        <button
          onClick={() => setActiveTab("releases")}
          className={`rounded-lg px-4 py-2 font-semibold ${
            activeTab === "releases"
              ? "bg-yellow-500 text-black"
              : "text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          Releases
        </button>

        <button
          onClick={() => {
            window.location.href = `/admin/advance-booking?movieId=${movie.id}`;
          }}
          className="rounded-lg px-4 py-2 text-zinc-300 hover:bg-zinc-800"
        >
          Advance Booking
        </button>

        <button
          onClick={() => router.push("/admin/box-office")}
          className="rounded-lg px-4 py-2 font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          Box Office
        </button>

        {/* OFFICIAL COLLECTION */}
        <button
          onClick={() => {
            window.location.href = `/admin/official-collection/${movie.id}`;
          }}
          className="rounded-lg px-4 py-2 font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          Official Collection
        </button>

        <button
          onClick={() => {
            window.location.href = `/admin/movie-business?movieId=${movie.id}`;
          }}
          className="rounded-lg px-4 py-2 font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          Movie Business
        </button>

        <button
  onClick={() => setActiveTab("records")}
  className={`rounded-lg px-4 py-2 font-semibold ${
    activeTab === "records"
      ? "bg-yellow-500 text-black"
      : "text-zinc-300 hover:bg-zinc-800"
  }`}
>
  Records
</button>

        <button className="rounded-lg px-4 py-2 text-zinc-300 hover:bg-zinc-800">
          Media
        </button>

        <button
          onClick={() => {
            window.location.href = `/admin/awards?movieId=${movie.id}`;
          }}
          className="rounded-lg px-4 py-2 font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          Awards
        </button>

      </div>

      {activeTab === "details" && (
        <MovieDetailsForm movie={movie} />
      )}

      {activeTab === "cast" && (
        <CastCrewTab movieId={movie.id} />
      )}

      {activeTab === "companies" && (
        <CompaniesTab movieId={movie.id} />
      )}

      {activeTab === "releases" && (
        <ReleasesTab
          movieId={movie.id}
          releaseDate={movie.release_date}
          ottReleaseDate={movie.ott_release_date}
        />
      )}

      {activeTab === "records" && (
  <RecordsTab movieId={movie.id} />
)}

    </div>
  );
}