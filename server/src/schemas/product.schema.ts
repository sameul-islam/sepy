import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain lowercase letters, numbers, and single hyphens",
  );

const variantInputSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .transform((value) => value.toUpperCase()),

    size: z
      .string()
      .trim()
      .min(1)
      .max(40)
      .transform((value) => value.toUpperCase())
      .optional(),

    color: z
      .string()
      .trim()
      .min(1)
      .max(60)
      .transform((value) => value.toLowerCase())
      .optional(),

    price: z.number().finite().positive(),

    compareAtPrice: z.number().finite().positive().optional(),

    stock: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
  })
  .strict()
  .refine(
    (data) =>
      data.compareAtPrice === undefined || data.compareAtPrice > data.price,
    {
      message: "Compare-at price must be greater than the selling price",
      path: ["compareAtPrice"],
    },
  );

export const createProductSchema = z
  .object({
    body: z
      .object({
        name: z.string().trim().min(1).max(160),

        slug: slugSchema,

        description: z.string().trim().min(1).max(10000),

        category: z
          .string()
          .regex(/^[a-f\d]{24}$/i, "Category must be a valid MongoDB ObjectId"),

        audience: z.enum(["women", "men", "unisex"]),

        images: z
          .array(
            z
              .object({
                url: z.string().trim().url(),
                alt: z.string().trim().min(1).max(200),
                color: z
                  .string()
                  .trim()
                  .min(1)
                  .max(60)
                  .toLowerCase()
                  .optional(),
                publicId: z.string().trim().max(255).optional(),
                width: z
                  .number()
                  .int()
                  .min(1)
                  .max(Number.MAX_SAFE_INTEGER)
                  .optional(),
                height: z
                  .number()
                  .int()
                  .min(1)
                  .max(Number.MAX_SAFE_INTEGER)
                  .optional(),
              })
              .strict(),
          )
          .min(1)
          .max(12),

        isFeatured: z.boolean().default(false),

        featuredOrder: z
          .number()
          .int()
          .min(0)
          .max(Number.MAX_SAFE_INTEGER)
          .default(0),

        highlights: z
          .array(z.string().trim().min(1).max(180))
          .max(8)
          .default([]),

        details: z
          .object({
            material: z.string().trim().min(1).max(160).optional(),
            fit: z.string().trim().min(1).max(120).optional(),
            careInstructions: z
              .array(z.string().trim().min(1).max(240))
              .max(12)
              .default([]),
            activity: z
              .array(z.string().trim().min(1).max(50))
              .max(12)
              .default([]),
          })
          .strict()
          .optional(),

        seo: z
          .object({
            title: z.string().trim().min(1).max(70).optional(),
            description: z.string().trim().min(1).max(170).optional(),
          })
          .strict()
          .optional(),

        variants: z.array(variantInputSchema).min(1).max(100),

        status: z.enum(["draft", "active", "archived"]).default("draft"),
      })
      .strict()

      .refine(
        (data) => {
          const skus = data.variants.map((variant) => variant.sku);
          return new Set(skus).size === skus.length;
        },
        {
          message: "Variant SKUs must be unique within a product",
          path: ["variants"],
        },
      )
      .refine(
        (data) => {
          const combinations = data.variants
            .filter(
              (variant) =>
                variant.size !== undefined && variant.color !== undefined,
            )

            .map((variant) => {
              const size = variant.size?.toLowerCase();
              const color = variant.color?.toLowerCase();

              return `${size}::${color}`;
            });

          return new Set(combinations).size === combinations.length;
        },
        {
          message:
            "Variant size and color combinations must be unique within a product",
          path: ["variants"],
        },
      ),

    params: z.object({}).strict(),

    query: z.object({}).strict(),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];

const categorySlugFilterSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Category must be a valid slug");

const sizeFilterSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .transform((value) => value.toUpperCase());

const colorFilterSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .transform((value) => value.toLowerCase());

function createMultiValueQuerySchema<T extends z.ZodType<string, string>>(
  itemSchema: T,
  maxItems: number,
) {
  return z
    .string()
    .trim()
    .min(1)
    .max(1200)
    .transform((value) => value.split(",").map((item) => item.trim()))
    .pipe(z.array(itemSchema).min(1).max(maxItems))
    .transform((values) => [...new Set(values)]);
}

export const productListQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .max(Math.floor(Number.MAX_SAFE_INTEGER / 100))
      .default(1),

    limit: z.coerce.number().int().min(1).max(100).default(12),

    // Multiple category slugs: tops,hoodies
    category: createMultiValueQuerySchema(
      categorySlugFilterSchema,
      10,
    ).optional(),

    // Department intentionally remains single-select.
    department: z.enum(["women", "men"]).optional(),


    // Multiple sizes: S,M,L
    size: createMultiValueQuerySchema(sizeFilterSchema, 20).optional(),

    // Multiple colors: black,sky-blue,chocolate-brown
    color: createMultiValueQuerySchema(colorFilterSchema, 30).optional(),

    minPrice: z.coerce
      .number()
      .finite()
      .min(0)
      .max(Number.MAX_SAFE_INTEGER)
      .optional(),

    maxPrice: z.coerce
      .number()
      .finite()
      .min(0)
      .max(Number.MAX_SAFE_INTEGER)
      .optional(),

    inStock: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    sort: z.enum(["newest", "price-asc", "price-desc"]).default("newest"),
  })
  .strict()
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "Minimum price cannot be greater than maximum price",
      path: ["maxPrice"],
    },
  );

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productSlugParamsSchema = z
  .object({
    slug: slugSchema,
  })
  .strict();

