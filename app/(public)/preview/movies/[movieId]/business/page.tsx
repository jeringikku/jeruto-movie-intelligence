import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/app/(public)/components/PublicHeader";

type Props = {
  params: Promise<{ movieId: string }>;
};

type MovieBusiness = {
  id: number;
  movie_id: number;

  production_budget_official: number | null;
  production_budget_trade: number | null;
  p_and_a_cost: number | null;
  total_investment: number | null;

  worldwide_rights_official: number | null;
  worldwide_rights_trade: number | null;

  ott_rights: number | null;
  satellite_rights: number | null;
  digital_rights: number | null;
  music_rights: number | null;
  remake_rights: number | null;
  audio_rights: number | null;
  airline_rights: number | null;
  in_flight_rights: number | null;
  other_rights: number | null;

  total_theatrical_share: number | null;
  total_non_theatrical: number | null;
  overall_recovery: number | null;
  producer_profit_loss: number | null;
  recovery_percentage: number | null;

  theatrical_verdict: string | null;
  business_verdict: string | null;
  confidence_level: string | null;

  source: string | null;
  notes: string | null;

  currency: string | null;
  calculation_locked: boolean;
};

function formatMoney(
  value: number | null | undefined,
  currency: string | null | undefined
) {
  if (value === null || value === undefined) return "—";

  const symbol = currency || "₹";

  return `${symbol} ${Number(value).toLocaleString("en-IN")}`;
}

function formatPercentage(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";

  return `${Number(value).toFixed(2)}%`;
}

function formatCrores(value: number | null | undefined) {
  if (value === null || value === undefined || value <= 0) {
    return "—";
  }

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  return `₹${(value / 100000).toFixed(2)} L`;
}

function MetricCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-550 p-3">
      <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-normal text-white">
        {value}
      </p>

      {subtext && (
        <p className="mt-1 text-[9px] text-zinc-600">
          {subtext}
        </p>
      )}
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-violet-400">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-[9px] text-zinc-500">
          {description}
        </p>
      )}
    </div>
  );
}

function VerdictCard({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-zinc-200">
        {value || "—"}
      </p>
    </div>
  );
}

