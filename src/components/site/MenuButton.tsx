"use client";

import Link from "next/link";
import { FiSearch } from "react-icons/fi";

type MenuButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export default function MenuButton({
  isOpen,
  onClick,
}: MenuButtonProps) {
  return (
    <div className="flex gap-x-3 sm:gap-x-5 md:gap-x-16 lg:gap-x-20">
      <div className="flex items-center gap-x-5">
        <button
          type="button"
          onClick={onClick}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="sepy-navigation-drawer"
          className="group relative flex h-10 w-10 cursor-pointer items-center justify-center"
        >
          <span className="sr-only">
            {isOpen ? "Close menu" : "Open menu"}
          </span>

          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 block h-px w-8 origin-center bg-current transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] md:w-9 ${
                isOpen ? "translate-y-1.75 rotate-45" : ""
              }`}
            />

            <span
              className={`absolute left-0 top-1.75 block h-px w-7 bg-current transition-opacity duration-500 md:w-8 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />

            <span
              className={`absolute left-0 top-3.5 block h-px w-8 origin-center bg-current transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] md:w-9 ${
                isOpen ? "-translate-y-1.75 -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        <button
          type="button"
          onClick={onClick}
          aria-hidden="true"
          tabIndex={-1}
          className="hidden cursor-pointer md:flex"
        >
          <span className="">Menu</span>
        </button>
      </div>

      <Link
        href="/search"
        aria-label="Search"
        className="flex h-10 w-10 items-center justify-center transition-opacity duration-300 hover:opacity-60"
      >
        <div className="flex gap-x-3">
          <FiSearch
            aria-hidden="true"
            className="h-4.75 w-4.75"
            strokeWidth={1.35}
          />

          <span className="hidden text-xs font-semibold md:flex">
            Search
          </span>
        </div>
      </Link>
    </div>
  );
}