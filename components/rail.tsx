"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Rail({
  label,
  previous,
  next,
  children,
}: {
  label: string;
  previous: string;
  next: string;
  children: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ prev: false, next: true });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({
        prev: el.scrollLeft > 8,
        next: el.scrollLeft < max - 8,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [children]);

  function move(direction: number) {
    const el = scroller.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * Math.max(el.clientWidth * 0.82, 240),
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={previous}
          disabled={!edges.prev}
          onClick={() => move(-1)}
        >
          ←
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={next}
          disabled={!edges.next}
          onClick={() => move(1)}
        >
          →
        </Button>
      </div>
      <div
        ref={scroller}
        tabIndex={0}
        aria-label={label}
        className="rail -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk sm:mx-0 sm:scroll-px-0 sm:px-0"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
