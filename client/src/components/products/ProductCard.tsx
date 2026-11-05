"use client";

import { useState } from "react";
import Link from "next/link";

import ProductGallery from "@/components/products/ProductGallery";
import type { Product } from "@/lib/api-types";

type ProductCardProps = {
  product: Product;
};

const SWATCH_COLORS: Record<string, string> = {
  black: "#171717",
  white: "#FFFFFF",
  gray: "#808080",
  blue: "#2563EB",
  "navy blue": "#172554",
  "dark sky": "#448EE4",
  "chocolate brown": "#4B2E24",
  "light purple": "#BAAFD9",
  red: "#DC2626",
};

function getSwatchColor(color: string): string | null {
  const normalizedColor = color.trim().toLowerCase();

  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(normalizedColor)) {
    return normalizedColor;
  }

  return SWATCH_COLORS[normalizedColor] ?? null;
}

export default function ProductCard({ product }: ProductCardProps) {
  const productHref = `/products/${encodeURIComponent(product.slug)}`;

  const hasDiscount =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0;

  // Only include colors that have both available variants and matching images.
  const imageColors = new Set(
    product.images
      .map((image) => image.color?.trim().toLowerCase())
      .filter((color): color is string => Boolean(color)),
  );

  const availableColors = [
    ...new Set(
      (product.availableColors ?? [])
        .map((color) => color.trim().toLowerCase())
        .filter((color) => color && imageColors.has(color)),
    ),
  ];

  const [activeColor, setActiveColor] = useState<string | null>(
    availableColors[0] ?? null,
  );

  const selectedColor = availableColors.includes(activeColor ?? "")
    ? activeColor
    : (availableColors[0] ?? null);

  const selectedImages = selectedColor
    ? product.images.filter(
        (image) => image.color?.trim().toLowerCase() === selectedColor,
      )
    : product.images;

  const MAX_VISIBLE_COLORS = 5;

  const visibleColors = availableColors.slice(0, MAX_VISIBLE_COLORS);

  const remainingColorsCount = Math.max(
    availableColors.length - MAX_VISIBLE_COLORS,
    0,
  );

  return (
    <article className="min-w-0">
      <div className="relative">
        <ProductGallery
          key={selectedColor ?? "all-images"}
          images={selectedImages}
          productName={product.name}
          productHref={productHref}
        />

        {hasDiscount && (
          <span className="pointer-events-none absolute left-2 top-2 z-20 bg-[#171717] px-2 py-1 text-[10px] font-semibold tracking-wide text-white sm:text-xs">
            -{discountPercentage}%
          </span>
        )}
      </div>

      <div className="pt-1">
        {availableColors.length > 0 && (
          <div
            className="mt-2 flex items-center gap-2"
            aria-label="Available colors"
          >
            {visibleColors.map((color) => {
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setActiveColor(color)}
                  aria-label={`Select ${color} color`}
                  aria-pressed={isSelected}
                  title={color}
                  className={`flex size-4.75 items-center justify-center rounded-full border transition-all ${
                    isSelected
                      ? "border-[#171717]"
                      : "border-transparent hover:border-[#85857e]"
                  }`}
                >
                  {getSwatchColor(color) && (
                    <span
                      className="size-3.25 rounded-full border border-black/10"
                      style={{ backgroundColor: getSwatchColor(color)! }}
                    />
                  )}
                </button>
              );
            })}
            {remainingColorsCount > 0 && (
              <span
                className="text-[11px] font-medium text-[#85857e]"
                aria-label={`${remainingColorsCount} more colors available`}
              >
                +{remainingColorsCount}
              </span>
            )}
          </div>
        )}
        <h2 className="line-clamp-2 text-xs font-bold text-[#171717] sm:text-sm">
          <Link
            href={productHref}
            className="transition-colors hover:text-[#5f5f5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
          >
            {product.name}
          </Link>
        </h2>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-xs font-semibold text-black sm:text-sm">
            ৳{product.price.toLocaleString("en-BD")}
          </p>

          {hasDiscount && (
            <p className="text-[11px] text-[#85857e] line-through sm:text-xs">
              ৳{product.compareAtPrice!.toLocaleString("en-BD")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
