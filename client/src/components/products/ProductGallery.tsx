"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/api-types";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex];

  if (!activeImage) {
    return (
      <div
        className="flex aspect-3/4 items-center justify-center bg-[#f7f7f5] text-sm text-[#85857e]"
        role="img"
        aria-label={`${productName} image unavailable`}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-4">
      {images.length > 1 && (
        <div
          className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col"
          aria-label="Product images"
        >
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-pressed={activeIndex === index}
              className={`relative aspect-3/4 w-16 shrink-0 overflow-hidden bg-[#f7f7f5] sm:w-full ${
                activeIndex === index
                  ? "ring-1 ring-[#171717] ring-inset"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="76px"
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative order-1 aspect-3/4 overflow-hidden bg-[#f7f7f5] sm:order-2">
        <Image
          key={activeImage.url}
          src={activeImage.url}
          alt={activeImage.alt}
          fill
          priority
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 65vw, 55vw"
          unoptimized
          className="object-cover"
        />
      </div>
    </div>
  );
}