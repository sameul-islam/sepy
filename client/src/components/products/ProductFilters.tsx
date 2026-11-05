"use client";

import { useCallback, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { MdTune } from "react-icons/md";

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
  validatePriceRange,
} from "./filters/filter-utils";

import type { ProductFilterDraft } from "./filters/types";

type ProductFiltersProps = {
  categories: Category[];
  filterOptions: ProductFilterOptions;
  currentQuery: string;
  totalProducts: number;
  department?: "women" | "men" | "unisex";
  category?: string;
  size?: string;
  color?: string;
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

  const appliedDraft = createFilterDraft({
    department,
    category,
    size,
    color,
    minPrice,
    maxPrice,
    inStock,
  });

  const [draft, setDraft] = useState<ProductFilterDraft>(() => appliedDraft);

  const [previousCurrentQuery, setPreviousCurrentQuery] =
    useState(currentQuery);

  // Synchronize draft when the applied URL query changes.
  // This supports Apply and browser Back/Forward navigation.
  if (currentQuery !== previousCurrentQuery) {
    setPreviousCurrentQuery(currentQuery);
    setDraft(appliedDraft);
  }

  const [priceError, setPriceError] = useState("");

  const activeFilterCount = countActiveFilters(
    createFilterDraft({
      department,
      category,
      size,
      color,
      minPrice,
      maxPrice,
      inStock,
    }),
  );

  const updateDraft = (updates: Partial<ProductFilterDraft>) => {
    setDraft((current) => ({
      ...current,
      ...updates,
    }));

    if ("minPrice" in updates || "maxPrice" in updates) {
      setPriceError("");
    }
  };

  // Clear only the draft selection.
  const clearDraft = () => {
    setDraft({
      department: "",
      category: "",
      size: "",
      color: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
    });

    setPriceError("");
  };

  // Apply all filters together.
  const applyFilters = () => {
    const validationError = validatePriceRange(draft.minPrice, draft.maxPrice);

    if (validationError) {
      setPriceError(validationError);
      return;
    }

    const params = new URLSearchParams(currentQuery);

    const nextValues: Record<string, string> = {
      department: draft.department,
      category: draft.category,
      size: draft.size,
      color: draft.color,
      minPrice: draft.minPrice.trim(),
      maxPrice: draft.maxPrice.trim(),
    };

    for (const [key, value] of Object.entries(nextValues)) {
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

    // Filter changes should start from the first page.
    params.delete("page");

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Sorting is independent of the drawer.
  const updateSort = (nextSort: string) => {
    const params = new URLSearchParams(currentQuery);

    if (nextSort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }

    params.delete("page");

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const availableCategories = categories.filter(
    (item) => !draft.department || item.department === draft.department,
  );

  const categoryOptions = [
    { label: "All categories", value: "" },
    ...availableCategories.map((item) => ({
      label: item.name,
      value: item.slug,
    })),
  ];

  return (
    <>
      {/* Listing Toolbar */}
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

          {/* Sorting */}
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

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        footer={
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
              className="min-h-12 flex-[1.5] bg-[#171717] px-5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#383838] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
            >
              Apply filters
            </button>
          </div>
        }
      >
        <div className="space-y-7">
          {/* Collection */}
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
                    category: "",
                  })
                }
              />

              <FilterSelect
                label="Category"
                value={draft.category}
                options={categoryOptions}
                placeholder="All categories"
                onChange={(value) => updateDraft({ category: value })}
              />
            </div>
          </div>

          <div className="border-t border-[#eeeeea]" />

          {/* Size */}
          <SizeFilter
            sizes={filterOptions.sizes}
            value={draft.size}
            onChange={(value) => updateDraft({ size: value })}
          />

          <div className="border-t border-[#eeeeea]" />

          {/* Color */}
          <ColorFilter
            colors={filterOptions.colors}
            value={draft.color}
            onChange={(value) => updateDraft({ color: value })}
          />

          <div className="border-t border-[#eeeeea]" />

          {/* Price */}
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

          {/* Availability */}
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
