import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/* ============================================================
   TYPES
   ============================================================ */

type SubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  monthly_price: number | null;
  annual_price: number | null;
  currency: string;
  is_active: boolean;
  sort_order: number;
};

/* ============================================================
   JMI PLAN FEATURE DISTRIBUTION
   ------------------------------------------------------------
   These are the public-facing features of each plan.

   "Everything in..." is intentionally handled separately
   in the UI so the cards stay clean and readable.
   ============================================================ */

const planFeatureDistribution: Record<
  string,
  {
    label: string;
    description?: string;
  }[]
> = {
  free: [
    {
      label: "Basic Movie Details",
      description:
        "Essential information about Indian movies.",
    },
    {
      label: "Basic Movie Box-Office",
      description:
        "Core theatrical collection information.",
    },
    {
      label: "Country-wise & State-wise Numbers",
      description:
        "Basic geographic collection data.",
    },
    {
      label: "Basic Comparison Tool",
      description:
        "Up to 5 comparisons per month.",
    },
    {
      label: "Limited Live Advance Bookings",
      description:
        "Limited access to live advance-booking tracking.",
    },
  ],

  pro: [
    {
      label: "Unlimited Comparisons",
      description:
        "Compare movies and other JMI entities without a monthly limit.",
    },
    {
      label: "Full Live Advance Booking",
      description:
        "Complete access to JMI's live advance-booking intelligence.",
    },
    {
      label: "JMI Records",
      description:
        "Access historical and industry records tracked by JMI.",
    },
    {
      label: "Basic Industry Intelligence",
      description:
        "Explore essential industry-level performance data.",
    },
    {
      label: "Individual Company Analytics",
      description:
        "Access analytics for individual production and film companies.",
    },
    {
      label: "Language-wise, Format-wise & City-wise Numbers",
      description:
        "Deeper collection breakdowns across languages, formats and cities.",
    },
    {
      label: "Movie Business",
      description:
        "Access detailed movie business information and analysis.",
    },
    {
      label: "Movie Markets",
      description:
        "Explore movie performance across different theatrical markets.",
    },
    {
      label: "Geographical Data Distribution",
      description:
        "Explore JMI data geographically with interactive map-based distribution.",
    },
  ],

  premium: [
    {
      label: "Unlimited Advanced Comparison",
      description:
        "Unlock the full advanced JMI comparison experience.",
    },
    {
      label: "Person Role-wise Career Analysis",
      description:
        "Analyse careers across individual film-industry roles.",
    },
    {
      label: "Individual Industry Performance",
      description:
        "Explore detailed performance of individual film industries.",
    },
    {
      label: "Advanced Industry Intelligence",
      description:
        "Unlock deeper industry-level intelligence and analytics.",
    },
    {
      label: "Audience Behavior & Market Trends",
      description:
        "Explore audience preferences and trends across different markets.",
    },
    {
      label: "JMI AI",
      description:
        "Ask JMI AI questions and receive instant answers from JMI intelligence.",
    },
  ],

  enterprise: [
    {
      label: "API Access",
      description:
        "Access JMI data and intelligence through API services.",
    },
    {
      label: "Advanced Territory Breakdown",
      description:
        "Access deeper territory-level theatrical performance data.",
    },
    {
      label: "Professional Analysis Reports",
      description:
        "Access professional JMI intelligence and analysis reports.",
    },
    {
      label: "Individual Movie Full Performance Tracking",
      description:
        "Track the complete performance journey of individual movies.",
    },
  ],
};

/* ============================================================
   PLAN DESCRIPTIONS
   ============================================================ */

const planDescriptions: Record<
  string,
  string
> = {
  free:
    "Explore the core JMI movie intelligence experience.",

  pro:
    "Go deeper into box office, markets and industry intelligence.",

  premium:
    "Unlock the complete JMI intelligence experience.",

  enterprise:
    "Professional JMI data, intelligence and analysis solutions.",
};

/* ============================================================
   PLAN BADGES
   ============================================================ */

const planBadges: Record<
  string,
  string
> = {
  premium: "Most Powerful",
  enterprise: "Professional",
};

/* ============================================================
   PRICE FORMATTER
   ============================================================ */

