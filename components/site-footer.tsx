import { PlaymakerSocial } from "@/components/playmaker-social";
import type { ReactNode } from "react";
import Link from "next/link";
import { LISTEN } from "@/components/listen-row";
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
    { href: "/#episodes", label: t.nav.episodes },
    { href: "/#hosts", label: t.nav.hosts },
    { href: "/shop", label: t.nav.shop },
    { href: "/#roster", label: t.nav.list },
  ];

  return (
    <footer className="section-snap scroll-mt-[var(--nav-clear)] border-t border-chalk/15">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <Lockup script={false} size="footer" />
        <p className="mt-8 max-w-sm font-serif text-lg text-chalk/80">{t.footer.schedule}</p>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
              <Link key={item.href} href={item.href.startsWith("/#") ? `${localizePath("/", locale)}${item.href.slice(1)}` : localizePath(item.href, locale)} className="footer-link">
                {item.label}
              </Link>
            ))}
          </FooterColumn>
          <FooterColumn title="Listen">
            {LISTEN.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link listen-icon inline-flex items-center gap-2.5"
                style={{ ["--brand" as string]: item.color }}
              >
                <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current" aria-hidden="true">
                  <path d={item.path} />
                </svg>
                <span>{item.label}</span>
              </a>
            ))}
          </FooterColumn>
        </div>
        <div className="playmaker-band mt-16 flex flex-col items-center border-t border-chalk/15 pt-12 text-center md:pt-16">
          <p className="font-ui text-[0.68rem] uppercase tracking-[0.22em] text-chalk/60">A Playmaker production</p>
          <a
            href="https://www.youtube.com/@playmakerhq"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Playmaker on YouTube"
            className="playmaker-link mt-6"
          >
            <picture>
              <source srcSet="/brand/playmaker.webp" type="image/webp" />
              <img src="/brand/playmaker.png" alt="" width={960} height={373} loading="lazy" decoding="async" className="h-auto w-[240px] sm:w-[320px] lg:w-[360px]" />
            </picture>
          </a>
          <p className="mt-6 max-w-[40ch] font-serif text-base leading-relaxed text-chalk/70">
            Playmaker is the home of award-winning, unfiltered, premium athlete storytelling.
          </p>
          <PlaymakerSocial />
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
