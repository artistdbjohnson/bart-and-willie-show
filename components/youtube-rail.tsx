import Image from "next/image";
import { Rail } from "@/components/rail";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { copy, formatViews, formatWhen } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import { CHANNEL_URL, type ChannelVideo } from "@/lib/youtube";

export function YouTubeRail({
  locale,
  videos,
  feedOk,
  nested = false,
}: {
  locale: Locale;
  videos: ChannelVideo[];
  feedOk: boolean;
  nested?: boolean;
}) {
  const t = copy[locale];
  const body = (
    <>
      {nested ? (
        <div>
          <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">
            {t.channel.kicker}
          </p>
          <h2 className="mt-2 font-display text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.86] tracking-tight">
            {t.channel.title}
          </h2>
          <p className="mt-3 max-w-xl font-serif text-base text-chalk/85">{t.channel.lede}</p>
        </div>
      ) : (
        <SectionHeading kicker={t.channel.kicker} title={t.channel.title} lede={t.channel.lede} />
      )}
      <div className={nested ? "mt-6" : "mt-10"}>
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
            <Rail label={t.channel.region} previous={t.channel.previous} next={t.channel.next}>
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  className="group w-[78%] shrink-0 snap-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk sm:w-[320px]"
                >
                  <span className="relative block aspect-video overflow-hidden bg-field-bright/25">
                    <Image
                      src={video.thumbnail}
                      alt=""
                      fill
                      sizes="320px"
                      className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
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
                </a>
              ))}
            </Rail>
          )}
      </div>
    </>
  );

  if (nested) {
    return (
      <article className="flex h-full min-h-0 flex-col bg-field">
        <div className="h-1 shrink-0 bg-signal" />
        <div className="min-h-0 flex-1 overflow-auto px-5 py-6 sm:px-8 sm:py-8">{body}</div>
      </article>
    );
  }

  return (
    <section className="border-t border-chalk/15">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">{body}</div>
    </section>
  );
}
