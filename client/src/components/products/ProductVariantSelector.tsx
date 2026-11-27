"use client";

import { useState } from "react";
import type { ProductVariant } from "@/lib/api-types";

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
    <div className="mt-2">
      {/* Pricing */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {selectedVariant ? (
          <>
            <p className="text-xl font-medium tracking-tight text-text-primary">
              {formatPrice(selectedVariant.price)}
            </p>

            {hasDiscount && (
              <>
                <p className="text-sm text-text-muted line-through">
                  {formatPrice(selectedVariant.compareAtPrice!)}
                </p>

                <span className="text-xs font-medium text-text-secondary">
                  {Math.round(
                    (1 -
                      selectedVariant.price / selectedVariant.compareAtPrice!) *
                      100,
                  )}
                  % off
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-xl font-medium tracking-tight text-text-primary">
              {hasPriceRange
                ? `From ${formatPrice(minimumPrice)}`
                : formatPrice(minimumPrice)}
            </p>
          </>
        )}
      </div>

      {/* Color Selection */}
      {hasColor && (
        <fieldset className="mt-7">
          <legend className="mb-3 flex items-center gap-2 text-sm">
            <span className="font-medium text-text-primary">Color</span>

            {selectedColor && (
              <span className="capitalize text-text-secondary">
                — {selectedColor}
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
        <fieldset className="mt-7">
          <legend className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-text-primary">
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
                    flex min-h-11 min-w-12 items-center justify-center
                    border px-3 py-2 text-sm transition-colors
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                    ${
                      isSelected
                        ? "border-text-primary bg-text-primary text-white"
                        : "border-border text-text-primary hover:border-border-strong"
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

      {/* Variant Availability */}
      <div className="mt-6 border-t border-border pt-4">
        {!selectionComplete ? (
          <p className="text-xs text-text-secondary" role="status">
            {hasSize && hasColor
              ? "Select a color and size to check availability."
              : hasSize
                ? "Select a size to check availability."
                : "Select a color to check availability."}
          </p>
        ) : selectedVariant ? (
          <p
            className={`text-xs ${
              selectedVariant.stock > 0
                ? "text-text-secondary"
                : "text-text-muted"
            }`}
            role="status"
          >
            {selectedVariant.stock > 0 ? "In stock" : "Out of stock"}
          </p>
        ) : (
          <p className="text-xs text-text-secondary" role="status">
            This combination is unavailable.
          </p>
        )}
      </div>
    </div>
  );
}