export default async function MovieBusinessPage({
  params,
}: Props) {
  const { movieId } = await params;

  const movieIdNumber = Number(movieId);

  if (!Number.isFinite(movieIdNumber)) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PublicHeader />

        <main className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm text-red-400">
            Invalid movie ID.
          </p>
        </main>
      </div>
    );
  }

  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      release_year,
      poster_url
    `)
    .eq("id", movieIdNumber)
    .single();

  if (movieError || !movie) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PublicHeader />

        <main className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm text-red-400">
            Movie not found.
          </p>
        </main>
      </div>
    );
  }

  const { data: businessData, error: businessError } =
    await supabase
      .from("movie_business")
      .select("*")
      .eq("movie_id", movie.id)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

  const business = businessData as MovieBusiness | null;

  if (businessError) {
    console.error("Movie business error:", businessError);
  }

  const currency = business?.currency || "₹";

  const hasBusinessData = !!business;

  const totalRights =
    (business?.worldwide_rights_trade ??
      business?.worldwide_rights_official ??
      0) +
    (business?.ott_rights ?? 0) +
    (business?.satellite_rights ?? 0) +
    (business?.digital_rights ?? 0) +
    (business?.music_rights ?? 0) +
    (business?.remake_rights ?? 0) +
    (business?.audio_rights ?? 0) +
    (business?.airline_rights ?? 0) +
    (business?.in_flight_rights ?? 0) +
    (business?.other_rights ?? 0);

  const investment =
    business?.total_investment ??
    business?.production_budget_trade ??
    business?.production_budget_official ??
    null;

  const recovery = business?.overall_recovery ?? null;

  let recoveryPosition = "—";

  if (
    investment !== null &&
    recovery !== null
  ) {
    if (recovery > investment) {
      recoveryPosition = "Above Investment";
    } else if (recovery === investment) {
      recoveryPosition = "At Investment";
    } else {
      recoveryPosition = "Below Investment";
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Back */}
        <div className="mb-4">
          <Link
            href={`/preview/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
          >
            <span>←</span>
            <span>Back to Movie</span>
          </Link>
        </div>

        {/* Movie Header */}
        <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-4">

            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="h-[105px] w-[70px] shrink-0 rounded-lg border border-zinc-800 object-cover sm:h-[135px] sm:w-[90px]"
              />
            ) : (
              <div className="flex h-[105px] w-[70px] shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-[9px] text-zinc-700 sm:h-[135px] sm:w-[90px]">
                NO POSTER
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.18em] text-violet-400">
                Movie Business Intelligence
              </p>

              <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
                {movie.title}
              </h1>

              <p className="mt-1 text-[10px] text-pink-400">
                {movie.release_year || "—"}
              </p>

              <p className="mt-3 max-w-xl text-[9px] leading-4 text-zinc-500">
                Financial, rights, recovery and business
                intelligence maintained by JMI.
              </p>
            </div>

          </div>
        </section>

        {/* Data Status */}
        <section className="mb-8 rounded-xl border border-zinc-900 bg-zinc-950/60 px-4 py-3">
          <p className="text-[9px] uppercase tracking-[0.16em] text-violet-400">
            Business Data Status
          </p>

          <p className="mt-1 text-[10px] text-zinc-400">
            {hasBusinessData
              ? "Current business intelligence record available."
              : "Business intelligence data not available for this movie."}
          </p>
        </section>

        {!business ? (
          <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="text-sm font-medium text-zinc-300">
              Business data not available
            </p>

            <p className="mt-2 text-[10px] text-zinc-600">
              No movie business intelligence record has been
              recorded by JMI for this movie.
            </p>
          </section>
        ) : (
          <>
            {/* Investment */}
            <section className="mb-8">
              <SectionHeading
                title="Investment & Budget"
                description="Production investment and associated cost structure."
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                <MetricCard
                  label="Estimated Production Budget — Trade"
                  value={formatMoney(
                    business.production_budget_trade,
                    currency
                  )}
                />

                <MetricCard
                  label="Official Production Budget"
                  value={formatMoney(
                    business.production_budget_official,
                    currency
                  )}
                />

                <MetricCard
                  label="P&A Cost"
                  value={formatMoney(
                    business.p_and_a_cost,
                    currency
                  )}
                />

                <MetricCard
                  label="Total Investment"
                  value={formatMoney(
                    business.total_investment,
                    currency
                  )}
                />

              </div>
            </section>

            {/* Rights */}
            <section className="mb-8">
              <SectionHeading
                title="Rights & Non-Theatrical"
                description="Reported rights values across major revenue streams."
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                <MetricCard
                  label="Estimated Worldwide Rights — Trade"
                  value={formatMoney(
                    business.worldwide_rights_trade,
                    currency
                  )}
                />

                <MetricCard
                  label="Original Worldwide Rights — Official"
                  value={formatMoney(
                    business.worldwide_rights_official,
                    currency
                  )}
                />

                <MetricCard
                  label="OTT Rights"
                  value={formatMoney(
                    business.ott_rights,
                    currency
                  )}
                />

                <MetricCard
                  label="Satellite Rights"
                  value={formatMoney(
                    business.satellite_rights,
                    currency
                  )}
                />

                <MetricCard
                  label="Digital Rights"
                  value={formatMoney(
                    business.digital_rights,
                    currency
                  )}
                />

                <MetricCard
                  label="Music Rights"
                  value={formatMoney(
                    business.music_rights,
                    currency
                  )}
                />

                <MetricCard
                  label="Remake Rights"
                  value={formatMoney(
                    business.remake_rights,
                    currency
                  )}
                />

                <MetricCard
                  label="Audio Rights"
                  value={formatMoney(
                    business.audio_rights,
                    currency
                  )}
                />

                <MetricCard
                  label="Airline Rights"
                  value={formatMoney(
                    business.airline_rights,
                    currency
                  )}
                />

                <MetricCard
                  label="In-flight Rights"
                  value={formatMoney(
                    business.in_flight_rights,
                    currency
                  )}
                />

                <MetricCard
                  label="Other Rights"
                  value={formatMoney(
                    business.other_rights,
                    currency
                  )}
                />

                <MetricCard
                  label="Reported Rights Value"
                  value={formatMoney(
                    totalRights,
                    currency
                  )}
                  subtext="Combined reported rights fields"
                />

              </div>
            </section>

            {/* Recovery */}
            <section className="mb-8">
              <SectionHeading
                title="Recovery & Profitability"
                description="Business recovery relative to reported investment."
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">

                <MetricCard
                  label="Theatrical Share"
                  value={formatMoney(
                    business.total_theatrical_share,
                    currency
                  )}
                />

                <MetricCard
                  label="Non-Theatrical"
                  value={formatMoney(
                    business.total_non_theatrical,
                    currency
                  )}
                />

                <MetricCard
                  label="Overall Recovery"
                  value={formatMoney(
                    business.overall_recovery,
                    currency
                  )}
                />

                <MetricCard
                  label="Recovery"
                  value={formatPercentage(
                    business.recovery_percentage
                  )}
                />

                <MetricCard
                  label="Producer Profit / Loss"
                  value={formatMoney(
                    business.producer_profit_loss,
                    currency
                  )}
                />

              </div>
            </section>

            {/* Business Snapshot */}
            <section className="mb-8">
              <SectionHeading
                title="Business Snapshot"
                description="High-level view of investment, rights and recovery."
              />

              <div className="grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-500">
                    Investment
                  </p>

                  <p className="mt-2 text-sm font-normal text-white">
                    {formatMoney(investment, currency)}
                  </p>

                  <p className="mt-1 text-[9px] text-zinc-500">
                    Reported total investment
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                    Rights
                  </p>

                  <p className="mt-2 text-sm font-normal text-white">
                    {formatMoney(totalRights, currency)}
                  </p>

                  <p className="mt-1 text-[9px] text-zinc-500">
                    Reported rights fields
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-500">
                    Recovery Position
                  </p>

                  <p className="mt-2 text-sm font-normal text-white">
                    {recoveryPosition}
                  </p>

                  <p className="mt-1 text-[9px] text-zinc-500">
                    Based on investment vs recovery
                  </p>
                </div>

              </div>
            </section>

            {/* Verdict */}
            <section className="mb-8">
              <SectionHeading
                title="Business Assessment"
                description="JMI assessment of theatrical and overall business performance."
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <VerdictCard
                  label="Theatrical Verdict"
                  value={business.theatrical_verdict}
                />

                <VerdictCard
                  label="Overall Business Verdict"
                  value={business.business_verdict}
                />

                <VerdictCard
                  label="Confidence Level"
                  value={business.confidence_level}
                />

              </div>
            </section>

            {/* Source */}
            {(business.source || business.notes) && (
              <section className="mb-8">
                <SectionHeading
                  title="Source & Data Note"
                  description="Context attached to the business intelligence record."
                />

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                  {business.source && (
                    <div className="mb-4">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-600">
                        Source
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-zinc-400">
                        {business.source}
                      </p>
                    </div>
                  )}

                  {business.notes && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-600">
                        Notes
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-[10px] leading-5 text-zinc-400">
                        {business.notes}
                      </p>
                    </div>
                  )}

                </div>
              </section>
            )}

            {/* JMI Model */}
            <section className="mb-8 rounded-xl border border-violet-950/50 bg-zinc-950 p-5">
              <p className="text-[9px] uppercase tracking-[0.18em] text-violet-400">
                JMI Business Intelligence Model
              </p>

              <p className="mt-2 text-xs font-medium text-red-400">
                Important Note / Disclaimer
              </p>

              <p className="mt-2 max-w-3xl text-[10px] leading-5 text-zinc-500">
                The business numbers mention ed here are derived from various sources including trade portals, inside industry informations, production house notes and estimations. JMI will not guarantee the 100% authenticity of the numbers.
              </p>
            </section>
          </>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 border-t border-zinc-900 pt-6">

          <Link
            href={`/preview/movies/${movie.id}`}
            className="rounded-lg border border-zinc-800 px-4 py-2 text-[9px] text-zinc-500 transition hover:border-zinc-600 hover:text-white"
          >
            ← Back to Movie Intelligence
          </Link>

          <Link
            href="/preview"
            className="rounded-lg border border-zinc-800 px-4 py-2 text-[9px] text-zinc-500 transition hover:border-zinc-600 hover:text-white"
          >
            JMI Home
          </Link>

        </div>

      </main>

      <footer className="mt-10 border-t border-zinc-900 py-6 text-center">
        <p className="text-[9px] text-zinc-700">
          © {new Date().getFullYear()} Jeruto Movie Intelligence
        </p>
      </footer>
    </div>
  );
}