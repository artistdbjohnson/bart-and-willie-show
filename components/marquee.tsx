"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";

const SPEED = 36;

export function Marquee({
  label,
  previous,
  next,
  pause,
  play,
  fill = false,
  pages = false,
  children,
}: {
  label: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  fill?: boolean;
  pages?: boolean;
  children: ReactNode;
}) {
  const items = Children.toArray(children);
  const view = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const setWidth = useRef(0);
  const stride = useRef(0);
  const offset = useRef(0);
  const paused = useRef(false);
  const locked = useRef(false);
  const moved = useRef(false);
  const anim = useRef<{ from: number; to: number; start: number; dur: number } | null>(null);
  const drag = useRef<{ x: number; y: number; offset: number; horizontal: boolean; vertical: boolean } | null>(null);
  const wheelTimer = useRef(0);
  const hold = useRef(0);
  const pagesOn = useRef(pages);
  pagesOn.current = pages;
  const [lockOn, setLockOn] = useState(false);

  function paint() {
    const loop = setWidth.current;
    if (loop > 0) offset.current = ((offset.current % loop) + loop) % loop;
    if (track.current) track.current.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
  }

  useEffect(() => {
    const measure = () => {
      const viewEl = view.current;
      const setEl = setRef.current;
      if (!viewEl || !setEl) return;
      const width = viewEl.clientWidth;
      const count = setEl.children.length;
      if (!width || !count) return;
      const cols = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
      const gap = 12;
      const tile = (width - gap * (cols - 1)) / cols;
      track.current?.querySelectorAll<HTMLElement>("[data-tile]").forEach((el) => {
        el.style.width = `${tile}px`;
      });
      const first = setEl.querySelector<HTMLElement>("[data-tile]");
      stride.current = (first?.getBoundingClientRect().width || tile) + gap;
      setWidth.current = setEl.getBoundingClientRect().width + gap;
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (view.current) observer.observe(view.current);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      const motion = anim.current;
      if (motion) {
        const progress = Math.min(1, (now - motion.start) / motion.dur);
        const eased = 1 - (1 - progress) ** 3;
        offset.current = motion.from + (motion.to - motion.from) * eased;
        if (progress === 1) anim.current = null;
        paint();
      } else if (!reduced() && !paused.current && !locked.current && !drag.current && setWidth.current > 0) {
        if (pagesOn.current) {
          hold.current += dt;
          if (hold.current >= 3200) {
            hold.current = 0;
            const step = stride.current || 280;
            anim.current = { from: offset.current, to: offset.current + step, start: now, dur: 700 };
          }
        } else {
          offset.current += (SPEED * dt) / 1000;
          paint();
        }
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    const node = view.current;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      anim.current = null;
      paused.current = true;
      moved.current = true;
      offset.current += event.deltaX;
      paint();
      window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => {
        settle();
        if (!locked.current) paused.current = false;
      }, 140);
    };
    node?.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.cancelAnimationFrame(frame);
      node?.removeEventListener("wheel", onWheel);
      window.clearTimeout(wheelTimer.current);
    };
  }, []);

  function settle() {
    const step = stride.current;
    if (step <= 0) return;
    const loop = setWidth.current;
    let current = offset.current;
    if (loop > 0) current = ((current % loop) + loop) % loop;
    const snapped = Math.round(current / step) * step;
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    if (reduce || Math.abs(snapped - current) < 0.5) {
      offset.current = snapped;
      paint();
      return;
    }
    anim.current = { from: current, to: snapped, start: performance.now(), dur: 280 };
  }

  function nudge(direction: number) {
    const step = stride.current || 280;
    const from = offset.current;
    const to = from + direction * step;
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    anim.current = null;
    hold.current = 0;
    if (reduce) {
      offset.current = to;
      paint();
      return;
    }
    anim.current = { from, to, start: performance.now(), dur: 560 };
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    paused.current = true;
    moved.current = false;
    anim.current = null;
    hold.current = 0;
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      offset: offset.current,
      horizontal: false,
      vertical: false,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.vertical) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal) {
      if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) {
        start.vertical = true;
        if (!locked.current) paused.current = false;
        return;
      }
      if (Math.abs(dx) <= 6 || Math.abs(dx) < Math.abs(dy)) return;
      start.horizontal = true;
      moved.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    offset.current = start.offset - (event.clientX - start.x);
    paint();
  }

  function onPointerUp() {
    const dragged = moved.current || Boolean(drag.current?.horizontal);
    drag.current = null;
    if (dragged) settle();
    if (!locked.current) paused.current = false;
    if (dragged) {
      const block = (click: Event) => {
        click.preventDefault();
        click.stopPropagation();
        view.current?.removeEventListener("click", block, true);
      };
      view.current?.addEventListener("click", block, true);
    }
  }

  if (items.length === 0) return null;

  const tiles = (copy: boolean) =>
    items.map((item, index) => (
      <div key={`${copy ? "copy" : "set"}-${index}`} data-tile className={fill ? "h-full shrink-0" : "shrink-0"}>
        {item}
      </div>
    ));

  return (
    <div className={fill ? "flex min-h-0 flex-1 flex-col" : undefined}>
      <div className="mb-3 flex shrink-0 justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-pressed={lockOn}
          aria-label={lockOn ? play : pause}
          onClick={() => {
            locked.current = !locked.current;
            setLockOn(locked.current);
            if (locked.current) anim.current = null;
          }}
        >
          {lockOn ? <PlayIcon /> : <PauseIcon />}
        </Button>
        <Button type="button" variant="outline" size="icon" aria-label={previous} onClick={() => nudge(-1)}>
          ←
        </Button>
        <Button type="button" variant="outline" size="icon" aria-label={next} onClick={() => nudge(1)}>
          →
        </Button>
      </div>
      <div
        ref={view}
        className={fill ? "marquee-view min-h-0 flex-1" : "marquee-view"}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            nudge(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            nudge(-1);
          }
        }}
      >
        <div ref={track} className={fill ? "flex h-full w-max gap-3" : "flex w-max gap-3"} aria-label={label} role="list">
          <div ref={setRef} className={fill ? "flex h-full gap-3" : "flex gap-3"}>
            {tiles(false)}
          </div>
          <div className={fill ? "flex h-full gap-3" : "flex gap-3"} aria-hidden="true">
            {tiles(true)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 fill-current" aria-hidden="true">
      <path d="M2 1h3v10H2zM7 1h3v10H7z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 fill-current" aria-hidden="true">
      <path d="M3 1.4v9.2l7.4-4.6z" />
    </svg>
  );
}
