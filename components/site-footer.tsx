import type { ReactNode } from "react";
import Link from "next/link";
import { Lockup } from "@/components/lockup";
import { copy } from "@/lib/copy";
import { localizePath, type Locale } from "@/lib/paths";

const watch = [
  { href: "https://www.youtube.com/@bartandwillieshow", label: "YouTube" },
  { href: "https://www.instagram.com/bartandwillieshow", label: "Instagram" },
  { href: "https://www.tiktok.com/@bartandwillieshow", label: "TikTok" },
  { href: "https://x.com/bartandwillie", label: "X" },
];

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const pages = [
    { href: "/episodes", label: t.nav.episodes },
    { href: "/jets", label: t.nav.jets },
    { href: "/about", label: t.nav.hosts },
    { href: "/shop", label: t.nav.shop },
    { href: "/subscribe", label: t.nav.list },
  ];

  return (
    <footer className="border-t border-chalk/15">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <Lockup script={false} size="footer" />
        <p className="mt-8 max-w-sm font-serif text-lg text-chalk/80">{t.footer.schedule}</p>
        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          <FooterColumn title={t.footer.watch}>
            {watch.map((item) => (
              <a key={item.href} href={item.href} className="footer-link">
                {item.label}
              </a>
            ))}
          </FooterColumn>
          <FooterColumn title={t.footer.visit}>
            <a href="https://www.youtube.com/@bartandwillieshow" className="footer-link">
              @bartandwillieshow
            </a>
            <a href="https://x.com/bartandwillie" className="footer-link">
              @bartandwillie
            </a>
            <a href="https://www.instagram.com/therealbartscott" className="footer-link">
              @therealbartscott
            </a>
            <a href="https://www.instagram.com/williecolon66" className="footer-link">
              @williecolon66
            </a>
          </FooterColumn>
          <FooterColumn title={t.footer.pages}>
            {pages.map((item) => (
              <Link key={item.href} href={localizePath(item.href, locale)} className="footer-link">
                {item.label}
              </Link>
            ))}
          </FooterColumn>
        </div>
        <p className="mt-16 font-ui text-[0.68rem] uppercase tracking-[0.22em] text-quiet">
          {t.footer.credit}
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="font-ui text-[0.68rem] uppercase tracking-[0.2em] text-quiet">{title}</p>
      <div className="mt-4 flex flex-col items-start gap-2">{children}</div>
    </div>
  );
}
