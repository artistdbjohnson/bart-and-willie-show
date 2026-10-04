import Image from "next/image";
import { ChalkPlay } from "@/components/chalk-play";
import { Lockup } from "@/components/lockup";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import type { ChannelVideo } from "@/lib/youtube";
import { CHANNEL_URL } from "@/lib/youtube";

type HeroVideo = Pick<ChannelVideo, "id" | "title" | "url" | "thumbnail">;

async function titleFrame(video: HeroVideo) {
  const max = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
  try {
    const response = await fetch(max, { method: "HEAD", next: { revalidate: 1800 } });
    if (response.ok && response.headers.get("content-type")?.includes("image")) return max;
  } catch {
    /* the feed thumbnail is the frame YouTube already published */
  }
  return video.thumbnail;
}

export async function Hero({
  locale,
  video,
}: {
  locale: Locale;
  video: HeroVideo | null;
}) {
  const t = copy[locale];
  const watch = video?.url ?? CHANNEL_URL;
  const still = video ? await titleFrame(video) : null;

  return (
    <section className="relative min-h-[calc(100svh-4.5rem)] overflow-hidden">
      <div className="hero-media absolute inset-0 bg-field">
        {still ? (
          <Image
            src={still}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-field via-field/75 to-field/35" />
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
            <Button asChild>
              <a href={watch}>
                <PlayMark />
                {video ? t.hero.watch : t.hero.channel}
              </a>
            </Button>
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
