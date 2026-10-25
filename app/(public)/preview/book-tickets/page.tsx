"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import { supabase } from "@/lib/supabase";

type TicketBanner = {
  id: number;
  image_url: string;
  image_alt: string | null;
  display_order: number;
};

export default function BookTicketsPage() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ticketBanners, setTicketBanners] = useState<TicketBanner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Respect the visitor's reduced-motion preference.
  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => setReducedMotion(media.matches);

    updateMotion();
    media.addEventListener("change", updateMotion);

    return () => media.removeEventListener("change", updateMotion);
  }, []);

  // Load active posters from Supabase.
  useEffect(() => {
    let cancelled = false;

    async function loadTicketBanners() {
      const { data, error } = await supabase
        .from("jmi_ticket_booking_banners")
        .select("id, image_url, image_alt, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        console.error(
          "Unable to load ticket booking banners:",
          error
        );
        return;
      }

      if (!cancelled) {
        const validBanners = (data ?? []).filter(
          (banner) =>
            typeof banner.image_url === "string" &&
            banner.image_url.trim().length > 0
        );

        setTicketBanners(validBanners);
        setActiveBannerIndex(0);
      }
    }

    void loadTicketBanners();

    return () => {
      cancelled = true;
    };
  }, []);

  // Automatically rotate the posters every 4.5 seconds.
  useEffect(() => {
    if (reducedMotion || ticketBanners.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveBannerIndex(
        (index) => (index + 1) % ticketBanners.length
      );
    }, 4500);

    return () => window.clearInterval(timer);
  }, [ticketBanners.length, reducedMotion]);

  return (
    <main
      className={`jmi-ticket-page ${
        reducedMotion ? "jmi-reduced-motion" : ""
      }`}
    >
      <PublicHeader />

      <div className="ticket-page-inner">
        {/* WOODEN CINEMA TICKET COUNTER */}

        <section
          className="ticket-counter-section"
          aria-label="JMI wooden movie ticket booking counter"
        >
          {/* MAIN WOODEN NAMEBOARD */}

          <div className="counter-sign">
            <span
              className="sign-nail sign-nail-top-left"
              aria-hidden="true"
            />
            <span
              className="sign-nail sign-nail-top-right"
              aria-hidden="true"
            />
            <span
              className="sign-nail sign-nail-bottom-left"
              aria-hidden="true"
            />
            <span
              className="sign-nail sign-nail-bottom-right"
              aria-hidden="true"
            />

            <span className="sign-star">✦</span>

            <div>
              <p>JMI MOVIE</p>
              <h2>TICKET COUNTER</h2>
            </div>

            <span className="sign-star">✦</span>
          </div>

          {/* HOUSE-SHAPED WOODEN STRUCTURE */}

          <div className="wooden-counter">
            <div className="roof-lights" aria-hidden="true">
              {Array.from({ length: 11 }).map((_, index) => (
                <span
                  key={index}
                  className={`fair-light fair-light-${index % 5}`}
                />
              ))}
            </div>

            {/* ROOF */}

            <div className="counter-roof">
              <div className="roof-beam roof-beam-left" />
              <div className="roof-beam roof-beam-right" />

              <div className="roof-inner-beam roof-inner-left" />
              <div className="roof-inner-beam roof-inner-right" />

              <div className="roof-crossbar roof-crossbar-one" />
              <div className="roof-crossbar roof-crossbar-two" />

              <div className="roof-peak-plaque">
                <span>JMI</span>
              </div>
            </div>

            {/* COUNTER BODY */}

            <div className="counter-body">
              <div className="counter-pillar counter-pillar-left">
                <span className="wood-nail nail-top" />
                <span className="wood-nail nail-bottom" />
              </div>

              <div className="counter-pillar counter-pillar-right">
                <span className="wood-nail nail-top" />
                <span className="wood-nail nail-bottom" />
              </div>

              {/* TOP WOODEN BEAM */}

              <div className="counter-beam counter-beam-top">
                <span className="beam-label">
                  <span className="beam-label-light" />
                  BOX OFFICE
                  <span className="beam-label-light" />
                </span>
              </div>

              {/* TICKET WINDOW */}

              <div className="counter-window">
                <div className="window-backdrop">
                  <div className="window-wall">
                    <div className="wall-slat wall-slat-one" />
                    <div className="wall-slat wall-slat-two" />
                    <div className="wall-slat wall-slat-three" />
                  </div>

                  <div className="window-top-shadow" />

                  <div className="veronica-counter-stage">
                    {/* LED TV WITH LIVE MOVIE POSTERS */}

                    <div
                      className="ticket-poster-tv"
                      role="region"
                      aria-label="JMI movie poster display"
                    >
                      <div className="ticket-tv-frame">
                        <div className="ticket-tv-screen">
                          {ticketBanners.length > 0 ? (
                            ticketBanners.map((banner, index) => (
                              <div
                                key={banner.id}
                                className={`ticket-tv-slide ${
                                  index === activeBannerIndex
                                    ? "ticket-tv-slide-active"
                                    : ""
                                }`}
                                aria-hidden={
                                  index !== activeBannerIndex
                                }
                              >
                                <img
                                  src={banner.image_url}
                                  alt={
                                    banner.image_alt ||
                                    "Movie poster"
                                  }
                                  className="ticket-tv-poster"
                                  loading={
                                    index === 0 ? "eager" : "lazy"
                                  }
                                  draggable={false}
                                />
                              </div>
                            ))
                          ) : (
                            <div className="ticket-tv-standby">
                              <span className="ticket-tv-star">
                                ✦
                              </span>

                              <span className="ticket-tv-brand">
                                JMI MOVIE INTELLIGENCE
                              </span>

                              <strong>NOW SHOWING</strong>

                              <span className="ticket-tv-message">
                                YOUR NEXT CINEMA EXPERIENCE
                              </span>

                              <span className="ticket-tv-loading">
                                ✦ &nbsp; COMING SOON &nbsp; ✦
                              </span>
                            </div>
                          )}

                          <div className="ticket-tv-screen-glare" />
                        </div>
                      </div>

                      <div className="ticket-tv-bottom">
                        <span className="ticket-tv-power-light" />
                        <span>JMI CINEMA DISPLAY</span>
                      </div>

                      <div className="ticket-tv-wall-mount" />
                    </div>

                    {/* VERONICA THE TICKET CLERK */}

                    <div
                      className="ticket-veronica"
                      role="img"
                      aria-label="Veronica, the JMI ticket clerk, wearing a red box office cap and JMI uniform"
                    >
                      {/* CAP */}

                      <div className="clerk-cap">
                        <div className="cap-crown">
                          <span className="cap-jmi">J</span>
                        </div>

                        <div className="cap-brim" />
                      </div>

                      {/* BODY */}

                      <div className="clerk-tail" />
                      <div className="clerk-body" />
                      <div className="clerk-neck" />

                      {/* UNIFORM */}

                      <div className="clerk-uniform">
                        <div className="uniform-collar uniform-collar-left" />
                        <div className="uniform-collar uniform-collar-right" />

                        <div className="uniform-logo">
                          <span>JMI</span>
                          <span>BOX OFFICE</span>
                        </div>

                        <div className="uniform-pocket">
                          <span>🎟️</span>
                        </div>
                      </div>

                      {/* WINGS */}

                      <div className="clerk-wing clerk-wing-left" />
                      <div className="clerk-wing clerk-wing-right" />

                      {/* HEAD */}

                      <div className="clerk-head">
                        <div className="clerk-cheek clerk-cheek-left" />
                        <div className="clerk-cheek clerk-cheek-right" />

                        <div className="clerk-eye clerk-eye-left">
                          <span />
                        </div>

                        <div className="clerk-eye clerk-eye-right">
                          <span />
                        </div>

                        <div className="clerk-beak" />
                      </div>

                      {/* TICKET */}

                      <div className="clerk-ticket">
                        <span>JMI</span>
                        <span>ADMIT ONE</span>
                        <span>✦</span>
                      </div>

                      {/* LEGS */}

                      <div className="clerk-leg clerk-leg-left" />
                      <div className="clerk-leg clerk-leg-right" />

                      <div className="clerk-foot clerk-foot-left" />
                      <div className="clerk-foot clerk-foot-right" />

                      {/* SPARKLES */}

                      <span className="clerk-sparkle clerk-sparkle-one">
                        ✦
                      </span>

                      <span className="clerk-sparkle clerk-sparkle-two">
                        ✧
                      </span>
                    </div>

                    {/* WOODEN SERVICE DESK */}

                    <div className="counter-service-desk">
                      <div className="desk-top">
                        <span className="desk-service-label">
                          TICKETS · PLEASE!
                        </span>
                      </div>

                      <div className="desk-front">
                        <span className="desk-engraving">
                          JERUTO MOVIE INTELLIGENCE
                        </span>

                        <span className="desk-nail desk-nail-left" />
                        <span className="desk-nail desk-nail-right" />
                      </div>
                    </div>
                  </div>

                  {/* WALL SIGN */}

                  <div className="window-wall-sign">
                    <span>YOUR MOVIE.</span>
                    <strong>YOUR EXPERIENCE.</strong>
                  </div>
                </div>
              </div>

              {/* SIDE SUPPORTS */}

              <div className="counter-side-support counter-side-left" />
              <div className="counter-side-support counter-side-right" />

              {/* LOWER FRAME */}

              <div className="counter-beam counter-beam-bottom">
                <span className="bottom-beam-text">
                  ✦ &nbsp; YOUR CINEMA JOURNEY BEGINS HERE &nbsp; ✦
                </span>
              </div>

              {/* SIDE PLANKS */}

              <div className="side-plank side-plank-left" />
              <div className="side-plank side-plank-right" />

              {/* BASE */}

              <div className="counter-base">
                <span className="base-nail base-nail-left" />
                <span className="base-nail base-nail-right" />
              </div>
            </div>
          </div>

          {/* GROUND LIGHTS */}

          <div className="counter-ground-lights" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
        </section>

       
        {/* BOOKING CTA */}

        <section className="ticket-cta">
          <div className="cta-topline">
            <span />
            READY FOR YOUR NEXT SHOW?
            <span />
          </div>

          <div className="mb-5 mt-5 text-[15px] text-pink-400 font-semibold sm:text-[20px]">
            BOOK  REAL  MOVIE  TICKETS
            <br />
            <span>WITH JMI !</span>
          </div>

          <p>
            Choose your City, Select your Movie & your convenient Date, We will help you in getting Real Movie Tickets..
          </p>

          <button
  type="button"
  className="booking-button"
  onClick={() => {
    window.location.href = "/preview/book-tickets/booking-area";
  }}
>
  <span className="booking-button-icon">🎟️</span>
  <span>I WANT TO BOOK TICKETS</span>
  <span className="booking-button-arrow">→</span>
</button>

          <div className="booking-platforms">
            <span>BOOKMYSHOW</span>
            <span className="platform-separator">✦</span>
            <span>DISTRICT</span>
          </div>
        </section>

        {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="mb-4" />

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

      <style jsx>{`
        /* =========================================
           PAGE FOUNDATION
        ========================================= */

        .jmi-ticket-page {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              ellipse at 50% 23%,
              rgba(103, 53, 24, 0.2),
              transparent 42%
            ),
            radial-gradient(
              ellipse at 50% 70%,
              rgba(122, 55, 25, 0.1),
              transparent 45%
            ),
            linear-gradient(180deg, #100a07, #080605 72%);
          color: #f3e4ce;
        }

        .ticket-page-inner {
          position: relative;
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          padding: 34px 16px 28px;
        }

        /* =========================================
           COUNTER BRANDING
        ========================================= */

        .ticket-counter-section {
          position: relative;
          width: 100%;
          max-width: 690px;
          margin: 0 auto;
          padding: 0 0 22px;
          isolation: isolate;
        }

        .counter-sign {
          position: relative;
          display: flex;
          min-height: 66px;
          align-items: center;
          justify-content: center;
          gap: 15px;
          border: 2px solid #27160b;
          outline: 1px solid #8b5e39;
          outline-offset: -5px;
          background:
            repeating-linear-gradient(
              2deg,
              transparent 0 8px,
              rgba(207, 158, 106, 0.12) 9px,
              rgba(25, 14, 8, 0.2) 10px,
              transparent 12px 19px
            ),
            linear-gradient(110deg, #704a2d, #49301e, #28180f);
          box-shadow:
            inset 0 2px 0 rgba(255, 218, 170, 0.14),
            0 5px 10px rgba(0, 0, 0, 0.4);
        }

        .counter-sign p {
          color: #d2ac7d;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-align: center;
        }

        .counter-sign h2 {
          margin-top: 3px;
          color: #ffdfa9;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(16px, 4vw, 23px);
          font-weight: 900;
          letter-spacing: 0.06em;
          text-align: center;
          text-shadow: 0 2px 3px #180c05;
        }

        .sign-star {
          color: #f5c568;
          font-size: 14px;
          text-shadow: 0 0 9px rgba(245, 197, 104, 0.5);
        }

        .sign-nail {
          position: absolute;
          z-index: 2;
          width: 8px;
          height: 8px;
          border: 1px solid #d3b185;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 25%,
            #e3c49a,
            #79502e 55%,
            #241409
          );
          box-shadow:
            inset 0 1px 1px rgba(255, 235, 200, 0.5),
            0 1px 2px rgba(0, 0, 0, 0.6);
        }

        .sign-nail-top-left {
          top: 7px;
          left: 7px;
        }

        .sign-nail-top-right {
          top: 7px;
          right: 7px;
        }

        .sign-nail-bottom-left {
          bottom: 7px;
          left: 7px;
        }

        .sign-nail-bottom-right {
          right: 7px;
          bottom: 7px;
        }

        /* =========================================
           WOODEN COUNTER FRAME
        ========================================= */

        .wooden-counter {
          position: relative;
          margin-top: 15px;
          padding-top: 18px;
          filter: drop-shadow(0 15px 16px rgba(0, 0, 0, 0.5));
        }

        .counter-roof {
          position: relative;
          height: clamp(150px, 29vw, 230px);
          margin: 0 2px;
        }

        .roof-beam {
          position: absolute;
          top: 17%;
          width: 14%;
          height: 100%;
          border: 2px solid #382016;
          border-radius: 3px;
          background:
            repeating-linear-gradient(
              2deg,
              transparent 0 8px,
              rgba(207, 158, 106, 0.17) 9px,
              rgba(25, 14, 8, 0.23) 10px,
              transparent 12px 19px
            ),
            linear-gradient(
              90deg,
              #28170d,
              #765033 16%,
              #a7784e 39%,
              #6b442a 70%,
              #29170d
            );
          box-shadow:
            inset 0 2px 0 rgba(238, 189, 130, 0.45),
            inset 0 -4px 5px rgba(0, 0, 0, 0.45),
            0 3px 4px rgba(0, 0, 0, 0.6);
        }

        .roof-beam-left {
          left: 13%;
          transform: rotate(39deg);
          transform-origin: right center;
        }

        .roof-beam-right {
          right: 13%;
          transform: rotate(-39deg);
          transform-origin: left center;
        }

        .roof-inner-beam {
          position: absolute;
          top: 24%;
          width: 9%;
          height: 77%;
          border: 2px solid #321d11;
          background: linear-gradient(
            90deg,
            #3b2415,
            #8c5d38,
            #bc8b59,
            #5c3820,
            #26160d
          );
          box-shadow:
            inset 0 2px 0 rgba(255, 220, 170, 0.2),
            0 3px 5px rgba(0, 0, 0, 0.4);
        }

        .roof-inner-left {
          left: 23%;
          transform: rotate(39deg);
          transform-origin: right center;
        }

        .roof-inner-right {
          right: 23%;
          transform: rotate(-39deg);
          transform-origin: left center;
        }

        .roof-crossbar {
          position: absolute;
          z-index: 2;
          height: 15px;
          border: 2px solid #301b10;
          background: linear-gradient(
            180deg,
            #b78351,
            #765033 45%,
            #392317
          );
          box-shadow:
            inset 0 2px 0 rgba(255, 220, 170, 0.25),
            0 3px 5px rgba(0, 0, 0, 0.5);
        }

        .roof-crossbar-one {
          top: 38%;
          left: 9%;
          width: 82%;
          transform: rotate(-1deg);
        }

        .roof-crossbar-two {
          top: 61%;
          left: 3%;
          width: 94%;
        }

        .roof-peak-plaque {
          position: absolute;
          z-index: 4;
          top: -3px;
          left: 50%;
          display: flex;
          width: 49px;
          height: 43px;
          align-items: center;
          justify-content: center;
          border: 3px solid #422717;
          border-radius: 5px;
          background: linear-gradient(145deg, #a67549, #422919);
          color: #ffe1ad;
          font-family: Georgia, serif;
          font-size: 16px;
          font-weight: 900;
          box-shadow:
            inset 0 1px 0 rgba(255, 230, 190, 0.4),
            0 3px 7px rgba(0, 0, 0, 0.5);
          transform: translateX(-50%);
        }

        /* =========================================
           ROOF LIGHTS
        ========================================= */

        .roof-lights {
          position: absolute;
          z-index: 6;
          top: 0;
          left: 50%;
          display: flex;
          width: 82%;
          justify-content: space-around;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .fair-light {
          display: block;
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: theatre-light 1.8s ease-in-out infinite alternate;
        }

        .fair-light-0 {
          background: #f472b6;
          box-shadow: 0 0 9px #ec4899;
        }

        .fair-light-1 {
          background: #facc15;
          box-shadow: 0 0 9px #facc15;
          animation-delay: -0.4s;
        }

        .fair-light-2 {
          background: #60a5fa;
          box-shadow: 0 0 9px #3b82f6;
          animation-delay: -0.8s;
        }

        .fair-light-3 {
          background: #f87171;
          box-shadow: 0 0 9px #ef4444;
          animation-delay: -1.2s;
        }

        .fair-light-4 {
          background: #4ade80;
          box-shadow: 0 0 9px #22c55e;
          animation-delay: -1.6s;
        }

        /* =========================================
           MAIN COUNTER BODY
        ========================================= */

       .counter-body {
  position: relative;
  isolation: isolate;
  min-height: 530px;
  padding: 0 8%;
  border: 4px solid #2c190e;

  background:
    repeating-linear-gradient(
      2deg,
      transparent 0 8px,
      rgba(207, 158, 106, 0.13) 9px,
      rgba(25, 14, 8, 0.2) 10px,
      transparent 12px 19px
    ),
    linear-gradient(
      90deg,
      #392318,
      #6b452a 9%,
      #8e6240 20%,
      #654127 47%,
      #8a5c38 77%,
      #382116
    );

  box-shadow:
    inset 0 3px 0 rgba(235, 190, 140, 0.3),
    inset 0 -6px 10px rgba(0, 0, 0, 0.35),
    0 0 5px rgba(255, 190, 70, 0.35);
}

/* Multicolour LED strip around the four frame edges */
.counter-body::before {
  content: "";
  position: absolute;
  z-index: 10;
  inset: -4px;
  padding: 4px;
  border-radius: 2px;
  pointer-events: none;

  background: linear-gradient(
    90deg,
    #ff4545,
    #ffb52e,
    #fff36a,
    #39e879,
    #36d9ff,
    #8b65ff,
    #ff55d8,
    #ff4545
  );

  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;
  mask-composite: exclude;

  animation: counter-frame-lights 5s linear infinite;
}

/* Soft, premium cinema lighting */
.counter-body::after {
  content: "";
  position: absolute;
  z-index: 1;
  inset: 0;
  pointer-events: none;

  box-shadow:
    inset 4px 0 8px rgba(255, 65, 100, 0.12),
    inset -4px 0 8px rgba(55, 190, 255, 0.12),
    inset 0 4px 8px rgba(255, 220, 70, 0.12),
    inset 0 -4px 8px rgba(180, 75, 255, 0.12);
}

@keyframes counter-frame-lights {
  0% {
    filter: hue-rotate(0deg);
    opacity: 0.85;
  }

  50% {
    filter: hue-rotate(25deg);
    opacity: 1;
  }

  100% {
    filter: hue-rotate(0deg);
    opacity: 0.85;
  }
}

        .counter-pillar {
          position: absolute;
          z-index: 7;
          top: -5px;
          bottom: 5px;
          width: 8%;
          border: 2px solid #29170c;
          background:
            repeating-linear-gradient(
              2deg,
              transparent 0 8px,
              rgba(207, 158, 106, 0.15) 9px,
              rgba(25, 14, 8, 0.23) 10px,
              transparent 12px 19px
            ),
            linear-gradient(
              90deg,
              #29170c,
              #68442b 17%,
              #a3754b 43%,
              #785034 72%,
              #301b10
            );
          box-shadow:
            inset 0 2px 0 rgba(255, 225, 180, 0.25),
            inset 0 -5px 5px rgba(0, 0, 0, 0.3),
            2px 3px 5px rgba(0, 0, 0, 0.45);
        }

        .counter-pillar-left {
          left: 0;
        }

        .counter-pillar-right {
          right: 0;
        }

        .counter-beam {
          position: absolute;
          z-index: 8;
          right: -3px;
          left: -3px;
          border: 3px solid #2c190e;
          background:
            repeating-linear-gradient(
              2deg,
              transparent 0 8px,
              rgba(207, 158, 106, 0.16) 9px,
              rgba(25, 14, 8, 0.2) 10px,
              transparent 12px 19px
            ),
            linear-gradient(
              180deg,
              #a4774b,
              #815536 38%,
              #53351f 76%,
              #302014
            );
          box-shadow:
            inset 0 2px 0 rgba(255, 225, 180, 0.25),
            inset 0 -4px 5px rgba(0, 0, 0, 0.4),
            0 4px 8px rgba(0, 0, 0, 0.4);
        }

        .counter-beam-top {
          top: -2px;
          display: flex;
          min-height: 45px;
          align-items: center;
          justify-content: center;
        }

        .beam-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffe1ac;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.22em;
          text-shadow: 0 2px 3px rgba(0, 0, 0, 0.7);
        }

        .beam-label-light {
          width: 6px;
          height: 6px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 9px rgba(34, 197, 94, 0.8);
          animation: green-status 2s ease-in-out infinite;
        }

        /* =========================================
           COUNTER WINDOW
        ========================================= */

        .counter-window {
          position: relative;
          z-index: 3;
          margin: 43px 0 0;
          padding: 8px;
          border: 4px solid #2a180d;
          background:
            repeating-linear-gradient(
              2deg,
              transparent 0 8px,
              rgba(207, 158, 106, 0.1) 9px,
              rgba(25, 14, 8, 0.2) 10px,
              transparent 12px 19px
            ),
            linear-gradient(110deg, #573820, #8a5c38, #3c2517);
          box-shadow:
            inset 0 3px 0 rgba(255, 220, 170, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.4);
        }

        .window-backdrop {
          position: relative;
          height: 365px;
          overflow: hidden;
          border: 2px solid #24150c;
          background:
            radial-gradient(
              ellipse at 50% 35%,
              rgba(255, 200, 120, 0.1),
              transparent 65%
            ),
            linear-gradient(180deg, #20130d, #100a07 85%);
        }

        .window-wall {
          position: absolute;
          inset: 0;
          opacity: 0.6;
          background: repeating-linear-gradient(
            90deg,
            transparent 0 36px,
            rgba(165, 111, 68, 0.13) 37px,
            rgba(0, 0, 0, 0.3) 40px,
            transparent 43px 57px
          );
        }

        .wall-slat {
          position: absolute;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(180deg, #6b4428, #2b190f);
        }

        .wall-slat-one {
          top: 25%;
        }

        .wall-slat-two {
          top: 54%;
        }

        .wall-slat-three {
          top: 79%;
        }

        .window-top-shadow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 30px;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.6),
            transparent
          );
        }

        /* =========================================
           VERONICA'S STAGE
        ========================================= */

        .veronica-counter-stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-direction: column;
        }

        /* =========================================
           LED TV
        ========================================= */

       .ticket-poster-tv {
  position: absolute;
  z-index: 2;
  top: 12px;
  left: 50%;
  width: min(64%, 290px);
  transform: translateX(-50%);
  pointer-events: none;
}

        .ticket-tv-frame {
          position: relative;
          padding: 5px;
          border: 2px solid #82603b;
          border-radius: 7px;
          background: linear-gradient(
            145deg,
            #4a4035,
            #171411 35%,
            #30261d 70%,
            #0c0a08
          );
          box-shadow:
            0 0 0 1px #0a0705,
            0 0 0 3px rgba(183, 135, 75, 0.45),
            0 0 16px rgba(0, 0, 0, 0.85),
            0 0 22px rgba(219, 153, 67, 0.12);
        }

        .ticket-tv-screen {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 1px solid #080808;
          border-radius: 3px;
          background:
            radial-gradient(
              ellipse at center,
              rgba(74, 54, 31, 0.55),
              transparent 70%
            ),
            #080808;
          isolation: isolate;
        }

        .ticket-tv-slide {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0;
          transform: scale(1.025);
          transition:
            opacity 700ms ease,
            transform 1200ms ease;
        }

        .ticket-tv-slide-active {
          z-index: 1;
          opacity: 1;
          transform: scale(1);
        }

        .ticket-tv-poster {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          user-select: none;
        }

        .ticket-tv-screen-glare {
          position: absolute;
          z-index: 3;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.13),
            transparent 22%,
            transparent 72%,
            rgba(255, 255, 255, 0.035)
          );
        }

        .ticket-tv-bottom {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 15px;
          padding-top: 4px;
          color: #c1a47d;
          font-size: 5px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }

        .ticket-tv-power-light {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px rgba(74, 222, 128, 0.8);
        }

        .ticket-tv-wall-mount {
          position: absolute;
          z-index: -1;
          top: 100%;
          left: 50%;
          width: 35%;
          height: 7px;
          background: linear-gradient(180deg, #48311e, #21150d);
          transform: translateX(-50%);
        }

        .ticket-tv-standby {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          padding: 8px;
          background:
            radial-gradient(
              ellipse at center,
              rgba(163, 94, 36, 0.24),
              transparent 70%
            ),
            linear-gradient(135deg, #17100b, #080808);
          text-align: center;
        }

        .ticket-tv-star {
          color: #f1c578;
          font-size: 13px;
        }

        .ticket-tv-brand {
          color: #c49b66;
          font-size: clamp(5px, 1.1vw, 8px);
          font-weight: 800;
          letter-spacing: 0.13em;
        }

        .ticket-tv-standby strong {
          color: #ffdfaa;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(10px, 2.5vw, 17px);
          letter-spacing: 0.05em;
        }

        .ticket-tv-message {
          color: #b8a28a;
          font-size: clamp(5px, 1.1vw, 7px);
          letter-spacing: 0.08em;
        }

        .ticket-tv-loading {
          color: #d9aa65;
          font-size: clamp(5px, 1vw, 7px);
          letter-spacing: 0.07em;
        }

        /* =========================================
           VERONICA CHARACTER
        ========================================= */

       .ticket-veronica {
  position: relative;
  z-index: 5;
  width: 135px;
  height: 220px;
  flex-shrink: 0;
  transform-origin: center bottom;
  animation: veronica-bob 3s ease-in-out infinite;
}

        .clerk-tail {
          position: absolute;
          bottom: 61px;
          left: 24px;
          width: 25px;
          height: 19px;
          border-radius: 3px 90% 5px 90%;
          background: linear-gradient(135deg, #ffe995, #edbd43);
          transform: rotate(-25deg);
          animation: veronica-tail 1.7s ease-in-out infinite alternate;
        }

        .clerk-body {
          position: absolute;
          bottom: 25px;
          left: 36px;
          width: 94px;
          height: 94px;
          border: 2px solid #d6a62e;
          border-radius: 48% 48% 35% 35%;
          background: linear-gradient(
            145deg,
            #fff6c9,
            #ffe27b 55%,
            #eab83e
          );
          box-shadow: inset -5px -5px 0 rgba(160, 105, 20, 0.1);
        }

        .clerk-neck {
          position: absolute;
          z-index: 2;
          top: 74px;
          left: 67px;
          width: 31px;
          height: 28px;
          border-radius: 45%;
          background: linear-gradient(
            90deg,
            #e9c65d,
            #fff0a9,
            #e9c65d
          );
        }

        .clerk-uniform {
          position: absolute;
          z-index: 4;
          bottom: 43px;
          left: 40px;
          width: 90px;
          height: 80px;
          overflow: hidden;
          border: 2px solid #762323;
          border-radius: 35% 35% 25% 25%;
          background:
            repeating-linear-gradient(
              110deg,
              transparent 0 16px,
              rgba(255, 255, 255, 0.06) 17px 18px,
              transparent 19px 30px
            ),
            linear-gradient(
              110deg,
              #671d20,
              #c52f36 43%,
              #a51e29 70%,
              #59171a
            );
          box-shadow:
            inset 0 2px 0 rgba(255, 220, 170, 0.16),
            0 3px 5px rgba(0, 0, 0, 0.25);
        }

        .uniform-collar {
          position: absolute;
          top: -2px;
          width: 18px;
          height: 19px;
          border: 1px solid #f3d4ad;
          background: linear-gradient(145deg, #fff0d3, #d7b78d);
        }

        .uniform-collar-left {
          left: 29px;
          transform: rotate(22deg);
          clip-path: polygon(0 0, 100% 0, 75% 100%, 0 65%);
        }

        .uniform-collar-right {
          right: 29px;
          transform: rotate(-22deg);
          clip-path: polygon(0 0, 100% 0, 100% 65%, 25% 100%);
        }

        .uniform-logo {
          position: absolute;
          top: 25px;
          left: 11px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          color: #fff0cc;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .uniform-logo span:first-child {
          font-family: Georgia, serif;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .uniform-logo span:last-child {
          font-size: 5px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .uniform-pocket {
          position: absolute;
          top: 23px;
          right: 7px;
          display: flex;
          width: 20px;
          height: 23px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 226, 172, 0.65);
          border-radius: 2px 2px 5px 5px;
          background: rgba(40, 10, 10, 0.15);
          font-size: 11px;
        }

        .clerk-wing {
          position: absolute;
          z-index: 5;
          top: 105px;
          width: 23px;
          height: 44px;
          border: 2px solid #d6a62e;
          border-radius: 60% 40% 55% 45%;
          background: linear-gradient(145deg, #fff0a5, #efc64e);
          transform-origin: center top;
        }

        .clerk-wing-left {
          left: 25px;
          transform: rotate(26deg);
          animation: clerk-wave 1.3s ease-in-out infinite alternate;
        }

        .clerk-wing-right {
          right: 7px;
          transform: rotate(-19deg);
        }

        .clerk-head {
          position: absolute;
          z-index: 6;
          top: 39px;
          left: 47px;
          width: 75px;
          height: 62px;
          border: 2px solid #e5b942;
          border-radius: 50% 50% 46% 46%;
          background: linear-gradient(
            145deg,
            #fff8d4,
            #fff0ad 48%,
            #f5d365
          );
          animation: veronica-head 3.5s ease-in-out infinite;
        }

        .clerk-cheek {
          position: absolute;
          bottom: 8px;
          width: 13px;
          height: 7px;
          border-radius: 50%;
          background: rgba(244, 114, 182, 0.4);
        }

        .clerk-cheek-left {
          left: 3px;
        }

        .clerk-cheek-right {
          right: 3px;
        }

        .clerk-eye {
          position: absolute;
          top: 17px;
          width: 14px;
          height: 17px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 0 0.7px rgba(80, 55, 10, 0.35);
        }

        .clerk-eye-left {
          left: 13px;
        }

        .clerk-eye-right {
          right: 13px;
        }

        .clerk-eye span {
          position: absolute;
          top: 4px;
          left: 5px;
          width: 7px;
          height: 10px;
          border-radius: 50%;
          background: #272016;
        }

        .clerk-eye span::after {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #fff;
          content: "";
        }

        .clerk-beak {
          position: absolute;
          top: 39px;
          left: 50%;
          width: 28px;
          height: 16px;
          border: 1px solid #d97706;
          border-radius: 30% 30% 55% 55%;
          background: linear-gradient(180deg, #ffbd59, #f97316);
          clip-path: polygon(
            0 0,
            100% 0,
            88% 75%,
            50% 100%,
            12% 75%
          );
          transform: translateX(-50%);
        }

        /* CAP */

        .clerk-cap {
          position: absolute;
          z-index: 9;
          top: 17px;
          left: 41px;
          width: 83px;
          height: 35px;
          transform: rotate(-5deg);
          animation: cap-bob 3s ease-in-out infinite;
        }

        .cap-crown {
          position: absolute;
          top: 0;
          left: 16px;
          display: flex;
          width: 49px;
          height: 26px;
          align-items: center;
          justify-content: center;
          border: 2px solid #762323;
          border-radius: 25px 25px 5px 5px;
          background: linear-gradient(
            145deg,
            #f87171,
            #c62832 60%,
            #741a20
          );
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.2);
        }

        .cap-jmi {
          color: #ffe8b5;
          font-family: Georgia, serif;
          font-size: 15px;
          font-weight: 900;
          text-shadow: 0 2px 2px rgba(0, 0, 0, 0.4);
        }

        .cap-brim {
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 78px;
          height: 9px;
          border: 2px solid #762323;
          border-radius: 50%;
          background: linear-gradient(180deg, #ef4444, #991b1b);
          box-shadow: 0 2px 3px rgba(0, 0, 0, 0.25);
        }

        /* TICKET */

        .clerk-ticket {
          position: absolute;
          z-index: 7;
          top: 112px;
          right: -1px;
          display: flex;
          width: 39px;
          height: 51px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: 2px dashed #9d6b34;
          border-radius: 3px;
          background: linear-gradient(145deg, #fff1ce, #d9b77e);
          color: #613519;
          font-size: 6px;
          font-weight: 900;
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.25);
          transform: rotate(8deg);
          animation: ticket-wave 2s ease-in-out infinite;
        }

        .clerk-ticket span:first-child {
          font-family: Georgia, serif;
          font-size: 9px;
        }

        /* LEGS AND FEET */

        .clerk-leg {
          position: absolute;
          z-index: 2;
          bottom: 7px;
          width: 6px;
          height: 26px;
          border: 1px solid #d97706;
          border-radius: 4px;
          background: linear-gradient(
            90deg,
            #d97706,
            #fbbf24 45%,
            #f59e0b
          );
        }

        .clerk-leg-left {
          left: 66px;
        }

        .clerk-leg-right {
          left: 96px;
        }

        .clerk-foot {
          position: absolute;
          z-index: 3;
          bottom: 2px;
          width: 19px;
          height: 8px;
          border-radius: 80% 20% 30% 70%;
          background: #f59e0b;
        }

        .clerk-foot-left {
          left: 57px;
        }

        .clerk-foot-right {
          left: 90px;
        }

        .clerk-sparkle {
          position: absolute;
          z-index: 10;
          color: #facc15;
          font-size: 16px;
          animation: clerk-sparkle 2.2s ease-in-out infinite;
        }

        .clerk-sparkle-one {
          top: 75px;
          left: 18px;
        }

        .clerk-sparkle-two {
          top: 95px;
          right: -6px;
          color: #f472b6;
          animation-delay: -1s;
        }

        /* =========================================
           SERVICE DESK
        ========================================= */

        .counter-service-desk {
          position: relative;
          z-index: 8;
          width: 100%;
          margin-top: -36px;
        }

        .desk-top {
          position: relative;
          display: flex;
          height: 34px;
          align-items: center;
          justify-content: center;
          border: 3px solid #2b180d;
          background:
            repeating-linear-gradient(
              2deg,
              transparent 0 8px,
              rgba(207, 158, 106, 0.15) 9px,
              rgba(25, 14, 8, 0.2) 10px,
              transparent 12px 19px
            ),
            linear-gradient(180deg, #bd8c58, #805433 52%, #51331e);
          box-shadow:
            inset 0 2px 0 rgba(255, 226, 184, 0.4),
            0 5px 9px rgba(0, 0, 0, 0.5);
        }

        .desk-service-label {
          color: #ffe0aa;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-shadow: 0 2px 3px #241309;
        }

        .desk-front {
          position: relative;
          display: flex;
          min-height: 51px;
          align-items: center;
          justify-content: center;
          border: 3px solid #2c190e;
          border-top: 0;
          background:
            repeating-linear-gradient(
              2deg,
              transparent 0 8px,
              rgba(207, 158, 106, 0.13) 9px,
              rgba(25, 14, 8, 0.2) 10px,
              transparent 12px 19px
            ),
            linear-gradient(90deg, #52331e, #93623b, #57351f);
          box-shadow: inset 0 -4px 5px rgba(0, 0, 0, 0.35);
        }

        .desk-engraving {
          color: #e4bf8d;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-shadow: 0 2px 2px rgba(0, 0, 0, 0.8);
        }

        .desk-nail {
          position: absolute;
          top: 50%;
          width: 8px;
          height: 8px;
          border: 1px solid #c1a17a;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            #b58b5b,
            #28180d
          );
          transform: translateY(-50%);
        }

        .desk-nail-left {
          left: 10px;
        }

        .desk-nail-right {
          right: 10px;
        }

        /* WALL SIGN */

        .window-wall-sign {
          position: absolute;
          z-index: 1;
          right: 7px;
          bottom: 10px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 7px;
          border: 1px solid rgba(177, 126, 73, 0.4);
          background: rgba(22, 13, 8, 0.8);
          color: #d1a779;
          font-size: 6px;
          letter-spacing: 0.1em;
          text-align: center;
        }

        .window-wall-sign strong {
          color: #f5d5a5;
          font-size: 6px;
        }

        /* =========================================
           LOWER FRAME AND BASE
        ========================================= */

        .counter-beam-bottom {
          bottom: 0;
          display: flex;
          min-height: 34px;
          align-items: center;
          justify-content: center;
        }

        .bottom-beam-text {
          color: #f4d1a0;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.11em;
          text-align: center;
          text-shadow: 0 2px 3px #1d1008;
        }

        .counter-side-support {
          position: absolute;
          z-index: 5;
          top: 40px;
          bottom: 36px;
          width: 9px;
          background: linear-gradient(
            90deg,
            #28160c,
            #8d5e39,
            #b07e4e,
            #57361f,
            #28160c
          );
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
        }

        .counter-side-left {
          left: 8%;
        }

        .counter-side-right {
          right: 8%;
        }

        .side-plank {
          position: absolute;
          z-index: 4;
          top: 33%;
          width: 12px;
          height: 64px;
          border: 2px solid #2c190e;
          background: linear-gradient(
            90deg,
            #3b2415,
            #96663f,
            #6a4428,
            #2b190e
          );
          box-shadow: 2px 3px 5px rgba(0, 0, 0, 0.4);
        }

        .side-plank-left {
          left: -8px;
          transform: rotate(-4deg);
        }

        .side-plank-right {
          right: -8px;
          transform: rotate(4deg);
        }

        .counter-base {
          position: relative;
          z-index: 9;
          height: 20px;
          margin: 0 -12px;
          border: 3px solid #29170d;
          background:
            repeating-linear-gradient(
              2deg,
              transparent 0 8px,
              rgba(207, 158, 106, 0.16) 9px,
              rgba(25, 14, 8, 0.2) 10px,
              transparent 12px 19px
            ),
            linear-gradient(180deg, #ad7c4d, #68432a 65%, #332014);
          box-shadow:
            inset 0 2px 0 rgba(255, 220, 170, 0.35),
            0 6px 9px rgba(0, 0, 0, 0.5);
        }

        .wood-nail {
          position: absolute;
          left: 50%;
          width: 7px;
          height: 7px;
          border: 1px solid #c1a17a;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            #b58b5b,
            #28180d
          );
          transform: translateX(-50%);
        }

        .nail-top {
          top: 13px;
        }

        .nail-bottom {
          bottom: 13px;
        }

        .base-nail {
          position: absolute;
          top: 50%;
          width: 7px;
          height: 7px;
          border: 1px solid #c1a17a;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            #b58b5b,
            #28180d
          );
          transform: translateY(-50%);
        }

        .base-nail-left {
          left: 15px;
        }

        .base-nail-right {
          right: 15px;
        }

        .counter-ground-lights {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-top: 20px;
        }

        .counter-ground-lights span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f472b6;
          box-shadow: 0 0 9px currentColor;
          animation: theatre-light 1.7s ease-in-out infinite alternate;
        }

        .counter-ground-lights span:nth-child(2) {
          background: #facc15;
          animation-delay: -0.3s;
        }

        .counter-ground-lights span:nth-child(3) {
          background: #60a5fa;
          animation-delay: -0.6s;
        }

        .counter-ground-lights span:nth-child(4) {
          background: #f87171;
          animation-delay: -0.9s;
        }

        .counter-ground-lights span:nth-child(5) {
          background: #4ade80;
          animation-delay: -1.2s;
        }

        .counter-ground-lights span:nth-child(6) {
          background: #facc15;
          animation-delay: -1.5s;
        }

        .counter-ground-lights span:nth-child(7) {
          background: #f472b6;
          animation-delay: -1.8s;
        }

        /* =========================================
           VERONICA GREETING
        ========================================= */

        .veronica-greeting {
          position: relative;
          max-width: 570px;
          margin: 28px auto 0;
          padding: 23px 20px;
          border: 1px solid rgba(173, 117, 48, 0.3);
          border-radius: 14px;
          background:
            radial-gradient(
              ellipse at 50% 0,
              rgba(170, 102, 43, 0.1),
              transparent 70%
            ),
            linear-gradient(180deg, #1a100a, #100a07);
          text-align: center;
          box-shadow:
            inset 0 1px 0 rgba(255, 225, 180, 0.05),
            0 9px 24px rgba(0, 0, 0, 0.2);
        }

        .greeting-star {
          color: #facc15;
          font-size: 16px;
        }

        .greeting-eyebrow {
          margin-top: 7px;
          color: #d5a86b;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.19em;
        }

        .veronica-greeting h2 {
          margin-top: 11px;
          color: #ffe5bb;
          font-family: Georgia, serif;
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 700;
        }

        .greeting-wave {
          display: inline-block;
          transform-origin: 70% 70%;
          animation: greeting-wave 2.5s ease-in-out infinite;
        }

        .greeting-copy {
          max-width: 450px;
          margin: 10px auto 0;
          color: #b8a797;
          font-size: 11px;
          line-height: 1.9;
        }

        .greeting-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 17px;
          color: #c59a63;
          font-size: 12px;
        }

        .greeting-divider span:first-child,
        .greeting-divider span:last-child {
          width: 35px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #79532f
          );
        }

        .greeting-divider span:last-child {
          transform: rotate(180deg);
        }

        /* =========================================
           PREMIUM BOOKING CTA
        ========================================= */

        .ticket-cta {
          max-width: 570px;
          margin: 25px auto 0;
          text-align: center;
        }

        .cta-topline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          color: #b99b7a;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.17em;
        }

        .cta-topline span {
          width: 25px;
          height: 1px;
          background: #765337;
        }

        .ticket-cta h2 {
          margin-top: 16px;
          color: #fff0dc;
          font-family: Georgia, serif;
          font-size: clamp(25px, 5vw, 35px);
          font-weight: 700;
          line-height: 1.15;
        }

        .ticket-cta h2 span {
          color: #d9a36c;
          font-style: italic;
        }

        .ticket-cta > p {
          max-width: 420px;
          margin: 12px auto 0;
          color: #aa9989;
          font-size: 11px;
          line-height: 1.8;
        }

       .booking-button {
  position: relative;
  display: flex;
  min-height: 60px;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 25px auto 0;
  padding: 16px 22px;
  overflow: hidden;
  cursor: pointer;
font-family: inherit;
width: 75%;

  border: 1px solid #ffe5a6;
  border-radius: 12px;

  background:
    linear-gradient(
      115deg,
      rgba(255, 255, 255, 0.22),
      transparent 30%,
      rgba(255, 255, 255, 0.08) 65%,
      transparent
    ),
    linear-gradient(
      115deg,
      #704019 0%,
      #a96828 18%,
      #e5b45d 45%,
      #f8dfa0 52%,
      #c18a3e 76%,
      #704019 100%
    );

  color: #281506;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.12em;
  text-decoration: none;
  text-shadow: 0 1px 0 rgba(255, 239, 196, 0.35);

  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.65),
    inset 0 -3px 0 rgba(74, 37, 10, 0.28),
    0 0 0 3px rgba(219, 169, 91, 0.1),
    0 0 22px rgba(226, 174, 83, 0.16),
    0 9px 22px rgba(0, 0, 0, 0.42);

  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    filter 220ms ease;
}

/* Elegant moving gold highlight */
.booking-button::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -75%;
  width: 45%;

  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.62),
    transparent
  );

  content: "";
  transform: skewX(-22deg);
  animation: premium-button-shine 4s ease-in-out infinite;
  pointer-events: none;
}

/* Keep the button text and icons above the highlight */
.booking-button > span {
  position: relative;
  z-index: 1;
}

.booking-button:hover {
  filter: brightness(1.1);
  transform: translateY(-3px);

  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.75),
    inset 0 -3px 0 rgba(74, 37, 10, 0.28),
    0 0 0 4px rgba(219, 169, 91, 0.14),
    0 0 30px rgba(226, 174, 83, 0.28),
    0 13px 28px rgba(0, 0, 0, 0.48);
}

.booking-button:hover::before {
  animation: none;
  left: 140%;
  transition: left 650ms ease;
}

.booking-button:focus-visible {
  outline: 2px solid #ffe6ac;
  outline-offset: 5px;
}

.booking-button-icon {
  font-size: 23px;
}

.booking-button-arrow {
  font-size: 24px;
  transition: transform 220ms ease;
}

.booking-button:hover .booking-button-arrow {
  transform: translateX(5px);
}

@keyframes premium-button-shine {
  0%,
  55% {
    left: -75%;
  }

  85%,
  100% {
    left: 140%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .booking-button::before {
    animation: none;
  }
}

        .booking-button::before {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -80%;
          width: 45%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.32),
            transparent
          );
          content: "";
          transform: skewX(-22deg);
          transition: left 650ms ease;
        }

        .booking-button:hover {
          filter: brightness(1.12);
          box-shadow:
            inset 0 1px 0 rgba(255, 242, 211, 0.65),
            inset 0 -3px 0 rgba(63, 31, 14, 0.35),
            0 0 0 4px rgba(218, 168, 99, 0.13),
            0 12px 28px rgba(0, 0, 0, 0.5);
          transform: translateY(-3px);
        }

        .booking-button:hover::before {
          left: 140%;
        }

        .booking-button:focus-visible {
          outline: 2px solid #ffe3aa;
          outline-offset: 4px;
        }

        .booking-button-icon {
          font-size: 21px;
        }

        .booking-button-arrow {
          font-size: 22px;
          transition: transform 200ms ease;
        }

        .booking-button:hover .booking-button-arrow {
          transform: translateX(5px);
        }

        .booking-platforms {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 16px;
          color: #796957;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .platform-separator {
          color: #c49b66;
          font-size: 10px;
        }

        /* =========================================
           FOOTER
        ========================================= */

        .ticket-footer {
          margin-top: 37px;
          text-align: center;
        }

        .footer-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          margin-bottom: 13px;
        }

        .footer-divider span:first-child,
        .footer-divider span:last-child {
          width: 45px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #604329
          );
        }

        .footer-divider span:last-child {
          transform: rotate(180deg);
        }

        .footer-divider span:nth-child(2) {
          color: #c49b66;
          font-family: Georgia, serif;
          font-size: 16px;
          font-weight: 900;
        }

        .ticket-footer > p {
          color: #a68a6b;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.22em;
        }

        .footer-caption {
          display: block;
          margin-top: 5px;
          color: #655344;
          font-size: 7px;
          letter-spacing: 0.18em;
        }

        /* =========================================
           ANIMATIONS
        ========================================= */

        @keyframes theatre-light {
          0% {
            opacity: 0.48;
            filter: brightness(0.8);
          }

          100% {
            opacity: 1;
            filter: brightness(1.4);
          }
        }

        @keyframes green-status {
          0%,
          100% {
            opacity: 0.7;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes veronica-bob {
          0%,
          100% {
            transform: translateY(0) rotate(-0.5deg);
          }

          50% {
            transform: translateY(-4px) rotate(0.5deg);
          }
        }

        @keyframes veronica-head {
          0%,
          100% {
            transform: rotate(0);
          }

          35% {
            transform: rotate(-3deg);
          }

          65% {
            transform: rotate(2deg);
          }
        }

        @keyframes veronica-tail {
          from {
            transform: rotate(-25deg);
          }

          to {
            transform: rotate(-10deg);
          }
        }

        @keyframes clerk-wave {
          from {
            transform: rotate(26deg);
          }

          to {
            transform: rotate(43deg);
          }
        }

        @keyframes cap-bob {
          0%,
          100% {
            transform: rotate(-5deg) translateY(0);
          }

          50% {
            transform: rotate(-3deg) translateY(-2px);
          }
        }

        @keyframes ticket-wave {
          0%,
          100% {
            transform: rotate(8deg) translateY(0);
          }

          50% {
            transform: rotate(4deg) translateY(-2px);
          }
        }

        @keyframes clerk-sparkle {
          0%,
          100% {
            opacity: 0.4;
            transform: translateY(0) scale(0.85) rotate(0);
          }

          50% {
            opacity: 1;
            transform: translateY(-5px) scale(1.15) rotate(20deg);
          }
        }

        @keyframes greeting-wave {
          0%,
          70%,
          100% {
            transform: rotate(0);
          }

          78% {
            transform: rotate(20deg);
          }

          86% {
            transform: rotate(-10deg);
          }

          94% {
            transform: rotate(15deg);
          }
        }

        /* =========================================
           ACCESSIBILITY
        ========================================= */

        .jmi-reduced-motion *,
        .jmi-reduced-motion *::before,
        .jmi-reduced-motion *::after {
          animation: none !important;
          scroll-behavior: auto !important;
          transition-duration: 0.01ms !important;
        }

        /* =========================================
           MOBILE RESPONSIVENESS
        ========================================= */

        @media (max-width: 639px) {
          .ticket-page-inner {
            padding: 25px 13px 25px;
          }

          .counter-sign {
            min-height: 58px;
            gap: 9px;
          }

          .counter-sign h2 {
            font-size: clamp(14px, 4.2vw, 19px);
          }

          .wooden-counter {
            padding-top: 12px;
          }

          .counter-roof {
            height: clamp(130px, 36vw, 180px);
          }

          .roof-beam {
            width: 16%;
          }

          .roof-inner-beam {
            width: 9%;
          }

          .roof-peak-plaque {
            width: 39px;
            height: 35px;
            font-size: 13px;
          }

          .fair-light {
            width: 6px;
            height: 6px;
          }

          .counter-body {
            min-height: 465px;
            padding-right: 7%;
            padding-left: 7%;
            border-width: 3px;
          }

          .counter-beam-top {
            min-height: 38px;
          }

          .beam-label {
            gap: 7px;
            font-size: 8px;
            letter-spacing: 0.15em;
          }

          .counter-window {
            margin-top: 36px;
            padding: 5px;
            border-width: 3px;
          }

          .window-backdrop {
            height: 330px;
          }

          .ticket-poster-tv {
            top: 10px;
            width: min(67%, 245px);
          }

          .ticket-tv-frame {
            padding: 4px;
          }

          .ticket-tv-bottom {
            font-size: 4px;
          }

          .ticket-veronica {
            transform: scale(0.78);
            transform-origin: center bottom;
            margin-bottom: -4px;
          }

          .counter-service-desk {
            margin-top: -36px;
          }

          .desk-top {
            height: 29px;
          }

          .desk-service-label {
            font-size: 7px;
            letter-spacing: 0.12em;
          }

          .desk-front {
            min-height: 42px;
          }

          .desk-engraving {
            font-size: 6px;
            letter-spacing: 0.1em;
          }

          .counter-beam-bottom {
            min-height: 31px;
          }

          .bottom-beam-text {
            font-size: 6px;
            letter-spacing: 0.04em;
          }

          .counter-side-support {
            width: 7px;
          }

          .side-plank {
            width: 9px;
            height: 48px;
          }

          .counter-base {
            height: 17px;
            margin-right: -8px;
            margin-left: -8px;
          }

          .counter-ground-lights {
            gap: 12px;
          }

          .veronica-greeting {
            margin-top: 22px;
            padding: 20px 15px;
          }

          .greeting-copy {
            font-size: 10px;
          }

          .booking-button {
            min-height: 56px;
            gap: 8px;
            padding: 12px 10px;
            font-size: 10px;
            letter-spacing: 0.05em;
          }

          .booking-button-icon {
            font-size: 17px;
          }

          .booking-button-arrow {
            font-size: 19px;
          }

          .ticket-footer {
            margin-top: 30px;
          }
        }

        @media (max-width: 360px) {
          .ticket-page-inner {
            padding-right: 10px;
            padding-left: 10px;
          }

          .counter-sign h2 {
            font-size: 13px;
          }

          .counter-body {
            padding-right: 6%;
            padding-left: 6%;
          }

          .window-backdrop {
            height: 310px;
          }

          .ticket-poster-tv {
            top: 9px;
            width: 67%;
          }

          .ticket-veronica {
            transform: scale(0.72);
            transform-origin: center bottom;
          }

          .counter-service-desk {
            margin-top: -34px;
          }

          .booking-button {
            font-size: 9px;
          }
        }
      `}</style>
    </main>
  );
}