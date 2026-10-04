import { PageShell } from "@/components/page-shell";
import { SubscribeForm } from "@/components/subscribe-form";
import { metadataFor } from "@/lib/seo";
import { fullEpisodes, getChannel, titleFrame } from "@/lib/youtube";

export const metadata = metadataFor("en", "list");

export default async function SubscribePage() {
  const channel = await getChannel();
  const lead = fullEpisodes(channel.videos)[0] ?? null;
  const image = lead ? await titleFrame(lead) : null;

  return (
    <PageShell locale="en">
      <SubscribeForm locale="en" image={image} />
    </PageShell>
  );
}
