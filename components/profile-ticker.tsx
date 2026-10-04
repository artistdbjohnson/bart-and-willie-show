"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import type { InstagramPost } from "@/lib/instagram";

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
  const stride = useRef(0);
  const offset = useRef(0);
  const paused = useRef(false);
  const locked = useRef(false);
  const nudging = useRef(false);
  const moved = useRef(false);
  const holdUntil = useRef(0);
  const anim = useRef<{ from: number; to: number; start: number } | null>(null);
  const drag = useRef<{ x: number; y: number; offset: number; horizontal: boolean; vertical: boolean } | null>(null);
  const [lockOn, setLockOn] = useState(false);
  const [open, setOpen] = useState<InstagramPost | null>(null);

  useEffect(() => {
    const measure = () => {
      const node = track.current?.querySelector<HTMLElement>("[data-ticker-set]");
      if (!node || posts.length === 0) return;
      const styles = getComputedStyle(node);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 12;
      setWidth.current = node.offsetWidth + gap;
      stride.current = setWidth.current / posts.length;
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
    holdUntil.current = performance.now() + 3600;
    const paint = () => {
      if (track.current) {
        track.current.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
      }
    };
    const tick = (now: number) => {
      const motion = anim.current;
      if (motion) {
        const progress = Math.min(1, (now - motion.start) / 560);
        const eased = 1 - (1 - progress) ** 3;
        offset.current = motion.from + (motion.to - motion.from) * eased;
        if (progress === 1) {
          anim.current = null;
          nudging.current = false;
          const loop = setWidth.current;
          if (loop > 0 && offset.current >= loop - 0.5) offset.current -= loop;
          holdUntil.current = now + 3600;
        }
        paint();
      } else if (
        !reduced() &&
        !paused.current &&
        !locked.current &&
        !drag.current &&
        stride.current > 0 &&
        now >= holdUntil.current
      ) {
        const from = offset.current;
        const to = from + stride.current;
        anim.current = { from, to, start: now };
        nudging.current = true;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function paintOffset(value: number) {
    const loop = setWidth.current;
    offset.current = loop > 0 ? ((value % loop) + loop) % loop : value;
    if (track.current) track.current.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
  }

  function nudge(direction: number) {
    const step = stride.current || (view.current?.clientWidth ?? 320);
    const loop = setWidth.current;
    anim.current = null;
    nudging.current = false;
    let from = offset.current;
    let to = from + direction * step;
    if (loop > 0 && to < 0) {
      from += loop;
      to += loop;
      offset.current = from;
    }
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    holdUntil.current = performance.now() + 3600;
    if (reduced) {
      paintOffset(to);
      return;
    }
    nudging.current = true;
    anim.current = { from, to, start: performance.now() };
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    paused.current = true;
    moved.current = false;
    anim.current = null;
    nudging.current = false;
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
        return;
      }
      if (Math.abs(dx) <= 6 || Math.abs(dx) < Math.abs(dy)) return;
      start.horizontal = true;
      moved.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    paintOffset(start.offset - (event.clientX - start.x));
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const wasDrag = drag.current;
    const dragged = moved.current || Boolean(wasDrag?.horizontal) || Boolean(wasDrag?.vertical);
    drag.current = null;
    if (wasDrag?.horizontal && stride.current > 0) {
      paintOffset(Math.round(offset.current / stride.current) * stride.current);
    }
    paused.current = false;
    holdUntil.current = performance.now() + 3600;
    if (dragged) {
      const block = (click: Event) => {
        click.preventDefault();
        click.stopPropagation();
        view.current?.removeEventListener("click", block, true);
      };
      view.current?.addEventListener("click", block, true);
      moved.current = false;
      return;
    }
    moved.current = false;
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
        className="ticker-view"
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
      className="w-[100cqi] shrink-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk sm:w-[calc((100cqi-0.75rem)/2)] lg:w-[calc((100cqi-1.5rem)/3)]"
      onClick={onOpen}
    >
      <span className="flex h-[min(42svh,28rem)] w-full items-center justify-center">
        {/* Instagram CDN links expire, so the image is loaded through this site. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/ig-image?src=${encodeURIComponent(post.imageUrl)}`}
          alt=""
          width={post.width ?? undefined}
          height={post.height ?? undefined}
          draggable={false}
          className="max-h-full max-w-full object-contain"
        />
      </span>
      <span className="mt-3 font-ui text-[0.66rem] uppercase tracking-[0.16em] text-quiet">
        {post.kind === "clip" ? clipLabel : postLabel}
      </span>
      {post.caption ? (
        <span className="mt-2 line-clamp-3 font-serif text-base leading-snug">{post.caption}</span>
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
      className="watch-layer is-open fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
    >
      <button type="button" className="watch-backdrop absolute inset-0" aria-label={close} onClick={onClose} />
      <div className="watch-panel relative z-[1] flex max-h-full w-full max-w-3xl flex-col">
      <div className="mb-3 flex items-center justify-end gap-2">
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
            className="max-h-[82svh] max-w-full object-contain"
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
