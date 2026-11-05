"use client";

type PriceFilterProps = {
  minValue: string;
  maxValue: string;
  minimum: number | null;
  maximum: number | null;
  error: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
};

export default function PriceFilter({
  minValue,
  maxValue,
  minimum,
  maximum,
  error,
  onMinChange,
  onMaxChange,
}: PriceFilterProps) {
  return (
    <section
      aria-labelledby="filter-price-heading"
      className="space-y-3"
    >
      <div>
        <h3
          id="filter-price-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f5f5a]"
        >
          Price range
        </h3>

        <p className="mt-1 text-[11px] text-[#85857e]">
          Prices in BDT (৳)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="min-w-0">
          <span className="mb-1.5 block text-[11px] text-[#85857e]">
            Minimum
          </span>

          <span className="flex min-h-12 items-center border border-[#deded8] px-3 transition-colors focus-within:border-[#171717]">
            <span className="mr-2 text-sm text-[#85857e]">
              ৳
            </span>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minValue}
              onChange={(event) =>
                onMinChange(event.target.value)
              }
              placeholder={
                minimum === null ? "Any" : String(minimum)
              }
              aria-label="Minimum price in taka"
              aria-invalid={Boolean(error)}
              className="min-w-0 w-full bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#aaa9a2]"
            />
          </span>
        </label>

        <label className="min-w-0">
          <span className="mb-1.5 block text-[11px] text-[#85857e]">
            Maximum
          </span>

          <span className="flex min-h-12 items-center border border-[#deded8] px-3 transition-colors focus-within:border-[#171717]">
            <span className="mr-2 text-sm text-[#85857e]">
              ৳
            </span>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={maxValue}
              onChange={(event) =>
                onMaxChange(event.target.value)
              }
              placeholder={
                maximum === null ? "Any" : String(maximum)
              }
              aria-label="Maximum price in taka"
              aria-invalid={Boolean(error)}
              className="min-w-0 w-full bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#aaa9a2]"
            />
          </span>
        </label>
      </div>

      {error && (
        <p role="alert" className="text-xs leading-5 text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}