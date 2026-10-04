import { PageShell } from "@/components/page-shell";
import { SubscribeForm } from "@/components/subscribe-form";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("en", "list");

export default function SubscribePage() {
  return (
    <PageShell locale="en">
      <SubscribeForm locale="en" />
    </PageShell>
  );
}
