import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToTop } from "@/components/to-top";
import { WatchProvider } from "@/components/watch-dialog";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";

export function PageShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <WatchProvider closeLabel={copy[locale].nav.close}>
      <SiteHeader locale={locale} />
      <main id="content">{children}</main>
      <SiteFooter locale={locale} />
      <ToTop label={copy[locale].toTop} />
    </WatchProvider>
  );
}
