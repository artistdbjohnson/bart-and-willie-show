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

export function excerpt(description: string) {
  const cut = description.split(/chapters:/i)[0].replace(/\s+/g, " ").trim();
  if (!cut) return "";
  if (cut.length <= 240) return cut;
  return `${cut.slice(0, 220).replace(/\s+\S*$/, "")}…`;
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
    const videos = parseFeed(await response.text());
    if (videos.length === 0) return { ok: false, videos: [] };
    return { ok: true, videos };
  } catch {
    return { ok: false, videos: [] };
  }
}

export function fullEpisodes(videos: ChannelVideo[]) {
  return videos.filter((video) => video.kind === "video");
}
