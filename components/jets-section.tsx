import { InView } from "@/components/ui/in-view";
import { ProseBlocks } from "@/components/prose-blocks";
import { SectionHeading } from "@/components/section-heading";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import { jetsStory, sources } from "@/lib/story";

export function JetsSection({
  locale,
  compactTop = false,
}: {
  locale: Locale;
  compactTop?: boolean;
}) {
  const t = copy[locale];
  const story = jetsStory[locale];

  return (
    <section id="hosts" className="section-snap scroll-mt-[var(--nav-clear)] border-t border-chalk/15 bg-field">
      <div
        className={
          compactTop
            ? "mx-auto max-w-6xl px-5 pt-6 pb-20 sm:px-8 md:pb-28"
            : "mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28"
        }
      >
        <SectionHeading kicker={t.jets.kicker} title={t.jets.title} lede={t.jets.lede} />
        <div className="mt-14 grid gap-16 lg:grid-cols-2">
          <HostColumn
            years={t.jets.bartYears}
            name={t.jets.bartTitle}
            blocks={story.bart}
            cutout="/hero/bart-card.webp"
          />
          <HostColumn
            years={t.jets.willieYears}
            name={t.jets.willieTitle}
            blocks={story.willie}
            cutout="/hero/willie-card.webp"
          />
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
  cutout,
}: {
  cutout: string;
  years: string;
  name: string;
  blocks: (typeof jetsStory)["en"]["bart"];
}) {
  return (
    <article>
      <div className="mb-6 flex flex-col items-center gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-start sm:gap-5 xl:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cutout}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="bio-sticker pointer-events-none h-[14rem] w-auto select-none sm:h-[16.5rem] xl:h-[17.5rem]"
        />
        <div className="w-full min-w-0 sm:w-auto sm:shrink-0">
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
          <h3 className="mt-4 font-display text-5xl leading-none tracking-tight whitespace-nowrap">{name}</h3>
        </div>
      </div>
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
            className="inline-block py-2 underline decoration-chalk/30 underline-offset-4 hover:text-chalk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk"
          >
            {source.label}
          </a>
        </span>
      ))}
    </p>
  );
}
