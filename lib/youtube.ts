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

const FEED =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCynpQXiIDMLylarxGZZz9Dg";

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

export function mentionsJets(video: ChannelVideo) {
  if (/jets/i.test(video.title)) return true;
  const chapters = video.description.split(/chapters:/i)[1] ?? "";
  const chapterBlock = chapters.split(/#BartScott/i)[0];
  return /jets/i.test(chapterBlock);
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
    const videos = await Promise.all(
      parsed.map(async (video) => ({
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
