import { EpisodeStage } from "@/components/episode-stage";
import { Hero } from "@/components/hero";
import { InstagramRail } from "@/components/instagram-rail";
import { JetsSection } from "@/components/jets-section";
import { PageShell } from "@/components/page-shell";
import { StatsRow } from "@/components/stats-row";
import { SubscribeForm } from "@/components/subscribe-form";
import { YouTubeRail } from "@/components/youtube-rail";
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
      <EpisodeStage locale={locale} videos={channel.videos} feedOk={channel.ok} />
      <YouTubeRail locale={locale} videos={channel.videos} feedOk={channel.ok} />
      <InstagramRail locale={locale} feed={instagram} />
      <JetsSection locale={locale} videos={channel.videos} />
      <SubscribeForm locale={locale} />
    </PageShell>
  );
}
