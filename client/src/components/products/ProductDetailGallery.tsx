"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { ProductImage } from "@/lib/api-types";

type ProductDetailGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export default function ProductDetailGallery({
  images,
  productName,
}: ProductDetailGalleryProps) {
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMobileScroll = () => {
    const track = mobileTrackRef.current;

    if (!track) return;

    const slideWidth = track.clientWidth;

    if (!slideWidth) return;

    const nextIndex = Math.round(track.scrollLeft / slideWidth);

    setActiveIndex(Math.min(Math.max(nextIndex, 0), images.length - 1));
  };

  const goToImage = (index: number) => {
    const track = mobileTrackRef.current;

    if (!track) return;

    const slideWidth = track.clientWidth;

    track.scrollTo({
      left: slideWidth * index,
      behavior: "smooth",
    });

    setActiveIndex(index);
  };

  if (images.length === 0) {
    return <div className="aspect-3/4 w-full bg-[#f7f7f5]" />;
  }

  return (
    <section aria-label={`${productName} product images`} className="min-w-0">
      {/* Mobile Gallery */}
      <div className="lg:hidden">
        <div
          ref={mobileTrackRef}
          onScroll={handleMobileScroll}
          className="
            sepy-scrollbar-hidden
            flex w-full snap-x snap-mandatory
            overflow-x-auto scroll-smooth
          "
          aria-label="Swipe to view product images"
        >
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="
                relative aspect-3/4 w-full
                shrink-0 snap-center
                overflow-hidden bg-[#f7f7f5]
              "
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} image ${index + 1}`}
                fill
                priority={index === 0}
                sizes="100vw"
                draggable={false}
                className="select-none object-cover"
              />
            </div>
          ))}
        </div>

        {/* Mobile Image Indicators */}
        {images.length > 1 && (
          <div
            className="relative flex w-full items-center"
            role="group"
            aria-label="Select product image"
          >
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}-indicator`}
                type="button"
                onClick={() => goToImage(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                className="
          relative flex-1
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#171717]
        "
              >
                <span className="block h-0.5 w-full bg-[#deded8]" />
              </button>
            ))}

            {/* Active Indicator */}
            <span
              className="
        absolute left-0 top-1/2
        h-0.5 bg-[#171717]
        transition-transform duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]
      "
              style={{
                width: `${100 / images.length}%`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Desktop Gallery */}
      <div
        className="
          hidden grid-cols-2 items-start
          gap-1
          lg:grid
        "
      >
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="
              relative aspect-3/4 w-full
              overflow-hidden bg-[#f7f7f5]
            "
          >
            <Image
              src={image.url}
              alt={image.alt || `${productName} image ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 30vw, 50vw"
              draggable={false}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
