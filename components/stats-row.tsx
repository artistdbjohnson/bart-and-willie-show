import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";

export function StatsRow({ locale }: { locale: Locale }) {
  const stats = copy[locale].stats;
  return (
    <section className="border-b border-chalk/15" aria-label={stats.map((item) => item.label).join(", ")}>
      <dl className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:grid-cols-3 sm:px-8 sm:py-10">
        {stats.map((item) => (
          <div key={item.label} className="border-t border-chalk/25 pt-4">
            <dt className="font-ui text-[0.68rem] uppercase tracking-[0.2em] text-quiet">
              {item.label}
            </dt>
            <dd className="mt-2 font-display text-4xl leading-none tracking-tight">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
