import { cleanTitle } from "@/lib/youtube-load";

export const SHOW_RSS =
  "https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/780a5f49-06e2-493a-b92b-b4c800c852ef/449fff55-e3dc-4082-98b7-b4c800c857da/podcast.rss";
export const SPOTIFY_SHOW = "https://open.spotify.com/show/2w5aO4vXMSzNwsQQ7gcyml";

export type NowPlaying = {
  title: string;
  audio: string | null;
  duration: number | null;
  spotifyEpisode: string | null;
  spotifyUrl: string;
};

const FALLBACK: NowPlaying = { title: "The Bart & Willie Show", audio: null, duration: null, spotifyEpisode: null, spotifyUrl: SPOTIFY_SHOW };

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .trim();
}

/** Newest episode: audio from the public iHeart/Omny RSS, Spotify episode id from the show page. */
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
  try {
    const html = await (
      await fetch(SPOTIFY_SHOW, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 900 }, signal: AbortSignal.timeout(10000) })
    ).text();
    const id = html.match(/\/episode\/([A-Za-z0-9]{22})/)?.[1];
    if (id) {
      result.spotifyEpisode = id;
      result.spotifyUrl = `https://open.spotify.com/episode/${id}`;
    }
  } catch {
    /* keep show link */
  }
  return result;
}
