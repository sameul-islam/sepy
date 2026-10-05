import Link from "next/link";
import HeroMedia from "./HeroMedia";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate h-[85svh] sm:h-[60svh] md:h-[70svh] lg:h-[90svh] w-full overflow-hidden bg-surface"
    >
      {/* Hero media */}
      <HeroMedia />

      {/* Hero content */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-420 items-center justify-center px-5 md:px-8 md:pb-12 lg:px-12 lg:pb-16">
        <div>
          <h1
            id="hero-title"
            className="text-center font-display text-4xl leading-[0.95] tracking-[-0.035em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Performance,
            Refined.
          </h1>

          <p className="mt-5 mx-auto text-center max-w-md font-semibold text-sm leading-6 text-white sm:text-base">
            Premium sportswear designed for movement and everyday life.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center bg-white px-6 text-xs font-semibold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:bg-white/90 focus-visible:outline-white"
            >
              Shop Women
            </Link>

            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center bg-white px-6 text-xs font-semibold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:bg-white/90 focus-visible:outline-white"
            >
              Shop Men
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
