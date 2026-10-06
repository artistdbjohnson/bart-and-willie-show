import { unstable_cache } from "next/cache";
import {
  CHANNEL_URL,
  CHANNEL_VIDEOS_URL,
  HERO_STILL,
  fullEpisodes,
  loadEpisodes,
  shortsFrom,
  type ChannelVideo,
  type LoadResult,
  type SourceName,
} from "@/lib/youtube-load";

export {
  CHANNEL_URL,
  CHANNEL_VIDEOS_URL,
  HERO_STILL,
  fullEpisodes,
  parseFeed,
  shortsFrom,
  snapshotEpisodes,
} from "@/lib/youtube-load";
export type { ChannelVideo, LoadResult, SourceName } from "@/lib/youtube-load";

export type ShortBeat = { id: string };

const SUCCESS_MS = 15 * 60 * 1000;
const FAILURE_MS = 60 * 1000;

type Memory = { result: LoadResult; at: number };
let lastGood: Memory | null = null;
let failUntil = 0;

const readLive = unstable_cache(
  async () => {
    const result = await loadEpisodes();
    if (result.degraded) throw new Error(result.error || "youtube live sources failed");
    return result;
  },
  ["youtube-channel-v1"],
  { revalidate: 900, tags: ["youtube-channel"] },
);

function withFlag(result: LoadResult, degraded: boolean, error?: string): LoadResult & { ok: true } {
  return { ...result, degraded, error: error ?? result.error, ok: true };
}

/**
 * Newest uploads, then the committed snapshot.
 * A good result is reused for about 15 minutes. A failed round is not pinned
 * longer than about 60 seconds, and visitors still receive the last good list.
 */
export async function getChannel(): Promise<LoadResult & { ok: true }> {
  const now = Date.now();
  if (lastGood && !lastGood.result.degraded && now - lastGood.at < SUCCESS_MS) {
    return withFlag(lastGood.result, false);
  }
  if (now < failUntil) {
    const stale = lastGood?.result ?? (await loadEpisodes({ force: "snapshot" }));
    const error = stale.error || "serving the last good episodes";
    console.error("[youtube] channel feed did not load.", error);
    return withFlag(stale, true, error);
  }

  try {
    const fresh = await readLive();
    lastGood = { result: fresh, at: now };
    return withFlag(fresh, false);
  } catch (error) {
    const message = error instanceof Error ? error.message : "youtube fetch failed";
    console.error("[youtube] channel feed did not load.", message);
    failUntil = now + FAILURE_MS;
    if (lastGood?.result.videos.length) {
      return withFlag(lastGood.result, true, message);
    }
    const snapshot = await loadEpisodes({ force: "snapshot" });
    return withFlag(snapshot, true, message);
  }
}

/** The Oct 2, 2026 show. Wren's featured line stays on this episode only. */
export function isOct2Show(video: Pick<ChannelVideo, "id" | "published" | "title">) {
  if (video.id === "uKSv6ZVq4xc") return true;
  if (video.published.slice(0, 10) !== "2026-10-02") return false;
  return /Honest Take on Jets/i.test(video.title);
}

export function titleFrame(video?: Pick<ChannelVideo, "thumbnail"> | null) {
  return video?.thumbnail || HERO_STILL;
}
