import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi";

import { PiBookmarkSimpleLight, PiUserLight } from "react-icons/pi";


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
        href="/cart"
        aria-label="Shopping bag"
        className="flex h-10 w-10 items-center justify-center transition-opacity duration-300 hover:opacity-60"
      >
        <HiOutlineShoppingBag
          aria-hidden="true"
          className="h-4.75 w-4.75"
          strokeWidth={1.35}
        />
      </Link>

    </div>
  );
}