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

export type SourceName = "channel-page" | "rss" | "uploads" | "data-api" | "snapshot";
export type ShortsSourceName = "shorts-page" | "snapshot" | "none";

export type LoadResult = {
  videos: ChannelVideo[];
  source: SourceName;
  shortsSource: ShortsSourceName;
  degraded: boolean;
  error?: string;
};

const CHANNEL_ID = "UCynpQXiIDMLylarxGZZz9Dg";
const UPLOADS_PLAYLIST = "UUynpQXiIDMLylarxGZZz9Dg";

export const CHANNEL_URL = "https://www.youtube.com/@bartandwillieshow";
export const CHANNEL_VIDEOS_URL = "https://www.youtube.com/@bartandwillieshow/videos";
export const HERO_STILL = "/hero/splash.jpg";

const CHANNEL_PAGE = `https://www.youtube.com/channel/${CHANNEL_ID}/videos`;
const SHORTS_PAGE = `https://www.youtube.com/channel/${CHANNEL_ID}/shorts`;
const HANDLE_SHORTS_URL = "https://www.youtube.com/@bartandwillieshow/shorts";
const PAGE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml",
  Cookie: "CONSENT=YES+1; SOCS=CAI",
};

const RSS_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const UPLOADS_FEED = `https://www.youtube.com/feeds/videos.xml?playlist_id=${UPLOADS_PLAYLIST}`;
const LATEST_EPISODES = 6;
const LATEST_SHORTS = 8;
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

function fromSnapshot(video: (typeof snapshotFile.episodes)[number], kind: "video" | "short"): ChannelVideo {
  return {
    id: video.id,
    title: video.title,
    url: video.url,
    published: video.published,
    thumbnail: video.thumbnail,
    description: video.description,
    views: video.views,
    kind,
  };
}

export function snapshotEpisodes(): ChannelVideo[] {
  return snapshotFile.episodes.map((video) => fromSnapshot(video, "video"));
}

export function snapshotShorts(): ChannelVideo[] {
  return snapshotFile.shorts.map((video) => fromSnapshot(video, "short"));
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

  const shortSeen = new Set<string>();
  const shorts: ChannelVideo[] = [];
  const shortPool = [
    ...videos.filter((video) => isValidVideo(video, now) && isShort(video)).sort(byNewest),
    ...snapshotShorts(),
  ];
  for (const video of shortPool) {
    if (shortSeen.has(video.id) || !isValidVideo(video, now) || !isShort(video)) continue;
    shortSeen.add(video.id);
    shorts.push({ ...video, kind: "short" });
    if (shorts.length === LATEST_SHORTS) break;
  }
  return {
    episodes: full.slice(0, LATEST_EPISODES),
    shorts,
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

const UNIT_MS: Record<string, number> = {
  second: 1000,
  seconds: 1000,
  sec: 1000,
  secs: 1000,
  s: 1000,
  minute: 60_000,
  minutes: 60_000,
  min: 60_000,
  mins: 60_000,
  m: 60_000,
  hour: 3_600_000,
  hours: 3_600_000,
  hr: 3_600_000,
  hrs: 3_600_000,
  h: 3_600_000,
  day: 86_400_000,
  days: 86_400_000,
  d: 86_400_000,
  week: 7 * 86_400_000,
  weeks: 7 * 86_400_000,
  w: 7 * 86_400_000,
  month: 30 * 86_400_000,
  months: 30 * 86_400_000,
  mo: 30 * 86_400_000,
  mos: 30 * 86_400_000,
  year: 365 * 86_400_000,
  years: 365 * 86_400_000,
  y: 365 * 86_400_000,
  yr: 365 * 86_400_000,
  yrs: 365 * 86_400_000,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function sliceJsonObject(source: string, start: number) {
  if (source[start] !== "{") return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function readYtInitialData(html: string): unknown[] {
  const payloads: unknown[] = [];
  let from = 0;
  while (payloads.length < 2) {
    const marker = html.indexOf("ytInitialData", from);
    if (marker === -1) break;
    const brace = html.indexOf("{", marker);
    if (brace === -1 || brace - marker > 160) {
      from = marker + "ytInitialData".length;
      continue;
    }
    const raw = sliceJsonObject(html, brace);
    if (!raw) break;
    try {
      payloads.push(JSON.parse(raw));
    } catch {
      /* the next copy may still be intact */
    }
    from = brace + raw.length;
  }
  return payloads;
}

function walk(node: unknown, visit: (record: Record<string, unknown>) => void) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit);
    return;
  }
  const record = node as Record<string, unknown>;
  visit(record);
  for (const value of Object.values(record)) walk(value, visit);
}

function collectText(node: unknown, out: string[]) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectText(item, out);
    return;
  }
  const record = node as Record<string, unknown>;
  for (const key of ["content", "simpleText", "accessibilityLabel", "label", "text"] as const) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) out.push(value.trim());
  }
  for (const value of Object.values(record)) collectText(value, out);
}

