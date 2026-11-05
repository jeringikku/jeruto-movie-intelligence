import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import PublicHeader from "../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type Movie = {
  id: number;
  title: string;
  slug: string;
  release_year: number | null;
  release_date: string | null;
  poster_url: string | null;
};

type PortalMovieRecord = {
  id: number;
  movie_id: number;
  is_active: boolean;
  display_order: number | null;
};

type CollectionDay = {
  day_number: number | null;
};

const getMovieBySlug = cache(async (slug: string) => {
  const { data, error } = await supabase
    .from("movies")
    .select("id, title, slug, release_year, release_date, poster_url")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Daily Box Office movie lookup error:", error);
    return null;
  }

  return data as Movie | null;
});

const getActivePortalMovie = cache(async (movieId: number) => {
  const { data, error } = await supabase
    .from("jmi_daily_box_office_portal")
    .select("id, movie_id, is_active, display_order")
    .eq("row_type", "MOVIE")
    .eq("movie_id", movieId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Daily Box Office portal lookup error:", error);
    return null;
  }

  return data as PortalMovieRecord | null;
});

function getIndiaDate() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatReleaseDate(date: string | null) {
  if (!date) return null;

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  if (!movie) {
    return {
      title: "Movie Daily Box-Office Collection | JMI",
      description: "Daily movie box-office collection reports from JMI.",
    };
  }

  const title = `${movie.title} Daily Box-Office Collection | JMI`;
  const description = `Explore the day-wise box-office collection reports for ${movie.title}. View individual daily collection reports by territory through Jeruto Movie Intelligence.`;

  const canonical = `https://jeruto.com/preview/daily-box-office/${movie.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Jeruto Movie Intelligence",
      type: "website",
      images: movie.poster_url ? [movie.poster_url] : [],
    },
  };
}

export default async function DailyBoxOfficeMoviePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const movie = await getMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  const activeMovie = await getActivePortalMovie(movie.id);

  if (!activeMovie) {
    notFound();
  }

  const { data: collectionRows, error } = await supabase
    .from("jmi_daily_box_office_portal")
    .select("day_number")
    .eq("row_type", "COLLECTION")
    .eq("movie_id", movie.id)
    .not("day_number", "is", null)
    .order("day_number", { ascending: true });

  if (error) {
    console.error("Daily Box Office day lookup error:", error);
  }

  const days = Array.from(
    new Set(
      ((collectionRows ?? []) as CollectionDay[])
        .map((row) => row.day_number)
        .filter(
          (day): day is number =>
            typeof day === "number" &&
            Number.isInteger(day) &&
            day > 0
        )
    )
  ).sort((a, b) => a - b);

  const releaseDate = formatReleaseDate(movie.release_date);

  const canonical = `https://jeruto.com/preview/daily-box-office/${movie.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${movie.title} Daily Box-Office Collection`,
    description: `Day-wise box-office collection reports for ${movie.title}.`,
    url: canonical,
    about: {
      "@type": "Movie",
      name: movie.title,
      datePublished: movie.release_date || undefined,
      image: movie.poster_url || undefined,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "JMI",
          item: "https://jeruto.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Daily Box-Office Portal",
          item: "https://jeruto.com/preview/daily-box-office",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: movie.title,
          item: canonical,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#171717]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* Newspaper Masthead */}
        <div className="border-y-2 border-black py-3">
          <div className="flex flex-col justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600 sm:flex-row sm:items-center">
            <span>JMI · Cinema · Trade · Data</span>
            <span>{getIndiaDate()}</span>
          </div>

          <div className="mt-2 flex flex-col justify-between gap-1 border-t border-neutral-300 pt-2 sm:flex-row sm:items-center">
            <span className="text-xs font-bold uppercase tracking-[0.12em]">
              Day wise Collection Report
            </span>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mt-5 text-xs text-neutral-500">
          <Link
            href="/preview/daily-box-office"
            className="transition hover:text-black hover:underline"
          >
            Daily Box-Office Portal
          </Link>

          <span className="mx-2">/</span>

          <span className="font-semibold text-neutral-800">
            {movie.title}
          </span>
        </div>

        {/* Movie Profile */}
        <section className="mt-6 border-b border-neutral-300 pb-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {movie.poster_url ? (
              <div className="w-36 shrink-0 sm:w-44">
                <div className="overflow-hidden border border-neutral-300 bg-white p-1 shadow-sm">
                  <img
                    src={movie.poster_url}
                    alt={`${movie.title} movie poster`}
                    className="aspect-[2/3] w-full object-cover"
                  />
                </div>
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                JMI Daily Box-Office Report
              </p>

              <h1 className="mt-2 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {movie.title}
              </h1>

              {movie.release_year ? (
                <p className="mt-3 text-sm font-medium text-neutral-600">
                  {movie.release_year}
                </p>
              ) : null}

              {releaseDate ? (
                <p className="mt-1 text-xs text-neutral-800">
                  Release Date: {releaseDate}
                </p>
              ) : null}

              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
                Explore the day-wise theatrical box-office collection
                reports for this movie. Select a day below to view its
                territory-wise collection and total daily gross.
              </p>
            </div>
          </div>
        </section>

        {/* Day Reports */}
        <section className="py-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Collection Archive
              </p>

              <h2 className="mt-1 font-serif text-xl font-bold sm:text-3xl">
                Daily Collection Report
              </h2>
            </div>

            <p className="text-xs text-neutral-500">
              {days.length} {days.length === 1 ? "report" : "reports"} available
            </p>
          </div>

          {days.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">

              {days.map((day) => (
                <Link
                  key={day}
                  href={`/preview/daily-box-office/${movie.slug}/day/${day}`}
                  aria-label={`View Day ${day} box-office collection report for ${movie.title}`}
                  className="
                    group relative flex min-h-[112px] flex-col
                    items-center justify-center overflow-hidden
                    rounded-2xl border border-[#789194]/70
                    bg-gradient-to-br from-[#e9efed] via-[#dce6e3] to-[#cbdad6]
                    px-4 py-5 text-center
                    shadow-[0_3px_10px_rgba(61,91,88,0.08)]
                    transition-all duration-300 ease-out
                    hover:-translate-y-1
                    hover:border-[#587b7b]
                    hover:from-[#dce8e4] hover:via-[#cbded8] hover:to-[#b9d0c9]
                    hover:shadow-[0_10px_22px_rgba(61,91,88,0.18)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#587b7b]
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-[#faf9f6]
                  "
                >
                  {/* Decorative corner highlight */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-7 -top-7 h-20 w-20 rounded-full bg-white/30 transition-transform duration-500 group-hover:scale-150"
                  />


                  {/* Day Number */}
                  <span className="relative mt-2 block font-serif text-xl font-bold tracking-tight text-[#263f3e] transition-colors duration-300 group-hover:text-[#172d2c]">
                    Day {day}
                  </span>

                  {/* Button Label */}
                  <span className="relative mt-2 text-[8px] font-bold uppercase tracking-[0.18em] text-[#587270] transition-colors group-hover:text-[#263f3e]">
                    View Report
                  </span>

                  {/* Bottom Accent */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full bg-[#587b7b] transition-all duration-300 group-hover:w-1/2"
                  />
                </Link>
              ))}

            </div>
          ) : (
            <div className="mt-6 border border-dashed border-neutral-300 bg-[#f3f1eb] px-5 py-12 text-center">
              <h3 className="font-serif text-xl font-bold">
                Reports Coming Soon
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Daily collection reports for this movie have not been
                published yet.
              </p>
            </div>
          )}
        </section>

        {/* Return Link */}
        <div className="border-t border-neutral-300 py-6">
          <Link
            href="/preview/daily-box-office"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-700 transition hover:text-black hover:underline"
          >
            ← Back to Daily Box-Office Portal
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-5 border-t-2 border-black py-5">
          <div className="flex flex-col justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.13em] text-neutral-500 sm:flex-row">
            <span>Jeruto Movie Intelligence</span>
            <span>Daily Box-Office Portal · India</span>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-neutral-500">
            Box-office figures are compiled from available trade information
            and reported territory-wise collections. Figures may be revised
            as additional information becomes available.
          </p>

          <p className="mt-3 text-[10px] text-neutral-400">
            © {new Date().getFullYear()} Jeruto Movie Intelligence. All rights reserved.
          </p>
        </footer>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}