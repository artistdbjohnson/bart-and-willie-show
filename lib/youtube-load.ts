import snapshotFile from "../data/youtube-latest.json" with { type: "json" };

export type ChannelVideo = {
  id: string;
  title: string;
  url: string;
  published: string;
  thumbnail: string;
  description: string;
  views: number | null;
  kind: "video" | "short";
  /** Seconds, when a source reports a length. Used to drop Shorts. */
  durationSeconds?: number | null;
  /** "upcoming" and "live" are placeholders, not aired episodes. */
  liveStatus?: "none" | "upcoming" | "live" | null;
};

export type SourceName = "rss" | "uploads" | "data-api" | "snapshot";

export type LoadResult = {
  videos: ChannelVideo[];
  source: SourceName;
  degraded: boolean;
  error?: string;
};

const CHANNEL_ID = "UCynpQXiIDMLylarxGZZz9Dg";
const UPLOADS_PLAYLIST = "UUynpQXiIDMLylarxGZZz9Dg";

export const CHANNEL_URL = "https://www.youtube.com/@bartandwillieshow";
export const CHANNEL_VIDEOS_URL = "https://www.youtube.com/@bartandwillieshow/videos";
export const HERO_STILL = "/hero/splash.jpg";

const RSS_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const UPLOADS_FEED = `https://www.youtube.com/feeds/videos.xml?playlist_id=${UPLOADS_PLAYLIST}`;
const LATEST_EPISODES = 6;
const SHORT_MAX_SECONDS = 180;
const SOURCE_TIMEOUT_MS = 4000;
const RETRY_BACKOFF_MS = 400;

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type LoadOptions = {
  fetch?: FetchLike;
  now?: Date;
  apiKey?: string | null;
  timeoutMs?: number;
  backoffMs?: number;
  /** Skip live sources and return the committed snapshot. */
  force?: "snapshot";
};

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function tag(block: string, pattern: RegExp) {
  const match = block.match(pattern);
  return match ? decode(match[1]) : "";
}

export function snapshotEpisodes(): ChannelVideo[] {
  return snapshotFile.episodes.map((video) => ({
    id: video.id,
    title: video.title,
    url: video.url,
    published: video.published,
    thumbnail: video.thumbnail,
    description: video.description,
    views: video.views,
    kind: video.kind === "short" ? "short" : "video",
  }));
}

function publishedMs(iso: string) {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? null : time;
}

export function isValidVideo(video: ChannelVideo, now = new Date()) {
  if (!ID_RE.test(video.id)) return false;
  if (!video.title.trim()) return false;
  const published = publishedMs(video.published);
  if (published === null) return false;
  if (published > now.getTime() + 60_000) return false;
  if (video.liveStatus === "upcoming" || video.liveStatus === "live") return false;
  return true;
}

export function isShort(video: ChannelVideo) {
  if (video.kind === "short") return true;
  if (video.url.includes("/shorts/")) return true;
  if (video.durationSeconds != null && video.durationSeconds > 0 && video.durationSeconds <= SHORT_MAX_SECONDS) {
    return true;
  }
  return false;
}

export function isAiredEpisode(video: ChannelVideo, now = new Date()) {
  return isValidVideo(video, now) && !isShort(video);
}

function byNewest(a: ChannelVideo, b: ChannelVideo) {
  return (publishedMs(b.published) ?? 0) - (publishedMs(a.published) ?? 0);
}

export function selectLatest(videos: ChannelVideo[], now = new Date()) {
  const episodes = videos.filter((video) => isAiredEpisode(video, now)).sort(byNewest);
  const shorts = videos.filter((video) => isValidVideo(video, now) && isShort(video)).sort(byNewest);
  const seen = new Set<string>();
  const full: ChannelVideo[] = [];
  for (const video of episodes) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    full.push({ ...video, kind: "video" });
    if (full.length === LATEST_EPISODES) break;
  }
  if (full.length < LATEST_EPISODES) {
    for (const video of snapshotEpisodes()) {
      if (seen.has(video.id) || !isAiredEpisode(video, now)) continue;
      seen.add(video.id);
      full.push(video);
      if (full.length === LATEST_EPISODES) break;
    }
  }
  full.sort(byNewest);
  return {
    episodes: full.slice(0, LATEST_EPISODES),
    shorts: shorts.slice(0, LATEST_EPISODES),
  };
}

