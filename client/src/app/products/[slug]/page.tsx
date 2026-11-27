import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";

import ProductDetailGallery from "@/components/products/ProductDetailGallery";
import ProductVariantSelector from "@/components/products/ProductVariantSelector";

import { ApiError, getProductBySlug } from "@/lib/api";
import { MdArrowRight } from "react-icons/md";

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
          ? [
              {
                url: product.images[0].url,
                alt: product.images[0].alt,
              },
            ]
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

  const audienceLabel = {
    women: "Women",
    men: "Men",
    unisex: "Unisex",
  }[product.audience];

  const highlights = product.highlights.filter(
    (highlight) => highlight.trim().length > 0,
  );

  const material = product.details?.material?.trim();
  const fit = product.details?.fit?.trim();

  const careInstructions = (product.details?.careInstructions ?? []).filter(
    (instruction) => instruction.trim().length > 0,
  );

  const activities = (product.details?.activity ?? []).filter(
    (activity) => activity.trim().length > 0,
  );

  const hasProductInformation =
    product.description.trim().length > 0 ||
    highlights.length > 0 ||
    Boolean(material) ||
    Boolean(fit) ||
    careInstructions.length > 0 ||
    activities.length > 0;

  return (
    <main
      className="
        mx-auto w-full
        px-3 pb-20 pt-14
        sm:px-6 sm:pt-18
        lg:px-8 lg:pt-22
      "
    >
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="
          mb-3 flex flex-wrap items-center gap-2
          text-xs font-bold text-text-muted
          lg:mb-5
        "
      >
        <Link href="/" className="transition-colors hover:text-text-primary">
          Home
        </Link>

        <span aria-hidden="true"><MdArrowRight size={18}/></span>

        <Link
          href="/products"
          className="transition-colors hover:text-text-primary"
        >
          Shop
        </Link>

        <span aria-hidden="true"><MdArrowRight size={18}/></span>

        <Link
          href={`/products?category=${encodeURIComponent(product.category.slug)}`}
          className="transition-colors hover:text-text-primary"
        >
          {product.category.name}
        </Link>

        <span aria-hidden="true"><MdArrowRight size={18}/></span>

        <span className="text-text-primary" aria-current="page">
          {product.name}
        </span>
      </nav>

      {/* Product Gallery + Purchase Information */}
      <div
        className="
          grid grid-cols-1
          items-start
          gap-5 sm:gap-8
          md:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]
          lg:gap-10
          xl:gap-14
        "
      >
        {/* Left: Product Gallery */}
        <ProductDetailGallery
          images={product.images}
          productName={product.name}
        />

        {/* Right: Product Identity + Variant Selection */}
        <section
          aria-label="Product purchase information"
          className="
            min-w-0
            md:sticky md:top-20
            md:self-start
          "
        >
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
            <span>{product.category.name}</span>
            <span aria-hidden="true">·</span>
            <span>{audienceLabel}</span>
          </div>

          <h1 className="max-w-xl text-xl font-semibold leading-[1.12] tracking-tight text-black sm:text-2xl">
            {product.name}
          </h1>

          <ProductVariantSelector variants={product.variants} />
        </section>
      </div>
    </main>
  );
}
