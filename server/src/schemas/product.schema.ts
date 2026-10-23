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

        images: z
          .array(
            z
              .object({
                url: z.string().trim().url(),
                alt: z.string().trim().min(1).max(200),
              })
              .strict(),
          )
          .min(1)
          .max(12),

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

export const productListQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .max(Math.floor(Number.MAX_SAFE_INTEGER / 100))
      .default(1),

    limit: z.coerce.number().int().min(1).max(100).default(12),

    category: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Category must be a valid slug")
      .optional(),

    department: z.enum(["women", "men", "unisex"]).optional(),
  })
  .strict();

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productSlugParamsSchema = z
  .object({
    slug: slugSchema,
  })
  .strict();
