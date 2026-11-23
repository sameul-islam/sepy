"use client";

import { useState } from "react";

import type { Category, ProductFilterOptions } from "@/lib/api-types";

import AvailabilityFilter from "./AvailabilityFilter";
import ColorFilter from "./ColorFilter";
import FilterAccordion from "./FilterAccordion";
import PriceFilter from "./PriceFilter";
import SizeFilter from "./SizeFilter";

import { toggleFilterValue } from "./filter-utils";
import type { ProductFilterDraft } from "./types";

type ProductFilterControlsProps = {
  categories: Category[];
  filterOptions: ProductFilterOptions;
  draft: ProductFilterDraft;
  priceError: string;
  isCategoryOpen: boolean;
  onCategoryToggle: () => void;
  onDraftChange: (updates: Partial<ProductFilterDraft>) => void;
  sort: string;
  searchMode: boolean;
  onSortChange: (value: string) => void;
};

const GENDER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Women", value: "women" },
  { label: "Men", value: "men" },
];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

const SEARCH_SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  ...SORT_OPTIONS,
];

export default function ProductFilterControls({
  categories,
  filterOptions,
  draft,
  priceError,
  isCategoryOpen,
  onCategoryToggle,
  onDraftChange,
  sort,
  searchMode,
  onSortChange,
}: ProductFilterControlsProps) {
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Sort - Mobile */}
      <div className="md:hidden">
        <FilterAccordion
          title="Sort By"
          isOpen={isSortOpen}
          onToggle={() => setIsSortOpen((previous) => !previous)}
        >
          <div className="space-y-3">
            {(searchMode ? SEARCH_SORT_OPTIONS : SORT_OPTIONS).map((option) => {
              const selected = sort === option.value;

              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#2c2c29]"
                >
                  <input
                    type="radio"
                    name="product-sort"
                    value={option.value}
                    checked={selected}
                    onChange={() => onSortChange(option.value)}
                    className="size-4 accent-[#171717]"
                  />

                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </FilterAccordion>
      </div>
      {/* Gender */}
      <FilterAccordion
        title="Gender"
        isOpen={isGenderOpen}
        onToggle={() => setIsGenderOpen((previous) => !previous)}
        selectedCount={draft.department ? 1 : 0}
        onClear={() =>
          onDraftChange({
            department: "",
            category: [],
          })
        }
      >
        <div className="space-y-3">
          {GENDER_OPTIONS.map((option) => {
            const selected = draft.department === option.value;

            return (
              <label
                key={option.value || "all"}
                className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#2c2c29]"
              >
                <input
                  type="radio"
                  name="product-gender"
                  value={option.value}
                  checked={selected}
                  onChange={() =>
                    onDraftChange({
                      department: option.value,
                      category: [],
                    })
                  }
                  className="size-4 accent-[#171717]"
                />

                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </FilterAccordion>

      {/* Category */}
      <FilterAccordion
        title="Category"
        isOpen={isCategoryOpen}
        onToggle={onCategoryToggle}
        selectedCount={draft.category.length}
        onClear={() => onDraftChange({ category: [] })}
      >
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((item) => {
              const checked = draft.category.includes(item.slug);

              return (
                <label
                  key={item._id}
                  className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#2c2c29]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onDraftChange({
                        category: toggleFilterValue(draft.category, item.slug),
                      })
                    }
                    className="size-4 accent-[#171717]"
                  />

                  <span>{item.name}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-xs leading-5 text-[#85857e]">
            No categories available.
          </p>
        )}
      </FilterAccordion>

      {/* Size */}
      <FilterAccordion
        title="Size"
        isOpen={isSizeOpen}
        onToggle={() => setIsSizeOpen((previous) => !previous)}
        selectedCount={draft.size.length}
        onClear={() => onDraftChange({ size: [] })}
      >
        <SizeFilter
          sizes={filterOptions.sizes}
          value={draft.size}
          onChange={(value) => onDraftChange({ size: value })}
        />
      </FilterAccordion>

      {/* Color */}
      <FilterAccordion
        title="Color"
        isOpen={isColorOpen}
        onToggle={() => setIsColorOpen((previous) => !previous)}
        selectedCount={draft.color.length}
        onClear={() => onDraftChange({ color: [] })}
      >
        <ColorFilter
          colors={filterOptions.colors}
          value={draft.color}
          onChange={(value) => onDraftChange({ color: value })}
        />
      </FilterAccordion>

      {/* Price */}
      <FilterAccordion
        title="Price"
        isOpen={isPriceOpen}
        onToggle={() => setIsPriceOpen((previous) => !previous)}
        selectedCount={draft.minPrice || draft.maxPrice ? 1 : 0}
        onClear={() =>
          onDraftChange({
            minPrice: "",
            maxPrice: "",
          })
        }
      >
        <PriceFilter
          minValue={draft.minPrice}
          maxValue={draft.maxPrice}
          minimum={filterOptions.priceRange.min}
          maximum={filterOptions.priceRange.max}
          error={priceError}
          onMinChange={(value) => onDraftChange({ minPrice: value })}
          onMaxChange={(value) => onDraftChange({ maxPrice: value })}
        />
      </FilterAccordion>

      {/* Availability */}
      <div className="pt-1">
        <AvailabilityFilter
          checked={draft.inStock}
          onChange={(checked) => onDraftChange({ inStock: checked })}
        />
      </div>
    </div>
  );
}
