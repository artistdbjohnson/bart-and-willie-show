import { JetsSection } from "@/components/jets-section";
import { PageShell } from "@/components/page-shell";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("en", "jets");

export default function JetsPage() {
  return (
    <PageShell locale="en">
      <JetsSection locale="en" />
    </PageShell>
  );
}
