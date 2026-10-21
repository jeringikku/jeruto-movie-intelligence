"use client";

import { useEffect, useState } from "react";

const TEST_RAIN_OVERRIDE = false;

export function useJmiRainState(): boolean {
  const [isRaining, setIsRaining] = useState(TEST_RAIN_OVERRIDE);

  useEffect(() => {
    const updateRainState = () => {
      if (TEST_RAIN_OVERRIDE) {
        setIsRaining(true);
        return;
      }

      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());

      const getPart = (type: string) =>
        Number(parts.find((part) => part.type === type)?.value ?? 0);

      const minutes = getPart("hour") * 60 + getPart("minute");

      const active =
        (minutes >= 11 * 60 + 50 && minutes < 12 * 60) ||
        (minutes >= 16 * 60 + 50 && minutes < 17 * 60);

      setIsRaining(active);
    };

    updateRainState();

    const interval = window.setInterval(updateRainState, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return isRaining;
}