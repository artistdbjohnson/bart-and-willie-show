"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Rail({
  label,
  previous,
  next,
  children,
  controlsOnly = false,
}: {
  label: string;
  previous: string;
  next: string;
  children: ReactNode;
  controlsOnly?: boolean;
}) {
  if (controlsOnly) {
    return (
      <ControlledRail label={label} previous={previous} next={next}>
        {children}
      </ControlledRail>
    );
  }

  return (
    <ScrollRail label={label} previous={previous} next={next}>
      {children}
    </ScrollRail>
  );
}

function ScrollRail({
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
      <RailButtons previous={previous} next={next} edges={edges} onMove={move} />
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

function ControlledRail({
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
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const [edges, setEdges] = useState({ prev: false, next: true });

  function limits() {
    const viewWidth = view.current?.clientWidth ?? 0;
    const trackWidth = track.current?.scrollWidth ?? 0;
    return Math.max(0, trackWidth - viewWidth);
  }

  function stride() {
    const card = track.current?.firstElementChild;
    if (!card || !track.current) return Math.max(view.current?.clientWidth ?? 280, 240);
    const gap = Number.parseFloat(getComputedStyle(track.current).columnGap || "0") || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function apply(value: number) {
    const max = limits();
    offset.current = Math.min(max, Math.max(0, value));
    if (track.current) {
      track.current.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
    }
    setEdges({
      prev: offset.current > 8,
      next: offset.current < max - 8,
    });
  }

  useEffect(() => {
    apply(0);
    const onResize = () => apply(offset.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // Measure after the cards paint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  function move(direction: number) {
    const from = offset.current;
    const to = from + direction * stride();
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    if (reduce) {
      apply(to);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 560);
      const eased = 1 - (1 - t) ** 3;
      apply(from + (to - from) * eased);
      if (t < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  return (
    <div>
      <RailButtons previous={previous} next={next} edges={edges} onMove={move} />
      <div
        ref={view}
        aria-label={label}
        className="page-rail"
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
        <div ref={track} className="flex w-max gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function RailButtons({
  previous,
  next,
  edges,
  onMove,
}: {
  previous: string;
  next: string;
  edges: { prev: boolean; next: boolean };
  onMove: (direction: number) => void;
}) {
  return (
    <div className="mb-4 flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={previous}
        disabled={!edges.prev}
        onClick={() => onMove(-1)}
      >
        ←
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={next}
        disabled={!edges.next}
        onClick={() => onMove(1)}
      >
        →
      </Button>
    </div>
  );
}
