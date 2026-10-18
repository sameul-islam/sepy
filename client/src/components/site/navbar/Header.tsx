"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import MenuButton from "./MenuButton";
import HeaderActions from "./HeaderActions";
import NavigationDrawer from "./NavigationDrawer";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          isScrolled || isMenuOpen
            ? "bg-white"
            : "bg-transparent hover:bg-white"
        }`}
      >
        <div className="relative mx-auto flex h-12 w-full items-center px-4 sm:h-15 lg:h-18 sm:px-6 lg:px-10">
          {/* Menu */}
          <div className="relative z-10 flex flex-1 items-center">
            <MenuButton
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
            />
          </div>

          {/* Center Logo */}
          <Link
            href="/"
            aria-label="SEPY home"
            className="absolute left-1/2 z-20 -translate-x-1/2"
          >
            <Image
              src="/images/brand/sepy.png"
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
    </>
  );
}