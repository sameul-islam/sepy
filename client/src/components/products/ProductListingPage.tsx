import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import { getCategories, getProducts } from "@/lib/api";
import type { Category, ProductListData } from "@/lib/api-types";

type ListingMode = "catalog" | "search";

type SearchParams = {
  page?: string | string[];
  q?: string | string[];
  category?: string | string[];
  department?: string | string[];
  size?: string | string[];
  color?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  inStock?: string | string[];
  sort?: string | string[];
};

type ProductListingPageProps = {
  mode: ListingMode;
  searchParams: Promise<SearchParams>;
};

type SortOption =
  | "relevance"
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc";

function getSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getMultiValue(value: string | string[] | undefined): string[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];

  return [
    ...new Set(
      rawValues.flatMap((item) =>
        item
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ),
  ];
}

function getPageNumber(value: string | undefined): number {
  if (!value || !/^\d+$/.test(value)) return 1;

  const page = Number(value);

  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

function getPrice(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;

  const price = Number(value);

  return Number.isSafeInteger(price) ? price : undefined;
}

function getSort(value: string | undefined, mode: ListingMode): SortOption {
if (
  value === "featured" ||
  value === "price-asc" ||
  value === "price-desc" ||
  value === "newest"
) {
  return value;
}

  return mode === "search" ? "relevance" : "newest";
}

function buildListingUrl(options: {
  pathname: string;
  page?: number;
  search?: string;
  category?: string[];
  department?: string;
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort: SortOption;
}): string {
  const params = new URLSearchParams();

  if (options.search) params.set("q", options.search);
  if (options.category?.length) {
    params.set("category", options.category.join(","));
  }
  if (options.department) params.set("department", options.department);
  if (options.size?.length) params.set("size", options.size.join(","));
  if (options.color?.length) params.set("color", options.color.join(","));
  if (options.minPrice !== undefined) {
    params.set("minPrice", String(options.minPrice));
  }
  if (options.maxPrice !== undefined) {
    params.set("maxPrice", String(options.maxPrice));
  }
  if (options.inStock) params.set("inStock", "true");

  if (
    options.sort !== "relevance" &&
    (options.sort !== "newest" || options.pathname === "/search")
  ) {
    params.set("sort", options.sort);
  }

  if (options.page && options.page > 1) {
    params.set("page", String(options.page));
  }

  const query = params.toString();

  return query ? `${options.pathname}?${query}` : options.pathname;
}

function getCurrentQuery(params: SearchParams): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const values = Array.isArray(value) ? value : [value];
    const normalizedValue = values.filter(Boolean).join(",");

    if (normalizedValue) query.set(key, normalizedValue);
  }

  return query.toString();
}

function getSelectedTitle(
  categories: Category[],
  categorySlugs: string[],
  department?: "women" | "men",
): string {
  const selectedCategories = categorySlugs
    .map((slug) => categories.find((item) => item.slug === slug))
    .filter((item): item is Category => Boolean(item));

  if (selectedCategories.length > 1) {
    return `${selectedCategories.length} Categories`;
  }

  if (selectedCategories.length === 1) {
    return selectedCategories[0].name;
  }

  if (department === "women") return "Women";
  if (department === "men") return "Men";

  return "All Products";
}

