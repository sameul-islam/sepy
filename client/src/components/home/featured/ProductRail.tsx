"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

import type { Product } from "./featured-products-data";

type Direction = "forward" | "backward";

type ProductRailProps = {
  products: Product[];
  previousProducts: Product[] | null;
  direction: Direction;
  isTransitioning: boolean;
  onTransitionEnd: () => void;
};

const PRODUCT_CARD_WIDTH =
  "w-[calc((100vw-2rem)/1.2)] sm:w-[calc((100vw-2.5rem)/3)] lg:w-[calc((100vw-4.5rem)/4)] xl:w-[calc((100vw-6.5rem)/4)]";

export default function ProductRail({
  products,
  previousProducts,
  direction,
  isTransitioning,
  onTransitionEnd,
}: ProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLSpanElement>(null);

  const [progress, setProgress] = useState(0);
  const [thumbSize, setThumbSize] = useState(100);
  const [canScroll, setCanScroll] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isIndicatorDragging, setIsIndicatorDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const indicatorDragOffset = useRef(0);

  const dragState = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const hasOverflow = maxScroll > 1;

    setCanScroll(hasOverflow);

    if (!hasOverflow) {
      setProgress(0);
      setThumbSize(100);
      return;
    }

    const visibleRatio = rail.clientWidth / rail.scrollWidth;

    setThumbSize(Math.max(visibleRatio * 100, 12));
    setProgress(Math.min(1, Math.max(0, rail.scrollLeft / maxScroll)));
  }, []);

  const handleRailScroll = useCallback(() => {
    updateScrollState();

    if (interactionTimeoutRef.current !== null) {
      clearTimeout(interactionTimeoutRef.current);
    }

    setIsInteracting(true);

    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      interactionTimeoutRef.current = null;
    }, 700);
  }, [updateScrollState]);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    updateScrollState();

    rail.addEventListener("scroll", handleRailScroll, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(rail);

    if (rail.firstElementChild) {
      resizeObserver.observe(rail.firstElementChild);
    }

    return () => {
      rail.removeEventListener("scroll", handleRailScroll);
      resizeObserver.disconnect();

      if (interactionTimeoutRef.current !== null) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [products, previousProducts, updateScrollState, handleRailScroll]);

  const handleIndicatorPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const track = scrollbarRef.current;
    const thumb = scrollbarThumbRef.current;

    if (!rail || !track || !thumb || !canScroll) {
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const maxThumbTravel = trackRect.width - thumbRect.width;

    if (maxThumbTravel <= 0) {
      return;
    }

    event.preventDefault();

    const isThumbTarget =
      event.clientX >= thumbRect.left && event.clientX <= thumbRect.right;

    indicatorDragOffset.current = isThumbTarget
      ? event.clientX - thumbRect.left
      : thumbRect.width / 2;

    track.setPointerCapture(event.pointerId);
    setIsIndicatorDragging(true);

    const pointerPosition =
      event.clientX - trackRect.left - indicatorDragOffset.current;

    const ratio = Math.max(0, Math.min(1, pointerPosition / maxThumbTravel));

    rail.scrollLeft = ratio * maxScroll;
  };

  const handleIndicatorPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const track = scrollbarRef.current;
    const thumb = scrollbarThumbRef.current;

    if (
      !rail ||
      !track ||
      !thumb ||
      !track.hasPointerCapture(event.pointerId)
    ) {
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const maxThumbTravel = trackRect.width - thumbRect.width;

    if (maxThumbTravel <= 0) {
      return;
    }

    const pointerPosition =
      event.clientX - trackRect.left - indicatorDragOffset.current;

    const ratio = Math.max(0, Math.min(1, pointerPosition / maxThumbTravel));

    rail.scrollLeft = ratio * maxScroll;
  };

  const handleIndicatorPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const track = scrollbarRef.current;

    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    setIsIndicatorDragging(false);
  };

  const handleIndicatorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const step = rail.clientWidth * 0.8;

    let nextPosition: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextPosition = rail.scrollLeft + step * 0.2;
        break;

      case "ArrowLeft":
        nextPosition = rail.scrollLeft - step * 0.2;
        break;

      case "PageDown":
        nextPosition = rail.scrollLeft + step;
        break;

      case "PageUp":
        nextPosition = rail.scrollLeft - step;
        break;

      case "Home":
        nextPosition = 0;
        break;

      case "End":
        nextPosition = maxScroll;
        break;

      default:
        return;
    }

    event.preventDefault();

    rail.scrollTo({
      left: Math.max(0, Math.min(maxScroll, nextPosition)),
      behavior: "smooth",
    });
  };

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

  return (
    <div
      className={`group/featured-rail relative ${
        isInteracting ? "is-interacting" : ""
      }`}
    >
      <div
        id="featured-products-rail"
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
      {canScroll ? (
        <div className="mt-2 flex justify-center">
          {/* Centered draggable indicator */}
          <div
            ref={scrollbarRef}
            role="scrollbar"
            aria-label="Featured products scroll position"
            aria-controls="featured-products-rail"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuetext={`${Math.round(progress * 100)}% scrolled`}
            tabIndex={0}
            onKeyDown={handleIndicatorKeyDown}
            onPointerDown={handleIndicatorPointerDown}
            onPointerMove={handleIndicatorPointerMove}
            onPointerUp={handleIndicatorPointerUp}
            onPointerCancel={handleIndicatorPointerUp}
            onLostPointerCapture={() => setIsIndicatorDragging(false)}
            className={`relative flex h-3 sm:h-4 w-full touch-pan-y items-center justify-self-center outline-none transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isIndicatorDragging ? "cursor-grabbing" : "cursor-grab"
            } opacity-0 [@media(hover:hover)]:group-hover/featured-rail:opacity-40 hover:opacity-100 focus-visible:opacity-100 ${
              isInteracting ? "opacity-100" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-100"
            />

            <span
              ref={scrollbarThumbRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-300 transition-[height] duration-200 hover:h-1.5"
              style={{
                width: `${thumbSize}%`,
                left: `${progress * (100 - thumbSize)}%`,
              }}
            />
          </div>
        </div>
      ) : null}
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

function formatPrice(price: number) {
  return `৳ ${new Intl.NumberFormat("en-BD").format(price)}`;
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
            alt={ariaHidden ? "" : product.imageAlt}
            fill
            draggable={false}
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="pointer-events-none object-cover transition-opacity duration-500 motion-reduce:transition-none [@media(hover:hover)]:group-hover:opacity-0"
          />

          {product.secondaryImage ? (
            <Image
              src={product.secondaryImage}
              alt=""
              fill
              draggable={false}
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              aria-hidden="true"
              className="pointer-events-none object-cover opacity-0 transition-opacity duration-500 motion-reduce:transition-none [@media(hover:hover)]:group-hover:opacity-100"
            />
          ) : null}
        </div>

        <div className="mt-3">
          <h3 className="text-xs font-bold text-text-primary sm:text-sm">
            {product.title}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="font-medium text-text-primary">
              {formatPrice(product.price)}
            </span>

            {product.compareAtPrice != null &&
            product.compareAtPrice > product.price ? (
              <span className="text-text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
