import { JetsSection } from "@/components/jets-section";
import { PageShell } from "@/components/page-shell";
import { metadataFor } from "@/lib/seo";
import { getChannel } from "@/lib/youtube";

export const metadata = metadataFor("pt", "jets");

export default async function JetsPage() {
  const channel = await getChannel();
  return (
    <PageShell locale="pt">
      <JetsSection locale="pt" videos={channel.videos} />
    </PageShell>
  );
}
