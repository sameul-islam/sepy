export type Product = {
  id: string;
  title: string;
  slug: string;
  gender: "women" | "men";
  image: string;
};

export const featuredProducts: Product[] = [
  // Women
  {
    id: "women-performance-top",
    title: "Performance Top",
    slug: "women-performance-top",
    gender: "women",
    image: "/images/products/women/sepy-women-performance-top-01.webp",
  },
  {
    id: "women-essential-training-top",
    title: "Essential Training Top",
    slug: "women-essential-training-top",
    gender: "women",
    image: "/images/products/women/sepy-women-performance-top-02.webp",
  },
  {
    id: "women-performance-bottom",
    title: "Performance Bottom",
    slug: "women-performance-bottom",
    gender: "women",
    image: "/images/products/women/sepy-women-performance-bottom-01.webp",
  },
  {
    id: "women-motion-bottom",
    title: "Motion Bottom",
    slug: "women-motion-bottom",
    gender: "women",
    image: "/images/products/women/sepy-women-performance-bottom-02.webp",
  },
  {
    id: "women-performance-hoodie",
    title: "Performance Hoodie",
    slug: "women-performance-hoodie",
    gender: "women",
    image: "/images/products/women/sepy-women-performance-hoodie-01.webp",
  },
  {
    id: "women-activewear-set",
    title: "Activewear Set",
    slug: "women-activewear-set",
    gender: "women",
    image: "/images/products/women/sepy-women-performance-activewear-01.webp",
  },

  // Men
  {
    id: "men-performance-top",
    title: "Performance Top",
    slug: "men-performance-top",
    gender: "men",
    image: "/images/products/men/sepy-men-performance-top-01.webp",
  },
  {
    id: "men-essential-training-top",
    title: "Essential Training Top",
    slug: "men-essential-training-top",
    gender: "men",
    image: "/images/products/men/sepy-men-performance-top-02.webp",
  },
  {
    id: "men-performance-bottom",
    title: "Performance Bottom",
    slug: "men-performance-bottom",
    gender: "men",
    image: "/images/products/men/sepy-men-performance-bottom-01.webp",
  },
  {
    id: "men-motion-bottom",
    title: "Motion Bottom",
    slug: "men-motion-bottom",
    gender: "men",
    image: "/images/products/men/sepy-men-performance-bottom-02.webp",
  },
  {
    id: "men-performance-hoodie",
    title: "Performance Hoodie",
    slug: "men-performance-hoodie",
    gender: "men",
    image: "/images/products/men/sepy-men-performance-hoodie-01.webp",
  },
  {
    id: "men-activewear",
    title: "Activewear",
    slug: "men-activewear",
    gender: "men",
    image: "/images/products/men/sepy-men-performance-activewear-01.webp",
  },
];