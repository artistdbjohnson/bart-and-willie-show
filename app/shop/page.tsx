import { PageShell } from "@/components/page-shell";
import { ShopPage } from "@/components/shop-page";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("en", "shop");

export default function Shop() {
  return (
    <PageShell locale="en">
      <ShopPage locale="en" />
    </PageShell>
  );
}
