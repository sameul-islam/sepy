"use client";

import { useState, useEffect } from "react";

import { getFeaturedProducts } from "@/lib/api";
import type { Product as ApiProduct } from "@/lib/api-types";

import ProductRail from "./ProductRail";
import type { Product } from "./featured-products-data";

type Gender = "women" | "men";

type Direction = "forward" | "backward";

export default function FeaturedProducts() {
  const [activeGender, setActiveGender] = useState<Gender>("women");
  const [previousProducts, setPreviousProducts] = useState<Product[] | null>(
    null,
  );
  const [direction, setDirection] = useState<Direction>("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      setLoadError(false);

      try {
        const result = await getFeaturedProducts();

        if (cancelled) return;

        const mapProducts = (products: ApiProduct[]): Product[] =>
          products.flatMap((product): Product[] => {
            if (product.images.length === 0) {
              return [];
            }

            const gender = product.audience;

            if (gender !== "women" && gender !== "men") {
              return [];
            }

            return [
              {
                id: product._id,
                title: product.name,
                slug: product.slug,
                gender,
                image: product.images[0].url,
                imageAlt: product.images[0].alt || product.name,
                secondaryImage: product.images[1]?.url,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
              },
            ];
          });

        setAllProducts(mapProducts(result.products));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load featured products:", error);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isTransitioning) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const timeout = window.setTimeout(
      () => {
        setPreviousProducts(null);
        setIsTransitioning(false);
      },
      prefersReducedMotion ? 0 : 560,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isTransitioning]);

  const products = allProducts.filter(
    (product) => product.gender === activeGender,
  );

  const handleGenderChange = (nextGender: Gender) => {
    if (nextGender === activeGender || isTransitioning) {
      return;
    }

    const currentProducts = allProducts.filter(
      (product) => product.gender === activeGender,
    );

    const nextDirection: Direction =
      activeGender === "women" && nextGender === "men" ? "forward" : "backward";

    setPreviousProducts(currentProducts);
    setDirection(nextDirection);
    setActiveGender(nextGender);
    setIsTransitioning(true);
  };

  return (
    <section
      aria-labelledby="featured-products-title"
      className="bg-background px-3 py-7 sm:px-5 md:py-12 lg:px-6 xl:px-10"
    >
      <div className="mx-auto max-w-full">
        <header>
          {/* Section title */}
          <h2
            id="featured-products-title"
            className="font-bold text-black sm:text-xl uppercase"
          >
            Featured Products
          </h2>

          {/* Gender tabs and View All */}
          <div className="mt-3 flex items-center justify-between gap-4 sm:mt-4">
            <div
              className="flex items-center gap-6"
              aria-label="Featured products by gender"
            >
              {(["women", "men"] as const).map((gender) => {
                const isActive = gender === activeGender;

                return (
                  <button
                    key={gender}
                    type="button"
                    aria-pressed={isActive}
                    disabled={isTransitioning}
                    onClick={() => handleGenderChange(gender)}
                    className={`relative cursor-pointer pb-px text-xs font-extrabold uppercase tracking-[0.18em] transition-opacity duration-300 disabled:cursor-default ${
                      isActive
                        ? "text-text-primary"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {gender}

                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-0.5 h-px bg-current transition-transform duration-300 motion-reduce:transition-none ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <span className="inline-flex shrink-0 items-center gap-2 text-xs font-bold underline cursor-pointer text-text-primary sm:text-sm">
              View All
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-4"
              >
                <path
                  d="M4.5 12H19.5M13 5.5L19.5 12L13 18.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </header>

        <div className="mt-5 lg:mt-7">
          {isLoading ? (
            <div
              className="flex gap-2 overflow-hidden"
              role="status"
              aria-label="Loading featured products"
              aria-busy="true"
            >
              <span className="sr-only">Loading featured products...</span>

              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="w-[calc((100vw-2rem)/1.2)] shrink-0 sm:w-[calc((100vw-2.5rem)/3)] lg:w-[calc((100vw-4.5rem)/4)] xl:w-[calc((100vw-6.5rem)/4)]"
                >
                  <div className="sepy-skeleton aspect-3/4" />
                  <div className="sepy-skeleton mt-3 h-3 w-3/5" />
                  <div className="sepy-skeleton mt-2 h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <p
              className="py-8 text-center text-xs text-text-muted"
              role="alert"
            >
              Products could not be loaded. Please try again later.
            </p>
          ) : products.length === 0 ? (
            <p className="py-8 text-center text-xs text-text-muted">
              No products available.
            </p>
          ) : (
            <ProductRail
              products={products}
              previousProducts={previousProducts}
              direction={direction}
              isTransitioning={isTransitioning}
              onTransitionEnd={() => {
                setPreviousProducts(null);
                setIsTransitioning(false);
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
