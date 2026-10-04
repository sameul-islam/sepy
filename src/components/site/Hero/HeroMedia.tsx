import Image from "next/image";

export default function HeroMedia() {

  return (
    <>
      {/* Hero image */}
      <div className="absolute inset-0">
        <picture className="relative block h-full w-full">
          <source
            media="(max-width: 767px)"
            srcSet="/images/hero/sepy-mobile-hero.webp"
          />

          <Image
            src="/images/hero/sepy-desktop-hero.webp"
            alt="SEPY premium sports fashion campaign"
            fill
            preload
            sizes="100vw"
            className="scale-[1.025] object-cover object-center opacity-100 transition-transform duration-1400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:scale-100 motion-reduce:transition-none"
          />
        </picture>
      </div>

      {/* Readability overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-black/20 via-transparent to-black/5"
      />
    </>
  );
}