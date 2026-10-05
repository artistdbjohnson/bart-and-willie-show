"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { attachPlayer, loadYoutube, PLAYER_ENDED, type YoutubePlayer } from "@/lib/youtube-player";
import { cn } from "@/lib/utils";

export type WatchItem = {
  id: string;
  title: string;
  kind: "video" | "short";
  poster?: string;
};

const WatchContext = createContext<(item: WatchItem) => void>(() => {});

export function useWatch() {
  return useContext(WatchContext);
}

export function WatchProvider({ closeLabel, children }: { closeLabel: string; children: ReactNode }) {
  const [item, setItem] = useState<WatchItem | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  function open(next: WatchItem) {
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setItem(next);
  }

  function close() {
    setItem(null);
    lastFocus.current?.focus();
  }

  return (
    <WatchContext.Provider value={open}>
      {children}
      {item ? <WatchDialog item={item} closeLabel={closeLabel} onClose={close} /> : null}
    </WatchContext.Provider>
  );
}

export function WatchTarget({
  id,
  title,
  kind,
  poster,
  className,
  children,
}: WatchItem & { className?: string; children: ReactNode }) {
  const open = useWatch();
  return (
    <a
      href={`https://www.youtube.com/watch?v=${id}`}
      className={cn("cursor-pointer bg-transparent p-0 text-left text-inherit no-underline", className)}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        open({ id, title, kind, poster });
      }}
    >
      {children}
    </a>
  );
}

export function HeroWatch({
  videoId,
  title,
  poster,
  children,
}: {
  videoId: string;
  title: string;
  poster?: string;
  children: ReactNode;
}) {
  const open = useWatch();
  return (
    <Button type="button" onClick={() => open({ id: videoId, title, kind: "video", poster })}>
      {children}
    </Button>
  );
}

function WatchDialog({
  item,
  closeLabel,
  onClose,
}: {
  item: WatchItem;
  closeLabel: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeButton = useRef<HTMLButtonElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    if (reduced) {
      setPresent(true);
    } else {
      const frame = window.requestAnimationFrame(() => setPresent(true));
      return () => {
        window.cancelAnimationFrame(frame);
        document.body.style.overflow = previous;
      };
    }
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const hostParent = mount.current;
    if (!hostParent || ended) return;
    let dead = false;
    let player: YoutubePlayer | null = null;
    const host = document.createElement("div");
    host.className = "absolute inset-0";
    hostParent.replaceChildren(host);

    const start = () => {
      if (dead || !hostParent.isConnected) return;
      if (hostParent.clientWidth < 2 || hostParent.clientHeight < 2) {
        window.requestAnimationFrame(start);
        return;
      }
      void loadYoutube()
        .then(() => {
          if (dead) return;
          player = attachPlayer(
            host,
            item.id,
            {
              autoplay: 1,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              iv_load_policy: 3,
              cc_load_policy: 0,
              fs: 1,
              controls: 1,
            },
            {
              onReady: (event) => {
                event.target.playVideo();
              },
              onStateChange: (event) => {
                if (event.data === PLAYER_ENDED) {
                  try {
                    event.target.stopVideo();
                  } catch {
                    /* already stopped */
                  }
                  setEnded(true);
                }
              },
            },
          );
        })
        .catch(() => setEnded(true));
    };
    start();

    return () => {
      dead = true;
      try {
        player?.destroy();
      } catch {
        /* already gone */
      }
    };
  }, [ended, item.id]);

  const shellClass =
    item.kind === "short" ? "w-[min(100%,calc((100svh-8rem)*9/16))]" : "w-full max-w-5xl";

  return (
    <div className={cn("watch-layer fixed inset-0 z-[80]", present && "is-open")}>
      <button type="button" className="watch-backdrop absolute inset-0" aria-label={closeLabel} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="watch-panel pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-16 sm:px-8"
      >
        <div className={cn("pointer-events-auto", shellClass)}>
          <p id={titleId} className="sr-only">
            {item.title}
          </p>
          <div
            className={
              item.kind === "short"
                ? "relative aspect-[9/16] w-full bg-ink"
                : "relative aspect-video w-full bg-ink"
            }
          >
            {ended && item.poster ? (
              // Playback finished. The still replaces the end screen so suggested videos do not stay up.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.poster} alt="" className="absolute inset-0 h-full w-full object-contain" />
            ) : (
              <div ref={mount} className="absolute inset-0" />
            )}
          </div>
        </div>
      </div>
      <Button
        ref={closeButton}
        type="button"
        variant="outline"
        size="icon"
        aria-label={closeLabel}
        className="absolute top-4 right-4 z-10 bg-field"
        onClick={onClose}
      >
        <CloseIcon />
      </Button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 stroke-current" aria-hidden="true">
      <path d="M2 2l8 8M10 2L2 10" fill="none" strokeWidth="1.4" />
    </svg>
  );
}
