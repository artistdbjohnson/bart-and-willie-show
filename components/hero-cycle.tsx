"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ShortBeat } from "@/lib/youtube";

const HERO_HOLD = 6400;
const POSTER_HOLD = 4800;

export function HeroCycle({
  still,
  shorts,
  mute,
  unmute,
  children,
}: {
  still: string | null;
  shorts: ShortBeat[];
  mute: string;
  unmute: string;
  children: ReactNode;
}) {
  const [phase, setPhase] = useState<"hero" | "short">("hero");
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const video = useRef<HTMLVideoElement>(null);
  const finishBeat = useRef<(() => void) | null>(null);
  const beat = shorts[index] ?? null;
  const file = beat && beat.src && !failed[beat.id] ? beat.src : null;

  useEffect(() => {
    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    if (reduced() || shorts.length === 0) return;

    let cancelled = false;
    let timer = 0;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    const run = async () => {
      let cursor = 0;
      while (!cancelled) {
        setPhase("hero");
        await wait(HERO_HOLD);
        if (cancelled || reduced()) return;
        const next = shorts[cursor % shorts.length];
        cursor += 1;
        setIndex((cursor - 1) % shorts.length);
        setPhase("short");
        await new Promise<void>((resolve) => {
          finishBeat.current = resolve;
          timer = window.setTimeout(resolve, next.src ? 45000 : POSTER_HOLD);
        });
        finishBeat.current = null;
      }
    };

    void run();
    return () => {
      cancelled = true;
      finishBeat.current = null;
      window.clearTimeout(timer);
    };
  }, [shorts]);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.muted = muted;
    if (phase === "short" && file) {
      const play = node.play();
      if (play) {
        play.catch(() => {
          setFailed((current) => ({ ...current, [beat?.id ?? ""]: true }));
          finishBeat.current?.();
        });
      }
    } else {
      node.pause();
    }
  }, [phase, file, muted, beat?.id]);

  const showMute = phase === "short" && Boolean(file);

  return (
    <>
      <div className="absolute inset-0 bg-field">
        <div className={`hero-fade absolute inset-0 ${phase === "hero" ? "opacity-100" : "opacity-0"}`}>
          {still ? (
            <Image src={still} alt="" fill priority sizes="100vw" className="object-cover opacity-80" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-field via-field/75 to-field/35" />
        </div>
        <div
          className={`hero-fade absolute inset-0 bg-field ${phase === "short" ? "opacity-100" : "opacity-0"}`}
          aria-hidden={phase !== "short"}
        >
          {beat && file ? (
            <video
              ref={video}
              key={beat.id}
              src={file}
              poster={beat.poster}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
              onEnded={() => finishBeat.current?.()}
              onError={() => {
                setFailed((current) => ({ ...current, [beat.id]: true }));
                finishBeat.current?.();
              }}
            />
          ) : beat ? (
            // The short's own poster. No iframe, so no YouTube chrome can appear.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={beat.poster} alt="" className="h-full w-full object-contain" />
          ) : null}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[68%] bg-gradient-to-t from-field via-field/80 to-transparent" />
      <div className="relative z-10">{children}</div>
      {showMute ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={muted ? unmute : mute}
          aria-pressed={!muted}
          className="absolute right-5 bottom-6 z-20 sm:right-8"
          onClick={() => setMuted((value) => !value)}
        >
          {muted ? <MuteIcon /> : <SoundIcon />}
        </Button>
      ) : null}
    </>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5" aria-hidden="true">
      <path d="M1.5 4.2h2.2L6.4 2v8L3.7 7.8H1.5z" fill="currentColor" />
      <path d="M8.2 4.4l2.3 2.3M10.5 4.4L8.2 6.7" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5" aria-hidden="true">
      <path d="M1.5 4.2h2.2L6.4 2v8L3.7 7.8H1.5z" fill="currentColor" />
      <path d="M8 4.2a2.6 2.6 0 0 1 0 3.6M9.4 3a4.2 4.2 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
