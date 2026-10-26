"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getCategories } from "@/lib/api";

type GroupKey = "women" | "men";
type Direction = "forward" | "backward";

type CategoryItem = {
  title: string;
  href: string;
  image: string;
};

type CategoryGroup = {
  key: GroupKey;
  label: string;
  items: CategoryItem[];
};

const GROUPS: { key: GroupKey; label: string }[] = [
  { key: "women", label: "Women" },
  { key: "men", label: "Men" },
];

export default function CategoryDiscovery() {
  const [activeGroup, setActiveGroup] = useState<GroupKey>("women");
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [previousGroup, setPreviousGroup] = useState<CategoryGroup | null>(
    null,
  );
  const [direction, setDirection] = useState<Direction>("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const categories = await getCategories();

        if (cancelled) return;

        const groups: CategoryGroup[] = GROUPS.map((group) => ({
          ...group,
          items: categories
            .filter(
              (category) =>
                category.department === group.key &&
                typeof category.image === "string" &&
                category.image.trim().length > 0,
            )
            .slice(0, 4)
            .map((category) => ({
              title: category.name,
              image: category.image!,
              href: `/products?${new URLSearchParams({
                category: category.slug,
                department: group.key,
              }).toString()}`,
            })),
        }));

        setCategoryGroups(groups);
      } catch {
        if (!cancelled) setHasError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadCategories();

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
        setPreviousGroup(null);
        setIsTransitioning(false);
      },
      prefersReducedMotion ? 0 : 560,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isTransitioning]);

  const currentGroup =
    categoryGroups.find((group) => group.key === activeGroup) ?? null;

  const handleGroupChange = (nextGroup: GroupKey) => {
    if (nextGroup === activeGroup || isTransitioning) {
      return;
    }

    const current = categoryGroups.find((group) => group.key === activeGroup);

    if (!current) {
      return;
    }

    const nextDirection: Direction =
      activeGroup === "women" && nextGroup === "men" ? "forward" : "backward";

    setPreviousGroup(current);
    setDirection(nextDirection);
    setActiveGroup(nextGroup);
    setIsTransitioning(true);
  };

  return (
    <section
      aria-labelledby="category-discovery-title"
      className="bg-background px-3 py-15 sm:px-5 md:py-17 lg:px-6 xl:px-10"
    >
      <div className="mx-auto max-w-full">
        {/* Intro */}
        <div className="mx-auto max-w-xl text-center">
          <h2
            id="category-discovery-title"
            className="text-lg sm:text-2xl text-black font-bold py-2"
          >
            Our Categories
          </h2>
          <p
            id="category-discovery-subtitle"
            className="text-sm text-gray-800 leading-6 font-semibold  sm:text-base"
          >
            Designed around movement. Refined for everyday life.
          </p>

          <div
            className="mt-7 flex items-center justify-center gap-6"
            aria-label="Shop categories by gender"
          >
            {GROUPS.map((group) => {
              const isActive = group.key === activeGroup;

              return (
                <button
                  key={group.key}
                  type="button"
                  aria-pressed={isActive}
                  disabled={isTransitioning}
                  onClick={() => handleGroupChange(group.key)}
                  className={`relative cursor-pointer pb-1 text-xs font-extrabold uppercase tracking-[0.18em] transition-opacity duration-300 disabled:cursor-default ${
                    isActive
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {group.label}

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

        {/* Category grid */}
        <div className="mt-12 lg:mt-16">
          {isLoading ? (
            <div
              className="grid grid-cols-2 gap-x-1.5 gap-y-10 sm:gap-x-2 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-2.5"
              role="status"
              aria-label="Loading categories"
              aria-busy="true"
            >
              <span className="sr-only">Loading categories...</span>

              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} aria-hidden="true">
                  <div className="relative aspect-3/4 overflow-hidden bg-surface">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src="/images/brand/sepy-logo.svg"
                        alt=""
                        width={85}
                        height={85}
                        aria-hidden="true"
                        className="h-auto w-85 max-w-[85%] object-contain opacity-25"
                      />
                    </div>
                  </div>

                  <div className="mx-auto mt-4 h-3 w-3/5 bg-surface-muted" />
                </div>
              ))}
            </div>
          ) : hasError ? (
            <p
              role="alert"
              className="py-12 text-center text-sm text-text-muted"
            >
              Categories could not be loaded. Please try again later.
            </p>
          ) : currentGroup && currentGroup.items.length > 0 ? (
            <CategoryGrid
              currentGroup={currentGroup}
              previousGroup={previousGroup}
              direction={direction}
              isTransitioning={isTransitioning}
            />
          ) : (
            <p className="py-12 text-center text-sm text-text-muted">
              No categories available.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

type CategoryGridProps = {
  currentGroup: CategoryGroup;
  previousGroup: CategoryGroup | null;
  direction: Direction;
  isTransitioning: boolean;
};

function CategoryGrid({
  currentGroup,
  previousGroup,
  direction,
  isTransitioning,
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-1.5 gap-y-10 sm:gap-x-2 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-2.5">
      {currentGroup.items.map((item, index) => {
        const previousItem = previousGroup?.items[index] ?? null;

        return (
          <CategoryCardViewport
            key={`${currentGroup.key}-${item.title}`}
            currentItem={item}
            previousItem={previousItem}
            direction={direction}
            isTransitioning={isTransitioning}
          />
        );
      })}
    </div>
  );
}

type CategoryCardViewportProps = {
  currentItem: CategoryGroup["items"][number];
  previousItem: CategoryGroup["items"][number] | null;
  direction: Direction;
  isTransitioning: boolean;
};

function CategoryCardViewport({
  currentItem,
  previousItem,
  direction,
  isTransitioning,
}: CategoryCardViewportProps) {
  return (
    <div className="grid overflow-hidden">
      {previousItem && isTransitioning && (
        <CategoryCard
          key={`previous-${previousItem.title}`}
          item={previousItem}
          ariaHidden
          className={
            direction === "forward"
              ? "sepy-card-exit-left"
              : "sepy-card-exit-right"
          }
        />
      )}

      <CategoryCard
        key={`current-${currentItem.title}`}
        item={currentItem}
        className={
          isTransitioning
            ? direction === "forward"
              ? "sepy-card-enter-right"
              : "sepy-card-enter-left"
            : ""
        }
      />
    </div>
  );
}

type CategoryCardProps = {
  item: {
    title: string;
    href: string;
    image: string;
  };
  className?: string;
  ariaHidden?: boolean;
};

function CategoryCard({
  item,
  className = "",
  ariaHidden = false,
}: CategoryCardProps) {
  return (
    <Link
      href={item.href}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : undefined}
      className={`col-start-1 row-start-1 block min-w-0 ${className}`}
    >
      <div className="relative aspect-3/4 overflow-hidden bg-surface">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
          className="object-cover"
        />
      </div>

      <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.14em] text-text-primary sm:text-sm">
        {item.title}
      </p>
    </Link>
  );
}
