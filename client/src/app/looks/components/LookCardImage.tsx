"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
};

export default function LookCardImage({ src, alt }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative aspect-4/5 overflow-hidden bg-surface">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-surface-muted" />
      )}

      {!hasError && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <span className="text-xs text-text-muted">Image unavailable</span>
        </div>
      )}
    </div>
  );
}
