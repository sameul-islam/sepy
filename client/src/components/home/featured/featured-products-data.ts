
export type Product = {
  id: string;
  title: string;
  slug: string;
  gender: "women" | "men";
  image: string;
  imageAlt: string;
  secondaryImage?: string;
  price: number;
  compareAtPrice?: number | null;
};
