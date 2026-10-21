"use client";

import { useEffect, useRef, useState } from "react";
import { brand } from "@/brands";

export function Logo({ size = 40 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed || !brand.logo) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-white font-bold text-steel-700 ring-1 ring-stone-200 dark:ring-steel-800"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        aria-hidden
      >
        {brand.nameLatin.charAt(0)}
      </span>
    );
  }

  return (
    <img
      ref={ref}
      src={brand.logo}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full bg-white object-contain"
      style={{ width: size, height: size }}
    />
  );
}
