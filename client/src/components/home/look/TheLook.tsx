"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getLookBySlug } from "@/lib/api";
import type { LookDetail } from "@/lib/api-types";

import TheLookProductRail from "./TheLookProductRail";
import TheLookProgress from "./TheLookProgress";
import TheLookSkeleton from "./TheLookSkeleton";

export default function TheLook() {
  const [progress, setProgress] = useState(0);
  const [look, setLook] = useState<LookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLook() {
      setIsLoading(true);
      setLoadError(false);

      try {
        const data = await getLookBySlug("navy-blue-essentials");

        if (!cancelled) {
          setLook(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load The Look:", error);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadLook();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <TheLookSkeleton />;
  }

  if (loadError) {
    return (
      <section
        aria-label="The Look"
        className="overflow-hidden sm:px-5 md:px-6 xl:px-10 sm:py-10"
      >
        <p className="py-12 text-center text-xs text-text-muted" role="alert">
          The Look could not be loaded. Please try again later.
        </p>
      </section>
    );
  }

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

          <Link href="/looks" className="relative mx-auto pt-5">
            <span className="bg-black px-4.5 py-2.5 text-xs font-bold text-white sm:hidden">
              Explore All Looks
            </span>

            <span className="group relative hidden cursor-pointer gap-0 text-center text-sm font-bold sm:flex">
              <span>Explore All Looks</span>
              <span className="absolute left-0 -bottom-px h-px w-full origin-right scale-x-0 bg-[#2f3542] transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
