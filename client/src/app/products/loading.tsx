const skeletonItems = Array.from({ length: 12 }, (_, index) => index);

function ProductCardSkeleton() {
  return (
    <div className="min-w-0">
      <div className="aspect-3/4 animate-pulse bg-[#f1f1ee]" />

      <div className="space-y-2 pt-3">
        <div className="h-3 w-3/4 animate-pulse rounded-sm bg-[#f1f1ee]" />
        <div className="h-3 w-1/3 animate-pulse rounded-sm bg-[#f1f1ee]" />
      </div>
    </div>
  );
}

export default function ProductsLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading products"
      className="mx-auto w-full px-2.5 pb-20 pt-10 sm:px-8 sm:pt-20 lg:px-12 lg:pb-28"
    >
      <div className="mb-8 sm:mb-10">
        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="h-9 w-44 animate-pulse rounded-sm bg-[#f1f1ee] sm:h-12 sm:w-60" />

          <div className="h-3 w-64 max-w-full animate-pulse rounded-sm bg-[#f1f1ee]" />

          <div className="h-4 w-20 animate-pulse rounded-sm bg-[#f1f1ee]" />
        </div>
      </div>

      <section
        aria-label="Loading product results"
        className="grid grid-cols-2 gap-x-1.5 gap-y-7 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-4"
      >
        {skeletonItems.map((item) => (
          <ProductCardSkeleton key={item} />
        ))}
      </section>

      <span className="sr-only">Products are loading. Please wait.</span>
    </main>
  );
}