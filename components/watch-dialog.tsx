"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { loadYoutube, PLAYER_ENDED, type YoutubePlayer } from "@/lib/youtube-player";
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
    <button
      type="button"
      className={cn(
        "cursor-pointer appearance-none border-0 bg-transparent p-0 text-left text-inherit",
        className,
      )}
      onClick={() => open({ id, title, kind, poster })}
    >
      {children}
    </button>
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
    host.className = "h-full w-full";
    hostParent.replaceChildren(host);

    void loadYoutube()
      .then((api) => {
        if (dead) return;
        player = new api.Player(host, {
          videoId: item.id,
          width: "100%",
          height: "100%",
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,
            fs: 1,
            controls: 1,
            origin: window.location.origin,
          },
          events: {
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
        });
      })
      .catch(() => setEnded(true));

    return () => {
      dead = true;
      try {
        player?.destroy();
      } catch {
        /* already gone */
      }
    };
  }, [ended, item.id]);

  const frameClass =
    item.kind === "short"
      ? "relative aspect-[9/16] w-[min(100%,calc(82svh*9/16))] bg-ink"
      : "relative aspect-video w-full max-w-5xl bg-ink";

  return (
    <div className={cn("watch-layer fixed inset-0 z-[80]", present && "is-open")}>
      <button type="button" className="watch-backdrop absolute inset-0" aria-label={closeLabel} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="watch-panel pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-8"
      >
        <div className="pointer-events-auto relative">
          <p id={titleId} className="sr-only">
            {item.title}
          </p>
          <Button
            ref={closeButton}
            type="button"
            variant="outline"
            size="icon"
            aria-label={closeLabel}
            className="absolute -top-3 right-0 z-10 translate-y-[-100%] bg-field/80 sm:right-0"
            onClick={onClose}
          >
            <CloseIcon />
          </Button>
          <div className={frameClass}>
            {ended && item.poster ? (
              // Playback finished. The still replaces the end screen so suggested videos do not stay up.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.poster} alt="" className="h-full w-full object-contain" />
            ) : (
              <div ref={mount} className="absolute inset-0" />
            )}
          </div>
        </div>
      </div>
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
