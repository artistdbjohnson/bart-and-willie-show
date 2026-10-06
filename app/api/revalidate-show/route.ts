import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * Refresh the show pages on demand.
 *
 * A Vercel Cron entry cannot live in vercel.json: that file must stay exactly
 * `{ "cleanUrls": true, "trailingSlash": false }`.
 * In the Vercel project, add a Cron Job that GETs `/api/revalidate-show`
 * every 15 minutes (Dashboard → Settings → Cron Jobs, or `vercel cron`).
 * When `CRON_SECRET` or `REVALIDATE_SECRET` is set, the request must send
 * `Authorization: Bearer <secret>`. Vercel Cron does that automatically for
 * `CRON_SECRET`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || process.env.REVALIDATE_SECRET;
  if (secret) {
    const header = request.headers.get("authorization") ?? "";
    const provided = header.replace(/^Bearer\s+/i, "");
    if (provided !== secret) {
      return Response.json({ ok: false }, { status: 401 });
    }
  }

  revalidateTag("youtube-channel", { expire: 0 });
  revalidatePath("/", "page");
  revalidatePath("/pt", "page");
  revalidatePath("/episodes", "page");
  revalidatePath("/pt/episodes", "page");
  return Response.json({ ok: true, revalidated: ["/", "/pt", "/episodes", "/pt/episodes"] });
}
