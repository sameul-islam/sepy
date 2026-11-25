"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiArrowUpRight, PiMagnifyingGlass, PiX } from "react-icons/pi";

import { getProductSearchSuggestions } from "@/lib/api";
import type { ProductSearchSuggestion } from "@/lib/api-types";

type SearchOverlayProps = {
  onClose: () => void;
};

type SearchState = {
  query: string;
  status: "idle" | "loading" | "success" | "error";
  products: ProductSearchSuggestion[];
};

const RECENT_SEARCHES_KEY = "sepy-recent-searches";
const MAX_RECENT_SEARCHES = 5;
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const MAX_RESULTS = 4;

const POPULAR_SEARCHES = ["T-shirts", "Shorts", "Hoodies", "Training"];
const SEARCH_SUGGESTIONS = [
  "Tops",
  "Women Tops",
  "Tank Tops",
  "Training Tops",
  "T-shirts",
  "Shorts",
  "Hoodies",
  "Training",
];

const INITIAL_SEARCH_STATE: SearchState = {
  query: "",
  status: "idle",
  products: [],
};

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchState, setSearchState] =
    useState<SearchState>(INITIAL_SEARCH_STATE);
  const [searchAttempt, setSearchAttempt] = useState(0);

  const normalizedQuery = query.trim();
  const isSearchActive = normalizedQuery.length >= MIN_SEARCH_LENGTH;

  const isLoading =
    isSearchActive &&
    (searchState.query !== normalizedQuery || searchState.status === "loading");

  const hasResults =
    isSearchActive &&
    searchState.query === normalizedQuery &&
    searchState.status === "success";

  const hasError =
    isSearchActive &&
    searchState.query === normalizedQuery &&
    searchState.status === "error";

  const products = hasResults ? searchState.products : [];

  const searchSuggestions =
    normalizedQuery.length >= MIN_SEARCH_LENGTH
      ? SEARCH_SUGGESTIONS.filter((item) =>
          item.toLowerCase().includes(normalizedQuery.toLowerCase()),
        ).slice(0, 5)
      : [];

  // Restore recent searches and focus the input.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);

        if (stored) {
          const parsed: unknown = JSON.parse(stored);

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
        // Ignore unavailable or invalid local storage.
      }

      inputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // Prevent background scrolling and manage keyboard navigation.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = document.getElementById("sepy-search-dialog");

      if (!dialog) return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        ["input:not([disabled])", "button:not([disabled])", "a[href]"].join(
          ",",
        ),
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
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Live product search.
  useEffect(() => {
    const searchQuery = query.trim();

    if (searchQuery.length < MIN_SEARCH_LENGTH) {
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      getProductSearchSuggestions(searchQuery, controller.signal)
        .then((data) => {
          if (controller.signal.aborted) return;

          setSearchState({
            query: searchQuery,
            status: "success",
            products: data.suggestions.slice(0, MAX_RESULTS),
          });
        })
        .catch(() => {
          if (controller.signal.aborted) return;

          setSearchState({
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

    if (normalized.length < MIN_SEARCH_LENGTH) return;

    const updated = [
      normalized,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase(),
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);

    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Search navigation should work without local storage.
    }
  };

  const navigateToSearch = (value: string) => {
    const normalized = value.trim();

    if (normalized.length < MIN_SEARCH_LENGTH) return;

    saveRecentSearch(normalized);
    onClose();

    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(query);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);

    const normalized = value.trim();

    if (normalized.length >= MIN_SEARCH_LENGTH) {
      setSearchState({
        query: normalized,
        status: "loading",
        products: [],
      });
    } else {
      setSearchState(INITIAL_SEARCH_STATE);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);

    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore storage errors.
    }
  };

  const retrySearch = () => {
    setSearchState({
      query: normalizedQuery,
      status: "loading",
      products: [],
    });

    setSearchAttempt((current) => current + 1);
  };

  const formatPrice = (price: number) => `৳${price.toLocaleString("en-BD")}`;

  const renderProduct = (product: ProductSearchSuggestion) => {
    const image = product.image;

    return (
      <Link
        key={product._id}
        href={`/products/${encodeURIComponent(product.slug)}`}
        onClick={onClose}
        className="group flex min-w-0 items-center gap-3 py-2.5 transition-opacity duration-200 hover:opacity-70 sm:gap-4"
      >
        <div className="relative size-22 shrink-0 overflow-hidden bg-[#f5f5f2] sm:size-26">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || product.name}
              fill
              sizes="(min-width: 640px) 104px, 88px"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-xs font-semibold leading-5 text-[#171717] sm:text-sm">
            {product.name}
          </h3>

          <p className="mt-0.5 text-[11px] text-[#85857e]">
            {product.category.name}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#171717]">
              {formatPrice(product.price)}
            </span>

            {typeof product.compareAtPrice === "number" &&
              product.compareAtPrice > product.price && (
                <span className="text-[11px] text-[#85857e] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
          </div>
        </div>

        <PiArrowUpRight
          size={17}
          className="mr-1 shrink-0 text-[#85857e] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
      </Link>
    );
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 py-2.5"
          aria-hidden="true"
        >
          <div className="size-22 shrink-0 animate-pulse bg-[#f1f1ee] sm:size-26" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse bg-[#f1f1ee]" />
            <div className="h-3 w-1/3 animate-pulse bg-[#f1f1ee]" />
            <div className="h-3 w-1/4 animate-pulse bg-[#f1f1ee]" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderHighlightedSuggestion = (suggestion: string) => {
    const match = normalizedQuery.toLowerCase();
    const text = suggestion.toLowerCase();
    const matchIndex = text.indexOf(match);

    if (matchIndex === -1) return suggestion;

    const before = suggestion.slice(0, matchIndex);
    const matched = suggestion.slice(matchIndex, matchIndex + match.length);
    const after = suggestion.slice(matchIndex + match.length);

    return (
      <>
        {before}
        <span className="font-bold text-[#171717]">{matched}</span>
        {after}
      </>
    );
  };

  const renderPopularSearches = () => (
    <section>
      <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#171717]">
        Popular Searches
      </h2>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        {POPULAR_SEARCHES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => navigateToSearch(item)}
            className="text-sm text-[#5f5f5a] transition-colors duration-200 hover:text-[#171717]"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );

  const renderRecentSearches = () => {
    if (recentSearches.length === 0) return null;

    return (
      <section className="mt-8 border-t border-[#e5e5e0] pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#171717]">
            Recent Searches
          </h2>

          <button
            type="button"
            onClick={clearRecentSearches}
            className="text-[11px] text-[#85857e] font-bold transition-colors hover:text-[#171717] cursor-pointer"
          >
            Clear
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {recentSearches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => navigateToSearch(item)}
              className="text-sm text-[#5f5f5a] transition-colors duration-200 hover:text-[#171717]"
            >
              {item}
            </button>
          ))}
        </div>
      </section>
    );
  };

  const renderSearchContent = () => {
    if (!isSearchActive) {
      return (
        <div className="py-7 sm:py-8">
          {renderPopularSearches()}
          {renderRecentSearches()}
        </div>
      );
    }

    return (
      <div className="py-5 sm:py-6">
        {searchSuggestions.length > 0 && (
          <section className="mb-7">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#85857e]">
              Search Suggestions
            </h2>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
              {searchSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => navigateToSearch(item)}
                  className="inline-flex items-center gap-1 text-sm text-[#5f5f5a] transition-colors duration-200 hover:text-[#171717] cursor-pointer"
                >
                  <PiMagnifyingGlass size={14} strokeWidth={1.5} />
                  {renderHighlightedSuggestion(item)}
                </button>
              ))}
            </div>
          </section>
        )}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#85857e]">
            Products
          </h2>

          {hasResults && products.length > 0 && (
            <button
              type="button"
              onClick={() => navigateToSearch(query)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#171717] transition-opacity hover:opacity-60 cursor-pointer"
            >
              View all results
              <PiArrowUpRight size={14} />
            </button>
          )}
        </div>

        {isLoading && renderSkeletons()}

        {hasError && (
          <div className="py-6" role="alert">
            <p className="text-sm text-[#5f5f5a]">
              We couldn&apos;t complete your search. Please try again.
            </p>

            <button
              type="button"
              onClick={retrySearch}
              className="mt-3 text-xs font-bold text-[#171717] underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {hasResults && products.length > 0 && (
          <div
            className="grid grid-cols-1 gap-x-10 lg:grid-cols-2"
            aria-live="polite"
          >
            {products.map(renderProduct)}
          </div>
        )}

        {hasResults && products.length === 0 && (
          <div className="py-6" role="status">
            <p className="text-sm font-semibold text-[#171717]">
              No products found for &ldquo;{normalizedQuery}&rdquo;.
            </p>

            <p className="mt-1 text-xs leading-5 text-[#85857e]">
              Check the spelling or try a more general search.
            </p>

            <Link
              href="/contact"
              onClick={onClose}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#171717] underline underline-offset-4"
            >
              Need help? Contact us
              <PiArrowUpRight size={14} />
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Search backdrop */}
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-transparent"
      />
      <div
        id="sepy-search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search SEPY"
        className="fixed inset-0 z-60 flex flex-col overflow-y-auto overscroll-contain bg-white lg:inset-x-0 lg:bottom-auto lg:top-18 lg:z-40 lg:max-h-[calc(100dvh-72px)] lg:border-b lg:border-[#e5e5e0] lg:shadow-[0_12px_24px_rgba(0,0,0,0.035)]"
      >
        <div className="mx-auto flex w-full max-w-360 flex-1 flex-col px-5 sm:px-8 lg:px-10">
          {/* Search input */}
          <div className="flex shrink-0 items-center border-b border-[#e5e5e0] py-3 sm:py-4">
            <form
              onSubmit={handleSubmit}
              role="search"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <PiMagnifyingGlass
                size={20}
                strokeWidth={1.5}
                className="shrink-0 text-[#171717]"
              />

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                maxLength={80}
                placeholder="What are you looking for?"
                aria-label="Search products"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 appearance-none border-0 bg-transparent text-sm font-semibold text-[#171717] outline-none placeholder:text-[#85857e] focus:outline-none focus:ring-0 sm:text-base [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />

              {isSearchActive && (
                <span
                  className="hidden shrink-0 text-[10px] text-[#85857e] sm:block"
                  aria-live="polite"
                >
                  {isLoading ? "Searching..." : ""}
                </span>
              )}
            </form>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="ml-3 flex size-9 shrink-0 items-center justify-center text-[#171717] transition-opacity duration-200 hover:opacity-50 cursor-pointer"
            >
              <PiX size={23} strokeWidth={1.4} />
            </button>
          </div>

          {/* Search content */}
          <div className="flex-1">{renderSearchContent()}</div>

          {/* Desktop bottom spacing */}
          <div className="hidden h-2 shrink-0 lg:block" />
        </div>
      </div>
    </>
  );
}
