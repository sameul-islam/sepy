import Link from "next/link";
import { GrFavorite } from "react-icons/gr";

import { PiHandbagSimpleThin, PiUserLight } from "react-icons/pi";

export default function HeaderActions() {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href="/account"
        aria-label="Account"
        className="flex h-10 w-10 items-center justify-center transition-opacity duration-300 hover:opacity-60"
      >
        <PiUserLight
          aria-hidden="true"
          className="h-4.75 w-4.75"
          strokeWidth={1.35}
        />
      </Link>
      
      <Link
        href="/wishlist"
        aria-label="Wishlist"
        className="hidden sm:flex h-10 w-10 items-center justify-center transition-opacity duration-300 hover:opacity-60"
      >
        <GrFavorite
          aria-hidden="true"
          className="h-4 w-4 text-gray-700"
          strokeWidth={1.35}
        />
      </Link>

      <Link
        href="/cart"
        aria-label="Shopping bag"
        className="flex h-10 w-10 items-center justify-center transition-opacity duration-300 hover:opacity-60"
      >
        <PiHandbagSimpleThin
          aria-hidden="true"
          className="h-4.75 w-4.75"
          strokeWidth={1.35}
        />
      </Link>

    </div>
  );
}
