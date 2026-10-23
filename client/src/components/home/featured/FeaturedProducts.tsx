"use client";

import { useState, useEffect } from "react";

import { getProducts } from "@/lib/api";
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
        const [womenResult, menResult] = await Promise.all([
          getProducts({
            page: 1,
            limit: 8,
            department: "women",
          }),
          getProducts({
            page: 1,
            limit: 8,
            department: "men",
          }),
        ]);

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

        setAllProducts([
          ...mapProducts(womenResult.products),
          ...mapProducts(menResult.products),
        ]);
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
            <p
              className="py-8 text-center text-xs text-text-muted"
              role="status"
            >
              Loading products...
            </p>
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
