"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";

import HorizontalScrollBar from "@/components/ui/HorizontalScrollBar";
import type { Product } from "@/lib/api-types";

type NewArrivalsRailProps = {
  products: Product[];
};

const PRODUCT_CARD_WIDTH =
  "w-[calc((100vw-2rem)/2)] sm:w-[calc((100vw-2.5rem)/3)] lg:w-[calc((100vw-4.5rem)/4)] xl:w-[calc((100vw-6.5rem)/4)]";

function formatPrice(price: number) {
  return `৳ ${new Intl.NumberFormat("en-BD").format(price)}`;
}

export default function NewArrivalsRail({ products }: NewArrivalsRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragState = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!rail || event.button !== 0) {
      return;
    }

    dragState.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: rail.scrollLeft,
      moved: false,
    };

    setIsDragging(true);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!rail || !dragState.current.active) {
      return;
    }

    const distance = event.clientX - dragState.current.startX;

    if (Math.abs(distance) > 5) {
      dragState.current.moved = true;
    }

    rail.scrollLeft = dragState.current.startScrollLeft - distance;
  };

  const endDrag = () => {
    if (!dragState.current.active) {
      return;
    }

    dragState.current.active = false;
    setIsDragging(false);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.moved) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    dragState.current.moved = false;
  };

  return (
    <div>
      <div
        id="new-arrivals-rail"
        ref={railRef}
        role="region"
        aria-label="New arrivals products"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onClickCapture={handleClickCapture}
        className={`flex w-full snap-none gap-1.5 overflow-x-auto overscroll-x-contain pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {products.map((product) => {
          const image = product.images[0];

          return (
            <article
              key={product._id}
              className={`${PRODUCT_CARD_WIDTH} shrink-0`}
            >
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
                    className="pointer-events-none object-cover transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
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
          );
        })}

        <Link
          href="/products?sort=newest"
          aria-label="View all new arrivals"
          draggable={false}
          className={`${PRODUCT_CARD_WIDTH} group block shrink-0 focus-visible:outline-none`}
        >
          <div className="flex aspect-3/4 flex-col items-center justify-center bg-surface transition-colors duration-500 group-hover:bg-surface-muted">
            <span className="flex size-14 items-center justify-center rounded-full border border-border text-text-primary transition-all duration-300 group-hover:border-text-primary">
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
      </div>

      <HorizontalScrollBar
        scrollRef={railRef}
        scrollId="new-arrivals-rail"
        ariaLabel="New arrivals scroll position"
      />
    </div>
  );
}