export default async function ProductListingPage({
  mode,
  searchParams,
}: ProductListingPageProps) {
  const params = await searchParams;

  const searchTerm = getSingleValue(params.q)?.trim() ?? "";

  if (mode === "search" && searchTerm.length < 2) {
    return (
      <main className="mx-auto w-full max-w-360 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#85857e]">
          SEPY / Search
        </p>

        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#171717] sm:text-5xl">
          Search SEPY
        </h1>

        <p className="mt-4 max-w-md text-sm leading-6 text-[#5f5f5a]">
          Enter at least two characters to search our collection.
        </p>
      </main>
    );
  }

  const pathname = mode === "search" ? "/search" : "/products";

  const requestedPage = getPageNumber(getSingleValue(params.page));
  const categorySlugs = getMultiValue(params.category);
  const sizes = getMultiValue(params.size).map((value) => value.toUpperCase());
  const colors = getMultiValue(params.color).map((value) =>
    value.toLowerCase(),
  );

  const minPrice = getPrice(getSingleValue(params.minPrice));
  const maxPrice = getPrice(getSingleValue(params.maxPrice));
  const inStock = getSingleValue(params.inStock) === "true";

  const requestedDepartment = getSingleValue(params.department);
  const department =
    requestedDepartment === "women" || requestedDepartment === "men"
      ? requestedDepartment
      : undefined;

  const sort = getSort(getSingleValue(params.sort), mode);
  const currentQuery = getCurrentQuery(params);

  let categories: Category[];
  let listing: ProductListData;

  try {
    [categories, listing] = await Promise.all([
      getCategories(),
      getProducts({
        page: requestedPage,
        limit: 12,
        ...(mode === "search" ? { search: searchTerm } : {}),
        ...(categorySlugs.length ? { category: categorySlugs } : {}),
        ...(department ? { department } : {}),
        ...(sizes.length ? { size: sizes } : {}),
        ...(colors.length ? { color: colors } : {}),
        ...(minPrice !== undefined ? { minPrice } : {}),
        ...(maxPrice !== undefined ? { maxPrice } : {}),
        ...(inStock ? { inStock: true } : {}),
        ...(sort !== "relevance" ? { sort } : {}),
      }),
    ]);
  } catch {
    return (
      <main className="mx-auto w-full max-w-360 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#85857e]">
          SEPY / {mode === "search" ? "Search" : "Shop"}
        </p>

        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#171717] sm:text-5xl">
          {mode === "search" ? `Results for “${searchTerm}”` : "All Products"}
        </h1>

        <p className="mt-5 max-w-md text-sm leading-6 text-[#5f5f5a]">
          Products could not be loaded right now. Please try again shortly.
        </p>
      </main>
    );
  }

  const { products, pagination, filters } = listing;

  if (requestedPage > Math.max(pagination.totalPages, 1)) {
    redirect(
      buildListingUrl({
        pathname,
        page: pagination.totalPages > 0 ? pagination.totalPages : 1,
        search: mode === "search" ? searchTerm : undefined,
        category: categorySlugs,
        department,
        size: sizes,
        color: colors,
        minPrice,
        maxPrice,
        inStock,
        sort,
      }),
    );
  }

  const selectedTitle = getSelectedTitle(categories, categorySlugs, department);

  const pageHref = (page: number) =>
    buildListingUrl({
      pathname,
      page,
      search: mode === "search" ? searchTerm : undefined,
      category: categorySlugs,
      department,
      size: sizes,
      color: colors,
      minPrice,
      maxPrice,
      inStock,
      sort,
    });

  const pageNumbers = Array.from(
    { length: pagination.totalPages },
    (_, index) => index + 1,
  ).filter(
    (page) =>
      page === 1 ||
      page === pagination.totalPages ||
      Math.abs(page - pagination.page) <= 1,
  );

  return (
    <main className="mx-auto w-full max-w-500 px-3 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:px-12">
      <header className="mb-8 sm:mb-10">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#85857e]">
          SEPY / {mode === "search" ? "Search" : "Shop"}
        </p>

        <h1 className="mt-3 text-center font-display text-5xl font-semibold tracking-tight text-[#171717] sm:text-7xl">
          {mode === "search" ? `Results for “${searchTerm}”` : selectedTitle}
        </h1>
        <p
          className="mt-4 text-center text-xs font-bold text-[#5f5f5a]"
          aria-live="polite"
        >
          {pagination.total} {pagination.total === 1 ? "product" : "products"}
        </p>
      </header>

      <ProductFilters
        categories={categories}
        filterOptions={filters}
        currentQuery={currentQuery}
        totalProducts={pagination.total}
        department={department}
        category={categorySlugs}
        size={sizes}
        color={colors}
        minPrice={minPrice}
        maxPrice={maxPrice}
        inStock={inStock}
        sort={sort}
        searchMode={mode === "search"}
      >
        {products.length === 0 ? (
          <section className="border-t border-[#e5e5e0] py-20 text-center sm:py-28">
            <h2 className="text-xl font-medium text-[#171717]">
              {mode === "search"
                ? "No matching products found"
                : "Nothing here just yet"}
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#5f5f5a]">
              {mode === "search"
                ? "Try another search term or adjust your filters to explore more of the collection."
                : "There are no products to display in this selection. Explore the full collection instead."}
            </p>

            <Link
              href={mode === "search" ? "/search" : "/products"}
              className="mt-6 inline-flex border-b border-[#171717] pb-1 text-sm text-[#171717]"
            >
              {mode === "search" ? "Search again" : "Explore all products"}
            </Link>
          </section>
        ) : (
          <>
            <ProductGrid products={products} />

            {pagination.totalPages > 1 && (
              <nav
                aria-label="Product pages"
                className="mt-14 flex flex-wrap items-center justify-center gap-5 border-t border-border pt-7"
              >
                {pagination.hasPreviousPage ? (
                  <Link
                    href={pageHref(pagination.page - 1)}
                    rel="prev"
                    className="flex items-center gap-1 text-xs font-semibold text-[#171717] hover:underline sm:text-sm"
                  >
                    <MdOutlineKeyboardDoubleArrowLeft size={22} />
                    <span>Previous</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#cfcfc8] sm:text-sm">
                    <MdOutlineKeyboardDoubleArrowLeft size={22} />
                    <span>Previous</span>
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {pageNumbers.map((page, index) => {
                    const previousPage = pageNumbers[index - 1];

                    return (
                      <span key={page} className="flex items-center gap-2">
                        {previousPage !== undefined &&
                          page - previousPage > 1 && (
                            <span
                              className="px-1 text-sm text-[#85857e]"
                              aria-hidden="true"
                            >
                              …
                            </span>
                          )}

                        <Link
                          href={pageHref(page)}
                          aria-current={
                            page === pagination.page ? "page" : undefined
                          }
                          aria-label={`Page ${page}`}
                          className={`flex size-9 items-center justify-center rounded-full text-sm ${
                            page === pagination.page
                              ? "bg-[#171717] text-white"
                              : "text-[#5f5f5a] hover:bg-[#f1f1ee]"
                          }`}
                        >
                          {page}
                        </Link>
                      </span>
                    );
                  })}
                </div>

                {pagination.hasNextPage ? (
                  <Link
                    href={pageHref(pagination.page + 1)}
                    rel="next"
                    className="flex items-center gap-1 text-xs font-semibold text-[#171717] hover:underline sm:text-sm"
                  >
                    <span>Next</span>
                    <MdOutlineKeyboardDoubleArrowRight size={22} />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#cfcfc8] sm:text-sm">
                    <span>Next</span>
                    <MdOutlineKeyboardDoubleArrowRight size={22} />
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </ProductFilters>
    </main>
  );
}