/** Reject HTML error pages and feeds that are not Atom. Empty-but-valid feeds return []. */
export function parseFeed(xml: string): ChannelVideo[] | null {
  const trimmed = xml.trim();
  if (!trimmed || /^<!doctype html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) return null;
  if (!/<feed[\s>]/.test(trimmed)) return null;
  if (!trimmed.includes("<entry>")) return [];
  const videos = trimmed
    .split("<entry>")
    .slice(1)
    .map((block) => {
      const id = tag(block, /<yt:videoId>([^<]+)<\/yt:videoId>/);
      const url = tag(block, /<link rel="alternate" href="([^"]+)"/);
      const title =
        tag(block, /<media:title>([^<]+)<\/media:title>/) ||
        tag(block, /<title>([^<]+)<\/title>/);
      const published = tag(block, /<published>([^<]+)<\/published>/);
      const thumbnail = tag(block, /<media:thumbnail url="([^"]+)"/);
      const description = tag(block, /<media:description>([\s\S]*?)<\/media:description>/);
      const viewsMatch = block.match(/views="(\d+)"/);
      const durationMatch = block.match(/<yt:duration[^>]*seconds="(\d+)"/i);
      const seconds = durationMatch ? Number(durationMatch[1]) : null;
      const liveRaw = tag(block, /<yt:liveBroadcast[^>]*>([^<]+)<\/yt:liveBroadcast>/i).toLowerCase();
      const liveStatus = liveRaw === "upcoming" || liveRaw === "live" || liveRaw === "none" ? liveRaw : null;
      if (!id && !title && !published) return null;
      const video: ChannelVideo = {
        id,
        title,
        url: url || (id ? `https://www.youtube.com/watch?v=${id}` : ""),
        published,
        thumbnail: thumbnail || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ""),
        description,
        views: viewsMatch ? Number(viewsMatch[1]) : null,
        kind: url.includes("/shorts/") || (seconds != null && seconds <= SHORT_MAX_SECONDS) ? "short" : "video",
        durationSeconds: seconds,
        liveStatus,
      };
      return video;
    })
    .filter((video): video is ChannelVideo => video !== null);
  if (videos.length > 0 && videos.every((video) => !video.id || !video.title || publishedMs(video.published) === null)) {
    return null;
  }
  return videos.filter((video) => isValidVideo(video) || isShort(video));
}

