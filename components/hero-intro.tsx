"use client";

import { useLayoutEffect } from "react";
import { applyHeroIntro, ensureHeroIntro } from "@/lib/hero-intro";

/**
 * Full loads bind the file from the head, before paint. This effect covers
 * a client return to the homepage, where that script does not run again.
 */
export function HeroIntroMount() {
  useLayoutEffect(() => {
    const video = document.getElementById("hero-intro");
    if (!(video instanceof HTMLVideoElement)) return;
    applyHeroIntro(video, ensureHeroIntro());
  }, []);

  return null;
}
