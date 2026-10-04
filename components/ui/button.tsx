import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-ui text-[0.72rem] uppercase tracking-[0.18em] transition-[background-color,color,border-color,opacity] duration-500 ease-out motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-chalk",
  {
    variants: {
      variant: {
        default: "bg-signal text-ink hover:bg-[#e4cc00]",
        outline:
          "border border-chalk/45 bg-transparent text-chalk hover:border-chalk hover:bg-chalk/10",
        ghost: "bg-transparent text-chalk hover:bg-chalk/10",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-10 px-3",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
