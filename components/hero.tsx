"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChalkPlay } from "@/components/chalk-play";
import { Lockup } from "@/components/lockup";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import type { ChannelVideo } from "@/lib/youtube";
import { CHANNEL_URL } from "@/lib/youtube";

type HeroVideo = Pick<ChannelVideo, "id" | "title" | "url" | "thumbnail">;

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: string,
        options: {
          videoId: string;
          host?: string;
          playerVars?: Record<string, number | string>;
          events?: { onReady?: (event: { target: YtPlayer }) => void };
        },
      ) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YtPlayer = {
  mute: () => void;
  playVideo: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
};

export function Hero({
  locale,
  video,
}: {
  locale: Locale;
  video: HeroVideo | null;
}) {
  const t = copy[locale];
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMotionOk(!reduce);
  }, []);

  return (
    <section className="relative min-h-[calc(100svh-4.5rem)] overflow-hidden">
      <div className="hero-media absolute inset-0 bg-field">
        {video ? (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
        ) : null}
        {video && motionOk ? <HeroPlayer id={video.id} /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-field via-field/80 to-field/25" />
      </div>
      <p
        aria-hidden
        className="pointer-events-none absolute top-8 -left-4 font-display text-[30vw] leading-none text-chalk/[0.07]"
      >
        40
      </p>
      <ChalkPlay className="pointer-events-none absolute right-2 bottom-8 z-[1] hidden h-72 w-auto text-chalk sm:block lg:right-8 lg:bottom-12 lg:h-[26rem]" />
      <div className="hero-copy relative z-10 mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-6xl flex-col justify-end px-5 pt-16 pb-10 sm:px-8 sm:pb-14">
        <div className="max-w-xl">
          <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-chalk/80">
            {t.hero.kicker}
          </p>
          <Lockup className="mt-5" />
          <p className="mt-6 max-w-xl font-serif text-xl leading-snug text-chalk md:text-2xl">
            {t.hero.lede}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {video ? (
              <Button asChild>
                <a href={video.url}>{t.hero.watch}</a>
              </Button>
            ) : (
              <Button asChild>
                <a href={CHANNEL_URL}>{t.hero.channel}</a>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href={CHANNEL_URL}>{t.hero.channel}</a>
            </Button>
          </div>
          <p className="mt-4 max-w-md font-serif text-sm text-chalk/80">
            {video ? t.hero.opening : t.hero.unavailable}
          </p>
        </div>
      </div>
    </section>
  );
}

function HeroPlayer({ id }: { id: string }) {
  useEffect(() => {
    let player: YtPlayer | undefined;
    let timer = 0;
    let cancelled = false;

    const start = () => {
      if (cancelled || !window.YT?.Player) return;
      player = new window.YT.Player("baw-hero-player", {
        videoId: id,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
          },
        },
      });
      timer = window.setInterval(() => {
        if (!player || typeof player.getCurrentTime !== "function") return;
        if (player.getCurrentTime() >= 12) player.seekTo(0, true);
      }, 500);
    };

    if (window.YT?.Player) start();
    else {
      window.onYouTubeIframeAPIReady = start;
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
    }

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      player?.destroy();
    };
  }, [id]);

  return (
    <div className="hero-frame absolute inset-0">
      <div id="baw-hero-player" />
    </div>
  );
}
