"use client";

import { MdTune, MdGridView, MdGridOn } from "react-icons/md";

import FilterSelect from "./filters/FilterSelect";
import type { ProductGridView } from "./ProductGridViewContext";
import { HiOutlineViewGrid, HiViewGrid } from "react-icons/hi";
import { BiCheckbox, BiSolidCheckbox } from "react-icons/bi";
import { RiCheckboxBlankFill, RiCheckboxBlankLine } from "react-icons/ri";

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
    <div className="flex items-center justify-between gap-3 border-y border-border rounded-sm py-2">
      {/* Left: Filter */}
      <button
        type="button"
        onClick={onToggleFilters}
        aria-haspopup="dialog"
        aria-expanded={isDrawerOpen}
        aria-controls="product-filters-panel"
        className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 px-3 py-1.5 font-bold text-[#171717] transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171717]"
      >
        <MdTune size={22} aria-hidden="true" />
        <span className="hidden md:inline">Filter</span>
        <span className="md:hidden">Filter &amp; Sort</span>

        {activeFilterCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-[#171717] text-[10px] font-semibold tabular-nums text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Right: Desktop Sort / Mobile Grid */}
      <div className="flex shrink-0 items-center gap-2 px-3">
        <div className="hidden w-40 md:block md:w-47.5">
          <FilterSelect
            label="Sort by"
            hideLabel
            value={sort}
            options={searchMode ? SEARCH_SORT_OPTIONS : SORT_OPTIONS}
            placeholder="Sort by"
            onChange={onSortChange}
          />
        </div>

        <div
          className="flex items-center gap-1 md:hidden"
          role="group"
          aria-label="Product grid layout"
        >
          <button
            type="button"
            onClick={() => onGridViewChange("comfortable")}
            aria-label="Comfortable grid view"
            aria-pressed={gridView === "comfortable"}
            title="Comfortable grid"
            className="flex size-6 items-center justify-center text-black"
          >
            {gridView === "comfortable" ? (
              <RiCheckboxBlankFill size={22} />
            ) : (
              <RiCheckboxBlankLine size={22} />
            )}
          </button>

          <button
            type="button"
            onClick={() => onGridViewChange("compact")}
            aria-label="Compact grid view"
            aria-pressed={gridView === "compact"}
            title="Compact grid"
            className="flex size-6 items-center justify-center text-black"
          >
            {gridView === "compact" ? (
              <HiViewGrid size={22} />
            ) : (
              <HiOutlineViewGrid size={22} />
            )}
          </button>
        </div>
      </div>
    </div>
  </section>
);

}
