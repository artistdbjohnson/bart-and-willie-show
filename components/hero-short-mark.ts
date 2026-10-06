import { createElement } from "react";

/** Server-rendered short ids. Hidden, so the hero HTML names what it will play. */
export function HeroShortMark({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return createElement("span", { hidden: true, "data-hero-shorts": ids.join(" ") });
}
