"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { A11y, Keyboard, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import type { Product } from "@/lib/api-types";

import "swiper/css";
import "swiper/css/scrollbar";

type NewArrivalsRailProps = {
  products: Product[];
};

const PRODUCT_CARD_WIDTH =
  "!w-[calc((100vw-2rem)/2)] sm:!w-[calc((100vw-2.5rem)/3)] lg:!w-[calc((100vw-4.5rem)/4)] xl:!w-[calc((100vw-6.5rem)/4)]";

function formatPrice(price: number) {
  return `৳ ${new Intl.NumberFormat("en-BD").format(price)}`;
}

export default function NewArrivalsRail({ products }: NewArrivalsRailProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const showScrollbar = useCallback(() => {
    if (interactionTimeoutRef.current !== null) {
      clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = null;
    }

    setIsInteracting(true);
  }, []);

  const hideScrollbar = useCallback(() => {
    if (interactionTimeoutRef.current !== null) {
      clearTimeout(interactionTimeoutRef.current);
    }

    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      interactionTimeoutRef.current = null;
    }, 700);
  }, []);

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current !== null) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Swiper
      modules={[A11y, Keyboard, Scrollbar]}
      slidesPerView="auto"
      slidesPerGroup={1}
      spaceBetween={6}
      speed={500}
      watchOverflow
      grabCursor
      resistanceRatio={0.85}
      keyboard={{
        enabled: true,
        onlyInViewport: true,
      }}
      a11y={{
        enabled: true,
      }}
      scrollbar={{
        draggable: true,
        snapOnRelease: true,
        hide: false,
      }}
      onTouchStart={showScrollbar}
      onSliderMove={showScrollbar}
      onTouchEnd={hideScrollbar}
      onTransitionEnd={hideScrollbar}
      className={`new-arrivals-swiper w-full ${
        isInteracting ? "is-interacting" : ""
      }`}
    >
      {products.map((product) => {
        const image = product.images[0];
        const secondaryImage = product.images[1];

        return (
          <SwiperSlide
            key={product._id}
            className={`${PRODUCT_CARD_WIDTH} h-auto!`}
          >
            <article>
              <Link
                href={`/products/${product.slug}`}
                draggable={false}
                className="group block focus-visible:outline-none"
              >
                <div className="relative aspect-3/4 overflow-hidden bg-surface">
                  <Image
                    src={image.url}
                    alt={image.alt || product.name}
                    fill
                    draggable={false}
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                    className="pointer-events-none object-cover transition-opacity duration-500 motion-reduce:transition-none [@media(hover:hover)]:group-hover:opacity-0"
                  />

                  {secondaryImage ? (
                    <Image
                      src={secondaryImage.url}
                      alt=""
                      fill
                      draggable={false}
                      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                      aria-hidden="true"
                      className="pointer-events-none object-cover opacity-0 transition-opacity duration-500 motion-reduce:transition-none [@media(hover:hover)]:group-hover:opacity-100"
                    />
                  ) : null}
                </div>

                <div className="mt-3">
                  <h3 className="text-xs font-bold text-text-primary sm:text-sm">
                    {product.name}
                  </h3>

                  <div className="mt-1 text-xs">
                    <span className="font-medium text-text-primary">
                      {formatPrice(product.price)}
                    </span>

                    {product.compareAtPrice != null &&
                    product.compareAtPrice > product.price ? (
                      <span className="text-text-muted line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </article>
          </SwiperSlide>
        );
      })}

      <SwiperSlide className={`${PRODUCT_CARD_WIDTH} h-auto!`}>
        <Link
          href="/products?sort=newest"
          aria-label="View all new arrivals"
          draggable={false}
          className="group block focus-visible:outline-none"
        >
          <div className="flex aspect-3/4 flex-col items-center justify-center bg-surface transition-colors duration-500 group-hover:bg-surface-muted">
            <span className="flex size-10 items-center justify-center rounded-full border border-gray-500 text-text-primary transition-all duration-300 group-hover:border-text-primary md:size-14">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-5 transition-transform duration-300"
              >
                <path
                  d="M4.5 12H19.5M13 5.5L19.5 12L13 18.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
              View All
            </span>

            <span className="mt-1 text-[11px] tracking-widest text-text-muted">
              New Arrivals
            </span>
          </div>
        </Link>
      </SwiperSlide>
    </Swiper>
  );
}
