import { PageShell } from "@/components/page-shell";
import { SubscribeForm } from "@/components/subscribe-form";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("pt", "list");

export default function SubscribePage() {
  return (
    <PageShell locale="pt">
      <SubscribeForm locale="pt" />
    </PageShell>
  );
}
