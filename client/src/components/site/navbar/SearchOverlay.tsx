"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PiArrowUpRight, PiMagnifyingGlass, PiX } from "react-icons/pi";

import ProductCard from "@/components/products/ProductCard";
import { getFeaturedProducts } from "@/lib/api";
import type { Product } from "@/lib/api-types";

type SearchOverlayProps = {
  onClose: () => void;
};

const RECENT_SEARCHES_KEY = "sepy-recent-searches";
const MAX_RECENT_SEARCHES = 5;

const POPULAR_SEARCHES = ["T-shirts", "Shorts", "Hoodies", "Training"];

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);


useEffect(() => {
  const frame = window.requestAnimationFrame(() => {
    const storedSearches = window.localStorage.getItem(
      RECENT_SEARCHES_KEY,
    );

    if (storedSearches) {
      try {
        const parsed: unknown = JSON.parse(storedSearches);

        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === "string")
        ) {
          setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
        }
      } catch {
        window.localStorage.removeItem(RECENT_SEARCHES_KEY);
      }
    }

    inputRef.current?.focus();
  });

  return () => window.cancelAnimationFrame(frame);
}, []);


  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab") {
        const focusableElements = document.querySelectorAll<HTMLElement>(
          "#sepy-search-overlay button:not([disabled]), #sepy-search-overlay input:not([disabled]), #sepy-search-overlay a[href]",
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    let isActive = true;

    getFeaturedProducts()
      .then((data) => {
        if (isActive) {
          setFeaturedProducts(data.products.slice(0, 4));
        }
      })
      .catch(() => {
        if (isActive) {
          setFeaturedProducts([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingProducts(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const saveRecentSearch = (value: string) => {
    const normalized = value.trim();

    if (!normalized) return;

    const updatedSearches = [
      normalized,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase(),
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updatedSearches);

    window.localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(updatedSearches),
    );
  };

  const navigateToSearch = (value: string) => {
    const normalized = value.trim();

    if (normalized.length < 2) return;

    saveRecentSearch(normalized);
    onClose();

    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  return (
    <div
      id="sepy-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search SEPY"
      className="fixed inset-x-0 bottom-0 top-12 z-40 overflow-y-auto bg-white sm:top-15 lg:top-18"
    >
      <div className="min-h-full bg-white">
        {/* Search input */}
        <div className="sticky top-0 z-20 border-b border-[#e5e5e0] bg-white px-4 py-3 sm:px-6 lg:px-10">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3"
            role="search"
          >
            <div className="relative min-w-0 flex-1">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, categories..."
                aria-label="Search products"
                autoComplete="off"
                className="h-11 w-full border-b border-[#deded8] bg-[#f7f7f5] px-5 pr-12 text-sm text-[#171717] outline-none transition-colors placeholder:text-[#85857e] focus:border-[#171717] focus:bg-white"
              />

              <button
                type="submit"
                aria-label="Submit search"
                disabled={query.trim().length < 2}
                className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-full text-[#171717] transition-opacity hover:opacity-60 disabled:opacity-40"
              >
                <PiMagnifyingGlass size={19} strokeWidth={1.6} />
              </button>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex size-10 shrink-0 items-center justify-center text-[#171717] transition-opacity hover:opacity-60"
            >
              <PiX size={25} strokeWidth={1.4} />
            </button>
          </form>
        </div>

        {/* Mobile search discovery */}
        <div className="px-5 pb-12 pt-6 sm:px-8 lg:hidden">
          {recentSearches.length > 0 && (
            <section className="border-b border-[#e5e5e0] pb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#171717]">
                  Recent Searches
                </h2>

                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-[#5f5f5a] underline underline-offset-4 transition-colors hover:text-[#171717]"
                >
                  Clear History
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => navigateToSearch(item)}
                    className="bg-[#f1f1ee] px-4 py-2 text-xs text-[#171717] transition-colors hover:bg-[#e5e5e0]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="border-b border-[#e5e5e0] py-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#171717]">
                Featured Products
              </h2>
            </div>

            {isLoadingProducts ? (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((item) => (
                  <div key={item} className="space-y-3">
                    <div className="aspect-4/5 animate-pulse bg-[#f1f1ee]" />
                    <div className="h-3 w-3/4 animate-pulse bg-[#f1f1ee]" />
                    <div className="h-3 w-1/3 animate-pulse bg-[#f1f1ee]" />
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="sepy-scrollbar-hidden -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
                {featuredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="w-[44%] shrink-0 snap-start sm:w-[31%]"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#85857e]">
                Featured products are unavailable right now.
              </p>
            )}
          </section>

          <section className="pt-6">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-[#171717]">
              Popular Searches
            </h2>

            <ul className="space-y-3">
              {POPULAR_SEARCHES.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => navigateToSearch(item)}
                    className="group flex min-h-8 w-full items-center justify-between text-left text-sm text-[#5f5f5a] transition-colors hover:text-[#171717]"
                  >
                    <span>{item}</span>
                    <PiArrowUpRight
                      size={16}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Desktop search discovery */}
        <div className="hidden min-h-[calc(100vh-7.5rem)] grid-cols-[minmax(0,1fr)_minmax(280px,25%)] lg:grid">
          <section className="min-w-0 px-8 py-8 xl:px-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xs font-bold uppercase tracking-wide text-[#171717]">
                Related Products
              </h2>

              <button
                type="button"
                onClick={() => navigateToSearch(query)}
                disabled={query.trim().length < 2}
                className="text-xs text-[#5f5f5a] underline underline-offset-4 transition-colors hover:text-[#171717] disabled:opacity-40"
              >
                View All
              </button>
            </div>

            {isLoadingProducts ? (
              <div className="grid grid-cols-4 gap-5">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="space-y-3">
                    <div className="aspect-4/5 animate-pulse bg-[#f1f1ee]" />
                    <div className="h-3 w-3/4 animate-pulse bg-[#f1f1ee]" />
                    <div className="h-3 w-1/3 animate-pulse bg-[#f1f1ee]" />
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 xl:grid-cols-4 xl:gap-x-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#85857e]">
                Featured products are unavailable right now.
              </p>
            )}
          </section>

          <aside className="border-l border-[#e5e5e0] bg-[#fafaf9] px-6 py-8 xl:px-8">
            {query.trim().length >= 2 && (
              <section className="border-b border-[#e5e5e0] pb-6">
                <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-wide text-[#171717]">
                  Search
                </h2>

                <button
                  type="button"
                  onClick={() => navigateToSearch(query)}
                  className="flex w-full items-center gap-3 py-2 text-left text-sm text-[#171717] hover:underline"
                >
                  <PiMagnifyingGlass size={16} />
                  <span>
                    Search for <strong>&quot;{query.trim()}&quot;</strong>
                  </span>
                </button>
              </section>
            )}

            <section className="border-b border-[#e5e5e0] py-6">
              <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-wide text-[#171717]">
                Popular Searches
              </h2>

              <ul className="space-y-3">
                {POPULAR_SEARCHES.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => navigateToSearch(item)}
                      className="text-left text-sm text-[#5f5f5a] transition-colors hover:text-[#171717]"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {recentSearches.length > 0 && (
              <section className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xs font-bold uppercase tracking-wide text-[#171717]">
                    Recent Searches
                  </h2>

                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-[11px] text-[#5f5f5a] underline underline-offset-4"
                  >
                    Clear
                  </button>
                </div>

                <ul className="space-y-3">
                  {recentSearches.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => navigateToSearch(item)}
                        className="text-left text-sm text-[#5f5f5a] transition-colors hover:text-[#171717]"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}