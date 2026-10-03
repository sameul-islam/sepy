"use client";

import Image from "next/image";
import { useState } from "react";

export default function HeroMedia() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {/* Hero image */}
      <div className="absolute inset-0">
        <picture className="relative block h-full w-full">
          <source
            media="(max-width: 767px)"
            srcSet="/images/hero/hum.jpg"
          />

          <Image
            src="/images/hero/bojo.jpg"
            alt="SEPY premium sports fashion campaign"
            fill
            preload
            sizes="100vw"
            onLoad={() => setIsLoaded(true)}
            className="scale-[1.025] object-cover object-center opacity-100 transition-transform duration-1400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:scale-100 motion-reduce:transition-none"
          />
        </picture>
      </div>

      {/* Loading placeholder */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-1000 ease-out motion-reduce:transition-none ${
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