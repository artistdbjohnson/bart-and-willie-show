import { JetsSection } from "@/components/jets-section";
import { PageShell } from "@/components/page-shell";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("pt", "jets");

export default function JetsPage() {
  return (
    <PageShell locale="pt">
      <JetsSection locale="pt" />
    </PageShell>
  );
}
