import type { Metadata } from "next";
import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import { getCategories, getProducts } from "@/lib/api";
import type { Category, ProductListData } from "@/lib/api-types";
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
}) {
  const params = new URLSearchParams();

  if (options.category) {
    params.set("category", options.category);
  }

  if (options.department) {
    params.set("department", options.department);
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

  const categorySlug = getSingleValue(params.category);

  const requestedDepartment = getSingleValue(params.department);

  const department =
    requestedDepartment === "women" ||
    requestedDepartment === "men" ||
    requestedDepartment === "unisex"
      ? requestedDepartment
      : undefined;

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

  const { products, pagination } = listing;

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

  const departmentHref = (value?: string) =>
    buildProductsUrl({ department: value });

  const categoryHref = (slug?: string) =>
    buildProductsUrl({
      category: slug,
      department,
    });

  const pageHref = (page: number) =>
    buildProductsUrl({
      page,
      category: categorySlug,
      department,
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
    <main className="mx-auto w-full px-2.5 pb-20 pt-10 sm:px-8 sm:pt-20 lg:px-12 lg:pb-28">
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
                  className="text-sm text-[#171717] hover:underline"
                >
                  Previous
                  <MdOutlineKeyboardDoubleArrowLeft size={22} />
                </Link>
              ) : (
                <span className="text-sm text-[#cfcfc8]">
                  Previous
                  <MdOutlineKeyboardDoubleArrowLeft size={22} />
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
                  className="text-sm text-[#171717] hover:underline"
                >
                  Next
                  <MdOutlineKeyboardDoubleArrowRight size={22} />
                </Link>
              ) : (
                <span className="text-sm text-[#cfcfc8]">
                  Next <MdOutlineKeyboardDoubleArrowRight size={22} />
                </span>
              )}
            </nav>
          )}
        </>
      )}
    </main>
  );
}
