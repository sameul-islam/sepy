import type {
  ApiResponse,
  Category,
  FeaturedProductsData,
  ProductDetail,
  ProductListData,
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

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
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
  category?: string;
  department?: "women" | "men" | "unisex";
}): Promise<ProductListData> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit ?? 12),
  });

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.department) {
    searchParams.set("department", params.department);
  }

  return fetchApi<ProductListData>(`/products?${searchParams.toString()}`);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  return fetchApi<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
}


export async function getFeaturedProducts(): Promise<FeaturedProductsData> {
  return fetchApi<FeaturedProductsData>("/products/featured");
}
