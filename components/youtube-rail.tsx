import Image from "next/image";
import { Marquee } from "@/components/marquee";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { copy, formatViews, formatWhen } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import { WatchTarget } from "@/components/watch-dialog";
import { CHANNEL_URL, type ChannelVideo } from "@/lib/youtube";

export function YouTubeRail({
  locale,
  videos,
  feedOk,
  nested = false,
  flow = false,
}: {
  locale: Locale;
  videos: ChannelVideo[];
  feedOk: boolean;
  nested?: boolean;
  flow?: boolean;
}) {
  const t = copy[locale];
  const compact = nested || flow;
  const body = (
    <>
      {compact ? (
        <div>
          <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">
            {t.channel.kicker}
          </p>
          <h2 className="mt-2 font-serif text-[clamp(1.6rem,3.4vw,2.4rem)] leading-tight">
            {t.channel.title}
          </h2>
          <p className="mt-2 max-w-xl font-serif text-base text-chalk/85">{t.channel.lede}</p>
        </div>
      ) : (
        <SectionHeading kicker={t.channel.kicker} title={t.channel.title} lede={t.channel.lede} />
      )}
      <div className={compact ? "mt-6" : "mt-10"}>
        {!feedOk || videos.length === 0 ? (
            <div className="border border-dashed border-chalk/35 px-6 py-10">
              <p className="max-w-xl font-serif text-lg">{t.channel.empty}</p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <a href={CHANNEL_URL}>{copy[locale].hero.channel}</a>
                </Button>
              </div>
            </div>
          ) : (
            <Marquee
              label={t.channel.region}
              previous={t.channel.previous}
              next={t.channel.next}
              pause={t.channel.pause}
              play={t.channel.play}
            >
              {videos.map((video) => (
                <WatchTarget
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  kind={video.kind}
                  poster={video.thumbnail}
                  className="group w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk"
                >
                  <span className="relative block aspect-video overflow-hidden bg-ink">
                    <Image
                      src={video.thumbnail}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 24rem, 100vw"
                      className="object-contain"
                    />
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-3 font-ui text-[0.66rem] uppercase tracking-[0.16em] text-quiet">
                    <span>{video.kind === "short" ? t.episodes.short : t.episodes.episode}</span>
                    <span>{formatWhen(video.published, locale)}</span>
                  </span>
                  <span className="mt-2 block font-serif text-lg leading-snug">{video.title}</span>
                  {video.views !== null ? (
                    <span className="mt-2 block font-ui text-[0.66rem] uppercase tracking-[0.14em] text-quiet">
                      {formatViews(video.views, locale)} {t.channel.views}
                    </span>
                  ) : null}
                </WatchTarget>
              ))}
            </Marquee>
          )}
      </div>
    </>
  );

  if (flow) {
    return (
      <section className="border-t border-chalk/15 bg-field" aria-label={t.channel.title}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">{body}</div>
      </section>
    );
  }

  if (nested) {
    return (
      <article className="flex h-full min-h-0 w-full min-w-0 flex-col">
        <div className="py-4">{body}</div>
      </article>
    );
  }

  return (
    <section className="border-t border-chalk/15">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">{body}</div>
    </section>
  );
}
