"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { copy, formatWhen } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import { useWatch } from "@/components/watch-dialog";
import { CHANNEL_URL, fullEpisodes, isOct2Show, type ChannelVideo } from "@/lib/youtube";
import { cn } from "@/lib/utils";

export function EpisodeStage({
  locale,
  videos,
  feedOk,
}: {
  locale: Locale;
  videos: ChannelVideo[];
  feedOk: boolean;
}) {
  const t = copy[locale];
  const openWatch = useWatch();
  const episodes = useMemo(() => fullEpisodes(videos).slice(0, 6), [videos]);
  const [activeId, setActiveId] = useState(episodes[0]?.id ?? "");
  const active = episodes.find((video) => video.id === activeId) ?? episodes[0];

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
      <SectionHeading kicker={t.episodes.kicker} title={t.episodes.title} />
      {!feedOk || !active ? (
        <EmptyState message={t.episodes.empty} href={CHANNEL_URL} action={t.episodes.channel} />
      ) : (
        <>
          <div className="mt-12 grid items-end gap-8 lg:grid-cols-12">
            <div className="bg-ink lg:col-span-7">
              <div className="relative aspect-video">
                <iframe
                  key={active.id}
                  className="player-in absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${active.id}?rel=0&modestbranding=1`}
                  title={active.title}
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="lg:col-span-5">
              <p className="font-ui text-[0.68rem] uppercase tracking-[0.2em] text-quiet">
                {t.episodes.featured}
              </p>
              <h3 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">{active.title}</h3>
              <p className="mt-3 font-ui text-[0.68rem] uppercase tracking-[0.16em] text-quiet">
                {formatWhen(active.published, locale)}
              </p>
              {isOct2Show(active) ? (
                <p className="mt-4 font-serif text-lg leading-relaxed text-chalk/80">
                  {t.episodes.featuredLine}
                </p>
              ) : null}
              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    openWatch({
                      id: active.id,
                      title: active.title,
                      kind: "video",
                      poster: active.thumbnail,
                    })
                  }
                >
                  {t.episodes.open}
                </Button>
              </div>
            </div>
          </div>
          {episodes.length > 1 ? (
            <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {episodes.map((video) => {
                const selected = video.id === active.id;
                return (
                  <li key={video.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(video.id)}
                      aria-pressed={selected}
                      className={cn(
                        "group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk",
                        selected && "outline outline-1 outline-signal outline-offset-8",
                      )}
                    >
                      <span className="relative block aspect-video overflow-hidden bg-field-bright/30">
                        <Image
                          src={video.thumbnail}
                          alt=""
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                          className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
                        />
                      </span>
                      <span className="mt-3 block font-ui text-[0.68rem] uppercase tracking-[0.16em] text-quiet">
                        {formatWhen(video.published, locale)}
                      </span>
                      <span className="mt-2 block font-serif text-xl leading-snug">{video.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-10 font-serif text-chalk/85">{t.episodes.restEmpty}</p>
          )}
        </>
      )}
    </section>
  );
}

function EmptyState({
  message,
  href,
  action,
}: {
  message: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mt-10 border border-dashed border-chalk/35 px-6 py-10">
      <p className="max-w-xl font-serif text-lg leading-relaxed">{message}</p>
      <div className="mt-6">
        <Button asChild variant="outline">
          <a href={href}>{action}</a>
        </Button>
      </div>
    </div>
  );
}

export { EmptyState };
