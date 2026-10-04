import Image from "next/image";
import { CardNest } from "@/components/card-nest";
import { InstagramRail } from "@/components/instagram-rail";
import { YouTubeRail } from "@/components/youtube-rail";
import { Button } from "@/components/ui/button";
import { copy, formatWhen } from "@/lib/copy";
import type { InstagramFeed } from "@/lib/instagram";
import type { Locale } from "@/lib/paths";
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

  const cards = [
    <FeaturedFace
      key="featured"
      locale={locale}
      video={feedOk ? lead : undefined}
    />,
    ...rest.map((video) => <EpisodeFace key={video.id} locale={locale} video={video} />),
    <YouTubeRail key="youtube" locale={locale} videos={videos} feedOk={feedOk} nested />,
    <InstagramRail key="instagram" locale={locale} feed={instagram} nested />,
  ];

  return (
    <section aria-label={t.episodes.title} className="border-t border-chalk/15">
      <CardNest>{cards}</CardNest>
    </section>
  );
}

function FeaturedFace({
  locale,
  video,
}: {
  locale: Locale;
  video?: ChannelVideo;
}) {
  const t = copy[locale];
  return (
    <article className="featured-face flex h-full min-h-0 flex-col bg-field">
      <div className="h-1 shrink-0 bg-signal" />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-5 py-5 sm:px-8 sm:py-7">
        <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">
          {t.episodes.featured}
        </p>
        {!video ? (
          <div className="mt-6 border border-dashed border-chalk/35 px-5 py-8">
            <p className="max-w-xl font-serif text-lg">{t.episodes.empty}</p>
            <div className="mt-5">
              <Button asChild variant="outline">
                <a href={CHANNEL_URL}>{t.episodes.channel}</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid min-h-0 flex-1 content-start gap-4 lg:grid-cols-12 lg:items-center">
            <div className="bg-ink lg:col-span-7">
              <div className="relative aspect-video">
                <iframe
                  className="player-in absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="lg:col-span-5">
              <p className="font-ui text-[0.68rem] uppercase tracking-[0.16em] text-quiet">
                {formatWhen(video.published, locale)}
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.7rem,4vw,2.6rem)] leading-tight">{video.title}</h2>
              {excerpt(video.description) ? (
                <p className="mt-3 line-clamp-2 font-serif text-base leading-relaxed text-chalk/85">
                  {excerpt(video.description)}
                </p>
              ) : null}
              <div className="mt-5">
                <Button asChild variant="outline">
                  <a href={video.url}>{t.episodes.open}</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function EpisodeFace({ locale, video }: { locale: Locale; video: ChannelVideo }) {
  return (
    <article className="episode-face flex h-full min-h-0 flex-col bg-field">
      <div className="h-1 shrink-0 bg-signal" />
      <a
        href={video.url}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-5 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-chalk sm:px-8 sm:py-7"
      >
        <span className="face-media relative block min-h-0 flex-1 overflow-hidden bg-field-bright/25">
          <Image
            src={video.thumbnail}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </span>
        <span className="shrink-0">
          <span className="font-ui text-[0.68rem] uppercase tracking-[0.16em] text-quiet">
            {formatWhen(video.published, locale)}
          </span>
          <span className="mt-2 block font-serif text-[clamp(1.5rem,4vw,2.4rem)] leading-tight">
            {video.title}
          </span>
        </span>
      </a>
    </article>
  );
}
