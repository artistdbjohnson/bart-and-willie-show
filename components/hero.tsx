import { ChalkPlay } from "@/components/chalk-play";
import { FeedNotice } from "@/components/feed-notice";
import { HeroCycle } from "@/components/hero-cycle";
import { Lockup } from "@/components/lockup";
import { Button } from "@/components/ui/button";
import { HeroWatch } from "@/components/watch-dialog";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import { CHANNEL_URL, CHANNEL_VIDEOS_URL, HERO_STILL, type ShortBeat } from "@/lib/youtube";

type HeroVideo = { id: string; title: string; url: string; thumbnail: string };

export function Hero({
  locale,
  video,
  still,
  shorts,
  degraded = false,
  reason,
}: {
  locale: Locale;
  video: HeroVideo | null;
  still?: string | null;
  shorts: ShortBeat[];
  degraded?: boolean;
  reason?: string;
}) {
  const t = copy[locale];
  const splash = still || HERO_STILL;
  const watch = video?.url ?? CHANNEL_VIDEOS_URL;

  return (
    <section data-hero className="section-snap relative -mt-[var(--nav-clear)] min-h-[100svh] overflow-hidden">
      <HeroCycle still={splash} shorts={shorts} mute={t.hero.mute} unmute={t.hero.unmute}>
        <p
          aria-hidden
          className="hero-quiet pointer-events-none absolute top-8 -left-4 font-display text-[clamp(6.5rem,28vw,10rem)] leading-none text-chalk/[0.07]"
        >
          40
        </p>
        <ChalkPlay className="hero-quiet pointer-events-none absolute right-2 bottom-8 z-[1] hidden h-72 w-auto text-chalk sm:block lg:right-8 lg:bottom-12 lg:h-80" />
        <div className="hero-copy relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pt-28 pb-10 sm:px-8 sm:pb-14">
          <div className="max-w-xl lg:max-w-2xl">
            <p className="hero-quiet font-ui text-[0.72rem] uppercase tracking-[0.22em] text-chalk/80">
              {t.hero.kicker}
            </p>
            <Lockup enter className="hero-quiet mt-5" />
            <div className="hero-quiet mt-6 max-w-xl">
              {t.hero.intro.map((sentence, index) => (
                <p
                  key={sentence}
                  className={index === 0 ? "hero-enter hero-sentence font-serif text-lg leading-snug text-chalk md:text-xl" : "hero-enter hero-sentence mt-3 font-serif text-lg leading-snug text-chalk md:text-xl"}
                  style={{ animationDelay: `${0.48 + index * 0.16}s` }}
                >
                  {sentence}
                </p>
              ))}
              <span className="hero-rule" aria-hidden="true" />
            </div>
            <div className="hero-actions hero-enter hero-hold hero-late mt-8 flex flex-wrap items-center gap-3">
              {video ? (
                <HeroWatch videoId={video.id} title={video.title} poster={video.thumbnail || splash}>
                  <PlayMark />
                  {t.hero.watch}
                </HeroWatch>
              ) : (
                <Button asChild>
                  <a href={watch}>
                    <PlayMark />
                    {t.hero.watch}
                  </a>
                </Button>
              )}
              {video ? (
                <Button asChild variant="outline" className="border-chalk/55 bg-ink text-chalk hover:border-chalk hover:bg-ink hover:text-signal">
                  <a href={CHANNEL_URL}>{t.hero.channel}</a>
                </Button>
              ) : null}
            </div>
            <FeedNotice degraded={degraded} reason={reason} />
            {video ? (
              <p className="hero-quiet mt-4 max-w-md font-serif text-sm text-chalk/80">{t.hero.opening}</p>
            ) : null}
            <nav className="hero-quiet hero-enter hero-late mt-5" aria-label={t.hero.follow}>
              <p className="font-ui text-[0.68rem] uppercase tracking-[0.18em] text-chalk/80">{t.hero.follow}</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                {t.hero.follows.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="font-ui text-[0.78rem] text-chalk/85 transition-colors duration-200 hover:text-signal">
                      <span className="uppercase tracking-[0.14em] text-signal">{item.label}</span>{" "}
                      <span>{item.handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
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
