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

export function shortsFrom(videos: ChannelVideo[]) {
  return videos.filter((video) => video.kind === "short");
}

export async function titleFrame(video: Pick<ChannelVideo, "id" | "thumbnail">) {
  const max = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
  try {
    const response = await fetch(max, { method: "HEAD", next: { revalidate: 1800 } });
    if (response.ok && response.headers.get("content-type")?.includes("image")) return max;
  } catch {
    /* the feed thumbnail is the frame YouTube already published */
  }
  return video.thumbnail;
}

export type ShortBeat = {
  id: string;
  poster: string;
  src: string | null;
};

// A direct file, when YouTube will hand one over. Otherwise the beat is the poster.
export async function shortFile(id: string): Promise<string | null> {
  try {
    const response = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip",
      },
      body: JSON.stringify({
        videoId: id,
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "20.10.38",
            androidSdkVersion: 34,
            hl: "en",
            gl: "US",
            osName: "Android",
            osVersion: "14",
          },
        },
      }),
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      playabilityStatus?: { status?: string };
      streamingData?: {
        formats?: { mimeType?: string; url?: string; contentLength?: string }[];
      };
    };
    if (payload.playabilityStatus?.status !== "OK") return null;
    const files = (payload.streamingData?.formats ?? []).filter(
      (format) => format.url && format.mimeType?.includes("video/mp4"),
    );
    files.sort((a, b) => Number(a.contentLength ?? 0) - Number(b.contentLength ?? 0));
    const file = files.find((format) => Number(format.contentLength ?? 0) > 0) ?? files[0];
    return file?.url ?? null;
  } catch {
    return null;
  }
}
