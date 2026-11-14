const PRODUCT_CARD_WIDTH =
  "!w-[calc((100vw-2rem)/2)] sm:!w-[calc((100vw-2.5rem)/3)] lg:!w-[calc((100vw-4.5rem)/4)] xl:!w-[calc((100vw-6.5rem)/4)]";

export default function NewArrivalsSkeleton() {
  return (
    <section
      aria-labelledby="new-arrivals-skeleton-title"
      aria-busy="true"
      role="status"
      className="bg-background px-3 py-5 sm:px-5 lg:px-6 xl:px-10"
    >
      <div className="mx-auto max-w-full">
        <header className="mb-3 sm:mb-5">
          <h2
            id="new-arrivals-skeleton-title"
            className="font-extrabold text-black sm:text-xl uppercase"
          >
            New Arrivals
          </h2>
        </header>

        <span className="sr-only">Loading new arrivals...</span>

        <div className="flex gap-1.5 overflow-hidden">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className={`shrink-0 ${PRODUCT_CARD_WIDTH}`}
            >
              <div className="sepy-skeleton aspect-3/4" />

              <div className="mt-3 space-y-2">
                <div className="sepy-skeleton h-3 w-3/4" />

                <div className="sepy-skeleton h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
