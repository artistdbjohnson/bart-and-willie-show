import Image from "next/image";
import { CardNest } from "@/components/card-nest";
import { InstagramRail } from "@/components/instagram-rail";
import { Button, buttonVariants } from "@/components/ui/button";
import { YouTubeRail } from "@/components/youtube-rail";
import { copy, formatWhen } from "@/lib/copy";
import type { InstagramFeed } from "@/lib/instagram";
import type { Locale } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { CHANNEL_URL, excerpt, fullEpisodes, type ChannelVideo } from "@/lib/youtube";

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
  const episodes = fullEpisodes(videos);
  const [lead, ...rest] = episodes;
  const hasLead = Boolean(feedOk && lead);

  const cards = [
    hasLead && lead ? (
      <EpisodeSheet key={lead.id} locale={locale} video={lead} featured />
    ) : (
      <EmptySheet key="empty" locale={locale} />
    ),
    ...rest.map((video) => <EpisodeSheet key={video.id} locale={locale} video={video} />),
    <YouTubeRail key="youtube" locale={locale} videos={videos} feedOk={feedOk} nested />,
    <InstagramRail key="instagram" locale={locale} feed={instagram} nested />,
  ];

  return (
    <section id="episodes" aria-label={t.episodes.title} className="border-t border-chalk/15 px-5 sm:px-8">
      <div className="stack-head">
        <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">{t.episodes.kicker}</p>
        <h2 className="font-display text-[clamp(2rem,5vw,2.75rem)] leading-none">{t.episodes.title}</h2>
      </div>
      <CardNest>{cards}</CardNest>
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
  const blurb = featured ? excerpt(video.description) : "";

  return (
    <article className="episode-sheet flex h-full min-h-0 flex-col bg-field">
      <a
        href={video.url}
        className="sheet-link group flex min-h-0 flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-chalk"
      >
        <span className="sheet-copy shrink-0 pt-3 pb-3">
          <span className="font-ui text-[0.68rem] uppercase tracking-[0.16em] text-quiet">
            {featured ? `${t.episodes.featured} · ` : null}
            {formatWhen(video.published, locale)}
          </span>
          <span className="mt-2 line-clamp-3 block font-serif text-[clamp(1.35rem,3.2vw,2.15rem)] leading-tight">
            {video.title}
          </span>
        </span>
        <span className="sheet-media relative block min-h-[40%] flex-1 overflow-hidden bg-ink">
          <Image
            src={video.thumbnail}
            alt=""
            fill
            sizes="100vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
          />
        </span>
        {featured ? (
          <span className="sheet-extra shrink-0 pt-3 pb-4">
            {blurb ? (
              <span className="line-clamp-2 block font-serif text-base leading-relaxed text-chalk/85">
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
      </a>
    </article>
  );
}

function EmptySheet({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <article className="flex h-full min-h-0 flex-col bg-field">
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
