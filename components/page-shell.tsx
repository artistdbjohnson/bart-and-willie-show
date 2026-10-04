import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/paths";

export function PageShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader locale={locale} />
      <main id="content">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
