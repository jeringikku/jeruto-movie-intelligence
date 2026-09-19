import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-300">
      <PublicHeader />

      <section className="border-b border-zinc-900 bg-zinc-950/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-500">
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Privacy Policy
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
            This Privacy Policy explains how Jeruto Movie Intelligence (JMI)
            collects, uses and protects information when you use our website
            and services.
          </p>

          <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-red-500">
            Last updated: September 2026
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16">

             

        

          <LegalSection title="1. About This Policy">
            <p>
              Jeruto Movie Intelligence ("JMI", "we", "us" or "our") is a
              movie database and film-industry intelligence platform operated
              under the Jeruto brand.
            </p>

            <p>
              This Privacy Policy describes how information may be handled
              when you access or use the JMI website, including its public
              pages and related services.
            </p>
          </LegalSection>

          <LegalSection title="2. Information We May Collect">
            <p>
              Depending on how you use JMI, we may collect or process limited
              information such as:
            </p>

            <ul>
              <li>Information you voluntarily provide through contact forms or communications.</li>
              <li>Technical information such as browser type, device type and operating system.</li>
              <li>General usage information about how pages and features are accessed.</li>
              <li>IP address or similar technical information where required for security, analytics or service operation.</li>
              <li>Information necessary to maintain the security and reliability of the website.</li>
            </ul>

            <p>
              JMI does not require visitors to create an account simply to
              browse the public movie database.
            </p>
          </LegalSection>

          <LegalSection title="3. How We Use Information">
            <p>Information may be used for purposes including:</p>

            <ul>
              <li>Operating and maintaining the JMI website.</li>
              <li>Improving website functionality and user experience.</li>
              <li>Understanding general website usage and traffic patterns.</li>
              <li>Preventing abuse, fraud and unauthorized access.</li>
              <li>Responding to enquiries and communications.</li>
              <li>Maintaining the accuracy, reliability and security of our services.</li>
            </ul>

            <p>
              We do not use personal information for purposes unrelated to the
              operation of JMI without an appropriate legal basis or consent
              where required.
            </p>
          </LegalSection>

          <LegalSection title="4. Cookies and Similar Technologies">
            <p>
              JMI may use cookies or similar technologies that are necessary
              for website functionality, security, analytics or user
              experience.
            </p>

            <p>
              Third-party services used by the website may also place cookies
              or collect technical information according to their own privacy
              policies.
            </p>

            <p>
              You may be able to control cookies through your browser
              settings. Disabling certain cookies may affect some website
              functionality.
            </p>
          </LegalSection>

          <LegalSection title="5. Third-Party Services">
            <p>
              JMI may use third-party infrastructure, hosting, analytics,
              database, security or other service providers to operate the
              platform.
            </p>

            <p>
              Such providers may process limited technical or operational
              information as necessary to provide their services. Their
              handling of information is governed by their respective terms
              and privacy policies.
            </p>
          </LegalSection>

          <LegalSection title="6. Movie and Box-Office Data">
            <p>
              JMI is primarily a movie database and trade-intelligence
              platform. Much of the information displayed on the website
              relates to movies, people, companies, markets, releases and
              box-office performance rather than private personal information.
            </p>

            <p>
              JMI box-office figures are trade figures and may be estimated
              using online ticket-sales tracking, market observation and other
              available theatrical data.
            </p>

            <p>
              JMI does <strong className="text-zinc-200">not</strong> claim
              that its figures are the original or final official figures of
              producers, distributors, exhibitors or other rights-holders.
            </p>

            <p>
              JMI also does <strong className="text-zinc-200">not</strong>{" "}
              claim 100% accuracy over its box-office figures. Figures may
              differ from subsequently reported official figures because of
              reporting differences, data availability, timing, territory
              coverage and other factors.
            </p>
          </LegalSection>

          <LegalSection title="7. Public Information">
            <p>
              JMI may publish information about movies, film personalities,
              production companies, distributors, exhibitors, industries,
              territories and other film-industry entities where such
              information is considered relevant to the purpose of the
              platform.
            </p>

            <p>
              Publicly available information may be collected from various
              sources. JMI does not represent that every piece of publicly
              available information is complete, current or error-free.
            </p>
          </LegalSection>

          <LegalSection title="8. Data Security">
            <p>
              We take reasonable measures to protect information processed
              through the website against unauthorized access, misuse,
              alteration or disclosure.
            </p>

            <p>
              However, no internet-based service can guarantee absolute
              security. Users should understand that transmission of
              information over the internet always carries some level of
              risk.
            </p>
          </LegalSection>

          <LegalSection title="9. Data Retention">
            <p>
              Information may be retained for as long as reasonably necessary
              for the purpose for which it was collected, to operate the
              website, maintain records, comply with legal obligations,
              resolve disputes or protect the security of JMI.
            </p>
          </LegalSection>

          <LegalSection title="10. Children's Privacy">
            <p>
              JMI is not specifically directed toward children. We do not
              knowingly seek to collect personal information from children
              through the public website.
            </p>
          </LegalSection>

          <LegalSection title="11. External Links">
            <p>
              JMI may contain links to third-party websites or services.
              JMI is not responsible for the privacy practices, content or
              security of external websites.
            </p>

            <p>
              Users should review the privacy policies of third-party
              websites before providing them with personal information.
            </p>
          </LegalSection>

          <LegalSection title="12. Changes to This Policy">
            <p>
              This Privacy Policy may be updated from time to time to reflect
              changes in the JMI platform, technology, legal requirements or
              operational practices.
            </p>

            <p>
              When changes are made, the updated version will be published on
              this page with a revised "Last updated" date.
            </p>
          </LegalSection>

          <LegalSection title="13. Contact">
            <p>
              If you have questions, concerns or requests regarding this
              Privacy Policy or the handling of information by JMI, please
              contact us through the JMI contact page.
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