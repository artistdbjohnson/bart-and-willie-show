"use client";

import { useEffect } from "react";

/** The hero used to print this failure. It stays in the console only. */
export function FeedNotice({ degraded, reason }: { degraded?: boolean; reason?: string }) {
  useEffect(() => {
    if (!degraded) return;
    console.error("[youtube] channel feed did not load.", reason || "serving the last good episodes");
  }, [degraded, reason]);
  return null;
}
