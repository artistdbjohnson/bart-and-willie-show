"use client";

import { useEffect, useState } from "react";

export function ToTop({ label }: { label: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const update = () => {
      const dialog = document.querySelector(".watch-layer, [role='dialog']");
      if (dialog) {
        setOn(false);
        return;
      }
      const hero = document.querySelector("[data-hero]");
      if (hero) {
        const box = hero.getBoundingClientRect();
        const mute = hero.querySelector("button[aria-pressed]");
        const muteBox = mute?.getBoundingClientRect();
        const muteOnScreen = Boolean(
          muteBox && muteBox.bottom > 0 && muteBox.top < window.innerHeight && muteBox.width > 0,
        );
        setOn(box.bottom <= 0 && !muteOnScreen);
        return;
      }
      setOn(window.scrollY > window.innerHeight * 0.75);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  if (!on) return null;

  return (
    <button
      type="button"
      aria-label={label}
      className="fixed right-5 bottom-6 z-30 flex size-11 items-center justify-center border border-chalk/45 bg-field text-chalk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-chalk"
      onClick={() => {
        const root = document.documentElement;
        const reduce =
          window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
          root.classList.contains("reduce-motion");
        root.style.scrollSnapType = "none";
        if (reduce) {
          window.scrollTo(0, 0);
          root.style.scrollSnapType = "";
          return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        const started = performance.now();
        const finish = () => {
          if (window.scrollY > 1 && performance.now() - started < 2200) {
            window.requestAnimationFrame(finish);
            return;
          }
          if (window.scrollY > 1) window.scrollTo(0, 0);
          root.style.scrollSnapType = "";
        };
        window.requestAnimationFrame(finish);
      }}
    >
      <svg viewBox="0 0 12 12" className="size-3.5" aria-hidden="true">
        <path d="M6 2.2v7.2M3.2 5.1 6 2.2l2.8 2.9" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </button>
  );
}
