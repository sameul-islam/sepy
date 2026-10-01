import Link from "next/link";
import HeroMedia from "./HeroMedia";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate h-svh min-h-150 w-full overflow-hidden bg-surface"
    >
      {/* Hero media */}
      <HeroMedia />

      {/* Hero content */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-360 items-center justify-center md:justify-start md:items-end px-5 md:px-8 md:pb-12 lg:px-12 lg:pb-16">
        <div className="max-w-xl">
          <p className="mb-3 text-[0.65rem] text-center md:text-start font-medium uppercase tracking-[0.24em] text-white/75 sm:text-xs">
            SEPY Performance
          </p>

          <h1
            id="hero-title"
            className="max-w-lg text-center md:text-start font-display text-4xl leading-[0.95] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            Performance,
            <br />
            refined.
          </h1>

          <p className="mt-5 text-center md:text-start max-w-md text-sm leading-6 text-white/80 sm:text-base">
            Premium sportswear designed for movement and everyday life.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center bg-white px-6 text-xs font-medium uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:bg-white/90 focus-visible:outline-white"
            >
              Shop collection
            </Link>

            <Link
              href="/collections/performance"
              className="inline-flex h-11 items-center justify-center border border-white/60 px-6 text-xs font-medium uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:border-white hover:bg-white/10 focus-visible:outline-white"
            >
              Explore performance
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="absolute bottom-6 right-5 z-20 hidden items-center gap-3 text-[0.6rem] uppercase tracking-[0.22em] text-white/65 sm:flex lg:right-12"
      >
        <span>Scroll</span>
        <span className="h-px w-8 bg-white/50" />
      </div>
    </section>
  );
}