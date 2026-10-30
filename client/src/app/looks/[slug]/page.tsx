import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApiError, getLookBySlug } from "@/lib/api";
import { MdKeyboardDoubleArrowLeft, MdOutlineArrowOutward } from "react-icons/md";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  try {
    const look = await getLookBySlug(slug);

    return {
      title: `${look.title} | SEPY`,
      description: `Discover the ${look.title} look from SEPY and shop the pieces that complete it.`,
      alternates: {
        canonical: `/looks/${encodeURIComponent(look.slug)}`,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    return {
      title: "The Look | SEPY",
      description: "Discover curated sport-fashion looks from SEPY.",
    };
  }
}

export default async function LookDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let look;

  try {
    look = await getLookBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    console.error("Failed to load Look:", error);
    throw error;
  }

  return (
    <main className="min-h-screen py-8">
      {/* Editorial Hero */}
      <section className="mx-auto max-w-7xl px-2 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12 lg:px-10">
        <div className="grid items-start gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 xl:gap-20">
          {/* Main Look Image */}
          <div className="relative aspect-4/5 overflow-hidden bg-surface">
            <Image
              src={look.image.url}
              alt={look.image.alt}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 58vw"
              className="object-cover"
            />
          </div>

          {/* Editorial Content */}
          <div className="flex flex-col justify-center py-2 sm:py-6 lg:sticky lg:top-24 lg:min-h-[60vh] lg:py-12">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-text-muted sm:text-xs">
              {look.eyebrow}
            </p>

            <h1 className="mt-5 max-w-xl font-display text-4xl leading-[1.04] tracking-[-0.045em] text-text-primary sm:text-5xl lg:text-6xl xl:text-7xl">
              {look.title}
            </h1>

            <div className="mt-6 h-px w-12 bg-border-strong" />

            <p className="mt-6 max-w-md text-sm leading-7 text-text-secondary sm:text-base sm:leading-8">
              A considered combination of performance and everyday style.
              Explore the pieces that bring this look together.
            </p>

            <div className="mt-9 flex items-center gap-4">
              <a
                href="#shop-the-look"
                className="group inline-flex items-center gap-4 border-b border-text-primary pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-text-primary transition-opacity hover:opacity-60 sm:text-xs"
              >
                Shop the Look
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-y-1"
                >
                  ↓
                </span>
              </a>

              <span className="text-xs text-text-muted">
                {look.products.length}{" "}
                {look.products.length === 1 ? "piece" : "pieces"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Shop the Look */}
      <section
        id="shop-the-look"
        className="scroll-mt-8 border-t border-border"
      >
        <div className="mx-auto max-w-7xl px-2 py-14 sm:px-8 sm:py-20 lg:px-10">
          {/* Section Heading */}
          <header className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted sm:text-xs">
                COMPLETE THE OUTFIT
              </p>

              <h2 className="mt-3 font-display text-2xl tracking-[-0.035em] text-text-primary sm:text-3xl lg:text-4xl">
                Shop the Look
              </h2>
            </div>

            <span className="pb-1 text-xs tabular-nums text-text-secondary">
              {String(look.products.length).padStart(2, "0")}{" "}
              {look.products.length === 1 ? "PIECE" : "PIECES"}
            </span>
          </header>

          {look.products.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center border-y border-border px-5 text-center">
              <p className="font-display text-xl tracking-tight text-text-primary">
                The collection is taking shape.
              </p>

              <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">
                Products for this look are coming soon. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-1.5 sm:gap-x-2 gap-y-4 sm:gap-y-6 lg:grid-cols-3 xl:grid-cols-4">
              {look.products.map(({ product }) => {
                const image = product.images[0];

                return (
                  <article key={product._id} className="min-w-0">
                    <Link
                      href={`/products/${encodeURIComponent(product.slug)}`}
                      aria-label={`View ${product.name}`}
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-4"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-4/5 overflow-hidden bg-surface">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt || product.name}
                            fill
                            sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 23vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
                              Image unavailable
                            </span>
                          </div>
                        )}

                        {/* Product Detail Indicator */}
                        <span
                          aria-hidden="true"
                          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center  text-text-primary transition-colors duration-300 group-hover:bg-text-primary group-hover:text-white sm:bottom-4 sm:right-4 sm:h-9 sm:w-9 border border-gray-300 rounded-full"
                        >
                          <MdOutlineArrowOutward />
                        </span>
                      </div>

                      {/* Product Information */}
                      <div className="flex items-start justify-between gap-2 pt-3 sm:pt-4">
                        <h3 className="text-xs sm:text-sm font-bold">
                          {product.name}
                        </h3>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          {/* Back Navigation */}
          <div className="mt-12 border-t border-border pt-6 sm:mt-16">
            <Link
              href="/looks"
              className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary transition-colors hover:text-text-primary sm:text-xs"
            >
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              >
                <MdKeyboardDoubleArrowLeft size={22}/>
              </span>
              Back to The Looks
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
