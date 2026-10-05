"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const rise = [0.16, 1, 0.3, 1] as const;

/**
 * One-shot rise. Opacity is a CSS animation on `.hero-enter` so it
 * releases after the entrance. An inline opacity from motion would
 * pin the node and block `.hero-quiet` while a Short plays.
 * Reduced motion is handled in CSS (`transform` / `animation: none`).
 */
export function HeroEnter({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const style = { animationDelay: `${delay}s` } as CSSProperties;
  return (
    <motion.div
      className={cn("hero-enter", className)}
      style={style}
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.95, delay, ease: rise }}
    >
      {children}
    </motion.div>
  );
}
