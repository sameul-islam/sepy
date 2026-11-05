"use client";

import { useState } from "react";
import { MdCheck } from "react-icons/md";

type ColorFilterProps = {
  colors: string[];
  value: string;
  onChange: (value: string) => void;
};

const COLOR_SWATCHES: Record<string, string> = {
  black: "#171717",
  white: "#ffffff",
  gray: "#808080",
  grey: "#808080",
  charcoal: "#364152",
  navy: "#172554",
  "navy blue": "#172554",
  blue: "#2563eb",
  "sky blue": "#7dd3fc",
  red: "#dc2626",
  burgundy: "#722f37",
  green: "#15803d",
  olive: "#6b7130",
  sage: "#87977b",
  brown: "#795548",
  beige: "#d6c2a1",
  cream: "#f5f0dc",
  pink: "#ec4899",
  purple: "#9333ea",
  yellow: "#eab308",
  orange: "#ea580c",
};

function getSwatchColor(color: string) {
  const normalized = color.trim().toLowerCase();

  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(normalized)) {
    return normalized;
  }

  return COLOR_SWATCHES[normalized] ?? "#a3a3a3";
}

export default function ColorFilter({
  colors,
  value,
  onChange,
}: ColorFilterProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleColors = showAll
    ? colors
    : colors.slice(0, 6);

  return (
    <section
      aria-labelledby="filter-color-heading"
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3
          id="filter-color-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f5f5a]"
        >
          Color
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

      {colors.length > 0 ? (
        <>
          <div className="grid grid-cols-6 gap-x-2 gap-y-3">
            {visibleColors.map((color) => {
              const selected = value === color;
              const swatch = getSwatchColor(color);

              const isLight = [
                "white",
                "cream",
                "beige",
                "#fff",
                "#ffffff",
              ].includes(color.toLowerCase());

              return (
                <button
                  key={color}
                  type="button"
                  aria-label={`${color}${
                    selected ? ", selected" : ""
                  }`}
                  aria-pressed={selected}
                  title={color}
                  onClick={() =>
                    onChange(selected ? "" : color)
                  }
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
                      style={{
                        backgroundColor: swatch,
                      }}
                    />

                    {selected && (
                      <MdCheck
                        size={16}
                        aria-hidden="true"
                        className={`absolute ${
                          isLight
                            ? "text-[#171717]"
                            : "text-white"
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
              onClick={() =>
                setShowAll((current) => !current)
              }
              aria-expanded={showAll}
              className="text-xs font-semibold text-[#171717] underline decoration-[#b8b8b0] underline-offset-4 transition-colors hover:decoration-[#171717]"
            >
              {showAll
                ? "Show less"
                : `Show more (${colors.length - 6})`}
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