
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate h-[80svh] min-h-120 w-full overflow-hidden bg-surface sm:h-[72svh] sm:min-h-130 md:h-[78svh] lg:h-[88svh] lg:min-h-160 lg:max-h-225"
    >
      {/* Hero image */}
      <picture className="absolute inset-0 block h-full w-full">
        <source
          media="(max-width: 767px)"
          srcSet="/images/hero/sepy-mobile-hero.webp"
        />

        <Image
          src="/images/hero/sepy-desktop-hero.webp"
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover object-center"
        />
      </picture>

      {/* Readability overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/20"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/15"
      />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-420 items-center justify-center px-5 sm:px-8 lg:px-12">
        <div className="w-full max-w-3xl text-center text-white">
          <h1
            id="hero-title"
            className="font-display text-4xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Performance,
            <span className="block sm:inline"> Refined.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm font-medium leading-6 text-white/90 sm:mt-6 sm:text-base sm:leading-7">
            Premium sportswear designed for movement and everyday life.
          </p>

          {/* Primary actions */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <Link
              href="/products?department=women"
              className="inline-flex h-12 items-center justify-center border border-white bg-white px-5 text-xs font-bold uppercase tracking-[0.08em] text-black transition-colors duration-300 hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:h-13 sm:px-7 sm:text-sm"
            >
              Shop Women
            </Link>

            <Link
              href="/products?department=men"
              className="inline-flex h-12 items-center justify-center border border-white bg-white px-5 text-xs font-bold uppercase tracking-[0.08em] text-black transition-colors duration-300 hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:h-13 sm:px-7 sm:text-sm"
            >
              Shop Men
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 right-5 z-20 hidden select-none items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-white/70 sm:flex lg:bottom-9 lg:right-12"
      >
        <span>Scroll</span>
        <span className="h-px w-8 bg-white/60" />
      </div>
    </section>
  );
}
