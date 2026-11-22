
import { MdKeyboardArrowDown } from "react-icons/md";

import type { Category, ProductFilterOptions } from "@/lib/api-types";

import AvailabilityFilter from "./AvailabilityFilter";
import ColorFilter from "./ColorFilter";
import FilterSelect from "./FilterSelect";
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
};

const DEPARTMENT_OPTIONS = [
  { label: "All departments", value: "" },
  { label: "Women", value: "women" },
  { label: "Men", value: "men" },
];

export default function ProductFilterControls({
  categories,
  filterOptions,
  draft,
  priceError,
  isCategoryOpen,
  onCategoryToggle,
  onDraftChange,
}: ProductFilterControlsProps) {
  return (
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
              onDraftChange({
                department: value,
                category: [],
              })
            }
          />

          {/* Category */}
          <section
            aria-labelledby="filter-category-heading"
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onCategoryToggle}
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
                  onClick={() => onDraftChange({ category: [] })}
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
                  {categories.map((item) => {
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
                            onDraftChange({
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

      {/* Size */}
      <SizeFilter
        sizes={filterOptions.sizes}
        value={draft.size}
        onChange={(value) => onDraftChange({ size: value })}
      />

      <div className="border-t border-[#eeeeea]" />

      {/* Color */}
      <ColorFilter
        colors={filterOptions.colors}
        value={draft.color}
        onChange={(value) => onDraftChange({ color: value })}
      />

      <div className="border-t border-[#eeeeea]" />

      {/* Price */}
      <PriceFilter
        minValue={draft.minPrice}
        maxValue={draft.maxPrice}
        minimum={filterOptions.priceRange.min}
        maximum={filterOptions.priceRange.max}
        error={priceError}
        onMinChange={(value) => onDraftChange({ minPrice: value })}
        onMaxChange={(value) => onDraftChange({ maxPrice: value })}
      />

      <div className="border-t border-[#eeeeea]" />

      {/* Availability */}
      <AvailabilityFilter
        checked={draft.inStock}
        onChange={(checked) => onDraftChange({ inStock: checked })}
      />
    </div>
  );
}
