"use client";

import { toggleFilterValue } from "./filter-utils";

type SizeFilterProps = {
  sizes: string[];
  value: string[];
  onChange: (value: string[]) => void;
};

export default function SizeFilter({
  sizes,
  value,
  onChange,
}: SizeFilterProps) {
  return (
    <section className="space-y-3">
      {sizes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const selected = value.includes(size);

            return (
              <button
                key={size}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(toggleFilterValue(value, size))}
                className={`min-w-12 border px-3.5 py-2.5 text-xs font-bold tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] cursor-pointer ${
                  selected
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-gray-400 bg-white hover:border-black hover:text-[#171717]"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs leading-5 text-[#85857e]">
          Size options will appear when available.
        </p>
      )}
    </section>
  );
}
