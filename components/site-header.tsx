"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ListenRow } from "@/components/listen-row";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { localizePath, stripLocale, type Locale } from "@/lib/paths";
import { cn } from "@/lib/utils";

const links = [
  { hash: "episodes", key: "episodes" },
  { hash: "hosts", key: "hosts" },
  { href: "/shop", key: "shop" },
  { hash: "roster", key: "list" },
] as const;

function linkHref(link: (typeof links)[number], locale: Locale, onHome: boolean) {
  if ("hash" in link) return onHome ? `#${link.hash}` : `${localizePath("/", locale)}#${link.hash}`;
  return localizePath(link.href, locale);
}

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const t = copy[locale];
  const [open, setOpen] = useState(false);
  const bare = stripLocale(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onDown = (event: PointerEvent) => {
      const header = document.querySelector(".site-header-plate");
      if (header && !header.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt" : "en";
  }, [locale]);

  return (
    <header className="site-header">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-signal focus:px-3 focus:py-2 focus:text-ink"
      >
        {t.skip}
      </a>
      <div className="site-header-plate">
      <div className="site-header-bar mx-auto flex max-w-6xl items-center gap-4 px-5 sm:px-8">
        <a
          href={pathname || "/"}
          onClick={(event) => {
            event.preventDefault();
            window.location.reload();
          }}
          className="flex min-w-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk"
        >
          <img
            src="/brand/mark-knockout.png"
            alt="The Bart & Willie Show"
            width={387}
            height={224}
            className="h-11 w-auto shrink-0"
          />
          <span className="hidden font-display text-xl leading-none tracking-tight sm:block">
            THE BART & WILLIE SHOW
          </span>
        </a>


        <ListenRow className="ml-auto hidden lg:flex" />
        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-btn h-11 min-w-11"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t.nav.close : t.nav.menu}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="site-menu mx-auto max-w-6xl px-5 py-4 sm:px-8" aria-label={t.nav.menu}>
          <ul className="grid gap-1">
            {links.map((link) => {
              const current = "href" in link && bare === link.href;
              return (
                <li key={link.key}>
                  <Link
                    href={linkHref(link, locale, bare === "/")}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex h-12 items-center font-ui text-sm uppercase tracking-[0.18em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk",
                      current ? "text-signal" : "text-chalk",
                    )}
                  >
                    {t.nav[link.key]}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ListenRow className="mt-4 border-t border-chalk/15 pt-4 lg:hidden" />
        </nav>
      ) : null}
      </div>
      <div className="nav-fade" aria-hidden="true" />
      <div className="nav-haze" aria-hidden="true" />
    </header>
  );
}
