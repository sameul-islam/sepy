"use client";

import { MdTune, MdGridView, MdGridOn } from "react-icons/md";

import FilterSelect from "./filters/FilterSelect";
import type { ProductGridView } from "./ProductGridViewContext";

type SortOption = {
  label: string;
  value: string;
};

type ProductFiltersToolbarProps = {
  activeFilterCount: number;
  isSidebarVisible: boolean;
  isDrawerOpen: boolean;
  sort: string;
  searchMode: boolean;
  gridView: ProductGridView;
  onToggleFilters: () => void;
  onSortChange: (value: string) => void;
  onGridViewChange: (value: ProductGridView) => void;
};

const SORT_OPTIONS: SortOption[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

const SEARCH_SORT_OPTIONS: SortOption[] = [
  { label: "Relevance", value: "relevance" },
  ...SORT_OPTIONS,
];

export default function ProductFiltersToolbar({
  activeFilterCount,
  isSidebarVisible,
  isDrawerOpen,
  sort,
  searchMode,
  gridView,
  onToggleFilters,
  onSortChange,
  onGridViewChange,
}: ProductFiltersToolbarProps) {
  return (
    <section className="py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          {/* Mobile filter trigger */}
          <button
            type="button"
            onClick={onToggleFilters}
            aria-haspopup="dialog"
            aria-expanded={isDrawerOpen}
            aria-controls="product-filters-panel"
            className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2.5 border border-gray-300 px-3 py-1.5 text-xs font-bold text-[#171717] transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171717] lg:hidden"
          >
            <MdTune size={19} aria-hidden="true" />
            <span>Filter</span>

            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#171717] text-[10px] font-semibold tabular-nums text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop sidebar trigger */}
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={isSidebarVisible}
            aria-controls="product-filters-panel"
            className="hidden min-h-10 shrink-0 cursor-pointer items-center gap-2.5 border border-gray-300 px-3 py-1.5 text-xs font-bold text-[#171717] transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171717] lg:inline-flex"
          >
            <MdTune size={19} aria-hidden="true" />

            <span>{isSidebarVisible ? "Hide Filters" : "Show Filters"}</span>

            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#171717] text-[10px] font-semibold tabular-nums text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="w-40 sm:w-47.5">
            <FilterSelect
              label="Sort by"
              hideLabel
              value={sort}
              options={searchMode ? SEARCH_SORT_OPTIONS : SORT_OPTIONS}
              placeholder="Sort by"
              onChange={onSortChange}
            />
          </div>
        </div>

        {/* Grid view controls */}
        <div
          className="flex shrink-0 items-center gap-1"
          role="group"
          aria-label="Product grid layout"
        >
          <button
            type="button"
            onClick={() => onGridViewChange("comfortable")}
            aria-label="Comfortable grid view"
            aria-pressed={gridView === "comfortable"}
            title="Comfortable grid"
            className={`flex size-10 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] ${
              gridView === "comfortable"
                ? "bg-[#171717] text-white"
                : "text-[#5f5f5a] hover:bg-[#f1f1ee]"
            }`}
          >
            <MdGridView size={21} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onGridViewChange("compact")}
            aria-label="Compact grid view"
            aria-pressed={gridView === "compact"}
            title="Compact grid"
            className={`flex size-10 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] ${
              gridView === "compact"
                ? "bg-[#171717] text-white"
                : "text-[#5f5f5a] hover:bg-[#f1f1ee]"
            }`}
          >
            <MdGridOn size={21} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
