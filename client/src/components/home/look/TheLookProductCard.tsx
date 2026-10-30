import Image from "next/image";
import Link from "next/link";

import type { TheLookProduct } from "./the-look-types";

type TheLookProductCardProps = {
  product: Pick<TheLookProduct, "title" | "slug" | "image">;
};

export default function TheLookProductCard({
  product,
}: TheLookProductCardProps) {
  return (
    <article className="w-[calc((100vw-3rem)/2)] shrink-0 sm:w-[calc((100vw-5rem)/2)] lg:w-[calc((100%-0.75rem)/2)]">
      <Link
        href={`/products/${product.slug}`}
        draggable={false}
        className="group block cursor-pointer focus-visible:outline-none"
      >
        <div className="relative aspect-3/4 overflow-hidden bg-background">
          <Image
            src={product.image}
            alt={product.title}
            fill
            draggable={false}
            sizes="(max-width: 639px) 46vw, (max-width: 1023px) 40vw, 20vw"
            className="pointer-events-none object-cover transition-transform duration-700 ease-out motion-reduce:transition-none"
          />
        </div>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-primary sm:text-xs">
          {product.title}
        </p>
      </Link>
    </article>
  );
}