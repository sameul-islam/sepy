"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import {
  MdCheck,
  MdExpandMore,
} from "react-icons/md";

import type { FilterSelectOption } from "./types";

type FilterSelectProps = {
  label: string;
  value: string;
  options: FilterSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  hideLabel?: boolean;
};

export default function FilterSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
  hideLabel = false,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const optionRefs = useRef<
    Array<HTMLButtonElement | null>
  >([]);

  const listboxId = useId();

  const selectedIndex = options.findIndex(
    (option) => option.value === value,
  );

  const selectedOption =
    selectedIndex >= 0 ? options[selectedIndex] : undefined;

  // Handle outside click and initial focus.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener("keydown", handleEscape);

    const focusIndex =
      selectedIndex >= 0 ? selectedIndex : 0;

    optionRefs.current[focusIndex]?.focus();

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [isOpen, selectedIndex]);

  const handleMenuKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (options.length === 0) return;

    const currentIndex = optionRefs.current.findIndex(
      (option) => option === document.activeElement,
    );

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      const direction =
        event.key === "ArrowDown" ? 1 : -1;

      const nextIndex =
        currentIndex === -1
          ? 0
          : (
              currentIndex +
              direction +
              options.length
            ) % options.length;

      optionRefs.current[nextIndex]?.focus();
    }

    if (event.key === "Home") {
      event.preventDefault();
      optionRefs.current[0]?.focus();
    }

    if (event.key === "End") {
      event.preventDefault();
      optionRefs.current[options.length - 1]?.focus();
    }
  };

  const openMenu = () => {
    setIsOpen(true);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <span
        className={
          hideLabel
            ? "sr-only"
            : "mb-2 block text-[11px] font-medium text-[#85857e]"
        }
      >
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        aria-label={hideLabel ? label : undefined}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" ||
            event.key === "Enter"
          ) {
            event.preventDefault();
            openMenu();
          }
        }}
        className="flex min-h-12 w-full items-center justify-between gap-3 border border-[#deded8] bg-white px-4 text-left text-sm text-[#171717] transition-colors hover:border-[#a5a59d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
      >
        <span
          className={
            selectedOption
              ? "font-medium"
              : "text-[#85857e]"
          }
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <MdExpandMore
          aria-hidden="true"
          size={21}
          className={`shrink-0 text-[#5f5f5a] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto border border-[#e5e5e0] bg-white py-1 shadow-xl"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <button
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                key={option.value || "all"}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex min-h-11 w-full items-center justify-between px-4 text-left text-sm transition-colors hover:bg-[#f7f7f5] focus-visible:bg-[#f7f7f5] focus-visible:outline-none ${
                  isSelected
                    ? "font-semibold text-[#171717]"
                    : "text-[#5f5f5a]"
                }`}
              >
                {option.label}

                {isSelected && (
                  <MdCheck
                    size={17}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}