import { cn } from "@/lib/utils";

export function Lockup({
  className,
  script = true,
  size = "hero",
}: {
  className?: string;
  script?: boolean;
  size?: "hero" | "footer";
}) {
  const type =
    size === "footer"
      ? "text-[clamp(1.2rem,9.5cqi,3.4rem)]"
      : "text-[clamp(2rem,7.4vw,5.6rem)]";
  return (
    <div className={cn(size === "footer" ? "@container w-full max-w-full" : "w-max max-w-full", className)}>
      <div className="bg-signal px-[0.35em] py-[0.08em] text-ink">
        <p className={cn("font-display leading-[0.84] tracking-[-0.02em] whitespace-nowrap", type)}>
          THE BART &
        </p>
      </div>
      <div className="ml-[0.55em] -mt-[0.06em] bg-signal px-[0.35em] py-[0.08em] text-ink">
        <p className={cn("font-display leading-[0.84] tracking-[-0.02em] whitespace-nowrap", type)}>
          WILLIE SHOW
        </p>
      </div>
      {script ? (
        <p className="mt-2 ml-2 font-script text-[clamp(1.6rem,3vw,2.4rem)] leading-none text-chalk">
          Playmaker
        </p>
      ) : null}
    </div>
  );
}
