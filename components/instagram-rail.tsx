import { Rail } from "@/components/rail";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { INSTAGRAM_URL, type InstagramFeed } from "@/lib/instagram";
import type { Locale } from "@/lib/paths";

export function InstagramRail({
  locale,
  feed,
  nested = false,
}: {
  locale: Locale;
  feed: InstagramFeed;
  nested?: boolean;
}) {
  const t = copy[locale];
  const body = (
    <>
      {nested ? (
        <div>
          <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">
            {t.instagram.kicker}
          </p>
          <h2 className="mt-2 font-display text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.86] tracking-tight">
            {t.instagram.title}
          </h2>
          <p className="mt-3 max-w-xl font-serif text-base text-chalk/85">{t.instagram.lede}</p>
        </div>
      ) : (
        <SectionHeading kicker={t.instagram.kicker} title={t.instagram.title} lede={t.instagram.lede} />
      )}
      <div className={nested ? "mt-6" : "mt-10"}>
        {!feed.ok ? (
            <div className="border border-dashed border-chalk/35 px-6 py-10">
              <p className="max-w-xl font-serif text-lg">{t.instagram.empty}</p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <a href={INSTAGRAM_URL}>{t.instagram.profile}</a>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-6 font-ui text-[0.68rem] uppercase tracking-[0.16em] text-quiet">
                {t.instagram.count(feed.posts.length, feed.reportedCount)}
              </p>
              <Rail
                label={t.instagram.region}
                previous={t.instagram.previous}
                next={t.instagram.next}
              >
                {feed.posts.map((post) => (
                  <a
                    key={post.id}
                    href={post.permalink}
                    className="group w-[78%] shrink-0 snap-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chalk sm:w-[280px]"
                  >
                    <span className="relative block aspect-square overflow-hidden bg-field-bright/25">
                      {/* Instagram CDN links expire, so the image is loaded through this site. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/ig-image?src=${encodeURIComponent(post.imageUrl)}`}
                        alt=""
                        width={640}
                        height={640}
                        className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="mt-3 block font-ui text-[0.66rem] uppercase tracking-[0.16em] text-quiet">
                      {post.kind === "clip" ? t.instagram.clip : t.instagram.post}
                    </span>
                    {post.caption ? (
                      <span className="mt-2 line-clamp-3 block font-serif text-base leading-snug">
                        {post.caption}
                      </span>
                    ) : null}
                  </a>
                ))}
              </Rail>
              <div className="mt-8">
                <Button asChild variant="outline">
                  <a href={INSTAGRAM_URL}>{t.instagram.profile}</a>
                </Button>
              </div>
            </>
          )}
      </div>
    </>
  );

  if (nested) {
    return (
      <article className="flex h-full min-h-0 flex-col bg-field">
        <div className="h-1 shrink-0 bg-signal" />
        <div className="min-h-0 flex-1 overflow-auto px-5 py-6 sm:px-8 sm:py-8">{body}</div>
      </article>
    );
  }

  return (
    <section className="border-t border-chalk/15">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">{body}</div>
    </section>
  );
}
