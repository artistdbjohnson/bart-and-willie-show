import { revalidatePath, revalidateTag } from "next/cache";
import { fullEpisodes, getChannel, shortsFrom } from "@/lib/youtube";

export const dynamic = "force-dynamic";

/**
 * Refresh the show pages on demand.
 *
 * vercel.json cannot hold a cron (it stays `{ "cleanUrls": true, "trailingSlash": false }`).
 * `.github/workflows/refresh-show.yml` GETs this route every 15 minutes.
 * The route is safe to call without a secret: it only revalidates these four pages.
 * A bearer token is ignored when present, so the workflow can send one if the secret exists.
 */
const PAGES = ["/", "/pt", "/episodes", "/pt/episodes"] as const;
const HAMMER_MS = 60_000;
let lastRevalidateAt = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("status") === "1") {
    const channel = await getChannel();
    const episodes = fullEpisodes(channel.videos);
    const shorts = shortsFrom(channel.videos);
    const lead = episodes[0];
    return Response.json({
      ok: true,
      source: channel.source,
      degraded: channel.degraded,
      count: episodes.length,
      lead: lead ? { id: lead.id } : null,
      shortsSource: channel.shortsSource,
      shortsCount: shorts.length,
      error: channel.error ?? null,
    });
  }

  const now = Date.now();
  if (now - lastRevalidateAt < HAMMER_MS) {
    return Response.json({ ok: true, skipped: true });
  }
  lastRevalidateAt = now;

  revalidateTag("youtube-channel", { expire: 0 });
  for (const path of PAGES) revalidatePath(path, "page");
  return Response.json({ ok: true, revalidated: [...PAGES] });
}
