
export type Category = {
  _id: string;
  name: string;
  slug: string;
  department: "women" | "men" | "unisex";
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type ProductVariant = {
  _id: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isActive: boolean;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: Category;
  images: ProductImage[];
  status: "draft" | "active" | "archived";
  createdAt: string;
};

export type ProductDetail = Product & {
  variants: ProductVariant[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ProductListData = {
  products: Product[];
  pagination: Pagination;
};
