import { existsSync } from "node:fs";
import { HERO_STILL, loadEpisodes, parseFeed, type ChannelVideo } from "../lib/youtube-load.ts";

const splash = "public/hero/splash.jpg";
if (!existsSync(splash)) throw new Error(`missing splash ${splash}`);

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function episode(id: string, title: string, published: string, url?: string): ChannelVideo {
  return {
    id,
    title,
    url: url ?? `https://www.youtube.com/watch?v=${id}`,
    published,
    thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    description: "",
    views: null,
    kind: "video",
  };
}

function rss(entries: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"><title>show</title>${entries}</feed>`;
}

function entry(video: ChannelVideo) {
  return `<entry><yt:videoId>${video.id}</yt:videoId><title>${video.title}</title><published>${video.published}</published><link rel="alternate" href="${video.url}"/><media:title>${video.title}</media:title></entry>`;
}

const real = episode("ccccccccccc", "Real episode", "2026-10-05T20:00:00.000Z");
const premiere = episode("aaaaaaaaaaa", "Future premiere", "2099-01-01T00:00:00.000Z");
const short = episode("bbbbbbbbbbb", "A short", "2026-10-04T00:00:00.000Z", "https://www.youtube.com/shorts/bbbbbbbbbbb");
const goodRss = rss([real, premiere, short].map(entry).join(""));

function routingFetch(mode: "all-fail" | "rss" | "uploads" | "api") {
  return async (url: string) => {
    const fail = () => Promise.reject(new Error(`forced fail ${url}`));
    if (mode === "all-fail") return fail();
    if (url.includes("playlist_id=")) {
      if (mode === "uploads") {
        return new Response(goodRss, { status: 200 });
      }
      return fail();
    }
    if (url.includes("googleapis.com")) {
      if (mode === "api") {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "ddddddddddd",
                snippet: { title: "Api episode", publishedAt: "2026-10-05T21:00:00.000Z", liveBroadcastContent: "none" },
                contentDetails: { duration: "PT45M" },
              },
              {
                id: "eeeeeeeeeee",
                snippet: { title: "Upcoming live", publishedAt: "2026-10-05T22:00:00.000Z", liveBroadcastContent: "upcoming" },
                contentDetails: { duration: "PT1H" },
              },
              {
                id: "fffffffffff",
                snippet: { title: "Tiny short", publishedAt: "2026-10-05T12:00:00.000Z", liveBroadcastContent: "none" },
                contentDetails: { duration: "PT45S" },
              },
            ],
          }),
          { status: 200 },
        );
      }
      return fail();
    }
    if (url.includes("feeds/videos.xml")) {
      if (mode === "rss") return new Response(goodRss, { status: 200 });
      return fail();
    }
    return fail();
  };
}

const base = { timeoutMs: 200, backoffMs: 0, apiKey: "test-key" as string | null };

const allFail = await loadEpisodes({ ...base, apiKey: null, fetch: routingFetch("all-fail") });
assert(allFail.source === "snapshot", `all-fail source ${allFail.source}`);
assert(allFail.degraded, "all-fail should be degraded");
assert(allFail.videos.filter((video) => video.kind === "video").length === 6, "all-fail should keep 6 episodes");
assert(allFail.videos[0]?.id === "XqJmpZv5YkA", `all-fail lead ${allFail.videos[0]?.id}`);
assert(!allFail.videos.some((video) => video.url.includes("/shorts/")), "snapshot must not include shorts");

const fromRss = await loadEpisodes({ ...base, fetch: routingFetch("rss") });
assert(fromRss.source === "rss", `rss source ${fromRss.source}`);
assert(fromRss.videos[0]?.id === "ccccccccccc", `rss lead ${fromRss.videos[0]?.id}`);
assert(fromRss.videos.filter((video) => video.kind === "video").length === 6, "rss should pad to 6");
assert(!fromRss.videos.some((video) => video.id === "aaaaaaaaaaa"), "future premiere leaked");
assert(!fromRss.videos.some((video) => video.kind === "video" && video.url.includes("/shorts/")), "short leaked into episodes");

const fromUploads = await loadEpisodes({ ...base, fetch: routingFetch("uploads") });
assert(fromUploads.source === "uploads", `uploads source ${fromUploads.source}`);
assert(fromUploads.videos[0]?.id === "ccccccccccc", "uploads lead");
assert(fromUploads.videos.filter((video) => video.kind === "video").length === 6, "uploads should pad to 6");

const fromApi = await loadEpisodes({ ...base, fetch: routingFetch("api") });
assert(fromApi.source === "data-api", `api source ${fromApi.source}`);
assert(fromApi.videos[0]?.id === "ddddddddddd", `api lead ${fromApi.videos[0]?.id}`);
const apiEpisodes = fromApi.videos.filter((video) => video.kind === "video");
assert(!fromApi.videos.some((video) => video.id === "eeeeeeeeeee"), "upcoming live leaked");
assert(!apiEpisodes.some((video) => video.id === "fffffffffff"), "duration short leaked into episodes");
assert(apiEpisodes.length === 6, "api should pad to 6");

assert(parseFeed("<!DOCTYPE html><html><body>404</body></html>") === null, "html should be malformed");
assert(parseFeed("<feed></feed>")?.length === 0, "empty feed should be empty, not malformed");
assert(parseFeed("<feed><entry><title>no id</title></entry></feed>") === null, "entry without id and date should be malformed");

assert(HERO_STILL === "/hero/splash.jpg", "splash path");
console.log("youtube fallback checks passed");
console.log(JSON.stringify({
  splash: HERO_STILL,
  lead: allFail.videos[0],
  count: allFail.videos.filter((video) => video.kind === "video").length,
}, null, 2));
