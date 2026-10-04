import { ChalkPlay } from "@/components/chalk-play";
import { HeroCycle } from "@/components/hero-cycle";
import { Lockup } from "@/components/lockup";
import { Button } from "@/components/ui/button";
import { HeroWatch } from "@/components/watch-dialog";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import { CHANNEL_URL, type ShortBeat } from "@/lib/youtube";

type HeroVideo = { id: string; title: string; url: string; thumbnail: string };

export function Hero({
  locale,
  video,
  still,
  shorts,
}: {
  locale: Locale;
  video: HeroVideo | null;
  still: string | null;
  shorts: ShortBeat[];
}) {
  const t = copy[locale];
  const watch = video?.url ?? CHANNEL_URL;

  return (
    <section className="relative min-h-[calc(100svh-4.5rem)] overflow-hidden">
      <HeroCycle still={still} shorts={shorts} mute={t.hero.mute} unmute={t.hero.unmute}>
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
                <HeroWatch videoId={video.id} title={video.title} poster={video.thumbnail}>
                  <PlayMark />
                  {t.hero.watch}
                </HeroWatch>
              ) : (
                <Button asChild>
                  <a href={watch}>
                    <PlayMark />
                    {t.hero.channel}
                  </a>
                </Button>
              )}
              {video ? (
                <Button asChild variant="outline">
                  <a href={CHANNEL_URL}>{t.hero.channel}</a>
                </Button>
              ) : null}
            </div>
            <p className="mt-4 max-w-md font-serif text-sm text-chalk/80">
              {video ? t.hero.opening : t.hero.unavailable}
            </p>
          </div>
        </div>
      </HeroCycle>
    </section>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 fill-current" aria-hidden="true">
      <path d="M3 1.4v9.2l7.4-4.6z" />
    </svg>
  );
}
