"use client";

import { useEffect, useRef } from "react";
import { animate, stagger, svg } from "animejs";

export function ChalkPlay({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const paths = root.querySelectorAll("[data-chalk]");
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion") ||
      document.documentElement.classList.contains("intro-seen");
    if (reduce) return;

    const drawable = svg.createDrawable(paths);
    const animation = animate(drawable, {
      draw: ["0 0", "0 1"],
      duration: 2400,
      delay: stagger(90),
      ease: "inOutSine",
    });

    return () => {
      animation.pause();
    };
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 420 300"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <g
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path data-chalk d="M124 24 V276" />
        <path data-chalk d="M108 72 H140" />
        <path data-chalk d="M108 156 H140" />
        <path data-chalk d="M108 232 H140" />
        <path data-chalk d="M70 196 a18 18 0 1 0 0.4 0" />
        <path data-chalk d="M54 78 L98 122" />
        <path data-chalk d="M98 78 L54 122" />
        <path data-chalk d="M70 178 C86 118 168 112 236 58" />
        <path data-chalk d="M208 46 L244 52 L214 86" />
        <path data-chalk d="M70 214 H268" />
        <path data-chalk d="M244 196 L272 214 L244 232" />
        <path data-chalk d="M286 92 L330 136" />
        <path data-chalk d="M330 92 L286 136" />
        <path data-chalk d="M372 28 V272" />
      </g>
    </svg>
  );
}
