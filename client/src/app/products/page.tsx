import type { Metadata } from "next";
import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
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

function getPageNumber(value: string | undefined): number {
  if (!value || !/^\d+$/.test(value)) return 1;

  const page = Number(value);

  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

function buildProductsUrl(options: {
  page?: number;
  category?: string;
  department?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "price-asc" | "price-desc";
}) {
  const params = new URLSearchParams();

  if (options.category) {
    params.set("category", options.category);
  }

  if (options.department) {
    params.set("department", options.department);
  }

  if (options.size) {
    params.set("size", options.size);
  }

  if (options.color) {
    params.set("color", options.color);
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

  const size = getSingleValue(params.size)?.trim().toUpperCase();

  const color = getSingleValue(params.color)?.trim().toLowerCase();

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

  const categorySlug = getSingleValue(params.category);

  const requestedDepartment = getSingleValue(params.department);

  const department =
    requestedDepartment === "women" ||
    requestedDepartment === "men" ||
    requestedDepartment === "unisex"
      ? requestedDepartment
      : undefined;

  const currentQueryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

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
        ...(categorySlug ? { category: categorySlug } : {}),
        ...(department ? { department } : {}),
        ...(size ? { size } : {}),
        ...(color ? { color } : {}),
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

  const { products, pagination, filters } = listing;

  const selectedCategory = categories.find(
    (item) => item.slug === categorySlug,
  );

  const selectedTitle =
    selectedCategory?.name ??
    (department === "women"
      ? "Women"
      : department === "men"
        ? "Men"
        : department === "unisex"
          ? "Unisex"
          : "All Products");

  const pageHref = (page: number) =>
    buildProductsUrl({
      page,
      category: categorySlug,
      department,
      size,
      color,
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
        category={categorySlug}
        size={size}
        color={color}
        minPrice={minPrice}
        maxPrice={maxPrice}
        inStock={inStock}
        sort={sort}
      />

      {products.length === 0 ? (
        <section className="border-t border-[#e5e5e0] py-20 text-center sm:py-28">
          <h2 className="text-xl font-medium text-[#171717]">
            Nothing here just yet
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#5f5f5a]">
            There are no products to display in this selection. Explore the full
            collection instead.
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
          <section
            aria-label="Product results"
            className="grid grid-cols-2 gap-x-1.5 gap-y-7 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-4"
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </section>

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
    </main>
  );
}
