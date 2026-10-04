import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { copy } from "@/lib/copy";

export default function NotFound() {
  return (
    <PageShell locale="en">
      <section className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
        <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">404</p>
        <h1 className="mt-4 max-w-3xl font-display text-[clamp(3rem,8vw,6rem)] leading-[0.86]">
          {copy.en.notFound.title}
        </h1>
        <p className="mt-6 font-serif text-xl text-chalk/80">{copy.pt.notFound.title}</p>
        <div className="mt-8 flex flex-wrap gap-6">
          <Link href="/" className="font-ui text-[0.72rem] uppercase tracking-[0.18em] text-signal">
            {copy.en.notFound.home}
          </Link>
          <Link href="/pt" className="font-ui text-[0.72rem] uppercase tracking-[0.18em] text-signal">
            {copy.pt.notFound.home}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
