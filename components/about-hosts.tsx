import { ProseBlocks } from "@/components/prose-blocks";
import { SectionHeading } from "@/components/section-heading";
import { SourceLine } from "@/components/jets-section";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import { hostStory } from "@/lib/story";

export function AboutHosts({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const story = hostStory[locale];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
      <SectionHeading kicker={t.about.kicker} title={t.about.title} lede={t.about.lede} />
      <div className="mt-16 grid gap-20">
        <article className="max-w-3xl">
          <p className="inline-block bg-signal px-2 py-1 font-ui text-[0.68rem] uppercase tracking-[0.16em] text-ink">
            {t.jets.bartYears}
          </p>
          <h3 className="mt-4 font-display text-6xl leading-none tracking-tight">Bart Scott</h3>
          <ProseBlocks blocks={story.bart} />
        </article>
        <article className="max-w-3xl">
          <p className="inline-block bg-signal px-2 py-1 font-ui text-[0.68rem] uppercase tracking-[0.16em] text-ink">
            {t.jets.willieYears}
          </p>
          <h3 className="mt-4 font-display text-6xl leading-none tracking-tight">Willie Colon</h3>
          <ProseBlocks blocks={story.willie} />
        </article>
      </div>
      <SourceLine locale={locale} />
    </section>
  );
}
