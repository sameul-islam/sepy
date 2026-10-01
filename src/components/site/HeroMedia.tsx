"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroMedia() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const timeout = window.setTimeout(() => {
      setIsImageVisible(true);
    }, 40);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isLoaded]);

  return (
    <>
      {/* Hero image */}
      <div className="absolute inset-0">
        <picture className="relative block h-full w-full">
          <source
            media="(max-width: 767px)"
            srcSet="/images/hero/sepy-hero-mobile.webp"
          />

          <Image
            src="/images/hero/sepy-hero-desktop.webp"
            alt="SEPY premium sports fashion campaign"
            fill
            preload
            sizes="100vw"
            onLoad={() => setIsLoaded(true)}
            className={`object-cover object-center transition-[opacity,transform] duration-1400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isImageVisible
                ? "scale-100 opacity-100"
                : "scale-[1.025] opacity-0"
            }`}
          />
        </picture>
      </div>

      {/* Loading placeholder */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-1000 ease-out ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src="/images/brand/sepy-wordmark.png"
          alt=""
          width={500}
          height={150}
          sizes="(max-width: 640px) 55vw, 420px"
          className="w-[55vw] max-w-105 opacity-[0.08]"
        />
      </div>

      {/* Readability overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-black/20 via-transparent to-black/5"
      />
    </>
  );
}