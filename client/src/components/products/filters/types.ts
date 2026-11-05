export type ProductFilterDraft = {
  department: string;
  category: string[];
  size: string[];
  color: string[];
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
};

export type FilterSelectOption = {
  label: string;
  value: string;
};