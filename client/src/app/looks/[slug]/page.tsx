
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApiError, getLookBySlug } from "@/lib/api";

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
    <main className="min-h-screen pb-20">
      <section className="mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12 lg:px-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 text-xs text-text-secondary sm:mb-10"
        >
          <Link
            href="/looks"
            className="transition-colors hover:text-text-primary"
          >
            The Looks
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-text-primary">{look.title}</span>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
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

          <div className="flex flex-col justify-center py-2 sm:py-6 lg:sticky lg:top-24 lg:py-12">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-text-muted sm:text-xs">
              {look.eyebrow}
            </p>

            <h1 className="mt-4 max-w-xl font-display text-4xl leading-[1.05] tracking-[-0.045em] text-text-primary sm:text-5xl lg:text-6xl">
              {look.title}
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-text-secondary sm:text-base">
              A considered combination of performance and everyday style.
              Explore the pieces that bring this look together.
            </p>

            <a
              href="#shop-the-look"
              className="mt-8 inline-flex w-fit items-center gap-3 border-b border-text-primary pb-2 text-xs font-medium uppercase tracking-[0.14em] text-text-primary transition-opacity hover:opacity-60"
            >
              Shop the Look
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      <section
        id="shop-the-look"
        className="scroll-mt-8 border-t border-border"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
          <header className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted sm:text-xs">
                COMPLETE THE OUTFIT
              </p>
              <h2 className="mt-3 font-display text-2xl tracking-[-0.035em] text-text-primary sm:text-3xl">
                Shop the Look
              </h2>
            </div>

            <span className="pb-1 text-xs text-text-secondary">
              {look.products.length}{" "}
              {look.products.length === 1 ? "piece" : "pieces"}
            </span>
          </header>

          {look.products.length === 0 ? (
            <p className="py-10 text-sm text-text-secondary">
              Products for this look are coming soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
              {look.products.map(({ product }) => {
                const image = product.images[0];

                return (
                  <article key={product._id} className="min-w-0">
                    <Link
                      href={`/products/${encodeURIComponent(product.slug)}`}
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-4"
                    >
                      <div className="relative aspect-4/5 overflow-hidden bg-surface">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt || product.name}
                            fill
                            sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 23vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                          />
                        ) : (
                          <div
                            className="absolute inset-0"
                            aria-label="Product image unavailable"
                          />
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-2 pt-3 sm:pt-4">
                        <h3 className="text-sm leading-5 text-text-primary sm:text-base">
                          {product.name}
                        </h3>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-base text-text-secondary transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                        >
                          →
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-12 border-t border-border pt-6 sm:mt-16">
            <Link
              href="/looks"
              className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-text-primary"
            >
              <span aria-hidden="true">←</span>
              Back to The Looks
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
