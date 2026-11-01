import Link from "next/link";
import ProductGallery from "@/components/products/ProductGallery";
import type { Product } from "@/lib/api-types";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const productHref = `/products/${encodeURIComponent(product.slug)}`;

  const hasDiscount =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) /
          product.compareAtPrice!) *
          100,
      )
    : 0;

  return (
    <article className="min-w-0">
      <div className="relative">
        <ProductGallery
          images={product.images}
          productName={product.name}
          productHref={productHref}
        />

        {hasDiscount && (
          <span className="pointer-events-none absolute left-2 top-2 z-20 bg-[#171717] px-2 py-1 text-[10px] font-semibold tracking-wide text-white sm:text-xs">
            -{discountPercentage}%
          </span>
        )}
      </div>

      <div className="pt-1">
        <h2 className="line-clamp-2 text-xs font-bold text-[#171717] sm:text-sm">
          <Link
            href={productHref}
            className="transition-colors hover:text-[#5f5f5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
          >
            {product.name}
          </Link>
        </h2>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-xs font-semibold text-black sm:text-sm">
            ৳{product.price.toLocaleString("en-BD")}
          </p>

          {hasDiscount && (
            <p className="text-[11px] text-[#85857e] line-through sm:text-xs">
              ৳{product.compareAtPrice!.toLocaleString("en-BD")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
