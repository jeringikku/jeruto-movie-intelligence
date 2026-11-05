import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import PublicHeader from "../../../../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{
    slug: string;
    dayNumber: string;
  }>;
};

type Movie = {
  id: number;
  title: string;
  slug: string;
  release_year: number | null;
  release_date: string | null;
  poster_url: string | null;
};

type CollectionRecord = {
  id: number;
  movie_id: number;
  day_number: number;
  territory: string;
  gross: number | string | null;
  updated_at: string | null;
};

const getMovieBySlug = cache(async (slug: string) => {
  const { data, error } = await supabase
    .from("movies")
    .select("id, title, slug, release_year, release_date, poster_url")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Daily report movie lookup error:", error);
    return null;
  }

  return data as Movie | null;
});

const getActivePortalMovie = cache(async (movieId: number) => {
  const { data, error } = await supabase
    .from("jmi_daily_box_office_portal")
    .select("id")
    .eq("row_type", "MOVIE")
    .eq("movie_id", movieId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Daily report active movie lookup error:", error);
    return null;
  }

  return data;
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCrores(amount: number) {
  const crore = amount / 10000000;

  if (crore >= 1) {
    return `₹${crore.toFixed(2)} Cr`;
  }

  const lakh = amount / 100000;

  if (lakh >= 1) {
    return `₹${lakh.toFixed(2)} L`;
  }

  return formatCurrency(amount);
}

function formatIndiaDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
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

function getReportDescription(
  movieTitle: string,
  dayNumber: number,
  total: number
) {
  return `${movieTitle} Day ${dayNumber} box-office report: total reported daily gross ${formatCrores(total)}. View territory-wise collections from Jeruto Movie Intelligence.`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, dayNumber } = await params;
  const day = Number(dayNumber);

  const movie = await getMovieBySlug(slug);

  if (!movie || !Number.isInteger(day) || day < 1) {
    return {
      title: "Daily Box-Office Report | JMI",
      description: "Territory-wise daily movie box-office reports.",
    };
  }

  const title = `${movie.title} Day ${day}Box-Office Collection | JMI`;

  const description = `View ${movie.title} Day ${day} territory-wise box-office collection and total daily gross on Jeruto Movie Intelligence.`;

  const canonical = `https://jeruto.com/preview/daily-box-office/${movie.slug}/day/${day}`;

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
      type: "article",
      images: movie.poster_url ? [movie.poster_url] : [],
    },
  };
}

