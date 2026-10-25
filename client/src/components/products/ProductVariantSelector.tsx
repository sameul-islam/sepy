"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductVariant } from "@/lib/api-types";

type ProductVariantSelectorProps = {
  variants: ProductVariant[];
};

function formatPrice(price: number): string {
  return `TK${price.toLocaleString("en-BD")}`;
}

export default function ProductVariantSelector({
  variants,
}: ProductVariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => variants[0]?._id ?? "",
  );

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) => variant._id === selectedVariantId) ??
      variants[0],
    [variants, selectedVariantId],
  );

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .map((variant) => variant.size)
            .filter((size): size is string => Boolean(size)),
        ),
      ),
    [variants],
  );

  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .map((variant) => variant.color)
            .filter((color): color is string => Boolean(color)),
        ),
      ),
    [variants],
  );

  const [selectedSize, setSelectedSize] = useState(
    () => variants[0]?.size ?? "",
  );
  const [selectedColor, setSelectedColor] = useState(
    () => variants[0]?.color ?? "",
  );
  useEffect(() => {
    const nextVariant =
      variants.find((variant) => variant._id === selectedVariantId) ??
      variants[0];

    if (!nextVariant) {
      if (selectedVariantId !== "") setSelectedVariantId("");
      if (selectedSize !== "") setSelectedSize("");
      if (selectedColor !== "") setSelectedColor("");
      return;
    }

    if (selectedVariantId !== nextVariant._id) {
      setSelectedVariantId(nextVariant._id);
    }

    const nextSize = nextVariant.size ?? "";
    const nextColor = nextVariant.color ?? "";

    if (selectedSize !== nextSize) {
      setSelectedSize(nextSize);
    }

    if (selectedColor !== nextColor) {
      setSelectedColor(nextColor);
    }
  }, [variants, selectedVariantId, selectedSize, selectedColor]);

  if (!selectedVariant) {
    return (
      <p className="mt-5 text-sm text-[#5f5f5a]" role="status">
        No variants are currently available.
      </p>
    );
  }

  const matchingVariants = variants.filter(
    (variant) =>
      (!selectedSize || variant.size === selectedSize) &&
      (!selectedColor || variant.color === selectedColor),
  );

  const currentVariant =
    matchingVariants.find((variant) => variant._id === selectedVariantId) ??
    matchingVariants[0];

  if (!currentVariant) {
    return (
      <p className="mt-5 text-sm text-[#5f5f5a]" role="status">
        This size and color combination is unavailable.
      </p>
    );
  }

  const hasDiscount =
    typeof currentVariant.compareAtPrice === "number" &&
    currentVariant.compareAtPrice > currentVariant.price;

  function selectVariant(variant: ProductVariant) {
    setSelectedVariantId(variant._id);
    setSelectedSize(variant.size ?? "");
    setSelectedColor(variant.color ?? "");
  }

  function selectSize(size: string) {
    const matching = variants.filter(
      (variant) =>
        variant.size === size &&
        (!selectedColor || variant.color === selectedColor),
    );

    const nextVariant =
      matching.find((variant) => variant._id === selectedVariantId) ??
      matching[0];

    if (!nextVariant) {
      const fallbackVariant = variants.find((variant) => variant.size === size);

      if (!fallbackVariant) return;

      setSelectedVariantId(fallbackVariant._id);
      setSelectedSize(fallbackVariant.size ?? "");
      setSelectedColor(fallbackVariant.color ?? "");
      return;
    }

    setSelectedVariantId(nextVariant._id);
    setSelectedSize(nextVariant.size ?? "");
    setSelectedColor(nextVariant.color ?? "");
  }

  function selectColor(color: string) {
    const matching = variants.filter(
      (variant) =>
        variant.color === color &&
        (!selectedSize || variant.size === selectedSize),
    );

    const nextVariant =
      matching.find((variant) => variant._id === selectedVariantId) ??
      matching[0];

    if (!nextVariant) {
      const fallbackVariant = variants.find(
        (variant) => variant.color === color,
      );

      if (!fallbackVariant) return;

      setSelectedVariantId(fallbackVariant._id);
      setSelectedSize(fallbackVariant.size ?? "");
      setSelectedColor(fallbackVariant.color ?? "");
      return;
    }

    setSelectedVariantId(nextVariant._id);
    setSelectedSize(nextVariant.size ?? "");
    setSelectedColor(nextVariant.color ?? "");
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-base text-[#171717]">
          {formatPrice(currentVariant.price)}
        </p>

        {hasDiscount && (
          <>
            <p className="text-sm text-[#85857e] line-through">
              {formatPrice(currentVariant.compareAtPrice!)}
            </p>

            <span className="text-xs text-[#5f5f5a]">
              {Math.round(
                (1 - currentVariant.price / currentVariant.compareAtPrice!) *
                  100,
              )}
              % off
            </span>
          </>
        )}
      </div>

      {sizes.length > 0 && (
        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-medium text-[#171717]">
            Size
          </legend>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = variants.some(
                (variant) =>
                  variant.size === size &&
                  (!selectedColor || variant.color === selectedColor),
              );

              const inStock = variants.some(
                (variant) =>
                  variant.size === size &&
                  (!selectedColor || variant.color === selectedColor) &&
                  variant.stock > 0,
              );

              return (
                <button
                  key={size}
                  type="button"
                  disabled={!available}
                  aria-pressed={selectedSize === size}
                  onClick={() => selectSize(size)}
                  aria-label={`${size}${available && !inStock ? ", out of stock" : ""}`}
                  className={`min-w-11 border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] disabled:cursor-not-allowed disabled:opacity-30 ${
                    selectedSize === size
                      ? "border-[#171717] bg-[#171717] text-white"
                      : `border-[#e5e5e0] text-[#171717] hover:border-[#85857e] ${
                          available && !inStock ? "line-through opacity-60" : ""
                        }`
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {colors.length > 0 && (
        <fieldset className="mt-5">
          <legend className="mb-3 text-sm font-medium text-[#171717]">
            Color
          </legend>

          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const available = variants.some(
                (variant) =>
                  variant.color === color &&
                  (!selectedSize || variant.size === selectedSize),
              );

              const inStock = variants.some(
                (variant) =>
                  variant.color === color &&
                  (!selectedSize || variant.size === selectedSize) &&
                  variant.stock > 0,
              );

              return (
                <button
                  key={color}
                  type="button"
                  disabled={!available}
                  aria-pressed={selectedColor === color}
                  aria-label={`${color}${available && !inStock ? ", out of stock" : ""}`}
                  onClick={() => selectColor(color)}
                  className={`border px-3 py-2 text-sm capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] disabled:cursor-not-allowed disabled:opacity-30 ${
                    selectedColor === color
                      ? "border-[#171717] text-[#171717]"
                      : `border-[#e5e5e0] text-[#5f5f5a] hover:border-[#85857e] ${
                          available && !inStock ? "line-through opacity-60" : ""
                        }`
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-5 border-t border-[#e5e5e0] pt-4">
        <p className="text-xs text-[#85857e]">
          Product code: {currentVariant.sku}
        </p>

        <p
          className={`mt-2 text-xs ${
            currentVariant.stock > 0 ? "text-[#5f5f5a]" : "text-[#85857e]"
          }`}
          role="status"
        >
          {currentVariant.stock > 0 ? "In stock" : "Out of stock"}
        </p>
      </div>
    </div>
  );
}
