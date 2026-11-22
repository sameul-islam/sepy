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
  isSidebarVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

export default function FilterDrawer({
  isOpen,
  isSidebarVisible,
  onClose,
  children,
  footer,
}: FilterDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [isClosing, setIsClosing] = useState(false);
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);

  if (isOpen !== previousIsOpen) {
    setPreviousIsOpen(isOpen);

    if (isOpen) {
      setIsClosing(false);
    }
  }

  const beginClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  const handleDrawerAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.animationName === "sepy-filter-slide-out" && isClosing) {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Desktop sidebar does not behave like a modal.
    if (window.matchMedia("(min-width: 1024px)").matches) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;

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

      const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
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

      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
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

  const isPanelHidden = !isSidebarVisible && !isOpen;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close filters"
          tabIndex={-1}
          onClick={beginClose}
          className={`sepy-filter-motion fixed inset-0 z-100 h-full w-full cursor-default bg-black/35 lg:hidden ${
            isClosing
              ? "animate-[sepy-filter-fade-out_320ms_ease-in_forwards]"
              : "animate-[sepy-filter-fade-in_320ms_ease-out]"
          }`}
        />
      )}

      {/* One shared filter panel for both responsive layouts */}
      <div
        id="product-filters-panel"
        className="min-w-0 lg:overflow-clip"
        aria-hidden={isPanelHidden}
        inert={isPanelHidden}
      >
        <aside
          ref={drawerRef}
          role={isOpen ? "dialog" : "region"}
          aria-label="Product filters"
          aria-modal={isOpen || undefined}
          tabIndex={-1}
          onAnimationEnd={handleDrawerAnimationEnd}
          className={`sepy-filter-motion ${
            isOpen
              ? "fixed inset-y-0 right-0 z-100 flex h-dvh w-full max-w-120 flex-col animate-[sepy-filter-slide-in_320ms_cubic-bezier(0.22,1,0.36,1)]"
              : "hidden"
          } bg-white outline-none lg:sticky lg:top-24 lg:z-auto lg:flex lg:h-[calc(100dvh-6rem)] lg:w-64 lg:max-w-none lg:flex-col lg:shadow-none lg:transition-[opacity,translate] lg:duration-300 lg:ease-in-out ${
            isSidebarVisible
              ? "lg:translate-x-0 lg:opacity-100 lg:delay-300"
              : "lg:-translate-x-full lg:opacity-0 lg:pointer-events-none"
          } ${
            isClosing
              ? "animate-[sepy-filter-slide-out_320ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
              : ""
          }`}
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-[#e8e8e3] px-5 py-5 sm:px-7 lg:px-4">
            <div>
              <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#171717]">
                Filters
              </h2>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={beginClose}
              aria-label="Close filter panel"
              className="flex size-10 items-center justify-center rounded-full border border-[#e8e8e3] text-[#171717] transition-colors hover:bg-[#f7f7f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] lg:hidden"
            >
              <MdClose size={21} aria-hidden="true" />
            </button>
          </header>

          {/* Filter content */}
          <div className="sepy-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 lg:px-4">
            {children}
          </div>

          {/* Footer */}
          <footer className="shrink-0 border-t border-[#e8e8e3] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-7 lg:px-4">
            {footer}
          </footer>
        </aside>
      </div>

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
