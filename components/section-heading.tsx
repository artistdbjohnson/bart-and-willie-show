import { BlurFade } from "@/components/ui/blur-fade";

export function SectionHeading({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="max-w-3xl">
      <BlurFade inView duration={0.8} offset={8} blur="4px">
        <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">{kicker}</p>
        <h2 className="mt-3 font-display text-[clamp(2.7rem,8vw,5.75rem)] leading-[0.84] tracking-tight">
          {title}
        </h2>
      </BlurFade>
      {lede ? (
        <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-chalk/85 md:text-xl">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
