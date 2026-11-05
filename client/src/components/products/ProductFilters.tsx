"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdTune } from "react-icons/md";

import { getProducts } from "@/lib/api";
import type { Category, ProductFilterOptions } from "@/lib/api-types";

import AvailabilityFilter from "./filters/AvailabilityFilter";
import ColorFilter from "./filters/ColorFilter";
import FilterDrawer from "./filters/FillterDrawer";
import FilterSelect from "./filters/FilterSelect";
import PriceFilter from "./filters/PriceFilter";
import SizeFilter from "./filters/SizeFilter";

import {
  countActiveFilters,
  createFilterDraft,
  toggleFilterValue,
  validatePriceRange,
} from "./filters/filter-utils";

import type { ProductFilterDraft } from "./filters/types";

type ProductFiltersProps = {
  categories: Category[];
  filterOptions: ProductFilterOptions;
  currentQuery: string;
  totalProducts: number;
  department?: "women" | "men" | "unisex";
  category?: string[];
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: "newest" | "price-asc" | "price-desc";
};

const DEPARTMENT_OPTIONS = [
  { label: "All departments", value: "" },
  { label: "Women", value: "women" },
  { label: "Men", value: "men" },
  { label: "Unisex", value: "unisex" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export default function ProductFilters({
  categories,
  filterOptions,
  currentQuery,
  totalProducts,
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

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const appliedDraft = useMemo(
    () =>
      createFilterDraft({
        department,
        category,
        size,
        color,
        minPrice,
        maxPrice,
        inStock,
      }),
    [department, category, size, color, minPrice, maxPrice, inStock],
  );

  const [draft, setDraft] = useState<ProductFilterDraft>(() => appliedDraft);

  const [priceError, setPriceError] = useState("");
  const [liveCount, setLiveCount] = useState<number | null>(totalProducts);
  const [countError, setCountError] = useState("");

  // Sync the draft when the applied URL changes.
  useEffect(() => {
    setDraft(appliedDraft);
    setLiveCount(totalProducts);
    setPriceError("");
    setCountError("");
  }, [appliedDraft, totalProducts, currentQuery]);

  const activeFilterCount = countActiveFilters(appliedDraft);

  const updateDraft = (updates: Partial<ProductFilterDraft>) => {
    setDraft((current) => ({
      ...current,
      ...updates,
    }));

    if ("minPrice" in updates || "maxPrice" in updates) {
      setPriceError("");
    }

    setCountError("");
  };

  // Live result count while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;

    const validationError = validatePriceRange(draft.minPrice, draft.maxPrice);

    if (validationError) {
      setLiveCount(null);
      setCountError(validationError);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setCountError("");

        const result = await getProducts({
          page: 1,
          limit: 1,
          ...(draft.category.length ? { category: draft.category } : {}),
          ...(draft.department
            ? {
                department: draft.department as "women" | "men" | "unisex",
              }
            : {}),
          ...(draft.size.length ? { size: draft.size } : {}),
          ...(draft.color.length ? { color: draft.color } : {}),
          ...(draft.minPrice.trim()
            ? { minPrice: Number(draft.minPrice) }
            : {}),
          ...(draft.maxPrice.trim()
            ? { maxPrice: Number(draft.maxPrice) }
            : {}),
          ...(draft.inStock ? { inStock: true } : {}),
          sort,
          signal: controller.signal,
        });

        setLiveCount(result.pagination.total);
      } catch (error) {
        if (controller.signal.aborted) return;

        setCountError(
          error instanceof Error
            ? error.message
            : "Could not calculate results.",
        );
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, draft, sort]);

  const clearDraft = () => {
    setDraft({
      department: "",
      category: [],
      size: [],
      color: [],
      minPrice: "",
      maxPrice: "",
      inStock: false,
    });

    setPriceError("");
    setCountError("");
  };

  const applyFilters = () => {
    const validationError = validatePriceRange(draft.minPrice, draft.maxPrice);

    if (validationError) {
      setPriceError(validationError);
      return;
    }

    const params = new URLSearchParams(currentQuery);

    const values: Record<string, string> = {
      department: draft.department,
      category: draft.category.join(","),
      size: draft.size.join(","),
      color: draft.color.join(","),
      minPrice: draft.minPrice.trim(),
      maxPrice: draft.maxPrice.trim(),
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    if (draft.inStock) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }

    params.delete("page");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });

    closeDrawer();
  };

  const updateSort = (nextSort: string) => {
    const params = new URLSearchParams(currentQuery);

    if (nextSort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }

    params.delete("page");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const availableCategories = categories.filter(
    (item) => !draft.department || item.department === draft.department,
  );

  return (
    <>
      <section className="mb-7 border-y border-[#e8e8e3] py-4 sm:mb-9">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="inline-flex min-h-10 items-center gap-2.5 text-sm font-semibold text-[#171717] transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171717]"
          >
            <MdTune size={19} aria-hidden="true" />
            <span>Filter</span>

            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#171717] text-[10px] font-semibold tabular-nums text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-[#85857e] sm:inline">
              Sort by
            </span>

            <div className="w-38.5 sm:w-47.5">
              <FilterSelect
                label="Sort by"
                hideLabel
                value={sort}
                options={SORT_OPTIONS}
                placeholder="Sort by"
                onChange={updateSort}
              />
            </div>
          </div>
        </div>
      </section>

      <FilterDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        footer={
          <div className="space-y-3">
            {countError && (
              <p role="alert" className="text-xs text-red-700">
                {countError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearDraft}
                className="min-h-12 flex-1 border border-[#deded8] px-4 text-xs font-semibold text-[#5f5f5a] transition-colors hover:border-[#171717] hover:text-[#171717] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={applyFilters}
                disabled={Boolean(priceError) || liveCount === null}
                className="min-h-12 flex-[1.5] bg-[#171717] px-5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
              >
                {liveCount === null
                  ? "Checking results..."
                  : `View ${liveCount} Results`}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-7">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a09f97]">
              Collection
            </p>

            <div className="space-y-4">
              <FilterSelect
                label="Department"
                value={draft.department}
                options={DEPARTMENT_OPTIONS}
                placeholder="All departments"
                onChange={(value) =>
                  updateDraft({
                    department: value,
                    category: [],
                  })
                }
              />

              <section
                aria-labelledby="filter-category-heading"
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3
                    id="filter-category-heading"
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f5f5a]"
                  >
                    Category
                  </h3>

                  {draft.category.length > 0 && (
                    <button
                      type="button"
                      onClick={() => updateDraft({ category: [] })}
                      className="text-[11px] font-medium text-[#85857e] underline underline-offset-4 hover:text-[#171717]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {availableCategories.map((item) => {
                    const checked = draft.category.includes(item.slug);

                    return (
                      <label
                        key={item._id}
                        className="flex cursor-pointer items-center gap-3 py-1 text-sm text-[#5f5f5a]"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            updateDraft({
                              category: toggleFilterValue(
                                draft.category,
                                item.slug,
                              ),
                            })
                          }
                          className="size-4 accent-[#171717]"
                        />
                        <span>{item.name}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-[#eeeeea]" />

          <SizeFilter
            sizes={filterOptions.sizes}
            value={draft.size}
            onChange={(value) => updateDraft({ size: value })}
          />

          <div className="border-t border-[#eeeeea]" />

          <ColorFilter
            colors={filterOptions.colors}
            value={draft.color}
            onChange={(value) => updateDraft({ color: value })}
          />

          <div className="border-t border-[#eeeeea]" />

          <PriceFilter
            minValue={draft.minPrice}
            maxValue={draft.maxPrice}
            minimum={filterOptions.priceRange.min}
            maximum={filterOptions.priceRange.max}
            error={priceError}
            onMinChange={(value) => updateDraft({ minPrice: value })}
            onMaxChange={(value) => updateDraft({ maxPrice: value })}
          />

          <div className="border-t border-[#eeeeea]" />

          <AvailabilityFilter
            checked={draft.inStock}
            onChange={(checked) => updateDraft({ inStock: checked })}
          />
        </div>
      </FilterDrawer>

      <span className="sr-only" aria-live="polite">
        {totalProducts} products available
      </span>
    </>
  );
}
