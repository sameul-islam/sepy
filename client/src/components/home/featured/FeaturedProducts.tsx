"use client";

import { useState, useEffect } from "react";

import Image from "next/image";

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
            if (!product.category || product.images.length === 0) {
              return [];
            }

            const gender = product.category.department;

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
      className="bg-background px-3 py-15 sm:px-5 md:py-17 lg:px-6 xl:px-10"
    >
      <div className="mx-auto max-w-full">
        <div className="mx-auto max-w-xl text-center">
          <h2
            id="featured-products-title"
            className="text-lg font-bold text-black sm:text-2xl"
          >
            Featured
          </h2>

          <div
            className="mt-7 flex items-center justify-center gap-6"
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
                  className={`relative cursor-pointer pb-1 text-xs font-extrabold uppercase tracking-[0.18em] transition-opacity duration-300 disabled:cursor-default ${
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
        </div>

        <div className="mt-12 lg:mt-16">
          {isLoading ? (
            <div
              className="flex gap-2 overflow-hidden"
              role="status"
              aria-label="Loading featured products"
              aria-busy="true"
            >
              <span className="sr-only">Loading products...</span>

              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="w-[calc((100vw-2rem)/2)] shrink-0 sm:w-[calc((100vw-2.5rem)/3)] lg:w-[calc((100vw-4.5rem)/4)] xl:w-[calc((100vw-6.5rem)/4)]"
                >
                  <div className="relative aspect-3/4 overflow-hidden bg-surface">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src="/images/brand/sepy-logo.svg"
                        alt=""
                        width={85}
                        height={85}
                        aria-hidden="true"
                        className="h-85 w-auto max-w-[85%] object-contain opacity-25 "
                      />
                    </div>
                  </div>

                  <div className="mx-auto mt-4 h-3 w-3/5 bg-surface-muted" />
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
