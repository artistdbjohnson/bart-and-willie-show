"use client";

import { useEffect, useRef, useState } from "react";
import { Marquee } from "@/components/marquee";
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
  fill = false,
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
  fill?: boolean;
}) {
  const [open, setOpen] = useState<InstagramPost | null>(null);

  return (
    <div className={fill ? "flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col" : undefined}>
      <Marquee label={region} previous={previous} next={next} pause={pause} play={play} fill={fill} pages>
        {posts.map((post) => (
          <Thumbnail
            key={post.id}
            post={post}
            postLabel={postLabel}
            clipLabel={clipLabel}
            fill={fill}
            onOpen={() => setOpen(post)}
          />
        ))}
      </Marquee>
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
  fill,
  onOpen,
}: {
  post: InstagramPost;
  postLabel: string;
  clipLabel: string;
  fill: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      role="listitem"
      data-post={post.id}
      className={
        fill
          ? "profile-tile flex h-full min-h-0 w-full flex-col text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk"
          : "w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk"
      }
      onClick={onOpen}
    >
      <span className={fill ? "profile-photo flex min-h-0 flex-1 items-center justify-center" : "flex w-full items-center justify-center"}>
        {/* Instagram CDN links expire, so the image is loaded through this site. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/ig-image?src=${encodeURIComponent(post.imageUrl)}`}
          alt=""
          width={post.width ?? undefined}
          height={post.height ?? undefined}
          draggable={false}
          className={
            fill
              ? "h-auto w-auto max-h-full max-w-full object-contain"
              : "h-auto max-h-[min(40svh,22rem)] w-auto max-w-full object-contain"
          }
        />
      </span>
      <span className="mt-3 shrink-0 font-ui text-[0.66rem] uppercase tracking-[0.16em] text-quiet">
        {post.kind === "clip" ? clipLabel : postLabel}
      </span>
      {post.caption ? (
        <span className="mt-2 shrink-0 font-serif text-base leading-snug break-words">{post.caption}</span>
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
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 pb-8 sm:px-10">
        {showVideo ? (
          <video
            ref={video}
            src={`/api/ig-media?src=${encodeURIComponent(post.videoUrl ?? "")}`}
            poster={`/api/ig-image?src=${encodeURIComponent(post.imageUrl)}`}
            className="max-h-[70svh] max-w-full object-contain"
            autoPlay
            muted
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex max-h-full max-w-3xl flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/ig-image?src=${encodeURIComponent(post.imageUrl)}`}
              alt={post.caption ? post.caption.slice(0, 140) : ""}
              className="max-h-[62svh] w-auto max-w-full object-contain"
            />
            <Button asChild variant="outline">
              <a href={post.permalink}>{thePost}</a>
            </Button>
          </div>
        )}
        {post.caption ? (
          <p className="max-w-xl text-center font-serif text-base leading-snug break-words">{post.caption}</p>
        ) : null}
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
