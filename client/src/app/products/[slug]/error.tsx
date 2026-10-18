"use client";

import { useEffect } from "react";

type ProductErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductError({
  error,
  reset,
}: ProductErrorProps) {
  useEffect(() => {
    console.error("Product page error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[50svh] w-full max-w-360 flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
      <h1 className="text-2xl font-medium text-[#171717]">
        Something went wrong
      </h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-[#5f5f5a]">
        We couldn&apos;t load this product right now. Please try again.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-6 border border-[#171717] px-6 py-3 text-sm text-[#171717] transition-colors hover:bg-[#171717] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171717]"
      >
        Try again
      </button>
    </main>
  );
}