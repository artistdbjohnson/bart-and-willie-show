import { Hero } from "@/components/hero";
import { JetsSection } from "@/components/jets-section";
import { LatestNest } from "@/components/latest-nest";
import { PageShell } from "@/components/page-shell";
import { SubscribeForm } from "@/components/subscribe-form";
import { getInstagram } from "@/lib/instagram";
import type { Locale } from "@/lib/paths";
import { fullEpisodes, getChannel, HERO_STILL, shortsFrom } from "@/lib/youtube";

export async function HomePage({ locale }: { locale: Locale }) {
  const [channel, instagram] = await Promise.all([getChannel(), getInstagram()]);
  const lead = fullEpisodes(channel.videos)[0] ?? null;
  const shorts = shortsFrom(channel.videos).slice(0, 6).map((short) => ({ id: short.id }));

  return (
    <PageShell locale={locale}>
      <Hero
        locale={locale}
        video={lead}
        still={HERO_STILL}
        shorts={shorts}
        degraded={channel.degraded}
        reason={channel.error}
      />
      <LatestNest
        locale={locale}
        videos={channel.videos}
        feedOk={channel.ok}
        instagram={instagram}
      />
      <JetsSection locale={locale} compactTop />
      <SubscribeForm locale={locale} />
    </PageShell>
  );
}
