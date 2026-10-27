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
            collects, uses, stores, discloses and protects information when
            you access or use our website, accounts and related services.
          </p>

          <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-red-500">
            Last updated: October 2026
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16">

          <LegalSection title="1. About This Privacy Policy">
            <p>
              Jeruto Movie Intelligence ("JMI", "we", "us" or "our") is a
              movie database, box-office tracking and film-industry
              intelligence platform operated under the Jeruto brand.
            </p>

            <p>
              This Privacy Policy applies to information processed through
              the JMI website, public pages, registered user accounts,
              contact channels and other services operated by JMI.
            </p>

            <p>
              By accessing or using JMI, you acknowledge that you have had
              the opportunity to read this Privacy Policy. Where applicable
              law requires consent for a particular processing activity, we
              will seek that consent separately. Accessing the website does
              not override any rights granted to you by applicable law.
            </p>
          </LegalSection>

          <LegalSection title="2. Information We May Collect">
            <p>
              The information processed by JMI depends on the features you
              use and the information you choose to provide. It may include:
            </p>

            <ul>
              <li>
                <strong className="text-zinc-300">
                  Account and profile information:
                </strong>{" "}
                information such as your name, email address, username,
                profile image and other details you choose to provide when
                registering for or maintaining an account.
              </li>

              <li>
                <strong className="text-zinc-300">
                  Communications:
                </strong>{" "}
                information included in enquiries, feedback, correction
                requests, complaints or other communications sent to JMI.
              </li>

              <li>
                <strong className="text-zinc-300">
                  Technical information:
                </strong>{" "}
                information such as browser type, device type, operating
                system, approximate location derived from technical data,
                IP address and diagnostic information, where processed.
              </li>

              <li>
                <strong className="text-zinc-300">
                  Usage information:
                </strong>{" "}
                information about pages visited, features used, interaction
                patterns, access times and general website performance,
                where collected.
              </li>

              <li>
                <strong className="text-zinc-300">
                  Security and authentication information:
                </strong>{" "}
                information necessary to authenticate users, maintain
                sessions, detect suspicious activity and protect accounts
                and services.
              </li>

              <li>
                <strong className="text-zinc-300">
                  Information you voluntarily submit:
                </strong>{" "}
                any additional information you provide when using forms or
                other available website features.
              </li>
            </ul>

            <p>
              You can browse JMI's public database without registering for
              an account. Certain features may require registration or
              additional information.
            </p>

            <p>
              Please do not submit passwords, financial account credentials
              or other sensitive information through public forms or
              communications unless a specific, secure and appropriate
              process is expressly provided.
            </p>
          </LegalSection>

          <LegalSection title="3. How We Use Information">
            <p>
              Information may be processed for purposes including:
            </p>

            <ul>
              <li>Creating, maintaining and securing user accounts.</li>
              <li>Operating, maintaining and improving the JMI platform.</li>
              <li>Providing website features and responding to user requests.</li>
              <li>Responding to enquiries, feedback and correction requests.</li>
              <li>Diagnosing errors and improving website reliability.</li>
              <li>Understanding general usage and performance patterns, where analytics are used.</li>
              <li>Detecting spam, fraud, abuse and unauthorized access.</li>
              <li>Enforcing our website terms and protecting our legal rights.</li>
              <li>Meeting applicable legal, regulatory and record-keeping obligations.</li>
              <li>Protecting the rights, safety and security of users and JMI.</li>
            </ul>

            <p>
              We aim to collect and process only information reasonably
              necessary for the relevant purpose. Where required by law,
              processing will be based on an applicable legal ground,
              including consent where necessary.
            </p>

            <p>
              We do not promise that information will never be processed
              for a new purpose. If a new purpose requires additional
              notice or consent under applicable law, we will provide it
              as required.
            </p>
          </LegalSection>

          <LegalSection title="4. Public Access and User Accounts">
            <p>
              JMI is intended to provide public access to its movie database
              and informational features without requiring a paid
              subscription. Registration may be available for features that
              require a user account.
            </p>

            <p>
              If you register, you are responsible for providing accurate
              information where required and taking reasonable steps to
              protect your login credentials. You should notify us if you
              believe your account has been accessed without authorization.
            </p>

            <p>
              Account information may be used to operate your profile,
              authenticate access, maintain account security, respond to
              requests and provide account-related functionality.
            </p>

            <p>
              Account deletion or correction requests may be subject to
              verification, technical limitations and lawful retention
              requirements. Deleting an account may not automatically
              remove records that must be retained for security, legal or
              legitimate operational purposes.
            </p>
          </LegalSection>

          <LegalSection title="5. Cookies and Similar Technologies">
            <p>
              JMI may use cookies, local storage, session technologies or
              similar mechanisms where needed for website functionality,
              authentication, security, user preferences and other
              legitimate operational purposes.
            </p>

            <p>
              Where analytics, advertising or other optional technologies
              are implemented, they may collect information about how
              visitors interact with the website. The information collected
              and the available controls depend on the technologies actually
              used.
            </p>

            <p>
              Third-party services integrated into JMI may use their own
              cookies or similar technologies under their respective
              privacy policies and settings.
            </p>

            <p>
              You may be able to restrict or delete cookies through your
              browser settings. Certain restrictions may prevent login,
              account or other website features from working correctly.
              Where consent is legally required for non-essential
              technologies, the applicable consent mechanism should be used.
            </p>
          </LegalSection>

          <LegalSection title="6. Third-Party Service Providers">
            <p>
              JMI may rely on third-party providers for services such as
              website hosting, database infrastructure, authentication,
              security, website delivery, diagnostics, analytics and
              communications, where applicable.
            </p>

            <p>
              These providers may process information on our behalf or
              independently in accordance with their roles, contractual
              arrangements and applicable privacy policies.
            </p>

            <p>
              We take reasonable steps to use appropriate providers and
              safeguards. However, JMI does not control every aspect of
              third-party systems and cannot guarantee the independent
              security, availability or practices of every external
              provider.
            </p>

            <p>
              Users should review the privacy policies of relevant
              third-party services where additional information is needed
              about their data-handling practices.
            </p>
          </LegalSection>

          <LegalSection title="7. Sharing and Disclosure of Information">
            <p>
              JMI does not treat personal information as unrestricted
              public information merely because a person has registered
              an account or visited the website.
            </p>

            <p>
              Information may be disclosed, where appropriate and lawful,
              in the following circumstances:
            </p>

            <ul>
              <li>
                To service providers that support the operation and
                maintenance of JMI.
              </li>
              <li>
                Where necessary to investigate security incidents, abuse,
                fraud or violations of our terms.
              </li>
              <li>
                When required by a valid legal obligation, court order or
                lawful request from a competent authority.
              </li>
              <li>
                When reasonably necessary to establish, exercise or defend
                legal claims or protect the rights and safety of JMI,
                its users or others.
              </li>
              <li>
                In connection with a proposed or completed restructuring,
                transfer or acquisition of relevant business operations,
                subject to applicable legal requirements.
              </li>
              <li>
                With your direction or consent, where applicable.
              </li>
            </ul>

            <p>
              We do not promise that disclosure will never occur. Any
              disclosure will be assessed according to its purpose,
              circumstances and applicable law.
            </p>
          </LegalSection>

          <LegalSection title="8. Movie, Box-Office and Industry Data">
            <p>
              JMI primarily publishes information about movies, film
              personalities, production companies, distributors, exhibitors,
              release markets and box-office performance. Such information
              is distinct from the private account information of our users.
            </p>

            <p>
              Box-office information may be compiled from publicly available
              reports, trade sources, online ticket-sales tracking, market
              observations, industry communications and other available
              sources, depending on the data concerned.
            </p>

            <p>
              Figures may be estimated, provisional, reported by third
              parties or based on partial information. They may change as
              additional information becomes available.
            </p>

            <p>
              JMI does not represent that every box-office figure is an
              original, final or officially verified figure issued by a
              producer, distributor, exhibitor or other rights-holder.
            </p>

            <p>
              Differences may arise because of reporting methods, market
              coverage, timing, ticketing data availability, taxes,
              exchange rates, territory definitions and other factors.
              JMI does not guarantee that all figures will be complete,
              current or error-free.
            </p>

            <p>
              Where appropriate, JMI may label information as estimated,
              actual, official, projected or revised. Such labels describe
              the status assigned to the information and should not be
              interpreted as a guarantee of independent verification unless
              expressly stated.
            </p>
          </LegalSection>

          <LegalSection title="9. Publicly Available Information and Corrections">
            <p>
              JMI may publish information about movies, public-facing film
              professionals, companies, industries, territories and other
              entities relevant to its purpose. Sources may include public
              records, published reports, official announcements and other
              available material.
            </p>

            <p>
              Publication of information does not imply endorsement,
              affiliation, sponsorship or authorization by the person,
              company or organization concerned.
            </p>

            <p>
              We recognize that publicly available information can be
              inaccurate, incomplete, outdated or disputed. If you believe
              information on JMI is incorrect or raises a legitimate privacy
              concern, you may contact us with the relevant page, details
              of the issue and supporting information where available.
            </p>

            <p>
              We may review requests and take appropriate action, which
              could include correction, clarification, updating, restricting
              access or removal where justified. We may request additional
              information to verify a request and are not required to accept
              every requested change where the information is accurate,
              lawfully published or otherwise appropriate to retain.
            </p>
          </LegalSection>

          <LegalSection title="10. Data Security">
            <p>
              We aim to implement reasonable technical and organizational
              measures appropriate to the nature of the information and the
              risks involved. Depending on the systems used, safeguards may
              include access controls, authentication protections, secure
              connections, database permissions, monitoring and routine
              maintenance.
            </p>

            <p>
              Access to information should be limited to people and
              service providers who need it for legitimate operational,
              support, security or legal purposes, subject to appropriate
              safeguards.
            </p>

            <p>
              No website, database, transmission method or electronic
              storage system can be guaranteed to be completely secure.
              JMI therefore cannot promise absolute security or that
              unauthorized access, data loss, service interruption or
              other security incidents will never occur.
            </p>

            <p>
              Users should use strong, unique passwords where applicable,
              keep their credentials confidential and avoid accessing
              accounts through untrusted devices or networks.
            </p>

            <p>
              If a security incident affecting personal information occurs,
              JMI will assess and respond to it in accordance with
              applicable legal obligations.
            </p>
          </LegalSection>

          <LegalSection title="11. Data Retention and Deletion">
            <p>
              We retain information for no longer than reasonably necessary
              for the purpose for which it was collected, unless a longer
              retention period is required or permitted by applicable law.
            </p>

            <p>
              Retention periods may depend on the type of information,
              account status, security needs, legal obligations, dispute
              resolution requirements and legitimate operational purposes.
            </p>

            <p>
              When information is no longer required, we aim to delete it,
              anonymize it or otherwise dispose of it using appropriate
              measures, subject to technical limitations and applicable law.
            </p>

            <p>
              Some information may remain temporarily in backups, logs or
              records required for security, compliance or dispute
              resolution. Such retention does not necessarily mean that
              the information remains available for ordinary use.
            </p>
          </LegalSection>

          <LegalSection title="12. Your Privacy Rights and Choices">
            <p>
              Depending on your location and applicable law, you may have
              rights relating to personal information, including the right
              to request access to information, correction of inaccurate
              details, deletion, withdrawal of consent where processing
              relies on consent, or the submission of a grievance.
            </p>

            <p>
              These rights are subject to applicable legal conditions,
              exceptions, verification requirements and lawful retention
              obligations. Not every request can necessarily be fulfilled
              in every circumstance.
            </p>

            <p>
              You may contact JMI to make a privacy-related request. We
              may ask for reasonable information to verify your identity
              and understand the request before taking action.
            </p>

            <p>
              Where a request is made on behalf of another person, we may
              require evidence of lawful authority to act on that person's
              behalf.
            </p>

            <p>
              Nothing in this Policy is intended to remove or limit any
              mandatory right or remedy available to you under applicable
              law.
            </p>
          </LegalSection>

          <LegalSection title="13. International Data Processing">
            <p>
              Depending on the infrastructure and third-party providers
              used by JMI, information may be processed or stored in
              locations outside the country in which you reside.
            </p>

            <p>
              Where cross-border processing occurs, JMI will address
              applicable legal requirements and relevant safeguards as
              required by law.
            </p>

            <p>
              Privacy protections and legal procedures may differ between
              jurisdictions. This Policy does not remove any mandatory
              protections available under the laws that apply to you.
            </p>
          </LegalSection>

          <LegalSection title="14. Children's Privacy">
            <p>
              JMI is a general movie database and film-industry information
              platform and is not specifically directed toward children.
              We do not knowingly seek to collect personal information
              from children in violation of applicable law.
            </p>

            <p>
              Where parental consent or other safeguards are required by
              applicable law, those requirements must be followed before
              the relevant processing takes place.
            </p>

            <p>
              If you believe that a child has provided personal information
              to JMI in circumstances where it should not have been
              collected, please contact us so that we can review the
              matter and take appropriate action.
            </p>
          </LegalSection>

          <LegalSection title="15. External Websites and Third-Party Content">
            <p>
              JMI may contain links to external websites, ticket-booking
              services, social platforms, media sources and other
              third-party services.
            </p>

            <p>
              External websites operate independently of JMI and may have
              their own privacy policies, terms, cookies and data-handling
              practices. We do not control or guarantee their content,
              availability, security or privacy practices.
            </p>

            <p>
              Accessing an external website or providing information to a
              third party is your decision. You should review the relevant
              privacy policy and terms before submitting personal
              information to that service.
            </p>
          </LegalSection>

          <LegalSection title="16. Changes to This Privacy Policy">
            <p>
              JMI may revise this Privacy Policy from time to time to
              reflect changes in the website, features, data practices,
              service providers or applicable legal requirements.
            </p>

            <p>
              The updated version will be published on this page with a
              revised "Last updated" date. Where applicable law requires
              additional notice or consent for a material change, we will
              take the steps required by law.
            </p>

            <p>
              You are encouraged to review this page periodically. The
              version published on this page is intended to describe the
              applicable policy from its stated effective date, subject
              to mandatory legal requirements.
            </p>
          </LegalSection>

          <LegalSection title="17. Applicable Law and Legal Compliance">
            <p>
              JMI seeks to handle personal information in accordance with
              the privacy and data-protection requirements applicable to
              its operations and the relevant processing activities.
            </p>

            <p>
              These requirements may include applicable Indian data
              protection, information technology and consumer protection
              laws, together with other laws that apply depending on the
              circumstances.
            </p>

            <p>
              References to particular laws do not mean that every
              provision is applicable to every user or processing activity
              at all times. The applicable requirements depend on the law,
              its commencement and the circumstances concerned.
            </p>

            <p>
              Nothing in this Policy is intended to exclude any legal
              obligation that cannot lawfully be excluded or to waive
              any rights available to users under applicable law.
            </p>
          </LegalSection>

          <LegalSection title="18. Contact and Privacy Requests">
            <p>
              If you have questions, concerns, correction requests,
              deletion requests or other enquiries regarding this Privacy
              Policy or the handling of information by JMI, please contact
              us through the JMI contact page.
            </p>

            <p>
              Please describe your concern clearly and include the relevant
              page or account details needed to understand your request.
              Avoid including passwords or unnecessary sensitive
              information in your message.
            </p>

            <p>
              We may request additional information where reasonably
              necessary to verify a request, prevent unauthorized
              disclosure or comply with applicable law.
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