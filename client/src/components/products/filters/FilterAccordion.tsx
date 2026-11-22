
"use client";

import { MdAdd, MdRemove } from "react-icons/md";
import type { ReactNode } from "react";

type FilterAccordionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  selectedCount?: number;
  onClear?: () => void;
};

export default function FilterAccordion({
  title,
  isOpen,
  onToggle,
  children,
  selectedCount = 0,
  onClear,
}: FilterAccordionProps) {
  const contentId = `filter-${title.toLowerCase().replace(/\s+/g, "-")}-content`;

  return (
    <section className="border-b border-[#eeeeea] pb-5">
      <div className="flex min-h-9 items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="flex min-h-9 flex-1 items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
        >
          <span className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f5f5a]">
              {title}
            </span>

            {selectedCount > 0 && (
              <span className="text-[11px] font-medium tabular-nums text-[#85857e]">
                ({selectedCount})
              </span>
            )}
          </span>

          {isOpen ? (
            <MdRemove
              size={19}
              aria-hidden="true"
              className="shrink-0 text-[#5f5f5a]"
            />
          ) : (
            <MdAdd
              size={19}
              aria-hidden="true"
              className="shrink-0 text-[#5f5f5a]"
            />
          )}
        </button>

        {selectedCount > 0 && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[11px] font-medium text-[#85857e] underline underline-offset-4 transition-colors hover:text-[#171717] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
          >
            Clear
          </button>
        )}
      </div>

      <div
        id={contentId}
        aria-hidden={!isOpen}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className="space-y-3 pt-4"
            inert={!isOpen}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
