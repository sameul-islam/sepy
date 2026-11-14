
import Image from "next/image";
import Link from "next/link";

export default function CollectionEditorial() {
  return (
    <section
      aria-labelledby="collection-editorial-title"
      className="relative isolate overflow-hidden bg-surface"
    >
      <div className="relative min-h-[75svh] w-full lg:min-h-[min(760px,82svh)]">
        <picture className="absolute inset-0 block">
          <source
            media="(max-width: 767px)"
            srcSet="/images/collection/sepy-collection.jpg"
          />

          <Image
            src="/images/collection/sepy-collection.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </picture>

        {/* Image overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-black/5 md:bg-black/20"
        />

        {/* Content */}
        <div className="relative z-10 flex min-h-[75svh] items-end px-6 py-10 sm:px-10 sm:py-12 md:items-center md:justify-center md:text-center lg:min-h-[min(760px,82svh)] lg:px-16 lg:py-16">
          <div className="max-w-sm text-white md:max-w-xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-xs">
              The Movement Collection
            </p>

            <h2
              id="collection-editorial-title"
              className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Designed to move.
            </h2>

            <Link
              href="/products"
              className="group mt-5 inline-flex items-center gap-3 border border-white bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-black transition-colors duration-300 hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:mt-7 md:px-7 md:py-4"
            >
              <span>Shop Now</span>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  d="M4.5 12H19.5M13 5.5L19.5 12L13 18.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
