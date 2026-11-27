"use client";

import { useState } from "react";
import type { ProductVariant } from "@/lib/api-types";
import { MdArrowRight } from "react-icons/md";

type ProductVariantSelectorProps = {
  variants: ProductVariant[];
};

function formatPrice(price: number): string {
  return `৳ ${price.toLocaleString("en-BD")}`;
}

export default function ProductVariantSelector({
  variants,
}: ProductVariantSelectorProps) {
  const sizes = Array.from(
    new Set(
      variants
        .map((variant) => variant.size)
        .filter((size): size is string => Boolean(size)),
    ),
  );

  const colors = Array.from(
    new Set(
      variants
        .map((variant) => variant.color)
        .filter((color): color is string => Boolean(color)),
    ),
  );

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const hasSize = sizes.length > 0;
  const hasColor = colors.length > 0;

  const selectionComplete =
    (!hasSize || selectedSize !== "") && (!hasColor || selectedColor !== "");

  const selectedVariant = selectionComplete
    ? variants.find(
        (variant) =>
          (!hasSize || variant.size === selectedSize) &&
          (!hasColor || variant.color === selectedColor),
      )
    : !hasSize && !hasColor
      ? variants[0]
      : undefined;

  const prices = variants.map((variant) => variant.price);
  const minimumPrice = Math.min(...prices);
  const maximumPrice = Math.max(...prices);

  const hasPriceRange = minimumPrice !== maximumPrice;

  const hasDiscount =
    selectedVariant?.compareAtPrice !== undefined &&
    selectedVariant.compareAtPrice > selectedVariant.price;

  if (variants.length === 0) {
    return (
      <p className="mt-6 text-sm text-text-secondary" role="status">
        This product is currently unavailable.
      </p>
    );
  }

  function isSizeAvailable(size: string) {
    return variants.some(
      (variant) =>
        variant.size === size &&
        (!selectedColor || variant.color === selectedColor),
    );
  }

  function isSizeInStock(size: string) {
    return variants.some(
      (variant) =>
        variant.size === size &&
        (!selectedColor || variant.color === selectedColor) &&
        variant.stock > 0,
    );
  }

  function isColorAvailable(color: string) {
    return variants.some(
      (variant) =>
        variant.color === color &&
        (!selectedSize || variant.size === selectedSize),
    );
  }

  function isColorInStock(color: string) {
    return variants.some(
      (variant) =>
        variant.color === color &&
        (!selectedSize || variant.size === selectedSize) &&
        variant.stock > 0,
    );
  }

  function handleSizeSelect(size: string) {
    setSelectedSize(size);
  }

  function handleColorSelect(color: string) {
    const sizeStillAvailable = variants.some(
      (variant) => variant.color === color && variant.size === selectedSize,
    );

    setSelectedColor(color);

    if (selectedSize && !sizeStillAvailable) {
      setSelectedSize("");
    }
  }

  return (
    <div className="mt-3">
      {/* Pricing */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {selectedVariant ? (
          <>
            <p className="font-semibold tracking-tight text-text-primary">
              {formatPrice(selectedVariant.price)}
            </p>

            {hasDiscount && (
              <>
                <p className="text-sm font-semibold text-text-secondary line-through">
                  {formatPrice(selectedVariant.compareAtPrice!)}
                </p>

                <span className="text-xs font-semibold text-text-secondary bg-black/10 py-0.5 px-1.5">
                  {Math.round(
                    (1 -
                      selectedVariant.price / selectedVariant.compareAtPrice!) *
                      100,
                  )}
                  % OFF
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <p className="font-semibold tracking-tight text-text-primary">
              {hasPriceRange
                ? `From ${formatPrice(minimumPrice)}`
                : formatPrice(minimumPrice)}
            </p>
          </>
        )}
      </div>

      {/* Color Selection */}
      {hasColor && (
        <fieldset className="mt-5">
          <legend className="mb-2 flex items-center gap-2 text-sm">
            <span className="font-bold text-text-primary">Color</span>

            {selectedColor && (
              <span className="flex items-center font-semibold gap-1 capitalize text-text-secondary">
                <MdArrowRight className="text-text-muted" size={18}/> {selectedColor}
              </span>
            )}
          </legend>

          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const available = isColorAvailable(color);
              const inStock = isColorInStock(color);
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  disabled={!available}
                  aria-pressed={isSelected}
                  aria-label={`${color}${!inStock ? ", out of stock" : ""}`}
                  onClick={() => handleColorSelect(color)}
                  className={`
                    min-h-10 border px-4 py-2
                    text-xs capitalize transition-colors
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-35
                    ${
                      isSelected
                        ? "border-text-primary text-text-primary"
                        : "border-border text-text-secondary hover:border-border-strong"
                    }
                    ${available && !inStock ? "line-through" : ""}
                  `}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Size Selection */}
      {hasSize && (
        <fieldset className="mt-5">
          <legend className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-text-primary">
              Select Size
            </span>

            {/* Size Guide will be connected after its real data system exists. */}
          </legend>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              const inStock = isSizeInStock(size);
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={!available}
                  aria-pressed={isSelected}
                  aria-label={`${size}${!inStock ? ", out of stock" : ""}`}
                  onClick={() => handleSizeSelect(size)}
                  className={`
                    flex h-9 w-15 md:h-11 md:w-18 items-center justify-center font-semibold cursor-pointer
                    border text-sm transition-colors
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                    ${
                      isSelected
                        ? "border-text-primary bg-text-primary text-white"
                        : "border-border-strong text-text-primary hover:border-accent"
                    }
                    ${available && !inStock ? "line-through" : ""}
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
