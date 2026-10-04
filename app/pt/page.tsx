import { HomePage } from "@/components/home-page";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("pt", "home");

export default function Page() {
  return <HomePage locale="pt" />;
}
