"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { localizePath, stripLocale, type Locale } from "@/lib/paths";
import { cn } from "@/lib/utils";

const links = [
  { href: "/episodes", key: "episodes" },
  { href: "/jets", key: "jets" },
  { href: "/about", key: "hosts" },
  { href: "/shop", key: "shop" },
  { href: "/subscribe", key: "list" },
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const t = copy[locale];
  const [open, setOpen] = useState(false);
  const bare = stripLocale(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      <div className="site-header-bar mx-auto flex max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link
          href={localizePath("/", locale)}
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
        </Link>

        <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label={t.nav.menu}>
          {links.map((link) => {
            const current = bare === link.href;
            const inPage = bare === "/" && link.href === "/episodes";
            return (
              <Link
                key={link.href}
                href={inPage ? "#episodes" : localizePath(link.href, locale)}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "font-ui text-[0.72rem] uppercase tracking-[0.18em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk",
                  current ? "text-signal" : "text-quiet hover:text-chalk",
                )}
              >
                {t.nav[link.key]}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-4">
          <LanguageToggle locale={locale} />
          <ThemeToggle locale={locale} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="md:hidden"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t.nav.close : t.nav.menu}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-chalk/15 px-5 py-4 md:hidden" aria-label={t.nav.menu}>
          <ul className="grid gap-1">
            {links.map((link) => {
              const current = bare === link.href;
              const inPage = bare === "/" && link.href === "/episodes";
              return (
                <li key={link.href}>
                  <Link
                    href={inPage ? "#episodes" : localizePath(link.href, locale)}
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
        </nav>
      ) : null}
    </header>
  );
}

function LanguageToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const t = copy[locale];
  return (
    <div className="flex h-10 items-center border border-chalk/30" aria-label={t.lang.label}>
      {(["en", "pt"] as const).map((item) => {
        const current = item === locale;
        return (
          <Link
            key={item}
            href={localizePath(pathname, item)}
            hrefLang={item}
            aria-current={current ? "true" : undefined}
            className={cn(
              "flex h-10 items-center px-2.5 font-ui text-[0.68rem] tracking-[0.16em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk",
              current ? "bg-signal text-ink" : "text-quiet hover:text-chalk",
            )}
          >
            {t.lang[item]}
          </Link>
        );
      })}
    </div>
  );
}

function ThemeToggle({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function choose(next: "light" | "dark") {
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("baw-theme", next);
    } catch {
      /* storage can be blocked; the class still changes for this view */
    }
  }

  return (
    <div className="flex h-10 items-center border border-chalk/30" aria-label={t.theme.label}>
      {(
        [
          ["light", t.theme.day],
          ["dark", t.theme.night],
        ] as const
      ).map(([value, label]) => {
        const current = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={current}
            onClick={() => choose(value)}
            data-theme-choice={value}
            className={cn(
              "theme-choice h-10 px-2.5 font-ui text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-500 ease-out motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk",
              current ? "" : "text-quiet hover:text-chalk",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
