import { instagramCdn } from "@/lib/instagram";

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src) return new Response("Missing video", { status: 400 });

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return new Response("Bad video", { status: 400 });
  }
  if (!instagramCdn(target)) return new Response("Blocked", { status: 400 });

  try {
    const upstream = await readVideo(request, target);
    if (!upstream) return new Response("Unavailable", { status: 502 });
    const type = upstream.headers.get("content-type") ?? "";
    if (!type.startsWith("video/")) return new Response("Not a video", { status: 502 });
    const headers = new Headers();
    headers.set("Content-Type", type);
    headers.set("Cache-Control", "private, max-age=300");
    headers.set("Accept-Ranges", upstream.headers.get("accept-ranges") ?? "bytes");
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    const range = upstream.headers.get("content-range");
    if (range) headers.set("Content-Range", range);
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }
}

async function readVideo(request: Request, target: URL) {
  const headers = new Headers({ Accept: "video/mp4,video/*" });
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);
  const first = await fetch(target, {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
  });
  if (first.status < 300 || first.status >= 400) return first.ok || first.status === 206 ? first : null;
  const location = first.headers.get("location");
  if (!location) return null;
  const next = new URL(location, target);
  if (!instagramCdn(next)) return null;
  const second = await fetch(next, {
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
  return second.ok || second.status === 206 ? second : null;
}
