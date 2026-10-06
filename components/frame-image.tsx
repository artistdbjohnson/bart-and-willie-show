"use client";

import Image from "next/image";
import { useState } from "react";
import { HERO_STILL } from "@/lib/youtube";

/** maxres, then hq, then the committed splash. A 120px YouTube placeholder counts as a miss. */
export function FrameImage({
  id,
  alt = "",
  sizes,
  className,
}: {
  id: string;
  alt?: string;
  sizes: string;
  className?: string;
}) {
  const chain = [
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    HERO_STILL,
  ];
  const [index, setIndex] = useState(0);
  const src = chain[Math.min(index, chain.length - 1)];

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={src !== HERO_STILL}
      sizes={sizes}
      className={className}
      onLoad={(event) => {
        const image = event.currentTarget;
        if (image.naturalWidth > 0 && image.naturalWidth < 400 && index < chain.length - 1) {
          setIndex((value) => value + 1);
        }
      }}
      onError={() => {
        setIndex((value) => Math.min(value + 1, chain.length - 1));
      }}
    />
  );
}
