"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PiArrowUpRight, PiMagnifyingGlass, PiX } from "react-icons/pi";

import ProductCard from "@/components/products/ProductCard";
import { getFeaturedProducts, getProducts } from "@/lib/api";
import type { Product } from "@/lib/api-types";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { RiCloseLargeLine } from "react-icons/ri";

type SearchOverlayProps = {
  onClose: () => void;
};

type LiveSearchState = {
  query: string;
  status: "idle" | "loading" | "success" | "error";
  products: Product[];
};

const RECENT_SEARCHES_KEY = "sepy-recent-searches";
const MAX_RECENT_SEARCHES = 5;
const SEARCH_MIN_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const PRODUCT_LIMIT = 4;

const POPULAR_SEARCHES = ["T-shirts", "Shorts", "Hoodies", "Training"];

const INITIAL_SEARCH_STATE: LiveSearchState = {
  query: "",
  status: "idle",
  products: [],
};

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  const [liveSearch, setLiveSearch] =
    useState<LiveSearchState>(INITIAL_SEARCH_STATE);

  const [searchAttempt, setSearchAttempt] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim();
  const isLiveSearch = normalizedQuery.length >= SEARCH_MIN_LENGTH;

  const displayedProducts = isLiveSearch
    ? liveSearch.products
    : featuredProducts;

  const isProductsLoading = isLiveSearch
    ? liveSearch.query !== normalizedQuery || liveSearch.status === "loading"
    : isLoadingFeatured;

  const hasSearchError =
    isLiveSearch &&
    liveSearch.query === normalizedQuery &&
    liveSearch.status === "error";

  const hasSearchResults =
    isLiveSearch &&
    liveSearch.query === normalizedQuery &&
    liveSearch.status === "success";

  const hasNoSearchResults = hasSearchResults && displayedProducts.length === 0;

  // Load recent searches and focus the search input.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY);

        if (storedSearches) {
          const parsed: unknown = JSON.parse(storedSearches);

          if (
            Array.isArray(parsed) &&
            parsed.every(
              (item) => typeof item === "string" && item.trim().length > 0,
            )
          ) {
            setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
          }
        }
      } catch {
        window.localStorage.removeItem(RECENT_SEARCHES_KEY);
      }

      inputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // Lock background scrolling and manage keyboard accessibility.
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
        [
          "#sepy-search-overlay button:not([disabled])",
          "#sepy-search-overlay input:not([disabled])",
          "#sepy-search-overlay a[href]",
        ].join(","),
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
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Load featured products for the empty search state.
  useEffect(() => {
    let isActive = true;

    getFeaturedProducts()
      .then((data) => {
        if (!isActive) return;

        setFeaturedProducts(data.products.slice(0, PRODUCT_LIMIT));
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

  // Search products as the user types.
  useEffect(() => {
    const searchQuery = query.trim();

    if (searchQuery.length < SEARCH_MIN_LENGTH) {
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      getProducts({
        page: 1,
        limit: PRODUCT_LIMIT,
        search: searchQuery,
        signal: controller.signal,
      })
        .then((data) => {
          if (controller.signal.aborted) return;

          setLiveSearch({
            query: searchQuery,
            status: "success",
            products: data.products,
          });
        })
        .catch(() => {
          if (controller.signal.aborted) return;

          setLiveSearch({
            query: searchQuery,
            status: "error",
            products: [],
          });
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, searchAttempt]);

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

    try {
      window.localStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(updatedSearches),
      );
    } catch {
      // Search navigation should still work if storage is unavailable.
    }
  };

  const navigateToSearch = (value: string) => {
    const normalized = value.trim();

    if (normalized.length < SEARCH_MIN_LENGTH) return;

    saveRecentSearch(normalized);
    onClose();

    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(query);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);

    const normalized = value.trim();

    if (normalized.length >= SEARCH_MIN_LENGTH) {
      setLiveSearch({
        query: normalized,
        status: "loading",
        products: [],
      });
    } else {
      setLiveSearch(INITIAL_SEARCH_STATE);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);

    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Clearing the visible list does not depend on storage.
    }
  };

  const retrySearch = () => {
    setLiveSearch({
      query: normalizedQuery,
      status: "loading",
      products: [],
    });

    setSearchAttempt((current) => current + 1);
  };

  const renderProductSkeletons = (count: number) => (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3" aria-hidden="true">
          <div className="aspect-4/5 animate-pulse bg-[#f1f1ee]" />
          <div className="h-3 w-3/4 animate-pulse bg-[#f1f1ee]" />
          <div className="h-3 w-1/3 animate-pulse bg-[#f1f1ee]" />
        </div>
      ))}
    </>
  );

  const renderSearchError = () => (
    <div className="py-8 text-center" role="alert">
      <p className="text-sm text-[#5f5f5a]">
        Something went wrong while searching. Please try again.
      </p>

      <button
        type="button"
        onClick={retrySearch}
        className="mt-3 text-xs text-[#171717] underline underline-offset-4 transition-opacity hover:opacity-60"
      >
        Try Again
      </button>
    </div>
  );

  const renderNoResults = () => (
    <div className="py-8 text-center" role="status">
      <h3 className="text-base font-medium text-[#171717]">
        No products found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#85857e]">
        We couldn&apos;t find any products for &ldquo;
        {normalizedQuery}&rdquo;. Check the spelling or try a more general
        keyword.
      </p>

      <p className="mt-5 text-sm text-[#5f5f5a]">
        Need help finding the right gear?
      </p>

      <a
        href="/contact"
        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#171717] underline underline-offset-4 transition-opacity hover:opacity-60"
      >
        Contact Us
        <PiArrowUpRight size={15} />
      </a>
    </div>
  );

  const renderMobileProducts = () => {
    if (isProductsLoading) {
      return (
        <div className="grid grid-cols-2 gap-1.5" aria-label="Loading products">
          {renderProductSkeletons(2)}
        </div>
      );
    }

    if (hasSearchError) {
      return renderSearchError();
    }

    if (hasNoSearchResults) {
      return renderNoResults();
    }

    if (displayedProducts.length > 0) {
      return (
        <div
          className="sepy-scrollbar-hidden flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-2 pb-2 sm:-mx-8 sm:px-8"
          aria-live="polite"
          aria-busy={isProductsLoading}
        >
          {displayedProducts.map((product) => (
            <div
              key={product._id}
              className="w-[44%] shrink-0 snap-start sm:w-[31%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className="text-sm text-[#85857e]">
        Featured products are unavailable right now.
      </p>
    );
  };

  const renderDesktopProducts = () => {
    if (isProductsLoading) {
      return (
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-8 xl:grid-cols-4 xl:gap-x-6"
          aria-label="Loading products"
        >
          {renderProductSkeletons(4)}
        </div>
      );
    }

    if (hasSearchError) {
      return renderSearchError();
    }

    if (hasNoSearchResults) {
      return renderNoResults();
    }

    if (displayedProducts.length > 0) {
      return (
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-8 xl:grid-cols-4 xl:gap-x-6"
          aria-live="polite"
          aria-busy={isProductsLoading}
        >
          {displayedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      );
    }

    return (
      <p className="text-sm text-[#85857e]">
        Featured products are unavailable right now.
      </p>
    );
  };

  return (
    <div
      id="sepy-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search SEPY"
      className="fixed inset-x-0 bottom-0 top-12 z-40 overflow-y-auto bg-white sm:top-15 lg:bottom-auto lg:top-18 lg:h-fit lg:max-h-[calc(100dvh-4.5rem)]"
    >
      <div className="bg-white">
        {/* Search input */}
        <div className="sticky top-0 z-20 border-b border-[#e5e5e0] bg-white px-2 py-3 sm:px-6 lg:px-10">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-1.5"
            role="search"
          >
            <button
              type="submit"
              aria-label="Submit search"
              disabled={normalizedQuery.length < SEARCH_MIN_LENGTH}
              className="hidden sm:flex size-9 items-center justify-center  text-[#171717] transition-opacity hover:opacity-60 disabled:opacity-40 cursor-pointer"
            >
              <FaMagnifyingGlass size={18} />
            </button>
            <div className="relative min-w-0 flex-1">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder="What are you looking for?"
                aria-label="Search products"
                aria-controls="sepy-search-products"
                autoComplete="off"
                className="h-11 md:h-14 w-full appearance-none border-0 bg-transparent pr-12 text-sm font-bold outline-none ring-0 transition-[border-color] duration-200 placeholder:text-[#85857e] focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                aria-label="Submit search"
                disabled={normalizedQuery.length < SEARCH_MIN_LENGTH}
                className="sm:hidden absolute right-1 top-1 flex size-9 items-center justify-center  text-[#171717] transition-opacity hover:opacity-60 disabled:opacity-40"
              >
                <FaMagnifyingGlass size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex size-9 shrink-0 items-center justify-center text-[#171717] transition-opacity hover:opacity-60 cursor-pointer"
            >
              <RiCloseLargeLine size={22} />
            </button>
          </form>
        </div>

        {/* Mobile search discovery */}
        <div className="px-5 pb-12 pt-6 sm:px-8 lg:hidden">
          {/* {!isLiveSearch && recentSearches.length > 0 && (
            <section className="border-b border-[#e5e5e0] pb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#171717]">
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
          )} */}

          <section
            id="sepy-search-products"
            className="border-b border-[#e5e5e0] py-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase text-[#171717]">
                {isLiveSearch ? "Search Results" : "Featured Products"}
              </h2>
            </div>

            {renderMobileProducts()}
          </section>

          {!isLiveSearch && (
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
          )}
        </div>

        {/* Desktop search discovery */}
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(260px,25%)] lg:grid">
          <section
            id="sepy-search-products"
            className="min-w-0 px-8 py-8 xl:px-10"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xs font-bold uppercase tracking-wide text-[#171717]">
                {isLiveSearch ? "Search Results" : "Featured Products"}
              </h2>

              {isLiveSearch && (
                <button
                  type="button"
                  onClick={() => navigateToSearch(query)}
                  disabled={normalizedQuery.length < SEARCH_MIN_LENGTH}
                  className="text-xs text-[#5f5f5a] underline underline-offset-4 transition-colors hover:text-[#171717] disabled:opacity-40"
                >
                  View All
                </button>
              )}
            </div>

            {renderDesktopProducts()}
          </section>

          <aside className="border-l border-[#e5e5e0] bg-[#fafaf9] px-6 py-8 xl:px-8">
            {isLiveSearch && (
              <section className="border-b border-[#e5e5e0] pb-6">
                <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-wide text-[#171717]">
                  Search
                </h2>

                <button
                  type="button"
                  onClick={() => navigateToSearch(query)}
                  className="flex w-full items-center gap-3 py-2 text-left text-sm text-[#171717] transition-opacity hover:opacity-60"
                >
                  <PiMagnifyingGlass size={16} />

                  <span className="min-w-0">
                    Search for{" "}
                    <strong className="break-all">
                      &ldquo;{normalizedQuery}&rdquo;
                    </strong>
                  </span>
                </button>
              </section>
            )}

            {!isLiveSearch && (
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
            )}

            {recentSearches.length > 0 && (
              <section className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xs font-bold uppercase tracking-wide text-[#171717]">
                    Recent Searches
                  </h2>

                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-[11px] text-[#5f5f5a] underline underline-offset-4 transition-colors hover:text-[#171717]"
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
