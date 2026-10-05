"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const riseEase = [0.22, 1, 0.36, 1] as const;

/**
 * Lockup line rise only. Opacity stays on `.hero-enter` in CSS so a
 * Short can still fade the type. Reduced motion is a CSS override.
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
  const style = { animationDelay: `${delay}s`, animationDuration: "0.7s" } as CSSProperties;
  return (
    <motion.div
      className={cn("hero-enter", className)}
      style={style}
      initial={{ y: "110%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 0.7, delay, ease: riseEase }}
    >
      {children}
    </motion.div>
  );
}
