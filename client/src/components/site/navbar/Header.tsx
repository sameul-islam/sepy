"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import MenuButton from "./MenuButton";
import HeaderActions from "./HeaderActions";
import NavigationDrawer from "./NavigationDrawer";
import SearchOverlay from "./SearchOverlay";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const openSearch = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(true);
  };

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);

    requestAnimationFrame(() => {
      searchButtonRef.current?.focus();
    });
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-white transition-colors duration-500">
        <div className="relative mx-auto flex h-12 w-full items-center px-4 sm:h-15 lg:h-18 sm:px-6 lg:px-10 border-b border-[#deded8]">
          {/* Menu and Search */}
          <div className="relative z-10 flex flex-1 items-center">
            <MenuButton
              isOpen={isMenuOpen}
              onClick={() => {
                setIsSearchOpen(false);
                setIsMenuOpen((current) => !current);
              }}
              onSearchClick={openSearch}
              searchButtonRef={searchButtonRef}
            />
          </div>

          {/* Center Logo */}
          <Link
            href="/"
            aria-label="SEPY home"
            className="absolute left-1/2 z-20 -translate-x-1/2"
          >
            <Image
              src="/images/brand/sepy-symbol.png"
              alt="SEPY"
              width={240}
              height={60}
              priority
              className="h-auto w-22 sm:w-26 lg:w-28"
            />
          </Link>

          {/* Header Actions */}
          <div className="relative z-10 flex flex-1 items-center justify-end">
            <HeaderActions />
          </div>
        </div>
      </header>

      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {isSearchOpen && <SearchOverlay onClose={closeSearch} />}
    </>
  );
}
