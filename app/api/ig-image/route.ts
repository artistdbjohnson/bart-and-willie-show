import { instagramCdn } from "@/lib/instagram";

function allowed(url: URL) {
  return instagramCdn(url);
}

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src) return new Response("Missing image", { status: 400 });

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return new Response("Bad image", { status: 400 });
  }
  if (!allowed(target)) return new Response("Blocked", { status: 400 });

  try {
    const upstream = await fetch(target, {
      redirect: "error",
      signal: AbortSignal.timeout(12000),
      headers: { Accept: "image/avif,image/webp,image/*,*/*" },
      next: { revalidate: 3600 },
    });
    if (!upstream.ok) return new Response("Unavailable", { status: 502 });
    const type = upstream.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return new Response("Not an image", { status: 502 });
    const bytes = await upstream.arrayBuffer();
    return new Response(bytes, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }
}