export default async function DailyCollectionReportPage({
  params,
}: PageProps) {
  const { slug, dayNumber } = await params;

  const day = Number(dayNumber);

  if (!Number.isInteger(day) || day < 1) {
    notFound();
  }

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
    .select("id, movie_id, day_number, territory, gross, updated_at")
    .eq("row_type", "COLLECTION")
    .eq("movie_id", movie.id)
    .eq("day_number", day)
    .order("territory", { ascending: true });

  if (error) {
    console.error("Daily collection records lookup error:", error);
    throw new Error("Unable to load the daily box-office report.");
  }

  const records = (collectionRows ?? []) as CollectionRecord[];

  if (records.length === 0) {
    notFound();
  }

  // Convert gross values safely and calculate the total.
  const validRecords = records.map((record) => ({
    ...record,
    numericGross: Number(record.gross ?? 0),
  }));

  const totalGross = validRecords.reduce(
    (total, record) => total + (
      Number.isFinite(record.numericGross) ? record.numericGross : 0
    ),
    0
  );

  // Keep Overseas at the bottom of the territory list.
  const sortedRecords = [...validRecords].sort((a, b) => {
    const aOverseas = a.territory.trim().toLowerCase() === "overseas";
    const bOverseas = b.territory.trim().toLowerCase() === "overseas";

    if (aOverseas && !bOverseas) return 1;
    if (!aOverseas && bOverseas) return -1;

    return a.territory.localeCompare(b.territory);
  });

  const releaseDate = formatReleaseDate(movie.release_date);

  const latestUpdate = records
    .map((record) => record.updated_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  const canonical = `https://jeruto.com/preview/daily-box-office/${movie.slug}/day/${day}`;

  const description = getReportDescription(
    movie.title,
    day,
    totalGross
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: `${movie.title} Day ${day} Box-Office Collection`,
    description,
    url: canonical,
    datePublished: latestUpdate || undefined,
    about: {
      "@type": "Movie",
      name: movie.title,
      datePublished: movie.release_date || undefined,
      image: movie.poster_url || undefined,
    },
    publisher: {
      "@type": "Organization",
      name: "Jeruto Movie Intelligence",
      url: "https://jeruto.com",
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
          item: `https://jeruto.com/preview/daily-box-office/${movie.slug}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: `Day ${day}`,
          item: canonical,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#171717]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:px-8">

        {/* Newspaper Masthead */}
        <div className="border-y-2 border-black py-3">
          <div className="flex flex-col justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600 sm:flex-row sm:items-center">
            <span>JMI · Cinema · Trade · Data</span>
            <span>{formatIndiaDate(new Date().toISOString())}</span>
          </div>

          <div className="mt-2 flex flex-col justify-between gap-1 border-t border-neutral-300 pt-2 sm:flex-row sm:items-center">
            <span className="text-xs font-bold uppercase tracking-[0.12em]">
              Daily Collection Reports
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">
              India
            </span>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mt-5 text-xs text-neutral-500">
          <Link
            href="/preview/daily-box-office"
            className="hover:text-black hover:underline"
          >
            Daily Box-Office Portal
          </Link>

          <span className="mx-2">/</span>

          <Link
            href={`/preview/daily-box-office/${movie.slug}`}
            className="hover:text-black hover:underline"
          >
            {movie.title}
          </Link>

          <span className="mx-2">/</span>

          <span className="font-semibold text-neutral-800">
            Day {day}
          </span>
        </div>

        {/* Movie Information */}
        <section className="mt-6 border-b border-neutral-300 pb-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {movie.poster_url && (
              <div className="w-24 shrink-0 sm:w-32">
                <div className="overflow-hidden border border-neutral-300 bg-white p-1 shadow-sm">
                  <img
                    src={movie.poster_url}
                    alt={`${movie.title} movie poster`}
                    className="aspect-[2/3] w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                JMI Daily Box-Office Report
              </p>

              <h1 className="mt-2 font-serif text-2xl font-bold leading-tight sm:text-4xl">
                {movie.title}
              </h1>

              {movie.release_year && (
                <p className="mt-2 text-sm text-neutral-600">
                  {movie.release_year}
                </p>
              )}

              {releaseDate && (
                <p className="mt-1 text-xs text-neutral-700">
                  Release Date: {releaseDate}
                </p>
              )}

              <div className="mt-3 inline-flex border border-black bg-white px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em]">
                Day {day} Collection
              </div>
            </div>
          </div>
        </section>

        {/* Collection Heading */}
        <section className="pt-7">
          <div className="border-b-2 border-black pb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              Territory-wise Breakdown
            </p>

            <h2 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
              Day {day} Gross Collection
            </h2>

            <p className="mt-2 text-xs text-neutral-700">
              The numbers shown here are Trade estimates of daily box-office collection. These are not officially verified original number, this is a trade figure which is derived through the compilation of online tickets sales and trade estimation of untracked and offline counter sales.
            </p>
          </div>

          {/* Territory Rows */}
          <div className="mt-3">
            {sortedRecords.map((record, index) => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-4 border-b border-neutral-300 py-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 text-xs text-pink-400 font-semibold text-neutral-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-sm font-semibold sm:text-base">
                    {record.territory}
                  </span>
                </div>

                <span className="shrink-0 text-sm font-bold tabular-nums sm:text-base">
                  {formatCrores(record.numericGross)}
                </span>
              </div>
            ))}
          </div>

          {/* Total Collection */}
          <div className="mt-6 bg-[#171717] px-5 py-6 text-white sm:px-7 sm:py-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-500">
              Total Day {day} Gross
            </p>

            <p className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              {formatCrores(totalGross)}
            </p>

            <p className="mt-3 text-xs text-neutral-300">
             at World wide Box-office
            </p>

            <div className="mt-4 border-t border-neutral-600 pt-3 text-[8px] uppercase tracking-[0.12em] text-neutral-400">
              {sortedRecords.length} reported territories
            </div>
          </div>
        </section>

        {/* Navigation Buttons */}
        <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* Back to Daily Reports */}
          <Link
            href={`/preview/daily-box-office/${movie.slug}`}
            className="flex min-h-[34px] items-center justify-center gap-2 border border-black bg-black px-3 py-2 text-center text-[8px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-neutral-800"
          >
            <span aria-hidden="true">←</span>
            Back to Daily Reports
          </Link>

          {/* Worldwide Collection */}
          <Link
            href={`/preview/movies/${movie.id}`}
            className="flex min-h-[34px] items-center justify-center gap-2 border-2 border-black bg-[#faf9f6] px-3 py-2 text-center text-[8px] font-bold uppercase tracking-[0.08em] text-black transition hover:bg-black hover:text-white"
          >
            Check Total Worldwide Collection
            <span aria-hidden="true">→</span>
          </Link>

        </section>

        {/* Footer */}
        <footer className="mt-10 border-t-2 border-black py-5">
          <div className="flex flex-col justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.13em] text-neutral-500 sm:flex-row">
            <span>Jeruto Movie Intelligence</span>
            <span>Daily Box-Office Portal · India</span>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-neutral-500">
            Box-office figures are compiled from available trade
            information and reported territory-wise collections.
            Figures may be revised as additional information becomes
            available. The total represents the sum of the entries
            displayed in this report.
          </p>

          <p className="mt-3 text-[10px] text-neutral-400">
            © {new Date().getFullYear()} Jeruto Movie Intelligence.
            All rights reserved.
          </p>
        </footer>
      </main>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}