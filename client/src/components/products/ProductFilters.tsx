
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

import ProductFiltersToolbar from "./ProductFiltersToolbar";
import ProductFilterControls from "./filters/ProductFilterControls";
import ProductGridSkeleton from "./ProductGridSkeleton";

import type {
  Category,
  ProductFilterOptions,
} from "@/lib/api-types";

import {
  ProductGridViewContext,
  type ProductGridView,
} from "./ProductGridViewContext";

import FilterDrawer from "./filters/FillterDrawer";

import {
  countActiveFilters,
  createFilterDraft,
  validatePriceRange,
} from "./filters/filter-utils";

import type { ProductFilterDraft } from "./filters/types";

type ProductFiltersProps = {
  children: ReactNode;
  categories: Category[];
  filterOptions: ProductFilterOptions;
  currentQuery: string;
  totalProducts: number;
  department?: "women" | "men";
  category?: string[];
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: "relevance" | "featured" | "newest" | "price-asc" | "price-desc";
  searchMode: boolean;
};

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
  searchMode,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [gridView, setGridView] =
    useState<ProductGridView>("compact");

  const [isPending, startTransition] = useTransition();
  const [isSkeletonDelayComplete, setIsSkeletonDelayComplete] =
    useState(false);

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
    [
      department,
      category,
      size,
      color,
      minPrice,
      maxPrice,
      inStock,
    ],
  );

  const [draft, setDraft] = useState<ProductFilterDraft>(
    () => appliedDraft,
  );

  const [priceError, setPriceError] = useState("");

  const queryRef = useRef(currentQuery);

  const priceTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const priceDraftRef = useRef({
    minPrice: appliedDraft.minPrice,
    maxPrice: appliedDraft.maxPrice,
  });

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleFilters = () => {
    setIsDrawerOpen((previous) => !previous);
  };

  // Keep the skeleton delay consistent across transitions.
  useEffect(() => {
    if (!isPending) {
      setIsSkeletonDelayComplete(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSkeletonDelayComplete(true);
    }, 180);

    return () => {
      clearTimeout(timer);
    };
  }, [isPending]);

  const clearPriceTimer = () => {
    if (priceTimerRef.current !== null) {
      clearTimeout(priceTimerRef.current);
      priceTimerRef.current = null;
    }
  };

  // Keep local filter values synchronized with URL navigation.
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

  // Update the URL and let the Server Component fetch new products.
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
      router.replace(
        query ? `${pathname}?${query}` : pathname,
        { scroll: false },
      );
    });
  };

  const updateDraft = (
    updates: Partial<ProductFilterDraft>,
  ) => {
    const nextDraft = {
      ...draft,
      ...updates,
    };

    setDraft(nextDraft);

    const isPriceUpdate =
      "minPrice" in updates || "maxPrice" in updates;

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

    // Preserve the last valid price values in the URL.
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

    // Preserve valid price values waiting for debounce.
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

    if (
      nextSort === "relevance" ||
      (nextSort === "newest" && !searchMode)
    ) {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }

    params.delete("page");

    const query = params.toString();

    if (query === queryRef.current) return;

    queryRef.current = query;

    startTransition(() => {
      router.replace(
        query ? `${pathname}?${query}` : pathname,
        { scroll: false },
      );
    });
  };

  return (
    <div className="min-w-0 space-y-4">
      <ProductFiltersToolbar
        activeFilterCount={activeFilterCount}
        isSidebarVisible={isDrawerOpen}
        isDrawerOpen={isDrawerOpen}
        sort={sort}
        searchMode={searchMode}
        gridView={gridView}
        onToggleFilters={toggleFilters}
        onSortChange={updateSort}
        onGridViewChange={setGridView}
      />

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        footer={
          <div className="space-y-3">
            {priceError && (
              <p role="alert" className="text-xs font-bold text-red-700">
                {priceError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                disabled={activeFilterCount === 0}
                className="min-h-12 flex-1 border border-[#deded8] px-4 text-xs font-bold text-[#5f5f5a] transition-all duration-300 hover:border-[#171717] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#deded8] disabled:hover:text-[#5f5f5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] cursor-pointer"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={closeDrawer}
                disabled={isPending || Boolean(priceError)}
                aria-live="polite"
                className="min-h-12 flex-[1.5] bg-[#171717] px-5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] cursor-pointer"
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
        <ProductFilterControls
          categories={categories}
          filterOptions={filterOptions}
          draft={draft}
          priceError={priceError}
          isCategoryOpen={isCategoryOpen}
          onCategoryToggle={() =>
            setIsCategoryOpen((previous) => !previous)
          }
          onDraftChange={updateDraft}
        />
      </FilterDrawer>

      <div className="min-w-0">
        <span className="sr-only" aria-live="polite">
          {isPending
            ? "Updating product results"
            : `${totalProducts} products available`}
        </span>

        <ProductGridViewContext.Provider value={gridView}>
          <div aria-busy={isPending}>
            {isPending && isSkeletonDelayComplete ? (
              <ProductGridSkeleton />
            ) : (
              children
            )}
          </div>
        </ProductGridViewContext.Provider>
      </div>
    </div>
  );
}