function relativeToIso(texts: string[], now: Date) {
  const pattern =
    /(\d+)\s*(seconds?|minutes?|hours?|days?|weeks?|months?|years?|secs?|mins?|hrs?|mos?|yrs?|mo|hr|min|sec|[smhdwy])\s+ago/i;
  for (const text of texts) {
    const match = text.match(pattern);
    if (!match) continue;
    const amount = Number(match[1]);
    const unit = UNIT_MS[match[2].toLowerCase()];
    if (!unit || !Number.isFinite(amount)) continue;
    return new Date(now.getTime() - amount * unit).toISOString();
  }
  return null;
}

function parseViews(texts: string[]) {
  for (const text of texts) {
    const words = text.match(/([\d,.]+)\s*(thousand|million|billion)?\s+views/i);
    if (!words) continue;
    const count = Number(words[1].replace(/,/g, ""));
    if (!Number.isFinite(count)) continue;
    const unit = (words[2] || "").toLowerCase();
    const scale = unit === "thousand" ? 1_000 : unit === "million" ? 1_000_000 : unit === "billion" ? 1_000_000_000 : 1;
    return Math.round(count * scale);
  }
  for (const text of texts) {
    const compact = text.match(/^([\d,.]+)\s*([KMB])$/i);
    if (!compact) continue;
    const count = Number(compact[1].replace(/,/g, ""));
    if (!Number.isFinite(count)) continue;
    const scale = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[compact[2].toUpperCase()] ?? 1;
    return Math.round(count * scale);
  }
  return null;
}

