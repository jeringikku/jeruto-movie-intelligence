import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function AboutJmiPage() {
return (
<div className="min-h-screen bg-black text-white">
<PublicHeader />

  <main>
    {/* =====================================================
        HERO
    ===================================================== */}

    <section className="relative overflow-hidden border-b border-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-violet-500/[0.045] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
        <Link
          href="/"
          className="text-[9px] font-medium tracking-[0.18em] text-violet-500 transition hover:text-violet-400"
        >
          ← Back to JMI
        </Link>

        <div className="mt-7 max-w-3xl">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-pink-400">
            About JMI
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-yellow-400 sm:text-5xl">
            Jeruto Movie Intelligence
          </h1>

          <p className="mt-5 max-w-2xl text-[12px] leading-6 text-zinc-400 sm:text-sm sm:leading-7">
            More than a movie database. A growing vision to
            connect the information, business, people,
            audiences and experiences that make Indian cinema
            what it is.
          </p>

          <p className="mt-4 max-w-2xl text-[11px] leading-6 text-zinc-500 sm:text-xs sm:leading-6">
            Built to bring Indian cinema into one connected
            intelligence ecosystem, with a long-term ambition
            to combine structured data, advanced technology,
            immersive digital experiences and community.
          </p>
        </div>
      </div>
    </section>

    {/* =====================================================
        WHAT IS JMI
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionLabel>What is JMI?</SectionLabel>

        <div className="mt-4 max-w-3xl">
          <h2 className="text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
            Building a structured view of the wider Indian cinema.
          </h2>

          <p className="mt-4 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            Jeruto Movie Intelligence (JMI) is a movie database
            and cinema intelligence platform created to document,
            organize and analyse the many dimensions of Indian
            cinema.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            Indian cinema extends far beyond a single language
            or film industry. It includes Malayalam, Tamil,
            Telugu, Kannada, Hindi, Bengali, Marathi, Punjabi,
            Gujarati, Odia, Assamese and numerous other
            language-based industries, regional markets and
            creative communities.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            JMI's vision is to build a connected database that
            brings these diverse cinema ecosystems together
            while preserving the individual identities,
            characteristics and market dynamics of each industry.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            The platform is designed to connect movies, people,
            companies, languages, genres, theatrical releases,
            box-office performance, geographic markets and
            business information in a structured system that
            makes cinema easier to explore, compare and understand.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            Our ambition is to make JMI a useful destination
            for movie enthusiasts, researchers, trade followers,
            industry professionals and anyone interested in
            understanding Indian cinema more deeply.
          </p>
        </div>
      </div>
    </section>

    {/* =====================================================
        WHY JMI EXISTS
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionLabel>Why JMI Exists</SectionLabel>

        <h2 className="mt-4 text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
          A bigger industry deserves a more connected database.
        </h2>

        <p className="mt-3 max-w-3xl text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
          Cinema information is spread across languages,
          websites, markets, publications and reporting systems.
          JMI aims to bring these separate pieces together into
          a more structured and accessible view of the industry.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <PrincipleCard
            number="01"
            title="Information is fragmented"
            description="Movie details, historical records, industry news and trade figures are distributed across many sources and markets."
          />

          <PrincipleCard
            number="02"
            title="Indian cinema is diverse"
            description="Each film industry has its own languages, audiences, release patterns, business structures and theatrical markets."
          />

          <PrincipleCard
            number="03"
            title="Connected intelligence matters"
            description="JMI aims to connect these different layers so users can explore cinema through structured information and meaningful comparisons."
          />
        </div>
      </div>
    </section>

    {/* =====================================================
        WHAT JMI COVERS
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionLabel>What JMI Covers</SectionLabel>

        <h2 className="mt-3 text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
          Multiple layers. One intelligence ecosystem.
        </h2>

        <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <CoverageCard
            number="01"
            title="Movies"
            description="Structured movie information, release details, languages, genres and individual movie profiles."
            href="/preview/movies"
          />

          <CoverageCard
            number="02"
            title="Box Office"
            description="Indian and overseas collections, state, territory, city, language and theatrical market intelligence."
            href="/preview/movies"
          />

          <CoverageCard
            number="03"
            title="People"
            description="Connected profiles and role-based information about actors, directors, producers and other cinema professionals."
            href="/preview/people"
          />

          <CoverageCard
            number="04"
            title="Companies"
            description="Production houses, distributors and other businesses connected with the film industry."
            href="/preview/companies"
          />

          <CoverageCard
            number="05"
            title="Industries"
            description="Indian film industries, their movies, languages, markets and business performance."
            href="/preview/industries"
          />

          <CoverageCard
            number="06"
            title="Markets"
            description="Geographic and theatrical market intelligence across India and overseas territories."
            href="/preview/audience-behavior"
          />

          <CoverageCard
            number="07"
            title="Audience Behavior"
            description="Exploration of genre preferences, market trends and patterns in theatrical audience behaviour."
            href="/preview/audience-behavior"
          />

          <CoverageCard
            number="08"
            title="Historical Records"
            description="Landmark performances, historical milestones and records from across Indian cinema."
            href="/preview/movies#historical-records"
          />
        </div>
      </div>
    </section>

    {/* =====================================================
        OUR APPROACH
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionLabel>Our Approach</SectionLabel>

        <div className="mt-5 max-w-3xl">
          <h2 className="text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
            Structured data with transparency at the centre.
          </h2>

          <p className="mt-4 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            JMI is built around structured data collection,
            organization, research and analysis. The objective
            is to establish meaningful connections between
            movies, people, companies, industries and markets
            rather than treat every record as an isolated piece
            of information.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            We aim to make the information easier to discover,
            compare and interpret through organized records,
            market breakdowns, analytical tools and clear
            presentation.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            Where data is estimated, JMI aims to distinguish
            estimates from figures identified as official,
            actual, revised or projected within the relevant
            intelligence system.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            The platform will continue to evolve as its database,
            methodologies and technology develop. We recognize
            that reliable intelligence requires continuous
            review, refinement and responsible communication
            of limitations.
          </p>
        </div>
      </div>
    </section>

    {/* =====================================================
        BOX OFFICE TRANSPARENCY
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-green-400/20 bg-zinc-950">
          <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-56 w-56 rounded-full bg-green-500/[0.035] blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-green-400">
                JMI Data Transparency
              </p>
            </div>

            <h2 className="mt-4 text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
              Transparency over claims of absolute accuracy.
            </h2>

            <div className="mt-4 max-w-3xl space-y-3">
              <p className="text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                The box-office figures presented by Jeruto Movie
                Intelligence are trade figures. JMI does not claim
                that every figure represents the final original
                or official figure reported by producers,
                distributors, exhibitors or other rights-holders.
              </p>

              <p className="text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                Figures may be developed using online ticket-sales
                tracking, market observation, research and other
                available theatrical data.
              </p>

              <p className="text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
                Actual collections may differ because of reporting
                methods, data availability, timing, territory
                coverage and other factors.
              </p>

              <p className="text-[11px] font-medium leading-6 text-green-400 sm:text-xs sm:leading-6">
                JMI does not claim 100% accuracy over its
                box-office figures.
              </p>

              <p className="text-[11px] leading-6 text-zinc-500 sm:text-xs sm:leading-6">
                Our objective is to provide transparent, consistent
                and useful movie-trade intelligence without
                presenting estimates as absolute facts.
              </p>

              <p className="text-[11px] leading-6 text-zinc-500 sm:text-xs sm:leading-6">
                If you identify a credible discrepancy in our
                published information, we welcome supporting
                evidence and correction requests through our
                complaint and contact channels.
              </p>

              <div className="pt-2">
                <Link
                  href="/preview/have-any-complaint"
                  className="inline-flex items-center border border-green-400/20 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-green-400 transition hover:border-green-400/50 hover:text-white"
                >
                  Report a Discrepancy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* =====================================================
        JMI PRINCIPLES
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionLabel>JMI Principles</SectionLabel>

        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <PrincipleSmall
            title="Transparency"
            description="Communicate what our information and figures represent, including their limitations."
          />

          <PrincipleSmall
            title="Structure"
            description="Organize cinema information into connected and searchable data."
          />

          <PrincipleSmall
            title="Consistency"
            description="Develop defined approaches to organizing information across records and markets."
          />

          <PrincipleSmall
            title="Continuous Intelligence"
            description="Expand, review and improve the JMI knowledge base as information becomes available."
          />
        </div>
      </div>
    </section>

    {/* =====================================================
        TECHNOLOGY VISION
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionLabel>Beyond the Database</SectionLabel>

        <div className="mt-4 max-w-3xl">
          <h2 className="text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
            We imagine a more immersive way to experience cinema.
          </h2>

          <p className="mt-4 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            We believe a movie intelligence platform does not
            have to remain a collection of pages, tables and
            statistics. As technology advances, the way people
            discover, explore and experience digital platforms
            can evolve as well.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            JMI's long-term vision is to explore advanced web
            technologies, interactive 3D environments, animation,
            atmospheric effects and immersive visual experiences
            that give the platform a distinctive identity.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            Imagine exploring a cinema-themed digital environment
            with animated surroundings, realistic rain effects,
            atmospheric lighting, layered 3D visuals and
            interactive elements that respond to your experience.
            These are examples of the creative possibilities
            we hope to explore as the platform develops.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            Our aim is to combine the usefulness of a structured
            movie database with the creativity and excitement
            of a modern digital experience—while keeping the
            information itself accessible and easy to understand.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PrincipleCard
            number="01"
            title="Immersive Visual Worlds"
            description="Explore the potential of atmospheric environments, visual effects, interactive scenes and virtual-reality-inspired experiences."
          />

          <PrincipleCard
            number="02"
            title="3D & Animation"
            description="Use advanced animation and three-dimensional visual elements to create a distinctive digital identity for JMI."
          />

          <PrincipleCard
            number="03"
            title="Interactive Discovery"
            description="Explore new ways to navigate movie profiles, records, comparisons and cinema-related information."
          />

          <PrincipleCard
            number="04"
            title="Accessible Technology"
            description="Aim to deliver engaging experiences that work practically across supported devices and browsers."
          />
        </div>
      </div>
    </section>

    {/* =====================================================
        ENTERTAINMENT AND SOCIAL SPACE
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionLabel>A Digital Home for Cinema Lovers</SectionLabel>

        <div className="mt-4 max-w-3xl">
          <h2 className="text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
            Intelligence, entertainment and community.
          </h2>

          <p className="mt-4 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            Cinema is not only an industry to analyse. It is
            also a shared passion that connects people across
            languages, regions, generations and cultures.
            JMI's wider vision is to reflect both sides of
            cinema: the intelligence behind the business and
            the enthusiasm of the people who love movies.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            As the platform evolves, we aim to explore a
            cinema-focused Fun Zone with interactive entertainment,
            playful experiences and creative ways for users to
            engage with their favourite film industries.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            We also envision a Social Space: a place where movie
            enthusiasts can discover conversations, exchange
            perspectives, share their interest in cinema and
            connect with a wider community of film lovers.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            These experiences would complement JMI's database
            and analytical tools rather than replace them.
            Our goal is to create a platform where users can
            learn about cinema, explore its business, enjoy
            interactive experiences and participate in a
            community centred on movies.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-500 sm:text-xs sm:leading-6">
            The Fun Zone and Social Space described here form
            part of our broader vision. Their availability,
            design and features will depend on future development.
          </p>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <PrincipleCard
            number="01"
            title="Fun Zone"
            description="A potential entertainment layer for interactive, creative and cinema-themed experiences."
          />

          <PrincipleCard
            number="02"
            title="Social Space"
            description="A future community environment for discussions, discovery and shared enthusiasm for movies."
          />

          <PrincipleCard
            number="03"
            title="One Connected Experience"
            description="Bring movie information, analytics, entertainment and community together within a unified platform."
          />
        </div>
      </div>
    </section>

    {/* =====================================================
        LONG-TERM VISION
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionLabel>The JMI Vision</SectionLabel>

        <div className="mt-4 max-w-3xl">
          <h2 className="text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
            From a movie database to a wider cinema ecosystem.
          </h2>

          <p className="mt-4 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            Our long-term ambition is to develop JMI into a
            comprehensive digital destination for Indian cinema:
            a place where structured information, business
            intelligence, audience analytics, advanced technology,
            entertainment and community can work together.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            We envision deeper comparisons between movies,
            people, companies and industries; more connected
            historical records; richer market intelligence;
            and intelligent tools that help users explore
            complex information more naturally.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            Alongside these capabilities, we want to investigate
            immersive visual design, interactive 3D experiences,
            virtual-reality-inspired environments and community
            features that make JMI feel more like a living
            digital cinema destination.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            We want the platform to be useful to someone
            researching a film's box-office performance,
            informative to someone studying an industry,
            interesting to someone discovering cinema history
            and enjoyable to a fan who simply loves movies.
          </p>

          <p className="mt-3 text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-6">
            This is a long-term journey, not a claim that every
            planned capability is already available. We intend
            to develop JMI incrementally, prioritizing useful
            features, responsible data practices, accessibility
            and sustainable implementation.
          </p>
        </div>
      </div>
    </section>

    {/* =====================================================
        FOUNDER
    ===================================================== */}

    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionLabel>Founder</SectionLabel>

        <div className="mt-6 rounded-2xl border border-violet-400/20 bg-zinc-950 p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-black sm:h-28 sm:w-28">
              <img
                src="https://jeringeorgekutty.weebly.com/uploads/1/1/9/9/119991850/img-20250301-102847_orig.jpg"
                alt="Jerin Georgekutty"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                Founder &amp; CEO
              </p>

              <h2 className="mt-2 text-lg font-medium text-zinc-100 sm:text-xl">
                Jerin Georgekutty
              </h2>

              <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-yellow-500">
                Jeruto Group
              </p>

              <p className="mt-3 max-w-2xl text-[10px] leading-5 text-zinc-500 sm:text-[11px] sm:leading-6">
                JMI was created with the ambition of building
                a structured and transparent intelligence
                platform for Indian cinema. Its broader vision
                is to connect the information and business
                behind films with the technology and experiences
                that can bring cinema closer to its audiences.
              </p>

              <p className="mt-3 max-w-2xl text-[10px] leading-5 text-zinc-500 sm:text-[11px] sm:leading-6">
                The aim is to build progressively: starting with
                a useful, connected movie database and expanding
                toward a richer ecosystem for cinema intelligence,
                discovery, entertainment and community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* =====================================================
        CLOSING CTA
    ===================================================== */}

    <section>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-green-400">
            Explore JMI
          </p>

          <h2 className="mt-3 text-xl font-medium tracking-[-0.025em] text-zinc-100 sm:text-2xl">
            Discover Indian cinema. Explore what comes next.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[10px] leading-5 text-zinc-500 sm:text-[11px] sm:leading-6">
            Explore movies, people, companies, industries,
            markets and the intelligence connecting them.
            Join us as JMI continues to grow toward a wider
            digital destination for cinema.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/preview/movies"
              className="rounded-lg border border-violet-400/30 bg-violet-400/[0.06] px-4 py-2.5 text-[9px] font-medium text-violet-300 transition hover:border-violet-400/60 hover:bg-violet-400/[0.1]"
            >
              Explore Movies →
            </Link>

            <Link
              href="/preview/people"
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-[9px] font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
            >
              Explore People
            </Link>
          </div>
        </div>
      </div>
    </section>
  </main>

  {/* =====================================================
      FOOTER
  ===================================================== */}

  <footer className="border-t border-zinc-900">
    <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <p className="font-serif text-sm font-medium text-zinc-300">
            Jeruto{" "}
            <span className="text-yellow-400">
              Movie Intelligence
            </span>
          </p>

          <p className="mt-1 text-[9px] text-zinc-700">
            India's Next Generation Movie Intelligence Platform
          </p>
        </div>

        <p className="text-[9px] text-zinc-700">
          JMI · Building the future of movie intelligence
        </p>
      </div>
    </div>
  </footer>
</div>

);
}

