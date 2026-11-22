import type { Metadata } from "next";

import ProductListingPage from "@/components/products/ProductListingPage";

export const metadata: Metadata = {
  title: "Search | SEPY",
  description:
    "Find performance essentials and activewear designed for movement and everyday life.",
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
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

export default function SearchPage({ searchParams }: SearchPageProps) {
  return <ProductListingPage mode="search" searchParams={searchParams} />;
}