function formatPrice(
  price: number | null,
  currency: string
) {
  if (price === null) {
    return "Custom";
  }

  if (price === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/* ============================================================
   SUBSCRIPTION PAGE
   ============================================================ */

export default async function SubscriptionPage() {
  const supabase =
    await createSupabaseServerClient();

  /* ==========================================================
     LOAD ACTIVE SUBSCRIPTION PLANS
     ========================================================== */

  const {
    data: plans,
    error: plansError,
  } = await supabase
    .from("subscription_plans")
    .select(
      `
        id,
        slug,
        name,
        description,
        monthly_price,
        annual_price,
        currency,
        is_active,
        sort_order
      `
    )
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    });

  if (plansError) {
    console.error(
      "Subscription plans loading error:",
      plansError
    );
  }

  const safePlans =
    (plans || []) as SubscriptionPlan[];

  /* ==========================================================
     PAGE
     ========================================================== */

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-[#050507] px-4 pb-20 pt-24 text-zinc-100 sm:px-6">

        <div className="mx-auto w-full max-w-6xl">

          {/* ==================================================
              BACK TO HOME
          ================================================== */}

          <div className="mb-6">
            <Link
              href="/preview"
              className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
            >
              <span>←</span>

              <span>
                Back to JMI Home
              </span>
            </Link>
          </div>

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="mb-9 text-center">

            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3 py-1">

              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                JMI Membership
              </span>

            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-yellow-500 sm:text-3xl">
              Choose Your JMI Plan
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-[10px] leading-5 text-zinc-400 sm:text-xs">
              Choose the level of movie intelligence that
              fits the way you use JMI.
            </p>

          </section>

          {/* ==================================================
              PLAN CARDS
          ================================================== */}

          {safePlans.length === 0 ? (

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-8 text-center">

              <p className="text-xs text-zinc-500">
                Subscription plans are currently unavailable.
              </p>

            </div>

          ) : (

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

              {safePlans.map((plan) => {

                const features =
                  planFeatureDistribution[
                    plan.slug
                  ] || [];

                const isFree =
                  plan.slug === "free";

                const isPro =
                  plan.slug === "pro";

                const isPremium =
                  plan.slug === "premium";

                const isEnterprise =
                  plan.slug === "enterprise";

                const inheritedLabel =
                  isFree
                    ? null
                    : isPro
                    ? "Everything in Free"
                    : isPremium
                    ? "Everything in Pro"
                    : "Everything in Premium";

                const badge =
                  planBadges[
                    plan.slug
                  ];

                return (
                  <article
                    key={plan.id}
                    className={`relative flex flex-col overflow-hidden rounded-3xl border bg-white/[0.025] shadow-[0_15px_60px_rgba(0,0,0,0.25)] ${
                      isPremium
                        ? "border-violet-400/30 shadow-[0_20px_80px_rgba(124,58,237,0.14)]"
                        : isPro
                        ? "border-yellow-400/20"
                        : isEnterprise
                        ? "border-pink-400/20"
                        : "border-white/[0.08]"
                    }`}
                  >

                    {/* ==================================================
                        TOP ACCENT
                    ================================================== */}

                    <div
                      className={`h-px w-full ${
                        isPremium
                          ? "bg-violet-400/60"
                          : isPro
                          ? "bg-yellow-400/40"
                          : isEnterprise
                          ? "bg-pink-400/40"
                          : "bg-white/[0.08]"
                      }`}
                    />

                    {/* ==================================================
                        BADGE
                    ================================================== */}

                    {badge && (
                      <div className="absolute right-4 top-4">

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] ${
                            isPremium
                              ? "border-violet-300/20 bg-violet-500/[0.10] text-violet-300"
                              : "border-pink-300/20 bg-pink-500/[0.08] text-pink-300"
                          }`}
                        >
                          {badge}
                        </span>

                      </div>
                    )}

                    {/* ==================================================
                        PLAN HEADER
                    ================================================== */}

                    <div className="border-b border-white/[0.06] p-5">

                      <p
                        className={`text-[8px] font-semibold uppercase tracking-[0.18em] ${
                          isPremium
                            ? "text-violet-300"
                            : isPro
                            ? "text-yellow-500"
                            : isEnterprise
                            ? "text-pink-300"
                            : "text-zinc-500"
                        }`}
                      >
                        JMI Membership
                      </p>

                      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                        {plan.name}
                      </h2>

                      <p className="mt-2 min-h-[40px] text-[9px] leading-4 text-zinc-500">
                        {planDescriptions[
                          plan.slug
                        ] ||
                          plan.description ||
                          "JMI membership access."}
                      </p>

                      {/* PRICE */}

                      <div className="mt-5">

                        <div className="flex items-end gap-1">

                          <span className="text-2xl font-semibold tracking-tight text-green-400">
                            {formatPrice(
                              plan.monthly_price,
                              plan.currency
                            )}
                          </span>

                          {!isFree &&
                            !isEnterprise &&
                            plan.monthly_price !==
                              null && (
                              <span className="pb-1 text-[9px] text-zinc-400">
                                / month
                              </span>
                            )}

                        </div>

                        {isEnterprise && (
                          <p className="mt-1 text-[8px] text-zinc-600">
                            Custom pricing
                          </p>
                        )}

                      </div>

                    </div>

                    {/* ==================================================
                        FEATURES
                    ================================================== */}

                    <div className="flex-1 p-5">

                      {/* Inherited access */}

                      {inheritedLabel && (
                        <div
                          className={`mb-4 rounded-xl border px-3 py-2.5 ${
                            isPremium
                              ? "border-violet-400/15 bg-violet-500/[0.05]"
                              : isEnterprise
                              ? "border-pink-400/15 bg-pink-500/[0.04]"
                              : "border-yellow-400/10 bg-yellow-500/[0.035]"
                          }`}
                        >

                          <p
                            className={`text-[9px] font-semibold ${
                              isPremium
                                ? "text-violet-300"
                                : isEnterprise
                                ? "text-pink-300"
                                : "text-yellow-400"
                            }`}
                          >
                            {inheritedLabel}
                          </p>

                          <p className="mt-0.5 text-[7px] leading-3.5 text-zinc-500">
                            All features from the previous
                            membership level are included.
                          </p>

                        </div>
                      )}

                      {/* New features heading */}

                      <div className="mb-3 flex items-center justify-between">

                        <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-pink-400">
                          {isFree
                            ? "Included"
                            : "Additional Access"}
                        </p>

                        <span className="text-[7px] text-zinc-700">
                          {features.length}{" "}
                          {features.length ===
                          1
                            ? "feature"
                            : "features"}
                        </span>

                      </div>

                      <ul className="space-y-2.5">

                        {features.map(
                          (
                            feature,
                            index
                          ) => (
                            <li
                              key={`${plan.slug}-${index}`}
                              className="flex gap-2"
                            >

                              <span
                                className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[7px] ${
                                  isPremium
                                    ? "border-violet-400/20 bg-violet-400/[0.06] text-violet-300"
                                    : isEnterprise
                                    ? "border-pink-400/20 bg-pink-400/[0.05] text-pink-300"
                                    : "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                                }`}
                              >
                                ✓
                              </span>

                              <div className="min-w-0">

                                <p className="text-[9px] font-medium leading-4 text-green-300">
                                  {
                                    feature.label
                                  }
                                </p>

                                {feature.description && (
                                  <p className="mt-0.5 text-[7.5px] leading-3.5 text-zinc-400">
                                    {
                                      feature.description
                                    }
                                  </p>
                                )}

                              </div>

                            </li>
                          )
                        )}

                      </ul>

                    </div>

                    {/* ==================================================
                        ACTION
                    ================================================== */}

                    <div className="p-5 pt-0">

                      {isEnterprise ? (

                        <Link
                          href="/preview/contact"
                          className="flex w-full items-center justify-center rounded-xl border border-pink-300/20 bg-pink-500/[0.06] px-4 py-3 text-[10px] font-semibold text-pink-200 transition hover:border-pink-300/35 hover:bg-pink-500/[0.10]"
                        >
                          Contact JMI
                        </Link>

                      ) : isFree ? (

                        <Link
                          href="/account/register"
                          className="flex w-full items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 py-3 text-[10px] font-semibold text-zinc-300 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white"
                        >
                          Get Started
                        </Link>

                      ) : (

                        <Link
                          href={`/preview/subscription/${plan.slug}`}
                          className={`flex w-full items-center justify-center rounded-xl border px-4 py-3 text-[10px] font-semibold transition ${
                            isPremium
                              ? "border-violet-300/30 bg-gradient-to-b from-violet-400/25 to-violet-600/10 text-violet-100 shadow-[0_8px_25px_rgba(124,58,237,0.15)] hover:border-violet-200/50 hover:from-violet-400/35"
                              : "border-yellow-400/20 bg-yellow-500/[0.06] text-yellow-300 hover:border-yellow-400/35 hover:bg-yellow-500/[0.10]"
                          }`}
                        >
                          Choose{" "}
                          {plan.name}
                        </Link>

                      )}

                    </div>

                  </article>
                );
              })}

            </div>

          )}

          {/* ==================================================
              BILLING NOTE
          ================================================== */}

          <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-center">

            <p className="text-[9px] font-medium text-zinc-400">
              JMI membership billing is being prepared.
            </p>

            <p className="mt-1 text-[8px] leading-4 text-zinc-600">
              Secure payment processing and recurring
              subscription management will become available
              when JMI billing is connected.
            </p>

          </section>

          {/* ==================================================
              MEMBERSHIP INFORMATION
          ================================================== */}

          <section className="mx-auto mt-5 grid max-w-4xl gap-2 sm:grid-cols-3">

            <InfoCard
              title="One JMI"
              text="Your membership unlocks the level of intelligence associated with your plan."
            />

            <InfoCard
              title="Secure Billing"
              text="Payment processing will be handled through a secure payment provider."
            />

            <InfoCard
              title="Manage Anytime"
              text="Your active plan, billing period and subscription status will remain visible in your account."
            />

          </section>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer className="border-t border-zinc-900">

        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">

          <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div>

              <p className="font-serif text-sm font-medium text-zinc-300">
                Jeruto{" "}
                <span className="text-yellow-400">
                  Movie Intelligence
                </span>
              </p>

              <p className="mt-1 text-[9px] text-zinc-500">
                India's Next Generation Movie Intelligence Platform
              </p>

            </div>

           

          </div>

        </div>

      </footer>

        </div>

      </main>
    </>
  );
}

/* ============================================================
   INFO CARD
   ============================================================ */

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-center">

      <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-violet-300">
        {title}
      </p>

      <p className="mt-1.5 text-[8px] leading-4 text-zinc-600">
        {text}
      </p>

    </div>
  );
}