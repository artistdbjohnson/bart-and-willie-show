export type Locale = "en" | "pt";

export function stripLocale(pathname: string) {
  if (pathname === "/pt") return "/";
  if (pathname.startsWith("/pt/")) return pathname.slice(3);
  return pathname || "/";
}

export function localizePath(path: string, locale: Locale) {
  const clean = stripLocale(path);
  if (locale === "en") return clean;
  return clean === "/" ? "/pt" : `/pt${clean}`;
}
