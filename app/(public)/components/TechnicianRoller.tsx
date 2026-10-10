"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const roles = [
  {
    number: "01",
    title: "Directors",
    subtitle: "The vision behind every frame.",
    description:
      "Explore directors through worldwide box-office performance, theatrical successes and career success ratios.",
    href: "/preview/technicians/directors",
    symbol: "◈",
  },
  {
    number: "02",
    title: "Writers",
    subtitle: "The minds behind every story.",
    description:
      "Discover the writers shaping Indian cinema through their filmographies and commercial performance.",
    href: "/preview/technicians/writers",
    symbol: "✳️",
  },
  {
    number: "03",
    title: "Editors",
    subtitle: "The craft behind every cut.",
    description:
      "Explore the professionals who shape cinematic storytelling through editing.",
    href: "/preview/technicians/editors",
    symbol: "▤",
  },
  {
    number: "04",
    title: "Cinematographers",
    subtitle: "The eyes behind the camera.",
    description:
      "Discover the cinematographers responsible for the visual language of Indian films.",
    href: "/preview/technicians/cinematographers",
    symbol: "◎",
  },
  {
    number: "05",
    title: "Music Directors",
    subtitle: "The sound behind the cinema.",
    description:
      "Explore music directors and their contributions to Indian cinema.",
    href: "/preview/technicians/music-directors",
    symbol: "♫",
  },
];

const TOTAL_ROLES = roles.length;

