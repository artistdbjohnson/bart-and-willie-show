import { ProfileTicker } from "@/components/profile-ticker";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { INSTAGRAM_URL, type InstagramFeed } from "@/lib/instagram";
import type { Locale } from "@/lib/paths";

export function InstagramRail({
  locale,
  feed,
  nested = false,
  flow = false,
}: {
  locale: Locale;
  feed: InstagramFeed;
  nested?: boolean;
  flow?: boolean;
}) {
  const t = copy[locale];
  const compact = nested || flow;
  const body = (
    <>
      {compact ? (
        <div className={nested ? "shrink-0 pr-14 sm:pr-0" : undefined}>
          <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">
            {t.instagram.kicker}
          </p>
          <h2 className="mt-2 font-serif text-[clamp(1.6rem,3.4vw,2.4rem)] leading-tight">
            {t.instagram.title}
          </h2>
          <p className="mt-2 max-w-xl font-serif text-base text-chalk/85">{t.instagram.lede}</p>
        </div>
      ) : (
        <SectionHeading kicker={t.instagram.kicker} title={t.instagram.title} lede={t.instagram.lede} />
      )}
      <div className={nested ? "mt-2 flex min-h-0 flex-1 flex-col" : compact ? "mt-6" : "mt-10"}>
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
            <p className={nested ? "mb-2 shrink-0 font-ui text-[0.68rem] uppercase tracking-[0.16em] text-quiet sm:mb-3" : "mb-6 font-ui text-[0.68rem] uppercase tracking-[0.16em] text-quiet"}>
              {t.instagram.count(feed.posts.length, feed.reportedCount)}
            </p>
            <ProfileTicker
              fill={nested}
              posts={feed.posts}
              previous={t.instagram.previous}
              next={t.instagram.next}
              pause={t.instagram.pause}
              play={t.instagram.play}
              region={t.instagram.region}
              close={t.nav.close}
              mute={t.hero.mute}
              unmute={t.hero.unmute}
              thePost={t.instagram.thePost}
              postLabel={t.instagram.post}
              clipLabel={t.instagram.clip}
            />
            <div className={nested && !flow ? "mt-8 hidden sm:block" : "mt-8"}>
              <Button asChild variant="outline">
                <a href={INSTAGRAM_URL}>{t.instagram.profile}</a>
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );

  if (flow) {
    return (
      <section className="border-t border-chalk/15 bg-field" aria-label={t.instagram.title}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">{body}</div>
      </section>
    );
  }

  if (nested) {
    return (
      <article className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-x-clip">
        <div className="flex h-full min-h-0 flex-col pt-3 pb-3">{body}</div>
      </article>
    );
  }

  return (
    <section className="border-t border-chalk/15">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">{body}</div>
    </section>
  );
}
