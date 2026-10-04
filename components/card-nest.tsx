"use client";

import { useEffect, useRef, type ReactNode } from "react";

const PEEK = 12;

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
    const applied = new Array<number>(count).fill(0);

    const typeBoxes = (card: HTMLElement) => {
      const lines: Array<{ top: number; bottom: number }> = [];
      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const parent = node.parentElement;
        if (parent && !parent.closest(".sheet-media, .sheet-edge") && node.textContent?.trim()) {
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (rect.width >= 8 && rect.height >= 8 && rect.height <= 260) {
              lines.push({ top: rect.top, bottom: rect.bottom });
            }
          }
        }
        node = walker.nextNode();
      }
      lines.sort((a, b) => a.top - b.top);
      const blocks: Array<{ top: number; bottom: number }> = [];
      for (const line of lines) {
        const last = blocks[blocks.length - 1];
        // Wrapped lines of one headline sit a few pixels apart. Join those
        // so the rule cannot rest in the gap and split the headline. The
        // date stays its own block: it is more than 8px above the title.
        if (last && line.top <= last.bottom + 8) last.bottom = Math.max(last.bottom, line.bottom);
        else blocks.push({ ...line });
      }
      return blocks;
    };

    // The yellow rule is the first 4px of the sheet. The edge has to clear
    // that whole bar, not only the 0px top of the face.
    const RULE = 4;

    const ruleSpan = (faceTop: number, boxes: Array<{ top: number; bottom: number }>) => {
      let top = faceTop;
      let bottom = faceTop + RULE;
      let hit = false;
      let grew = true;
      while (grew) {
        grew = false;
        for (const rect of boxes) {
          if (rect.bottom > top + 0.5 && rect.top < bottom - 0.5) {
            hit = true;
            const nextTop = Math.min(top, rect.top);
            const nextBottom = Math.max(bottom, rect.bottom);
            if (nextTop < top - 0.01 || nextBottom > bottom + 0.01) {
              top = nextTop;
              bottom = nextBottom;
              grew = true;
            }
          }
        }
      }
      return { top, bottom, hit };
    };

    const place = () => {
      frame = 0;
      const list = faces.current.filter((face): face is HTMLDivElement => face !== null);
      if (reduced()) {
        for (const face of list) face.style.transform = "";
        return;
      }
      const nav = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      list.forEach((face, index) => {
        if (index === 0) {
          applied[index] = 0;
          face.style.transform = "";
          return;
        }
        const visual = face.getBoundingClientRect().top;
        const natural = visual - applied[index];
        const boxes = list.slice(0, index).flatMap((earlier) => typeBoxes(earlier));

        // Step to the near side of the whole run of type the rule would
        // cross. Before the midpoint the line stays intact above the rule.
        // Past it, the sheet covers the run and the rule sits just above it.
        let pos = natural;
        for (let step = 0; step < 8; step++) {
          const span = ruleSpan(pos, boxes);
          if (!span.hit) break;
          const next = natural < (span.top + span.bottom) / 2 ? span.bottom : span.top - RULE;
          if (Math.abs(next - pos) < 0.5) {
            pos = next;
            break;
          }
          pos = next;
        }

        // Releasing the stack used to pin every later sheet to the header
        // edge, and that edge cuts the line scrolling out underneath.
        // The header is opaque, so the sheet may start above it and cover
        // the line instead.
        if (pos < nav) {
          const parked = ruleSpan(nav, boxes);
          if (parked.hit) {
            pos = parked.top - RULE;
            for (let step = 0; step < 6; step++) {
              const span = ruleSpan(pos, boxes);
              if (!span.hit) break;
              const next = span.top - RULE;
              if (Math.abs(next - pos) < 0.5) break;
              pos = next;
            }
          } else {
            pos = nav;
          }
        }

        const dy = pos - natural;
        applied[index] = dy;
        face.style.transform = Math.abs(dy) > 0.4 ? `translate3d(0, ${dy}px, 0)` : "";
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
    <div ref={nest} className="card-nest">
      {children.map((child, index) => (
        <div
          key={index}
          className="nest-card"
          style={{
            zIndex: index + 1,
            top: `calc(var(--nav-clear) + ${(index + 1) * PEEK}px)`,
            marginBottom: index === count - 1 ? 0 : PEEK,
          }}
        >
          <div
            className="nest-face"
            ref={(node) => {
              faces.current[index] = node;
            }}
          >
            <div className="sheet-edge" aria-hidden="true">
              <span className="sheet-edge-signal" />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">{child}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