/* ============================================================
SECTION LABEL
============================================================ */

function SectionLabel({
children,
}: {
children: React.ReactNode;
}) {
return (
<p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
{children}
</p>
);
}

/* ============================================================
PRINCIPLE CARD
============================================================ */

function PrincipleCard({
number,
title,
description,
}: {
number: string;
title: string;
description: string;
}) {
return (
<div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
<span className="text-[8px] font-medium tracking-[0.18em] text-violet-400">
{number}
</span>

  <h3 className="mt-3 text-[11px] font-medium text-zinc-200">
    {title}
  </h3>

  <p className="mt-1.5 text-[9px] leading-5 text-zinc-500">
    {description}
  </p>
</div>

);
}

/* ============================================================
COVERAGE CARD
============================================================ */

function CoverageCard({
number,
title,
description,
href,
}: {
number: string;
title: string;
description: string;
href: string;
}) {
return (
<Link
href={href}
className="group rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-violet-500/[0.025]"
>
<div className="flex items-center justify-between">
<span className="text-[8px] tracking-[0.18em] text-pink-400">
{number}
</span>

    <span className="text-[10px] text-zinc-700 transition group-hover:text-violet-400">
      →
    </span>
  </div>

  <h3 className="mt-4 text-[11px] font-medium text-zinc-200 transition group-hover:text-white">
    {title}
  </h3>

  <p className="mt-1.5 text-[9px] leading-5 text-zinc-500">
    {description}
  </p>
</Link>

);
}

/* ============================================================
SMALL PRINCIPLE
============================================================ */

function PrincipleSmall({
title,
description,
}: {
title: string;
description: string;
}) {
return (
<div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3.5">
<p className="text-[10px] font-medium text-zinc-200">
{title}
</p>

  <p className="mt-1 text-[8px] leading-4 text-zinc-600">
    {description}
  </p>
</div>

);
}