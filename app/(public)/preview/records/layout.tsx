import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function RecordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * =========================================================
   * LOGGED-OUT VISITOR
   * =========================================================
   */

  if (!user) {
    return <RecordsUpgradeScreen authenticated={false} />;
  }

  /*
   * =========================================================
   * JMI RECORDS ENTITLEMENT
   * =========================================================
   */

  const { data: allowed, error } = await supabase.rpc(
    "jmi_user_has_feature",
    {
      requested_feature_slug: "jmi_records",
    }
  );

  /*
   * Fail closed.
   *
   * If the entitlement check fails, protected Records
   * content should NOT be exposed.
   */

  if (error || allowed !== true) {
    if (error) {
      console.error(
        "JMI Records entitlement check failed:",
        error
      );
    }

    return <RecordsUpgradeScreen authenticated={true} />;
  }

  /*
   * =========================================================
   * PRO / PREMIUM / ENTERPRISE
   * =========================================================
   */

  return <>{children}</>;
}


/* ============================================================
   RECORDS UPGRADE SCREEN
============================================================ */

function RecordsUpgradeScreen({
  authenticated,
}: {
  authenticated: boolean;
}) {
  return (
    <section className="min-h-[65vh] flex items-center justify-center px-5 py-12">

      <div className="w-full max-w-xl">

        <div className="overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">

          {/* Top accent */}

          <div className="h-px w-full bg-violet-400/30" />

          <div className="px-6 py-10 text-center sm:px-10 sm:py-14">

            {/* Lock */}

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/[0.05]">

              <span className="text-lg">
                🔒
              </span>

            </div>

            {/* Label */}

            <p className="mt-5 text-[8px] font-semibold uppercase tracking-[0.28em] text-violet-400">
              JMI Pro Intelligence
            </p>

            {/* Title */}

            <h1 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-zinc-100 sm:text-2xl">
              JMI Records
            </h1>

            {/* Description */}

            <p className="mx-auto mt-3 max-w-md text-[10px] leading-5 text-zinc-500 sm:text-[11px]">
              Access India's historical box-office records,
              highest-grossing rankings and industry-wise
              records with JMI Pro.
            </p>

            {/* Pro card */}

            <div className="mx-auto mt-7 max-w-sm rounded-xl border border-zinc-800 bg-black/50 px-5 py-5">

              <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-yellow-500">
                JMI Pro
              </p>

              <div className="mt-2">

                <span className="text-2xl font-semibold text-green-400">
                  ₹29
                </span>

                <span className="ml-1 text-[9px] text-zinc-400">
                  / month
                </span>

              </div>

              <p className="mt-2 text-[9px] leading-4 text-zinc-500">
                Unlock JMI Records and advanced
                movie intelligence across the platform.
              </p>

            </div>

            {/* Actions */}

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">

              <Link
                href={
                  authenticated
                    ? "/account"
                    : "/account/login"
                }
                className="inline-flex min-w-[180px] items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/[0.08] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/[0.14]"
              >
                {authenticated
                  ? "Subscribe to JMI Pro →"
                  : "Sign In / Join JMI →"}
              </Link>

              {!authenticated && (
                <Link
                  href="/account/signup"
                  className="text-[8px] font-medium uppercase tracking-[0.16em] text-green-500 transition hover:text-zinc-300"
                >
                  Create Account
                </Link>
              )}

            </div>

            {/* Supporting message */}

            <p className="mx-auto mt-6 max-w-sm text-[8px] leading-4 text-zinc-500">
              JMI Pro unlocks subscription intelligence
              across the JMI platform.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}