"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import { MdClose } from "react-icons/md";

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

export default function FilterDrawer({
  isOpen,
  onClose,
  children,
  footer,
}: FilterDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement =
      document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusableElements =
        drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

      if (focusableElements.length === 0) {
        event.preventDefault();
        drawerRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousOverflow;

      previousActiveElement?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close filters"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/35 backdrop-blur-[2px] animate-[sepy-filter-fade-in_220ms_ease-out]"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-filter-title"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex h-dvh w-full max-w-110 flex-col bg-white shadow-2xl animate-[sepy-filter-slide-in_280ms_cubic-bezier(0.22,1,0.36,1)] outline-none"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-[#e8e8e3] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#85857e]">
              SEPY / Refine
            </p>

            <h2
              id="product-filter-title"
              className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#171717]"
            >
              Filters
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close filter panel"
            className="flex size-10 items-center justify-center rounded-full border border-[#e8e8e3] text-[#171717] transition-colors hover:bg-[#f7f7f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
          >
            <MdClose size={21} />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
          {children}
        </div>

        {/* Sticky Footer */}
        <footer className="shrink-0 border-t border-[#e8e8e3] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-7">
          {footer}
        </footer>
      </aside>

      <style jsx global>{`
        @keyframes sepy-filter-fade-in {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes sepy-filter-slide-in {
          from {
            transform: translateX(100%);
          }

          to {
            transform: translateX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sepy-filter-motion {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}