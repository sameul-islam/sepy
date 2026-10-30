
import Image from "next/image";

export default function LooksBanner() {
  return (
    <section
      aria-label="SEPY editorial"
      className="relative mb-10 aspect-5/3 w-full overflow-hidden bg-surface sm:mb-14 sm:aspect-16/5"
    >
      <picture>
        <source
          media="(max-width: 639px)"
          srcSet="/images/looks/looks-banner-mobile.jpg"
        />
        <source
          media="(min-width: 640px)"
          srcSet="/images/looks/looks-banner-desktop.jpg"
        />

        <Image
          src="/images/looks/looks-banner-desktop.jpg"
          alt="SEPY editorial lookbook"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </picture>
    </section>
  );
}
