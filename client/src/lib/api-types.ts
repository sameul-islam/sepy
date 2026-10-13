export type Category = {
  _id: string;
  name: string;
  slug: string;
  department: "women" | "men";
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  category: Category;
  images: ProductImage[];
  status: "draft" | "active" | "archived";
  createdAt: string;
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