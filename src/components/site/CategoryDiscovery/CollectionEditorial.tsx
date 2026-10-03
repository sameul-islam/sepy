import Image from "next/image";
import Link from "next/link";

export default function CollectionEditorial() {
  return (
    <section
      aria-labelledby="collection-editorial-title"
      className="relative isolate overflow-hidden bg-surface"
    >
      <div className="relative min-h-[75svh] lg:min-h-[85svh] w-full">
        <picture className="absolute inset-0 block">
          <source
            media="(max-width: 767px)"
            srcSet="/images/collection/sepy-mobile-collection.webp"
          />

          <Image
            src="/images/collection/sepy-desktop-collection.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </picture>

        <div aria-hidden="true" className="absolute inset-0 bg-black/15" />

        <div className="relative z-10 flex min-h-[78svh] items-end px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
          <div className="max-w-sm text-white">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] sm:text-xs">
              The Movement Collection
            </p>

            <h2
              id="collection-editorial-title"
              className="text-3xl font-medium tracking-[-0.035em] sm:text-4xl lg:text-5xl"
            >
              Designed to move.
            </h2>

            <Link
              href="/collections/movement"
              className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] transition-opacity duration-300 hover:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
            >
              <span>Explore Collection</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10  bg-black/20 "
        />
      </div>
    </section>
  );
}
