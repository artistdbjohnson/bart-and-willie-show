export type ChannelVideo = {
  id: string;
  title: string;
  url: string;
  published: string;
  thumbnail: string;
  description: string;
  views: number | null;
  kind: "video" | "short";
};

const CHANNEL_ID = "UCynpQXiIDMLylarxGZZz9Dg";
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const VIDEOS_TAB = `https://www.youtube.com/channel/${CHANNEL_ID}/videos`;
const LATEST_EPISODES = 6;

export const CHANNEL_URL = "https://www.youtube.com/@bartandwillieshow";

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

export function parseFeed(xml: string): ChannelVideo[] {
  return xml
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
      const description = tag(
        block,
        /<media:description>([\s\S]*?)<\/media:description>/,
      );
      const viewsMatch = block.match(/views="(\d+)"/);
      if (!id || !title || !url) return null;
      const video: ChannelVideo = {
        id,
        title,
        url,
        published,
        thumbnail:
          thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        description,
        views: viewsMatch ? Number(viewsMatch[1]) : null,
        kind: url.includes("/shorts/") ? "short" : "video",
      };
      return video;
    })
    .filter((video): video is ChannelVideo => video !== null);
}

type TabEpisode = { id: string; title: string; when: string };

function relativeToIso(label: string) {
  const match = label.trim().match(/^(\d+)\s*(mo|w|d|h|m|s|y)\s*ago$/i);
  if (!match) return "";
  const count = Number(match[1]);
  const unit = match[2].toLowerCase();
  const day = 86_400_000;
  const span =
    unit === "s"
      ? 1000
      : unit === "m"
        ? 60_000
        : unit === "h"
          ? 3_600_000
          : unit === "d"
            ? day
            : unit === "w"
              ? 7 * day
              : unit === "mo"
                ? 30 * day
                : 365 * day;
  return new Date(Date.now() - count * span).toISOString();
}

function parseVideosTab(html: string): TabEpisode[] {
  const marker = html.indexOf("ytInitialData");
  const start = html.indexOf("{", marker);
  if (marker < 0 || start < 0) return [];
  let depth = 0;
  let end = -1;
  for (let i = start; i < html.length; i += 1) {
    const char = html[i];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) return [];
  let data: unknown;
  try {
    data = JSON.parse(html.slice(start, end));
  } catch {
    return [];
  }
  const found: TabEpisode[] = [];
  const seen = new Set<string>();
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const record = node as Record<string, unknown>;
    const lockup = record.lockupViewModel;
    if (lockup && typeof lockup === "object") {
      const view = lockup as Record<string, unknown>;
      const id = typeof view.contentId === "string" ? view.contentId : "";
      const metadata = view.metadata as { lockupMetadataViewModel?: { title?: { content?: string }; metadata?: { contentMetadataViewModel?: { metadataRows?: { metadataParts?: { text?: { content?: string } }[] }[] } } } } | undefined;
      const title = metadata?.lockupMetadataViewModel?.title?.content ?? "";
      const parts =
        metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.flatMap(
          (row) => row.metadataParts ?? [],
        ) ?? [];
      const when = parts.map((part) => part.text?.content ?? "").find((text) => /\d+\s*(?:mo|[smhdwy])\s*ago/i.test(text)) ?? "";
      if (id && title && !seen.has(id)) {
        seen.add(id);
        found.push({ id, title, when });
      }
    }
    Object.values(record).forEach(walk);
  };
  walk(data);
  return found;
}

/** The videos tab is full episodes, newest first. The RSS window is mostly Shorts. */
async function newestFullEpisodes(rss: ChannelVideo[]): Promise<ChannelVideo[]> {
  const fallback = fullEpisodes(rss).slice(0, LATEST_EPISODES);
  try {
    const response = await fetch(VIDEOS_TAB, {
      headers: {
        Accept: "text/html",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 1800 },
    });
    if (!response.ok) return fallback;
    const tab = parseVideosTab(await response.text()).slice(0, LATEST_EPISODES);
    if (tab.length === 0) return fallback;
    const byId = new Map(rss.map((video) => [video.id, video]));
    return tab.map((item) => {
      const known = byId.get(item.id);
      if (known) return { ...known, kind: "video" as const };
      return {
        id: item.id,
        title: item.title,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        published: relativeToIso(item.when),
        thumbnail: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
        description: "",
        views: null,
        kind: "video" as const,
      };
    });
  } catch {
    return fallback;
  }
}

export async function getChannel(): Promise<
  { ok: true; videos: ChannelVideo[] } | { ok: false; videos: [] }
> {
  try {
    const response = await fetch(FEED, {
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 1800 },
    });
    if (!response.ok) return { ok: false, videos: [] };
    const parsed = parseFeed(await response.text());
    if (parsed.length === 0) return { ok: false, videos: [] };
    const episodes = await newestFullEpisodes(parsed);
    const seen = new Set(episodes.map((video) => video.id));
    const merged = [...episodes, ...parsed.filter((video) => !seen.has(video.id))];
    const videos = await Promise.all(
      merged.map(async (video) => ({
        ...video,
        thumbnail: await sharpFrame(video.id, video.thumbnail),
      })),
    );
    return { ok: true, videos };
  } catch {
    return { ok: false, videos: [] };
  }
}

export function fullEpisodes(videos: ChannelVideo[]) {
  return videos.filter((video) => video.kind === "video");
}

/** The Oct 2, 2026 show. Wren's featured line stays on this episode only. */
export function isOct2Show(video: Pick<ChannelVideo, "id" | "published" | "title">) {
  if (video.id === "uKSv6ZVq4xc") return true;
  if (video.published.slice(0, 10) !== "2026-10-02") return false;
  return /Honest Take on Jets/i.test(video.title);
}

export function shortsFrom(videos: ChannelVideo[]) {
  return videos.filter((video) => video.kind === "short");
}

export type ShortBeat = { id: string };

type FrameHit = { url: string; pixels: number };

const frameMemo = new Map<string, Promise<string>>();

function jpegSize(bytes: Uint8Array) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i < bytes.length - 8) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const height = (bytes[i + 5] << 8) | bytes[i + 6];
      const width = (bytes[i + 7] << 8) | bytes[i + 8];
      return { width, height };
    }
    const size = (bytes[i + 2] << 8) | bytes[i + 3];
    if (size < 2) return null;
    i += 2 + size;
  }
  return null;
}

async function probeFrame(url: string): Promise<FrameHit | null> {
  try {
    const response = await fetch(url, {
      headers: { Range: "bytes=0-65535" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });
    if (!response.ok && response.status !== 206) return null;
    const size = jpegSize(new Uint8Array(await response.arrayBuffer()));
    if (!size) return null;
    const long = Math.max(size.width, size.height);
    if (long < 720) return null;
    return { url, pixels: size.width * size.height };
  } catch {
    return null;
  }
}

/** Largest real YouTube frame. Skips the 120px placeholder and hq/mq defaults. */
export function sharpFrame(id: string, fallback: string) {
  const cached = frameMemo.get(id);
  if (cached) return cached;
  const pending = (async () => {
    const hits = (
      await Promise.all([
        probeFrame(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`),
        probeFrame(`https://i.ytimg.com/vi/${id}/oardefault.jpg`),
      ])
    ).filter((hit): hit is FrameHit => hit !== null);
    hits.sort((a, b) => b.pixels - a.pixels);
    return hits[0]?.url ?? fallback;
  })();
  frameMemo.set(id, pending);
  return pending;
}

export async function titleFrame(video: Pick<ChannelVideo, "id" | "thumbnail">) {
  return sharpFrame(video.id, video.thumbnail);
}
