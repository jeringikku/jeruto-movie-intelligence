import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AudienceBehaviorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * Not authenticated
   */
  if (!user) {
    return (
      <AudiencePremiumLock authenticated={false} />
    );
  }

  /*
   * Check Premium / Enterprise entitlement
   */
  const { data: allowed, error } =
    await supabase.rpc(
      "jmi_user_has_feature",
      {
        requested_feature_slug: "audience_behavior",
      }
    );

  if (error || allowed !== true) {
    if (error) {
      console.error(
        "Audience Behavior entitlement check failed:",
        error
      );
    }

    return (
      <AudiencePremiumLock authenticated={true} />
    );
  }

  /*
   * Premium / Enterprise users
   * can access the actual Audience Behavior page.
   */
  return <>{children}</>;
}

function AudiencePremiumLock({
  authenticated,
}: {
  authenticated: boolean;
}) {
  return (
    <section className="min-h-[65vh] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-xl">
        <div className="overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

          <div className="h-px w-full bg-violet-400/30" />

          <div className="px-6 py-10 text-center sm:px-10 sm:py-14">

            {/* LOCK ICON */}

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/[0.05]">
              <span className="text-lg">
                🔒
              </span>
            </div>

            {/* BADGE */}

            <p className="mt-5 text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
              JMI Premium Intelligence
            </p>

            {/* TITLE */}

            <h1 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-zinc-100 sm:text-2xl">
              Audience Behavior Intelligence
            </h1>

            {/* DESCRIPTION */}

            <p className="mx-auto mt-3 max-w-md text-[10px] leading-5 text-zinc-500 sm:text-[11px]">
              Access detailed audience behavior,
              genre-performance and regional market
              intelligence with JMI Premium.
            </p>

            {/* PREMIUM PLAN */}

            <div className="mx-auto mt-7 max-w-sm rounded-xl border border-zinc-800 bg-black/50 px-5 py-5">

              <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-yellow-500">
                JMI Premium
              </p>

              <div className="mt-2">
                <span className="text-2xl font-semibold text-pink-500">
                  ₹99
                </span>

                <span className="ml-1 text-[9px] text-zinc-400">
                  / month
                </span>
              </div>

              <p className="mt-2 text-[9px] leading-4 text-zinc-600">
                Unlock deeper audience, genre and
                regional market intelligence.
              </p>

            </div>

            {/* CTA */}

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">

              <Link
                href={
                  authenticated
                    ? "/account"
                    : "/account/login"
                }
                className="inline-flex min-w-[190px] items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/[0.08] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/[0.14]"
              >
                {authenticated
                  ? "Upgrade to JMI Premium →"
                  : "Sign In / Join JMI →"}
              </Link>

              {!authenticated && (
                <Link
                  href="/account/signup"
                  className="text-[8px] font-medium uppercase tracking-[0.16em] text-green-5  00 transition hover:text-zinc-300"
                >
                  Create Account
                </Link>
              )}

            </div>

            {/* FOOTNOTE */}

            <p className="mx-auto mt-6 max-w-sm text-[8px] leading-4 text-zinc-700">
              Available with JMI Premium and Enterprise.
              Your subscription unlocks intelligence
              features across the JMI platform.
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}