function clockSeconds(value: string) {
  const match = value.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (minutes > 59 || seconds > 59) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

function blockedReason(texts: string[]) {
  const blob = texts.join("\n");
  if (/\bmembers[\s-]*only\b/i.test(blob)) return "members" as const;
  if (/\bpremieres?\s+in\b/i.test(blob) || /\bupcoming\b/i.test(blob) || /\bscheduled\b/i.test(blob)) return "upcoming" as const;
  if (texts.some((text) => /^(live|live now)$/i.test(text.trim()))) return "live" as const;
  if (texts.some((text) => /^(shorts?)$/i.test(text.trim()))) return "short" as const;
  return null;
}

function pageVideo(
  id: string,
  title: string,
  texts: string[],
  index: number,
  now: Date,
  short: boolean,
): ChannelVideo | null {
  if (!ID_RE.test(id) || !title.trim()) return null;
  const published = relativeToIso(texts, now) ?? new Date(now.getTime() - index * 3_600_000).toISOString();
  const seconds = texts.map(clockSeconds).find((value) => value != null) ?? null;
  return {
    id,
    title: title.trim(),
    url: short ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
    published,
    thumbnail: `https://i.ytimg.com/vi/${id}/${short ? "hqdefault" : "maxresdefault"}.jpg`,
    description: "",
    views: parseViews(texts),
    kind: short ? "short" : "video",
    durationSeconds: seconds,
    liveStatus: null,
  };
}

/** Pull full episodes from a channel /videos document. Returns null when the page shape is unusable. */
export function parseChannelPage(html: string, now = new Date()): ChannelVideo[] | null {
  try {
    const payloads = readYtInitialData(html);
    if (payloads.length === 0) {
      console.warn("[youtube] channel page skipped. page shape changed");
      return null;
    }
    const videos: ChannelVideo[] = [];
    const seen = new Set<string>();
    const push = (video: ChannelVideo | null) => {
      if (!video || seen.has(video.id)) return;
      seen.add(video.id);
      videos.push(video);
    };

    for (const payload of payloads) {
      walk(payload, (record) => {
        const lockup = asRecord(record.lockupViewModel);
        if (!lockup || typeof lockup.contentId !== "string") return;
        const metadata = asRecord(asRecord(lockup.metadata)?.lockupMetadataViewModel);
        const title = asRecord(metadata?.title)?.content;
        if (typeof title !== "string") return;
        const texts: string[] = [];
        collectText(asRecord(metadata?.metadata)?.contentMetadataViewModel, texts);
        collectText(lockup.contentImage, texts);
        const reason = blockedReason(texts);
        if (reason === "members" || reason === "upcoming" || reason === "live") return;
        const seconds = texts.map(clockSeconds).find((value) => value != null) ?? null;
        const contentType = typeof lockup.contentType === "string" ? lockup.contentType : "";
        const short =
          reason === "short" ||
          contentType.includes("SHORT") ||
          (seconds != null && seconds > 0 && seconds <= SHORT_MAX_SECONDS);
        push(pageVideo(lockup.contentId, title, texts, videos.length, now, short));
      });
    }

    if (videos.length === 0) {
      for (const payload of payloads) {
        walk(payload, (record) => {
          const renderer = asRecord(record.videoRenderer) || asRecord(record.gridVideoRenderer);
          if (!renderer || typeof renderer.videoId !== "string") return;
          const titleRecord = asRecord(renderer.title);
          const title =
            (typeof titleRecord?.simpleText === "string" && titleRecord.simpleText) ||
            (Array.isArray(titleRecord?.runs)
              ? titleRecord.runs.map((run) => (typeof asRecord(run)?.text === "string" ? (asRecord(run)?.text as string) : "")).join("")
              : "");
          const texts: string[] = [];
          collectText(renderer.publishedTimeText, texts);
          collectText(renderer.viewCountText, texts);
          collectText(renderer.lengthText, texts);
          collectText(renderer.badges, texts);
          collectText(renderer.thumbnailOverlays, texts);
          if (renderer.upcomingEventData) texts.push("upcoming");
          const reason = blockedReason(texts);
          if (reason === "members" || reason === "upcoming" || reason === "live") return;
          const seconds = texts.map(clockSeconds).find((value) => value != null) ?? null;
          const short = reason === "short" || (seconds != null && seconds > 0 && seconds <= SHORT_MAX_SECONDS);
          push(pageVideo(renderer.videoId, title, texts, videos.length, now, short));
        });
      }
    }

    if (videos.length === 0) {
      console.warn("[youtube] channel page skipped. page shape changed");
      return null;
    }
    return videos;
  } catch {
    console.warn("[youtube] channel page skipped. page shape changed");
    return null;
  }
}

/** Pull Shorts from a channel /shorts document. Returns null when the page shape is unusable. */
export function parseShortsPage(html: string, now = new Date()): ChannelVideo[] | null {
  try {
    const payloads = readYtInitialData(html);
    if (payloads.length === 0) {
      console.warn("[youtube] shorts page skipped. page shape changed");
      return null;
    }
    const videos: ChannelVideo[] = [];
    const seen = new Set<string>();
    const push = (video: ChannelVideo | null) => {
      if (!video || seen.has(video.id) || videos.length >= LATEST_SHORTS) return;
      seen.add(video.id);
      videos.push(video);
    };

    for (const payload of payloads) {
      walk(payload, (record) => {
        const lockup = asRecord(record.shortsLockupViewModel);
        if (lockup) {
          let id = "";
          walk(lockup.onTap, (node) => {
            if (!id && typeof node.videoId === "string" && ID_RE.test(node.videoId)) id = node.videoId;
          });
          if (!id && typeof lockup.entityId === "string") {
            const match = lockup.entityId.match(/([A-Za-z0-9_-]{11})$/);
            if (match && lockup.entityId.includes(match[1])) id = match[1];
          }
          const overlay = asRecord(lockup.overlayMetadata);
          const title =
            (typeof asRecord(overlay?.primaryText)?.content === "string" && (asRecord(overlay?.primaryText)?.content as string)) ||
            (typeof lockup.accessibilityText === "string" ? lockup.accessibilityText.split(/,\s*\d/)[0] : "");
          const texts: string[] = [];
          if (typeof lockup.accessibilityText === "string") texts.push(lockup.accessibilityText);
          collectText(overlay, texts);
          const reason = blockedReason(texts);
          if (reason === "members" || reason === "upcoming" || reason === "live") return;
          push(pageVideo(id, title, texts, videos.length, now, true));
          return;
        }

        const reel = asRecord(record.reelItemRenderer);
        if (!reel || typeof reel.videoId !== "string") return;
        const headline = asRecord(reel.headline);
        const title =
          (typeof headline?.simpleText === "string" && headline.simpleText) ||
          (Array.isArray(headline?.runs)
            ? headline.runs.map((run) => (typeof asRecord(run)?.text === "string" ? (asRecord(run)?.text as string) : "")).join("")
            : "");
        const texts: string[] = [];
        collectText(reel.accessibility, texts);
        collectText(reel.navigationEndpoint, texts);
        const reason = blockedReason(texts);
        if (reason === "members" || reason === "upcoming" || reason === "live") return;
        push(pageVideo(reel.videoId, title, texts, videos.length, now, true));
      });
    }

    if (videos.length === 0) {
      console.warn("[youtube] shorts page skipped. page shape changed");
      return null;
    }
    return videos;
  } catch {
    console.warn("[youtube] shorts page skipped. page shape changed");
    return null;
  }
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

function finish(
  videos: ChannelVideo[],
  source: SourceName,
  shortsSource: ShortsSourceName,
  now: Date,
  degraded: boolean,
  error?: string,
): LoadResult {
  const picked = selectLatest(videos, now);
  return {
    videos: [...picked.episodes, ...picked.shorts],
    source: degraded ? "snapshot" : source,
    shortsSource: picked.shorts.length === 0 ? "none" : shortsSource,
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
    return finish([...snapshotEpisodes(), ...snapshotShorts()], "snapshot", "snapshot", now, true);
  }

  const readPage = (url: string) => readText(url, fetchImpl, timeoutMs, PAGE_HEADERS);

  const loadFullEpisodes = async () => {
    for (const url of [CHANNEL_PAGE, CHANNEL_VIDEOS_URL]) {
      try {
        const videos = await withRetry(async () => {
          const parsed = parseChannelPage(await readPage(url), now);
          if (!parsed || !parsed.some((video) => isAiredEpisode(video, now))) throw new Error("channel page unusable");
          return parsed;
        }, backoffMs);
        return { videos, source: "channel-page" as const };
      } catch (error) {
        const message = error instanceof Error ? error.message : "failed";
        failures.push(`channel-page ${message}`);
        if (!message.includes("unusable")) console.warn(`[youtube] channel page skipped. ${message}`);
      }
    }

    const tryRss = async (url: string) => {
      const xml = await readText(url, fetchImpl, timeoutMs, { Accept: "application/atom+xml, application/xml" });
      const parsed = parseFeed(xml);
      if (parsed === null) throw new Error("malformed feed");
      if (!parsed.some((video) => isAiredEpisode(video, now))) throw new Error("no aired episodes");
      return parsed;
    };

    try {
      return { videos: await withRetry(() => tryRss(RSS_FEED), backoffMs), source: "rss" as const };
    } catch (error) {
      failures.push(`rss ${error instanceof Error ? error.message : "failed"}`);
    }

    try {
      return { videos: await withRetry(() => tryRss(UPLOADS_FEED), backoffMs), source: "uploads" as const };
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
        return { videos, source: "data-api" as const };
      } catch (error) {
        failures.push(`data-api ${error instanceof Error ? error.message : "failed"}`);
      }
    }

    return null;
  };

  const loadShorts = async () => {
    for (const url of [SHORTS_PAGE, HANDLE_SHORTS_URL]) {
      try {
        const videos = await withRetry(async () => {
          const parsed = parseShortsPage(await readPage(url), now);
          if (!parsed || parsed.length === 0) throw new Error("shorts page unusable");
          return parsed;
        }, backoffMs);
        return videos;
      } catch (error) {
        const message = error instanceof Error ? error.message : "failed";
        failures.push(`shorts-page ${message}`);
        if (!message.includes("unusable")) console.warn(`[youtube] shorts page skipped. ${message}`);
      }
    }
    return null;
  };

  const [episodes, shorts] = await Promise.all([loadFullEpisodes(), loadShorts()]);
  const degraded = !episodes;
  const error = degraded ? failures.join("; ") : undefined;
  return finish(
    [...(episodes?.videos ?? snapshotEpisodes()), ...(shorts ?? snapshotShorts())],
    episodes?.source ?? "snapshot",
    shorts ? "shorts-page" : "snapshot",
    now,
    degraded,
    error,
  );
}

export function fullEpisodes(videos: ChannelVideo[]) {
  return videos.filter((video) => video.kind === "video" && isAiredEpisode(video));
}

export function shortsFrom(videos: ChannelVideo[]) {
  return videos.filter((video) => isShort(video));
}

export function heroShortIds(videos: ChannelVideo[]) {
  return shortsFrom(videos)
    .slice(0, LATEST_SHORTS)
    .map((short) => short.id);
}
