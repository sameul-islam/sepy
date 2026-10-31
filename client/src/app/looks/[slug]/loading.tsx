
function Skeleton({
  className,
}: {
  className: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-surface-muted ${className}`}
    />
  );
}

function ProductSkeleton() {
  return (
    <article className="min-w-0">
      {/* Product Image */}
      <Skeleton className="aspect-4/5 w-full" />

      {/* Product Name */}
      <Skeleton className="mt-3 h-3 w-3/4 sm:mt-4 sm:h-4" />
    </article>
  );
}

export default function LookDetailLoading() {
  return (
    <main
      aria-label="Loading look details"
      aria-busy="true"
      className="min-h-screen py-8"
    >
      {/* Editorial Hero */}
      <section className="mx-auto max-w-7xl px-2 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12 lg:px-10">
        <div className="grid items-start gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 xl:gap-20">
          {/* Main Look Image */}
          <Skeleton className="aspect-4/5 w-full" />

          {/* Editorial Content */}
          <div className="flex flex-col justify-center py-2 sm:py-6 lg:sticky lg:top-24 lg:min-h-[60vh] lg:py-12">
            <Skeleton className="h-3 w-28 sm:h-4" />

            <Skeleton className="mt-5 h-11 w-4/5 sm:h-14 lg:h-20" />

            <Skeleton className="mt-3 h-11 w-3/5 sm:h-14 lg:h-20" />

            <Skeleton className="mt-6 h-px w-12" />

            <div className="mt-6 space-y-3">
              <Skeleton className="h-3 w-full max-w-sm sm:h-4" />
              <Skeleton className="h-3 w-11/12 max-w-sm sm:h-4" />
              <Skeleton className="h-3 w-3/4 max-w-xs sm:h-4" />
            </div>

            <div className="mt-9 flex items-center gap-4">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
      </section>

      {/* Shop the Look */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-2 py-14 sm:px-8 sm:py-20 lg:px-10">
          {/* Section Heading */}
          <header className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <Skeleton className="h-3 w-32 sm:h-4" />
              <Skeleton className="mt-3 h-8 w-40 sm:h-9 sm:w-48 lg:h-10" />
            </div>

            <Skeleton className="mb-1 h-3 w-16" />
          </header>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-x-1.5 gap-y-4 sm:gap-x-2 sm:gap-y-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>

          {/* Back Navigation */}
          <div className="mt-12 border-t border-border pt-6 sm:mt-16">
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </section>
    </main>
  );
}
