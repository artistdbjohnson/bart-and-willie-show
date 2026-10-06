import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HeroShortMark } from "../components/hero-short-mark.ts";
import {
  HERO_STILL,
  heroShortIds,
  loadEpisodes,
  parseChannelPage,
  parseFeed,
  parseShortsPage,
  shortsFrom,
  type ChannelVideo,
} from "../lib/youtube-load.ts";

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

const channelFixture = readFileSync("data/fixtures/channel-videos.html", "utf8");
const shortsFixture = readFileSync("data/fixtures/channel-shorts.html", "utf8");
const when = new Date("2026-10-06T18:00:00.000Z");

function routingFetch(mode: "all-fail" | "rss" | "uploads" | "api" | "channel" | "shorts" | "shape") {
  return async (url: string) => {
    const fail = () => Promise.reject(new Error(`forced fail ${url}`));
    const path = new URL(url).pathname.replace(/\/$/, "");
    if (path.endsWith("/shorts")) {
      if (mode === "shorts") return new Response(shortsFixture, { status: 200 });
      if (mode === "shape") return new Response("<html><body>shape changed</body></html>", { status: 200 });
      return fail();
    }
    if (path.endsWith("/videos")) {
      if (mode === "channel") return new Response(channelFixture, { status: 200 });
      if (mode === "shape") return new Response("<html><body>shape changed</body></html>", { status: 200 });
      return fail();
    }
    if (mode === "all-fail" || mode === "channel" || mode === "shorts" || mode === "shape") return fail();
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
assert(allFail.shortsSource === "snapshot", `all-fail shorts source ${allFail.shortsSource}`);
assert(shortsFrom(allFail.videos)[0]?.id === "cvcxk8W9pWU", "snapshot shorts lead");
assert(shortsFrom(allFail.videos).length === 8, "snapshot should keep 8 shorts");
assert(!allFail.videos.some((video) => video.kind === "video" && video.url.includes("/shorts/")), "shorts leaked into episodes");

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

const parsedChannel = parseChannelPage(channelFixture, when);
assert(parsedChannel?.[0]?.id === "fixturvid01", "channel fixture lead");
assert(parsedChannel?.some((video) => video.id === "airedprem01"), "aired premiere stays");
assert(!parsedChannel?.some((video) => video.id === "memberonly1"), "members only dropped");
assert(!parsedChannel?.some((video) => video.id === "premierein1"), "upcoming premiere dropped");
assert(!parsedChannel?.some((video) => video.id === "livestream1"), "live dropped");
assert(parsedChannel?.find((video) => video.id === "shortvid001")?.kind === "short", "short duration dropped from episodes");
assert(parseChannelPage("<html><body>no ytInitialData</body></html>") === null, "channel shape returns null");

const parsedShorts = parseShortsPage(shortsFixture, when);
assert(parsedShorts?.map((video) => video.id).join(",") === "shortfix001,reelshort01", `shorts fixture ${parsedShorts?.map((video) => video.id)}`);
assert(parseShortsPage("<html><body>no ytInitialData</body></html>") === null, "shorts shape returns null");

const fromChannel = await loadEpisodes({ ...base, now: when, fetch: routingFetch("channel") });
assert(fromChannel.source === "channel-page", `channel source ${fromChannel.source}`);
assert(fromChannel.videos[0]?.id === "fixturvid01", `channel lead ${fromChannel.videos[0]?.id}`);
assert(fromChannel.videos.filter((video) => video.kind === "video").length === 6, "channel should pad to 6");
assert(!fromChannel.videos.some((video) => ["memberonly1", "premierein1", "livestream1"].includes(video.id)), "channel junk leaked");
assert(fromChannel.shortsSource === "snapshot", "channel mode falls shorts back to snapshot");
assert(shortsFrom(fromChannel.videos).some((video) => video.id === "cvcxk8W9pWU"), "snapshot short survives channel success");

const fromShorts = await loadEpisodes({ ...base, now: when, apiKey: null, fetch: routingFetch("shorts") });
assert(fromShorts.source === "snapshot", `shorts-mode episodes ${fromShorts.source}`);
assert(fromShorts.shortsSource === "shorts-page", `shorts source ${fromShorts.shortsSource}`);
assert(shortsFrom(fromShorts.videos)[0]?.id === "shortfix001", "live short leads");
assert(!fromShorts.videos.some((video) => video.id === "memshort001"), "members short leaked");
assert(fromShorts.videos.filter((video) => video.kind === "video").length === 6, "shorts mode keeps 6 episodes");

const warnings: string[] = [];
const warn = console.warn;
console.warn = (...args: unknown[]) => {
  warnings.push(args.map(String).join(" "));
};
let fromShape: Awaited<ReturnType<typeof loadEpisodes>>;
try {
  fromShape = await loadEpisodes({ ...base, now: when, apiKey: null, fetch: routingFetch("shape") });
} finally {
  console.warn = warn;
}
assert(fromShape!.source === "snapshot", `shape source ${fromShape!.source}`);
assert(fromShape!.shortsSource === "snapshot", `shape shorts ${fromShape!.shortsSource}`);
assert(fromShape!.videos[0]?.id === "XqJmpZv5YkA", "shape falls back to snapshot episodes");
assert(shortsFrom(fromShape!.videos)[0]?.id === "cvcxk8W9pWU", "shape falls back to snapshot shorts");
assert(warnings.some((line) => line.includes("page shape changed")), "shape change should warn");

function hangingFetch() {
  return async (_url: string, init?: RequestInit) => {
    await new Promise((_resolve, reject) => {
      const abort = () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
      if (init?.signal?.aborted) {
        abort();
        return;
      }
      init?.signal?.addEventListener("abort", abort, { once: true });
    });
    return new Response("");
  };
}

const fromTimeout = await loadEpisodes({ ...base, timeoutMs: 40, apiKey: null, fetch: hangingFetch() });
assert(fromTimeout.source === "snapshot", `timeout source ${fromTimeout.source}`);
assert(fromTimeout.shortsSource === "snapshot", `timeout shorts ${fromTimeout.shortsSource}`);
assert(fromTimeout.videos.filter((video) => video.kind === "video").length === 6, "timeout keeps 6 episodes");
assert(shortsFrom(fromTimeout.videos).length === 8, "timeout keeps snapshot shorts");

const homeIds = heroShortIds(allFail.videos);
const homeHtml = renderToStaticMarkup(createElement(HeroShortMark, { ids: homeIds }));
assert(homeHtml.includes("cvcxk8W9pWU"), "rendered home page includes a short id");
assert(renderToStaticMarkup(createElement(HeroShortMark, { ids: [] })) === "", "empty shorts render nothing");
const homeSource = readFileSync("components/home-page.tsx", "utf8");
const cycleSource = readFileSync("components/hero-cycle.tsx", "utf8");
assert(homeSource.includes("HeroShortMark"), "home page renders the short ids");
assert(homeSource.includes("heroShortIds"), "home page reads the short list");
assert(cycleSource.includes("shorts.length === 0"), "empty shorts do not start a player");
assert(cycleSource.includes("shorts.length > 0"), "empty shorts do not mount a player");
assert(!homeHtml.includes("did not load"), "short mark has no error line");

console.log("youtube fallback checks passed");
console.log(JSON.stringify({
  splash: HERO_STILL,
  lead: allFail.videos[0],
  count: allFail.videos.filter((video) => video.kind === "video").length,
}, null, 2));
