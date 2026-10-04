import Image from "next/image";
import { CardNest } from "@/components/card-nest";
import { InstagramRail } from "@/components/instagram-rail";
import { Button, buttonVariants } from "@/components/ui/button";
import { copy, formatWhen } from "@/lib/copy";
import type { InstagramFeed } from "@/lib/instagram";
import type { Locale } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { WatchTarget } from "@/components/watch-dialog";
import { CHANNEL_URL, fullEpisodes, isOct2Show, type ChannelVideo } from "@/lib/youtube";

export function LatestNest({
  locale,
  videos,
  feedOk,
  instagram,
}: {
  locale: Locale;
  videos: ChannelVideo[];
  feedOk: boolean;
  instagram: InstagramFeed;
}) {
  const t = copy[locale];
  const episodes = fullEpisodes(videos).slice(0, 6);
  const [lead, ...rest] = episodes;
  const hasLead = Boolean(feedOk && lead);

  const episodeSheets = [
    hasLead && lead ? (
      <EpisodeSheet key={lead.id} locale={locale} video={lead} featured />
    ) : (
      <EmptySheet key="empty" locale={locale} />
    ),
    ...rest.map((video) => <EpisodeSheet key={video.id} locale={locale} video={video} />),
  ];

  // Newest full episodes, then the profile. The channel is a link on the
  // hero and the episodes page, not a sheet in this stack.
  const cards = [
    ...episodeSheets,
    <InstagramRail key="instagram" locale={locale} feed={instagram} nested />,
  ];

  return (
    <section id="episodes" aria-label={t.episodes.title} className="border-t border-chalk/15 bg-field">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="stack-head">
          <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">{t.episodes.kicker}</p>
          <h2 className="font-display text-[clamp(2rem,5vw,2.75rem)] leading-none">{t.episodes.title}</h2>
        </div>
        <CardNest>{cards}</CardNest>
      </div>
    </section>
  );
}

function EpisodeSheet({
  locale,
  video,
  featured = false,
}: {
  locale: Locale;
  video: ChannelVideo;
  featured?: boolean;
}) {
  const t = copy[locale];
  const oct2 = isOct2Show(video);
  const blurb = oct2 ? t.episodes.featuredLine : "";

  return (
    <article className="episode-sheet flex h-full min-h-0 flex-col">
      <WatchTarget
        id={video.id}
        title={video.title}
        kind="video"
        poster={video.thumbnail}
        className="sheet-link group flex min-h-0 flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-chalk"
      >
        <span className="sheet-lead sheet-copy shrink-0 pt-4 pb-3">
          <span className="font-ui text-[0.68rem] uppercase tracking-[0.16em] text-quiet">
            {featured ? `${t.episodes.featured} · ` : null}
            {formatWhen(video.published, locale)}
          </span>
          <span className="mt-2 line-clamp-3 block font-serif text-[clamp(1.35rem,3.2vw,2.15rem)] leading-tight">
            {video.title}
          </span>
        </span>
        <span className="sheet-media relative mt-3 block aspect-video overflow-hidden bg-ink">
          <Image
            src={video.thumbnail}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 72rem, 100vw"
            className="object-contain"
          />
        </span>
        {featured || oct2 ? (
          <span className="sheet-extra shrink-0 pt-3 pb-4">
            {blurb ? (
              <span className="block font-serif text-base leading-relaxed text-chalk/85">
                {blurb}
              </span>
            ) : null}
            <span
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-4 group-hover:border-chalk group-hover:bg-chalk/10",
              )}
            >
              {t.episodes.open}
            </span>
          </span>
        ) : null}
      </WatchTarget>
    </article>
  );
}

function EmptySheet({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <article className="flex min-h-0 flex-col">
      <div className="flex flex-1 flex-col justify-end py-8">
        <p className="max-w-xl font-serif text-lg leading-relaxed">{t.episodes.empty}</p>
        <div className="mt-5">
          <Button asChild variant="outline">
            <a href={CHANNEL_URL}>{t.episodes.channel}</a>
          </Button>
        </div>
      </div>
    </article>
  );
}
