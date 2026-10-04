import Image from "next/image";
import Link from "next/link";
import { InView } from "@/components/ui/in-view";
import { ProseBlocks } from "@/components/prose-blocks";
import { SectionHeading } from "@/components/section-heading";
import { copy, formatWhen } from "@/lib/copy";
import { localizePath, type Locale } from "@/lib/paths";
import { jetsStory, sources } from "@/lib/story";
import { WatchTarget } from "@/components/watch-dialog";
import { mentionsJets, type ChannelVideo } from "@/lib/youtube";

export function JetsSection({
  locale,
  videos,
  compactTop = false,
}: {
  locale: Locale;
  videos: ChannelVideo[];
  compactTop?: boolean;
}) {
  const t = copy[locale];
  const story = jetsStory[locale];
  const matched = videos.filter(mentionsJets);

  return (
    <section className="border-t border-chalk/15 bg-field">
      <div
        className={
          compactTop
            ? "mx-auto max-w-6xl px-5 pt-6 pb-20 sm:px-8 md:pb-28"
            : "mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28"
        }
      >
        <SectionHeading kicker={t.jets.kicker} title={t.jets.title} lede={t.jets.lede} />
        <p className="mt-6 max-w-2xl font-serif text-base text-chalk/85">{t.jets.chapter}</p>
        <div className="mt-14 grid gap-16 lg:grid-cols-2">
          <HostColumn
            years={t.jets.bartYears}
            name={t.jets.bartTitle}
            blocks={story.bart}
          />
          <HostColumn
            years={t.jets.willieYears}
            name={t.jets.willieTitle}
            blocks={story.willie}
          />
        </div>

        <div className="mt-20">
          <h3 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
            {t.jets.onTheShow}
          </h3>
          <p className="mt-4 max-w-2xl font-serif text-lg text-chalk/80">{t.jets.onTheShowLede}</p>
          {matched.length === 0 ? (
            <p className="mt-8 border border-dashed border-chalk/35 px-6 py-8 font-serif text-lg">
              {t.jets.none}
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-chalk/15 border-y border-chalk/15">
              {matched.map((video) => (
                <li key={video.id}>
                  <WatchTarget
                    id={video.id}
                    title={video.title}
                    kind={video.kind}
                    poster={video.thumbnail}
                    className="group grid w-full gap-4 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk sm:grid-cols-[180px_1fr] sm:items-center"
                  >
                    <span className="relative block aspect-video overflow-hidden bg-field-bright/25">
                      <Image
                        src={video.thumbnail}
                        alt=""
                        fill
                        unoptimized
                        sizes="(min-width: 640px) 180px, 100vw"
                        className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
                      />
                    </span>
                    <span>
                      <span className="font-ui text-[0.66rem] uppercase tracking-[0.16em] text-quiet">
                        {formatWhen(video.published, locale)}
                      </span>
                      <span className="mt-2 block font-serif text-2xl leading-snug">{video.title}</span>
                    </span>
                  </WatchTarget>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={localizePath("/about", locale)}
            className="mt-8 inline-flex font-ui text-[0.72rem] uppercase tracking-[0.18em] text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk"
          >
            {t.jets.hosts}
          </Link>
        </div>
        <SourceLine locale={locale} />
      </div>
    </section>
  );
}

function HostColumn({
  years,
  name,
  blocks,
}: {
  years: string;
  name: string;
  blocks: (typeof jetsStory)["en"]["bart"];
}) {
  return (
    <article>
      <InView
        once
        viewOptions={{ margin: "-10% 0px", once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      >
        <p className="inline-block bg-signal px-2 py-1 font-ui text-[0.68rem] uppercase tracking-[0.16em] text-ink">
          {years}
        </p>
      </InView>
      <h3 className="mt-4 font-display text-5xl leading-none tracking-tight">{name}</h3>
      <ProseBlocks blocks={blocks} />
    </article>
  );
}

export function SourceLine({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <p className="mt-12 max-w-3xl font-ui text-[0.66rem] uppercase leading-relaxed tracking-[0.14em] text-quiet">
      <span className="mr-3 text-chalk/80">{t.about.sources}</span>
      {sources.map((source, index) => (
        <span key={source.href}>
          {index > 0 ? <span className="mx-2 text-chalk/30">/</span> : null}
          <a
            href={source.href}
            className="underline decoration-chalk/30 underline-offset-4 hover:text-chalk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk"
          >
            {source.label}
          </a>
        </span>
      ))}
    </p>
  );
}
