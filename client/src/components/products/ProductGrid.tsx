"use client";

import { useContext } from "react";

import ProductCard from "./ProductCard";
import { ProductGridViewContext } from "./ProductGridViewContext";

import type { Product } from "@/lib/api-types";

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  const gridView = useContext(ProductGridViewContext);

  const gridClasses =
    gridView === "comfortable"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <section
      aria-label="Product results"
      className={`grid w-full ${gridClasses} gap-x-1.5 gap-y-7 sm:gap-x-3 sm:gap-y-10 lg:gap-x-4`}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </section>
  );
}