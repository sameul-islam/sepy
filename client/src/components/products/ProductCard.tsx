"use client";

import { useState } from "react";
import Link from "next/link";

import ProductGallery from "@/components/products/ProductGallery";
import type { Product } from "@/lib/api-types";

type ProductCardProps = {
  product: Product;
};

const SWATCH_COLORS: Record<string, string> = {
  // Neutral
  black: "#171717",
  white: "#FFFFFF",
  gray: "#808080",
  grey: "#808080",
  charcoal: "#364152",
  "dark gray": "#4B5563",
  "light gray": "#D1D5DB",
  silver: "#C0C0C0",
  cream: "#F5F0DC",
  ivory: "#FFFFF0",
  "off-white": "#F5F5F0",
  beige: "#D6C2A1",
  sand: "#D8C8A8",
  stone: "#A69F91",
  taupe: "#8B7D6B",

  // Blue
  blue: "#2563EB",
  "navy blue": "#172554",
  navy: "#172554",
  "dark blue": "#1E3A8A",
  "royal blue": "#1D4ED8",
  "sky blue": "#7DD3FC",
  "dark sky": "#448EE4",
  "baby blue": "#A7C7E7",
  "light blue": "#93C5FD",
  "steel blue": "#4682B4",
  teal: "#008080",
  aqua: "#00BFA6",
  turquoise: "#40E0D0",

  // Brown
  brown: "#795548",
  "chocolate brown": "#4B2E24",
  chocolate: "#4B2E24",
  "dark brown": "#3E2723",
  "light brown": "#A1887F",
  camel: "#C19A6B",
  cocoa: "#6F4E37",
  mocha: "#967969",
  tan: "#D2B48C",
  coffee: "#6F4E37",

  // Green
  green: "#15803D",
  "dark green": "#166534",
  "light green": "#86EFAC",
  olive: "#6B7130",
  "olive green": "#6B7130",
  sage: "#87977B",
  "sage green": "#87977B",
  "forest green": "#228B22",
  mint: "#98FF98",
  "mint green": "#98FF98",
  pistachio: "#93C572",
  emerald: "#50C878",
  khaki: "#C3B091",

  // Red
  red: "#DC2626",
  "dark red": "#991B1B",
  burgundy: "#722F37",
  maroon: "#800000",
  wine: "#722F37",
  crimson: "#DC143C",
  scarlet: "#FF2400",

  // Pink
  pink: "#EC4899",
  "light pink": "#F9A8D4",
  "hot pink": "#FF69B4",
  rose: "#E8A0A8",
  blush: "#DE98AB",
  salmon: "#FA8072",

  // Purple
  purple: "#9333EA",
  "light purple": "#BAAFD9",
  violet: "#8F00FF",
  lavender: "#B57EDC",
  lilac: "#C8A2C8",
  plum: "#673147",

  // Yellow & Orange
  yellow: "#EAB308",
  mustard: "#D4A017",
  gold: "#D4AF37",
  orange: "#EA580C",
  "burnt orange": "#CC5500",
  rust: "#B7410E",
  coral: "#FF7F50",
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
