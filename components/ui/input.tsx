import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full border border-chalk/45 bg-field/40 px-3 font-serif text-base text-chalk outline-none transition-[border-color,background-color] duration-500 ease-out placeholder:text-quiet motion-reduce:transition-none focus-visible:border-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-40 aria-invalid:border-[#ffb4a8]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
