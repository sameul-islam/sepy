"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import type { Product } from "./featured-products-data";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

type Direction = "forward" | "backward";

type ProductRailProps = {
  products: Product[];
  previousProducts: Product[] | null;
  direction: Direction;
  isTransitioning: boolean;
  onTransitionEnd: () => void;
};

const PRODUCT_CARD_WIDTH =
  "w-[calc((100vw-2rem)/2)] sm:w-[calc((100vw-2.5rem)/3)] lg:w-[calc((100vw-4.5rem)/4)] xl:w-[calc((100vw-6.5rem)/4)]";

export default function ProductRail({
  products,
  previousProducts,
  direction,
  isTransitioning,
  onTransitionEnd,
}: ProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragState = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const updateScrollState = () => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const maxScroll = rail.scrollWidth - rail.clientWidth;

    if (maxScroll <= 0) {
      setProgress(0);
      return;
    }

    setProgress(rail.scrollLeft / maxScroll);
  };

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    updateScrollState();

    rail.addEventListener("scroll", updateScrollState, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [products, previousProducts]);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    dragState.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: rail.scrollLeft,
      moved: false,
    };

    setIsDragging(true);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!rail || !dragState.current.active) {
      return;
    }

    const distance = event.clientX - dragState.current.startX;

    if (Math.abs(distance) > 5) {
      dragState.current.moved = true;
    }

    rail.scrollLeft = dragState.current.startScrollLeft - distance;
  };

  const endDrag = () => {
    if (!dragState.current.active) {
      return;
    }

    dragState.current.active = false;
    setIsDragging(false);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.moved) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    dragState.current.moved = false;
  };

  const scrollByAmount = (direction: "left" | "right") => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    rail.scrollBy({
      left:
        direction === "right"
          ? rail.clientWidth * 0.82
          : -(rail.clientWidth * 0.82),
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div
        ref={railRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onClickCapture={handleClickCapture}
        className={`overflow-x-auto overscroll-x-contain pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {previousProducts && isTransitioning ? (
          <ProductTransitionRail
            currentProducts={products}
            previousProducts={previousProducts}
            direction={direction}
            onTransitionEnd={onTransitionEnd}
            cardWidthClass={PRODUCT_CARD_WIDTH}
          />
        ) : (
          <ProductStaticRail
            products={products}
            cardWidthClass={PRODUCT_CARD_WIDTH}
          />
        )}
      </div>

      <div className="mt-7 flex items-center justify-center md:justify-between">
        <div
          className="relative h-px w-16 overflow-hidden bg-border sm:w-20"
          role="progressbar"
          aria-label="Featured product scroll position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-foreground"
            style={{
              width: `${Math.max(progress * 100, 18)}%`,
            }}
          />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            aria-label="Previous products"
            onClick={() => scrollByAmount("left")}
            className="flex size-9 cursor-pointer items-center justify-center border border-border text-sm text-text-primary transition-colors duration-300 hover:bg-surface focus-visible:outline-none"
          >
            <span aria-hidden="true">
              <IoIosArrowBack />
            </span>
          </button>

          <button
            type="button"
            aria-label="Next products"
            onClick={() => scrollByAmount("right")}
            className="flex size-9 cursor-pointer items-center justify-center border border-border text-sm text-text-primary transition-colors duration-300 hover:bg-surface focus-visible:outline-none"
          >
            <span aria-hidden="true">
              <IoIosArrowForward />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

type ProductStaticRailProps = {
  products: Product[];
  cardWidthClass: string;
};

function ProductStaticRail({
  products,
  cardWidthClass,
}: ProductStaticRailProps) {
  return (
    <div className="flex w-max gap-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          className={cardWidthClass}
        />
      ))}
    </div>
  );
}

type ProductTransitionRailProps = {
  currentProducts: Product[];
  previousProducts: Product[];
  direction: Direction;
  onTransitionEnd: () => void;
  cardWidthClass: string;
};

function ProductTransitionRail({
  currentProducts,
  previousProducts,
  direction,
  onTransitionEnd,
  cardWidthClass,
}: ProductTransitionRailProps) {
  return (
    <div className="flex w-max gap-2">
      {currentProducts.map((currentProduct, index) => {
        const previousProduct = previousProducts[index] ?? null;

        return (
          <ProductCardViewport
            key={currentProduct.id}
            currentProduct={currentProduct}
            previousProduct={previousProduct}
            direction={direction}
            cardWidthClass={cardWidthClass}
            onTransitionEnd={index === 0 ? onTransitionEnd : undefined}
          />
        );
      })}
    </div>
  );
}

type ProductCardViewportProps = {
  currentProduct: Product;
  previousProduct: Product | null;
  direction: Direction;
  cardWidthClass: string;
  onTransitionEnd?: () => void;
};

function ProductCardViewport({
  currentProduct,
  previousProduct,
  direction,
  cardWidthClass,
  onTransitionEnd,
}: ProductCardViewportProps) {
  return (
    <div className={`${cardWidthClass} grid shrink-0 min-w-0 overflow-hidden`}>
      {previousProduct ? (
        <ProductCard
          key={`previous-${previousProduct.id}`}
          product={previousProduct}
          ariaHidden
          className={`col-start-1 row-start-1 ${
            direction === "forward"
              ? "sepy-card-exit-left"
              : "sepy-card-exit-right"
          }`}
        />
      ) : null}

      <ProductCard
        key={`current-${currentProduct.id}`}
        product={currentProduct}
        className={`col-start-1 row-start-1 ${
          direction === "forward"
            ? "sepy-card-enter-right"
            : "sepy-card-enter-left"
        }`}
        onAnimationEnd={onTransitionEnd}
      />
    </div>
  );
}

type ProductCardProps = {
  product: Product;
  className?: string;
  ariaHidden?: boolean;
  onAnimationEnd?: () => void;
};

function ProductCard({
  product,
  className = "",
  ariaHidden = false,
  onAnimationEnd,
}: ProductCardProps) {
  return (
    <article className={`min-w-0 ${className}`} onAnimationEnd={onAnimationEnd}>
      <Link
        href={`/products/${product.slug}`}
        aria-hidden={ariaHidden}
        tabIndex={ariaHidden ? -1 : undefined}
        draggable={false}
        className="group block focus-visible:outline-none"
      >
        <div className="relative aspect-3/4 overflow-hidden bg-surface">
          <Image
            src={product.image}
            alt={product.title}
            fill
            draggable={false}
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="pointer-events-none object-cover transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>

        <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.14em] text-text-primary sm:text-sm">
          {product.title}
        </p>
      </Link>
    </article>
  );
}
