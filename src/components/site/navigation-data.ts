export type NavigationItem = {
  label: string;
  href?: string;
  children?: NavigationItem[];
};

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Women",
    children: [
      {
        label: "Clothing",
        href: "/shop/women/clothing",
      },
      {
        label: "Shoes",
        href: "/shop/women/shoes",
      },
      {
        label: "Accessories",
        href: "/shop/women/accessories",
      },
    ],
  },
  {
    label: "Men",
    children: [
      {
        label: "Clothing",
        href: "/shop/men/clothing",
      },
      {
        label: "Shoes",
        href: "/shop/men/shoes",
      },
      {
        label: "Accessories",
        href: "/shop/men/accessories",
      },
    ],
  },
  {
    label: "New Arrivals",
    href: "/new-arrivals",
  },
  {
    label: "Collections",
    children: [
      {
        label: "Essentials",
        href: "/collections/essentials",
      },
      {
        label: "Featured",
        href: "/collections/featured",
      },
    ],
  },
  {
    label: "Sale",
    href: "/sale",
  },
];

export const secondaryNavigation: NavigationItem[] = [
  {
    label: "Wishlist",
    href: "/wishlist",
  },
  {
    label: "Account",
    href: "/account",
  },
];

export const supportNavigation: NavigationItem[] = [
  {
    label: "Contact",
    href: "/contact",
  },
];