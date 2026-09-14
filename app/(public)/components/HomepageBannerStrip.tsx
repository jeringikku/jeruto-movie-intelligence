"use client";

import { useEffect, useRef } from "react";

type HomepageBanner = {
  id: number;
  poster_url: string;
  sort_order: number;
};

export default function HomepageBannerStrip({
  banners,
}: {
  banners: HomepageBanner[];
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  const container = scrollRef.current;

  if (!container || banners.length <= 1) {
    return;
  }

  let animationFrame: number;
  let lastTime = 0;

  const speed = 0.06;

  function animate(time: number) {
    if (!container) return;

    if (lastTime) {
      const delta = time - lastTime;

      if (
        !container.matches(":hover") &&
        document.visibilityState === "visible"
      ) {
        container.scrollLeft += delta * speed;

        const firstSetWidth =
          container.scrollWidth / 2;

        if (container.scrollLeft >= firstSetWidth) {
          container.scrollLeft -= firstSetWidth;
        }
      }
    }

    lastTime = time;
    animationFrame = requestAnimationFrame(animate);
  }

  animationFrame = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationFrame);
  };
}, [banners.length]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-6 sm:py-6 lg:px-8">

        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <div className="mb-3 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span className="h-px w-4 bg-yellow-400/60" />

            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-yellow-400/80 sm:text-[9px]">
              Now in JMI
            </p>

          </div>

          <p className="text-[9px] text-red-500">
            Latest updates
          </p>

        </div>


        {/* =====================================================
            SCROLLING BANNERS
        ===================================================== */}

        <div
          ref={scrollRef}
          className="
  flex
  gap-2.5
  overflow-x-auto
  pb-1
  [scrollbar-width:none]
  [-ms-overflow-style:none]
  [&::-webkit-scrollbar]:hidden
"
        >

          {[...banners, ...banners].map((banner, index) => (
            <div
              key={`${banner.id}-${index}`}
              className="
                relative
                w-[78vw]
                max-w-[430px]
                shrink-0
                overflow-hidden
                rounded-lg
                border
                border-zinc-800
                bg-zinc-950

                transition-all
                duration-300

                hover:border-violet-400/30
              "
            >

              <div className="aspect-[16/7] w-full">

                <img
                  src={banner.poster_url}
                  alt="JMI homepage banner"
                  className="
                    h-full
                    w-full
                    object-cover

                    transition-transform
                    duration-700

                    hover:scale-[1.015]
                  "
                  loading="lazy"
                />

              </div>

            </div>
          ))}

        </div>


        {/* =====================================================
            MOBILE SCROLL HINT
        ===================================================== */}

        {banners.length > 1 && (
          <p className="mt-2 text-center text-[8px] text-zinc-500 sm:hidden">
            Swipe to explore →
          </p>
        )}

      </div>
    </section>
  );
}