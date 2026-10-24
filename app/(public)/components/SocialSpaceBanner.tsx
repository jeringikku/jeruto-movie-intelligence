import Link from "next/link";

export default function SocialSpaceBanner() {
const reactions = [
{ emoji: "❤️", label: "Love", delay: "group-hover:-translate-y-1" },
{ emoji: "😂", label: "Funny", delay: "group-hover:translate-y-1" },
{ emoji: "🔥", label: "Trending", delay: "group-hover:-translate-y-1" },
{ emoji: "👏", label: "Applause", delay: "group-hover:translate-y-1" },
];

return (
<section className="border-b border-zinc-900">
<div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">
<Link
href="/preview/social-space"
aria-label="Explore JMI Social Space"
className="
group relative block overflow-hidden
rounded-2xl border border-amber-400/30
bg-[#08080b]
transition-all duration-500
hover:-translate-y-0.5
hover:border-amber-300/60
hover:shadow-[0_18px_60px_rgba(180,120,30,0.12)]
active:scale-[0.99]
focus:outline-none
focus:ring-1 focus:ring-amber-300/60
"
>
{/* BACKGROUND ATMOSPHERE */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#19110b] via-[#09090d] to-[#10091a]" />

        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-amber-400/[0.09] blur-3xl transition-all duration-700 group-hover:bg-amber-400/[0.16]" />

        <div className="absolute -bottom-28 left-[28%] h-64 w-64 rounded-full bg-violet-500/[0.09] blur-3xl" />

        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.45)_1px,transparent_0)] [background-size:18px_18px]" />

        {/* Conversation rings */}

        <div className="absolute -right-12 top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full border border-amber-300/[0.10] transition-transform duration-1000 group-hover:scale-110 sm:block" />

        <div className="absolute -right-2 top-1/2 hidden h-56 w-56 -translate-y-1/2 rounded-full border border-violet-300/[0.10] sm:block" />

        <div className="absolute right-8 top-1/2 hidden h-40 w-40 -translate-y-1/2 rounded-full border border-amber-300/[0.08] sm:block" />
      </div>

      {/* COMMUNITY STRIP */}

      <div className="relative flex h-6 items-center justify-between overflow-hidden border-b border-amber-400/15 bg-black/50 px-3 sm:px-4">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 14 }).map((_, index) => (
            <span
              key={index}
              className="h-2 w-2 shrink-0 rounded-full border border-amber-400/30 bg-amber-400/[0.06]"
            />
          ))}
        </div>

        <span className="bg-[#09090b] px-2 text-[7px] uppercase tracking-[0.2em] text-amber-300/70 sm:text-[8px]">
          JMI · Cinema Community
        </span>
      </div>

      {/* TOP ACCENT */}

      <div className="absolute left-0 top-6 z-10 h-px w-0 bg-gradient-to-r from-amber-400 via-yellow-200 to-transparent transition-all duration-700 group-hover:w-full" />

      {/* MAIN CONTENT */}

      <div className="relative flex flex-col gap-7 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-9">
        {/* LEFT: COMMUNITY MESSAGE */}

        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          {/* SOCIAL EMBLEM */}

          <div className="relative shrink-0 pt-1">
            <div className="absolute inset-0 scale-150 rounded-full bg-amber-400/[0.10] blur-xl transition-all duration-500 group-hover:bg-amber-400/[0.18]" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/35 bg-gradient-to-br from-[#352515] via-[#17110c] to-[#09090b] shadow-[0_0_25px_rgba(245,180,60,0.08)] transition-all duration-500 group-hover:border-amber-300/60 sm:h-16 sm:w-16">
              <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

              <div className="flex items-center -space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#21180e] bg-violet-400 text-sm shadow-lg sm:h-9 sm:w-9">
                  👤
                </div>

                <div className="z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#21180e] bg-amber-300 text-base shadow-lg sm:h-10 sm:w-10">
                  🎬
                </div>
              </div>
            </div>
          </div>

          {/* TEXT */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-amber-300 sm:text-[9px]">
                The JMI Community
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-0.5 text-[7px] font-medium uppercase tracking-[0.12em] text-emerald-300 sm:text-[8px]">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Everyone Belongs
              </span>
            </div>

            <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.04em] text-amber-300 transition-colors duration-300 group-hover:text-yellow-200 sm:text-3xl lg:text-4xl">
              JMI Social Space
            </h2>

            <p className="mt-2 text-[8px] uppercase tracking-[0.18em] text-amber-100/45 sm:text-[9px] sm:tracking-[0.22em]">
              Your cinema. Your voice. Your community.
            </p>

            <p className="mt-4 max-w-2xl text-xs leading-6 text-zinc-300 sm:text-sm sm:leading-7">
              You are not just a visitor at JMI — you are part of the
              family. Share movie reviews, start conversations, react to
              opinions, reply to fellow cinephiles, and connect with the
              people who love Indian cinema as much as you do.
            </p>

            {/* COMMUNITY FEATURES */}

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: "✍️", label: "Create Posts" },
                { icon: "⭐", label: "Movie Reviews" },
                { icon: "💬", label: "Join Discussions" },
                { icon: "❤️", label: "React & Reply" },
                { icon: "👥", label: "Find Members" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/15 bg-black/40 px-2.5 py-1.5 text-[9px] text-zinc-300 transition-all duration-300 group-hover:border-amber-400/30 group-hover:text-white sm:text-[10px]"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>

            {/* CTA */}

            <div className="mt-5">
              <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400/45 bg-gradient-to-r from-amber-400/[0.16] to-amber-400/[0.04] px-4 py-3 text-[10px] font-semibold tracking-wide text-amber-200 transition-all duration-300 group-hover:border-amber-300/70 group-hover:bg-amber-400/[0.15] sm:text-xs">
                Enter the JMI Family
                <span className="text-amber-300 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: SOCIAL ACTIVITY PREVIEW */}

        <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:w-[270px] lg:shrink-0">
          <div className="relative rounded-2xl border border-white/10 bg-black/45 p-4 shadow-2xl backdrop-blur-sm transition-all duration-500 group-hover:border-amber-400/25">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-sm">
                  🎬
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white">
                    JMI Community
                  </p>
                  <p className="mt-0.5 text-[8px] text-zinc-500">
                    Where cinema connects us
                  </p>
                </div>
              </div>

              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>

            {/* DEMO POST CARD */}

            <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-400/20 text-sm">
                  🎭
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-zinc-200">
                    A fellow cinephile
                  </p>
                  <p className="text-[8px] text-zinc-500">
                    Movie discussion
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[10px] leading-5 text-zinc-300">
                Every film leaves us with a story. What was the last movie
                that truly moved you?
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3">
                <div className="flex items-center gap-1.5 text-[10px] text-rose-300">
                  <span>❤️</span>
                  <span>💬</span>
                  <span>👏</span>
                  <span className="ml-1 text-[8px] text-zinc-500">
                    React · Reply
                  </span>
                </div>

                <span className="text-[8px] text-amber-300/80">
                  Your turn ↗️
                </span>
              </div>
            </div>

            {/* REACTION ROW */}

            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-500">
                Every voice matters
              </p>

              <div className="flex items-center -space-x-1">
                {reactions.map((reaction) => (
                  <span
                    key={reaction.label}
                    title={reaction.label}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border border-[#17120d] bg-zinc-900 text-sm transition-all duration-300 ${reaction.delay}`}
                  >
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Floating chat bubble */}

          <div className="absolute -right-1 -top-3 hidden rounded-xl border border-violet-300/20 bg-[#17111f] px-3 py-2 shadow-xl transition-transform duration-500 group-hover:-translate-y-1 sm:block">
            <p className="text-[9px] text-violet-200">
              💬 Let&apos;s talk cinema!
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM COMMUNITY STRIP */}

      <div className="relative flex h-6 items-center justify-between overflow-hidden border-t border-amber-400/15 bg-black/50 px-3 sm:px-4">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 14 }).map((_, index) => (
            <span
              key={index}
              className="h-2 w-2 shrink-0 rounded-full border border-amber-400/30 bg-amber-400/[0.06]"
            />
          ))}
        </div>

        <span className="bg-[#09090b] px-2 text-[7px] uppercase tracking-[0.2em] text-amber-300/60 sm:text-[8px]">
          Posts · Reviews · Reactions · Replies
        </span>
      </div>

      {/* BOTTOM ACCENT */}

      <div className="absolute bottom-6 left-5 h-px w-8 bg-amber-400/30 transition-all duration-500 group-hover:w-20 group-hover:bg-amber-300/60 sm:left-7 lg:left-9" />
    </Link>
  </div>
</section>

);
}