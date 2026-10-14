import { revalidatePath, revalidateTag } from "next/cache";
import { getInstagram } from "@/lib/instagram";
import { fullEpisodes, getChannel } from "@/lib/youtube";
import { RSS_FEED, fullEpisodes as fullFrom, isShort, loadEpisodes, parseFeed } from "@/lib/youtube-load";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Daily refresh (vercel.json cron, 10:00 UTC = 6am EDT / 5am EST).
 * 1) Newest full episode from the channel RSS feed (Shorts skipped).
 * 2) No new upload since the cached lead: refresh the Instagram row instead.
 * Idempotent: it only revalidates caches. The committed snapshot stays the fallback,
 * and copy in lib/copy.ts (our manual edits) is never touched.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const cached = fullEpisodes((await getChannel()).videos)[0] ?? null;
  let newest: { id: string; title: string; published: string } | null = null;
  let rssError: string | null = null;
  try {
    const response = await fetch(RSS_FEED, { cache: "no-store", signal: AbortSignal.timeout(12000) });
    const videos = response.ok ? parseFeed(await response.text()) : null;
    const lead = videos?.filter((video) => !isShort(video))[0];
    if (lead) newest = { id: lead.id, title: lead.title, published: lead.published };
    else rssError = `rss ${response.status}`;
  } catch (error) {
    rssError = error instanceof Error ? error.message : "rss failed";
  }

  let via = "rss";
  if (!newest) {
    // YouTube often 404s the RSS feed for datacenter IPs. Use the site's other live sources.
    const live = await loadEpisodes();
    const lead = live.degraded ? null : fullFrom(live.videos)[0];
    if (lead) {
      newest = { id: lead.id, title: lead.title, published: lead.published };
      via = live.source;
    }
  }

  let updated: "youtube" | "instagram" | "none" = "none";
  let instagram: { ok: boolean; posts: number } | null = null;
  if (newest && newest.id !== cached?.id) {
    revalidateTag("youtube-channel", "max");
    updated = "youtube";
  } else {
    const feed = await getInstagram();
    instagram = { ok: feed.ok, posts: feed.posts.length };
    if (feed.ok) {
      revalidateTag("instagram", "max");
      updated = "instagram";
    }
  }
  revalidatePath("/");

  const result = { ok: true, at: new Date().toISOString(), updated, cachedLead: cached?.id ?? null, newest, via, rssError, instagram };
  console.log("[cron/daily]", JSON.stringify(result));
  return Response.json(result);
}
