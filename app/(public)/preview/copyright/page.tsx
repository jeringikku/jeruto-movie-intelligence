import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function CopyrightPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-300">
      <PublicHeader />

      <section className="border-b border-zinc-900 bg-zinc-950/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Copyright &amp; Content Policy
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
            This page explains JMI&apos;s approach to original content,
            third-party material, database information and copyright-related
            concerns.
          </p>

          <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-red-500">
            Last updated: September 2026
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16">

          <LegalSection title="1. About JMI Content">
            <p>
              Jeruto Movie Intelligence (JMI) is a movie database and
              film-industry trade intelligence platform operated under the
              Jeruto brand.
            </p>

            <p>
              JMI contains a combination of original database organization,
              analytical presentation, written material, software,
              visualizations and information relating to the Indian film
              industry.
            </p>
          </LegalSection>

          <LegalSection title="2. JMI-Owned Content">
            <p>
              Unless otherwise stated, original JMI-created elements of the
              website may include its software, interface design, branding,
              logos, original written descriptions, analytical presentation,
              database structure and original visualizations.
            </p>

            <p>
              Such material may be protected by applicable copyright,
              trademark and other intellectual-property laws.
            </p>

            <p>
              Unauthorized reproduction, substantial copying, redistribution
              or commercial exploitation of proprietary JMI material is not
              permitted except where allowed by applicable law or expressly
              authorized by JMI.
            </p>
          </LegalSection>

          <LegalSection title="3. Movie and Industry Information">
            <p>
              JMI publishes factual and analytical information relating to
              movies, people, companies, industries, markets, releases and
              theatrical business.
            </p>

            <p>
              Facts, figures and information that are not themselves protected
              by copyright may be independently used in accordance with
              applicable law.
            </p>

            <p>
              However, the particular organization, presentation, compilation
              and original expression of information on JMI may constitute
              protected intellectual property.
            </p>
          </LegalSection>

          <LegalSection title="4. Box-Office Figures and Trade Data">
            <p>
              JMI&apos;s box-office figures are trade figures and are generally
              estimated using online ticket-sales tracking, market
              observation and other available theatrical data.
            </p>

            <p>
              JMI does not claim that its figures are the original or final
              official figures of producers, distributors, exhibitors,
              rights-holders or other industry parties unless specifically
              identified as such.
            </p>

            <p>
              JMI does{" "}
              <strong className="text-zinc-200">not claim 100% accuracy</strong>{" "}
              over its box-office figures.
            </p>

            <p>
              Figures may be revised when additional information becomes
              available. Differences may occur because of reporting methods,
              ticket-sales availability, timing, territory coverage and other
              market factors.
            </p>
          </LegalSection>

          <LegalSection title="5. Third-Party Intellectual Property">
            <p>
              Movies, television programs, songs, production companies,
              distributors, exhibitors and other entertainment properties
              referenced on JMI may be associated with names, trademarks,
              logos, posters, photographs and other copyrighted or
              trademarked material belonging to third parties.
            </p>

            <p>
              JMI does not claim ownership of third-party intellectual
              property merely because it is referenced or displayed on the
              platform.
            </p>

            <p>
              All applicable rights remain with their respective copyright,
              trademark or intellectual-property owners.
            </p>
          </LegalSection>

          <LegalSection title="6. Images, Posters and Promotional Material">
            <p>
              JMI may display movie posters, promotional artwork, logos or
              other visual material in connection with identifying or
              describing movies and film-industry entities.
            </p>

            <p>
              Such material may belong to the relevant studios, production
              companies, distributors, artists, photographers, agencies or
              other rights-holders.
            </p>

            <p>
              JMI does not represent that it owns the copyright in such
              third-party material unless explicitly stated.
            </p>
          </LegalSection>

          <LegalSection title="7. Trademarks and Brand Names">
            <p>
              Names, logos and trademarks appearing on JMI that belong to
              third parties remain the property of their respective owners.
            </p>

            <p>
              Their appearance on the website is generally intended for
              identification, reference, informational or analytical
              purposes and does not by itself establish ownership,
              sponsorship or endorsement.
            </p>
          </LegalSection>

          <LegalSection title="8. Permitted Use of JMI Material">
            <p>
              Reasonable personal, educational, research, journalistic and
              informational use of JMI information may be permitted subject
              to applicable law.
            </p>

            <p>
              Where JMI material is referenced publicly, users should provide
              appropriate attribution to JMI where reasonably applicable.
            </p>

            <p>
              Users should not present JMI estimates as official producer,
              distributor or exhibitor figures.
            </p>
          </LegalSection>

          <LegalSection title="9. Prohibited Reproduction">
            <p>
              Without appropriate authorization, users should not:
            </p>

            <ul>
              <li>
                Copy substantial portions of the JMI database for
                redistribution.
              </li>
              <li>
                Republish substantial JMI tables, rankings or analytical
                pages as their own work.
              </li>
              <li>
                Systematically scrape or reproduce JMI data for a competing
                database or service.
              </li>
              <li>
                Sell or commercially redistribute proprietary JMI
                compilations.
              </li>
              <li>
                Remove or obscure applicable JMI attribution or ownership
                notices.
              </li>
            </ul>

            <p>
              Nothing in this section is intended to restrict rights granted
              by applicable copyright or other laws.
            </p>
          </LegalSection>

          <LegalSection title="10. Copyright Concerns and Notices">
            <p>
              If you believe that material appearing on JMI infringes your
              copyright or other applicable intellectual-property rights,
              please contact JMI with sufficient information for the matter
              to be reviewed.
            </p>

            <p>
              A copyright-related notice should, where applicable, identify
              the material concerned, explain the rights being asserted and
              provide enough information for JMI to locate and evaluate the
              material.
            </p>

            <div className="mt-5">
              <Link
                href="/preview/contact"
                className="inline-flex items-center border border-zinc-800 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-violet-500/40 hover:text-white"
              >
                Submit a Notice
              </Link>
            </div>
          </LegalSection>

          <LegalSection title="11. Review and Removal">
            <p>
              Where a legitimate copyright or intellectual-property concern
              is brought to our attention, JMI may review the relevant
              material and take appropriate action where necessary.
            </p>

            <p>
              Depending on the circumstances, this may include correcting
              attribution, modifying material, replacing an image, removing
              material or requesting additional information from the
              reporting party.
            </p>

            <p>
              A notice does not automatically establish that infringement has
              occurred. Each matter may require individual review.
            </p>
          </LegalSection>

          <LegalSection title="12. Corrections and Data Issues">
            <p>
              Copyright concerns are separate from ordinary requests to
              correct movie or box-office information.
            </p>

            <p>
              If you identify a potentially incorrect movie detail, box-office
              figure, company association, release detail or other database
              information, you may contact JMI with the relevant information
              and supporting evidence where available.
            </p>
          </LegalSection>

          <LegalSection title="13. No Transfer of Third-Party Rights">
            <p>
              Nothing on JMI transfers ownership of third-party copyrights,
              trademarks, publicity rights or other intellectual-property
              rights to JMI users.
            </p>

            <p>
              Users remain responsible for obtaining any permissions required
              for their own use of third-party material.
            </p>
          </LegalSection>

          <LegalSection title="14. Changes to This Policy">
            <p>
              JMI may update this Copyright &amp; Content Policy from time to
              time to reflect changes in the platform, applicable law or
              operating practices.
            </p>

            <p>
              The updated version will be published on this page with a
              revised &quot;Last updated&quot; date.
            </p>
          </LegalSection>

          <LegalSection title="15. Contact">
            <p>
              For copyright notices, content concerns, attribution questions
              or database corrections, please contact JMI through the contact
              page.
            </p>

            <div className="mt-5">
              <Link
                href="/preview/contact"
                className="inline-flex items-center border border-zinc-800 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-violet-500/40 hover:text-white"
              >
                Contact JMI
              </Link>
            </div>
          </LegalSection>

          <div className="mt-14 border-t border-zinc-900 pt-8">
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