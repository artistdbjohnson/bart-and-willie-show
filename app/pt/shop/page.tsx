import { PageShell } from "@/components/page-shell";
import { ShopPage } from "@/components/shop-page";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("pt", "shop");

export default function ShopPt() {
  return (
    <PageShell locale="pt">
      <ShopPage locale="pt" />
    </PageShell>
  );
}
