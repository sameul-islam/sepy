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
        label: "Shop All Women",
        href: "/products?department=women",
      },
      {
        label: "Tops",
        href: "/products?department=women&category=womens-tops",
      },
      {
        label: "Bottoms",
        href: "/products?department=women&category=womens-bottoms",
      },
      {
        label: "Hoodies",
        href: "/products?department=women&category=womens-hoodies",
      },
      {
        label: "Activewear",
        href: "/products?department=women&category=womens-activewear",
      },
    ],
  },
  {
    label: "Men",
    children: [
      {
        label: "Shop All Men",
        href: "/products?department=men",
      },
      {
        label: "Tops",
        href: "/products?department=men&category=mens-tops",
      },
      {
        label: "Bottoms",
        href: "/products?department=men&category=mens-bottoms",
      },
      {
        label: "Hoodies",
        href: "/products?department=men&category=mens-hoodies",
      },
      {
        label: "Activewear",
        href: "/products?department=men&category=mens-activewear",
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
    label: "Account",
    href: "/account",
  },
];

export const supportNavigation: NavigationItem[] = [
  {
    label: "Contact Us",
    href: "/contact",
  },
];