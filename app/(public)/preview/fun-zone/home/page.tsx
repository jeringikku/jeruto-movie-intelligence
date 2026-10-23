import Link from "next/link";
import PublicHeader from "../../../components/PublicHeader";
import FunZoneNewPageBanner from "./FunZoneNewPageBanner";
import FunZoneVeronica from "../../../components/FunZoneVeronica";
import FunZoneCarouselRide from "../../../components/FunZoneCarouselRide";
import AccuracyGame from "./AccuracyGame";
import FunZonePublicLeaderboard from "./FunZonePublicLeaderboard";
import FunZoneVintageTelevision from "./FunZoneVintageTelevision";

const games = [
  {
    number: "01",
    icon: "🎯",
    category: "BOX OFFICE CHALLENGE",
    title: "Daily Box Office Prediction",
    description:
      "Put your box-office instincts to the test. Predict participating movies' next-day collections and see how close your estimates come to JMI figures.",
    status: "AVAILABLE NOW",
    available: true,
    href: "/preview/fun-zone",
    accent: "from-amber-500/15 via-orange-900/10 to-transparent",
    symbol: "◎",
  },
  {
    number: "02",
    icon: "🎬",
    category: "INDIAN CINEMA",
    title: "Guess the Movie",
    description:
      "Can you identify a movie from a series of clues? Test your knowledge of Indian cinema, one reveal at a time.",
    status: "COMING SOON",
    available: false,
    accent: "from-violet-500/15 via-purple-900/10 to-transparent",
    symbol: "✦",
  },
  {
    number: "03",
    icon: "🧠",
    category: "CINEMA KNOWLEDGE",
    title: "Movie Trivia",
    description:
      "Challenge yourself with questions about actors, directors, iconic films, and the fascinating world of Indian cinema.",
    status: "COMING SOON",
    available: false,
    accent: "from-emerald-500/15 via-green-900/10 to-transparent",
    symbol: "✧",
  },
  {
    number: "04",
    icon: "🔤",
    category: "PUZZLE CORNER",
    title: "Movie Word Puzzle",
    description:
      "Solve movie-themed word games and uncover film titles using your memory, logic, and cinema knowledge.",
    status: "COMING SOON",
    available: false,
    accent: "from-sky-500/15 via-blue-900/10 to-transparent",
    symbol: "◇",
  },
  {
    number: "05",
    icon: "⭐",
    category: "QUICK CHALLENGE",
    title: "Cinema Quiz Arena",
    description:
      "Take on short, engaging quizzes about Indian movie industries, stars, genres, and memorable movie moments.",
    status: "COMING SOON",
    available: false,
    accent: "from-pink-500/15 via-rose-900/10 to-transparent",
    symbol: "✷",
  },
  {
    number: "06",
    icon: "🏆",
    category: "MORE ENTERTAINMENT",
    title: "More Games. More Fun.",
    description:
      "Our entertainment pavilion will continue to grow with new cinema-themed activities and challenges.",
    status: "IN DEVELOPMENT",
    available: false,
    accent: "from-yellow-500/15 via-amber-900/10 to-transparent",
    symbol: "✺",
  },
];

function WoodenDivider() {
  return (
    <div className="my-8 flex items-center gap-4" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/60 to-amber-500/20" />
      <span className="text-xs text-amber-500/80">✦</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-700/60 to-amber-500/20" />
    </div>
  );
}

