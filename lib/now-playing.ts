import { cleanTitle } from "@/lib/youtube-load";

export const SHOW_RSS =
  "https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/780a5f49-06e2-493a-b92b-b4c800c852ef/449fff55-e3dc-4082-98b7-b4c800c857da/podcast.rss";

export type NowPlaying = {
  title: string;
  audio: string | null;
  duration: number | null;
  date?: string | null;
};

const FALLBACK: NowPlaying = { title: "The Bart & Willie Show", audio: null, duration: null };

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .trim();
}

/** Newest episode from the public iHeart/Omny RSS. The enclosure URL is kept intact (Podtrac prefix) so plays count. */
export async function getNowPlaying(): Promise<NowPlaying> {
  const result = { ...FALLBACK };
  try {
    const xml = await (await fetch(SHOW_RSS, { next: { revalidate: 900 }, signal: AbortSignal.timeout(10000) })).text();
    const item = xml.split("<item>")[1] ?? "";
    const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const audio = item.match(/<enclosure[^>]*url="([^"]+)"/)?.[1];
    const duration = item.match(/<itunes:duration>(\d+)<\/itunes:duration>/)?.[1];
    if (title) result.title = cleanTitle(decode(title));
    if (audio) result.audio = decode(audio);
    if (duration) result.duration = Number(duration);
  } catch {
    /* keep fallback */
  }
  return result;
}

/** Latest full episodes (with an audio enclosure) from the same RSS and 15-min cache the cron revalidates. */
export async function getEpisodes(limit = 10): Promise<NowPlaying[]> {
  try {
    const xml = await (await fetch(SHOW_RSS, { next: { revalidate: 900 }, signal: AbortSignal.timeout(10000) })).text();
    const out: NowPlaying[] = [];
    for (const item of xml.split("<item>").slice(1)) {
      const type = item.match(/<itunes:episodeType>([\s\S]*?)<\/itunes:episodeType>/)?.[1]?.trim();
      if (type && type !== "full") continue;
      const audio = item.match(/<enclosure[^>]*url="([^"]+)"/)?.[1];
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1];
      if (!audio || !title) continue;
      const duration = item.match(/<itunes:duration>(\d+)<\/itunes:duration>/)?.[1];
      const pub = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
      const d = pub ? new Date(decode(pub)) : null;
      out.push({
        title: cleanTitle(decode(title)),
        audio: decode(audio),
        duration: duration ? Number(duration) : null,
        date: d && !Number.isNaN(d.getTime()) ? d.toISOString() : null,
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}
