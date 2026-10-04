import type { Metadata } from "next";
import { copy } from "@/lib/copy";
import { localizePath, type Locale } from "@/lib/paths";

type PageKey = "home" | "episodes" | "jets" | "about" | "list";

const paths: Record<PageKey, string> = {
  home: "/",
  episodes: "/episodes",
  jets: "/jets",
  about: "/about",
  list: "/subscribe",
};

export function metadataFor(locale: Locale, key: PageKey): Metadata {
  const meta = copy[locale].meta[key];
  const path = paths[key];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: localizePath(path, locale),
      languages: {
        en: localizePath(path, "en"),
        "pt-BR": localizePath(path, "pt"),
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: locale === "pt" ? "pt_BR" : "en_US",
      images: [{ url: "/brand/banner.jpg", width: 1500, height: 500 }],
    },
  };
}