function FestivalDecorations() {
  const lights = Array.from({ length: 32 }, (_, index) => index);

  return (
    <>
      <style>{`
        @keyframes jmi-festival-light {
          0%, 100% {
            opacity: 0.45;
            filter: brightness(0.8);
          }
          50% {
            opacity: 1;
            filter: brightness(1.5);
          }
        }

        .jmi-festival-bulb {
          animation: jmi-festival-light 1.4s ease-in-out infinite;
        }

        .jmi-festival-bulb:nth-child(3n + 1) {
          animation-delay: 0s;
        }

        .jmi-festival-bulb:nth-child(3n + 2) {
          animation-delay: 0.45s;
        }

        .jmi-festival-bulb:nth-child(3n) {
          animation-delay: 0.9s;
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-festival-bulb {
            animation: none;
            opacity: 0.9;
          }
        }
      `}</style>

      {/* Colourful paper bunting along the top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-8 items-start justify-center overflow-hidden sm:h-10"
      >
        <div className="absolute left-0 right-0 top-0 h-px bg-amber-200/50" />

        <div className="flex w-full max-w-4xl justify-around px-2 sm:px-8">
          {lights.slice(0, 17).map((light, index) => {
            const colours = [
              "#facc15",
              "#ec4899",
              "#38bdf8",
              "#fb923c",
              "#a78bfa",
              "#4ade80",
            ];

            return (
              <span
                key={light}
                className="relative block h-4 w-3 shrink-0 sm:h-5 sm:w-4"
                style={{
                  backgroundColor: colours[index % colours.length],
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  opacity: 0.9,
                  transform: `rotate(${index % 2 === 0 ? 3 : -3}deg)`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Tiny multicolour bulbs around the signboard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30"
      >
        {lights.map((light) => {
          const colours = [
            "#facc15",
            "#f472b6",
            "#38bdf8",
          ];

          const isTop = light < 12;
          const isRight = light >= 12 && light < 18;
          const isBottom = light >= 18 && light < 30;
          const isLeft = light >= 30;

          let position: React.CSSProperties = {};

          if (isTop) {
            position = {
              top: "5px",
              left: `${5 + (light / 11) * 90}%`,
            };
          } else if (isRight) {
            position = {
              right: "5px",
              top: `${15 + ((light - 12) / 5) * 70}%`,
            };
          } else if (isBottom) {
            position = {
              bottom: "5px",
              left: `${95 - ((light - 18) / 11) * 90}%`,
            };
          } else if (isLeft) {
            position = {
              left: "5px",
              top: `${85 - ((light - 30) / 1) * 70}%`,
            };
          }

          return (
            <span
              key={light}
              className="jmi-festival-bulb absolute block h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
              style={{
                ...position,
                backgroundColor: colours[light % colours.length],
                boxShadow: `0 0 5px ${colours[light % colours.length]}, 0 0 9px ${colours[light % colours.length]}55`,
              }}
            />
          );
        })}
      </div>
    </>
  );
}

export default function FunZoneHomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090705] text-zinc-100">
      <PublicHeader />

    

      {/* FESTIVAL ATMOSPHERE */}
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 50% 0%, rgba(143, 83, 27, 0.19), transparent 48%),
              radial-gradient(ellipse at 0% 35%, rgba(95, 47, 19, 0.13), transparent 35%),
              radial-gradient(ellipse at 100% 45%, rgba(100, 54, 20, 0.12), transparent 35%),
              repeating-linear-gradient(
                177deg,
                rgba(255, 214, 153, 0.018) 0px,
                rgba(255, 214, 153, 0.018) 1px,
                transparent 1px,
                transparent 7px
              )
            `,
          }}
        />

        <div className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
          {/* BREADCRUMB */}
          <div className="mb-6 flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-pink-400">
            <Link
              href="/"
              className="transition hover:text-amber-300"
            >
              JMI Home
            </Link>
            <span>/</span>
            <span className="text-amber-400/80">Fun Zone</span>
          </div>

             <FunZoneNewPageBanner />

          {/* MAIN FESTIVAL SIGNBOARD */}
          <section className="relative overflow-hidden rounded-2xl border border-amber-800/40 bg-[#160e08] shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
<FestivalDecorations />
{/* Wooden grain */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    3deg,
                    transparent 0px,
                    transparent 17px,
                    rgba(223, 163, 88, 0.035) 18px,
                    transparent 20px,
                    transparent 37px
                  ),
                  linear-gradient(115deg, rgba(114, 64, 29, 0.22), transparent 45%, rgba(0, 0, 0, 0.35))
                `,
              }}
            />

            {/* Warm lantern glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-amber-500/[0.12] blur-3xl"
            />

            <div className="relative p-5 sm:p-9 lg:p-12">
              {/* Signboard frame */}
              <div className="pointer-events-none absolute inset-2 rounded-xl border border-amber-700/15 sm:inset-3" />

              <div className="relative mx-auto max-w-3xl text-center">
                {/* Festival lights */}
                <div className="mb-6 flex items-center justify-center gap-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]" />
                  <span className="h-px w-10 bg-amber-700/70 sm:w-16" />
                  <span className="text-2xl text-amber-300 drop-shadow-[0_0_14px_rgba(245,158,11,0.35)]">
                    ✧
                  </span>
                  <span className="h-px w-10 bg-amber-700/70 sm:w-16" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]" />
                </div>

                <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-amber-400 sm:text-[10px]">
                  Welcome to the Entertainment Pavilion
                </p>

                <h1 className="mt-5 font-serif text-3xl font-bold tracking-wide text-[#f6dfb1] drop-shadow-[0_3px_12px_rgba(0,0,0,0.8)] sm:text-6xl lg:text-7xl">
                  JMI FUN ZONE
                </h1>

                <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent sm:w-36" />

                <p className="mt-5 font-serif text-lg italic text-amber-100/90 sm:text-2xl">
                  Your Movie Universe. Your Playground.
                </p>

                <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-zinc-400 sm:text-sm sm:leading-7">
                  Step into a world of movie challenges, cinema puzzles,
                  and entertainment inspired by Indian films. Explore
                  the games, challenge your knowledge, and enjoy the
                  JMI experience.
                </p>

                <a
                  href="#games"
                  className="mt-7 inline-flex items-center justify-center gap-3 rounded-lg border border-amber-400/50 bg-gradient-to-b from-amber-300 to-amber-500 px-6 py-3 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#211306] shadow-[0_4px_20px_rgba(217,119,6,0.14)] transition hover:brightness-110 sm:text-[10px]"
                >
                  Explore the Games
                  <span aria-hidden="true" className="text-sm">
                    ↓
                  </span>
                </a>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-amber-100/45">
                  <span>✦ Cinema</span>
                  <span>✦ Challenges</span>
                  <span>✦ Entertainment</span>
                </div>
              </div>
            </div>

            {/* Signboard bottom edge */}
            <div className="h-1 border-t border-amber-400/20 bg-gradient-to-r from-amber-950 via-amber-700/60 to-amber-950" />
          </section>

           {/* VINTAGE JMI NEWS TELEVISION */}
          <FunZoneVintageTelevision />

          <FunZoneVeronica />

          <FunZoneCarouselRide />

          <AccuracyGame />

          

          {/* GAME PAVILION HEADER */}
          <section id="games" className="scroll-mt-6 pt-12 sm:pt-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-amber-500">
                  Choose Your Adventure
                </p>

                <h2 className="mt-2 font-serif text-2xl font-bold text-[#f3e4c8] sm:text-3xl">
                  The Games Pavilion
                </h2>

                <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-500 sm:text-sm">
                  Every game brings a new way to celebrate your love
                  for cinema. Pick an activity and enter the action.
                </p>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-full border border-amber-800/40 bg-amber-950/20 px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="text-[8px] font-semibold uppercase tracking-[0.15em] text-amber-100/70">
                  1 Game Available
                </span>
              </div>
            </div>

            <WoodenDivider />

            {/* GAME CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {games.map((game) => (
                <article
                  key={game.number}
                  className={`group relative flex min-h-[285px] flex-col overflow-hidden rounded-xl border border-[#614324]/50 bg-[#100c08] transition duration-300 hover:-translate-y-1 hover:border-amber-600/60 hover:shadow-[0_14px_35px_rgba(0,0,0,0.35)] ${
                    game.available ? "ring-1 ring-amber-500/10" : ""
                  }`}
                >
                  {/* Wood texture */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                      backgroundImage: `
                        linear-gradient(180deg, rgba(105, 64, 29, 0.09), transparent 65%),
                        repeating-linear-gradient(
                          2deg,
                          transparent 0px,
                          transparent 25px,
                          rgba(202, 145, 79, 0.025) 26px,
                          transparent 28px
                        )
                      `,
                    }}
                  />

                  {/* Card highlight */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-br ${game.accent}`}
                  />

                  <div className="relative flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-700/30 bg-black/40 text-2xl shadow-inner">
                        {game.icon}
                      </div>

                      <span className="font-mono text-[9px] tracking-[0.2em] text-amber-700/80">
                        GAME {game.number}
                      </span>
                    </div>

                    <p className="mt-5 text-[8px] font-bold uppercase tracking-[0.2em] text-amber-500/90">
                      {game.category}
                    </p>

                    <h3 className="mt-2 font-serif text-xl font-semibold text-[#f0dfc2] transition group-hover:text-amber-300">
                      {game.title}
                    </h3>

                    <p className="mt-3 flex-1 text-[11px] leading-6 text-zinc-500 sm:text-xs">
                      {game.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-amber-900/30 pt-4">
                      <span
                        className={`inline-flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.12em] ${
                          game.available
                            ? "text-green-400"
                            : "text-zinc-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            game.available
                              ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]"
                              : "bg-zinc-600"
                          }`}
                        />
                        {game.status}
                      </span>

                      {game.available ? (
                        <Link
                          href="/preview/fun-zone"
                          className="inline-flex items-center gap-2 rounded-md border border-amber-500/50 bg-amber-400 px-3 py-2 text-[8px] font-extrabold uppercase tracking-[0.12em] text-black transition hover:bg-amber-300 sm:px-4"
                        >
                          Enter Game
                          <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <span className="inline-flex cursor-default items-center gap-2 rounded-md border border-zinc-800 bg-black/30 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
                          Coming Soon
                          <span aria-hidden="true">{game.symbol}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card bottom accent */}
                  <div
                    className={`h-px ${
                      game.available
                        ? "bg-gradient-to-r from-transparent via-amber-500/70 to-transparent"
                        : "bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent"
                    }`}
                  />
                </article>
              ))}
            </div>
          </section>

          <FunZonePublicLeaderboard />

          {/* MEMBER SIGN-IN INVITATION */}
          <section className="mt-12 overflow-hidden rounded-xl border border-violet-900/40 bg-gradient-to-br from-[#171021] via-[#100c13] to-[#0c0908] sm:mt-16">
            <div className="relative px-5 py-7 sm:px-8 sm:py-9">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-20 h-48 w-48 rounded-full bg-violet-500/[0.09] blur-3xl"
              />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-violet-400">
                    Your JMI Experience
                  </p>

                  <h2 className="mt-3 font-serif text-xl font-bold text-white sm:text-2xl">
                    Ready to Join the Fun?
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-zinc-400 sm:text-sm">
                    Sign in to JMI to participate in available member
                    activities. More cinema games are on their way.
                  </p>
                </div>

                <Link
                  href="/account/login"
                  className="inline-flex w-fit shrink-0 items-center justify-center gap-3 rounded-lg border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.15em] text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/20"
                >
                  Sign In to JMI
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </section>

          {/* ENTERTAINMENT NOTICE */}
          <section className="mt-8 rounded-lg border border-amber-900/30 bg-amber-950/[0.12] px-4 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <span className="text-lg" aria-hidden="true">
                🎬
              </span>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-400">
                  Entertainment Only
                </p>

                <p className="mt-2 text-[10px] leading-5 text-zinc-500 sm:text-xs sm:leading-6">
                  JMI Fun Zone is designed for entertainment and
                  cinema-related challenges. Activities must not involve
                  real-money betting or wagering. JMI Points are
                  platform points and do not represent money.
                  Participation and scoring depend on each game's
                  published rules.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-10 border-t border-amber-900/30 pt-6">
            <div className="flex flex-col gap-2 pb-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div>
                <p className="font-serif text-sm font-medium text-zinc-300">
                  Jeruto{" "}
                  <span className="text-amber-400">
                    Movie Intelligence
                  </span>
                </p>

                <p className="mt-1 text-[9px] text-zinc-600">
                  India's Next Generation Movie Intelligence Platform
                </p>
              </div>

              <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                JMI · Fun Zone
              </p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}