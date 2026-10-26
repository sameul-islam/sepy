import Image from "next/image";
import Link from "next/link";

export default function CollectionEditorial() {
  return (
    <section
      aria-labelledby="collection-editorial-title"
      className="relative isolate overflow-hidden bg-surface"
    >
      <div className="relative min-h-[75svh] w-full lg:min-h-[85svh]">
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

        <div aria-hidden="true" className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 flex min-h-[75svh] items-end px-6 py-10 sm:px-10 sm:py-12 lg:min-h-[85svh] lg:px-16 lg:py-16">
          <div className="max-w-sm text-white">
            <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] sm:text-xs">
              The Movement Collection
            </h3>

            <h2
              id="collection-editorial-title"
              className="text-3xl font-medium tracking-[-0.035em] sm:text-4xl lg:text-5xl"
            >
              Designed to move.
            </h2>

            <Link href="/products">
              <button className="mt-3 relative overflow-hidden px-4 py-2.5 text-sm font-bold uppercase border hover:border-white bg-white text-black transition-colors duration-300 group cursor-pointer">
                <span className="relative z-10 group-hover:text-white">SHOP NOW</span>
                <span className="absolute inset-0 bg-black -translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
