import type { ReactNode } from "react";
import { HeroEnter } from "@/components/hero-enter";
import { cn } from "@/lib/utils";

export function Lockup({
  className,
  script = true,
  size = "hero",
  enter = false,
}: {
  className?: string;
  script?: boolean;
  size?: "hero" | "footer" | "shop";
  /** One-shot line stagger. Hero only — footer and shop stay still. */
  enter?: boolean;
}) {
  const type =
    size === "shop"
      ? "text-[1.35rem] sm:text-[1.55rem]"
      : size === "footer"
        ? "text-[clamp(1.35rem,10cqi,3.15rem)]"
        : "text-[clamp(2rem,7.4vw,3.4rem)] lg:text-[4.15rem]";
  const scriptClass =
    size === "shop"
      ? "mt-1 ml-1 font-script text-[1.7rem] leading-none text-chalk"
      : "mt-2 ml-2 font-script text-[clamp(1.6rem,3vw,2.4rem)] leading-none text-chalk";
  const line = cn("font-display leading-[0.84] tracking-[-0.02em] whitespace-nowrap", type);

  return (
    <div className={cn(size === "footer" || size === "shop" ? "@container w-full max-w-full" : "w-max max-w-full", className)}>
      <LockupLine enter={enter} delay={0.06} className="bg-signal px-[0.35em] py-[0.08em] text-ink">
        <p className={line}>THE BART &</p>
      </LockupLine>
      <LockupLine enter={enter} delay={0.2} className="ml-[0.55em] -mt-[0.06em] bg-signal px-[0.35em] py-[0.08em] text-ink">
        <p className={line}>WILLIE SHOW</p>
      </LockupLine>
      {script ? (
        enter ? (
          <div className="overflow-hidden">
            <HeroEnter delay={0.34} className={scriptClass}>
              Playmaker
            </HeroEnter>
          </div>
        ) : (
          <p className={scriptClass}>Playmaker</p>
        )
      ) : null}
    </div>
  );
}

function LockupLine({
  enter,
  delay,
  className,
  children,
}: {
  enter: boolean;
  delay: number;
  className: string;
  children: ReactNode;
}) {
  if (!enter) return <div className={className}>{children}</div>;
  return (
    <div className={cn("overflow-hidden", className)}>
      <HeroEnter delay={delay}>{children}</HeroEnter>
    </div>
  );
}
