import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export const metadata = {
  title: "Founder & Team | Jeruto Movie Intelligence",
  description:
    "Meet the founder and team behind Jeruto Movie Intelligence, an Indian cinema intelligence platform.",
};

/* ============================================================
   FOUNDER DETAILS
============================================================ */

const founder = {
  name: "Jerin Georgekutty",
  designation: "Founder & CEO · Jeruto Group",
  qualifications: "BCOM | MA | MBA | PGDAS | PDDS",

  image:
    "https://jeringeorgekutty.weebly.com/uploads/1/1/9/9/119991850/img-20250301-102847_orig.jpg",

  website: "https://jeringeorgekutty.weebly.com",
  x: "https://x.com/jerinGeorgekut2",
  instagram:
    "https://www.instagram.com/jerin.georgekutty.5?dlrf=ZDhsdjg4dzl4cHFm",
  linkedin:
    "https://www.linkedin.com/in/jerin-georgekutty-b42787290?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  facebook: "https://www.facebook.com/share/1C51Ju6sE1/",
};


/* ============================================================
   JMI TEAM

   Add team members here when their details are available.

   Example:
   {
     name: "Team Member Name",
     designation: "Research Analyst",
     description: "Contributes to movie research and data analysis.",
     image: "/team/member-name.jpg",
   }

============================================================ */

/* ============================================================
   JMI TEAM MEMBERS
============================================================ */

const teamMembers: {
  name: string;
  designation: string;
  image: string;
}[] = [
  {
    name: "Jerin Georgekutty",
    designation:
      "Founder, Developer & Senior Box-Office Analyst",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaeNllwV3Pt0n5A-0jm4jN546jTdhg-wA9ASMl7T_nJQ&s", // Paste Jerin's profile picture URL here
  },
  {
    name: "Anandhu N Ajayan",
    designation: "Platform Coordinator & Manager",
    image: "https://avatars.githubusercontent.com/u/155710459?s=400&u=11239cad08e2885eea3b4251b7cca119d5b443ce&v=4", // Paste Anandhu's profile picture URL here
  },
  {
    name: "Akash Dominic Sebastian",
    designation: "Platform Overview & Finance",
    image: "https://scontent.ftrv8-1.fna.fbcdn.net/v/t39.30808-1/469412104_2884224358403694_1896873708153499594_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1080&ctp=s200x200&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=rirsWeZ0OLYQ7kNvwGSNGhb&_nc_oc=AdpZ4zMjJePCePDFSEYrsz94JpLv48jHfwGolGiVAZ7vE04I25ZxfU7z5XG9cX-dKDcEoR1w-qFJ8qSF37A05ENr&_nc_zt=24&_nc_ht=scontent.ftrv8-1.fna&_nc_gid=-At-A1PhtfRrXeDYib7UEA&_nc_ss=7b2a8&oh=00_AQR3DbYXaygNAQ8QXjwe6B7Mh5pMeIfpPmbOlk2wsT8BDg&oe=6AE9EB7C", // Paste Akash's profile picture URL here
  },
  {
    name: "Ashwin Sabu",
    designation: "Data Integeration & Research",
    image: "https://ashwinsabu007.weebly.com/uploads/1/3/4/8/134818222/picsart-09-28-07-02-08_orig.jpg", // Paste Akash's profile picture URL here
  },

  {
    name: "Tins Saiban",
    designation: "Data Management Assistance",
    image: "https://scontent.ftrv8-2.fna.fbcdn.net/v/t39.30808-1/716170201_2459088451180118_8371955300893870452_n.jpg?stp=dst-jpg_tt6&cstp=mx1440x1440&ctp=s200x200&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=kqN2YHr1zSoQ7kNvwFKCLn3&_nc_oc=AdoZfH1R7QQItdtWDcDiGZQa9hdyPNsqxwP1CxdDlRxirJsC0IIv_oLjHLJeLssx3-r7hiw0toDqBvH6KzEiZR57&_nc_zt=24&_nc_ht=scontent.ftrv8-2.fna&_nc_gid=IN9A6F8AabAtfskD52KfAw&_nc_ss=7b2a8&oh=00_AQRA1ektdUpZDYPCo1q1OtQw_jvOr601pM5pQpIDusnGjg&oe=6AE9E783", 
  },
  {
    name: "Sijin Saji",
    designation: "Data collection & processing",
    image: "", 
  },
];

