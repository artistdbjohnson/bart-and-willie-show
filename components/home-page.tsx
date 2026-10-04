import { Hero } from "@/components/hero";
import { JetsSection } from "@/components/jets-section";
import { LatestNest } from "@/components/latest-nest";
import { PageShell } from "@/components/page-shell";
import { StatsRow } from "@/components/stats-row";
import { SubscribeForm } from "@/components/subscribe-form";
import { getInstagram } from "@/lib/instagram";
import type { Locale } from "@/lib/paths";
import { fullEpisodes, getChannel } from "@/lib/youtube";

export async function HomePage({ locale }: { locale: Locale }) {
  const [channel, instagram] = await Promise.all([getChannel(), getInstagram()]);
  const lead = fullEpisodes(channel.videos)[0] ?? null;

  return (
    <PageShell locale={locale}>
      <Hero locale={locale} video={lead} />
      <StatsRow locale={locale} />
      <LatestNest
        locale={locale}
        videos={channel.videos}
        feedOk={channel.ok}
        instagram={instagram}
      />
      <JetsSection locale={locale} videos={channel.videos} />
      <SubscribeForm locale={locale} />
    </PageShell>
  );
}
