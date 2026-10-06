"use client";

import { useLayoutEffect } from "react";

const INTRO_KEY = "baw-intro";

/**
 * The homepage intro plays once per tab. The flag is written on the
 * frame after this view starts, so the open still runs. A later load
 * reads the flag before paint. Reduced motion never takes a turn.
 */
export function IntroOnce() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const reduce =
      root.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || root.classList.contains("intro-seen")) return;

    let frame = 0;
    try {
      if (sessionStorage.getItem(INTRO_KEY) === "1") {
        root.classList.add("intro-seen");
        return;
      }
    } catch {
      return;
    }

    frame = window.requestAnimationFrame(() => {
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        /* storage blocked: the next load may play the intro again */
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
