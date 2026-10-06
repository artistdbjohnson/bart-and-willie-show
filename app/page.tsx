import { HomePage } from "@/components/home-page";
import { metadataFor } from "@/lib/seo";

export const metadata = metadataFor("en", "home");
export const revalidate = 60;

export default function Page() {
  return <HomePage locale="en" />;
}
