const SKELETON_ITEMS = Array.from({ length: 8 }, (_, index) => index);

export default function ProductGridSkeleton() {
  return (
    <section
      aria-label="Loading products"
      aria-hidden="true"
      className="grid grid-cols-2 gap-x-1.5 gap-y-7 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-4"
    >
      {SKELETON_ITEMS.map((item) => (
        <article key={item} className="min-w-0">
          <div className="sepy-skeleton-block aspect-3/4 w-full" />

          <div className="mt-2 flex h-4.75 items-center gap-2">
            <span className="sepy-skeleton-block size-4 rounded-full" />
            <span className="sepy-skeleton-block size-4 rounded-full" />
            <span className="sepy-skeleton-block size-4 rounded-full" />
          </div>

          <div className="mt-2 space-y-2">
            <div className="sepy-skeleton-block h-3 w-4/5" />
            <div className="sepy-skeleton-block h-3 w-2/5" />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="sepy-skeleton-block h-3 w-16" />
            <span className="sepy-skeleton-block h-3 w-12" />
          </div>
        </article>
      ))}
    </section>
  );
}



