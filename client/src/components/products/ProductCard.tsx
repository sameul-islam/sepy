
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api-types";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const image = product.images[0];

  return (
    <article className="min-w-0">
      <Link
        href={`/products/${encodeURIComponent(product.slug)}`}
        className="group block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-3/4 overflow-hidden bg-[#f7f7f5]">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              unoptimized
            />
          ) : (
            <div
              className="flex h-full items-center justify-center text-sm text-[#85857e]"
              role="img"
              aria-label="Product image unavailable"
            >
              Image unavailable
            </div>
          )}
        </div>

        <div className="pt-3">
          <h2 className="text-sm font-medium text-[#171717]">
            {product.name}
          </h2>

          <p className="mt-1 text-sm text-[#5f5f5a]">
            ৳{product.price.toLocaleString("en-BD")}
          </p>
        </div>
      </Link>
    </article>
  );
}