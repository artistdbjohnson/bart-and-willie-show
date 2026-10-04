"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import type { InstagramPost } from "@/lib/instagram";

const SPEED = 28;

export function ProfileTicker({
  posts,
  previous,
  next,
  pause,
  play,
  region,
  close,
  mute,
  unmute,
  thePost,
  postLabel,
  clipLabel,
}: {
  posts: InstagramPost[];
  previous: string;
  next: string;
  pause: string;
  play: string;
  region: string;
  close: string;
  mute: string;
  unmute: string;
  thePost: string;
  postLabel: string;
  clipLabel: string;
}) {
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const setWidth = useRef(0);
  const offset = useRef(0);
  const paused = useRef(false);
  const locked = useRef(false);
  const nudging = useRef(false);
  const moved = useRef(false);
  const drag = useRef<{ x: number; offset: number } | null>(null);
  const [lockOn, setLockOn] = useState(false);
  const [open, setOpen] = useState<InstagramPost | null>(null);

  useEffect(() => {
    const measure = () => {
      const node = track.current?.querySelector<HTMLElement>("[data-ticker-set]");
      if (!node) return;
      const gap = 12;
      setWidth.current = node.offsetWidth + gap;
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (view.current) observer.observe(view.current);
    return () => observer.disconnect();
  }, [posts]);

  useEffect(() => {
    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    let frame = 0;
    let last = performance.now();
    const apply = () => {
      const loop = setWidth.current;
      if (loop > 0) offset.current = ((offset.current % loop) + loop) % loop;
      if (track.current) {
        track.current.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
      }
    };
    const tick = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      if (!reduced() && !paused.current && !locked.current && !drag.current && !nudging.current) {
        offset.current += (dt * SPEED) / 1000;
        apply();
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function applyOffset(value: number) {
    const loop = setWidth.current;
    offset.current = loop > 0 ? ((value % loop) + loop) % loop : value;
    if (track.current) track.current.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
  }

  function nudge(direction: number) {
    const card = (view.current?.clientWidth ?? 320) * 0.78 + 12;
    const from = offset.current;
    const to = from + direction * card;
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    if (reduced) {
      applyOffset(to);
      return;
    }
    nudging.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 560);
      const eased = 1 - (1 - t) ** 3;
      applyOffset(from + (to - from) * eased);
      if (t < 1) window.requestAnimationFrame(step);
      else nudging.current = false;
    };
    window.requestAnimationFrame(step);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    paused.current = true;
    moved.current = false;
    drag.current = { x: event.clientX, offset: offset.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > 6) moved.current = true;
    applyOffset(start.offset - dx);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const dragged = moved.current;
    moved.current = false;
    drag.current = null;
    paused.current = false;
    if (dragged) return;
    const id = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-post]")?.getAttribute("data-post");
    const post = posts.find((item) => item.id === id);
    if (post) setOpen(post);
  }

  const cards = posts.map((post) => (
    <Thumbnail
      key={post.id}
      post={post}
      postLabel={postLabel}
      clipLabel={clipLabel}
      onOpen={() => {
        if (moved.current) {
          moved.current = false;
          return;
        }
        setOpen(post);
      }}
    />
  ));

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-pressed={lockOn}
          aria-label={lockOn ? play : pause}
          onClick={() => {
            locked.current = !locked.current;
            setLockOn(locked.current);
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
        className="ticker-view -mx-5 overflow-hidden px-5 sm:mx-0 sm:px-0"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={track}
          className="flex w-max gap-3"
          aria-label={region}
          role="list"
        >
          <div data-ticker-set className="flex gap-3">
            {cards}
          </div>
          <div className="flex gap-3" aria-hidden="true">
            {posts.map((post) => (
              <Thumbnail
                key={`${post.id}-copy`}
                post={post}
                postLabel={postLabel}
                clipLabel={clipLabel}
                onOpen={() => {
                  if (moved.current) {
                    moved.current = false;
                    return;
                  }
                  setOpen(post);
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {open ? (
        <PostView
          post={open}
          close={close}
          mute={mute}
          unmute={unmute}
          pause={pause}
          play={play}
          thePost={thePost}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}

function Thumbnail({
  post,
  postLabel,
  clipLabel,
  onOpen,
}: {
  post: InstagramPost;
  postLabel: string;
  clipLabel: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      role="listitem"
      data-post={post.id}
      className="w-[78cqi] shrink-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk"
      onClick={onOpen}
    >
      <span className="relative block aspect-square overflow-hidden bg-field-bright/25">
        {/* Instagram CDN links expire, so the image is loaded through this site. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/ig-image?src=${encodeURIComponent(post.imageUrl)}`}
          alt={post.caption ? post.caption.slice(0, 140) : ""}
          width={640}
          height={640}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </span>
      <span className="mt-3 hidden font-ui text-[0.66rem] uppercase tracking-[0.16em] text-quiet sm:block">
        {post.kind === "clip" ? clipLabel : postLabel}
      </span>
      {post.caption ? (
        <span className="mt-2 line-clamp-3 hidden font-serif text-base leading-snug sm:block">
          {post.caption}
        </span>
      ) : null}
    </button>
  );
}

function PostView({
  post,
  close,
  mute,
  unmute,
  pause,
  play,
  thePost,
  onClose,
}: {
  post: InstagramPost;
  close: string;
  mute: string;
  unmute: string;
  pause: string;
  play: string;
  thePost: string;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(Boolean(post.videoUrl));
  const [failed, setFailed] = useState(false);
  const showVideo = Boolean(post.videoUrl) && !failed;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.muted = muted;
  }, [muted]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={post.caption?.slice(0, 80) || thePost}
      className="fixed inset-0 z-[70] flex flex-col bg-field"
    >
      <div className="flex items-center justify-end gap-2 px-4 py-3 sm:px-6">
        {showVideo ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={playing ? pause : play}
              onClick={() => {
                const node = video.current;
                if (!node) return;
                if (node.paused) {
                  void node.play();
                  setPlaying(true);
                } else {
                  node.pause();
                  setPlaying(false);
                }
              }}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={muted ? unmute : mute}
              aria-pressed={!muted}
              onClick={() => setMuted((value) => !value)}
            >
              {muted ? <MuteIcon /> : <SoundIcon />}
            </Button>
          </>
        ) : null}
        <Button ref={closeButton} type="button" variant="outline" size="icon" aria-label={close} onClick={onClose}>
          <CloseIcon />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-8 sm:px-10">
        {showVideo ? (
          <video
            ref={video}
            src={`/api/ig-media?src=${encodeURIComponent(post.videoUrl ?? "")}`}
            poster={`/api/ig-image?src=${encodeURIComponent(post.imageUrl)}`}
            className="max-h-full max-w-full bg-ink"
            autoPlay
            muted
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex max-h-full max-w-3xl flex-col items-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/ig-image?src=${encodeURIComponent(post.imageUrl)}`}
              alt={post.caption ? post.caption.slice(0, 140) : ""}
              className="max-h-[70svh] w-auto max-w-full object-contain"
            />
            <Button asChild variant="outline">
              <a href={post.permalink}>{thePost}</a>
            </Button>
          </div>
        )}
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 stroke-current" aria-hidden="true">
      <path d="M2 2l8 8M10 2L2 10" fill="none" strokeWidth="1.4" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5 fill-current" aria-hidden="true">
      <path d="M1.5 4.2h2.2L6.4 2v8L3.7 7.8H1.5zM8.2 4.4l2.3 2.3M10.5 4.4L8.2 6.7" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5 fill-current" aria-hidden="true">
      <path d="M1.5 4.2h2.2L6.4 2v8L3.7 7.8H1.5z" />
      <path d="M8 4.2a2.6 2.6 0 0 1 0 3.6M9.4 3a4.2 4.2 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
