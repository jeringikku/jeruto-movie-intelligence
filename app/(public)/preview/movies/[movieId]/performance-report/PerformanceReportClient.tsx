"use client";

import { useState } from "react";
import Link from "next/link";
import { pdf } from "@react-pdf/renderer";

import JmiPerformanceReportPDF, {
  type ReportData,
} from "@/app/components/performance-report/JmiPerformanceReportPDF";

type PerformanceReportClientProps = {
  movieId: number;
  movieTitle: string;
  releaseYear: number | null;
  posterUrl: string | null;
  allowed: boolean;
  authenticated: boolean;
};

type ReportResponse = {
  success?: boolean;
  report?: ReportData;
  error?: string;
};

export default function PerformanceReportClient({
  movieId,
  movieTitle,
  releaseYear,
  posterUrl,
  allowed,
  authenticated,
}: PerformanceReportClientProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [loading, setLoading] = useState(false);

  const [pdfGenerating, setPdfGenerating] =
    useState(false);

  const [report, setReport] =
    useState<ReportResponse | null>(null);

  const [error, setError] = useState("");

  async function fetchReport(): Promise<ReportData | null> {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/movies/${movieId}/performance-report`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: ReportResponse =
        await response.json();

      /*
       * Authentication required
       */
      if (response.status === 401) {
        setError(
          "Please sign in to generate your JMI Performance Report."
        );

        return null;
      }

      /*
       * Premium entitlement required
       */
      if (response.status === 403) {
        setShowUpgrade(true);

        return null;
      }

      /*
       * Other API errors
       */
      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to generate the JMI Performance Report."
        );

        return null;
      }

      /*
       * Make sure the API actually returned report data.
       */
      if (!data.report) {
        setError(
          "JMI report data was not returned."
        );

        return null;
      }

      /*
       * Store the API result so the temporary
       * report viewer can still be inspected.
       */
      setReport(data);

      return data.report;
    } catch (err) {
      console.error(
        "JMI Performance Report client error:",
        err
      );

      setError(
        "Something went wrong while generating the report. Please try again."
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  async function generatePDF(
    reportData: ReportData
  ) {
    if (pdfGenerating) {
      return;
    }

    try {
      setPdfGenerating(true);
      setError("");

      /*
       * Create the PDF in the browser.
       *
       * This does not use any external PDF service
       * and does not create any API cost.
       */
      const blob = await pdf(
        <JmiPerformanceReportPDF
          report={reportData}
        />
      ).toBlob();

      /*
       * Create a temporary browser URL
       * for the generated PDF.
       */
      const url =
        URL.createObjectURL(blob);

      /*
       * Create a temporary download link.
       */
      const link =
        document.createElement("a");

      link.href = url;

      link.download = `${movieTitle
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()}-jmi-performance-report.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      /*
       * Release the temporary object URL.
       */
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error(
        "JMI Performance Report PDF generation failed:",
        err
      );

      setError(
        "Unable to generate the JMI Performance Report PDF. Please try again."
      );
    } finally {
      setPdfGenerating(false);
    }
  }

  async function handleGenerate() {
  /*
   * Prevent duplicate generation requests.
   */
  if (loading || pdfGenerating) {
    return;
  }

  /*
   * All JMI users can now generate
   * the Performance Report.
   */
  const reportData = await fetchReport();

  if (!reportData) {
    return;
  }

  /*
   * Generate the PDF immediately after
   * successful report data retrieval.
   */
  await generatePDF(reportData);
}

  async function handleDownloadPDF() {
    /*
     * This button is only available after
     * the report data has already been loaded.
     */
    if (!report?.report) {
      return;
    }

    await generatePDF(report.report);
  }

  return (
    <>
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl border border-violet-400/15 bg-zinc-950">
          <div className="h-px w-full bg-violet-400/30" />

          <div className="px-6 py-8 text-center">
            <div className="mx-auto h-[240px] w-[160px] overflow-hidden rounded-xl border border-zinc-800 bg-black">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={`${movieTitle} poster`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-3xl text-zinc-800">
                    ◈
                  </span>
                </div>
              )}
            </div>

            <p className="mt-6 text-[8px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              JMI Premium Feature
            </p>

            <h2 className="mt-2 text-lg font-medium tracking-[-0.025em] text-zinc-100">
              {movieTitle}
            </h2>

            {releaseYear && (
              <p className="mt-1 text-[9px] text-zinc-600">
                {releaseYear}
              </p>
            )}

            <p className="mx-auto mt-4 max-w-xs text-[9px] leading-5 text-zinc-500">
              Generate a professionally structured JMI
              performance analysis based on this
              movie&apos;s theatrical and business
              intelligence.
            </p>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={
                loading || pdfGenerating
              }
              className="mt-7 inline-flex w-full items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/[0.08] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading || pdfGenerating ? (
                <>
                  <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border border-violet-300/30 border-t-violet-300" />

                  {loading
                    ? "Preparing Report..."
                    : "Creating PDF..."}
                </>
              ) : (
                <>📄 Generate JMI Performance Report</>
              )}
            </button>

            <p className="mt-4 text-[7px] uppercase tracking-[0.18em] text-zinc-700">
              Premium · ₹99 / month
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-400/10 bg-red-500/[0.04] px-4 py-3">
                <p className="text-[8px] leading-4 text-red-300">
                  {error}
                </p>

                {error.includes("sign in") && (
                  <Link
                    href="/account/login"
                    className="mt-3 inline-flex text-[8px] font-semibold uppercase tracking-[0.14em] text-violet-300 hover:text-violet-200"
                  >
                    Sign In →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/*
       * JMI PERFORMANCE REPORT RESULT
       *
       * We keep the temporary JSON viewer for now
       * so we can verify the complete data structure.
       *
       * Later this will become the polished report
       * preview interface.
       */}
      {report && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-2xl">
            <div className="overflow-hidden rounded-2xl border border-violet-400/20 bg-zinc-950">
              <div className="h-px w-full bg-violet-400/40" />

              <div className="px-5 py-6 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-violet-400">
                      JMI Premium Intelligence
                    </p>

                    <h3 className="mt-2 text-lg font-medium text-zinc-100">
                      {movieTitle}
                    </h3>

                    <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-zinc-600">
                      Performance Report Data
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setReport(null)
                    }
                    className="text-[9px] text-zinc-600 transition hover:text-zinc-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-6 rounded-xl border border-zinc-800 bg-black/60 p-4">
                  <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap break-words text-left text-[8px] leading-5 text-zinc-400">
                    {JSON.stringify(
                      report.report ??
                        report,
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={
                      handleDownloadPDF
                    }
                    disabled={
                      pdfGenerating ||
                      !report.report
                    }
                    className="flex-1 rounded-lg border border-violet-400/30 bg-violet-500/[0.08] px-4 py-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pdfGenerating
                      ? "Creating PDF..."
                      : "↓ Download JMI PDF"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReport(null)
                    }
                    className="rounded-lg border border-zinc-800 px-4 py-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*
       * Premium upgrade modal
       */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-violet-400/20 bg-zinc-950">
            <div className="h-px w-full bg-violet-400/40" />

            <div className="px-6 py-7 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/[0.05]">
                <span className="text-base">
                  🔒
                </span>
              </div>

              <p className="mt-4 text-[8px] font-semibold uppercase tracking-[0.24em] text-violet-400">
                JMI Premium Feature
              </p>

              <h3 className="mt-2 text-lg font-medium text-zinc-100">
                JMI Performance Report
              </h3>

              <p className="mx-auto mt-3 max-w-xs text-[9px] leading-5 text-zinc-500">
                This exclusive report is available
                with JMI Premium.
              </p>

              <div className="mt-5 rounded-xl border border-zinc-800 bg-black/50 px-4 py-4">
                <p className="text-[8px] uppercase tracking-[0.2em] text-yellow-500">
                  JMI Premium
                </p>

                <div className="mt-1">
                  <span className="text-2xl font-semibold text-green-400">
                    ₹99
                  </span>

                  <span className="ml-1 text-[9px] text-zinc-400">
                    / month
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href={
                    authenticated
                      ? "/account"
                      : "/account/login"
                  }
                  className="inline-flex items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/[0.08] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/[0.14]"
                >
                  {authenticated
                    ? "Get JMI Premium →"
                    : "Sign In / Join JMI →"}
                </Link>

                {!authenticated && (
                  <Link
                    href="/account/signup"
                    className="py-2 text-[8px] font-medium uppercase tracking-[0.16em] text-green-500 transition hover:text-zinc-300"
                  >
                    Create Account
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setShowUpgrade(false)
                  }
                  className="mt-1 py-2 text-[8px] uppercase tracking-[0.16em] text-zinc-600 transition hover:text-zinc-300"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}