import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-300">
      <PublicHeader />

      <section className="border-b border-zinc-900 bg-zinc-950/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Terms &amp; Conditions
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
            These Terms &amp; Conditions govern your access to and use of the
            Jeruto Movie Intelligence website and its publicly available
            services.
          </p>

          <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-red-500">
            Last updated: September 2026
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16">

          <LegalSection title="1. Acceptance of These Terms">
            <p>
              By accessing or using Jeruto Movie Intelligence ("JMI", "we",
              "us" or "our"), you acknowledge that you have read,
              understood and agree to these Terms &amp; Conditions.
            </p>

            <p>
              If you do not agree with these terms, please do not use the
              website.
            </p>
          </LegalSection>

          <LegalSection title="2. About JMI">
            <p>
              JMI is an Indian movie database and film-industry trade
              intelligence platform operated under the Jeruto brand.
            </p>

            <p>
              The platform provides information and analytical tools relating
              to movies, people, companies, industries, markets, releases and
              theatrical business.
            </p>
          </LegalSection>

          <LegalSection title="3. Nature of JMI Data">
            <p>
              JMI contains information gathered from publicly available
              sources, market observation, online ticket-sales tracking and
              other available industry data.
            </p>

            <p>
              Box-office figures published by JMI are generally{" "}
              <strong className="text-zinc-200">trade figures</strong> and may
              be estimates based on available data.
            </p>

            <p>
              JMI does not represent its figures as the original or final
              official figures of producers, distributors, exhibitors,
              rights-holders or other parties unless a figure is specifically
              identified as such.
            </p>

            <p>
              JMI does{" "}
              <strong className="text-zinc-200">not claim 100% accuracy</strong>{" "}
              over its box-office figures.
            </p>

            <p>
              Actual theatrical collections may differ from JMI figures due
              to differences in reporting, ticket-sales data availability,
              timing, territory coverage, taxes, refunds, cancellations,
              reporting methodology and other market factors.
            </p>
          </LegalSection>

          <LegalSection title="4. No Guarantee of Accuracy or Completeness">
            <p>
              JMI aims to provide consistent and useful film-industry
              intelligence, but information displayed on the platform may
              contain errors, omissions, delays or revisions.
            </p>

            <p>
              The presence of a figure, record, ranking or other information
              on JMI should not be interpreted as a guarantee that the
              information is complete, current or officially verified.
            </p>

            <p>
              JMI may revise, correct, update or remove information when new
              data becomes available or when an error is identified.
            </p>
          </LegalSection>

          <LegalSection title="5. Informational and Analytical Purpose">
            <p>
              JMI is intended primarily for informational, research,
              analytical and industry-intelligence purposes.
            </p>

            <p>
              Users should independently verify important information before
              relying on it for commercial, financial, legal, contractual or
              other consequential decisions.
            </p>
          </LegalSection>

          <LegalSection title="6. Intellectual Property">
            <p>
              The JMI website, including its original software, interface
              design, branding, logos, graphics, written material, database
              structure, analytical presentation and other original content,
              may be protected by applicable intellectual-property laws.
            </p>

            <p>
              Except where permitted by law or expressly authorized by JMI,
              users may not reproduce, redistribute, republish, sell,
              systematically scrape, commercially exploit or create
              derivative services from JMI's proprietary content or
              presentation.
            </p>

            <p>
              Copyright and ownership of third-party movie titles, posters,
              photographs, trademarks, logos and other third-party materials
              remain with their respective owners.
            </p>
          </LegalSection>

          <LegalSection title="7. Use of JMI Data">
            <p>
              Users may access and use publicly available JMI information for
              reasonable personal, research, journalistic and informational
              purposes, subject to applicable law.
            </p>

            <p>
              Large-scale automated extraction, database replication,
              systematic scraping or commercial redistribution of JMI data
              requires prior authorization from JMI where such authorization
              is legally required.
            </p>

            <p>
              Nothing in these terms is intended to restrict rights that
              cannot legally be restricted.
            </p>
          </LegalSection>

          <LegalSection title="8. Third-Party Materials">
            <p>
              JMI may reference or link to information, websites, services,
              images, trademarks or other materials belonging to third
              parties.
            </p>

            <p>
              Such references do not necessarily indicate ownership,
              endorsement, sponsorship or affiliation unless explicitly
              stated.
            </p>

            <p>
              Third-party intellectual property remains the property of its
              respective owners.
            </p>
          </LegalSection>

          <LegalSection title="9. User Conduct">
            <p>Users agree not to:</p>

            <ul>
              <li>Use JMI for unlawful purposes.</li>
              <li>Attempt to gain unauthorized access to the website or its systems.</li>
              <li>Interfere with the security or operation of the platform.</li>
              <li>Introduce malicious code, automated attacks or harmful material.</li>
              <li>Misrepresent JMI information as guaranteed official data.</li>
              <li>Use JMI in a manner that violates applicable laws or regulations.</li>
            </ul>
          </LegalSection>

          <LegalSection title="10. Availability of the Website">
            <p>
              JMI aims to keep the website available and operational but does
              not guarantee uninterrupted or error-free access.
            </p>

            <p>
              The website may occasionally be unavailable because of
              maintenance, updates, technical problems, security measures,
              infrastructure failures or circumstances outside JMI's
              reasonable control.
            </p>
          </LegalSection>

          <LegalSection title="11. Limitation of Liability">
            <p>
              To the extent permitted by applicable law, JMI and its
              operators shall not be responsible for losses or damages arising
              solely from reliance on estimates, rankings, analytical
              information or other data published on the platform.
            </p>

            <p>
              Users are responsible for independently evaluating information
              before using it for decisions that may have financial,
              commercial, legal or other significant consequences.
            </p>
          </LegalSection>

          <LegalSection title="12. Changes to the Website">
            <p>
              JMI may add, modify, suspend or discontinue features, sections,
              data presentations or other parts of the website from time to
              time.
            </p>

            <p>
              These changes may be made to improve the platform, correct
              information, introduce new functionality or respond to
              operational or legal requirements.
            </p>
          </LegalSection>

          <LegalSection title="13. Changes to These Terms">
            <p>
              JMI may update these Terms &amp; Conditions from time to time.
              The updated version will be published on this page together
              with a revised "Last updated" date.
            </p>

            <p>
              Continued use of the website after an update may constitute
              acceptance of the revised terms to the extent permitted by
              applicable law.
            </p>
          </LegalSection>

          <LegalSection title="14. Privacy">
            <p>
              Information about how JMI handles information and privacy is
              provided in our Privacy Policy.
            </p>

            <div className="mt-5">
              <Link
                href="/preview/privacy"
                className="inline-flex items-center border border-zinc-800 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-violet-500/40 hover:text-white"
              >
                View Privacy Policy
              </Link>
            </div>
          </LegalSection>

          <LegalSection title="15. Contact">
            <p>
              Questions regarding these Terms &amp; Conditions, JMI data,
              copyright or other matters can be submitted through the JMI
              contact page.
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

          <LegalSection title="16. Governing Law">
            <p>
              These Terms &amp; Conditions shall be interpreted in accordance
              with applicable laws and regulations of India, subject to any
              mandatory legal rights or requirements that may apply.
            </p>
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