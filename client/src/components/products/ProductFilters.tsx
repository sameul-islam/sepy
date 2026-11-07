"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdKeyboardArrowDown, MdTune } from "react-icons/md";

import type { Category, ProductFilterOptions } from "@/lib/api-types";

import ProductGridSkeleton from "./ProductGridSkeleton";

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
  children: ReactNode;
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

const EMPTY_FILTER: ProductFilterDraft = {
  department: "",
  category: [],
  size: [],
  color: [],
  minPrice: "",
  maxPrice: "",
  inStock: false,
};

export default function ProductFilters({
  children,
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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSkeletonDelayComplete, setIsSkeletonDelayComplete] = useState(false);

  useEffect(() => {
    if (!isPending) return;

    const timer = setTimeout(() => {
      setIsSkeletonDelayComplete(true);
    }, 180);

    return () => {
      clearTimeout(timer);
    };
  }, [isPending]);

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

  const queryRef = useRef(currentQuery);
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const priceDraftRef = useRef({
    minPrice: appliedDraft.minPrice,
    maxPrice: appliedDraft.maxPrice,
  });

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearPriceTimer = () => {
    if (priceTimerRef.current !== null) {
      clearTimeout(priceTimerRef.current);
      priceTimerRef.current = null;
    }
  };

  // Keep the local filter values synchronized with URL navigation.
  useEffect(() => {
    queryRef.current = currentQuery;

    const pendingPrice = priceDraftRef.current;
    const validationError = validatePriceRange(
      pendingPrice.minPrice,
      pendingPrice.maxPrice,
    );

    if (validationError) {
      setDraft({
        ...appliedDraft,
        ...pendingPrice,
      });
      setPriceError(validationError);
    } else {
      priceDraftRef.current = {
        minPrice: appliedDraft.minPrice,
        maxPrice: appliedDraft.maxPrice,
      };

      setDraft(appliedDraft);
      setPriceError("");
    }
  }, [appliedDraft, currentQuery]);

  useEffect(() => {
    return () => clearPriceTimer();
  }, []);

  const activeFilterCount = countActiveFilters(draft);

  // Update the URL and let the Server Component fetch the new products.
  const updateUrl = (
    nextDraft: ProductFilterDraft,
    preserveCurrentPrice = false,
  ) => {
    const params = new URLSearchParams(queryRef.current);

    const values: Record<string, string> = {
      department: nextDraft.department,
      category: nextDraft.category.join(","),
      size: nextDraft.size.join(","),
      color: nextDraft.color.join(","),
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    if (!preserveCurrentPrice) {
      const min = nextDraft.minPrice.trim();
      const max = nextDraft.maxPrice.trim();

      if (min) {
        params.set("minPrice", min);
      } else {
        params.delete("minPrice");
      }

      if (max) {
        params.set("maxPrice", max);
      } else {
        params.delete("maxPrice");
      }
    }

    if (nextDraft.inStock) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }

    params.delete("page");

    const query = params.toString();

    if (query === queryRef.current) return;

    queryRef.current = query;

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const updateDraft = (updates: Partial<ProductFilterDraft>) => {
    const nextDraft = {
      ...draft,
      ...updates,
    };

    setDraft(nextDraft);

    const isPriceUpdate = "minPrice" in updates || "maxPrice" in updates;

    if (isPriceUpdate) {
      priceDraftRef.current = {
        minPrice: nextDraft.minPrice,
        maxPrice: nextDraft.maxPrice,
      };
    }

    const validationError = validatePriceRange(
      nextDraft.minPrice,
      nextDraft.maxPrice,
    );

    setPriceError(validationError ?? "");

    if (isPriceUpdate) {
      clearPriceTimer();

      if (validationError) return;

      priceTimerRef.current = setTimeout(() => {
        updateUrl(nextDraft);
        priceTimerRef.current = null;
      }, 450);

      return;
    }

    // Apply non-price filters immediately.
    clearPriceTimer();

    // Do not send invalid price values to the backend.
    // Keep the last valid price values already present in the URL.
    updateUrl(nextDraft, Boolean(validationError));
  };

  const clearAllFilters = () => {
    clearPriceTimer();

    priceDraftRef.current = {
      minPrice: "",
      maxPrice: "",
    };

    setDraft(EMPTY_FILTER);
    setPriceError("");

    updateUrl(EMPTY_FILTER);
  };

  const updateSort = (nextSort: string) => {
    clearPriceTimer();

    const params = new URLSearchParams(queryRef.current);

    // Preserve valid price values that are still waiting
    // for the debounce timer to complete.
    const pendingPrice = priceDraftRef.current;

    const validationError = validatePriceRange(
      pendingPrice.minPrice,
      pendingPrice.maxPrice,
    );

    if (!validationError) {
      const min = pendingPrice.minPrice.trim();
      const max = pendingPrice.maxPrice.trim();

      if (min) {
        params.set("minPrice", min);
      } else {
        params.delete("minPrice");
      }

      if (max) {
        params.set("maxPrice", max);
      } else {
        params.delete("maxPrice");
      }
    }

    if (nextSort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }

    params.delete("page");

    const query = params.toString();

    if (query === queryRef.current) return;

    queryRef.current = query;

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const availableCategories = categories.filter(
    (item) => !draft.department || item.department === draft.department,
  );

  return (
    <>
      <section className="py-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="inline-flex min-h-10 items-center gap-2.5 border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#171717] transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171717] cursor-pointer"
          >
            <MdTune size={19} aria-hidden="true" />
            <span>Filter</span>

            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#171717] text-[10px] font-semibold tabular-nums text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="w-47.5">
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
      </section>

      <FilterDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        footer={
          <div className="space-y-3">
            {priceError && (
              <p role="alert" className="text-xs text-red-700">
                {priceError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                disabled={activeFilterCount === 0}
                className="min-h-12 flex-1 border border-[#deded8] px-4 text-xs font-semibold text-[#5f5f5a] transition-all hover:border-[#171717] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#deded8] disabled:hover:text-[#5f5f5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={closeDrawer}
                disabled={isPending || Boolean(priceError)}
                aria-live="polite"
                className="min-h-12 flex-[1.5] bg-[#171717] px-5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
              >
                {isPending ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-3 animate-spin rounded-full border-2 border-white/35 border-t-white"
                    />
                    Updating results...
                  </span>
                ) : (
                  `View ${totalProducts} Results`
                )}
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
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen((previous) => !previous)}
                    aria-expanded={isCategoryOpen}
                    aria-controls="product-category-options"
                    className="flex min-h-8 flex-1 items-center justify-between text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
                  >
                    <span
                      id="filter-category-heading"
                      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f5f5a]"
                    >
                      Category
                      {draft.category.length > 0 && (
                        <span className="ml-2 text-[#85857e]">
                          ({draft.category.length})
                        </span>
                      )}
                    </span>

                    <MdKeyboardArrowDown
                      size={21}
                      aria-hidden="true"
                      className={`shrink-0 text-[#5f5f5a] transition-transform duration-300 ${
                        isCategoryOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {draft.category.length > 0 && (
                    <button
                      type="button"
                      onClick={() => updateDraft({ category: [] })}
                      className="ml-3 text-[11px] font-medium text-[#85857e] underline underline-offset-4 transition-colors hover:text-[#171717]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div
                  id="product-category-options"
                  aria-hidden={!isCategoryOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isCategoryOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className="space-y-2 pb-1 pt-1"
                      inert={!isCategoryOpen}
                    >
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
                  </div>
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
        {isPending
          ? "Updating product results"
          : `${totalProducts} products available`}
      </span>

      <div aria-busy={isPending}>
        {isPending && isSkeletonDelayComplete ? (
          <ProductGridSkeleton />
        ) : (
          children
        )}
      </div>
    </>
  );
}