/* ============================================================
   PAGE
============================================================ */

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PublicHeader />

      <main>

        {/* ====================================================
            PAGE HERO
        ==================================================== */}

        <section className="relative overflow-hidden border-b border-zinc-900">

          {/* Ambient lighting */}

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-180px] h-[360px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/[0.07] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-violet-400 sm:text-[10px]">
                The People Behind JMI
              </p>

              <h1 className="mt-4 font-serif text-3xl font-medium tracking-[-0.04em] text-white sm:text-5xl">
                Founder <span className="text-yellow-400">&</span> Team
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-zinc-400 sm:text-sm sm:leading-7">
                Get to know the people and vision behind Jeruto Movie
                Intelligence — a growing initiative dedicated to
                understanding Indian cinema through structured data
                and analytics.
              </p>

              <div className="mx-auto mt-6 h-px w-16 bg-violet-400/60" />

            </div>

          </div>

        </section>


        {/* ====================================================
            FOUNDER PROFILE
        ==================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="grid items-center gap-8 md:grid-cols-[280px_1fr] md:gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">

              {/* Founder photograph */}

              <div className="mx-auto w-full max-w-[260px] sm:max-w-[300px] md:max-w-none">

                <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-zinc-950 p-2">

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-yellow-400/[0.04]" />

                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-900">

                    <img
                      src={founder.image}
                      alt="Jerin Georgekutty, Founder of Jeruto Movie Intelligence"
                      className="h-full w-full object-cover object-center"
                    />

                  </div>

                  <div className="relative px-3 py-4 text-center">

                    <p className="text-sm font-semibold tracking-wide text-white">
                      {founder.name}
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-violet-400">
                      {founder.designation}
                    </p>

                  </div>

                </div>

              </div>


              {/* Founder introduction */}

              <div className="min-w-0">

                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-yellow-400 sm:text-[10px]">
                  Meet the Founder
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                  Jerin Georgekutty
                </h2>

                <p className="mt-2 text-[10px] leading-5 text-green-500 sm:text-xs">
                  {founder.qualifications}
                </p>

                <div className="mt-5 space-y-4 text-[10px] leading-6 text-zinc-400 sm:text-xs sm:leading-7">

                  <p>
                    I am Jerin Georgekutty, Founder and CEO of Jeruto
                    Group and the creator of Jeruto Movie Intelligence.
                    My interest in cinema extends beyond films themselves
                    to the numbers, market movements and business
                    decisions that shape the film industry.
                  </p>

                  <p>
                    My work in movie and box-office analysis has
                    strengthened my interest in understanding how films
                    perform across different Indian industries and
                    markets. I created JMI with the goal of bringing
                    movie information, box-office records, industry
                    professionals and business intelligence together
                    in one structured platform.
                  </p>

                  <p>
                    My vision is to develop JMI into a comprehensive
                    resource for Indian cinema — making structured
                    information and analytical insights more accessible
                    to everyone. At its core, the initiative is guided
                    by a simple principle: movie intelligence should be
                    transparent, unbiased and driven by data.
                  </p>

                  <p>
                    As JMI is primarily an information providing platform, I, the Founder of JMI myself openly admitting that we are also subject to make mistakes. The information provided by JMI may not be 100% accurate for all the time for all movies, especially in matter of Box-office numbers and Budget. Those are exclusive financial information available only to its creators. We are following our own methodology of online ticket sales tracking and trend estimation based on the available data. 
                    
                    </p>
                    
                   <p> So the real original figures can be different from our data because still many of the theaters in India are classified under B & C centers where online tracking is not possible. So we suggest the audiences to give more priority to original official numbers announced by its creators and use JMI numbers only as a reference which represents trade figures calculated by independent analysts.
                  </p>

                   <p className="text-yellow-400"> Even there is this much difficulties in finding the data, Me & our entire JMI Team is trying harder to find the maximum accurate figures which are closer to the original numbers.</p>

                </div>


                {/* ====================================================
    CONNECT WITH FOUNDER
==================================================== */}

<div className="mt-7 border-t border-zinc-800 pt-5">

  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-pink-500">
    Connect with the Founder 
  </p>

  <p className="mt-2 text-[10px] leading-5 text-zinc-400">
    Check out this links to directly connect with the founder - Jerin Georgekutty 
  </p>

  <div className="mt-4 flex flex-wrap gap-2">

    <SocialLink
      href={founder.website}
      label="Website"
      icon="website"
    />

    <SocialLink
      href={founder.x}
      label="X"
      icon="x"
    />

    <SocialLink
      href={founder.instagram}
      label="Instagram"
      icon="instagram"
    />

    <SocialLink
      href={founder.linkedin}
      label="LinkedIn"
      icon="linkedin"
    />

    <SocialLink
      href={founder.facebook}
      label="Facebook"
      icon="facebook"
    />

  </div>

</div>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            JMI TEAM
        ==================================================== */}

        <section className="border-b border-zinc-900">

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            {/* Section heading */}

            <div className="mb-8">

              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400 sm:text-[10px]">
                The People Behind the Platform
              </p>

              <h2 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                JMI <span className="text-yellow-400">Team</span>
              </h2>

              <p className="mt-3 max-w-xl text-[11px] leading-6 text-zinc-400 sm:text-xs sm:leading-7">
                Meet the Major people contributing to the development of
                Jeruto Movie Intelligence and its growing cinema
                intelligence ecosystem.
              </p>

            </div>


            {/* Team member cards */}

            {teamMembers.length > 0 ? (

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {teamMembers.map((member) => (

                  <article
                    key={member.name}
                    className="group flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-all duration-300 hover:border-violet-400/40 hover:bg-zinc-900/50 sm:p-5"
                  >

                    {/* Member photograph */}

                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-violet-400/20 bg-zinc-900 sm:h-[72px] sm:w-[72px]">

                      {member.image ? (

                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-violet-400">
                          {member.name.charAt(0).toUpperCase()}
                        </div>

                      )}

                    </div>


                    {/* Member details */}

                    <div className="min-w-0 flex-1">

                      <h3 className="text-xs font-semibold text-white transition-colors group-hover:text-violet-300 sm:text-sm">
                        {member.name}
                      </h3>

                      <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.12em] text-green-400 sm:text-[10px]">
                        {member.designation}
                      </p>

                     

                    </div>

                  </article>

                ))}

              </div>

            ) : (

              /* Initial team state */

              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 px-5 py-9 text-center sm:py-12">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/[0.05] text-lg text-violet-400">
                  ✦
                </div>

                <h3 className="mt-4 text-sm font-medium text-zinc-200">
                  The JMI Team
                </h3>

                <p className="mx-auto mt-2 max-w-md text-[10px] leading-5 text-zinc-500 sm:text-xs sm:leading-6">
                  This section will introduce the people contributing
                  to JMI, along with their roles and profiles.
                </p>

              </div>

            )}

          </div>

        </section>


        {/* ====================================================
            JMI PRINCIPLE
        ==================================================== */}

        <section>

          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

            <div className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-zinc-950 p-6 sm:p-8 lg:p-10">

              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/[0.06] blur-3xl" />

              <div className="relative">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
                  What Guides Us
                </p>

                <blockquote className="mt-4 max-w-xl font-serif text-lg leading-8 text-zinc-200 sm:text-2xl sm:leading-10">
                  "Our commitment is simple — to build a transparent,
                  unbiased and structured source of movie intelligence,
                  where every movie, every actor and every part of the
                  film business can be understood by everyone through data."
                </blockquote>

                <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.18em] text-yellow-400">
                  — Jerin Georgekutty · Founder, JMI
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-zinc-900">

        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div>

              <Link
                href="/preview"
                className="font-serif text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                Jeruto{" "}
                <span className="text-yellow-400">
                  Movie Intelligence
                </span>
              </Link>

              <p className="mt-1 text-[9px] text-zinc-500">
                India's Next Generation Movie Intelligence Platform
              </p>

            </div>

            <Link
              href="/preview"
              className="text-[9px] text-zinc-500 transition-colors hover:text-violet-400"
            >
              ← Back to Homepage
            </Link>

          </div>

        </div>

      </footer>

    </div>
  );
}


