
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
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
  const isClosingRef = useRef(false);

  const [isClosing, setIsClosing] = useState(false);
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);

  // Reset the closing animation whenever the drawer opens again.
  if (isOpen !== previousIsOpen) {
    setPreviousIsOpen(isOpen);

    if (isOpen) {
      isClosingRef.current = false;
      setIsClosing(false);
    }
  }

  const beginClose = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    setIsClosing(true);
  }, []);

  const handleAnimationEnd = (
    event: AnimationEvent<HTMLElement>,
  ) => {
    if (event.target !== event.currentTarget) return;

    if (
      event.animationName === "sepy-filter-slide-out" &&
      isClosingRef.current
    ) {
      onClose();
    }
  };

  // Lock page scrolling and manage keyboard focus while the drawer is open.
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
        beginClose();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusableElements =
        drawerRef.current.querySelectorAll<HTMLElement>(
          [
            "button:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "a[href]",
            '[tabindex]:not([tabindex="-1"])',
          ].join(","),
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
  }, [isOpen, beginClose]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close filters"
          tabIndex={-1}
          onClick={beginClose}
          className={`sepy-filter-motion fixed inset-0 z-100 h-dvh w-full cursor-default bg-black/40 ${
            isClosing
              ? "animate-[sepy-filter-fade-out_320ms_ease-in_forwards]"
              : "animate-[sepy-filter-fade-in_320ms_ease-out]"
          }`}
        />
      )}

      <aside
        ref={drawerRef}
        id="product-filters-panel"
        role="dialog"
        aria-label="Product filters"
        aria-modal="true"
        aria-hidden={!isOpen}
        inert={!isOpen}
        tabIndex={-1}
        onAnimationEnd={handleAnimationEnd}
        className={`sepy-filter-motion fixed inset-y-0 right-0 z-100 flex h-dvh w-full max-w-130 flex-col bg-white shadow-2xl outline-none ${
          !isOpen
            ? "invisible translate-x-full"
            : isClosing
              ? "animate-[sepy-filter-slide-out_700ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
              : "animate-[sepy-filter-slide-in_700ms_cubic-bezier(0.22,1,0.36,1)]"
        }`}
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-[#e8e8e3] px-5 py-5 sm:px-7">
          <div>
            <h2 className="mt-1 text-xl font-bold text-[#171717]">
              Filters
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={beginClose}
            aria-label="Close filter panel"
            className="flex size-10 items-center justify-center rounded-full border border-[#e8e8e3] transition-colors hover:bg-[#f7f7f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] cursor-pointer"
          >
            <MdClose size={24} aria-hidden="true" />
          </button>
        </header>

        {/* Scrollable filter content */}
        <div className="sepy-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
          {children}
        </div>

        {/* Sticky footer */}
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

        @keyframes sepy-filter-fade-out {
          from {
            opacity: 1;
          }

          to {
            opacity: 0;
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

        @keyframes sepy-filter-slide-out {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sepy-filter-motion {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </>
  );
}
