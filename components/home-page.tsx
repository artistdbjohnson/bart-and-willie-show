import { Hero } from "@/components/hero";
import { JetsSection } from "@/components/jets-section";
import { LatestNest } from "@/components/latest-nest";
import { PageShell } from "@/components/page-shell";
import { SubscribeForm } from "@/components/subscribe-form";
import { getInstagram } from "@/lib/instagram";
import type { Locale } from "@/lib/paths";
import { fullEpisodes, getChannel, shortsFrom, titleFrame } from "@/lib/youtube";

export async function HomePage({ locale }: { locale: Locale }) {
  const [channel, instagram] = await Promise.all([getChannel(), getInstagram()]);
  const lead = fullEpisodes(channel.videos)[0] ?? null;
  const still = lead ? await titleFrame(lead) : null;
  const shorts = shortsFrom(channel.videos).slice(0, 6).map((short) => ({ id: short.id }));

  return (
    <PageShell locale={locale}>
      <Hero locale={locale} video={lead} still={still} shorts={shorts} />
      <LatestNest
        locale={locale}
        videos={channel.videos}
        feedOk={channel.ok}
        instagram={instagram}
      />
      <JetsSection locale={locale} videos={channel.videos} compactTop />
      <SubscribeForm locale={locale} />
    </PageShell>
  );
}
