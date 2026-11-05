"use client";

type SizeFilterProps = {
  sizes: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function SizeFilter({
  sizes,
  value,
  onChange,
}: SizeFilterProps) {
  return (
    <section
      aria-labelledby="filter-size-heading"
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3
          id="filter-size-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f5f5a]"
        >
          Size
        </h3>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] font-medium text-[#85857e] underline underline-offset-4 hover:text-[#171717]"
          >
            Clear
          </button>
        )}
      </div>

      {sizes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const selected = value === size;

            return (
              <button
                key={size}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChange(selected ? "" : size)
                }
                className={`min-w-12 border px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] ${
                  selected
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#e5e5e0] bg-white text-[#5f5f5a] hover:border-[#171717] hover:text-[#171717]"
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