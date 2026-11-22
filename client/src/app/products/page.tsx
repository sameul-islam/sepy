
import type { Metadata } from "next";

import ProductListingPage from "@/components/products/ProductListingPage";

export const metadata: Metadata = {
  title: "All Products | SEPY",
  description:
    "Explore SEPY performance sport-fashion essentials for everyday movement.",
};

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    category?: string | string[];
    department?: string | string[];
    size?: string | string[];
    color?: string | string[];
    minPrice?: string | string[];
    maxPrice?: string | string[];
    inStock?: string | string[];
    sort?: string | string[];
  }>;
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <ProductListingPage
      mode="catalog"
      searchParams={searchParams}
    />
  );
}
