"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type {
  Category,
  ProductFilterOptions,
} from "@/lib/api-types";

type ProductFiltersProps = {
  categories: Category[];
  filterOptions: ProductFilterOptions;
  currentQuery: string;
  department?: "women" | "men" | "unisex";
  category?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: "newest" | "price-asc" | "price-desc";
};

const COLOR_SWATCHES: Record<string, string> = {
  black: "#171717",
  white: "#ffffff",
  gray: "#808080",
  grey: "#808080",
  charcoal: "#364152",
  navy: "#172554",
  "navy blue": "#172554",
  blue: "#2563eb",
  "sky blue": "#7dd3fc",
  red: "#dc2626",
  burgundy: "#722f37",
  green: "#15803d",
  olive: "#6b7130",
  sage: "#87977b",
  brown: "#795548",
  beige: "#d6c2a1",
  cream: "#f5f0dc",
  pink: "#ec4899",
  purple: "#9333ea",
  yellow: "#eab308",
  orange: "#ea580c",
};

function getSwatchColor(color: string) {
  const normalized = color.trim().toLowerCase();

  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(normalized)) {
    return normalized;
  }

  return COLOR_SWATCHES[normalized] ?? "#a3a3a3";
}

export default function ProductFilters({
  categories,
  filterOptions,
  currentQuery,
  department,
  category,
  size,
  color,
  minPrice,
  maxPrice,
  inStock,
  sort,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(
    minPrice !== undefined ? String(minPrice) : "",
  );
  const [priceMax, setPriceMax] = useState(
    maxPrice !== undefined ? String(maxPrice) : "",
  );
  const [priceError, setPriceError] = useState("");

  const activeFilterCount = [
    department,
    category,
    size,
    color,
    minPrice !== undefined || maxPrice !== undefined,
    inStock,
  ].filter(Boolean).length;

  const updateUrl = (
    updates: Record<string, string | null>,
  ) => {
    const params = new URLSearchParams(currentQuery);

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    // Any filter change starts from the first result page.
    params.delete("page");

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const handlePriceApply = () => {
    const nextMin = priceMin.trim();
    const nextMax = priceMax.trim();

    if (
      (nextMin && !/^\d+$/.test(nextMin)) ||
      (nextMax && !/^\d+$/.test(nextMax))
    ) {
      setPriceError("Enter valid whole-number prices.");
      return;
    }

    const min = nextMin ? Number(nextMin) : undefined;
    const max = nextMax ? Number(nextMax) : undefined;

    if (
      (min !== undefined && !Number.isSafeInteger(min)) ||
      (max !== undefined && !Number.isSafeInteger(max))
    ) {
      setPriceError("Enter a valid price.");
      return;
    }

    if (min !== undefined && max !== undefined && min > max) {
      setPriceError("Minimum price cannot exceed maximum price.");
      return;
    }

    setPriceError("");

    updateUrl({
      minPrice: nextMin || null,
      maxPrice: nextMax || null,
    });
  };

  const clearAllFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setPriceError("");

    router.push(pathname, { scroll: false });
  };

  const availableCategories = categories.filter(
    (item) => !department || item.department === department,
  );

  return (
    <section className="mb-8 border-y border-[#e5e5e0] py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="product-filter-panel"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#171717]"
        >
          <span aria-hidden="true">☷</span>
          Filters
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-[#171717] text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
          <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
        </button>

        <label className="flex items-center gap-2 text-xs text-[#5f5f5a] sm:text-sm">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(event) =>
              updateUrl({ sort: event.target.value === "newest" ? null : event.target.value })
            }
            className="max-w-40 border-0 bg-transparent py-1 text-xs font-semibold text-[#171717] outline-none sm:text-sm"
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </label>
      </div>

      {isOpen && (
        <div
          id="product-filter-panel"
          className="mt-5 grid grid-cols-1 gap-6 border-t border-[#e5e5e0] pt-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5f5f5a]">
              Department & Category
            </h3>

            <select
              value={department ?? ""}
              onChange={(event) =>
                updateUrl({
                  department: event.target.value || null,
                  category: null,
                })
              }
              className="w-full border border-[#e5e5e0] bg-white px-3 py-2.5 text-sm text-[#171717]"
              aria-label="Filter by department"
            >
              <option value="">All departments</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
            </select>

            <select
              value={category ?? ""}
              onChange={(event) =>
                updateUrl({ category: event.target.value || null })
              }
              className="w-full border border-[#e5e5e0] bg-white px-3 py-2.5 text-sm text-[#171717]"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {availableCategories.map((item) => (
                <option key={item._id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5f5f5a]">
              Size
            </h3>

            {filterOptions.sizes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filterOptions.sizes.map((option) => {
                  const selected = size === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        updateUrl({
                          size: selected ? null : option,
                        })
                      }
                      aria-pressed={selected}
                      className={`min-w-10 border px-3 py-2 text-xs font-medium transition-colors ${
                        selected
                          ? "border-[#171717] bg-[#171717] text-white"
                          : "border-[#e5e5e0] text-[#171717] hover:border-[#171717]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#85857e]">
                No sizes available for this selection.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5f5f5a]">
              Color
            </h3>

            {filterOptions.colors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filterOptions.colors.map((option) => {
                  const selected = color === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        updateUrl({
                          color: selected ? null : option,
                        })
                      }
                      aria-pressed={selected}
                      aria-label={`Filter by ${option}`}
                      title={option}
                      className={`flex size-9 items-center justify-center rounded-full border ${
                        selected
                          ? "border-[#171717]"
                          : "border-transparent hover:border-[#85857e]"
                      }`}
                    >
                      <span
                        className="size-6 rounded-full border border-black/10"
                        style={{ backgroundColor: getSwatchColor(option) }}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#85857e]">
                No colors available for this selection.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5f5f5a]">
              Price range (BDT)
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-[11px] text-[#85857e]">Minimum</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                  placeholder={
                    filterOptions.priceRange.min !== null
                      ? String(filterOptions.priceRange.min)
                      : "Min"
                  }
                  className="w-full border border-[#e5e5e0] px-3 py-2.5 text-sm text-[#171717]"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] text-[#85857e]">Maximum</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                  placeholder={
                    filterOptions.priceRange.max !== null
                      ? String(filterOptions.priceRange.max)
                      : "Max"
                  }
                  className="w-full border border-[#e5e5e0] px-3 py-2.5 text-sm text-[#171717]"
                />
              </label>
            </div>

            {priceError && (
              <p role="alert" className="text-xs text-red-700">
                {priceError}
              </p>
            )}

            <button
              type="button"
              onClick={handlePriceApply}
              className="border-b border-[#171717] pb-1 text-xs font-semibold text-[#171717]"
            >
              Apply price
            </button>
          </div>

          <div className="flex items-start">
            <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-[#171717]">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(event) =>
                  updateUrl({
                    inStock: event.target.checked ? "true" : null,
                  })
                }
                className="size-4 accent-[#171717]"
              />
              In-stock products only
            </label>
          </div>

          <div className="flex items-start sm:justify-end">
            <button
              type="button"
              onClick={clearAllFilters}
              className="border-b border-[#85857e] pb-1 text-xs font-semibold text-[#5f5f5a] hover:text-[#171717]"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </section>
  );
}