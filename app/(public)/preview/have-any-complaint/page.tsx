import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function HaveAnyComplaintPage() {
return (
<main className="min-h-screen bg-black text-zinc-300">
<PublicHeader />

  <section className="border-b border-zinc-900 bg-zinc-950/60">
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20">
      <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-500">
        Feedback &amp; Corrections
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Have Any Complaint?
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
        Found a discrepancy in JMI's published information? We welcome
        genuine feedback, supporting evidence and correction requests
        from creators, original information owners, industry
        professionals and members of the public.
      </p>

      <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-red-500">
        Our Commitment to Accurate Information
      </p>
    </div>
  </section>

  <section>
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16">

      <LegalSection title="1. About JMI and Its Published Information">
        <p>
          Jeruto Movie Intelligence (JMI) is a movie database and
          film-industry intelligence platform that provides information
          about movies, artists, production companies, distributors,
          theatrical markets and other cinema-related subjects.
        </p>

        <p>
          Our published information may include movie details,
          box-office collections, trade estimates, market analysis
          and other information compiled through research, technological
          analysis, industry observations and estimates based on
          available data.
        </p>

        <p>
          <strong className="text-zinc-200">
            JMI does not claim that every piece of information published
            on its platform is 100% accurate, original, complete or
            independently verified.
          </strong>{" "}
          The reliability of individual records may vary depending on
          the availability, quality, source and timing of the underlying
          information.
        </p>

        <p>
          Box-office figures in particular may represent trade
          estimates, reported figures, provisional data or other
          assessments based on available information. They may differ
          from figures subsequently published or confirmed by producers,
          distributors, exhibitors, rights-holders or other original
          sources.
        </p>

        <p>
          We aim to present information as honestly and responsibly
          as possible, while acknowledging the limitations that can
          arise when analysing an industry in which complete and
          independently verified data may not always be publicly
          available.
        </p>
      </LegalSection>

      <LegalSection title="2. Are You a Creator or the Original Owner of the Information?">
        <p>
          If you are a filmmaker, producer, distributor, exhibitor,
          artist, production company, authorized representative or
          another legitimate source of original information, and you
          believe that JMI has published incorrect or misleading
          information concerning you, your work or your organization,
          we invite you to contact our team directly.
        </p>

        <p>
          We understand that information relating to movie business,
          box-office performance, production details and other
          industry matters can be sensitive and that discrepancies
          deserve careful attention.
        </p>

        <p>
          If you have credible and verifiable evidence demonstrating
          that a published record is incorrect, please share the
          relevant details and supporting documents or authoritative
          sources with us.
        </p>

        <p>
          <strong className="text-zinc-200">
            When a discrepancy is substantiated and the supplied
            information is verified, JMI will correct or update the
            affected information as promptly as reasonably possible.
          </strong>{" "}
          The nature and extent of the correction will depend on the
          evidence, the scope of the discrepancy and any necessary
          verification.
        </p>

        <p>
          Our objective is to replace demonstrably incorrect information
          with reliable, appropriately supported information—not to
          defend an error simply because it has already been published.
        </p>
      </LegalSection>

      <LegalSection title="3. Our Commitment: We Are Open to Correcting Our Mistakes">
        <p>
          JMI was not created to defame, damage or unfairly undermine
          any individual, creator, company or organization associated
          with cinema. Our purpose is to provide useful information
          and insights about movies and the film industry.
        </p>

        <p>
          We recognize that research, data collection, technological
          analysis and trade estimation can sometimes lead to errors.
          We do not consider acknowledging a genuine mistake to be a
          weakness.
        </p>

        <p>
          <strong className="text-zinc-200">
            If JMI gets something wrong, we are willing to acknowledge
            the mistake and correct it when reliable evidence supports
            the correction.
          </strong>
        </p>

        <p>
          We welcome constructive criticism and legitimate correction
          requests. We would rather improve an inaccurate record than
          knowingly leave verified incorrect information uncorrected.
        </p>

        <p>
          At the same time, to maintain the integrity of our database,
          corrections must be assessed on the available evidence.
          A request alone does not automatically establish that a
          published figure is wrong, particularly where different
          sources report different numbers or use different reporting
          methods.
        </p>
      </LegalSection>

      <LegalSection title="4. What Should You Include in a Complaint?">
        <p>
          To help us investigate your concern efficiently, please
          provide as much relevant information as possible, including:
        </p>

        <ul>
          <li>
            <strong className="text-zinc-300">
              The affected information:
            </strong>{" "}
            identify the movie, person, company, territory, collection
            figure or other JMI record concerned.
          </li>

          <li>
            <strong className="text-zinc-300">
              The discrepancy:
            </strong>{" "}
            explain what you believe is incorrect and, where possible,
            identify the specific figure or statement that needs review.
          </li>

          <li>
            <strong className="text-zinc-300">
              Supporting evidence:
            </strong>{" "}
            provide official statements, authoritative publications,
            relevant records or other credible material that supports
            your proposed correction.
          </li>

          <li>
            <strong className="text-zinc-300">
              Your connection to the matter:
            </strong>{" "}
            explain whether you are the original source, rights-holder,
            authorized representative or another person with relevant
            knowledge.
          </li>

          <li>
            <strong className="text-zinc-300">
              Your requested correction:
            </strong>{" "}
            clearly state what you believe the accurate information
            should be and provide its supporting basis.
          </li>
        </ul>

        <p>
          Please provide only information reasonably necessary to
          assess your request. Do not send passwords, payment
          credentials or unnecessary sensitive personal information.
        </p>
      </LegalSection>

      <LegalSection title="5. How JMI Handles Complaints">
        <p>
          Once we receive a complaint or correction request, we may
          review the affected page, examine the supplied evidence,
          compare available sources and seek clarification where
          reasonably necessary.
        </p>

        <p>
          Depending on the circumstances, we may correct or update
          the record, add clarification, retain the existing
          information where the evidence does not establish an error,
          or request further supporting material.
        </p>

        <p>
          We aim to handle genuine complaints fairly and in a
          reasonable timeframe. However, we cannot guarantee an
          immediate response or instant correction in every case.
          Some matters may require additional research, source
          verification or clarification.
        </p>

        <p>
          Submitting a complaint does not automatically guarantee
          removal or modification of a record. Decisions are based
          on the available evidence, the nature of the concern and
          applicable legal obligations.
        </p>

        <p>
          If your concern involves an urgent privacy issue, a
          potentially unlawful disclosure or a matter requiring
          immediate attention, please identify that clearly in
          your communication.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact the JMI Team Directly">
        <p>
          If you have a genuine complaint, have identified a
          discrepancy or would like to submit verified information
          for correction, please contact us through our contact page
          or either of the email addresses below.
        </p>

        <p>
          We encourage original information owners and authorized
          representatives to communicate with us directly so that
          concerns can be assessed using relevant evidence.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              JMI Support
            </p>
            <a
              href="mailto:support@jeruto.com"
              className="text-sm text-violet-400 transition hover:text-white"
            >
              support@jeruto.com
            </a>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Additional Contact
            </p>
            <a
              href="mailto:janaytics6@gmail.com"
              className="text-sm text-violet-400 transition hover:text-white"
            >
              janaytics6@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/preview/contact"
            className="inline-flex items-center border border-zinc-800 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-violet-500/40 hover:text-white"
          >
            Contact JMI Team
          </Link>
        </div>
      </LegalSection>

      <LegalSection title="7. Our Final Word">
        <p>
          JMI is committed to improving the quality and reliability
          of the information it publishes. We believe that transparency,
          constructive feedback and a willingness to correct genuine
          mistakes are essential to building trust with the film
          industry and our readers.
        </p>

        <p>
          We cannot promise that every published record will always
          be free from error. However, we welcome credible evidence
          and will make reasonable efforts to investigate substantiated
          concerns and correct verified inaccuracies.
        </p>

        <p>
          Thank you for helping us make Jeruto Movie Intelligence
          more accurate, responsible and useful to everyone interested
          in cinema.
        </p>
      </LegalSection>

      <div className="mt-10 border-t border-zinc-900 pt-8">
        <Link
          href="/"
          className="text-[9px] font-semibold tracking-[0.18em] text-violet-500 transition hover:text-zinc-300"
        >
          ← Back to JMI
        </Link>
      </div>

    </div>
  </section>

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

        <p className="text-[9px] text-zinc-500">
          JMI · People Intelligence
        </p>
      </div>
    </div>
  </footer>
</main>

);
}

function LegalSection({
title,
children,
}: {
title: string;
children: React.ReactNode;
}) {
return (
<section className="border-b border-zinc-900 py-8 first:pt-0">
<h2 className="text-sm font-semibold tracking-tight text-zinc-100 sm:text-base">
{title}
</h2>

  <div className="mt-4 space-y-4 text-[12px] leading-6 text-zinc-500 sm:text-[13px]">
    {children}
  </div>
</section>

);
}
