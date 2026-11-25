import ProductGridSkeleton from "./ProductGridSkeleton";

type ProductListingSkeletonProps = {
  mode: "catalog" | "search";
};

export default function ProductListingSkeleton({
  mode,
}: ProductListingSkeletonProps) {
  return (
    <main
      aria-busy="true"
      aria-label="Loading product listing"
      className="mx-auto w-full max-w-500 px-3 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:px-12"
    >
      {/* Listing Header */}
      <header className="mb-8 sm:mb-10">
        <div className="flex justify-center">
          <div className="sepy-skeleton-block h-3 w-28" />
        </div>

        <div className="mt-3 flex justify-center">
          <div
            className={`sepy-skeleton-block h-12 max-w-full sm:h-18 ${
              mode === "search" ? "w-72 sm:w-120" : "w-64 sm:w-96"
            }`}
          />
        </div>

        <div className="mt-4 flex justify-center">
          <div className="sepy-skeleton-block h-3 w-20" />
        </div>
      </header>

      {/* Filter and Sort Toolbar */}
      <div className="space-y-4">
        <section className="py-2">
          <div className="flex items-center justify-between gap-3 rounded-sm border-y border-border py-2">
            {/* Filter button placeholder */}
            <div className="flex min-h-10 shrink-0 items-center gap-2 px-3">
              <div className="sepy-skeleton-block size-5 rounded-sm" />

              <div className="sepy-skeleton-block h-3 w-20 md:w-12" />

              <div className="sepy-skeleton-block size-5 rounded-full" />
            </div>

            {/* Desktop Sort / Mobile Grid View */}
            <div className="flex shrink-0 items-center gap-2 px-3">
              <div className="hidden md:block">
                <div className="sepy-skeleton-block h-10 w-40 rounded-sm md:w-47.5" />
              </div>

              <div className="flex items-center gap-1 md:hidden">
                <div className="sepy-skeleton-block size-6 rounded-sm" />
                <div className="sepy-skeleton-block size-6 rounded-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <ProductGridSkeleton />
      </div>

      <span className="sr-only">
        {mode === "search"
          ? "Search results are loading. Please wait."
          : "Products are loading. Please wait."}
      </span>
    </main>
  );
}
