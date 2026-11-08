import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import ProductGrid from "@/components/products/ProductGrid";
import { getCategories, getProducts } from "@/lib/api";
import type { Category, ProductListData } from "@/lib/api-types";
import ProductFilters from "@/components/products/ProductFilters";
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

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

function buildProductsUrl(options: {
  page?: number;
  category?: string[];
  department?: string;
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "price-asc" | "price-desc";
}) {
  const params = new URLSearchParams();

  if (options.category?.length) {
    params.set("category", options.category.join(","));
  }

  if (options.department) {
    params.set("department", options.department);
  }

  if (options.size?.length) {
    params.set("size", options.size.join(","));
  }

  if (options.color?.length) {
    params.set("color", options.color.join(","));
  }

  if (options.minPrice !== undefined) {
    params.set("minPrice", String(options.minPrice));
  }

  if (options.maxPrice !== undefined) {
    params.set("maxPrice", String(options.maxPrice));
  }

  if (options.inStock) {
    params.set("inStock", "true");
  }

  if (options.sort && options.sort !== "newest") {
    params.set("sort", options.sort);
  }

  if (options.page && options.page > 1) {
    params.set("page", String(options.page));
  }

  const query = params.toString();

  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const requestedPage = getPageNumber(getSingleValue(params.page));

  const categorySlugs = getMultiValue(params.category);

  const sizes = getMultiValue(params.size).map((value) => value.toUpperCase());

  const colors = getMultiValue(params.color).map((value) =>
    value.toLowerCase(),
  );

  const rawMinPrice = getSingleValue(params.minPrice);
  const rawMaxPrice = getSingleValue(params.maxPrice);

  const parsedMinPrice =
    rawMinPrice !== undefined && /^\d+$/.test(rawMinPrice)
      ? Number(rawMinPrice)
      : undefined;

  const parsedMaxPrice =
    rawMaxPrice !== undefined && /^\d+$/.test(rawMaxPrice)
      ? Number(rawMaxPrice)
      : undefined;

  const minPrice =
    parsedMinPrice !== undefined && Number.isSafeInteger(parsedMinPrice)
      ? parsedMinPrice
      : undefined;

  const maxPrice =
    parsedMaxPrice !== undefined && Number.isSafeInteger(parsedMaxPrice)
      ? parsedMaxPrice
      : undefined;

  const inStock = getSingleValue(params.inStock) === "true";

  const requestedSort = getSingleValue(params.sort);

  const sort =
    requestedSort === "price-asc" || requestedSort === "price-desc"
      ? requestedSort
      : "newest";

  const requestedDepartment = getSingleValue(params.department);

  const department =
    requestedDepartment === "women" || requestedDepartment === "men"
      ? requestedDepartment
      : undefined;

  const currentQueryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const values = Array.isArray(value) ? value : [value];

    const normalizedValue = values.filter(Boolean).join(",");

    if (normalizedValue) {
      currentQueryParams.set(key, normalizedValue);
    }
  }

  const currentQuery = currentQueryParams.toString();

  let categories: Category[];
  let listing: ProductListData;

  try {
    [categories, listing] = await Promise.all([
      getCategories(),
      getProducts({
        page: requestedPage,
        limit: 12,
        ...(categorySlugs.length ? { category: categorySlugs } : {}),
        ...(department ? { department } : {}),
        ...(sizes.length ? { size: sizes } : {}),
        ...(colors.length ? { color: colors } : {}),
        ...(minPrice !== undefined ? { minPrice } : {}),
        ...(maxPrice !== undefined ? { maxPrice } : {}),
        ...(inStock ? { inStock: true } : {}),
        sort,
      }),
    ]);
  } catch {
    return (
      <main className="mx-auto w-full max-w-360 px-5 py-20 sm:px-8 lg:px-12">
        <p className="text-xs uppercase tracking-[0.18em] text-[#85857e]">
          SEPY / Shop
        </p>

        <h1 className="mt-4 text-3xl font-medium tracking-tight text-[#171717] sm:text-5xl">
          All Products
        </h1>

        <p className="mt-5 max-w-md text-sm leading-6 text-[#5f5f5a]">
          Products could not be loaded right now. Please try again shortly.
        </p>
      </main>
    );
  }

  const totalPages = listing.pagination.totalPages;

  if (requestedPage > Math.max(totalPages, 1)) {
    redirect(
      buildProductsUrl({
        page: totalPages > 0 ? totalPages : 1,
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

  const { products, pagination, filters } = listing;

  const selectedCategories = categorySlugs
    .map((slug) => categories.find((item) => item.slug === slug))
    .filter((item): item is Category => Boolean(item));

  const selectedTitle =
    selectedCategories.length > 1
      ? `${selectedCategories.length} Categories`
      : selectedCategories.length === 1
        ? selectedCategories[0].name
        : department === "women"
          ? "Women"
          : department === "men"
            ? "Men"
              : "All Products";

  const pageHref = (page: number) =>
    buildProductsUrl({
      page,
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
    <main className="mx-auto w-full px-2.5 pb-20 pt-10 sm:px-8 sm:pt-20 lg:px-14 lg:pb-28">
      <header className="mb-8 sm:mb-10">
        <div className="mt-4 flex flex-col text-center gap-4">
          <div className="">
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-[#171717] sm:text-5xl">
              {selectedTitle}
            </h1>

            <p className="mt-3 max-w-xl mx-auto font-semibold text-xs sm:text-sm text-black">
              Performance essentials, designed for movement and everyday life.
            </p>
          </div>

          <p className="text-sm text-accent font-medium" aria-live="polite">
            {pagination.total} {pagination.total === 1 ? "product" : "products"}
          </p>
        </div>
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
      >
        {products.length === 0 ? (
          <section className="border-t border-[#e5e5e0] py-20 text-center sm:py-28">
            <h2 className="text-xl font-medium text-[#171717]">
              Nothing here just yet
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#5f5f5a]">
              There are no products to display in this selection. Explore the
              full collection instead.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex border-b border-[#171717] pb-1 text-sm text-[#171717]"
            >
              Explore all products
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
                    className="flex items-center gap-1 text-xs sm:text-sm text-[#171717] font-semibold hover:underline"
                  >
                    <MdOutlineKeyboardDoubleArrowLeft size={22} />
                    <span>Previous</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#cfcfc8]">
                    <MdOutlineKeyboardDoubleArrowLeft size={22} />
                    <span>Previous</span>
                  </div>
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
                    className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#171717] hover:underline"
                  >
                    <span>Next</span>
                    <MdOutlineKeyboardDoubleArrowRight size={22} />
                  </Link>
                ) : (
                  <div className="flex text-xs sm:text-sm font-semibold text-[#cfcfc8] items-center gap-1">
                    <span>Next</span>{" "}
                    <MdOutlineKeyboardDoubleArrowRight size={22} />
                  </div>
                )}
              </nav>
            )}
          </>
        )}
      </ProductFilters>
    </main>
  );
}
