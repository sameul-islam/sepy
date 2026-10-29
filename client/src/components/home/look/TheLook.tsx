"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { getLookBySlug } from "@/lib/api";
import type { LookDetail } from "@/lib/api-types";

const PROGRESS_WIDTH = 20;

export default function TheLook() {
  const [progress, setProgress] = useState(0);
  const [look, setLook] = useState<LookDetail | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLook() {
      try {
        const data = await getLookBySlug("navy-blue-essentials");

        if (!cancelled) {
          setLook(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load The Look:", error);
        }
      }
    }

    void loadLook();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!look) {
    return null;
  }

  const products = look.products
    .filter((item) => item.product.images.length > 0)
    .map((item) => ({
      id: item.product._id,
      title: item.product.name,
      slug: item.product.slug,
      image: item.product.images[0].url,
    }));

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="the-look-title"
      className="overflow-hidden sm:px-5 md:px-6 xl:px-10 sm:py-10"
    >
      <div className="mx-auto grid min-h-[78svh] xl:min-h-[85svh] max-w-450 lg:grid-cols-[1.45fr_1fr] xl:grid-cols-[1fr_1.30fr]">
        {/* Model */}
        <div className="relative min-h-[72svh] overflow-hidden xl:min-h-[78svh]">
          <Image
            src={look.image.url}
            alt={look.image.alt}
            fill
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="object-cover object-center"
          />
        </div>

        {/* Products */}
        <div className="flex w-full min-w-0 flex-col justify-center px-2 py-10 md:px-0 lg:pl-10 xl:pl-14">
          <div className="mb-9">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-text-muted sm:text-xs text-center lg:text-start">
              {look.eyebrow}
            </p>

            <h2
              id="the-look-title"
              className="mt-3 max-w-xs font-display text-3xl leading-[0.98] tracking-[-0.035em] text-text-primary sm:text-4xl w-full mx-auto text-center lg:text-start lg:mx-0"
            >
              {look.title}
            </h2>
          </div>

          <TheLookProductRail
            products={products}
            onProgressChange={setProgress}
          />

          <TheLookProgress progress={progress} />

          <Link href={"/looks"} className="relative pt-5 mx-auto">
            <button className="sm:hidden font-bold text-xs py-2.5 px-4.5 bg-black  text-white">
              Explore All Looks
            </button>
            <button className="hidden sm:flex font-bold text-sm text-center group cursor-pointer gap-0">
              <span>Explore All Looks</span>
              <span className="absolute left-0 -bottom-px h-px w-full bg-[#2f3542] scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

type TheLookProduct = {
  id: string;
  title: string;
  slug: string;
  image: string;
};

type TheLookProductRailProps = {
  products: TheLookProduct[];
  onProgressChange: (progress: number) => void;
};

function TheLookProductRail({
  products,
  onProgressChange,
}: TheLookProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const dragState = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const updateProgress = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const maxScroll = rail.scrollWidth - rail.clientWidth;

    if (maxScroll <= 0) {
      onProgressChange(0);
      return;
    }

    onProgressChange(Math.min(Math.max(rail.scrollLeft / maxScroll, 0), 1));
  }, [onProgressChange]);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    updateProgress();

    rail.addEventListener("scroll", updateProgress, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updateProgress);

    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateProgress);

      resizeObserver.disconnect();
    };
  }, [updateProgress]);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const rail = railRef.current;
    if (!rail) return;

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
    if (!rail || !dragState.current.active) return;

    const distance = event.clientX - dragState.current.startX;

    if (Math.abs(distance) > 5) {
      dragState.current.moved = true;
    }

    if (dragState.current.moved) {
      rail.scrollLeft = dragState.current.startScrollLeft - distance;
    }
  };

  const endDrag = () => {
    if (!dragState.current.active) return;

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
      ref={railRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onClickCapture={handleClickCapture}
      className={`overflow-x-auto overscroll-x-contain select-none scrollbar-none [&::-webkit-scrollbar]:hidden ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div className="flex w-max gap-1 sm:gap-2">
        {products.map((product) => (
          <TheLookProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

type TheLookProductCardProps = {
  product: {
    title: string;
    slug: string;
    image: string;
  };
};

function TheLookProductCard({ product }: TheLookProductCardProps) {
  return (
    <article className="w-[calc((100vw-3rem)/2)] shrink-0 sm:w-[calc((100vw-5rem)/2)] lg:w-[calc((100%-0.75rem)/2)]">
      <Link
        href={`/products/${product.slug}`}
        draggable={false}
        className="group block cursor-pointer focus-visible:outline-none"
      >
        <div className="relative aspect-3/4 overflow-hidden bg-background">
          <Image
            src={product.image}
            alt={product.title}
            fill
            draggable={false}
            sizes="(max-width: 639px) 46vw, (max-width: 1023px) 40vw, 20vw"
            className="pointer-events-none object-cover transition-transform duration-700 ease-out motion-reduce:transition-none"
          />
        </div>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-primary sm:text-xs">
          {product.title}
        </p>
      </Link>
    </article>
  );
}

type TheLookProgressProps = {
  progress: number;
};

function TheLookProgress({ progress }: TheLookProgressProps) {
  return (
    <div className="mt-7 items-center justify-center flex">
      <div
        className="relative h-px w-40 sm:w-50  bg-border"
        role="progressbar"
        aria-label="The Look product scroll position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 bg-foreground motion-reduce:transition-none"
          style={{
            left: `${progress * (100 - PROGRESS_WIDTH)}%`,
            width: `${PROGRESS_WIDTH}%`,
          }}
        />
      </div>
    </div>
  );
}