/* ============================================================
   SOCIAL LINK BUTTON
============================================================ */

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: "website" | "x" | "instagram" | "linkedin" | "facebook";
}) {
  const iconProps = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  function renderIcon() {
    switch (icon) {
      case "website":
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a15 15 0 0 1 0 18" />
            <path d="M12 3a15 15 0 0 0 0 18" />
          </svg>
        );

      case "x":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.42L5.56 22H2.44l7.25-8.28L1.8 2h6.41l4.43 6.76L18.9 2Zm-1.1 17.85h1.73L7.27 4.04H5.41L17.8 19.85Z" />
          </svg>
        );

      case "instagram":
        return (
          <svg {...iconProps}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
          </svg>
        );

      case "linkedin":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.2 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9h3.8v12H3.3V9Zm6.2 0h3.6v1.64h.05A3.95 3.95 0 0 1 16.7 8.7c3.9 0 4.6 2.56 4.6 5.89V21h-3.8v-5.68c0-1.36-.03-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3V21H9.5V9Z" />
          </svg>
        );

      case "facebook":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.5 21v-8.2h2.8l.42-3.2H13.5V7.56c0-.93.26-1.56 1.6-1.56h1.72V3.14A23 23 0 0 0 14.3 3c-2.5 0-4.2 1.53-4.2 4.35V9.6H7.3v3.2h2.8V21h3.4Z" />
          </svg>
        );
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${label} profile`}
      className="
        inline-flex
        min-h-10
        items-center
        justify-center
        gap-2
        rounded-lg
        border
        border-violet-400/30
        bg-violet-500/[0.05]
        px-3.5
        py-2
        text-[10px]
        font-medium
        text-violet-300
        transition-all
        duration-300
        hover:border-violet-400/70
        hover:bg-violet-500/[0.12]
        hover:text-white
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-violet-400/50
      "
    >
      {renderIcon()}

      <span>{label}</span>

      <span className="text-[9px] opacity-60" aria-hidden="true">
        ↗️
      </span>
    </a>
  );
}