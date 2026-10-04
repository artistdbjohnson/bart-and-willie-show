import { AboutHosts } from "@/components/about-hosts";
import { PageShell } from "@/components/page-shell";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("pt", "about");

export default function AboutPage() {
  return (
    <PageShell locale="pt">
      <AboutHosts locale="pt" />
    </PageShell>
  );
}
