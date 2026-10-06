"use client";

import { useLayoutEffect } from "react";

const INTRO_KEY = "baw-intro";

/* A strict-mode remount lands in the same turn. A real return does not. */
const REMOUNT_MS = 80;
let playedAt = 0;

/**
 * Full loads are settled by the head script. This covers a return to the
 * homepage without a new document, such as the language toggle. The fresh
 * mark means this document is the view that is allowed to play.
 */
export function IntroOnce() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const reduce =
      root.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || root.classList.contains("intro-seen")) return;

    if (root.dataset.introFresh === "1") {
      delete root.dataset.introFresh;
      playedAt = performance.now();
      return;
    }

    let stored = false;
    try {
      stored = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {
      return;
    }

    if (stored) {
      if (playedAt && performance.now() - playedAt < REMOUNT_MS) return;
      root.classList.add("intro-seen");
      return;
    }

    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* storage blocked: the next load may play the intro again */
    }
    playedAt = performance.now();
  }, []);

  return null;
}