export default function TechnicianRoller() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const router = useRouter();

  const captureTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const lensRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number | null>(null);
  const accumulatedAngleRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  const activeRole = roles[activeIndex];

  // CAMERA CAPTURE AND NAVIGATION
  function handleCapture() {
    if (isCapturing) return;

    // Remember the selected role before starting the flash.
    const destination = activeRole.href;

    setIsCapturing(true);

    captureTimerRef.current = setTimeout(() => {
      router.push(destination);
    }, 450);
  }

  // CLEAN UP THE TIMER IF THE COMPONENT UNMOUNTS.
  useEffect(() => {
    return () => {
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
      }
    };
  }, []);

  const rotate = useCallback((direction: number) => {
    setActiveIndex((current) => {
      return (current + direction + TOTAL_ROLES) % TOTAL_ROLES;
    });
  }, []);

  const selectRole = useCallback((index: number) => {
    setActiveIndex((index + TOTAL_ROLES) % TOTAL_ROLES);
  }, []);

  function getPointerAngle(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return (
      (Math.atan2(
        event.clientY - centerY,
        event.clientX - centerX,
      ) *
        180) /
      Math.PI
    );
  }

  function handleLensPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (isCapturing) return;

    event.preventDefault();

    pointerIdRef.current = event.pointerId;
    lastAngleRef.current = getPointerAngle(event);
    accumulatedAngleRef.current = 0;

    setIsDragging(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleLensPointerMove(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (
      isCapturing ||
      pointerIdRef.current !== event.pointerId ||
      lastAngleRef.current === null
    ) {
      return;
    }

    const currentAngle = getPointerAngle(event);

    let delta = currentAngle - lastAngleRef.current;

    // Handle crossing the -180° / +180° boundary.
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    accumulatedAngleRef.current += delta;
    lastAngleRef.current = currentAngle;

    // One role position for approximately 45° of rotation.
    const stepSize = 45;

    while (accumulatedAngleRef.current >= stepSize) {
      rotate(1);
      accumulatedAngleRef.current -= stepSize;
    }

    while (accumulatedAngleRef.current <= -stepSize) {
      rotate(-1);
      accumulatedAngleRef.current += stepSize;
    }
  }

  function handleLensPointerUp(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (pointerIdRef.current !== event.pointerId) return;

    pointerIdRef.current = null;
    lastAngleRef.current = null;
    accumulatedAngleRef.current = 0;

    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleLensPointerCancel() {
    pointerIdRef.current = null;
    lastAngleRef.current = null;
    accumulatedAngleRef.current = 0;

    setIsDragging(false);
  }

  function handleLensKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
  ) {
    if (isCapturing) return;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      rotate(1);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      rotate(-1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectRole(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      selectRole(TOTAL_ROLES - 1);
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#08090a]">
      {/* BACKGROUND ATMOSPHERE */}
      <div className="pointer-events-none absolute inset-0">
        <div className="jmi-camera-texture absolute inset-0 opacity-35" />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08090a]/40 to-[#08090a]" />

        <div className="absolute left-1/2 top-64 h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-400/[0.035] blur-[110px]" />

        <div className="absolute -left-24 top-1/2 h-64 w-64 rounded-full bg-violet-500/[0.035] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* SECTION HEADING */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 border border-white/[0.10] bg-[#101112]/80 px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-zinc-300">
              JMI Cinema Control
            </span>
          </div>

          <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
            Five disciplines. One cinematic world.
          </p>

          <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-zinc-100 sm:text-3xl">
            Choose Your <span className="text-yellow-400">Focus.</span>
          </h2>

          <p className="mx-auto mt-3 max-w-md text-[10px] leading-6 text-zinc-500 sm:text-[11px]">
            Operate the virtual lens to explore the creative professionals
            behind Indian cinema.
          </p>
        </div>

        {/* FILM CLAPBOARD DISPLAY */}
        <div className="relative mx-auto mt-9 max-w-lg">
          {/* BLURRED BACKGROUND CLAPBOARDS */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-4 mx-auto h-[240px] max-w-[290px] rotate-[-7deg] rounded-lg border border-white/[0.07] bg-[#111213]/70 opacity-25 blur-[3px] sm:h-[270px] sm:max-w-[370px]"
          >
            <div className="h-7 bg-[repeating-linear-gradient(135deg,#777_0px,#777_9px,#202020_9px,#202020_18px)] opacity-30" />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-2 mx-auto h-[240px] max-w-[290px] rotate-[5deg] rounded-lg border border-white/[0.08] bg-[#101112]/80 opacity-35 blur-[2px] sm:h-[270px] sm:max-w-[370px]"
          >
            <div className="h-7 bg-[repeating-linear-gradient(135deg,#777_0px,#777_9px,#202020_9px,#202020_18px)] opacity-30" />
          </div>

          {/* ACTIVE CLAPBOARD */}
          <div
            key={activeRole.number}
            className="jmi-clapboard-enter relative z-10 mx-auto max-w-[280px] sm:max-w-[350px]"
          >
            {/* CLAPPER HINGE */}
            <div className="relative overflow-hidden rounded-t-lg border border-[#55575a] bg-[#202123] p-1">
              <div className="flex h-8 overflow-hidden rounded-sm sm:h-10">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-full flex-1 ${
                      index % 2 === 0
                        ? "bg-[#b4b4b4]"
                        : "bg-[#191a1b]"
                    }`}
                    style={{
                      transform:
                        index % 2 === 0
                          ? "skewX(-25deg) scale(1.15)"
                          : "none",
                    }}
                  />
                ))}
              </div>

              <div className="absolute inset-x-0 bottom-0 h-px bg-yellow-400/30" />
            </div>

            {/* CLAPBOARD BODY */}
            <div className="relative overflow-hidden rounded-b-lg border-x border-b border-[#55575a] bg-[#111213] shadow-[0_20px_65px_rgba(0,0,0,0.55)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-yellow-400/[0.035] blur-[70px]" />

              <div className="relative p-4 sm:p-5">
                {/* TOP LABELS */}
                <div className="flex items-start justify-between gap-3 border-b border-white/[0.09] pb-4">
                  <div>
                    <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-pink-500 sm:text-[8px]">
                      Jeruto Movie Intelligence
                    </p>

                    <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.18em] text-yellow-400 sm:text-[9px]">
                      Behind The Screen
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[7px] uppercase tracking-[0.18em] text-zinc-400">
                      Role Name
                    </p>

                    <p className="mt-1 font-mono text-sm tracking-[0.12em] text-yellow-400 sm:text-base">
                      {activeRole.number}
                    </p>
                  </div>
                </div>

                {/* ROLE SYMBOL AND TITLE */}
                <div className="py-5 sm:py-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-yellow-400/25 bg-yellow-400/[0.045] sm:h-14 sm:w-14">
                      <span className="text-2xl text-yellow-400 sm:text-3xl">
                        {activeRole.symbol}
                      </span>
                    </div>

                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-[0.16em] text-violet-400 sm:text-[9px]">
                        {activeRole.subtitle}
                      </p>

                      <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.045em] text-zinc-100 sm:text-3xl">
                        {activeRole.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-5 max-w-sm text-[10px] leading-6 text-zinc-400 sm:text-[11px]">
                    {activeRole.description}
                  </p>
                </div>

                {/* EXISTING CLAPBOARD EXPLORE BUTTON */}
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="mt-5 flex min-h-11 w-full items-center justify-between gap-3 border border-yellow-400/30 bg-yellow-400/[0.055] px-4 py-3 transition hover:border-yellow-400/60 hover:bg-yellow-400/[0.10] disabled:cursor-wait focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400"
                >
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-yellow-300">
                    Explore {activeRole.title}
                  </span>

                  <span className="text-sm text-yellow-400">↗️</span>
                </button>
              </div>

              {/* CLAPBOARD LOWER EDGE */}
              <div className="h-1 bg-gradient-to-r from-zinc-700 via-yellow-400/40 to-zinc-800" />
            </div>
          </div>
        </div>

        {/* CAMERA LENS CONTROLLER */}
        <div className="mx-auto mt-10 max-w-sm sm:mt-12">
          <div className="text-center">
            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-pink-400">
              Optical Focus System
            </p>

            <p className="mt-1 text-[8px] tracking-[0.12em] text-green-500">
              ROTATE THIS LENS TO CHOOSE THE ROLE
            </p>
          </div>

          {/* INTERACTIVE LENS */}
          <div className="relative mx-auto mt-5 flex h-[220px] w-[220px] items-center justify-center sm:h-[250px] sm:w-[250px]">
            {/* OUTER HALO */}
            <div className="pointer-events-none absolute inset-0 rounded-full border border-white/[0.07] shadow-[0_0_40px_rgba(0,0,0,0.35)]" />

            {/* STATIC TICK MARKS */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 rounded-full"
            >
              {Array.from({ length: 60 }).map((_, index) => (
                <span
                  key={index}
                  className={`absolute left-1/2 top-0 w-px -translate-x-1/2 ${
                    index % 5 === 0
                      ? "h-3 bg-yellow-400/60"
                      : "h-1.5 bg-zinc-600/70"
                  }`}
                  style={{
                    transform: `translateX(-50%) rotate(${index * 6}deg)`,
                    transformOrigin: "50% 103px",
                  }}
                />
              ))}
            </div>

            {/* DRAGGABLE LENS RING */}
            <div
              ref={lensRef}
              role="slider"
              aria-label="Camera lens role selector"
              aria-valuemin={0}
              aria-valuemax={TOTAL_ROLES - 1}
              aria-valuenow={activeIndex}
              aria-valuetext={activeRole.title}
              tabIndex={0}
              onKeyDown={handleLensKeyDown}
              onPointerDown={handleLensPointerDown}
              onPointerMove={handleLensPointerMove}
              onPointerUp={handleLensPointerUp}
              onPointerCancel={handleLensPointerCancel}
              className={`absolute inset-[17px] cursor-grab rounded-full border border-[#686868]/70 bg-[radial-gradient(circle_at_30%25%,#444648_0%,#242526_28%,#111213_65%,#08090a_100%)] shadow-[inset_0_2px_5px_rgba(255,255,255,0.08),inset_0-8px_16px_rgba(0,0,0,0.7),0_8px_24px_rgba(0,0,0,0.5)] outline-none transition-[border-color,box-shadow] focus-visible:border-yellow-400/70 focus-visible:ring-2 focus-visible:ring-yellow-400/20 ${
                isDragging
                  ? "cursor-grabbing border-yellow-400/70 shadow-[0_0_24px_rgba(250,204,21,0.12)]"
                  : "hover:border-yellow-400/40"
              }`}
              style={{ touchAction: "none" }}
            >
              {/* ROTATING OUTER RIDGES */}
              <div
                className="pointer-events-none absolute inset-1 rounded-full border border-white/[0.06]"
                style={{
                  background:
                    "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.10) 0deg 1deg, transparent 1deg 7.2deg)",
                  WebkitMaskImage:
                    "radial-gradient(circle, transparent 0 72%, black 73% 100%)",
                  maskImage:
                    "radial-gradient(circle, transparent 0 72%, black 73% 100%)",
                }}
              />

              {/* INNER METALLIC RING */}
              <div className="pointer-events-none absolute inset-[17px] rounded-full border border-zinc-400/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.06)]" />

              {/* ROTATING FOCUS MARKER */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full transition-transform duration-300"
                style={{
                  transform: `rotate(${activeIndex * (360 / TOTAL_ROLES)}deg)`,
                }}
              >
                <div className="absolute left-1/2 top-2 h-4 w-1 -translate-x-1/2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
              </div>

              {/* CENTRAL OPTICAL DISPLAY */}
              <div className="pointer-events-none absolute inset-[31px] flex flex-col items-center justify-center rounded-full border border-white/[0.08] bg-[radial-gradient(circle_at_35%_30%,#292a2c_0%,#151617_55%,#08090a_100%)] shadow-[inset_0_0_20px_rgba(0,0,0,0.9),0_0_18px_rgba(0,0,0,0.35)]">
                <span className="text-[7px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  JMI Lens
                </span>

                <span className="mt-1 font-mono text-3xl font-medium tracking-[-0.06em] text-yellow-400">
                  {activeRole.number}
                </span>

                <span className="mt-1 max-w-[95px] text-center text-[7px] font-medium uppercase tracking-[0.12em] text-zinc-300">
                  {activeRole.title}
                </span>

                <span className="mt-3 h-px w-8 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
              </div>
            </div>

            {/* SIDE CONTROL MARKINGS */}
            <div className="pointer-events-none absolute -left-1 top-1/2 -translate-y-1/2 text-[7px] font-mono tracking-widest text-zinc-600">
              ◂
            </div>

            <div className="pointer-events-none absolute -right-1 top-1/2 -translate-y-1/2 text-[7px] font-mono tracking-widest text-yellow-400">
              ▸
            </div>
          </div>

          {/* DIRECT ROLE SELECTORS */}
          <div className="mt-5 flex items-center justify-center gap-3">
            {roles.map((role, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={role.number}
                  type="button"
                  onClick={() => selectRole(index)}
                  disabled={isCapturing}
                  aria-label={`Select ${role.title}`}
                  aria-pressed={isActive}
                  className={`group flex flex-col items-center gap-2 outline-none focus-visible:ring-1 focus-visible:ring-yellow-400 ${
                    isActive ? "text-yellow-400" : "text-zinc-600"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[9px] transition-all duration-300 ${
                      isActive
                        ? "border-yellow-400/60 bg-yellow-400/[0.10] text-yellow-300 shadow-[0_0_14px_rgba(250,204,21,0.08)]"
                        : "border-white/[0.10] bg-[#101112] group-hover:border-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {role.number}
                  </span>

                  <span className="hidden text-[7px] uppercase tracking-[0.12em] sm:block">
                    {role.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SECONDARY CONTROLS */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => rotate(-1)}
              disabled={isCapturing}
              aria-label="Previous discipline"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-[#101112] text-sm text-zinc-300 transition hover:border-yellow-400/40 hover:text-yellow-400 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400"
            >
              ←
            </button>

            <span className="min-w-[125px] text-center text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              {String(activeIndex + 1).padStart(2, "0")} / 05 ·{" "}
              {activeRole.title}
            </span>

            <button
              type="button"
              onClick={() => rotate(1)}
              disabled={isCapturing}
              aria-label="Next discipline"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-[#101112] text-sm text-zinc-300 transition hover:border-yellow-400/40 hover:text-yellow-400 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400"
            >
              →
            </button>
          </div>

          <p className="mt-4 text-center text-[7px] uppercase tracking-[0.16em] text-green-500">
            You can use the lens adjuster, arrows or numbered selectors to
            choose the technician role.
          </p>

          {/* COMPACT CINEMATIC CAPTURE BUTTON */}
          <div className="mx-auto mt-6 flex flex-col items-center">
            <button
              type="button"
              onClick={handleCapture}
              disabled={isCapturing}
              className="group inline-flex items-center gap-3 rounded-full border border-zinc-600/60 bg-gradient-to-b from-[#292a2c] to-[#111213] px-5 py-3 shadow-[0_3px_0_#050505,0_6px_14px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-yellow-400/50 active:translate-y-0.5 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-500/60 bg-[#171819] shadow-[inset_0_1px_3px_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)] transition-colors group-hover:border-yellow-400/50">
                <span
                  className={`h-3 w-3 rounded-full border border-yellow-400 bg-yellow-400/20 transition-all ${
                    isCapturing
                      ? "scale-125 bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)]"
                      : "shadow-[0_0_7px_rgba(250,204,21,0.35)] group-hover:bg-yellow-400/50"
                  }`}
                />
              </span>

              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-200 transition-colors group-hover:text-yellow-300 sm:text-[10px]">
                {isCapturing
                  ? "Capturing..."
                  : "Click Here after setting the Role"}
              </span>

              <span className="text-xs text-zinc-500 transition-all group-hover:translate-x-0.5 group-hover:text-yellow-400">
                →
              </span>
            </button>
          </div>
        </div>

        {/* METHODOLOGY */}
        <div className="mx-auto mt-10 max-w-3xl border-l border-yellow-400/40 bg-[#101112]/80 px-4 py-4 sm:px-5">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-red-400">
            The JMI approach
          </p>

          <p className="mt-2 text-[10px] leading-5 text-zinc-400">
            Explore technicians through structured movie credits, theatrical
            verdicts and box-office data. Rankings will use the relevant JMI
            records and clearly defined calculation criteria.
          </p>
        </div>
      </div>

      {/* FULL-SCREEN CAMERA FLASH */}
      {isCapturing && (
        <div
          aria-hidden="true"
          className="jmi-camera-flash pointer-events-none fixed inset-0 z-[9999] bg-white"
        />
      )}

      {/* COMPONENT STYLES */}
      <style>{`
        .jmi-camera-texture {
          background-color: #111213;
          background-image:
            repeating-linear-gradient(
              2deg,
              transparent 0px,
              transparent 7px,
              rgba(255, 255, 255, 0.018) 8px,
              transparent 10px,
              transparent 17px
            ),
            repeating-linear-gradient(
              91deg,
              transparent 0px,
              transparent 47px,
              rgba(0, 0, 0, 0.19) 49px,
              transparent 53px,
              transparent 87px
            ),
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.025),
              transparent 35%,
              rgba(0, 0, 0, 0.3)
            );
        }

        @keyframes jmi-clapboard-enter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .jmi-clapboard-enter {
          animation: jmi-clapboard-enter 320ms ease-out both;
        }

        @keyframes jmi-camera-flash {
          0% {
            opacity: 0;
          }

          10% {
            opacity: 0.95;
          }

          22% {
            opacity: 1;
          }

          38% {
            opacity: 0.9;
          }

          100% {
            opacity: 1;
          }
        }

        .jmi-camera-flash {
          animation: jmi-camera-flash 450ms ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .jmi-clapboard-enter {
            animation: none;
          }

          .jmi-camera-flash {
            animation-duration: 150ms;
          }
        }
      `}</style>
    </section>
  );
}