function parseIsoDuration(value: string) {
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return null;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

export function parseDataApi(payload: unknown): ChannelVideo[] | null {
  if (!payload || typeof payload !== "object") return null;
  const items = (payload as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const videos: ChannelVideo[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as {
      id?: string | { videoId?: string };
      snippet?: {
        title?: string;
        publishedAt?: string;
        description?: string;
        liveBroadcastContent?: string;
        resourceId?: { videoId?: string };
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
      };
      contentDetails?: { duration?: string; videoId?: string };
    };
    const id =
      (typeof record.id === "string" ? record.id : record.id?.videoId) ||
      record.snippet?.resourceId?.videoId ||
      record.contentDetails?.videoId ||
      "";
    const title = record.snippet?.title?.trim() ?? "";
    const published = record.snippet?.publishedAt ?? "";
    const liveRaw = record.snippet?.liveBroadcastContent?.toLowerCase() ?? "";
    const liveStatus = liveRaw === "upcoming" || liveRaw === "live" || liveRaw === "none" ? liveRaw : null;
    const durationSeconds = record.contentDetails?.duration ? parseIsoDuration(record.contentDetails.duration) : null;
    if (!id || !title || publishedMs(published) === null) continue;
    const short = durationSeconds != null && durationSeconds > 0 && durationSeconds <= SHORT_MAX_SECONDS;
    videos.push({
      id,
      title,
      url: `https://www.youtube.com/watch?v=${id}`,
      published,
      thumbnail: record.snippet?.thumbnails?.high?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      description: record.snippet?.description ?? "",
      views: null,
      kind: short ? "short" : "video",
      durationSeconds,
      liveStatus,
    });
  }
  return videos;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readText(url: string, fetchImpl: FetchLike, timeoutMs: number, headers?: HeadersInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry<T>(run: () => Promise<T>, backoffMs: number) {
  try {
    return await run();
  } catch (first) {
    await delay(backoffMs);
    try {
      return await run();
    } catch (second) {
      const message = second instanceof Error ? second.message : "fetch failed";
      const earlier = first instanceof Error ? first.message : "fetch failed";
      throw new Error(message || earlier);
    }
  }
}

function finish(videos: ChannelVideo[], source: SourceName, now: Date, degraded: boolean, error?: string): LoadResult {
  const picked = selectLatest(videos, now);
  return {
    videos: [...picked.episodes, ...picked.shorts],
    source: degraded ? "snapshot" : source,
    degraded,
    error,
  };
}

export async function loadEpisodes(options: LoadOptions = {}): Promise<LoadResult> {
  const now = options.now ?? new Date();
  const fetchImpl = options.fetch ?? fetch;
  const timeoutMs = options.timeoutMs ?? SOURCE_TIMEOUT_MS;
  const backoffMs = options.backoffMs ?? RETRY_BACKOFF_MS;
  const failures: string[] = [];

  if (options.force === "snapshot") {
    return finish(snapshotEpisodes(), "snapshot", now, true);
  }

  const tryRss = async (url: string) => {
    const xml = await readText(url, fetchImpl, timeoutMs, { Accept: "application/atom+xml, application/xml" });
    const parsed = parseFeed(xml);
    if (parsed === null) throw new Error(`malformed feed ${url}`);
    if (!parsed.some((video) => isAiredEpisode(video, now))) throw new Error(`no aired episodes ${url}`);
    return parsed;
  };

  try {
    const videos = await withRetry(() => tryRss(RSS_FEED), backoffMs);
    return finish(videos, "rss", now, false);
  } catch (error) {
    failures.push(`rss ${error instanceof Error ? error.message : "failed"}`);
  }

  try {
    const videos = await withRetry(() => tryRss(UPLOADS_FEED), backoffMs);
    return finish(videos, "uploads", now, false);
  } catch (error) {
    failures.push(`uploads ${error instanceof Error ? error.message : "failed"}`);
  }

  const apiKey = options.apiKey === undefined ? process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_DATA_API_KEY || "" : options.apiKey || "";
  if (!apiKey) {
    failures.push("data-api skipped (no YOUTUBE_API_KEY)");
  } else {
    try {
      const videos = await withRetry(async () => {
        const listUrl =
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=15&playlistId=${UPLOADS_PLAYLIST}&key=${apiKey}`;
        const listed = JSON.parse(await readText(listUrl, fetchImpl, timeoutMs)) as unknown;
        const base = parseDataApi(listed);
        if (base === null) throw new Error("malformed data api playlist");
        const ids = base.map((video) => video.id).filter(Boolean).slice(0, 15);
        if (ids.length === 0) throw new Error("data api returned no videos");
        const detailUrl =
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${ids.join(",")}&key=${apiKey}`;
        try {
          const detailed = parseDataApi(JSON.parse(await readText(detailUrl, fetchImpl, timeoutMs)));
          if (detailed && detailed.length > 0) return detailed;
        } catch {
          /* playlist rows still have ids, titles, and dates */
        }
        return base;
      }, backoffMs);
      if (!videos.some((video) => isAiredEpisode(video, now))) throw new Error("data api had no aired episodes");
      return finish(videos, "data-api", now, false);
    } catch (error) {
      failures.push(`data-api ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  const error = failures.join("; ");
  return { ...finish(snapshotEpisodes(), "snapshot", now, true, error), error };
}

export function fullEpisodes(videos: ChannelVideo[]) {
  return videos.filter((video) => video.kind === "video" && isAiredEpisode(video));
}

export function shortsFrom(videos: ChannelVideo[]) {
  return videos.filter((video) => isShort(video));
}
