"use client";

import { useState } from "react";
import { MdCheck } from "react-icons/md";

import { toggleFilterValue } from "./filter-utils";

type ColorFilterProps = {
  colors: string[];
  value: string[];
  onChange: (value: string[]) => void;
};

const COLOR_SWATCHES: Record<string, string> = {
  black: "#171717",
  white: "#FFFFFF",
  gray: "#808080",
  blue: "#2563EB",
  "navy blue": "#172554",
  "dark sky": "#448EE4",
  "chocolate brown": "#4B2E24",
  "light purple": "#BAAFD9",
  red: "#DC2626",
};

export default function ColorFilter({
  colors,
  value,
  onChange,
}: ColorFilterProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleColors = showAll ? colors : colors.slice(0, 6);

  return (
    <section aria-labelledby="filter-color-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          id="filter-color-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f5f5a]"
        >
          Color
        </h3>

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] font-medium text-[#85857e] underline underline-offset-4 hover:text-[#171717]"
          >
            Clear
          </button>
        )}
      </div>

      {colors.length > 0 ? (
        <>
          <div className="grid grid-cols-6 gap-x-2 gap-y-3">
            {visibleColors.map((color) => {
              const selected = value.includes(color);
              const normalized = color.trim().toLowerCase();
              const swatch = COLOR_SWATCHES[normalized];

              const isLight = ["white", "light purple"].includes(normalized);

              return (
                <button
                  key={color}
                  type="button"
                  aria-label={`${color}${selected ? ", selected" : ""}`}
                  aria-pressed={selected}
                  title={color}
                  onClick={() => onChange(toggleFilterValue(value, color))}
                  className="group flex min-w-0 flex-col items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171717]"
                >
                  <span
                    className={`relative flex size-9 items-center justify-center rounded-full border transition-all ${
                      selected
                        ? "border-[#171717] ring-1 ring-[#171717] ring-offset-2"
                        : "border-[#deded8] group-hover:border-[#85857e]"
                    }`}
                  >
                    <span
                      className="size-7 rounded-full border border-black/10"
                      style={{ backgroundColor: swatch ?? '#cfcfc8' }}
                    />

                    {selected && (
                      <MdCheck
                        size={16}
                        aria-hidden="true"
                        className={`absolute ${
                          isLight ? "text-[#171717]" : "text-white"
                        }`}
                      />
                    )}
                  </span>

                  <span className="max-w-full truncate text-[10px] capitalize text-[#85857e]">
                    {color}
                  </span>
                </button>
              );
            })}
          </div>

          {colors.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              aria-expanded={showAll}
              className="text-xs font-semibold text-[#171717] underline decoration-[#b8b8b0] underline-offset-4 transition-colors hover:decoration-[#171717]"
            >
              {showAll ? "Show less" : `Show more (${colors.length - 6})`}
            </button>
          )}
        </>
      ) : (
        <p className="text-xs leading-5 text-[#85857e]">
          Color options will appear when available.
        </p>
      )}
    </section>
  );
}
