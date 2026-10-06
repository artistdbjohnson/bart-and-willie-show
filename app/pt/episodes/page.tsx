import { EpisodeStage } from "@/components/episode-stage";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { metadataFor } from "@/lib/seo";
import { CHANNEL_URL, getChannel } from "@/lib/youtube";

export const metadata = metadataFor("pt", "episodes");
export const revalidate = 60;

export default async function EpisodesPage() {
  const channel = await getChannel();
  return (
    <PageShell locale="pt">
      <EpisodeStage locale="pt" videos={channel.videos} feedOk={channel.ok} />
      <div className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <Button asChild variant="outline">
          <a href={CHANNEL_URL}>{copy.pt.hero.channel}</a>
        </Button>
      </div>
    </PageShell>
  );
}
