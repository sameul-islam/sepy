"use client";

import { useContext } from "react";

import { ProductGridViewContext } from "./ProductGridViewContext";

const SKELETON_ITEMS = Array.from({ length: 12 }, (_, index) => index);

export default function ProductGridSkeleton() {
  const gridView = useContext(ProductGridViewContext);

  const gridClasses =
    gridView === "comfortable"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <section
      aria-label="Loading products"
      aria-hidden="true"
      className={`grid ${gridClasses} gap-x-1.5 gap-y-7 sm:gap-y-10`}
    >
      {SKELETON_ITEMS.map((item) => (
        <article key={item} className="min-w-0">
          {/* Product image */}
          <div className="sepy-skeleton-block aspect-3/4 w-full" />

          {/* Available color swatches */}
          <div className="mt-2 flex h-4.75 items-center gap-2">
            <span className="sepy-skeleton-block size-4.75 rounded-full" />
            <span className="sepy-skeleton-block size-4.75 rounded-full" />
            <span className="sepy-skeleton-block size-4.75 rounded-full" />
          </div>

          {/* Product name */}
          <div className="space-y-2">
            <div className="sepy-skeleton-block h-3 w-4/5" />
            <div className="sepy-skeleton-block h-3 w-2/5" />
          </div>

          {/* Product price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="sepy-skeleton-block h-3 w-16" />
            <span className="sepy-skeleton-block h-3 w-12" />
          </div>
        </article>
      ))}
    </section>
  );
}
