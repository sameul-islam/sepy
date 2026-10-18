import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/products/ProductGallery";
import { ApiError, getProductBySlug } from "@/lib/api";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const getCachedProductBySlug = cache(async (slug: string) =>
  getProductBySlug(slug),
);

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getCachedProductBySlug(slug);

    return {
      title: `${product.name} | SEPY`,
      description: product.description.slice(0, 160),
      alternates: {
        canonical: `/products/${product.slug}`,
      },
      openGraph: {
        title: `${product.name} | SEPY`,
        description: product.description.slice(0, 160),
        images: product.images[0]
          ? [{ url: product.images[0].url, alt: product.images[0].alt }]
          : [],
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        title: "Product Not Found | SEPY",
        description: "The requested product could not be found.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    return {
      title: "SEPY Products",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;

  try {
    product = await getCachedProductBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const hasDiscount =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  return (
    <main className="mx-auto w-full max-w-360 px-5 pb-20 pt-6 sm:px-8 sm:pt-10 lg:px-12">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#85857e]"
      >
        <Link href="/" className="hover:text-[#171717]">
          Home
        </Link>

        <span aria-hidden="true">/</span>

        <Link href="/products" className="hover:text-[#171717]">
          Shop
        </Link>

        <span aria-hidden="true">/</span>

        <Link
          href={`/products?category=${encodeURIComponent(product.category.slug)}`}
          className="hover:text-[#171717]"
        >
          {product.category.name}
        </Link>

        <span aria-hidden="true">/</span>

        <span className="text-[#171717]" aria-current="page">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <section className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-xs uppercase tracking-[0.16em] text-[#85857e]">
            SEPY / {product.category.name}
          </p>

          <h1 className="mt-3 text-3xl font-medium leading-tight text-[#171717] sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-base text-[#171717]">
              ৳{product.price.toLocaleString("en-BD")}
            </p>

            {hasDiscount && (
              <>
                <p className="text-sm text-[#85857e] line-through">
                  ৳{product.compareAtPrice!.toLocaleString("en-BD")}
                </p>

                <span className="text-xs text-[#5f5f5a]">
                  {Math.round(
                    (1 - product.price / product.compareAtPrice!) * 100,
                  )}
                  % off
                </span>
              </>
            )}
          </div>

          <div className="mt-7 border-t border-[#e5e5e0] pt-6">
            <h2 className="text-sm font-medium text-[#171717]">
              Product details
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#5f5f5a]">
              {product.description}
            </p>
          </div>

          <div className="mt-7 border-t border-[#e5e5e0] pt-5">
            <p className="text-xs text-[#85857e]">
              Product code: {product.sku}
            </p>

            <Link
              href={`/products?category=${encodeURIComponent(product.category.slug)}`}
              className="mt-4 inline-block text-sm text-[#171717] underline underline-offset-4"
            >
              Explore {product.category.name}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
