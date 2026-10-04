import { EpisodeStage } from "@/components/episode-stage";
import { PageShell } from "@/components/page-shell";
import { YouTubeRail } from "@/components/youtube-rail";
import { metadataFor } from "@/lib/seo";
import { getChannel } from "@/lib/youtube";

export const metadata = metadataFor("pt", "episodes");

export default async function EpisodesPage() {
  const channel = await getChannel();
  return (
    <PageShell locale="pt">
      <EpisodeStage locale="pt" videos={channel.videos} feedOk={channel.ok} />
      <YouTubeRail locale="pt" videos={channel.videos} feedOk={channel.ok} />
    </PageShell>
  );
}
