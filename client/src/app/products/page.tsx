import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";
import type { Category, ProductListData } from "@/lib/api-types";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    category?: string | string[];
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

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const requestedPage = getPageNumber(getSingleValue(params.page));
  const categorySlug = getSingleValue(params.category);

  let categories: Category[] = [];
  let listing: ProductListData;

  try {
    [categories, listing] = await Promise.all([
      getCategories(),
      getProducts({
        page: requestedPage,
        limit: 12,
        ...(categorySlug ? { category: categorySlug } : {}),
      }),
    ]);
  } catch {
    return (
      <main className="mx-auto w-full max-w-360 px-5 py-20 sm:px-8 lg:px-12">
        <h1 className="text-3xl font-medium text-[#171717]">Products</h1>
        <p className="mt-4 text-sm text-[#5f5f5a]">
          We couldn&apos;t load the products right now. Please try again
          shortly.
        </p>
      </main>
    );
  }

  const { products, pagination } = listing;
  const selectedCategory = categories.find(
    (category) => category.slug === categorySlug,
  );

  const categoryHref = (slug?: string) => {
    const query = new URLSearchParams();

    if (slug) query.set("category", slug);

    const suffix = query.toString();
    return suffix ? `/products?${suffix}` : "/products";
  };

  const pageHref = (page: number) => {
    const query = new URLSearchParams();

    if (categorySlug) query.set("category", categorySlug);
    if (page > 1) query.set("page", String(page));

    const suffix = query.toString();
    return suffix ? `/products?${suffix}` : "/products";
  };

  return (
    <main className="mx-auto w-full max-w-360 px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#85857e]">
          SEPY / Shop
        </p>

        <h1 className="mt-3 text-3xl font-medium text-[#171717] sm:text-4xl">
          {selectedCategory?.name ?? "All Products"}
        </h1>

        <p className="mt-3 text-sm text-[#5f5f5a]">
          {pagination.total} {pagination.total === 1 ? "product" : "products"}
        </p>
      </header>

      <nav
        aria-label="Product categories"
        className="mb-8 flex gap-x-6 gap-y-3 overflow-x-auto border-b border-[#e5e5e0] pb-4"
      >
        <Link
          href={categoryHref()}
          aria-current={!categorySlug ? "page" : undefined}
          className={`shrink-0 text-sm ${
            !categorySlug
              ? "text-[#171717] underline underline-offset-8"
              : "text-[#5f5f5a] hover:text-[#171717]"
          }`}
        >
          All
        </Link>

        {categories.map((category) => (
          <Link
            key={category._id}
            href={categoryHref(category.slug)}
            aria-current={category.slug === categorySlug ? "page" : undefined}
            className={`shrink-0 text-sm ${
              category.slug === categorySlug
                ? "text-[#171717] underline underline-offset-8"
                : "text-[#5f5f5a] hover:text-[#171717]"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <section className="py-20 text-center">
          <h2 className="text-lg font-medium text-[#171717]">
            No products yet
          </h2>
          <p className="mt-2 text-sm text-[#5f5f5a]">
            New pieces are on the way. Please check back soon.
          </p>

          {categorySlug && (
            <Link
              href="/products"
              className="mt-6 inline-block text-sm underline underline-offset-4"
            >
              Browse all products
            </Link>
          )}
        </section>
      ) : (
        <section aria-label="Product results">
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-12 flex items-center justify-center gap-6"
            >
              {pagination.hasPreviousPage ? (
                <Link
                  href={pageHref(pagination.page - 1)}
                  className="text-sm underline underline-offset-4"
                >
                  Previous
                </Link>
              ) : (
                <span className="text-sm text-[#85857e]">Previous</span>
              )}

              <span className="text-sm text-[#5f5f5a]">
                {pagination.page} / {pagination.totalPages}
              </span>

              {pagination.hasNextPage ? (
                <Link
                  href={pageHref(pagination.page + 1)}
                  className="text-sm underline underline-offset-4"
                >
                  Next
                </Link>
              ) : (
                <span className="text-sm text-[#85857e]">Next</span>
              )}
            </nav>
          )}
        </section>
      )}
    </main>
  );
}
