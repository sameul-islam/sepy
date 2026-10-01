"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

import {
  primaryNavigation,
  secondaryNavigation,
  supportNavigation,
  type NavigationItem,
} from "./navigation-data";
import { MdArrowForwardIos, MdOutlinePhone } from "react-icons/md";
import { BsArrowLeft } from "react-icons/bs";

type NavigationDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NavigationDrawer({
  isOpen,
  onClose,
}: NavigationDrawerProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<NavigationItem | null>(
    null,
  );

  const drawerRef = useRef<HTMLElement>(null);


  /*
   * Escape closes the drawer.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeSubmenu) {
          setActiveSubmenu(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeSubmenu, onClose]);

  /*
   * Lock page scrolling while the drawer is open.
   */
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  /*
   * Move focus into the drawer when it opens.
   */
  useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(() => {
      drawerRef.current?.focus();
    }, 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isOpen]);

  const handleClose = () => {
    setActiveSubmenu(null);
    onClose();
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children?.length) {
      setActiveSubmenu(item);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={handleClose}
        tabIndex={isOpen ? 0 : -1}
        className={`fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] transition-opacity duration-500 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        id="sepy-navigation-drawer"
        ref={drawerRef}
        tabIndex={-1}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-40 w-full overflow-hidden bg-white/85 backdrop-blur-md transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-105 md:w-115 xl:w-150 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Content begins below the fixed header */}
        <div className="relative h-full pt-18 sm:pt-20 lg:pt-24">
          <div className="relative h-full overflow-hidden">
            {/* ================================
                MAIN NAVIGATION
                ================================ */}
            <div
              className={`absolute inset-0 overflow-y-auto px-6 pb-10 pt-8 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 lg:px-10 ${
                activeSubmenu ? "-translate-x-full" : "translate-x-0"
              }`}
            >
              <nav aria-label="Primary navigation">
                <ul className="space-y-1">
                  {primaryNavigation.map((item) => (
                    <li key={item.label}>
                      {item.children?.length ? (
                        <button
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className="group flex min-h-12 w-full items-center justify-between text-left"
                        >
                          <span className="font-display text-[1.15rem] tracking-[-0.015em] text-text-primary transition-opacity duration-300 group-hover:opacity-60 sm:text-[1.25rem]">
                            {item.label}
                          </span>

                          <MdArrowForwardIos
                            aria-hidden="true"
                            className="h-4 w-4 -translate-x-1 opacity-60 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100"
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.href ?? "#"}
                          onClick={handleClose}
                          className="group flex min-h-12 items-center text-left"
                        >
                          <span className="font-display text-[1.15rem] tracking-[-0.015em] text-text-primary transition-opacity duration-300 group-hover:opacity-60 sm:text-[1.25rem]">
                            {item.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Secondary navigation */}
              <div className="mt-14 border-t border-border pt-6">
                <nav aria-label="Secondary navigation">
                  <ul className="space-y-1">
                    {secondaryNavigation.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href ?? "#"}
                          onClick={handleClose}
                          className="group flex min-h-10 items-center text-sm text-text-secondary transition-opacity duration-300 hover:opacity-60"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Contact */}
              <div className="mt-10">
                <nav aria-label="Support navigation">
                  <ul>
                    {supportNavigation.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href ?? "#"}
                          onClick={handleClose}
                          className="group flex min-h-10 items-center text-sm text-text-secondary transition-opacity duration-300 hover:opacity-60 underline gap-2"
                        >
                        <MdOutlinePhone size={20}/>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* ================================
                SUB NAVIGATION
                ================================ */}
            <div
              className={`absolute inset-0 overflow-y-auto px-6 pb-10 pt-8 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 lg:px-10 ${
                activeSubmenu ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {activeSubmenu && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveSubmenu(null)}
                    className="group mb-8 flex items-center gap-3 text-sm text-text-secondary transition-opacity duration-300 hover:opacity-60"
                  >
                    <BsArrowLeft
                      aria-hidden="true"
                      className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
                    />

                    <span className="underline">{activeSubmenu.label}</span>
                  </button>

                  <nav aria-label={`${activeSubmenu.label} navigation`}>
                    <ul className="space-y-1">
                      {activeSubmenu.children?.map((item) => (
                        <li key={item.label}>
                          {item.children?.length ? (
                            <button
                              type="button"
                              onClick={() => handleItemClick(item)}
                              className="group flex min-h-12 w-full items-center justify-between text-left"
                            >
                              <span className="font-display text-[1.15rem] tracking-[-0.015em] text-text-primary transition-opacity duration-300 group-hover:opacity-60 sm:text-[1.25rem]">
                                {item.label}
                              </span>

                              <FiArrowRight
                                aria-hidden="true"
                                className="h-4 w-4 -translate-x-1 opacity-60 transition-all duration-400 group-hover:translate-x-0 group-hover:opacity-100"
                              />
                            </button>
                          ) : (
                            <Link
                              href={item.href ?? "#"}
                              onClick={handleClose}
                              className="group flex min-h-12 items-center text-left"
                            >
                              <span className="font-display text-[1.15rem] tracking-[-0.015em] text-text-primary transition-opacity duration-300 group-hover:opacity-60 sm:text-[1.25rem]">
                                {item.label}
                              </span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}