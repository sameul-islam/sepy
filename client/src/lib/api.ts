import type {
  ApiResponse,
  Category,
  FeaturedProductsData,
  ProductDetail,
  ProductListData,
  LookDetail,
} from "./api-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : `API request failed (${response.status})`;

    throw new ApiError(message, response.status);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body)
  ) {
    throw new Error("Invalid API response");
  }

  return (body as ApiResponse<T>).data;
}

export async function getCategories(): Promise<Category[]> {
  return fetchApi<Category[]>("/categories");
}

export async function getProducts(params: {
  page: number;
  limit?: number;
  category?: string[];
  department?: "women" | "men" | "unisex";
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "price-asc" | "price-desc";
  signal?: AbortSignal;
}): Promise<ProductListData> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit ?? 12),
  });

  if (params.category?.length) {
    searchParams.set("category", params.category.join(","));
  }

  if (params.department) {
    searchParams.set("department", params.department);
  }

  if (params.size?.length) {
    searchParams.set("size", params.size.join(","));
  }

  if (params.color?.length) {
    searchParams.set("color", params.color.join(","));
  }

  if (params.minPrice !== undefined) {
    searchParams.set("minPrice", String(params.minPrice));
  }

  if (params.maxPrice !== undefined) {
    searchParams.set("maxPrice", String(params.maxPrice));
  }

  if (params.inStock !== undefined) {
    searchParams.set("inStock", String(params.inStock));
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  return fetchApi<ProductListData>(
    `/products?${searchParams.toString()}`,
    params.signal,
  );
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  return fetchApi<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
}

export async function getFeaturedProducts(): Promise<FeaturedProductsData> {
  return fetchApi<FeaturedProductsData>("/products/featured");
}

export async function getLooks(): Promise<LookDetail[]> {
  return fetchApi<LookDetail[]>("/looks");
}

export async function getLookBySlug(slug: string): Promise<LookDetail> {
  return fetchApi<LookDetail>(`/looks/${encodeURIComponent(slug)}`);
}
