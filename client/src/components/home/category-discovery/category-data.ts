export type CategoryItem = {
  title: string;
  href: string;
  image: string;
};

export type CategoryGroup = {
  key: "women" | "men";
  label: string;
  items: CategoryItem[];
};

export const categoryGroups: CategoryGroup[] = [
  {
    key: "women",
    label: "Women",
    items: [
      {
        title: "Women's Tops",
        href: "/",
        image: "/images/categories/women-tops.webp",
      },
      {
        title: "Women's Bottoms",
        href: "/",
        image: "/images/categories/women-bottoms.webp",
      },
      {
        title: "Women's Hoodie",
        href: "/",
        image: "/images/categories/women-hoodies.webp",
      },
      {
        title: "Women's Activewear",
        href: "/",
        image: "/images/categories/women-activewear.webp",
      },
    ],
  },
  {
    key: "men",
    label: "Men",
    items: [
      {
        title: "Men's Tops",
        href: "/",
        image: "/images/categories/men-tops.webp",
      },
      {
        title: "Men's Bottoms",
        href: "/",
        image: "/images/categories/men-bottoms.webp",
      },
      {
        title: "Men's Hoodies",
        href: "/",
        image: "/images/categories/men-hoodies.webp",
      },
      {
        title: "Men's Activewear",
        href: "/",
        image: "/images/categories/men-activewear.webp",
      },
    ],
  },
];