"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  attachPlayer,
  loadYoutube,
  PLAYER_ENDED,
  PLAYER_PAUSED,
  PLAYER_PLAYING,
  silenceCaptions,
  type YoutubePlayer,
} from "@/lib/youtube-player";
import type { ShortBeat } from "@/lib/youtube";

const STILL_HOLD = 3000;
const FADE_MS = 1100;
const START_LIMIT = 12000;
const STALL_MS = 4000;

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
  const root = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const player = useRef<YoutubePlayer | null>(null);
  const [phase, setPhase] = useState<"hero" | "short">("hero");
  const [muted, setMuted] = useState(true);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const measure = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      if (!width || !height) return;
      const scale = Math.max(width / 9, height / 16);
      setBox({ width: 9 * scale, height: 16 * scale });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    if (reduced() || shorts.length === 0) return;

    let cancelled = false;
    let timer = 0;
    let poll = 0;
    let active: YoutubePlayer | null = null;
    const captionTimers: number[] = [];
    const quiet = (target: YoutubePlayer) => {
      silenceCaptions(target);
      captionTimers.push(window.setTimeout(() => silenceCaptions(target), 350));
      captionTimers.push(window.setTimeout(() => silenceCaptions(target), 1400));
    };
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });
    const stopPoll = () => window.clearInterval(poll);

    const destroy = () => {
      const current = active;
      active = null;
      player.current = null;
      try {
        current?.destroy();
      } catch {
        /* the player already released the iframe */
      }
    };

    const run = async () => {
      try {
        await loadYoutube();
      } catch {
        return;
      }
      if (cancelled) return;
      let cursor = 0;
      const failed = new Set<string>();

      while (!cancelled) {
        setPhase("hero");
        await wait(STILL_HOLD);
        if (cancelled || reduced()) return;

        let guard = 0;
        let next = shorts[cursor % shorts.length];
        while (failed.has(next.id) && guard < shorts.length) {
          cursor += 1;
          guard += 1;
          next = shorts[cursor % shorts.length];
        }
        if (failed.has(next.id)) return;
        cursor += 1;

        const hostParent = mount.current;
        if (!hostParent || cancelled) return;
        if (hostParent.clientWidth < 2 || hostParent.clientHeight < 2) {
          const node = root.current;
          if (node) {
            const width = node.clientWidth;
            const height = node.clientHeight;
            if (width && height) {
              const scale = Math.max(width / 9, height / 16);
              setBox({ width: 9 * scale, height: 16 * scale });
            }
          }
          await wait(40);
        }
        if (cancelled) return;
        const host = document.createElement("div");
        host.className = "h-full w-full";
        hostParent.replaceChildren(host);

        let shown = false;
        const outcome = await new Promise<"ended" | "error" | "stall">((resolve) => {
          let settled = false;
          let leaving = false;
          let peak = 0;
          let lastTime = -1;
          let lastMove = 0;
          let expecting = false;
          let resumes = 0;
          let lastResume = 0;
          let dips = 0;
          const finish = (value: "ended" | "error" | "stall") => {
            if (settled) return;
            settled = true;
            window.clearTimeout(startTimer);
            stopPoll();
            resolve(value);
          };
          // Hold the last frame under the still. stopVideo() blanks the iframe
          // and the fade would come up over black.
          const holdFrame = () => {
            try {
              active?.pauseVideo();
            } catch {
              /* already stopped */
            }
          };
          const backToStill = () => {
            if (settled || leaving) return;
            leaving = true;
            holdFrame();
            if (!cancelled) setPhase("hero");
            finish(shown ? "ended" : "stall");
          };
          const notePlaying = () => {
            if (settled) return;
            shown = true;
            if (!cancelled) setPhase("short");
          };
          const noteProgress = (time: number) => {
            if (time > lastTime + 0.2) {
              lastTime = time;
              lastMove = performance.now();
            }
          };
          const arm = () => {
            expecting = true;
            lastMove = performance.now();
          };
          // Mobile Chrome often pauses a muted autoplay Short, or parks on the
          // last frame as PAUSED instead of ENDED. A backward jump is a loop.
          const atEnd = (current: YoutubePlayer) => {
            const state = current.getPlayerState();
            if (state === PLAYER_PLAYING) notePlaying();
            if (state === PLAYER_ENDED) return true;
            const duration = current.getDuration();
            const time = current.getCurrentTime();
            if (!Number.isFinite(time)) return false;
            if (time > peak) peak = time;
            // One 0-sample from the API is a glitch. Two means the Short looped.
            if (peak > 4 && time + 1.5 < peak && (state === PLAYER_PLAYING || state === PLAYER_ENDED)) {
              dips += 1;
              if (dips >= 2) return true;
            } else if (time > peak - 0.5) {
              dips = 0;
            }
            if (!Number.isFinite(duration) || duration < 2) return false;
            if (time < 1) return false;
            return time >= duration - 0.35;
          };
          const stalled = () => {
            if (!expecting) return false;
            if (document.hidden) {
              lastMove = performance.now();
              return false;
            }
            return performance.now() - lastMove >= STALL_MS;
          };
          const resume = (current: YoutubePlayer) => {
            const now = performance.now();
            if (resumes >= 2 || now - lastResume < 800) return;
            resumes += 1;
            lastResume = now;
            lastMove = now;
            try {
              current.playVideo();
            } catch {
              /* the player already released the iframe */
            }
          };
          const giveUp = (value: "error" | "stall") => {
            if (settled || leaving) return;
            leaving = true;
            holdFrame();
            if (!cancelled) setPhase("hero");
            finish(shown ? value : "error");
          };
          const watch = () => {
            stopPoll();
            poll = window.setInterval(() => {
              const current = active;
              if (!current || settled || leaving) return;
              try {
                if (atEnd(current)) {
                  backToStill();
                  return;
                }
                const time = current.getCurrentTime();
                if (Number.isFinite(time)) noteProgress(time);
                if (current.getPlayerState() === PLAYER_PAUSED && !document.hidden) resume(current);
              } catch {
                /* the player already released the iframe */
              }
              if (stalled()) giveUp("stall");
            }, 250);
          };
          const startTimer = window.setTimeout(() => {
            if (!shown) giveUp("error");
          }, START_LIMIT);
          active = attachPlayer(
            host,
            next.id,
            {
              autoplay: 1,
              mute: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              loop: 0,
              iv_load_policy: 3,
              fs: 0,
              disablekb: 1,
              playsinline: 1,
              cc_load_policy: 0,
            },
            {
              onReady: (event) => {
                event.target.mute();
                quiet(event.target);
                arm();
                event.target.playVideo();
                watch();
              },
              onStateChange: (event) => {
                if (settled || leaving) return;
                if (event.data === PLAYER_PLAYING) {
                  notePlaying();
                  quiet(event.target);
                  try {
                    noteProgress(event.target.getCurrentTime());
                  } catch {
                    /* time is not readable yet */
                  }
                }
                if (event.data === PLAYER_ENDED || (event.data === PLAYER_PAUSED && atEnd(event.target))) {
                  backToStill();
                  return;
                }
                if (event.data === PLAYER_PAUSED) resume(event.target);
              },
              onError: () => giveUp("error"),
            },
          );
          player.current = active;
        });

        if (shown) {
          setPhase("hero");
          await wait(FADE_MS);
        }
        destroy();
        if (outcome === "error") failed.add(next.id);
        if (cancelled) return;
      }
    };

    void run();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      captionTimers.forEach((id) => window.clearTimeout(id));
      stopPoll();
      destroy();
    };
  }, [shorts]);

  const playing = phase === "short";

  return (
    <>
      <div ref={root} className="absolute inset-0 overflow-hidden bg-field">
        <div className="absolute inset-0 overflow-hidden" aria-hidden={!playing}>
          <div
            className="hero-player absolute left-1/2 top-1/2"
            style={{
              width: box.width || "100%",
              height: box.height || "100%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div ref={mount} className="h-full w-full" />
          </div>
        </div>
        <div className={`hero-fade absolute inset-0 z-[2] ${playing ? "is-hidden" : "is-shown"}`}>
          {still ? (
            <Image
              src={still}
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-field via-field/75 to-field/35" />
        </div>
      </div>
      <div className={`hero-wash pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[68%] bg-gradient-to-t from-field via-field/80 to-transparent ${playing ? "is-quiet" : ""}`} />
      <div className={`hero-lockup relative z-10 ${playing ? "is-quiet" : ""}`}>
        {children}
      </div>
      {phase === "short" ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={muted ? unmute : mute}
          aria-pressed={!muted}
          className="absolute right-5 bottom-6 z-20 sm:right-8"
          onClick={() => {
            const current = player.current;
            if (!current) return;
            if (current.isMuted()) {
              current.unMute();
              setMuted(false);
            } else {
              current.mute();
              setMuted(true);
            }
          }}
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
