import { Hero } from "@/components/hero";
import { JetsSection } from "@/components/jets-section";
import { LatestNest } from "@/components/latest-nest";
import { PageShell } from "@/components/page-shell";
import { StatsRow } from "@/components/stats-row";
import { SubscribeForm } from "@/components/subscribe-form";
import { getInstagram } from "@/lib/instagram";
import type { Locale } from "@/lib/paths";
import { fullEpisodes, getChannel, shortFile, shortsFrom, titleFrame, type ShortBeat } from "@/lib/youtube";

export async function HomePage({ locale }: { locale: Locale }) {
  const [channel, instagram] = await Promise.all([getChannel(), getInstagram()]);
  const lead = fullEpisodes(channel.videos)[0] ?? null;
  const still = lead ? await titleFrame(lead) : null;
  const shorts = await shortBeats(channel.videos);

  return (
    <PageShell locale={locale}>
      <Hero locale={locale} video={lead} still={still} shorts={shorts} />
      <StatsRow locale={locale} />
      <LatestNest
        locale={locale}
        videos={channel.videos}
        feedOk={channel.ok}
        instagram={instagram}
      />
      <JetsSection locale={locale} videos={channel.videos} compactTop />
      <SubscribeForm locale={locale} image={still} />
    </PageShell>
  );
}

async function shortBeats(videos: Parameters<typeof shortsFrom>[0]): Promise<ShortBeat[]> {
  const shorts = shortsFrom(videos).slice(0, 6);
  const beats = await Promise.all(
    shorts.map(async (short) => {
      const src = await shortFile(short.id);
      const beat: ShortBeat = {
        id: short.id,
        poster: short.thumbnail,
        src,
      };
      return beat;
    }),
  );
  return beats;
}
