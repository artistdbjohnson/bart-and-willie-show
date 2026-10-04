import { ProseBlocks } from "@/components/prose-blocks";
import { SectionHeading } from "@/components/section-heading";
import { SourceLine } from "@/components/jets-section";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import { hostStory, jetsStory } from "@/lib/story";

export function AboutHosts({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const story = hostStory[locale];
  const jets = jetsStory[locale];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
      <SectionHeading kicker={t.about.kicker} title={t.about.title} lede={t.about.lede} />
      <div className="mt-16 grid gap-20">
        <HostNote
          name="Bart Scott"
          years={t.jets.bartYears}
          before={story.bart.before}
          jets={jets.bart}
          after={story.bart.after}
        />
        <HostNote
          name="Willie Colon"
          years={t.jets.willieYears}
          before={story.willie.before}
          jets={jets.willie}
          after={story.willie.after}
        />
      </div>
      <SourceLine locale={locale} />
    </section>
  );
}

function HostNote({
  name,
  years,
  before,
  jets,
  after,
}: {
  name: string;
  years: string;
  before: (typeof hostStory)["en"]["bart"]["before"];
  jets: (typeof jetsStory)["en"]["bart"];
  after: (typeof hostStory)["en"]["bart"]["after"];
}) {
  return (
    <article className="max-w-3xl">
      <h3 className="font-display text-6xl leading-none tracking-tight">{name}</h3>
      <ProseBlocks blocks={before} />
      <p className="mt-10 inline-block bg-signal px-2 py-1 font-ui text-[0.68rem] uppercase tracking-[0.16em] text-ink">
        {years}
      </p>
      <ProseBlocks blocks={jets} />
      <ProseBlocks blocks={after} />
    </article>
  );
}
