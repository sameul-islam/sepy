
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PiArrowUpRight,
  PiMagnifyingGlass,
  PiX,
} from "react-icons/pi";

import ProductCard from "@/components/products/ProductCard";
import { getFeaturedProducts, getProducts } from "@/lib/api";
import type { Product } from "@/lib/api-types";

type SearchOverlayProps = {
  onClose: () => void;
};

type SearchStatus = "idle" | "loading" | "success" | "error";

const RECENT_SEARCHES_KEY = "sepy-recent-searches";
const MAX_RECENT_SEARCHES = 5;
const SEARCH_DEBOUNCE_MS = 280;
const SEARCH_RESULT_LIMIT = 4;

const POPULAR_SEARCHES = ["T-shirts", "Shorts", "Hoodies", "Training"];

const HEADER_HEIGHT = 72;

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [resultQuery, setResultQuery] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [desktopHeight, setDesktopHeight] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = query.trim();
  const isSearchQuery = normalizedQuery.length >= 2;
  const hasShortQuery = normalizedQuery.length === 1;

  const isCurrentResult = resultQuery === normalizedQuery;
  const currentSearchStatus = isCurrentResult
    ? searchStatus
    : "loading";

  const isSearching =
    isSearchQuery && currentSearchStatus === "loading";

  const saveRecentSearch = (value: string) => {
    const normalized = value.trim();

    if (normalized.length < 2) return;

    const updatedSearches = [
      normalized,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase(),
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updatedSearches);

    try {
      window.localStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(updatedSearches),
      );
    } catch {
      // Search history remains usable for the current session.
    }
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

    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Clearing the in-memory history is sufficient.
    }
  };

  // Restore recent searches and focus the input after mounting.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedSearches = window.localStorage.getItem(
          RECENT_SEARCHES_KEY,
        );

        if (storedSearches) {
          const parsed: unknown = JSON.parse(storedSearches);

          if (
            Array.isArray(parsed) &&
            parsed.every((item) => typeof item === "string")
          ) {
            setRecentSearches(
              parsed
                .map((item) => item.trim())
                .filter(Boolean)
                .slice(0, MAX_RECENT_SEARCHES),
            );
          }
        }
      } catch {
        window.localStorage.removeItem(RECENT_SEARCHES_KEY);
      }

      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Lock background scrolling and manage keyboard interaction.
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = document.querySelectorAll<HTMLElement>(
        "#sepy-search-overlay button:not([disabled]), #sepy-search-overlay input:not([disabled]), #sepy-search-overlay a[href]",
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Load default featured products.
  useEffect(() => {
    let isActive = true;

    getFeaturedProducts()
      .then((data) => {
        if (isActive) {
          setFeaturedProducts(data.products.slice(0, SEARCH_RESULT_LIMIT));
        }
      })
      .catch(() => {
        if (isActive) {
          setFeaturedProducts([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingFeatured(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Live product search with debounce and request cancellation.
  useEffect(() => {
    if (normalizedQuery.length < 2) return;

    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
      setResultQuery(normalizedQuery);
      setSearchStatus("loading");
      setSearchProducts([]);

      getProducts({
        page: 1,
        limit: SEARCH_RESULT_LIMIT,
        search: normalizedQuery,
        signal: controller.signal,
      })
        .then((data) => {
          if (controller.signal.aborted) return;

          setSearchProducts(data.products);
          setSearchStatus("success");
        })
        .catch(() => {
          if (controller.signal.aborted) return;

          setSearchProducts([]);
          setSearchStatus("error");
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [normalizedQuery, retryCount]);

  // Measure the content and animate desktop overlay height.
  useEffect(() => {
    const content = contentRef.current;

    if (!content) return;

    let frame = 0;

    const updateHeight = () => {
      window.cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        const availableHeight = Math.max(
          0,
          window.innerHeight - HEADER_HEIGHT,
        );

        const contentHeight = content.scrollHeight;

        setDesktopHeight(
          Math.min(contentHeight, availableHeight),
        );
      });
    };

    const observer = new ResizeObserver(updateHeight);

    observer.observe(content);
    window.addEventListener("resize", updateHeight);

    updateHeight();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const renderFeaturedSkeleton = (count: number) => (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3">
          <div className="aspect-4/5 animate-pulse bg-[#f1f1ee]" />
          <div className="h-3 w-3/4 animate-pulse bg-[#f1f1ee]" />
          <div className="h-3 w-1/3 animate-pulse bg-[#f1f1ee]" />
        </div>
      ))}
    </div>
  );

  const renderSearchMessage = () => {
    if (isSearching) {
      return (
        <div
          className="grid grid-cols-2 gap-4 xl:grid-cols-4"
          aria-label="Loading search results"
          aria-live="polite"
        >
          {renderFeaturedSkeleton(SEARCH_RESULT_LIMIT)}
        </div>
      );
    }

    if (currentSearchStatus === "error") {
      return (
        <div className="py-10 text-center">
          <p className="text-sm text-[#5f5f5a]">
            We couldn't load the search results right now.
          </p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-4 text-xs font-medium text-[#171717] underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      );
    }

    if (
      currentSearchStatus === "success" &&
      searchProducts.length === 0
    ) {
      return (
        <div className="py-10">
          <div className="mx-auto max-w-md text-center">
            <h3 className="font-display text-base font-semibold text-[#171717]">
              No products found
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#5f5f5a]">
              We couldn't find any products for{" "}
              <strong className="font-medium text-[#171717]">
                &quot;{normalizedQuery}&quot;
              </strong>
              . Check your spelling or try a more general search.
            </p>

            <p className="mt-5 text-sm leading-6 text-[#5f5f5a]">
              Need help finding something?{" "}
              <Link
                href="/contact"
                onClick={onClose}
                className="font-medium text-[#171717] underline underline-offset-4"
              >
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      id="sepy-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search SEPY"
      style={
        {
          "--desktop-overlay-height":
            desktopHeight !== null
              ? `${desktopHeight}px`
              : "auto",
        } as React.CSSProperties
      }
      className="fixed inset-x-0 bottom-0 top-12 z-40 overflow-y-auto bg-white sm:top-15 lg:bottom-auto lg:top-18 lg:h-(--desktop-overlay-height) lg:max-h-[calc(100dvh-4.5rem)] lg:overflow-y-auto lg:transition-[height] lg:duration-300 lg:ease-out motion-reduce:lg:transition-none"
    >
      <div ref={contentRef} className="bg-white">
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
                aria-controls="sepy-search-results"
                aria-describedby={
                  hasShortQuery ? "sepy-search-hint" : undefined
                }
                autoComplete="off"
                className="h-11 w-full border-0 border-b border-[#deded8] bg-transparent px-1 pr-12 text-sm text-[#171717] outline-none transition-colors placeholder:text-[#85857e] focus:border-[#171717] focus:ring-0"
              />

              <button
                type="submit"
                aria-label="Submit search"
                disabled={!isSearchQuery}
                className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-full text-[#171717] transition-opacity hover:opacity-60 disabled:opacity-30"
              >
                <PiMagnifyingGlass size={19} strokeWidth={1.6} />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex size-10 shrink-0 items-center justify-center text-[#171717] transition-opacity hover:opacity-60"
            >
              <PiX size={25} strokeWidth={1.4} />
            </button>
          </form>
        </div>

        {/* Mobile discovery and live results */}
        <div className="px-5 pb-12 pt-6 sm:px-8 lg:hidden">
          {isSearchQuery ? (
            <section id="sepy-search-results" aria-live="polite">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#171717]">
                  Search Results
                </h2>

                <button
                  type="button"
                  onClick={() => navigateToSearch(query)}
                  className="text-xs text-[#5f5f5a] underline underline-offset-4"
                >
                  View All
                </button>
              </div>

              {isSearching ? (
                renderFeaturedSkeleton(2)
              ) : currentSearchStatus === "error" ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#5f5f5a]">
                    We couldn't load the search results right now.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    className="mt-4 text-xs font-medium text-[#171717] underline underline-offset-4"
                  >
                    Try again
                  </button>
                </div>
              ) : currentSearchStatus === "success" &&
                searchProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-8">
                  {searchProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : currentSearchStatus === "success" ? (
                <div className="py-10 text-center">
                  <h3 className="font-display text-base font-semibold text-[#171717]">
                    No products found
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#5f5f5a]">
                    We couldn't find any products for{" "}
                    <strong className="font-medium text-[#171717]">
                      &quot;{normalizedQuery}&quot;
                    </strong>
                    . Check your spelling or try a more general search.
                  </p>
                  <p className="mt-5 text-sm text-[#5f5f5a]">
                    Need help?{" "}
                    <Link
                      href="/contact"
                      onClick={onClose}
                      className="font-medium text-[#171717] underline underline-offset-4"
                    >
                      Contact us
                    </Link>
                    .
                  </p>
                </div>
              ) : null}
            </section>
          ) : (
            <>
              {hasShortQuery && (
                <p
                  id="sepy-search-hint"
                  className="mb-5 text-xs text-[#85857e]"
                >
                  Type at least 2 characters to search products.
                </p>
              )}

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
                <h2 className="mb-5 font-display text-sm font-bold uppercase tracking-wide text-[#171717]">
                  Featured Products
                </h2>

                {isLoadingFeatured ? (
                  renderFeaturedSkeleton(2)
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
            </>
          )}
        </div>

        {/* Desktop discovery and live results */}
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(280px,25%)] lg:grid">
          <section
            id="sepy-search-results"
            aria-live="polite"
            className="min-w-0 px-8 py-8 xl:px-10"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xs font-bold uppercase tracking-wide text-[#171717]">
                {isSearchQuery ? "Search Results" : "Featured Products"}
              </h2>

              <button
                type="button"
                onClick={() => navigateToSearch(query)}
                disabled={!isSearchQuery}
                className="text-xs text-[#5f5f5a] underline underline-offset-4 transition-colors hover:text-[#171717] disabled:opacity-0"
              >
                View All
              </button>
            </div>

            {isSearchQuery ? (
              isSearching ? (
                renderFeaturedSkeleton(SEARCH_RESULT_LIMIT)
              ) : currentSearchStatus === "success" &&
                searchProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 xl:grid-cols-4 xl:gap-x-6">
                  {searchProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                renderSearchMessage()
              )
            ) : (
              <>
                {hasShortQuery && (
                  <p className="mb-5 text-xs text-[#85857e]">
                    Type at least 2 characters to search products.
                  </p>
                )}

                {isLoadingFeatured ? (
                  renderFeaturedSkeleton(SEARCH_RESULT_LIMIT)
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
              </>
            )}
          </section>

          <aside className="border-l border-[#e5e5e0] bg-[#fafaf9] px-6 py-8 xl:px-8">
            {isSearchQuery ? (
              <section>
                <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-wide text-[#171717]">
                  Search
                </h2>

                <button
                  type="button"
                  onClick={() => navigateToSearch(query)}
                  className="flex w-full items-center gap-3 py-2 text-left text-sm text-[#171717] hover:underline"
                >
                  <PiMagnifyingGlass size={16} />
                  <span className="min-w-0 wrap-break-word">
                    Search for{" "}
                    <strong>&quot;{normalizedQuery}&quot;</strong>
                  </span>
                </button>

                {currentSearchStatus === "success" &&
                  searchProducts.length === 0 && (
                    <p className="mt-5 text-sm leading-6 text-[#5f5f5a]">
                      Can't find what you're looking for?{" "}
                      <Link
                        href="/contact"
                        onClick={onClose}
                        className="font-medium text-[#171717] underline underline-offset-4"
                      >
                        Contact us
                      </Link>
                      .
                    </p>
                  )}
              </section>
            ) : (
              <>
                <section className="border-b border-[#e5e5e0] pb-6">
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
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
