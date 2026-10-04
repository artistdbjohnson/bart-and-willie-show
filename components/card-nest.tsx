"use client";

import { useEffect, useRef, type ReactNode } from "react";

const STEP = "28vh";

export function CardNest({ children }: { children: ReactNode[] }) {
  const nest = useRef<HTMLDivElement>(null);
  const faces = useRef<Array<HTMLDivElement | null>>([]);
  const count = children.length;

  useEffect(() => {
    const root = nest.current;
    if (!root || count < 2) return;

    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");

    let frame = 0;
    const place = () => {
      frame = 0;
      if (reduced()) return;
      const rect = root.getBoundingClientRect();
      const runway = root.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(runway, 0));
      const progress = runway <= 0 ? 0 : (scrolled / runway) * (count - 1);
      faces.current.forEach((face, index) => {
        if (!face) return;
        if (index === 0) {
          face.style.transform = "translate3d(0, 0, 0)";
          return;
        }
        const travel = Math.min(1, Math.max(0, progress - (index - 1)));
        const peek = travel * index * 10;
        face.style.transform = `translate3d(0, calc(${(1 - travel) * 100}% + ${peek}px), 0)`;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(place);
    };

    place();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [count]);

  return (
    <div
      ref={nest}
      className="card-nest"
      style={{ height: count > 1 ? `calc(100svh + ${(count - 1)} * ${STEP})` : "100svh" }}
    >
      <div className="card-nest-pin">
        {children.map((child, index) => (
          <div
            key={index}
            ref={(node) => {
              faces.current[index] = node;
            }}
            className="nest-card"
            style={{ zIndex: index + 1 }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