export const productIdParamsSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-f\d]{24}$/i, "Product ID must be a valid MongoDB ObjectId"),
  })
  .strict();

export const updateProductSchema = z
  .object({
    body: z
      .object({
        name: z.string().trim().min(1).max(160).optional(),

        slug: slugSchema.optional(),

        description: z.string().trim().min(1).max(10000).optional(),

        category: z
          .string()
          .regex(/^[a-f\d]{24}$/i, "Category must be a valid MongoDB ObjectId")
          .optional(),

        audience: z.enum(["women", "men", "unisex"]).optional(),

        images: z
          .array(
            z
              .object({
                url: z.string().trim().url(),
                alt: z.string().trim().min(1).max(200),
                color: z
                  .string()
                  .trim()
                  .min(1)
                  .max(60)
                  .toLowerCase()
                  .optional(),
                publicId: z.string().trim().max(255).optional(),
                width: z
                  .number()
                  .int()
                  .min(1)
                  .max(Number.MAX_SAFE_INTEGER)
                  .optional(),
                height: z
                  .number()
                  .int()
                  .min(1)
                  .max(Number.MAX_SAFE_INTEGER)
                  .optional(),
              })
              .strict(),
          )
          .min(1)
          .max(12)
          .optional(),

        isFeatured: z.boolean().optional(),

        featuredOrder: z
          .number()
          .int()
          .min(0)
          .max(Number.MAX_SAFE_INTEGER)
          .optional(),

        highlights: z
          .array(z.string().trim().min(1).max(180))
          .max(8)
          .optional(),

        details: z
          .object({
            material: z.string().trim().min(1).max(160).optional(),
            fit: z.string().trim().min(1).max(120).optional(),
            careInstructions: z
              .array(z.string().trim().min(1).max(240))
              .max(12)
              .optional(),
            activity: z
              .array(z.string().trim().min(1).max(50))
              .max(12)
              .optional(),
          })
          .strict()
          .optional(),

        seo: z
          .object({
            title: z.string().trim().min(1).max(70).optional(),
            description: z.string().trim().min(1).max(170).optional(),
          })
          .strict()
          .optional(),

        status: z.enum(["draft", "active", "archived"]).optional(),
      })
      .strict()
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
      }),

    params: productIdParamsSchema,

    query: z.object({}).strict(),
  })
  .strict();

export type UpdateProductRequestInput = z.infer<
  typeof updateProductSchema
>["body"];
