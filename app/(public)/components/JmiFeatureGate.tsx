"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type JmiFeatureGateProps = {
  feature: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export default function JmiFeatureGate({
  feature,
  title = "JMI Pro Intelligence",
  description = "This intelligence is available with JMI Pro.",
  children,
}: JmiFeatureGateProps) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();

        if (!mounted) {
          return;
        }

        if (!user) {
          setAuthenticated(false);
          setAllowed(false);
          setLoading(false);
          return;
        }

        setAuthenticated(true);

        const { data, error } =
          await supabaseBrowser.rpc(
            "jmi_user_has_feature",
            {
              requested_feature_slug: feature,
            }
          );

        if (!mounted) {
          return;
        }

        if (error) {
          console.error(
            `JMI feature check failed for ${feature}:`,
            error
          );

          setAllowed(false);
        } else {
          setAllowed(data === true);
        }
      } catch (error) {
        console.error(
          "JMI feature gate error:",
          error
        );

        if (mounted) {
          setAllowed(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [feature]);

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-5">
        <div className="text-center">

          <div className="mx-auto h-5 w-5 animate-spin rounded-full border border-violet-400/20 border-t-violet-400" />

          <p className="mt-3 text-[8px] uppercase tracking-[0.22em] text-zinc-600">
            Checking JMI access
          </p>

        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * ACCESS GRANTED
   * =========================================================
   */

  if (allowed) {
    return <>{children}</>;
  }

  /*
   * =========================================================
   * ACCESS LOCKED
   * =========================================================
   */

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
              JMI Premium Intelligence
            </p>

            {/* Title */}

            <h1 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-zinc-100 sm:text-2xl">
              {title}
            </h1>

            {/* Description */}

            <p className="mx-auto mt-3 max-w-md text-[10px] leading-5 text-zinc-500 sm:text-[11px]">
              {description}
            </p>

            {/* Pro information */}

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

              <p className="mt-2 text-[9px] leading-4 text-zinc-400">
                Unlock detailed JMI intelligence
                and advanced analytical features.
              </p>

            </div>

            {/* Actions */}

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">

              <Link
                href="/account"
                className="inline-flex min-w-[170px] items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/[0.08] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/[0.14]"
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
              Your JMI account gives you access to
              subscription features across the platform.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}