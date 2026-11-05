import type { ProductFilterDraft } from "./types";

type AppliedFilterValues = {
  department?: string;
  category?: string[];
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
};

export function createFilterDraft(
  values: AppliedFilterValues,
): ProductFilterDraft {
  return {
    department: values.department ?? "",
    category: values.category ?? [],
    size: values.size ?? [],
    color: values.color ?? [],
    minPrice:
      values.minPrice === undefined ? "" : String(values.minPrice),
    maxPrice:
      values.maxPrice === undefined ? "" : String(values.maxPrice),
    inStock: values.inStock,
  };
}

export function countActiveFilters(
  draft: ProductFilterDraft,
): number {
  return [
    draft.department,
    draft.category.length,
    draft.size.length,
    draft.color.length,
    draft.minPrice || draft.maxPrice,
    draft.inStock,
  ].filter(Boolean).length;
}

export function toggleFilterValue(
  values: string[],
  value: string,
): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function validatePriceRange(
  minValue: string,
  maxValue: string,
): string | null {
  const minText = minValue.trim();
  const maxText = maxValue.trim();

  if (
    (minText && !/^\d+$/.test(minText)) ||
    (maxText && !/^\d+$/.test(maxText))
  ) {
    return "Enter valid whole-number prices.";
  }

  const min = minText ? Number(minText) : undefined;
  const max = maxText ? Number(maxText) : undefined;

  if (
    (min !== undefined &&
      (!Number.isSafeInteger(min) || min < 0)) ||
    (max !== undefined &&
      (!Number.isSafeInteger(max) || max < 0))
  ) {
    return "Enter a valid price.";
  }

  if (min !== undefined && max !== undefined && min > max) {
    return "Minimum price cannot exceed maximum price.";
  }

  return null;
}