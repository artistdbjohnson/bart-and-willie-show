import { FeedNotice } from "@/components/feed-notice";
import { IntroOnce } from "@/components/intro-once";
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
    <section data-hero className="section-snap relative -mt-[var(--nav-clear)] overflow-hidden bg-field pt-[var(--nav-clear)]">
      <IntroOnce />
      <div className="mx-auto grid max-w-7xl gap-8 px-0 pt-4 pb-12 sm:px-8 sm:pt-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pb-20">
        <figure className="relative m-0 aspect-video w-full overflow-hidden bg-ink sm:border sm:border-chalk/15 sm:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url(/hero/intro-poster.jpg)" }} aria-hidden="true" />
          <video
            className="hero-intro absolute inset-0 h-full w-full object-contain"
            src="/hero/intro.mp4"
            poster="/hero/intro-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={t.hero.stillAlt}
          />
        </figure>
        <div className="hero-copy relative z-10 px-5 sm:px-0">
          <div className="max-w-xl lg:max-w-2xl">
            <p className="hero-quiet font-ui text-[11px] uppercase tracking-[0.22em] text-chalk/80">
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
            <div className="hero-actions hero-enter hero-hold hero-late mt-8 grid w-full max-w-sm grid-cols-1 gap-3 sm:inline-grid sm:w-auto sm:max-w-none sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none">
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
                <Button asChild variant="outline" className="min-w-[13.5rem] border border-chalk bg-transparent text-chalk hover:border-signal hover:bg-transparent hover:text-signal">
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
      </div>
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
